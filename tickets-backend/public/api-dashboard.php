<?php
declare(strict_types=1);

// Enable error reporting for debugging
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Log errors to file instead of displaying
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../error.log');

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Custom error handler to return JSON on errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: [$errno] $errstr in $errfile on line $errline");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $errstr,
        'file' => $errfile,
        'line' => $errline
    ]);
    exit;
});

set_exception_handler(function($exception) {
    error_log("Uncaught Exception: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $exception->getMessage(),
        'file' => $exception->getFile(),
        'line' => $exception->getLine()
    ]);
    exit;
});

// Initialize JWT service and auth middleware
require_once __DIR__ . '/../src/Services/JwtService.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/Controllers/AdminDashboardController.php';

$jwtSecret = getenv('JWT_SECRET') ?: 'change-this-secret-in-production-min-32-chars!!';

$jwtService = new App\Services\JwtService($jwtSecret);
$authMiddleware = new App\Middleware\AuthMiddleware($jwtService);

// Require authentication for all dashboard endpoints
$user = $authMiddleware->requireAuth();
$authMiddleware->setUserContext($user);

// Check admin permissions
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;
if (!in_array($currentUserRole, ['Admin'], true)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Acceso denegado - Solo administradores pueden acceder al dashboard'
    ]);
    exit;
}

// Initialize database connection
require_once __DIR__ . '/../src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos'
        ]);
        exit;
    }

    $dashboardController = new App\Controllers\AdminDashboardController($db);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'stats':
                $stats = $dashboardController->getDashboardStats();
                echo json_encode([
                    'success' => true,
                    'data' => $stats
                ]);
                break;

            case 'executive-summary':
                $executiveSummary = $dashboardController->getExecutiveSummary();
                echo json_encode([
                    'success' => true,
                    'data' => $executiveSummary
                ]);
                break;

            case 'priority':
                $priorityData = $dashboardController->getTicketsByPriority();
                echo json_encode([
                    'success' => true,
                    'data' => $priorityData
                ]);
                break;

            case 'offices':
                $officeData = $dashboardController->getTicketsByOffice();
                echo json_encode([
                    'success' => true,
                    'data' => $officeData
                ]);
                break;

            case 'technicians':
                $technicianData = $dashboardController->getTechnicianPerformance();
                echo json_encode([
                    'success' => true,
                    'data' => $technicianData
                ]);
                break;

            case 'recent':
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                $recentTickets = $dashboardController->getRecentTickets($limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $recentTickets
                ]);
                break;

            case 'trends':
                $trends = $dashboardController->getTicketTrends();
                echo json_encode([
                    'success' => true,
                    'data' => $trends
                ]);
                break;

            case 'services':
                $serviceData = $dashboardController->getServiceDistribution();
                echo json_encode([
                    'success' => true,
                    'data' => $serviceData
                ]);
                break;

            case 'full':
                // Comprehensive dashboard data in single call
                $fullData = $dashboardController->getFullDashboardData();
                echo json_encode([
                    'success' => true,
                    'data' => $fullData
                ]);
                break;

            default:
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acción no válida'
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
?>
