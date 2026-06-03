<?php
/**
 * Activate All Pending-Approval Ads
 *
 * Old ads were set to 'pending_approval' by a previous migration and are
 * invisible on the site. This script sets them all to 'active' so they
 * appear in Trending Ads and everywhere else.
 *
 * INSTRUCTIONS:
 *   1. Upload this file to your public_html directory on the server.
 *   2. Visit: https://eunixma.com.ng/activate_pending_ads.php?token=eunixma2026
 *   3. Confirm the output shows the ads updated successfully.
 *   4. DELETE THIS FILE immediately after running it.
 */

// ── Security token ─────────────────────────────────────────────────────────
$secretToken = 'eunixma2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2><p>Provide the correct token to run this script.</p>');
}

// ── Laravel root on the production server ──────────────────────────────────
$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Activate Pending-Approval Ads</h2>";
echo "<pre>";

// ── Read .env ──────────────────────────────────────────────────────────────
$envFile = $laravelRoot . '/.env';
if (!file_exists($envFile)) {
    die("❌ .env file not found at: {$envFile}\n");
}

$env = [];
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
    [$key, $value] = explode('=', $line, 2);
    $env[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
}

$dbHost = $env['DB_HOST']     ?? '127.0.0.1';
$dbPort = $env['DB_PORT']     ?? '3306';
$dbName = $env['DB_DATABASE'] ?? '';
$dbUser = $env['DB_USERNAME'] ?? '';
$dbPass = $env['DB_PASSWORD'] ?? '';

echo "Database : {$dbName}\n";
echo "Host     : {$dbHost}\n";
echo "==========================================\n\n";

// ── Connect ────────────────────────────────────────────────────────────────
try {
    $pdo = new PDO(
        "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ Database connection successful\n\n";
} catch (PDOException $e) {
    die("❌ Connection failed: " . $e->getMessage() . "\n");
}

// ── Count ads to be updated ────────────────────────────────────────────────
$countStmt = $pdo->query("SELECT COUNT(*) FROM ads WHERE status = 'pending_approval'");
$pendingCount = (int) $countStmt->fetchColumn();

echo "Found {$pendingCount} ads with status 'pending_approval'.\n\n";

if ($pendingCount === 0) {
    echo "✅ Nothing to do — no pending ads found.\n";
} else {
    // ── Update all pending ads to active ──────────────────────────────────
    $updated = $pdo->exec(
        "UPDATE ads SET status = 'active', approved_at = NOW() WHERE status = 'pending_approval'"
    );

    echo "✅ Successfully activated {$updated} ads.\n";
    echo "\nVerifying...\n";

    $verifyStmt = $pdo->query("SELECT COUNT(*) FROM ads WHERE status = 'active'");
    $activeCount = (int) $verifyStmt->fetchColumn();
    echo "Total active ads now: {$activeCount}\n";
}

echo "\n==========================================\n";
echo "Done!\n";
echo "==========================================\n\n";
echo "⚠️  DELETE THIS FILE from the server now!\n";
echo "</pre>";
?>
