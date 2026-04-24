<?php
// Script para identificar y corregir el registro faltante en technicians

$host = 'localhost';
$port = '3306';
$dbname = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Corrección de Registros Faltantes en Technicians</h1>";
    
    // 1. Identificar usuarios con rol técnico sin registro en technicians
    echo "<h2>1. Usuarios con Rol Técnico sin Registro en Technicians</h2>";
    $stmt = $pdo->query("
        SELECT u.ID_Users, u.Email, u.Full_Name, r.Role
        FROM users u
        JOIN role r ON u.Fk_Role = r.ID_Role
        WHERE (r.Role LIKE '%tecnico%' OR r.Role LIKE '%technician%')
        AND u.ID_Users NOT IN (SELECT Fk_Users FROM technicians)
    ");
    $missingTechs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($missingTechs)) {
        echo "<p style='color: green;'>✅ Todos los usuarios con rol técnico tienen registro en technicians</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Email</th><th>Nombre</th><th>Rol</th><th>Acción</th></tr>";
        
        foreach ($missingTechs as $user) {
            echo "<tr>";
            echo "<td>{$user['ID_Users']}</td>";
            echo "<td>{$user['Email']}</td>";
            echo "<td>{$user['Full_Name']}</td>";
            echo "<td>{$user['Role']}</td>";
            echo "<td><strong>FALTA REGISTRO</strong></td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // 2. Crear los registros faltantes
        echo "<h2>2. Creando Registros Faltantes...</h2>";
        
        foreach ($missingTechs as $user) {
            // Extraer nombre y apellido
            $nameParts = explode(' ', $user['Full_Name'], 2);
            $firstName = $nameParts[0];
            $lastName = isset($nameParts[1]) ? $nameParts[1] : '';
            
            // Insertar en technicians
            $stmt = $pdo->prepare("
                INSERT INTO technicians (Fk_Users, First_Name, Last_Name, Status, created_at)
                VALUES (:fk_users, :first_name, :last_name, 'Activo', NOW())
            ");
            $stmt->execute([
                ':fk_users' => $user['ID_Users'],
                ':first_name' => $firstName,
                ':last_name' => $lastName
            ]);
            
            $technicianId = $pdo->lastInsertId();
            
            echo "<p style='color: green;'>✅ Creado registro para {$user['Full_Name']} (ID: $technicianId)</p>";
            
            // 3. Asignar servicio por defecto (Redes - ID 1)
            $stmt = $pdo->prepare("
                INSERT INTO technicians_service (Fk_TI_Service, Fk_Technicians, Status, created_at)
                VALUES (1, :technician_id, 'Activo', NOW())
            ");
            $stmt->execute([':technician_id' => $technicianId]);
            
            echo "<p style='color: blue;'>📋 Asignado servicio 'Redes' al técnico</p>";
        }
        
        echo "<h2>3. Verificación Final</h2>";
        $stmt = $pdo->query("
            SELECT u.ID_Users, u.Email, u.Full_Name, r.Role
            FROM users u
            JOIN role r ON u.Fk_Role = r.ID_Role
            WHERE (r.Role LIKE '%tecnico%' OR r.Role LIKE '%technician%')
            AND u.ID_Users NOT IN (SELECT Fk_Users FROM technicians)
        ");
        $stillMissing = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($stillMissing)) {
            echo "<p style='color: green; font-weight: bold; font-size: 18px;'>✅ TODOS LOS USUARIOS TÉCNICOS AHORA TIENEN REGISTRO EN TECHNICIANS</p>";
        } else {
            echo "<p style='color: red;'>❌ Aún faltan registros</p>";
        }
    }
    
    // 4. Mostrar todos los técnicos con sus servicios
    echo "<h2>4. Todos los Técnicos y sus Servicios</h2>";
    $stmt = $pdo->query("
        SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, t.Status,
               u.Email, u.Full_Name as user_full_name,
               GROUP_CONCAT(s.Type_Service SEPARATOR ', ') as services
        FROM technicians t
        LEFT JOIN users u ON t.Fk_Users = u.ID_Users
        LEFT JOIN technicians_service ts ON t.ID_Technicians = ts.Fk_Technicians AND ts.Status = 'Activo'
        LEFT JOIN ti_service s ON ts.Fk_TI_Service = s.ID_TI_Service
        GROUP BY t.ID_Technicians
        ORDER BY t.ID_Technicians
    ");
    $allTechs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Fk_Users</th><th>Email</th><th>Nombre</th><th>Status</th><th>Servicios</th></tr>";
    foreach ($allTechs as $tech) {
        $services = $tech['services'] ?: '<span style="color: red;">SIN SERVICIOS</span>';
        echo "<tr>";
        echo "<td>{$tech['ID_Technicians']}</td>";
        echo "<td>{$tech['Fk_Users']}</td>";
        echo "<td>{$tech['Email']}</td>";
        echo "<td>{$tech['First_Name']} {$tech['Last_Name']}</td>";
        echo "<td>{$tech['Status']}</td>";
        echo "<td>$services</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error de conexión a la base de datos</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
