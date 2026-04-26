<?php
// Direct database check without going through the API
echo "=== DEBUG: Verifying Technicians Data ===\n\n";

// Check database configuration
$configFile = __DIR__ . '/src/config/database.php';
if (file_exists($configFile)) {
    echo "Database config file exists\n";
    $configContent = file_get_contents($configFile);
    
    // Extract database credentials (for debugging only)
    if (preg_match('/host\s*=\s*[\'"]([^\'"]+)[\'"]/', $configContent, $matches)) {
        echo "Host: " . $matches[1] . "\n";
    }
    if (preg_match('/db_name\s*=\s*[\'"]([^\'"]+)[\'"]/', $configContent, $matches)) {
        echo "Database: " . $matches[1] . "\n";
    }
} else {
    echo "Database config file NOT found\n";
}

echo "\n=== Checking if tables exist ===\n";
echo "Expected tables:\n";
echo "- Technicians\n";
echo "- Users\n";
echo "- Technicians_Service\n";
echo "- TI_Service\n\n";

echo "=== SQL Query to check technicians ===\n";
echo "Run this in your database management tool:\n\n";
echo "-- Check if technicians exist\n";
echo "SELECT COUNT(*) as total FROM Technicians;\n\n";
echo "-- Check technicians with their users\n";
echo "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, u.Email\n";
echo "FROM Technicians t\n";
echo "LEFT JOIN Users u ON t.Fk_Users = u.ID_Users\n";
echo "LIMIT 10;\n\n";
echo "-- Check technicians assigned to services\n";
echo "SELECT ts.*, t.First_Name, t.Last_Name, s.Type_Service\n";
echo "FROM Technicians_Service ts\n";
echo "JOIN Technicians t ON ts.Fk_Technician = t.ID_Technicians\n";
echo "JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service\n";
echo "LIMIT 10;\n\n";
echo "-- Check technicians for a specific service (change ID as needed)\n";
echo "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, u.Email\n";
echo "FROM Technicians t\n";
echo "INNER JOIN Users u ON t.Fk_Users = u.ID_Users\n";
echo "INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technician\n";
echo "WHERE ts.Fk_TI_Service = 1\n";
echo "ORDER BY t.First_Name, t.Last_Name;\n\n";

echo "=== Common Issues ===\n";
echo "1. No technicians in Technicians table\n";
echo "2. Technicians not linked to Users table (Fk_Users is NULL)\n";
echo "3. No entries in Technicians_Service table\n";
echo "4. Service ID doesn't match any TI_Service records\n";
echo "5. Technicians_Service has wrong Fk_TI_Service values\n\n";

echo "=== Solution ===\n";
echo "If tables are empty, you need to:\n";
echo "1. Create users\n";
echo "2. Create technicians linked to users\n";
echo "3. Create TI_Service records\n";
echo "4. Create Technicians_Service records linking technicians to services\n";
