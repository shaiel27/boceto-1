<?php
// Script para validar las relaciones entre Users, Boss y Office
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VALIDACIÓN DE RELACIONES USERS - BOSS - OFFICE ===\n\n";
    
    // 1. Verificar estructura de la tabla Users
    echo "1. ESTRUCTURA DE LA TABLA USERS:\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $conn->query("DESCRIBE Users");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']} ({$row['Null']}, {$row['Key']})\n";
    }
    
    // 2. Verificar estructura de la tabla Boss
    echo "\n2. ESTRUCTURA DE LA TABLA BOSS:\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $conn->query("DESCRIBE Boss");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']} ({$row['Null']}, {$row['Key']})\n";
    }
    
    // 3. Verificar estructura de la tabla Office
    echo "\n3. ESTRUCTURA DE LA TABLA OFFICE:\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $conn->query("DESCRIBE Office");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']} ({$row['Null']}, {$row['Key']})\n";
    }
    
    // 4. Verificar usuarios existentes
    echo "\n4. USUARIOS EXISTENTES:\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $conn->query("SELECT ID_Users, Full_Name, Email, Fk_Role FROM Users LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- ID: {$row['ID_Users']}, Nombre: {$row['Full_Name']}, Email: {$row['Email']}, Rol: {$row['Fk_Role']}\n";
    }
    
    // 5. Verificar registros Boss existentes
    echo "\n5. REGISTROS BOSS EXISTENTES:\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $conn->query("SELECT ID_Boss, Name_Boss, Pronoun, Fk_User FROM Boss LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- ID: {$row['ID_Boss']}, Nombre: {$row['Name_Boss']}, Pronoun: {$row['Pronoun']}, Fk_User: {$row['Fk_User']}\n";
    }
    
    // 6. Verificar oficinas existentes
    echo "\n6. OFICINAS EXISTENTES:\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $conn->query("SELECT ID_Office, Name_Office, Office_Type, Fk_Boss_ID FROM Office LIMIT 5");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- ID: {$row['ID_Office']}, Nombre: {$row['Name_Office']}, Tipo: {$row['Office_Type']}, Fk_Boss_ID: {$row['Fk_Boss_ID']}\n";
    }
    
    // 7. Verificar relación Users-Boss
    echo "\n7. RELACIÓN USERS - BOSS:\n";
    echo str_repeat("-", 50) . "\n";
    $query = "SELECT u.ID_Users, u.Full_Name, b.ID_Boss, b.Name_Boss 
              FROM Users u 
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User 
              LIMIT 5";
    $stmt = $conn->query($query);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- Usuario ID: {$row['ID_Users']}, Nombre: {$row['Full_Name']}, Boss ID: {$row['ID_Boss']}, Boss Nombre: {$row['Name_Boss']}\n";
    }
    
    // 8. Verificar relación Boss-Office
    echo "\n8. RELACIÓN BOSS - OFFICE:\n";
    echo str_repeat("-", 50) . "\n";
    $query = "SELECT b.ID_Boss, b.Name_Boss, o.ID_Office, o.Name_Office 
              FROM Boss b 
              LEFT JOIN Office o ON o.Fk_Boss_ID = b.ID_Boss 
              LIMIT 5";
    $stmt = $conn->query($query);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- Boss ID: {$row['ID_Boss']}, Boss Nombre: {$row['Name_Boss']}, Office ID: {$row['ID_Office']}, Office Nombre: {$row['Name_Office']}\n";
    }
    
    // 9. Probar la consulta actual del método getById
    echo "\n9. PRUEBA DE CONSULTA GETBYID (JOIN CORREGIDO):\n";
    echo str_repeat("-", 50) . "\n";
    $query = "SELECT u.ID_Users, u.Full_Name, u.Email, u.created_at,
                     o.Name_Office as office_name,
                     o.Office_Type as office_type,
                     r.Role as role_name
              FROM Users u
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              LEFT JOIN Office o ON o.Fk_Boss_ID = b.ID_Boss
              LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
              WHERE u.ID_Users = 1";
    $stmt = $conn->query($query);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "Resultado para usuario ID 1:\n";
        echo "- ID: {$result['ID_Users']}\n";
        echo "- Nombre: {$result['Full_Name']}\n";
        echo "- Email: {$result['Email']}\n";
        echo "- Office Name: {$result['office_name']}\n";
        echo "- Office Type: {$result['office_type']}\n";
        echo "- Role: {$result['role_name']}\n";
    } else {
        echo "No se encontró resultado para usuario ID 1\n";
    }
    
    // 10. Verificar usuarios con rol Jefe (3)
    echo "\n10. USUARIOS CON ROL JEFE (3):\n";
    echo str_repeat("-", 50) . "\n";
    $query = "SELECT u.ID_Users, u.Full_Name, u.Email, b.ID_Boss, b.Name_Boss, o.Name_Office, o.Office_Type
              FROM Users u
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              LEFT JOIN Office o ON o.Fk_Boss_ID = b.ID_Boss
              WHERE u.Fk_Role = 3";
    $stmt = $conn->query($query);
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $count++;
        echo "- Usuario ID: {$row['ID_Users']}, Nombre: {$row['Full_Name']}\n";
        echo "  Boss ID: {$row['ID_Boss']}, Boss Nombre: {$row['Name_Boss']}\n";
        echo "  Office: {$row['Name_Office']} ({$row['Office_Type']})\n";
        echo "  " . str_repeat("-", 40) . "\n";
    }
    if ($count == 0) {
        echo "No hay usuarios con rol Jefe (3)\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
