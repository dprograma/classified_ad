<?php
/**
 * Clear Laravel Cache Script
 * Run this after changing .env to clear config cache
 */

// Change this to your Laravel root directory
$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Laravel Cache Clearer</h2>";
echo "<pre>";

// Change to Laravel directory
chdir($laravelRoot);

echo "Laravel Root: {$laravelRoot}\n";
echo "==========================================\n\n";

// Clear config cache
echo "1. Clearing config cache...\n";
if (file_exists($laravelRoot . '/bootstrap/cache/config.php')) {
    if (unlink($laravelRoot . '/bootstrap/cache/config.php')) {
        echo "   ✅ Config cache cleared\n\n";
    } else {
        echo "   ❌ Failed to clear config cache\n\n";
    }
} else {
    echo "   ✅ No config cache to clear\n\n";
}

// Clear route cache
echo "2. Clearing route cache...\n";
if (file_exists($laravelRoot . '/bootstrap/cache/routes-v7.php')) {
    if (unlink($laravelRoot . '/bootstrap/cache/routes-v7.php')) {
        echo "   ✅ Route cache cleared\n\n";
    } else {
        echo "   ❌ Failed to clear route cache\n\n";
    }
} else {
    echo "   ✅ No route cache to clear\n\n";
}

// Clear view cache
echo "3. Clearing view cache...\n";
$viewCachePath = $laravelRoot . '/storage/framework/views';
if (is_dir($viewCachePath)) {
    $files = glob($viewCachePath . '/*');
    $count = 0;
    foreach ($files as $file) {
        if (is_file($file) && unlink($file)) {
            $count++;
        }
    }
    echo "   ✅ Cleared {$count} view cache files\n\n";
} else {
    echo "   ✅ No view cache to clear\n\n";
}

// Check current APP_URL
echo "4. Checking APP_URL in .env...\n";
$envFile = $laravelRoot . '/.env';
if (file_exists($envFile)) {
    $envContent = file_get_contents($envFile);
    if (preg_match('/APP_URL=(.+)$/m', $envContent, $matches)) {
        $appUrl = trim($matches[1]);
        echo "   Current APP_URL: {$appUrl}\n";

        if (strpos($appUrl, 'localhost') !== false) {
            echo "   ❌ WARNING: Still contains 'localhost'!\n";
            echo "   Please change it to: https://eunixma.com.ng\n";
        } else {
            echo "   ✅ Looks correct!\n";
        }
    }
} else {
    echo "   ❌ .env file not found\n";
}

echo "\n==========================================\n";
echo "✅ CACHE CLEARING COMPLETED!\n";
echo "==========================================\n\n";
echo "Next steps:\n";
echo "1. Verify APP_URL is set to: https://eunixma.com.ng\n";
echo "2. Test an image URL: https://eunixma.com.ng/storage/ads/1765552635_693c31fb78d01.jpg\n";
echo "3. Refresh your website and check if images appear\n";
echo "4. DELETE THIS FILE for security!\n";

echo "</pre>";
?>
