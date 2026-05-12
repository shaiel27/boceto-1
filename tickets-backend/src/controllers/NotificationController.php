<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../DTO/NotificationDTO.php';
require_once __DIR__ . '/../Services/NotificationService.php';

use App\Models\Notification;

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

    $notification = new Notification($db);
    $notificationService = new NotificationService($db, $notification);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}

// Get authenticated user from middleware context
$currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'my-notifications':
                if (!$currentUserId) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'message' => 'No autenticado'
                    ]);
                    break;
                }

                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

                $notifications = $notificationService->getUserNotifications($currentUserId, $limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $notifications
                ]);
                break;

            case 'unread-count':
                if (!$currentUserId) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'message' => 'No autenticado'
                    ]);
                    break;
                }

                $count = $notificationService->getUnreadCount($currentUserId);
                echo json_encode([
                    'success' => true,
                    'data' => ['unread_count' => $count]
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

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if ($action === 'mark-read') {
            if (!isset($data->notification_id)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de notificación no proporcionado'
                ]);
                break;
            }

            if (!$currentUserId) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'No autenticado'
                ]);
                break;
            }

            if ($notificationService->markAsRead((int)$data->notification_id, (int)$currentUserId)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Notificación marcada como leída'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al marcar notificación como leída'
                ]);
            }
            break;
        }

        // Default POST action: create notification (internal use)
        if (!isset($data->type) || !isset($data->title) || !isset($data->message)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ]);
            break;
        }

        try {
            $dto = NotificationDTO::fromArray((array) $data);
            
            if ($notification->create($dto)) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Notificación creada exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear notificación'
                ]);
            }
        } catch (\InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error inesperado al crear notificación'
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
?>
