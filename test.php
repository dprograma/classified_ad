<?php
// Test Basic PHP Error Reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>PHP Test Script</h1>";

// Test 1: Check PHP Version
echo "<h2>PHP Version</h2>";
echo "<p>Current PHP Version: " . phpversion() . "</p>";

// Test 2: Check File Path Access
echo "<h2>File Access Test</h2>";
$autoload_path = __DIR__.'/../eunixmac_api/vendor/autoload.php';
echo "<p>Checking for file: " . $autoload_path . "</p>";

if (file_exists($autoload_path)) {
    echo "<p style='color:green;'>SUCCESS: The autoload.php file was found.</p>";
} else {
    echo "<p style='color:red;'>FAILURE: The autoload.php file could NOT be found. Check your paths and permissions.</p>";
}

// Test 3: Check open_basedir restriction
echo "<h2>open_basedir Test</h2>";
$open_basedir = ini_get('open_basedir');
if ($open_basedir) {
    echo "<p><strong>Warning:</strong> `open_basedir` is enabled: " . $open_basedir . "</p>";
    echo "<p>This can prevent PHP from accessing files outside of the specified directories. Make sure your `eunixmac_api` directory is included or accessible.</p>";
} else {
    echo "<p style='color:green;'>`open_basedir` is not set. This is good.</p>";
}

echo "<hr>";

// Test 4: Display Full PHP Info
echo "<h2>PHP Info</h2>";
phpinfo();
