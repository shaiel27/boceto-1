<?php
declare(strict_types=1);

/**
 * PHP-PRO Complete Diagnostic Tool
 * 
 * Comprehensive diagnosis of backend system including:
 * - PHP configuration
 * - Database connection
 * - JWT service
 * - Authentication middleware
 * - Dashboard controller
 * - Data availability
 */

// Set headers for JSON response (only if running as web server)
if (php_sapi_name() !== 'cli') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json; charset=UTF-8");

    // Handle preflight
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit(0);
    }
}

$diagnostics = [];
$allPassed = true;

// 1. PHP Configuration Check
$diagnostics['php'] = [
    'status' => 'pass',
    'version' => PHP_VERSION,
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown'
];

// 2. File Structure Check
$requiredFiles = [
    __DIR__ . '/src/config/database.php',
    __DIR__ . '/src/Services/JwtService.php',
    __DIR__ . '/src/Middleware/AuthMiddleware.php',
    __DIR__ . '/src/Controllers/AdminDashboardController.php',
    __DIR__ . '/src/models/ServiceRequest.php',
    __DIR__ . '/src/models/Technician.php'
];

$fileCheck = [];
foreach ($requiredFiles as $file) {
    $exists = file_exists($file);
    $fileCheck[basename($file)] = $exists ? 'exists' : 'missing';
    if (!$exists) {
        $allPassed = false;
    }
}

$diagnostics['files'] = [
    'status' => $allPassed ? 'pass' : 'fail',
    'files' => $fileCheck
];

// 3. Database Connection Check
try {
    require_once __DIR__ . '/src/config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        // Test basic query
        $stmt = $db->query("SELECT 1");
        $result = $stmt->fetch();
        
        // Check tables exist
        $tables = ['Service_Request', 'Technicians', 'Office', 'Users', 'Role'];
        $tableCheck = [];
        foreach ($tables as $table) {
            $stmt = $db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            $tableCheck[$table] = $stmt->rowCount() > 0 ? 'exists' : 'missing';
        }
        
        // Count records
        $stmt = $db->query("SELECT COUNT(*) as count FROM Service_Request");
        $ticketCount = $stmt->fetch()['count'];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM Technicians");
        $techCount = $stmt->fetch()['count'];
        
        $diagnostics['database'] = [
            'status' => 'pass',
            'connection' => 'successful',
            'tables' => $tableCheck,
            'ticket_count' => $ticketCount,
            'technician_count' => $techCount
        ];
    } else {
        $diagnostics['database'] = [
            'status' => 'fail',
            'connection' => 'failed',
            'error' => 'Could not establish connection'
        ];
        $allPassed = false;
    }
} catch (Exception $e) {
    $diagnostics['database'] = [
        'status' => 'fail',
        'connection' => 'failed',
        'error' => $e->getMessage()
    ];
    $allPassed = false;
}

// 4. JWT Service Check
try {
    require_once __DIR__ . '/src/Services/JwtService.php';
    
    $jwtSecret = getenv('JWT_SECRET');
    if (empty($jwtSecret)) {
        $jwtSecret = 'your-secret-key-change-in-production-min-32-chars';
    }
    
    $jwtService = new App\Services\JwtService($jwtSecret);
    
    // Test token generation with correct signature (userId, email, roleId, roleName)
    $testUserId = 1;
    $testEmail = 'admin@alcaldia.gob';
    $testRoleId = 1;
    $testRoleName = 'Admin';
    $testToken = $jwtService->generateToken($testUserId, $testEmail, $testRoleId, $testRoleName);
    
    // Test token validation
    $validated = $jwtService->validateToken($testToken);
    
    $diagnostics['jwt'] = [
        'status' => $validated ? 'pass' : 'fail',
        'secret_length' => strlen($jwtSecret),
        'token_generation' => 'success',
        'token_validation' => $validated ? 'success' : 'failed',
        'test_token_preview' => substr($testToken, 0, 30) . '...'
    ];
    
    if (!$validated) {
        $allPassed = false;
    }
} catch (Exception $e) {
    $diagnostics['jwt'] = [
        'status' => 'fail',
        'error' => $e->getMessage()
    ];
    $allPassed = false;
}

// 5. Dashboard Controller Check
try {
    require_once __DIR__ . '/src/Controllers/AdminDashboardController.php';
    
    if (isset($db) && $db) {
        $controller = new App\Controllers\AdminDashboardController($db);
        
        // Test getDashboardStats
        $stats = $controller->getDashboardStats();
        
        // Test getRecentTickets
        $recent = $controller->getRecentTickets(5);
        
        // Test getTechnicianPerformance
        $techPerf = $controller->getTechnicianPerformance();
        
        $diagnostics['controller'] = [
            'status' => 'pass',
            'getDashboardStats' => !empty($stats) ? 'success' : 'no_data',
            'getRecentTickets' => !empty($recent) ? 'success' : 'no_data',
            'getTechnicianPerformance' => !empty($techPerf) ? 'success' : 'no_data',
            'stats_sample' => $stats,
            'recent_count' => count($recent),
            'tech_count' => count($techPerf)
        ];
    } else {
        $diagnostics['controller'] = [
            'status' => 'fail',
            'error' => 'Database not available'
        ];
        $allPassed = false;
    }
} catch (Exception $e) {
    $diagnostics['controller'] = [
        'status' => 'fail',
        'error' => $e->getMessage()
    ];
    $allPassed = false;
}

// 6. API Endpoint Check
$apiEndpoints = [
    '/api/dashboard?action=full',
    '/api/dashboard?action=stats',
    '/api/dashboard?action=recent'
];

$endpointCheck = [];
foreach ($apiEndpoints as $endpoint) {
    $url = 'http://localhost:8000' . $endpoint;
    $endpointCheck[$endpoint] = 'untested';
}

$diagnostics['api_endpoints'] = [
    'status' => 'info',
    'endpoints' => $endpointCheck,
    'note' => 'Test these endpoints manually with authentication'
];

// Final Result
echo json_encode([
    'success' => $allPassed,
    'overall_status' => $allPassed ? 'all_checks_passed' : 'some_checks_failed',
    'timestamp' => date('Y-m-d H:i:s'),
    'diagnostics' => $diagnostics,
    'recommendations' => getRecommendations($diagnostics)
]);

function getRecommendations(array $diagnostics): array {
    $recommendations = [];
    
    if ($diagnostics['files']['status'] === 'fail') {
        $recommendations[] = 'Missing required files. Check file structure.';
    }
    
    if ($diagnostics['database']['status'] === 'fail') {
        $recommendations[] = 'Database connection failed. Check MySQL/XAMPP is running and credentials in src/config/database.php';
    }
    
    if ($diagnostics['jwt']['status'] === 'fail') {
        $recommendations[] = 'JWT service failed. Check JWT_SECRET environment variable';
    }
    
    if ($diagnostics['controller']['status'] === 'fail') {
        $recommendations[] = 'Dashboard controller failed. Check AdminDashboardController.php';
    }
    
    if ($diagnostics['controller']['status'] === 'pass') {
        if ($diagnostics['controller']['getDashboardStats'] === 'no_data') {
            $recommendations[] = 'Database has no ticket data. Run database scripts to populate data.';
        }
    }
    
    if (empty($recommendations)) {
        $recommendations[] = 'All checks passed. Test the frontend with authentication.';
    }
    
    return $recommendations;
}
