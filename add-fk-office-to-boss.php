<?php
// Script para agregar campo Fk_Office a la tabla Boss
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Agregando campo Fk_Office a la tabla Boss...\n";
    
    // Verificar si el campo ya existe
    $check = $conn->query("SHOW COLUMNS FROM Boss LIKE 'Fk_Office'");
    if ($check->rowCount() > 0) {
        echo "El campo Fk_Office ya existe en la tabla Boss.\n";
    } else {
        // Agregar el campo Fk_Office
        $sql = "ALTER TABLE Boss ADD COLUMN Fk_Office INT NULL AFTER Fk_User";
        $conn->exec($sql);
        echo "Campo Fk_Office agregado exitosamente.\n";
        
        // Agregar la restricción de clave foránea
        $sql = "ALTER TABLE Boss ADD CONSTRAINT boss_ibfk_2 FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office) ON DELETE SET NULL";
        $conn->exec($sql);
        echo "Restricción de clave foránea agregada exitosamente.\n";
    }
    
    // Mostrar la nueva estructura de la tabla Boss
    echo "\nNueva estructura de la tabla Boss:\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $conn->query("DESCRIBE Boss");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']} ({$row['Null']}, {$row['Key']})\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
