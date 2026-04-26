<?php
// Simple check without database connection
echo "Checking Technicians_Service table structure...\n";
echo "================================================\n\n";

// Check if the file exists
$technicianFile = __DIR__ . '/src/models/Technician.php';
if (file_exists($technicianFile)) {
    echo "Technician.php exists\n";
    
    // Read the file to check the method
    $content = file_get_contents($technicianFile);
    if (strpos($content, 'getAllTechniciansByService') !== false) {
        echo "Method getAllTechniciansByService exists\n";
        
        // Extract the method
        preg_match('/public function getAllTechniciansByService\([^)]*\)[^{]*{([^}]*(?:{[^}]*}[^}]*)*)}/s', $content, $matches);
        if (isset($matches[0])) {
            echo "\nMethod implementation:\n";
            echo "========================\n";
            echo $matches[0] . "\n";
        }
    } else {
        echo "Method getAllTechniciansByService NOT found\n";
    }
} else {
    echo "Technician.php does not exist\n";
}

echo "\n\n";
echo "Expected SQL Query:\n";
echo "===================\n";
echo "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, u.Email\n";
echo "FROM Technicians t\n";
echo "INNER JOIN Users u ON t.Fk_Users = u.ID_Users\n";
echo "INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technician\n";
echo "WHERE ts.Fk_TI_Service = :serviceId\n";
echo "  AND ts.Status = 'Activo'\n";
echo "  AND t.Status IN ('Activo', 'Disponible')\n";
echo "ORDER BY t.First_Name, t.Last_Name\n";
