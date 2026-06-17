<?php
/**
 * Fix phone_number column for social login
 *
 * Problem: phone_number has a UNIQUE constraint. Social login inserts '' (empty
 * string) for users who don't have a phone number. Once one social user exists
 * with phone_number='', every subsequent social login that tries to create a
 * new user fails with "Duplicate entry '' for key 'users_phone_number_unique'".
 *
 * Fix:
 *   1. Alter phone_number to allow NULL (MySQL UNIQUE allows multiple NULLs).
 *   2. Update existing '' values to NULL so they stop blocking future signups.
 *
 * INSTRUCTIONS:
 *   1. Upload to public_html on the server.
 *   2. Visit: https://eunixma.com.ng/fix_phone_number_column.php?token=eunixma2026
 *   3. Confirm the output shows success.
 *   4. DELETE THIS FILE immediately after.
 */

$secretToken = 'eunixma2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2>');
}

$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Fix phone_number Column</h2><pre>";

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

// ── Check current column definition ───────────────────────────────────────
$col = $pdo->query("SHOW COLUMNS FROM users WHERE Field = 'phone_number'")->fetch(PDO::FETCH_ASSOC);
echo "Current phone_number definition:\n";
echo "  Type    : " . ($col['Type'] ?? 'NOT FOUND') . "\n";
echo "  Null    : " . ($col['Null'] ?? '?') . "\n";
echo "  Default : " . ($col['Default'] ?? 'none') . "\n\n";

// ── Step 1: Alter column to allow NULL ────────────────────────────────────
if ($col && $col['Null'] !== 'YES') {
    echo "Altering phone_number to allow NULL...\n";
    $pdo->exec("ALTER TABLE users MODIFY COLUMN phone_number VARCHAR(255) NULL DEFAULT NULL");
    $updated = $pdo->query("SHOW COLUMNS FROM users WHERE Field = 'phone_number'")->fetch(PDO::FETCH_ASSOC);
    echo "✅ Column updated — Null is now: " . $updated['Null'] . "\n\n";
} else {
    echo "✅ Column already allows NULL — skipping ALTER.\n\n";
}

// ── Step 2: Update existing '' values to NULL ────────────────────────────
$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE phone_number = ''");
$emptyCount = $stmt->fetchColumn();
echo "Users with phone_number='' : $emptyCount\n";

if ($emptyCount > 0) {
    $affected = $pdo->exec("UPDATE users SET phone_number = NULL WHERE phone_number = ''");
    echo "✅ Updated $affected row(s) — empty strings replaced with NULL.\n\n";
} else {
    echo "✅ No empty-string phone numbers found — nothing to update.\n\n";
}

// ── Verify ─────────────────────────────────────────────────────────────────
$nullCount = $pdo->query("SELECT COUNT(*) FROM users WHERE phone_number IS NULL")->fetchColumn();
echo "Users with phone_number=NULL now: $nullCount\n";

echo "\n==========================================\n";
echo "Done! Google login should now work.\n";
echo "==========================================\n\n";
echo "⚠️  DELETE THIS FILE from the server now!\n";
echo "</pre>";
?>
