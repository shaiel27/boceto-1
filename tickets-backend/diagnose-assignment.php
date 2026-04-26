<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';
require_once __DIR__ . '/src/models/ServiceRequest.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== DIAGNÓSTICO DE ASIGNACIÓN DE TÉCNICOS ===\n\n";

    // 1. Verificar tickets pendientes
    echo "1. Tickets pendientes:\n";
    $query = "SELECT ID_Service_Request, Fk_TI_Service, Status FROM Service_Request WHERE Status = 'Pendiente' LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($tickets)) {
        echo "   No hay tickets pendientes\n\n";
    } else {
        foreach ($tickets as $ticket) {
            echo "   Ticket ID: {$ticket['ID_Service_Request']}, Service ID: {$ticket['Fk_TI_Service']}, Status: {$ticket['Status']}\n";
        }
        echo "\n";
    }

    // 2. Verificar técnicos disponibles para un servicio específico
    $technician = new Technician($db);
    $serviceId = 3; // Programación
    
    echo "2. Técnicos para servicio ID {$serviceId} (Programación):\n";
    $techs = $technician->getAllTechniciansByService($serviceId);
    
    if (empty($techs)) {
        echo "   No hay técnicos asignados a este servicio\n\n";
    } else {
        foreach ($techs as $tech) {
            echo "   Técnico ID: {$tech['ID_Technicians']}, Nombre: {$tech['First_Name']} {$tech['Last_Name']}, Status: {$tech['Status']}\n";
        }
        echo "\n";
    }

    // 3. Verificar tabla Ticket_Technicians
    echo "3. Asignaciones existentes (Ticket_Technicians):\n";
    $query = "SELECT tt.ID_Ticket_Technician, tt.Fk_Service_Request, tt.Fk_Technician, tt.Status, sr.Subject
              FROM Ticket_Technicians tt
              LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($assignments)) {
        echo "   No hay asignaciones registradas\n\n";
    } else {
        foreach ($assignments as $assignment) {
            echo "   Asignación ID: {$assignment['ID_Ticket_Technician']}, Ticket: {$assignment['Fk_Service_Request']} ({$assignment['Subject']}), Técnico: {$assignment['Fk_Technician']}, Status: {$assignment['Status']}\n";
        }
        echo "\n";
    }

    // 4. Verificar si hay técnicos con servicios asignados
    echo "4. Técnicos con servicios asignados (Technicians_Service):\n";
    $query = "SELECT ts.Fk_Technicians, ts.Fk_TI_Service, ts.Status, t.First_Name, t.Last_Name, s.Type_Service
              FROM Technicians_Service ts
              JOIN Technicians t ON ts.Fk_Technicians = t.ID_Technicians
              JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service
              LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $techServices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($techServices)) {
        echo "   No hay técnicos con servicios asignados\n\n";
    } else {
        foreach ($techServices as $ts) {
            echo "   Técnico: {$ts['First_Name']} {$ts['Last_Name']}, Servicio: {$ts['Type_Service']} (ID: {$ts['Fk_TI_Service']}), Status: {$ts['Status']}\n";
        }
        echo "\n";
    }

    // 5. Prueba de asignación manual
    if (!empty($tickets) && !empty($techs)) {
        echo "5. Prueba de asignación manual:\n";
        $ticketId = $tickets[0]['ID_Service_Request'];
        $techId = $techs[0]['ID_Technicians'];
        
        echo "   Intentando asignar técnico {$techId} al ticket {$ticketId}...\n";
        
        $result = $technician->assignToTicket($ticketId, $techId, null, true);
        
        if ($result) {
            echo "   ✅ Asignación exitosa\n";
            
            // Verificar que se creó el registro
            $checkQuery = "SELECT * FROM Ticket_Technicians WHERE Fk_Service_Request = :ticketId AND Fk_Technician = :techId";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":ticketId", $ticketId);
            $checkStmt->bindParam(":techId", $techId);
            $checkStmt->execute();
            $check = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($check) {
                echo "   Registro creado: ID={$check['ID_Ticket_Technician']}, Status={$check['Status']}\n";
            }
        } else {
            echo "   ❌ Asignación falló\n";
        }
    } else {
        echo "5. No se puede probar asignación (no hay tickets o técnicos disponibles)\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
