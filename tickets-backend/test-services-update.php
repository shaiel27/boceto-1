<?php
// Test script for services update functionality
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $technician = new Technician($db);
    
    echo "=== Test: Remove and Add Services ===\n";
    
    $technicianId = 5; // Test with technician ID 5
    
    echo "\n1. Removing all services for technician $technicianId...\n";
    $removeResult = $technician->removeServices($technicianId);
    echo "Remove result: " . ($removeResult ? "SUCCESS" : "FAILED") . "\n";
    
    echo "\n2. Adding services [1, 2] to technician $technicianId...\n";
    $addResult1 = $technician->addService($technicianId, 1);
    $addResult2 = $technician->addService($technicianId, 2);
    echo "Add service 1: " . ($addResult1 ? "SUCCESS" : "FAILED") . "\n";
    echo "Add service 2: " . ($addResult2 ? "SUCCESS" : "FAILED") . "\n";
    
    echo "\n3. Verifying services...\n";
    $services = $technician->getServices($technicianId);
    echo "Current services: " . json_encode($services) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
