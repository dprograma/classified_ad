<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all existing books with 'N/A' location to 'Digital Product'
        // Books are identified by category IDs: 83 (Books), 84 (Past Questions), 85 (Ebooks), 86 (Publications)
        DB::table('ads')
            ->whereIn('category_id', [83, 84, 85, 86])
            ->where('location', 'N/A')
            ->update(['location' => 'Digital Product']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert 'Digital Product' back to 'N/A' for books
        DB::table('ads')
            ->whereIn('category_id', [83, 84, 85, 86])
            ->where('location', 'Digital Product')
            ->update(['location' => 'N/A']);
    }
};
