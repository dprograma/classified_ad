<?php
/**
 * Force Config Refresh - Touches files to force PHP to reload
 */

$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Force Config Refresh</h2>";
echo "<pre>";

// Touch .env file to update its timestamp
$envFile = $laravelRoot . '/.env';
if (file_exists($envFile)) {
    touch($envFile);
    echo "✅ Touched .env file\n";
}

// Touch bootstrap/app.php to force reload
$appFile = $laravelRoot . '/bootstrap/app.php';
if (file_exists($appFile)) {
    touch($appFile);
    echo "✅ Touched bootstrap/app.php\n";
}

// Clear all possible cache locations
$cacheDirs = [
    $laravelRoot . '/bootstrap/cache',
    $laravelRoot . '/storage/framework/cache',
    $laravelRoot . '/storage/framework/sessions',
];

foreach ($cacheDirs as $dir) {
    if (is_dir($dir)) {
        $files = glob($dir . '/*');
        $count = 0;
        foreach ($files as $file) {
            if (is_file($file) && !in_array(basename($file), ['.gitignore', 'data'])) {
                @unlink($file);
                $count++;
            }
        }
        echo "✅ Cleared {$count} files from " . basename($dir) . "\n";
    }
}

echo "\n==========================================\n";
echo "✅ FORCED REFRESH COMPLETED!\n";
echo "==========================================\n\n";
echo "Test now:\n";
echo "1. https://eunixma.com.ng/api/ads/51\n";
echo "2. Check if preview_image uses eunixma.com.ng (not localhost)\n";
echo "3. DELETE THIS FILE!\n";

echo "</pre>";
?>
