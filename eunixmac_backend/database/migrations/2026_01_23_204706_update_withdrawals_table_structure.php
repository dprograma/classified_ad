<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop old columns first
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'bank_account_number', 'bank_account_name', 'bank_code', 'transfer_code', 'failure_reason']);
        });

        // Add new columns
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->foreignId('bank_account_id')->nullable()->after('user_id')->constrained()->onDelete('cascade');
            $table->decimal('fee', 10, 2)->default(0)->after('amount');
            $table->decimal('net_amount', 10, 2)->nullable()->after('fee');
            $table->string('paystack_transfer_code')->nullable()->after('reference');
            $table->text('reason')->nullable()->after('status');
            $table->timestamp('completed_at')->nullable()->after('processed_at');
        });

        // Modify status enum using raw SQL to avoid Doctrine issues
        DB::statement("ALTER TABLE withdrawals MODIFY COLUMN status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            // Add back old columns
            $table->string('bank_name')->after('amount');
            $table->string('bank_account_number')->after('bank_name');
            $table->string('bank_account_name')->after('bank_account_number');
            $table->string('bank_code')->after('bank_account_name');
            $table->string('transfer_code')->nullable()->after('bank_code');
            $table->text('failure_reason')->nullable()->after('status');

            // Remove new columns
            $table->dropForeign(['bank_account_id']);
            $table->dropColumn(['bank_account_id', 'fee', 'net_amount', 'paystack_transfer_code', 'reason', 'completed_at']);

            // Revert status enum
            $table->enum('status', ['pending', 'processing', 'success', 'failed'])->default('pending')->change();
        });
    }
};
