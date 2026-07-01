<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Office.php';
require_once __DIR__ . '/../models/Technician.php';
require_once __DIR__ . '/../models/AuditLog.php';
require_once __DIR__ . '/../models/UserSystem.php';
require_once __DIR__ . '/../Services/AuditService.php';

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

    $user = new User($db);
    $office = new Office($db);
    $auditService = new AuditService(new AuditLog($db));
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

error_log("=== UserController ===");
error_log("Method: {$method}");
error_log("Action: {$action}");
error_log("User ID: {$currentUserId}");
error_log("User Role: {$currentUserRole}");

switch ($method) {
    case 'GET':
        if ($action === 'technicians') {
            error_log("Getting technicians");
            $technicians = $user->getTechnicians();
            echo json_encode([
                'success' => true,
                'data' => $technicians
            ]);
        } elseif ($action === 'technicians-with-services') {
            error_log("=== technicians-with-services endpoint called ===");
            error_log("User ID: {$currentUserId}");
            error_log("User Role: {$currentUserRole}");
            
            $technicians = $user->getTechniciansWithServices();
            error_log("Found " . count($technicians) . " technicians");
            
            echo json_encode([
                'success' => true,
                'data' => $technicians,
                'count' => count($technicians)
            ]);
        } elseif ($action === 'technicians-by-service') {
            $serviceId = isset($_GET['service_id']) ? (int)$_GET['service_id'] : 0;
            
            $technicianModel = new Technician($db);
            
            if ($serviceId > 0) {
                $technicians = $technicianModel->getAllTechniciansByService($serviceId);
            } else {
                $technicians = $technicianModel->getAll();
            }
            
            error_log("Found " . count($technicians) . " technicians for service {$serviceId}");
            
            echo json_encode([
                'success' => true,
                'data' => $technicians,
                'count' => count($technicians)
            ]);
        } elseif ($action === 'technician-profile') {
            // Get current technician's profile with AUTO-AVAILABILITY calculation
            if (!$currentUserId) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'No autenticado'
                ]);
                break;
            }
            
            if ($currentUserRole !== 'tecnico') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo técnicos pueden ver su perfil'
                ]);
                break;
            }
            
            $technicianModel = new Technician($db);
            
            // PHP-PRO: Execute automatic availability update BEFORE getting profile
            // This ensures technician always sees their real-time status based on:
            // - Work schedule (Inactivo if outside work hours)
            // - Lunch block (Ocupado during lunch)
            // - Active tickets (Ocupado if handling tickets)
            $currentDaySpanish = date('l');
            $dayMap = [
                'Monday' => 'Lunes',
                'Tuesday' => 'Martes',
                'Wednesday' => 'Miercoles',
                'Thursday' => 'Jueves',
                'Friday' => 'Viernes',
                'Saturday' => 'Sabado',
                'Sunday' => 'Domingo'
            ];
            $currentDaySpanish = $dayMap[$currentDaySpanish] ?? $currentDaySpanish;
            $currentTime = date('H:i:s');
            
            // Get technician ID first
            $techData = $technicianModel->getByUserId($currentUserId);
            
            if (!$techData) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Técnico no encontrado'
                ]);
                break;
            }
            
            // Update status based on work schedule, lunch block, and active tickets
            $techId = $techData['ID_Technicians'];
            
            // Get current schedule and lunch info
            $scheduleQuery = "SELECT sched.Work_Start_Time, sched.Work_End_Time,
                                    lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End
                             FROM Technicians t
                             LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                             LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician 
                                AND sched.Day_Of_Week = :currentDay
                             WHERE t.ID_Technicians = :techId";
            
            $scheduleStmt = $db->prepare($scheduleQuery);
            $scheduleStmt->bindParam(":currentDay", $currentDaySpanish);
            $scheduleStmt->bindParam(":techId", $techId);
            $scheduleStmt->execute();
            $scheduleData = $scheduleStmt->fetch(PDO::FETCH_ASSOC);
            
            // Get active tickets count
            $ticketsQuery = "SELECT COUNT(*) as Active_Tickets
                            FROM Ticket_Technicians tt
                            INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                            WHERE tt.Fk_Technician = :techId
                            AND tt.Status = 'Activo'
                            AND sr.Status NOT IN ('Cerrado', 'Resuelto')";
            
            $ticketsStmt = $db->prepare($ticketsQuery);
            $ticketsStmt->bindParam(":techId", $techId);
            $ticketsStmt->execute();
            $ticketsData = $ticketsStmt->fetch(PDO::FETCH_ASSOC);
            
            $currentSeconds = strtotime($currentTime);
            $isInWorkHours = false;
            $isInLunchBlock = false;
            $hasActiveTickets = ($ticketsData['Active_Tickets'] > 0);
            
            if ($scheduleData['Work_Start_Time'] && $scheduleData['Work_End_Time']) {
                $workStartSeconds = strtotime($scheduleData['Work_Start_Time']);
                $workEndSeconds = strtotime($scheduleData['Work_End_Time']);
                $isInWorkHours = ($currentSeconds >= $workStartSeconds && $currentSeconds <= $workEndSeconds);
            }
            
            if ($scheduleData['Lunch_Start'] && $scheduleData['Lunch_End']) {
                $lunchStartSeconds = strtotime($scheduleData['Lunch_Start']);
                $lunchEndSeconds = strtotime($scheduleData['Lunch_End']);
                $isInLunchBlock = ($currentSeconds >= $lunchStartSeconds && $currentSeconds <= $lunchEndSeconds);
            }
            
            // Calculate new status
            if (!$isInWorkHours) {
                $newStatus = 'Inactivo';
            } elseif ($isInLunchBlock) {
                $newStatus = 'Ocupado';
            } elseif ($hasActiveTickets) {
                $newStatus = 'Ocupado';
            } else {
                $newStatus = 'Disponible';
            }
            
            // Update status in database
            $updateQuery = "UPDATE Technicians SET Status = :newStatus WHERE ID_Technicians = :techId";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(":newStatus", $newStatus);
            $updateStmt->bindParam(":techId", $techId);
            $updateStmt->execute();
            
            // Refresh tech data after status update
            $techData = $technicianModel->getByUserId($currentUserId);
            
            if (!$techData) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Técnico no encontrado'
                ]);
                break;
            }
            
            // Get technician's services
            $services = $technicianModel->getServices($techData['ID_Technicians']);
            
            // Get technician's schedules
            $schedules = $technicianModel->getSchedules($techData['ID_Technicians']);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $techData['ID_Technicians'],
                    'user_id' => $techData['Fk_Users'],
                    'first_name' => $techData['First_Name'],
                    'last_name' => $techData['Last_Name'],
                    'email' => $techData['Email'],
                    'username' => $techData['Username'],
                    'status' => $techData['Status'],
                    'lunch_block' => $techData['Fk_Lunch_Block'],
                    'lunch_block_name' => $techData['Block_Name'],
                    'lunch_start_time' => $techData['Start_Time'],
                    'lunch_end_time' => $techData['End_Time'],
                    'created_at' => $techData['created_at'],
                    'services' => $services,
                    'schedules' => $schedules
                ]
            ]);
        } elseif ($action === 'test') {
            echo json_encode([
                'success' => true,
                'message' => 'Users endpoint is working',
                'user_id' => $currentUserId,
                'user_role' => $currentUserRole,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } elseif ($action === 'profile' && isset($_GET['id'])) {
            $profile = $user->getById((int)$_GET['id']);
            if ($profile) {
                echo json_encode([
                    'success' => true,
                    'data' => $profile
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ]);
            }
        } elseif ($action === 'users-with-office') {
            $users = $user->getAllWithOffice();
            echo json_encode([
                'success' => true,
                'data' => $users
            ]);
        } elseif ($action === 'offices') {
            $offices = $office->getAll();
            echo json_encode([
                'success' => true,
                'data' => $offices
            ]);
        } else {
            // Get all users
            $users = $user->getAll();
            echo json_encode([
                'success' => true,
                'data' => $users
            ]);
        }
        break;
        
    case 'POST':
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput);

        error_log("=== POST Request Debug ===");
        error_log("Raw Input: " . $rawInput);
        error_log("Decoded Data: " . json_encode($data));
        error_log("Query Action: " . ($_GET['action'] ?? 'not set'));

        // PHP-PRO: Read action from query string for RESTful consistency
        $action = $_GET['action'] ?? ($data->action ?? null);
        error_log("Final Action: " . ($action ?? 'not set'));

        if ($action) {
            switch ($action) {
                case 'register':
                    $user->Username = $data->username;
                    $user->Email = $data->email;
                    $user->Password = password_hash($data->password, PASSWORD_DEFAULT);
                    $user->Full_Name = $data->full_name ?? $data->username;
                    $user->Fk_Role = $data->role_id ?? 3; // Default to Jefe role
                    
                    if ($user->create()) {
                        $newId = $db->lastInsertId();
                        $auditService->logUserAction('create_user', (int) $newId, "Usuario creado: {$data->email}", 'warning');
                        http_response_code(201);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Usuario creado exitosamente'
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Error al crear usuario'
                        ]);
                    }
                    break;
                    
                case 'create-with-office':
                    $userData = new stdClass();
                    $userData->role = $data->role;
                    $userData->email = $data->email;
                    $userData->password = password_hash($data->password, PASSWORD_DEFAULT);
                    $userData->username = $data->username;
                    $userData->full_name = $data->full_name;
                    
                    if ($data->role == 3) {
                        $userData->name_boss = $data->name_boss;
                        $userData->pronoun = $data->pronoun;
                        $userData->office_id = $data->office_id;
                    }
                    
                    try {
                        $userId = $user->createWithOffice($userData);
                        $auditService->logUserAction('create_user', (int) $userId, "Usuario creado con oficina: {$data->email}", 'warning');
                        http_response_code(201);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Usuario creado exitosamente con oficina',
                            'data' => ['id' => $userId]
                        ]);
                    } catch (Exception $e) {
                        $message = $e->getMessage();
                        $errors = [];

                        if (str_contains($message, '1062') || str_contains($message, 'Duplicate entry')) {
                            if (str_contains($message, 'Email_UNIQUE') || str_contains($message, 'Users.Email')) {
                                $errors['email'] = ['El correo ya está registrado'];
                            }
                            if (str_contains($message, 'Username_UNIQUE') || str_contains($message, 'Users.Username')) {
                                $errors['username'] = ['El usuario ya existe'];
                            }
                        }

                        http_response_code(500);
                        $response = [
                            'success' => false,
                            'message' => $errors ? reset($errors)[0] : 'Error al crear usuario'
                        ];
                        if ($errors) {
                            $response['errors'] = $errors;
                        }
                        echo json_encode($response);
                    }
                    break;

                case 'change-password':
                    error_log("=== Change Password Debug ===");
                    error_log("Current User ID: " . ($currentUserId ?? 'NULL'));
                    error_log("Current User Role: " . ($currentUserRole ?? 'NULL'));
                    error_log("Data received: " . json_encode($data));

                    // Validate required fields
                    if (!isset($data->current_password) || !isset($data->new_password)) {
                        error_log("Missing required fields");
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Se requieren current_password y new_password'
                        ]);
                        break;
                    }

                    // Ensure user is authenticated
                    if (!$currentUserId) {
                        error_log("User not authenticated");
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'message' => 'No autenticado'
                        ]);
                        break;
                    }

                    // Change password
                    $result = $user->changePassword(
                        $currentUserId,
                        $data->current_password,
                        $data->new_password
                    );

                    if ($result['success']) {
                        $auditService->logUserAction('change_password', (int) $currentUserId, "Contraseña cambiada por el usuario", 'warning');
                        http_response_code(200);
                        echo json_encode([
                            'success' => true,
                            'message' => $result['message']
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => $result['message']
                        ]);
                    }
                    break;
                    
                case 'my-systems':
                    if (!$currentUserId) {
                        http_response_code(401);
                        echo json_encode(['success' => false, 'message' => 'No autenticado']);
                        break;
                    }
                    $userSystem = new UserSystem($db);
                    $systems = $userSystem->getByUser($currentUserId);
                    echo json_encode(['success' => true, 'data' => $systems]);
                    break;
                
                case 'assign-systems':
                    if (!$currentUserId) {
                        http_response_code(401);
                        echo json_encode(['success' => false, 'message' => 'No autenticado']);
                        break;
                    }
                    $systemIds = [];
                    $raw = $data->system_ids ?? $data->systemIds ?? [];
                    if (is_array($raw)) {
                        $systemIds = array_map('intval', $raw);
                    }
                    $userSystem = new UserSystem($db);
                    $success = $userSystem->assign($currentUserId, $systemIds);
                    if ($success) {
                        echo json_encode(['success' => true, 'message' => 'Sistemas actualizados']);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Error al guardar sistemas']);
                    }
                    break;
                
                case 'update-profile':
                    if (!$currentUserId) {
                        http_response_code(401);
                        echo json_encode(['success' => false, 'message' => 'No autenticado']);
                        break;
                    }
                    $updateData = (object)[];
                    if (isset($data->Full_Name)) {
                        $updateData->Full_Name = $data->Full_Name;
                    }
                    if (isset($data->Email)) {
                        $updateData->Email = $data->Email;
                    }
                    $updated = $user->update($currentUserId, $updateData);
                    if ($updated) {
                        $auditService->logUserAction('update_profile', (int) $currentUserId, "Perfil actualizado por el usuario", 'info');
                        echo json_encode(['success' => true, 'message' => 'Perfil actualizado exitosamente']);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Error al actualizar perfil']);
                    }
                    break;
                    
                default:
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Acción no válida'
                    ]);
            }
        } else {
            if (isset($data->Username) && isset($data->Email) && isset($data->Password)) {
                $user->Username = $data->Username;
                $user->Email = $data->Email;
                $user->Password = password_hash($data->Password, PASSWORD_DEFAULT);
                $user->Full_Name = $data->Full_Name ?? $data->Username;
                $user->Fk_Role = $data->Fk_Role ?? 3;
                
                if ($user->create()) {
                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Usuario creado exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al crear usuario'
                    ]);
                }
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Faltan datos requeridos'
                ]);
            }
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
