-- Final schema for tickets_system (updated)
CREATE DATABASE IF NOT EXISTS tickets_system;
USE tickets_system;

-- 1. Roles and Users
CREATE TABLE IF NOT EXISTS Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20) NOT NULL,
    Description TEXT,
    UNIQUE KEY (Role)
);

CREATE TABLE IF NOT EXISTS Users (
    ID_Users INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Role INT,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Full_Name VARCHAR(200) NOT NULL,
    is_system_user BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role)
);

CREATE INDEX idx_users_system ON Users(is_system_user, Email);
CREATE INDEX idx_users_active ON Users(is_system_user, Full_Name);

CREATE TABLE IF NOT EXISTS Boss (
    ID_Boss INT AUTO_INCREMENT PRIMARY KEY,
    Name_Boss VARCHAR(200) NOT NULL,
    Pronoun VARCHAR(20),
    Fk_User INT UNIQUE,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users)
);

-- 2. Institutional structure
CREATE TABLE IF NOT EXISTS Office (
    ID_Office INT AUTO_INCREMENT PRIMARY KEY,
    Name_Office VARCHAR(100) NOT NULL,
    coduniadm VARCHAR(20) UNIQUE NULL COMMENT 'ID de la API de bienes (spg_unidadadministrativa)',
    Fk_Boss_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Boss_ID) REFERENCES Boss(ID_Boss)
);

-- 3. Technicians and services
CREATE TABLE IF NOT EXISTS Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Fk_Lunch_Block INT NULL,
    Status VARCHAR(20) DEFAULT 'Disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users),
    FOREIGN KEY (Fk_Lunch_Block) REFERENCES Lunch_Blocks(ID_Lunch_Block)
);

CREATE TABLE IF NOT EXISTS TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(50) NOT NULL,
    Details TEXT
);

CREATE TABLE IF NOT EXISTS Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT,
    Fk_Technicians INT,
    Status VARCHAR(15) DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians)
);

CREATE TABLE IF NOT EXISTS Service_Problems_Catalog (
    ID_Problem_Catalog INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT,
    Problem_Name VARCHAR(200) NOT NULL,
    Typical_Description TEXT,
    Estimated_Severity VARCHAR(50),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service)
);

CREATE TABLE IF NOT EXISTS Technician_Schedules (
    ID_Schedule INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technician INT,
    Day_Of_Week VARCHAR(20) NOT NULL,
    Work_Start_Time TIME DEFAULT '08:00:00',
    Work_End_Time TIME NOT NULL,
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians)
);

CREATE TABLE IF NOT EXISTS Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(50) NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL
);

-- 4. Permissions and systems
CREATE TABLE IF NOT EXISTS Service_Permissions (
    ID_Permission INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT,
    Fk_Office INT,
    Is_Allowed BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office)
);

CREATE TABLE IF NOT EXISTS Request_Settings (
    ID_Setting INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Office_ID INT,
    Can_Request_Directly BOOLEAN DEFAULT TRUE,
    Must_Be_Approved_By_Superior BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (Fk_Office_ID) REFERENCES Office(ID_Office)
);

CREATE TABLE IF NOT EXISTS Software_Systems (
    ID_System INT AUTO_INCREMENT PRIMARY KEY,
    System_Name VARCHAR(200) NOT NULL,
    Description TEXT,
    Status VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS Office_Systems (
    ID_Office_System INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Office_ID INT,
    Fk_System_ID INT,
    FOREIGN KEY (Fk_Office_ID) REFERENCES Office(ID_Office),
    FOREIGN KEY (Fk_System_ID) REFERENCES Software_Systems(ID_System)
);

CREATE TABLE IF NOT EXISTS User_Systems (
    ID_User_System INT AUTO_INCREMENT PRIMARY KEY,
    Fk_User INT NOT NULL,
    Fk_System INT NOT NULL,
    Assigned_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) ON DELETE CASCADE,
    FOREIGN KEY (Fk_System) REFERENCES Software_Systems(ID_System) ON DELETE CASCADE,
    UNIQUE KEY uq_user_system (Fk_User, Fk_System)
);

-- 5. Tickets
CREATE TABLE IF NOT EXISTS Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(50),
    sequence_generation INT NOT NULL DEFAULT 1,
    Fk_Office INT,
    Fk_User_Requester INT,
    Fk_TI_Service INT,
    Fk_Problem_Catalog INT,
    Fk_Boss_Requester INT,
    Fk_Software_System INT NULL,
    Subject VARCHAR(500) NOT NULL,
    Property_Number VARCHAR(50),
    Description TEXT,
    System_Priority VARCHAR(50) DEFAULT 'Media',
    Resolution_Notes TEXT NULL,
    Status VARCHAR(50) DEFAULT 'Pendiente',
    is_returned TINYINT(1) DEFAULT 0 COMMENT 'Marca tickets devueltos por inconformidad',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL,
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office),
    FOREIGN KEY (Fk_User_Requester) REFERENCES Users(ID_Users),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Problem_Catalog) REFERENCES Service_Problems_Catalog(ID_Problem_Catalog),
    FOREIGN KEY (Fk_Software_System) REFERENCES Software_Systems(ID_System),
    FOREIGN KEY (Fk_Boss_Requester) REFERENCES Boss(ID_Boss)
);

ALTER TABLE Service_Request ADD UNIQUE KEY uq_ticket_code (Ticket_Code, sequence_generation);

CREATE TABLE IF NOT EXISTS ticket_sequence (
    id TINYINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    current_number INT NOT NULL DEFAULT 0,
    generation INT NOT NULL DEFAULT 1,
    last_reset_at TIMESTAMP NULL,
    reset_by INT NULL,
    FOREIGN KEY (reset_by) REFERENCES Users(ID_Users)
);

INSERT IGNORE INTO ticket_sequence (id, current_number, generation) VALUES (1, 0, 1);

CREATE TABLE IF NOT EXISTS Ticket_Technicians (
    ID_Ticket_Technician INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_Technician INT,
    Is_Lead BOOLEAN DEFAULT FALSE,
    Assignment_Role VARCHAR(100),
    Assigned_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fk_Assigned_By INT,
    Status VARCHAR(50) DEFAULT 'Activo',
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians),
    FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users)
);

CREATE TABLE IF NOT EXISTS Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_User INT,
    Comment TEXT NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users)
);

CREATE TABLE IF NOT EXISTS Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_Comment INT,
    Fk_User INT,
    File_Name VARCHAR(255) NOT NULL,
    File_Path VARCHAR(1024) NOT NULL,
    File_Type VARCHAR(100) DEFAULT NULL,
    File_Size INT DEFAULT NULL,
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_Comment) REFERENCES Ticket_Comments(ID_Comment),
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users)
);

CREATE TABLE IF NOT EXISTS Ticket_Timeline (
    ID_Timeline INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_User_Actor INT,
    Action_Description TEXT,
    Old_Status VARCHAR(50),
    New_Status VARCHAR(50),
    Event_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_User_Actor) REFERENCES Users(ID_Users)
);

-- 6. Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    email VARCHAR(100) NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id INT NULL,
    description TEXT NULL,
    data JSON NULL,
    severity ENUM('info','warning','critical') DEFAULT 'info',
    success TINYINT(1) DEFAULT 1,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications
CREATE TABLE IF NOT EXISTS Notifications (
    ID_Notification INT AUTO_INCREMENT PRIMARY KEY,
    Fk_User INT NOT NULL,
    Type VARCHAR(100) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    Fk_Service_Request INT NULL,
    Is_Read TINYINT(1) DEFAULT 0 NOT NULL,
    Metadata JSON NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE SET NULL,
    INDEX idx_user_notifications (Fk_User, Is_Read),
    INDEX idx_ticket_notifications (Fk_Service_Request),
    INDEX idx_type (Type),
    INDEX idx_created_at (Created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notifications table';

-- 8. Escalation/Aux tables
CREATE TABLE IF NOT EXISTS Ticket_Escalations (
    ID_Escalation INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Original_Service_ID INT NOT NULL,
    Escalated_Service_ID INT NOT NULL,
    Escalated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Pending_Ticket_Alerts (
    ID_Alert INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Alert_Type VARCHAR(100) NOT NULL,
    Notified_At TIMESTAMP NULL,
    Resolved_At TIMESTAMP NULL,
    Resolution_Notes VARCHAR(1000) NULL
);

CREATE TABLE IF NOT EXISTS Escalation_Config (
    ID_Config INT AUTO_INCREMENT PRIMARY KEY,
    Priority_Level VARCHAR(50) NOT NULL,
    Hours_Threshold INT NOT NULL DEFAULT 4,
    Notify_Admins BOOLEAN DEFAULT TRUE,
    Auto_Escalate BOOLEAN DEFAULT FALSE
);

-- 9. Assistance Requests (simplified: technician requests admin help)
CREATE TABLE IF NOT EXISTS Assistance_Requests (
    ID_Request INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Ticket INT NOT NULL,
    Fk_Requesting_Technician INT NOT NULL,
    Fk_Assigned_Technician INT NULL,
    Status ENUM('PENDIENTE','ASIGNADO','RECHAZADO','CANCELADO') DEFAULT 'PENDIENTE',
    Requested_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP NULL,
    Notification_Count INT DEFAULT 0,
    Last_Notified_At TIMESTAMP NULL,
    FOREIGN KEY (Fk_Ticket) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_Requesting_Technician) REFERENCES Users(ID_Users),
    FOREIGN KEY (Fk_Assigned_Technician) REFERENCES Users(ID_Users)
);

CREATE INDEX idx_assistance_status ON Assistance_Requests(Status);
CREATE INDEX idx_assistance_ticket ON Assistance_Requests(Fk_Ticket);

-- 10. Bienes cache (SIFA API)
CREATE TABLE IF NOT EXISTS bienes_cache (
    query_key VARCHAR(64) PRIMARY KEY,
    response MEDIUMTEXT NOT NULL,
    is_lookup TINYINT(1) NOT NULL DEFAULT 0,
    cached_at INT UNSIGNED NOT NULL,
    INDEX idx_cached (cached_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default data (roles, services, sample users) -- keep minimal
INSERT IGNORE INTO Role (ID_Role, Role, Description) VALUES
(1, 'Admin', 'Administrador del sistema con acceso total'),
(2, 'Tecnico', 'Técnico de TI encargado de resolver tickets'),
(3, 'Jefe', 'Jefe de oficina que puede solicitar tickets'),
(4, 'Auditor', 'Auditor del sistema con permisos de solo lectura');

INSERT IGNORE INTO TI_Service (ID_TI_Service, Type_Service, Details) VALUES
(1, 'Redes', 'Configuración y mantenimiento de redes de computadoras'),
(2, 'Soporte', 'Soporte técnico general de hardware y software'),
(3, 'Programación', 'Desarrollo y mantenimiento de sistemas de software');

INSERT IGNORE INTO Service_Problems_Catalog (ID_Problem_Catalog, Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
-- Soporte (2)
(1, 2, 'Equipo no enciende', 'El equipo no responde al presionar el botón de encendido. Posible falla de fuente de poder o batería.', 'Alta'),
(2, 2, 'Equipo con error de encendido', 'El equipo se enciende pero muestra errores durante el arranque (BSOD, BIOS, etc.).', 'Alta'),
(3, 2, 'Impresora atascada', 'Papel atascado en la impresora impidiendo la impresión normal.', 'Media'),
(4, 2, 'Falla en impresora', 'La impresora no funciona correctamente o no imprime. Posible falla mecánica o de conexión.', 'Media'),
(5, 2, 'Recarga de tinta de impresora', 'Recarga de cartuchos de tinta para impresoras de inyección.', 'Baja'),
(6, 2, 'Cambio de toner', 'Sustitución de cartucho de tóner en impresora láser.', 'Baja'),
(7, 2, 'Problemas de software o programas', 'Errores en aplicaciones, instalación/desinstalación de programas, licencias, actualizaciones.', 'Media'),
-- Programación (3)
(8, 3, 'Caída de sistema', 'El sistema o aplicación no está disponible o presenta interrupciones del servicio.', 'Alta'),
(9, 3, 'Error de reporte', 'Los reportes generan errores, datos incorrectos o no se generan.', 'Media'),
-- Redes (1)
(10, 1, 'Desconexión de impresora', 'La impresora de red no responde o se ha desconectado.', 'Media'),
(11, 1, 'Sin internet', 'Falta de conectividad a internet en uno o varios equipos de la oficina.', 'Alta'),
(12, 1, 'Conectar impresora a red', 'Configuración e instalación de impresora en la red local.', 'Baja'),
(13, 1, 'Instalación de red interna y cableado por tubería', 'Tendido de cableado estructurado, instalación de puntos de red y configuración de switches/routers.', 'Media');

-- End of final schema
