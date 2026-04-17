<?php

namespace App\Domain\Technician;

interface TechnicianRepositoryInterface
{
    public function findById(int $id): ?Technician;
    public function findByUserId(int $userId): ?Technician;
    public function findAll(): array;
    public function findActive(): array;
    public function save(Technician $technician): Technician;
    public function delete(int $id): bool;
    public function findScheduleByTechnicianId(int $technicianId): array;
    public function saveSchedule(TechnicianSchedule $schedule): TechnicianSchedule;
    public function findLunchBlockById(int $id): ?LunchBlock;
    public function findAllLunchBlocks(): array;
    public function findAvailableTechnicians(int $serviceId, int $officeId): array;
    public function findServicesByTechnicianId(int $technicianId): array;
}
