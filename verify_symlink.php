<?php
/**
 * Symlink Verification Script
 * This checks if the symlink is working correctly
 */

if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    die('This script should only be run on production server!');
}

echo "<h2>Symlink Verification</h2>";
echo "<pre>";

$publicPath = '/home/eunixmac/public_html';
$storagePath = '/home/eunixmac/eunixmac_api/storage/app/public';
$symlinkPath = $publicPath . '/storage';

echo "Checking Symlink Status\n";
echo "=======================\n\n";

// Check if symlink exists
echo "1. Does symlink exist?\n";
if (file_exists($symlinkPath)) {
    echo "   ✅ YES - Something exists at: {$symlinkPath}\n";

    // Check if it's a symlink
    if (is_link($symlinkPath)) {
        echo "   ✅ It IS a symlink\n";
        $target = readlink($symlinkPath);
        echo "   Target: {$target}\n";

        // Check if target is correct
        if ($target === $storagePath) {
            echo "   ✅ Target is CORRECT\n";
        } else {
            echo "   ❌ Target is WRONG!\n";
            echo "   Expected: {$storagePath}\n";
            echo "   Got: {$target}\n";
        }
    } elseif (is_dir($symlinkPath)) {
        echo "   ❌ It's a DIRECTORY, not a symlink!\n";
        echo "   You need to DELETE this directory and create a symlink instead.\n";
    } else {
        echo "   ❌ It's a FILE, not a symlink!\n";
    }
} else {
    echo "   ❌ NO - Symlink does not exist at: {$symlinkPath}\n";
}

echo "\n";

// Check if storage path exists
echo "2. Does storage directory exist?\n";
if (is_dir($storagePath)) {
    echo "   ✅ YES - {$storagePath}\n";
} else {
    echo "   ❌ NO - {$storagePath}\n";
}

echo "\n";

// Check ads directory
$adsPath = $storagePath . '/ads';
echo "3. Does ads directory exist?\n";
if (is_dir($adsPath)) {
    echo "   ✅ YES - {$adsPath}\n";

    // List images
    $images = glob($adsPath . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    echo "   Found {count($images)} images:\n";
    foreach ($images as $img) {
        $filename = basename($img);
        $filesize = filesize($img);
        $readable = is_readable($img) ? 'readable' : 'NOT readable';
        echo "     - {$filename} ({$filesize} bytes, {$readable})\n";
    }
} else {
    echo "   ❌ NO - {$adsPath}\n";
}

echo "\n";

// Check if we can access through symlink
echo "4. Can we access ads through symlink?\n";
$symlinkAdsPath = $symlinkPath . '/ads';
if (is_dir($symlinkAdsPath)) {
    echo "   ✅ YES - {$symlinkAdsPath} is accessible\n";

    // Try to list files through symlink
    $symlinkImages = glob($symlinkAdsPath . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    echo "   Can see {count($symlinkImages)} images through symlink\n";
} else {
    echo "   ❌ NO - Cannot access {$symlinkAdsPath}\n";
}

echo "\n";

// Check permissions
echo "5. Checking permissions:\n";
if (file_exists($symlinkPath)) {
    $perms = substr(sprintf('%o', fileperms($symlinkPath)), -4);
    echo "   Symlink permissions: {$perms}\n";
}

if (is_dir($storagePath)) {
    $perms = substr(sprintf('%o', fileperms($storagePath)), -4);
    echo "   Storage permissions: {$perms}\n";
}

if (is_dir($adsPath)) {
    $perms = substr(sprintf('%o', fileperms($adsPath)), -4);
    echo "   Ads directory permissions: {$perms}\n";
}

echo "\n";

// Check web server user
echo "6. Server information:\n";
echo "   PHP running as user: " . get_current_user() . "\n";
echo "   PHP process owner: " . (function_exists('posix_geteuid') ? posix_getpwuid(posix_geteuid())['name'] : 'unknown') . "\n";

echo "\n";
echo "=======================\n";
echo "Test URLs:\n";
echo "=======================\n";

if (is_dir($adsPath)) {
    $images = glob($adsPath . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    if (!empty($images)) {
        echo "\nTry accessing these URLs in your browser:\n";
        foreach (array_slice($images, 0, 3) as $img) {
            $filename = basename($img);
            echo "https://{$_SERVER['HTTP_HOST']}/storage/ads/{$filename}\n";
        }
    } else {
        echo "\nNo images found to test.\n";
    }
}

echo "\n</pre>";
echo "<p><strong>DELETE THIS FILE after viewing results!</strong></p>";
?>
