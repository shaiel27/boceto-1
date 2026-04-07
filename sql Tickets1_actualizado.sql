-- ==========================================
-- CREACIÓN DE BASE DE DATOS ALCALDÍA TICKETS DB
-- Versión actualizada según nueva estructura
-- ==========================================

CREATE DATABASE IF NOT EXISTS alcaldia_tickets_db;
USE alcaldia_tickets_db;

-- ==========================================
-- TABLAS DE USUARIOS Y ACCESO
-- ==========================================

-- Tabla de Roles
CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20) NOT NULL,
    Description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role)
);

-- Tabla de Técnicos
CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE NOT NULL,
    Status VARCHAR(20) DEFAULT 'Disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users)
);

-- ==========================================
-- TABLAS DE ESTRUCTURA INSTITUCIONAL
-- ==========================================

-- Tabla de Oficinas
CREATE TABLE Office (
    ID_Office INT AUTO_INCREMENT PRIMARY KEY,
    Name_Office VARCHAR(100) NOT NULL,
    Building VARCHAR(50),
    Telephone_Number VARCHAR(15),
    Fk_Office_Boss INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Office_Boss) REFERENCES Users(ID_Users)
);

-- Tabla de Áreas de Oficina
CREATE TABLE Area_Office (
    ID_Area_Office INT AUTO_INCREMENT PRIMARY KEY,
    Area_Name VARCHAR(25) NOT NULL,
    Description TEXT,
    Fk_Area_Boos INT,
    Fk_Office INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Area_Boos) REFERENCES Users(ID_Users),
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office)
);

-- Tabla de TI Service
CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30) NOT NULL,
    Details TEXT
);

-- Tabla de Servicios de Técnicos
CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technicians INT NOT NULL,
    Fk_TI_Service INT NOT NULL,
    status VARCHAR(15) DEFAULT 'Disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service)
);

-- ==========================================
-- TABLAS DE GESTIÓN DE SOLICITUDES (TICKETS)
-- ==========================================

-- Tabla Principal de Service Request
CREATE TABLE Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(20) UNIQUE NOT NULL,
    Fk_Users INT NOT NULL COMMENT 'Usuario Solicitante',
    FK_Office INT NOT NULL,
    FK_Area_Office INT,
    Fk_TI_Service INT NOT NULL,
    Fk_Technician_Current INT NULL COMMENT 'Tecnico asignado actualmente',
    Subject VARCHAR(100) NOT NULL,
    Property_number VARCHAR(10),
    Description TEXT,
    Request_Type VARCHAR(20) DEFAULT 'Digital',
    User_Priority VARCHAR(15),
    System_Priority VARCHAR(15) NULL,
    Status VARCHAR(20) DEFAULT 'Pendiente',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users),
    FOREIGN KEY (FK_Office) REFERENCES Office(ID_Office),
    FOREIGN KEY (FK_Area_Office) REFERENCES Area_Office(ID_Area_Office),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Technician_Current) REFERENCES Technicians(ID_Technicians)
);

-- Tabla de Adjuntos (Imágenes/PDF)
CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    File_Name VARCHAR(100) NOT NULL,
    File_Path VARCHAR(255) NOT NULL COMMENT 'URL o ruta del archivo en el servidor',
    File_Type VARCHAR(10) NOT NULL COMMENT 'pdf, jpg, png',
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request)
);

-- ==========================================
-- TABLAS DE AUDITORIA Y TRAZABILIDAD
-- ==========================================

-- Tabla de Historial de Asignaciones
CREATE TABLE Ticket_Assignments_History (
    ID_Assignment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_Technician INT NOT NULL,
    Fk_Assigned_By INT NOT NULL COMMENT 'Admin o Proceso que realizo el cambio',
    Assignment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Reason_Reassignment TEXT NULL,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians),
    FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users)
);

-- Tabla de Línea de Tiempo
CREATE TABLE Ticket_Timeline (
    ID_Timeline INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_User_Action INT NOT NULL,
    Action_Type VARCHAR(50) NOT NULL COMMENT 'Cambio de Estado, Prioridad, etc.',
    Previous_Value VARCHAR(50),
    New_Value VARCHAR(50),
    Action_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_User_Action) REFERENCES Users(ID_Users)
);

-- Tabla de Comentarios
CREATE TABLE Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_User INT NOT NULL,
    Comment TEXT NOT NULL,
    Is_Internal BOOLEAN DEFAULT TRUE,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users)
);

-- ==========================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ==========================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_ci ON Users(CI);
CREATE INDEX idx_service_request_code ON Service_Request(Ticket_Code);
CREATE INDEX idx_service_request_status ON Service_Request(Status);
CREATE INDEX idx_service_request_created ON Service_Request(Created_at);
CREATE INDEX idx_technicians_status ON Technicians(Status);
CREATE INDEX idx_ticket_comments_request ON Ticket_Comments(Fk_Service_Request);
CREATE INDEX idx_ticket_attachments_request ON Ticket_Attachments(Fk_Service_Request);

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista para información completa de tickets
CREATE VIEW v_tickets_completos AS
SELECT 
    sr.ID_Service_Request,
    sr.Ticket_Code,
    sr.Subject,
    sr.Description,
    sr.Status,
    sr.User_Priority,
    sr.System_Priority,
    sr.Created_at,
    sr.Resolved_at,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Usuario_Solicitante,
    u.Email AS Email_Usuario,
    o.Name_Office AS Oficina,
    ao.Area_Name AS Area,
    ts.Type_Service AS Tipo_Servicio,
    CASE 
        WHEN sr.Fk_Technician_Current IS NOT NULL 
        THEN CONCAT(tu.First_Name, ' ', tu.Last_Name)
        ELSE 'Sin asignar'
    END AS Tecnico_Asignado,
    DATEDIFF(COALESCE(sr.Resolved_at, CURRENT_TIMESTAMP), sr.Created_at) AS Dias_Abierto
FROM Service_Request sr
JOIN Users u ON sr.Fk_Users = u.ID_Users
JOIN Office o ON sr.FK_Office = o.ID_Office
LEFT JOIN Area_Office ao ON sr.FK_Area_Office = ao.ID_Area_Office
JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
LEFT JOIN Technicians t ON sr.Fk_Technician_Current = t.ID_Technicians
LEFT JOIN Users tu ON t.Fk_Users = tu.ID_Users;

-- Vista para técnicos y sus especialidades
CREATE VIEW v_tecnicos_especialidades AS
SELECT 
    t.ID_Technicians,
    CONCAT(u.First_Name, ' ', u.Last_Name) AS Nombre_Completo,
    u.Email,
    t.Status,
    GROUP_CONCAT(ts.Type_Service ORDER BY ts.Type_Service SEPARATOR ', ') AS Especialidades
FROM Technicians t
JOIN Users u ON t.Fk_Users = u.ID_Users
LEFT JOIN Technicians_Service tserv ON t.ID_Technicians = tserv.Fk_Technicians
LEFT JOIN TI_Service ts ON tserv.Fk_TI_Service = ts.ID_TI_Service
GROUP BY t.ID_Technicians, u.First_Name, u.Last_Name, u.Email, t.Status;

-- ==========================================
-- TRIGGERS PARA AUDITORÍA
-- ==========================================

-- Trigger para registrar cambios en tickets
DELIMITER //
CREATE TRIGGER tr_ticket_timeline_insert
AFTER INSERT ON Service_Request
FOR EACH ROW
BEGIN
    INSERT INTO Ticket_Timeline (Fk_Service_Request, Fk_User_Action, Action_Type, New_Value)
    VALUES (NEW.ID_Service_Request, NEW.Fk_Users, 'Creación', NEW.Status);
END//
DELIMITER ;

-- Trigger para registrar asignaciones
DELIMITER //
CREATE TRIGGER tr_ticket_assignment_history
AFTER UPDATE ON Service_Request
FOR EACH ROW
BEGIN
    IF NEW.Fk_Technician_Current IS NOT NULL 
       AND OLD.Fk_Technician_Current IS NULL OR NEW.Fk_Technician_Current != OLD.Fk_Technician_Current THEN
        INSERT INTO Ticket_Assignments_History (Fk_Service_Request, Fk_Technician, Fk_Assigned_By, Reason_Reassignment)
        VALUES (NEW.ID_Service_Request, NEW.Fk_Technician_Current, 1, 'Asignación automática');
    END IF;
END//
DELIMITER ;

-- ==========================================
-- ESTRUCTURA COMPLETADA
-- ==========================================
