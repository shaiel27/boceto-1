<?php
// Script de diagnóstico detallado para actualizar status de técnicos

$host = 'localhost';
$port = '3306';
$dbname = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Diagnóstico Detallado de Status de Técnicos</h1>";
    
    // Obtener día y hora actual
    $days = ['Sunday' => 'Domingo', 'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miercoles', 'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sabado'];
    $currentDay = $days[date('l')];
    $currentTime = date('H:i:s');
    
    echo "<h2>Contexto Actual</h2>";
    echo "<p>Día: <strong>$currentDay</strong></p>";
    echo "<p>Hora: <strong>$currentTime</strong></p>";
    
    // Obtener todos los técnicos con su información detallada
    $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
                     ts.Day_Of_Week, ts.Work_Start_Time, ts.Work_End_Time,
                     lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                     COUNT(DISTINCT CASE WHEN sr.Status != 'Cerrado' THEN tt.Fk_Service_Request END) as active_tickets
              FROM technicians t
              LEFT JOIN users u ON t.Fk_Users = u.ID_Users
              LEFT JOIN technician_schedules ts ON t.ID_Technicians = ts.Fk_Technician
              LEFT JOIN lunch_blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
              LEFT JOIN ticket_technicians tt ON t.ID_Technicians = tt.Fk_Technician AND tt.Status = 'Activo'
              LEFT JOIN service_request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
              GROUP BY t.ID_Technicians, ts.Day_Of_Week, ts.Work_Start_Time, ts.Work_End_Time, lb.Start_Time, lb.End_Time
              ORDER BY t.ID_Technicians";
    
    $stmt = $pdo->query($query);
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Análisis Detallado por Técnico</h2>";
    echo "<table border='1' style='border-collapse: collapse; font-size: 12px;'>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Status</th><th>Día Horario</th><th>Horario</th><th>Almuerzo</th><th>Tickets</th><th>En Horario?</th><th>En Almuerzo?</th><th>Debería Ser</th></tr>";
    
    foreach ($technicians as $tech) {
        $scheduleDay = $tech['Day_Of_Week'] ?: 'Sin horario';
        $workStart = $tech['Work_Start_Time'] ?: '--:--:--';
        $workEnd = $tech['Work_End_Time'] ?: '--:--:--';
        $lunchStart = $tech['Lunch_Start'] ?: '--:--:--';
        $lunchEnd = $tech['Lunch_End'] ?: '--:--:--';
        
        // Verificar si el horario es para el día actual
        $isCurrentDay = ($scheduleDay === $currentDay);
        
        // Verificar si está en horario laboral
        $inWorkHours = ($isCurrentDay && $workStart && $workEnd && 
                       $currentTime >= $workStart && $currentTime <= $workEnd);
        
        // Verificar si está en bloque de almuerzo
        $inLunch = ($isCurrentDay && $lunchStart && $lunchEnd && 
                   $currentTime >= $lunchStart && $currentTime <= $lunchEnd);
        
        // Verificar si tiene tickets activos
        $hasActiveTickets = $tech['active_tickets'] > 0;
        
        // Determinar el status correcto
        if ($hasActiveTickets) {
            $shouldBe = 'Ocupado (tickets)';
        } elseif ($inLunch) {
            $shouldBe = 'Ocupado (almuerzo)';
        } elseif (!$inWorkHours && $isCurrentDay) {
            $shouldBe = 'Inactivo (fuera horario)';
        } elseif (!$isCurrentDay) {
            $shouldBe = 'Inactivo (día incorrecto)';
        } elseif ($inWorkHours) {
            $shouldBe = 'Disponible';
        } else {
            $shouldBe = 'Inactivo (sin horario)';
        }
        
        $inWorkStr = $inWorkHours ? '✅ Sí' : '❌ No';
        $inLunchStr = $inLunch ? '✅ Sí' : '❌ No';
        $dayMatch = $isCurrentDay ? '✅' : '❌';
        
        $statusColor = ($tech['Status'] === 'Disponible') ? 'green' : (($tech['Status'] === 'Ocupado') ? 'orange' : 'red');
        
        echo "<tr>";
        echo "<td>{$tech['ID_Technicians']}</td>";
        echo "<td>{$tech['First_Name']} {$tech['Last_Name']}</td>";
        echo "<td style='color: $statusColor; font-weight: bold;'>{$tech['Status']}</td>";
        echo "<td>$dayMatch $scheduleDay</td>";
        echo "<td>$workStart - $workEnd</td>";
        echo "<td>$lunchStart - $lunchEnd</td>";
        echo "<td>{$tech['active_tickets']}</td>";
        echo "<td>$inWorkStr</td>";
        echo "<td>$inLunchStr</td>";
        echo "<td><strong>$shouldBe</strong></td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error de conexión a la base de datos</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
