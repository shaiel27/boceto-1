<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Technician.php';

$database = new Database();
$db = $database->getConnection();

$technician = new Technician($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';

switch ($method) {
    case 'GET':
        if ($id) {
            // Get single technician
            $techData = $technician->getById($id);
            if ($techData) {
                $techData['Services'] = $technician->getServices($id);
                $techData['Schedules'] = $technician->getSchedules($id);
                
                // Format services for frontend
                $servicesArray = [];
                foreach ($techData['Services'] as $service) {
                    $servicesArray[] = $service['Type_Service'];
                }
                $techData['Services'] = implode(', ', $servicesArray);
                
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
                
                // Format services for frontend
                $servicesArray = [];
                foreach ($services as $service) {
                    $servicesArray[] = $service['Type_Service'];
                }
                $tech['Services'] = implode(', ', $servicesArray);
                $tech['Schedules'] = $schedules;
                
                // Format lunch block hours
                if ($tech['Start_Time'] && $tech['End_Time']) {
                    $tech['Start_Time'] = substr($tech['Start_Time'], 0, 5);
                    $tech['End_Time'] = substr($tech['End_Time'], 0, 5);
                }
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
        
        if ($action === 'update') {
            $techData = new stdClass();
            $techData->First_Name = $data->first_name;
            $techData->Last_Name = $data->last_name;
            $techData->Fk_Lunch_Block = $data->lunch_block ? intval($data->lunch_block) : null;
            $techData->Status = $data->status;
            
            if ($technician->update($id, $techData)) {
                // Update services if provided
                if (isset($data->services) && is_array($data->services)) {
                    $technician->removeServices($id);
                    foreach ($data->services as $serviceId) {
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
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Acción no válida'
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
?>
