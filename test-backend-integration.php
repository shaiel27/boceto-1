<?php
/**
 * Test script to verify PHP-PRO backend integration
 * This script tests the AdminDashboardController and database connectivity
 */

echo "=== PHP-PRO Backend Integration Test ===\n\n";

// Test database connection
require_once __DIR__ . '/tickets-backend/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        echo "✅ Database connection: SUCCESS\n";
        
        // Test basic query
        $stmt = $db->query("SELECT COUNT(*) as total FROM Service_Request");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "📊 Total tickets in database: " . $result['total'] . "\n";
        
        // Test office data
        $stmt = $db->query("SELECT COUNT(*) as total FROM Office");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "🏢 Total offices in database: " . $result['total'] . "\n";
        
        // Test service data
        $stmt = $db->query("SELECT COUNT(*) as total FROM TI_Service");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "🔧 Total services in database: " . $result['total'] . "\n";
        
    } else {
        echo "❌ Database connection: FAILED\n";
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing AdminDashboardController ===\n";

try {
    require_once __DIR__ . '/tickets-backend/src/Controllers/AdminDashboardController.php';
    
    $controller = new App\Controllers\AdminDashboardController($db);
    
    // Test office distribution
    echo "\n📊 Testing office distribution...\n";
    $officeData = $controller->getTicketsByOffice();
    echo "Found " . count($officeData) . " offices with tickets:\n";
    foreach ($officeData as $office) {
        echo "- {$office['Name_Office']}: {$office['ticket_count']} tickets\n";
    }
    
    // Test service distribution
    echo "\n🔧 Testing service distribution...\n";
    $serviceData = $controller->getServiceDistribution();
    echo "Found " . count($serviceData) . " services with tickets:\n";
    foreach ($serviceData as $service) {
        echo "- {$service['Type_Service']}: {$service['ticket_count']} tickets\n";
    }
    
    // Test priority distribution
    echo "\n⚡ Testing priority distribution...\n";
    $priorityData = $controller->getTicketsByPriority();
    echo "Priority breakdown:\n";
    foreach ($priorityData as $priority) {
        echo "- {$priority['System_Priority']}: {$priority['count']} tickets ({$priority['percentage']}%)\n";
    }
    
    echo "\n✅ AdminDashboardController: SUCCESS\n";
    
} catch (Exception $e) {
    echo "❌ AdminDashboardController error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing API Endpoint ===\n";

// Test the actual API endpoint
$apiUrl = 'http://localhost:8000/api/dashboard-public-temp?action=full';

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json',
        'timeout' => 10
    ]
]);

$response = file_get_contents($apiUrl, false, $context);

if ($response !== false) {
    echo "✅ API endpoint response: SUCCESS\n";
    $data = json_decode($response, true);
    
    if ($data && $data['success']) {
        echo "📊 API Data structure:\n";
        echo "- Stats: " . (isset($data['data']['stats']) ? '✅' : '❌') . "\n";
        echo "- Office Distribution: " . (isset($data['data']['office_distribution']) ? '✅' : '❌') . "\n";
        echo "- Service Distribution: " . (isset($data['data']['service_distribution']) ? '✅' : '❌') . "\n";
        echo "- Priority Distribution: " . (isset($data['data']['priority_distribution']) ? '✅' : '❌') . "\n";
        
        if (isset($data['data']['office_distribution'])) {
            echo "\n📊 Office Distribution from API:\n";
            foreach ($data['data']['office_distribution'] as $office) {
                echo "- {$office['Name_Office']}: {$office['ticket_count']} tickets\n";
            }
        }
        
        if (isset($data['data']['service_distribution'])) {
            echo "\n🔧 Service Distribution from API:\n";
            foreach ($data['data']['service_distribution'] as $service) {
                echo "- {$service['Type_Service']}: {$service['ticket_count']} tickets\n";
            }
        }
    } else {
        echo "❌ API returned error: " . ($data['error'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ API endpoint: FAILED - Make sure PHP server is running on localhost:8000\n";
    echo "   Run: cd tickets-backend && php -S localhost:8000 -t public\n";
}

echo "\n=== Test Complete ===\n";
?>
