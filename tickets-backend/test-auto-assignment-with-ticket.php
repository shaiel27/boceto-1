<?php
/**
 * Script para probar la asignación automática creando un ticket de prueba
 */

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/ServiceRequest.php';
require_once __DIR__ . '/src/models/Technician.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== PRUEBA DE ASIGNACIÓN AUTOMÁTICA CON CREACIÓN DE TICKET ===\n\n";
    
    // 1. Verificar servicios disponibles
    echo "1. Servicios TI disponibles:\n";
    $query = "SELECT ID_TI_Service, Type_Service FROM TI_Service ORDER BY ID_TI_Service";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($services as $service) {
        echo "   - ID: {$service['ID_TI_Service']}, Nombre: {$service['Type_Service']}\n";
    }
    echo "\n";
    
    // 2. Verificar técnicos disponibles para servicio Redes (ID 1)
    echo "2. Técnicos disponibles para servicio 'Redes' (ID 1):\n";
    $technician = new Technician($db);
    $availableTechs = $technician->getAvailableTechniciansByService(1);
    
    if (empty($availableTechs)) {
        echo "   No hay técnicos disponibles para el servicio Redes\n";
    } else {
        foreach ($availableTechs as $tech) {
            echo "   - {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']})\n";
            echo "     Tickets Activos: {$tech['Active_Tickets_Count']}\n";
            echo "     Asignaciones Recientes: {$tech['Recent_Assignments_Count']}\n";
            echo "     Puntaje Prioridad: {$tech['priority_score']}\n";
        }
    }
    echo "\n";
    
    // 3. Crear un ticket de prueba
    echo "3. Creando ticket de prueba...\n";
    $serviceRequest = new ServiceRequest($db);
    
    // Obtener un usuario válido
    $userQuery = "SELECT ID_Users FROM Users LIMIT 1";
    $userStmt = $db->prepare($userQuery);
    $userStmt->execute();
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        die("No hay usuarios en la base de datos\n");
    }
    
    // Obtener una oficina válida
    $officeQuery = "SELECT ID_Office FROM Office LIMIT 1";
    $officeStmt = $db->prepare($officeQuery);
    $officeStmt->execute();
    $office = $officeStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$office) {
        die("No hay oficinas en la base de datos\n");
    }
    
    $serviceRequest->Fk_User_Requester = $user['ID_Users'];
    $serviceRequest->Fk_Office = $office['ID_Office'];
    $serviceRequest->Fk_TI_Service = 1; // Redes
    $serviceRequest->Fk_Software_System = 1; // Asumiendo que existe
    $serviceRequest->Subject = "Ticket de prueba para asignación automática";
    $serviceRequest->Property_Number = "TEST-001";
    $serviceRequest->Description = "Este es un ticket creado para probar la asignación automática de técnicos";
    $serviceRequest->System_Priority = "Media";
    $serviceRequest->Status = "Pendiente";
    
    $created = $serviceRequest->create();
    
    if ($created) {
        echo "   Ticket creado exitosamente con ID: {$serviceRequest->ID_Service_Request}\n";
        echo "   Código: {$serviceRequest->Ticket_Code}\n";
        echo "   Estado: {$serviceRequest->Status}\n";
    } else {
        die("   Error al crear ticket\n");
    }
    echo "\n";
    
    // 4. Verificar si el técnico fue asignado automáticamente
    echo "4. Verificando asignación automática...\n";
    $query = "SELECT tt.Fk_Technician, t.First_Name, t.Last_Name, tt.Status, tt.Assigned_At
              FROM Ticket_Technicians tt
              JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
              WHERE tt.Fk_Service_Request = :ticketId";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":ticketId", $serviceRequest->ID_Service_Request);
    $stmt->execute();
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($assignment) {
        echo "   Técnico asignado automáticamente: {$assignment['First_Name']} {$assignment['Last_Name']}\n";
        echo "   Estado de asignación: {$assignment['Status']}\n";
        echo "   Asignado a las: {$assignment['Assigned_At']}\n";
    } else {
        echo "   No se asignó ningún técnico automáticamente\n";
    }
    echo "\n";
    
    // 5. Verificar estado del ticket
    echo "5. Estado final del ticket:\n";
    $query = "SELECT Status FROM Service_Request WHERE ID_Service_Request = :ticketId";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":ticketId", $serviceRequest->ID_Service_Request);
    $stmt->execute();
    $ticketStatus = $stmt->fetchColumn();
    
    echo "   Estado: {$ticketStatus}\n";
    echo "\n";
    
    echo "=== PRUEBA COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
