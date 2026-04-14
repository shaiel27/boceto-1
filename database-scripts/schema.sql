-- ==========================================
-- PROYECTO: SISTEMA DE GESTIÓN DE TICKETS (VERSIÓN MUNICIPAL JERÁRQUICA)
-- Actualización: Catálogo de problemas por área, permisos y asignación múltiple.
-- Motor: MySQL
-- ==========================================

-- Eliminar base de datos si existe y crear nueva
DROP DATABASE IF EXISTS tickets_municipal;
CREATE DATABASE tickets_municipal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tickets_municipal;

-- ==========================================
-- 1. MÓDULO DE USUARIOS Y ACCESO
-- ==========================================

CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20) NOT NULL,
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Users (
    ID_Users INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Role INT,
    First_Name VARCHAR(25) NOT NULL,
    Last_Name VARCHAR(25) NOT NULL,
    CI VARCHAR(12) UNIQUE NOT NULL,
    Telephone_Number VARCHAR(20),
    Email VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. MÓDULO DE ESTRUCTURA INSTITUCIONAL
-- ==========================================

CREATE TABLE Directions (
    ID_Direction INT AUTO_INCREMENT PRIMARY KEY,
    Name_Direction VARCHAR(100) NOT NULL,
    Fk_Director INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Director) REFERENCES Users(ID_Users) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Divisions (
    ID_Division INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Direction INT NOT NULL,
    Name_Division VARCHAR(100) NOT NULL,
    Fk_Division_Head INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Direction) REFERENCES Directions(ID_Direction) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Division_Head) REFERENCES Users(ID_Users) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Coordinations (
    ID_Coordination INT PRIMARY KEY,
    Fk_Division INT NOT NULL,
    Name_Coordination VARCHAR(100) NOT NULL,
    Fk_Coordinator INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Division) REFERENCES Divisions(ID_Division) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Coordinator) REFERENCES Users(ID_Users) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. MÓDULO DE HORARIOS Y DISPONIBILIDAD (Movido antes de Técnicos por dependencia)
-- ==========================================

CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(20) NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. MÓDULO DE TÉCNICOS Y SERVICIOS TI
-- ==========================================

CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30) NOT NULL COMMENT 'Redes, Soporte, Programación',
    Details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NUEVA TABLA: Diccionario de problemas por área
CREATE TABLE Service_Problems_Catalog (
    ID_Problem_Catalog INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT NOT NULL,
    Problem_Name VARCHAR(100) NOT NULL,
    Typical_Description TEXT,
    Estimated_Severity VARCHAR(15) NOT NULL COMMENT 'Baja, Media, Alta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE NOT NULL,
    Fk_Lunch_Block INT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Lunch_Block) REFERENCES Lunch_Blocks(ID_Lunch_Block) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Service_Permissions (
    ID_Permission INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT NOT NULL,
    Fk_Direction INT NULL,
    Fk_Division INT NULL,
    Fk_Coordination INT NULL,
    Is_Allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Direction) REFERENCES Directions(ID_Direction) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Division) REFERENCES Divisions(ID_Division) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Coordination) REFERENCES Coordinations(ID_Coordination) ON DELETE CASCADE,
    CONSTRAINT chk_permission_structure CHECK (
        (Fk_Direction IS NOT NULL AND Fk_Division IS NULL AND Fk_Coordination IS NULL) OR
        (Fk_Direction IS NULL AND Fk_Division IS NOT NULL AND Fk_Coordination IS NULL) OR
        (Fk_Direction IS NULL AND Fk_Division IS NULL AND Fk_Coordination IS NOT NULL) OR
        (Fk_Direction IS NULL AND Fk_Division IS NULL AND Fk_Coordination IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technicians INT NOT NULL,
    Fk_TI_Service INT NOT NULL,
    Status VARCHAR(15) NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians) ON DELETE CASCADE,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE CASCADE,
    UNIQUE KEY unique_technician_service (Fk_Technicians, Fk_TI_Service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. MÓDULO DE HORARIOS Y DISPONIBILIDAD
-- ==========================================

CREATE TABLE Technician_Schedules (
    ID_Schedule INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technician INT NOT NULL,
    Day_Of_Week VARCHAR(10) NOT NULL,
    Work_Start_Time TIME DEFAULT '08:00:00',
    Work_End_Time TIME NOT NULL,
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians) ON DELETE CASCADE,
    UNIQUE KEY unique_technician_schedule (Fk_Technician, Day_Of_Week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. MÓDULO DE GESTIÓN DE TICKETS
-- ==========================================

CREATE TABLE Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(20) UNIQUE NOT NULL,
    Fk_Users INT NOT NULL COMMENT 'Solicitante',
    Fk_Coordination INT NOT NULL COMMENT 'Oficina de origen',
    Fk_TI_Service INT NOT NULL,
    Fk_Problem_Catalog INT NOT NULL COMMENT 'Tipo de problema seleccionado de la lista',
    Subject VARCHAR(100) NOT NULL,
    Property_number VARCHAR(10),
    Description TEXT COMMENT 'Detalles adicionales del usuario',
    System_Priority VARCHAR(15),
    Status VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users) ON DELETE RESTRICT,
    FOREIGN KEY (Fk_Coordination) REFERENCES Coordinations(ID_Coordination) ON DELETE RESTRICT,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE RESTRICT,
    FOREIGN KEY (Fk_Problem_Catalog) REFERENCES Service_Problems_Catalog(ID_Problem_Catalog) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Ticket_Technicians (
    ID_Ticket_Technician INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_Technician INT NOT NULL,
    Is_Lead BOOLEAN DEFAULT FALSE,
    Assigned_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fk_Assigned_By INT,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    File_Name VARCHAR(100) NOT NULL,
    File_Path VARCHAR(255) NOT NULL,
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Ticket_Assignments_History (
    ID_Assignment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_Technician INT NOT NULL,
    Action_Type VARCHAR(50) NOT NULL,
    Fk_Assigned_By INT,
    Assignment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_User INT NOT NULL,
    Comment TEXT NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ==========================================

-- Índices en Service_Request
CREATE INDEX idx_ticket_code ON Service_Request(Ticket_Code);
CREATE INDEX idx_ticket_status ON Service_Request(Status);
CREATE INDEX idx_ticket_priority ON Service_Request(System_Priority);
CREATE INDEX idx_ticket_created ON Service_Request(Created_at);
CREATE INDEX idx_ticket_user ON Service_Request(Fk_Users);
CREATE INDEX idx_ticket_coordination ON Service_Request(Fk_Coordination);
CREATE INDEX idx_ticket_service ON Service_Request(Fk_TI_Service);

-- Índices en Users
CREATE INDEX idx_user_email ON Users(Email);
CREATE INDEX idx_user_ci ON Users(CI);
CREATE INDEX idx_user_role ON Users(Fk_Role);

-- Índices en Technicians
CREATE INDEX idx_technician_status ON Technicians(Status);
CREATE INDEX idx_technician_user ON Technicians(Fk_Users);

-- Índices en Ticket_Technicians
CREATE INDEX idx_ticket_tech_ticket ON Ticket_Technicians(Fk_Service_Request);
CREATE INDEX idx_ticket_tech_technician ON Ticket_Technicians(Fk_Technician);

-- Índices en Service_Problems_Catalog
CREATE INDEX idx_problem_service ON Service_Problems_Catalog(Fk_TI_Service);
CREATE INDEX idx_problem_severity ON Service_Problems_Catalog(Estimated_Severity);

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista de tickets completos con información relacionada
CREATE VIEW v_tickets_completos AS
SELECT 
    sr.ID_Service_Request,
    sr.Ticket_Code,
    sr.Subject,
    sr.Description,
    sr.Status,
    sr.System_Priority,
    sr.Created_at,
    sr.Resolved_at,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Solicitante,
    u.Email AS Solicitante_Email,
    u.Telephone_Number AS Solicitante_Telefono,
    c.Name_Coordination AS Oficina_Origen,
    d.Name_Direction AS Direccion,
    ts.Type_Service AS Tipo_Servicio,
    spc.Problem_Name AS Tipo_Problema,
    spc.Estimated_Severity AS Severidad_Estimada,
    GROUP_CONCAT(DISTINCT CONCAT(t_u.First_Name, ' ', t_u.Last_Name) SEPARATOR ', ') AS Tecnicos_Asignados,
    COUNT(DISTINCT tt.Fk_Technician) AS Numero_Tecnicos
FROM Service_Request sr
JOIN Users u ON sr.Fk_Users = u.ID_Users
JOIN Coordinations c ON sr.Fk_Coordination = c.ID_Coordination
JOIN Divisions div ON c.Fk_Division = div.ID_Division
JOIN Directions d ON div.Fk_Direction = d.ID_Direction
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
JOIN Service_Problems_Catalog spc ON sr.Fk_Problem_Catalog = spc.ID_Problem_Catalog
LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
LEFT JOIN Technicians tech ON tt.Fk_Technician = tech.ID_Technicians
LEFT JOIN Users t_u ON tech.Fk_Users = t_u.ID_Users
GROUP BY sr.ID_Service_Request;

-- Vista de técnicos con sus servicios y disponibilidad
CREATE VIEW v_tecnicos_disponibilidad AS
SELECT 
    t.ID_Technicians,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Tecnico_Nombre,
    u.Email,
    u.Telephone_Number,
    t.Status AS Tecnico_Status,
    GROUP_CONCAT(DISTINCT ts.Type_Service SEPARATOR ', ') AS Servicios_Asignados,
    lb.Block_Name AS Bloque_Almuerzo,
    lb.Start_Time AS Almuerzo_Inicio,
    lb.End_Time AS Almuerzo_Fin
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
LEFT JOIN Technicians_Service tech_svc ON t.ID_Technicians = tech_svc.Fk_Technicians
LEFT JOIN TI_Service ts ON tech_svc.Fk_TI_Service = ts.ID_TI_Service
LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
WHERE t.Status = 'Activo'
GROUP BY t.ID_Technicians;

-- Vista de catálogo de problemas por servicio
CREATE VIEW v_catalogo_problemas AS
SELECT 
    spc.ID_Problem_Catalog,
    ts.Type_Service AS Servicio,
    spc.Problem_Name AS Problema,
    spc.Typical_Description AS Descripcion_Tipica,
    spc.Estimated_Severity AS Severidad,
    COUNT(DISTINCT sr.ID_Service_Request) AS Cantidad_Tickets
FROM Service_Problems_Catalog spc
JOIN TI_Service ts ON spc.Fk_TI_Service = ts.ID_TI_Service
LEFT JOIN Service_Request sr ON spc.ID_Problem_Catalog = sr.Fk_Problem_Catalog
GROUP BY spc.ID_Problem_Catalog;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger para generar código de ticket automático
DELIMITER //
CREATE TRIGGER tr_generate_ticket_code
BEFORE INSERT ON Service_Request
FOR EACH ROW
BEGIN
    DECLARE ticket_prefix VARCHAR(10);
    DECLARE ticket_number INT;
    
    -- Generar prefijo basado en el tipo de servicio
    SELECT SUBSTRING(Type_Service, 1, 3) INTO ticket_prefix
    FROM TI_Service WHERE ID_TI_Service = NEW.Fk_TI_Service;
    
    -- Obtener el siguiente número secuencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(Ticket_Code, 5) AS UNSIGNED)), 0) + 1
    INTO ticket_number
    FROM Service_Request;
    
    -- Generar código: TTT-NNNNNN (TTT = prefijo servicio, NNNNNN = número)
    SET NEW.Ticket_Code = CONCAT(UPPER(ticket_prefix), '-', LPAD(ticket_number, 6, '0'));
END//
DELIMITER ;

-- Trigger para actualizar fecha de resolución
DELIMITER //
CREATE TRIGGER tr_update_resolved_at
BEFORE UPDATE ON Service_Request
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Resuelto' AND OLD.Status != 'Resuelto' THEN
        SET NEW.Resolved_at = NOW();
    END IF;
END//
DELIMITER ;

-- ==========================================
-- FIN DEL SCRIPT DE ESTRUCTURA
-- ==========================================
