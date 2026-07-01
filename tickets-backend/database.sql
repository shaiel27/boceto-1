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
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Full_Name VARCHAR(200) NOT NULL,
    is_system_user BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Role) REFERENCES Role(ID_Role)
);

-- Índices recomendados para optimizar login y filtrado por usuarios del sistema
CREATE INDEX idx_users_system ON Users(is_system_user, Email);
CREATE INDEX idx_users_active ON Users(is_system_user, Full_Name);

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
    coduniadm VARCHAR(20) UNIQUE NULL COMMENT 'ID de la API de bienes (spg_unidadadministrativa)',
    Fk_Boss_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Boss_ID) REFERENCES Boss(ID_Boss)
);

-- ==========================================
-- 3. TÉCNICOS Y SERVICIOS TI
-- ==========================================

CREATE TABLE Technicians (
    ID_Technicians INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Users INT UNIQUE,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Fk_Lunch_Block INT NULL,
    Status VARCHAR(20) DEFAULT 'Disponible' COMMENT "Estado de disponibilidad del técnico: 'Disponible' (en horario laboral, fuera de almuerzo, sin tickets), 'Ocupado' (con tickets o en almuerzo), 'Inactivo' (fuera de horario laboral), 'Fuera de Servicio' (ya no presta servicio en la oficina)",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Users) REFERENCES Users(ID_Users),
    FOREIGN KEY (Fk_Lunch_Block) REFERENCES Lunch_Blocks(ID_Lunch_Block)
);

CREATE TABLE TI_Service (
    ID_TI_Service INT AUTO_INCREMENT PRIMARY KEY,
    Type_Service VARCHAR(50) NOT NULL COMMENT "'Redes', 'Soporte', 'Programación'",
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
    Problem_Name VARCHAR(200) NOT NULL,
    Typical_Description TEXT,
    Estimated_Severity VARCHAR(50),
    FOREIGN KEY (Fk_TI_Service) REFERENCES TI_Service(ID_TI_Service)
);

CREATE TABLE Technician_Schedules (
    ID_Schedule INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Technician INT,
    Day_Of_Week VARCHAR(20) NOT NULL,
    Work_Start_Time TIME DEFAULT '08:00:00',
    Work_End_Time TIME NOT NULL,
    FOREIGN KEY (Fk_Technician) REFERENCES Technicians(ID_Technicians)
);

CREATE TABLE Lunch_Blocks (
    ID_Lunch_Block INT AUTO_INCREMENT PRIMARY KEY,
    Block_Name VARCHAR(50) NOT NULL,
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
    System_Name VARCHAR(200) NOT NULL,
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
    Ticket_Code VARCHAR(50) UNIQUE,
    Fk_Office INT COMMENT 'Oficina de origen (Maestra)',
    Fk_User_Requester INT COMMENT 'ID del Jefe que solicita',
    Fk_TI_Service INT,
    Fk_Problem_Catalog INT,
    Fk_Boss_Requester INT COMMENT 'El jefe específico que hizo la solicitud',
    Fk_Software_System INT NULL COMMENT 'Obligatorio si es Programación',
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

CREATE TABLE Ticket_Technicians (
    ID_Ticket_Technician INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_Technician INT,
    Is_Lead BOOLEAN DEFAULT FALSE COMMENT 'Técnico responsable principal',
    Assignment_Role VARCHAR(100) COMMENT "'Apoyo', 'Especialista', 'Supervisor'",
    Assigned_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fk_Assigned_By INT COMMENT 'ID del Admin que realizó la asignación',
    Status VARCHAR(50) DEFAULT 'Activo' COMMENT "'Activo', 'Finalizado'" ,-- En proceso, Cerrado
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

CREATE TABLE Ticket_Timeline (
    ID_Timeline INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT,
    Fk_User_Actor INT COMMENT 'Quién hizo el cambio',
    Action_Description TEXT COMMENT "'Admin agregó al técnico Carlos como apoyo'",
    Old_Status VARCHAR(50),
    New_Status VARCHAR(50),
    Event_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request),
    FOREIGN KEY (Fk_User_Actor) REFERENCES Users(ID_Users)
);

-- ==========================================
-- 6. MÓDULO DE AUDITORÍA
-- ==========================================

CREATE TABLE audit_logs (
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

-- ==========================================
-- 7. MÓDULO DE NOTIFICACIONES
-- ==========================================

CREATE TABLE IF NOT EXISTS Notifications (
    ID_Notification INT AUTO_INCREMENT PRIMARY KEY,
    Fk_User INT NOT NULL,
    Type VARCHAR(100) NOT NULL COMMENT 'Type of notification: ticket_assignment, ticket_created, etc.',
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    Fk_Service_Request INT NULL COMMENT 'Associated ticket ID if applicable',
    Is_Read TINYINT(1) DEFAULT 0 NOT NULL,
    Metadata JSON NULL COMMENT 'Additional notification data in JSON format',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE SET NULL,
    INDEX idx_user_notifications (Fk_User, Is_Read),
    INDEX idx_ticket_notifications (Fk_Service_Request),
    INDEX idx_type (Type),
    INDEX idx_created_at (Created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notifications table';

-- ==========================================
-- INSERT DATA DE PRUEBA
-- ==========================================

-- Roles
INSERT INTO Role (Role, Description) VALUES
('Admin', 'Administrador del sistema con acceso total'),
('Tecnico', 'Técnico de TI encargado de resolver tickets'),
('Jefe', 'Jefe de oficina que puede solicitar tickets'),
('Auditor', 'Auditor del sistema con permisos de solo lectura');

-- Usuarios
-- ⚠️ Password debe ser un hash bcrypt. Generar con PHP: password_hash('password123', PASSWORD_DEFAULT)
--    O ejecutar: php -r "echo password_hash('password123', PASSWORD_DEFAULT);"
-- ⚠️ Reemplazar 'password_hash_here' con el hash generado por:
--    php -r "echo password_hash('password123', PASSWORD_DEFAULT);"
INSERT INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user) VALUES
(1, 'admin@alcaldia.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'admin', 'Administrador del Sistema', TRUE),
(2, 'tech1@alcaldia.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'carlos_diaz', 'Carlos Diaz', TRUE),
(2, 'tech2@alcaldia.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'amna_verez', 'Amna Verez', TRUE),
(3, 'jefe1@alcaldia.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'juan_perez', 'Juan Pérez', TRUE),
(3, 'jefe2@alcaldia.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'maria_gonzalez', 'María González', TRUE),
(4, 'auditor@alcaldia.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'auditor1', 'Auditor del Sistema', TRUE);

-- Jefes
INSERT INTO Boss (Name_Boss, Pronoun, Fk_User) VALUES
('Juan Pérez', 'Sr.', 4),
('María González', 'Sra.', 5);

-- Oficinas (datos legacy, seran reemplazadas por sync con API de bienes)
INSERT INTO Office (ID_Office, Name_Office) VALUES
(1, 'DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA'),
(2, 'DIVISIÓN DE CATASTRO'),
(5, 'ÁREA LEGAL DE CATASTRO'),
(6, 'DIRECCIÓN DE TALENTO HUMANO'),
(7, 'DIVISIÓN DE ÁREA LEGAL Y ARCHIVO'),
(8, 'DIVISIÓN DE PRESTACIONES Y NÓMINA'),
(10, 'SOLVENCIAS'),
(11, 'OFICINA DE LICORES Y ESPECTACULOS'),
(12, 'DIRECCIÓN DE EDUCACIÓN'),
(13, 'DIVISIÓN DE RENTAS'),
(14, 'ÁREA DE FISCALES DE RENTAS'),
(15, 'DIVISIÓN DE JUSTICIA MUNICIPAL'),
(16, 'DIVISIÓN DE DESARROLLO COMUNITARIO'),
(17, 'TESORERÍA'),
(19, 'ARCHIVO'),
(20, 'SINDICATURA MUNICIPAL'),
(21, 'OFICINA DE PUBLICIDAD Y PROPAGANDA'),
(22, 'DIRECCIÓN DE ADMINISTRACIÓN'),
(23, 'DIVISIÓN DE CONTABILIDAD'),
(24, 'DIVISIÓN DE BIENES'),
(25, 'DIVISIÓN DE COMPRAS'),
(26, 'DIVISIÓN DE SERVICIOS GENERALES'),
(27, 'ÁREA TÉCNICA DE CATASTRO'),
(28, 'COORDINACIÓN DE TIERRAS'),
(29, 'AUDITORÍA INTERNA'),
(30, 'DIRECCIÓN DE DESARROLLO URBANO LOCAL'),
(31, 'DIVISIÓN DE PROTECCIÓN AMBIENTAL'),
(32, 'DIVISIÓN DE INGENIERÍA'),
(33, 'DIVISIÓN DE PLANIFICACIÓN URBANA'),
(34, 'CONSEJO LOCAL DE PLANIFICACIÓN PÚBLICA'),
(35, 'DIRECCIÓN DE SANEAMIENTO AMBIENTAL Y SERVICIOS MUNICIPALES'),
(36, 'DIRECCIÓN DE ATENCIÓN AL CIUDADANO'),
(37, 'DIVISIÓN DE PROYECTOS'),
(38, 'DIRECCIÓN DE PLANIFICACIÓN Y PRESUPUESTO'),
(39, 'COORDINACIÓN DE SEGURIDAD LABORAL'),
(40, 'IAMDESIN'),
(41, 'PROTECCIÓN CIVIL'),
(42, 'DIRECCIÓN DE VIALIDAD, TRÁNSITO, TRANSPORTE E INFRAESTRUCTURA'),
(43, 'DIVISIÓN DE MANTENIMIENTO VIAL E INFRAESTRUCTURA'),
(44, 'DIVISIÓN DE TRÁNSITO Y TRANSPORTE'),
(45, 'CONSULTORÍA JURÍDICA'),
(46, 'DIRECCIÓN EJECUTIVA'),
(47, 'DIRECCIÓN GENERAL'),
(48, 'DESPACHO DEL ALCALDE'),
(49, 'DIRECCIÓN DE COMUNICACIONES'),
(50, 'DIRECCIÓN DE HACIENDA'),
(51, 'ÁREA LEGAL DE RENTAS'),
(52, 'SOPORTE TÉCNICO SUMAT'),
(53, 'CAJA DE AHORROS EMPLEADOS'),
(54, 'CAJA DE AHORRO OBREROS'),
(55, 'SINDICATO EMPLEADOS'),
(56, 'SINDICATO OBREROS'),
(57, 'COORDINACIÓN DE DEPÓSITO'),
(58, 'DIVISIÓN DE MANTENIMIENTO VEHICULAR'),
(59, 'VIVERO MUNICIPAL'),
(60, 'DIRECCIÓN DE CONSTRUCCIÓN DE OBRAS MUNICIPALES'),
(61, 'DIVISIÓN DE CONSTRUCCIÓN Y MANTENIMIENTO'),
(62, 'DIRECCIÓN DE DEPORTE Y RECREACIÓN'),
(63, 'DIVISIÓN DE VIALIDAD'),
(64, 'COORDINACIÓN DE FISCALES AMBIENTALES'),
(65, 'DIVISIÓN DE SANEAMIENTO AMBIENTAL'),
(66, 'DIVISIÓN DE SERVICIOS MUNICIPALES'),
(67, 'DIRECCIÓN DE SALUD MUNICIPAL'),
(68, 'SPINNA'),
(69, 'POLICIA MUNICIPAL'),
(70, 'CUERPO DE BOMBEROS'),
(71, 'CONCEJO MUNICIPAL'),
(72, 'CONTRALORIA MUNICIPAL'),
(73, 'REGISTRO CIVIL'),
(74, 'COORDINACIÓN DEL MERCADO MUNICIPAL LA GUAYANA'),
(75, 'COORDINACIÓN DEL MERCADO MUNICIPAL LA VILLA'),
(76, 'COORDINACIÓN DEL MERCADO MUNICIPAL LA ERMITA'),
(77, 'COORDINACIÓN DEL CEMENTERIO MUNICIPAL'),
(78, 'DIRECCIÓN DE COOPERACIÓN PROTOCOLARES Y RELACIONES INTERINSTITUCIONALES'),
(79, 'VIVIENDA MUNICIPAL'),
(80, 'ACTIVIDADES ECONÓMICAS'),
(81, 'CULTURA MUNICIPAL'),
(82, 'COORDINACIÓN DE ALUMBRADO PÚBLICO'),
(83, 'COORDINACIÓN DE REDES HIDRÁULICAS, REJILLAS Y ALCANTARILLADO'),
(84, 'TERMINAL DE PASAJEROS'),
(85, 'EXTERNO'),
(86, 'TAQUILLA ÚNICA'),
(87, 'SECRETARIA DE SEGURIDAD CIUDADANA'),
(88, 'DIVISION DE ATENCIÓN AL CONTRIBUYENTE'),
(89, 'COORDINACION DE ASUNTOS LEGALES DEL SUMAT'),
(90, 'COORDINACION DE FISCALIZACION'),
(91, 'ESCUELA MUNICIPAL LUISA CACERES DE ARISMENDI'),
(92, 'SUPERINTENDENCIA MUNICIPAL DE ADMINISTRACIÓN TRIBUTARIA'),
(93, 'COORDINACIÓN DE ASEO URBANO DOMICILIARIO Y COMERCIAL'),
(94, 'DIRECCIÓN DE SERVICIOS PÚBLICOS'),
(95, 'DIVISION DE CONTRATACIONES'),
(96, 'DIVISIÓN DE COBRANZA'),
(97, 'DIRECCION DE MEDIOS Y COMUNICACIONES Y MARKETING DIGITAL'),
(98, 'SALA TECNICA DEL CONSEJO LOCAL DE PLANIFICACION PUBLICA');
 
-- Servicios TI
INSERT INTO TI_Service (Type_Service, Details) VALUES
('Redes', 'Configuración y mantenimiento de redes de computadoras'),
('Soporte', 'Soporte técnico general de hardware y software'),
('Programación', 'Desarrollo y mantenimiento de sistemas de software');

-- Técnicos
INSERT INTO Technicians (Fk_Users, First_Name, Last_Name, Status) VALUES
(2, 'Carlos', 'Diaz', 'Disponible'),
(3, 'Amna', 'Verez', 'Disponible');

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

-- Asignación de técnicos a tickets (para que técnicos vean tickets asignados)
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Assignment_Role, Status) VALUES
(1, 1, TRUE, 'Principal', 'Activo'),
(1, 2, FALSE, 'Apoyo', 'Activo'),
(2, 1, TRUE, 'Principal', 'Activo'),
(3, 2, TRUE, 'Principal', 'Activo');

-- Timeline de prueba
INSERT INTO Ticket_Timeline (Fk_Service_Request, Fk_User_Actor, Action_Description, Old_Status, New_Status, Event_Date) VALUES
(1, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW()),
(2, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW()),
(2, 1, 'Estado cambiado a En Proceso', 'Pendiente', 'En Proceso', NOW() + INTERVAL 1 HOUR),
(3, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW());

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

-- ==========================================
-- 8. MÓDULO DE ESCALACIÓN
-- ==========================================

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

INSERT INTO Lunch_Blocks (Block_Name, Start_Time, End_Time) VALUES
('Primer turno', '11:30:00', '12:10:00'),
('Segundo turno', '12:10:00', '12:50:00'),
('Tercer Turno', '12:50:00', '13:30:00'),
('Cuarto Turno', '13:30:00', '14:00:00');

-- Horarios de técnicos (Lunes a Viernes, 8am-5pm)
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(1, 'Lunes', '08:00:00', '17:00:00'),
(1, 'Martes', '08:00:00', '17:00:00'),
(1, 'Miercoles', '08:00:00', '17:00:00'),
(1, 'Jueves', '08:00:00', '17:00:00'),
(1, 'Viernes', '08:00:00', '17:00:00'),
(2, 'Lunes', '08:00:00', '17:00:00'),
(2, 'Martes', '08:00:00', '17:00:00'),
(2, 'Miercoles', '08:00:00', '17:00:00'),
(2, 'Jueves', '08:00:00', '17:00:00'),
(2, 'Viernes', '08:00:00', '17:00:00');

-- Caché de bienes (SIFA) para acelerar consultas repetidas
CREATE TABLE IF NOT EXISTS bienes_cache (
    query_key VARCHAR(64) PRIMARY KEY,
    response MEDIUMTEXT NOT NULL,
    is_lookup TINYINT(1) NOT NULL DEFAULT 0,
    cached_at INT UNSIGNED NOT NULL,
    INDEX idx_cached (cached_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
