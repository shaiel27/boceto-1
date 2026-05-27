<?php
declare(strict_types=1);

// ── Standalone SSE server ───────────────────────────────────────────────
// Run on a separate port to avoid blocking the main API with the long-lived
// SSE connection (PHP built-in server is single-threaded).
//
// Usage: php -S 0.0.0.0:8001 -t public public/sse-server.php
// ────────────────────────────────────────────────────────────────────────

// ── CORS ────────────────────────────────────────────────────────────────
// Dinámico: permite cualquier origen del mismo host para funcionar en cualquier red
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$corsAllowed = false;
if (in_array($origin, $allowedOrigins, true)) {
    $corsAllowed = true;
} elseif ($origin) {
    $originHost = parse_url($origin, PHP_URL_HOST);
    $serverHost = explode(':', $_SERVER['HTTP_HOST'] ?? '')[0];
    if ($originHost === $serverHost || $originHost === 'localhost' || $originHost === '127.0.0.1') {
        $corsAllowed = true;
    }
}
if ($corsAllowed) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ── Routing ─────────────────────────────────────────────────────────────
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri !== '/api/public-board' && $uri !== '/api/public-board/') {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'not found'], JSON_UNESCAPED_UNICODE);
    exit;
}

$action = $_GET['action'] ?? '';

// ── Load dependencies ───────────────────────────────────────────────────
require_once __DIR__ . '/../src/Controllers/PublicBoardController.php';
require_once __DIR__ . '/../src/config/database.php';

$dbInstance = new Database();
$db = $dbInstance->getConnection();
$controller = new PublicBoardController($db);

// ── Dispatch ────────────────────────────────────────────────────────────
switch ($action) {
    case 'init':
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(
            ['success' => true, 'data' => $controller->getInitialState()],
            JSON_UNESCAPED_UNICODE
        );
        break;

    case 'stream':
        $since = $_GET['since'] ?? null;
        $controller->streamEvents($since);
        break;

    default:
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'invalid action'], JSON_UNESCAPED_UNICODE);
}
