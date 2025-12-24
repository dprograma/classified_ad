<?php
/**
 * Storage Symlink Creator for eunixmac_api setup
 * IMPORTANT: Delete this file immediately after use!
 */

if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    die('This script should only be run on production server!');
}

// Correct paths for your setup
$publicPath = '/home/eunixmac/public_html';  // Where symlink will be created
$storagePath = '/home/eunixmac/eunixmac_api/storage/app/public';  // Where storage actually is
$symlinkPath = $publicPath . '/storage';

echo "<h2>Storage Symlink Creator</h2>";
echo "<pre>";

// Step 1: Verify paths exist
echo "Step 1: Verifying paths...\n";
echo "Public Path: {$publicPath}\n";
echo "Storage Path: {$storagePath}\n";
echo "Symlink Path: {$symlinkPath}\n\n";

if (!is_dir($publicPath)) {
    die("❌ ERROR: Public directory not found at: {$publicPath}\n");
}

if (!is_dir($storagePath)) {
    die("❌ ERROR: Storage directory not found at: {$storagePath}\n");
}

echo "✅ Both directories exist\n\n";

// Step 1b: Create ads directory if it doesn't exist
$adsPath = $storagePath . '/ads';
if (!is_dir($adsPath)) {
    echo "Step 1b: Creating ads directory...\n";
    if (mkdir($adsPath, 0755, true)) {
        echo "✅ Ads directory created at: {$adsPath}\n\n";
    } else {
        echo "⚠️  WARNING: Could not create ads directory. It will be created automatically on first upload.\n\n";
    }
} else {
    echo "Step 1b: Ads directory already exists\n\n";
}

// Step 2: Check if symlink already exists
echo "Step 2: Checking existing symlink...\n";
if (file_exists($symlinkPath)) {
    if (is_link($symlinkPath)) {
        $currentTarget = readlink($symlinkPath);
        echo "⚠️  Symlink already exists, pointing to: {$currentTarget}\n";

        // Remove old symlink
        if (unlink($symlinkPath)) {
            echo "✅ Old symlink removed\n\n";
        } else {
            die("❌ ERROR: Could not remove old symlink\n");
        }
    } elseif (is_dir($symlinkPath)) {
        echo "⚠️  Directory named 'storage' exists (not a symlink)\n";
        echo "❌ ERROR: Please manually delete the 'storage' directory in public_html via cPanel File Manager\n";
        die("Then run this script again.\n");
    } else {
        echo "⚠️  File named 'storage' exists\n";
        if (unlink($symlinkPath)) {
            echo "✅ File removed\n\n";
        } else {
            die("❌ ERROR: Could not remove file\n");
        }
    }
} else {
    echo "✅ No existing symlink found\n\n";
}

// Step 3: Create the symlink
echo "Step 3: Creating symlink...\n";
if (symlink($storagePath, $symlinkPath)) {
    echo "✅ SUCCESS! Symlink created successfully\n\n";
} else {
    die("❌ ERROR: Failed to create symlink. Contact your hosting provider.\n");
}

// Step 4: Verify the symlink
echo "Step 4: Verifying symlink...\n";
if (is_link($symlinkPath)) {
    $target = readlink($symlinkPath);
    echo "✅ Symlink verified!\n";
    echo "   Link: {$symlinkPath}\n";
    echo "   Points to: {$target}\n\n";
} else {
    die("❌ ERROR: Symlink verification failed\n");
}

// Step 5: Check if images directory exists
echo "Step 5: Checking ads images directory...\n";
if (is_dir($adsPath)) {
    $imageCount = count(glob($adsPath . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE));
    echo "✅ Ads directory exists with {$imageCount} images\n\n";
} else {
    echo "⚠️  Ads directory doesn't exist. It will be created when first ad is posted.\n\n";
}

// Step 6: Test access
echo "Step 6: Testing symlink access...\n";
if (is_readable($symlinkPath)) {
    echo "✅ Symlink is readable\n";
} else {
    echo "⚠️  WARNING: Symlink might not be readable. Check permissions.\n";
}

if (is_executable($symlinkPath)) {
    echo "✅ Symlink is executable\n";
} else {
    echo "⚠️  WARNING: Symlink might not be executable. Check permissions.\n";
}

echo "\n";
echo "=====================================\n";
echo "✅ SYMLINK CREATION COMPLETED!\n";
echo "=====================================\n\n";

echo "Next steps:\n";
echo "1. ❌ DELETE THIS FILE IMMEDIATELY for security!\n";
echo "2. Upload images to: /home/eunixmac/eunixmac_api/storage/app/public/ads/\n";
echo "3. Test image URLs: https://{$_SERVER['HTTP_HOST']}/storage/ads/your-image.jpg\n";
echo "4. Post a new ad with images to test the upload flow\n\n";

// List some sample images if they exist
if (is_dir($adsPath)) {
    $images = glob($adsPath . '/*.{jpg,jpeg,png,gif,webp}', GLOB_BRACE);
    if (!empty($images)) {
        echo "Sample image URLs you can test:\n";
        foreach (array_slice($images, 0, 3) as $imagePath) {
            $imageName = basename($imagePath);
            echo "https://{$_SERVER['HTTP_HOST']}/storage/ads/{$imageName}\n";
        }
        echo "\n";
    }
}

echo "</pre>";
echo "<h3 style='color: red;'>⚠️ DELETE THIS FILE NOW!</h3>";
?>
