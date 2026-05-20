<?php
declare(strict_types=1);

// Error handling — convert PHP errors to JSON
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_error_handler(function (int $errno, string $errstr): void {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'detail' => $errstr
    ]);
    exit;
});

// CORS headers - Allow both localhost and network IP
$allowedOrigins = ['http://localhost:3000', 'http://192.168.100.8:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Initialize database connection
require_once __DIR__ . '/../src/config/database.php';
require_once __DIR__ . '/../src/Controllers/AdminDashboardController.php';

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

try {
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
                    $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
                    $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
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

                case 'executive-summary':
                    $execSummary = $dashboardController->getExecutiveSummary();
                    echo json_encode([
                        'success' => true,
                        'data' => $execSummary
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
} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'detail' => $e->getMessage()
    ]);
}
?>
