<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove query string from path
$path = explode('?', $path)[0];

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
        
    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint no encontrado'
        ]);
        break;
}
?>
