<?php
// Public API entry for Public Board (init + SSE stream)
// Adjust includes/bootstrap to your project's bootstrap if necessary
require_once __DIR__ . '/../src/Controllers/PublicBoardController.php';
// Standard Database bootstrap for the project
require_once __DIR__ . '/../src/config/database.php';

$dbInstance = new Database();
$db = $dbInstance->getConnection();
$controller = new PublicBoardController($db);

$action = $_GET['action'] ?? 'init';
switch ($action) {
    case 'init':
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'data' => $controller->getInitialState()], JSON_UNESCAPED_UNICODE);
        break;
    case 'poll':
        $since = $_GET['since'] ?? null;
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'data' => $controller->getUpdatesSince($since),
        ], JSON_UNESCAPED_UNICODE);
        break;
    case 'stream':
        $since = $_GET['since'] ?? null;
        $controller->streamEvents($since);
        break;
    default:
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'invalid action'], JSON_UNESCAPED_UNICODE);
}
