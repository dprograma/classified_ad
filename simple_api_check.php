<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Simple API Check</h2>";
echo "<pre>";

echo "Step 1: Testing API connection...\n";

$apiUrl = 'https://eunixma.com.ng/api/ads/51';
echo "Fetching: {$apiUrl}\n\n";

$context = stream_context_create([
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ],
]);

$response = @file_get_contents($apiUrl, false, $context);

if ($response === false) {
    echo "❌ Failed to fetch API\n";
    $error = error_get_last();
    echo "Error: " . ($error['message'] ?? 'Unknown error') . "\n";
} else {
    echo "✅ API response received\n\n";

    $data = json_decode($response, true);

    if ($data) {
        echo "Step 2: Checking image URLs...\n";
        echo "==========================================\n\n";

        echo "preview_image field:\n";
        if (isset($data['preview_image'])) {
            echo $data['preview_image'] . "\n\n";

            // Check if contains localhost
            if (strpos($data['preview_image'], 'localhost') !== false) {
                echo "❌ Still using localhost!\n\n";
            } elseif (strpos($data['preview_image'], 'eunixma.com.ng') !== false) {
                echo "✅ Using correct domain!\n\n";
            } else {
                echo "⚠️ Using different domain\n\n";
            }
        } else {
            echo "❌ No preview_image field\n\n";
        }

        echo "images array:\n";
        if (isset($data['images']) && is_array($data['images'])) {
            echo "Found " . count($data['images']) . " images:\n";
            foreach ($data['images'] as $img) {
                echo "  - " . $img['image_path'] . "\n";
            }
        } else {
            echo "❌ No images array\n";
        }
    } else {
        echo "❌ Failed to parse JSON\n";
        echo "Response: " . substr($response, 0, 500) . "\n";
    }
}

echo "\n==========================================\n";
echo "Step 3: Test direct image access...\n";
echo "==========================================\n\n";

$testImageUrl = 'https://eunixma.com.ng/storage/ads/1765552635_693c31fb78d01.jpg';
echo "Testing: {$testImageUrl}\n";

$headers = @get_headers($testImageUrl);
if ($headers) {
    echo "Response: {$headers[0]}\n";

    if (strpos($headers[0], '200') !== false) {
        echo "✅ Image accessible!\n";
    } else {
        echo "❌ Image not accessible!\n";
    }
} else {
    echo "❌ Could not check image\n";
}

echo "\n</pre>";
echo "<p><strong>DELETE THIS FILE!</strong></p>";
?>
