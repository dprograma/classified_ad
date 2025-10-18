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
            // Add indexes for frequently queried columns
            $table->index('status', 'ads_status_index');
            $table->index('created_at', 'ads_created_at_index');
            $table->index('updated_at', 'ads_updated_at_index');
            $table->index('price', 'ads_price_index');

            // Composite indexes for common query patterns
            $table->index(['status', 'created_at'], 'ads_active_recent_index');
            $table->index(['category_id', 'status'], 'ads_category_status_index');
            $table->index(['user_id', 'status'], 'ads_user_status_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            // Drop indexes in reverse order
            $table->dropIndex('ads_user_status_index');
            $table->dropIndex('ads_category_status_index');
            $table->dropIndex('ads_active_recent_index');
            $table->dropIndex('ads_price_index');
            $table->dropIndex('ads_updated_at_index');
            $table->dropIndex('ads_created_at_index');
            $table->dropIndex('ads_status_index');
        });
    }
};
