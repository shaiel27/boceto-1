<?php
require_once 'src/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "=== Database Structure ===\n\n";
    
    // Check Users table
    echo "Users table structure:\n";
    $stmt = $conn->prepare("DESCRIBE Users");
    $stmt->execute();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
    echo "\nBoss table structure:\n";
    $stmt = $conn->prepare("DESCRIBE Boss");
    $stmt->execute();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
    echo "\nOffice table structure:\n";
    $stmt = $conn->prepare("DESCRIBE Office");
    $stmt->execute();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
    echo "\nSample data:\n";
    echo "Users:\n";
    $stmt = $conn->prepare("SELECT ID_Users, Email, Full_Name FROM Users LIMIT 3");
    $stmt->execute();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- ID: " . $row['ID_Users'] . " | Email: " . $row['Email'] . " | Name: " . $row['Full_Name'] . "\n";
    }
    
    echo "\nBoss:\n";
    $stmt = $conn->prepare("SELECT * FROM Boss LIMIT 3");
    $stmt->execute();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . json_encode($row) . "\n";
    }
    
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
