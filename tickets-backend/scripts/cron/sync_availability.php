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

use App\Domain\Technician\TechnicianRepositoryInterface;
use App\Infrastructure\Persistence\PdoTechnicianRepository;
use App\Services\AuditService;

try {
    $technicianRepository = new PdoTechnicianRepository();
    $auditService = new AuditService();

    // Get all active technicians
    $technicians = $technicianRepository->findActive();
    
    $updatedCount = 0;
    $errorCount = 0;

    foreach ($technicians as $technician) {
        try {
            // Check technician availability for today
            $today = date('Y-m-d');
            $currentDay = date('l');
            
            $dayMap = [
                'Monday' => 'Lunes',
                'Tuesday' => 'Martes',
                'Wednesday' => 'Miércoles',
                'Thursday' => 'Jueves',
                'Friday' => 'Viernes',
                'Saturday' => 'Sábado',
                'Sunday' => 'Domingo',
            ];
            
            $spanishDay = $dayMap[$currentDay] ?? $currentDay;
            
            $schedules = $technicianRepository->findScheduleByTechnicianId($technician->getId());
            
            $todaySchedule = null;
            foreach ($schedules as $schedule) {
                if ($schedule->getDayOfWeek() === $spanishDay) {
                    $todaySchedule = $schedule;
                    break;
                }
            }

            // Log availability status
            $auditService->logSystemAction('sync_availability', [
                'technician_id' => $technician->getId(),
                'technician_name' => $technician->getFullName(),
                'has_schedule_today' => $todaySchedule !== null,
                'status' => $technician->getStatus(),
                'sync_date' => $today,
            ]);

            $updatedCount++;

        } catch (Exception $e) {
            $errorCount++;
            error_log("Error syncing technician {$technician->getId()}: " . $e->getMessage());
        }
    }

    echo "Availability sync completed. Updated: {$updatedCount}, Errors: {$errorCount}\n";

} catch (Exception $e) {
    error_log("Availability sync error: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
