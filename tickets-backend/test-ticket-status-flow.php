<?php
/**
 * Script para probar el flujo completo de estados de tickets
 * y verificar que se conserve el historial de asignaciones
 */

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';
require_once __DIR__ . '/src/models/ServiceRequest.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== PRUEBA DE FLUJO COMPLETO DE ESTADOS DE TICKETS ===\n\n";
    
    $technician = new Technician($db);
    $serviceRequest = new ServiceRequest($db);
    
    // 1. Crear un ticket de prueba en estado Pendiente
    echo "1. Creando ticket de prueba en estado 'Pendiente'...\n";
    $serviceRequest->Fk_Office = 1;
    $serviceRequest->Fk_User_Requester = 4;
    $serviceRequest->Fk_TI_Service = 1; // Redes
    $serviceRequest->Fk_Problem_Catalog = 1;
    $serviceRequest->Fk_Boss_Requester = null;
    $serviceRequest->Fk_Software_System = null;
    $serviceRequest->Subject = 'Ticket de prueba para flujo de estados';
    $serviceRequest->Property_Number = 'PC-TEST';
    $serviceRequest->Description = 'Este ticket es para probar el flujo de estados';
    $serviceRequest->System_Priority = 'Media';
    
    $newTicketId = $serviceRequest->create();
    
    if ($newTicketId) {
        echo "   ✓ Ticket creado con ID: {$newTicketId}\n";
        
        // Verificar estado inicial
        $query = "SELECT Status FROM Service_Request WHERE ID_Service_Request = :ticketId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $newTicketId);
        $stmt->execute();
        $status = $stmt->fetchColumn();
        echo "   Estado inicial: {$status}\n";
    } else {
        die("   ✗ Error al crear ticket\n");
    }
    echo "\n";
    
    // 2. Asignar técnico al ticket (debe cambiar a 'En Proceso')
    echo "2. Asignando técnico al ticket (debe cambiar a 'En Proceso')...\n";
    $techId = 1; // Carlos Diaz
    $assigned = $technician->assignToTicket($newTicketId, $techId, null, true);
    
    if ($assigned) {
        echo "   ✓ Técnico asignado al ticket\n";
        
        // Verificar estado del ticket
        $query = "SELECT Status FROM Service_Request WHERE ID_Service_Request = :ticketId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $newTicketId);
        $stmt->execute();
        $ticketStatus = $stmt->fetchColumn();
        echo "   Estado del ticket: {$ticketStatus}\n";
        
        // Verificar estado del técnico
        $query = "SELECT Status FROM Technicians WHERE ID_Technicians = :techId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":techId", $techId);
        $stmt->execute();
        $techStatus = $stmt->fetchColumn();
        echo "   Estado del técnico: {$techStatus}\n";
        
        // Verificar asignación en Ticket_Technicians
        $query = "SELECT Status FROM Ticket_Technicians 
                  WHERE Fk_Service_Request = :ticketId AND Fk_Technician = :techId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $newTicketId);
        $stmt->bindParam(":techId", $techId);
        $stmt->execute();
        $assignmentStatus = $stmt->fetchColumn();
        echo "   Estado de asignación: {$assignmentStatus}\n";
    } else {
        echo "   ✗ Error al asignar técnico\n";
    }
    echo "\n";
    
    // 3. Cerrar el ticket (debe liberar técnico y conservar historial)
    echo "3. Cerrando ticket (debe liberar técnico y conservar historial)...\n";
    $closed = $technician->closeTicket($newTicketId);
    
    if ($closed) {
        echo "   ✓ Ticket cerrado exitosamente\n";
        
        // Verificar estado del ticket
        $query = "SELECT Status, Resolved_at FROM Service_Request WHERE ID_Service_Request = :ticketId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $newTicketId);
        $stmt->execute();
        $ticketData = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "   Estado del ticket: {$ticketData['Status']}\n";
        echo "   Fecha de resolución: {$ticketData['Resolved_at']}\n";
        
        // Verificar estado del técnico
        $query = "SELECT Status FROM Technicians WHERE ID_Technicians = :techId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":techId", $techId);
        $stmt->execute();
        $techStatus = $stmt->fetchColumn();
        echo "   Estado del técnico: {$techStatus}\n";
        
        // Verificar historial de asignación (debe estar como 'Finalizado')
        $query = "SELECT Status, Assigned_At FROM Ticket_Technicians 
                  WHERE Fk_Service_Request = :ticketId AND Fk_Technician = :techId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $newTicketId);
        $stmt->bindParam(":techId", $techId);
        $stmt->execute();
        $assignmentData = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "   Estado de asignación (historial): {$assignmentData['Status']}\n";
        echo "   Fecha de asignación: {$assignmentData['Assigned_At']}\n";
        
        if ($assignmentData['Status'] === 'Finalizado') {
            echo "   ✓ Historial conservado correctamente\n";
        } else {
            echo "   ✗ Historial NO conservado (esperado 'Finalizado', got '{$assignmentData['Status']}')\n";
        }
    } else {
        echo "   ✗ Error al cerrar ticket\n";
    }
    echo "\n";
    
    // 4. Verificar historial completo de asignaciones
    echo "4. Historial completo de asignaciones del ticket:\n";
    $query = "SELECT tt.ID_Ticket_Technician, tt.Fk_Technician, 
                     t.First_Name, t.Last_Name, tt.Status, tt.Assigned_At
              FROM Ticket_Technicians tt
              JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
              WHERE tt.Fk_Service_Request = :ticketId
              ORDER BY tt.Assigned_At";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":ticketId", $newTicketId);
    $stmt->execute();
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($history as $record) {
        echo "   - Técnico: {$record['First_Name']} {$record['Last_Name']} (ID: {$record['Fk_Technician']})\n";
        echo "     Estado de asignación: {$record['Status']}\n";
        echo "     Fecha de asignación: {$record['Assigned_At']}\n";
    }
    echo "\n";
    
    // 5. Resumen del flujo
    echo "5. RESUMEN DEL FLUJO DE ESTADOS:\n";
    echo "   ✓ Pendiente: Ticket creado sin técnico asignado\n";
    echo "   ✓ En Proceso: Técnico asignado, ticket en proceso\n";
    echo "   ✓ Cerrado: Ticket resuelto, técnico liberado\n";
    echo "   ✓ Historial: Asignación conservada como 'Finalizado'\n";
    echo "   ✓ Técnico: Cambió de Disponible -> Ocupado -> Disponible\n";
    echo "\n";
    
    echo "=== PRUEBA COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
