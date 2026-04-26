<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Office.php';
require_once __DIR__ . '/../models/Technician.php';

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
            // Get technicians filtered by service ID and availability
            if (!isset($_GET['service_id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'service_id es requerido'
                ]);
                break;
            }
            
            $serviceId = (int)$_GET['service_id'];
            error_log("=== technicians-by-service endpoint called ===");
            error_log("Service ID: {$serviceId}");
            
            $technicianModel = new Technician($db);
            $technicians = $technicianModel->getAllTechniciansByService($serviceId);
            
            error_log("Found " . count($technicians) . " technicians for service {$serviceId}");
            
            echo json_encode([
                'success' => true,
                'data' => $technicians,
                'count' => count($technicians)
            ]);
        } elseif ($action === 'technician-profile') {
            // Get current technician's profile
            if (!$currentUserId) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'No autenticado'
                ]);
                break;
            }
            
            if ($currentUserRole !== 'Tecnico' && $currentUserRole !== 'tecnico') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Solo técnicos pueden ver su perfil'
                ]);
                break;
            }
            
            $technicianModel = new Technician($db);
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
            $profile = $user->getById($_GET['id']);
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
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->action)) {
            switch ($data->action) {
                case 'register':
                    $user->Username = $data->username;
                    $user->Email = $data->email;
                    $user->Password = password_hash($data->password, PASSWORD_DEFAULT);
                    $user->Full_Name = $data->full_name ?? $data->username;
                    $user->Fk_Role = $data->role_id ?? 3; // Default to Jefe role
                    
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
                        http_response_code(201);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Usuario creado exitosamente con oficina',
                            'data' => ['id' => $userId]
                        ]);
                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Error al crear usuario: ' . $e->getMessage()
                        ]);
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
