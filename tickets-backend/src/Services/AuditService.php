<?php

namespace App\Services;

use App\Core\Database;
use PDO;

class AuditService
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function logUserAction(int $userId, string $action, array $data = [], ?string $ip = null): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO audit_logs (user_id, action, data, ip_address, created_at) 
            VALUES (:user_id, :action, :data, :ip_address, NOW())
        ");
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'data' => json_encode($data),
            'ip_address' => $ip ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
        ]);
    }

    public function logTicketAction(int $ticketId, int $userId, string $action, array $data = []): void
    {
        $this->logUserAction($userId, "ticket_{$action}", array_merge($data, ['ticket_id' => $ticketId]));
    }

    public function logLoginAttempt(string $email, bool $success, ?string $ip = null): void
    {
        $action = $success ? 'login_success' : 'login_failed';
        
        $stmt = $this->db->prepare("
            INSERT INTO audit_logs (email, action, success, ip_address, created_at) 
            VALUES (:email, :action, :success, :ip_address, NOW())
        ");
        $stmt->execute([
            'email' => $email,
            'action' => $action,
            'success' => $success ? 1 : 0,
            'ip_address' => $ip ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
        ]);
    }

    public function logSystemAction(string $action, array $data = []): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO audit_logs (action, data, created_at) 
            VALUES (:action, :data, NOW())
        ");
        $stmt->execute([
            'action' => $action,
            'data' => json_encode($data),
        ]);
    }

    public function getUserAuditLog(int $userId, int $limit = 100): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM audit_logs 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC 
            LIMIT :limit
        ");
        $stmt->execute(['user_id' => $userId, 'limit' => $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTicketAuditLog(int $ticketId): array
    {
        $stmt = $this->db->prepare("
            SELECT al.*, u.Email 
            FROM audit_logs al
            LEFT JOIN Users u ON al.user_id = u.ID_Users
            WHERE al.data LIKE :ticket_id_pattern
            ORDER BY al.created_at DESC
        ");
        $stmt->execute(['ticket_id_pattern' => "%\"ticket_id\":{$ticketId}%"]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFailedLoginAttempts(string $email, int $hours = 24): array
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as attempts, MAX(created_at) as last_attempt
            FROM audit_logs 
            WHERE email = :email 
            AND action = 'login_failed'
            AND created_at >= DATE_SUB(NOW(), INTERVAL :hours HOUR)
        ");
        $stmt->execute(['email' => $email, 'hours' => $hours]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getSystemActivity(int $limit = 50): array
    {
        $stmt = $this->db->prepare("
            SELECT al.*, u.Email 
            FROM audit_logs al
            LEFT JOIN Users u ON al.user_id = u.ID_Users
            ORDER BY al.created_at DESC 
            LIMIT :limit
        ");
        $stmt->execute(['limit' => $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function cleanupOldLogs(int $days = 90): int
    {
        $stmt = $this->db->prepare("
            DELETE FROM audit_logs 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)
        ");
        $stmt->execute(['days' => $days]);
        return $stmt->rowCount();
    }
}
