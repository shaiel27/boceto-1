<?php
declare(strict_types=1);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../src/config/database.php';
require_once __DIR__ . '/../src/models/TIService.php';
require_once __DIR__ . '/../src/models/ServiceProblemsCatalog.php';
require_once __DIR__ . '/../src/models/SoftwareSystems.php';

$database = new Database();
$db = $database->getConnection();

$tiService = new TIService($db);
$problemsCatalog = new ServiceProblemsCatalog($db);
$softwareSystems = new SoftwareSystems($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'services':
                // Obtener todos los tipos de servicio
                $services = $tiService->getAll();
                if ($services) {
                    echo json_encode([
                        'success' => true,
                        'data' => $services
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al obtener servicios'
                    ]);
                }
                break;
                
            case 'problems':
                // Obtener problemas por tipo de servicio
                if (isset($_GET['service_id'])) {
                    $problems = $problemsCatalog->getByServiceId($_GET['service_id']);
                    if ($problems !== false) {
                        echo json_encode([
                            'success' => true,
                            'data' => $problems
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Error al obtener problemas'
                        ]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'service_id es requerido'
                    ]);
                }
                break;
                
            case 'software-systems':
                // Obtener todos los sistemas de software
                $systems = $softwareSystems->getAll();
                if ($systems) {
                    echo json_encode([
                        'success' => true,
                        'data' => $systems
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al obtener sistemas'
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
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
}
?>
