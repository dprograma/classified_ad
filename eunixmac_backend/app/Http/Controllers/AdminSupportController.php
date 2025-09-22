<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SupportTicket;
use App\Models\SupportTicketResponse;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\SupportTicketNotification;

class AdminSupportController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:admin');
    }

    /**
     * Get all support tickets with filtering and pagination
     */
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user:id,name,email', 'assignedTo:id,name'])
            ->withCount('responses');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('ticket_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $tickets = $query->paginate($request->get('per_page', 15));

        return response()->json($tickets);
    }

    /**
     * Get support ticket statistics
     */
    public function statistics()
    {
        $stats = [
            'total_tickets' => SupportTicket::count(),
            'open_tickets' => SupportTicket::where('status', 'open')->count(),
            'in_progress_tickets' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved_tickets' => SupportTicket::where('status', 'resolved')->count(),
            'closed_tickets' => SupportTicket::where('status', 'closed')->count(),
            'high_priority_tickets' => SupportTicket::where('priority', 'high')->whereIn('status', ['open', 'in_progress'])->count(),
            'urgent_tickets' => SupportTicket::where('priority', 'urgent')->whereIn('status', ['open', 'in_progress'])->count(),
            'overdue_tickets' => SupportTicket::whereIn('status', ['open', 'in_progress'])
                ->get()
                ->filter(function ($ticket) {
                    return $ticket->isOverdue();
                })
                ->count(),
            'average_resolution_time' => $this->getAverageResolutionTime(),
            'tickets_by_category' => SupportTicket::selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category'),
        ];

        return response()->json($stats);
    }

    /**
     * Get a specific support ticket with responses
     */
    public function show(SupportTicket $ticket)
    {
        $ticket->load([
            'user:id,name,email,phone_number',
            'assignedTo:id,name,email',
            'responses.user:id,name,email'
        ]);

        return response()->json($ticket);
    }

    /**
     * Update ticket status, priority, or assignment
     */
    public function update(Request $request, SupportTicket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $ticket->status;
        $oldAssignedTo = $ticket->assigned_to;

        $ticket->update($request->only(['status', 'priority', 'assigned_to']));

        // Log the changes
        $changes = [];
        if ($request->filled('status') && $oldStatus !== $request->status) {
            $changes[] = "Status changed from {$oldStatus} to {$request->status}";
        }
        if ($request->filled('assigned_to') && $oldAssignedTo !== $request->assigned_to) {
            $assignedUser = $request->assigned_to ? User::find($request->assigned_to)->name : 'Unassigned';
            $oldAssignedUser = $oldAssignedTo ? User::find($oldAssignedTo)->name : 'Unassigned';
            $changes[] = "Assignment changed from {$oldAssignedUser} to {$assignedUser}";
        }

        if (!empty($changes)) {
            SupportTicketResponse::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
                'message' => 'System Update: ' . implode('. ', $changes),
                'is_internal' => true,
            ]);

            Log::info('Support ticket updated', [
                'ticket_id' => $ticket->id,
                'changes' => $changes,
                'updated_by' => auth()->user()->name,
            ]);

            // Send email notification for significant updates
            try {
                if ($request->filled('status') || $request->filled('assigned_to')) {
                    Mail::to($ticket->user->email)
                        ->send(new SupportTicketNotification($ticket->fresh(), 'updated'));
                }
            } catch (\Exception $e) {
                Log::warning('Failed to send ticket update notification', [
                    'ticket_id' => $ticket->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully',
            'ticket' => $ticket->fresh(['user', 'assignedTo'])
        ]);
    }

    /**
     * Add a response to a support ticket
     */
    public function addResponse(Request $request, SupportTicket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:5000',
            'is_internal' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $response = SupportTicketResponse::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
            'is_internal' => $request->boolean('is_internal', false),
        ]);

        // If it's a public response and ticket is open, move to in_progress
        if (!$response->is_internal && $ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        $response->load('user:id,name,email');

        Log::info('Support ticket response added', [
            'ticket_id' => $ticket->id,
            'response_id' => $response->id,
            'is_internal' => $response->is_internal,
            'user_id' => auth()->id(),
        ]);

        // Send email notification for public responses
        if (!$response->is_internal) {
            try {
                Mail::to($ticket->user->email)
                    ->send(new SupportTicketNotification($ticket->fresh(), 'response'));
            } catch (\Exception $e) {
                Log::warning('Failed to send response notification', [
                    'ticket_id' => $ticket->id,
                    'response_id' => $response->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Response added successfully',
            'response' => $response
        ]);
    }

    /**
     * Assign multiple tickets to an admin user
     */
    public function bulkAssign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ticket_ids' => 'required|array',
            'ticket_ids.*' => 'exists:support_tickets,id',
            'assigned_to' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $assignedUser = User::find($request->assigned_to);

        SupportTicket::whereIn('id', $request->ticket_ids)
            ->update(['assigned_to' => $request->assigned_to]);

        Log::info('Bulk ticket assignment', [
            'ticket_ids' => $request->ticket_ids,
            'assigned_to' => $assignedUser->name,
            'assigned_by' => auth()->user()->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => count($request->ticket_ids) . " tickets assigned to {$assignedUser->name}",
        ]);
    }

    /**
     * Update multiple ticket statuses
     */
    public function bulkStatusUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ticket_ids' => 'required|array',
            'ticket_ids.*' => 'exists:support_tickets,id',
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        SupportTicket::whereIn('id', $request->ticket_ids)
            ->update(['status' => $request->status]);

        Log::info('Bulk ticket status update', [
            'ticket_ids' => $request->ticket_ids,
            'status' => $request->status,
            'updated_by' => auth()->user()->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => count($request->ticket_ids) . " tickets updated to {$request->status}",
        ]);
    }

    /**
     * Get list of admin users for assignment
     */
    public function getAdminUsers()
    {
        $adminUsers = User::where('is_admin', true)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json($adminUsers);
    }

    /**
     * Calculate average resolution time in hours
     */
    private function getAverageResolutionTime()
    {
        $resolvedTickets = SupportTicket::whereNotNull('resolved_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours')
            ->value('avg_hours');

        return round($resolvedTickets ?: 0, 2);
    }
}