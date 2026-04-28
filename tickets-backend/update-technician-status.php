<?php
/**
 * Script para actualizar el estado de los técnicos a "Disponible"
 * Esto permite que aparezcan en el listado de asignación de tickets
 */

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== ACTUALIZACIÓN DE ESTADOS DE TÉCNICOS ===\n\n";
    
    // 1. Verificar estado actual
    echo "1. Estado actual de los técnicos:\n";
    $query = "SELECT ID_Technicians, First_Name, Last_Name, Status FROM Technicians ORDER BY ID_Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $inactiveCount = 0;
    foreach ($technicians as $tech) {
        echo "   - ID {$tech['ID_Technicians']}: {$tech['First_Name']} {$tech['Last_Name']} ({$tech['Status']})\n";
        if ($tech['Status'] === 'Inactivo') {
            $inactiveCount++;
        }
    }
    echo "\n";
    echo "   Total técnicos inactivos: {$inactiveCount}\n\n";
    
    // 2. Actualizar técnicos inactivos a Disponible
    echo "2. Actualizando técnicos inactivos a 'Disponible'...\n";
    $updateQuery = "UPDATE Technicians SET Status = 'Disponible' WHERE Status = 'Inactivo'";
    $updateStmt = $db->prepare($updateQuery);
    
    if ($updateStmt->execute()) {
        $affectedRows = $updateStmt->rowCount();
        echo "   ✓ Se actualizaron {$affectedRows} técnicos a 'Disponible'\n";
    } else {
        echo "   ✗ Error al actualizar técnicos\n";
    }
    echo "\n";
    
    // 3. Verificar estado después de la actualización
    echo "3. Estado después de la actualización:\n";
    $query = "SELECT ID_Technicians, First_Name, Last_Name, Status FROM Technicians ORDER BY ID_Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $availableCount = 0;
    $busyCount = 0;
    
    foreach ($technicians as $tech) {
        echo "   - ID {$tech['ID_Technicians']}: {$tech['First_Name']} {$tech['Last_Name']} ({$tech['Status']})\n";
        if ($tech['Status'] === 'Disponible') {
            $availableCount++;
        } elseif ($tech['Status'] === 'Ocupado') {
            $busyCount++;
        }
    }
    echo "\n";
    echo "   Resumen:\n";
    echo "   - Disponibles: {$availableCount}\n";
    echo "   - Ocupados: {$busyCount}\n";
    echo "   - Total: " . count($technicians) . "\n\n";
    
    // 4. Verificar técnicos disponibles por servicio
    echo "4. Técnicos disponibles por servicio:\n";
    $servicesQuery = "SELECT ID_TI_Service, Type_Service FROM TI_Service ORDER BY ID_TI_Service";
    $servicesStmt = $db->prepare($servicesQuery);
    $servicesStmt->execute();
    $services = $servicesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($services as $service) {
        $serviceId = $service['ID_TI_Service'];
        $serviceName = $service['Type_Service'];
        
        $query = "SELECT COUNT(*) as count
                  FROM Technicians_Service ts
                  JOIN Technicians t ON ts.Fk_Technicians = t.ID_Technicians
                  WHERE ts.Fk_TI_Service = :serviceId 
                    AND ts.Status = 'Activo'
                    AND t.Status IN ('Disponible', 'Activo')";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':serviceId', $serviceId);
        $stmt->execute();
        $count = $stmt->fetchColumn();
        
        echo "   - {$serviceName} (ID {$serviceId}): {$count} técnico(s) disponible(s)\n";
    }
    echo "\n";
    
    echo "=== ACTUALIZACIÓN COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
