<?php
declare(strict_types=1);

final readonly class ServiceReportDTO
{
    public function __construct(
        public string $service,
        public int $total,
        public int $resolved,
        public int $inProgress,
        public int $pending,
        public float $avgHours,
        public float $resolutionRate,
    ) {}

    public static function fromArray(array $data): self
    {
        $total = (int)($data['total'] ?? 0);
        $resolved = (int)($data['resolved'] ?? 0);

        return new self(
            service: (string)($data['service'] ?? ''),
            total: $total,
            resolved: $resolved,
            inProgress: (int)($data['in_progress'] ?? 0),
            pending: (int)($data['pending'] ?? 0),
            avgHours: (float)($data['avg_hours'] ?? 0.0),
            resolutionRate: $total > 0 ? round($resolved * 100.0 / $total, 1) : 0.0,
        );
    }

    public static function collection(array $data): array
    {
        return array_map(fn(array $row): self => self::fromArray($row), $data);
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
