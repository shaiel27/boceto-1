<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ServiceRequest.php';
require_once __DIR__ . '/../models/TicketComment.php';
require_once __DIR__ . '/../models/Technician.php';

$database = new Database();
$db = $database->getConnection();

$ticket = new ServiceRequest($db);
$comment = new TicketComment($db);
$technician = new Technician($db);

// Get authenticated user from middleware context
$currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'stats':
                // Only admin and boss can see stats
                if (!in_array($currentUserRole, ['administrador', 'jefe'], true)) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Permiso insuficiente'
                    ]);
                    break;
                }
                
                $stats = $ticket->getStats();
                echo json_encode([
                    'success' => true,
                    'data' => $stats
                ]);
                break;
                
            case 'single':
                if (isset($_GET['id'])) {
                    $ticket_data = $ticket->getById($_GET['id']);
                    
                    if (!$ticket_data) {
                        http_response_code(404);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Ticket no encontrado'
                        ]);
                        break;
                    }
                    
                    // Check ownership: users can only see their own tickets unless admin
                    if ($currentUserRole !== 'administrador' && 
                        $ticket_data['Fk_User_Requester'] != $currentUserId) {
                        http_response_code(403);
                        echo json_encode([
                            'success' => false,
                            'message' => 'No tienes permiso para ver este ticket'
                        ]);
                        break;
                    }
                    
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
                // Users can only see their own tickets
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
                
                $tickets = $ticket->getByUser($currentUserId, $limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $tickets
                ]);
                break;
                
            case 'technician-tickets':
                // Technicians can see their assigned tickets
                if (!$currentUserId || $currentUserRole !== 'tecnico') {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Solo técnicos pueden ver sus tickets asignados'
                    ]);
                    break;
                }
                
                // Get technician ID from user ID
                $techData = $technician->getByUserId($currentUserId);
                if (!$techData) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Técnico no encontrado'
                    ]);
                    break;
                }
                
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $tickets = $ticket->getByTechnician($techData['ID_Technicians'], $limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $tickets
                ]);
                break;
                
            case 'comments':
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID no proporcionado'
                    ]);
                    break;
                }
                
                $comments = $comment->getByTicket($_GET['id']);
                echo json_encode([
                    'success' => true,
                    'data' => $comments
                ]);
                break;
                
            default:
                // Admins and technicians can see all tickets
                if (!in_array($currentUserRole, ['administrador', 'tecnico', 'jefe'], true)) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Permiso insuficiente'
                    ]);
                    break;
                }
                
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
        
        // Action: add comment
        if ($action === 'comment') {
            if (!isset($data->Fk_Service_Request) || !isset($data->Comment)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan datos requeridos'
                ]);
                break;
            }
            
            $comment->Fk_Service_Request = $data->Fk_Service_Request;
            $comment->Fk_User = $currentUserId;
            $comment->Comment = htmlspecialchars(strip_tags($data->Comment));
            
            if ($comment->create()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Comentario agregado exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al agregar comentario'
                ]);
            }
            break;
        }
        
        // Action: assign technician
        if ($action === 'assign-technician') {
            if (!isset($data->ticket_id) || !isset($data->technician_id)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan datos requeridos'
                ]);
                break;
            }
            
            // Only admins can assign technicians
            if ($currentUserRole !== 'administrador') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo administradores pueden asignar técnicos'
                ]);
                break;
            }
            
            $isLead = $data->is_lead ?? true;
            if ($technician->assignToTicket($data->ticket_id, $data->technician_id, $currentUserId, $isLead)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Técnico asignado exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al asignar técnico'
                ]);
            }
            break;
        }
        
        // Default: create ticket
        if (!isset($data->Fk_Office) || !isset($data->Fk_TI_Service)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
            ]);
            break;
        }
        
        // Set requester to current user
        $ticket->Fk_User_Requester = $currentUserId;
        $ticket->Fk_Office = $data->Fk_Office;
        $ticket->Fk_TI_Service = $data->Fk_TI_Service;
        $ticket->Fk_Problem_Catalog = $data->Fk_Problem_Catalog ?? null;
        $ticket->Fk_Boss_Requester = $data->Fk_Boss_Requester ?? null;
        $ticket->Fk_Software_System = $data->Fk_Software_System ?? null;
        $ticket->Subject = htmlspecialchars(strip_tags($data->Subject ?? ''));
        $ticket->Property_Number = htmlspecialchars(strip_tags($data->Property_Number ?? ''));
        $ticket->Description = htmlspecialchars(strip_tags($data->Description ?? ''));
        
        // Validate priority
        $allowedPriorities = ['Baja', 'Media', 'Alta'];
        $ticket->System_Priority = in_array($data->System_Priority, $allowedPriorities, true) 
            ? $data->System_Priority 
            : 'Media';
        
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
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID no proporcionado'
            ]);
            break;
        }
        
        $ticket_id = (int)$_GET['id'];
        
        // Action: update priority
        if ($action === 'priority') {
            if (!isset($data->System_Priority)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Prioridad no proporcionada'
                ]);
                break;
            }
            
            // Only admins can update priority
            if ($currentUserRole !== 'administrador') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo administradores pueden cambiar la prioridad'
                ]);
                break;
            }
            
            if ($ticket->updatePriority($ticket_id, $data->System_Priority)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Prioridad actualizada exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al actualizar prioridad'
                ]);
            }
            break;
        }
        
        // Action: update status (close ticket)
        if (!isset($data->Status)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Estado no proporcionado'
            ]);
            break;
        }
        
        $status = htmlspecialchars(strip_tags($data->Status));
        
        // Only technicians and admins can update ticket status
        if (!in_array($currentUserRole, ['administrador', 'tecnico'], true)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Solo técnicos y administradores pueden actualizar tickets'
            ]);
            break;
        }
        
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
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}
?>
