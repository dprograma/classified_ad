<?php
/**
 * Storage Proxy - Serves files from storage directory
 * Place this in: /home/eunixmac/public_html/storage/index.php
 */

// Get the requested file path
$requestUri = $_SERVER['REQUEST_URI'];

// Extract the path after /storage/
if (preg_match('#^/storage/(.+)$#', $requestUri, $matches)) {
    $filePath = $matches[1];
} else {
    http_response_code(404);
    die('File not found');
}

// Security check - prevent directory traversal attacks
if (strpos($filePath, '..') !== false || strpos($filePath, './') !== false) {
    http_response_code(403);
    die('Access denied - invalid path');
}

// Build the full path to the file
$storagePath = '/home/eunixmac/eunixmac_api/storage/app/public';
$fullPath = $storagePath . '/' . $filePath;

// Check if file exists
if (!file_exists($fullPath) || !is_file($fullPath)) {
    http_response_code(404);
    die('File not found');
}

// Get mime type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $fullPath);
finfo_close($finfo);

// Set headers
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($fullPath));
header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');

// Output the file
readfile($fullPath);
exit;
