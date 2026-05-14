<?php
require_once __DIR__ . '/../models/Office.php';
require_once __DIR__ . '/../config/database.php';

class OfficeController {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        try {
            switch ($action) {
                case 'top':
                    $this->getTopOffices();
                    break;
                case 'distribution':
                    $startDate = $_GET['start_date'] ?? null;
                    $endDate = $_GET['end_date'] ?? null;
                    $this->getTicketsByOffice($startDate, $endDate);
                    break;
                case 'all':
                    $this->getAllOffices();
                    break;
                default:
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Acción no válida'
                    ]);
                    break;
            }
        } catch (Exception $e) {
            error_log("Error en OfficeController: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    private function getAllOffices() {
        $office = new Office($this->conn);
        $offices = $office->getAll();
        
        echo json_encode([
            'success' => true,
            'message' => 'Oficinas obtenidas exitosamente',
            'data' => $offices
        ]);
    }

    private function getTopOffices() {
        $office = new Office($this->conn);
        $officeData = $office->getTopOffices();

        echo json_encode([
            'success' => true,
            'message' => 'Top 5 oficinas por cantidad de tickets obtenidas exitosamente',
            'data' => $officeData
        ]);
    }

    private function getTicketsByOffice($startDate = null, $endDate = null) {
        $office = new Office($this->conn);
        $officeData = $office->getTicketsByOffice($startDate, $endDate);
        
        echo json_encode([
            'success' => true,
            'message' => 'Distribución de tickets por oficina obtenida exitosamente',
            'data' => $officeData
        ]);
    }
}
?>
