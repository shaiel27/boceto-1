-- Database: tickets_system
CREATE DATABASE IF NOT EXISTS tickets_system;
USE tickets_system;

-- Users table
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role ENUM('admin', 'technician', 'requester') DEFAULT 'requester',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Office table
CREATE TABLE Office (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Office_Code VARCHAR(20) NOT NULL UNIQUE,
    Office_Name VARCHAR(200) NOT NULL,
    Direction_Code VARCHAR(20),
    Direction_Name VARCHAR(200),
    Division_Code VARCHAR(20),
    Division_Name VARCHAR(200),
    Coordination_Code VARCHAR(20),
    Coordination_Name VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TI_Service table (Technical Services)
CREATE TABLE TI_Service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Service_Code VARCHAR(20) NOT NULL UNIQUE,
    Service_Name VARCHAR(200) NOT NULL,
    Service_Description TEXT,
    Service_Category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service_Request table
CREATE TABLE Service_Request (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    office_id INT NOT NULL,
    service_type_id INT NOT NULL,
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    priority ENUM('Baja', 'Media', 'Alta') DEFAULT 'Media',
    status ENUM('Pendiente', 'En Proceso', 'Cerrado') DEFAULT 'Pendiente',
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (office_id) REFERENCES Office(id),
    FOREIGN KEY (service_type_id) REFERENCES TI_Service(id),
    FOREIGN KEY (assigned_to) REFERENCES Users(id)
);

-- Insert sample data
INSERT INTO Users (username, email, password, full_name, role) VALUES
('admin', 'admin@alcaldia.gob', 'password123', 'Administrador del Sistema', 'admin'),
('technician1', 'tech1@alcaldia.gob', 'password123', 'Carlos Diaz', 'technician'),
('technician2', 'tech2@alcaldia.gob', 'password123', 'Amna Verez', 'technician'),
('requester1', 'req1@alcaldia.gob', 'password123', 'Usuario Municipal', 'requester');

INSERT INTO Office (Office_Code, Office_Name, Direction_Name, Division_Name, Coordination_Name) VALUES
('CAT', 'Catastro', 'Dirección Administrativa', 'División Técnica', 'Coordinación de Catastro'),
('OBR', 'Obras Municipales', 'Dirección de Obras', 'División de Infraestructura', 'Coordinación de Construcción'),
('BIEN', 'Bienestar Social', 'Dirección Social', 'División de Asistencia', 'Coordinación de Programas Sociales'),
('FIN', 'Finanzas', 'Dirección Financiera', 'División de Presupuesto', 'Coordinación de Contabilidad');

INSERT INTO TI_Service (Service_Code, Service_Name, Service_Description, Service_Category) VALUES
('HW', 'Hardware', 'Problemas con equipos de cómputo, impresoras, redes', 'Equipos'),
('SW', 'Software', 'Instalación, configuración y problemas con programas', 'Programas'),
('NET', 'Redes', 'Conectividad, acceso a internet, configuración de red', 'Conectividad'),
('TEL', 'Telefonía', 'Líneas telefónicas, extensiones, central', 'Comunicaciones');

INSERT INTO Service_Request (user_id, office_id, service_type_id, subject, description, priority, status) VALUES
(4, 1, 1, 'Computadora no enciende', 'La computadora de mi escritorio no enciende, parece ser problema de fuente de poder', 'Alta', 'Pendiente'),
(4, 2, 2, 'Error en sistema de facturación', 'El sistema de facturación muestra error al generar reportes', 'Media', 'En Proceso'),
(4, 3, 3, 'Sin acceso a internet', 'No puedo acceder a internet desde mi computadora', 'Alta', 'Pendiente'),
(4, 4, 4, 'Extensión telefónica no funciona', 'Mi extensión telefónica no tiene tono de marcado', 'Baja', 'Cerrado');
