<?php
// Asignar oficinas a jefes que no tienen
require_once 'src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== Asignando Oficinas a Jefes ===\n\n";

try {
    $db->beginTransaction();

    // Asignar oficina ID 1 (DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA) a jefe1 (ID 4)
    $query = "UPDATE Office SET Fk_Boss_ID = 1 WHERE ID_Office = 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo "✅ Oficina ID 1 asignada a Boss ID 1 (jefe1)\n";

    // Asignar oficina ID 6 (DIRECCIÓN DE TALENTO HUMANO) a jefe2 (ID 5)
    $query = "UPDATE Office SET Fk_Boss_ID = 2 WHERE ID_Office = 6";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo "✅ Oficina ID 6 asignada a Boss ID 2 (jefe2)\n";

    $db->commit();
    echo "\n✅ Asignaciones completadas exitosamente\n";

} catch (Exception $e) {
    $db->rollBack();
    echo "❌ Error: " . $e->getMessage() . "\n";
}

// Verificar las asignaciones
echo "\n=== Verificación de Asignaciones ===\n";
$stmt = $db->query("SELECT u.ID_Users, u.Email, u.Full_Name,
                         b.ID_Boss, o.ID_Office, o.Name_Office
                  FROM Users u
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
                  WHERE u.Fk_Role = 3");

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($users as $user) {
    echo "\nUsuario: {$user['Full_Name']} ({$user['Email']})\n";
    echo "Boss ID: {$user['ID_Boss']}\n";
    echo "Office ID: {$user['ID_Office']}\n";
    echo "Office Name: {$user['Name_Office']}\n";
}
?>
