<?php
declare(strict_types=1);

/**
 * PHP-PRO: Problem Report Controller
 * 
 * Controller para reporte de problemas más frecuentes por servicio
 * Aplica principios PHP-PRO: strict typing, proper error handling, CORS headers
 */

require_once __DIR__ . '/../models/ProblemReport.php';
require_once __DIR__ . '/../config/Database.php';

class ProblemReportController
{
    private $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function handleRequest()
    {
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
                case 'all':
                    $startDate = $_GET['start_date'] ?? null;
                    $endDate = $_GET['end_date'] ?? null;
                    $this->getAllProblemsByService($startDate, $endDate);
                    break;
                case 'top':
                    $startDate = $_GET['start_date'] ?? null;
                    $endDate = $_GET['end_date'] ?? null;
                    $this->getTopProblemByService($startDate, $endDate);
                    break;
                case 'monthly':
                    $startDate = $_GET['start_date'] ?? null;
                    $endDate = $_GET['end_date'] ?? null;
                    $this->getProblemsByMonth($startDate, $endDate);
                    break;
                case 'systems':
                    $startDate = $_GET['start_date'] ?? null;
                    $endDate = $_GET['end_date'] ?? null;
                    $this->getSystemsAndProblems($startDate, $endDate);
                    break;
                default:
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Acción no válida. Use: all, top, monthly, systems'
                    ]);
                    break;
            }
        } catch (Exception $e) {
            error_log("Error en ProblemReportController: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error interno del servidor'
            ]);
        }
    }

    private function getAllProblemsByService($startDate = null, $endDate = null)
    {
        $problemReport = new ProblemReport($this->conn);
        $data = $problemReport->getMostFrequentProblemsByService($startDate, $endDate);
        
        echo json_encode([
            'success' => true,
            'message' => 'Problemas por servicio obtenidos exitosamente',
            'data' => $data
        ]);
    }

    private function getTopProblemByService($startDate = null, $endDate = null)
    {
        $problemReport = new ProblemReport($this->conn);
        $data = $problemReport->getTopProblemByService($startDate, $endDate);
        
        echo json_encode([
            'success' => true,
            'message' => 'Problema más frecuente por servicio obtenido exitosamente',
            'data' => $data
        ]);
    }

    private function getProblemsByMonth($startDate = null, $endDate = null)
    {
        $problemReport = new ProblemReport($this->conn);
        $data = $problemReport->getProblemsByMonth($startDate, $endDate);
        
        echo json_encode([
            'success' => true,
            'message' => 'Problemas por mes obtenidos exitosamente',
            'data' => $data
        ]);
    }

    private function getSystemsAndProblems($startDate = null, $endDate = null)
    {
        $problemReport = new ProblemReport($this->conn);
        $data = $problemReport->getSystemsAndProblems($startDate, $endDate);
        
        echo json_encode([
            'success' => true,
            'message' => 'Sistemas y problemáticas obtenidos exitosamente',
            'data' => $data
        ]);
    }
}
?>
