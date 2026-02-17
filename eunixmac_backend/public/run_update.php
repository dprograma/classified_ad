<?php

/**
 * ONE-TIME DATABASE UPDATE SCRIPT
 * ---------------------------------
 * Purpose : Updates all books with location = 'N/A' to 'Digital Product'
 * Usage   : Upload this file to your server's /public directory,
 *           visit https://yourdomain.com/run_update.php in your browser,
 *           then DELETE this file immediately after it runs successfully.
 *
 * SECURITY WARNING: Delete this file from the server after use!
 */

// ----------------------------------------------------------------
// SECURITY TOKEN - Change this to any secret word before uploading
// Then visit: https://yourdomain.com/run_update.php?token=YOUR_SECRET
// ----------------------------------------------------------------
define('SECRET_TOKEN', 'eunixmac_update_2026');

// Validate token before doing anything
if (!isset($_GET['token']) || $_GET['token'] !== SECRET_TOKEN) {
    http_response_code(403);
    die('403 Forbidden - Invalid or missing token.');
}

// ----------------------------------------------------------------
// Load Laravel's database config from the .env file
// ----------------------------------------------------------------
$envPath = '/home/eunixmac/eunixmac_api/.env';

if (!file_exists($envPath)) {
    die('ERROR: .env file not found at ' . $envPath);
}

// Parse .env file
$env = [];
$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') === false) continue;
    [$key, $value] = explode('=', $line, 2);
    $env[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
}

$host     = $env['DB_HOST']     ?? '127.0.0.1';
$port     = $env['DB_PORT']     ?? '3306';
$database = $env['DB_DATABASE'] ?? '';
$username = $env['DB_USERNAME'] ?? '';
$password = $env['DB_PASSWORD'] ?? '';

// ----------------------------------------------------------------
// Connect to the database
// ----------------------------------------------------------------
try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die('DATABASE CONNECTION FAILED: ' . $e->getMessage());
}

// ----------------------------------------------------------------
// Run the update
// ----------------------------------------------------------------
$bookCategoryIds = [83, 84, 85, 86]; // Books, Past Questions, Ebooks, Publications
$placeholders    = implode(',', array_fill(0, count($bookCategoryIds), '?'));

// Preview how many rows will be affected
$countStmt = $pdo->prepare(
    "SELECT COUNT(*) FROM ads WHERE category_id IN ({$placeholders}) AND location = 'N/A'"
);
$countStmt->execute($bookCategoryIds);
$rowsToUpdate = $countStmt->fetchColumn();

// Run the actual update
$updateStmt = $pdo->prepare(
    "UPDATE ads SET location = 'Digital Product' WHERE category_id IN ({$placeholders}) AND location = 'N/A'"
);
$updateStmt->execute($bookCategoryIds);
$rowsUpdated = $updateStmt->rowCount();

// ----------------------------------------------------------------
// Record that this migration has been run in the migrations table
// ----------------------------------------------------------------
$migrationName = '2026_02_17_064839_update_books_location_from_na_to_digital_product';
$alreadyLogged = false;

try {
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM migrations WHERE migration = ?");
    $checkStmt->execute([$migrationName]);
    $alreadyLogged = $checkStmt->fetchColumn() > 0;

    if (!$alreadyLogged) {
        // Get the current max batch number
        $batchStmt = $pdo->query("SELECT MAX(batch) FROM migrations");
        $maxBatch  = (int) $batchStmt->fetchColumn();
        $nextBatch = $maxBatch + 1;

        $insertStmt = $pdo->prepare(
            "INSERT INTO migrations (migration, batch) VALUES (?, ?)"
        );
        $insertStmt->execute([$migrationName, $nextBatch]);
    }
} catch (PDOException $e) {
    // Non-fatal — migrations table logging failed but the data update succeeded
}

// ----------------------------------------------------------------
// Output result
// ----------------------------------------------------------------
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Database Update Result</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 60px auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 6px; }
        .info    { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 6px; margin-top: 15px; }
        .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 6px; margin-top: 15px; }
        h2 { margin-top: 0; }
    </style>
</head>
<body>

    <div class="success">
        <h2>✅ Update Successful</h2>
        <p><strong>Rows found with N/A:</strong> <?= $rowsToUpdate ?></p>
        <p><strong>Rows updated to "Digital Product":</strong> <?= $rowsUpdated ?></p>
        <p><strong>Migration logged:</strong> <?= $alreadyLogged ? 'Already recorded' : 'Recorded in migrations table' ?></p>
    </div>

    <div class="info">
        <strong>ℹ️ What was updated:</strong><br>
        All books (Past Questions, Ebooks, Publications) with <code>location = 'N/A'</code>
        have been updated to <code>location = 'Digital Product'</code>.
    </div>

    <div class="warning">
        <strong>⚠️ IMPORTANT — Delete this file now!</strong><br>
        For security, immediately delete <code>run_update.php</code> from your server's
        <code>/public</code> directory. This script should never be left on a live server.
    </div>

</body>
</html>
