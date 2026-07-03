<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/LunchBlock.php';

$database = new Database();
$db = $database->getConnection();

// Get authenticated user from middleware context
$currentUserId = $_SERVER['AUTH_USER_ID'] ?? null;
$currentUserRole = $_SERVER['AUTH_USER_ROLE'] ?? null;

$method = $_SERVER['REQUEST_METHOD'];

$lunchBlockModel = new LunchBlock($db);

switch ($method) {
    case 'GET':
        $lunchBlocks = $lunchBlockModel->getAll();

        echo json_encode([
            'success' => true,
            'message' => 'Bloques de almuerzo obtenidos exitosamente',
            'data' => $lunchBlocks
        ]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $blockName = trim($input['block_name'] ?? '');
        $startTime = trim($input['start_time'] ?? '');
        $endTime = trim($input['end_time'] ?? '');

        if ($blockName === '' || $startTime === '' || $endTime === '') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Todos los campos son obligatorios: block_name, start_time, end_time'
            ]);
            break;
        }

        $newId = $lunchBlockModel->create($blockName, $startTime, $endTime);

        if ($newId) {
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Bloque de almuerzo creado exitosamente',
                'data' => [
                    'ID_Lunch_Block' => $newId,
                    'Block_Name' => $blockName,
                    'Start_Time' => $startTime,
                    'End_Time' => $endTime
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al crear el bloque de almuerzo'
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
