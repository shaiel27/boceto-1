<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== DIAGNÓSTICO DE USUARIOS ROL 3 (SOLICITANTE/JEFE) ===\n\n";

    // Verificar usuarios con rol 3
    $query = "SELECT u.ID_Users, u.Email, u.Full_Name, r.Role, r.ID_Role,
                     b.ID_Boss, b.Name_Boss, b.Pronoun,
                     o.ID_Office, o.Name_Office, o.Office_Type
              FROM Users u
              JOIN Role r ON u.Fk_Role = r.ID_Role
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
              WHERE r.ID_Role = 3
              ORDER BY u.ID_Users";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Total de usuarios con rol 3: " . count($users) . "\n\n";

    foreach ($users as $user) {
        echo "Usuario ID: {$user['ID_Users']}\n";
        echo "Email: {$user['Email']}\n";
        echo "Nombre: {$user['Full_Name']}\n";
        echo "Rol: {$user['Role']} (ID: {$user['ID_Role']})\n";
        echo "Boss ID: " . ($user['ID_Boss'] ?? 'NULL') . "\n";
        echo "Boss Name: " . ($user['Name_Boss'] ?? 'NULL') . "\n";
        echo "Office ID: " . ($user['ID_Office'] ?? 'NULL') . "\n";
        echo "Office Name: " . ($user['Name_Office'] ?? 'NULL') . "\n";
        echo "Office Type: " . ($user['Office_Type'] ?? 'NULL') . "\n";
        echo "---\n";
    }

    // Verificar si hay oficinas sin jefe asignado
    echo "\n=== OFICINAS SIN JEFE ASIGNADO ===\n";
    $query = "SELECT ID_Office, Name_Office, Office_Type, Fk_Boss_ID
              FROM Office
              WHERE Fk_Boss_ID IS NULL
              ORDER BY Name_Office";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $offices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Total de oficinas sin jefe: " . count($offices) . "\n\n";
    foreach ($offices as $office) {
        echo "Office ID: {$office['ID_Office']}\n";
        echo "Name: {$office['Name_Office']}\n";
        echo "Type: {$office['Office_Type']}\n";
        echo "---\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
