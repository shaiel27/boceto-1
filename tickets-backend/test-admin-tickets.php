<?php
declare(strict_types=1);

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/ServiceRequest.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        echo "❌ Error de conexión a la base de datos\n";
        exit(1);
    }

    $ticket = new ServiceRequest($db);

    echo "=== Probando getAll() ===\n\n";

    $tickets = $ticket->getAll(10, 0);

    if (empty($tickets)) {
        echo "❌ No se encontraron tickets\n";
    } else {
        echo "✅ Se encontraron " . count($tickets) . " tickets\n\n";

        foreach ($tickets as $t) {
            echo "Ticket ID: {$t['ID_Service_Request']}\n";
            echo "  Código: {$t['Ticket_Code']}\n";
            echo "  Asunto: {$t['Subject']}\n";
            echo "  Estado: {$t['Status']}\n";
            echo "  Prioridad: {$t['System_Priority']}\n";
            echo "  Servicio: {$t['service_type_name']}\n";
            echo "  Oficina: {$t['office_name']}\n";
            echo "  Técnicos asignados: " . count($t['technicians']) . "\n";
            
            if (!empty($t['technicians'])) {
                foreach ($t['technicians'] as $tech) {
                    echo "    - {$tech['name']} (Lead: " . ($tech['is_lead'] ? 'Sí' : 'No') . ")\n";
                }
            }
            echo "\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
