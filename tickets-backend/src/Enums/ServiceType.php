<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * IDs de los servicios del sistema.
 *
 * Centraliza las constantes de servicio para eliminar magic numbers
 * en la lógica de asignación, escalación y reportes.
 *
 * ═══════════════════════════════════════════════════════════════
 *  Si en la base de datos cambian los ID, se actualiza aquí.
 * ═══════════════════════════════════════════════════════════════
 */
final class ServiceType
{
    public const REDES = 1;
    public const SOPORTE = 2;
    public const PROGRAMACION = 3;

    /** @var array<int, string> */
    private const NAMES = [
        self::REDES => 'Redes',
        self::SOPORTE => 'Soporte',
        self::PROGRAMACION => 'Programación',
    ];

    public static function name(int $id): string
    {
        return self::NAMES[$id] ?? 'Desconocido';
    }
}
