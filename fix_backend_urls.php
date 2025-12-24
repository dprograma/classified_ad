<?php
/**
 * Fix Backend URLs - Force reload configuration
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Backend URL Fixer</h2>";
echo "<pre>";

$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "Step 1: Checking .env file...\n";
echo "==========================================\n";

$envPath = $laravelRoot . '/.env';
if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);

    if (preg_match('/APP_URL=(.+)$/m', $envContent, $matches)) {
        $appUrl = trim($matches[1]);
        echo "Current APP_URL: {$appUrl}\n";

        if (strpos($appUrl, 'localhost') !== false) {
            echo "❌ Contains localhost - UPDATING NOW...\n\n";

            // Replace localhost with production URL
            $newEnvContent = preg_replace(
                '/APP_URL=.+$/m',
                'APP_URL=https://eunixma.com.ng',
                $envContent
            );

            if (file_put_contents($envPath, $newEnvContent)) {
                echo "✅ .env file updated!\n";
            } else {
                echo "❌ Failed to update .env file\n";
            }
        } else {
            echo "✅ APP_URL looks correct\n";
        }
    }
} else {
    echo "❌ .env file not found at: {$envPath}\n";
}

echo "\n";
echo "Step 2: Deleting all cache files...\n";
echo "==========================================\n";

$cachePaths = [
    $laravelRoot . '/bootstrap/cache/config.php',
    $laravelRoot . '/bootstrap/cache/routes-v7.php',
    $laravelRoot . '/bootstrap/cache/packages.php',
    $laravelRoot . '/bootstrap/cache/services.php',
];

foreach ($cachePaths as $path) {
    if (file_exists($path)) {
        if (unlink($path)) {
            echo "✅ Deleted: " . basename($path) . "\n";
        } else {
            echo "❌ Failed to delete: " . basename($path) . "\n";
        }
    }
}

echo "\n";
echo "Step 3: Touching critical files to force reload...\n";
echo "==========================================\n";

$touchFiles = [
    $laravelRoot . '/.env',
    $laravelRoot . '/bootstrap/app.php',
    $laravelRoot . '/config/app.php',
    $laravelRoot . '/app/Models/Ad.php',
];

foreach ($touchFiles as $file) {
    if (file_exists($file)) {
        touch($file);
        echo "✅ Touched: " . basename($file) . "\n";
    }
}

echo "\n";
echo "Step 4: Creating test to verify config...\n";
echo "==========================================\n";

// Create a simple Laravel bootstrap test
$testScript = <<<'PHP'
<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
echo config('app.url');
PHP;

$testPath = $laravelRoot . '/public/test_config.php';
file_put_contents($testPath, $testScript);

echo "Created test script at: {$testPath}\n";
echo "Visit: https://eunixma.com.ng/test_config.php\n";
echo "It should display: https://eunixma.com.ng\n";

echo "\n==========================================\n";
echo "✅ FIXES APPLIED!\n";
echo "==========================================\n\n";
echo "Next steps:\n";
echo "1. Visit: https://eunixma.com.ng/test_config.php\n";
echo "2. It should show: https://eunixma.com.ng (not localhost)\n";
echo "3. Then visit: https://eunixma.com.ng/api/ads/51\n";
echo "4. Check if preview_image now uses eunixma.com.ng\n";
echo "5. DELETE THIS FILE and test_config.php!\n";

echo "</pre>";
?>
