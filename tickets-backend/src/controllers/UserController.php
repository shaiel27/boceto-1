<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $users = $user->getAll();
        echo json_encode([
            'success' => true,
            'data' => $users
        ]);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->username) && isset($data->email) && isset($data->password)) {
            $user->username = $data->username;
            $user->email = $data->email;
            $user->password = password_hash($data->password, PASSWORD_DEFAULT);
            $user->full_name = $data->full_name ?? $data->username;
            $user->role = $data->role ?? 'user';
            
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
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}
?>
