<?php

namespace App\Application\Technician;

use App\Domain\Technician\TechnicianRepositoryInterface;

class FindAvailableTechniciansHandler
{
    private TechnicianRepositoryInterface $technicianRepository;

    public function __construct(TechnicianRepositoryInterface $technicianRepository)
    {
        $this->technicianRepository = $technicianRepository;
    }

    public function handle(int $serviceId, int $officeId): array
    {
        $technicians = $this->technicianRepository->findAvailableTechnicians($serviceId, $officeId);
        
        $techniciansWithSchedule = [];
        foreach ($technicians as $technician) {
            $schedules = $this->technicianRepository->findScheduleByTechnicianId($technician->getId());
            $services = $this->technicianRepository->findServicesByTechnicianId($technician->getId());
            
            $techniciansWithSchedule[] = [
                'technician' => $technician->toArray(),
                'schedules' => array_map(fn($s) => $s->toArray(), $schedules),
                'services' => $services,
            ];
        }

        return $techniciansWithSchedule;
    }
}
