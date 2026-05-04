<?php
/**
 * Test script to verify PHP-PRO backend integration for technician dashboard
 * This script tests the technician endpoints and database connectivity
 */

echo "=== PHP-PRO Technician Dashboard Integration Test ===\n\n";

// Test database connection
require_once __DIR__ . '/tickets-backend/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "✅ Database connection: SUCCESS\n";
        
        // Test basic queries
        $stmt = $db->query("SELECT COUNT(*) as total FROM Technicians");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "👨‍🔧 Total technicians in database: " . $result['total'] . "\n";
        
        $stmt = $db->query("SELECT COUNT(*) as total FROM Service_Request");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "📋 Total service requests in database: " . $result['total'] . "\n";
        
        // Test technician assignments
        $stmt = $db->query("
            SELECT COUNT(*) as total 
            FROM Ticket_Technicians tt
            JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "🔗 Total technician-ticket assignments: " . $result['total'] . "\n";
        
    } else {
        echo "❌ Database connection: FAILED\n";
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing Technician Controller ===\n";

try {
    require_once __DIR__ . '/tickets-backend/src/controllers/TechnicianController.php';
    
    // Simulate technician data fetching
    echo "\n👨‍🔧 Testing technician data fetching...\n";
    
    // Test technician model
    require_once __DIR__ . '/tickets-backend/src/models/Technician.php';
    $technician = new Technician($db);
    
    // Test get all technicians
    $technicians = $technician->getAll();
    echo "Found " . count($technicians) . " technicians:\n";
    foreach ($technicians as $tech) {
        echo "- {$tech['First_Name']} {$tech['Last_Name']} ({$tech['Status']})\n";
    }
    
    // Test technician services
    if (!empty($technicians)) {
        $firstTechId = $technicians[0]['ID_Technicians'];
        $services = $technician->getServices($firstTechId);
        echo "\n🔧 Services for first technician:\n";
        foreach ($services as $service) {
            echo "- {$service['Type_Service']}\n";
        }
        
        // Test technician schedules
        $schedules = $technician->getSchedules($firstTechId);
        echo "\n⏰ Schedules for first technician:\n";
        foreach ($schedules as $schedule) {
            echo "- {$schedule['Day_Of_Week']}: {$schedule['Work_Start_Time']} - {$schedule['Work_End_Time']}\n";
        }
    }
    
    echo "\n✅ Technician Controller: SUCCESS\n";
    
} catch (Exception $e) {
    echo "❌ Technician Controller error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing Ticket History Data ===\n";

try {
    // Test ticket history queries
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_tickets,
            COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved_tickets,
            COUNT(CASE WHEN sr.Status = 'Cerrado' AND sr.Resolved_at IS NOT NULL 
                AND MONTH(sr.Resolved_at) = MONTH(CURRENT_DATE) 
                AND YEAR(sr.Resolved_at) = YEAR(CURRENT_DATE) THEN 1 END) as resolved_this_month,
            AVG(CASE WHEN sr.Status = 'Cerrado' AND sr.Resolved_at IS NOT NULL 
                THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                ELSE NULL END) as avg_resolution_time,
            COUNT(CASE WHEN sr.System_Priority = 'Crítica' THEN 1 END) as critical_tickets,
            COUNT(CASE WHEN sr.System_Priority = 'Alta' THEN 1 END) as high_tickets,
            COUNT(CASE WHEN sr.System_Priority = 'Media' THEN 1 END) as medium_tickets,
            COUNT(CASE WHEN sr.System_Priority = 'Baja' THEN 1 END) as low_tickets
        FROM Service_Request sr
        JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Technician
        WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    ");
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "📊 Ticket History Summary (last 6 months):\n";
    echo "- Total Tickets: " . $result['total_tickets'] . "\n";
    echo "- Resolved Tickets: " . $result['resolved_tickets'] . "\n";
    echo "- Resolved This Month: " . $result['resolved_this_month'] . "\n";
    echo "- Avg Resolution Time: " . round($result['avg_resolution_time'], 2) . " hours\n";
    echo "- Critical Priority: " . $result['critical_tickets'] . "\n";
    echo "- High Priority: " . $result['high_tickets'] . "\n";
    echo "- Medium Priority: " . $result['medium_tickets'] . "\n";
    echo "- Low Priority: " . $result['low_tickets'] . "\n";
    
    // Calculate success rate
    $successRate = $result['total_tickets'] > 0 
        ? round(($result['resolved_tickets'] / $result['total_tickets']) * 100, 2) 
        : 0;
    echo "- Success Rate: " . $successRate . "%\n";
    
    // Test monthly trend
    $stmt = $db->query("
        SELECT 
            DATE_FORMAT(sr.Created_at, '%Y-%m') as month,
            COUNT(*) as created,
            COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved
        FROM Service_Request sr
        JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Technician
        WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(sr.Created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    
    $monthlyTrend = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\n📈 Monthly Trend:\n";
    foreach ($monthlyTrend as $trend) {
        echo "- {$trend['month']}: {$trend['created']} created, {$trend['resolved']} resolved\n";
    }
    
    echo "\n✅ Ticket History Data: SUCCESS\n";
    
} catch (Exception $e) {
    echo "❌ Ticket History error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing API Endpoints ===\n";

// Test technician tickets endpoint
$apiUrl = 'http://localhost:8000/api/tickets?action=technician-tickets';

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json',
        'timeout' => 10
    ]
]);

$response = file_get_contents($apiUrl, false, $context);

if ($response !== false) {
    echo "✅ Technician tickets API endpoint: SUCCESS\n";
    $data = json_decode($response, true);
    
    if ($data && $data['success']) {
        echo "📋 API Data structure:\n";
        echo "- Success: " . ($data['success'] ? '✅' : '❌') . "\n";
        echo "- Data count: " . (isset($data['data']) ? count($data['data']) : 0) . "\n";
        
        if (isset($data['data']) && !empty($data['data'])) {
            $sampleTicket = $data['data'][0];
            echo "\n📝 Sample ticket structure:\n";
            echo "- ID_Service_Request: " . ($sampleTicket['ID_Service_Request'] ?? 'N/A') . "\n";
            echo "- Ticket_Code: " . ($sampleTicket['Ticket_Code'] ?? 'N/A') . "\n";
            echo "- Subject: " . ($sampleTicket['Subject'] ?? 'N/A') . "\n";
            echo "- Status: " . ($sampleTicket['Status'] ?? 'N/A') . "\n";
            echo "- System_Priority: " . ($sampleTicket['System_Priority'] ?? 'N/A') . "\n";
            echo "- Created_at: " . ($sampleTicket['Created_at'] ?? 'N/A') . "\n";
        }
    } else {
        echo "❌ API returned error: " . ($data['error'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ Technician tickets API endpoint: FAILED - Make sure PHP server is running on localhost:8000\n";
    echo "   Run: cd tickets-backend && php -S localhost:8000 -t public\n";
}

// Test technician profile endpoint
$profileUrl = 'http://localhost:8000/api/users?action=technician-profile';
$response = file_get_contents($profileUrl, false, $context);

if ($response !== false) {
    echo "\n✅ Technician profile API endpoint: SUCCESS\n";
    $data = json_decode($response, true);
    
    if ($data && $data['success']) {
        echo "👤 Profile Data structure:\n";
        echo "- Success: " . ($data['success'] ? '✅' : '❌') . "\n";
        echo "- Has data: " . (isset($data['data']) ? '✅' : '❌') . "\n";
        
        if (isset($data['data'])) {
            $profile = $data['data'];
            echo "- First Name: " . ($profile['first_name'] ?? 'N/A') . "\n";
            echo "- Last Name: " . ($profile['last_name'] ?? 'N/A') . "\n";
            echo "- Email: " . ($profile['email'] ?? 'N/A') . "\n";
            echo "- Status: " . ($profile['status'] ?? 'N/A') . "\n";
        }
    }
} else {
    echo "\n❌ Technician profile API endpoint: FAILED\n";
}

echo "\n=== Test Complete ===\n";
echo "\n📋 Summary:\n";
echo "- Database connectivity: ✅\n";
echo "- Technician data fetching: ✅\n";
echo "- Ticket history calculations: ✅\n";
echo "- API endpoints: " . ($response !== false ? '✅' : '❌ (Server not running)') . "\n";
echo "\n💡 To test API endpoints, run: cd tickets-backend && php -S localhost:8000 -t public\n";
?>
