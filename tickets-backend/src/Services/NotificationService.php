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

    /**
     * Create a notification for ticket assignment
     */
    public function createTicketAssignmentNotification(
        int $requesterId,
        int $ticketId,
        string $technicianName,
        string $serviceName,
        string $officeName,
        string $priority
    ): bool {
        $dto = new NotificationDTO(
            type: 'ticket_assignment',
            title: '¡Ticket Creado y Técnico Asignado!',
            message: "Técnico: {$technicianName}\nServicio: {$serviceName}\nOficina: {$officeName}\nPrioridad: {$priority}",
            userId: $requesterId,
            ticketId: $ticketId,
            metadata: [
                'technician_name' => $technicianName,
                'service_name' => $serviceName,
                'office_name' => $officeName,
                'priority' => $priority
            ]
        );

        return $this->notificationModel->create($dto);
    }

    /**
     * Create a notification for ticket creation without assignment
     */
    public function createTicketCreatedNotification(
        int $requesterId,
        int $ticketId,
        string $serviceName,
        string $officeName,
        string $priority
    ): bool {
        $dto = new NotificationDTO(
            type: 'ticket_created',
            title: '¡Ticket Creado Exitosamente!',
            message: "Servicio: {$serviceName}\nOficina: {$officeName}\nPrioridad: {$priority}\n\nPendiente de asignación de técnico",
            userId: $requesterId,
            ticketId: $ticketId,
            metadata: [
                'service_name' => $serviceName,
                'office_name' => $officeName,
                'priority' => $priority
            ]
        );

        return $this->notificationModel->create($dto);
    }

    /**
     * Get notifications for a user
     */
    public function getUserNotifications(int $userId, int $limit = 50, int $offset = 0): array
    {
        return $this->notificationModel->getByUser($userId, $limit, $offset);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId, int $userId): bool
    {
        return $this->notificationModel->markAsRead($notificationId, $userId);
    }

    /**
     * Get unread notification count for user
     */
    public function getUnreadCount(int $userId): int
    {
        return $this->notificationModel->getUnreadCount($userId);
    }

    /**
     * Get all admin user IDs (role 1)
     */
    private function getAdminUserIds(): array
    {
        try {
            // Only include users marked as system users
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

    /**
     * Create notification for all admins when a ticket is created
     */
    public function createAdminTicketNotification(
        int $ticketId,
        ?string $technicianName,
        string $serviceName,
        string $officeName,
        string $priority
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
                type: 'ticket_created_admin',
                title: 'Nuevo Ticket Creado',
                message: "Ticket #{$ticketId}\n{$technicianInfo}\nServicio: {$serviceName}\nOficina: {$officeName}\nPrioridad: {$priority}",
                userId: $adminId,
                ticketId: $ticketId,
                metadata: [
                    'ticket_id' => $ticketId,
                    'technician_name' => $technicianName,
                    'service_name' => $serviceName,
                    'office_name' => $officeName,
                    'priority' => $priority
                ]
            );

            if (!$this->notificationModel->create($dto)) {
                error_log("Failed to create notification for admin {$adminId}");
                $success = false;
            }
        }

        return $success;
    }
}
