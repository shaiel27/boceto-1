<?php
// Create a pending ticket without technician assignment
require_once 'src/config/database.php';
require_once 'src/models/ServiceRequest.php';

echo "=== Crear Ticket Pendiente ===\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo "❌ Error: No se pudo conectar a la base de datos\n";
        exit(1);
    }

    echo "✅ Conexión a base de datos exitosa\n\n";

    $ticket = new ServiceRequest($db);

    // Set ticket data
    $ticket->Fk_Office = 1;
    $ticket->Fk_User_Requester = 4; // jefe1
    $ticket->Fk_TI_Service = 3; // Programación (no hay técnicos disponibles ahora)
    $ticket->Fk_Problem_Catalog = 1;
    $ticket->Fk_Boss_Requester = null;
    $ticket->Fk_Software_System = null;
    $ticket->Subject = 'Test Pending Ticket';
    $ticket->Property_Number = 'PC-002';
    $ticket->Description = 'Este ticket quedará pendiente hasta que haya técnico disponible';
    $ticket->System_Priority = 'Media';

    if ($ticket->create()) {
        echo "✅ Ticket pendiente creado exitosamente\n";
        echo "   Ticket ID: {$ticket->ID_Service_Request}\n";
        echo "   Status: Pendiente (sin técnico asignado)\n";
    } else {
        echo "❌ Error al crear ticket pendiente\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
