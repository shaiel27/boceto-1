-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS MUNICIPAL
-- ==========================================
-- Script de Constraints, Triggers y Funciones - MySQL 8.0+
-- Creado: $(date '+%Y-%m-%d %H:%M:%S')
-- ==========================================

USE alcaldia_tickets_db;

-- ==========================================
-- 1. CONSTRAINTS ADICIONALES
-- ==========================================

-- Validación de formato de email
ALTER TABLE Users 
ADD CONSTRAINT chk_email_format 
CHECK (Email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

-- Validación de formato de CI (venezolano)
ALTER TABLE Users 
ADD CONSTRAINT chk_ci_format 
CHECK (CI REGEXP '^(VE|E)-[0-9]{7,8}$');

-- Validación de formato de teléfono
ALTER TABLE Users 
ADD CONSTRAINT chk_phone_format 
CHECK (Telephone_Number REGEXP '^\\\\+?[0-9]{10,15}$' OR Telephone_Number IS NULL);

-- Validación de Status en Technicians
ALTER TABLE Technicians 
ADD CONSTRAINT chk_technician_status 
CHECK (Status IN ('Disponible', 'Desestituido', 'Vacaciones'));

-- Validación de Request_Type en Service_Request
ALTER TABLE Service_Request 
ADD CONSTRAINT chk_request_type 
CHECK (Request_Type IN ('Digital', 'Fisico'));

-- Validación de User_Priority en Service_Request
ALTER TABLE Service_Request 
ADD CONSTRAINT chk_user_priority 
CHECK (User_Priority IN ('Baja', 'Media', 'Alta', 'Urgente'));

-- Validación de System_Priority en Service_Request
ALTER TABLE Service_Request 
ADD CONSTRAINT chk_system_priority 
CHECK (System_Priority IN ('Baja', 'Media', 'Alta', 'Urgente') OR System_Priority IS NULL);

-- Validación de Status en Service_Request
ALTER TABLE Service_Request 
ADD CONSTRAINT chk_service_status 
CHECK (Status IN ('Pendiente', 'En Proceso', 'Resuelto', 'Cancelado', 'Reabierto'));

-- Validación de Day_Of_Week en Technician_Schedules
ALTER TABLE Technician_Schedules 
ADD CONSTRAINT chk_day_of_week 
CHECK (Day_Of_Week IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'));

-- Validación de horarios lógicos
ALTER TABLE Technician_Schedules 
ADD CONSTRAINT chk_work_hours 
CHECK (Work_End_Time > Work_Start_Time);

-- Validación de horarios laborales (8am-6pm máximo)
ALTER TABLE Technician_Schedules 
ADD CONSTRAINT chk_business_hours 
CHECK (Work_Start_Time >= '08:00:00' AND Work_End_Time <= '18:00:00');

-- Validación de bloques de almuerzo lógicos
ALTER TABLE Lunch_Blocks 
ADD CONSTRAINT chk_lunch_time 
CHECK (End_Time > Start_Time);

-- Validación de bloques de almuerzo en horario laboral
ALTER TABLE Lunch_Blocks 
ADD CONSTRAINT chk_lunch_business_hours 
CHECK (Start_Time >= '11:00:00' AND End_Time <= '14:30:00');

-- Validación de status en Technicians_Service
ALTER TABLE Technicians_Service 
ADD CONSTRAINT chk_service_status 
CHECK (status IN ('Activo', 'Inactivo', 'En Formación'));

-- ==========================================
-- 2. TRIGGERS PARA AUTOMATIZACIÓN
-- ==========================================

-- Trigger para generar código de ticket automáticamente
DELIMITER $$
CREATE TRIGGER trg_generate_ticket_code
BEFORE INSERT ON Service_Request
FOR EACH ROW
BEGIN
    DECLARE new_code VARCHAR(20);
    DECLARE year_part VARCHAR(4);
    DECLARE sequence_num INT;
    
    SET year_part = YEAR(CURDATE());
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(Ticket_Code FROM 7) AS UNSIGNED)), 0) + 1
    INTO sequence_num
    FROM Service_Request
    WHERE Ticket_Code LIKE CONCAT('T-', year_part, '-%');
    
    SET new_code = CONCAT('T-', year_part, '-', LPAD(sequence_num, 4, '0'));
    SET NEW.Ticket_Code = new_code;
END$$
DELIMITER ;

-- Trigger para actualizar System_Priority basado en User_Priority y antigüedad
DELIMITER $$
CREATE TRIGGER trg_calculate_system_priority
BEFORE INSERT ON Service_Request
FOR EACH ROW
BEGIN
    DECLARE days_old INT;
    
    SET days_old = DATEDIFF(CURDATE(), NEW.Created_at);
    
    CASE NEW.User_Priority
        WHEN 'Urgente' THEN SET NEW.System_Priority = 'Urgente';
        WHEN 'Alta' THEN 
            IF days_old > 3 THEN SET NEW.System_Priority = 'Urgente';
            ELSE SET NEW.System_Priority = 'Alta';
            END IF;
        WHEN 'Media' THEN
            IF days_old > 7 THEN SET NEW.System_Priority = 'Alta';
            ELSE SET NEW.System_Priority = 'Media';
            END IF;
        WHEN 'Baja' THEN
            IF days_old > 10 THEN SET NEW.System_Priority = 'Media';
            ELSE SET NEW.System_Priority = 'Baja';
            END IF;
    END CASE;
END$$
DELIMITER ;

-- Trigger para actualizar System_Priority en UPDATE
DELIMITER $$
CREATE TRIGGER trg_calculate_system_priority_update
BEFORE UPDATE ON Service_Request
FOR EACH ROW
BEGIN
    DECLARE days_old INT;
    
    SET days_old = DATEDIFF(CURDATE(), NEW.Created_at);
    
    CASE NEW.User_Priority
        WHEN 'Urgente' THEN SET NEW.System_Priority = 'Urgente';
        WHEN 'Alta' THEN 
            IF days_old > 3 THEN SET NEW.System_Priority = 'Urgente';
            ELSE SET NEW.System_Priority = 'Alta';
            END IF;
        WHEN 'Media' THEN
            IF days_old > 7 THEN SET NEW.System_Priority = 'Alta';
            ELSE SET NEW.System_Priority = 'Media';
            END IF;
        WHEN 'Baja' THEN
            IF days_old > 10 THEN SET NEW.System_Priority = 'Media';
            ELSE SET NEW.System_Priority = 'Baja';
            END IF;
    END CASE;
END$$
DELIMITER ;

-- Trigger para registrar historial de asignaciones
DELIMITER $$
CREATE TRIGGER trg_log_assignment_history
BEFORE UPDATE ON Service_Request
FOR EACH ROW
BEGIN
    IF OLD.Fk_Technician_Current IS NOT NULL 
       AND NEW.Fk_Technician_Current IS NOT NULL
       AND OLD.Fk_Technician_Current != NEW.Fk_Technician_Current THEN
        
        INSERT INTO Ticket_Assignments_History (Fk_Service_Request, Fk_Technician, Fk_Assigned_By, Assignment_Date)
        VALUES (NEW.ID_Service_Request, NEW.Fk_Technician_Current, 
                NEW.Fk_Technician_Current, CURRENT_TIMESTAMP);
    END IF;
END$$
DELIMITER ;

-- Trigger para actualizar fecha de resolución
DELIMITER $$
CREATE TRIGGER trg_update_resolved_at
BEFORE UPDATE ON Service_Request
FOR EACH ROW
BEGIN
    IF OLD.Status != NEW.Status AND NEW.Status = 'Resuelto' THEN
        SET NEW.Resolved_at = CURRENT_TIMESTAMP;
    ELSEIF OLD.Status != NEW.Status AND NEW.Status != 'Resuelto' THEN
        SET NEW.Resolved_at = NULL;
    END IF;
END$$
DELIMITER ;

-- Trigger para validar que un técnico no tenga solapamiento de horarios (INSERT)
DELIMITER $$
CREATE TRIGGER trg_validate_technician_schedule_insert
BEFORE INSERT ON Technician_Schedules
FOR EACH ROW
BEGIN
    DECLARE schedule_count INT;
    DECLARE error_message VARCHAR(255);
    
    SELECT COUNT(*)
    INTO schedule_count
    FROM Technician_Schedules
    WHERE Fk_Technician = NEW.Fk_Technician
      AND Day_Of_Week = NEW.Day_Of_Week
      AND (
        (Work_Start_Time <= NEW.Work_Start_Time AND Work_End_Time > NEW.Work_Start_Time) OR
        (Work_Start_Time < NEW.Work_End_Time AND Work_End_Time >= NEW.Work_End_Time) OR
        (Work_Start_Time >= NEW.Work_Start_Time AND Work_End_Time <= NEW.Work_End_Time)
      );
    
    IF schedule_count > 0 THEN
        SET error_message = CONCAT('Solapamiento de horarios detectado para el técnico ', NEW.Fk_Technician, ' en el día ', NEW.Day_Of_Week);
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = error_message;
    END IF;
END$$
DELIMITER ;

-- Trigger para validar que un técnico no tenga solapamiento de horarios (UPDATE)
DELIMITER $$
CREATE TRIGGER trg_validate_technician_schedule_update
BEFORE UPDATE ON Technician_Schedules
FOR EACH ROW
BEGIN
    DECLARE schedule_count INT;
    DECLARE error_message VARCHAR(255);
    
    SELECT COUNT(*)
    INTO schedule_count
    FROM Technician_Schedules
    WHERE Fk_Technician = NEW.Fk_Technician
      AND Day_Of_Week = NEW.Day_Of_Week
      AND ID_Schedule != NEW.ID_Schedule
      AND (
        (Work_Start_Time <= NEW.Work_Start_Time AND Work_End_Time > NEW.Work_Start_Time) OR
        (Work_Start_Time < NEW.Work_End_Time AND Work_End_Time >= NEW.Work_End_Time) OR
        (Work_Start_Time >= NEW.Work_Start_Time AND Work_End_Time <= NEW.Work_End_Time)
      );
    
    IF schedule_count > 0 THEN
        SET error_message = CONCAT('Solapamiento de horarios detectado para el técnico ', NEW.Fk_Technician, ' en el día ', NEW.Day_Of_Week);
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = error_message;
    END IF;
END$$
DELIMITER ;

-- ==========================================
-- 3. PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ==========================================

-- Obtener el próximo técnico disponible para un servicio
DELIMITER $$
CREATE PROCEDURE get_next_available_technician(
    IN p_service_type VARCHAR(50),
    OUT p_technician_id INT
)
BEGIN
    SELECT T.ID_Technicians
    INTO p_technician_id
    FROM Technicians T
    INNER JOIN Technicians_Service TS ON T.ID_Technicians = TS.Fk_Technicians
    INNER JOIN TI_Service TI ON TS.Fk_TI_Service = TI.ID_TI_Service
    WHERE T.Status = 'Disponible'
      AND TI.Type_Service = p_service_type
      AND TS.status = 'Activo'
    ORDER BY RAND()
    LIMIT 1;
END$$
DELIMITER ;

-- Calcular tiempo promedio de resolución
DELIMITER $$
CREATE PROCEDURE get_avg_resolution_time(
    IN p_days INT DEFAULT 30,
    OUT p_avg_time DECIMAL(10,2)
)
BEGIN
    SELECT AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW())))
    INTO p_avg_time
    FROM Service_Request SR
    WHERE SR.Status = 'Resuelto'
      AND SR.Created_at >= DATE_SUB(CURDATE(), INTERVAL p_days DAY);
    
    IF p_avg_time IS NULL THEN
        SET p_avg_time = 0;
    END IF;
END$$
DELIMITER ;

-- Obtener estadísticas de tickets por coordinación
DELIMITER $$
CREATE PROCEDURE get_tickets_by_coordination(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        C.Name_Coordination AS coordination_name,
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) AS resolved_tickets,
        COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) AS pending_tickets,
        AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW()))) AS avg_resolution_time
    FROM Service_Request SR
    INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
    WHERE (p_start_date IS NULL OR SR.Created_at >= p_start_date)
      AND (p_end_date IS NULL OR SR.Created_at <= p_end_date)
    GROUP BY C.Name_Coordination
    ORDER BY total_tickets DESC;
END$$
DELIMITER ;

-- Obtener estadísticas generales del dashboard
DELIMITER $$
CREATE PROCEDURE get_dashboard_stats(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN Status = 'Resuelto' THEN 1 END) AS resolved_tickets,
        COUNT(CASE WHEN Status != 'Resuelto' THEN 1 END) AS pending_tickets,
        COUNT(CASE WHEN DATE(Created_at) = CURDATE() THEN 1 END) AS created_today,
        COUNT(CASE WHEN Status = 'Resuelto' AND DATE(Resolved_at) = CURDATE() THEN 1 END) AS resolved_today,
        AVG(CASE WHEN Status = 'Resuelto' THEN TIMESTAMPDIFF(HOUR, Created_at, Resolved_at) END) AS avg_resolution_hours,
        (SELECT COUNT(*) FROM Technicians WHERE Status = 'Disponible') AS available_technicians,
        (SELECT COUNT(*) FROM Technicians) AS total_technicians,
        COUNT(CASE WHEN User_Priority = 'Urgente' AND Status != 'Resuelto' THEN 1 END) AS urgent_tickets,
        COUNT(CASE WHEN User_Priority = 'Alta' AND Status != 'Resuelto' THEN 1 END) AS high_priority_tickets,
        COUNT(CASE WHEN Status != 'Resuelto' AND Created_at < DATE_SUB(CURDATE(), INTERVAL 3 DAY) THEN 1 END) AS overdue_tickets
    FROM Service_Request
    WHERE (p_start_date IS NULL OR Created_at >= p_start_date)
      AND (p_end_date IS NULL OR Created_at <= p_end_date);
END$$
DELIMITER ;

-- Obtener tickets recientes con paginación
DELIMITER $$
CREATE PROCEDURE get_recent_tickets(
    IN p_limit INT DEFAULT 50,
    IN p_offset INT DEFAULT 0
)
BEGIN
    SELECT 
        SR.ID_Service_Request,
        SR.Ticket_Code,
        SR.Subject,
        SR.User_Priority,
        SR.Status,
        SR.Created_at,
        TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW())) AS time_open,
        CONCAT(U.First_Name, ' ', U.Last_Name) AS user_name,
        C.Name_Coordination AS coordination_name,
        TI.Type_Service AS service_type,
        CONCAT(TU.First_Name, ' ', TU.Last_Name) AS technician_name
    FROM Service_Request SR
    INNER JOIN Users U ON SR.Fk_Users = U.ID_Users
    INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
    INNER JOIN TI_Service TI ON SR.Fk_TI_Service = TI.ID_TI_Service
    LEFT JOIN Technicians T ON SR.Fk_Technician_Current = T.ID_Technicians
    LEFT JOIN Users TU ON T.Fk_Users = TU.ID_Users
    ORDER BY SR.Created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END$$
DELIMITER ;

-- ==========================================
-- 4. VISTAS ÚTILES PARA REPORTES
-- ==========================================

-- Vista completa de tickets con información relacionada
CREATE OR REPLACE VIEW v_service_requests_complete AS
SELECT 
    SR.ID_Service_Request,
    SR.Ticket_Code,
    SR.Subject,
    SR.Description,
    SR.Request_Type,
    SR.User_Priority,
    SR.System_Priority,
    SR.Status,
    SR.Created_at,
    SR.Resolved_at,
    SR.Property_number,
    CONCAT(U.First_Name, ' ', U.Last_Name) AS user_name,
    U.Email AS user_email,
    U.Telephone_Number AS user_phone,
    C.Name_Coordination AS coordination_name,
    D.Name_Division AS division_name,
    DIR.Name_Direction AS direction_name,
    TI.Type_Service AS service_type,
    CONCAT(TU.First_Name, ' ', TU.Last_Name) AS technician_name,
    T.Status AS technician_status,
    TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW())) AS hours_open
FROM Service_Request SR
LEFT JOIN Users U ON SR.Fk_Users = U.ID_Users
LEFT JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
LEFT JOIN Divisions D ON C.Fk_Division = D.ID_Division
LEFT JOIN Directions DIR ON D.Fk_Direction = DIR.ID_Direction
LEFT JOIN TI_Service TI ON SR.Fk_TI_Service = TI.ID_TI_Service
LEFT JOIN Technicians T ON SR.Fk_Technician_Current = T.ID_Technicians
LEFT JOIN Users TU ON T.Fk_Users = TU.ID_Users;

-- Vista de rendimiento de técnicos
CREATE OR REPLACE VIEW v_technician_performance AS
SELECT 
    T.ID_Technicians,
    CONCAT(U.First_Name, ' ', U.Last_Name) AS technician_name,
    TI.Type_Service AS service_specialization,
    COUNT(SR.ID_Service_Request) AS total_tickets_assigned,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) AS resolved_tickets,
    AVG(CASE WHEN SR.Status = 'Resuelto' THEN TIMESTAMPDIFF(HOUR, SR.Created_at, SR.Resolved_at) END) AS avg_resolution_hours,
    MAX(SR.Created_at) AS last_assignment_date
FROM Technicians T
INNER JOIN Users U ON T.Fk_Users = U.ID_Users
LEFT JOIN Technicians_Service TS ON T.ID_Technicians = TS.Fk_Technicians
LEFT JOIN TI_Service TI ON TS.Fk_TI_Service = TI.ID_TI_Service
LEFT JOIN Service_Request SR ON T.ID_Technicians = SR.Fk_Technician_Current
GROUP BY T.ID_Technicians, U.First_Name, U.Last_Name, TI.Type_Service
ORDER BY resolved_tickets DESC, total_tickets DESC;

-- Vista de estadísticas por coordinación
CREATE OR REPLACE VIEW v_coordination_stats AS
SELECT 
    C.ID_Coordination,
    C.Name_Coordination,
    D.Name_Division,
    DIR.Name_Direction,
    COUNT(*) AS total_tickets,
    COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) AS resolved_tickets,
    COUNT(CASE WHEN SR.Status != 'Resuelto' THEN 1 END) AS pending_tickets,
    ROUND(COUNT(CASE WHEN SR.Status = 'Resuelto' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS resolution_rate,
    AVG(TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW()))) AS avg_hours_open
FROM Service_Request SR
INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
INNER JOIN Divisions D ON C.Fk_Division = D.ID_Division
INNER JOIN Directions DIR ON D.Fk_Direction = DIR.ID_Direction
GROUP BY C.ID_Coordination, C.Name_Coordination, D.Name_Division, DIR.Name_Direction
ORDER BY total_tickets DESC;

-- Vista de tickets recientes para tabla principal
CREATE OR REPLACE VIEW v_recent_tickets AS
SELECT 
    SR.ID_Service_Request,
    SR.Ticket_Code,
    SR.Subject,
    SR.User_Priority,
    SR.Status,
    SR.Created_at,
    TIMESTAMPDIFF(HOUR, SR.Created_at, COALESCE(SR.Resolved_at, NOW())) AS time_open,
    CONCAT(U.First_Name, ' ', U.Last_Name) AS user_name,
    C.Name_Coordination AS coordination_name,
    TI.Type_Service AS service_type,
    CONCAT(TU.First_Name, ' ', TU.Last_Name) AS technician_name
FROM Service_Request SR
INNER JOIN Users U ON SR.Fk_Users = U.ID_Users
INNER JOIN Coordinations C ON SR.Fk_Coordination = C.ID_Coordination
INNER JOIN TI_Service TI ON SR.Fk_TI_Service = TI.ID_TI_Service
LEFT JOIN Technicians T ON SR.Fk_Technician_Current = T.ID_Technicians
LEFT JOIN Users TU ON T.Fk_Users = TU.ID_Users
ORDER BY SR.Created_at DESC;

-- ==========================================
-- COMENTARIOS FINALES
-- ==========================================
-- Este script completa la base de datos con:
-- - Constraints para integridad de datos
-- - Triggers para automatización de procesos
-- - Procedimientos almacenados útiles
-- - Vistas optimizadas para reportes
--
-- Para ejecutar este script:
-- mysql -u root -p alcaldia_tickets_db < 02_constraints_triggers.sql
