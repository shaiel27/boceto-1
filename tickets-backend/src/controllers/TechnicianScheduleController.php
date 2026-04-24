<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/TechnicianSchedule.php';

$database = new Database();
$db = $database->getConnection();

$technician = new Technician($db);

// Get authenticated user from middleware context
$currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

$method = $_SERVER['REQUEST_METHOD'];
$technicianId = $_GET['technician_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($technicianId) {
            $schedules = $technician->getSchedules($technicianId);
            echo json_encode([
                'success' => true,
                'message' => 'Horarios obtenidos exitosamente',
                'data' => $schedules
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de técnico requerido'
            ]);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->technician_id) && isset($data->day_of_week) && 
            isset($data->work_start_time) && isset($data->work_end_time)) {
            
            if ($technician->addSchedule($data->technician_id, $data->day_of_week, 
                                          $data->work_start_time, $data->work_end_time)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Horario creado exitosamente'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al crear horario'
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
        
    case 'DELETE':
        if ($technicianId) {
            if ($technician->removeSchedules($technicianId)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Horarios eliminados exitosamente'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al eliminar horarios'
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de técnico requerido'
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
