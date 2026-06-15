<?php
declare(strict_types=1);

final readonly class DateRangeDTO
{
    private const DEFAULT_START = '1970-01-01';

    public string $start;
    public string $end;
    public string $startDate;
    public string $endDate;

    public function __construct(
        ?string $startDate = null,
        ?string $endDate = null,
    ) {
        $this->startDate = $startDate ?? self::DEFAULT_START;
        $this->endDate = $endDate ?? date('Y-m-d');

        if ($this->startDate > $this->endDate) {
            [$this->startDate, $this->endDate] = [$this->endDate, $this->startDate];
        }

        $this->start = $this->startDate . ' 00:00:00';
        $this->end = $this->endDate . ' 23:59:59';
    }

    public static function fromRequest(array $params): self
    {
        $start = null;
        $end = null;

        if (!empty($params['start_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$params['start_date'])) {
            $start = (string)$params['start_date'];
        }
        if (!empty($params['end_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$params['end_date'])) {
            $end = (string)$params['end_date'];
        }

        return new self(startDate: $start, endDate: $end);
    }

    public function toArray(): array
    {
        return [
            'start' => $this->start,
            'end' => $this->end,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
        ];
    }
}
