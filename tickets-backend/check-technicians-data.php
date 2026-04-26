<?php
// Script para verificar datos de técnicos en la base de datos
require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== VERIFICACIÓN DE TÉCNICOS ===\n\n";

    // 1. Contar técnicos
    $query = "SELECT COUNT(*) as count FROM Technicians";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total técnicos en tabla Technicians: " . $result['count'] . "\n\n";

    // 2. Verificar técnicos con sus usuarios
    $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, u.Email 
              FROM Technicians t
              INNER JOIN Users u ON t.Fk_Users = u.ID_Users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Técnicos con usuarios:\n";
    foreach ($technicians as $tech) {
        echo "  - ID: {$tech['ID_Technicians']}, Nombre: {$tech['First_Name']} {$tech['Last_Name']}, Status: {$tech['Status']}, Email: {$tech['Email']}\n";
    }
    echo "\n";

    // 3. Verificar asignaciones de servicios
    $query = "SELECT ts.Fk_Technicians, ts.Fk_TI_Service, s.Type_Service
              FROM Technicians_Service ts
              INNER JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Asignaciones de servicios:\n";
    foreach ($assignments as $assign) {
        echo "  - Técnico ID: {$assign['Fk_Technicians']}, Servicio ID: {$assign['Fk_TI_Service']}, Servicio: {$assign['Type_Service']}\n";
    }
    echo "\n";

    // 4. Verificar la query completa de getTechniciansWithServices
    $query = "SELECT t.ID_Technicians, 
                     t.First_Name, 
                     t.Last_Name, 
                     t.Status, 
                     u.Email,
                     ts.Fk_TI_Service,
                     s.Type_Service
              FROM Technicians t
              INNER JOIN Users u ON t.Fk_Users = u.ID_Users
              LEFT JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
              LEFT JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service
              WHERE t.Status IN ('Activo', 'Disponible', 'Ocupado')
              ORDER BY t.First_Name, t.Last_Name";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Resultados de query completa (Status Activo/Disponible):\n";
    echo "Total filas: " . count($results) . "\n";
    foreach ($results as $row) {
        echo "  - Técnico: {$row['First_Name']} {$row['Last_Name']}, Email: {$row['Email']}, Status: {$row['Status']}, Servicio: " . ($row['Type_Service'] ?? 'NULL') . "\n";
    }
    echo "\n";

    // 5. Verificar TI Services disponibles
    $query = "SELECT ID_TI_Service, Type_Service FROM TI_Service";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Servicios TI disponibles:\n";
    foreach ($services as $service) {
        echo "  - ID: {$service['ID_TI_Service']}, Nombre: {$service['Type_Service']}\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
