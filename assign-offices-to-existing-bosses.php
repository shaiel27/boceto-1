<?php
// Script para asignar oficinas a los Boss existentes
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Asignando oficinas a los Boss existentes...\n\n";
    
    // Obtener los Boss existentes sin oficina asignada
    $query = "SELECT b.ID_Boss, b.Name_Boss, u.ID_Users, u.Full_Name
              FROM Boss b
              JOIN Users u ON b.Fk_User = u.ID_Users
              WHERE b.Fk_Office IS NULL";
    $stmt = $conn->query($query);
    $bosses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Bosses sin oficina asignada:\n";
    echo str_repeat("-", 50) . "\n";
    
    foreach ($bosses as $boss) {
        echo "- Boss ID: {$boss['ID_Boss']}, Nombre: {$boss['Name_Boss']}, Usuario: {$boss['Full_Name']}\n";
    }
    
    echo "\nAsignando oficinas...\n";
    
    // Asignar oficinas a los Boss existentes
    $assignments = [
        1 => 1,  // Juan Pérez -> DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA
        2 => 6,  // María González -> DIRECCIÓN DE TALENTO HUMANO
        3 => 12, // Shai -> DIRECCIÓN DE EDUCACIÓN
    ];
    
    foreach ($assignments as $bossId => $officeId) {
        $query = "UPDATE Boss SET Fk_Office = :office_id WHERE ID_Boss = :boss_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":office_id", $officeId);
        $stmt->bindParam(":boss_id", $bossId);
        $stmt->execute();
        
        // Obtener nombres para mostrar
        $stmt = $conn->query("SELECT Name_Boss FROM Boss WHERE ID_Boss = $bossId");
        $bossName = $stmt->fetchColumn();
        $stmt = $conn->query("SELECT Name_Office FROM Office WHERE ID_Office = $officeId");
        $officeName = $stmt->fetchColumn();
        
        echo "✓ Boss '$bossName' asignado a oficina '$officeName'\n";
    }
    
    echo "\nVerificando asignaciones:\n";
    echo str_repeat("-", 50) . "\n";
    
    $query = "SELECT u.ID_Users, u.Full_Name, u.Email, 
                     o.Name_Office as office_name,
                     o.Office_Type as office_type
              FROM Users u
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              LEFT JOIN Office o ON b.Fk_Office = o.ID_Office
              WHERE u.Fk_Role = 3";
    $stmt = $conn->query($query);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- Usuario: {$row['Full_Name']}\n";
        echo "  Email: {$row['Email']}\n";
        echo "  Oficina: {$row['office_name']} ({$row['office_type']})\n";
        echo "  " . str_repeat("-", 40) . "\n";
    }
    
    echo "\nProbando la consulta getById:\n";
    echo str_repeat("-", 50) . "\n";
    
    $query = "SELECT u.ID_Users, u.Full_Name, u.Email, u.created_at,
                     o.Name_Office as office_name,
                     o.Office_Type as office_type,
                     r.Role as role_name
              FROM Users u
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              LEFT JOIN Office o ON b.Fk_Office = o.ID_Office
              LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
              WHERE u.ID_Users = 4";
    $stmt = $conn->query($query);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo "Resultado para usuario ID 4 (Juan Pérez):\n";
        echo "- ID: {$result['ID_Users']}\n";
        echo "- Nombre: {$result['Full_Name']}\n";
        echo "- Email: {$result['Email']}\n";
        echo "- Office Name: {$result['office_name']}\n";
        echo "- Office Type: {$result['office_type']}\n";
        echo "- Role: {$result['role_name']}\n";
    } else {
        echo "No se encontró resultado para usuario ID 4\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
