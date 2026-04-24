<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Technician.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();

    $technician = new Technician($db);

    // Get authenticated user from middleware context
    $currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
    $currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

    error_log("TechnicianController - User ID: " . ($currentUserId ?? 'null') . ", Role: " . ($currentUserRole ?? 'null'));

    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $id = $_GET['id'] ?? '';

    // Para PUT/POST, leer action del body JSON si no está en query params
    if (($method === 'PUT' || $method === 'POST') && empty($action)) {
        $bodyData = json_decode(file_get_contents("php://input"));
        $action = $bodyData->action ?? '';
    }

    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single technician
                $techData = $technician->getById($id);
                if ($techData) {
                    $techData['TI_Services'] = $technician->getServices($id);
                    $techData['Schedules'] = $technician->getSchedules($id);
                    
                    // Format lunch block hours for display
                    if ($techData['Start_Time'] && $techData['End_Time']) {
                        $techData['Lunch_Block_Hours'] = substr($techData['Start_Time'], 0, 5) . ' - ' . substr($techData['End_Time'], 0, 5);
                    }
                    
                    echo json_encode([
                        'success' => true,
                        'data' => $techData
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Técnico no encontrado'
                    ]);
                }
            } else {
                // Get all technicians
                $technicians = $technician->getAll();
                
                // Add services and schedules to each technician
                foreach ($technicians as &$tech) {
                    $services = $technician->getServices($tech['ID_Technicians']);
                    $schedules = $technician->getSchedules($tech['ID_Technicians']);
                    
                    // Keep services as array for frontend
                    $tech['TI_Services'] = $services;
                    $tech['Schedules'] = $schedules;
                    
                    // Format lunch block for display
                    if ($tech['Block_Name'] && $tech['Start_Time'] && $tech['End_Time']) {
                        $tech['Lunch_Block'] = [
                            'name' => $tech['Block_Name'],
                            'hours' => substr($tech['Start_Time'], 0, 5) . ' - ' . substr($tech['End_Time'], 0, 5)
                        ];
                    } else {
                        $tech['Lunch_Block'] = null;
                    }
                    
                    // Remove raw fields
                    unset($tech['Block_Name']);
                    unset($tech['Start_Time']);
                    unset($tech['End_Time']);
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => $technicians
                ]);
            }
            break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if ($action === 'create') {
            // First create the user
            require_once __DIR__ . '/../models/User.php';
            $user = new User($db);
            
            $user->Username = $data->username;
            $user->Email = $data->email;
            $user->Password = password_hash($data->password, PASSWORD_DEFAULT);
            $user->Full_Name = $data->first_name . ' ' . $data->last_name;
            $user->Fk_Role = 2; // Technician role
            
            if ($user->create()) {
                $userId = $db->lastInsertId();
                
                // Then create the technician
                $techData = new stdClass();
                $techData->Fk_Users = $userId;
                $techData->First_Name = $data->first_name;
                $techData->Last_Name = $data->last_name;
                $techData->Fk_Lunch_Block = $data->lunch_block ? intval($data->lunch_block) : null;
                $techData->Status = 'Activo';
                
                $technicianId = $technician->create($techData);
                
                if ($technicianId) {
                    // Add services
                    if (isset($data->services) && is_array($data->services)) {
                        foreach ($data->services as $serviceId) {
                            $technician->addService($technicianId, $serviceId);
                        }
                    }
                    
                    // Add schedules
                    if (isset($data->schedules)) {
                        foreach ($data->schedules as $day => $schedule) {
                            if (!empty($schedule->start) && !empty($schedule->end)) {
                                $technician->addSchedule($technicianId, $day, $schedule->start, $schedule->end);
                            }
                        }
                    }
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Técnico creado exitosamente',
                        'data' => ['id' => $technicianId]
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al crear técnico'
                    ]);
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear usuario'
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Acción no válida'
            ]);
        }
        break;
        
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de técnico requerido'
            ]);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));

        // Debug: log received data
        error_log("PUT request - Action: " . $action);
        error_log("PUT request - Data: " . json_encode($data));

        // Get technician to find user ID
        $techData = $technician->getById($id);
        if (!$techData) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Técnico no encontrado'
            ]);
            break;
        }

        $userId = $techData['Fk_Users'];

        // Update user (email and password if provided)
        require_once __DIR__ . '/../models/User.php';
        $user = new User($db);
        $userData = new stdClass();
        $userData->Email = $data->email;
        $userData->Full_Name = $data->first_name . ' ' . $data->last_name;
        if (!empty($data->password)) {
            $userData->Password = $data->password;
        }
        $user->update($userId, $userData);

        // Update technician data
        $techUpdateData = new stdClass();
        $techUpdateData->First_Name = $data->first_name;
        $techUpdateData->Last_Name = $data->last_name;
        $techUpdateData->Fk_Lunch_Block = $data->lunch_block ? intval($data->lunch_block) : null;

        if ($technician->update($id, $techUpdateData)) {
            // Update services if provided
            if (isset($data->services) && is_array($data->services)) {
                error_log("Services to update: " . json_encode($data->services));
                $technician->removeServices($id);
                foreach ($data->services as $serviceId) {
                    error_log("Adding service: " . $serviceId);
                    $technician->addService($id, $serviceId);
                }
            }

            // Update schedules if provided
            if (isset($data->schedules)) {
                $technician->removeSchedules($id);
                foreach ($data->schedules as $day => $schedule) {
                    if (!empty($schedule->start) && !empty($schedule->end)) {
                        $technician->addSchedule($id, $day, $schedule->start, $schedule->end);
                    }
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Técnico actualizado exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar técnico'
            ]);
        }
        break;
        
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de técnico requerido'
            ]);
            break;
        }
        
        if ($technician->delete($id)) {
            echo json_encode([
                'success' => true,
                'message' => 'Técnico eliminado exitosamente'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al eliminar técnico'
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>
