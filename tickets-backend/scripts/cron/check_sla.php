#!/usr/bin/php
<?php

// Load environment variables
if (file_exists(__DIR__ . '/../../.env')) {
    $lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') === false) {
            continue;
        }
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        $_ENV[$key] = $value;
    }
}

// Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../../src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

use App\Services\SLAService;
use App\Services\NotificationService;
use App\Services\AuditService;

try {
    $slaService = new SLAService();
    $notificationService = new NotificationService();
    $auditService = new AuditService();

    // Get tickets near deadline
    $nearDeadline = $slaService->getTicketsNearDeadline(2);
    
    foreach ($nearDeadline as $ticket) {
        $notificationService->sendSLAWarningNotification(
            $ticket['ID_Service_Request'],
            $ticket['Subject'],
            (int)$ticket['hours_elapsed']
        );
        
        $auditService->logSystemAction('sla_warning', [
            'ticket_id' => $ticket['ID_Service_Request'],
            'ticket_code' => $ticket['Ticket_Code'],
            'hours_elapsed' => $ticket['hours_elapsed'],
        ]);
    }

    // Get breached tickets
    $breachedTickets = $slaService->getBreachedTickets();
    
    foreach ($breachedTickets as $ticket) {
        $notificationService->sendSLAWarningNotification(
            $ticket['ID_Service_Request'],
            $ticket['Subject'],
            -(int)$ticket['hours_overdue']
        );
        
        $auditService->logSystemAction('sla_breached', [
            'ticket_id' => $ticket['ID_Service_Request'],
            'ticket_code' => $ticket['Ticket_Code'],
            'hours_overdue' => $ticket['hours_overdue'],
        ]);
    }

    echo "SLA check completed. Near deadline: " . count($nearDeadline) . ", Breached: " . count($breachedTickets) . "\n";

} catch (Exception $e) {
    error_log("SLA check error: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
