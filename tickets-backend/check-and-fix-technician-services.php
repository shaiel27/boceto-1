<?php
/**
 * Script para verificar y corregir asignaciones de técnicos a servicios
 * Este script verifica que cada servicio tenga técnicos asignados
 */

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }
    
    echo "=== VERIFICACIÓN DE ASIGNACIONES DE TÉCNICOS A SERVICIOS ===\n\n";
    
    // 1. Verificar servicios TI
    echo "1. Servicios TI disponibles:\n";
    $query = "SELECT ID_TI_Service, Type_Service FROM TI_Service ORDER BY ID_TI_Service";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($services as $service) {
        echo "   - ID {$service['ID_TI_Service']}: {$service['Type_Service']}\n";
    }
    echo "\n";
    
    // 2. Verificar técnicos
    echo "2. Técnicos disponibles:\n";
    $query = "SELECT ID_Technicians, First_Name, Last_Name, Status FROM Technicians ORDER BY ID_Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($technicians as $tech) {
        echo "   - ID {$tech['ID_Technicians']}: {$tech['First_Name']} {$tech['Last_Name']} ({$tech['Status']})\n";
    }
    echo "\n";
    
    // 3. Verificar asignaciones actuales
    echo "3. Asignaciones actuales de técnicos a servicios:\n";
    $query = "SELECT ts.Fk_TI_Service, s.Type_Service, ts.Fk_Technicians,
                     t.First_Name, t.Last_Name, ts.Status
              FROM Technicians_Service ts
              JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service
              JOIN Technicians t ON ts.Fk_Technicians = t.ID_Technicians
              ORDER BY ts.Fk_TI_Service, ts.Fk_Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($assignments)) {
        echo "   ⚠️  NO HAY ASIGNACIONES DE TÉCNICOS A SERVICIOS\n";
    } else {
        foreach ($assignments as $assignment) {
            echo "   - Servicio {$assignment['Fk_TI_Service']} ({$assignment['Type_Service']}): ";
            echo "Técnico {$assignment['Fk_Technicians']} ({$assignment['First_Name']} {$assignment['Last_Name']}) - ";
            echo "Estado: {$assignment['Status']}\n";
        }
    }
    echo "\n";
    
    // 4. Verificar qué servicios tienen técnicos asignados
    echo "4. Resumen de técnicos por servicio:\n";
    foreach ($services as $service) {
        $serviceId = $service['ID_TI_Service'];
        $serviceName = $service['Type_Service'];
        
        $query = "SELECT COUNT(*) as count FROM Technicians_Service 
                  WHERE Fk_TI_Service = :serviceId AND Status = 'Activo'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':serviceId', $serviceId);
        $stmt->execute();
        $count = $stmt->fetchColumn();
        
        echo "   - {$serviceName} (ID {$serviceId}): {$count} técnico(s) asignado(s)\n";
        
        if ($count == 0) {
            echo "     ⚠️  ADVERTENCIA: Este servicio no tiene técnicos asignados\n";
        }
    }
    echo "\n";
    
    // 5. Proponer correcciones
    echo "5. Asignaciones recomendadas:\n";
    echo "   Basado en los datos de prueba del database.sql:\n";
    echo "   - Redes (ID 1): Carlos (ID 1) y Amna (ID 2)\n";
    echo "   - Soporte (ID 2): Carlos (ID 1)\n";
    echo "   - Programación (ID 3): Amna (ID 2)\n\n";
    
    // 6. Verificar si faltan asignaciones y corregir
    echo "6. Corrigiendo asignaciones faltantes...\n";
    
    $requiredAssignments = [
        ['service_id' => 1, 'technician_id' => 1], // Redes - Carlos
        ['service_id' => 1, 'technician_id' => 2], // Redes - Amna
        ['service_id' => 2, 'technician_id' => 1], // Soporte - Carlos
        ['service_id' => 3, 'technician_id' => 2], // Programación - Amna
    ];
    
    foreach ($requiredAssignments as $assignment) {
        $serviceId = $assignment['service_id'];
        $technicianId = $assignment['technician_id'];
        
        // Verificar si ya existe
        $checkQuery = "SELECT COUNT(*) FROM Technicians_Service 
                       WHERE Fk_TI_Service = :serviceId AND Fk_Technicians = :technicianId";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':serviceId', $serviceId);
        $checkStmt->bindParam(':technicianId', $technicianId);
        $checkStmt->execute();
        $exists = $checkStmt->fetchColumn();
        
        if ($exists == 0) {
            // Insertar asignación faltante
            $insertQuery = "INSERT INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status, created_at)
                           VALUES (:serviceId, :technicianId, 'Activo', NOW())";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->bindParam(':serviceId', $serviceId);
            $insertStmt->bindParam(':technicianId', $technicianId);
            
            if ($insertStmt->execute()) {
                echo "   ✓ Insertada: Servicio {$serviceId} -> Técnico {$technicianId}\n";
            } else {
                echo "   ✗ Error al insertar: Servicio {$serviceId} -> Técnico {$technicianId}\n";
            }
        } else {
            echo "   - Ya existe: Servicio {$serviceId} -> Técnico {$technicianId}\n";
        }
    }
    echo "\n";
    
    // 7. Verificación final
    echo "7. Verificación final después de correcciones:\n";
    foreach ($services as $service) {
        $serviceId = $service['ID_TI_Service'];
        $serviceName = $service['Type_Service'];
        
        $query = "SELECT COUNT(*) as count FROM Technicians_Service 
                  WHERE Fk_TI_Service = :serviceId AND Status = 'Activo'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':serviceId', $serviceId);
        $stmt->execute();
        $count = $stmt->fetchColumn();
        
        echo "   - {$serviceName} (ID {$serviceId}): {$count} técnico(s) asignado(s)\n";
    }
    echo "\n";
    
    echo "=== VERIFICACIÓN COMPLETADA ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
