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
    Office_Type VARCHAR(20) NOT NULL,
    Fk_Parent_Office INT NULL,
    Fk_Boss_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Boss_ID) REFERENCES Boss(ID_Boss),
    FOREIGN KEY (Fk_Parent_Office) REFERENCES Office(ID_Office)
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
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users)
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

-- 5. Tickets
CREATE TABLE IF NOT EXISTS Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(50) UNIQUE,
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
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL,
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office),
    FOREIGN KEY (Fk_User_Requester) REFERENCES Users(ID_Users),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Problem_Catalog) REFERENCES Service_Problems_Catalog(ID_Problem_Catalog),
    FOREIGN KEY (Fk_Software_System) REFERENCES Software_Systems(ID_System),
    FOREIGN KEY (Fk_Boss_Requester) REFERENCES Boss(ID_Boss)
);

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
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE SET NULL
);

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

-- End of final schema
