-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS
-- Alcaldía de San Cristóbal
-- Script de Inserción de Datos Iniciales
-- Base de datos: tickets_system
-- Contraseña por defecto: password123
-- Hash bcrypt generado con PHP
-- ==========================================

USE tickets_system;

-- ==========================================
-- 1. ROLES
-- ==========================================
INSERT INTO Role (Role, Description) VALUES
('Admin', 'Administrador del sistema con acceso total'),
('Tecnico', 'Técnico de TI encargado de resolver tickets'),
('Jefe', 'Jefe de oficina que puede solicitar tickets'),
('Auditor', 'Auditor del sistema con permisos de solo lectura');

-- ==========================================
-- 2. USUARIOS
-- ==========================================
INSERT INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user) VALUES
(1, 'admin@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'admin', 'Administrador del Sistema', TRUE),
(2, 'tech1@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'carlos_diaz', 'Carlos Diaz', TRUE),
(2, 'tech2@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'amna_verez', 'Amna Verez', TRUE),
(3, 'jefe1@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'juan_perez', 'Juan Pérez', TRUE),
(3, 'jefe2@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'maria_gonzalez', 'María González', TRUE),
(4, 'auditor@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'auditor1', 'Auditor del Sistema', TRUE);

-- ==========================================
-- 3. JEFES
-- ==========================================
INSERT INTO Boss (Name_Boss, Pronoun, Fk_User) VALUES
('Juan Pérez', 'Sr.', 4),
('María González', 'Sra.', 5);

-- ==========================================
-- 4. OFICINAS
-- ==========================================
INSERT INTO Office (ID_Office, Name_Office, Office_Type) VALUES
(1, 'DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA', 'Direction'),
(2, 'DIVISIÓN DE CATASTRO', 'Division'),
(5, 'ÁREA LEGAL DE CATASTRO', 'Division'),
(6, 'DIRECCIÓN DE TALENTO HUMANO', 'Direction'),
(7, 'DIVISIÓN DE ÁREA LEGAL Y ARCHIVO', 'Division'),
(8, 'DIVISIÓN DE PRESTACIONES Y NÓMINA', 'Division'),
(10, 'SOLVENCIAS', 'Division'),
(11, 'OFICINA DE LICORES Y ESPECTACULOS', 'Division'),
(12, 'DIRECCIÓN DE EDUCACIÓN', 'Direction'),
(13, 'DIVISIÓN DE RENTAS', 'Division'),
(14, 'ÁREA DE FISCALES DE RENTAS', 'Division'),
(15, 'DIVISIÓN DE JUSTICIA MUNICIPAL', 'Division'),
(16, 'DIVISIÓN DE DESARROLLO COMUNITARIO', 'Division'),
(17, 'TESORERÍA', 'Division'),
(19, 'ARCHIVO', 'Division'),
(20, 'SINDICATURA MUNICIPAL', 'Division'),
(21, 'OFICINA DE PUBLICIDAD Y PROPAGANDA', 'Division'),
(22, 'DIRECCIÓN DE ADMINISTRACIÓN', 'Direction'),
(23, 'DIVISIÓN DE CONTABILIDAD', 'Division'),
(24, 'DIVISIÓN DE BIENES', 'Division'),
(25, 'DIVISIÓN DE COMPRAS', 'Division'),
(26, 'DIVISIÓN DE SERVICIOS GENERALES', 'Division'),
(27, 'ÁREA TÉCNICA DE CATASTRO', 'Division'),
(28, 'COORDINACIÓN DE TIERRAS', 'Coordination'),
(29, 'AUDITORÍA INTERNA', 'Division'),
(30, 'DIRECCIÓN DE DESARROLLO URBANO LOCAL', 'Direction'),
(31, 'DIVISIÓN DE PROTECCIÓN AMBIENTAL', 'Division'),
(32, 'DIVISIÓN DE INGENIERÍA', 'Division'),
(33, 'DIVISIÓN DE PLANIFICACIÓN URBANA', 'Division'),
(34, 'CONSEJO LOCAL DE PLANIFICACIÓN PÚBLICA', 'Division'),
(35, 'DIRECCIÓN DE SANEAMIENTO AMBIENTAL Y SERVICIOS MUNICIPALES', 'Direction'),
(36, 'DIRECCIÓN DE ATENCIÓN AL CIUDADANO', 'Direction'),
(37, 'DIVISIÓN DE PROYECTOS', 'Division'),
(38, 'DIRECCIÓN DE PLANIFICACIÓN Y PRESUPUESTO', 'Direction'),
(39, 'COORDINACIÓN DE SEGURIDAD LABORAL', 'Coordination'),
(40, 'IAMDESIN', 'Division'),
(41, 'PROTECCIÓN CIVIL', 'Division'),
(42, 'DIRECCIÓN DE VIALIDAD, TRÁNSITO, TRANSPORTE E INFRAESTRUCTURA', 'Direction'),
(43, 'DIVISIÓN DE MANTENIMIENTO VIAL E INFRAESTRUCTURA', 'Division'),
(44, 'DIVISIÓN DE TRÁNSITO Y TRANSPORTE', 'Division'),
(45, 'CONSULTORÍA JURÍDICA', 'Division'),
(46, 'DIRECCIÓN EJECUTIVA', 'Direction'),
(47, 'DIRECCIÓN GENERAL', 'Direction'),
(48, 'DESPACHO DEL ALCALDE', 'Division'),
(49, 'DIRECCIÓN DE COMUNICACIONES', 'Direction'),
(50, 'DIRECCIÓN DE HACIENDA', 'Direction'),
(51, 'ÁREA LEGAL DE RENTAS', 'Division'),
(52, 'SOPORTE TÉCNICO SUMAT', 'Division'),
(53, 'CAJA DE AHORROS EMPLEADOS', 'Division'),
(54, 'CAJA DE AHORRO OBREROS', 'Division'),
(55, 'SINDICATO EMPLEADOS', 'Division'),
(56, 'SINDICATO OBREROS', 'Division'),
(57, 'COORDINACIÓN DE DEPÓSITO', 'Coordination'),
(58, 'DIVISIÓN DE MANTENIMIENTO VEHICULAR', 'Division'),
(59, 'VIVERO MUNICIPAL', 'Division'),
(60, 'DIRECCIÓN DE CONSTRUCCIÓN DE OBRAS MUNICIPALES', 'Direction'),
(61, 'DIVISIÓN DE CONSTRUCCIÓN Y MANTENIMIENTO', 'Division'),
(62, 'DIRECCIÓN DE DEPORTE Y RECREACIÓN', 'Direction'),
(63, 'DIVISIÓN DE VIALIDAD', 'Division'),
(64, 'COORDINACIÓN DE FISCALES AMBIENTALES', 'Coordination'),
(65, 'DIVISIÓN DE SANEAMIENTO AMBIENTAL', 'Division'),
(66, 'DIVISIÓN DE SERVICIOS MUNICIPALES', 'Division'),
(67, 'DIRECCIÓN DE SALUD MUNICIPAL', 'Direction'),
(68, 'SPINNA', 'Division'),
(69, 'POLICIA MUNICIPAL', 'Division'),
(70, 'CUERPO DE BOMBEROS', 'Division'),
(71, 'CONCEJO MUNICIPAL', 'Division'),
(72, 'CONTRALORIA MUNICIPAL', 'Division'),
(73, 'REGISTRO CIVIL', 'Division'),
(74, 'COORDINACIÓN DEL MERCADO MUNICIPAL LA GUAYANA', 'Coordination'),
(75, 'COORDINACIÓN DEL MERCADO MUNICIPAL LA VILLA', 'Coordination'),
(76, 'COORDINACIÓN DEL MERCADO MUNICIPAL LA ERMITA', 'Coordination'),
(77, 'COORDINACIÓN DEL CEMENTERIO MUNICIPAL', 'Coordination'),
(78, 'DIRECCIÓN DE COOPERACIÓN PROTOCOLARES Y RELACIONES INTERINSTITUCIONALES', 'Direction'),
(79, 'VIVIENDA MUNICIPAL', 'Division'),
(80, 'ACTIVIDADES ECONÓMICAS', 'Division'),
(81, 'CULTURA MUNICIPAL', 'Division'),
(82, 'COORDINACIÓN DE ALUMBRADO PÚBLICO', 'Coordination'),
(83, 'COORDINACIÓN DE REDES HIDRÁULICAS, REJILLAS Y ALCANTARILLADO', 'Coordination'),
(84, 'TERMINAL DE PASAJEROS', 'Division'),
(85, 'EXTERNO', 'Division'),
(86, 'TAQUILLA ÚNICA', 'Division'),
(87, 'SECRETARIA DE SEGURIDAD CIUDADANA', 'Division'),
(88, 'DIVISION DE ATENCIÓN AL CONTRIBUYENTE', 'Division'),
(89, 'COORDINACION DE ASUNTOS LEGALES DEL SUMAT', 'Coordination'),
(90, 'COORDINACION DE FISCALIZACION', 'Coordination'),
(91, 'ESCUELA MUNICIPAL LUISA CACERES DE ARISMENDI', 'Division'),
(92, 'SUPERINTENDENCIA MUNICIPAL DE ADMINISTRACIÓN TRIBUTARIA', 'Division'),
(93, 'COORDINACIÓN DE ASEO URBANO DOMICILIARIO Y COMERCIAL', 'Coordination'),
(94, 'DIRECCIÓN DE SERVICIOS PÚBLICOS', 'Direction'),
(95, 'DIVISION DE CONTRATACIONES', 'Division'),
(96, 'DIVISIÓN DE COBRANZA', 'Division'),
(97, 'DIRECCION DE MEDIOS Y COMUNICACIONES Y MARKETING DIGITAL', 'Direction'),
(98, 'SALA TECNICA DEL CONSEJO LOCAL DE PLANIFICACION PUBLICA', 'Division');

-- ==========================================
-- 5. SERVICIOS TI
-- ==========================================
INSERT INTO TI_Service (Type_Service, Details) VALUES
('Redes', 'Configuración y mantenimiento de redes de computadoras'),
('Soporte', 'Soporte técnico general de hardware y software'),
('Programación', 'Desarrollo y mantenimiento de sistemas de software');

-- ==========================================
-- 6. TÉCNICOS
-- ==========================================
INSERT INTO Technicians (Fk_Users, First_Name, Last_Name, Status) VALUES
(2, 'Carlos', 'Diaz', 'Disponible'),
(3, 'Amna', 'Verez', 'Disponible');

-- ==========================================
-- 7. RELACIÓN TÉCNICOS-SERVICIOS
-- ==========================================
INSERT INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status) VALUES
(1, 1, 'Activo'),
(2, 1, 'Activo'),
(1, 2, 'Activo'),
(3, 2, 'Activo');

-- ==========================================
-- 8. CATÁLOGO DE PROBLEMAS
-- ==========================================
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(1, 'Sin conexión a internet', 'No se puede acceder a la red o internet', 'Alta'),
(2, 'Computadora no enciende', 'El equipo no responde al presionar el botón de encendido', 'Alta'),
(2, 'Error en sistema', 'El sistema muestra mensajes de error', 'Media'),
(3, 'Error en base de datos', 'Problemas con la conexión o consultas SQL', 'Alta');

-- ==========================================
-- 9. SISTEMAS DE SOFTWARE
-- ==========================================
INSERT INTO Software_Systems (System_Name, Description, Status) VALUES
('Sistema de Facturación', 'Sistema para gestión de facturas y pagos', 'Activo'),
('Sistema de Catastro', 'Sistema para gestión de catastro inmobiliario', 'Activo'),
('Sistema de RRHH', 'Sistema de recursos humanos', 'Activo');

-- ==========================================
-- 10. BLOQUES DE ALMUERZO
-- ==========================================
INSERT INTO Lunch_Blocks (Block_Name, Start_Time, End_Time) VALUES
('Primer turno', '11:30:00', '12:10:00'),
('Segundo turno', '12:10:00', '12:50:00'),
('Tercer Turno', '12:50:00', '13:30:00'),
('Cuarto Turno', '13:30:00', '14:00:00');

-- ==========================================
-- 11. HORARIOS DE TÉCNICOS
-- ==========================================
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

-- ==========================================
-- 12. TICKETS DE PRUEBA
-- ==========================================
INSERT INTO Service_Request (Fk_Office, Fk_User_Requester, Fk_TI_Service, Fk_Boss_Requester, Subject, Description, System_Priority, Status) VALUES
(6, 4, 1, 1, 'Sin conexión a internet', 'No puedo acceder a internet desde mi computadora', 'Alta', 'Pendiente'),
(7, 5, 2, 2, 'Computadora no enciende', 'La computadora no responde al encender', 'Alta', 'En Proceso'),
(5, 4, 3, 1, 'Error en sistema de facturación', 'El sistema muestra error al generar reportes', 'Media', 'Pendiente');

-- ==========================================
-- 13. ASIGNACIÓN DE TÉCNICOS A TICKETS
-- ==========================================
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Assignment_Role, Status) VALUES
(1, 1, TRUE, 'Principal', 'Activo'),
(1, 2, FALSE, 'Apoyo', 'Activo'),
(2, 1, TRUE, 'Principal', 'Activo'),
(3, 2, TRUE, 'Principal', 'Activo');

-- ==========================================
-- 14. TIMELINE DE TICKETS
-- ==========================================
INSERT INTO Ticket_Timeline (Fk_Service_Request, Fk_User_Actor, Action_Description, Old_Status, New_Status, Event_Date) VALUES
(1, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW()),
(2, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW()),
(2, 1, 'Estado cambiado a En Proceso', 'Pendiente', 'En Proceso', NOW() + INTERVAL 1 HOUR),
(3, 1, 'Ticket creado por el usuario', NULL, 'Pendiente', NOW());
