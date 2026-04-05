-- ==========================================
-- CONSULTAS PARA OBTENER DATOS DE ALCALDÍA TICKETS DB
-- ==========================================

USE alcaldia_tickets_db;

-- ==========================================
-- 1. CONSULTAS BÁSICAS
-- ==========================================

-- 1.1 Mostrar todos los usuarios con sus roles
SELECT 
    u.ID_Users,
    u.First_Name,
    u.Last_Name,
    u.Email,
    r.Role_Name,
    u.created_at
FROM Users u
JOIN Role r ON u.Fk_Role = r.ID_Role
ORDER BY u.ID_Users;

-- 1.2 Mostrar todos los técnicos con su estado
SELECT 
    t.ID_Technicians,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Tecnico,
    u.Email,
    t.Status,
    t.created_at
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
ORDER BY t.ID_Technicians;

-- 1.3 Mostrar todas las oficinas
SELECT 
    ID_Office,
    Name_Office,
    Building,
    Telephone_Number,
    created_at
FROM Office
ORDER BY Name_Office;

-- 1.4 Mostrar tipos de servicio disponibles
SELECT 
    ID_TI_Service,
    Type_Service,
    Details
FROM TI_Service
ORDER BY Type_Service;

-- ==========================================
-- 2. CONSULTAS DE TICKETS
-- ==========================================

-- 2.1 Mostrar todos los tickets con información completa
SELECT 
    sr.ID_Service_Request,
    sr.Ticket_Code,
    sr.Subject,
    sr.Status,
    sr.User_Priority,
    sr.System_Priority,
    sr.Created_at,
    sr.Resolved_at,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Usuario,
    o.Name_Office AS Oficina,
    ts.Type_Service AS Tipo_Servicio,
    CASE 
        WHEN sr.Fk_Technician_Current IS NOT NULL 
        THEN CONCAT(tu.First_Name, ' ', tu.Last_Name)
        ELSE 'Sin asignar'
    END AS Tecnico_Asignado
FROM Service_Request sr
JOIN Users u ON sr.Fk_Users = u.ID_Users
JOIN Office o ON sr.FK_Office = o.ID_Office
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
LEFT JOIN Technicians t ON sr.Fk_Technician_Current = t.ID_Technicians
LEFT JOIN Users tu ON t.Fk_Users = tu.ID_Users
ORDER BY sr.Created_at DESC;

-- 2.2 Tickets por estado
SELECT 
    Status,
    COUNT(*) AS Cantidad_Tickets,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Service_Request), 2) AS Porcentaje
FROM Service_Request
GROUP BY Status
ORDER BY Cantidad_Tickets DESC;

-- 2.3 Tickets por prioridad
SELECT 
    User_Priority,
    COUNT(*) AS Cantidad_Tickets
FROM Service_Request
GROUP BY User_Priority
ORDER BY 
    CASE User_Priority
        WHEN 'Alta' THEN 1
        WHEN 'Media' THEN 2
        WHEN 'Baja' THEN 3
    END;

-- 2.4 Tickets por tipo de servicio
SELECT 
    ts.Type_Service,
    COUNT(*) AS Cantidad_Tickets,
    AVG(CASE WHEN sr.Status = 'Resuelto' 
        THEN DATEDIFF(sr.Resolved_at, sr.Created_at)
        ELSE NULL
    END) AS Tiempo_Promedio_Resolucion_Dias
FROM Service_Request sr
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
GROUP BY ts.Type_Service
ORDER BY Cantidad_Tickets DESC;

-- 2.5 Tickets por oficina
SELECT 
    o.Name_Office,
    COUNT(*) AS Cantidad_Tickets,
    COUNT(CASE WHEN sr.Status = 'Resuelto' THEN 1 END) AS Tickets_Resueltos,
    COUNT(CASE WHEN sr.Status = 'En Progreso' THEN 1 END) AS Tickets_En_Progreso,
    COUNT(CASE WHEN sr.Status = 'Pendiente' THEN 1 END) AS Tickets_Pendientes
FROM Service_Request sr
JOIN Office o ON sr.FK_Office = o.ID_Office
GROUP BY o.Name_Office
ORDER BY Cantidad_Tickets DESC;

-- ==========================================
-- 3. CONSULTAS DE TÉCNICOS Y SERVICIOS
-- ==========================================

-- 3.1 Especialidades de cada técnico
SELECT 
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Tecnico,
    t.Status,
    GROUP_CONCAT(ts.Type_Service SEPARATOR ', ') AS Especialidades
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
JOIN Technicians_Service tserv ON t.ID_Technicians = tserv.Fk_Technicians
JOIN TI_Service ts ON tserv.Fk_TI_Service = ts.ID_TI_Service
GROUP BY t.ID_Technicians, u.First_Name, u.Last_Name, t.Status
ORDER BY u.First_Name, u.Last_Name;

-- 3.2 Carga de trabajo de técnicos
SELECT 
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Tecnico,
    t.Status,
    COUNT(sr.ID_Service_Request) AS Tickets_Asignados,
    COUNT(CASE WHEN sr.Status = 'Resuelto' THEN 1 END) AS Tickets_Resueltos,
    COUNT(CASE WHEN sr.Status = 'En Progreso' THEN 1 END) AS Tickets_En_Progreso,
    COUNT(CASE WHEN sr.Status = 'Pendiente' THEN 1 END) AS Tickets_Pendientes
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
LEFT JOIN Service_Request sr ON t.ID_Technicians = sr.Fk_Technician_Current
GROUP BY t.ID_Technicians, u.First_Name, u.Last_Name, t.Status
ORDER BY Tickets_Asignados DESC;

-- 3.3 Técnicos disponibles por especialidad
SELECT 
    ts.Type_Service,
    COUNT(t.ID_Technicians) AS Total_Tecnicos,
    COUNT(CASE WHEN t.Status = 'Disponible' THEN 1 END) AS Tecnicos_Disponibles,
    COUNT(CASE WHEN t.Status = 'Ocupado' THEN 1 END) AS Tecnicos_Ocupados
FROM TI_Service ts
LEFT JOIN Technicians_Service tserv ON ts.ID_TI_Service = tserv.Fk_TI_Service
LEFT JOIN Technicians t ON tserv.Fk_Technicians = t.ID_Technicians
GROUP BY ts.ID_TI_Service, ts.Type_Service
ORDER BY ts.Type_Service;

-- ==========================================
-- 4. CONSULTAS DE TIEMPOS Y ESTADÍSTICAS
-- ==========================================

-- 4.1 Tiempo promedio de resolución por tipo de servicio
SELECT 
    ts.Type_Service,
    COUNT(*) AS Total_Tickets,
    AVG(DATEDIFF(sr.Resolved_at, sr.Created_at)) AS Tiempo_Promedio_Dias,
    MIN(DATEDIFF(sr.Resolved_at, sr.Created_at)) AS Tiempo_Minimo_Dias,
    MAX(DATEDIFF(sr.Resolved_at, sr.Created_at)) AS Tiempo_Maximo_Dias
FROM Service_Request sr
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Status = 'Resuelto' AND sr.Resolved_at IS NOT NULL
GROUP BY ts.Type_Service
ORDER BY Tiempo_Promedio_Dias;

-- 4.2 Tickets creados por mes
SELECT 
    DATE_FORMAT(Created_at, '%Y-%m') AS Mes,
    COUNT(*) AS Cantidad_Tickets,
    COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) AS Tickets_Resueltos
FROM Service_Request
GROUP BY DATE_FORMAT(Created_at, '%Y-%m')
ORDER BY Mes DESC;

-- 4.3 Estadísticas generales del sistema
SELECT 
    'Total Usuarios' AS Metrica,
    COUNT(*) AS Valor
FROM Users
UNION ALL
SELECT 
    'Total Técnicos' AS Metrica,
    COUNT(*) AS Valor
FROM Technicians
UNION ALL
SELECT 
    'Total Oficinas' AS Metrica,
    COUNT(*) AS Valor
FROM Office
UNION ALL
SELECT 
    'Total Tickets' AS Metrica,
    COUNT(*) AS Valor
FROM Service_Request
UNION ALL
SELECT 
    'Tickets Resueltos' AS Metrica,
    COUNT(*) AS Valor
FROM Service_Request
WHERE Status = 'Resuelto'
UNION ALL
SELECT 
    'Tickets En Progreso' AS Metrica,
    COUNT(*) AS Valor
FROM Service_Request
WHERE Status = 'En Progreso'
UNION ALL
SELECT 
    'Tickets Pendientes' AS Metrica,
    COUNT(*) AS Valor
FROM Service_Request
WHERE Status = 'Pendiente';

-- ==========================================
-- 5. CONSULTAS DE ACTIVIDAD RECIENTE
-- ==========================================

-- 5.1 Últimos 10 tickets creados
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    sr.Status,
    sr.Created_at,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Usuario,
    o.Name_Office AS Oficina
FROM Service_Request sr
JOIN Users u ON sr.Fk_Users = u.ID_Users
JOIN Office o ON sr.FK_Office = o.ID_Office
ORDER BY sr.Created_at DESC
LIMIT 10;

-- 5.2 Tickets resueltos recientemente
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    sr.Resolved_at,
    DATEDIFF(sr.Resolved_at, sr.Created_at) AS Dias_Para_Resolver,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Usuario,
    CONCAT(tu.First_Name, ' ', tu.Last_Name) AS Tecnico
FROM Service_Request sr
JOIN Users u ON sr.Fk_Users = u.ID_Users
JOIN Technicians t ON sr.Fk_Technician_Current = t.ID_Technicians
JOIN Users tu ON t.Fk_Users = tu.ID_Users
WHERE sr.Status = 'Resuelto' AND sr.Resolved_at IS NOT NULL
ORDER BY sr.Resolved_at DESC
LIMIT 10;

-- 5.3 Comentarios recientes en tickets
SELECT 
    tc.ID_Comment,
    sr.Ticket_Code,
    sr.Subject,
    tc.Comment,
    tc.Is_Internal,
    tc.Created_at,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Usuario
FROM Ticket_Comments tc
JOIN Service_Request sr ON tc.Fk_Service_Request = sr.ID_Service_Request
JOIN Users u ON tc.Fk_User = u.ID_Users
ORDER BY tc.Created_at DESC
LIMIT 10;

-- ==========================================
-- 6. CONSULTAS DE BÚSQUEDA Y FILTRADO
-- ==========================================

-- 6.1 Buscar tickets por texto en asunto o descripción
-- Reemplazar 'palabra_clave' por el término a buscar
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    sr.Description,
    sr.Status,
    sr.Created_at,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Usuario
FROM Service_Request sr
JOIN Users u ON sr.Fk_Users = u.ID_Users
WHERE sr.Subject LIKE '%palabra_clave%' 
   OR sr.Description LIKE '%palabra_clave%'
ORDER BY sr.Created_at DESC;

-- 6.2 Tickets de un usuario específico
-- Reemplazar ID_Usuario por el ID del usuario deseado
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    sr.Status,
    sr.User_Priority,
    sr.Created_at,
    ts.Type_Service
FROM Service_Request sr
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Fk_Users = 11  -- ID del usuario
ORDER BY sr.Created_at DESC;

-- 6.3 Tickets asignados a un técnico específico
-- Reemplazar ID_Tecnico por el ID del técnico deseado
SELECT 
    sr.Ticket_Code,
    sr.Subject,
    sr.Status,
    sr.User_Priority,
    sr.Created_at,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Usuario
FROM Service_Request sr
JOIN Users u ON sr.Fk_Users = u.ID_Users
WHERE sr.Fk_Technician_Current = 1  -- ID del técnico
ORDER BY sr.Created_at DESC;

-- ==========================================
-- 7. REPORTES AVANZADOS
-- ==========================================

-- 7.1 Dashboard general - Resumen completo
SELECT 
    'Usuarios Totales' AS Indicador,
    COUNT(*) AS Valor,
    '' AS Detalle
FROM Users
UNION ALL
SELECT 
    'Técnicos Activos' AS Indicador,
    COUNT(*) AS Valor,
    CONCAT(COUNT(CASE WHEN Status = 'Disponible' THEN 1 END), ' disponibles') AS Detalle
FROM Technicians
UNION ALL
SELECT 
    'Tickets Totales' AS Indicador,
    COUNT(*) AS Valor,
    CONCAT(COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END), ' resueltos') AS Detalle
FROM Service_Request
UNION ALL
SELECT 
    'Tickets Pendientes' AS Indicador,
    COUNT(*) AS Valor,
    'Por asignar o en espera' AS Detalle
FROM Service_Request
WHERE Status = 'Pendiente'
UNION ALL
SELECT 
    'Tiempo Promedio Resolución' AS Indicador,
    ROUND(AVG(DATEDIFF(Resolved_at, Created_at)), 1) AS Valor,
    'Días' AS Detalle
FROM Service_Request
WHERE Status = 'Resuelto' AND Resolved_at IS NOT NULL;

-- 7.2 Productividad por técnico
SELECT 
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Tecnico,
    COUNT(sr.ID_Service_Request) AS Total_Tickets,
    COUNT(CASE WHEN sr.Status = 'Resuelto' THEN 1 END) AS Tickets_Resueltos,
    ROUND(COUNT(CASE WHEN sr.Status = 'Resuelto' THEN 1 END) * 100.0 / COUNT(sr.ID_Service_Request), 2) AS Tasa_Resolucion,
    AVG(CASE WHEN sr.Status = 'Resuelto' THEN DATEDIFF(sr.Resolved_at, sr.Created_at) ELSE NULL END) AS Tiempo_Promedio_Resolucion
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
LEFT JOIN Service_Request sr ON t.ID_Technicians = sr.Fk_Technician_Current
GROUP BY t.ID_Technicians, u.First_Name, u.Last_Name
ORDER BY Tickets_Resueltos DESC;

-- 7.3 Análisis de oficinas con más solicitudes
SELECT 
    o.Name_Office,
    COUNT(sr.ID_Service_Request) AS Total_Tickets,
    COUNT(CASE WHEN sr.Status = 'Resuelto' THEN 1 END) AS Tickets_Resueltos,
    ROUND(COUNT(CASE WHEN sr.Status = 'Resuelto' THEN 1 END) * 100.0 / COUNT(sr.ID_Service_Request), 2) AS Tasa_Resolucion,
    AVG(CASE WHEN sr.Status = 'Resuelto' THEN DATEDIFF(sr.Resolved_at, sr.Created_at) ELSE NULL END) AS Tiempo_Promedio_Resolucion
FROM Office o
LEFT JOIN Service_Request sr ON o.ID_Office = sr.FK_Office
GROUP BY o.ID_Office, o.Name_Office
HAVING Total_Tickets > 0
ORDER BY Total_Tickets DESC;
