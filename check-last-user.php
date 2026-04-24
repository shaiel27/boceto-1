<?php
// Script para verificar el último usuario creado y su oficina
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VERIFICACIÓN DEL ÚLTIMO USUARIO CREADO ===\n\n";
    
    // Obtener el último usuario creado
    $query = "SELECT * FROM Users ORDER BY ID_Users DESC LIMIT 1";
    $stmt = $conn->query($query);
    $lastUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($lastUser) {
        echo "ÚLTIMO USUARIO CREADO:\n";
        echo str_repeat("-", 50) . "\n";
        echo "- ID: {$lastUser['ID_Users']}\n";
        echo "- Nombre: {$lastUser['Full_Name']}\n";
        echo "- Email: {$lastUser['Email']}\n";
        echo "- Username: {$lastUser['Username']}\n";
        echo "- Rol: {$lastUser['Fk_Role']}\n";
        echo "- Creado: {$lastUser['created_at']}\n";
        
        // Verificar si tiene Boss asociado
        $query = "SELECT * FROM Boss WHERE Fk_User = {$lastUser['ID_Users']}";
        $stmt = $conn->query($query);
        $boss = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "\nBOSS ASOCIADO:\n";
        echo str_repeat("-", 50) . "\n";
        if ($boss) {
            echo "- Boss ID: {$boss['ID_Boss']}\n";
            echo "- Nombre: {$boss['Name_Boss']}\n";
            echo "- Pronoun: {$boss['Pronoun']}\n";
            echo "- Fk_Office: {$boss['Fk_Office']}\n";
            
            // Verificar la oficina asignada
            if ($boss['Fk_Office']) {
                $query = "SELECT * FROM Office WHERE ID_Office = {$boss['Fk_Office']}";
                $stmt = $conn->query($query);
                $office = $stmt->fetch(PDO::FETCH_ASSOC);
                
                echo "\nOFICINA ASIGNADA:\n";
                echo str_repeat("-", 50) . "\n";
                echo "- Office ID: {$office['ID_Office']}\n";
                echo "- Nombre: {$office['Name_Office']}\n";
                echo "- Tipo: {$office['Office_Type']}\n";
            } else {
                echo "\nOFICINA ASIGNADA:\n";
                echo str_repeat("-", 50) . "\n";
                echo "- NO TIENE OFICINA ASIGNADA (Fk_Office es NULL)\n";
            }
        } else {
            echo "- NO TIENE BOSS ASOCIADO\n";
        }
        
        // Probar la consulta getById
        echo "\nPRUEBA DE CONSULTA GETBYID:\n";
        echo str_repeat("-", 50) . "\n";
        $query = "SELECT u.ID_Users, u.Full_Name, u.Email, u.created_at,
                         o.Name_Office as office_name,
                         o.Office_Type as office_type,
                         r.Role as role_name
                  FROM Users u
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.Fk_Office = o.ID_Office
                  LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE u.ID_Users = {$lastUser['ID_Users']}";
        $stmt = $conn->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            echo "Resultado para usuario ID {$lastUser['ID_Users']}:\n";
            echo "- ID: {$result['ID_Users']}\n";
            echo "- Nombre: {$result['Full_Name']}\n";
            echo "- Email: {$result['Email']}\n";
            echo "- Office Name: " . ($result['office_name'] ?? 'NULL') . "\n";
            echo "- Office Type: " . ($result['office_type'] ?? 'NULL') . "\n";
            echo "- Role: {$result['role_name']}\n";
        } else {
            echo "No se encontró resultado para usuario ID {$lastUser['ID_Users']}\n";
        }
    } else {
        echo "No hay usuarios en la base de datos\n";
    }
    
    // Mostrar todos los usuarios con sus oficinas
    echo "\n=== TODOS LOS USUARIOS CON SUS OFICINAS ===\n\n";
    $query = "SELECT u.ID_Users, u.Full_Name, u.Email, u.Fk_Role,
                     b.ID_Boss, b.Fk_Office,
                     o.Name_Office, o.Office_Type
              FROM Users u
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              LEFT JOIN Office o ON b.Fk_Office = o.ID_Office
              ORDER BY u.ID_Users DESC LIMIT 10";
    $stmt = $conn->query($query);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "Usuario: {$row['Full_Name']} (ID: {$row['ID_Users']}, Rol: {$row['Fk_Role']})\n";
        echo "  Boss ID: " . ($row['ID_Boss'] ?? 'NULL') . "\n";
        echo "  Fk_Office: " . ($row['Fk_Office'] ?? 'NULL') . "\n";
        echo "  Oficina: " . ($row['Name_Office'] ?? 'SIN OFICINA') . " (" . ($row['Office_Type'] ?? 'N/A') . ")\n";
        echo "  " . str_repeat("-", 40) . "\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
