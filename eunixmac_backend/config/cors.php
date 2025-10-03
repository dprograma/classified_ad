<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://eunixma.com.ng',           // Production frontend
        'https://www.eunixma.com.ng',       // Production frontend with www
        'http://eunixma.com.ng',            // Production HTTP (will redirect to HTTPS)
        'http://www.eunixma.com.ng',        // Production HTTP with www
        'http://localhost:5173',            // Local Vite frontend
        'http://localhost:5174',            // Alternative Vite port
        'http://localhost:3000',            // Alternative React port
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
