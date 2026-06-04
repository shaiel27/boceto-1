<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

final class ReportService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Parse date range from query params with validation.
     * Returns [start, end] as Y-m-d strings, defaulting to last 30 days.
     */
    public function parseDateRange(array $params): array
    {
        $end = date('Y-m-d');
        $start = date('Y-m-d', strtotime('-30 days'));

        if (!empty($params['start_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $params['start_date'])) {
            $start = $params['start_date'];
        }
        if (!empty($params['end_date']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $params['end_date'])) {
            $end = $params['end_date'];
        }
        // Ensure start <= end
        if ($start > $end) {
            [$start, $end] = [$end, $start];
        }

        return [
            'start' => $start . ' 00:00:00',
            'end'   => $end . ' 23:59:59',
            'start_date' => $start,
            'end_date'   => $end,
        ];
    }

    // ─── 1. GENERAL TICKETS REPORT ────────────────────────────────

    public function getGeneralReport(array $dates): array
    {
        $sql = "SELECT DATE_FORMAT(sr.Created_at, '%Y-%m') AS month, COUNT(*) AS total, "
            . "SUM(CASE WHEN sr.Status='Pendiente' THEN 1 ELSE 0 END) AS pending, "
            . "SUM(CASE WHEN sr.Status='En Proceso' THEN 1 ELSE 0 END) AS in_progress, "
            . "SUM(CASE WHEN sr.Status='Cerrado' THEN 1 ELSE 0 END) AS resolved, "
            . "SUM(CASE WHEN sr.System_Priority='Alta' THEN 1 ELSE 0 END) AS alta_count, "
            . "ROUND(AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)), 1) AS avg_hours "
        . "FROM Service_Request sr "
        . "WHERE sr.Created_at BETWEEN :start AND :end "
        . "GROUP BY DATE_FORMAT(sr.Created_at, '%Y-%m') "
        . "ORDER BY month DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':start' => $dates['start'], ':end' => $dates['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getGeneralSummary(array $dates): array
    {
        $sql = "SELECT COUNT(*) AS total, "
            . "SUM(CASE WHEN Status='Pendiente' THEN 1 ELSE 0 END) AS pending, "
            . "SUM(CASE WHEN Status='En Proceso' THEN 1 ELSE 0 END) AS in_progress, "
            . "SUM(CASE WHEN Status='Cerrado' THEN 1 ELSE 0 END) AS resolved, "
            . "SUM(CASE WHEN System_Priority='Alta' THEN 1 ELSE 0 END) AS alta_count, "
            . "ROUND(AVG(TIMESTAMPDIFF(HOUR, Created_at, Resolved_at)), 1) AS avg_hours, "
            . "ROUND(SUM(CASE WHEN Status='Cerrado' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS resolution_rate "
        . "FROM Service_Request "
        . "WHERE Created_at BETWEEN :start AND :end";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':start' => $dates['start'], ':end' => $dates['end']]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    // ─── 2. RESPONSE TIMES REPORT ─────────────────────────────────

    public function getResponseTimesReport(array $dates): array
    {
        $stmt = $this->db->prepare("
            SELECT
                ts.Type_Service AS service,
                COUNT(*) AS total,
                ROUND(AVG(CASE WHEN sr.Resolved_at IS NOT NULL
                    THEN TIMESTAMPDIFF(MINUTE, sr.Created_at, sr.Resolved_at) END), 0) AS avg_resolution_min,
                MIN(CASE WHEN sr.Resolved_at IS NOT NULL
                    THEN TIMESTAMPDIFF(MINUTE, sr.Created_at, sr.Resolved_at) END) AS min_resolution_min,
                MAX(CASE WHEN sr.Resolved_at IS NOT NULL
                    THEN TIMESTAMPDIFF(MINUTE, sr.Created_at, sr.Resolved_at) END) AS max_resolution_min,
                SUM(CASE WHEN sr.Resolved_at IS NOT NULL
                    AND TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) <= 4 THEN 1 ELSE 0 END) AS resolved_within_4h,
                SUM(CASE WHEN sr.Resolved_at IS NOT NULL
                    AND TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) <= 24 THEN 1 ELSE 0 END) AS resolved_within_24h
            FROM Service_Request sr
            INNER JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
            WHERE sr.Created_at BETWEEN :start AND :end
            GROUP BY ts.ID_TI_Service, ts.Type_Service
            ORDER BY total DESC
        ");
        $stmt->execute([':start' => $dates['start'], ':end' => $dates['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─── 3. OFFICE PERFORMANCE REPORT ─────────────────────────────

    public function getOfficeReport(array $dates): array
    {
        $stmt = $this->db->prepare("
            SELECT
                o.Name_Office AS office,
                COUNT(sr.ID_Service_Request) AS total,
                SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) AS resolved,
                SUM(CASE WHEN sr.Status = 'En Proceso' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN sr.Status = 'Pendiente' THEN 1 ELSE 0 END) AS pending,
                ROUND(AVG(CASE WHEN sr.Resolved_at IS NOT NULL
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) END), 1) AS avg_hours
            FROM Office o
            LEFT JOIN Service_Request sr ON o.ID_Office = sr.Fk_Office
                AND sr.Created_at BETWEEN :start AND :end
            GROUP BY o.ID_Office, o.Name_Office
            HAVING total > 0
            ORDER BY total DESC
        ");
        $stmt->execute([':start' => $dates['start'], ':end' => $dates['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─── 4. PRIORITY DISTRIBUTION REPORT ──────────────────────────

    public function getPriorityReport(array $dates): array
    {
        $stmt = $this->db->prepare("
            SELECT
                System_Priority AS priority,
                COUNT(*) AS total,
                SUM(CASE WHEN Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) AS resolved,
                SUM(CASE WHEN Status = 'En Proceso' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN Status = 'Pendiente' THEN 1 ELSE 0 END) AS pending,
                ROUND(AVG(CASE WHEN Resolved_at IS NOT NULL
                    THEN TIMESTAMPDIFF(HOUR, Created_at, Resolved_at) END), 1) AS avg_hours
            FROM Service_Request
            WHERE Created_at BETWEEN :start AND :end
            GROUP BY System_Priority
            ORDER BY
                CASE System_Priority
                    WHEN 'Alta' THEN 1 WHEN 'Media' THEN 2 WHEN 'Baja' THEN 3
                END
        ");
        $stmt->execute([':start' => $dates['start'], ':end' => $dates['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─── 5. TECHNICIAN WORKLOAD REPORT (existing, improved) ───────

    public function getTechnicianWorkload(array $dates): array
    {
        $stmt = $this->db->prepare("
            SELECT
                CONCAT(t.First_Name, ' ', t.Last_Name) AS technician,
                u.Email AS email,
                COUNT(tt.Fk_Service_Request) AS total_assigned,
                SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) AS resolved,
                SUM(CASE WHEN sr.Status = 'En Proceso' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN sr.Status = 'Pendiente' THEN 1 ELSE 0 END) AS pending,
                ROUND(AVG(CASE WHEN sr.Resolved_at IS NOT NULL
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) END), 1) AS avg_hours
            FROM Technicians t
            LEFT JOIN Users u ON t.Fk_Users = u.ID_Users
            LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
            LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                AND sr.Created_at BETWEEN :start AND :end
            GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, u.Email
            HAVING total_assigned > 0
            ORDER BY total_assigned DESC
        ");
        $stmt->execute([':start' => $dates['start'], ':end' => $dates['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ─── 6. WEEKLY REPORT (existing, improved) ────────────────────

    public function getWeeklyReport(string $week): array
    {
        // Parse ISO week: 2025-W22
        if (!preg_match('/^(\d{4})-W(\d{1,2})$/', $week, $m)) {
            return [];
        }
        $year = (int)$m[1];
        $weekNum = (int)$m[2];

        $dto = new DateTime();
        $dto->setISODate($year, $weekNum);
        $start = $dto->format('Y-m-d 00:00:00');
        $dto->modify('+6 days');
        $end = $dto->format('Y-m-d 23:59:59');

        $stmt = $this->db->prepare("
            SELECT
                DAYNAME(sr.Created_at) AS day_name,
                DATE(sr.Created_at) AS date,
                COUNT(*) AS total,
                SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) AS resolved
            FROM Service_Request sr
            WHERE sr.Created_at BETWEEN :start AND :end
              AND DAYOFWEEK(sr.Created_at) BETWEEN 2 AND 6
            GROUP BY DATE(sr.Created_at), DAYNAME(sr.Created_at)
            ORDER BY DATE(sr.Created_at)
        ");
        $stmt->execute([':start' => $start, ':end' => $end]);
        $dailyData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Per-technician
        $techStmt = $this->db->prepare("
            SELECT
                CONCAT(t.First_Name, ' ', t.Last_Name) AS technician,
                COUNT(tt.Fk_Service_Request) AS assigned,
                SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) AS resolved
            FROM Ticket_Technicians tt
            INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                AND sr.Created_at BETWEEN :start AND :end
            INNER JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            WHERE tt.Status = 'Activo' OR tt.Status = 'Finalizado'
            GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name
            ORDER BY assigned DESC
        ");
        $techStmt->execute([':start' => $start, ':end' => $end]);

        return [
            'week' => $week,
            'start_date' => $start,
            'end_date' => $end,
            'daily' => $dailyData,
            'technicians' => $techStmt->fetchAll(PDO::FETCH_ASSOC),
        ];
    }

    // ─── 7. SERVICE DISTRIBUTION REPORT ───────────────────────────

    public function getServiceReport(array $dates): array
    {
        $stmt = $this->db->prepare("
            SELECT
                ts.Type_Service AS service,
                COUNT(sr.ID_Service_Request) AS total,
                SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) AS resolved,
                SUM(CASE WHEN sr.Status = 'En Proceso' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN sr.Status = 'Pendiente' THEN 1 ELSE 0 END) AS pending,
                ROUND(AVG(CASE WHEN sr.Resolved_at IS NOT NULL
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) END), 1) AS avg_hours,
                ROUND(SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) AS resolution_rate
            FROM TI_Service ts
            LEFT JOIN Service_Request sr ON ts.ID_TI_Service = sr.Fk_TI_Service
                AND sr.Created_at BETWEEN :start AND :end
            GROUP BY ts.ID_TI_Service, ts.Type_Service
            ORDER BY total DESC
        ");
        $stmt->execute([':start' => $dates['start'], ':end' => $dates['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
