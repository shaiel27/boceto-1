<?php
// Script para verificar la estructura de la tabla Users
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener estructura de la tabla Users
    $stmt = $conn->query("DESCRIBE Users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Estructura de la tabla Users:\n";
    echo "================================\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Null']}, {$column['Key']})\n";
    }
    
    // Obtener estructura de la tabla Boss
    echo "\n\nEstructura de la tabla Boss:\n";
    echo "================================\n";
    $stmt = $conn->query("DESCRIBE Boss");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Null']}, {$column['Key']})\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
