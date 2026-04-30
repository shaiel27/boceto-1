<?php
declare(strict_types=1);

/**
 * Debug endpoint to capture PHP errors and return as JSON
 */

// Enable error reporting
ini_set('display_errors', '1');
error_reporting(E_ALL);

// Capture any PHP errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

try {
    // CORS
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");

    require_once __DIR__ . '/../src/config/database.php';
    require_once __DIR__ . '/../src/Controllers/AdminDashboardController.php';

    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        echo json_encode(['success' => false, 'error' => 'Database connection failed']);
        exit;
    }
    
    $controller = new App\Controllers\AdminDashboardController($db);
    $fullData = $controller->getFullDashboardData();
    
    echo json_encode([
        'success' => true,
        'message' => 'Debug endpoint successful',
        'data' => $fullData
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
