<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Initialize JWT service and auth middleware for all routes except auth
require_once __DIR__ . '/../src/Services/JwtService.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

$jwtSecret = getenv('JWT_SECRET');
if (empty($jwtSecret)) {
    $jwtSecret = 'your-secret-key-change-in-production-min-32-chars';
}

$jwtService = new App\Services\JwtService($jwtSecret);
$authMiddleware = new App\Middleware\AuthMiddleware($jwtService);

// Apply authentication middleware (except for auth endpoint)
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = explode('?', $path)[0];

if ($path !== '/api/auth' && $path !== '/api/auth/') {
    $user = $authMiddleware->optionalAuth();
    if ($user) {
        $authMiddleware->setUserContext($user);
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Route the request
switch ($path) {
    case '/api/auth':
    case '/api/auth/':
        require_once '../src/controllers/AuthController.php';
        break;

    case '/api/tickets':
    case '/api/tickets/':
        require_once '../src/controllers/TicketController.php';
        break;

    case '/api/users':
    case '/api/users/':
        require_once '../src/controllers/UserController.php';
        break;

    case '/api/technicians':
    case '/api/technicians/':
        require_once '../src/controllers/TechnicianController.php';
        break;

    case '/api/lunch-blocks':
    case '/api/lunch-blocks/':
        require_once '../src/controllers/LunchBlockController.php';
        break;

    case '/api/technician-schedules':
    case '/api/technician-schedules/':
        require_once '../src/controllers/TechnicianScheduleController.php';
        break;

    case '/api/analytics':
    case '/api/analytics/':
        require_once '../src/controllers/AnalyticsController.php';
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
