<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateDefaultAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-default {--reset : Reset password if admin already exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or reset the default admin user';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $email = 'admin@eunixma.com.ng';
        $defaultPassword = 'admin123';
        $name = 'Administrator';

        // Check if admin already exists
        $admin = User::where('email', $email)->first();

        if ($admin) {
            if ($this->option('reset')) {
                // Reset existing admin password
                $admin->password = Hash::make($defaultPassword);
                $admin->save();

                $this->info("Admin password reset successfully!");
                $this->info("Email: {$email}");
                $this->info("Password: {$defaultPassword}");

                return Command::SUCCESS;
            } else {
                $this->warn("Admin user already exists!");
                $this->info("Use --reset flag to reset the password:");
                $this->info("php artisan admin:create-default --reset");

                return Command::FAILURE;
            }
        }

        // Create new admin user
        $admin = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($defaultPassword),
            'phone_number' => '+234000000000',
            'location' => 'Nigeria',
            'bio' => 'System Administrator',
            'email_verified_at' => now(),
            'is_verified' => true,
            'role' => 'admin',
        ]);

        $this->info("Default admin user created successfully!");
        $this->info("Email: {$email}");
        $this->info("Password: {$defaultPassword}");
        $this->warn("Please change this password after first login!");

        return Command::SUCCESS;
    }
}