<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckBoostExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'boost:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check and deactivate expired boost ads';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired boost ads...');

        $expiredAds = \App\Models\Ad::where('is_boosted', true)
                                   ->where('boost_expires_at', '<', now())
                                   ->get();

        $count = 0;
        foreach ($expiredAds as $ad) {
            $ad->update([
                'is_boosted' => false,
                'boost_expires_at' => null,
            ]);
            $count++;

            $this->line("Deactivated boost for ad #{$ad->id}: {$ad->title}");
        }

        $this->info("Boost expiry check completed. {$count} ads deactivated.");

        return 0;
    }
}
