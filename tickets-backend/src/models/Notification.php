<?php

declare(strict_types=1);

namespace App\Models;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../DTO/NotificationDTO.php';

use App\DTO\NotificationDTO;

class Notification
{
    private \PDO $db;
    public ?int $ID_Notification;
    public ?int $Fk_User;
    public string $Type;
    public string $Title;
    public string $Message;
    public ?int $Fk_Service_Request;
    public bool $Is_Read;
    public ?string $Metadata;
    public string $Created_at;

    public function __construct(\PDO $db)
    {
        $this->db = $db;
        $this->ID_Notification = null;
        $this->Fk_User = null;
        $this->Type = '';
        $this->Title = '';
        $this->Message = '';
        $this->Fk_Service_Request = null;
        $this->Is_Read = false;
        $this->Metadata = null;
        $this->Created_at = '';
    }

    public function create(NotificationDTO $dto): bool
    {
        $query = "INSERT INTO Notifications (Fk_User, Type, Title, Message, Fk_Service_Request, Is_Read, Metadata, Created_at)
                  VALUES (:user_id, :type, :title, :message, :ticket_id, 0, :metadata, NOW())";

        try {
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $dto->userId, \PDO::PARAM_INT);
            $stmt->bindParam(':type', $dto->type, \PDO::PARAM_STR);
            $stmt->bindParam(':title', $dto->title, \PDO::PARAM_STR);
            $stmt->bindParam(':message', $dto->message, \PDO::PARAM_STR);
            $stmt->bindParam(':ticket_id', $dto->ticketId, \PDO::PARAM_INT);
            $metadataJson = json_encode($dto->metadata);
            $stmt->bindParam(':metadata', $metadataJson, \PDO::PARAM_STR);

            return $stmt->execute();
        } catch (\PDOException $e) {
            error_log("Error creating notification: " . $e->getMessage());
            return false;
        }
    }

    public function getByUser(int $userId, int $limit = 50, int $offset = 0): array
    {
        $query = "SELECT * FROM Notifications
                  WHERE Fk_User = :user_id
                  ORDER BY Created_at DESC
                  LIMIT :limit OFFSET :offset";

        try {
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $userId, \PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, \PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, \PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            error_log("Error getting notifications for user: " . $e->getMessage());
            return [];
        }
    }

    public function markAsRead(int $notificationId, int $userId): bool
    {
        $query = "UPDATE Notifications
                  SET Is_Read = 1
                  WHERE ID_Notification = :notification_id AND Fk_User = :user_id";

        try {
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':notification_id', $notificationId, \PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, \PDO::PARAM_INT);

            return $stmt->execute();
        } catch (\PDOException $e) {
            error_log("Error marking notification as read: " . $e->getMessage());
            return false;
        }
    }

    public function getUnreadCount(int $userId): int
    {
        $query = "SELECT COUNT(*) as count FROM Notifications
                  WHERE Fk_User = :user_id AND Is_Read = 0";

        try {
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $userId, \PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return (int)($result['count'] ?? 0);
        } catch (\PDOException $e) {
            error_log("Error getting unread count: " . $e->getMessage());
            return 0;
        }
    }
}
