<?php
/**
 * Reset OPcache - This will force PHP to reload all cached files
 * This fixes the localhost URL issue
 */

echo "<h2>OPcache Reset</h2>";
echo "<pre>";

// Check if OPcache is enabled
if (function_exists('opcache_get_status')) {
    $status = opcache_get_status();

    if ($status !== false) {
        echo "OPcache Status:\n";
        echo "==========================================\n";
        echo "Enabled: " . ($status['opcache_enabled'] ? 'YES' : 'NO') . "\n";
        echo "Cached scripts: " . $status['opcache_statistics']['num_cached_scripts'] . "\n";
        echo "Memory used: " . round($status['memory_usage']['used_memory'] / 1024 / 1024, 2) . " MB\n\n";

        // Reset OPcache
        echo "Resetting OPcache...\n";
        if (opcache_reset()) {
            echo "✅ OPcache reset successfully!\n\n";
        } else {
            echo "❌ Failed to reset OPcache (may not have permission)\n\n";
        }

        // Verify reset
        $newStatus = opcache_get_status();
        if ($newStatus !== false) {
            echo "After reset:\n";
            echo "Cached scripts: " . $newStatus['opcache_statistics']['num_cached_scripts'] . "\n\n";
        }
    } else {
        echo "⚠️ OPcache is installed but returned false status\n\n";
    }
} else {
    echo "ℹ️ OPcache is not available on this server\n\n";
}

// Also clear Laravel config cache again
$laravelRoot = '/home/eunixmac/eunixmac_api';
echo "Clearing Laravel config cache...\n";
$configCache = $laravelRoot . '/bootstrap/cache/config.php';
if (file_exists($configCache)) {
    if (unlink($configCache)) {
        echo "✅ Config cache deleted\n\n";
    } else {
        echo "❌ Failed to delete config cache\n\n";
    }
} else {
    echo "✅ No config cache to clear\n\n";
}

echo "==========================================\n";
echo "✅ RESET COMPLETE!\n";
echo "==========================================\n\n";
echo "Test now:\n";
echo "1. Wait 5 seconds for changes to take effect\n";
echo "2. Visit: https://eunixma.com.ng/api/ads/51\n";
echo "3. Check if preview_image now uses eunixma.com.ng\n";
echo "4. DELETE THIS FILE!\n";

echo "</pre>";
?>
