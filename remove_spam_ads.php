<?php
/**
 * Remove spam ads from the database
 *
 * Targets ads matching known spam patterns:
 *  - Nigerian phone numbers embedded in title
 *  - Phone/call emojis (☎️ etc.) in title or description
 *  - Admission / UTME / "form is out" promotional keywords
 *
 * INSTRUCTIONS:
 *   1. Upload to public_html on the server.
 *   2. Visit: https://eunixma.com.ng/remove_spam_ads.php?token=eunixma2026
 *   3. First run shows a DRY RUN preview — no changes made.
 *   4. Add &confirm=yes to actually delete: ?token=eunixma2026&confirm=yes
 *   5. DELETE THIS FILE immediately after.
 */

$secretToken = 'eunixma2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2>');
}

$dryRun = !(isset($_GET['confirm']) && $_GET['confirm'] === 'yes');
$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Remove Spam Ads</h2>";
echo $dryRun
    ? "<p style='color:orange'><strong>DRY RUN</strong> — no changes made. Add <code>&confirm=yes</code> to actually delete.</p>"
    : "<p style='color:red'><strong>LIVE DELETE MODE</strong></p>";
echo "<pre>";

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

// ── Find spam ads ──────────────────────────────────────────────────────────
// Pattern 1: Nigerian phone number in title (07x / 08x / 09x, 11 digits total)
// Pattern 2: Phone emoji in title or description
// Pattern 3: Admission / UTME keywords
$spamIds = [];

$stmt = $pdo->query("SELECT id, title, description FROM ads WHERE deleted_at IS NULL");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$nigerianPhone  = '/(?:0|\+?234)[789]\d{8}/';
$phoneEmoji     = '/[\x{260E}\x{1F4DE}\x{1F4F1}\x{1F4F2}\x{2706}\x{2121}]/u';
$spamKeywords   = [
    'post utme form',
    'post utme application',
    'admission form is out',
    'application form is out',
    'admission/application form',
];

$found = [];
foreach ($rows as $row) {
    $combined = $row['title'] . ' ' . $row['description'];
    $lower    = mb_strtolower($combined);

    $reason = null;

    if (preg_match($nigerianPhone, $row['title'])) {
        $reason = 'phone number in title';
    } elseif (preg_match($phoneEmoji, $combined)) {
        $reason = 'phone emoji in ad';
    } else {
        foreach ($spamKeywords as $kw) {
            if (str_contains($lower, $kw)) {
                $reason = "keyword: \"$kw\"";
                break;
            }
        }
    }

    if ($reason) {
        $found[] = ['id' => $row['id'], 'title' => mb_substr($row['title'], 0, 100), 'reason' => $reason];
        $spamIds[] = $row['id'];
    }
}

if (empty($found)) {
    echo "✅ No spam ads found matching the patterns.\n";
} else {
    echo "Found " . count($found) . " spam ad(s):\n\n";
    foreach ($found as $item) {
        echo "  ID {$item['id']} — {$item['reason']}\n";
        echo "  Title: {$item['title']}\n\n";
    }

    if (!$dryRun) {
        // Soft-delete (sets deleted_at)
        $ids = implode(',', array_map('intval', $spamIds));
        $now = date('Y-m-d H:i:s');
        $deleted = $pdo->exec("UPDATE ads SET deleted_at = '$now', status = 'rejected' WHERE id IN ($ids)");
        echo "✅ Soft-deleted $deleted ad(s).\n";
        echo "\nAlso cleaning up associated images from ads table reference (images stay on disk — delete manually if needed).\n";
    } else {
        echo "--- DRY RUN: no changes made ---\n";
    }
}

echo "\n==========================================\n";
echo "Done!\n";
echo "==========================================\n\n";
echo "⚠️  DELETE THIS FILE from the server now!\n";
echo "</pre>";
?>
