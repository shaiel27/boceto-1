<?php
// Script para activar técnicos inactivos

$host = 'localhost';
$port = '3306';
$dbname = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Activación de Técnicos Inactivos</h1>";
    
    // 1. Verificar técnicos inactivos
    echo "<h2>1. Técnicos con Status Inactivo</h2>";
    $stmt = $pdo->query("
        SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
               u.Email, u.Full_Name as user_full_name
        FROM technicians t
        LEFT JOIN users u ON t.Fk_Users = u.ID_Users
        WHERE t.Status != 'Activo'
    ");
    $inactiveTechs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($inactiveTechs)) {
        echo "<p style='color: green;'>✅ Todos los técnicos están activos</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Email</th><th>Nombre</th><th>Status Actual</th></tr>";
        foreach ($inactiveTechs as $tech) {
            echo "<tr>";
            echo "<td>{$tech['ID_Technicians']}</td>";
            echo "<td>{$tech['Email']}</td>";
            echo "<td>{$tech['First_Name']} {$tech['Last_Name']}</td>";
            echo "<td><strong>{$tech['Status']}</strong></td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // 2. Activar técnicos inactivos
        echo "<h2>2. Activando Técnicos...</h2>";
        
        foreach ($inactiveTechs as $tech) {
            $stmt = $pdo->prepare("
                UPDATE technicians 
                SET Status = 'Activo'
                WHERE ID_Technicians = :id
            ");
            $stmt->execute([':id' => $tech['ID_Technicians']]);
            
            echo "<p style='color: green;'>✅ Activado: {$tech['First_Name']} {$tech['Last_Name']}</p>";
        }
        
        // 3. Verificación
        echo "<h2>3. Verificación Final</h2>";
        $stmt = $pdo->query("
            SELECT COUNT(*) as inactive_count
            FROM technicians
            WHERE Status != 'Activo'
        ");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['inactive_count'] == 0) {
            echo "<p style='color: green; font-weight: bold; font-size: 18px;'>✅ TODOS LOS TÉCNICOS ESTÁN AHORA ACTIVOS</p>";
        } else {
            echo "<p style='color: red;'>❌ Aún hay {$result['inactive_count']} técnicos inactivos</p>";
        }
    }
    
    // 4. Mostrar estado final de todos los técnicos
    echo "<h2>4. Estado Final de Todos los Técnicos</h2>";
    $stmt = $pdo->query("
        SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
               u.Email
        FROM technicians t
        LEFT JOIN users u ON t.Fk_Users = u.ID_Users
        ORDER BY t.ID_Technicians
    ");
    $allTechs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Email</th><th>Nombre</th><th>Status</th></tr>";
    foreach ($allTechs as $tech) {
        $statusColor = $tech['Status'] == 'Activo' ? 'green' : 'red';
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
