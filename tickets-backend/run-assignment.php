<?php
// This script can be run via cron job to automatically assign pending tickets
// Add to crontab: */5 * * * * C:\xampp\php\php.exe C:\path\to\run-assignment.php

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/models/Technician.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        error_log("Assignment script: Database connection failed");
        exit(1);
    }

    $technician = new Technician($db);
    $result = $technician->assignPendingTickets();

    error_log("Assignment script: Assigned {$result['assigned_count']} pending tickets");

    if (!empty($result['assignments'])) {
        foreach ($result['assignments'] as $assignment) {
            error_log("  - Ticket {$assignment['ticket_id']} assigned to {$assignment['technician']}");
        }
    }

} catch (Exception $e) {
    error_log("Assignment script error: " . $e->getMessage());
    exit(1);
}
?>
