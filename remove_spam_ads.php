<?php
/**
 * Spam Ad Finder & Remover
 *
 * Scans the `ads` table for listings that look like spam (excessive emojis,
 * excessive repeated characters like "!!!!!!" or "aaaaaa", and/or an optional
 * keyword list) and lets you review them before deleting anything.
 *
 * INSTRUCTIONS:
 *   1. Upload this file to your public_html directory on the server.
 *   2. (Recommended) Change $secretToken below to your own value first.
 *   3. DRY RUN (shows matches, deletes nothing):
 *        https://eunixma.com.ng/remove_spam_ads.php?token=YOUR_TOKEN
 *   4. Review the listed ads carefully.
 *   5. DELETE FOR REAL once you're sure, by adding &confirm=yes:
 *        https://eunixma.com.ng/remove_spam_ads.php?token=YOUR_TOKEN&confirm=yes
 *   6. DELETE THIS FILE immediately after running it.
 *
 * OPTIONAL QUERY PARAMS (all combinable):
 *   ids=1,2,3        Only consider these specific ad IDs (bypasses the
 *                     pattern matching below; use this if you've already
 *                     identified the spam ads by hand).
 *   user_id=5        Only consider ads posted by this user.
 *   keywords=foo,bar Also flag ads whose title/description contains any of
 *                     these words/phrases (case-insensitive).
 *   min_emojis=3     Flag ads with more than this many emoji characters in
 *                     the title or description. Default: 3.
 *   min_repeat=4     Flag ads with a character repeated more than this many
 *                     times in a row (e.g. "!!!!!"). Default: 4.
 *   max=500          Safety cap on how many ads can be deleted in one run.
 *                     Default: 500.
 *   confirm=yes      Actually delete the matches. Without this, the script
 *                     only lists what WOULD be deleted.
 */

// ── Security token ─────────────────────────────────────────────────────────
$secretToken = 'eunixma_spam_cleanup_2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secretToken) {
    http_response_code(403);
    die('<h2>403 Forbidden</h2><p>Provide the correct token to run this script.</p>');
}

// ── Laravel root on the production server ──────────────────────────────────
$laravelRoot = '/home/eunixmac/eunixmac_api';

echo "<h2>Spam Ad Finder & Remover</h2>";
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

// ── Options ────────────────────────────────────────────────────────────────
$confirm   = isset($_GET['confirm']) && $_GET['confirm'] === 'yes';
$minEmojis = isset($_GET['min_emojis']) ? max(0, (int) $_GET['min_emojis']) : 3;
$minRepeat = isset($_GET['min_repeat']) ? max(1, (int) $_GET['min_repeat']) : 4;
$maxDelete = isset($_GET['max']) ? max(1, (int) $_GET['max']) : 500;
$explicitIds = [];
if (isset($_GET['ids'])) {
    $explicitIds = array_values(array_filter(array_map('intval', explode(',', $_GET['ids']))));
}
$userIdFilter = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;
$keywords = [];
if (isset($_GET['keywords'])) {
    $keywords = array_values(array_filter(array_map('trim', explode(',', $_GET['keywords']))));
}

// Same emoji ranges used by App\Rules\NoSpamContent on the backend, so the
// cleanup matches what new submissions are now checked against.
const EMOJI_PATTERN  = '/[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2190}-\x{21FF}\x{2B00}-\x{2BFF}]/u';

function countEmojis(string $text): int
{
    return preg_match_all(EMOJI_PATTERN, $text);
}

function hasRepeatedChars(string $text, int $minRepeat): bool
{
    return (bool) preg_match('/(.)\1{' . $minRepeat . ',}/u', $text);
}

// ── Load candidate ads ───────────────────────────────────────────────────────
if (!empty($explicitIds)) {
    $placeholders = implode(',', array_fill(0, count($explicitIds), '?'));
    $stmt = $pdo->prepare("SELECT ads.*, users.name AS user_name, users.email AS user_email
                            FROM ads JOIN users ON users.id = ads.user_id
                            WHERE ads.id IN ($placeholders)");
    $stmt->execute($explicitIds);
    $candidates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Mode: explicit ID list (" . count($explicitIds) . " requested)\n\n";
} else {
    $sql = "SELECT ads.*, users.name AS user_name, users.email AS user_email
            FROM ads JOIN users ON users.id = ads.user_id WHERE 1=1";
    $params = [];
    if ($userIdFilter) {
        $sql .= " AND ads.user_id = ?";
        $params[] = $userIdFilter;
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $allAds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Scanning " . count($allAds) . " ads"
        . ($userIdFilter ? " for user_id={$userIdFilter}" : '')
        . " with: min_emojis={$minEmojis}, min_repeat={$minRepeat}"
        . (!empty($keywords) ? ', keywords=' . implode('|', $keywords) : '')
        . "\n\n";

    $candidates = [];
    foreach ($allAds as $ad) {
        $text = ($ad['title'] ?? '') . ' ' . ($ad['description'] ?? '');
        $emojiCount = countEmojis($text);
        $repeated = hasRepeatedChars($text, $minRepeat);
        $keywordHit = false;
        foreach ($keywords as $kw) {
            if ($kw !== '' && stripos($text, $kw) !== false) {
                $keywordHit = true;
                break;
            }
        }

        if ($emojiCount > $minEmojis || $repeated || $keywordHit) {
            $ad['_emoji_count'] = $emojiCount;
            $ad['_repeated'] = $repeated;
            $ad['_keyword_hit'] = $keywordHit;
            $candidates[] = $ad;
        }
    }
}

// ── Report matches ──────────────────────────────────────────────────────────
echo "Found " . count($candidates) . " matching ad(s).\n";
echo "==========================================\n\n";

foreach ($candidates as $ad) {
    $titleSnippet = mb_substr($ad['title'] ?? '', 0, 60);
    echo sprintf(
        "#%d | user: %s <%s> | emojis=%s repeat=%s kw=%s | created: %s\n     %s\n\n",
        $ad['id'],
        $ad['user_name'] ?? 'unknown',
        $ad['user_email'] ?? 'unknown',
        $ad['_emoji_count'] ?? 'n/a',
        ($ad['_repeated'] ?? false) ? 'yes' : 'no',
        ($ad['_keyword_hit'] ?? false) ? 'yes' : 'no',
        $ad['created_at'],
        $titleSnippet
    );
}

if (empty($candidates)) {
    echo "✅ Nothing matched — nothing to delete.\n";
    echo "</pre>";
    exit;
}

if (!$confirm) {
    echo "==========================================\n";
    echo "This was a DRY RUN. No data was deleted.\n";
    echo "Review the list above carefully, then re-run with &confirm=yes to delete these ads for real.\n";
    echo "</pre>";
    exit;
}

// ── Delete for real ──────────────────────────────────────────────────────────
if (count($candidates) > $maxDelete) {
    echo "❌ Refusing to delete: " . count($candidates) . " matches exceeds the safety cap of {$maxDelete}.\n";
    echo "   Narrow your filters, or raise the cap explicitly with &max=" . count($candidates) . " if you're sure.\n";
    echo "</pre>";
    exit;
}

echo "==========================================\n";
echo "Deleting " . count($candidates) . " ad(s) and their related rows...\n\n";

$deletedCount = 0;
$filesRemoved = 0;

foreach ($candidates as $ad) {
    $adId = $ad['id'];
    try {
        $pdo->beginTransaction();

        // Remove image files from disk before deleting the DB rows.
        $imgStmt = $pdo->prepare("SELECT image_path FROM ad_images WHERE ad_id = ?");
        $imgStmt->execute([$adId]);
        foreach ($imgStmt->fetchAll(PDO::FETCH_COLUMN) as $imagePath) {
            $fullPath = $laravelRoot . '/storage/app/public/' . $imagePath;
            if ($imagePath && file_exists($fullPath)) {
                @unlink($fullPath);
                $filesRemoved++;
            }
        }

        // Child tables have no ON DELETE CASCADE, so clear them manually
        // in dependency order before removing the ad itself.
        $pdo->prepare("DELETE FROM ad_images WHERE ad_id = ?")->execute([$adId]);
        $pdo->prepare("DELETE FROM ad_custom_fields WHERE ad_id = ?")->execute([$adId]);
        $pdo->prepare("DELETE FROM messages WHERE ad_id = ?")->execute([$adId]);
        $pdo->prepare("DELETE FROM reviews WHERE ad_id = ?")->execute([$adId]);
        $pdo->prepare("DELETE FROM ad_views WHERE ad_id = ?")->execute([$adId]);
        $pdo->prepare("DELETE FROM ads WHERE id = ?")->execute([$adId]);

        $pdo->commit();
        $deletedCount++;
        echo "✅ Deleted ad #{$adId}\n";
    } catch (Exception $e) {
        $pdo->rollBack();
        echo "❌ Failed to delete ad #{$adId}: " . $e->getMessage() . "\n";
    }
}

echo "\n==========================================\n";
echo "Done! Deleted {$deletedCount}/" . count($candidates) . " ads, removed {$filesRemoved} image file(s).\n";
echo "==========================================\n\n";
echo "⚠️  DELETE THIS FILE from the server now!\n";
echo "</pre>";
