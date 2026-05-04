<?php
// Script para verificar la estructura de la tabla Role
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener estructura de la tabla Role
    $stmt = $conn->query("DESCRIBE Role");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Estructura de la tabla Role:\n";
    echo "================================\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Null']}, {$column['Key']})\n";
    }
    
    // Obtener estructura de la tabla Technicians
    echo "\n\nEstructura de la tabla Technicians:\n";
    echo "================================\n";
    $stmt = $conn->query("DESCRIBE Technicians");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Null']}, {$column['Key']})\n";
    }
    
    // Obtener estructura de la tabla Ticket_Technicians
    echo "\n\nEstructura de la tabla Ticket_Technicians:\n";
    echo "================================\n";
    $stmt = $conn->query("DESCRIBE Ticket_Technicians");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Null']}, {$column['Key']})\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
