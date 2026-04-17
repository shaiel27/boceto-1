<?php

namespace App\Services;

use App\Core\Database;
use PDO;

class SLAService
{
    private PDO $db;
    private array $slaRules = [
        'Alta' => 4,    // 4 horas
        'Media' => 24,  // 24 horas
        'Baja' => 72,   // 72 horas
    ];

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function calculateDeadline(string $priority, string $createdAt): string
    {
        $hours = $this->slaRules[$priority] ?? 24;
        $deadline = date('Y-m-d H:i:s', strtotime($createdAt . " + {$hours} hours"));
        return $deadline;
    }

    public function getRemainingHours(string $priority, string $createdAt): float
    {
        $deadline = $this->calculateDeadline($priority, $createdAt);
        $now = new \DateTime();
        $deadlineTime = new \DateTime($deadline);
        
        if ($deadlineTime <= $now) {
            return 0;
        }
        
        $interval = $now->diff($deadlineTime);
        return $interval->h + ($interval->days * 24);
    }

    public function isBreached(string $priority, string $createdAt): bool
    {
        return $this->getRemainingHours($priority, $createdAt) <= 0;
    }

    public function getTicketsNearDeadline(int $hoursThreshold = 2): array
    {
        $stmt = $this->db->prepare("
            SELECT 
                sr.ID_Service_Request,
                sr.Ticket_Code,
                sr.Subject,
                sr.System_Priority,
                sr.Status,
                sr.Created_at,
                o.Name_Office,
                TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) as hours_elapsed
            FROM Service_Request sr
            JOIN Office o ON sr.Fk_Office = o.ID_Office
            WHERE sr.Status NOT IN ('Resuelto', 'Cerrado')
            AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL 72 HOUR)
            HAVING hours_elapsed >= (
                CASE sr.System_Priority
                    WHEN 'Alta' THEN 4 - :threshold
                    WHEN 'Media' THEN 24 - :threshold
                    WHEN 'Baja' THEN 72 - :threshold
                    ELSE 24 - :threshold
                END
            )
            ORDER BY 
                CASE sr.System_Priority
                    WHEN 'Alta' THEN 1
                    WHEN 'Media' THEN 2
                    WHEN 'Baja' THEN 3
                END,
                sr.Created_at ASC
        ");
        $stmt->execute(['threshold' => $hoursThreshold]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBreachedTickets(): array
    {
        $stmt = $this->db->prepare("
            SELECT 
                sr.ID_Service_Request,
                sr.Ticket_Code,
                sr.Subject,
                sr.System_Priority,
                sr.Status,
                sr.Created_at,
                o.Name_Office,
                TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) as hours_elapsed,
                CASE sr.System_Priority
                    WHEN 'Alta' THEN 4
                    WHEN 'Media' THEN 24
                    WHEN 'Baja' THEN 72
                    ELSE 24
                END - TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) as hours_overdue
            FROM Service_Request sr
            JOIN Office o ON sr.Fk_Office = o.ID_Office
            WHERE sr.Status NOT IN ('Resuelto', 'Cerrado')
            AND (
                (sr.System_Priority = 'Alta' AND TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) > 4)
                OR (sr.System_Priority = 'Media' AND TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) > 24)
                OR (sr.System_Priority = 'Baja' AND TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) > 72)
            )
            ORDER BY hours_overdue DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSLAStatistics(): array
    {
        $stmt = $this->db->query("
            SELECT 
                sr.System_Priority,
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN sr.Status = 'Resuelto' THEN 1 END) as resolved_tickets,
                COUNT(CASE WHEN sr.Status = 'Resuelto' 
                    AND TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) <= 
                    CASE sr.System_Priority
                        WHEN 'Alta' THEN 4
                        WHEN 'Media' THEN 24
                        WHEN 'Baja' THEN 72
                        ELSE 24
                    END THEN 1 END) as met_sla,
                AVG(CASE WHEN sr.Status = 'Resuelto' 
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                    END) as avg_resolution_hours
            FROM Service_Request sr
            WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY sr.System_Priority
        ");
        
        $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($stats as &$stat) {
            $stat['sla_compliance_rate'] = $stat['resolved_tickets'] > 0 
                ? round(($stat['met_sla'] / $stat['resolved_tickets']) * 100, 2)
                : 0;
        }
        
        return $stats;
    }

    public function updateSLARules(array $rules): void
    {
        $this->slaRules = $rules;
    }

    public function getSLARules(): array
    {
        return $this->slaRules;
    }

    public function checkAndNotifyNearDeadline(): array
    {
        $nearDeadline = $this->getTicketsNearDeadline();
        $notifications = [];

        foreach ($nearDeadline as $ticket) {
            $remainingHours = $this->getRemainingHours($ticket['System_Priority'], $ticket['Created_at']);
            
            $notifications[] = [
                'ticket_id' => $ticket['ID_Service_Request'],
                'ticket_code' => $ticket['Ticket_Code'],
                'subject' => $ticket['Subject'],
                'priority' => $ticket['System_Priority'],
                'office' => $ticket['Name_Office'],
                'remaining_hours' => $remainingHours,
                'status' => $ticket['Status'],
            ];
        }

        return $notifications;
    }
}
