<?php
declare(strict_types=1);

final readonly class GeneralSummaryDTO
{
    public function __construct(
        public int $total,
        public int $pending,
        public int $inProgress,
        public int $resolved,
        public int $altaCount,
        public float $avgHours,
        public float $resolutionRate,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            total: (int)($data['total'] ?? 0),
            pending: (int)($data['pending'] ?? 0),
            inProgress: (int)($data['in_progress'] ?? 0),
            resolved: (int)($data['resolved'] ?? 0),
            altaCount: (int)($data['alta_count'] ?? 0),
            avgHours: (float)($data['avg_hours'] ?? 0.0),
            resolutionRate: (float)($data['resolution_rate'] ?? 0.0),
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
