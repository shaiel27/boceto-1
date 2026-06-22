<?php

declare(strict_types=1);

use App\DTO\NotificationDTO;

final class NotificationService
{
    private \PDO $db;
    private \App\Models\Notification $notificationModel;

    public function __construct(\PDO $db, \App\Models\Notification $notificationModel)
    {
        $this->db = $db;
        $this->notificationModel = $notificationModel;
    }

    public function createTicketAssignmentNotification(
        int $requesterId, int $ticketId, string $technicianName,
        string $serviceName, string $officeName, string $priority
    ): bool {
        $dto = new NotificationDTO(
            'ticket_assignment',
            '¡Ticket Creado y Técnico Asignado!',
            "Técnico: {$technicianName}\nServicio: {$serviceName}\nOficina: {$officeName}\nPrioridad: {$priority}",
            $requesterId,
            $ticketId,
            ['technician_name' => $technicianName, 'service_name' => $serviceName, 'office_name' => $officeName, 'priority' => $priority]
        );
        return $this->notificationModel->create($dto);
    }

    public function createTicketCreatedNotification(
        int $requesterId, int $ticketId, string $serviceName, string $officeName, string $priority
    ): bool {
        $dto = new NotificationDTO(
            'ticket_created',
            '¡Ticket Creado Exitosamente!',
            "Servicio: {$serviceName}\nOficina: {$officeName}\nPrioridad: {$priority}\n\nPendiente de asignación de técnico",
            $requesterId,
            $ticketId,
            ['service_name' => $serviceName, 'office_name' => $officeName, 'priority' => $priority]
        );
        return $this->notificationModel->create($dto);
    }

    public function createTicketVerificationNotification(
        int $requesterId, int $ticketId, string $subject
    ): bool {
        $dto = new NotificationDTO(
            'ticket_verification',
            'Ticket Pendiente de Verificación',
            "Ticket #{$ticketId}: {$subject}\n\nEl ticket fue cerrado y requiere tu verificación.",
            $requesterId,
            $ticketId,
            ['ticket_id' => $ticketId, 'subject' => $subject]
        );
        return $this->notificationModel->create($dto);
    }

    public function getUserNotifications(int $userId, int $limit = 50, int $offset = 0): array
    {
        return $this->notificationModel->getByUser($userId, $limit, $offset);
    }

    public function markAsRead(int $notificationId, int $userId): bool
    {
        return $this->notificationModel->markAsRead($notificationId, $userId);
    }

    public function getUnreadCount(int $userId): int
    {
        return $this->notificationModel->getUnreadCount($userId);
    }

    private function getAdminUserIds(): array
    {
        try {
            $query = "SELECT ID_Users FROM Users WHERE Fk_Role = 1 AND COALESCE(is_system_user, 0) = 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            return $results ?: [];
        } catch (\PDOException $e) {
            error_log("Error getting admin user IDs: " . $e->getMessage());
            return [];
        }
    }

    public function createAdminTicketNotification(
        int $ticketId, ?string $technicianName, string $serviceName,
        string $officeName, string $priority
    ): bool {
        $adminIds = $this->getAdminUserIds();
        if (empty($adminIds)) {
            error_log("No admin users found to notify");
            return false;
        }
        $success = true;
        foreach ($adminIds as $adminId) {
            $technicianInfo = $technicianName ? "Técnico: {$technicianName}" : "Sin técnico asignado";
            $dto = new NotificationDTO(
                'ticket_created_admin',
                'Nuevo Ticket Creado',
                "Ticket #{$ticketId}\n{$technicianInfo}\nServicio: {$serviceName}\nOficina: {$officeName}\nPrioridad: {$priority}",
                $adminId,
                $ticketId,
                ['ticket_id' => $ticketId, 'technician_name' => $technicianName, 'service_name' => $serviceName, 'office_name' => $officeName, 'priority' => $priority]
            );
            if (!$this->notificationModel->create($dto)) {
                error_log("Failed to create notification for admin {$adminId}");
                $success = false;
            }
        }
        return $success;
    }

    public function createAssistanceRequestNotification(
        int $ticketId, string $ticketCode, string $ticketSubject,
        string $technicianName, int $requestId, bool $isRenotification = false
    ): bool {
        $adminIds = $this->getAdminUserIds();
        if (empty($adminIds)) return false;
        $prefix = $isRenotification ? '⚠️ RECORDATORIO: ' : '🚨 ';
        $title = $prefix . 'Solicitud de Asistencia' . ($isRenotification ? ' (pendiente)' : '');
        $message = "Técnico: {$technicianName}\nTicket: {$ticketCode}\nAsunto: {$ticketSubject}\n\nSe necesita asignar un técnico de apoyo urgente.";
        $success = true;
        foreach ($adminIds as $adminId) {
            $dto = new NotificationDTO(
                'assistance_request', $title, $message, (int)$adminId, $ticketId,
                ['request_id' => $requestId, 'technician_name' => $technicianName, 'ticket_code' => $ticketCode, 'ticket_subject' => $ticketSubject, 'is_renotification' => $isRenotification, 'notification_count' => null]
            );
            if (!$this->notificationModel->create($dto)) $success = false;
        }
        return $success;
    }

    public function createAssistanceAssignedNotification(
        int $technicianUserId, int $ticketId, string $ticketCode, string $adminName
    ): bool {
        $dto = new NotificationDTO(
            'assistance_assigned',
            '✅ Asistencia Asignada',
            "Tu solicitud de asistencia para el ticket {$ticketCode} fue atendida por {$adminName}.",
            $technicianUserId, $ticketId,
            ['ticket_code' => $ticketCode, 'admin_name' => $adminName]
        );
        return $this->notificationModel->create($dto);
    }

    public function createAssistanceRejectedNotification(
        int $technicianUserId, int $ticketId, string $ticketCode
    ): bool {
        $dto = new NotificationDTO(
            'assistance_rejected',
            '❌ Solicitud de Asistencia Rechazada',
            "Tu solicitud de asistencia para el ticket {$ticketCode} fue rechazada.",
            $technicianUserId, $ticketId,
            ['ticket_code' => $ticketCode]
        );
        return $this->notificationModel->create($dto);
    }

    public function createTechnicianAssignedNotification(
        int $technicianUserId, int $ticketId, string $ticketCode, string $subject,
        string $officeName, string $serviceName, string $priority
    ): bool {
        $dto = new NotificationDTO(
            'technician_assigned',
            'Nuevo Ticket Asignado',
            "Ticket: {$subject}\nOficina: {$officeName}\nServicio: {$serviceName}\nPrioridad: {$priority}",
            $technicianUserId, $ticketId,
            ['ticket_code' => $ticketCode ?? "#{$ticketId}", 'subject' => $subject, 'office_name' => $officeName, 'service_name' => $serviceName, 'priority' => $priority]
        );
        return $this->notificationModel->create($dto);
    }
}
