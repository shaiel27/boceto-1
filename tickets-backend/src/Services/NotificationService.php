<?php

namespace App\Services;

use App\Core\Database;
use PDO;

class NotificationService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function sendTicketCreatedNotification(int $ticketId, int $userId, string $ticketSubject): void
    {
        $this->createNotification(
            $userId,
            'Nuevo Ticket Creado',
            "Se ha creado un nuevo ticket: {$ticketSubject}",
            'ticket_created',
            ['ticket_id' => $ticketId]
        );

        $this->notifyAdmins($ticketId, $ticketSubject, 'ticket_created');
    }

    public function sendTicketAssignedNotification(int $ticketId, array $technicianIds, string $ticketSubject): void
    {
        foreach ($technicianIds as $technicianId) {
            $this->createNotification(
                $technicianId,
                'Ticket Asignado',
                "Se te ha asignado el ticket: {$ticketSubject}",
                'ticket_assigned',
                ['ticket_id' => $ticketId]
            );
        }
    }

    public function sendTicketStatusChangedNotification(int $ticketId, string $oldStatus, string $newStatus, int $userId): void
    {
        $this->createNotification(
            $userId,
            'Estado de Ticket Cambiado',
            "El ticket cambió de {$oldStatus} a {$newStatus}",
            'ticket_status_changed',
            ['ticket_id' => $ticketId, 'old_status' => $oldStatus, 'new_status' => $newStatus]
        );
    }

    public function sendSLAWarningNotification(int $ticketId, string $ticketSubject, int $hoursRemaining): void
    {
        $this->createNotification(
            null,
            'Alerta SLA',
            "Ticket {$ticketSubject} vence en {$hoursRemaining} horas",
            'sla_warning',
            ['ticket_id' => $ticketId, 'hours_remaining' => $hoursRemaining]
        );

        $this->notifyAdmins($ticketId, $ticketSubject, 'sla_warning');
    }

    public function getUnreadNotifications(int $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM notifications 
            WHERE (user_id = :user_id OR user_id IS NULL) 
            AND read_at IS NULL 
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead(int $notificationId, int $userId): bool
    {
        $stmt = $this->db->prepare("
            UPDATE notifications 
            SET read_at = NOW() 
            WHERE id = :id AND user_id = :user_id
        ");
        return $stmt->execute(['id' => $notificationId, 'user_id' => $userId]);
    }

    public function markAllAsRead(int $userId): bool
    {
        $stmt = $this->db->prepare("
            UPDATE notifications 
            SET read_at = NOW() 
            WHERE user_id = :user_id AND read_at IS NULL
        ");
        return $stmt->execute(['user_id' => $userId]);
    }

    private function createNotification(?int $userId, string $title, string $message, string $type, array $data = []): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO notifications (user_id, title, message, type, data, created_at) 
            VALUES (:user_id, :title, :message, :type, :data, NOW())
        ");
        $stmt->execute([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => json_encode($data),
        ]);
    }

    private function notifyAdmins(int $ticketId, string $ticketSubject, string $type): void
    {
        $stmt = $this->db->prepare("
            SELECT u.ID_Users FROM Users u 
            JOIN Role r ON u.Fk_Role = r.ID_Role 
            WHERE r.Role = 'Admin'
        ");
        $stmt->execute();
        $adminIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($adminIds as $adminId) {
            $this->createNotification(
                (int)$adminId,
                'Notificación de Sistema',
                "Actividad en ticket: {$ticketSubject}",
                $type,
                ['ticket_id' => $ticketId]
            );
        }
    }
}
