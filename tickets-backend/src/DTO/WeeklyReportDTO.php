<?php
declare(strict_types=1);

final class WeeklyReportDTO
{
    public string $week;
    public string $startDate;
    public string $endDate;

    /** @var WeeklyDailyDTO[] */
    public array $daily;

    /** @var WeeklyTechnicianDTO[] */
    public array $technicians;

    public function __construct(
        string $week,
        string $startDate,
        string $endDate,
        array $daily,
        array $technicians,
    ) {
        $this->week = $week;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->daily = $daily;
        $this->technicians = $technicians;
    }

    public static function fromData(string $week, string $startDate, string $endDate, array $dailyRows, array $techRows): self
    {
        $daily = array_map(function(array $row): WeeklyDailyDTO {
            return WeeklyDailyDTO::fromArray($row);
        }, $dailyRows);
        $technicians = array_map(function(array $row): WeeklyTechnicianDTO {
            return WeeklyTechnicianDTO::fromArray($row);
        }, $techRows);

        return new self($week, $startDate, $endDate, $daily, $technicians);
    }

    public function toArray(): array
    {
        return [
            'week' => $this->week,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'daily' => array_map(function(WeeklyDailyDTO $d): array {
                return $d->toArray();
            }, $this->daily),
            'technicians' => array_map(function(WeeklyTechnicianDTO $t): array {
                return $t->toArray();
            }, $this->technicians),
        ];
    }
}

final class WeeklyDailyDTO
{
    public string $dayName;
    public string $date;
    public int $total;
    public int $resolved;

    public function __construct(
        string $dayName,
        string $date,
        int $total,
        int $resolved,
    ) {
        $this->dayName = $dayName;
        $this->date = $date;
        $this->total = $total;
        $this->resolved = $resolved;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (string)($data['day_name'] ?? ''),
            (string)($data['date'] ?? ''),
            (int)($data['total'] ?? 0),
            (int)($data['resolved'] ?? 0),
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

final class WeeklyTechnicianDTO
{
    public string $technician;
    public int $assigned;
    public int $resolved;

    public function __construct(
        string $technician,
        int $assigned,
        int $resolved,
    ) {
        $this->technician = $technician;
        $this->assigned = $assigned;
        $this->resolved = $resolved;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (string)($data['technician'] ?? ''),
            (int)($data['assigned'] ?? 0),
            (int)($data['resolved'] ?? 0),
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
