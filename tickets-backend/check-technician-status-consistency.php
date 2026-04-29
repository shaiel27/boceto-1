<?php
require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== Verificación de consistencia de estado de técnicos ===\n\n";

    // Buscar técnicos que tienen tickets activos pero están marcados como Disponible
    $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status as Technician_Status,
                     COUNT(tt.ID_Ticket_Technician) as Active_Tickets_Count
              FROM Technicians t
              LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician 
                                                AND tt.Status = 'Activo'
              LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
              WHERE t.Status = 'Disponible' 
                AND sr.Status != 'Cerrado'
              GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, t.Status
              HAVING Active_Tickets_Count > 0";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $inconsistentTechs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($inconsistentTechs) > 0) {
        echo "Técnicos con estado inconsistente (Disponible pero con tickets activos):\n";
        echo "Total encontrados: " . count($inconsistentTechs) . "\n\n";
        
        foreach ($inconsistentTechs as $tech) {
            echo "Técnico: {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']})\n";
            echo "Estado actual: {$tech['Technician_Status']}\n";
            echo "Tickets activos: {$tech['Active_Tickets_Count']}\n";
            echo "---\n";
        }

        // Corregir estados
        echo "\nCorrigiendo estados...\n";
        foreach ($inconsistentTechs as $tech) {
            $updateQuery = "UPDATE Technicians SET Status = 'Ocupado' WHERE ID_Technicians = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(":id", $tech['ID_Technicians']);
            $updateStmt->execute();
            echo "Técnico {$tech['First_Name']} {$tech['Last_Name']} actualizado a 'Ocupado'\n";
        }
    } else {
        echo "No se encontraron técnicos con estado inconsistente.\n";
    }

    // Verificar técnicos que están Ocupados pero no tienen tickets activos
    echo "\n=== Verificación de técnicos Ocupados sin tickets activos ===\n";
    
    $query2 = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status as Technician_Status,
                      COUNT(tt.ID_Ticket_Technician) as Active_Tickets_Count
               FROM Technicians t
               LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician 
                                                 AND tt.Status = 'Activo'
               LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
               WHERE t.Status = 'Ocupado'
               GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, t.Status
               HAVING Active_Tickets_Count = 0";

    $stmt2 = $db->prepare($query2);
    $stmt2->execute();
    $idleTechs = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    if (count($idleTechs) > 0) {
        echo "Técnicos Ocupados sin tickets activos:\n";
        echo "Total encontrados: " . count($idleTechs) . "\n\n";
        
        foreach ($idleTechs as $tech) {
            echo "Técnico: {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']})\n";
            echo "Estado actual: {$tech['Technician_Status']}\n";
            echo "Tickets activos: {$tech['Active_Tickets_Count']}\n";
            echo "---\n";
        }

        // Corregir estados
        echo "\nCorrigiendo estados...\n";
        foreach ($idleTechs as $tech) {
            $updateQuery = "UPDATE Technicians SET Status = 'Disponible' WHERE ID_Technicians = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(":id", $tech['ID_Technicians']);
            $updateStmt->execute();
            echo "Técnico {$tech['First_Name']} {$tech['Last_Name']} actualizado a 'Disponible'\n";
        }
    } else {
        echo "No se encontraron técnicos Ocupados sin tickets activos.\n";
    }

    // Estado final
    echo "\n=== Estado final de técnicos ===\n";
    $finalQuery = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt 
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request 
                           WHERE tt.Fk_Technician = t.ID_Technicians AND tt.Status = 'Activo' AND sr.Status != 'Cerrado') as Active_Tickets
                   FROM Technicians t
                   ORDER BY t.First_Name, t.Last_Name";
    $finalStmt = $db->prepare($finalQuery);
    $finalStmt->execute();
    $finalTechs = $finalStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($finalTechs as $tech) {
        $statusIcon = ($tech['Active_Tickets'] > 0 && $tech['Status'] === 'Disponible') ? '❌ INCONSISTENTE' : '✓';
        echo "{$statusIcon} {$tech['First_Name']} {$tech['Last_Name']}: {$tech['Status']} (Tickets activos: {$tech['Active_Tickets']})\n";
    }

    echo "\n=== Verificación completada ===\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
