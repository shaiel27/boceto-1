<?php
require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== VERIFICACIÓN DEL TICKET 17 ===\n\n";
    
    // 1. Estado del ticket 17
    echo "1. Estado del ticket 17:\n";
    $query = "SELECT ID_Service_Request, Ticket_Code, Status, Created_at, Fk_TI_Service
              FROM Service_Request
              WHERE ID_Service_Request = 17";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($ticket) {
        echo "   ID: {$ticket['ID_Service_Request']}\n";
        echo "   Código: {$ticket['Ticket_Code']}\n";
        echo "   Estado: {$ticket['Status']}\n";
        echo "   Servicio ID: {$ticket['Fk_TI_Service']}\n";
        echo "   Creado: {$ticket['Created_at']}\n";
    } else {
        echo "   Ticket 17 no encontrado\n";
    }
    
    // 2. Asignaciones del ticket 17
    echo "\n2. Asignaciones del ticket 17:\n";
    $query = "SELECT tt.*, t.First_Name, t.Last_Name, t.Status as Tech_Status
              FROM Ticket_Technicians tt
              JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
              WHERE tt.Fk_Service_Request = 17";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($assignments)) {
        foreach ($assignments as $assignment) {
            echo "   - Técnico: {$assignment['First_Name']} {$assignment['Last_Name']} (ID: {$assignment['Fk_Technician']})\n";
            echo "     Estado de asignación: {$assignment['Status']}\n";
            echo "     Estado del técnico: {$assignment['Tech_Status']}\n";
            echo "     Fecha de asignación: {$assignment['Assigned_At']}\n";
        }
    } else {
        echo "   No hay asignaciones para el ticket 17\n";
    }
    
    // 3. Últimos tickets creados
    echo "\n3. Últimos 5 tickets creados:\n";
    $query = "SELECT ID_Service_Request, Ticket_Code, Status, Created_at
              FROM Service_Request
              ORDER BY Created_at DESC
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $recentTickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($recentTickets as $ticket) {
        echo "   - ID: {$ticket['ID_Service_Request']}, Código: {$ticket['Ticket_Code']}, Estado: {$ticket['Status']}, Creado: {$ticket['Created_at']}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
