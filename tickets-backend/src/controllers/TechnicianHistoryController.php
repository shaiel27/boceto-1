<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Technician.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get authenticated user from middleware context
    $currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
    $currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

    error_log("TechnicianHistoryController - User ID: " . ($currentUserId ?? 'null') . ", Role: " . ($currentUserRole ?? 'null'));

    $action = $_GET['action'] ?? '';

    if ($action === 'ticket-history') {
        // PHP-PRO: Get ticket history for the current technician
        $currentMonth = date('m');
        $currentYear = date('Y');
        
        // Get all tickets for the current technician
        $query = "
            SELECT 
                sr.ID_Service_Request,
                sr.Ticket_Code,
                sr.Subject,
                sr.Description,
                sr.Property_Number,
                sr.System_Priority,
                sr.Status,
                sr.Created_at,
                sr.Resolved_at,
                o.Name_Office,
                o.Type_Office,
                ts.Type_Service,
                tt.Is_Lead,
                COUNT(c.ID_Comment) as Comments_Count
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            JOIN Users u ON t.Fk_Users = u.ID_Users
            LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
            LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
            LEFT JOIN Comments c ON sr.ID_Service_Request = c.Fk_Service_Request
            WHERE u.ID_Users = :user_id
            AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY sr.ID_Service_Request
            ORDER BY sr.Created_at DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $currentUserId);
        $stmt->execute();
        
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate statistics
        $totalTickets = count($tickets);
        $resolvedTickets = array_filter($tickets, function($t) { return $t['Status'] === 'Cerrado' || $t['Status'] === 'Resuelto'; });
        $resolvedThisMonth = array_filter($resolvedTickets, function($t) use ($currentMonth, $currentYear) {
            $resolvedDate = new DateTime($t['Resolved_at'] ?? $t['Created_at']);
            return $resolvedDate->format('m') == $currentMonth && $resolvedDate->format('Y') == $currentYear;
        });
        
        $avgResolutionTime = 0;
        if (!empty($resolvedTickets)) {
            $totalResolutionTime = 0;
            foreach ($resolvedTickets as $ticket) {
                if ($ticket['Resolved_at']) {
                    $created = new DateTime($ticket['Created_at']);
                    $resolved = new DateTime($ticket['Resolved_at']);
                    $totalResolutionTime += $resolved->getTimestamp() - $created->getTimestamp();
                }
            }
            $avgResolutionTime = $totalResolutionTime / count($resolvedTickets) / 60; // Convert to minutes
        }
        
        $priorityBreakdown = [
            'critical' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Crítica'; })),
            'high' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Alta'; })),
            'medium' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Media'; })),
            'low' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Baja'; }))
        ];
        
        // Generate monthly trend
        $monthlyTrend = [];
        for ($i = 0; $i < $currentMonth; $i++) {
            $month = $i + 1;
            $monthTickets = array_filter($tickets, function($t) use ($month, $currentYear) {
                $createdDate = new DateTime($t['Created_at']);
                return $createdDate->format('m') == $month && $createdDate->format('Y') == $currentYear;
            });
            
            $monthResolved = array_filter($monthTickets, function($t) {
                return $t['Status'] === 'Cerrado' || $t['Status'] === 'Resuelto';
            });
            
            $months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            $monthlyTrend[] = [
                'month' => $months[$i],
                'resolved' => count($monthResolved),
                'created' => count($monthTickets)
            ];
        }
        
        $ticketHistory = [
            'total_tickets' => $totalTickets,
            'resolved_this_month' => count($resolvedThisMonth),
            'avg_resolution_time' => round($avgResolutionTime),
            'success_rate' => $totalTickets > 0 ? round((count($resolvedTickets) / $totalTickets) * 100) : 0,
            'priority_breakdown' => $priorityBreakdown,
            'monthly_trend' => $monthlyTrend
        ];
        
        echo json_encode([
            'success' => true,
            'data' => $ticketHistory,
            'debug' => [
                'user_id' => $currentUserId,
                'total_tickets_query' => $totalTickets,
                'resolved_tickets' => count($resolvedTickets),
                'resolved_this_month' => count($resolvedThisMonth)
            ]
        ]);
        
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Acción no válida'
        ]);
    }
    
} catch (Exception $e) {
    error_log("TechnicianHistoryController Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor',
        'error' => $e->getMessage()
    ]);
}
?>
