<?php

namespace App\Providers;

use App\Mail\Transports\ResendTransport;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Mail::extend('resend', function () {
            return new ResendTransport(config('services.resend.key'));
        });
    }
}
