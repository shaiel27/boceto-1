<?php
require_once 'src/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "=== Fixing Admin Password ===\n";
    
    // Hash the password
    $hashedPassword = password_hash('password123', PASSWORD_DEFAULT);
    
    // Update the admin user password
    $stmt = $conn->prepare("UPDATE Users SET Password = ? WHERE Email = 'admin@alcaldia.gob'");
    $stmt->execute([$hashedPassword]);
    
    echo "✅ Admin password updated with hash\n";
    
    // Verify the update
    $stmt = $conn->prepare("SELECT Password FROM Users WHERE Email = 'admin@alcaldia.gob'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (password_verify('password123', $user['Password'])) {
        echo "✅ Password verification successful!\n";
    } else {
        echo "❌ Password verification failed\n";
    }
    
    // Update all other users to have the same hashed password
    $stmt = $conn->prepare("UPDATE Users SET Password = ? WHERE Email != 'admin@alcaldia.gob'");
    $stmt->execute([$hashedPassword]);
    
    echo "✅ All other users password updated\n";
    
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
