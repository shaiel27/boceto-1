<?php
// Simular llamada al endpoint de técnicos
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $technician = new Technician($db);
    
    echo "=== Simulando endpoint GET /technicians ===\n";
    $technicians = $technician->getAll();
    
    // Simular el procesamiento del controller
    foreach ($technicians as &$tech) {
        $services = $technician->getServices($tech['ID_Technicians']);
        $schedules = $technician->getSchedules($tech['ID_Technicians']);
        
        // Keep services as array for frontend
        $tech['TI_Services'] = $services;
        $tech['Schedules'] = $schedules;
        
        // Format lunch block for display
        if ($tech['Block_Name'] && $tech['Start_Time'] && $tech['End_Time']) {
            $tech['Lunch_Block'] = [
                'name' => $tech['Block_Name'],
                'hours' => substr($tech['Start_Time'], 0, 5) . ' - ' . substr($tech['End_Time'], 0, 5)
            ];
        } else {
            $tech['Lunch_Block'] = null;
        }
        
        // Remove raw fields
        unset($tech['Block_Name']);
        unset($tech['Start_Time']);
        unset($tech['End_Time']);
    }
    
    // Mostrar respuesta JSON
    echo json_encode([
        'success' => true,
        'data' => $technicians
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
