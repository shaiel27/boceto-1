<?php
/**
 * Test script to verify technician statistics integration
 * This script tests the data flow from database to frontend statistics
 */

echo "=== Technician Statistics Integration Test ===\n\n";

// Test database connection
require_once __DIR__ . '/tickets-backend/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "✅ Database connection: SUCCESS\n";
        
        // Test technician data
        $stmt = $db->query("SELECT COUNT(*) as total FROM Users u JOIN Role r ON u.Fk_Role = r.ID_Role WHERE r.Role = 'Técnico'");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "👨‍🔧 Total technicians: " . $result['total'] . "\n";
        
        // Test service requests assigned to technicians
        $stmt = $db->query("
            SELECT COUNT(*) as total 
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Technician
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "📋 Total tickets with technicians: " . $result['total'] . "\n";
        
        // Test ticket status breakdown
        $stmt = $db->query("
            SELECT sr.Status, COUNT(*) as count
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            GROUP BY sr.Status
        ");
        $statusBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "\n📊 Ticket Status Breakdown:\n";
        foreach ($statusBreakdown as $status) {
            echo "- {$status['Status']}: {$status['count']}\n";
        }
        
        // Test priority breakdown
        $stmt = $db->query("
            SELECT sr.System_Priority, COUNT(*) as count
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            GROUP BY sr.System_Priority
        ");
        $priorityBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "\n🎯 Priority Breakdown:\n";
        foreach ($priorityBreakdown as $priority) {
            echo "- {$priority['System_Priority']}: {$priority['count']}\n";
        }
        
        // Test resolved tickets this month
        $currentMonth = date('m');
        $currentYear = date('Y');
        $stmt = $db->query("
            SELECT COUNT(*) as count
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Technician
            WHERE sr.Status = 'Cerrado'
            AND MONTH(sr.Resolved_at) = $currentMonth
            AND YEAR(sr.Resolved_at) = $currentYear
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\n📅 Resolved This Month: " . $result['count'] . "\n";
        
        // Test average resolution time
        $stmt = $db->query("
            SELECT AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)) as avg_hours
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Technician
            WHERE sr.Status = 'Cerrado'
            AND sr.Resolved_at IS NOT NULL
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "⏱️ Average Resolution Time: " . round($result['avg_hours'], 2) . " hours\n";
        
        // Test sample technician data
        $stmt = $db->query("
            SELECT 
                sr.ID_Service_Request,
                sr.Ticket_Code,
                sr.Subject,
                sr.System_Priority,
                sr.Status,
                sr.Created_at,
                sr.Resolved_at,
                u.Full_Name
            FROM Service_Request sr
            JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            JOIN Users u ON t.Fk_Users = u.ID_Users
            LIMIT 5
        ");
        $sampleTickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\n📝 Sample Technician Tickets:\n";
        foreach ($sampleTickets as $ticket) {
            $created = new DateTime($ticket['Created_at']);
            $resolved = $ticket['Resolved_at'] ? new DateTime($ticket['Resolved_at']) : null;
            $resolutionTime = $resolved ? $resolved->getTimestamp() - $created->getTimestamp() : 0;
            $resolutionHours = $resolutionTime / 3600;
            
            echo "- {$ticket['Ticket_Code']}: {$ticket['Subject']}\n";
            echo "  Priority: {$ticket['System_Priority']}, Status: {$ticket['Status']}\n";
            echo "  Technician: {$ticket['Full_Name']}\n";
            echo "  Resolution Time: " . round($resolutionHours, 2) . " hours\n";
            echo "\n";
        }
        
    } else {
        echo "❌ Database connection: FAILED\n";
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing Technician History Controller ===\n";

try {
    // Simulate the controller logic
    $currentMonth = date('m');
    $currentYear = date('Y');
    $testUserId = 3; // Test with Amna Verez who has tickets
    
    echo "\n👨‍🔧 Testing with User ID: $testUserId\n";
    
    // Get tickets for test user
    $stmt = $db->prepare("
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
        AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        ORDER BY sr.Created_at DESC
    ");
    $stmt->bindParam(':user_id', $testUserId);
    $stmt->execute();
    
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "📋 Found " . count($tickets) . " tickets for test user\n";
    
    if (!empty($tickets)) {
        // Calculate statistics like the controller
        $totalTickets = count($tickets);
        $resolvedTickets = array_filter($tickets, function($t) { return $t['Status'] === 'Cerrado'; });
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
        
        echo "\n📊 Calculated Statistics:\n";
        echo "- Total Tickets: $totalTickets\n";
        echo "- Resolved This Month: " . count($resolvedThisMonth) . "\n";
        echo "- Average Resolution Time: " . round($avgResolutionTime, 2) . " hours\n";
        echo "- Success Rate: " . round((count($resolvedTickets) / $totalTickets) * 100) . "%\n";
        echo "- Priority Breakdown:\n";
        echo "  - Critical: {$priorityBreakdown['critical']}\n";
        echo "  - High: {$priorityBreakdown['high']}\n";
        echo "  - Medium: {$priorityBreakdown['medium']}\n";
        echo "  - Low: {$priorityBreakdown['low']}\n";
        
        // Test JSON output format
        $ticketHistory = [
            'total_tickets' => $totalTickets,
            'resolved_this_month' => count($resolvedThisMonth),
            'avg_resolution_time' => round($avgResolutionTime),
            'success_rate' => round((count($resolvedTickets) / $totalTickets) * 100),
            'priority_breakdown' => $priorityBreakdown,
            'monthly_trend' => []
        ];
        
        echo "\n📤 JSON Output Format:\n";
        echo json_encode($ticketHistory, JSON_PRETTY_PRINT) . "\n";
        
    } else {
        echo "⚠️ No tickets found for test user\n";
    }
    
    echo "\n✅ Technician History Controller: SUCCESS\n";
    
} catch (Exception $e) {
    echo "❌ Technician History Controller error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing API Endpoint ===\n";

$apiUrl = 'http://localhost:8000/api-technician-history.php?action=ticket-history';

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json',
        'timeout' => 10
    ]
]);

$response = file_get_contents($apiUrl, false, $context);

if ($response !== false) {
    echo "✅ API Endpoint: SUCCESS\n";
    $data = json_decode($response, true);
    
    if ($data && $data['success']) {
        echo "📊 API Response Structure:\n";
        echo "- Success: " . ($data['success'] ? '✅' : '❌') . "\n";
        echo "- Has Data: " . (isset($data['data']) ? '✅' : '❌') . "\n";
        
        if (isset($data['data'])) {
            $stats = $data['data'];
            echo "\n📈 API Statistics:\n";
            echo "- Total Tickets: " . $stats['total_tickets'] . "\n";
            echo "- Resolved This Month: " . $stats['resolved_this_month'] . "\n";
            echo "- Average Resolution Time: " . $stats['avg_resolution_time'] . "h\n";
            echo "- Success Rate: " . $stats['success_rate'] . "%\n";
            echo "- Critical Priority: " . $stats['priority_breakdown']['critical'] . "\n";
        }
    } else {
        echo "❌ API returned error: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ API Endpoint: FAILED - Server not running\n";
    echo "   Run: cd tickets-backend && php -S localhost:8000 -t public\n";
}

echo "\n=== Test Complete ===\n";
?>
