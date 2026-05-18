<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

use App\Services\EscalationService;

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos'
        ]);
        exit;
    }

    $escalationService = new EscalationService($db);

    match ($method) {
        'GET' => handleGet($escalationService),
        'POST' => handlePost($escalationService),
        default => handleMethodNotAllowed()
    };

} catch (\Exception $e) {
    error_log("EscalationController error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
}

function handleGet(EscalationService $service): void
{
    $action = $_GET['action'] ?? 'alerts';

    match ($action) {
        'alerts' => getPendingAlerts($service),
        'config' => getEscalationConfig($service),
        'history' => getEscalationHistory($service),
        'pending_view' => getPendingTicketsView($service),
        default => http_response_code(400) && print(json_encode([
            'success' => false,
            'message' => 'Acción no válida'
        ]))
    };
}

function handlePost(EscalationService $service): void
{
    $action = $_POST['action'] ?? $_GET['action'] ?? '';

    match ($action) {
        'process' => processPendingTickets($service),
        'resolve_alert' => resolveAlert($service),
        default => processPendingTickets($service)
    };
}

function getPendingAlerts(EscalationService $service): void
{
    $alerts = $service->getPendingAlerts();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'alerts' => $alerts,
        'count' => count($alerts)
    ]);
}

function getEscalationConfig(EscalationService $service): void
{
    $config = $service->getEscalationConfig();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'config' => $config
    ]);
}

function getEscalationHistory(EscalationService $service): void
{
    $startDate = $_GET['start_date'] ?? null;
    $endDate = $_GET['end_date'] ?? null;

    $history = $service->getEscalationHistory($startDate, $endDate);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'history' => $history,
        'count' => count($history)
    ]);
}

function getPendingTicketsView(EscalationService $service): void
{
    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "SELECT 
                    sr.ID_Service_Request,
                    sr.Ticket_Code,
                    sr.Subject,
                    sr.System_Priority,
                    sr.Created_at,
                    TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) as Hours_Pending,
                    ts.Type_Service as Service_Name,
                    u.Full_Name as Requester_Name,
                    o.Name_Office as Office_Name
                  FROM Service_Request sr
                  LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                  LEFT JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
                  LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                  WHERE sr.Status = 'Pendiente'
                  ORDER BY 
                    CASE sr.System_Priority
                        WHEN 'Critica' THEN 1
                        WHEN 'Alta' THEN 2
                        WHEN 'Media' THEN 3
                        WHEN 'Baja' THEN 4
                        ELSE 3
                    END,
                    sr.Created_at ASC";

        $stmt = $db->prepare($query);
        $stmt->execute();
        $tickets = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'tickets' => $tickets,
            'count' => count($tickets)
        ]);

    } catch (\PDOException $e) {
        error_log("Error getting pending tickets view: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener tickets pendientes'
        ]);
    }
}

function processPendingTickets(EscalationService $service): void
{
    $result = $service->processPendingTickets();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Procesamiento de escalamiento completado',
        'result' => $result
    ]);
}

function resolveAlert(EscalationService $service): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    $ticketId = $input['ticket_id'] ?? null;
    $resolution = $input['resolution'] ?? 'manual_resolved';

    if (!$ticketId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Ticket ID requerido'
        ]);
        return;
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "UPDATE Pending_Ticket_Alerts 
                  SET Resolved_At = NOW(), Resolution_Notes = ? 
                  WHERE Fk_Service_Request = ? AND Resolved_At IS NULL";

        $stmt = $db->prepare($query);
        $stmt->bindValue(1, $resolution, \PDO::PARAM_STR);
        $stmt->bindValue(2, $ticketId, \PDO::PARAM_INT);
        $stmt->execute();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Alerta resuelta'
        ]);

    } catch (\PDOException $e) {
        error_log("Error resolving alert: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al resolver alerta'
        ]);
    }
}

function handleMethodNotAllowed(): void
{
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}