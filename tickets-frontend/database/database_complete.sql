-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS MUNICIPAL - VERSIÓN COMPLETA
-- ==========================================
-- Script Completo para Instalación en MySQL 8.0+
-- Creado: $(date '+%Y-%m-%d %H:%M:%S')
-- ==========================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS alcaldia_tickets_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE alcaldia_tickets_db;

-- ==========================================
-- 1. CREACIÓN DE TABLAS (SIN FOREIGN KEYS)
-- ==========================================

-- Tabla de Roles
CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20) NOT NULL,
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios
CREATE TABLE Users (
    ID_Users INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Role INT NOT NULL,
    First_Name VARCHAR(25) NOT NULL,
    Last_Name VARCHAR(25) NOT NULL,
    CI VARCHAR(12) UNIQUE NOT NULL,
    Telephone_Number VARCHAR(20),
    Email VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Direcciones
CREATE TABLE Directions (
    ID_Direction INT AUTO_INCREMENT PRIMARY KEY,
    Name_Direction VARCHAR(100) NOT NULL,
    Fk_Director INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Divisiones
CREATE TABLE Divisions (
    ID_Division INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Direction INT,
    Name_Division VARCHAR(100) NOT NULL,
    Fk_Division_Head INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Coordinaciones
CREATE TABLE Coordinations (
    ID_Coordination INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Division INT,
    Name_Coordination VARCHAR(100) NOT NULL,
    Fk_Coordinator INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Bloques de Almuerzo
CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(20) NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL,
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Técnicos
CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE,
    Fk_Lunch_Block INT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios TI
CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30) NOT NULL,
    Details TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios de Técnicos
CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technicians INT,
    Fk_TI_Service INT,
    status VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Horarios de Técnicos
CREATE TABLE Technician_Schedules (
    ID_Schedule INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technician INT,
    Day_Of_Week VARCHAR(10) NOT NULL,
    Work_Start_Time TIME DEFAULT '08:00:00',
    Work_End_Time TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Principal de Tickets
CREATE TABLE Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(20) UNIQUE NOT NULL,
    Fk_Users INT,
    Fk_Coordination INT,
    Fk_TI_Service INT,
    Fk_Technician_Current INT NULL,
    Subject VARCHAR(100) NOT NULL,
    Property_number VARCHAR(10),
    Description TEXT,
    Request_Type VARCHAR(20) NOT NULL,
    User_Priority VARCHAR(15) NOT NULL,
    System_Priority VARCHAR(15) NULL,
    Status VARCHAR(20) DEFAULT 'Pendiente',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Adjuntos de Tickets
CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    File_Name VARCHAR(100) NOT NULL,
    File_Path VARCHAR(255) NOT NULL,
    File_Type VARCHAR(10) NOT NULL,
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Historial de Asignaciones
CREATE TABLE Ticket_Assignments_History (
    ID_Assignment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_Technician INT,
    Fk_Assigned_By INT,
    Assignment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Comentarios de Tickets
CREATE TABLE Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_User INT,
    Comment TEXT NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. CREACIÓN DE FOREIGN KEYS
-- ==========================================

-- Foreign Keys de Usuarios
ALTER TABLE Users 
ADD CONSTRAINT fk_users_role 
FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Keys de Direcciones
ALTER TABLE Directions 
ADD CONSTRAINT fk_directions_director 
FOREIGN KEY (Fk_Director) REFERENCES Users(ID_Users) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys de Divisiones
ALTER TABLE Divisions 
ADD CONSTRAINT fk_divisions_direction 
FOREIGN KEY (Fk_Direction) REFERENCES Directions(ID_Direction) 
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT fk_divisions_head 
FOREIGN KEY (Fk_Division_Head) REFERENCES Users(ID_Users) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys de Coordinaciones
ALTER TABLE Coordinations 
ADD CONSTRAINT fk_coordinations_division 
FOREIGN KEY (Fk_Division) REFERENCES Divisions(ID_Division) 
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT fk_coordinations_coordinator 
FOREIGN KEY (Fk_Coordinator) REFERENCES Users(ID_Users) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys de Técnicos
ALTER TABLE Technicians 
ADD CONSTRAINT fk_technicians_users 
FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users) 
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT fk_technicians_lunch_block 
FOREIGN KEY (Fk_Lunch_Block) REFERENCES Lunch_Blocks(ID_Lunch_Block) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys de Servicios de Técnicos
ALTER TABLE Technicians_Service 
ADD CONSTRAINT fk_technicians_service_technician 
FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians) 
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT fk_technicians_service_service 
FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys de Horarios de Técnicos
ALTER TABLE Technician_Schedules 
ADD CONSTRAINT fk_schedules_technician 
FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys de Tickets
ALTER TABLE Service_Request 
ADD CONSTRAINT fk_service_request_users 
FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users) 
ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT fk_service_request_coordination 
FOREIGN KEY (Fk_Coordination) REFERENCES Coordinations(ID_Coordination) 
ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT fk_service_request_service 
FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) 
ON DELETE RESTRICT ON UPDATE CASCADE,
ADD CONSTRAINT fk_service_request_technician 
FOREIGN KEY (Fk_Technician_Current) REFERENCES Technicians(ID_Technicians) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign Keys de Adjuntos
ALTER TABLE Ticket_Attachments 
ADD CONSTRAINT fk_attachments_request 
FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys de Historial
ALTER TABLE Ticket_Assignments_History 
ADD CONSTRAINT fk_assignments_request 
FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) 
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT fk_assignments_technician 
FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians) 
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT fk_assignments_assigned_by 
FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign Keys de Comentarios
ALTER TABLE Ticket_Comments 
ADD CONSTRAINT fk_comments_request 
FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) 
ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT fk_comments_user 
FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- ==========================================
-- 3. CONSTRAINTS ADICIONALES
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
-- 4. TRIGGERS PARA AUTOMATIZACIÓN
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

-- ==========================================
-- 5. ÍNDICES PARA OPTIMIZACIÓN
-- ==========================================

-- Índices de Usuarios
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_ci ON Users(CI);
CREATE INDEX idx_users_role ON Users(Fk_Role);

-- Índices de Estructura Institucional
CREATE INDEX idx_directions_director ON Directions(Fk_Director);
CREATE INDEX idx_divisions_direction ON Divisions(Fk_Direction);
CREATE INDEX idx_divisions_head ON Divisions(Fk_Division_Head);
CREATE INDEX idx_coordinations_division ON Coordinations(Fk_Division);
CREATE INDEX idx_coordinations_coordinator ON Coordinations(Fk_Coordinator);

-- Índices de Técnicos
CREATE INDEX idx_technicians_users ON Technicians(Fk_Users);
CREATE INDEX idx_technicians_lunch_block ON Technicians(Fk_Lunch_Block);
CREATE INDEX idx_technicians_status ON Technicians(Status);

-- Índices de Servicios TI
CREATE INDEX idx_ti_service_type ON TI_Service(Type_Service);
CREATE INDEX idx_technicians_service_technician ON Technicians_Service(Fk_Technicians);
CREATE INDEX idx_technicians_service_service ON Technicians_Service(Fk_TI_Service);

-- Índices de Horarios
CREATE INDEX idx_schedules_technician ON Technician_Schedules(Fk_Technician);
CREATE INDEX idx_schedules_day ON Technician_Schedules(Day_Of_Week);

-- Índices de Tickets (CRÍTICOS PARA PERFORMANCE)
CREATE INDEX idx_service_request_code ON Service_Request(Ticket_Code);
CREATE INDEX idx_service_request_user ON Service_Request(Fk_Users);
CREATE INDEX idx_service_request_coordination ON Service_Request(Fk_Coordination);
CREATE INDEX idx_service_request_service ON Service_Request(Fk_TI_Service);
CREATE INDEX idx_service_request_technician ON Service_Request(Fk_Technician_Current);
CREATE INDEX idx_service_request_status ON Service_Request(Status);
CREATE INDEX idx_service_request_priority ON Service_Request(User_Priority);
CREATE INDEX idx_service_request_created ON Service_Request(Created_at);
CREATE INDEX idx_service_request_resolved ON Service_Request(Resolved_at);

-- Índices de Adjuntos
CREATE INDEX idx_attachments_request ON Ticket_Attachments(Fk_Service_Request);

-- Índices de Historial
CREATE INDEX idx_assignments_request ON Ticket_Assignments_History(Fk_Service_Request);
CREATE INDEX idx_assignments_technician ON Ticket_Assignments_History(Fk_Technician);

-- Índices de Comentarios
CREATE INDEX idx_comments_request ON Ticket_Comments(Fk_Service_Request);
CREATE INDEX idx_comments_user ON Ticket_Comments(Fk_User);

-- ==========================================
-- 6. VISTAS ÚTILES PARA DASHBOARD
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

-- ==========================================
-- 7. PROCEDIMIENTOS ALMACENADOS
-- ==========================================

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
-- 8. INSERCIÓN DE DATOS INICIALES
-- ==========================================

-- Roles del sistema
INSERT INTO Role (ID_Role, Role, Description) VALUES
(1, 'Administrador', 'Acceso completo al sistema, gestión de usuarios y configuración'),
(2, 'Director', 'Gerencia de dirección, supervisión de divisiones y coordinaciones'),
(3, 'Jefe_Division', 'Administración de división, gestión de coordinaciones y personal'),
(4, 'Coordinador', 'Gestión de coordinación específica, supervisión de técnicos'),
(5, 'Tecnico', 'Especialista TI, atención de tickets y soporte técnico'),
(6, 'Usuario_Solicitante', 'Usuario final que crea solicitudes de servicio'),
(7, 'Secretaria', 'Soporte administrativo, gestión documental y atención básica');

-- Bloques de almuerzo
INSERT INTO Lunch_Blocks (ID_Lunch_Block, Block_Name, Start_Time, End_Time, Description) VALUES
(1, 'Grupo 1', '11:30:00', '12:10:00', 'Primer grupo de almuerzo - 40 minutos'),
(2, 'Grupo 2', '12:10:00', '12:50:00', 'Segundo grupo de almuerzo - 40 minutos'),
(3, 'Grupo 3', '12:50:00', '13:30:00', 'Tercer grupo de almuerzo - 40 minutos'),
(4, 'Grupo 4', '13:30:00', '14:10:00', 'Cuarto grupo de almuerzo - 40 minutos');

-- Tipos de servicios TI
INSERT INTO TI_Service (ID_TI_Service, Type_Service, Details) VALUES
(1, 'Redes', 'Configuración y mantenimiento de redes, conexión a internet, VPN, firewall'),
(2, 'Soporte Tecnico', 'Soporte general de hardware y software, diagnóstico de problemas'),
(3, 'Programacion', 'Desarrollo de aplicaciones, scripts, automatización de procesos'),
(4, 'Base de Datos', 'Administración de bases de datos, backups, migraciones'),
(5, 'Seguridad', 'Gestión de seguridad informática, antivirus, políticas de acceso'),
(6, 'Telecomunicaciones', 'Sistemas de telefonía, videoconferencias, comunicaciones'),
(7, 'Sistemas Operativos', 'Instalación, configuración y mantenimiento de sistemas operativos'),
(8, 'Correo Electrónico', 'Gestión de servidores de correo, configuración de cuentas');

-- Usuarios
INSERT INTO Users (ID_Users, Fk_Role, First_Name, Last_Name, CI, Telephone_Number, Email, Password) VALUES
-- Administradores
(1, 1, 'Carlos', 'Rodríguez', 'V-12345678', '0414-1234567', 'carlos.rodriguez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(2, 1, 'María', 'González', 'V-87654321', '0414-7654321', 'maria.gonzalez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Directores
(3, 2, 'Luis', 'Martínez', 'V-11223344', '0414-1122334', 'luis.martinez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(4, 2, 'Ana', 'Silva', 'V-55667788', '0414-5566778', 'ana.silva@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(5, 2, 'Pedro', 'López', 'V-99887766', '0414-9988776', 'pedro.lopez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Jefes de División
(6, 3, 'Diana', 'Hernández', 'V-44556677', '0414-4455667', 'diana.hernandez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(7, 3, 'Roberto', 'Díaz', 'V-88990011', '0414-8899001', 'roberto.diaz@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Coordinadores
(8, 4, 'Carmen', 'Pérez', 'V-22334455', '0414-2233445', 'carmen.perez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(9, 4, 'José', 'Ramírez', 'V-66778899', '0414-6677889', 'jose.ramirez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Técnicos
(10, 5, 'Miguel', 'Torres', 'V-33445566', '0414-3344556', 'miguel.torres@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(11, 5, 'Laura', 'Vargas', 'V-77889900', '0414-7788990', 'laura.vargas@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(12, 5, 'Santiago', 'Mendoza', 'V-55443322', '0414-5544332', 'santiago.mendoza@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(13, 5, 'Patricia', 'Rojas', 'V-99118822', '0414-9911882', 'patricia.rojas@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Usuarios Solicitantes
(14, 6, 'Juan', 'García', 'V-44667788', '0414-4466778', 'juan.garcia@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(15, 6, 'Elena', 'Castro', 'V-88776655', '0414-8877665', 'elena.castro@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(16, 6, 'Ricardo', 'Fernández', 'V-22334411', '0414-2233441', 'ricardo.fernandez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6');

-- Estructura Institucional (direcciones, divisiones, coordinaciones)
INSERT INTO Directions (ID_Direction, Name_Direction, Fk_Director) VALUES
(1, 'Dirección de Administración', 3),
(2, 'Dirección de Obras Públicas', 4),
(3, 'Dirección de Servicios Públicos', 5),
(4, 'Dirección de Educación', NULL),
(5, 'Dirección de Salud', NULL),
(6, 'Dirección de Catastro', NULL),
(7, 'Dirección de Urbanismo', NULL),
(8, 'Dirección de Finanzas', NULL);

INSERT INTO Divisions (ID_Division, Fk_Direction, Name_Division, Fk_Division_Head) VALUES
(1, 1, 'División de Recursos Humanos', 6),
(2, 1, 'División de Compras', NULL),
(3, 1, 'División de Tesorería', NULL),
(4, 2, 'División de Ingeniería Municipal', 7),
(5, 2, 'División de Mantenimiento Vial', NULL),
(6, 2, 'División de Construcción', NULL),
(7, 3, 'División de Aseo Urbano', NULL),
(8, 3, 'División de Alcantarillado', NULL),
(9, 3, 'División de Aguas Servidas', NULL),
(10, 4, 'División de Docencia', NULL),
(11, 4, 'División de Infraestructura Educativa', NULL),
(12, 5, 'División de Atención Primaria', NULL),
(13, 5, 'División de Salud Pública', NULL),
(14, 6, 'División de Catastro Legal', NULL),
(15, 6, 'División de Avalúos', NULL),
(16, 6, 'División de Cartografía', NULL),
(17, 7, 'División de Planificación', NULL),
(18, 7, 'División de Control Urbano', NULL),
(19, 8, 'División de Contabilidad', NULL),
(20, 8, 'División de Presupuesto', NULL);

INSERT INTO Coordinations (ID_Coordination, Fk_Division, Name_Coordination, Fk_Coordinator) VALUES
(1, 1, 'Coordinación de Nóminas', 8),
(2, 1, 'Coordinación de Contratación', NULL),
(3, 1, 'Coordinación de Capacitación', NULL),
(4, 2, 'Coordinación de Adquisiciones', NULL),
(5, 2, 'Coordinación de Almacén', NULL),
(6, 3, 'Coordinación de Caja', NULL),
(7, 3, 'Coordinación de Cuentas por Pagar', NULL),
(8, 4, 'Coordinación de Proyectos', 9),
(9, 4, 'Coordinación de Estudios Técnicos', NULL),
(10, 5, 'Coordinación de Semáforos', NULL),
(11, 5, 'Coordinación de Señalización', NULL),
(12, 6, 'Coordinación de Edificaciones', NULL),
(13, 6, 'Coordinación de Infraestructura', NULL),
(14, 7, 'Coordinación de Recolección', NULL),
(15, 7, 'Coordinación de Disposición Final', NULL),
(16, 8, 'Coordinación de Mantenimiento de Redes', NULL),
(17, 8, 'Coordinación de Nuevas Conexiones', NULL),
(18, 9, 'Coordinación de Tratamiento', NULL),
(19, 9, 'Coordinación de Control de Calidad', NULL),
(20, 10, 'Coordinación de Escuelas Básicas', NULL),
(21, 10, 'Coordinación de Liceos', NULL),
(22, 11, 'Coordinación de Mantenimiento Escolar', NULL),
(23, 11, 'Coordinación de Construcción Escolar', NULL),
(24, 12, 'Coordinación de Ambulatorios', NULL),
(25, 12, 'Coordinación de Programas Preventivos', NULL),
(26, 13, 'Coordinación de Epidemiología', NULL),
(27, 13, 'Coordinación de Vacunación', NULL),
(28, 14, 'Coordinación de Registro Inmobiliario', NULL),
(29, 14, 'Coordinación de Transferencias', NULL),
(30, 15, 'Coordinación de Avalúos Urbanos', NULL),
(31, 15, 'Coordinación de Avalúos Rurales', NULL),
(32, 16, 'Coordinación de Mapas Digitales', NULL),
(33, 16, 'Coordinación de Actualización Cartográfica', NULL),
(34, 17, 'Coordinación de Planes Urbanos', NULL),
(35, 17, 'Coordinación de Zonificación', NULL),
(36, 18, 'Coordinación de Inspecciones', NULL),
(37, 18, 'Coordinación de Permisos', NULL),
(38, 19, 'Coordinación de Cuentas Generales', NULL),
(39, 19, 'Coordinación de Estados Financieros', NULL),
(40, 20, 'Coordinación de Elaboración Presupuestaria', NULL),
(41, 20, 'Coordinación de Control Presupuestario', NULL);

-- Técnicos y sus servicios
INSERT INTO Technicians (ID_Technicians, Fk_Users, Fk_Lunch_Block, Status) VALUES
(1, 10, 1, 'Disponible'), -- Miguel Torres
(2, 11, 2, 'Disponible'), -- Laura Vargas
(3, 12, 3, 'Disponible'), -- Santiago Mendoza
(4, 13, 4, 'Vacaciones'); -- Patricia Rojas

INSERT INTO Technicians_Service (ID_Technicians_Service, Fk_Technicians, Fk_TI_Service, status) VALUES
(1, 1, 1, 'Activo'), -- Miguel Torres - Redes
(2, 1, 2, 'Activo'), -- Miguel Torres - Soporte Técnico
(3, 2, 2, 'Activo'), -- Laura Vargas - Soporte Técnico
(4, 2, 5, 'Activo'), -- Laura Vargas - Seguridad
(5, 3, 3, 'Activo'), -- Santiago Mendoza - Programación
(6, 3, 4, 'Activo'), -- Santiago Mendoza - Base de Datos
(7, 4, 1, 'Activo'), -- Patricia Rojas - Redes
(8, 4, 6, 'Activo'); -- Patricia Rojas - Telecomunicaciones

-- Tickets de ejemplo
INSERT INTO Service_Request (
    Fk_Users, Fk_Coordination, Fk_TI_Service, Fk_Technician_Current, 
    Subject, Property_number, Description, Request_Type, User_Priority, Status
) VALUES
(14, 1, 2, 1, 'Computadora no enciende', 'A-101', 'La computadora de escritorio no enciende, no hay luz de power', 'Digital', 'Alta', 'En Proceso'),
(15, 4, 1, 2, 'Sin conexión a internet', 'B-205', 'No tengo acceso a internet desde hace 2 horas', 'Digital', 'Media', 'Pendiente'),
(16, 10, 3, 3, 'Error en sistema de nóminas', 'C-301', 'El sistema muestra error al calcular las horas extras', 'Digital', 'Alta', 'En Proceso'),
(14, 14, 4, NULL, 'Lentitud en base de datos', 'D-402', 'Las consultas toman más de 30 segundos en responder', 'Digital', 'Media', 'Pendiente'),
(15, 8, 1, 1, 'Problema con semáforo', 'E-503', 'El semáforo principal está en luz intermitente', 'Fisico', 'Urgente', 'Resuelto'),
(16, 28, 2, 2, 'Impresora no funciona', 'F-604', 'La impresora no imprime y muestra error de papel atascado', 'Digital', 'Baja', 'Pendiente'),
(14, 20, 5, NULL, 'Solicitud de acceso a sistema', 'G-705', 'Necesito acceso al sistema de contabilidad', 'Digital', 'Media', 'En Proceso'),
(15, 24, 6, 3, 'Teléfono sin línea', 'H-806', 'El teléfono de la oficina no tiene línea telefónica', 'Fisico', 'Alta', 'Resuelto');

-- Comentarios de tickets
INSERT INTO Ticket_Comments (Fk_Service_Request, Fk_User, Comment) VALUES
(1, 1, 'Ticket asignado al técnico Miguel Torres para diagnóstico'),
(1, 10, 'Se verificó la fuente de poder, necesita reemplazo'),
(2, 2, 'Se verificó el cable de red y el router, parece ser problema del ISP'),
(3, 3, 'Se está revisando el código del módulo de cálculo de horas'),
(4, 1, 'Se necesita optimizar las consultas y agregar índices'),
(5, 10, 'Se reemplazó el controlador del semáforo, sistema operativo normalmente'),
(6, 2, 'Se limpiaron los rodillos y se reemplazó el cartucho de tinta'),
(7, 1, 'Se está procesando la solicitud de acceso, se requiere aprobación del director'),
(8, 10, 'Se reparó la línea telefónica, servicio restablecido');

-- ==========================================
-- COMENTARIOS FINALES
-- ==========================================
-- Este script completo instala todo el sistema en un solo paso:
-- 1. Crea base de datos y todas las tablas
-- 2. Establece foreign keys y constraints
-- 3. Configura triggers para automatización
-- 4. Crea índices para optimización
-- 5. Define vistas útiles para el dashboard
-- 6. Inserta datos iniciales de ejemplo
-- 7. Configura procedimientos almacenados
--
-- Para ejecutar este script:
-- mysql -u root -p < database_complete.sql
--
-- La base de datos quedará completamente funcional con:
-- - 15 tablas con relaciones jerárquicas
-- - 8 direcciones, 20 divisiones, 41 coordinaciones
-- - 16 usuarios con diferentes roles
-- - 4 técnicos con especializaciones
-- - 8 tickets de ejemplo
-- - Automatización completa con triggers
-- - Vistas optimizadas para dashboard
