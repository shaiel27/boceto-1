<?php
// Verificar datos de servicios y problemas
require_once 'src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== Verificación de Datos de Servicios ===\n\n";

// Verificar TI Services
echo "TI Services:\n";
$stmt = $db->query("SELECT ID_TI_Service, Type_Service, Details FROM TI_Service");
$services = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($services as $service) {
    echo "ID: {$service['ID_TI_Service']}, Tipo: {$service['Type_Service']}\n";
}

echo "\n=== Service_Problems_Catalog ===\n";
$stmt = $db->query("SELECT ID_Problem_Catalog, Fk_TI_Service, Problem_Name 
                  FROM Service_Problems_Catalog 
                  LIMIT 10");
$problems = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (count($problems) > 0) {
    foreach ($problems as $problem) {
        echo "ID: {$problem['ID_Problem_Catalog']}, Service ID: {$problem['Fk_TI_Service']}, Nombre: {$problem['Problem_Name']}\n";
    }
} else {
    echo "❌ No hay problemas en el catálogo\n";
}

echo "\n=== Software_Systems ===\n";
$stmt = $db->query("SELECT ID_System, System_Name, Description 
                  FROM Software_Systems 
                  LIMIT 10");
$systems = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (count($systems) > 0) {
    foreach ($systems as $system) {
        echo "ID: {$system['ID_System']}, Nombre: {$system['System_Name']}\n";
    }
} else {
    echo "❌ No hay sistemas de software\n";
}

echo "\n=== Conteo total ===\n";
$stmt = $db->query("SELECT COUNT(*) as count FROM Service_Problems_Catalog");
$count = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Total problemas: {$count['count']}\n";

$stmt = $db->query("SELECT COUNT(*) as count FROM Software_Systems");
$count = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Total sistemas: {$count['count']}\n";
?>
