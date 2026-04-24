<?php
// Script de prueba específico para lunch blocks
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $technician = new Technician($db);
    
    echo "=== Probando getAll() con lunch blocks ===\n";
    $technicians = $technician->getAll();
    
    foreach ($technicians as $tech) {
        echo "\nTécnico ID: {$tech['ID_Technicians']} - {$tech['First_Name']} {$tech['Last_Name']}\n";
        echo "Fk_Lunch_Block: " . ($tech['Fk_Lunch_Block'] ?? 'NULL') . "\n";
        echo "Block_Name: " . ($tech['Block_Name'] ?? 'NULL') . "\n";
        echo "Start_Time: " . ($tech['Start_Time'] ?? 'NULL') . "\n";
        echo "End_Time: " . ($tech['End_Time'] ?? 'NULL') . "\n";
        
        // Simular el formateo del controller
        if ($tech['Block_Name'] && $tech['Start_Time'] && $tech['End_Time']) {
            $lunchBlock = [
                'name' => $tech['Block_Name'],
                'hours' => substr($tech['Start_Time'], 0, 5) . ' - ' . substr($tech['End_Time'], 0, 5)
            ];
            echo "Lunch_Block formateado: " . json_encode($lunchBlock) . "\n";
        } else {
            echo "Lunch_Block: null (sin bloque asignado)\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
