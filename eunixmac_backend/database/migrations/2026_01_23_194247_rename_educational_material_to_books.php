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
        // Update category name from 'Education Material' to 'Books'
        DB::table('categories')
            ->where('id', 83)
            ->where('name', 'Education Material')
            ->update(['name' => 'Books']);

        // Update existing payment records from 'educational_material' to 'book'
        DB::table('payments')
            ->where('payable_type', 'educational_material')
            ->update(['payable_type' => 'book']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert category name from 'Books' back to 'Education Material'
        DB::table('categories')
            ->where('id', 83)
            ->where('name', 'Books')
            ->update(['name' => 'Education Material']);

        // Revert payment records from 'book' back to 'educational_material'
        DB::table('payments')
            ->where('payable_type', 'book')
            ->update(['payable_type' => 'educational_material']);
    }
};
