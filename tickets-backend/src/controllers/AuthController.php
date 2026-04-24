<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$data = json_decode(file_get_contents("php://input"));

// Get JWT service from global (initialized in index.php)
$jwtSecret = getenv('JWT_SECRET');
if (empty($jwtSecret)) {
    $jwtSecret = 'your-secret-key-change-in-production-min-32-chars';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get current authenticated user from middleware context
    $userId = $_SERVER['AUTH_USER_ID'] ?? null;
    
    if ($userId === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'No autenticado'
        ]);
        exit;
    }
    
    $userData = $user->getById($userId);
    if ($userData) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario obtenido exitosamente',
            'user' => [
                'ID_Users' => $userData['ID_Users'],
                'id' => $userData['ID_Users'],
                'Email' => $userData['Email'],
                'email' => $userData['Email'],
                'Full_Name' => $userData['Full_Name'],
                'full_name' => $userData['Full_Name'],
                'role_name' => $userData['role_name'],
                'role' => strtolower($userData['role_name']),
                'office_name' => $userData['office_name'] ?? null,
                'office_type' => $userData['office_type'] ?? null,
                'office_id' => $userData['office_id'] ?? null,
                'created_at' => $userData['created_at'] ?? null
            ]
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($data->action)) {
        switch ($data->action) {
            case 'login':
                if (isset($data->email) && isset($data->password)) {
                    // Input validation
                    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Email inválido'
                        ]);
                        break;
                    }
                    
                    if (strlen($data->password) < 6) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Contraseña inválida'
                        ]);
                        break;
                    }
                    
                    $result = $user->login($data->email, $data->password);
                    
                    if ($result) {
                        // Generate JWT token
                        require_once __DIR__ . '/../Services/JwtService.php';
                        $jwtService = new \App\Services\JwtService($jwtSecret);
                        
                        $token = $jwtService->generateToken(
                            (int)$result['ID_Users'],
                            $result['Email'],
                            (int)$result['ID_Role'],
                            $result['Role']
                        );
                        
                        http_response_code(200);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Login exitoso',
                            'user' => [
                                'ID_Users' => $result['ID_Users'],
                                'id' => $result['ID_Users'],
                                'Email' => $result['Email'],
                                'email' => $result['Email'],
                                'Full_Name' => $result['Full_Name'],
                                'full_name' => $result['Full_Name'],
                                'Role' => $result['Role'],
                                'role' => $result['Role'],
                                'role_name' => $result['Role'],
                                'ID_Role' => $result['ID_Role'],
                                'office_id' => $result['office_id'] ?? null
                            ],
                            'token' => $token
                        ]);
                    } else {
                        http_response_code(401);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Credenciales incorrectas'
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
                
            case 'register':
                if (isset($data->email) && isset($data->password)) {
                    // Input validation
                    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'errors' => ['email' => 'Email inválido']
                        ]);
                        break;
                    }
                    
                    if (strlen($data->password) < 8) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'errors' => ['password' => 'La contraseña debe tener al menos 8 caracteres']
                        ]);
                        break;
                    }
                    
                    $user->Username = $data->username ?? explode('@', $data->email)[0];
                    $user->Email = $data->email;
                    $user->Password = password_hash($data->password, PASSWORD_DEFAULT);
                    $user->Full_Name = $data->full_name ?? $data->username ?? explode('@', $data->email)[0];
                    $user->Fk_Role = $data->role_id ?? 4; // Default to Solicitante role
                    
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
                break;
                
            default:
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Acción no válida'
                ]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?>
