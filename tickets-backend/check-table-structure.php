<?php
// Verificar estructura de tablas de servicios
require_once 'src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== Estructura de TI_Service ===\n";
$stmt = $db->query("DESCRIBE TI_Service");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $column) {
    echo "- {$column['Field']} ({$column['Type']})\n";
}

echo "\n=== Estructura de Service_Problems_Catalog ===\n";
$stmt = $db->query("DESCRIBE Service_Problems_Catalog");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $column) {
    echo "- {$column['Field']} ({$column['Type']})\n";
}

echo "\n=== Estructura de Software_Systems ===\n";
$stmt = $db->query("DESCRIBE Software_Systems");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $column) {
    echo "- {$column['Field']} ({$column['Type']})\n";
}
?>
