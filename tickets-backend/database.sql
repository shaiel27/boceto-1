-- Database: tickets_system
CREATE DATABASE IF NOT EXISTS tickets_system;
USE tickets_system;

-- ==========================================
-- 1. MÓDULO DE USUARIOS Y ACCESO (LOGIN)
-- ==========================================

CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20) NOT NULL,
    Description TEXT,
    UNIQUE KEY (Role)
);

CREATE TABLE Users (
    ID_Users INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Role INT,
    Email VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Full_Name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role)
);

CREATE TABLE Boss (
    ID_Boss INT AUTO_INCREMENT PRIMARY KEY,
    Name_Boss VARCHAR(200) NOT NULL,
    Pronoun VARCHAR(20),
    Fk_User INT UNIQUE,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users)
);

-- ==========================================
-- 2. INFRAESTRUCTURA INSTITUCIONAL (UNIFICADA)
-- ==========================================

CREATE TABLE Office (
    ID_Office INT AUTO_INCREMENT PRIMARY KEY,
    Name_Office VARCHAR(100) NOT NULL,
    Office_Type VARCHAR(20) NOT NULL COMMENT "'Direction', 'Coordination', 'Division'",
    Fk_Parent_Office INT NULL COMMENT 'ID de la oficina superior',
    Fk_Boss_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Boss_ID) REFERENCES Boss(ID_Boss),
    FOREIGN KEY (Fk_Parent_Office) REFERENCES Office(ID_Office)
);

-- ==========================================
-- 3. TÉCNICOS Y SERVICIOS TI
-- ==========================================

CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE,
    First_Name VARCHAR(25) NOT NULL,
    Last_Name VARCHAR(25) NOT NULL,
    Fk_Lunch_Block INT NULL,
    Status VARCHAR(20) DEFAULT 'Activo' COMMENT "'Activo', 'Inactivo'",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users)
);

CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30) NOT NULL COMMENT "'Redes', 'Soporte', 'Programación'",
    Details TEXT
);

CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT,
    Fk_Technicians INT,
    Status VARCHAR(15) DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians)
);

CREATE TABLE Service_Problems_Catalog (
    ID_Problem_Catalog INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT,
    Problem_Name VARCHAR(100) NOT NULL,
    Typical_Description TEXT,
    Estimated_Severity VARCHAR(15),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service)
);

CREATE TABLE Technician_Schedules (
    ID_Schedule INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technician INT,
    Day_Of_Week VARCHAR(10) NOT NULL,
    Work_Start_Time TIME DEFAULT '08:00:00',
    Work_End_Time TIME NOT NULL,
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians)
);

CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(20) NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL
);

-- ==========================================
-- 4. CONFIGURACIÓN DE PERMISOS Y SISTEMAS
-- ==========================================

CREATE TABLE Service_Permissions (
    ID_Permission INT AUTO_INCREMENT PRIMARY KEY,
    Fk_TI_Service INT,
    Fk_Office INT COMMENT 'Apunta a la oficina en la tabla maestra',
    Is_Allowed BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office)
);

CREATE TABLE Request_Settings (
    ID_Setting INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Office_ID INT,
    Can_Request_Directly BOOLEAN DEFAULT TRUE,
    Must_Be_Approved_By_Superior BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (Fk_Office_ID) REFERENCES Office(ID_Office)
);

CREATE TABLE Software_Systems (
    ID_System INT AUTO_INCREMENT PRIMARY KEY,
    System_Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Status VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE Office_Systems (
    ID_Office_System INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Office_ID INT,
    Fk_System_ID INT,
    FOREIGN KEY (Fk_Office_ID) REFERENCES Office(ID_Office),
    FOREIGN KEY (Fk_System_ID) REFERENCES Software_Systems(ID_System)
);

-- ==========================================
-- 5. MÓDULO DE GESTIÓN DE TICKETS
-- ==========================================

CREATE TABLE Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(20) UNIQUE,
    Fk_Office INT COMMENT 'Oficina de origen (Maestra)',
    Fk_User_Requester INT COMMENT 'ID del Jefe que solicita',
    Fk_TI_Service INT,
    Fk_Problem_Catalog INT,
    Fk_Boss_Requester INT COMMENT 'El jefe específico que hizo la solicitud',
    Fk_Software_System INT NULL COMMENT 'Obligatorio si es Programación',
    Subject VARCHAR(100) NOT NULL,
    Property_Number VARCHAR(10),
    Description TEXT,
    System_Priority VARCHAR(15) DEFAULT 'Media',
    Resolution_Notes TEXT NULL,
    Status VARCHAR(20) DEFAULT 'Pendiente',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL,
    FOREIGN KEY (Fk_Office) REFERENCES Office(ID_Office),
    FOREIGN KEY (Fk_User_Requester) REFERENCES Users(ID_Users),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Problem_Catalog) REFERENCES Service_Problems_Catalog(ID_Problem_Catalog),
    FOREIGN KEY (Fk_Software_System) REFERENCES Software_Systems(ID_System),
    FOREIGN KEY (Fk_Boss_Requester) REFERENCES Boss(ID_Boss)
);

CREATE TABLE Ticket_Technicians (
    ID_Ticket_Technician INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_Technician INT,
    Is_Lead BOOLEAN DEFAULT FALSE COMMENT 'Técnico responsable principal',
    Assignment_Role VARCHAR(30) COMMENT "'Apoyo', 'Especialista', 'Supervisor'",
    Assigned_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fk_Assigned_By INT COMMENT 'ID del Admin que realizó la asignación',
    Status VARCHAR(20) DEFAULT 'Activo' COMMENT "'Activo', 'Finalizado'",
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians),
    FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users)
);

CREATE TABLE Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_User INT,
    Comment TEXT NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users)
);

CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    File_Name VARCHAR(100) NOT NULL,
    File_Path VARCHAR(255) NOT NULL,
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request)
);

CREATE TABLE Ticket_Timeline (
    ID_Timeline INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_User_Actor INT COMMENT 'Quién hizo el cambio',
    Action_Description TEXT COMMENT "'Admin agregó al técnico Carlos como apoyo'",
    Old_Status VARCHAR(20),
    New_Status VARCHAR(20),
    Event_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_User_Actor) REFERENCES Users(ID_Users)
);

-- ==========================================
-- INSERT DATA DE PRUEBA
-- ==========================================

-- Roles
INSERT INTO Role (Role, Description) VALUES
('Admin', 'Administrador del sistema con acceso total'),
('Tecnico', 'Técnico de TI encargado de resolver tickets'),
('Jefe', 'Jefe de oficina que puede solicitar tickets');

-- Usuarios
INSERT INTO Users (Fk_Role, Email, Password, Username, Full_Name) VALUES
(1, 'admin@alcaldia.gob', 'password123', 'admin', 'Administrador del Sistema'),
(2, 'tech1@alcaldia.gob', 'password123', 'carlos_diaz', 'Carlos Diaz'),
(2, 'tech2@alcaldia.gob', 'password123', 'amna_verez', 'Amna Verez'),
(3, 'jefe1@alcaldia.gob', 'password123', 'juan_perez', 'Juan Pérez'),
(3, 'jefe2@alcaldia.gob', 'password123', 'maria_gonzalez', 'María González');

-- Jefes
INSERT INTO Boss (Name_Boss, Pronoun, Fk_User) VALUES
('Juan Pérez', 'Sr.', 4),
('María González', 'Sra.', 5);

-- Oficinas
INSERT INTO Office (Name_Office, Office_Type, Fk_Boss_ID) VALUES
('Dirección Administrativa', 'Direction', 1),
('Dirección de Obras', 'Direction', 2),
('Dirección Social', 'Direction', 1),
('División Técnica', 'Division', 1),
('División de Infraestructura', 'Division', 2),
('Coordinación de Catastro', 'Coordination', 1),
('Coordinación de Construcción', 'Coordination', 2);

-- Servicios TI
INSERT INTO TI_Service (Type_Service, Details) VALUES
('Redes', 'Configuración y mantenimiento de redes de computadoras'),
('Soporte', 'Soporte técnico general de hardware y software'),
('Programación', 'Desarrollo y mantenimiento de sistemas de software');

-- Técnicos
INSERT INTO Technicians (Fk_Users, First_Name, Last_Name, Status) VALUES
(2, 'Carlos', 'Diaz', 'Activo'),
(3, 'Amna', 'Verez', 'Activo');

-- Relación Técnicos-Servicios
INSERT INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status) VALUES
(1, 1, 'Activo'),
(2, 1, 'Activo'),
(1, 2, 'Activo'),
(3, 2, 'Activo');

-- Catálogo de Problemas
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(1, 'Sin conexión a internet', 'No se puede acceder a la red o internet', 'Alta'),
(2, 'Computadora no enciende', 'El equipo no responde al presionar el botón de encendido', 'Alta'),
(2, 'Error en sistema', 'El sistema muestra mensajes de error', 'Media'),
(3, 'Error en base de datos', 'Problemas con la conexión o consultas SQL', 'Alta');

-- Sistemas de Software
INSERT INTO Software_Systems (System_Name, Description, Status) VALUES
('Sistema de Facturación', 'Sistema para gestión de facturas y pagos', 'Activo'),
('Sistema de Catastro', 'Sistema para gestión de catastro inmobiliario', 'Activo'),
('Sistema de RRHH', 'Sistema de recursos humanos', 'Activo');

-- Tickets de prueba
INSERT INTO Service_Request (Fk_Office, Fk_User_Requester, Fk_TI_Service, Fk_Boss_Requester, Subject, Description, System_Priority, Status) VALUES
(6, 4, 1, 1, 'Sin conexión a internet', 'No puedo acceder a internet desde mi computadora', 'Alta', 'Pendiente'),
(7, 5, 2, 2, 'Computadora no enciende', 'La computadora no responde al encender', 'Alta', 'En Proceso'),
(5, 4, 3, 1, 'Error en sistema de facturación', 'El sistema muestra error al generar reportes', 'Media', 'Pendiente');
