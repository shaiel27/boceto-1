<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo "❌ Error de conexión a la base de datos\n";
        exit(1);
    }

    echo "=== Roles en la Base de Datos ===\n\n";

    $query = "SELECT ID_Role, Role, Description FROM Role ORDER BY ID_Role";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($roles as $role) {
        echo "ID: {$role['ID_Role']}\n";
        echo "  Role: {$role['Role']}\n";
        echo "  Description: {$role['Description']}\n\n";
    }

    echo "=== Usuarios y sus Roles ===\n\n";

    $query = "SELECT u.ID_Users, u.Email, u.Full_Name, r.Role, r.ID_Role
              FROM Users u
              JOIN Role r ON u.Fk_Role = r.ID_Role
              ORDER BY u.ID_Users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($users as $user) {
        echo "Usuario: {$user['Full_Name']} ({$user['Email']})\n";
        echo "  Role ID: {$user['ID_Role']}\n";
        echo "  Role: {$user['Role']}\n\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
