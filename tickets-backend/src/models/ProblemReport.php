<?php
/**
 * PHP-PRO: Problem Report Model
 * 
 * Modelo para reporte de problemas más frecuentes por servicio
 * Aplica principios PHP-PRO: strict typing, type safety, proper error handling
 */

declare(strict_types=1);

class ProblemReport
{
    private $conn;
    private $table_name = "service_problems_catalog";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * PHP-PRO: Obtener problemas más frecuentes por servicio
     * 
     * @param string|null $startDate Fecha inicio (YYYY-MM-DD)
     * @param string|null $endDate Fecha fin (YYYY-MM-DD)
     * @return array<array{service_id: int, service_name: string, problem_id: int, problem_name: string, ticket_count: int, severity: string}>
     */
    public function getMostFrequentProblemsByService(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            $dateCondition = "";
            $params = [];
            
            if ($startDate) {
                $dateCondition .= " AND sr.Created_at >= :startDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
            }
            
            if ($endDate) {
                $dateCondition .= " AND sr.Created_at <= :endDate";
                $params[':endDate'] = $endDate . ' 23:59:59';
            }

            $dateForSr2 = str_replace('sr.', 'sr2.', $dateCondition);
            $dateForSr3 = str_replace('sr.', 'sr3.', $dateCondition);
            $dateForSr4 = str_replace('sr.', 'sr4.', $dateCondition);
            $dateForPlain = str_replace('sr.', '', $dateCondition);

            $query = "SELECT 
                     ts.Type_Service as tipo_servicio,
                     COUNT(sr.ID_Service_Request) as total_tickets_mes,
                     SUM(CASE WHEN sr.Status = 'Pendiente' THEN 1 ELSE 0 END) as pendientes_mes,
                     SUM(CASE WHEN sr.Status = 'En Proceso' THEN 1 ELSE 0 END) as en_proceso_mes,
                     SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) as resueltos_mes,
                     SUM(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 ELSE 0 END) as cerrados_mes,
                     COUNT(DISTINCT sr.Fk_Office) as oficinas_atendidas_mes,
                     COUNT(DISTINCT tt.Fk_Technician) as tecnicos_involucrados_mes,
                     (
                         SELECT spc.Problem_Name 
                         FROM Service_Request sr2
                         JOIN Service_Problems_Catalog spc ON sr2.Fk_Problem_Catalog = spc.ID_Problem_Catalog
                         WHERE sr2.Fk_TI_Service = ts.ID_TI_Service
                         " . $dateForSr2 . "
                         GROUP BY spc.Problem_Name
                         ORDER BY COUNT(*) DESC
                         LIMIT 1
                     ) as problematica_mas_frecuente_mes,
                     (
                         SELECT COUNT(*)
                         FROM Service_Request sr3
                         JOIN Service_Problems_Catalog spc2 ON sr3.Fk_Problem_Catalog = spc2.ID_Problem_Catalog
                         WHERE sr3.Fk_TI_Service = ts.ID_TI_Service
                         " . $dateForSr3 . "
                         GROUP BY spc2.Problem_Name
                         ORDER BY COUNT(*) DESC
                         LIMIT 1
                     ) as frecuencia_problematica_mes,
                     (
                         SELECT o.Name_Office
                         FROM Service_Request sr4
                         JOIN Office o ON sr4.Fk_Office = o.ID_Office
                         WHERE sr4.Fk_TI_Service = ts.ID_TI_Service
                         " . $dateForSr4 . "
                         GROUP BY o.Name_Office
                         ORDER BY COUNT(*) DESC
                         LIMIT 1
                     ) as oficina_mas_solicitante_mes,
                     ROUND(AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, COALESCE(sr.Resolved_at, NOW()))), 2) as tiempo_promedio_horas_mes,
                     ROUND(COUNT(sr.ID_Service_Request) * 100.0 / (
                         SELECT COUNT(*) 
                         FROM Service_Request 
                         WHERE 1=1 " . $dateForPlain . "
                     ), 2) as porcentaje_mes_actual
                     FROM ti_service ts
                     LEFT JOIN service_request sr ON ts.ID_TI_Service = sr.Fk_TI_Service
                     LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
                     WHERE sr.ID_Service_Request IS NOT NULL
                     " . $dateCondition . "
                     GROUP BY ts.Type_Service, ts.ID_TI_Service
                     HAVING total_tickets_mes > 0
                     ORDER BY total_tickets_mes DESC";

            $stmt = $this->conn->prepare($query);
            
            // Bind parameters if they exist
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // PHP-PRO: Formatear resultados con tipos estrictos para reporte mensual por tipo de servicio
            $formattedResults = [];
            foreach ($results as $row) {
                $formattedResults[] = [
                    'tipo_servicio' => $row['tipo_servicio'],
                    'total_tickets_mes' => (int)$row['total_tickets_mes'],
                    'pendientes_mes' => (int)$row['pendientes_mes'],
                    'en_proceso_mes' => (int)$row['en_proceso_mes'],
                    'resueltos_mes' => (int)$row['resueltos_mes'],
                    'cerrados_mes' => (int)$row['cerrados_mes'],
                    'oficinas_atendidas_mes' => (int)$row['oficinas_atendidas_mes'],
                    'tecnicos_involucrados_mes' => (int)$row['tecnicos_involucrados_mes'],
                    'problematica_mas_frecuente_mes' => $row['problematica_mas_frecuente_mes'] ?? 'N/A',
                    'frecuencia_problematica_mes' => (int)$row['frecuencia_problematica_mes'],
                    'oficina_mas_solicitante_mes' => $row['oficina_mas_solicitante_mes'] ?? 'N/A',
                    'tiempo_promedio_horas_mes' => (float)$row['tiempo_promedio_horas_mes'],
                    'porcentaje_mes_actual' => (float)$row['porcentaje_mes_actual']
                ];
            }

            error_log("getMostFrequentProblemsByService: Retrieved " . count($formattedResults) . " service records");
            return $formattedResults;

        } catch (PDOException $e) {
            error_log("PDOException in getMostFrequentProblemsByService: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getMostFrequentProblemsByService: " . $e->getMessage());
            return [];
        }
    }

    /**
     * PHP-PRO: Obtener el problema más frecuente por cada servicio
     * 
     * @param string|null $startDate Fecha inicio (YYYY-MM-DD)
     * @param string|null $endDate Fecha fin (YYYY-MM-DD)
     * @return array<array{service_id: int, service_name: string, problem_id: int, problem_name: string, ticket_count: int, severity: string}>
     */
    public function getTopProblemByService(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            // Build date filter conditions
            $dateCondition = "";
            $params = [];
            
            if ($startDate) {
                $dateCondition .= " AND sr.Created_at >= :startDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
            }
            
            if ($endDate) {
                $dateCondition .= " AND sr.Created_at <= :endDate";
                $params[':endDate'] = $endDate . ' 23:59:59';
            }

            // PHP-PRO: Query con subquery para obtener solo el top por servicio
            $query = "SELECT 
                     ts.ID_TI_Service as service_id,
                     ts.Type_Service as service_name,
                     spc.ID_Problem_Catalog as problem_id,
                     spc.Problem_Name as problem_name,
                     spc.Typical_Description as problem_description,
                     spc.Estimated_Severity as severity,
                     COUNT(sr.ID_Service_Request) as ticket_count
                     FROM ti_service ts
                     INNER JOIN service_problems_catalog spc ON ts.ID_TI_Service = spc.Fk_TI_Service
                     LEFT JOIN service_request sr ON spc.ID_Problem_Catalog = sr.Fk_Problem_Catalog
                     WHERE sr.ID_Service_Request IS NOT NULL
                     " . $dateCondition . "
                     GROUP BY ts.ID_TI_Service, ts.Type_Service, spc.ID_Problem_Catalog, 
                              spc.Problem_Name, spc.Typical_Description, spc.Estimated_Severity
                     HAVING ticket_count = (
                         SELECT MAX(sub_count)
                         FROM (
                             SELECT COUNT(sr2.ID_Service_Request) as sub_count
                             FROM service_request sr2
                             WHERE sr2.Fk_TI_Service = ts.ID_TI_Service
                             AND sr2.Fk_Problem_Catalog = spc.ID_Problem_Catalog
                             " . str_replace("sr.", "sr2.", $dateCondition) . "
                         ) as max_count
                     )
                     ORDER BY ts.Type_Service ASC";

            $stmt = $this->conn->prepare($query);
            
            // Bind parameters if they exist
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // PHP-PRO: Formatear resultados con tipos estrictos
            $formattedResults = [];
            foreach ($results as $row) {
                $formattedResults[] = [
                    'service_id' => (int)$row['service_id'],
                    'service_name' => $row['service_name'],
                    'problem_id' => (int)$row['problem_id'],
                    'problem_name' => $row['problem_name'],
                    'problem_description' => $row['problem_description'],
                    'severity' => $row['severity'],
                    'ticket_count' => (int)$row['ticket_count']
                ];
            }

            error_log("getTopProblemByService: Retrieved " . count($formattedResults) . " top problem records");
            return $formattedResults;

        } catch (PDOException $e) {
            error_log("PDOException in getTopProblemByService: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getTopProblemByService: " . $e->getMessage());
            return [];
        }
    }

    public function getProblemsByMonth(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            $dateCondition = "";
            $params = [];
            
            if ($startDate) {
                $dateCondition .= " AND sr.Created_at >= :startDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
            }
            
            if ($endDate) {
                $dateCondition .= " AND sr.Created_at <= :endDate";
                $params[':endDate'] = $endDate . ' 23:59:59';
            }

            $query = "SELECT 
                     DATE_FORMAT(sr.Created_at, '%Y-%m') as month_key,
                     DATE_FORMAT(sr.Created_at, '%M %Y') as month_name,
                     spc.ID_Problem_Catalog as problem_id,
                     spc.Problem_Name as problem_name,
                     spc.Estimated_Severity as severity,
                     COUNT(sr.ID_Service_Request) as ticket_count
                     FROM service_request sr
                     INNER JOIN service_problems_catalog spc ON sr.Fk_Problem_Catalog = spc.ID_Problem_Catalog
                     WHERE sr.ID_Service_Request IS NOT NULL
                     " . $dateCondition . "
                     GROUP BY DATE_FORMAT(sr.Created_at, '%Y-%m'),
                              DATE_FORMAT(sr.Created_at, '%M %Y'),
                              spc.ID_Problem_Catalog,
                              spc.Problem_Name,
                              spc.Estimated_Severity
                     HAVING ticket_count > 0
                     ORDER BY sr.Created_at DESC, ticket_count DESC";

            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $formattedResults = [];
            foreach ($results as $row) {
                $formattedResults[] = [
                    'month_key' => $row['month_key'],
                    'month_name' => $row['month_name'],
                    'problem_id' => (int)$row['problem_id'],
                    'problem_name' => $row['problem_name'],
                    'severity' => $row['severity'],
                    'ticket_count' => (int)$row['ticket_count']
                ];
            }

            error_log("getProblemsByMonth: Retrieved " . count($formattedResults) . " records");
            return $formattedResults;

        } catch (PDOException $e) {
            error_log("PDOException in getProblemsByMonth: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getProblemsByMonth: " . $e->getMessage());
            return [];
        }
    }

    public function getSystemsAndProblems(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            $dateCondition = "";
            $params = [];
            
            if ($startDate) {
                $dateCondition .= " AND sr.Created_at >= :startDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
            }
            
            if ($endDate) {
                $dateCondition .= " AND sr.Created_at <= :endDate";
                $params[':endDate'] = $endDate . ' 23:59:59';
            }

            $dateForSr2 = str_replace('sr.', 'sr2.', $dateCondition);
            $dateForSr3 = str_replace('sr.', 'sr3.', $dateCondition);

            $query = "SELECT 
                     ss.System_Name AS sistema,
                     COUNT(sr.ID_Service_Request) AS total_tickets,
                     (
                         SELECT spc.Problem_Name 
                         FROM Service_Request sr2
                         JOIN Service_Problems_Catalog spc ON sr2.Fk_Problem_Catalog = spc.ID_Problem_Catalog
                         WHERE sr2.Fk_Software_System = sr.Fk_Software_System
                         AND sr2.Fk_TI_Service = 3
                         " . $dateForSr2 . "
                         GROUP BY spc.Problem_Name
                         ORDER BY COUNT(*) DESC
                         LIMIT 1
                     ) AS problematica_mas_comun,
                     (
                         SELECT COUNT(*)
                         FROM Service_Request sr3
                         JOIN Service_Problems_Catalog spc2 ON sr3.Fk_Problem_Catalog = spc2.ID_Problem_Catalog
                         WHERE sr3.Fk_Software_System = sr.Fk_Software_System
                         AND sr3.Fk_TI_Service = 3
                         " . $dateForSr3 . "
                         GROUP BY spc2.Problem_Name
                         ORDER BY COUNT(*) DESC
                         LIMIT 1
                     ) AS frecuencia_problematica
                     FROM Service_Request sr
                     JOIN Software_Systems ss ON sr.Fk_Software_System = ss.ID_System
                     WHERE sr.Fk_TI_Service = 3
                     AND sr.Fk_Software_System IS NOT NULL
                     " . $dateCondition . "
                     GROUP BY ss.System_Name, sr.Fk_Software_System
                     HAVING COUNT(sr.ID_Service_Request) > 0
                     ORDER BY total_tickets DESC";

            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $formattedResults = [];
            foreach ($results as $row) {
                $formattedResults[] = [
                    'sistema' => $row['sistema'],
                    'total_tickets' => (int)$row['total_tickets'],
                    'problematica_mas_comun' => $row['problematica_mas_comun'] ?? 'N/A',
                    'frecuencia_problematica' => (int)$row['frecuencia_problematica']
                ];
            }

            error_log("getSystemsAndProblems: Retrieved " . count($formattedResults) . " records");
            return $formattedResults;

        } catch (PDOException $e) {
            error_log("PDOException in getSystemsAndProblems: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getSystemsAndProblems: " . $e->getMessage());
            return [];
        }
    }
}
?>
