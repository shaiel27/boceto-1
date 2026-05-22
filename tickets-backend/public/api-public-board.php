<?php
// Public API entry for Public Board (init + SSE stream)
// Adjust includes/bootstrap to your project's bootstrap if necessary
require_once __DIR__ . '/../src/Controllers/PublicBoardController.php';

// Obtain PDO $db from existing bootstrap. Adjust this path if your project uses a different bootstrap.
// Example: require_once __DIR__ . '/../src/config/database.php'; // defines $db
if (!isset($db)) {
    // try to include standard config path
    $maybe = __DIR__ . '/../src/config/database.php';
    if (file_exists($maybe)) {
        require_once $maybe; // should populate $db
    }
}

if (!isset($db) || !$db instanceof PDO) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Database connection not found in bootstrap. Please require your DB config in this file.']);
    exit;
}

$controller = new PublicBoardController($db);

$action = $_GET['action'] ?? 'init';
switch ($action) {
    case 'init':
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'data' => $controller->getInitialState()], JSON_UNESCAPED_UNICODE);
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
