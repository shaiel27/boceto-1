<?php
// Test simple de conexión a base de datos
echo "=== Test de Conexión a Base de Datos ===\n\n";

try {
    $pdo = new PDO('mysql:host=localhost;port=3306;dbname=tickets_system', 'root', 'NuevaClave123');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión exitosa a la base de datos\n";
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM Users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Total de usuarios: " . $result['count'] . "\n";
    
    // Test usuarios de rol 3
    $stmt = $pdo->query("SELECT u.ID_Users, u.Email, u.Full_Name, r.Role 
                        FROM Users u 
                        JOIN Role r ON u.Fk_Role = r.ID_Role 
                        WHERE u.Fk_Role = 3 LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "✅ Usuarios de rol 3:\n";
    foreach ($users as $user) {
        echo "   - ID: {$user['ID_Users']}, Email: {$user['Email']}, Nombre: {$user['Full_Name']}, Rol: {$user['Role']}\n";
    }
    
} catch(PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
    echo "\nPosibles soluciones:\n";
    echo "1. Verificar que MySQL/XAMPP esté corriendo\n";
    echo "2. Verificar que la base de datos 'tickets_system' exista\n";
    echo "3. Verificar que el usuario 'root' tenga la contraseña correcta\n";
    echo "4. Verificar que el puerto 3306 esté disponible\n";
}
?>
