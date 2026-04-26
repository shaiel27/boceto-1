<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== ESTRUCTURA DE TABLAS ===\n\n";

    // 1. Technicians_Service
    echo "1. Tabla Technicians_Service:\n";
    $query = "DESCRIBE Technicians_Service";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        echo "   {$col['Field']} ({$col['Type']})\n";
    }
    echo "\n";

    // 2. Ticket_Technicians
    echo "2. Tabla Ticket_Technicians:\n";
    $query = "DESCRIBE Ticket_Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        echo "   {$col['Field']} ({$col['Type']})\n";
    }
    echo "\n";

    // 3. Technicians
    echo "3. Tabla Technicians:\n";
    $query = "DESCRIBE Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        echo "   {$col['Field']} ({$col['Type']})\n";
    }
    echo "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
