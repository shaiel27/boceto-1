<?php
declare(strict_types=1);

final readonly class WeeklyReportDTO
{
    /** @var WeeklyDailyDTO[] */
    public array $daily;

    /** @var WeeklyTechnicianDTO[] */
    public array $technicians;

    public function __construct(
        public string $week,
        public string $startDate,
        public string $endDate,
        array $daily,
        array $technicians,
    ) {
        $this->daily = $daily;
        $this->technicians = $technicians;
    }

    public static function fromData(string $week, string $startDate, string $endDate, array $dailyRows, array $techRows): self
    {
        $daily = array_map(fn(array $row): WeeklyDailyDTO => WeeklyDailyDTO::fromArray($row), $dailyRows);
        $technicians = array_map(fn(array $row): WeeklyTechnicianDTO => WeeklyTechnicianDTO::fromArray($row), $techRows);

        return new self(
            week: $week,
            startDate: $startDate,
            endDate: $endDate,
            daily: $daily,
            technicians: $technicians,
        );
    }

    public function toArray(): array
    {
        return [
            'week' => $this->week,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'daily' => array_map(fn(WeeklyDailyDTO $d): array => $d->toArray(), $this->daily),
            'technicians' => array_map(fn(WeeklyTechnicianDTO $t): array => $t->toArray(), $this->technicians),
        ];
    }
}

final readonly class WeeklyDailyDTO
{
    public function __construct(
        public string $dayName,
        public string $date,
        public int $total,
        public int $resolved,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            dayName: (string)($data['day_name'] ?? ''),
            date: (string)($data['date'] ?? ''),
            total: (int)($data['total'] ?? 0),
            resolved: (int)($data['resolved'] ?? 0),
        );
    }

    public function toArray(): array
    {
        return [
            'day_name' => $this->dayName,
            'date' => $this->date,
            'total' => $this->total,
            'resolved' => $this->resolved,
        ];
    }
}

final readonly class WeeklyTechnicianDTO
{
    public function __construct(
        public string $technician,
        public int $assigned,
        public int $resolved,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            technician: (string)($data['technician'] ?? ''),
            assigned: (int)($data['assigned'] ?? 0),
            resolved: (int)($data['resolved'] ?? 0),
        );
    }

    public function toArray(): array
    {
        return [
            'technician' => $this->technician,
            'assigned' => $this->assigned,
            'resolved' => $this->resolved,
        ];
    }
}
