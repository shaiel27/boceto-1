<?php
require_once 'src/config/database.php';
require_once 'src/models/Technician.php';

$database = new Database();
$db = $database->getConnection();

$technician = new Technician($db);

echo "=== Verificación de Disponibilidad de Técnicos ===\n\n";

// Get current time info
$currentDay = date('l');
$currentTime = date('H:i:s');

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

echo "Hora actual: {$currentDaySpanish} {$currentTime}\n\n";

// Check each service
$services = [1 => 'Redes', 2 => 'Soporte', 3 => 'Programación'];

foreach ($services as $serviceId => $serviceName) {
    echo "Servicio: {$serviceName} (ID: {$serviceId})\n";

    $available = $technician->getAvailableTechniciansByService($serviceId);

    if (empty($available)) {
        echo "  ❌ No hay técnicos disponibles\n";
    } else {
        echo "  ✅ Técnicos disponibles:\n";
        foreach ($available as $tech) {
            echo "     - {$tech['First_Name']} {$tech['Last_Name']}\n";
        }
    }
    echo "\n";
}

// Show all technicians with their schedules
echo "=== Todos los Técnicos y sus Horarios ===\n\n";

$query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status,
                 ts.Fk_TI_Service, sched.Day_Of_Week, sched.Work_Start_Time, sched.Work_End_Time,
                 lb.Block_Name, lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End
          FROM Technicians t
          LEFT JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians AND ts.Status = 'Activo'
          LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician
          LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
          ORDER BY t.First_Name, t.Last_Name";

$stmt = $db->prepare($query);
$stmt->execute();
$allTechs = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($allTechs as $tech) {
    echo "{$tech['First_Name']} {$tech['Last_Name']} (Status: {$tech['Status']})\n";
    if ($tech['Day_Of_Week']) {
        echo "  Horario: {$tech['Day_Of_Week']} {$tech['Work_Start_Time']} - {$tech['Work_End_Time']}\n";
    }
    if ($tech['Block_Name']) {
        echo "  Almuerzo: {$tech['Block_Name']} ({$tech['Lunch_Start']} - {$tech['Lunch_End']})\n";
    }
    if ($tech['Fk_TI_Service']) {
        echo "  Servicio ID: {$tech['Fk_TI_Service']}\n";
    }
    echo "\n";
}
?>
