<?php
require_once 'src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== Estructura de Tablas de Técnicos ===\n\n";

// Technician_Schedules
echo "1. Technician_Schedules:\n";
$result = $db->query("DESCRIBE Technician_Schedules");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['Field']}: {$row['Type']}\n";
}

// Lunch_Blocks
echo "\n2. Lunch_Blocks:\n";
$result = $db->query("DESCRIBE Lunch_Blocks");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['Field']}: {$row['Type']}\n";
}

// Ticket_Technicians
echo "\n3. Ticket_Technicians:\n";
$result = $db->query("DESCRIBE Ticket_Technicians");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['Field']}: {$row['Type']}\n";
}

// Technicians_Service
echo "\n4. Technicians_Service:\n";
$result = $db->query("DESCRIBE Technicians_Service");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['Field']}: {$row['Type']}\n";
}

// Service_Request (para ver estados)
echo "\n5. Service_Request (Status):\n";
$result = $db->query("SELECT DISTINCT Status FROM Service_Request");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['Status']}\n";
}

echo "\n=== Datos de Ejemplo ===\n\n";

// Horarios de técnicos
echo "Horarios de técnicos:\n";
$result = $db->query("SELECT ts.*, t.First_Name, t.Last_Name FROM Technician_Schedules ts JOIN Technicians t ON ts.Fk_Technician = t.ID_Technicians LIMIT 5");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['First_Name']} {$row['Last_Name']}: {$row['Day_Of_Week']} {$row['Work_Start_Time']} - {$row['Work_End_Time']}\n";
}

// Bloques de almuerzo
echo "\nBloques de almuerzo:\n";
$result = $db->query("SELECT * FROM Lunch_Blocks");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['Block_Name']}: {$row['Start_Time']} - {$row['End_Time']}\n";
}

// Tickets activos por técnico
echo "\nTickets activos por técnico:\n";
$result = $db->query("SELECT t.First_Name, t.Last_Name, COUNT(tt.ID_Technician) as active_tickets
                      FROM Technicians t
                      LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician AND tt.Status = 'Activo'
                      GROUP BY t.ID_Technicians");
while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
    echo "   - {$row['First_Name']} {$row['Last_Name']}: {$row['active_tickets']} tickets activos\n";
}
?>
