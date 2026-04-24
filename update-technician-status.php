<?php
// Script para actualizar el status de técnicos a 'Disponible'

$host = 'localhost';
$port = '3306';
$dbname = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Actualización de Status de Técnicos</h1>";
    
    // 1. Verificar status actual de técnicos
    echo "<h2>1. Status Actual de Técnicos</h2>";
    $stmt = $pdo->query("
        SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
               u.Email
        FROM technicians t
        LEFT JOIN users u ON t.Fk_Users = u.ID_Users
        ORDER BY t.ID_Technicians
    ");
    $techs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Email</th><th>Nombre</th><th>Status Actual</th></tr>";
    foreach ($techs as $tech) {
        echo "<tr>";
        echo "<td>{$tech['ID_Technicians']}</td>";
        echo "<td>{$tech['Email']}</td>";
        echo "<td>{$tech['First_Name']} {$tech['Last_Name']}</td>";
        echo "<td>{$tech['Status']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // 2. Actualizar todos los técnicos con status 'Activo' a 'Disponible'
    echo "<h2>2. Actualizando Status 'Activo' a 'Disponible'</h2>";
    $stmt = $pdo->prepare("
        UPDATE technicians 
        SET Status = 'Disponible'
        WHERE Status = 'Activo'
    ");
    $stmt->execute();
    $affected = $stmt->rowCount();
    
    echo "<p style='color: green;'>✅ Actualizados $affected técnicos de 'Activo' a 'Disponible'</p>";
    
    // 3. Verificación final
    echo "<h2>3. Status Final</h2>";
    $stmt = $pdo->query("
        SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
               u.Email
        FROM technicians t
        LEFT JOIN users u ON t.Fk_Users = u.ID_Users
        ORDER BY t.ID_Technicians
    ");
    $techs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Email</th><th>Nombre</th><th>Status Final</th></tr>";
    foreach ($techs as $tech) {
        $statusColor = $tech['Status'] == 'Disponible' ? 'green' : 'red';
        echo "<tr>";
        echo "<td>{$tech['ID_Technicians']}</td>";
        echo "<td>{$tech['Email']}</td>";
        echo "<td>{$tech['First_Name']} {$tech['Last_Name']}</td>";
        echo "<td style='color: $statusColor; font-weight: bold;'>{$tech['Status']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error de conexión a la base de datos</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
