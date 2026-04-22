<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // For development, return user from token (in production, validate JWT)
    // For now, we'll extract user ID from the mock token or return a default user
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer mock_token_(\d+)/', $authHeader, $matches)) {
        $userId = $matches[1];
        $userData = $user->getById($userId);
        if ($userData) {
            echo json_encode([
                'success' => true,
                'message' => 'Usuario obtenido exitosamente',
                'user' => [
                    'id' => $userData['ID_Users'],
                    'email' => $userData['Email'],
                    'role' => strtolower($userData['role_name']),
                    'full_name' => $userData['Full_Name']
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]);
        }
    } else {
        // Fallback: return first jefe user for testing
        $query = "SELECT u.ID_Users, u.Email, u.Full_Name, r.Role 
                  FROM Users u 
                  JOIN Role r ON u.Fk_Role = r.ID_Role 
                  WHERE r.Role = 'Jefe' LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Usuario obtenido exitosamente',
                'user' => [
                    'id' => $result['ID_Users'],
                    'email' => $result['Email'],
                    'role' => strtolower($result['Role']),
                    'full_name' => $result['Full_Name']
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
                            'token' => 'mock_token_' . $result['ID_Users'] // Use user ID in token
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
