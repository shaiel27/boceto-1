<?php

namespace App\Application\Technician;

use App\Domain\Technician\TechnicianRepositoryInterface;
use App\Domain\Technician\TechnicianSchedule;

class SyncAvailabilityHandler
{
    private TechnicianRepositoryInterface $technicianRepository;

    public function __construct(TechnicianRepositoryInterface $technicianRepository)
    {
        $this->technicianRepository = $technicianRepository;
    }

    public function handle(int $technicianId): array
    {
        $technician = $this->technicianRepository->findById($technicianId);
        if ($technician === null) {
            throw new \RuntimeException('Técnico no encontrado');
        }

        $schedules = $this->technicianRepository->findScheduleByTechnicianId($technicianId);
        
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
        
        $todaySchedule = null;
        foreach ($schedules as $schedule) {
            if ($schedule->getDayOfWeek() === $spanishDay) {
                $todaySchedule = $schedule;
                break;
            }
        }

        return [
            'technician' => $technician->toArray(),
            'today_schedule' => $todaySchedule ? $todaySchedule->toArray() : null,
            'all_schedules' => array_map(fn($s) => $s->toArray(), $schedules),
            'is_available_today' => $todaySchedule !== null && $technician->isActive(),
        ];
    }
}
