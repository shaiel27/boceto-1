<?php
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';
require_once __DIR__ . '/src/models/ServiceRequest.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== Prueba de conteo de tickets resueltos por técnico ===\n\n";

    $technician = new Technician($db);
    $serviceRequest = new ServiceRequest($db);

    // Obtener todos los técnicos con sus conteos
    echo "1. Estado actual de técnicos:\n";
    $technicians = $technician->getAll();
    foreach ($technicians as $tech) {
        echo "   Técnico: {$tech['First_Name']} {$tech['Last_Name']}\n";
        echo "   Tickets Asignados: {$tech['Tickets_Assigned']}\n";
        echo "   Tickets Resueltos: {$tech['Tickets_Resolved']}\n";
        echo "---\n";
    }

    // Obtener un ticket que no esté cerrado
    echo "\n2. Buscando ticket para cerrar...\n";
    $query = "SELECT ID_Service_Request, Status FROM Service_Request WHERE Status != 'Cerrado' LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        echo "   No hay tickets para cerrar. Creando uno de prueba...\n";
        
        // Crear ticket de prueba
        $insertQuery = "INSERT INTO Service_Request 
                       (Fk_Office, Fk_User_Requester, Fk_TI_Service, Fk_Boss_Requester, Subject, Description, System_Priority, Status)
                       VALUES (6, 4, 1, 1, 'Ticket de prueba', 'Descripción de prueba', 'Media', 'En Proceso')";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute();
        $ticketId = $db->lastInsertId();
        
        // Asignar técnico
        $assignQuery = "INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Assigned_At, Status)
                       VALUES (:ticketId, 1, 1, NOW(), 'Activo')";
        $assignStmt = $db->prepare($assignQuery);
        $assignStmt->bindParam(":ticketId", $ticketId);
        $assignStmt->execute();
        
        $ticket = ['ID_Service_Request' => $ticketId, 'Status' => 'En Proceso'];
        echo "   Ticket creado: ID {$ticketId}\n";
    } else {
        echo "   Ticket encontrado: ID {$ticket['ID_Service_Request']}, Status: {$ticket['Status']}\n";
    }

    $ticketId = $ticket['ID_Service_Request'];

    // Obtener técnicos asignados antes de cerrar
    echo "\n3. Técnicos asignados al ticket {$ticketId} antes de cerrar:\n";
    $techQuery = "SELECT tt.Fk_Technician, t.First_Name, t.Last_Name, 
                  (SELECT COUNT(*) FROM Ticket_Technicians tt2 
                   JOIN Service_Request sr ON tt2.Fk_Service_Request = sr.ID_Service_Request 
                   WHERE tt2.Fk_Technician = tt.Fk_Technician AND sr.Status = 'Cerrado') as Tickets_Resolved_Before
                  FROM Ticket_Technicians tt
                  JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
                  WHERE tt.Fk_Service_Request = :ticketId AND tt.Status = 'Activo'";
    $techStmt = $db->prepare($techQuery);
    $techStmt->bindParam(":ticketId", $ticketId);
    $techStmt->execute();
    $assignedTechs = $techStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($assignedTechs as $tech) {
        echo "   Técnico: {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['Fk_Technician']})\n";
        echo "   Tickets Resueltos antes: {$tech['Tickets_Resolved_Before']}\n";
    }

    // Cerrar el ticket
    echo "\n4. Cerrando ticket {$ticketId}...\n";
    $result = $serviceRequest->updateStatus($ticketId, 'Cerrado');
    
    if ($result) {
        echo "   Ticket cerrado exitosamente\n";
    } else {
        echo "   Error al cerrar ticket\n";
        exit(1);
    }

    // Verificar conteo después de cerrar
    echo "\n5. Técnicos asignados al ticket {$ticketId} después de cerrar:\n";
    $techQuery2 = "SELECT tt.Fk_Technician, t.First_Name, t.Last_Name, 
                   (SELECT COUNT(*) FROM Ticket_Technicians tt2 
                    JOIN Service_Request sr ON tt2.Fk_Service_Request = sr.ID_Service_Request 
                    WHERE tt2.Fk_Technician = tt.Fk_Technician AND sr.Status = 'Cerrado') as Tickets_Resolved_After
                  FROM Ticket_Technicians tt
                  JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
                  WHERE tt.Fk_Service_Request = :ticketId";
    $techStmt2 = $db->prepare($techQuery2);
    $techStmt2->bindParam(":ticketId", $ticketId);
    $techStmt2->execute();
    $assignedTechs2 = $techStmt2->fetchAll(PDO::FETCH_ASSOC);

    foreach ($assignedTechs2 as $tech) {
        echo "   Técnico: {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['Fk_Technician']})\n";
        echo "   Tickets Resueltos después: {$tech['Tickets_Resolved_After']}\n";
    }

    // Verificar estado final de técnicos
    echo "\n6. Estado final de técnicos:\n";
    $techniciansAfter = $technician->getAll();
    foreach ($techniciansAfter as $tech) {
        echo "   Técnico: {$tech['First_Name']} {$tech['Last_Name']}\n";
        echo "   Tickets Asignados: {$tech['Tickets_Assigned']}\n";
        echo "   Tickets Resueltos: {$tech['Tickets_Resolved']}\n";
        echo "---\n";
    }

    echo "\n=== Prueba completada ===\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
