<?php
require_once 'src/config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "=== Generando hash correcto para 'password123' ===\n";
    $correctHash = password_hash('password123', PASSWORD_DEFAULT);
    echo "Hash generado: " . $correctHash . "\n\n";
    
    echo "=== Verificando hash del archivo SQL ===\n";
    $fileHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    if (password_verify('password123', $fileHash)) {
        echo "✅ El hash del archivo SQL es CORRECTO para 'password123'\n";
    } else {
        echo "❌ El hash del archivo SQL es INCORRECTO para 'password123'\n";
    }
    echo "\n";
    
    echo "=== Verificando usuarios en la base de datos ===\n";
    $stmt = $conn->prepare("SELECT ID_Users, Email, Password, Full_Name, Role FROM Users u JOIN Role r ON u.Fk_Role = r.ID_Role");
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Total usuarios: " . count($users) . "\n\n";
    
    foreach ($users as $user) {
        echo "Usuario: " . $user['Email'] . " (" . $user['Role'] . ")\n";
        echo "Hash actual: " . substr($user['Password'], 0, 30) . "...\n";
        
        // Verificar con password123
        if (password_verify('password123', $user['Password'])) {
            echo "✅ Password123 coincide con hash actual\n";
        } else {
            echo "❌ Password123 NO coincide con hash actual\n";
        }
        
        // Verificar si es texto plano
        if ($user['Password'] === 'password123') {
            echo "⚠️  La contraseña está en TEXTO PLANO\n";
        }
        
        echo "\n";
    }
    
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
