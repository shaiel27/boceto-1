<?php
require_once 'src/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "=== Checking Admin User ===\n";
    
    // Check if admin user exists
    $stmt = $conn->prepare("SELECT ID_Users, Email, Password, Full_Name, Role FROM Users u JOIN Role r ON u.Fk_Role = r.ID_Role WHERE u.Email = 'admin@alcaldia.gob'");
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "✅ User found:\n";
        echo "- ID: " . $user['ID_Users'] . "\n";
        echo "- Email: " . $user['Email'] . "\n";
        echo "- Name: " . $user['Full_Name'] . "\n";
        echo "- Role: " . $user['Role'] . "\n";
        echo "- Hashed Password: " . substr($user['Password'], 0, 20) . "...\n";
        
        // Test password verification
        echo "\n=== Testing Password ===\n";
        if (password_verify('password123', $user['Password'])) {
            echo "✅ Password 'password123' matches!\n";
        } else {
            echo "❌ Password 'password123' does NOT match\n";
            echo "Trying plain text comparison...\n";
            if ($user['Password'] === 'password123') {
                echo "✅ Plain text password matches!\n";
            } else {
                echo "❌ Plain text password does NOT match\n";
            }
        }
    } else {
        echo "❌ Admin user not found\n";
        
        // Show all users
        echo "\n=== All Users ===\n";
        $stmt = $conn->prepare("SELECT ID_Users, Email, Full_Name, Role FROM Users u JOIN Role r ON u.Fk_Role = r.ID_Role");
        $stmt->execute();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "- ID: " . $row['ID_Users'] . " | Email: " . $row['Email'] . " | Name: " . $row['Full_Name'] . " | Role: " . $row['Role'] . "\n";
        }
    }
    
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
