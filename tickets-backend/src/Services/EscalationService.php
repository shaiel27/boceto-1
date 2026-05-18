<?php

declare(strict_types=1);

namespace App\Services;

use PDO;

final class EscalationService
{
    private PDO $db;
    private $notificationService;

    private const PRIORITY_HOURS = [
        'Critica' => 1,
        'Alta' => 4,
        'Media' => 12,
        'Baja' => 24,
    ];

    public function __construct(PDO $db, $notificationService = null)
    {
        $this->db = $db;
        $this->notificationService = $notificationService;
    }

    /**
     * Check and process pending tickets that have exceeded their time threshold
     * Returns array with tickets that need attention and escalation actions taken
     *
     * @return array{ticked_checked: int, alerts_created: int, escalated: array}
     */
    public function processPendingTickets(): array
    {
        $ticketsChecked = 0;
        $alertsCreated = 0;
        $escalatedTickets = [];

        try {
            $pendingTickets = $this->getPendingTicketsWithHours();

            foreach ($pendingTickets as $ticket) {
                $ticketsChecked++;
                $priority = $ticket['System_Priority'] ?? 'Media';
                $hoursThreshold = self::PRIORITY_HOURS[$priority] ?? 12;
                $hoursPending = (int)$ticket['Hours_Pending'];

                if ($hoursPending >= $hoursThreshold) {
                    $alertCreated = $this->createAlertIfNeeded($ticket['ID_Service_Request'], $priority);

                    if ($alertCreated) {
                        $alertsCreated++;
                    }

                    if ($hoursPending >= ($hoursThreshold * 2)) {
                        $escalatedTickets[] = $this->escalateTicket($ticket);
                    }
                }
            }

            error_log("EscalationService: Checked {$ticketsChecked} pending tickets, created {$alertsCreated} alerts, escalated " . count($escalatedTickets) . " tickets");

        } catch (\PDOException $e) {
            error_log("EscalationService error: " . $e->getMessage());
        }

        return [
            'tickets_checked' => $ticketsChecked,
            'alerts_created' => $alertsCreated,
            'escalated' => $escalatedTickets,
        ];
    }

    /**
     * Get all pending tickets with hours pending calculated
     *
     * @return array<int, array<string, mixed>>
     */
    private function getPendingTicketsWithHours(): array
    {
        $query = "SELECT 
                    sr.ID_Service_Request,
                    sr.Ticket_Code,
                    sr.Subject,
                    sr.System_Priority,
                    sr.Created_at,
                    sr.Fk_TI_Service,
                    TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) as Hours_Pending,
                    ts.Type_Service
                  FROM Service_Request sr
                  LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                  WHERE sr.Status = 'Pendiente'
                  ORDER BY 
                    CASE sr.System_Priority
                        WHEN 'Critica' THEN 1
                        WHEN 'Alta' THEN 2
                        WHEN 'Media' THEN 3
                        WHEN 'Baja' THEN 4
                        ELSE 3
                    END,
                    sr.Created_at ASC";

        $stmt = $this->db->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Create alert for ticket if not already exists
     *
     * @param int $ticketId Ticket ID
     * @param string $priority Ticket priority
     * @return bool True if alert was created
     */
    private function createAlertIfNeeded(int $ticketId, string $priority): bool
    {
        $checkQuery = "SELECT ID_Alert FROM Pending_Ticket_Alerts 
                       WHERE Fk_Service_Request = ? AND Resolved_At IS NULL 
                       LIMIT 1";

        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindValue(1, $ticketId, \PDO::PARAM_INT);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            return false;
        }

        $alertType = match ($priority) {
            'Critica' => 'critical_pending',
            'Alta' => 'high_priority_pending',
            default => 'pending_review',
        };

        $insertQuery = "INSERT INTO Pending_Ticket_Alerts (Fk_Service_Request, Alert_Type, Created_At)
                        VALUES (?, ?, NOW())";

        $insertStmt = $this->db->prepare($insertQuery);
        $insertStmt->bindValue(1, $ticketId, \PDO::PARAM_INT);
        $insertStmt->bindValue(2, $alertType, \PDO::PARAM_STR);

        return $insertStmt->execute();
    }

    /**
     * Attempt to escalate a ticket by assigning to any available technician
     *
     * @param array<string, mixed> $ticket Ticket data
     * @return array{ticket_id: int, action: string, result: string}
     */
    private function escalateTicket(array $ticket): array
    {
        require_once __DIR__ . '/../models/Technician.php';

        $technicianModel = new \Technician($this->db);
        $serviceId = (int)$ticket['Fk_TI_Service'];

        $availableTechs = $technicianModel->getAvailableTechniciansByService($serviceId);

        if (!empty($availableTechs)) {
            $selectedTech = $availableTechs[0];
            $assigned = $technicianModel->assignToTicket(
                $ticket['ID_Service_Request'],
                $selectedTech['ID_Technicians'],
                null,
                true,
                true
            );

            if ($assigned) {
                $this->resolveAlert($ticket['ID_Service_Request'], 'auto_escalated');

                return [
                    'ticket_id' => $ticket['ID_Service_Request'],
                    'action' => 'auto_escalated',
                    'technician' => $selectedTech['First_Name'] . ' ' . $selectedTech['Last_Name'],
                    'result' => 'success',
                ];
            }
        }

        $relatedTechs = $technicianModel->getTechniciansFromRelatedServices($serviceId);

        if (!empty($relatedTechs)) {
            $selectedTech = $relatedTechs[0];
            $assigned = $technicianModel->assignToTicket(
                $ticket['ID_Service_Request'],
                $selectedTech['ID_Technicians'],
                null,
                true,
                true
            );

            if ($assigned) {
                $this->resolveAlert($ticket['ID_Service_Request'], 'cross_service_escalated');

                return [
                    'ticket_id' => $ticket['ID_Service_Request'],
                    'action' => 'cross_service_escalated',
                    'technician' => $selectedTech['First_Name'] . ' ' . $selectedTech['Last_Name'],
                    'service_id' => $selectedTech['Fk_TI_Service'],
                    'result' => 'success',
                ];
            }
        }

        return [
            'ticket_id' => $ticket['ID_Service_Request'],
            'action' => 'escalation_failed',
            'result' => 'no_technicians_available',
        ];
    }

    /**
     * Resolve an alert by marking it as resolved
     *
     * @param int $ticketId Ticket ID
     * @param string $resolution Resolution type
     */
    private function resolveAlert(int $ticketId, string $resolution): void
    {
        $query = "UPDATE Pending_Ticket_Alerts 
                  SET Resolved_At = NOW(), Resolution_Notes = ? 
                  WHERE Fk_Service_Request = ? AND Resolved_At IS NULL";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(1, $resolution, \PDO::PARAM_STR);
        $stmt->bindValue(2, $ticketId, \PDO::PARAM_INT);
        $stmt->execute();
    }

    /**
     * Get current escalation configuration
     *
     * @return array<string, array{hours_threshold: int, notify_admins: bool, auto_escalate: bool}>
     */
    public function getEscalationConfig(): array
    {
        $query = "SELECT Priority_Level, Hours_Threshold, Notify_Admins, Auto_Escalate 
                  FROM Escalation_Config";

        $stmt = $this->db->prepare($query);
        $stmt->execute();

        $config = [];
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $config[$row['Priority_Level']] = [
                'hours_threshold' => (int)$row['Hours_Threshold'],
                'notify_admins' => (bool)$row['Notify_Admins'],
                'auto_escalate' => (bool)$row['Auto_Escalate'],
            ];
        }

        return $config;
    }

    /**
     * Get pending alerts that haven't been resolved
     *
     * @return array<int, array>
     */
    public function getPendingAlerts(): array
    {
        $query = "SELECT pta.*, sr.Ticket_Code, sr.Subject, sr.System_Priority, 
                         TIMESTAMPDIFF(HOUR, pta.Created_At, NOW()) as Hours_Since_Alert
                  FROM Pending_Ticket_Alerts pta
                  JOIN Service_Request sr ON pta.Fk_Service_Request = sr.ID_Service_Request
                  WHERE pta.Resolved_At IS NULL
                  ORDER BY 
                    CASE sr.System_Priority
                        WHEN 'Critica' THEN 1
                        WHEN 'Alta' THEN 2
                        WHEN 'Media' THEN 3
                        WHEN 'Baja' THEN 4
                        ELSE 3
                    END,
                    pta.Created_At ASC";

        $stmt = $this->db->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get escalation history for reporting
     *
     * @param string|null $startDate Start date filter
     * @param string|null $endDate End date filter
     * @return array<int, array>
     */
    public function getEscalationHistory(?string $startDate = null, ?string $endDate = null): array
    {
        $query = "SELECT te.*, 
                         sr.Ticket_Code, sr.Subject, sr.System_Priority,
                         ts_orig.Type_Service as Original_Service,
                         ts_esc.Type_Service as Escalated_Service
                  FROM Ticket_Escalations te
                  JOIN Service_Request sr ON te.Fk_Service_Request = sr.ID_Service_Request
                  LEFT JOIN TI_Service ts_orig ON te.Original_Service_ID = ts_orig.ID_TI_Service
                  LEFT JOIN TI_Service ts_esc ON te.Escalated_Service_ID = ts_esc.ID_TI_Service
                  WHERE 1=1";

        $params = [];

        if ($startDate) {
            $query .= " AND DATE(te.Escalated_At) >= ?";
            $params[] = $startDate;
        }

        if ($endDate) {
            $query .= " AND DATE(te.Escalated_At) <= ?";
            $params[] = $endDate;
        }

        $query .= " ORDER BY te.Escalated_At DESC";

        $stmt = $this->db->prepare($query);
        foreach ($params as $index => $param) {
            $stmt->bindValue($index + 1, $param, \PDO::PARAM_STR);
        }
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}