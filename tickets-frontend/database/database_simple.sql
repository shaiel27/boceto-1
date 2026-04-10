-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS MUNICIPAL - VERSIÓN SIMPLE
-- ==========================================
-- Script Completo para Instalación - Compatible con MySQL/MariaDB
-- Sin triggers ni constraints complejas
-- ==========================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS alcaldia_tickets_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE alcaldia_tickets_db;

-- ==========================================
-- 1. CREACIÓN DE TABLAS (ORDEN CORRECTO)
-- ==========================================

-- Tabla de Roles (sin dependencias)
CREATE TABLE Role (
    ID_Role INT AUTO_INCREMENT PRIMARY KEY,
    Role VARCHAR(20),
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios (depende de Role)
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

-- Tabla de Direcciones (depende de Users)
CREATE TABLE Directions (
    ID_Direction INT AUTO_INCREMENT PRIMARY KEY,
    Name_Direction VARCHAR(100),
    Fk_Director INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Divisiones (depende de Directions y Users)
CREATE TABLE Divisions (
    ID_Division INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Direction INT,
    Name_Division VARCHAR(100),
    Fk_Division_Head INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Coordinaciones (depende de Divisions y Users)
CREATE TABLE Coordinations (
    ID_Coordination INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Division INT,
    Name_Coordination VARCHAR(100),
    Fk_Coordinator INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Bloques de Almuerzo (sin dependencias)
CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(20),
    Start_Time TIME,
    End_Time TIME,
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios TI (sin dependencias)
CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(30),
    Details TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Técnicos (depende de Users y Lunch_Blocks)
CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE,
    Fk_Lunch_Block INT,
    Status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Servicios de Técnicos (depende de Technicians y TI_Service)
CREATE TABLE Technicians_Service (
    ID_Technicians_Service INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technicians INT,
    Fk_TI_Service INT,
    status VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Horarios de Técnicos (depende de Technicians)
CREATE TABLE Technician_Schedules (
    ID_Schedule INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technician INT,
    Day_Of_Week VARCHAR(10),
    Work_Start_Time TIME DEFAULT '08:00:00',
    Work_End_Time TIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Principal de Tickets (depende de Users, Coordinations, TI_Service, Technicians)
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

-- Tabla de Adjuntos de Tickets (depende de Service_Request)
CREATE TABLE Ticket_Attachments (
    ID_Attachment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    File_Name VARCHAR(100),
    File_Path VARCHAR(255),
    File_Type VARCHAR(10),
    Uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Historial de Asignaciones (depende de Service_Request, Technicians, Users)
CREATE TABLE Ticket_Assignments_History (
    ID_Assignment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_Technician INT,
    Fk_Assigned_By INT,
    Assignment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Comentarios de Tickets (depende de Service_Request y Users)
CREATE TABLE Ticket_Comments (
    ID_Comment INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_User INT,
    Comment TEXT,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. CREACIÓN DE FOREIGN KEYS
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
-- 3. INSERCIÓN DE DATOS INICIALES
-- ==========================================

-- Roles del sistema
INSERT INTO Role (Role, Description) VALUES
('Administrador', 'Acceso completo al sistema, gestión de usuarios y configuración'),
('Director', 'Gerencia de dirección, supervisión de divisiones y coordinaciones'),
('Jefe_Division', 'Administración de división, gestión de coordinaciones y personal'),
('Coordinador', 'Gestión de coordinación específica, supervisión de técnicos'),
('Tecnico', 'Especialista TI, atención de tickets y soporte técnico'),
('Usuario_Solicitante', 'Usuario final que crea solicitudes de servicio'),
('Secretaria', 'Soporte administrativo, gestión documental y atención básica');

-- Bloques de almuerzo
INSERT INTO Lunch_Blocks (Block_Name, Start_Time, End_Time, Description) VALUES
('Grupo 1', '11:30:00', '12:10:00', 'Primer grupo de almuerzo - 40 minutos'),
('Grupo 2', '12:10:00', '12:50:00', 'Segundo grupo de almuerzo - 40 minutos'),
('Grupo 3', '12:50:00', '13:30:00', 'Tercer grupo de almuerzo - 40 minutos'),
('Grupo 4', '13:30:00', '14:10:00', 'Cuarto grupo de almuerzo - 40 minutos');

-- Tipos de servicios TI
INSERT INTO TI_Service (Type_Service, Details) VALUES
('Redes', 'Configuración y mantenimiento de redes, conexión a internet, VPN, firewall'),
('Soporte Tecnico', 'Soporte general de hardware y software, diagnóstico de problemas'),
('Programacion', 'Desarrollo de aplicaciones, scripts, automatización de procesos'),
('Base de Datos', 'Administración de bases de datos, backups, migraciones'),
('Seguridad', 'Gestión de seguridad informática, antivirus, políticas de acceso'),
('Telecomunicaciones', 'Sistemas de telefonía, videoconferencias, comunicaciones'),
('Sistemas Operativos', 'Instalación, configuración y mantenimiento de sistemas operativos'),
('Correo Electrónico', 'Gestión de servidores de correo, configuración de cuentas');

-- Usuarios
INSERT INTO Users (Fk_Role, First_Name, Last_Name, CI, Telephone_Number, Email, Password) VALUES
-- Administradores
(1, 'Carlos', 'Rodríguez', 'V-12345678', '0414-1234567', 'carlos.rodriguez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(1, 'María', 'González', 'V-87654321', '0414-7654321', 'maria.gonzalez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Directores
(2, 'Luis', 'Martínez', 'V-11223344', '0414-1122334', 'luis.martinez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(2, 'Ana', 'Silva', 'V-55667788', '0414-5566778', 'ana.silva@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(2, 'Pedro', 'López', 'V-99887766', '0414-9988776', 'pedro.lopez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Jefes de División
(3, 'Diana', 'Hernández', 'V-44556677', '0414-4455667', 'diana.hernandez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(3, 'Roberto', 'Díaz', 'V-88990011', '0414-8899001', 'roberto.diaz@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Coordinadores
(4, 'Carmen', 'Pérez', 'V-22334455', '0414-2233445', 'carmen.perez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(4, 'José', 'Ramírez', 'V-66778899', '0414-6677889', 'jose.ramirez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Técnicos
(5, 'Miguel', 'Torres', 'V-33445566', '0414-3344556', 'miguel.torres@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(5, 'Laura', 'Vargas', 'V-77889900', '0414-7788990', 'laura.vargas@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(5, 'Santiago', 'Mendoza', 'V-55443322', '0414-5544332', 'santiago.mendoza@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(5, 'Patricia', 'Rojas', 'V-99118822', '0414-9911882', 'patricia.rojas@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
-- Usuarios Solicitantes
(6, 'Juan', 'García', 'V-44667788', '0414-4466778', 'juan.garcia@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(6, 'Elena', 'Castro', 'V-88776655', '0414-8877665', 'elena.castro@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(6, 'Ricardo', 'Fernández', 'V-22334411', '0414-2233441', 'ricardo.fernandez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6');

-- Estructura Institucional
INSERT INTO Directions (Name_Direction, Fk_Director) VALUES
('Dirección de Administración', 3),
('Dirección de Obras Públicas', 4),
('Dirección de Servicios Públicos', 5),
('Dirección de Educación', NULL),
('Dirección de Salud', NULL),
('Dirección de Catastro', NULL),
('Dirección de Urbanismo', NULL),
('Dirección de Finanzas', NULL);

INSERT INTO Divisions (Fk_Direction, Name_Division, Fk_Division_Head) VALUES
(1, 'División de Recursos Humanos', 6),
(1, 'División de Compras', NULL),
(1, 'División de Tesorería', NULL),
(2, 'División de Ingeniería Municipal', 7),
(2, 'División de Mantenimiento Vial', NULL),
(2, 'División de Construcción', NULL),
(3, 'División de Aseo Urbano', NULL),
(3, 'División de Alcantarillado', NULL),
(3, 'División de Aguas Servidas', NULL),
(4, 'División de Docencia', NULL),
(4, 'División de Infraestructura Educativa', NULL),
(5, 'División de Atención Primaria', NULL),
(5, 'División de Salud Pública', NULL),
(6, 'División de Catastro Legal', NULL),
(6, 'División de Avalúos', NULL),
(6, 'División de Cartografía', NULL),
(7, 'División de Planificación', NULL),
(7, 'División de Control Urbano', NULL),
(8, 'División de Contabilidad', NULL),
(8, 'División de Presupuesto', NULL);

INSERT INTO Coordinations (Fk_Division, Name_Coordination, Fk_Coordinator) VALUES
(1, 'Coordinación de Nóminas', 8),
(1, 'Coordinación de Contratación', NULL),
(1, 'Coordinación de Capacitación', NULL),
(2, 'Coordinación de Adquisiciones', NULL),
(2, 'Coordinación de Almacén', NULL),
(3, 'Coordinación de Caja', NULL),
(3, 'Coordinación de Cuentas por Pagar', NULL),
(4, 'Coordinación de Proyectos', 9),
(4, 'Coordinación de Estudios Técnicos', NULL),
(5, 'Coordinación de Semáforos', NULL),
(5, 'Coordinación de Señalización', NULL),
(6, 'Coordinación de Edificaciones', NULL),
(6, 'Coordinación de Infraestructura', NULL),
(7, 'Coordinación de Recolección', NULL),
(7, 'Coordinación de Disposición Final', NULL),
(8, 'Coordinación de Mantenimiento de Redes', NULL),
(8, 'Coordinación de Nuevas Conexiones', NULL),
(9, 'Coordinación de Tratamiento', NULL),
(9, 'Coordinación de Control de Calidad', NULL),
(10, 'Coordinación de Escuelas Básicas', NULL),
(10, 'Coordinación de Liceos', NULL),
(11, 'Coordinación de Mantenimiento Escolar', NULL),
(11, 'Coordinación de Construcción Escolar', NULL),
(12, 'Coordinación de Ambulatorios', NULL),
(12, 'Coordinación de Programas Preventivos', NULL),
(13, 'Coordinación de Epidemiología', NULL),
(13, 'Coordinación de Vacunación', NULL),
(14, 'Coordinación de Registro Inmobiliario', NULL),
(14, 'Coordinación de Transferencias', NULL),
(15, 'Coordinación de Avalúos Urbanos', NULL),
(15, 'Coordinación de Avalúos Rurales', NULL),
(16, 'Coordinación de Mapas Digitales', NULL),
(16, 'Coordinación de Actualización Cartográfica', NULL),
(17, 'Coordinación de Planes Urbanos', NULL),
(17, 'Coordinación de Zonificación', NULL),
(18, 'Coordinación de Inspecciones', NULL),
(18, 'Coordinación de Permisos', NULL),
(19, 'Coordinación de Cuentas Generales', NULL),
(19, 'Coordinación de Estados Financieros', NULL),
(20, 'Coordinación de Elaboración Presupuestaria', NULL),
(20, 'Coordinación de Control Presupuestario', NULL);

-- Técnicos y sus servicios
INSERT INTO Technicians (Fk_Users, Fk_Lunch_Block, Status) VALUES
(10, 1, 'Disponible'), -- Miguel Torres
(11, 2, 'Disponible'), -- Laura Vargas
(12, 3, 'Disponible'), -- Santiago Mendoza
(13, 4, 'Vacaciones'); -- Patricia Rojas

INSERT INTO Technicians_Service (Fk_Technicians, Fk_TI_Service, status) VALUES
(1, 1, 'Activo'), -- Miguel Torres - Redes
(1, 2, 'Activo'), -- Miguel Torres - Soporte Técnico
(2, 2, 'Activo'), -- Laura Vargas - Soporte Técnico
(2, 5, 'Activo'), -- Laura Vargas - Seguridad
(3, 3, 'Activo'), -- Santiago Mendoza - Programación
(3, 4, 'Activo'), -- Santiago Mendoza - Base de Datos
(4, 1, 'Activo'), -- Patricia Rojas - Redes
(4, 6, 'Activo'); -- Patricia Rojas - Telecomunicaciones

-- Tickets de ejemplo
INSERT INTO Service_Request (
    Ticket_Code, Fk_Users, Fk_Coordination, Fk_TI_Service, Fk_Technician_Current, 
    Subject, Property_number, Description, Request_Type, User_Priority, Status
) VALUES
('T-2025-0001', 14, 1, 2, 1, 'Computadora no enciende', 'A-101', 'La computadora de escritorio no enciende, no hay luz de power', 'Digital', 'Alta', 'En Proceso'),
('T-2025-0002', 15, 4, 1, 2, 'Sin conexión a internet', 'B-205', 'No tengo acceso a internet desde hace 2 horas', 'Digital', 'Media', 'Pendiente'),
('T-2025-0003', 16, 10, 3, 3, 'Error en sistema de nóminas', 'C-301', 'El sistema muestra error al calcular las horas extras', 'Digital', 'Alta', 'En Proceso'),
('T-2025-0004', 14, 14, 4, NULL, 'Lentitud en base de datos', 'D-402', 'Las consultas toman más de 30 segundos en responder', 'Digital', 'Media', 'Pendiente'),
('T-2025-0005', 15, 8, 1, 1, 'Problema con semáforo', 'E-503', 'El semáforo principal está en luz intermitente', 'Fisico', 'Urgente', 'Resuelto'),
('T-2025-0006', 16, 28, 2, 2, 'Impresora no funciona', 'F-604', 'La impresora no imprime y muestra error de papel atascado', 'Digital', 'Baja', 'Pendiente'),
('T-2025-0007', 14, 20, 5, NULL, 'Solicitud de acceso a sistema', 'G-705', 'Necesito acceso al sistema de contabilidad', 'Digital', 'Media', 'En Proceso'),
('T-2025-0008', 15, 24, 6, 3, 'Teléfono sin línea', 'H-806', 'El teléfono de la oficina no tiene línea telefónica', 'Fisico', 'Alta', 'Resuelto');

-- Comentarios de tickets
INSERT INTO Ticket_Comments (Fk_Service_Request, Fk_User, Comment) VALUES
(1, 1, 'Ticket asignado al técnico Miguel Torres para diagnóstico'),
(1, 10, 'Se verificó la fuente de poder, necesita reemplazo'),
(2, 2, 'Se verificó el cable de red y el router, parece ser problema del ISP'),
(3, 3, 'Se está revisando el código del módulo de cálculo de horas'),
(4, 1, 'Se necesita optimizar las consultas y agregar índices'),
(5, 10, 'Se reemplazó el controlador del semáforo, sistema operativo normalmente'),
(6, 2, 'Se limpiaron los rodillos y se reemplazó el cartucho de tinta'),
(7, 1, 'Se está procesando la solicitud de acceso, se requiere aprobación del director'),
(8, 10, 'Se reparó la línea telefónica, servicio restablecido');

-- ==========================================
-- COMENTARIOS FINALES
-- ==========================================
-- Este script completo instala todo el sistema en un solo paso:
-- 1. Crea base de datos y todas las tablas con AUTO_INCREMENT
-- 2. Establece foreign keys básicas sin cascadas complejas
-- 3. Inserta datos iniciales de ejemplo
-- 4. Compatible con MySQL y MariaDB
-- 5. Sin triggers ni constraints de validación
--
-- Para ejecutar este script:
-- mysql -u root -p < database_simple.sql
--
-- La base de datos quedará completamente funcional con:
-- - 15 tablas con relaciones jerárquicas
-- - 8 direcciones, 20 divisiones, 41 coordinaciones
-- - 16 usuarios con diferentes roles
-- - 4 técnicos con especializaciones
-- - 8 tickets de ejemplo
-- - Datos funcionales para pruebas inmediatas
