<?php
declare(strict_types=1);

/**
 * Dashboard Integration Test Script
 * 
 * Tests the complete integration between frontend and backend
 * for the modern admin dashboard with PHP-PRO principles
 */

echo "=== Dashboard Integration Test ===\n\n";

// Test database connection
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/Controllers/AdminDashboardController.php';

try {
    echo "1. Testing database connection...\n";
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    echo "✓ Database connection successful\n\n";
    
    // Test dashboard controller
    echo "2. Testing AdminDashboardController...\n";
    $controller = new App\Controllers\AdminDashboardController($db);
    echo "✓ AdminDashboardController instantiated\n\n";
    
    // Test dashboard stats
    echo "3. Testing getDashboardStats()...\n";
    $stats = $controller->getDashboardStats();
    echo "✓ Dashboard stats retrieved:\n";
    echo "  - Pending: " . $stats['pending_count'] . "\n";
    echo "  - In Progress: " . $stats['in_progress_count'] . "\n";
    echo "  - Resolved: " . $stats['resolved_count'] . "\n";
    echo "  - Critical: " . $stats['critical_count'] . "\n";
    echo "  - Resolution Rate: " . $stats['resolution_rate'] . "%\n\n";
    
    // Test priority distribution
    echo "4. Testing getTicketsByPriority()...\n";
    $priorityData = $controller->getTicketsByPriority();
    echo "✓ Priority distribution retrieved:\n";
    foreach ($priorityData as $priority) {
        echo "  - " . $priority['System_Priority'] . ": " . $priority['count'] . " (" . $priority['percentage'] . "%)\n";
    }
    echo "\n";
    
    // Test recent tickets
    echo "5. Testing getRecentTickets()...\n";
    $recentTickets = $controller->getRecentTickets(5, 0);
    echo "✓ Recent tickets retrieved: " . count($recentTickets) . " tickets\n";
    foreach ($recentTickets as $ticket) {
        echo "  - " . $ticket['Ticket_Code'] . ": " . $ticket['Subject'] . " (" . $ticket['Status'] . ")\n";
    }
    echo "\n";
    
    // Test office distribution
    echo "6. Testing getTicketsByOffice()...\n";
    $officeData = $controller->getTicketsByOffice();
    echo "✓ Office distribution retrieved: " . count($officeData) . " offices\n";
    foreach (array_slice($officeData, 0, 3) as $office) {
        echo "  - " . ($office['Name_Office'] ?? $office['Office_Name'] ?? 'Unknown') . ": " . $office['ticket_count'] . " tickets\n";
    }
    echo "\n";
    
    // Test technician performance
    echo "7. Testing getTechnicianPerformance()...\n";
    $technicianData = $controller->getTechnicianPerformance();
    echo "✓ Technician performance retrieved: " . count($technicianData) . " technicians\n";
    foreach (array_slice($technicianData, 0, 3) as $technician) {
        echo "  - " . $technician['technician_name'] . ": " . $technician['resolved_tickets'] . " resolved\n";
    }
    echo "\n";
    
    // Test trends
    echo "8. Testing getTicketTrends()...\n";
    $trends = $controller->getTicketTrends();
    echo "✓ Ticket trends retrieved: " . count($trends) . " days\n";
    if (count($trends) > 0) {
        $latest = end($trends);
        echo "  - Latest date: " . $latest['date'] . "\n";
        echo "  - Created: " . $latest['created_count'] . ", Resolved: " . $latest['resolved_count'] . "\n";
    }
    echo "\n";
    
    // Test service distribution
    echo "9. Testing getServiceDistribution()...\n";
    $serviceData = $controller->getServiceDistribution();
    echo "✓ Service distribution retrieved: " . count($serviceData) . " services\n";
    foreach (array_slice($serviceData, 0, 3) as $service) {
        echo "  - " . $service['Type_Service'] . ": " . $service['ticket_count'] . " tickets\n";
    }
    echo "\n";
    
    // Test full dashboard data
    echo "10. Testing getFullDashboardData()...\n";
    $fullData = $controller->getFullDashboardData();
    echo "✓ Full dashboard data retrieved\n";
    echo "  - Stats keys: " . implode(', ', array_keys($fullData['stats'])) . "\n";
    echo "  - Recent tickets: " . count($fullData['recent_tickets']) . "\n";
    echo "  - Priority distribution: " . count($fullData['priority_distribution']) . "\n";
    echo "  - Office distribution: " . count($fullData['office_distribution']) . "\n";
    echo "  - Technician performance: " . count($fullData['technician_performance']) . "\n";
    echo "  - Trends: " . count($fullData['trends']) . "\n";
    echo "  - Service distribution: " . count($fullData['service_distribution']) . "\n";
    echo "  - Last updated: " . $fullData['last_updated'] . "\n\n";
    
    echo "=== All Tests Passed! ===\n";
    echo "The dashboard backend integration is working correctly.\n";
    
} catch (Exception $e) {
    echo "✗ Test failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== Testing API Endpoints ===\n\n";

// Test API endpoints via HTTP
$baseUrl = 'http://localhost:8000';
$endpoints = [
    '/api/dashboard?action=stats',
    '/api/dashboard?action=priority',
    '/api/dashboard?action=offices',
    '/api/dashboard?action=technicians',
    '/api/dashboard?action=recent&limit=5',
    '/api/dashboard?action=trends',
    '/api/dashboard?action=services',
    '/api/dashboard?action=full'
];

foreach ($endpoints as $endpoint) {
    echo "Testing: {$baseUrl}{$endpoint}\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer test-token'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "✗ cURL Error: $error\n";
    } else {
        $data = json_decode($response, true);
        if ($httpCode === 200 && isset($data['success']) && $data['success'] === true) {
            echo "✓ Success (HTTP $httpCode)\n";
            if (isset($data['data']) && is_array($data['data'])) {
                echo "  Data keys: " . implode(', ', array_keys($data['data'])) . "\n";
            }
        } else {
            echo "✗ Failed (HTTP $httpCode)\n";
            if (isset($data['message'])) {
                echo "  Message: " . $data['message'] . "\n";
            }
        }
    }
    echo "\n";
}

echo "=== API Testing Complete ===\n";
