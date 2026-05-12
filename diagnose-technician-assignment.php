<?php
require_once 'tickets-backend/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error connecting to database\n");
    }
    
    echo "=== DIAGNOSTIC: Automatic Technician Assignment ===\n\n";
    
    // Check total technicians
    $stmt = $db->query("SELECT COUNT(*) as total FROM Technicians");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total Technicians: {$result['total']}\n";
    
    // Check technician statuses
    $stmt = $db->query("SELECT Status, COUNT(*) as count FROM Technicians GROUP BY Status");
    echo "\nTechnician Status Distribution:\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  {$row['Status']}: {$row['count']}\n";
    }
    
    // Check technician schedules
    $stmt = $db->query("SELECT COUNT(*) as total FROM Technician_Schedules");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\nTotal Technician Schedules: {$result['total']}\n";
    
    // Check technicians with service 1
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM Technicians_Service WHERE Fk_TI_Service = 1 AND Status = 'Activo'");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Technicians with Service 1: {$result['total']}\n";
    
    // Check current day and time
    $currentDay = date('l');
    $currentTime = date('H:i:s');
    echo "\nCurrent Day: {$currentDay}\n";
    echo "Current Time: {$currentTime}\n";
    
    // Check technicians available right now (simplified query)
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
    
    $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status,
                     sched.Day_Of_Week, sched.Work_Start_Time, sched.Work_End_Time
              FROM Technicians t
              LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician
              LEFT JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
              WHERE ts.Fk_TI_Service = 1 AND ts.Status = 'Activo'
              LIMIT 10";
    
    $stmt = $db->query($query);
    echo "\nTechnicians with Service 1:\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  ID: {$row['ID_Technicians']}, Name: {$row['First_Name']} {$row['Last_Name']}, Status: {$row['Status']}\n";
        echo "    Schedule: {$row['Day_Of_Week']} {$row['Work_Start_Time']}-{$row['Work_End_Time']}\n";
    }
    
    // Check technicians marked as 'Disponible'
    $stmt = $db->query("SELECT COUNT(*) as total FROM Technicians WHERE Status = 'Disponible'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\nTechnicians marked as 'Disponible': {$result['total']}\n";
    
    // Check if there are any technicians at all
    $stmt = $db->query("SELECT ID_Technicians, First_Name, Last_Name, Status FROM Technicians LIMIT 5");
    echo "\nSample Technicians:\n";
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "  ID: {$row['ID_Technicians']}, Name: {$row['First_Name']} {$row['Last_Name']}, Status: {$row['Status']}\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
