<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("Error de conexión a la base de datos\n");
    }

    echo "=== PRUEBA DE ENDPOINT technicians-by-service ===\n\n";

    // Probar para cada servicio
    $services = [
        1 => 'Redes',
        2 => 'Soporte',
        3 => 'Programación'
    ];

    foreach ($services as $serviceId => $serviceName) {
        echo "Servicio: {$serviceName} (ID: {$serviceId})\n";
        
        $technician = new Technician($db);
        $techs = $technician->getAllTechniciansByService($serviceId);
        
        echo "  Total técnicos: " . count($techs) . "\n";
        
        if (empty($techs)) {
            echo "  No hay técnicos para este servicio\n";
        } else {
            foreach ($techs as $tech) {
                $statusDisplay = $tech['Status'] === 'Activo' || $tech['Status'] === 'Disponible' ? '✓ Disponible' : '✗ Ocupado';
                echo "  - {$tech['First_Name']} {$tech['Last_Name']} (ID: {$tech['ID_Technicians']}) - {$tech['Status']} {$statusDisplay}\n";
            }
        }
        echo "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
