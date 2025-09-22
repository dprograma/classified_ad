<?php

namespace App\Console\Commands;

use App\Models\Ad;
use Illuminate\Console\Command;

class CleanExpiredBoosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ads:clean-expired-boosts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean expired boost statuses from ads';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired boosted ads...');

        $expiredAds = Ad::where('is_boosted', true)
                       ->where('boost_expires_at', '<', now())
                       ->get();

        $count = $expiredAds->count();

        if ($count === 0) {
            $this->info('No expired boosted ads found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$count} expired boosted ads. Cleaning up...");

        foreach ($expiredAds as $ad) {
            $ad->update([
                'is_boosted' => false,
                'boost_expires_at' => null,
            ]);

            $this->line("✓ Cleaned expired boost for ad: {$ad->title} (ID: {$ad->id})");
        }

        $this->info("Successfully cleaned {$count} expired boosted ads.");

        return Command::SUCCESS;
    }
}
