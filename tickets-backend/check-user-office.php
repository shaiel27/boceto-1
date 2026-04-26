<?php
// Verificar si los usuarios tienen oficinas asignadas
require_once 'src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== Verificación de Oficinas por Usuario ===\n\n";

// Verificar usuarios de rol 3 (Jefes)
$stmt = $db->query("SELECT u.ID_Users, u.Email, u.Full_Name, u.Fk_Role,
                         b.ID_Boss, b.Fk_User,
                         o.ID_Office, o.Name_Office, o.Fk_Boss_ID
                  FROM Users u
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
                  WHERE u.Fk_Role = 3");

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Usuarios de Rol 3 (Jefes):\n";
foreach ($users as $user) {
    echo "\nUsuario: {$user['Full_Name']} (ID: {$user['ID_Users']})\n";
    echo "Email: {$user['Email']}\n";
    echo "Boss ID: " . ($user['ID_Boss'] ?? 'NULL') . "\n";
    echo "Office ID: " . ($user['ID_Office'] ?? 'NULL') . "\n";
    echo "Office Name: " . ($user['Name_Office'] ?? 'NULL') . "\n";
    echo "Office Fk_Boss_ID: " . ($user['Fk_Boss_ID'] ?? 'NULL') . "\n";
    
    if ($user['ID_Office']) {
        echo "✅ Tiene oficina asignada\n";
    } else {
        echo "❌ NO tiene oficina asignada - Esto causará el problema de autocompletado\n";
    }
}

echo "\n=== Oficinas Disponibles ===\n";
$stmt = $db->query("SELECT ID_Office, Name_Office, Fk_Boss_ID FROM Office");
$offices = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($offices as $office) {
    echo "ID: {$office['ID_Office']}, Nombre: {$office['Name_Office']}, Fk_Boss_ID: " . ($office['Fk_Boss_ID'] ?? 'NULL') . "\n";
}
?>
