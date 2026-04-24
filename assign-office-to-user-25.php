<?php
// Script para asignar una oficina al usuario 25
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Asignando oficina al usuario 25 (Lic. Carlos)...\n";
    
    // Asignar la oficina DIVISIÓN DE COMPRAS (ID: 95) al Boss ID 4
    $query = "UPDATE Boss SET Fk_Office = 95 WHERE ID_Boss = 4";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    echo "Oficina asignada exitosamente.\n";
    
    // Verificar la asignación
    $query = "SELECT u.ID_Users, u.Full_Name, u.Email, 
                     o.Name_Office as office_name,
                     o.Office_Type as office_type
              FROM Users u
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              LEFT JOIN Office o ON b.Fk_Office = o.ID_Office
              WHERE u.ID_Users = 25";
    $stmt = $conn->query($query);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo "\nResultado:\n";
        echo "- Usuario: {$result['Full_Name']}\n";
        echo "- Email: {$result['Email']}\n";
        echo "- Oficina: {$result['office_name']} ({$result['office_type']})\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
