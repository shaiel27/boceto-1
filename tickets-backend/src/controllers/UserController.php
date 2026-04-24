<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Office.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$office = new Office($db);

// Get authenticated user from middleware context
$currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'technicians') {
            $technicians = $user->getTechnicians();
            echo json_encode([
                'success' => true,
                'data' => $technicians
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
