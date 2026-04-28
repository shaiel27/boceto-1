<?php
/**
 * Prueba final de asignación automática de técnicos
 */

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/ServiceRequest.php';
require_once __DIR__ . '/src/Services/TicketService.php';
require_once __DIR__ . '/src/models/Technician.php';
require_once __DIR__ . '/src/DTO/CreateTicketDTO.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== PRUEBA FINAL DE ASIGNACIÓN AUTOMÁTICA ===\n\n";
    
    $ticket = new ServiceRequest($db);
    $technician = new Technician($db);
    $ticketService = new TicketService($db, $ticket, $technician);
    
    // 1. Probar creación de ticket con DTO moderno
    echo "1. Creando ticket con servicio Redes (ID: 1) usando TicketService...\n";
    
    $ticketData = [
        'Fk_Office' => 1,
        'Fk_TI_Service' => 1, // Redes
        'Fk_Problem_Catalog' => 1,
        'Subject' => 'Ticket de prueba final - ' . date('Y-m-d H:i:s'),
        'Description' => 'Este ticket prueba la asignación automática corregida',
        'Property_Number' => 'PC-FINAL-TEST',
        'System_Priority' => 'Media'
    ];
    
    $dto = CreateTicketDTO::fromArray($ticketData);
    $result = $ticketService->createTicket($dto, 4); // User ID 4
    
    if ($result['success']) {
        echo "   ✅ Ticket creado exitosamente\n";
        echo "   📋 Ticket ID: {$result['ticket_id']}\n";
        echo "   👤 Técnico asignado: " . ($result['technician_assigned'] ? 'SÍ' : 'NO') . "\n";
        echo "   🔧 Nombre técnico: " . ($result['technician_name'] ?? 'N/A') . "\n";
        
        // 2. Verificar estado final del ticket
        $query = "SELECT Status, Fk_TI_Service, Subject FROM Service_Request WHERE ID_Service_Request = :ticketId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $result['ticket_id']);
        $stmt->execute();
        $ticketData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "\n2. Estado final del ticket:\n";
        echo "   📄 ID: {$result['ticket_id']}\n";
        echo "   📋 Asunto: {$ticketData['Subject']}\n";
        echo "   🔄 Estado: {$ticketData['Status']}\n";
        echo "   🔧 Servicio ID: {$ticketData['Fk_TI_Service']}\n";
        
        // 3. Verificar asignación de técnico
        $query = "SELECT tt.*, t.First_Name, t.Last_Name, t.Status as Tech_Status
                  FROM Ticket_Technicians tt
                  JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
                  WHERE tt.Fk_Service_Request = :ticketId
                  ORDER BY tt.ID_Ticket_Technician DESC LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $result['ticket_id']);
        $stmt->execute();
        $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($assignment) {
            echo "\n3. ✅ Asignación de técnico confirmada:\n";
            echo "   👤 Técnico: {$assignment['First_Name']} {$assignment['Last_Name']} (ID: {$assignment['Fk_Technician']})\n";
            echo "   🔄 Estado asignación: {$assignment['Status']}\n";
            echo "   📊 Estado técnico: {$assignment['Tech_Status']}\n";
            echo "   📅 Fecha asignación: {$assignment['Assigned_At']}\n";
            echo "   👑 Es líder: " . ($assignment['Is_Lead'] ? 'SÍ' : 'NO') . "\n";
        } else {
            echo "\n3. ❌ No se encontró asignación de técnico\n";
        }
        
    } else {
        echo "   ❌ Falló la creación del ticket\n";
    }
    
    // 4. Resumen de técnicos disponibles para el servicio
    echo "\n4. Resumen de técnicos disponibles para servicio Redes:\n";
    $availableTechs = $technician->getAvailableTechniciansByService(1);
    
    if (!empty($availableTechs)) {
        foreach ($availableTechs as $tech) {
            $priority = $tech['priority_score'] ?? 'N/A';
            echo "   👤 {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']}) - Prioridad: {$priority}\n";
        }
    } else {
        echo "   ❌ No hay técnicos disponibles\n";
    }
    
    echo "\n=== PRUEBA FINAL COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
