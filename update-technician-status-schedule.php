<?php
// Script para actualizar el status de técnicos basado en horario laboral, almuerzo y tickets activos

$host = 'localhost';
$port = '3306';
$dbname = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Actualización Automática de Status de Técnicos</h1>";
    
    // Obtener día y hora actual
    $days = ['Sunday' => 'Domingo', 'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miercoles', 'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sabado'];
    $currentDay = $days[date('l')];
    $currentTime = date('H:i:s');
    
    echo "<h2>Contexto Actual</h2>";
    echo "<p>Día: <strong>$currentDay</strong></p>";
    echo "<p>Hora: <strong>$currentTime</strong></p>";
    
    // Obtener todos los técnicos con su información
    $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
                     ts.Work_Start_Time, ts.Work_End_Time,
                     lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                     COUNT(DISTINCT CASE WHEN sr.Status != 'Cerrado' THEN tt.Fk_Service_Request END) as active_tickets
              FROM technicians t
              LEFT JOIN users u ON t.Fk_Users = u.ID_Users
              LEFT JOIN technician_schedules ts ON t.ID_Technicians = ts.Fk_Technician AND ts.Day_Of_Week = :dayOfWeek
              LEFT JOIN lunch_blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
              LEFT JOIN ticket_technicians tt ON t.ID_Technicians = tt.Fk_Technician AND tt.Status = 'Activo'
              LEFT JOIN service_request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
              GROUP BY t.ID_Technicians";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(":dayOfWeek", $currentDay);
    $stmt->execute();
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Actualización de Status</h2>";
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Técnico</th><th>Status Actual</th><th>Horario</th><th>Almuerzo</th><th>Tickets Activos</th><th>Nuevo Status</th><th>Razón</th></tr>";
    
    foreach ($technicians as $tech) {
        $newStatus = $tech['Status'];
        $reason = 'Sin cambios';
        
        // Verificar si tiene tickets activos
        $hasActiveTickets = $tech['active_tickets'] > 0;
        
        // Verificar si está en horario laboral
        $inWorkHours = ($tech['Work_Start_Time'] && $tech['Work_End_Time'] && 
                       $currentTime >= $tech['Work_Start_Time'] && $currentTime <= $tech['Work_End_Time']);
        
        // Verificar si está en bloque de almuerzo
        $inLunch = ($tech['Lunch_Start'] && $tech['Lunch_End'] && 
                   $currentTime >= $tech['Lunch_Start'] && $currentTime <= $tech['Lunch_End']);
        
        // Lógica de actualización de status según requisitos del usuario:
        // - Disponible: en horario laboral, fuera de bloque de almuerzo, sin tickets en proceso
        // - Ocupado: tiene tickets en proceso o está en horario de comida
        // - Inactivo: fuera de horario laboral
        if ($hasActiveTickets) {
            $newStatus = 'Ocupado';
            $reason = 'Tiene tickets en proceso';
        } elseif ($inLunch) {
            $newStatus = 'Ocupado';
            $reason = 'En horario de almuerzo';
        } elseif (!$inWorkHours && $tech['Work_Start_Time']) {
            // Solo marcar como Inactivo si tiene horario configurado pero está fuera de él
            $newStatus = 'Inactivo';
            $reason = 'Fuera de horario laboral';
        } elseif ($inWorkHours) {
            $newStatus = 'Disponible';
            $reason = 'En horario laboral, fuera de almuerzo, sin tickets';
        } else {
            // Si no tiene horario configurado para el día actual, mantener status actual
            $newStatus = $tech['Status'];
            $reason = 'Sin horario configurado para hoy - mantener status';
        }
        
        // Actualizar si el status cambió
        if ($newStatus !== $tech['Status']) {
            $updateStmt = $pdo->prepare("UPDATE technicians SET Status = :status WHERE ID_Technicians = :id");
            $updateStmt->execute([':status' => $newStatus, ':id' => $tech['ID_Technicians']]);
            $reason .= ' <span style="color: green;">✓ Actualizado</span>';
        }
        
        $statusColor = $newStatus == 'Disponible' ? 'green' : ($newStatus == 'Ocupado' ? 'orange' : 'red');
        
        echo "<tr>";
        echo "<td>{$tech['First_Name']} {$tech['Last_Name']}</td>";
        echo "<td>{$tech['Status']}</td>";
        echo "<td>{$tech['Work_Start_Time']} - {$tech['Work_End_Time']}</td>";
        echo "<td>{$tech['Lunch_Start']} - {$tech['Lunch_End']}</td>";
        echo "<td>{$tech['active_tickets']}</td>";
        echo "<td style='color: $statusColor; font-weight: bold;'>$newStatus</td>";
        echo "<td>$reason</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>Resumen</h2>";
    echo "<p>Los status se actualizan según:</p>";
    echo "<ul>";
    echo "<li><strong>Ocupado</strong>: Si tiene tickets activos o está en bloque de almuerzo</li>";
    echo "<li><strong>Inactivo</strong>: Si está fuera de su horario laboral</li>";
    echo "<li><strong>Disponible</strong>: Si está en horario laboral sin tickets activos ni almuerzo</li>";
    echo "</ul>";
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error de conexión a la base de datos</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
