<?php
declare(strict_types=1);

// PHP-PRO: Define global constant for default ticket limit
define('DEFAULT_TICKET_LIMIT', 1000);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ServiceRequest.php';
require_once __DIR__ . '/../models/TicketComment.php';
require_once __DIR__ . '/../models/TicketAttachment.php';
require_once __DIR__ . '/../models/TicketTimeline.php';
require_once __DIR__ . '/../models/AssistanceRequest.php';
require_once __DIR__ . '/../models/Technician.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/AuditLog.php';
require_once __DIR__ . '/../models/ServiceProblemsCatalog.php';
require_once __DIR__ . '/../Services/AuditService.php';

use App\Models\Notification;
require_once __DIR__ . '/../DTO/CreateTicketDTO.php';
require_once __DIR__ . '/../DTO/NotificationDTO.php';
require_once __DIR__ . '/../Services/TicketService.php';
require_once __DIR__ . '/../Services/NotificationService.php';

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

    $ticket = new ServiceRequest($db);
    $comment = new TicketComment($db);
    $attachment = new TicketAttachment($db);
    $assistanceRequest = new AssistanceRequest($db);
    $timeline = new TicketTimeline($db);
    $technician = new Technician($db);
    $notification = new Notification($db);
    $notificationService = new NotificationService($db, $notification);
    $ticketService = new TicketService($db, $ticket, $technician, $notificationService);
    $auditLog = new AuditLog($db);
    $auditService = new AuditService($auditLog);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
}

// Get authenticated user from middleware context
$currentUserId = isset($_SERVER['AUTH_USER_ID']) ? (int) $_SERVER['AUTH_USER_ID'] : null;
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;
$currentUserRole = $currentUserRole !== null ? strtolower($currentUserRole) : null;

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'stats':
                // Only admin and boss can see stats
                if (!in_array($currentUserRole, ['admin', 'jefe'], true)) {
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
                    $ticket_data = $ticket->getById((int) $_GET['id']);
                    
                    if (!$ticket_data) {
                        http_response_code(404);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Ticket no encontrado'
                        ]);
                        break;
                    }
                    
                    // Check ownership: users can only see their own tickets unless admin
                    if ($currentUserRole !== 'admin' && 
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
                
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : DEFAULT_TICKET_LIMIT;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $tickets = $ticket->getByUser($currentUserId, $limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $tickets
                ]);
                break;
                
            case 'technician-tickets':
                // Technicians can see their assigned tickets
                if (!$currentUserId ||                $currentUserRole !== 'tecnico') {
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
                
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : DEFAULT_TICKET_LIMIT;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $tickets = $ticket->getByTechnician($techData['ID_Technicians'], $limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $tickets
                ]);
                break;
                
            case 'comments':
                error_log("=== GET COMMENTS ACTION ===");
                error_log("Ticket ID: " . ($_GET['id'] ?? 'NOT SET'));
                
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID no proporcionado'
                    ]);
                    break;
                }

                $ticketId = (int)$_GET['id'];
                $comments = $comment->getByTicket($ticketId);
                
                // Attach files to each comment
                $allAttachments = $attachment->getByTicket($ticketId);
                $attachmentsByComment = [];
                $ticketAttachments = [];
                foreach ($allAttachments as $att) {
                    if ($att['Fk_Comment'] === null) {
                        $ticketAttachments[] = $att;
                    } else {
                        $attachmentsByComment[$att['Fk_Comment']][] = $att;
                    }
                }
                foreach ($comments as &$cmt) {
                    $cmtId = $cmt['ID_Comment'];
                    $cmt['attachments'] = $attachmentsByComment[$cmtId] ?? [];
                }
                unset($cmt);
                
                error_log("Comments count: " . count($comments));
                
                echo json_encode([
                    'success' => true,
                    'data' => $comments,
                    'count' => count($comments),
                    'ticket_attachments' => $ticketAttachments
                ]);
                break;
                
            case 'attachments':
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID no proporcionado'
                    ]);
                    break;
                }
                
                $ticketId = (int)$_GET['id'];
                $attachments = $attachment->getByTicket($ticketId);
                echo json_encode([
                    'success' => true,
                    'data' => $attachments
                ]);
                break;

            case 'timeline':
                error_log("=== GET TIMELINE ACTION ===");
                error_log("Ticket ID: " . ($_GET['id'] ?? 'NOT SET'));
                
                if (!isset($_GET['id'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID no proporcionado'
                    ]);
                    break;
                }

                $ticketId = (int)$_GET['id'];
                $timelineEvents = $timeline->getByTicket($ticketId);
                
                error_log("Timeline count: " . count($timelineEvents));
                error_log("Timeline data: " . json_encode($timelineEvents));
                
                echo json_encode([
                    'success' => true,
                    'data' => $timelineEvents,
                    'count' => count($timelineEvents)
                ]);
                break;

            case 'available-technicians':
                if (!isset($_GET['service_id'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID de servicio no proporcionado'
                    ]);
                    break;
                }

                $serviceId = (int)$_GET['service_id'];
                error_log("=== AVAILABLE TECHNICIANS REQUEST ===");
                error_log("Service ID from request: " . ($_GET['service_id'] ?? 'NOT SET'));
                error_log("Parsed Service ID: {$serviceId}");
                error_log("Service ID type: " . gettype($serviceId));
                
                if ($serviceId <= 0) {
                    error_log("Invalid service ID: {$serviceId}");
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'ID de servicio inválido'
                    ]);
                    break;
                }
                
                // Return only available technicians (respecting schedule, lunch block and status)
                $availableTechs = $technician->getAvailableTechniciansByService($serviceId);
                
                error_log("Final result count: " . count($availableTechs));
                
                echo json_encode([
                    'success' => true,
                    'data' => $availableTechs,
                    'count' => count($availableTechs)
                ]);
                break;

            case 'filter':
                // Admin filtering by status, service, priority
                if (!in_array($currentUserRole, ['admin', 'jefe'], true)) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Permiso insuficiente'
                    ]);
                    break;
                }

                $status = $_GET['status'] ?? null;
                $serviceId = $_GET['service_id'] ?? null;
                $priority = $_GET['priority'] ?? null;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : DEFAULT_TICKET_LIMIT;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

                $tickets = $ticket->getFiltered($status, $serviceId, $priority, $limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $tickets
                ]);
                break;

            case 'general-report':
                // PHP-PRO: General tickets report with monthly statistics
                if (!in_array($currentUserRole, ['admin', 'jefe'], true)) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Permiso insuficiente'
                    ]);
                    break;
                }

                $query = "SELECT
                    DATE_FORMAT(sr.Created_at, '%Y-%m') AS 'Mes',
                    CAST(COUNT(*) AS UNSIGNED) AS 'Total Tickets',
                    CAST(SUM(CASE WHEN sr.System_Priority = 'Alta' THEN 1 ELSE 0 END) AS UNSIGNED) AS 'Alta Prioridad',
                    CAST(SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) AS UNSIGNED) AS 'Resueltos'
                FROM
                    Service_Request sr
                GROUP BY
                    DATE_FORMAT(sr.Created_at, '%Y-%m')
                ORDER BY
                    DATE_FORMAT(sr.Created_at, '%Y-%m') DESC";

                $stmt = $db->prepare($query);
                $stmt->execute();
                $reportData = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'message' => 'Reporte general de tickets obtenido exitosamente',
                    'data' => $reportData
                ]);
                break;

            case 'pending-assistance':
                if (!in_array($currentUserRole, ['admin', 'jefe'], true)) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Solo administradores pueden ver solicitudes de asistencia'
                    ]);
                    break;
                }

                // Re-notify for pending requests older than 5 min
                $toRenotify = $assistanceRequest->shouldRenotify();
                foreach ($toRenotify as $req) {
                    $ticketData = $ticket->getById((int)$req['Fk_Ticket']);
                    $techUser = getUserName($db, (int)$req['Fk_Requesting_Technician']);
                    if ($ticketData && $techUser) {
                        $notificationService->createAssistanceRequestNotification(
                            (int)$req['Fk_Ticket'],
                            $ticketData['Ticket_Code'] ?? "#{$req['Fk_Ticket']}",
                            $ticketData['Subject'] ?? '',
                            $techUser,
                            (int)$req['ID_Request'],
                            true
                        );
                        $assistanceRequest->markNotified((int)$req['ID_Request']);
                        $auditService->logTicketAction('assistance_renotified', (int)$req['Fk_Ticket'],
                            "Re-notificación de solicitud de asistencia #{$req['ID_Request']}");
                    }
                }

                $pending = $assistanceRequest->getPending();
                echo json_encode([
                    'success' => true,
                    'data' => $pending
                ]);
                break;

            default:
                // Admins and technicians can see all tickets
                if (!in_array($currentUserRole, ['admin', 'tecnico', 'jefe'], true)) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Permiso insuficiente'
                    ]);
                    break;
                }
                
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : DEFAULT_TICKET_LIMIT;
                $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
                
                $tickets = $ticket->getAll($limit, $offset);
                echo json_encode([
                    'success' => true,
                    'data' => $tickets
                ]);
        }
        break;
        
    case 'POST':
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $isMultipart = strpos($contentType, 'multipart/form-data') !== false || !empty($_FILES) || !empty($_POST);
        
        if ($isMultipart) {
            $data = (object)$_POST;
        } else {
            $rawBody = file_get_contents("php://input");
            $data = @json_decode($rawBody);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $data = null;
            }
        }
        
        error_log("=== POST REQUEST ===");
        error_log("Action: {$action}");
        error_log("Content-Type: {$contentType}");
        error_log("POST data: " . json_encode($data));
        
        // Action: add comment
        if ($action === 'comment') {
            error_log("=== ADD COMMENT ACTION ===");
            error_log("Data: " . json_encode($data));
            error_log("Current user ID: {$currentUserId}");
            
            if (!isset($data->Fk_Service_Request) || !isset($data->Comment)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan datos requeridos'
                ]);
                break;
            }
            
            $comment->Fk_Service_Request = (int)$data->Fk_Service_Request;
            $comment->Fk_User = (int)$currentUserId;
            $comment->Comment = htmlspecialchars(strip_tags($data->Comment));
            
            error_log("Creating comment for ticket: {$comment->Fk_Service_Request}");
            
            if ($comment->create()) {
                $commentId = $comment->ID_Comment;
                
                // Handle file uploads
                $uploadedFiles = [];
                if ($isMultipart && !empty($_FILES['files'])) {
                    $uploadDir = __DIR__ . '/../../public/uploads/comments/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    
                    $allowedTypes = [
                        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'text/plain', 'text/csv',
                        'application/zip', 'application/x-rar-compressed'
                    ];
                    
                    $files = $_FILES['files'];
                    $fileCount = is_array($files['name']) ? count($files['name']) : 1;
                    
                    for ($i = 0; $i < $fileCount; $i++) {
                        $fileName = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                        $fileTmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                        $fileSize = is_array($files['size']) ? (int)$files['size'][$i] : (int)$files['size'];
                        $fileType = is_array($files['type']) ? $files['type'][$i] : $files['type'];
                        $fileError = is_array($files['error']) ? $files['error'][$i] : $files['error'];
                        
                        if ($fileError !== UPLOAD_ERR_OK) {
                            continue;
                        }
                        
                        $maxSize = 10 * 1024 * 1024;
                        if ($fileSize > $maxSize) {
                            continue;
                        }
                        
                        $ext = pathinfo($fileName, PATHINFO_EXTENSION);
                        $safeName = uniqid('cmt_', true) . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                        $destPath = $uploadDir . $safeName;
                        
                        if (move_uploaded_file($fileTmpName, $destPath)) {
                            $attachment->Fk_Service_Request = (int)$data->Fk_Service_Request;
                            $attachment->Fk_Comment = $commentId;
                            $attachment->Fk_User = (int)$currentUserId;
                            $attachment->File_Name = $fileName;
                            $attachment->File_Path = 'uploads/comments/' . $safeName;
                            $attachment->File_Type = $fileType;
                            $attachment->File_Size = $fileSize;
                            
                            if ($attachment->create()) {
                                $uploadedFiles[] = [
                                    'ID_Attachment' => $attachment->ID_Attachment,
                                    'File_Name' => $fileName,
                                    'File_Path' => 'uploads/comments/' . $safeName,
                                    'File_Type' => $fileType,
                                    'File_Size' => $fileSize
                                ];
                            }
                        }
                    }
                }
                
                $auditService->logTicketAction('create_comment', (int) $comment->Fk_Service_Request, "Comentario agregado al ticket #{$comment->Fk_Service_Request} con " . count($uploadedFiles) . " archivos adjuntos");
                error_log("Comment created successfully with " . count($uploadedFiles) . " files");
                echo json_encode([
                    'success' => true,
                    'message' => 'Comentario agregado exitosamente',
                    'data' => [
                        'ID_Comment' => $commentId,
                        'files' => $uploadedFiles
                    ]
                ]);
            } else {
                error_log("Failed to create comment");
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
            if ($currentUserRole !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo administradores pueden asignar técnicos'
                ]);
                break;
            }

            $isLead = $data->is_lead ?? true;
            $ticketId = (int)$data->ticket_id;
            $technicianId = (int)$data->technician_id;
            // Asignación manual: permitir asignación cruzada ($allowCrossService = true)
            if ($technician->assignToTicket($ticketId, $technicianId, $currentUserId, $isLead, true)) {
                // Update ticket status to "En Proceso" if it was pending
                $ticketData = $ticket->getById($ticketId);
                if ($ticketData && $ticketData['Status'] === 'Pendiente') {
                    $ticket->updateStatus($ticketId, 'En Proceso');
                }

                // Notify the assigned technician
                try {
                    $techUserData = $technician->getById($technicianId);
                    if ($techUserData && isset($techUserData['Fk_Users'])) {
                        $notificationService->createTechnicianAssignedNotification(
                            technicianUserId: (int)$techUserData['Fk_Users'],
                            ticketId: $ticketId,
                            ticketCode: $ticketData['Ticket_Code'] ?? '',
                            subject: $ticketData['Subject'] ?? '',
                            officeName: $ticketData['office_name'] ?? '',
                            serviceName: $ticketData['service_name'] ?? '',
                            priority: $ticketData['System_Priority'] ?? 'Media'
                        );
                    }
                } catch (\Exception $e) {
                    error_log("Error notifying technician: " . $e->getMessage());
                }

                $techName = $ticketData ? ($ticketData['Full_Name'] ?? 'Técnico #' . $technicianId) : ('Técnico #' . $technicianId);
                $auditService->logAssignment($ticketId, $technicianId, $techName, $currentUserId, 'manual');
                $timeline->create($ticketId, (int) $currentUserId, "Técnico {$techName} asignado", null, 'En Proceso');

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

        // Action: assign multiple technicians
        if ($action === 'assign-multiple-technicians') {
            error_log("=== assign-multiple-technicians called ===");
            error_log("Request data: " . json_encode($data));
            error_log("Current user role: " . ($currentUserRole ?? 'null'));

            if (!isset($data->ticket_id) || !isset($data->technician_ids) || !is_array($data->technician_ids)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan datos requeridos'
                ]);
                break;
            }

            // Only admins can assign technicians
            if ($currentUserRole !== 'admin') {
                error_log("Permission denied: user role is {$currentUserRole}, not Admin");
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo administradores pueden asignar técnicos'
                ]);
                break;
            }

            $assignedCount = 0;
            $failedAssignments = [];

            $assignedTechNames = [];

            foreach ($data->technician_ids as $index => $techId) {
                $isLead = ($index === 0); // First technician is lead
                error_log("Assigning technician {$techId} to ticket {$data->ticket_id} (isLead: " . ($isLead ? 'true' : 'false') . ")");

                // Asignación manual: permitir asignación cruzada ($allowCrossService = true)
                if ($technician->assignToTicket($data->ticket_id, $techId, $currentUserId, $isLead, true)) {
                    $assignedCount++;
                    $assignedTechNames[] = 'Técnico #' . $techId;
                    $auditService->logAssignment((int) $data->ticket_id, (int) $techId, 'Técnico #' . $techId, (int) $currentUserId, 'manual');
                    error_log("Successfully assigned technician {$techId}");
                } else {
                    $failedAssignments[] = $techId;
                    error_log("Failed to assign technician {$techId}");
                }
            }

            // Update ticket status to "En Proceso" if it was pending
            if ($assignedCount > 0) {
                $ticketData = $ticket->getById($data->ticket_id);
                if ($ticketData && $ticketData['Status'] === 'Pendiente') {
                    $ticket->updateStatus($data->ticket_id, 'En Proceso');
                }
                $timeline->create((int) $data->ticket_id, (int) $currentUserId, "{$assignedCount} técnico(s) asignado(s): " . implode(', ', $assignedTechNames), null, 'En Proceso');

                // Notify assigned technicians
                try {
                    foreach ($data->technician_ids as $techId) {
                        $techUserData = $technician->getById((int)$techId);
                        if ($techUserData && isset($techUserData['Fk_Users'])) {
                            $notificationService->createTechnicianAssignedNotification(
                                technicianUserId: (int)$techUserData['Fk_Users'],
                                ticketId: (int)$data->ticket_id,
                                ticketCode: $ticketData['Ticket_Code'] ?? '',
                                subject: $ticketData['Subject'] ?? '',
                                officeName: $ticketData['office_name'] ?? '',
                                serviceName: $ticketData['service_name'] ?? '',
                                priority: $ticketData['System_Priority'] ?? 'Media'
                            );
                        }
                    }
                } catch (\Exception $e) {
                    error_log("Error notifying technicians: " . $e->getMessage());
                }
            }

            error_log("Assignment complete: {$assignedCount} assigned, " . count($failedAssignments) . " failed");

            echo json_encode([
                'success' => $assignedCount > 0,
                'message' => $assignedCount > 0
                    ? "Asignados {$assignedCount} técnicos exitosamente"
                    : 'No se pudo asignar ningún técnico',
                'assigned_count' => $assignedCount,
                'failed_assignments' => $failedAssignments
            ]);
            break;
        }

        // Action: unassign technician
        if ($action === 'unassign-technician') {
            if (!isset($data->ticket_id) || !isset($data->technician_id)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan datos requeridos'
                ]);
                break;
            }

            // Only admins can unassign technicians
            if ($currentUserRole !== 'admin') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo administradores pueden reasignar técnicos'
                ]);
                break;
            }

            if ($technician->unassignFromTicket($data->ticket_id, $data->technician_id)) {
                $auditService->log('unassign_technician', [
                    'entity_type' => 'Ticket',
                    'entity_id'   => (int) $data->ticket_id,
                    'description' => "Técnico #{$data->technician_id} desasignado del ticket #{$data->ticket_id}",
                    'data'        => ['technician_id' => (int) $data->technician_id],
                ]);
                $timeline->create((int) $data->ticket_id, (int) $currentUserId, "Técnico #{$data->technician_id} desasignado", null, null);
                echo json_encode([
                    'success' => true,
                    'message' => 'Técnico desasignado exitosamente'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al desasignar técnico'
                ]);
            }
            break;
        }
        
        // Action: update status (close ticket)
        if ($action === 'update-status') {
            error_log("=== UPDATE-STATUS ACTION ===");
            error_log("GET params: " . json_encode($_GET));
            error_log("POST data: " . json_encode($data));
            error_log("Current user role: {$currentUserRole}");
            
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de ticket no proporcionado'
                ]);
                break;
            }
            
            $ticket_id = (int)$_GET['id'];
            error_log("Ticket ID: {$ticket_id}");
            
            if (!isset($data->Status) && !isset($data->status)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Estado no proporcionado'
                ]);
                break;
            }
            
            $status = isset($data->Status) ? htmlspecialchars(strip_tags($data->Status)) : htmlspecialchars(strip_tags($data->status));
            error_log("Status to update: {$status}");
            
            // Only technicians and admins can update ticket status
            if (!in_array($currentUserRole, ['admin', 'tecnico'], true)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo técnicos y administradores pueden actualizar tickets'
                ]);
                break;
            }
            
            error_log("Updating ticket {$ticket_id} status to: {$status}");
            
            // Fetch old status before updating to get accurate "from" value
            $oldData = $ticket->getById($ticket_id);
            $oldStatus = $oldData['Status'] ?? 'Desconocido';
            
            if ($ticket->updateStatus($ticket_id, $status)) {
                $actionType = ($status === 'Cerrado' || $status === 'Resuelto') ? 'close_ticket' : 'update_ticket';
                $description = ($actionType === 'close_ticket')
                    ? "Ticket #{$ticket_id} cerrado (estado anterior: {$oldStatus})"
                    : "Ticket #{$ticket_id}: estado cambiado de {$oldStatus} a {$status}";
                $auditService->logTicketAction($actionType, $ticket_id, $description);
                $timeline->create($ticket_id, (int) $currentUserId, "Estado cambiado de {$oldStatus} a {$status}", $oldStatus, $status);
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
        }
        
        // Action: request assistance (technician requests admin help)
        if ($action === 'assistance') {
            $ticketId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if (!$ticketId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'ID de ticket no proporcionado'
                ]);
                break;
            }

            $ticketData = $ticket->getById($ticketId);
            if (!$ticketData) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Ticket no encontrado'
                ]);
                break;
            }

            $existing = $assistanceRequest->getByTicket($ticketId);
            if ($existing && $existing['Status'] === 'PENDIENTE') {
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'message' => 'Ya existe una solicitud de asistencia pendiente para este ticket'
                ]);
                break;
            }

            $assistanceRequest->Fk_Ticket = $ticketId;
            $assistanceRequest->Fk_Requesting_Technician = (int)$currentUserId;

            if ($assistanceRequest->create()) {
                $requestId = $assistanceRequest->ID_Request;
                $techUser = getUserName($db, (int)$currentUserId);

                $notifSent = $notificationService->createAssistanceRequestNotification(
                    $ticketId,
                    $ticketData['Ticket_Code'] ?? "#{$ticketId}",
                    $ticketData['Subject'] ?? '',
                    $techUser,
                    $requestId
                );
                if (!$notifSent) {
                    error_log("Assistance request #{$requestId}: notification creation failed (table missing or no admins)");
                }

                $auditService->logTicketAction('assistance_requested', $ticketId,
                    "Solicitud de asistencia #{$requestId} creada por {$techUser} para ticket #{$ticketId}");

                echo json_encode([
                    'success' => true,
                    'message' => 'Solicitud de asistencia enviada. Los administradores han sido notificados.',
                    'data' => [
                        'request_id' => $requestId,
                        'status' => 'PENDIENTE'
                    ]
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear solicitud de asistencia'
                ]);
            }
            break;
        }

        // Action: respond to assistance request (admin assigns/rejects)
        if ($action === 'respond-assistance') {
            if (!in_array($currentUserRole, ['admin', 'jefe'], true)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo administradores pueden responder solicitudes'
                ]);
                break;
            }

            $requestId = isset($data->request_id) ? (int)$data->request_id : 0;
            $response = $data->response ?? '';

            if (!$requestId || !in_array($response, ['accept', 'reject'], true)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Datos inválidos'
                ]);
                break;
            }

            if ($response === 'accept') {
                if ($assistanceRequest->assign($requestId, (int)$currentUserId)) {
                    $pendingList = $assistanceRequest->getPending();
                    $reqData = null;
                    foreach ($pendingList as $r) {
                        if ((int)$r['ID_Request'] === $requestId) {
                            $reqData = $r;
                            break;
                        }
                    }
                    $reqData = $assistanceRequest->getByTicket($reqData['Fk_Ticket'] ?? 0);

                    $adminName = getUserName($db, (int)$currentUserId);
                    if ($reqData) {
                        $notificationService->createAssistanceAssignedNotification(
                            (int)$reqData['Fk_Requesting_Technician'],
                            (int)$reqData['Fk_Ticket'],
                            $reqData['ticket_subject'] ?? "#{$reqData['Fk_Ticket']}",
                            $adminName
                        );
                    }

                    $auditService->logTicketAction('assistance_assigned', $reqData['Fk_Ticket'] ?? 0,
                        "Solicitud de asistencia #{$requestId} aceptada por {$adminName}");

                    echo json_encode([
                        'success' => true,
                        'message' => 'Solicitud de asistencia aceptada'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al aceptar solicitud'
                    ]);
                }
            } else {
                if ($assistanceRequest->reject($requestId)) {
                    $pendingList = $assistanceRequest->getPending();
                    $reqData = findRequestById($pendingList, $requestId);

                    $adminName = getUserName($db, (int)$currentUserId);
                    if ($reqData) {
                        $notificationService->createAssistanceRejectedNotification(
                            (int)$reqData['Fk_Requesting_Technician'],
                            (int)$reqData['Fk_Ticket'],
                            $reqData['ticket_subject'] ?? "#{$reqData['Fk_Ticket']}"
                        );
                    }

                    $auditService->logTicketAction('assistance_rejected', $reqData['Fk_Ticket'] ?? 0,
                        "Solicitud de asistencia #{$requestId} rechazada por {$adminName}");

                    echo json_encode([
                        'success' => true,
                        'message' => 'Solicitud de asistencia rechazada'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al rechazar solicitud'
                    ]);
                }
            }
            break;
        }

        // Action: upload files to ticket
        if ($action === 'upload-files') {
            if (!$currentUserId) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'No autenticado'
                ]);
                break;
            }

            $ticketId = isset($data->ticket_id) ? (int)$data->ticket_id : (isset($data->ticketId) ? (int)$data->ticketId : 0);

            if ($ticketId <= 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Falta ticket_id'
                ]);
                break;
            }

            $uploadDir = __DIR__ . '/../../public/uploads/tickets/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain', 'text/csv',
                'application/zip', 'application/x-rar-compressed'
            ];

            error_log("=== UPLOAD FILES ACTION ===");
            error_log("ticket_id: {$ticketId}");
            error_log("isMultipart: " . ($isMultipart ? 'true' : 'false'));
            error_log("FILES keys: " . implode(', ', array_keys($_FILES)));
            error_log("FILES[files] exists: " . (isset($_FILES['files']) ? 'yes' : 'no'));

            $uploadedFiles = [];

            if (!$isMultipart || empty($_FILES['files'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'No se recibieron archivos'
                ]);
                break;
            }

            $files = $_FILES['files'];
            $fileCount = is_array($files['name']) ? count($files['name']) : 1;

            for ($i = 0; $i < $fileCount; $i++) {
                $fileName = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                $fileTmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $fileSize = is_array($files['size']) ? (int)$files['size'][$i] : (int)$files['size'];
                $fileType = is_array($files['type']) ? $files['type'][$i] : $files['type'];
                $fileError = is_array($files['error']) ? $files['error'][$i] : $files['error'];

                if ($fileError !== UPLOAD_ERR_OK) {
                    error_log("Upload error for file {$fileName}: error code {$fileError}");
                    continue;
                }

                $maxSize = 10 * 1024 * 1024;
                if ($fileSize > $maxSize) {
                    error_log("File {$fileName} exceeds max size: {$fileSize} > {$maxSize}");
                    continue;
                }

                $ext = pathinfo($fileName, PATHINFO_EXTENSION);
                $safeName = uniqid('tkt_', true) . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $destPath = $uploadDir . $safeName;

                if (move_uploaded_file($fileTmpName, $destPath)) {
                    $attachment->Fk_Service_Request = $ticketId;
                    $attachment->Fk_Comment = null;
                    $attachment->Fk_User = (int)$currentUserId;
                    $attachment->File_Name = $fileName;
                    $attachment->File_Path = 'uploads/tickets/' . $safeName;
                    $attachment->File_Type = $fileType;
                    $attachment->File_Size = $fileSize;

                    if ($attachment->create()) {
                        $uploadedFiles[] = [
                            'ID_Attachment' => $attachment->ID_Attachment,
                            'File_Name' => $fileName,
                            'File_Path' => 'uploads/tickets/' . $safeName,
                            'File_Type' => $fileType,
                            'File_Size' => $fileSize
                        ];
                    } else {
                        error_log("Failed to create DB record for file: {$fileName}");
                    }
                } else {
                    error_log("move_uploaded_file failed: tmp={$fileTmpName} dest={$destPath}");
                }
            }

            error_log("Upload loop complete: " . count($uploadedFiles) . " files uploaded successfully");

            $auditService->logTicketAction('upload_files', $ticketId, count($uploadedFiles) . ' archivos adjuntados al ticket #' . $ticketId);

            echo json_encode([
                'success' => true,
                'message' => count($uploadedFiles) . ' archivo(s) subido(s) exitosamente',
                'data' => [
                    'ticket_id' => $ticketId,
                    'files' => $uploadedFiles
                ]
            ]);
            break;
        }

        // Default: create ticket using modern service
        if (!isset($data->Fk_Office) || !isset($data->Fk_TI_Service)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Faltan datos requeridos'
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

        try {
            $dto = CreateTicketDTO::fromArray((array) $data);
            $result = $ticketService->createTicket($dto, (int) $currentUserId);

            $auditService->logTicketAction('create_ticket', $result['ticket_id'], "Ticket creado: {$dto->subject}");
            $ticketData = $ticket->getById((int) $result['ticket_id']);
            $timeline->create($result['ticket_id'], (int) $currentUserId, "Ticket creado por el usuario", null, 'Pendiente');

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Ticket creado exitosamente',
                'data' => [
                    'ticket_id' => $result['ticket_id'],
                    'technician_assigned' => $result['technician_assigned'],
                    'technician_name' => $result['technician_name']
                ]
            ]);
        } catch (\InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        } catch (\RuntimeException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error inesperado al crear ticket'
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
            if ($currentUserRole !== 'admin') {
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
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}

/**
 * Get user's full name by ID
 */
function getUserName(PDO $db, int $userId): string {
    try {
        $stmt = $db->prepare("SELECT Full_Name FROM Users WHERE ID_Users = :id");
        $stmt->bindParam(":id", $userId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['Full_Name'] ?? 'Usuario';
    } catch (PDOException $e) {
        error_log("Error getting user name: " . $e->getMessage());
        return 'Usuario';
    }
}

/**
 * Find request by ID in array
 */
function findRequestById(array $list, int $id): ?array {
    foreach ($list as $item) {
        if ((int)$item['ID_Request'] === $id) return $item;
    }
    return null;
}
?>
