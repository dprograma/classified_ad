<?php
/**
 * Facebook Login Error Log Reader
 *
 * Reads the last 100 lines of the Laravel log and filters for
 * social login errors to show the exact failure reason.
 *
 * INSTRUCTIONS:
 *   1. Upload to public_html on the server.
 *   2. Attempt a Facebook login on the site to trigger a fresh log entry.
 *   3. Visit: https://eunixma.com.ng/check_facebook_log.php?token=eunixma2026
 *   4. Share the output.
 *   5. DELETE THIS FILE immediately after.
 */

$secretToken = 'eunixma2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2>');
}

$laravelRoot = '/home/eunixmac/eunixmac_api';
$logFile = $laravelRoot . '/storage/logs/laravel.log';

echo "<h2>Facebook Login — Laravel Error Log</h2><pre>";

if (!file_exists($logFile)) {
    die("❌ Log file not found at: {$logFile}\n");
}

// Read last 200 lines of the log
$lines = file($logFile, FILE_IGNORE_NEW_LINES);
$lastLines = array_slice($lines, -200);

// Filter for social login related entries
$relevant = [];
$capture = false;
foreach ($lastLines as $line) {
    if (str_contains($line, 'social') || str_contains($line, 'Social') ||
        str_contains($line, 'facebook') || str_contains($line, 'Facebook') ||
        str_contains($line, 'oauth') || str_contains($line, 'OAuth') ||
        str_contains($line, 'Socialite') || str_contains($line, 'authentication_failed') ||
        str_contains($line, 'GuzzleHttp') || str_contains($line, 'ClientException')) {
        $capture = true;
    }

    if ($capture) {
        $relevant[] = $line;
        // Stop capturing after a blank line or new log entry start (unless it's a stack trace)
        if (str_starts_with($line, '[20') && count($relevant) > 1) {
            $capture = false;
        }
    }
}

if (empty($relevant)) {
    echo "No social login errors found in the last 200 log lines.\n\n";
    echo "--- Last 50 log lines (unfiltered) ---\n";
    echo htmlspecialchars(implode("\n", array_slice($lastLines, -50)));
} else {
    echo htmlspecialchars(implode("\n", $relevant));
}

echo "\n\n==========================================\n";
echo "⚠️  DELETE THIS FILE after reading the output!\n";
echo "</pre>";
?>
