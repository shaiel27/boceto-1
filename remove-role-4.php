<?php
// Script to remove the incorrectly added role ID 4
$host = 'localhost';
$port = '3306';
$db_name = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Delete role ID 4
    $sql = "DELETE FROM Role WHERE ID_Role = 4";
    $conn->exec($sql);
    echo "Successfully removed role ID 4 from the database.\n";
    
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
