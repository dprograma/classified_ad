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
            $table->string('subject_area')->nullable();
            $table->string('education_level')->nullable();
            $table->text('tags')->nullable();
            $table->text('preview_text')->nullable();
            $table->text('author_info')->nullable();
            $table->integer('year_published')->nullable();
            $table->string('language')->nullable()->default('English');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn([
                'subject_area',
                'education_level',
                'tags',
                'preview_text',
                'author_info',
                'year_published',
                'language'
            ]);
        });
    }
};
