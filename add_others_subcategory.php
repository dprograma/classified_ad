<?php
/**
 * Add "Others" Sub-category to All Parent Categories
 *
 * INSTRUCTIONS:
 *   1. Upload this file to your public_html directory on the server.
 *   2. Visit: https://eunixma.com.ng/add_others_subcategory.php?token=eunixma2026
 *   3. Confirm the output shows all categories updated successfully.
 *   4. DELETE THIS FILE immediately after running it.
 */

// ── Security token ────────────────────────────────────────────────────────────
$secretToken = 'eunixma2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2><p>Provide the correct token to run this script.</p>');
}

// ── Laravel root on the production server ─────────────────────────────────────
$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Add \"Others\" Sub-category — Migration Script</h2>";
echo "<pre>";

// ── Read .env ─────────────────────────────────────────────────────────────────
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

// ── Connect ───────────────────────────────────────────────────────────────────
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

// ── Fetch all parent categories ───────────────────────────────────────────────
$parents = $pdo->query("SELECT id, name FROM categories WHERE parent_id IS NULL ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);

if (empty($parents)) {
    die("❌ No parent categories found. Is the categories table populated?\n");
}

echo "Found " . count($parents) . " parent categories.\n";
echo "==========================================\n\n";

$inserted = 0;
$skipped  = 0;

$checkStmt  = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE parent_id = :pid AND name = 'Others'");
$insertStmt = $pdo->prepare("INSERT INTO categories (name, parent_id, created_at, updated_at) VALUES ('Others', :pid, NOW(), NOW())");

foreach ($parents as $parent) {
    $checkStmt->execute([':pid' => $parent['id']]);
    $exists = (int) $checkStmt->fetchColumn();

    if ($exists) {
        echo "⏭  Skipped  [{$parent['id']}] {$parent['name']}  — 'Others' already exists\n";
        $skipped++;
    } else {
        $insertStmt->execute([':pid' => $parent['id']]);
        echo "✅ Added    [{$parent['id']}] {$parent['name']}  — 'Others' inserted\n";
        $inserted++;
    }
}

echo "\n==========================================\n";
echo "Done! Inserted: {$inserted}  |  Skipped (already existed): {$skipped}\n";
echo "==========================================\n\n";
echo "⚠️  DELETE THIS FILE from the server now!\n";
echo "</pre>";
?>
