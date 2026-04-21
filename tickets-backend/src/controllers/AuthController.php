<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($data->action)) {
        switch ($data->action) {
            case 'login':
                if (isset($data->email) && isset($data->password)) {
                    $result = $user->login($data->email, $data->password);
                    
                    if ($result) {
                        http_response_code(200);
                        echo json_encode([
                            'success' => true,
                            'user' => $result,
                            'token' => 'mock_token_' . time() // Mock token for development
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
                if (isset($data->username) && isset($data->email) && isset($data->password)) {
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
