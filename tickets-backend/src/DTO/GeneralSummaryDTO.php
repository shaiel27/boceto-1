<?php
declare(strict_types=1);

final class GeneralSummaryDTO
{
    public int $total;
    public int $pending;
    public int $inProgress;
    public int $resolved;
    public int $altaCount;
    public float $avgHours;
    public float $resolutionRate;

    public function __construct(
        int $total,
        int $pending,
        int $inProgress,
        int $resolved,
        int $altaCount,
        float $avgHours,
        float $resolutionRate,
    ) {
        $this->total = $total;
        $this->pending = $pending;
        $this->inProgress = $inProgress;
        $this->resolved = $resolved;
        $this->altaCount = $altaCount;
        $this->avgHours = $avgHours;
        $this->resolutionRate = $resolutionRate;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (int)($data['total'] ?? 0),
            (int)($data['pending'] ?? 0),
            (int)($data['in_progress'] ?? 0),
            (int)($data['resolved'] ?? 0),
            (int)($data['alta_count'] ?? 0),
            (float)($data['avg_hours'] ?? 0.0),
            (float)($data['resolution_rate'] ?? 0.0),
        );
    }

    public function toArray(): array
    {
        return [
            'total' => $this->total,
            'pending' => $this->pending,
            'in_progress' => $this->inProgress,
            'resolved' => $this->resolved,
            'alta_count' => $this->altaCount,
            'avg_hours' => $this->avgHours,
            'resolution_rate' => $this->resolutionRate,
        ];
    }
}
