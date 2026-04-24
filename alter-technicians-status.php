<?php
// Script para actualizar el campo Status en la tabla Technicians
// Cambiar de 'Activo'/'Inactivo' a 'Disponible'/'Ocupado'/'Inactivo'

$host = 'localhost';
$port = '3306';
$dbname = 'tickets_system';
$username = 'root';
$password = 'NuevaClave123';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>Actualización del Campo Status en Technicians</h1>";
    
    // Paso 1: Modificar el campo Status para aceptar los nuevos valores
    echo "<h2>Paso 1: Modificar estructura del campo Status</h2>";
    $alterQuery = "ALTER TABLE technicians 
                   MODIFY Status VARCHAR(20) DEFAULT 'Disponible' 
                   COMMENT 'Estado de disponibilidad del técnico: Disponible, Ocupado, Inactivo'";
    
    try {
        $pdo->exec($alterQuery);
        echo "<p style='color: green;'>✅ Campo Status actualizado exitosamente</p>";
    } catch (PDOException $e) {
        echo "<p style='color: orange;'>⚠️ El campo ya puede estar actualizado: " . $e->getMessage() . "</p>";
    }
    
    // Paso 2: Migrar datos existentes
    echo "<h2>Paso 2: Migrar datos existentes a nuevos estados</h2>";
    
    // Convertir 'Activo' a 'Disponible'
    $updateQuery = "UPDATE technicians SET Status = 'Disponible' WHERE Status = 'Activo'";
    $stmt = $pdo->exec($updateQuery);
    echo "<p style='color: green;'>✅ Convertidos $stmt registros de 'Activo' a 'Disponible'</p>";
    
    // Paso 3: Verificar estado final
    echo "<h2>Paso 3: Verificar estado final</h2>";
    $checkQuery = "SELECT Status, COUNT(*) as count FROM technicians GROUP BY Status";
    $stmt = $pdo->query($checkQuery);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Status</th><th>Cantidad</th></tr>";
    foreach ($results as $row) {
        $color = $row['Status'] == 'Disponible' ? 'green' : ($row['Status'] == 'Ocupado' ? 'orange' : 'red');
        echo "<tr><td style='color: $color; font-weight: bold;'>{$row['Status']}</td><td>{$row['count']}</td></tr>";
    }
    echo "</table>";
    
    // Paso 4: Mostrar descripción de los nuevos estados
    echo "<h2>Descripción de los nuevos estados</h2>";
    echo "<ul>";
    echo "<li><strong>Disponible</strong>: Técnico en horario laboral, fuera de bloque de almuerzo, sin tickets en proceso</li>";
    echo "<li><strong>Ocupado</strong>: Técnico con tickets en proceso o en su horario de almuerzo</li>";
    echo "<li><strong>Inactivo</strong>: Técnico fuera de su horario laboral</li>";
    echo "</ul>";
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error de conexión a la base de datos</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
