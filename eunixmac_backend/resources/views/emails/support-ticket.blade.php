<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? 'Support Ticket Notification' }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #2196F3;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .ticket-info {
            background: #f8f9fa;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
        }
        .priority {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority-low { background: #e3f2fd; color: #1565c0; }
        .priority-medium { background: #fff3e0; color: #f57c00; }
        .priority-high { background: #ffebee; color: #d32f2f; }
        .priority-urgent { background: #f3e5f5; color: #7b1fa2; }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-open { background: #e3f2fd; color: #1565c0; }
        .status-in-progress { background: #fff3e0; color: #f57c00; }
        .status-resolved { background: #e8f5e8; color: #2e7d32; }
        .status-closed { background: #f5f5f5; color: #616161; }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #2196F3;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .divider {
            border-top: 1px solid #eee;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Support Ticket {{ ucfirst(str_replace('_', ' ', $type ?? 'Notification')) }}</h1>
        </div>

        <div class="content">
            @if($type === 'new')
                <h2>New Support Ticket Created</h2>
                <p>A new support ticket has been submitted and requires attention.</p>
            @elseif($type === 'updated')
                <h2>Support Ticket Updated</h2>
                <p>A support ticket has been updated and may require your attention.</p>
            @elseif($type === 'response')
                <h2>New Response Added</h2>
                <p>A new response has been added to a support ticket.</p>
            @else
                <h2>Support Ticket Notification</h2>
                <p>This is a notification regarding a support ticket.</p>
            @endif

            <div class="ticket-info">
                <h3>Ticket Details</h3>
                <p><strong>Ticket Number:</strong> {{ $ticket->ticket_number }}</p>
                <p><strong>Subject:</strong> {{ $ticket->subject }}</p>
                <p><strong>Category:</strong> {{ ucfirst($ticket->category) }}</p>
                <p><strong>Priority:</strong>
                    <span class="priority priority-{{ $ticket->priority }}">
                        {{ ucfirst($ticket->priority) }}
                    </span>
                </p>
                <p><strong>Status:</strong>
                    <span class="status status-{{ str_replace('_', '-', $ticket->status) }}">
                        {{ ucfirst(str_replace('_', ' ', $ticket->status)) }}
                    </span>
                </p>
                <p><strong>Customer:</strong> {{ $ticket->user->name }} ({{ $ticket->user->email }})</p>
                @if($ticket->assigned_to)
                    <p><strong>Assigned To:</strong> {{ $ticket->assignedTo->name }}</p>
                @else
                    <p><strong>Assigned To:</strong> <em>Unassigned</em></p>
                @endif
                <p><strong>Created:</strong> {{ $ticket->created_at->format('M j, Y \a\t g:i A') }}</p>
            </div>

            @if($type === 'new')
                <div class="divider"></div>
                <h4>Customer Message:</h4>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 10px 0;">
                    {{ $ticket->message }}
                </div>
            @endif

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ config('app.frontend_url', config('app.url')) }}/admin/support" class="button">
                    View Ticket in Admin Dashboard
                </a>
            </div>

            @if($ticket->priority === 'urgent' || $ticket->priority === 'high')
                <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
                    <strong>⚠️ High Priority Ticket</strong><br>
                    This ticket has been marked as {{ $ticket->priority }} priority and requires immediate attention.
                </div>
            @endif
        </div>

        <div class="footer">
            <p>
                This is an automated notification from your support system.<br>
                Please do not reply directly to this email.
            </p>
            <p>
                <strong>{{ config('app.name') }}</strong><br>
                {{ config('app.url') }}
            </p>
        </div>
    </div>
</body>
</html>