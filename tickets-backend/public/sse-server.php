<?php
// Standalone SSE server — run on a separate port to avoid blocking the main API
// Usage: php -S 0.0.0.0:8001 -t public sse-server.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Only handle the SSE stream endpoint
if ($uri !== '/api/public-board' && $uri !== '/api/public-board/') {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'not found']);
    exit;
}

$action = $_GET['action'] ?? '';
if ($action !== 'stream') {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'this server only handles stream']);
    exit;
}

require_once __DIR__ . '/../src/Controllers/PublicBoardController.php';
require_once __DIR__ . '/../src/config/database.php';

$dbInstance = new Database();
$db = $dbInstance->getConnection();
$controller = new PublicBoardController($db);

$since = $_GET['since'] ?? null;
$controller->streamEvents($since);
