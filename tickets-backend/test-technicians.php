<?php
// Script de prueba para verificar el endpoint de técnicos
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $technician = new Technician($db);
    
    echo "=== Probando getAll() ===\n";
    $technicians = $technician->getAll();
    echo "Número de técnicos: " . count($technicians) . "\n";
    
    if (!empty($technicians)) {
        echo "\nPrimer técnico:\n";
        print_r($technicians[0]);
        
        echo "\n=== Probando getServices() para técnico ID: " . $technicians[0]['ID_Technicians'] . " ===\n";
        $services = $technician->getServices($technicians[0]['ID_Technicians']);
        echo "Servicios: " . count($services) . "\n";
        print_r($services);
        
        echo "\n=== Probando getSchedules() para técnico ID: " . $technicians[0]['ID_Technicians'] . " ===\n";
        $schedules = $technician->getSchedules($technicians[0]['ID_Technicians']);
        echo "Horarios: " . count($schedules) . "\n";
        print_r($schedules);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
