-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS MUNICIPAL
-- ==========================================
-- Script de Creación de Tablas - MySQL 8.0+
-- Creado: $(date '+%Y-%m-%d %H:%M:%S')
-- ==========================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS alcaldia_tickets_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE alcaldia_tickets_db;

-- ==========================================
-- 1. MÓDULO DE USUARIOS Y ACCESO
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

-- ==========================================
-- 2. MÓDULO DE ESTRUCTURA INSTITUCIONAL
-- ==========================================

-- Nivel 1: Direcciones
CREATE TABLE Directions (
    ID_Direction INT AUTO_INCREMENT PRIMARY KEY,
    Name_Direction VARCHAR(100) NOT NULL,
    Fk_Director INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nivel 2: Divisiones
CREATE TABLE Divisions (
    ID_Division INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Direction INT,
    Name_Division VARCHAR(100) NOT NULL,
    Fk_Division_Head INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nivel 3: Coordinaciones
CREATE TABLE Coordinations (
    ID_Coordination INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Division INT,
    Name_Coordination VARCHAR(100) NOT NULL,
    Fk_Coordinator INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. MÓDULO DE HORARIOS Y DISPONIBILIDAD
-- ==========================================

-- Bloques de Almuerzo
CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(20) NOT NULL,
    Start_Time TIME NOT NULL,
    End_Time TIME NOT NULL,
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. MÓDULO DE TÉCNICOS Y SERVICIOS TI
-- ==========================================

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

-- ==========================================
-- 5. MÓDULO DE GESTIÓN DE TICKETS
-- ==========================================

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
-- 6. CREACIÓN DE FOREIGN KEYS
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
-- 7. ÍNDICES PARA OPTIMIZACIÓN
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
-- COMENTARIOS FINALES
-- ==========================================
-- Este script crea la estructura completa de la base de datos:
-- - 15 tablas con relaciones jerárquicas
-- - Foreign keys configuradas con cascadas apropiadas
-- - Índices optimizados para alto rendimiento
-- - Motor InnoDB con charset UTF8MB4
--
-- Para ejecutar este script:
-- mysql -u root -p < 01_create_tables.sql
