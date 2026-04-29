<?php
// Test the timeline endpoint
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/TicketTimeline.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== Probando Timeline Model ===\n";

    $timeline = new TicketTimeline($db);

    // Test get timeline for ticket 1
    echo "\nObteniendo timeline del ticket 1:\n";
    $events = $timeline->getByTicket(1);

    echo "Total de eventos: " . count($events) . "\n";
    foreach ($events as $event) {
        echo "ID: {$event['ID_Timeline']}\n";
        echo "  Acción: {$event['Action_Description']}\n";
        echo "  Usuario: {$event['User_Name']}\n";
        echo "  Estado Anterior: " . ($event['Old_Status'] ?? 'N/A') . "\n";
        echo "  Estado Nuevo: " . ($event['New_Status'] ?? 'N/A') . "\n";
        echo "  Fecha: {$event['Event_Date']}\n";
        echo "---\n";
    }

    // Test get timeline for ticket 2
    echo "\nObteniendo timeline del ticket 2:\n";
    $events2 = $timeline->getByTicket(2);

    echo "Total de eventos: " . count($events2) . "\n";
    foreach ($events2 as $event) {
        echo "ID: {$event['ID_Timeline']}\n";
        echo "  Acción: {$event['Action_Description']}\n";
        echo "  Usuario: {$event['User_Name']}\n";
        echo "  Estado Anterior: " . ($event['Old_Status'] ?? 'N/A') . "\n";
        echo "  Estado Nuevo: " . ($event['New_Status'] ?? 'N/A') . "\n";
        echo "  Fecha: {$event['Event_Date']}\n";
        echo "---\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
