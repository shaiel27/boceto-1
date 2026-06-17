<?php

declare(strict_types=1);

namespace App\Enums;

final class TicketStatus
{
    public const PENDIENTE = 'Pendiente';
    public const EN_PROCESO = 'En Proceso';
    public const PENDIENTE_VERIFICACION = 'Pendiente de Verificación';
    public const CERRADO = 'Cerrado';
    public const RESUELTO = 'Resuelto';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::PENDIENTE,
            self::EN_PROCESO,
            self::PENDIENTE_VERIFICACION,
            self::CERRADO,
            self::RESUELTO,
        ];
    }

    /**
     * @return list<string>
     */
    public static function closed(): array
    {
        return [self::CERRADO, self::RESUELTO];
    }

    /**
     * Whether the status represents a completed/closed ticket.
     */
    public static function isClosed(string $status): bool
    {
        return in_array($status, self::closed(), true);
    }

    /**
     * Whether the status transitions require releasing technicians.
     */
    public static function releasesTechnicians(string $status): bool
    {
        return self::isClosed($status);
    }

    /**
     * Normalize a status string to a valid status constant.
     */
    public static function normalize(string $value): ?string
    {
        $trimmed = trim($value);

        $map = [
            'pendiente' => self::PENDIENTE,
            'pendiente de verificación' => self::PENDIENTE_VERIFICACION,
            'pendiente de verificacion' => self::PENDIENTE_VERIFICACION,
            'en proceso' => self::EN_PROCESO,
            'enproceso' => self::EN_PROCESO,
            'cerrado' => self::CERRADO,
            'resuelto' => self::RESUELTO,
        ];

        return $map[strtolower($trimmed)] ?? null;
    }
}
