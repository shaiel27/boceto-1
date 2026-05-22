<?php

declare(strict_types=1);

namespace App\Enums;

class TicketPriority
{
    const CRITICAL = 'Critica';
    const HIGH = 'Alta';
    const MEDIUM = 'Media';
    const LOW = 'Baja';

    private const WEIGHTS = [
        'Critica' => 10,
        'Alta' => 5,
        'Media' => 2,
        'Baja' => 1,
    ];

    private const LABELS = [
        'Critica' => 'Crítica',
        'Alta' => 'Alta',
        'Media' => 'Media',
        'Baja' => 'Baja',
    ];

    private const ESCALATION_HOURS = [
        'Critica' => 1,
        'Alta' => 4,
        'Media' => 12,
        'Baja' => 24,
    ];

    public static function weight(string $priority): int
    {
        return self::WEIGHTS[$priority] ?? self::WEIGHTS[self::MEDIUM];
    }

    public static function label(string $priority): string
    {
        return self::LABELS[$priority] ?? $priority;
    }

    public static function fromString(string $value): string
    {
        $lower = strtolower($value);
        return match ($lower) {
            'critica', 'critical' => self::CRITICAL,
            'alta', 'high' => self::HIGH,
            'media', 'medium' => self::MEDIUM,
            'baja', 'low' => self::LOW,
            default => self::MEDIUM,
        };
    }

    public static function escalationHours(string $priority): int
    {
        return self::ESCALATION_HOURS[$priority] ?? self::ESCALATION_HOURS[self::MEDIUM];
    }
}