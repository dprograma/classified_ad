<?php
/**
 * Fix provider_token column — widen to TEXT for long Facebook access tokens
 *
 * The provider_token column is VARCHAR(255) which is too short for Facebook
 * access tokens. This script widens it to TEXT.
 *
 * INSTRUCTIONS:
 *   1. Upload to public_html on the server.
 *   2. Visit: https://eunixma.com.ng/fix_provider_token_column.php?token=eunixma2026
 *   3. Confirm the output shows success.
 *   4. DELETE THIS FILE immediately after.
 */

$secretToken = 'eunixma2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2>');
}

$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Fix provider_token Column</h2><pre>";

// ── Read .env ──────────────────────────────────────────────────────────────
$envFile = $laravelRoot . '/.env';
if (!file_exists($envFile)) die("❌ .env not found\n");

$env = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
    [$key, $value] = explode('=', $line, 2);
    $env[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
}

try {
    $pdo = new PDO(
        "mysql:host={$env['DB_HOST']};port={$env['DB_PORT']};dbname={$env['DB_DATABASE']};charset=utf8mb4",
        $env['DB_USERNAME'], $env['DB_PASSWORD'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ Database connected\n\n";
} catch (PDOException $e) {
    die("❌ Connection failed: " . $e->getMessage() . "\n");
}

// ── Check current column type ──────────────────────────────────────────────
$col = $pdo->query("SHOW COLUMNS FROM users WHERE Field = 'provider_token'")->fetch(PDO::FETCH_ASSOC);
echo "Current provider_token type : " . ($col['Type'] ?? 'NOT FOUND') . "\n\n";

if ($col && strtolower($col['Type']) === 'text') {
    echo "✅ Already TEXT — nothing to do.\n";
} else {
    $pdo->exec("ALTER TABLE users MODIFY COLUMN provider_token TEXT NULL");
    $updated = $pdo->query("SHOW COLUMNS FROM users WHERE Field = 'provider_token'")->fetch(PDO::FETCH_ASSOC);
    echo "✅ Column updated to: " . $updated['Type'] . "\n";
}

// ── Also widen profile_picture just in case (Facebook URLs can be long) ────
$pic = $pdo->query("SHOW COLUMNS FROM users WHERE Field = 'profile_picture'")->fetch(PDO::FETCH_ASSOC);
echo "\nCurrent profile_picture type: " . ($pic['Type'] ?? 'NOT FOUND') . "\n";
if ($pic && strtolower($pic['Type']) !== 'text') {
    $pdo->exec("ALTER TABLE users MODIFY COLUMN profile_picture TEXT NULL");
    echo "✅ profile_picture widened to TEXT\n";
} else {
    echo "✅ profile_picture already TEXT — nothing to do.\n";
}

echo "\n==========================================\n";
echo "Done! Facebook login should now work.\n";
echo "==========================================\n\n";
echo "⚠️  DELETE THIS FILE from the server now!\n";
echo "</pre>";
?>
