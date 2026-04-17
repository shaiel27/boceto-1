<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use RuntimeException;

class ReportController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function general(Request $request): Response
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total_tickets,
                    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as resolved_tickets,
                    COUNT(CASE WHEN Status = 'Pendiente' THEN 1 END) as pending_tickets,
                    COUNT(CASE WHEN Status = 'En Proceso' THEN 1 END) in_progress_tickets,
                    COUNT(CASE WHEN System_Priority = 'Alta' THEN 1 END) as high_priority_tickets,
                    AVG(TIMESTAMPDIFF(HOUR, Created_at, COALESCE(Resolved_at, NOW()))) as avg_resolution_hours
                FROM Service_Request
                WHERE Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ");
            
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return Response::success($stats, 'Reporte general generado');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function byOffice(Request $request): Response
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    o.Name_Office,
                    COUNT(*) as total_tickets,
                    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as resolved_tickets,
                    AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, COALESCE(sr.Resolved_at, NOW()))) as avg_resolution_hours
                FROM Service_Request sr
                JOIN Office o ON sr.Fk_Office = o.ID_Office
                WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY o.ID_Office, o.Name_Office
                ORDER BY total_tickets DESC
            ");
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return Response::success($data, 'Reporte por oficina generado');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function responseTimes(Request $request): Response
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    ts.Type_Service,
                    COUNT(*) as total_tickets,
                    AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, COALESCE(sr.Resolved_at, NOW()))) as avg_resolution_hours,
                    MIN(TIMESTAMPDIFF(HOUR, sr.Created_at, COALESCE(sr.Resolved_at, NOW()))) as min_resolution_hours,
                    MAX(TIMESTAMPDIFF(HOUR, sr.Created_at, COALESCE(sr.Resolved_at, NOW()))) as max_resolution_hours
                FROM Service_Request sr
                JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                AND sr.Status = 'Resuelto'
                GROUP BY ts.ID_TI_Service, ts.Type_Service
                ORDER BY avg_resolution_hours ASC
            ");
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return Response::success($data, 'Reporte de tiempos de respuesta generado');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function priority(Request $request): Response
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    sr.ID_Service_Request,
                    sr.Ticket_Code,
                    sr.Subject,
                    sr.System_Priority,
                    sr.Status,
                    sr.Created_at,
                    sr.Resolved_at,
                    TIMESTAMPDIFF(HOUR, sr.Created_at, COALESCE(sr.Resolved_at, NOW())) as resolution_hours,
                    o.Name_Office,
                    ts.Type_Service
                FROM Service_Request sr
                JOIN Office o ON sr.Fk_Office = o.ID_Office
                JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                WHERE sr.System_Priority = 'Alta'
                AND sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                ORDER BY sr.Created_at DESC
            ");
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return Response::success($data, 'Reporte de tickets de alta prioridad generado');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function monthly(Request $request): Response
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    DATE_FORMAT(Created_at, '%Y-%m') as month,
                    COUNT(*) as total_tickets,
                    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as resolved_tickets,
                    COUNT(CASE WHEN Status = 'Pendiente' THEN 1 END) as pending_tickets,
                    COUNT(CASE WHEN Status = 'En Proceso' THEN 1 END) in_progress_tickets
                FROM Service_Request
                WHERE Created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(Created_at, '%Y-%m')
                ORDER BY month ASC
            ");
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return Response::success($data, 'Reporte de evolución mensual generado');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function byService(Request $request): Response
    {
        try {
            $stmt = $this->db->query("
                SELECT 
                    ts.Type_Service,
                    COUNT(*) as total_tickets,
                    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as resolved_tickets,
                    AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, COALESCE(sr.Resolved_at, NOW()))) as avg_resolution_hours,
                    COUNT(CASE WHEN spc.Estimated_Severity = 'Alta' THEN 1 END) as high_severity_tickets
                FROM Service_Request sr
                JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                JOIN Service_Problems_Catalog spc ON sr.Fk_Problem_Catalog = spc.ID_Problem_Catalog
                WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY ts.ID_TI_Service, ts.Type_Service
                ORDER BY total_tickets DESC
            ");
            
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return Response::success($data, 'Reporte por tipo de servicio generado');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 500);
        }
    }
}
