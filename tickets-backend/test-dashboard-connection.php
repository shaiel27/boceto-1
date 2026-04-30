<?php
declare(strict_types=1);

/**
 * PHP-PRO Dashboard Connection Diagnostic Tool
 * 
 * This script tests the backend connection without JWT authentication
 * to isolate whether the issue is with authentication or data fetching.
 */

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

echo json_encode([
    'success' => true,
    'message' => 'Backend diagnostic tool running',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
]);
exit;
