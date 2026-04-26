<?php
// Test assignment of pending tickets
require_once 'src/config/database.php';
require_once 'src/models/Technician.php';

echo "=== Test de Asignación de Tickets Pendientes ===\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo "❌ Error: No se pudo conectar a la base de datos\n";
        exit(1);
    }

    echo "✅ Conexión a base de datos exitosa\n\n";

    // Check pending tickets
    $pendingQuery = "SELECT ID_Service_Request, Subject, Fk_TI_Service, Status, Created_at
                     FROM Service_Request
                     WHERE Status = 'Pendiente'
                     ORDER BY Created_at ASC";

    $pendingStmt = $db->prepare($pendingQuery);
    $pendingStmt->execute();
    $pendingTickets = $pendingStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Tickets pendientes encontrados: " . count($pendingTickets) . "\n";
    foreach ($pendingTickets as $ticket) {
        echo "  - Ticket ID: {$ticket['ID_Service_Request']}, Asunto: {$ticket['Subject']}, Servicio: {$ticket['Fk_TI_Service']}\n";
    }

    if (empty($pendingTickets)) {
        echo "\nNo hay tickets pendientes para asignar.\n";
        exit(0);
    }

    echo "\nEjecutando asignación automática...\n\n";

    $technician = new Technician($db);
    $result = $technician->assignPendingTickets();

    echo "✅ Asignación completada\n";
    echo "Tickets asignados: {$result['assigned_count']}\n";

    if (!empty($result['assignments'])) {
        echo "\nDetalles de asignaciones:\n";
        foreach ($result['assignments'] as $assignment) {
            echo "  - Ticket ID: {$assignment['ticket_id']} -> Técnico: {$assignment['technician']}\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
