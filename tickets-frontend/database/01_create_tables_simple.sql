-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS MUNICIPAL - VERSIÓN SIMPLE
-- ==========================================
-- Script de Creación de Tablas - Compatible con MySQL/MariaDB
-- Sin triggers ni constraints complejas
-- ==========================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS alcaldia_tickets_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE alcaldia_tickets_db;

-- ==========================================
-- 1. MÓDULO DE USUARIOS Y ACCESO (SIN DEPENDENCIAS)
-- ==========================================

-- Tabla de Roles
CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20),
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios
CREATE TABLE Users (
    ID_Users INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Role INT,
    First_Name VARCHAR(25),
    Last_Name VARCHAR(25),
    CI VARCHAR(12) UNIQUE,
    Telephone_Number VARCHAR(20),
    Email VARCHAR(50) UNIQUE,
    Password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. MÓDULO DE ESTRUCTURA INSTITUCIONAL
-- ==========================================

-- Nivel 1: Direcciones
CREATE TABLE Directions (
    ID_Direction INT AUTO_INCREMENT PRIMARY KEY,
    Name_Direction VARCHAR(100),
    Fk_Director INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nivel 2: Divisiones
CREATE TABLE Divisions (
    ID_Division INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Direction INT,
    Name_Division VARCHAR(100),
    Fk_Division_Head INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nivel 3: Coordinaciones
CREATE TABLE Coordinations (
    ID_Coordination INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Division INT,
    Name_Coordination VARCHAR(100),
    Fk_Coordinator INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. MÓDULO DE HORARIOS Y DISPONIBILIDAD
-- ==========================================

-- Bloques de Almuerzo
CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(20),
    Start_Time TIME,
    End_Time TIME,
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. MÓDULO DE TÉCNICOS Y SERVICIOS TI
-- ==========================================

-- Tabla de Técnicos
CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE,
    Fk_Lunch_Block INT,
    Status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios TI
CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30),
    Details TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios de Técnicos
CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technicians INT,
    Fk_TI_Service INT,
    status VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Horarios de Técnicos
CREATE TABLE Technician_Schedules (
    ID_Schedule INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technician INT,
    Day_Of_Week VARCHAR(10),
    Work_Start_Time TIME DEFAULT '08:00:00',
    Work_End_Time TIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. MÓDULO DE GESTIÓN DE TICKETS
-- ==========================================

-- Tabla Principal de Tickets
CREATE TABLE Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(20) UNIQUE,
    Fk_Users INT,
    Fk_Coordination INT,
    Fk_TI_Service INT,
    Fk_Technician_Current INT,
    Subject VARCHAR(100),
    Property_number VARCHAR(10),
    Description TEXT,
    Request_Type VARCHAR(20),
    User_Priority VARCHAR(15),
    System_Priority VARCHAR(15),
    Status VARCHAR(20) DEFAULT 'Pendiente',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Adjuntos de Tickets
CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    File_Name VARCHAR(100),
    File_Path VARCHAR(255),
    File_Type VARCHAR(10),
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
    Comment TEXT,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. CREACIÓN DE FOREIGN KEYS (ORDEN CORRECTO)
-- ==========================================

-- Foreign Keys de Usuarios
ALTER TABLE Users 
ADD CONSTRAINT fk_users_role 
FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role);

-- Foreign Keys de Direcciones
ALTER TABLE Directions 
ADD CONSTRAINT fk_directions_director 
FOREIGN KEY (Fk_Director) REFERENCES Users(ID_Users);

-- Foreign Keys de Divisiones
ALTER TABLE Divisions 
ADD CONSTRAINT fk_divisions_direction 
FOREIGN KEY (Fk_Direction) REFERENCES Directions(ID_Direction),
ADD CONSTRAINT fk_divisions_head 
FOREIGN KEY (Fk_Division_Head) REFERENCES Users(ID_Users);

-- Foreign Keys de Coordinaciones
ALTER TABLE Coordinations 
ADD CONSTRAINT fk_coordinations_division 
FOREIGN KEY (Fk_Division) REFERENCES Divisions(ID_Division),
ADD CONSTRAINT fk_coordinations_coordinator 
FOREIGN KEY (Fk_Coordinator) REFERENCES Users(ID_Users);

-- Foreign Keys de Técnicos
ALTER TABLE Technicians 
ADD CONSTRAINT fk_technicians_users 
FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users),
ADD CONSTRAINT fk_technicians_lunch_block 
FOREIGN KEY (Fk_Lunch_Block) REFERENCES Lunch_Blocks(ID_Lunch_Block);

-- Foreign Keys de Servicios de Técnicos
ALTER TABLE Technicians_Service 
ADD CONSTRAINT fk_technicians_service_technician 
FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians),
ADD CONSTRAINT fk_technicians_service_service 
FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service);

-- Foreign Keys de Horarios de Técnicos
ALTER TABLE Technician_Schedules 
ADD CONSTRAINT fk_schedules_technician 
FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians);

-- Foreign Keys de Tickets
ALTER TABLE Service_Request 
ADD CONSTRAINT fk_service_request_users 
FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users),
ADD CONSTRAINT fk_service_request_coordination 
FOREIGN KEY (Fk_Coordination) REFERENCES Coordinations(ID_Coordination),
ADD CONSTRAINT fk_service_request_service 
FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
ADD CONSTRAINT fk_service_request_technician 
FOREIGN KEY (Fk_Technician_Current) REFERENCES Technicians(ID_Technicians);

-- Foreign Keys de Adjuntos
ALTER TABLE Ticket_Attachments 
ADD CONSTRAINT fk_attachments_request 
FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request);

-- Foreign Keys de Historial
ALTER TABLE Ticket_Assignments_History 
ADD CONSTRAINT fk_assignments_request 
FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
ADD CONSTRAINT fk_assignments_technician 
FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians),
ADD CONSTRAINT fk_assignments_assigned_by 
FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users);

-- Foreign Keys de Comentarios
ALTER TABLE Ticket_Comments 
ADD CONSTRAINT fk_comments_request 
FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
ADD CONSTRAINT fk_comments_user 
FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users);

-- ==========================================
-- COMENTARIOS FINALES
-- ==========================================
-- Este script crea la estructura básica de la base de datos:
-- - 15 tablas con AUTO_INCREMENT en todos los IDs
-- - Foreign keys configuradas sin cascadas complejas
-- - Sin triggers ni constraints de validación
-- - Compatible con MySQL y MariaDB
--
-- Para ejecutar este script:
-- mysql -u root -p < 01_create_tables_simple.sql
