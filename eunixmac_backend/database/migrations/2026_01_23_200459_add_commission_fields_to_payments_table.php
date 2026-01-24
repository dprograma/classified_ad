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
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('platform_commission', 10, 2)->default(0)->after('amount'); // 30% commission
            $table->decimal('seller_amount', 10, 2)->default(0)->after('platform_commission'); // 70% for seller
            $table->decimal('commission_rate', 5, 2)->default(0)->after('seller_amount'); // Commission percentage
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['platform_commission', 'seller_amount', 'commission_rate']);
        });
    }
};
