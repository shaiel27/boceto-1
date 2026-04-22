<?php
require_once '../config/database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

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
        } else {
            $users = $user->getAll();
            echo json_encode([
                'success' => true,
                'data' => $users
            ]);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
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
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}
?>
