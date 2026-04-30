<?php
declare(strict_types=1);

/**
 * Simple web endpoint test without authentication
 * To verify the dashboard endpoint works via web server
 */

// CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/Controllers/AdminDashboardController.php';

try {
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
        'message' => 'Web endpoint test successful',
        'data' => $fullData
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
