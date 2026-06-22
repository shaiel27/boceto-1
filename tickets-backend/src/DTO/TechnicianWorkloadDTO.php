<?php
declare(strict_types=1);

final class TechnicianWorkloadDTO
{
    public string $technician;
    public string $email;
    public int $totalAssigned;
    public int $resolved;
    public int $inProgress;
    public int $pending;
    public float $avgHours;
    public float $resolutionRate;

    public function __construct(
        string $technician,
        string $email,
        int $totalAssigned,
        int $resolved,
        int $inProgress,
        int $pending,
        float $avgHours,
        float $resolutionRate,
    ) {
        $this->technician = $technician;
        $this->email = $email;
        $this->totalAssigned = $totalAssigned;
        $this->resolved = $resolved;
        $this->inProgress = $inProgress;
        $this->pending = $pending;
        $this->avgHours = $avgHours;
        $this->resolutionRate = $resolutionRate;
    }

    public static function fromArray(array $data): self
    {
        $total = (int)($data['total_assigned'] ?? 0);
        $resolved = (int)($data['resolved'] ?? 0);

        return new self(
            (string)($data['technician'] ?? ''),
            (string)($data['email'] ?? ''),
            $total,
            $resolved,
            (int)($data['in_progress'] ?? 0),
            (int)($data['pending'] ?? 0),
            (float)($data['avg_hours'] ?? 0.0),
            $total > 0 ? round($resolved * 100.0 / $total, 1) : 0.0,
        );
    }

    public static function collection(array $data): array
    {
        return array_map(function(array $row): self {
            return self::fromArray($row);
        }, $data);
    }

    public function toArray(): array
    {
        return [
            'technician' => $this->technician,
            'email' => $this->email,
            'total_assigned' => $this->totalAssigned,
            'resolved' => $this->resolved,
            'in_progress' => $this->inProgress,
            'pending' => $this->pending,
            'avg_hours' => $this->avgHours,
            'resolution_rate' => $this->resolutionRate,
        ];
    }
}
