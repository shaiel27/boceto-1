<?php
// Test de login directo sin frontend
echo "=== Test de Login ===\n\n";

require_once 'src/config/database.php';
require_once 'src/models/User.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo "❌ Error: No se pudo conectar a la base de datos\n";
    exit;
}

$user = new User($db);

// Test con usuario de rol 3
$email = 'jefe1@alcaldia.gob';
$password = 'password123';

echo "Intentando login con:\n";
echo "Email: $email\n";
echo "Password: $password\n\n";

$result = $user->login($email, $password);

if ($result) {
    echo "✅ Login exitoso!\n";
    echo "Datos del usuario:\n";
    print_r($result);
} else {
    echo "❌ Login fallido\n";
    echo "Posibles causas:\n";
    echo "1. Usuario no existe\n";
    echo "2. Contraseña incorrecta\n";
    echo "3. Contraseña no está hasheada en la base de datos\n";
    
    // Verificar si el usuario existe
    $stmt = $db->prepare("SELECT ID_Users, Email, Password FROM Users WHERE Email = :email");
    $stmt->execute(['email' => $email]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userData) {
        echo "\n✅ Usuario encontrado en base de datos:\n";
        echo "ID: {$userData['ID_Users']}\n";
        echo "Email: {$userData['Email']}\n";
        echo "Password hash: " . substr($userData['Password'], 0, 20) . "...\n";
        
        // Verificar si la contraseña está hasheada
        if (password_verify($password, $userData['Password'])) {
            echo "✅ Contraseña válida (hash correcto)\n";
        } else {
            echo "❌ Contraseña inválida (hash incorrecto)\n";
            echo "La contraseña en la base de datos probablemente está en texto plano\n";
        }
    } else {
        echo "\n❌ Usuario NO encontrado en base de datos\n";
    }
}
?>
