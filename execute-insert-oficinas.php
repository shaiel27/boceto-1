<?php
// Script para ejecutar el insert de oficinas
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Leer el archivo SQL
    $sqlFile = __DIR__ . '/insert-oficinas-completas.sql';
    if (!file_exists($sqlFile)) {
        echo "Error: El archivo SQL no existe: $sqlFile\n";
        exit(1);
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Ejecutar el SQL
    $conn->exec($sql);
    
    echo "Oficinas insertadas exitosamente en la base de datos.\n";
    
    // Verificar cuántas oficinas hay ahora
    $stmt = $conn->query("SELECT COUNT(*) as total FROM Office");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total de oficinas en la base de datos: {$result['total']}\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
