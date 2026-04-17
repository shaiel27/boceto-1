<?php

namespace App\Domain\Ticket;

class TicketStatus
{
    public const PENDIENTE = 'Pendiente';
    public const ASIGNADO = 'Asignado';
    public const EN_PROCESO = 'En Proceso';
    public const RESUELTO = 'Resuelto';
    public const CERRADO = 'Cerrado';

    private string $status;

    public function __construct(string $status)
    {
        $validStatuses = [
            self::PENDIENTE,
            self::ASIGNADO,
            self::EN_PROCESO,
            self::RESUELTO,
            self::CERRADO,
        ];

        if (!in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException("Estado inválido: {$status}");
        }

        $this->status = $status;
    }

    public function getValue(): string
    {
        return $this->status;
    }

    public static function isValid(string $status): bool
    {
        return in_array($status, [
            self::PENDIENTE,
            self::ASIGNADO,
            self::EN_PROCESO,
            self::RESUELTO,
            self::CERRADO,
        ]);
    }

    public function canTransitionTo(string $newStatus): bool
    {
        $transitions = [
            self::PENDIENTE => [self::ASIGNADO, self::CERRADO],
            self::ASIGNADO => [self::EN_PROCESO, self::CERRADO],
            self::EN_PROCESO => [self::RESUELTO, self::CERRADO],
            self::RESUELTO => [self::CERRADO],
            self::CERRADO => [],
        ];

        return in_array($newStatus, $transitions[$this->status] ?? []);
    }

    public function __toString(): string
    {
        return $this->status;
    }
}
