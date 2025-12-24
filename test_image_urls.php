<?php
/**
 * Test What URLs the API Returns and If They Work
 */

echo "<h2>Image URL Tester</h2>";
echo "<pre>";

// Fetch API response
$apiUrl = 'https://eunixma.com.ng/api/ads/51';
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $ad = json_decode($response, true);

    echo "Ad ID: {$ad['id']} - {$ad['title']}\n";
    echo "==========================================\n\n";

    // Check preview_image
    echo "1. Testing preview_image field:\n";
    echo "   URL: {$ad['preview_image']}\n";

    // Try to fetch the image
    $ch = curl_init($ad['preview_image']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_exec($ch);
    $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($imageHttpCode === 200) {
        echo "   ✅ Status: {$imageHttpCode} - Image loads successfully!\n\n";
    } else {
        echo "   ❌ Status: {$imageHttpCode} - Image FAILED to load!\n";
        if ($imageHttpCode === 404) {
            echo "   Reason: Image file not found (404)\n";
        } elseif ($imageHttpCode === 403) {
            echo "   Reason: Access forbidden (403)\n";
        } elseif ($imageHttpCode === 500) {
            echo "   Reason: Server error (500)\n";
        }
        echo "\n";
    }

    // Check images array
    echo "2. Testing images array:\n";
    foreach ($ad['images'] as $index => $img) {
        $imagePath = $img['image_path'];

        // Build full URL
        $fullUrl = "https://eunixma.com.ng/storage/{$imagePath}";

        echo "   Image #{$index + 1}:\n";
        echo "   - DB path: {$imagePath}\n";
        echo "   - Full URL: {$fullUrl}\n";

        // Test the URL
        $ch = curl_init($fullUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch);
        $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($imageHttpCode === 200) {
            echo "   - Status: ✅ {$imageHttpCode} - Works!\n\n";
        } else {
            echo "   - Status: ❌ {$imageHttpCode} - Failed!\n\n";
        }
    }

    echo "==========================================\n";
    echo "3. Testing direct proxy access:\n";
    $testUrl = "https://eunixma.com.ng/storage/ads/1765552635_693c31fb78d01.jpg";
    echo "   URL: {$testUrl}\n";

    $ch = curl_init($testUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_exec($ch);
    $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($imageHttpCode === 200) {
        echo "   ✅ Status: {$imageHttpCode} - Proxy works!\n";
    } else {
        echo "   ❌ Status: {$imageHttpCode} - Proxy failed!\n";
    }

} else {
    echo "Failed to fetch API\n";
    echo "HTTP Status: {$httpCode}\n";
}

echo "\n</pre>";
echo "<p><strong>DELETE THIS FILE!</strong></p>";
?>
