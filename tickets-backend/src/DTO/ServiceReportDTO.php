<?php
declare(strict_types=1);

final class ServiceReportDTO
{
    public string $service;
    public int $total;
    public int $resolved;
    public int $inProgress;
    public int $pending;
    public float $avgHours;
    public float $resolutionRate;

    public function __construct(
        string $service,
        int $total,
        int $resolved,
        int $inProgress,
        int $pending,
        float $avgHours,
        float $resolutionRate,
    ) {
        $this->service = $service;
        $this->total = $total;
        $this->resolved = $resolved;
        $this->inProgress = $inProgress;
        $this->pending = $pending;
        $this->avgHours = $avgHours;
        $this->resolutionRate = $resolutionRate;
    }

    public static function fromArray(array $data): self
    {
        $total = (int)($data['total'] ?? 0);
        $resolved = (int)($data['resolved'] ?? 0);

        return new self(
            (string)($data['service'] ?? ''),
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
            'service' => $this->service,
            'total' => $this->total,
            'resolved' => $this->resolved,
            'in_progress' => $this->inProgress,
            'pending' => $this->pending,
            'avg_hours' => $this->avgHours,
            'resolution_rate' => $this->resolutionRate,
        ];
    }
}
