<?php
// Script para verificar los IDs de oficinas existentes
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== OFICINAS EXISTENTES EN LA BASE DE DATOS ===\n\n";
    
    // Obtener todas las oficinas con sus IDs
    $query = "SELECT ID_Office, Name_Office, Office_Type FROM Office ORDER BY ID_Office LIMIT 20";
    $stmt = $conn->query($query);
    $offices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "ID_Office | Name_Office | Office_Type\n";
    echo str_repeat("-", 80) . "\n";
    
    foreach ($offices as $office) {
        printf("%-9s | %-40s | %s\n", 
            $office['ID_Office'], 
            substr($office['Name_Office'], 0, 40), 
            $office['Office_Type']
        );
    }
    
    echo "\nTotal oficinas: " . count($offices) . " (mostrando primeras 20)\n";
    
    // Obtener el rango de IDs
    $stmt = $conn->query("SELECT MIN(ID_Office) as min_id, MAX(ID_Office) as max_id FROM Office");
    $range = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\nRango de IDs: {$range['min_id']} a {$range['max_id']}\n";
    
    // Verificar si existen las oficinas que se usan en el script
    echo "\n=== VERIFICACIÓN DE IDs USADOS EN EL SCRIPT ===\n";
    $scriptIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14];
    
    foreach ($scriptIds as $id) {
        $stmt = $conn->query("SELECT Name_Office FROM Office WHERE ID_Office = $id");
        $office = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($office) {
            echo "✓ ID $id: {$office['Name_Office']}\n";
        } else {
            echo "✗ ID $id: NO EXISTE\n";
        }
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
