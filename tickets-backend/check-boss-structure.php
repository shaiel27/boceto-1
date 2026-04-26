<?php
// Verificar estructura de la tabla Boss
require_once 'src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== Estructura de la tabla Boss ===\n";
$stmt = $db->query("DESCRIBE Boss");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $column) {
    echo "- {$column['Field']} ({$column['Type']})\n";
}

echo "\n=== Estructura de la tabla Office ===\n";
$stmt = $db->query("DESCRIBE Office");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($columns as $column) {
    echo "- {$column['Field']} ({$column['Type']})\n";
}

echo "\n=== Datos en Boss ===\n";
$stmt = $db->query("SELECT * FROM Boss LIMIT 3");
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($data);
?>
