<?php
// Direct database connection to check data
$host = 'localhost';
$dbname = 'tickets_system';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== DATABASE CONNECTION SUCCESSFUL ===\n\n";
    
    // Check technicians
    echo "--- Technicians Table ---\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM Technicians");
    $techCount = $stmt->fetchColumn();
    echo "Total technicians: $techCount\n\n";
    
    if ($techCount > 0) {
        $stmt = $pdo->query("SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Users, u.Email 
                            FROM Technicians t 
                            LEFT JOIN Users u ON t.Fk_Users = u.ID_Users 
                            LIMIT 5");
        $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($technicians as $tech) {
            echo "ID: {$tech['ID_Technicians']}, Name: {$tech['First_Name']} {$tech['Last_Name']}, Status: {$tech['Status']}, Fk_Users: {$tech['Fk_Users']}, Email: " . ($tech['Email'] ?? 'NULL') . "\n";
        }
    } else {
        echo "NO TECHNICIANS FOUND\n";
    }
    
    echo "\n--- TI_Service Table ---\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM TI_Service");
    $serviceCount = $stmt->fetchColumn();
    echo "Total services: $serviceCount\n\n";
    
    if ($serviceCount > 0) {
        $stmt = $pdo->query("SELECT ID_TI_Service, Type_Service FROM TI_Service LIMIT 5");
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($services as $service) {
            echo "ID: {$service['ID_TI_Service']}, Service: {$service['Type_Service']}\n";
        }
    } else {
        echo "NO SERVICES FOUND\n";
    }
    
    echo "\n--- Technicians_Service Table ---\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM Technicians_Service");
    $tsCount = $stmt->fetchColumn();
    echo "Total technician-service associations: $tsCount\n\n";
    
    if ($tsCount > 0) {
        $stmt = $pdo->query("SELECT ts.*, t.First_Name, t.Last_Name, s.Type_Service 
                            FROM Technicians_Service ts
                            JOIN Technicians t ON ts.Fk_Technician = t.ID_Technicians
                            JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service
                            LIMIT 5");
        $associations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($associations as $assoc) {
            echo "Tech: {$assoc['First_Name']} {$assoc['Last_Name']} -> Service: {$assoc['Type_Service']} (Status: {$assoc['Status']})\n";
        }
    } else {
        echo "NO TECHNICIAN-SERVICE ASSOCIATIONS FOUND\n";
    }
    
    echo "\n--- Test Query for Service ID 1 ---\n";
    $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, u.Email
              FROM Technicians t
              INNER JOIN Users u ON t.Fk_Users = u.ID_Users
              INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technician
              WHERE ts.Fk_TI_Service = 1
              ORDER BY t.First_Name, t.Last_Name";
    
    $stmt = $pdo->query($query);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($result) . " technicians for service ID 1\n";
    foreach ($result as $tech) {
        echo "ID: {$tech['ID_Technicians']}, Name: {$tech['First_Name']} {$tech['Last_Name']}, Email: {$tech['Email']}, Status: {$tech['Status']}\n";
    }
    
} catch (PDOException $e) {
    echo "DATABASE CONNECTION FAILED: " . $e->getMessage() . "\n";
    echo "\nMake sure:\n";
    echo "1. MySQL is running\n";
    echo "2. Database 'tickets_system' exists\n";
    echo "3. User 'root' has access (or update credentials)\n";
}
