<?php
// Test ticket creation endpoint
require_once 'src/config/database.php';
require_once 'src/models/ServiceRequest.php';
require_once 'src/models/Technician.php';
require_once 'src/DTO/CreateTicketDTO.php';
require_once 'src/Services/TicketService.php';

echo "=== Test de Creación de Ticket ===\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo "❌ Error: No se pudo conectar a la base de datos\n";
        exit(1);
    }

    echo "✅ Conexión a base de datos exitosa\n\n";

    // Test DTO creation
    echo "Test 1: Creación de DTO\n";
    $testData = [
        'Fk_Office' => 1,
        'Fk_TI_Service' => 2, // Soporte - María González está disponible
        'Fk_Problem_Catalog' => 1,
        'Fk_Boss_Requester' => null,
        'Fk_Software_System' => null,
        'Subject' => 'Test Ticket Soporte',
        'Property_Number' => 'PC-001',
        'Description' => 'Test description',
        'System_Priority' => 'Media'
    ];

    try {
        $dto = CreateTicketDTO::fromArray($testData);
        echo "✅ DTO creado exitosamente\n";
        echo "   - Office: {$dto->fkOffice}\n";
        echo "   - Service: {$dto->fkTiService}\n";
        echo "   - Subject: {$dto->subject}\n\n";
    } catch (Exception $e) {
        echo "❌ Error creando DTO: " . $e->getMessage() . "\n\n";
    }

    // Test Service
    echo "Test 2: Servicio de Ticket\n";
    $ticket = new ServiceRequest($db);
    $technician = new Technician($db);
    $ticketService = new TicketService($db, $ticket, $technician);

    try {
        $result = $ticketService->createTicket($dto, 4); // User ID 4 (jefe1)
        echo "✅ Ticket creado exitosamente\n";
        echo "   - Ticket ID: {$result['ticket_id']}\n";
        echo "   - Técnico asignado: " . ($result['technician_assigned'] ? 'Sí' : 'No') . "\n";
        if ($result['technician_assigned']) {
            echo "   - Nombre técnico: {$result['technician_name']}\n";
        }
    } catch (Exception $e) {
        echo "❌ Error creando ticket: " . $e->getMessage() . "\n";
        echo "   Stack trace:\n" . $e->getTraceAsString() . "\n";
    }

} catch (Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n";
    echo "   Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
