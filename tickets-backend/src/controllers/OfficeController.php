<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/Office.php';
require_once __DIR__ . '/../Services/OfficeSyncService.php';
require_once __DIR__ . '/../config/database.php';

final class OfficeController
{
    private PDO $conn;

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function handleRequest(): void
    {
        $action = $_GET['action'] ?? '';

        header('Content-Type: application/json');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        try {
            match ($action) {
                'distribution' => $this->getTicketsByOffice(
                    $_GET['start_date'] ?? null,
                    $_GET['end_date'] ?? null,
                ),
                'all'   => $this->getAllOffices(),
                'sync'  => $this->syncOffices(),
                default => $this->respondError(400, 'Acción no válida'),
            };
        } catch (Exception $e) {
            error_log("Error en OfficeController: " . $e->getMessage());
            $this->respondError(500, 'Error interno del servidor');
        }
    }

    private function syncOffices(): void
    {
        try {
            $syncService = new OfficeSyncService($this->conn);
            $result = $syncService->sync();
            echo json_encode($result);
        } catch (Exception $e) {
            error_log('[OfficeSync] Error al crear servicio de sincronización: ' . $e->getMessage());
            echo json_encode([
                'success' => false,
                'message' => 'Error de conexión a SIFA: ' . $e->getMessage(),
            ]);
        }
    }

    private function getAllOffices(): void
    {
        $office = new Office($this->conn);
        $offices = $office->getAll();

        echo json_encode([
            'success' => true,
            'message' => 'Oficinas obtenidas exitosamente',
            'data' => $offices,
        ]);
    }

    private function getTicketsByOffice(?string $startDate = null, ?string $endDate = null): void
    {
        $office = new Office($this->conn);
        $officeData = $office->getTicketsByOffice($startDate, $endDate);

        echo json_encode([
            'success' => true,
            'message' => 'Distribución de tickets por oficina obtenida exitosamente',
            'data' => $officeData,
        ]);
    }

    private function respondError(int $code, string $message): void
    {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $message]);
    }
}
