-- Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS alcaldia_tickets_db;
USE alcaldia_tickets_db;

-- ==========================================
-- 1. TABLAS DE USUARIOS Y ACCESO
-- ==========================================

CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role_Name VARCHAR(20) NOT NULL,
    Description TEXT
) ENGINE=InnoDB AUTO_INCREMENT=1;

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
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE NOT NULL,
    Status VARCHAR(20) DEFAULT 'Disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1;

-- ==========================================
-- 2. TABLAS DE ESTRUCTURA INSTITUCIONAL
-- ==========================================

CREATE TABLE Office (
    ID_Office INT AUTO_INCREMENT PRIMARY KEY,
    Name_Office VARCHAR(100) NOT NULL,
    Building VARCHAR(50),
    Telephone_Number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30) NOT NULL,
    Details TEXT
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technicians INT NOT NULL,
    Fk_TI_Service INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Technicians) REFERENCES Technicians(ID_Technicians) ON DELETE CASCADE,
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service) ON DELETE CASCADE,
    UNIQUE KEY (Fk_Technicians, Fk_TI_Service) -- Evita duplicados de especialidad
) ENGINE=InnoDB AUTO_INCREMENT=1;

-- ==========================================
-- 3. TABLAS DE GESTIÓN DE SOLICITUDES (TICKETS)
-- ==========================================

CREATE TABLE Service_Request (
    ID_Service_Request INT AUTO_INCREMENT PRIMARY KEY,
    Ticket_Code VARCHAR(20) UNIQUE NOT NULL,
    Fk_Users INT NOT NULL,
    FK_Office INT NOT NULL,
    Fk_TI_Service INT NOT NULL,
    Fk_Technician_Current INT NULL,
    Subject VARCHAR(100) NOT NULL,
    Property_number VARCHAR(20), -- Aumentado a 20 por seguridad
    Description TEXT NOT NULL,
    Request_Type VARCHAR(20), 
    User_Priority VARCHAR(15),
    System_Priority VARCHAR(15) NULL,
    Status VARCHAR(20) DEFAULT 'Pendiente',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Resolved_at TIMESTAMP NULL,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users),
    FOREIGN KEY (FK_Office) REFERENCES Office(ID_Office),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service),
    FOREIGN KEY (Fk_Technician_Current) REFERENCES Technicians(ID_Technicians) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    File_Name VARCHAR(100) NOT NULL,
    File_Path VARCHAR(255) NOT NULL,
    File_Type VARCHAR(10),
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1;

-- ==========================================
-- 4. TABLAS DE AUDITORÍA Y TRAZABILIDAD
-- ==========================================

CREATE TABLE Ticket_Assignments_History (
    ID_Assignment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_Technician INT NOT NULL,
    Fk_Assigned_By INT NOT NULL,
    Assignment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Reason_Reassignment TEXT,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians),
    FOREIGN KEY (Fk_Assigned_By) REFERENCES Users(ID_Users)
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE Ticket_Timeline (
    ID_Timeline INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_User_Action INT NOT NULL,
    Action_Type VARCHAR(50) NOT NULL,
    Previous_Value VARCHAR(50),
    New_Value VARCHAR(50),
    Action_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE,
    FOREIGN KEY (Fk_User_Action) REFERENCES Users(ID_Users)
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Fk_User INT NOT NULL,
    Comment TEXT NOT NULL,
    Is_Internal BOOLEAN DEFAULT TRUE,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE CASCADE,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users)
) ENGINE=InnoDB AUTO_INCREMENT=1;