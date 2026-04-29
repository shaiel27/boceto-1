<?php
require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== Insertando datos de Timeline ===\n";

    // Insertar timeline de prueba
    $query = "INSERT INTO Ticket_Timeline (Fk_Service_Request, Fk_User_Actor, Action_Description, Old_Status, New_Status, Event_Date) VALUES
    (1, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW()),
    (2, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW()),
    (2, 1, 'Estado cambiado a En Proceso', 'Pendiente', 'En Proceso', NOW() + INTERVAL 1 HOUR),
    (3, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW())";

    $stmt = $db->prepare($query);

    if ($stmt->execute()) {
        echo "Datos de timeline insertados exitosamente\n";
        echo "Filas afectadas: " . $stmt->rowCount() . "\n";
    } else {
        echo "Error al insertar datos de timeline\n";
        print_r($stmt->errorInfo());
    }

    // Verificar los datos insertados
    echo "\n=== Verificando datos insertados ===\n";
    $checkQuery = "SELECT * FROM Ticket_Timeline ORDER BY Event_Date ASC";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute();
    $results = $checkStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Total de eventos de timeline: " . count($results) . "\n";
    foreach ($results as $row) {
        echo "ID: {$row['ID_Timeline']}, Ticket: {$row['Fk_Service_Request']}, Acción: {$row['Action_Description']}, Fecha: {$row['Event_Date']}\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
