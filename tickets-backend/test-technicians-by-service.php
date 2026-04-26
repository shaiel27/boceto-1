<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    $technician = new Technician($db);

    // Test with service ID 1 (change as needed)
    $serviceId = 1;
    
    echo "Testing getAllTechniciansByService with service ID: {$serviceId}\n";
    echo "===========================================================\n\n";

    $technicians = $technician->getAllTechniciansByService($serviceId);

    if (empty($technicians)) {
        echo "No technicians found for service ID: {$serviceId}\n\n";
        
        // Check if technicians exist at all
        echo "Checking all technicians in database...\n";
        $allTechs = $technician->getAll();
        echo "Total technicians in database: " . count($allTechs) . "\n\n";
        
        // Check Technicians_Service table
        $query = "SELECT ts.*, t.First_Name, t.Last_Name 
                  FROM Technicians_Service ts
                  JOIN Technicians t ON ts.Fk_Technician = t.ID_Technicians
                  WHERE ts.Fk_TI_Service = :serviceId";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":serviceId", $serviceId);
        $stmt->execute();
        $serviceTechs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Technicians in Technicians_Service table for service {$serviceId}: " . count($serviceTechs) . "\n";
        foreach ($serviceTechs as $st) {
            echo "  - ID: {$st['Fk_Technician']}, Name: {$st['First_Name']} {$st['Last_Name']}, Status: {$st['Status']}\n";
        }
        
        // Check technician statuses
        echo "\nChecking technician statuses...\n";
        foreach ($serviceTechs as $st) {
            $techId = $st['Fk_Technician'];
            $query = "SELECT ID_Technicians, First_Name, Last_Name, Status FROM Technicians WHERE ID_Technicians = :techId";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":techId", $techId);
            $stmt->execute();
            $tech = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($tech) {
                echo "  - {$tech['First_Name']} {$tech['Last_Name']}: Status = {$tech['Status']}\n";
            }
        }
        
    } else {
        echo "Found " . count($technicians) . " technician(s):\n\n";
        foreach ($technicians as $tech) {
            echo "ID: {$tech['ID_Technicians']}\n";
            echo "Name: {$tech['First_Name']} {$tech['Last_Name']}\n";
            echo "Email: {$tech['Email']}\n";
            echo "Status: {$tech['Status']}\n";
            echo "--------------------------------\n";
        }
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
