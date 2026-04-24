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

switch ($method) {
    case 'GET':
        $query = "SELECT ID_Lunch_Block, Block_Name, Start_Time, End_Time
                  FROM Lunch_Blocks
                  ORDER BY ID_Lunch_Block";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $lunchBlocks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Bloques de almuerzo obtenidos exitosamente',
            'data' => $lunchBlocks
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}
?>
