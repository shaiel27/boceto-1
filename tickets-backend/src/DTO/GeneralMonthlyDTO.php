<?php
declare(strict_types=1);

final readonly class GeneralMonthlyDTO
{
    public function __construct(
        public string $month,
        public int $total,
        public int $pending,
        public int $inProgress,
        public int $resolved,
        public int $altaCount,
        public float $avgHours,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            month: (string)($data['month'] ?? ''),
            total: (int)($data['total'] ?? 0),
            pending: (int)($data['pending'] ?? 0),
            inProgress: (int)($data['in_progress'] ?? 0),
            resolved: (int)($data['resolved'] ?? 0),
            altaCount: (int)($data['alta_count'] ?? 0),
            avgHours: (float)($data['avg_hours'] ?? 0.0),
        );
    }

    public static function collection(array $data): array
    {
        return array_map(fn(array $row): self => self::fromArray($row), $data);
    }

    public function toArray(): array
    {
        return [
            'month' => $this->month,
            'total' => $this->total,
            'pending' => $this->pending,
            'in_progress' => $this->inProgress,
            'resolved' => $this->resolved,
            'alta_count' => $this->altaCount,
            'avg_hours' => $this->avgHours,
        ];
    }
}
