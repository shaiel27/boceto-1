<?php
declare(strict_types=1);

final class AuditService {
    private AuditLog $auditLog;

    public function __construct(AuditLog $auditLog) {
        $this->auditLog = $auditLog;
    }

    public function log(string $action, array $context = []): void {
        $data = [
            'user_id'     => $context['user_id'] ?? ($_SERVER['AUTH_USER_ID'] ?? null),
            'email'       => $context['email'] ?? ($_SERVER['AUTH_USER_EMAIL'] ?? null),
            'action'      => $action,
            'entity_type' => $context['entity_type'] ?? null,
            'entity_id'   => $context['entity_id'] ?? null,
            'description' => $context['description'] ?? null,
            'data'        => $context['data'] ?? null,
            'severity'    => $context['severity'] ?? 'info',
            'success'     => $context['success'] ?? 1,
            'ip_address'  => $context['ip_address'] ?? ($_SERVER['REMOTE_ADDR'] ?? null),
            'user_agent'  => $context['user_agent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? null),
        ];

        $this->auditLog->create($data);
    }

    public function logLogin(string $email, bool $success, ?string $reason = null): void {
        $this->log('login', [
            'email'       => $email,
            'description' => $reason ? "Intento de inicio de sesión fallido: $reason" : "Inicio de sesión exitoso",
            'severity'    => $success ? 'info' : 'warning',
            'success'     => $success ? 1 : 0,
            'data'        => $reason ? ['reason' => $reason] : null,
        ]);
    }

    public function logLogout(int $userId, string $email): void {
        $this->log('logout', [
            'user_id'     => $userId,
            'email'       => $email,
            'description' => 'Cierre de sesión',
        ]);
    }

    public function logTicketAction(string $action, int $ticketId, string $description, array $extra = []): void {
        $this->log($action, array_merge([
            'entity_type' => 'Ticket',
            'entity_id'   => $ticketId,
            'description' => $description,
        ], $extra));
    }

    public function logUserAction(string $action, int $userId, string $description, string $severity = 'info'): void {
        $this->log($action, [
            'entity_type' => 'User',
            'entity_id'   => $userId,
            'description' => $description,
            'severity'    => $severity,
        ]);
    }

    public function logOfficeAction(string $action, int $officeId, string $description, string $severity = 'info'): void {
        $this->log($action, [
            'entity_type' => 'Office',
            'entity_id'   => $officeId,
            'description' => $description,
            'severity'    => $severity,
        ]);
    }

    public function logAssignment(int $ticketId, int $technicianId, string $technicianName, ?int $assignedBy, string $method = 'manual'): void {
        $this->log('assign_technician', [
            'entity_type' => 'Ticket',
            'entity_id'   => $ticketId,
            'description' => $assignedBy
                ? "Técnico {$technicianName} asignado al ticket #{$ticketId}"
                : "Técnico {$technicianName} asignado automáticamente al ticket #{$ticketId}",
            'data'        => [
                'technician_id'   => $technicianId,
                'technician_name' => $technicianName,
                'assigned_by'     => $assignedBy,
                'method'          => $method,
            ],
        ]);
    }
}
