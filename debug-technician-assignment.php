<?php
// Script para depurar asignación de técnicos
require_once 'tickets-backend/src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Depuración de Asignación de Técnicos</h2>";

// 1. Verificar si hay técnicos en la base de datos
$query1 = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Lunch_Block
           FROM Technicians t";
$stmt1 = $db->prepare($query1);
$stmt1->execute();
$technicians = $stmt1->fetchAll(PDO::FETCH_ASSOC);

echo "<h3>1. Técnicos en la base de datos:</h3>";
echo "<pre>" . print_r($technicians, true) . "</pre>";

// 2. Verificar si hay relación técnicos-servicios
$query2 = "SELECT tcs.*, t.First_Name, t.Last_Name, ts.Type_Service
           FROM Technicians_Service tcs
           JOIN Technicians t ON tcs.Fk_Technicians = t.ID_Technicians
           JOIN TI_Service ts ON tcs.Fk_TI_Service = ts.ID_TI_Service";
$stmt2 = $db->prepare($query2);
$stmt2->execute();
$techServices = $stmt2->fetchAll(PDO::FETCH_ASSOC);

echo "<h3>2. Relación Técnicos-Servicios:</h3>";
echo "<pre>" . print_r($techServices, true) . "</pre>";

// 3. Verificar horarios de técnicos
$query3 = "SELECT ts.*, t.First_Name, t.Last_Name
           FROM Technician_Schedules ts
           JOIN Technicians t ON ts.Fk_Technician = t.ID_Technicians";
$stmt3 = $db->prepare($query3);
$stmt3->execute();
$schedules = $stmt3->fetchAll(PDO::FETCH_ASSOC);

echo "<h3>3. Horarios de Técnicos:</h3>";
echo "<pre>" . print_r($schedules, true) . "</pre>";

// 4. Verificar bloques de almuerzo
$query4 = "SELECT lb.*, t.First_Name, t.Last_Name
           FROM Lunch_Blocks lb
           JOIN Technicians t ON lb.ID_Lunch_Block = t.Fk_Lunch_Block";
$stmt4 = $db->prepare($query4);
$stmt4->execute();
$lunchBlocks = $stmt4->fetchAll(PDO::FETCH_ASSOC);

echo "<h3>4. Bloques de Almuerzo:</h3>";
echo "<pre>" . print_r($lunchBlocks, true) . "</pre>";

// 5. Simular query de getAvailableTechniciansByService
$days = ['Sunday' => 'Domingo', 'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miercoles', 'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sabado'];
$currentDay = $days[date('l')];
$currentTime = date('H:i:s');

echo "<h3>5. Simulación de getAvailableTechniciansByService:</h3>";
echo "<p>Día actual: $currentDay</p>";
echo "<p>Hora actual: $currentTime</p>";

// Usar un ID de servicio existente (por ejemplo 1)
$serviceId = 1;

$query5 = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
                 ts.Work_Start_Time, ts.Work_End_Time,
                 lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                 COUNT(DISTINCT tt.Fk_Service_Request) as active_tickets
          FROM Technicians t
          INNER JOIN Technicians_Service tcs ON t.ID_Technicians = tcs.Fk_Technicians
          INNER JOIN TI_Service s ON tcs.Fk_TI_Service = s.ID_TI_Service
          LEFT JOIN Technician_Schedules ts ON t.ID_Technicians = ts.Fk_Technician AND ts.Day_Of_Week = :dayOfWeek
          LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
          LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician 
              AND tt.Status = 'Activo'
          WHERE tcs.Fk_TI_Service = :serviceId 
              AND t.Status = 'Activo'
              AND tcs.Status = 'Activo'
              AND ts.Work_Start_Time IS NOT NULL
          GROUP BY t.ID_Technicians
          HAVING (:currentTime >= ts.Work_Start_Time AND :currentTime <= ts.Work_End_Time)
                 AND (:currentTime < lb.Start_Time OR :currentTime > lb.End_Time OR lb.Start_Time IS NULL)
          ORDER BY active_tickets ASC";

$stmt5 = $db->prepare($query5);
$stmt5->bindParam(":serviceId", $serviceId);
$stmt5->bindParam(":dayOfWeek", $currentDay);
$stmt5->bindParam(":currentTime", $currentTime);
$stmt5->execute();
$availableTechs = $stmt5->fetchAll(PDO::FETCH_ASSOC);

echo "<pre>" . print_r($availableTechs, true) . "</pre>";

// 6. Verificar el último ticket creado
$query6 = "SELECT sr.*, o.Name_Office 
           FROM Service_Request sr
           LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
           ORDER BY sr.ID_Service_Request DESC LIMIT 1";
$stmt6 = $db->prepare($query6);
$stmt6->execute();
$lastTicket = $stmt6->fetch(PDO::FETCH_ASSOC);

echo "<h3>6. Último ticket creado:</h3>";
echo "<pre>" . print_r($lastTicket, true) . "</pre>";

// 7. Verificar técnicos asignados al último ticket
if ($lastTicket) {
    $query7 = "SELECT tt.*, t.First_Name, t.Last_Name
               FROM Ticket_Technicians tt
               JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
               WHERE tt.Fk_Service_Request = :ticketId";
    $stmt7 = $db->prepare($query7);
    $stmt7->bindParam(":ticketId", $lastTicket['ID_Service_Request']);
    $stmt7->execute();
    $assignedTechs = $stmt7->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>7. Técnicos asignados al último ticket:</h3>";
    echo "<pre>" . print_r($assignedTechs, true) . "</pre>";
}
?>
