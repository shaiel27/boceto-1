<?php
declare(strict_types=1);

final class ResponseTimeDTO
{
    public string $service;
    public int $total;
    public int $avgResolutionMin;
    public int $minResolutionMin;
    public int $maxResolutionMin;
    public int $resolvedWithin4h;
    public int $resolvedWithin24h;

    public function __construct(
        string $service,
        int $total,
        int $avgResolutionMin,
        int $minResolutionMin,
        int $maxResolutionMin,
        int $resolvedWithin4h,
        int $resolvedWithin24h,
    ) {
        $this->service = $service;
        $this->total = $total;
        $this->avgResolutionMin = $avgResolutionMin;
        $this->minResolutionMin = $minResolutionMin;
        $this->maxResolutionMin = $maxResolutionMin;
        $this->resolvedWithin4h = $resolvedWithin4h;
        $this->resolvedWithin24h = $resolvedWithin24h;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (string)($data['service'] ?? ''),
            (int)($data['total'] ?? 0),
            (int)($data['avg_resolution_min'] ?? 0),
            (int)($data['min_resolution_min'] ?? 0),
            (int)($data['max_resolution_min'] ?? 0),
            (int)($data['resolved_within_4h'] ?? 0),
            (int)($data['resolved_within_24h'] ?? 0),
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
            'avg_resolution_min' => $this->avgResolutionMin,
            'min_resolution_min' => $this->minResolutionMin,
            'max_resolution_min' => $this->maxResolutionMin,
            'resolved_within_4h' => $this->resolvedWithin4h,
            'resolved_within_24h' => $this->resolvedWithin24h,
        ];
    }
}
