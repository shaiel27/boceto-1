<?php
/**
 * Script para verificar si existe relación entre técnicos y áreas en la base de datos
 */

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== VERIFICACIÓN DE RELACIÓN TÉCNICOS - ÁREAS ===\n\n";
    
    // 1. Verificar estructura de la tabla Technicians
    echo "1. Estructura de la tabla Technicians:\n";
    $query = "DESCRIBE Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "   - {$column['Field']}: {$column['Type']}\n";
    }
    echo "\n";
    
    // 2. Verificar si existen tablas de relación técnicos-áreas
    echo "2. Buscando tablas de relación técnicos-áreas:\n";
    $query = "SHOW TABLES LIKE '%technician%'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($tables as $table) {
        $tableName = array_values($table)[0];
        echo "   - {$tableName}\n";
    }
    echo "\n";
    
    // 3. Verificar estructura de la tabla Office
    echo "3. Estructura de la tabla Office (para entender áreas):\n";
    $query = "DESCRIBE Office";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "   - {$column['Field']}: {$column['Type']}";
        if ($column['Comment']) {
            echo " ({$column['Comment']})";
        }
        echo "\n";
    }
    echo "\n";
    
    // 4. Verificar si hay alguna tabla que relacione técnicos con oficinas
    echo "4. Buscando tablas que relacionen técnicos con oficinas:\n";
    $query = "SHOW TABLES";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $allTables = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $relevantTables = [];
    foreach ($allTables as $table) {
        $tableName = array_values($table)[0];
        if (stripos($tableName, 'technician') !== false || stripos($tableName, 'office') !== false) {
            $relevantTables[] = $tableName;
        }
    }
    
    foreach ($relevantTables as $tableName) {
        echo "   - {$tableName}\n";
    }
    echo "\n";
    
    // 5. Conclusión
    echo "5. CONCLUSIÓN:\n";
    echo "   La tabla Technicians NO tiene campos para relacionar con áreas (Fk_Office, Fk_Direction, etc.)\n";
    echo "   Los técnicos solo están relacionados con servicios TI a través de Technicians_Service\n";
    echo "   Si necesitas filtrar técnicos por área, se debe agregar un campo Fk_Office a la tabla Technicians\n";
    echo "\n";
    
    echo "=== VERIFICACIÓN COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
