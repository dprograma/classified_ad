<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

use App\Models\User;
use App\Models\Ad;
use App\Models\Payment;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:admin');
    }

    public function getUsers(Request $request)
    {
        $query = User::query();

        // Apply filters
        if ($request->filled('role')) {
            switch ($request->role) {
                case 'admin':
                    $query->where('is_admin', true);
                    break;
                case 'agent':
                    $query->where('is_agent', true);
                    break;
                case 'affiliate':
                    $query->where('is_affiliate', true);
                    break;
                case 'regular':
                    $query->where('is_admin', false)
                          ->where('is_agent', false)
                          ->where('is_affiliate', false);
                    break;
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('email_verified')) {
            $query->whereNotNull('email_verified_at');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->withCount('ads')->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

    public function verifyUser(Request $request, User $user)
    {
        $user->is_verified = true;
        $user->save();
        return response()->json($user);
    }

    public function getAds(Request $request)
    {
        $query = Ad::with(['user', 'category', 'images', 'customFields']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $ads = $query->paginate($request->get('per_page', 15));

        return response()->json($ads);
    }

    public function approveAd(Request $request, Ad $ad)
    {
        $ad->status = 'active';
        $ad->save();
        return response()->json($ad);
    }

    public function rejectAd(Request $request, Ad $ad)
    {
        $ad->status = 'rejected';
        $ad->save();
        return response()->json($ad);
    }

    public function getDashboardStats()
    {
        $totalUsers = User::count();
        $totalAds = Ad::count();
        $pendingAds = Ad::where('status', 'pending_approval')->count();
        $totalAgents = User::where('is_agent', true)->count();
        $totalAffiliates = User::where('is_affiliate', true)->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalAds' => $totalAds,
            'pendingAds' => $pendingAds,
            'totalAgents' => $totalAgents,
            'totalAffiliates' => $totalAffiliates,
        ]);
    }

    /**
     * Get all educational materials with filtering and pagination
     */
    public function getMaterials(Request $request)
    {
        $query = Ad::whereIn('category_id', [83, 84, 85, 86]) // Educational materials categories
            ->whereNotNull('file_path')
            ->with(['user:id,name,email', 'category:id,name']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
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

        $materials = $query->paginate($request->get('per_page', 15));

        // Add additional data to each material
        $materials->getCollection()->transform(function ($material) {
            $material->file_size = $this->getFileSize($material->file_path);
            $material->file_type = strtoupper(pathinfo($material->file_path, PATHINFO_EXTENSION));
            $material->sales_count = Payment::where('payable_id', $material->id)
                ->where('payable_type', 'educational_material')
                ->where('status', 'success')
                ->count();
            $material->total_earnings = Payment::where('payable_id', $material->id)
                ->where('payable_type', 'educational_material')
                ->where('status', 'success')
                ->sum('amount');
            return $material;
        });

        return response()->json($materials);
    }

    /**
     * Get detailed view of a specific educational material
     */
    public function showMaterial(Ad $ad)
    {
        // Verify this is an educational material
        if (!in_array($ad->category_id, [83, 84, 85, 86]) || !$ad->file_path) {
            return response()->json(['message' => 'Not an educational material'], 404);
        }

        $ad->load(['user:id,name,email,phone_number', 'category:id,name']);

        // Add additional data
        $ad->file_size = $this->getFileSize($ad->file_path);
        $ad->file_type = strtoupper(pathinfo($ad->file_path, PATHINFO_EXTENSION));
        $ad->sales_count = Payment::where('payable_id', $ad->id)
            ->where('payable_type', 'educational_material')
            ->where('status', 'success')
            ->count();
        $ad->total_earnings = Payment::where('payable_id', $ad->id)
            ->where('payable_type', 'educational_material')
            ->where('status', 'success')
            ->sum('amount');

        // Get recent purchases
        $ad->recent_purchases = Payment::where('payable_id', $ad->id)
            ->where('payable_type', 'educational_material')
            ->where('status', 'success')
            ->with('user:id,name,email')
            ->latest()
            ->take(5)
            ->get();

        return response()->json($ad);
    }

    /**
     * Approve an educational material
     */
    public function approveMaterial(Request $request, Ad $ad)
    {
        // Verify this is an educational material
        if (!in_array($ad->category_id, [83, 84, 85, 86]) || !$ad->file_path) {
            return response()->json(['message' => 'Not an educational material'], 404);
        }

        $oldStatus = $ad->status;
        $ad->status = 'active';
        $ad->approved_at = now();
        $ad->save();

        // Log the approval
        Log::info('Educational material approved', [
            'material_id' => $ad->id,
            'title' => $ad->title,
            'approved_by' => auth()->user()->name,
            'previous_status' => $oldStatus
        ]);

        // TODO: Send notification email to the agent/user
        // Mail::to($ad->user->email)->send(new MaterialApproved($ad));

        return response()->json([
            'success' => true,
            'message' => 'Educational material approved successfully',
            'material' => $ad->fresh(['user', 'category'])
        ]);
    }

    /**
     * Reject an educational material
     */
    public function rejectMaterial(Request $request, Ad $ad)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        // Verify this is an educational material
        if (!in_array($ad->category_id, [83, 84, 85, 86]) || !$ad->file_path) {
            return response()->json(['message' => 'Not an educational material'], 404);
        }

        $oldStatus = $ad->status;
        $ad->status = 'rejected';
        $ad->rejection_reason = $request->rejection_reason;
        $ad->rejected_at = now();
        $ad->save();

        // Log the rejection
        Log::info('Educational material rejected', [
            'material_id' => $ad->id,
            'title' => $ad->title,
            'rejected_by' => auth()->user()->name,
            'previous_status' => $oldStatus,
            'reason' => $request->rejection_reason
        ]);

        // TODO: Send notification email to the agent/user
        // Mail::to($ad->user->email)->send(new MaterialRejected($ad));

        return response()->json([
            'success' => true,
            'message' => 'Educational material rejected',
            'material' => $ad->fresh(['user', 'category'])
        ]);
    }

    /**
     * Delete an educational material
     */
    public function deleteMaterial(Request $request, Ad $ad)
    {
        $request->validate([
            'deletion_reason' => 'required|string|max:500'
        ]);

        // Verify this is an educational material
        if (!in_array($ad->category_id, [83, 84, 85, 86]) || !$ad->file_path) {
            return response()->json(['message' => 'Not an educational material'], 404);
        }

        try {
            // Delete associated files
            if ($ad->file_path && Storage::disk('public')->exists($ad->file_path)) {
                Storage::disk('public')->delete($ad->file_path);
            }
            if ($ad->preview_image_path && Storage::disk('public')->exists($ad->preview_image_path)) {
                Storage::disk('public')->delete($ad->preview_image_path);
            }

            // Log the deletion before deleting the record
            Log::info('Educational material deleted by admin', [
                'material_id' => $ad->id,
                'title' => $ad->title,
                'deleted_by' => auth()->user()->name,
                'reason' => $request->deletion_reason,
                'user_email' => $ad->user->email ?? 'unknown'
            ]);

            // Delete any related payments (set status to refunded if needed)
            Payment::where('payable_id', $ad->id)
                ->where('payable_type', 'educational_material')
                ->update(['status' => 'refunded', 'notes' => 'Material deleted by admin: ' . $request->deletion_reason]);

            $ad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Educational material deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete educational material', [
                'material_id' => $ad->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete educational material'
            ], 500);
        }
    }

    /**
     * Get educational materials statistics
     */
    public function getMaterialsStats()
    {
        $stats = [
            'total_materials' => Ad::whereIn('category_id', [83, 84, 85, 86])
                ->whereNotNull('file_path')->count(),
            'pending_approval' => Ad::whereIn('category_id', [83, 84, 85, 86])
                ->whereNotNull('file_path')
                ->where('status', 'pending_approval')->count(),
            'approved_materials' => Ad::whereIn('category_id', [83, 84, 85, 86])
                ->whereNotNull('file_path')
                ->where('status', 'active')->count(),
            'rejected_materials' => Ad::whereIn('category_id', [83, 84, 85, 86])
                ->whereNotNull('file_path')
                ->where('status', 'rejected')->count(),
            'total_sales' => Payment::where('payable_type', 'educational_material')
                ->where('status', 'success')->count(),
            'total_revenue' => Payment::where('payable_type', 'educational_material')
                ->where('status', 'success')->sum('amount'),
            'top_agents' => $this->getTopAgents(),
            'materials_by_category' => $this->getMaterialsByCategory(),
            'recent_uploads' => $this->getRecentUploads()
        ];

        return response()->json($stats);
    }

    /**
     * Get file size helper
     */
    private function getFileSize($filePath)
    {
        try {
            if (!$filePath || !Storage::disk('public')->exists($filePath)) {
                return 'Unknown';
            }

            $bytes = Storage::disk('public')->size($filePath);
            if ($bytes === false || $bytes === null) {
                return 'Unknown';
            }

            $units = ['B', 'KB', 'MB', 'GB'];

            for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
                $bytes /= 1024;
            }

            return round($bytes, 2) . ' ' . $units[$i];
        } catch (\Exception $e) {
            return 'Unknown';
        }
    }

    /**
     * Get top performing agents
     */
    private function getTopAgents()
    {
        return User::where('is_agent', true)
            ->withCount(['ads as materials_count' => function ($query) {
                $query->whereIn('category_id', [83, 84, 85, 86])
                      ->whereNotNull('file_path');
            }])
            ->with(['ads' => function ($query) {
                $query->whereIn('category_id', [83, 84, 85, 86])
                      ->whereNotNull('file_path');
            }])
            ->orderBy('materials_count', 'desc')
            ->take(5)
            ->get()
            ->map(function ($agent) {
                // Calculate sales count from payments table
                $materialIds = $agent->ads->pluck('id');
                $totalSales = Payment::whereIn('payable_id', $materialIds)
                    ->where('payable_type', 'educational_material')
                    ->where('status', 'success')
                    ->count();

                $totalEarnings = Payment::whereIn('payable_id', $materialIds)
                    ->where('payable_type', 'educational_material')
                    ->where('status', 'success')
                    ->sum('amount');

                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'email' => $agent->email,
                    'materials_count' => $agent->materials_count,
                    'total_sales' => $totalSales,
                    'total_earnings' => $totalEarnings
                ];
            });
    }

    /**
     * Get materials by category breakdown
     */
    private function getMaterialsByCategory()
    {
        return Ad::whereIn('category_id', [83, 84, 85, 86])
            ->whereNotNull('file_path')
            ->join('categories', 'ads.category_id', '=', 'categories.id')
            ->selectRaw('categories.name as category_name, COUNT(*) as count')
            ->groupBy('categories.name', 'categories.id')
            ->get()
            ->pluck('count', 'category_name');
    }

    /**
     * Get recent material uploads
     */
    private function getRecentUploads()
    {
        return Ad::whereIn('category_id', [83, 84, 85, 86])
            ->whereNotNull('file_path')
            ->with(['user:id,name,email', 'category:id,name'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'status' => $material->status,
                    'agent_name' => $material->user->name ?? 'Unknown',
                    'category' => $material->category->name ?? 'Unknown',
                    'created_at' => $material->created_at,
                    'file_type' => strtoupper(pathinfo($material->file_path, PATHINFO_EXTENSION)),
                ];
            });
    }

    /**
     * Update user details
     */
    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|string|max:20',
            'is_admin' => 'sometimes|boolean',
            'is_agent' => 'sometimes|boolean',
            'is_affiliate' => 'sometimes|boolean',
        ]);

        $user->update($request->only(['name', 'email', 'phone_number', 'is_admin', 'is_agent', 'is_affiliate']));

        Log::info('User updated by admin', [
            'user_id' => $user->id,
            'admin_id' => auth()->id(),
            'changes' => $request->only(['name', 'email', 'phone_number', 'is_admin', 'is_agent', 'is_affiliate'])
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Delete user account
     */
    public function deleteUser(Request $request, User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account'
            ], 403);
        }

        try {
            // Delete user's ads and related data
            foreach ($user->ads as $ad) {
                // Delete ad images
                foreach ($ad->images as $image) {
                    if (Storage::disk('public')->exists($image->image_path)) {
                        Storage::disk('public')->delete($image->image_path);
                    }
                }
                $ad->images()->delete();
                $ad->customFields()->delete();
                $ad->delete();
            }

            Log::info('User deleted by admin', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'admin_id' => auth()->id()
            ]);

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete user', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user'
            ], 500);
        }
    }

    /**
     * Get agents with statistics
     */
    public function getAgents(Request $request)
    {
        $query = User::where('is_agent', true)
            ->withCount(['ads as materials_count' => function ($q) {
                $q->whereIn('category_id', [83, 84, 85, 86])
                  ->whereNotNull('file_path');
            }]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $agents = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        // Add earnings data
        $agents->getCollection()->transform(function ($agent) {
            $materialIds = $agent->ads->pluck('id');
            $agent->total_sales = Payment::whereIn('payable_id', $materialIds)
                ->where('payable_type', 'educational_material')
                ->where('status', 'success')
                ->count();
            $agent->total_earnings = Payment::whereIn('payable_id', $materialIds)
                ->where('payable_type', 'educational_material')
                ->where('status', 'success')
                ->sum('amount');
            return $agent;
        });

        return response()->json($agents);
    }

    /**
     * Get affiliates with statistics
     */
    public function getAffiliates(Request $request)
    {
        $query = User::where('is_affiliate', true)
            ->withCount('referrals');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('affiliate_code', 'like', "%{$search}%");
            });
        }

        $affiliates = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        // Add commission data
        $affiliates->getCollection()->transform(function ($affiliate) {
            // TODO: Calculate total commissions earned when affiliate_commission column is added
            $affiliate->total_commissions = 0;
            $affiliate->pending_commissions = 0;

            return $affiliate;
        });

        return response()->json($affiliates);
    }

    /**
     * Approve agent application
     */
    public function approveAgent(User $user)
    {
        if ($user->is_agent) {
            return response()->json([
                'success' => false,
                'message' => 'User is already an agent'
            ], 400);
        }

        $user->is_agent = true;
        $user->save();

        Log::info('Agent approved', [
            'user_id' => $user->id,
            'admin_id' => auth()->id()
        ]);

        // TODO: Send approval notification email

        return response()->json([
            'success' => true,
            'message' => 'Agent approved successfully',
            'user' => $user
        ]);
    }

    /**
     * Revoke agent status
     */
    public function revokeAgent(User $user)
    {
        if (!$user->is_agent) {
            return response()->json([
                'success' => false,
                'message' => 'User is not an agent'
            ], 400);
        }

        $user->is_agent = false;
        $user->save();

        Log::info('Agent status revoked', [
            'user_id' => $user->id,
            'admin_id' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agent status revoked successfully',
            'user' => $user
        ]);
    }

    /**
     * Approve affiliate application
     */
    public function approveAffiliate(User $user)
    {
        if ($user->is_affiliate) {
            return response()->json([
                'success' => false,
                'message' => 'User is already an affiliate'
            ], 400);
        }

        $user->is_affiliate = true;

        // Generate affiliate code if not exists
        if (!$user->affiliate_code) {
            $user->affiliate_code = strtoupper(substr(md5($user->id . time()), 0, 8));
        }

        $user->save();

        Log::info('Affiliate approved', [
            'user_id' => $user->id,
            'admin_id' => auth()->id()
        ]);

        // TODO: Send approval notification email

        return response()->json([
            'success' => true,
            'message' => 'Affiliate approved successfully',
            'user' => $user
        ]);
    }

    /**
     * Revoke affiliate status
     */
    public function revokeAffiliate(User $user)
    {
        if (!$user->is_affiliate) {
            return response()->json([
                'success' => false,
                'message' => 'User is not an affiliate'
            ], 400);
        }

        $user->is_affiliate = false;
        $user->save();

        Log::info('Affiliate status revoked', [
            'user_id' => $user->id,
            'admin_id' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Affiliate status revoked successfully',
            'user' => $user
        ]);
    }

    /**
     * Delete ad (admin)
     */
    public function deleteAd(Request $request, Ad $ad)
    {
        try {
            // Delete ad images
            foreach ($ad->images as $image) {
                if (Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
            }

            Log::info('Ad deleted by admin', [
                'ad_id' => $ad->id,
                'title' => $ad->title,
                'admin_id' => auth()->id()
            ]);

            $ad->images()->delete();
            $ad->customFields()->delete();
            $ad->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ad deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete ad', [
                'ad_id' => $ad->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ad'
            ], 500);
        }
    }

    /**
     * Update ad status (admin)
     */
    public function updateAdStatus(Request $request, Ad $ad)
    {
        $request->validate([
            'status' => 'required|in:active,inactive,paused,expired,rejected'
        ]);

        $oldStatus = $ad->status;
        $ad->status = $request->status;
        $ad->save();

        Log::info('Ad status updated by admin', [
            'ad_id' => $ad->id,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'admin_id' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ad status updated successfully',
            'ad' => $ad->fresh(['user', 'category', 'images'])
        ]);
    }
}