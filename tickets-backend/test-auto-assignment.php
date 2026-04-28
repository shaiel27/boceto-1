<?php
/**
 * Script para probar la asignación automática de técnicos a tickets pendientes
 */

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== PRUEBA DE ASIGNACIÓN AUTOMÁTICA DE TÉCNICOS ===\n\n";
    
    // 1. Verificar tickets pendientes
    echo "1. Tickets pendientes:\n";
    $query = "SELECT ID_Service_Request, Ticket_Code, Fk_TI_Service, Subject, Status 
              FROM Service_Request 
              WHERE Status = 'Pendiente' 
              ORDER BY Created_at ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $pendingTickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($pendingTickets)) {
        echo "   No hay tickets pendientes\n";
    } else {
        foreach ($pendingTickets as $ticket) {
            echo "   - ID: {$ticket['ID_Service_Request']}, Código: {$ticket['Ticket_Code']}, ";
            echo "Servicio ID: {$ticket['Fk_TI_Service']}, Asunto: {$ticket['Subject']}\n";
        }
    }
    echo "\n";
    
    // 2. Verificar técnicos disponibles por servicio
    echo "2. Técnicos disponibles por servicio:\n";
    $servicesQuery = "SELECT ID_TI_Service, Type_Service FROM TI_Service ORDER BY ID_TI_Service";
    $servicesStmt = $db->prepare($servicesQuery);
    $servicesStmt->execute();
    $services = $servicesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($services as $service) {
        $serviceId = $service['ID_TI_Service'];
        $serviceName = $service['Type_Service'];
        
        $query = "SELECT COUNT(*) as count
                  FROM Technicians_Service ts
                  JOIN Technicians t ON ts.Fk_Technicians = t.ID_Technicians
                  WHERE ts.Fk_TI_Service = :serviceId 
                    AND ts.Status = 'Activo'
                    AND t.Status IN ('Disponible', 'Activo')";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':serviceId', $serviceId);
        $stmt->execute();
        $count = $stmt->fetchColumn();
        
        echo "   - {$serviceName} (ID {$serviceId}): {$count} técnico(s) disponible(s)\n";
    }
    echo "\n";
    
    // 3. Ejecutar asignación automática
    echo "3. Ejecutando asignación automática...\n";
    $technician = new Technician($db);
    $result = $technician->assignPendingTickets();
    
    echo "   Tickets asignados: {$result['assigned_count']}\n";
    
    if (!empty($result['assignments'])) {
        echo "\n   Detalles de asignaciones:\n";
        foreach ($result['assignments'] as $assignment) {
            echo "   - Ticket ID: {$assignment['ticket_id']} -> Técnico: {$assignment['technician']} (Servicio ID: {$assignment['service_id']})\n";
        }
    }
    echo "\n";
    
    // 4. Verificar estado después de la asignación
    echo "4. Estado de tickets después de la asignación:\n";
    $query = "SELECT ID_Service_Request, Ticket_Code, Status
              FROM Service_Request
              WHERE Status IN ('Pendiente', 'En Proceso')
              ORDER BY Created_at DESC
              LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $recentTickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($recentTickets as $ticket) {
        echo "   - ID: {$ticket['ID_Service_Request']}, Código: {$ticket['Ticket_Code']}, Estado: {$ticket['Status']}\n";
    }
    echo "\n";
    
    // 5. Verificar asignaciones de técnicos
    echo "5. Asignaciones activas de técnicos:\n";
    $query = "SELECT tt.ID_Ticket_Technician, tt.Fk_Service_Request, tt.Fk_Technician, 
                     t.First_Name, t.Last_Name, tt.Status, tt.Assigned_At
              FROM Ticket_Technicians tt
              JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
              WHERE tt.Status = 'Activo'
              ORDER BY tt.Assigned_At DESC
              LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($assignments)) {
        echo "   No hay asignaciones activas\n";
    } else {
        foreach ($assignments as $assignment) {
            echo "   - Ticket ID: {$assignment['Fk_Service_Request']}, ";
            echo "Técnico: {$assignment['First_Name']} {$assignment['Last_Name']}, ";
            echo "Estado: {$assignment['Status']}, Asignado: {$assignment['Assigned_At']}\n";
        }
    }
    echo "\n";
    
    echo "=== PRUEBA COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
