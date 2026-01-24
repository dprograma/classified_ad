<?php
/**
 * Temporary Migration Runner Script for cPanel
 *
 * SECURITY: Delete this file immediately after running migrations!
 *
 * Usage: Access via browser: https://yourdomain.com/run-migration.php?key=YOUR_SECRET_KEY
 */

// Set a secret key
$secretKey = '5b8ef0585635bad966828421c75282df971f25798f7a5f94daf40d39930bb020';

// Verify the secret key
if (!isset($_GET['key']) || $_GET['key'] !== $secretKey) {
    http_response_code(403);
    die('Access denied. Invalid or missing key.');
}

// Prevent timeout for long migrations
set_time_limit(300);
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Flush output immediately
ob_implicit_flush(true);
if (ob_get_level()) ob_end_flush();

echo "<pre style='font-family: monospace; background: #1e1e1e; color: #00ff00; padding: 20px; border-radius: 8px;'>";
echo "===========================================\n";
echo "  Laravel Migration Runner (cPanel)\n";
echo "===========================================\n\n";

// CPANEL PATH CONFIGURATION
$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "Laravel Root: $laravelRoot\n";
echo "Checking paths...\n";

// Verify paths exist
if (!file_exists($laravelRoot)) {
    die("❌ ERROR: Laravel root directory not found: $laravelRoot\n");
}

if (!file_exists($laravelRoot . '/vendor/autoload.php')) {
    die("❌ ERROR: vendor/autoload.php not found. Run 'composer install' first.\n");
}

if (!file_exists($laravelRoot . '/bootstrap/app.php')) {
    die("❌ ERROR: bootstrap/app.php not found.\n");
}

echo "✅ All paths verified\n\n";

// Change to Laravel root directory
chdir($laravelRoot);

echo "Loading Laravel...\n";
flush();

try {
    // Load Laravel
    require $laravelRoot . '/vendor/autoload.php';

    $app = require_once $laravelRoot . '/bootstrap/app.php';

    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo "✅ Laravel loaded successfully\n\n";
    flush();

} catch (Exception $e) {
    echo "❌ Error loading Laravel: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    die("</pre>");
}

// Run pending migrations
echo "🚀 Running Pending Migrations...\n";
echo "-------------------------------------------\n";
flush();

try {
    $exitCode = Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    echo Illuminate\Support\Facades\Artisan::output();
    flush();

    if ($exitCode === 0) {
        echo "\n✅ Migrations completed successfully!\n";
    } else {
        echo "\n❌ Migration failed with exit code: $exitCode\n";
    }
} catch (Exception $e) {
    echo "\n❌ Error running migrations: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n-------------------------------------------\n";
echo "⚠️  IMPORTANT: Delete this file immediately!\n";
echo "===========================================\n";
echo "</pre>";

// Log this access for security
error_log("Migration script accessed from IP: " . $_SERVER['REMOTE_ADDR'] . " at " . date('Y-m-d H:i:s'));
