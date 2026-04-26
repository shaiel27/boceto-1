<?php
echo "=== Checking Available PDO Drivers ===\n\n";
$drivers = PDO::getAvailableDrivers();
echo "Available drivers:\n";
foreach ($drivers as $driver) {
    echo "  - $driver\n";
}

if (!in_array('mysql', $drivers)) {
    echo "\n❌ MySQL PDO driver is NOT installed!\n";
    echo "You need to install it to run PHP scripts that connect to MySQL.\n";
    echo "\nTo install on Windows:\n";
    echo "1. Edit php.ini\n";
    echo "2. Uncomment: extension=pdo_mysql\n";
    echo "3. Uncomment: extension=mysqli\n";
    echo "4. Restart your web server\n";
} else {
    echo "\n✅ MySQL PDO driver is available\n";
}

echo "\n=== Alternative: Check Database Directly ===\n";
echo "Since PDO is not available, check your database directly:\n";
echo "\n1. Open phpMyAdmin or MySQL Workbench\n";
echo "2. Connect to database: tickets_system\n";
echo "3. Run these queries:\n\n";
echo "-- Check technicians\n";
echo "SELECT COUNT(*) as total FROM Technicians;\n\n";
echo "-- Check technicians with users\n";
echo "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, u.Email\n";
echo "FROM Technicians t\n";
echo "LEFT JOIN Users u ON t.Fk_Users = u.ID_Users\n";
echo "LIMIT 10;\n\n";
echo "-- Check technician-service associations\n";
echo "SELECT ts.*, t.First_Name, t.Last_Name, s.Type_Service\n";
echo "FROM Technicians_Service ts\n";
echo "JOIN Technicians t ON ts.Fk_Technician = t.ID_Technicians\n";
echo "JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service\n";
echo "LIMIT 10;\n\n";
echo "-- Check what service IDs your tickets use\n";
echo "SELECT DISTINCT Fk_TI_Service, COUNT(*) as count\n";
echo "FROM Service_Request\n";
echo "GROUP BY Fk_TI_Service;\n";
