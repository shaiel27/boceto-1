<?php
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== DEPURACIÓN DE HORARIOS DE TÉCNICOS ===\n\n";
    
    $currentDay = date('l'); // Tuesday
    $currentTime = date('H:i:s'); // 16:58:17
    
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
    
    echo "Día actual: {$currentDay} ({$currentDaySpanish})\n";
    echo "Hora actual: {$currentTime}\n\n";
    
    // 1. Verificar todos los técnicos y sus horarios
    echo "1. Horarios de todos los técnicos:\n";
    $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status,
                     sched.Day_Of_Week, sched.Work_Start_Time, sched.Work_End_Time
              FROM Technicians t
              LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician
              ORDER BY t.ID_Technicians, sched.Day_Of_Week";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($schedules as $schedule) {
        $hasSchedule = $schedule['Day_Of_Week'] ? "SÍ" : "NO";
        echo "   Técnico {$schedule['ID_Technicians']}: {$schedule['First_Name']} {$schedule['Last_Name']} - Horario: {$hasSchedule}\n";
        if ($schedule['Day_Of_Week']) {
            echo "     Día: {$schedule['Day_Of_Week']}, Inicio: {$schedule['Work_Start_Time']}, Fin: {$schedule['Work_End_Time']}\n";
        }
    }
    
    // 2. Verificar técnicos disponibles para servicio Redes (ID: 1) con el método actual
    echo "\n2. Técnicos disponibles para servicio Redes (método con restricciones):\n";
    $technician = new Technician($db);
    $availableTechs = $technician->getAvailableTechniciansByService(1);
    
    if (empty($availableTechs)) {
        echo "   ❌ NO hay técnicos disponibles con el método actual\n";
    } else {
        foreach ($availableTechs as $tech) {
            echo "   ✅ {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']})\n";
        }
    }
    
    // 3. Verificar técnicos disponibles para servicio Redes (ID: 1) sin restricciones de horario
    echo "\n3. Técnicos para servicio Redes (sin restricciones de horario):\n";
    $allTechs = $technician->getAllTechniciansByService(1);
    
    $disponibleTechs = array_filter($allTechs, function($tech) {
        return in_array($tech['Status'], ['Disponible', 'Activo']);
    });
    
    if (empty($disponibleTechs)) {
        echo "   ❌ NO hay técnicos disponibles sin restricciones\n";
    } else {
        foreach ($disponibleTechs as $tech) {
            echo "   ✅ {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']}) - Status: {$tech['Status']}\n";
        }
    }
    
    // 4. Verificar si hay técnicos con horario para hoy y hora actual
    echo "\n4. Técnicos con horario disponible ahora:\n";
    $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status
              FROM Technicians t
              INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
              LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician
              WHERE ts.Fk_TI_Service = 1
                AND ts.Status = 'Activo'
                AND t.Status IN ('Activo', 'Disponible')
                AND sched.Day_Of_Week = :currentDay
                AND sched.Work_Start_Time <= :currentTime
                AND sched.Work_End_Time >= :currentTime
              ORDER BY t.First_Name, t.Last_Name";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":currentDay", $currentDaySpanish);
    $stmt->bindParam(":currentTime", $currentTime);
    $stmt->execute();
    $availableNow = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($availableNow)) {
        echo "   ❌ NO hay técnicos con horario disponible ahora\n";
    } else {
        foreach ($availableNow as $tech) {
            echo "   ✅ {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']}) - Status: {$tech['Status']}\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
