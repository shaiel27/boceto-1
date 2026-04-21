<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../models/ServiceRequest.php';

$database = new Database();
$db = $database->getConnection();

$ticket = new ServiceRequest($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'stats':
                $stats = $ticket->getStats();
                echo json_encode([
                    'success' => true,
                    'data' => $stats
                ]);
                break;
                
            case 'single':
                if (isset($_GET['id'])) {
                    $ticket_data = $ticket->getById($_GET['id']);
                    echo json_encode([
                        'success' => true,
                        'data' => $ticket_data
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID no proporcionado'
                    ]);
                }
                break;
                
            default:
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $tickets = $ticket->getAll($limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $tickets
                ]);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->user_id) && isset($data->office_id) && isset($data->service_type_id)) {
            $ticket->user_id = $data->user_id;
            $ticket->office_id = $data->office_id;
            $ticket->service_type_id = $data->service_type_id;
            $ticket->subject = $data->subject ?? '';
            $ticket->description = $data->description ?? '';
            $ticket->priority = $data->priority ?? 'Media';
            
            if ($ticket->create()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Ticket creado exitosamente',
                    'ticket_id' => $ticket->id
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear ticket'
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($_GET['id']) && isset($data->status)) {
            $ticket_id = $_GET['id'];
            $status = $data->status;
            $assigned_to = $data->assigned_to ?? null;
            
            if ($ticket->updateStatus($ticket_id, $status, $assigned_to)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Ticket actualizado exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al actualizar ticket'
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
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
