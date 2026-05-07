<?php
declare(strict_types=1);

namespace App\Controllers;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ServiceRequest.php';
require_once __DIR__ . '/../models/Technician.php';
require_once __DIR__ . '/../models/Office.php';
require_once __DIR__ . '/../models/TIService.php';
require_once __DIR__ . '/../DTO/DashboardStatsDTO.php';

use App\DTO\DashboardStatsDTO;

/**
 * Admin Dashboard Controller
 * 
 * Provides optimized endpoints for admin dashboard with real-time statistics
 * and efficient data aggregation using PHP-PRO principles.
 */
final class AdminDashboardController
{
    private \PDO $db;
    private \ServiceRequest $ticketModel;
    private \Technician $technicianModel;
    private \Office $officeModel;
    private \TIService $serviceModel;

    public function __construct(
        private \PDO $database,
    ) {
        $this->db = $database;
        $this->ticketModel = new \ServiceRequest($database);
        $this->technicianModel = new \Technician($database);
        $this->officeModel = new \Office($database);
        $this->serviceModel = new \TIService($database);
    }

    /**
     * Get comprehensive dashboard statistics
     * Optimized query with single database call for all metrics
     */
    public function getDashboardStats(): array
    {
        $query = "
            SELECT 
                COUNT(CASE WHEN sr.Status = 'Pendiente' THEN 1 END) as pending_count,
                COUNT(CASE WHEN sr.Status = 'En Proceso' THEN 1 END) as in_progress_count,
                COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved_count,
                COUNT(CASE WHEN sr.System_Priority = 'Crítica' THEN 1 END) as critical_count,
                COUNT(CASE WHEN sr.Created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as today_count,
                COUNT(CASE WHEN sr.Created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as week_count,
                AVG(CASE WHEN sr.Resolved_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                    ELSE NULL END) as avg_resolution_hours,
                COUNT(DISTINCT sr.Fk_Office) as active_offices,
                COUNT(DISTINCT t.ID_Technicians) as active_technicians
            FROM Service_Request sr
            LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            LEFT JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats = $stmt->fetch(\PDO::FETCH_ASSOC);

        return DashboardStatsDTO::fromDatabaseRow($stats)->toArray();
    }

    /**
     * Get tickets by priority distribution
     */
    public function getTicketsByPriority(): array
    {
        $query = "
            SELECT 
                System_Priority,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
            FROM Service_Request 
            WHERE Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY System_Priority 
            ORDER BY 
                CASE System_Priority 
                    WHEN 'Crítica' THEN 1 
                    WHEN 'Alta' THEN 2 
                    WHEN 'Media' THEN 3 
                    WHEN 'Baja' THEN 4 
                END
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get tickets by office distribution
     */
    public function getTicketsByOffice(): array
    {
        $query = "
            SELECT 
                o.ID_Office,
                o.Name_Office,
                COUNT(sr.ID_Service_Request) as ticket_count,
                COUNT(CASE WHEN sr.Status = 'Pendiente' THEN 1 END) as pending_count,
                COUNT(CASE WHEN sr.Status = 'En Proceso' THEN 1 END) as in_progress_count,
                COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved_count
            FROM Office o
            LEFT JOIN Service_Request sr ON o.ID_Office = sr.Fk_Office 
                AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY o.ID_Office, o.Name_Office
            HAVING ticket_count > 0
            ORDER BY ticket_count DESC
            LIMIT 10
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get executive summary with strategic KPIs
     * PHP-PRO: Optimized query for executive dashboard
     */
    public function getExecutiveSummary(): array
    {
        $query = "
            SELECT 
                -- Total tickets metrics
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved_tickets,
                COUNT(CASE WHEN sr.Status = 'Pendiente' THEN 1 END) as pending_tickets,
                COUNT(CASE WHEN sr.Status = 'En Proceso' THEN 1 END) as in_progress_tickets,
                
                -- Priority distribution
                COUNT(CASE WHEN sr.System_Priority = 'Crítica' THEN 1 END) as critical_priority,
                COUNT(CASE WHEN sr.System_Priority = 'Alta' THEN 1 END) as high_priority,
                COUNT(CASE WHEN sr.System_Priority = 'Media' THEN 1 END) as medium_priority,
                COUNT(CASE WHEN sr.System_Priority = 'Baja' THEN 1 END) as low_priority,
                
                -- Time metrics
                AVG(CASE WHEN sr.Resolved_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                    ELSE NULL END) as avg_resolution_hours,
                MIN(CASE WHEN sr.Resolved_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                    ELSE NULL END) as min_resolution_hours,
                MAX(CASE WHEN sr.Resolved_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                    ELSE NULL END) as max_resolution_hours,
                
                -- Office metrics
                COUNT(DISTINCT sr.Fk_Office) as active_offices,
                COUNT(DISTINCT CASE WHEN sr.Created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN sr.Fk_Office END) as offices_this_week,
                
                -- Technician metrics
                COUNT(DISTINCT t.ID_Technicians) as active_technicians,
                COUNT(DISTINCT CASE WHEN sr.Created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN t.ID_Technicians END) as technicians_this_week,
                
                -- Service type metrics
                COUNT(DISTINCT sr.Fk_TIService) as active_services,
                
                -- Trend metrics (comparisons with previous period)
                COUNT(CASE WHEN sr.Created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as tickets_today,
                COUNT(CASE WHEN sr.Created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as tickets_this_week,
                COUNT(CASE WHEN sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as tickets_this_month,
                
                -- Resolution rate
                ROUND(
                    COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) * 100.0 / 
                    NULLIF(COUNT(*), 0), 2
                ) as resolution_rate_percent,
                
                -- Critical tickets resolution rate
                ROUND(
                    COUNT(CASE WHEN sr.System_Priority = 'Crítica' AND sr.Status = 'Cerrado' THEN 1 END) * 100.0 / 
                    NULLIF(COUNT(CASE WHEN sr.System_Priority = 'Crítica' THEN 1 END), 0), 2
                ) as critical_resolution_rate_percent
                
            FROM Service_Request sr
            LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            LEFT JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $summary = $stmt->fetch(\PDO::FETCH_ASSOC);

        // Calculate trends and additional metrics
        $previousPeriodQuery = "
            SELECT 
                COUNT(*) as previous_month_tickets,
                COUNT(CASE WHEN Status = 'Cerrado' THEN 1 END) as previous_resolved,
                AVG(CASE WHEN Resolved_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, Created_at, Resolved_at) 
                    ELSE NULL END) as previous_avg_hours
            FROM Service_Request 
            WHERE Created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
              AND Created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        ";

        $prevStmt = $this->db->prepare($previousPeriodQuery);
        $prevStmt->execute();
        $previous = $prevStmt->fetch(\PDO::FETCH_ASSOC);

        // Calculate trends
        $ticketsTrend = $previous['previous_month_tickets'] > 0 
            ? round((($summary['tickets_this_month'] - $previous['previous_month_tickets']) / $previous['previous_month_tickets']) * 100, 1)
            : 0;

        $resolutionTrend = $previous['previous_avg_hours'] > 0 
            ? round((($summary['avg_resolution_hours'] - $previous['previous_avg_hours']) / $previous['previous_avg_hours']) * 100, 1)
            : 0;

        return [
            'kpi_metrics' => [
                'total_tickets' => (int)$summary['total_tickets'],
                'resolved_tickets' => (int)$summary['resolved_tickets'],
                'pending_tickets' => (int)$summary['pending_tickets'],
                'in_progress_tickets' => (int)$summary['in_progress_tickets'],
                'avg_resolution_hours' => round((float)$summary['avg_resolution_hours'], 1),
                'resolution_rate_percent' => (float)$summary['resolution_rate_percent'],
                'active_offices' => (int)$summary['active_offices'],
                'active_technicians' => (int)$summary['active_technicians'],
                'critical_tickets' => (int)$summary['critical_priority'],
                'critical_resolution_rate_percent' => (float)$summary['critical_resolution_rate_percent']
            ],
            'trends' => [
                'tickets_trend_percent' => $ticketsTrend,
                'resolution_time_trend_percent' => $resolutionTrend,
                'tickets_today' => (int)$summary['tickets_today'],
                'tickets_this_week' => (int)$summary['tickets_this_week'],
                'tickets_this_month' => (int)$summary['tickets_this_month']
            ],
            'priority_distribution' => [
                'critical' => (int)$summary['critical_priority'],
                'high' => (int)$summary['high_priority'],
                'medium' => (int)$summary['medium_priority'],
                'low' => (int)$summary['low_priority']
            ],
            'status_distribution' => [
                'resolved' => (int)$summary['resolved_tickets'],
                'in_progress' => (int)$summary['in_progress_tickets'],
                'pending' => (int)$summary['pending_tickets']
            ],
            'performance_metrics' => [
                'min_resolution_hours' => round((float)$summary['min_resolution_hours'], 1),
                'max_resolution_hours' => round((float)$summary['max_resolution_hours'], 1),
                'avg_resolution_hours' => round((float)$summary['avg_resolution_hours'], 1),
                'offices_this_week' => (int)$summary['offices_this_week'],
                'technicians_this_week' => (int)$summary['technicians_this_week'],
                'active_services' => (int)$summary['active_services']
            ]
        ];
    }

    /**
     * Get technician performance metrics
     */
    public function getTechnicianPerformance(): array
    {
        $query = "
            SELECT 
                t.ID_Technicians,
                CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
                u.Email,
                COUNT(tt.Fk_Service_Request) as assigned_tickets,
                COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved_tickets,
                AVG(CASE WHEN sr.Resolved_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, tt.Assigned_At, sr.Resolved_at) 
                    ELSE NULL END) as avg_resolution_hours,
                COUNT(CASE WHEN sr.Status = 'En Proceso' THEN 1 END) as active_tickets
            FROM Technicians t
            LEFT JOIN Users u ON t.Fk_Users = u.ID_Users
            LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
            LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, u.Email
            HAVING assigned_tickets > 0
            ORDER BY resolved_tickets DESC, active_tickets ASC
            LIMIT 15
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get recent tickets with optimized data loading
     */
    public function getRecentTickets(int $limit = 10, int $offset = 0): array
    {
        $query = "
            SELECT 
                sr.ID_Service_Request,
                sr.Ticket_Code,
                sr.Subject,
                sr.System_Priority,
                sr.Status,
                sr.Created_at,
                o.Name_Office,
                ts.Type_Service,
                GROUP_CONCAT(
                    CONCAT(t.First_Name, ' ', t.Last_Name) 
                    ORDER BY tt.Is_Lead DESC, tt.Assigned_At ASC
                    SEPARATOR ', '
                ) as technician_names
            FROM Service_Request sr
            LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
            LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
            LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
            LEFT JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
            WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY sr.ID_Service_Request
            ORDER BY sr.Created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        
        $tickets = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        // Format technician names and add metadata
        return array_map(function ($ticket) {
            return [
                'ID_Service_Request' => (string) $ticket['ID_Service_Request'],
                'Ticket_Code' => $ticket['Ticket_Code'],
                'Subject' => $ticket['Subject'],
                'System_Priority' => $ticket['System_Priority'],
                'Status' => $ticket['Status'],
                'Created_at' => $ticket['Created_at'],
                'Office_Name' => $ticket['Name_Office'] ?? 'No asignada',
                'Service_Name' => $ticket['Type_Service'] ?? 'No asignado',
                'Technician_Names' => $ticket['technician_names'] ?? 'Sin asignar',
                'Time_Ago' => $this->getTimeAgo($ticket['Created_at'])
            ];
        }, $tickets);
    }

    /**
     * Get ticket trends for the last 30 days
     */
    public function getTicketTrends(): array
    {
        $query = "
            SELECT 
                DATE(sr.Created_at) as date,
                COUNT(*) as created_count,
                COUNT(CASE WHEN sr.Status = 'Cerrado' AND sr.Resolved_at >= DATE(sr.Created_at) THEN 1 END) as resolved_count,
                COUNT(CASE WHEN sr.System_Priority IN ('Crítica', 'Alta') THEN 1 END) as high_priority_count
            FROM Service_Request sr
            WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(sr.Created_at)
            ORDER BY date ASC
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get service type distribution
     */
    public function getServiceDistribution(): array
    {
        $query = "
            SELECT 
                ts.ID_TI_Service,
                ts.Type_Service,
                COUNT(sr.ID_Service_Request) as ticket_count,
                COUNT(CASE WHEN sr.Status = 'Pendiente' THEN 1 END) as pending_count,
                AVG(CASE WHEN sr.Resolved_at IS NOT NULL 
                    THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) 
                    ELSE NULL END) as avg_resolution_hours
            FROM TI_Service ts
            LEFT JOIN Service_Request sr ON ts.ID_TI_Service = sr.Fk_TI_Service
                AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY ts.ID_TI_Service, ts.Type_Service
            HAVING ticket_count > 0
            ORDER BY ticket_count DESC
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Helper method to calculate time ago
     */
    private function getTimeAgo(string $datetime): string
    {
        $time = strtotime($datetime);
        $now = time();
        $diff = $now - $time;

        if ($diff < 60) return 'Ahora';
        if ($diff < 3600) return floor($diff / 60) . ' min';
        if ($diff < 86400) return floor($diff / 3600) . ' horas';
        if ($diff < 604800) return floor($diff / 86400) . ' días';
        return date('d/m/Y', $time);
    }

    /**
     * Get comprehensive dashboard data in single call
     * Optimized for performance with parallel data loading
     */
    public function getFullDashboardData(): array
    {
        return [
            'stats' => $this->getDashboardStats(),
            'recent_tickets' => $this->getRecentTickets(8),
            'priority_distribution' => $this->getTicketsByPriority(),
            'office_distribution' => $this->getTicketsByOffice(),
            'technician_performance' => $this->getTechnicianPerformance(),
            'trends' => $this->getTicketTrends(),
            'service_distribution' => $this->getServiceDistribution(),
            'last_updated' => date('Y-m-d H:i:s')
        ];
    }
}
