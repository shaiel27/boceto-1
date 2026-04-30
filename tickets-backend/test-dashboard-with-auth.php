<?php
declare(strict_types=1);

/**
 * PHP-PRO Dashboard Authentication Diagnostic Tool
 * 
 * Tests JWT authentication flow for dashboard
 */

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/src/Services/JwtService.php';
require_once __DIR__ . '/src/Middleware/AuthMiddleware.php';

$jwtSecret = getenv('JWT_SECRET');
if (empty($jwtSecret)) {
    $jwtSecret = 'your-secret-key-change-in-production-min-32-chars';
}

$jwtService = new App\Services\JwtService($jwtSecret);
$authMiddleware = new App\Middleware\AuthMiddleware($jwtService);

// Check if token is provided
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = null;

if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
}

echo json_encode([
    'success' => true,
    'message' => 'Auth diagnostic tool',
    'timestamp' => date('Y-m-d H:i:s'),
    'auth_header_provided' => !empty($authHeader),
    'token_extracted' => !empty($token),
    'token_preview' => $token ? substr($token, 0, 30) . '...' : 'none',
    'test_token_validation' => $token ? $jwtService->validateToken($token) : 'No token to validate'
]);
exit;
