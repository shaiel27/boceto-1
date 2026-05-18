<?php

declare(strict_types=1);

namespace App\Enums;

enum TicketPriority: string
{
    case CRITICAL = 'Critica';
    case HIGH = 'Alta';
    case MEDIUM = 'Media';
    case LOW = 'Baja';

    public function weight(): int
    {
        return match ($this) {
            self::CRITICAL => 10,
            self::HIGH => 5,
            self::MEDIUM => 2,
            self::LOW => 1,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::CRITICAL => 'Crítica',
            self::HIGH => 'Alta',
            self::MEDIUM => 'Media',
            self::LOW => 'Baja',
        };
    }

    public static function fromString(string $value): self
    {
        return match (strtolower($value)) {
            'critica', 'critical' => self::CRITICAL,
            'alta', 'high' => self::HIGH,
            'media', 'medium' => self::MEDIUM,
            'baja', 'low' => self::LOW,
            default => self::MEDIUM,
        };
    }

    public function escalationHours(): int
    {
        return match ($this) {
            self::CRITICAL => 1,
            self::HIGH => 4,
            self::MEDIUM => 12,
            self::LOW => 24,
        };
    }
}