<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Technician.php';
require_once __DIR__ . '/../models/ServiceRequest.php';

$database = new Database();
$db = $database->getConnection();

// Get authenticated user from middleware context
$currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

// Only allow admin access
if ($currentUserRole != 1) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Acceso denegado. Solo administradores pueden acceder a este reporte.'
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $week = $_GET['week'] ?? date('Y-\WW'); // Default to current week
        $technicianId = $_GET['technician_id'] ?? null;
        
        $weeklyData = getWeeklyTechnicianReport($db, $week, $technicianId);
        
        echo json_encode([
            'success' => true,
            'data' => $weeklyData
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}

function getWeeklyTechnicianReport($db, $week, $technicianId = null) {
    // Parse week (format: 2024-W15)
    $year = substr($week, 0, 4);
    $weekNumber = substr($week, 6);
    
    // Calculate start and end dates for the week (Monday to Friday)
    $startDate = date('Y-m-d', strtotime($year . 'W' . $weekNumber . '1')); // Monday
    $endDate = date('Y-m-d', strtotime($year . 'W' . $weekNumber . '5')); // Friday
    
    // Get weekly statistics
    $weeklyStats = getWeeklyStats($db, $startDate, $endDate);
    
    // Get technician data
    $technicianData = getTechnicianWeeklyData($db, $startDate, $endDate, $technicianId);
    
    return [
        'week' => $week,
        'period_start' => $startDate,
        'period_end' => $endDate,
        'stats' => $weeklyStats,
        'technicians' => $technicianData
    ];
}

function getWeeklyStats($db, $startDate, $endDate) {
    // Total tickets in the week (Monday-Friday)
    $totalTicketsQuery = "SELECT COUNT(*) as total 
                         FROM Service_Request 
                         WHERE DATE(Created_at) BETWEEN :start_date AND :end_date
                         AND DAYOFWEEK(Created_at) BETWEEN 2 AND 6"; // Monday=2, Friday=6
    $stmt = $db->prepare($totalTicketsQuery);
    $stmt->bindParam(':start_date', $startDate);
    $stmt->bindParam(':end_date', $endDate);
    $stmt->execute();
    $totalTickets = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Resolved tickets in the week
    $resolvedQuery = "SELECT COUNT(*) as resolved 
                     FROM Service_Request 
                     WHERE Status = 'Cerrado'
                     AND DATE(Created_at) BETWEEN :start_date AND :end_date
                     AND DAYOFWEEK(Created_at) BETWEEN 2 AND 6";
    $stmt = $db->prepare($resolvedQuery);
    $stmt->bindParam(':start_date', $startDate);
    $stmt->bindParam(':end_date', $endDate);
    $stmt->execute();
    $resolved = $stmt->fetch(PDO::FETCH_ASSOC)['resolved'];
    
    // Active technicians in the week
    $activeTechQuery = "SELECT COUNT(DISTINCT t.ID_Technicians) as active
                       FROM Technicians t
                       INNER JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
                       INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                       WHERE DATE(sr.Created_at) BETWEEN :start_date AND :end_date
                       AND DAYOFWEEK(sr.Created_at) BETWEEN 2 AND 6";
    $stmt = $db->prepare($activeTechQuery);
    $stmt->bindParam(':start_date', $startDate);
    $stmt->bindParam(':end_date', $endDate);
    $stmt->execute();
    $activeTech = $stmt->fetch(PDO::FETCH_ASSOC)['active'];
    
    // Resolution rate
    $resolutionRate = $totalTickets > 0 ? (($resolved / $totalTickets) * 100) : 0;
    
    return [
        'total_tickets' => (int)$totalTickets,
        'total_resolved' => (int)$resolved,
        'active_technicians' => (int)$activeTech,
        'resolution_rate' => round((float)$resolutionRate, 1)
    ];
}

function getTechnicianWeeklyData($db, $startDate, $endDate, $technicianId = null) {
    $query = "SELECT
                t.ID_Technicians as id,
                CONCAT(t.First_Name, ' ', t.Last_Name) as nombre,
                COUNT(CASE WHEN sr.Status = 'Cerrado' 
                          AND DAYOFWEEK(sr.Created_at) BETWEEN 2 AND 6
                          THEN 1 END) as tickets_resueltos,
                AVG(CASE WHEN sr.Status = 'Cerrado' 
                         AND DAYOFWEEK(sr.Created_at) BETWEEN 2 AND 6
                         THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                         END) as tiempo_promedio,
                (COUNT(CASE WHEN sr.Status = 'Cerrado' 
                           AND DAYOFWEEK(sr.Created_at) BETWEEN 2 AND 6
                           THEN 1 END) * 100.0 / 
                 NULLIF(COUNT(CASE WHEN DAYOFWEEK(sr.Created_at) BETWEEN 2 AND 6 THEN 1 END), 0)) as eficiencia,
                :week as semana
              FROM Technicians t
              LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
              LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
              WHERE DATE(sr.Created_at) BETWEEN :start_date AND :end_date
              AND DAYOFWEEK(sr.Created_at) BETWEEN 2 AND 6";
    
    if ($technicianId) {
        $query .= " AND t.ID_Technicians = :technician_id";
    }
    
    $query .= " GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name
                HAVING tickets_resueltos > 0
                ORDER BY tickets_resueltos DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':start_date', $startDate);
    $stmt->bindParam(':end_date', $endDate);
    $stmt->bindParam(':week', $week);
    
    if ($technicianId) {
        $stmt->bindParam(':technician_id', $technicianId);
    }
    
    $stmt->execute();
    
    $results = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $results[] = [
            'id' => (int)$row['id'],
            'nombre' => $row['nombre'],
            'tickets_resueltos' => (int)$row['tickets_resueltos'],
            'eficiencia' => round((float)($row['eficiencia'] ?? 0), 1),
            'tiempo_promedio' => round((float)($row['tiempo_promedio'] ?? 0), 1),
            'semana' => $row['semana']
        ];
    }
    
    return $results;
}
?>
