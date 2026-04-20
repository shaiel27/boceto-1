<?php

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') === false) {
            continue;
        }
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        $_ENV[$key] = $value;
    }
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', $_ENV['DISPLAY_ERRORS'] ?? '0');

// Timezone
date_default_timezone_set($_ENV['TIMEZONE'] ?? 'America/Mexico_City');

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Required tables for rate limiting and notifications
require_once __DIR__ . '/../scripts/setup_tables.php';

// Import dependencies
use App\Core\Router;
use App\Core\Request;
use App\Core\Response;

// Create router
$router = new Router();

// Load routes
$routesFile = __DIR__ . '/../routes/api.php';
if (file_exists($routesFile)) {
    $routes = require $routesFile;
    $routes($router);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Routes file not found']);
    exit;
}

// Set CORS headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle request
try {
    $request = new Request();
    $response = $router->dispatch($request);
    $response->send();
} catch (Exception $e) {
    error_log("Uncaught exception: " . $e->getMessage());
    $response = Response::serverError('Internal server error');
    $response->send();
}
