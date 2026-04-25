<?php
require_once 'src/config/database.php';

echo "=== Debug Login Process ===\n";

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Test the exact same query as User::login()
    $email = 'admin@alcaldia.gob';
    $password = 'password123';
    
    echo "Testing with email: $email\n";
    echo "Testing with password: $password\n\n";
    
    $query = "SELECT u.ID_Users, u.Username, u.Email, u.Full_Name, u.Password, r.Role, r.ID_Role,
                     b.Fk_Office as office_id
              FROM Users u
              JOIN Role r ON u.Fk_Role = r.ID_Role
              LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
              WHERE u.Email = :email LIMIT 1";

    echo "Query: $query\n\n";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    echo "Rows found: " . $stmt->rowCount() . "\n\n";
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "User data:\n";
        echo "- ID: " . $row['ID_Users'] . "\n";
        echo "- Email: " . $row['Email'] . "\n";
        echo "- Name: " . $row['Full_Name'] . "\n";
        echo "- Role: " . $row['Role'] . "\n";
        echo "- Password hash: " . $row['Password'] . "\n\n";
        
        echo "Testing password verification:\n";
        if (password_verify($password, $row['Password'])) {
            echo "✅ Password verification SUCCESS!\n";
            echo "User should be able to login\n";
        } else {
            echo "❌ Password verification FAILED\n";
            echo "This is why login returns false\n";
        }
    } else {
        echo "❌ No user found with email: $email\n";
    }
    
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Testing User Class Directly ===\n";

try {
    require_once 'src/models/User.php';
    $user = new User($conn);
    $result = $user->login($email, $password);
    
    if ($result) {
        echo "✅ User::login() returned SUCCESS\n";
        print_r($result);
    } else {
        echo "❌ User::login() returned FALSE\n";
    }
} catch(Exception $e) {
    echo "❌ Error in User::login(): " . $e->getMessage() . "\n";
}
?>
