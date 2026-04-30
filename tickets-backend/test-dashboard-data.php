<?php
declare(strict_types=1);

/**
 * PHP-PRO Dashboard Data Diagnostic Tool
 * 
 * Tests database connection and data fetching without JWT
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

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    // Test basic query
    $query = "SELECT COUNT(*) as total FROM Service_Request";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // Test recent tickets
    $query = "
        SELECT 
            sr.ID_Service_Request,
            sr.Ticket_Code,
            sr.Subject,
            sr.System_Priority,
            sr.Status,
            sr.Created_at,
            o.Name_Office as Office_Name
        FROM Service_Request sr
        LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
        ORDER BY sr.Created_at DESC
        LIMIT 5
    ";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $recentTickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Test technicians
    $query = "
        SELECT 
            t.ID_Technicians,
            CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
            t.Status
        FROM Technicians t
        LIMIT 5
    ";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => [
            'total_tickets' => $result['total'] ?? 0,
            'recent_tickets' => $recentTickets,
            'technicians' => $technicians
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
