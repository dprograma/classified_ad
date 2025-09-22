<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt - {{ $payment->reference }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }

        .company-details {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }

        .receipt-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
        }

        .details-section {
            margin-bottom: 30px;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }

        .details-grid {
            display: table;
            width: 100%;
        }

        .detail-row {
            display: table-row;
        }

        .detail-label {
            display: table-cell;
            font-weight: bold;
            color: #6b7280;
            padding: 8px 20px 8px 0;
            width: 30%;
        }

        .detail-value {
            display: table-cell;
            padding: 8px 0;
        }

        .amount-highlight {
            font-size: 18px;
            font-weight: bold;
            color: #10b981;
        }

        .status-success {
            background-color: #d1fae5;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }

        .thank-you {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f0f9ff;
            border-radius: 8px;
            color: #1e40af;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company['name'] }}</div>
        <div class="company-details">
            {{ $company['address'] }}<br>
            Email: {{ $company['email'] }} | Phone: {{ $company['phone'] }}
        </div>
    </div>

    <div class="receipt-title">
        PAYMENT RECEIPT
    </div>

    <div class="details-section">
        <div class="section-title">Payment Information</div>
        <div class="details-grid">
            <div class="detail-row">
                <div class="detail-label">Receipt Number:</div>
                <div class="detail-value">{{ $payment->reference }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Transaction ID:</div>
                <div class="detail-value">#{{ $payment->id }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Payment Type:</div>
                <div class="detail-value">
                    @switch($payment->payable_type)
                        @case('AdBoost')
                            Ad Boost Payment
                            @break
                        @case('educational_material')
                            Educational Material Purchase
                            @break
                        @default
                            {{ $payment->type ?? 'Payment' }}
                    @endswitch
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Amount Paid:</div>
                <div class="detail-value amount-highlight">₦{{ number_format($payment->amount, 2) }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="status-success">{{ ucfirst($payment->status) }}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Payment Date:</div>
                <div class="detail-value">{{ $payment->created_at->format('F j, Y - g:i A') }}</div>
            </div>
        </div>
    </div>

    <div class="details-section">
        <div class="section-title">Customer Information</div>
        <div class="details-grid">
            <div class="detail-row">
                <div class="detail-label">Customer Name:</div>
                <div class="detail-value">{{ $user->name }}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email Address:</div>
                <div class="detail-value">{{ $user->email }}</div>
            </div>
            @if($user->phone_number)
            <div class="detail-row">
                <div class="detail-label">Phone Number:</div>
                <div class="detail-value">{{ $user->phone_number }}</div>
            </div>
            @endif
        </div>
    </div>

    <div class="thank-you">
        <strong>Thank you for your payment!</strong><br>
        This receipt serves as confirmation of your successful transaction.
    </div>

    <div class="footer">
        <p>This is an electronically generated receipt and does not require a signature.</p>
        <p>Generated on {{ now()->format('F j, Y \a\t g:i A') }}</p>
        <p>For support or inquiries, please contact us at {{ $company['email'] }}</p>
    </div>
</body>
</html>