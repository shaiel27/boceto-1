<?php
// Script de diagnóstico para verificar asignación de tickets a técnicos

// Configuración de base de datos
$host = 'localhost';
$port = '3306';
$dbname = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Diagnóstico de Asignación de Tickets a Técnicos</h1>";
    
    // 1. Verificar usuarios con rol técnico
    echo "<h2>1. Usuarios con Rol Técnico</h2>";
    $stmt = $pdo->query("
        SELECT u.ID_Users, u.Email, u.Full_Name, r.Role
        FROM users u
        JOIN role r ON u.Fk_Role = r.ID_Role
        WHERE r.Role LIKE '%tecnico%' OR r.Role LIKE '%technician%'
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($users)) {
        echo "<p style='color: red;'>❌ No hay usuarios con rol técnico</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Email</th><th>Nombre</th><th>Rol</th></tr>";
        foreach ($users as $user) {
            echo "<tr><td>{$user['ID_Users']}</td><td>{$user['Email']}</td><td>{$user['Full_Name']}</td><td>{$user['Role']}</td></tr>";
        }
        echo "</table>";
    }
    
    // 2. Verificar registros en tabla technicians
    echo "<h2>2. Registros en Tabla technicians</h2>";
    $stmt = $pdo->query("
        SELECT t.ID_Technicians, t.Fk_Users, t.Status, t.created_at,
               u.Email, u.Full_Name
        FROM technicians t
        LEFT JOIN users u ON t.Fk_Users = u.ID_Users
    ");
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($technicians)) {
        echo "<p style='color: red;'>❌ No hay registros en la tabla technicians</p>";
        echo "<p style='color: orange;'>⚠️ Los usuarios con rol técnico necesitan un registro en technicians</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Fk_Users</th><th>Email</th><th>Nombre</th><th>Status</th></tr>";
        foreach ($technicians as $tech) {
            echo "<tr><td>{$tech['ID_Technicians']}</td><td>{$tech['Fk_Users']}</td><td>{$tech['Email']}</td><td>{$tech['Full_Name']}</td><td>{$tech['Status']}</td></tr>";
        }
        echo "</table>";
    }
    
    // 3. Verificar servicios asignados a técnicos
    echo "<h2>3. Servicios Asignados a Técnicos</h2>";
    $stmt = $pdo->query("
        SELECT ts.ID_Technicians_Service, t.First_Name, t.Last_Name, s.Type_Service, ts.Status
        FROM technicians_service ts
        JOIN technicians t ON ts.Fk_Technicians = t.ID_Technicians
        JOIN ti_service s ON ts.Fk_TI_Service = s.ID_TI_Service
    ");
    $techServices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($techServices)) {
        echo "<p style='color: red;'>❌ No hay servicios asignados a técnicos</p>";
        echo "<p style='color: orange;'>⚠️ Los técnicos necesitan servicios asignados en technicians_service</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Técnico</th><th>Servicio</th><th>Status</th></tr>";
        foreach ($techServices as $ts) {
            echo "<tr><td>{$ts['First_Name']} {$ts['Last_Name']}</td><td>{$ts['Type_Service']}</td><td>{$ts['Status']}</td></tr>";
        }
        echo "</table>";
    }
    
    // 4. Verificar tickets recientes y sus asignaciones
    echo "<h2>4. Tickets Recientes y Asignaciones</h2>";
    $stmt = $pdo->query("
        SELECT sr.ID_Service_Request, sr.Ticket_Code, sr.Subject, sr.Status, sr.Created_at,
               u.Email as requester_email,
               COUNT(tt.ID_Ticket_Technician) as assigned_technicians
        FROM service_request sr
        LEFT JOIN users u ON sr.Fk_User_Requester = u.ID_Users
        LEFT JOIN ticket_technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request AND tt.Status = 'Activo'
        GROUP BY sr.ID_Service_Request
        ORDER BY sr.Created_at DESC
        LIMIT 10
    ");
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($tickets)) {
        echo "<p style='color: orange;'>⚠️ No hay tickets en el sistema</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Código</th><th>Asunto</th><th>Estado</th><th>Solicitante</th><th>Técnicos Asignados</th></tr>";
        foreach ($tickets as $ticket) {
            $assigned = $ticket['assigned_technicians'] > 0 ? "✅ {$ticket['assigned_technicians']}" : "❌ 0";
            echo "<tr><td>{$ticket['ID_Service_Request']}</td><td>{$ticket['Ticket_Code']}</td><td>{$ticket['Subject']}</td><td>{$ticket['Status']}</td><td>{$ticket['requester_email']}</td><td>$assigned</td></tr>";
        }
        echo "</table>";
    }
    
    // 5. Verificar asignaciones de tickets a técnicos
    echo "<h2>5. Asignaciones de Tickets a Técnicos</h2>";
    $stmt = $pdo->query("
        SELECT tt.ID_Ticket_Technician, sr.Ticket_Code, sr.Subject,
               t.First_Name, t.Last_Name, tt.Is_Lead, tt.Status
        FROM ticket_technicians tt
        JOIN service_request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
        JOIN technicians t ON tt.Fk_Technician = t.ID_Technicians
        ORDER BY tt.Assigned_At DESC
        LIMIT 10
    ");
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($assignments)) {
        echo "<p style='color: red;'>❌ No hay asignaciones de tickets a técnicos</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Ticket</th><th>Técnico</th><th>Is Lead</th><th>Status</th></tr>";
        foreach ($assignments as $assign) {
            $lead = $assign['Is_Lead'] ? "✅ Sí" : "No";
            echo "<tr><td>{$assign['Ticket_Code']} - {$assign['Subject']}</td><td>{$assign['First_Name']} {$assign['Last_Name']}</td><td>$lead</td><td>{$assign['Status']}</td></tr>";
        }
        echo "</table>";
    }
    
    // 6. Verificar horarios de técnicos
    echo "<h2>6. Horarios de Técnicos</h2>";
    $stmt = $pdo->query("
        SELECT t.First_Name, t.Last_Name, ts.Day_Of_Week, ts.Work_Start_Time, ts.Work_End_Time
        FROM technician_schedules ts
        JOIN technicians t ON ts.Fk_Technician = t.ID_Technicians
    ");
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($schedules)) {
        echo "<p style='color: orange;'>⚠️ No hay horarios configurados para técnicos</p>";
        echo "<p style='color: orange;'>⚠️ Sin horarios, la asignación automática puede fallar</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Técnico</th><th>Día</th><th>Inicio</th><th>Fin</th></tr>";
        foreach ($schedules as $sched) {
            echo "<tr><td>{$sched['First_Name']} {$sched['Last_Name']}</td><td>{$sched['Day_Of_Week']}</td><td>{$sched['Work_Start_Time']}</td><td>{$sched['Work_End_Time']}</td></tr>";
        }
        echo "</table>";
    }
    
    // 7. Diagnóstico final
    echo "<h2>7. Diagnóstico y Recomendaciones</h2>";
    $issues = [];
    
    if (empty($users)) {
        $issues[] = "No hay usuarios con rol técnico en la base de datos";
    }
    
    if (empty($technicians)) {
        $issues[] = "Los usuarios con rol técnico no tienen registros en la tabla technicians";
    } elseif (count($users) !== count($technicians)) {
        $issues[] = "Hay " . count($users) . " usuarios con rol técnico pero solo " . count($technicians) . " registros en technicians";
    }
    
    if (empty($techServices)) {
        $issues[] = "Los técnicos no tienen servicios asignados en technicians_service";
    }
    
    if (empty($schedules)) {
        $issues[] = "Los técnicos no tienen horarios configurados (opcional pero recomendado)";
    }
    
    if (!empty($issues)) {
        echo "<div style='background-color: #ffeeee; padding: 15px; border-left: 5px solid red;'>";
        echo "<h3 style='color: red;'>❌ Problemas Encontrados:</h3>";
        echo "<ul>";
        foreach ($issues as $issue) {
            echo "<li>$issue</li>";
        }
        echo "</ul>";
        echo "</div>";
    } else {
        echo "<div style='background-color: #eeffee; padding: 15px; border-left: 5px solid green;'>";
        echo "<h3 style='color: green;'>✅ Todo parece correcto</h3>";
        echo "<p>La configuración básica está correcta. Si el técnico aún no ve los tickets, verifica:</p>";
        echo "<ul>";
        echo "<li>Que el técnico esté logueado con el usuario correcto</li>";
        echo "<li>Que el ticket haya sido asignado correctamente</li>";
        echo "<li>Que el técnico tenga el status 'Activo' en la tabla technicians</li>";
        echo "</ul>";
        echo "</div>";
    }
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error de conexión a la base de datos</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "<p>Verifica que XAMPP esté corriendo y que la base de datos exista.</p>";
}
?>
