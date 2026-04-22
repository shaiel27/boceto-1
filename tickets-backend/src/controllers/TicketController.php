<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ServiceRequest.php';

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

            case 'my-tickets':
                if (isset($_GET['user_id'])) {
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                    
                    $tickets = $ticket->getByUser($_GET['user_id'], $limit, $offset);
                    echo json_encode([
                        'success' => true,
                        'data' => $tickets
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'User ID no proporcionado'
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
        
        if (isset($data->Fk_Office) && isset($data->Fk_User_Requester) && isset($data->Fk_TI_Service)) {
            $ticket->Fk_Office = $data->Fk_Office;
            $ticket->Fk_User_Requester = $data->Fk_User_Requester;
            $ticket->Fk_TI_Service = $data->Fk_TI_Service;
            $ticket->Fk_Problem_Catalog = $data->Fk_Problem_Catalog ?? null;
            $ticket->Fk_Boss_Requester = $data->Fk_Boss_Requester ?? null;
            $ticket->Fk_Software_System = $data->Fk_Software_System ?? null;
            $ticket->Subject = $data->Subject ?? '';
            $ticket->Property_Number = $data->Property_Number ?? '';
            $ticket->Description = $data->Description ?? '';
            $ticket->System_Priority = $data->System_Priority ?? 'Media';
            
            if ($ticket->create()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Ticket creado exitosamente',
                    'ticket_id' => $ticket->ID_Service_Request
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
        
        if (isset($_GET['id']) && isset($data->Status)) {
            $ticket_id = $_GET['id'];
            $status = $data->Status;
            
            if ($ticket->updateStatus($ticket_id, $status)) {
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
