-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS MUNICIPAL
-- ==========================================
-- Script de Consultas para Dashboard - MySQL 8.0+
-- Creado: $(date '+%Y-%m-%d %H:%M:%S')
-- ==========================================

USE alcaldia_tickets_db;

-- ==========================================
-- 1. KPIs PRINCIPALES DEL DASHBOARD
-- ==========================================

-- Total de Tickets
SELECT COUNT(*) as total_tickets FROM Service_Request;

-- Tickets por Estado
SELECT 
    Status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request), 2) as percentage
FROM Service_Request
GROUP BY Status
ORDER BY count DESC;

-- Tickets por Prioridad
SELECT 
    User_Priority as priority,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request), 2) as percentage
FROM Service_Request
GROUP BY User_Priority
ORDER BY 
    CASE User_Priority
        WHEN 'Urgente' THEN 1
        WHEN 'Alta' THEN 2
        WHEN 'Media' THEN 3
        WHEN 'Baja' THEN 4
    END;

-- Tickets Resueltos Hoy
SELECT COUNT(*) as resolved_today
FROM Service_Request
WHERE Status = 'Resuelto'
  AND DATE(Resolved_at) = CURDATE();

-- Tickets Creados Hoy
SELECT COUNT(*) as created_today
FROM Service_Request
WHERE DATE(Created_at) = CURDATE();

-- ==========================================
-- 2. ESTADÍSTICAS DE TIEMPO DE RESPUESTA
-- ==========================================

-- Tiempo Promedio de Resolución (últimos 30 días)
SELECT 
    AVG(TIMESTAMPDIFF(HOUR, Created_at, COALESCE(Resolved_at, NOW()))) as avg_resolution_hours,
    AVG(TIMESTAMPDIFF(DAY, Created_at, COALESCE(Resolved_at, NOW()))) as avg_resolution_days
FROM Service_Request
WHERE Status = 'Resuelto'
  AND Created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Tiempo Promedio de Resolución por Tipo de Servicio
SELECT 
    TI.Type_Service,
    COUNT(*) as total_tickets,
    AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW()))) as avg_hours_open,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved_count,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / COUNT(*), 2) as resolution_rate
FROM Service_Request SR
INNER JOIN TI_Service TI ON SR.Fk_TI_Service = TI.ID_TI_Service
WHERE SR.Created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY TI.Type_Service
ORDER BY avg_hours_open;

-- Tickets Abiertos por Más de 3 Días
SELECT 
    COUNT(*) as tickets_open_over_3_days,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request WHERE Status != 'Resuelto'), 2) as percentage
FROM Service_Request
WHERE Status != 'Resuelto'
  AND Created_at < DATE_SUB(CURDATE(), INTERVAL 3 DAY);

-- ==========================================
-- 3. REPORTES POR ESTRUCTURA INSTITUCIONAL
-- ==========================================

-- Tickets por Dirección
SELECT 
    DIR.Name_Direction as direction_name,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved_tickets,
    COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) as pending_tickets,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / COUNT(*), 2) as resolution_rate,
    AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW()))) as avg_hours_open
FROM Service_Request SR
INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
INNER JOIN Divisions D ON C.Fk_Division = D.ID_Division
INNER JOIN Directions DIR ON D.Fk_Direction = DIR.ID_Direction
GROUP BY DIR.Name_Direction
ORDER BY total_tickets DESC;

-- Tickets por División
SELECT 
    D.Name_Division as division_name,
    DIR.Name_Direction as direction_name,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved_tickets,
    COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) as pending_tickets,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / COUNT(*), 2) as resolution_rate
FROM Service_Request SR
INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
INNER JOIN Divisions D ON C.Fk_Division = D.ID_Division
INNER JOIN Directions DIR ON D.Fk_Direction = DIR.ID_Direction
GROUP BY D.Name_Division, DIR.Name_Direction
ORDER BY total_tickets DESC;

-- Top 10 Coordinaciones con más Tickets
SELECT 
    C.Name_Coordination as coordination_name,
    D.Name_Division as division_name,
    DIR.Name_Direction as direction_name,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved_tickets,
    COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) as pending_tickets,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / COUNT(*), 2) as resolution_rate
FROM Service_Request SR
INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
INNER JOIN Divisions D ON C.Fk_Division = D.ID_Division
INNER JOIN Directions DIR ON D.Fk_Direction = DIR.ID_Direction
GROUP BY C.Name_Coordination, D.Name_Division, DIR.Name_Direction
ORDER BY total_tickets DESC
LIMIT 10;

-- ==========================================
-- 4. REPORTES DE TÉCNICOS
-- ==========================================

-- Rendimiento de Técnicos
SELECT 
    CONCAT(U.First_Name, ' ', U.Last_Name) as technician_name,
    T.Status as technician_status,
    COUNT(SR.ID_Service_Request) as total_assigned,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved,
    COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) as pending,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as resolution_rate,
    AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW()))) as avg_resolution_hours,
    MAX(SR.Created_at) as last_assignment
FROM Technicians T
INNER JOIN Users U ON T.Fk_Users = U.ID_Users
LEFT JOIN Service_Request SR ON T.ID_Technicians = SR.Fk_Technician_Current
GROUP BY T.ID_Technicians, U.First_Name, U.Last_Name, T.Status
ORDER BY resolved DESC, total_assigned DESC;

-- Técnicos por Especialidad
SELECT 
    TI.Type_Service as service_type,
    COUNT(DISTINCT TS.Fk_Technicians) as technician_count,
    COUNT(SR.ID_Service_Request) as total_tickets,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved_tickets,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as resolution_rate
FROM TI_Service TI
LEFT JOIN Technicians_Service TS ON TI.ID_TI_Service = TS.Fk_TI_Service
LEFT JOIN Service_Request SR ON TI.ID_TI_Service = SR.Fk_TI_Service
WHERE TS.status = 'Activo'
GROUP BY TI.Type_Service
ORDER BY total_tickets DESC;

-- Disponibilidad de Técnicos
SELECT 
    CASE T.Status
        WHEN 'Disponible' THEN 'Disponibles'
        WHEN 'Vacaciones' THEN 'De Vacaciones'
        WHEN 'Desestituido' THEN 'No Disponibles'
    END as availability_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Technicians), 2) as percentage
FROM Technicians T
GROUP BY 
    CASE T.Status
        WHEN 'Disponible' THEN 'Disponibles'
        WHEN 'Vacaciones' THEN 'De Vacaciones'
        WHEN 'Desestituido' THEN 'No Disponibles'
    END
ORDER BY count DESC;

-- ==========================================
-- 5. REPORTES TEMPORALES
-- ==========================================

-- Tickets por Día (últimos 30 días)
SELECT 
    DATE(Created_at) as date,
    COUNT(*) as tickets_created,
    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as tickets_resolved,
    COUNT(CASE WHEN Status != 'Resuelto' THEN 1 END) as tickets_pending
FROM Service_Request
WHERE Created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(Created_at)
ORDER BY date DESC;

-- Tickets por Semana (últimas 12 semanas)
SELECT 
    DATE_FORMAT(Created_at, '%Y-%u') as week_start,
    DATE_ADD(DATE_FORMAT(Created_at, '%Y-%u'), INTERVAL 6 DAY) as week_end,
    COUNT(*) as tickets_created,
    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as tickets_resolved,
    COUNT(CASE WHEN Status != 'Resuelto' THEN 1 END) as tickets_pending
FROM Service_Request
WHERE Created_at >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
GROUP BY DATE_FORMAT(Created_at, '%Y-%u')
ORDER BY week_start DESC;

-- Tickets por Mes (últimos 12 meses)
SELECT 
    DATE_FORMAT(Created_at, '%Y-%m') as month_label,
    COUNT(*) as tickets_created,
    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as tickets_resolved,
    COUNT(CASE WHEN Status != 'Resuelto' THEN 1 END) as tickets_pending,
    AVG(TIMESTAMPDIFF(HOUR, Created_at, COALESCE(Resolved_at, NOW()))) as avg_resolution_hours
FROM Service_Request
WHERE Created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(Created_at, '%Y-%m')
ORDER BY month_label DESC;

-- ==========================================
-- 6. REPORTES DE TIPO DE SERVICIO
-- ==========================================

-- Tickets por Tipo de Servicio
SELECT 
    TI.Type_Service,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved_tickets,
    COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) as pending_tickets,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / COUNT(*), 2) as resolution_rate,
    AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW()))) as avg_hours_open
FROM Service_Request SR
INNER JOIN TI_Service TI ON SR.Fk_TI_Service = TI.ID_TI_Service
GROUP BY TI.Type_Service
ORDER BY total_tickets DESC;

-- Distribución de Prioridades por Tipo de Servicio
SELECT 
    TI.Type_Service,
    SR.User_Priority,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request WHERE Fk_TI_Service = TI.ID_TI_Service), 2) as percentage
FROM Service_Request SR
INNER JOIN TI_Service TI ON SR.Fk_TI_Service = TI.ID_TI_Service
GROUP BY TI.Type_Service, SR.User_Priority
ORDER BY TI.Type_Service, 
    CASE SR.User_Priority
        WHEN 'Urgente' THEN 1
        WHEN 'Alta' THEN 2
        WHEN 'Media' THEN 3
        WHEN 'Baja' THEN 4
    END;

-- ==========================================
-- 7. REPORTES DE USUARIOS
-- ==========================================

-- Top 10 Usuarios con más Tickets
SELECT 
    CONCAT(U.First_Name, ' ', U.Last_Name) as user_name,
    U.Email as user_email,
    C.Name_Coordination as coordination_name,
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) as resolved_tickets,
    COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) as pending_tickets,
    MAX(SR.Created_at) as last_ticket_date
FROM Service_Request SR
INNER JOIN Users U ON SR.Fk_Users = U.ID_Users
INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
GROUP BY U.ID_Users, U.First_Name, U.Last_Name, U.Email, C.Name_Coordination
ORDER BY total_tickets DESC
LIMIT 10;

-- Tickets por Tipo de Solicitud
SELECT 
    Request_Type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request), 2) as percentage
FROM Service_Request
GROUP BY Request_Type
ORDER BY count DESC;

-- ==========================================
-- 8. CONSULTAS AVANZADAS PARA GRÁFICOS
-- ==========================================

-- Evolución de Tickets por Mes (para gráfico de líneas)
SELECT 
    DATE_FORMAT(Created_at, '%Y-%m') as month,
    COUNT(*) as created,
    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) as resolved,
    COUNT(CASE WHEN Status = 'Pendiente' THEN 1 END) as pending,
    COUNT(CASE WHEN Status = 'En Proceso' THEN 1 END) as in_progress
FROM Service_Request
WHERE Created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(Created_at, '%Y-%m')
ORDER BY month;

-- Distribución de Tickets por Hora del Día
SELECT 
    HOUR(Created_at) as hour_of_day,
    COUNT(*) as ticket_count
FROM Service_Request
GROUP BY HOUR(Created_at)
ORDER BY hour_of_day;

-- Tickets por Día de la Semana
SELECT 
    DAYNAME(Created_at) as day_name,
    COUNT(*) as ticket_count
FROM Service_Request
GROUP BY DAYNAME(Created_at)
ORDER BY FIELD(DAYNAME(Created_at), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Tiempo Promedio de Resolución por Técnico (últimos 30 días)
SELECT 
    CONCAT(U.First_Name, ' ', U.Last_Name) as technician_name,
    COUNT(*) as total_resolved,
    AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, SR.Resolved_at)) as avg_hours,
    MIN(TIMESTAMPDIFF(HOUR, SR.Created_at, SR.Resolved_at)) as min_hours,
    MAX(TIMESTAMPDIFF(HOUR, SR.Created_at, SR.Resolved_at)) as max_hours
FROM Service_Request SR
INNER JOIN Technicians T ON SR.Fk_Technician_Current = T.ID_Technicians
INNER JOIN Users U ON T.Fk_Users = U.ID_Users
WHERE SR.Status = 'Resuelto'
  AND SR.Resolved_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY T.ID_Technicians, U.First_Name, U.Last_Name
ORDER BY avg_hours;

-- ==========================================
-- 9. MÉTRICAS DE RENDIMIENTO
-- ==========================================

-- SLA Cumplimiento (Tickets resueltos en menos de 24 horas)
SELECT 
    COUNT(*) as total_resolved,
    COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, Created_at, Resolved_at) <= 24 THEN 1 END) as met_sla,
    ROUND(COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, Created_at, Resolved_at) <= 24 THEN 1 END) * 100.0 / COUNT(*), 2) as sla_percentage
FROM Service_Request
WHERE Status = 'Resuelto'
  AND Created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Tasa de Reapertura de Tickets
SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN Status = 'Reabierto' THEN 1 END) as reopened_tickets,
    ROUND(COUNT(CASE WHEN Status = 'Reabierto' THEN 1 END) * 100.0 / COUNT(*), 2) as reopen_rate
FROM Service_Request
WHERE Created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Tickets por Prioridad y Estado
SELECT 
    User_Priority,
    Status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request), 2) as percentage
FROM Service_Request
GROUP BY User_Priority, Status
ORDER BY User_Priority, Status;

-- ==========================================
-- COMENTARIOS FINALES
-- ==========================================
-- Este script contiene todas las consultas necesarias para el dashboard:
-- - KPIs principales y métricas en tiempo real
-- - Análisis de rendimiento y tiempos de respuesta
-- - Reportes por estructura institucional
-- - Estadísticas de técnicos y especialidades
-- - Análisis temporal y tendencias
-- - Consultas optimizadas para gráficos y visualizaciones
--
-- Para ejecutar este script:
-- mysql -u root -p alcaldia_tickets_db < 04_dashboard_queries.sql
--
-- Las consultas pueden ser usadas directamente desde el frontend
-- o adaptadas a procedimientos almacenados para mayor rendimiento.
