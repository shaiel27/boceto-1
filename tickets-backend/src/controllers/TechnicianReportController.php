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
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'technician-performance') {
            $days = $_GET['days'] ?? 30;
            $technicianId = $_GET['technician_id'] ?? null;
            
            $performance = getTechnicianPerformanceReport($db, $days, $technicianId);
            
            echo json_encode([
                'success' => true,
                'data' => $performance
            ]);
        } elseif ($action === 'technician-workload') {
            $days = $_GET['days'] ?? 7;
            
            $workload = getTechnicianWorkloadReport($db, $days);
            
            echo json_encode([
                'success' => true,
                'data' => $workload
            ]);
        } elseif ($action === 'technician-productivity') {
            $startDate = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            
            $productivity = getTechnicianProductivityReport($db, $startDate, $endDate);
            
            echo json_encode([
                'success' => true,
                'data' => $productivity
            ]);
        } else {
            // Default comprehensive technician report
            $days = $_GET['days'] ?? 30;
            $technicianId = $_GET['technician_id'] ?? null;
            
            $report = getComprehensiveTechnicianReport($db, $days, $technicianId);
            
            echo json_encode([
                'success' => true,
                'data' => $report
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}

function getComprehensiveTechnicianReport($db, $days, $technicianId = null) {
    $dateCondition = "";
    if ($days > 0) {
        $dateCondition = "AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)";
    }
    
    $technicianCondition = "";
    if ($technicianId) {
        $technicianCondition = "AND t.ID_Technicians = " . (int)$technicianId;
    }
    
    // Overview statistics
    $overviewQuery = "SELECT
        COUNT(DISTINCT t.ID_Technicians) as total_technicians,
        COUNT(DISTINCT CASE WHEN t.Status = 'Activo' THEN t.ID_Technicians END) as active_technicians,
        COUNT(DISTINCT CASE WHEN t.Status = 'Inactivo' THEN t.ID_Technicians END) as inactive_technicians,
        COUNT(DISTINCT sr.ID_Service_Request) as total_tickets,
        COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as resolved_tickets,
        AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_resolution_time
    FROM Technicians t
    LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
    LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
    WHERE 1=1 {$technicianCondition} {$dateCondition}";
    
    $stmt = $db->prepare($overviewQuery);
    $stmt->execute();
    $overview = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Individual technician performance
    $performanceQuery = "SELECT
        t.ID_Technicians as technician_id,
        CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
        t.Status as technician_status,
        tis.Type_Service as primary_service,
        COUNT(DISTINCT sr.ID_Service_Request) as total_tickets_assigned,
        COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as tickets_resolved,
        COUNT(DISTINCT CASE WHEN sr.Status = 'En Proceso' THEN sr.ID_Service_Request END) as tickets_in_progress,
        COUNT(DISTINCT CASE WHEN sr.Status = 'Pendiente' THEN sr.ID_Service_Request END) as pending_tickets,
        AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_resolution_time,
        (COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) * 100.0 / 
         NULLIF(COUNT(DISTINCT sr.ID_Service_Request), 0)) as resolution_rate,
        COUNT(DISTINCT CASE WHEN sr.System_Priority = 'Alta' AND sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as high_priority_resolved,
        COUNT(DISTINCT tt.ID_Ticket_Technicians) as total_assignments
    FROM Technicians t
    LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
    LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
    LEFT JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
    LEFT JOIN TI_Service tis ON ts.Fk_TI_Service = tis.ID_TI_Service
    WHERE 1=1 {$technicianCondition} {$dateCondition}
    GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, tis.Type_Service
    ORDER BY tickets_resolved DESC, resolution_rate DESC";
    
    $stmt = $db->prepare($performanceQuery);
    $stmt->execute();
    
    $technicians = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $technicians[] = [
            'technician_id' => (int)$row['technician_id'],
            'technician_name' => $row['technician_name'],
            'technician_status' => $row['technician_status'],
            'primary_service' => $row['primary_service'] ?: 'No asignado',
            'total_tickets_assigned' => (int)$row['total_tickets_assigned'],
            'tickets_resolved' => (int)$row['tickets_resolved'],
            'tickets_in_progress' => (int)$row['tickets_in_progress'],
            'pending_tickets' => (int)$row['pending_tickets'],
            'avg_resolution_time' => round((float)($row['avg_resolution_time'] ?? 0), 1),
            'resolution_rate' => round((float)($row['resolution_rate'] ?? 0), 1),
            'high_priority_resolved' => (int)$row['high_priority_resolved'],
            'total_assignments' => (int)$row['total_assignments'],
            'efficiency_score' => calculateEfficiencyScore($row)
        ];
    }
    
    // Service distribution
    $serviceQuery = "SELECT
        tis.Type_Service as service_name,
        COUNT(DISTINCT ts.Fk_Technicians) as technician_count,
        COUNT(DISTINCT sr.ID_Service_Request) as ticket_count,
        AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_resolution_time
    FROM TI_Service tis
    LEFT JOIN Technicians_Service ts ON tis.ID_TI_Service = ts.Fk_TI_Service
    LEFT JOIN Ticket_Technicians tt ON ts.Fk_Technicians = tt.Fk_Technician
    LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
    WHERE 1=1 {$dateCondition}
    GROUP BY tis.ID_TI_Service, tis.Type_Service
    ORDER BY ticket_count DESC";
    
    $stmt = $db->prepare($serviceQuery);
    $stmt->execute();
    
    $services = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $services[] = [
            'service_name' => $row['service_name'],
            'technician_count' => (int)$row['technician_count'],
            'ticket_count' => (int)$row['ticket_count'],
            'avg_resolution_time' => round((float)($row['avg_resolution_time'] ?? 0), 1)
        ];
    }
    
    return [
        'overview' => [
            'total_technicians' => (int)$overview['total_technicians'],
            'active_technicians' => (int)$overview['active_technicians'],
            'inactive_technicians' => (int)$overview['inactive_technicians'],
            'total_tickets' => (int)$overview['total_tickets'],
            'resolved_tickets' => (int)$overview['resolved_tickets'],
            'resolution_rate' => $overview['total_tickets'] > 0 ? 
                round(((int)$overview['resolved_tickets'] / (int)$overview['total_tickets']) * 100, 1) : 0,
            'avg_resolution_time' => round((float)($overview['avg_resolution_time'] ?? 0), 1),
            'report_period_days' => $days,
            'generated_at' => date('Y-m-d H:i:s')
        ],
        'technicians' => $technicians,
        'service_distribution' => $services
    ];
}

function getTechnicianPerformanceReport($db, $days, $technicianId = null) {
    $dateCondition = "";
    if ($days > 0) {
        $dateCondition = "AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)";
    }
    
    $technicianCondition = "";
    if ($technicianId) {
        $technicianCondition = "AND t.ID_Technicians = " . (int)$technicianId;
    }
    
    $query = "SELECT
        t.ID_Technicians as technician_id,
        CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
        t.Status as status,
        COUNT(DISTINCT sr.ID_Service_Request) as total_tickets,
        COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as resolved_tickets,
        AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_resolution_hours,
        COUNT(DISTINCT CASE WHEN sr.System_Priority = 'Alta' THEN sr.ID_Service_Request END) as high_priority_tickets,
        COUNT(DISTINCT CASE WHEN sr.System_Priority = 'Alta' AND sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as high_priority_resolved,
        (COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) * 100.0 / 
         NULLIF(COUNT(DISTINCT sr.ID_Service_Request), 0)) as success_rate,
        DATE_FORMAT(sr.Created_at, '%Y-%m') as month,
        COUNT(DISTINCT sr.ID_Service_Request) as monthly_tickets
    FROM Technicians t
    LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
    LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
    WHERE 1=1 {$technicianCondition} {$dateCondition}
    GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, DATE_FORMAT(sr.Created_at, '%Y-%m')
    ORDER BY technician_name, month";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $performance = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $performance[] = [
            'technician_id' => (int)$row['technician_id'],
            'technician_name' => $row['technician_name'],
            'status' => $row['status'],
            'total_tickets' => (int)$row['total_tickets'],
            'resolved_tickets' => (int)$row['resolved_tickets'],
            'avg_resolution_hours' => round((float)($row['avg_resolution_hours'] ?? 0), 1),
            'high_priority_tickets' => (int)$row['high_priority_tickets'],
            'high_priority_resolved' => (int)$row['high_priority_resolved'],
            'success_rate' => round((float)($row['success_rate'] ?? 0), 1),
            'month' => $row['month'],
            'monthly_tickets' => (int)$row['monthly_tickets']
        ];
    }
    
    return $performance;
}

function getTechnicianWorkloadReport($db, $days) {
    $dateCondition = "";
    if ($days > 0) {
        $dateCondition = "AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)";
    }
    
    $query = "SELECT
        t.ID_Technicians as technician_id,
        CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
        t.Status as status,
        COUNT(DISTINCT CASE WHEN sr.Status = 'Pendiente' THEN sr.ID_Service_Request END) as pending_tickets,
        COUNT(DISTINCT CASE WHEN sr.Status = 'En Proceso' THEN sr.ID_Service_Request END) as in_progress_tickets,
        COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as completed_today,
        COUNT(DISTINCT sr.ID_Service_Request) as total_active,
        AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, NOW())) as avg_pending_hours,
        tis.Type_Service as service_type
    FROM Technicians t
    LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
    LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request AND sr.Status != 'Cerrado'
    LEFT JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
    LEFT JOIN TI_Service tis ON ts.Fk_TI_Service = tis.ID_TI_Service
    WHERE t.Status = 'Activo' {$dateCondition}
    GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, tis.Type_Service
    ORDER BY total_active DESC, pending_tickets DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $workload = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $workload[] = [
            'technician_id' => (int)$row['technician_id'],
            'technician_name' => $row['technician_name'],
            'status' => $row['status'],
            'pending_tickets' => (int)$row['pending_tickets'],
            'in_progress_tickets' => (int)$row['in_progress_tickets'],
            'completed_today' => (int)$row['completed_today'],
            'total_active' => (int)$row['total_active'],
            'avg_pending_hours' => round((float)($row['avg_pending_hours'] ?? 0), 1),
            'service_type' => $row['service_type'] ?: 'No asignado',
            'workload_level' => calculateWorkloadLevel($row['total_active'])
        ];
    }
    
    return $workload;
}

function getTechnicianProductivityReport($db, $startDate, $endDate) {
    $query = "SELECT
        t.ID_Technicians as technician_id,
        CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
        COUNT(DISTINCT sr.ID_Service_Request) as total_handled,
        COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as total_resolved,
        AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_resolution_time,
        COUNT(DISTINCT CASE WHEN DATE(sr.Created_at) = DATE(sr.Resolved_at) AND sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) as same_day_resolutions,
        COUNT(DISTINCT CASE WHEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) <= 2 THEN sr.ID_Service_Request END) as quick_resolutions,
        tis.Type_Service as specialization,
        (COUNT(DISTINCT CASE WHEN sr.Status = 'Cerrado' THEN sr.ID_Service_Request END) * 100.0 / 
         NULLIF(COUNT(DISTINCT sr.ID_Service_Request), 0)) as productivity_rate
    FROM Technicians t
    LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
    LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
    LEFT JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
    LEFT JOIN TI_Service tis ON ts.Fk_TI_Service = tis.ID_TI_Service
    WHERE DATE(sr.Created_at) BETWEEN '{$startDate}' AND '{$endDate}'
    GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, tis.Type_Service
    ORDER BY total_resolved DESC, productivity_rate DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $productivity = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $productivity[] = [
            'technician_id' => (int)$row['technician_id'],
            'technician_name' => $row['technician_name'],
            'total_handled' => (int)$row['total_handled'],
            'total_resolved' => (int)$row['total_resolved'],
            'avg_resolution_time' => round((float)($row['avg_resolution_time'] ?? 0), 1),
            'same_day_resolutions' => (int)$row['same_day_resolutions'],
            'quick_resolutions' => (int)$row['quick_resolutions'],
            'specialization' => $row['specialization'] ?: 'General',
            'productivity_rate' => round((float)($row['productivity_rate'] ?? 0), 1),
            'performance_category' => categorizePerformance($row['productivity_rate'], $row['avg_resolution_time'])
        ];
    }
    
    return [
        'period' => [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_days' => (strtotime($endDate) - strtotime($startDate)) / (60 * 60 * 24) + 1
        ],
        'technicians' => $productivity
    ];
}

function calculateEfficiencyScore($row) {
    $resolutionRate = (float)($row['resolution_rate'] ?? 0);
    $avgTime = (float)($row['avg_resolution_time'] ?? 24);
    $highPriorityRate = $row['total_tickets_assigned'] > 0 ? 
        ((int)$row['high_priority_resolved'] / (int)$row['total_tickets_assigned']) * 100 : 0;
    
    // Base score from resolution rate (0-40 points)
    $score = min($resolutionRate * 0.4, 40);
    
    // Time bonus (0-30 points, faster is better)
    if ($avgTime <= 2) $score += 30;
    elseif ($avgTime <= 4) $score += 25;
    elseif ($avgTime <= 8) $score += 20;
    elseif ($avgTime <= 12) $score += 15;
    elseif ($avgTime <= 24) $score += 10;
    else $score += 5;
    
    // High priority bonus (0-30 points)
    $score += min($highPriorityRate * 0.3, 30);
    
    return round($score, 1);
}

function calculateWorkloadLevel($activeTickets) {
    if ($activeTickets >= 10) return 'Crítico';
    elseif ($activeTickets >= 7) return 'Alto';
    elseif ($activeTickets >= 4) return 'Medio';
    elseif ($activeTickets >= 1) return 'Bajo';
    else return 'Sin carga';
}

function categorizePerformance($rate, $avgTime) {
    if ($rate >= 95 && $avgTime <= 4) return 'Excelente';
    elseif ($rate >= 85 && $avgTime <= 8) return 'Bueno';
    elseif ($rate >= 70 && $avgTime <= 12) return 'Regular';
    elseif ($rate >= 50) return 'Necesita mejora';
    else return 'Crítico';
}
?>
