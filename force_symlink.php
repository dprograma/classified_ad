<?php
/**
 * Force Symlink Creation - Multiple Methods
 * Tries different approaches to create the symlink
 */

if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    die('This script should only be run on production server!');
}

$publicPath = '/home/eunixmac/public_html';
$storagePath = '/home/eunixmac/eunixmac_api/storage/app/public';
$symlinkPath = $publicPath . '/storage';

echo "<h2>Force Symlink Creation</h2>";
echo "<pre>";

// Check if symlink function is enabled
echo "Checking PHP symlink function...\n";
if (function_exists('symlink')) {
    echo "✅ symlink() function exists\n\n";
} else {
    echo "❌ symlink() function is DISABLED on this server\n\n";
}

// Method 1: Try PHP symlink (might fail silently on shared hosting)
echo "Method 1: Trying PHP symlink()...\n";
if (file_exists($symlinkPath)) {
    echo "⚠️  Something already exists at {$symlinkPath}\n";
    if (is_dir($symlinkPath) && !is_link($symlinkPath)) {
        echo "   It's a directory. Attempting to remove...\n";
        if (rmdir($symlinkPath)) {
            echo "   ✅ Directory removed\n";
        } else {
            echo "   ❌ Cannot remove directory (it may contain files)\n";
        }
    }
}

if (!file_exists($symlinkPath)) {
    if (@symlink($storagePath, $symlinkPath)) {
        echo "✅ SUCCESS via PHP symlink()!\n";
        if (is_link($symlinkPath)) {
            echo "✅ Verified: Symlink created successfully\n\n";
            goto success;
        } else {
            echo "❌ symlink() returned true but symlink doesn't exist\n\n";
        }
    } else {
        $error = error_get_last();
        echo "❌ FAILED: " . ($error['message'] ?? 'Unknown error') . "\n\n";
    }
}

// Method 2: Try shell command via exec
echo "Method 2: Trying shell command via exec()...\n";
$command = "ln -s {$storagePath} {$symlinkPath} 2>&1";
$output = [];
$returnVar = 0;
exec($command, $output, $returnVar);
echo "Command: {$command}\n";
echo "Return code: {$returnVar}\n";
echo "Output: " . implode("\n", $output) . "\n";
if ($returnVar === 0 && is_link($symlinkPath)) {
    echo "✅ SUCCESS via exec()!\n\n";
    goto success;
} else {
    echo "❌ FAILED\n\n";
}

// Method 3: Try shell_exec
echo "Method 3: Trying shell command via shell_exec()...\n";
$result = @shell_exec($command);
echo "Command: {$command}\n";
echo "Output: " . ($result ?? 'null') . "\n";
if (is_link($symlinkPath)) {
    echo "✅ SUCCESS via shell_exec()!\n\n";
    goto success;
} else {
    echo "❌ FAILED\n\n";
}

// Method 4: Try system
echo "Method 4: Trying shell command via system()...\n";
ob_start();
@system($command, $returnVar);
$output = ob_get_clean();
echo "Command: {$command}\n";
echo "Return code: {$returnVar}\n";
echo "Output: {$output}\n";
if (is_link($symlinkPath)) {
    echo "✅ SUCCESS via system()!\n\n";
    goto success;
} else {
    echo "❌ FAILED\n\n";
}

// If we get here, nothing worked
echo "=====================================\n";
echo "❌ ALL METHODS FAILED\n";
echo "=====================================\n\n";
echo "Your hosting provider has disabled symlink creation via PHP.\n\n";
echo "SOLUTION: You need to create the symlink manually using one of these methods:\n\n";
echo "Option 1: Use cPanel Terminal (if available)\n";
echo "-------------------------------------------------\n";
echo "1. Go to cPanel > Terminal\n";
echo "2. Run this command:\n";
echo "   ln -s {$storagePath} {$symlinkPath}\n";
echo "3. Verify with: ls -la {$publicPath} | grep storage\n\n";
echo "Option 2: Contact Hosting Support\n";
echo "-------------------------------------------------\n";
echo "Ask them to run this command:\n";
echo "   ln -s {$storagePath} {$symlinkPath}\n\n";
echo "Option 3: Use .htaccess redirect (workaround)\n";
echo "-------------------------------------------------\n";
echo "This creates a redirect instead of a symlink.\n";
echo "See details below.\n\n";

goto end;

success:
echo "=====================================\n";
echo "✅ SYMLINK CREATED SUCCESSFULLY!\n";
echo "=====================================\n\n";
echo "Verification:\n";
$target = readlink($symlinkPath);
echo "Symlink: {$symlinkPath}\n";
echo "Points to: {$target}\n\n";
echo "Test URL:\n";
echo "https://{$_SERVER['HTTP_HOST']}/storage/ads/1761546546_68ff113281e27.jpg\n\n";

end:
echo "</pre>";
echo "<h3 style='color: red;'>⚠️ DELETE THIS FILE NOW!</h3>";
?>
