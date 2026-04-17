<?php

namespace App\Domain\Technician;

class TechnicianSchedule
{
    private ?int $id;
    private int $fkTechnician;
    private string $dayOfWeek;
    private string $workStartTime;
    private string $workEndTime;

    public function __construct(
        ?int $id,
        int $fkTechnician,
        string $dayOfWeek,
        string $workStartTime = '08:00:00',
        string $workEndTime
    ) {
        $this->id = $id;
        $this->fkTechnician = $fkTechnician;
        $this->dayOfWeek = $dayOfWeek;
        $this->workStartTime = $workStartTime;
        $this->workEndTime = $workEndTime;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkTechnician(): int { return $this->fkTechnician; }
    public function getDayOfWeek(): string { return $this->dayOfWeek; }
    public function getWorkStartTime(): string { return $this->workStartTime; }
    public function getWorkEndTime(): string { return $this->workEndTime; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_technician' => $this->fkTechnician,
            'day_of_week' => $this->dayOfWeek,
            'work_start_time' => $this->workStartTime,
            'work_end_time' => $this->workEndTime,
        ];
    }
}
