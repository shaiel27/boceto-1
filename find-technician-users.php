<?php
// Find users with technician role and tickets
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Finding technicians with tickets...\n\n";
    
    // Find technicians with tickets
    $stmt = $conn->query("
        SELECT DISTINCT 
            u.ID_Users,
            u.Full_Name,
            u.Username,
            COUNT(sr.ID_Service_Request) as ticket_count
        FROM Users u
        JOIN Role r ON u.Fk_Role = r.ID_Role
        JOIN Technicians t ON u.ID_Users = t.Fk_Users
        JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
        JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
        WHERE r.Role = 'Técnico'
        GROUP BY u.ID_Users, u.Full_Name, u.Username
        ORDER BY ticket_count DESC
    ");
    
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Technicians with tickets:\n";
    echo "========================\n";
    foreach ($technicians as $tech) {
        echo "ID: {$tech['ID_Users']} - {$tech['Full_Name']} ({$tech['Username']}) - {$tech['ticket_count']} tickets\n";
    }
    
    if (!empty($technicians)) {
        $testUserId = $technicians[0]['ID_Users'];
        echo "\nTesting with User ID: $testUserId ({$technicians[0]['Full_Name']})\n";
        
        // Get tickets for this technician
        $stmt = $conn->prepare("
            SELECT 
                sr.ID_Service_Request,
                sr.Ticket_Code,
                sr.Subject,
                sr.System_Priority,
                sr.Status,
                sr.Created_at,
                sr.Resolved_at
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            JOIN Users u ON t.Fk_Users = u.ID_Users
            WHERE u.ID_Users = :user_id
            ORDER BY sr.Created_at DESC
        ");
        $stmt->bindParam(':user_id', $testUserId);
        $stmt->execute();
        
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Found " . count($tickets) . " tickets for this technician\n\n";
        
        // Calculate statistics
        $totalTickets = count($tickets);
        $resolvedTickets = array_filter($tickets, function($t) { return $t['Status'] === 'Cerrado'; });
        $currentMonth = date('m');
        $currentYear = date('Y');
        
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
            $avgResolutionTime = $totalResolutionTime / count($resolvedTickets) / 3600;
        }
        
        $priorityBreakdown = [
            'critical' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Crítica'; })),
            'high' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Alta'; })),
            'medium' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Media'; })),
            'low' => count(array_filter($tickets, function($t) { return $t['System_Priority'] === 'Baja'; }))
        ];
        
        echo "Calculated Statistics:\n";
        echo "====================\n";
        echo "- Total Tickets: $totalTickets\n";
        echo "- Resolved This Month: " . count($resolvedThisMonth) . "\n";
        echo "- Average Resolution Time: " . round($avgResolutionTime, 2) . " hours\n";
        echo "- Success Rate: " . round((count($resolvedTickets) / $totalTickets) * 100) . "%\n";
        echo "- Priority Breakdown:\n";
        echo "  - Critical: {$priorityBreakdown['critical']}\n";
        echo "  - High: {$priorityBreakdown['high']}\n";
        echo "  - Medium: {$priorityBreakdown['medium']}\n";
        echo "  - Low: {$priorityBreakdown['low']}\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
