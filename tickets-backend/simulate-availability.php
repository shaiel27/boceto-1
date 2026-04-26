<?php
// Simulate technician becoming available and assign pending tickets
require_once 'src/config/database.php';
require_once 'src/models/Technician.php';

echo "=== Simular Disponibilidad de Técnico ===\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo "❌ Error: No se pudo conectar a la base de datos\n";
        exit(1);
    }

    echo "✅ Conexión a base de datos exitosa\n\n";

    // Update a technician to be available and set a schedule for current time
    $currentDay = date('l');
    $dayMap = [
        'Monday' => 'Lunes',
        'Tuesday' => 'Martes',
        'Wednesday' => 'Miercoles',
        'Thursday' => 'Jueves',
        'Friday' => 'Viernes',
        'Saturday' => 'Sabado',
        'Sunday' => 'Domingo'
    ];
    $currentDaySpanish = $dayMap[$currentDay] ?? $currentDay;
    $currentTime = date('H:i:s');

    echo "Hora actual: {$currentDaySpanish} {$currentTime}\n\n";

    // Set shaiel becerra to available and update schedule for current time
    echo "Actualizando técnico shaiel becerra para estar disponible ahora...\n";

    // Update status
    $updateStatus = $db->prepare("UPDATE Technicians SET Status = 'Activo' WHERE First_Name = 'shaiel' AND Last_Name = 'becerra'");
    $updateStatus->execute();

    // Update schedule to cover current time
    $updateSchedule = $db->prepare("UPDATE Technician_Schedules
                                     SET Work_Start_Time = '00:00:00', Work_End_Time = '23:59:59'
                                     WHERE Fk_Technician = (SELECT ID_Technicians FROM Technicians WHERE First_Name = 'shaiel' AND Last_Name = 'becerra')
                                     AND Day_Of_Week = :currentDay");
    $updateSchedule->bindParam(":currentDay", $currentDaySpanish);
    $updateSchedule->execute();

    echo "✅ Técnico actualizado\n\n";

    // Now run assignment
    echo "Ejecutando asignación automática...\n\n";

    $technician = new Technician($db);
    $result = $technician->assignPendingTickets();

    echo "✅ Asignación completada\n";
    echo "Tickets asignados: {$result['assigned_count']}\n";

    if (!empty($result['assignments'])) {
        echo "\nDetalles de asignaciones:\n";
        foreach ($result['assignments'] as $assignment) {
            echo "  - Ticket ID: {$assignment['ticket_id']} -> Técnico: {$assignment['technician']}\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
