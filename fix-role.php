<?php
// Script to fix the missing role ID 4 in the database
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if role ID 4 already exists
    $check = $conn->prepare("SELECT COUNT(*) FROM Role WHERE ID_Role = 4");
    $check->execute();
    $count = $check->fetchColumn();
    
    if ($count > 0) {
        echo "Role ID 4 already exists in the database.\n";
    } else {
        // Insert the Solicitante role with ID 4
        $sql = "INSERT INTO Role (ID_Role, Role, Description) VALUES (4, 'Solicitante', 'Usuario que puede crear y solicitar tickets de soporte técnico')";
        $conn->exec($sql);
        echo "Successfully added role ID 4 (Solicitante) to the database.\n";
    }
    
    // Display all roles for verification
    echo "\nCurrent roles in database:\n";
    $stmt = $conn->query("SELECT ID_Role, Role, Description FROM Role");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['ID_Role']}, Role: {$row['Role']}, Description: {$row['Description']}\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
