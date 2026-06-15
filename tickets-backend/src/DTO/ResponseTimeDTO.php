<?php
declare(strict_types=1);

final readonly class ResponseTimeDTO
{
    public function __construct(
        public string $service,
        public int $total,
        public int $avgResolutionMin,
        public int $minResolutionMin,
        public int $maxResolutionMin,
        public int $resolvedWithin4h,
        public int $resolvedWithin24h,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            service: (string)($data['service'] ?? ''),
            total: (int)($data['total'] ?? 0),
            avgResolutionMin: (int)($data['avg_resolution_min'] ?? 0),
            minResolutionMin: (int)($data['min_resolution_min'] ?? 0),
            maxResolutionMin: (int)($data['max_resolution_min'] ?? 0),
            resolvedWithin4h: (int)($data['resolved_within_4h'] ?? 0),
            resolvedWithin24h: (int)($data['resolved_within_24h'] ?? 0),
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
            'avg_resolution_min' => $this->avgResolutionMin,
            'min_resolution_min' => $this->minResolutionMin,
            'max_resolution_min' => $this->maxResolutionMin,
            'resolved_within_4h' => $this->resolvedWithin4h,
            'resolved_within_24h' => $this->resolvedWithin24h,
        ];
    }
}
