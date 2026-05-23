<?php
// CORS headers - must be set before any output
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.6:3000',
    'http://192.168.100.8:3000',
    'http://192.168.5.43:3000',
    'http://10.2.0.2:3000',
    'http://192.168.1.5:3000',
    'http://192.168.2.4:3000',
];
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

// Initialize JWT service and auth middleware for all routes except auth
require_once __DIR__ . '/../src/Services/JwtService.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

$jwtSecret = getenv('JWT_SECRET') ?: 'change-this-secret-in-production-min-32-chars!!';

$jwtService = new App\Services\JwtService($jwtSecret);
$authMiddleware = new App\Middleware\AuthMiddleware($jwtService);

// Apply authentication middleware (except for auth endpoint)
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = explode('?', $path)[0];

if ($path !== '/api/auth' && $path !== '/api/auth/') {
    // Tickets endpoint requires authentication
    if ($path === '/api/tickets' || $path === '/api/tickets/' || $path === '/api/audit' || $path === '/api/audit/') {
        $user = $authMiddleware->requireAuth();
        $authMiddleware->setUserContext($user);
    } else {
        // Other endpoints use optional auth
        $user = $authMiddleware->optionalAuth();
        if ($user) {
            $authMiddleware->setUserContext($user);
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Route the request
switch ($path) {
    case '/api/auth':
    case '/api/auth/':
        require_once __DIR__ . '/../src/controllers/AuthController.php';
        break;

    case '/api/tickets':
    case '/api/tickets/':
        require_once __DIR__ . '/../src/controllers/TicketController.php';
        break;

    case '/api/users':
    case '/api/users/':
        require_once __DIR__ . '/../src/controllers/UserController.php';
        break;

    case '/api/technicians':
    case '/api/technicians/':
        require_once __DIR__ . '/../src/controllers/TechnicianController.php';
        break;

    case '/api/lunch-blocks':
    case '/api/lunch-blocks/':
        require_once __DIR__ . '/../src/controllers/LunchBlockController.php';
        break;

    case '/api/technician-schedules':
    case '/api/technician-schedules/':
        require_once __DIR__ . '/../src/controllers/TechnicianScheduleController.php';
        break;

    case '/api/analytics':
    case '/api/analytics/':
        require_once __DIR__ . '/../src/controllers/AnalyticsController.php';
        break;

    case '/api/service':
    case '/api/service/':
        require_once __DIR__ . '/../src/controllers/ServiceController.php';
        break;

    case '/api/services':
    case '/api/services/':
        require_once __DIR__ . '/../src/controllers/ServiceController.php';
        break;

    case '/api/assignments':
    case '/api/assignments/':
        require_once __DIR__ . '/../src/controllers/AssignmentController.php';
        break;

    case '/api/dashboard':
    case '/api/dashboard/':
        require_once 'api-dashboard.php';
        break;

    case '/api/public-board':
    case '/api/public-board/':
        // Public endpoint: no authentication required
        require_once 'api-public-board.php';
        break;

    case '/api/dashboard-public-temp':
    case '/api/dashboard-public-temp/':
        require_once 'api-dashboard-public-temp.php';
        break;

    case '/api/dashboard-public':
    case '/api/dashboard-public/':
        require_once 'api-dashboard-public.php';
        break;

    case '/api/weekly-report':
    case '/api/weekly-report/':
        $user = $authMiddleware->requireAuth();
        $authMiddleware->setUserContext($user);
        require_once __DIR__ . '/../src/controllers/WeeklyReportController.php';
        break;

    case '/api/technician-reports':
    case '/api/technician-reports/':
        $user = $authMiddleware->requireAuth();
        $authMiddleware->setUserContext($user);
        require_once __DIR__ . '/../src/controllers/TechnicianReportController.php';
        break;

    case '/api/office':
    case '/api/office/':
        require_once __DIR__ . '/../src/controllers/OfficeController.php';
        $controller = new OfficeController();
        $controller->handleRequest();
        break;

    case '/api/problem-report':
    case '/api/problem-report/':
        require_once __DIR__ . '/../src/controllers/ProblemReportController.php';
        $controller = new ProblemReportController();
        $controller->handleRequest();
        break;

    case '/api/notifications':
    case '/api/notifications/':
        $user = $authMiddleware->requireAuth();
        $authMiddleware->setUserContext($user);
        require_once __DIR__ . '/../src/controllers/NotificationController.php';
        break;

    case '/api/escalation':
    case '/api/escalation/':
        $user = $authMiddleware->requireAuth();
        $authMiddleware->setUserContext($user);
        require_once __DIR__ . '/../src/controllers/EscalationController.php';
        break;

    case '/api/audit':
    case '/api/audit/':
        if ($_SERVER['AUTH_USER_ROLE'] !== 'Admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Acceso denegado: se requiere rol Admin']);
            exit;
        }
        require_once __DIR__ . '/../src/controllers/AuditLogController.php';
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint no encontrado'
        ]);
        break;
}
?>
