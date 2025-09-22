<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('updated_at');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
            $table->text('rejection_reason')->nullable()->after('rejected_at');
            $table->index(['status', 'approved_at']);
            $table->index(['status', 'rejected_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropIndex(['status', 'approved_at']);
            $table->dropIndex(['status', 'rejected_at']);
            $table->dropColumn(['approved_at', 'rejected_at', 'rejection_reason']);
        });
    }
};
