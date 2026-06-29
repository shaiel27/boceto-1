<?php

declare(strict_types=1);

/**
 *  PARA CAMBIAR EL HORARIO:
 *  Editar únicamente el valor de CROSS_SERVICE_START_TIME (formato 'HH:MM' 24h).
 *  Ejemplo: '14:00' = 2:00 PM, '15:30' = 3:30 PM
 */
final class CrossServicePolicy
{
    /**
     * Hora (Caracas) a partir de la cual se activa la política.
     * Formato 'HH:MM' en 24 horas.
     *
     * @var string
     */
    public const CROSS_SERVICE_START_TIME = '14:00';

    /**
     * ID del servicio fuente — los técnicos de este servicio
     * pueden ser reasignados a tickets del servicio destino.
     *
     * @var int
     */
    public const SOURCE_SERVICE_ID = 1; // Redes

    /**
     * ID del servicio destino — los tickets de este servicio
     * pueden recibir técnicos del servicio fuente.
     *
     * @var int
     */
    public const TARGET_SERVICE_ID = 2; // Soporte

    /**
     * Indica si la política está activa según la hora actual.
     *
     * Compara la hora actual (Caracas) contra CROSS_SERVICE_START_TIME.
     * Si el formato de la constante es inválido, retorna false
     * y registra el error en el log.
     */
    public static function isActive(): bool
    {
        $timezone = new \DateTimeZone('America/Caracas');

        $now = new \DateTimeImmutable('now', $timezone);
        $threshold = \DateTimeImmutable::createFromFormat(
            'H:i',
            self::CROSS_SERVICE_START_TIME,
            $timezone,
        );

        if ($threshold === false) {
            error_log(sprintf(
                '[CrossServicePolicy] CROSS_SERVICE_START_TIME inválido: "%s". '
                . 'Se esperaba formato "HH:MM" en 24h. Política desactivada.',
                self::CROSS_SERVICE_START_TIME,
            ));
            return false;
        }

        return $now >= $threshold;
    }
}
