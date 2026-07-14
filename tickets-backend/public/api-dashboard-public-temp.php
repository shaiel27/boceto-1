<?php
declare(strict_types=1);

// CORS headers - Allow both localhost and network IP
$allowedOrigins = ['http://localhost:3000', 'http://192.168.1.4:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Error handling
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $errstr]);
    exit;
});

require_once __DIR__ . '/../src/config/database.php';
require_once __DIR__ . '/../src/Controllers/AdminDashboardController.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }
    
    $controller = new App\Controllers\AdminDashboardController($db);
    $fullData = $controller->getFullDashboardData();
    
    echo json_encode([
        'success' => true,
        'data' => $fullData
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
