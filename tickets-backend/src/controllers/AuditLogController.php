<?php
require_once __DIR__ . '/../models/AuditLog.php';
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$auditLog = new AuditLog($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            switch ($action) {
                case 'list':
                    $page = max(1, (int) ($_GET['page'] ?? 1));
                    $limit = max(1, min(100, (int) ($_GET['limit'] ?? 10)));
                    $offset = ($page - 1) * $limit;

                    $filters = [];
                    if (!empty($_GET['search'])) $filters['search'] = $_GET['search'];
                    if (!empty($_GET['action_type'])) $filters['action'] = $_GET['action_type'];
                    if (!empty($_GET['severity'])) $filters['severity'] = $_GET['severity'];
                    if (!empty($_GET['from'])) $filters['from'] = $_GET['from'];
                    if (!empty($_GET['to'])) $filters['to'] = $_GET['to'];
                    if (!empty($_GET['user_id'])) $filters['user_id'] = (int) $_GET['user_id'];

                    $total = $auditLog->count($filters);
                    $rows = $auditLog->getAll($filters, $limit, $offset);

                    $data = array_map(function ($r) {
                        return [
                            'id'                => (int) $r['id'],
                            'eventDate'         => $r['created_at'],
                            'eventType'         => $r['action'],
                            'action'            => $r['description'] ?? $r['action'],
                            'userName'          => $r['email'],
                            'userRole'          => '',
                            'entityType'        => $r['entity_type'] ?? '',
                            'entityId'          => $r['entity_id'] ? (int) $r['entity_id'] : null,
                            'entityDescription' => $r['entity_type'] ? ($r['entity_type'] . ' #' . $r['entity_id']) : '',
                            'description'       => $r['description'] ?? '',
                            'ipAddress'         => $r['ip_address'] ?? '',
                            'userAgent'         => $r['user_agent'] ?? '',
                            'severity'          => $r['severity'] ?? 'info',
                        ];
                    }, $rows);

                    http_response_code(200);
                    echo json_encode([
                        'success'    => true,
                        'data'       => $data,
                        'pagination' => [
                            'page'       => $page,
                            'limit'      => $limit,
                            'total'      => $total,
                            'totalPages' => max(1, (int) ceil($total / $limit)),
                        ],
                    ]);
                    break;

                case 'single':
                    $id = (int) ($_GET['id'] ?? 0);
                    if ($id <= 0) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'ID inválido']);
                        break;
                    }
                    $row = $auditLog->getById($id);
                    if (!$row) {
                        http_response_code(404);
                        echo json_encode(['success' => false, 'message' => 'Registro no encontrado']);
                        break;
                    }
                    echo json_encode([
                        'success' => true,
                        'data'    => [
                            'id'                => (int) $row['id'],
                            'eventDate'         => $row['created_at'],
                            'eventType'         => $row['action'],
                            'action'            => $row['description'] ?? $row['action'],
                            'userName'          => $row['email'],
                            'userRole'          => '',
                            'entityType'        => $row['entity_type'] ?? '',
                            'entityId'          => $row['entity_id'] ? (int) $row['entity_id'] : null,
                            'entityDescription' => $row['entity_type'] ? ($row['entity_type'] . ' #' . $row['entity_id']) : '',
                            'description'       => $row['description'] ?? '',
                            'ipAddress'         => $row['ip_address'] ?? '',
                            'userAgent'         => $row['user_agent'] ?? '',
                            'severity'          => $row['severity'] ?? 'info',
                            'rawData'           => $row['data'] ? json_decode($row['data'], true) : null,
                        ],
                    ]);
                    break;

                case 'stats':
                    $stats = $auditLog->getStats();
                    echo json_encode([
                        'success' => true,
                        'data'    => $stats,
                    ]);
                    break;

                default:
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Acción no válida']);
                    break;
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Error en AuditLogController: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
