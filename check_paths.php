<?php
/**
 * Path Diagnostic Script
 * This will help us find where storage actually is
 */

if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    die('This script should only be run on production server!');
}

echo "<h2>Path Diagnostic Tool</h2>";
echo "<pre>";

$currentDir = dirname(__FILE__);
echo "Current script location: {$currentDir}\n\n";

// Check common locations
$pathsToCheck = [
    $currentDir . '/storage/app/public',
    dirname($currentDir) . '/storage/app/public',
    $currentDir . '/../storage/app/public',
    '/home/eunixmac/storage/app/public',
    '/home/eunixmac/eunixmac_backend/storage/app/public',
    '/home/eunixmac/laravel/storage/app/public',
];

echo "Checking possible storage locations:\n";
echo "=====================================\n\n";

foreach ($pathsToCheck as $path) {
    $realPath = realpath($path);
    if ($realPath && is_dir($realPath)) {
        echo "✅ FOUND: {$path}\n";
        echo "   Real path: {$realPath}\n";

        // Check for ads folder
        $adsPath = $realPath . '/ads';
        if (is_dir($adsPath)) {
            $imageCount = count(glob($adsPath . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE));
            echo "   Has ads folder with {$imageCount} images\n";
        } else {
            echo "   No ads folder yet\n";
        }
        echo "\n";
    } else {
        echo "❌ NOT FOUND: {$path}\n\n";
    }
}

echo "=====================================\n";
echo "Parent directory contents:\n";
$parentDir = dirname($currentDir);
$contents = scandir($parentDir);
echo "Contents of {$parentDir}:\n";
foreach ($contents as $item) {
    if ($item != '.' && $item != '..') {
        $fullPath = $parentDir . '/' . $item;
        $type = is_dir($fullPath) ? '[DIR]' : '[FILE]';
        echo "  {$type} {$item}\n";
    }
}

echo "\n";
echo "Current directory contents:\n";
$contents = scandir($currentDir);
echo "Contents of {$currentDir}:\n";
foreach ($contents as $item) {
    if ($item != '.' && $item != '..') {
        $fullPath = $currentDir . '/' . $item;
        $type = is_dir($fullPath) ? '[DIR]' : '[FILE]';
        echo "  {$type} {$item}\n";
    }
}

echo "</pre>";
echo "<p><strong>DELETE THIS FILE after viewing results!</strong></p>";
?>
