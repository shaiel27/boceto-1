<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error: No se pudo conectar a la base de datos\n");
    }

    echo "=== DATABASE CONNECTION SUCCESSFUL ===\n\n";
    
    // Check technicians
    echo "--- Technicians Table ---\n";
    $stmt = $db->query("SELECT COUNT(*) FROM Technicians");
    $techCount = $stmt->fetchColumn();
    echo "Total technicians: $techCount\n\n";
    
    if ($techCount > 0) {
        $stmt = $db->query("SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Users, u.Email 
                            FROM Technicians t 
                            LEFT JOIN Users u ON t.Fk_Users = u.ID_Users 
                            LIMIT 5");
        $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($technicians as $tech) {
            echo "ID: {$tech['ID_Technicians']}, Name: {$tech['First_Name']} {$tech['Last_Name']}, Status: {$tech['Status']}, Fk_Users: " . ($tech['Fk_Users'] ?? 'NULL') . ", Email: " . ($tech['Email'] ?? 'NULL') . "\n";
        }
    } else {
        echo "NO TECHNICIANS FOUND - You need to create technicians first\n";
    }
    
    echo "\n--- TI_Service Table ---\n";
    $stmt = $db->query("SELECT COUNT(*) FROM TI_Service");
    $serviceCount = $stmt->fetchColumn();
    echo "Total services: $serviceCount\n\n";
    
    if ($serviceCount > 0) {
        $stmt = $db->query("SELECT ID_TI_Service, Type_Service FROM TI_Service LIMIT 5");
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($services as $service) {
            echo "ID: {$service['ID_TI_Service']}, Service: {$service['Type_Service']}\n";
        }
    } else {
        echo "NO SERVICES FOUND - You need to create TI services first\n";
    }
    
    echo "\n--- Technicians_Service Table ---\n";
    $stmt = $db->query("SELECT COUNT(*) FROM Technicians_Service");
    $tsCount = $stmt->fetchColumn();
    echo "Total technician-service associations: $tsCount\n\n";
    
    if ($tsCount > 0) {
        $stmt = $db->query("SELECT ts.*, t.First_Name, t.Last_Name, s.Type_Service 
                            FROM Technicians_Service ts
                            JOIN Technicians t ON ts.Fk_Technician = t.ID_Technicians
                            JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service
                            LIMIT 5");
        $associations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($associations as $assoc) {
            echo "Tech: {$assoc['First_Name']} {$assoc['Last_Name']} -> Service ID: {$assoc['Fk_TI_Service']} ({$assoc['Type_Service']}) - Status: {$assoc['Status']}\n";
        }
    } else {
        echo "NO TECHNICIAN-SERVICE ASSOCIATIONS FOUND\n";
        echo "You need to link technicians to services in Technicians_Service table\n";
    }
    
    echo "\n--- Test Query for Service ID 1 ---\n";
    $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, u.Email
              FROM Technicians t
              INNER JOIN Users u ON t.Fk_Users = u.ID_Users
              INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technician
              WHERE ts.Fk_TI_Service = 1
              ORDER BY t.First_Name, t.Last_Name";
    
    $stmt = $db->query($query);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($result) . " technicians for service ID 1\n";
    foreach ($result as $tech) {
        echo "ID: {$tech['ID_Technicians']}, Name: {$tech['First_Name']} {$tech['Last_Name']}, Email: {$tech['Email']}, Status: {$tech['Status']}\n";
    }
    
    echo "\n=== CONCLUSION ===\n";
    if ($techCount == 0) {
        echo "❌ NO TECHNICIANS - Create technicians in the Technician Management module\n";
    } elseif ($tsCount == 0) {
        echo "❌ NO SERVICE ASSOCIATIONS - Link technicians to services in the database\n";
    } elseif (count($result) == 0) {
        echo "❌ NO TECHNICIANS FOR SERVICE ID 1 - Check if tickets use a different service ID\n";
    } else {
        echo "✅ DATA EXISTS - The issue might be in the API endpoint or frontend\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
