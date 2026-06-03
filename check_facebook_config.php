<?php
/**
 * Facebook OAuth Config Checker
 *
 * Diagnoses why Facebook login callback is failing.
 *
 * INSTRUCTIONS:
 *   1. Upload to public_html on the server.
 *   2. Visit: https://eunixma.com.ng/check_facebook_config.php?token=eunixma2026
 *   3. Report the output back.
 *   4. DELETE THIS FILE immediately after.
 */

$secretToken = 'eunixma2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2>');
}

$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Facebook OAuth Config Check</h2><pre>";

// ── Read .env ──────────────────────────────────────────────────────────────
$envFile = $laravelRoot . '/.env';
if (!file_exists($envFile)) {
    die("❌ .env not found at: {$envFile}\n");
}

$env = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
    [$key, $value] = explode('=', $line, 2);
    $env[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
}

echo "APP_URL              : " . ($env['APP_URL']              ?? '❌ NOT SET') . "\n";
echo "FRONTEND_URL         : " . ($env['FRONTEND_URL']         ?? '❌ NOT SET') . "\n";
echo "FACEBOOK_CLIENT_ID   : " . (isset($env['FACEBOOK_CLIENT_ID'])     ? '✅ Set (' . substr($env['FACEBOOK_CLIENT_ID'], 0, 6) . '...)' : '❌ NOT SET') . "\n";
echo "FACEBOOK_CLIENT_SECRET: " . (isset($env['FACEBOOK_CLIENT_SECRET']) ? '✅ Set'   : '❌ NOT SET') . "\n";
echo "FACEBOOK_REDIRECT_URI: " . ($env['FACEBOOK_REDIRECT_URI'] ?? '❌ NOT SET') . "\n";

echo "\n==========================================\n";

$redirectUri = $env['FACEBOOK_REDIRECT_URI'] ?? '';
$expectedUri = 'https://eunixma.com.ng/api/auth/facebook/callback';

if ($redirectUri === $expectedUri) {
    echo "✅ FACEBOOK_REDIRECT_URI is correct!\n";
} else {
    echo "❌ FACEBOOK_REDIRECT_URI is WRONG.\n";
    echo "   Current : {$redirectUri}\n";
    echo "   Expected: {$expectedUri}\n";
    echo "\n➡️  Fix: Update FACEBOOK_REDIRECT_URI in your .env to:\n";
    echo "   FACEBOOK_REDIRECT_URI={$expectedUri}\n";
    echo "\n   Also make sure this exact URL is registered as a\n";
    echo "   Valid OAuth Redirect URI in your Facebook App Dashboard\n";
    echo "   under: App > Facebook Login > Settings > Valid OAuth Redirect URIs\n";
}

echo "\n==========================================\n";
echo "⚠️  DELETE THIS FILE after reading the output!\n";
echo "</pre>";
?>
