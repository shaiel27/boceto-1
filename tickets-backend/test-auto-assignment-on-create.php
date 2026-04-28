<?php
/**
 * Script para probar la asignación automática de técnicos al crear un ticket
 */

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/ServiceRequest.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== PRUEBA DE ASIGNACIÓN AUTOMÁTICA AL CREAR TICKET ===\n\n";
    
    $serviceRequest = new ServiceRequest($db);
    
    // 1. Crear un ticket de prueba
    echo "1. Creando ticket de prueba para servicio Redes (ID: 1)...\n";
    $serviceRequest->Fk_Office = 1;
    $serviceRequest->Fk_User_Requester = 4;
    $serviceRequest->Fk_TI_Service = 1; // Redes
    $serviceRequest->Fk_Problem_Catalog = 1;
    $serviceRequest->Fk_Boss_Requester = null;
    $serviceRequest->Fk_Software_System = null;
    $serviceRequest->Subject = 'Ticket de prueba para asignación automática';
    $serviceRequest->Property_Number = 'PC-AUTO-TEST';
    $serviceRequest->Description = 'Este ticket es para probar la asignación automática de técnicos';
    $serviceRequest->System_Priority = 'Media';
    
    $newTicketId = $serviceRequest->create();
    
    if ($newTicketId) {
        echo "   ✓ Ticket creado con ID: {$newTicketId}\n";
        
        // 2. Verificar estado del ticket
        $query = "SELECT Status, Fk_TI_Service FROM Service_Request WHERE ID_Service_Request = :ticketId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $newTicketId);
        $stmt->execute();
        $ticketData = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "   Estado del ticket: {$ticketData['Status']}\n";
        echo "   Servicio ID: {$ticketData['Fk_TI_Service']}\n";
        
        // 3. Verificar si se asignó un técnico
        $query = "SELECT tt.*, t.First_Name, t.Last_Name, t.Status as Tech_Status
                  FROM Ticket_Technicians tt
                  JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
                  WHERE tt.Fk_Service_Request = :ticketId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":ticketId", $newTicketId);
        $stmt->execute();
        $assignedTechnicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($assignedTechnicians)) {
            echo "   ✓ Técnico asignado automáticamente:\n";
            foreach ($assignedTechnicians as $tech) {
                echo "     - Nombre: {$tech['First_Name']} {$tech['Last_Name']}\n";
                echo "     - Estado de asignación: {$tech['Status']}\n";
                echo "     - Estado del técnico: {$tech['Tech_Status']}\n";
                echo "     - Fecha de asignación: {$tech['Assigned_At']}\n";
            }
        } else {
            echo "   ✗ No se asignó ningún técnico automáticamente\n";
        }
        
        // 4. Verificar técnicos disponibles para el servicio
        echo "\n2. Técnicos disponibles para servicio Redes (ID: 1):\n";
        require_once __DIR__ . '/src/models/Technician.php';
        $technician = new Technician($db);
        $allTechnicians = $technician->getAllTechniciansByService(1);
        
        if (!empty($allTechnicians)) {
            foreach ($allTechnicians as $tech) {
                $isAvailable = in_array($tech['Status'], ['Disponible', 'Activo']);
                $statusDisplay = $isAvailable ? '✓ Disponible' : '✗ Ocupado/Inactivo';
                echo "   - {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']})\n";
                echo "     Estado: {$tech['Status']} {$statusDisplay}\n";
                echo "     Tickets resueltos: {$tech['Tickets_Resolved']}\n";
                echo "     Tickets activos: {$tech['Active_Tickets']}\n";
            }
        } else {
            echo "   No hay técnicos para este servicio\n";
        }
        
        echo "\n=== PRUEBA COMPLETADA ===\n";
        
    } else {
        die("   ✗ Error al crear ticket\n");
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
