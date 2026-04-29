<?php
/**
 * Test script to verify technician status calculation
 * Tests status changes based on work schedule, lunch blocks, and active tickets
 */

require_once __DIR__ . '/src/config/database.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "=== Technician Status Calculation Test ===\n\n";
    echo "Current Time (Venezuela): " . date('Y-m-d H:i:s') . "\n";
    echo "Current Day: " . date('l') . "\n\n";

    // Test 1: Get all technicians with their calculated status
    echo "--- Test 1: Get All Technicians with Status ---\n";
    require_once __DIR__ . '/src/models/Technician.php';
    $technician = new Technician($db);
    $technicians = $technician->getAll();

    echo "Found " . count($technicians) . " technicians\n\n";

    foreach ($technicians as $tech) {
        echo "Technician: {$tech['First_Name']} {$tech['Last_Name']}\n";
        echo "  Status: {$tech['Status']}\n";
        echo "  Status Reason: " . ($tech['Status_Reason'] ?? 'null') . "\n";
        echo "  Tickets Assigned: {$tech['Tickets_Assigned']}\n";
        echo "  Tickets Resolved: {$tech['Tickets_Resolved']}\n";
        echo "  Lunch Block: " . ($tech['Block_Name'] ?? 'None') . "\n";
        echo "  Lunch Hours: " . ($tech['Start_Time'] ?? 'N/A') . " - " . ($tech['End_Time'] ?? 'N/A') . "\n";
        echo "\n";
    }

    // Test 2: Check specific technician schedules
    echo "--- Test 2: Check Technician Schedules ---\n";
    foreach ($technicians as $tech) {
        $schedules = $technician->getSchedules($tech['ID_Technicians']);
        if (!empty($schedules)) {
            echo "Technician: {$tech['First_Name']} {$tech['Last_Name']}\n";
            foreach ($schedules as $schedule) {
                echo "  {$schedule['Day_Of_Week']}: {$schedule['Work_Start_Time']} - {$schedule['Work_End_Time']}\n";
            }
            echo "\n";
        }
    }

    // Test 3: Simulate different time scenarios
    echo "--- Test 3: Time Scenarios ---\n";
    echo "Current Venezuela time: " . date('H:i:s') . "\n";
    echo "Current day (Spanish): " . date('l') . "\n\n";

    $dayMap = [
        'Monday' => 'Lunes',
        'Tuesday' => 'Martes',
        'Wednesday' => 'Miercoles',
        'Thursday' => 'Jueves',
        'Friday' => 'Viernes',
        'Saturday' => 'Sabado',
        'Sunday' => 'Domingo'
    ];
    $currentDaySpanish = $dayMap[date('l')] ?? date('l');
    echo "Current day (Spanish): {$currentDaySpanish}\n\n";

    echo "Expected behavior:\n";
    echo "- If current time is outside work schedule: Status = 'Inactivo', Reason = 'schedule'\n";
    echo "- If current time is in lunch block: Status = 'Ocupado', Reason = 'lunch'\n";
    echo "- If has active tickets: Status = 'Ocupado', Reason = 'ticket'\n";
    echo "- Otherwise: Status = 'Disponible', Reason = null\n\n";

    echo "=== Test Complete ===\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
