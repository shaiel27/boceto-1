-- ==========================================
-- PROYECTO: SISTEMA DE GESTIÓN DE TICKETS
-- Script de Consultas Útiles
-- Motor: MySQL
-- ==========================================

USE tickets_municipal;

-- ==========================================
-- 1. CONSULTAS DE TICKETS
-- ==========================================

-- Obtener todos los tickets con información completa
SELECT 
    sr.ID_Service_Request,
    sr.Ticket_Code,
    sr.Subject,
    sr.Description,
    sr.Status,
    sr.System_Priority,
    sr.Created_at,
    sr.Resolved_at,
    o.Name_Office AS Oficina_Origen,
    b.Name_Boss AS Solicitante,
    ts.Type_Service AS Tipo_Servicio,
    spc.Problem_Name AS Problema,
    ss.System_Name AS Sistema_Software
FROM Service_Request sr
JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
JOIN Boss b ON u.ID_Users = b.Fk_User
JOIN Office o ON sr.Fk_Office = o.ID_Office
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
JOIN Service_Problems_Catalog spc ON sr.Fk_Problem_Catalog = spc.ID_Problem_Catalog
LEFT JOIN Software_Systems ss ON sr.Fk_Software_System = ss.ID_System
ORDER BY sr.Created_at DESC;

-- Tickets por estado
SELECT 
    Status,
    COUNT(*) AS Total_Tickets,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request), 2) AS Porcentaje
FROM Service_Request
GROUP BY Status
ORDER BY Total_Tickets DESC;

-- Tickets por prioridad
SELECT 
    System_Priority,
    COUNT(*) AS Total_Tickets
FROM Service_Request
GROUP BY System_Priority
ORDER BY 
    CASE System_Priority
        WHEN 'Alta' THEN 1
        WHEN 'Media' THEN 2
        WHEN 'Baja' THEN 3
    END;

-- Tickets por tipo de servicio
SELECT 
    ts.Type_Service AS Servicio,
    COUNT(sr.ID_Service_Request) AS Total_Tickets,
    ROUND(AVG(DATEDIFF(COALESCE(sr.Resolved_at, NOW()), sr.Created_at)), 2) AS Promedio_Dias_Resolucion
FROM Service_Request sr
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
GROUP BY ts.Type_Service
ORDER BY Total_Tickets DESC;

-- Tickets por oficina
SELECT 
    o.Name_Office AS Oficina,
    o.Office_Type AS Tipo,
    COUNT(sr.ID_Service_Request) AS Total_Tickets
FROM Service_Request sr
JOIN Office o ON sr.Fk_Office = o.ID_Office
GROUP BY o.ID_Office, o.Name_Office, o.Office_Type
ORDER BY Total_Tickets DESC;

-- Tickets resueltos en los últimos 30 días
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    o.Name_Office AS Oficina,
    ts.Type_Service AS Servicio,
    sr.Resolved_at,
    DATEDIFF(sr.Resolved_at, sr.Created_at) AS Dias_Para_Resolucion
FROM Service_Request sr
JOIN Office o ON sr.Fk_Office = o.ID_Office
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Status = 'Resuelto'
    AND sr.Resolved_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY sr.Resolved_at DESC;

-- Tickets pendientes por más de 7 días
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    o.Name_Office AS Oficina,
    sr.System_Priority AS Prioridad,
    DATEDIFF(NOW(), sr.Created_at) AS Dias_Pendiente
FROM Service_Request sr
JOIN Office o ON sr.Fk_Office = o.ID_Office
WHERE sr.Status != 'Resuelto'
    AND sr.Created_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY Dias_Pendiente DESC, sr.System_Priority DESC;

-- Tickets de alta prioridad pendientes
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    o.Name_Office AS Oficina,
    b.Name_Boss AS Solicitante,
    sr.Created_at,
    DATEDIFF(NOW(), sr.Created_at) AS Dias_Pendiente
FROM Service_Request sr
JOIN Office o ON sr.Fk_Office = o.ID_Office
JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
JOIN Boss b ON u.ID_Users = b.Fk_User
WHERE sr.System_Priority = 'Alta'
    AND sr.Status != 'Resuelto'
ORDER BY sr.Created_at ASC;

-- ==========================================
-- 2. CONSULTAS DE TÉCNICOS
-- ==========================================

-- Técnicos activos con sus servicios asignados
SELECT 
    t.ID_Technicians,
    CONCAT(t.First_Name, ' ', t.Last_Name) AS Tecnico_Nombre,
    u.Email,
    t.Status,
    GROUP_CONCAT(DISTINCT ts.Type_Service SEPARATOR ', ') AS Servicios
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
LEFT JOIN Technicians_Service tech_svc ON t.ID_Technicians = tech_svc.Fk_Technicians
LEFT JOIN TI_Service ts ON tech_svc.Fk_TI_Service = ts.ID_TI_Service
WHERE t.Status = 'Activo'
GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, u.Email, t.Status
ORDER BY t.First_Name, t.Last_Name;

-- Cantidad de tickets asignados a cada técnico
SELECT 
    t.ID_Technicians,
    CONCAT(t.First_Name, ' ', t.Last_Name) AS Tecnico_Nombre,
    COUNT(DISTINCT tt.Fk_Service_Request) AS Tickets_Asignados,
    SUM(CASE WHEN tt.Is_Lead = TRUE THEN 1 ELSE 0 END) AS Tickets_Como_Lead,
    SUM(CASE WHEN tt.Status = 'Activo' THEN 1 ELSE 0 END) AS Tickets_Activos
FROM Technicians t
LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
WHERE t.Status = 'Activo'
GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name
ORDER BY Tickets_Asignados DESC;

-- Técnicos disponibles para asignación (menos carga de trabajo)
SELECT 
    t.ID_Technicians,
    CONCAT(t.First_Name, ' ', t.Last_Name) AS Tecnico_Nombre,
    COUNT(DISTINCT tt.Fk_Service_Request) AS Tickets_Actuales,
    GROUP_CONCAT(DISTINCT ts.Type_Service SEPARATOR ', ') AS Servicios
FROM Technicians t
LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician AND tt.Status = 'Activo'
LEFT JOIN Technicians_Service tech_svc ON t.ID_Technicians = tech_svc.Fk_Technicians
LEFT JOIN TI_Service ts ON tech_svc.Fk_TI_Service = ts.ID_TI_Service
WHERE t.Status = 'Activo'
GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name
ORDER BY Tickets_Actuales ASC;

-- Técnicos asignados a un ticket específico
SELECT 
    tt.ID_Ticket_Technician,
    CONCAT(t.First_Name, ' ', t.Last_Name) AS Tecnico_Nombre,
    tt.Is_Lead AS Es_Lider,
    tt.Assignment_Role AS Rol,
    tt.Status AS Estado_Asignacion,
    tt.Assigned_At AS Fecha_Asignacion,
    u_assigner.Email AS Asignado_Por
FROM Ticket_Technicians tt
JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
JOIN Users u_assigner ON tt.Fk_Assigned_By = u_assigner.ID_Users
WHERE tt.Fk_Service_Request = 1 -- Reemplazar con ID del ticket
ORDER BY tt.Is_Lead DESC, tt.Assigned_At;

-- ==========================================
-- 3. CONSULTAS DE OFICINAS
-- ==========================================

-- Estructura jerárquica completa de oficinas
SELECT 
    o.ID_Office,
    o.Name_Office,
    o.Office_Type,
    parent_o.Name_Office AS Oficina_Padre,
    b.Name_Boss AS Jefe,
    COUNT(sr.ID_Service_Request) AS Tickets_Generados
FROM Office o
LEFT JOIN Office parent_o ON o.Fk_Parent_Office = parent_o.ID_Office
LEFT JOIN Boss b ON o.Fk_Boss_ID = b.ID_Boss
LEFT JOIN Service_Request sr ON o.ID_Office = sr.Fk_Office
GROUP BY o.ID_Office, o.Name_Office, o.Office_Type, parent_o.Name_Office, b.Name_Boss
ORDER BY 
    CASE o.Office_Type
        WHEN 'Direction' THEN 1
        WHEN 'Division' THEN 2
        WHEN 'Coordination' THEN 3
    END,
    o.Name_Office;

-- Oficinas por tipo con estadísticas
SELECT 
    Office_Type,
    COUNT(*) AS Total_Oficinas,
    SUM(CASE WHEN Fk_Boss_ID IS NOT NULL THEN 1 ELSE 0 END) AS Con_Jefe_Asignado
FROM Office
GROUP BY Office_Type;

-- Sistemas de software por oficina
SELECT 
    o.Name_Office AS Oficina,
    ss.System_Name AS Sistema,
    ss.Description AS Descripcion,
    ss.Status AS Estado_Sistema
FROM Office_Systems os
JOIN Office o ON os.Fk_Office_ID = o.ID_Office
JOIN Software_Systems ss ON os.Fk_System_ID = ss.ID_System
ORDER BY o.Name_Office, ss.System_Name;

-- ==========================================
-- 4. CONSULTAS DE TIMELINE
-- ==========================================

-- Historial completo de cambios de un ticket
SELECT 
    tl.ID_Timeline,
    tl.Event_Date,
    u.Email AS Usuario,
    tl.Action_Description,
    tl.Old_Status AS Estado_Anterior,
    tl.New_Status AS Estado_Nuevo
FROM Ticket_Timeline tl
JOIN Users u ON tl.Fk_User_Actor = u.ID_Users
WHERE tl.Fk_Service_Request = 1 -- Reemplazar con ID del ticket
ORDER BY tl.Event_Date ASC;

-- Últimos cambios en el sistema
SELECT 
    sr.Ticket_Code,
    tl.Event_Date,
    u.Email AS Usuario,
    tl.Action_Description,
    tl.New_Status AS Estado_Actual
FROM Ticket_Timeline tl
JOIN Service_Request sr ON tl.Fk_Service_Request = sr.ID_Service_Request
JOIN Users u ON tl.Fk_User_Actor = u.ID_Users
ORDER BY tl.Event_Date DESC
LIMIT 20;

-- Cambios de estado por usuario
SELECT 
    u.Email AS Usuario,
    COUNT(tl.ID_Timeline) AS Total_Cambios,
    COUNT(DISTINCT tl.Fk_Service_Request) AS Tickets_Modificados
FROM Ticket_Timeline tl
JOIN Users u ON tl.Fk_User_Actor = u.ID_Users
GROUP BY u.ID_Users, u.Email
ORDER BY Total_Cambios DESC;

-- ==========================================
-- 5. CONSULTAS DE REPORTES
-- ==========================================

-- KPIs generales del sistema
SELECT 
    (SELECT COUNT(*) FROM Service_Request) AS Total_Tickets,
    (SELECT COUNT(*) FROM Service_Request WHERE Status = 'Pendiente') AS Tickets_Pendientes,
    (SELECT COUNT(*) FROM Service_Request WHERE Status = 'En Proceso') AS Tickets_En_Proceso,
    (SELECT COUNT(*) FROM Service_Request WHERE Status = 'Resuelto') AS Tickets_Resueltos,
    (SELECT COUNT(*) FROM Technicians WHERE Status = 'Activo') AS Tecnicos_Activos,
    (SELECT COUNT(*) FROM Office) AS Total_Oficinas,
    (SELECT COUNT(*) FROM Software_Systems WHERE Status = 'Activo') AS Sistemas_Activos;

-- Tiempo promedio de resolución por servicio
SELECT 
    ts.Type_Service AS Servicio,
    COUNT(sr.ID_Service_Request) AS Total_Tickets,
    ROUND(AVG(DATEDIFF(COALESCE(sr.Resolved_at, NOW()), sr.Created_at)), 2) AS Promedio_Dias,
    MIN(DATEDIFF(COALESCE(sr.Resolved_at, NOW()), sr.Created_at)) AS Min_Dias,
    MAX(DATEDIFF(COALESCE(sr.Resolved_at, NOW()), sr.Created_at)) AS Max_Dias
FROM Service_Request sr
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Status = 'Resuelto'
GROUP BY ts.ID_TI_Service, ts.Type_Service
ORDER BY Promedio_Dias;

-- Tickets creados por mes (últimos 6 meses)
SELECT 
    DATE_FORMAT(sr.Created_at, '%Y-%m') AS Mes,
    COUNT(*) AS Total_Tickets,
    SUM(CASE WHEN sr.Status = 'Resuelto' THEN 1 ELSE 0 END) AS Tickets_Resueltos
FROM Service_Request sr
WHERE sr.Created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(sr.Created_at, '%Y-%m')
ORDER BY Mes DESC;

-- Top 5 problemas más comunes
SELECT 
    spc.Problem_Name AS Problema,
    ts.Type_Service AS Servicio,
    COUNT(sr.ID_Service_Request) AS Total_Tickets,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request), 2) AS Porcentaje
FROM Service_Problems_Catalog spc
JOIN TI_Service ts ON spc.Fk_TI_Service = ts.ID_TI_Service
LEFT JOIN Service_Request sr ON spc.ID_Problem_Catalog = sr.Fk_Problem_Catalog
GROUP BY spc.ID_Problem_Catalog, spc.Problem_Name, ts.Type_Service
ORDER BY Total_Tickets DESC
LIMIT 5;

-- ==========================================
-- 6. CONSULTAS DE BÚSQUEDA
-- ==========================================

-- Buscar tickets por código
SELECT 
    sr.*,
    o.Name_Office AS Oficina,
    ts.Type_Service AS Servicio
FROM Service_Request sr
JOIN Office o ON sr.Fk_Office = o.ID_Office
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Ticket_Code LIKE '%RED-000001%'; -- Reemplazar con código a buscar

-- Buscar tickets por asunto
SELECT 
    sr.*,
    o.Name_Office AS Oficina,
    ts.Type_Service AS Servicio
FROM Service_Request sr
JOIN Office o ON sr.Fk_Office = o.ID_Office
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Subject LIKE '%internet%'; -- Reemplazar con término a buscar

-- Buscar técnicos por nombre
SELECT 
    t.*,
    u.Email
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
WHERE t.First_Name LIKE '%Juan%' OR t.Last_Name LIKE '%Perez%'; -- Reemplazar con nombre a buscar

-- ==========================================
-- 7. CONSULTAS DE COMENTARIOS Y ADJUNTOS
-- ==========================================

-- Comentarios de un ticket específico
SELECT 
    tc.ID_Comment,
    tc.Comment,
    tc.Created_at,
    u.Email AS Usuario
FROM Ticket_Comments tc
JOIN Users u ON tc.Fk_User = u.ID_Users
WHERE tc.Fk_Service_Request = 1 -- Reemplazar con ID del ticket
ORDER BY tc.Created_at ASC;

-- Tickets con más comentarios
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    COUNT(tc.ID_Comment) AS Total_Comentarios
FROM Service_Request sr
LEFT JOIN Ticket_Comments tc ON sr.ID_Service_Request = tc.Fk_Service_Request
GROUP BY sr.ID_Service_Request, sr.Ticket_Code, sr.Subject
ORDER BY Total_Comentarios DESC
LIMIT 10;

-- Adjuntos de un ticket específico
SELECT 
    ta.ID_Attachment,
    ta.File_Name,
    ta.File_Path,
    ta.Uploaded_at
FROM Ticket_Attachments ta
WHERE ta.Fk_Service_Request = 1 -- Reemplazar con ID del ticket
ORDER BY ta.Uploaded_at ASC;

-- Tickets con adjuntos
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    COUNT(ta.ID_Attachment) AS Total_Adjuntos
FROM Service_Request sr
LEFT JOIN Ticket_Attachments ta ON sr.ID_Service_Request = ta.Fk_Service_Request
GROUP BY sr.ID_Service_Request, sr.Ticket_Code, sr.Subject
HAVING COUNT(ta.ID_Attachment) > 0
ORDER BY Total_Adjuntos DESC;

-- ==========================================
-- FIN DEL SCRIPT DE CONSULTAS
-- ==========================================
