<?php
declare(strict_types=1);

final class GeneralMonthlyDTO
{
    public string $month;
    public int $total;
    public int $pending;
    public int $inProgress;
    public int $resolved;
    public int $altaCount;
    public float $avgHours;

    public function __construct(
        string $month,
        int $total,
        int $pending,
        int $inProgress,
        int $resolved,
        int $altaCount,
        float $avgHours,
    ) {
        $this->month = $month;
        $this->total = $total;
        $this->pending = $pending;
        $this->inProgress = $inProgress;
        $this->resolved = $resolved;
        $this->altaCount = $altaCount;
        $this->avgHours = $avgHours;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (string)($data['month'] ?? ''),
            (int)($data['total'] ?? 0),
            (int)($data['pending'] ?? 0),
            (int)($data['in_progress'] ?? 0),
            (int)($data['resolved'] ?? 0),
            (int)($data['alta_count'] ?? 0),
            (float)($data['avg_hours'] ?? 0.0),
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
