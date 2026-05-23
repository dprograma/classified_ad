<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Category;

return new class extends Migration
{
    public function up(): void
    {
        // Add "Others" as a sub-category under every parent category that doesn't already have one
        $parents = Category::whereNull('parent_id')->get();

        foreach ($parents as $parent) {
            $alreadyExists = Category::where('parent_id', $parent->id)
                ->whereIn('name', ['Others', 'Other'])
                ->exists();

            if (! $alreadyExists) {
                Category::create([
                    'name'      => 'Others',
                    'parent_id' => $parent->id,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Remove the "Others" entries that were inserted by this migration
        $parents = Category::whereNull('parent_id')->get();

        foreach ($parents as $parent) {
            Category::where('parent_id', $parent->id)
                ->where('name', 'Others')
                ->delete();
        }
    }
};
