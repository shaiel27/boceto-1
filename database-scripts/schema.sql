-- ==========================================
-- PROYECTO: SISTEMA DE GESTIÓN DE TICKETS (VERSIÓN MUNICIPAL JERÁRQUICA)
-- Actualización: Estructura unificada de oficinas y simplificación de usuarios
-- Motor: MySQL
-- ==========================================

-- Eliminar base de datos si existe y crear nueva
DROP DATABASE IF EXISTS tickets_municipal;
CREATE DATABASE tickets_municipal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tickets_municipal;

-- ==========================================
-- 1. MÓDULO DE USUARIOS Y ACCESO (LOGIN)
-- ==========================================

CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20) NOT NULL COMMENT 'Admin, Tecnico, Jefe',
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Users (
    ID_Users INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Role INT,
    Email VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Boss (
    ID_Boss INT AUTO_INCREMENT PRIMARY KEY,
    Name_Boss VARCHAR(100) NOT NULL,
    pronoun VARCHAR(20),
    Fk_User INT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. INFRAESTRUCTURA INSTITUCIONAL (UNIFICADA)
-- ==========================================

CREATE TABLE Office (
    ID_Office INT AUTO_INCREMENT PRIMARY KEY,
    Name_Office VARCHAR(100) NOT NULL,
    Office_Type VARCHAR(20) NOT NULL COMMENT 'Direction, Coordination, Division',
    Fk_Parent_Office INT NULL COMMENT 'ID de la oficina superior',
    Fk_Boss_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Parent_Office) REFERENCES Office(ID_Office) ON DELETE SET NULL,
    FOREIGN KEY (Fk_Boss_ID) REFERENCES Boss(ID_Boss) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. TÉCNICOS Y SERVICIOS TI
-- ==========================================

CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(20) NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30) NOT NULL COMMENT 'Redes, Soporte, Programación',
    Details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    First_Name VARCHAR(25) NOT NULL,
    Last_Name VARCHAR(25) NOT NULL,
    CI VARCHAR(12) UNIQUE NOT NULL,
    Telephone_Number VARCHAR(20),
    Fk_Lunch_Block INT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Activo' COMMENT 'Activo, Inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Lunch_Block) REFERENCES Lunch_Blocks(ID_Lunch_Block) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT NOT NULL,
    Fk_Technicians INT NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians) ON DELETE CASCADE,
    UNIQUE KEY unique_technician_service (Fk_Technicians, Fk_TI_Service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. CONFIGURACIÓN DE PERMISOS Y SISTEMAS
-- ==========================================

CREATE TABLE Service_Permissions (
    ID_Permission INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT NOT NULL,
    Fk_Office INT NOT NULL COMMENT 'Apunta a la oficina en la tabla maestra',
    Is_Allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Request_Settings (
    ID_Setting INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Office_ID INT NOT NULL,
    Can_Request_Directly BOOLEAN DEFAULT TRUE,
    Must_Be_Approved_By_Superior BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Office_ID) REFERENCES Office(ID_Office) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Software_Systems (
    ID_System INT AUTO_INCREMENT PRIMARY KEY,
    System_Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Office_Systems (
    ID_Office_System INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Office_ID INT NOT NULL,
    Fk_System_ID INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Office_ID) REFERENCES Office(ID_Office) ON DELETE CASCADE,
    FOREIGN KEY (Fk_System_ID) REFERENCES Software_Systems(ID_System) ON DELETE CASCADE,
    UNIQUE KEY unique_office_system (Fk_Office_ID, Fk_System_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. MÓDULO DE GESTIÓN DE TICKETS
-- ==========================================

CREATE TABLE Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(20) UNIQUE NOT NULL,
    Fk_Office INT NOT NULL COMMENT 'Oficina de origen (Maestra)',
    Fk_User_Requester INT NOT NULL COMMENT 'ID del Jefe que solicita',
    Fk_TI_Service INT NOT NULL,
    Fk_Problem_Catalog INT NOT NULL,
    Fk_Software_System INT NULL COMMENT 'Obligatorio si es Programación',
    Subject VARCHAR(100) NOT NULL,
    Property_number VARCHAR(10),
    Description TEXT,
    System_Priority VARCHAR(15) NOT NULL,
    Resolution_Notes TEXT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL,
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office) ON DELETE RESTRICT,
    FOREIGN KEY (Fk_User_Requester) REFERENCES Users(ID_Users) ON DELETE RESTRICT,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE RESTRICT,
    FOREIGN KEY (Fk_Problem_Catalog) REFERENCES Service_Problems_Catalog(ID_Problem_Catalog) ON DELETE RESTRICT,
    FOREIGN KEY (Fk_Software_System) REFERENCES Software_Systems(ID_System) ON DELETE SET NULL
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

CREATE TABLE Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_User INT NOT NULL,
    Comment TEXT NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    File_Name VARCHAR(100) NOT NULL,
    File_Path VARCHAR(255) NOT NULL,
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ==========================================

-- Índices en Users
CREATE INDEX idx_user_email ON Users(Email);
CREATE INDEX idx_user_role ON Users(Fk_Role);

-- Índices en Office
CREATE INDEX idx_office_type ON Office(Office_Type);
CREATE INDEX idx_office_parent ON Office(Fk_Parent_Office);
CREATE INDEX idx_office_boss ON Office(Fk_Boss_ID);

-- Índices en Service_Request
CREATE INDEX idx_ticket_code ON Service_Request(Ticket_Code);
CREATE INDEX idx_ticket_status ON Service_Request(Status);
CREATE INDEX idx_ticket_priority ON Service_Request(System_Priority);
CREATE INDEX idx_ticket_created ON Service_Request(Created_at);
CREATE INDEX idx_ticket_user ON Service_Request(Fk_User_Requester);
CREATE INDEX idx_ticket_office ON Service_Request(Fk_Office);
CREATE INDEX idx_ticket_service ON Service_Request(Fk_TI_Service);

-- Índices en Technicians
CREATE INDEX idx_technician_status ON Technicians(Status);
CREATE INDEX idx_technician_user ON Technicians(Fk_Users);
CREATE INDEX idx_technician_ci ON Technicians(CI);

-- Índices en Ticket_Technicians
CREATE INDEX idx_ticket_tech_ticket ON Ticket_Technicians(Fk_Service_Request);
CREATE INDEX idx_ticket_tech_technician ON Ticket_Technicians(Fk_Technician);

-- Índices en Service_Problems_Catalog
CREATE INDEX idx_problem_service ON Service_Problems_Catalog(Fk_TI_Service);
CREATE INDEX idx_problem_severity ON Service_Problems_Catalog(Estimated_Severity);

-- Índices en Ticket_Comments
CREATE INDEX idx_comment_ticket ON Ticket_Comments(Fk_Service_Request);
CREATE INDEX idx_comment_user ON Ticket_Comments(Fk_User);

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
    sr.Resolution_Notes,
    b.Name_Boss AS Solicitante,
    u.Email AS Solicitante_Email,
    o.Name_Office AS Oficina_Origen,
    o.Office_Type AS Tipo_Oficina,
    parent_o.Name_Office AS Oficina_Padre,
    ts.Type_Service AS Tipo_Servicio,
    spc.Problem_Name AS Tipo_Problema,
    spc.Estimated_Severity AS Severidad_Estimada,
    ss.System_Name AS Sistema_Software,
    GROUP_CONCAT(DISTINCT CONCAT(t.First_Name, ' ', t.Last_Name) SEPARATOR ', ') AS Tecnicos_Asignados,
    COUNT(DISTINCT tt.Fk_Technician) AS Numero_Tecnicos
FROM Service_Request sr
JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
JOIN Boss b ON u.ID_Users = b.Fk_User
JOIN Office o ON sr.Fk_Office = o.ID_Office
LEFT JOIN Office parent_o ON o.Fk_Parent_Office = parent_o.ID_Office
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
JOIN Service_Problems_Catalog spc ON sr.Fk_Problem_Catalog = spc.ID_Problem_Catalog
LEFT JOIN Software_Systems ss ON sr.Fk_Software_System = ss.ID_System
LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request
LEFT JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
GROUP BY sr.ID_Service_Request;

-- Vista de técnicos con sus servicios y disponibilidad
CREATE VIEW v_tecnicos_disponibilidad AS
SELECT 
    t.ID_Technicians,
    CONCAT(t.First_Name, ' ', t.Last_Name) AS Tecnico_Nombre,
    u.Email,
    t.Telephone_Number,
    t.CI,
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

-- Vista de estructura jerárquica de oficinas
CREATE VIEW v_estructura_oficinas AS
SELECT 
    o.ID_Office,
    o.Name_Office,
    o.Office_Type,
    parent_o.Name_Office AS Oficina_Padre,
    b.Name_Boss AS Jefe,
    o.created_at
FROM Office o
LEFT JOIN Office parent_o ON o.Fk_Parent_Office = parent_o.ID_Office
LEFT JOIN Boss b ON o.Fk_Boss_ID = b.ID_Boss
ORDER BY 
    CASE o.Office_Type
        WHEN 'Direction' THEN 1
        WHEN 'Division' THEN 2
        WHEN 'Coordination' THEN 3
    END,
    o.Name_Office;

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
