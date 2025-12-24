<?php
/**
 * Check API Response - See what image URLs the backend is returning
 */

if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    die('This script should only be run on production server!');
}

echo "<h2>API Response Checker</h2>";
echo "<pre>";

$apiUrl = 'https://eunixma.com.ng/api/ads?sort_by=created_at&sort_order=desc&limit=3';

echo "Fetching: {$apiUrl}\n";
echo "==========================================\n\n";

// Fetch the API response
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For testing only
curl_setopt($ch, CURLOPT_HEADER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n\n";

if ($httpCode === 200 && $response) {
    $data = json_decode($response, true);

    if (isset($data['data']) && is_array($data['data'])) {
        echo "Found " . count($data['data']) . " ads\n\n";

        foreach ($data['data'] as $index => $ad) {
            echo "Ad #{$ad['id']}: {$ad['title']}\n";
            echo "-------------------------------------------\n";

            // Check preview_image
            if (isset($ad['preview_image'])) {
                echo "preview_image: {$ad['preview_image']}\n";

                // Check if it's a localhost URL
                if (strpos($ad['preview_image'], 'localhost') !== false) {
                    echo "❌ WARNING: Contains 'localhost' - needs fixing!\n";
                } else {
                    echo "✅ OK\n";
                }
            } else {
                echo "preview_image: NOT SET\n";
            }

            // Check images array
            if (isset($ad['images']) && is_array($ad['images'])) {
                echo "images count: " . count($ad['images']) . "\n";
                foreach ($ad['images'] as $img) {
                    if (isset($img['image_path'])) {
                        echo "  - image_path: {$img['image_path']}\n";
                    }
                }
            } else {
                echo "images: NOT SET or EMPTY\n";
            }

            echo "\n";
        }
    } else {
        echo "No ads found in response\n";
        echo "Response structure:\n";
        print_r($data);
    }
} else {
    echo "Failed to fetch API or got error\n";
    echo "Response: {$response}\n";
}

echo "\n";
echo "==========================================\n";
echo "Checking ad detail endpoint...\n";
echo "==========================================\n\n";

$detailUrl = 'https://eunixma.com.ng/api/ads/51';
echo "Fetching: {$detailUrl}\n\n";

$ch = curl_init($detailUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HEADER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: {$httpCode}\n\n";

if ($httpCode === 200 && $response) {
    $ad = json_decode($response, true);

    echo "Ad #{$ad['id']}: {$ad['title']}\n";
    echo "-------------------------------------------\n";

    if (isset($ad['preview_image'])) {
        echo "preview_image: {$ad['preview_image']}\n";
        if (strpos($ad['preview_image'], 'localhost') !== false) {
            echo "❌ WARNING: Contains 'localhost'\n";
        }
    }

    if (isset($ad['images']) && is_array($ad['images'])) {
        echo "\nimages array (" . count($ad['images']) . " total):\n";
        foreach ($ad['images'] as $img) {
            echo "  - ID: {$img['id']}\n";
            echo "    path: {$img['image_path']}\n";
            echo "    is_preview: " . ($img['is_preview'] ? 'YES' : 'NO') . "\n";

            // Check if path contains localhost
            if (strpos($img['image_path'], 'localhost') !== false) {
                echo "    ❌ Contains 'localhost'\n";
            }
            echo "\n";
        }
    }
} else {
    echo "Failed to fetch ad detail\n";
    echo "Response: {$response}\n";
}

echo "</pre>";
echo "<p><strong>DELETE THIS FILE after viewing!</strong></p>";
?>
