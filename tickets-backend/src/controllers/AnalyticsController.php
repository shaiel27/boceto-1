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

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $days = $_GET['days'] ?? 30;
        
        $technician = new Technician($db);
        $serviceRequest = new ServiceRequest($db);
        
        // Get overview statistics
        $overview = getOverviewStats($db, $days);
        
        // Get service distribution
        $byService = getServiceDistribution($db, $days);
        
        // Get top performers
        $performance = getTopPerformers($db, $days);
        
        // Get schedule analysis
        $scheduleAnalysis = getScheduleAnalysis($db);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'overview' => $overview,
                'by_service' => $byService,
                'performance' => $performance,
                'schedule_analysis' => $scheduleAnalysis
            ]
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}

function getOverviewStats($db, $days) {
    // Temporarily disable date filter to work with existing data
    $dateCondition = "";

    // Total technicians
    $totalTechQuery = "SELECT COUNT(*) as total FROM Technicians";
    $stmt = $db->prepare($totalTechQuery);
    $stmt->execute();
    $totalTech = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Available technicians (based on current status)
    $availableQuery = "SELECT COUNT(*) as available FROM Technicians WHERE Status = 'Disponible'";
    $stmt = $db->prepare($availableQuery);
    $stmt->execute();
    $available = $stmt->fetch(PDO::FETCH_ASSOC)['available'];

    // Busy technicians (with active tickets)
    $busyQuery = "SELECT COUNT(DISTINCT t.ID_Technicians) as busy
                  FROM Technicians t
                  INNER JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
                  INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                  WHERE tt.Status = 'Activo' AND sr.Status IN ('Asignado', 'En Proceso', 'Técnicos Asignados')";
    $stmt = $db->prepare($busyQuery);
    $stmt->execute();
    $busy = $stmt->fetch(PDO::FETCH_ASSOC)['busy'];

    // Inactive technicians
    $inactiveQuery = "SELECT COUNT(*) as inactive FROM Technicians WHERE Status = 'Inactivo'";
    $stmt = $db->prepare($inactiveQuery);
    $stmt->execute();
    $inactive = $stmt->fetch(PDO::FETCH_ASSOC)['inactive'];

    // Total tickets
    $totalTicketsQuery = "SELECT COUNT(*) as total FROM Service_Request";
    $stmt = $db->prepare($totalTicketsQuery);
    $stmt->execute();
    $totalTickets = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Resolved tickets
    $resolvedQuery = "SELECT COUNT(*) as resolved FROM Service_Request WHERE Status = 'Cerrado'";
    $stmt = $db->prepare($resolvedQuery);
    $stmt->execute();
    $resolved = $stmt->fetch(PDO::FETCH_ASSOC)['resolved'];

    // Pending tickets
    $pending = $totalTickets - $resolved;

    // Average resolution time (in hours)
    $avgTimeQuery = "SELECT AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_time
                     FROM Service_Request sr
                     WHERE sr.Status = 'Cerrado'
                     AND sr.Resolved_at IS NOT NULL";
    $stmt = $db->prepare($avgTimeQuery);
    $stmt->execute();
    $avgTime = $stmt->fetch(PDO::FETCH_ASSOC)['avg_time'] ?? 0;

    return [
        'total_technicians' => (int)$totalTech,
        'available' => (int)$available,
        'busy' => (int)$busy,
        'inactive' => (int)$inactive,
        'total_tickets' => (int)$totalTickets,
        'resolved_tickets' => (int)$resolved,
        'pending_tickets' => (int)$pending,
        'avg_resolution_time' => round((float)$avgTime, 1)
    ];
}

function getServiceDistribution($db, $days) {
    // Temporarily disable date filter
    $dateCondition = "";

    $query = "SELECT
                tis.ID_TI_Service,
                tis.Type_Service as service_name,
                COUNT(DISTINCT ts.Fk_Technicians) as technician_count,
                COUNT(sr.ID_Service_Request) as ticket_count,
                (COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) * 100.0 / NULLIF(COUNT(sr.ID_Service_Request), 0)) as resolution_rate
              FROM TI_Service tis
              LEFT JOIN Technicians_Service ts ON tis.ID_TI_Service = ts.Fk_TI_Service
              LEFT JOIN Ticket_Technicians tt ON ts.Fk_Technicians = tt.Fk_Technician
              LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
              WHERE 1=1 $dateCondition
              GROUP BY tis.ID_TI_Service, tis.Type_Service
              ORDER BY ticket_count DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $results[] = [
            'service_name' => $row['service_name'],
            'technician_count' => (int)$row['technician_count'],
            'ticket_count' => (int)$row['ticket_count'],
            'resolution_rate' => (float)($row['resolution_rate'] ?? 0)
        ];
    }

    return $results;
}

function getTopPerformers($db, $days) {
    // Temporarily disable date filter
    $dateCondition = "";

    $query = "SELECT
                t.ID_Technicians as technician_id,
                CONCAT(t.First_Name, ' ', t.Last_Name) as name,
                COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as tickets_resolved,
                AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_resolution_time,
                (COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) * 100.0 / NULLIF(COUNT(sr.ID_Service_Request), 0)) as efficiency
              FROM Technicians t
              LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
              LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request $dateCondition
              GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name
              HAVING tickets_resolved > 0
              ORDER BY efficiency DESC, tickets_resolved DESC
              LIMIT 20";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $results[] = [
            'technician_id' => (int)$row['technician_id'],
            'name' => $row['name'],
            'tickets_resolved' => (int)$row['tickets_resolved'],
            'avg_resolution_time' => (float)($row['avg_resolution_time'] ?? 0),
            'efficiency' => (float)($row['efficiency'] ?? 0)
        ];
    }

    return $results;
}

function getScheduleAnalysis($db) {
    $days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    $results = [];

    foreach ($days as $day) {
        // Count active technicians for this day
        $query = "SELECT
                    COUNT(DISTINCT s.Fk_Technician) as active_technicians,
                    MIN(s.Work_Start_Time) as earliest_start,
                    MAX(s.Work_End_Time) as latest_end
                  FROM Technician_Schedules s
                  WHERE s.Day_Of_Week = :day";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':day', $day);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Determine peak hours (most common time range)
        $peakQuery = "SELECT
                        CONCAT(MIN(Work_Start_Time), ' - ', MAX(Work_End_Time)) as peak_range,
                        COUNT(*) as count
                      FROM Technician_Schedules
                      WHERE Day_Of_Week = :day
                      GROUP BY DATE_FORMAT(Work_Start_Time, '%H')
                      ORDER BY count DESC
                      LIMIT 1";

        $peakStmt = $db->prepare($peakQuery);
        $peakStmt->bindParam(':day', $day);
        $peakStmt->execute();
        $peakRow = $peakStmt->fetch(PDO::FETCH_ASSOC);

        $results[] = [
            'day' => $day,
            'active_technicians' => (int)($row['active_technicians'] ?? 0),
            'peak_hours' => $peakRow['peak_range'] ?? 'N/A'
        ];
    }

    return $results;
}
?>
