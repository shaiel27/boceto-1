-- ==========================================
-- SISTEMA DE GESTIÓN DE TICKETS MUNICIPAL - VERSIÓN SIMPLE
-- ==========================================
-- Script de Datos Iniciales - Compatible con MySQL/MariaDB
-- ==========================================

USE alcaldia_tickets_db;

-- ==========================================
-- 1. DATOS BÁSICOS (SIN DEPENDENCIAS)
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

-- ==========================================
-- 2. USUARIOS (DEPENDE DE ROLE)
-- ==========================================

INSERT INTO Users (Fk_Role, First_Name, Last_Name, CI, Telephone_Number, Email, Password) VALUES
-- Administradores
(1, 'Carlos', 'Rodríguez', 'V-12345678', '0414-1234567', 'carlos.rodriguez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
(2, 1, 'María', 'González', 'V-87654321', '0414-7654321', 'maria.gonzalez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6'),
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

-- ==========================================
-- 3. ESTRUCTURA INSTITUCIONAL (DEPENDE DE USUARIOS)
-- ==========================================

-- Direcciones Municipales
INSERT INTO Directions (Name_Direction, Fk_Director) VALUES
('Dirección de Administración', 3),
('Dirección de Obras Públicas', 4),
('Dirección de Servicios Públicos', 5),
('Dirección de Educación', NULL),
('Dirección de Salud', NULL),
('Dirección de Catastro', NULL),
('Dirección de Urbanismo', NULL),
('Dirección de Finanzas', NULL);

-- Divisiones por Dirección
INSERT INTO Divisions (Fk_Direction, Name_Division, Fk_Division_Head) VALUES
-- Dirección de Administración
(1, 'División de Recursos Humanos', 6),
(1, 'División de Compras', NULL),
(1, 'División de Tesorería', NULL),
-- Dirección de Obras Públicas
(2, 'División de Ingeniería Municipal', 7),
(2, 'División de Mantenimiento Vial', NULL),
(2, 'División de Construcción', NULL),
-- Dirección de Servicios Públicos
(3, 'División de Aseo Urbano', NULL),
(3, 'División de Alcantarillado', NULL),
(3, 'División de Aguas Servidas', NULL),
-- Dirección de Educación
(4, 'División de Docencia', NULL),
(4, 'División de Infraestructura Educativa', NULL),
-- Dirección de Salud
(5, 'División de Atención Primaria', NULL),
(5, 'División de Salud Pública', NULL),
-- Dirección de Catastro
(6, 'División de Catastro Legal', NULL),
(6, 'División de Avalúos', NULL),
(6, 'División de Cartografía', NULL),
-- Dirección de Urbanismo
(7, 'División de Planificación', NULL),
(7, 'División de Control Urbano', NULL),
-- Dirección de Finanzas
(8, 'División de Contabilidad', NULL),
(8, 'División de Presupuesto', NULL);

-- Coordinaciones por División
INSERT INTO Coordinations (Fk_Division, Name_Coordination, Fk_Coordinator) VALUES
-- División de Recursos Humanos
(1, 'Coordinación de Nóminas', 8),
(1, 'Coordinación de Contratación', NULL),
(1, 'Coordinación de Capacitación', NULL),
-- División de Compras
(2, 'Coordinación de Adquisiciones', NULL),
(2, 'Coordinación de Almacén', NULL),
-- División de Tesorería
(3, 'Coordinación de Caja', NULL),
(3, 'Coordinación de Cuentas por Pagar', NULL),
-- División de Ingeniería Municipal
(4, 'Coordinación de Proyectos', 9),
(4, 'Coordinación de Estudios Técnicos', NULL),
-- División de Mantenimiento Vial
(5, 'Coordinación de Semáforos', NULL),
(5, 'Coordinación de Señalización', NULL),
-- División de Construcción
(6, 'Coordinación de Edificaciones', NULL),
(6, 'Coordinación de Infraestructura', NULL),
-- División de Aseo Urbano
(7, 'Coordinación de Recolección', NULL),
(7, 'Coordinación de Disposición Final', NULL),
-- División de Alcantarillado
(8, 'Coordinación de Mantenimiento de Redes', NULL),
(8, 'Coordinación de Nuevas Conexiones', NULL),
-- División de Aguas Servidas
(9, 'Coordinación de Tratamiento', NULL),
(9, 'Coordinación de Control de Calidad', NULL),
-- División de Docencia
(10, 'Coordinación de Escuelas Básicas', NULL),
(10, 'Coordinación de Liceos', NULL),
-- División de Infraestructura Educativa
(11, 'Coordinación de Mantenimiento Escolar', NULL),
(11, 'Coordinación de Construcción Escolar', NULL),
-- División de Atención Primaria
(12, 'Coordinación de Ambulatorios', NULL),
(12, 'Coordinación de Programas Preventivos', NULL),
-- División de Salud Pública
(13, 'Coordinación de Epidemiología', NULL),
(13, 'Coordinación de Vacunación', NULL),
-- División de Catastro Legal
(14, 'Coordinación de Registro Inmobiliario', NULL),
(14, 'Coordinación de Transferencias', NULL),
-- División de Avalúos
(15, 'Coordinación de Avalúos Urbanos', NULL),
(15, 'Coordinación de Avalúos Rurales', NULL),
-- División de Cartografía
(16, 'Coordinación de Mapas Digitales', NULL),
(16, 'Coordinación de Actualización Cartográfica', NULL),
-- División de Planificación
(17, 'Coordinación de Planes Urbanos', NULL),
(17, 'Coordinación de Zonificación', NULL),
-- División de Control Urbano
(18, 'Coordinación de Inspecciones', NULL),
(18, 'Coordinación de Permisos', NULL),
-- División de Contabilidad
(19, 'Coordinación de Cuentas Generales', NULL),
(19, 'Coordinación de Estados Financieros', NULL),
-- División de Presupuesto
(20, 'Coordinación de Elaboración Presupuestaria', NULL),
(20, 'Coordinación de Control Presupuestario', NULL);

-- ==========================================
-- 4. TÉCNICOS Y SUS SERVICIOS (DEPENDE DE USERS Y LUNCH_BLOCKS)
-- ==========================================

-- Técnicos
INSERT INTO Technicians (Fk_Users, Fk_Lunch_Block, Status) VALUES
(10, 1, 'Disponible'), -- Miguel Torres - Grupo 1
(11, 2, 'Disponible'), -- Laura Vargas - Grupo 2
(12, 3, 'Disponible'), -- Santiago Mendoza - Grupo 3
(13, 4, 'Vacaciones'); -- Patricia Rojas - Grupo 4

-- Servicios de Técnicos
INSERT INTO Technicians_Service (Fk_Technicians, Fk_TI_Service, status) VALUES
(1, 1, 'Activo'), -- Miguel Torres - Redes
(1, 2, 'Activo'), -- Miguel Torres - Soporte Técnico
(2, 2, 'Activo'), -- Laura Vargas - Soporte Técnico
(2, 5, 'Activo'), -- Laura Vargas - Seguridad
(3, 3, 'Activo'), -- Santiago Mendoza - Programación
(3, 4, 'Activo'), -- Santiago Mendoza - Base de Datos
(4, 1, 'Activo'), -- Patricia Rojas - Redes
(4, 6, 'Activo'); -- Patricia Rojas - Telecomunicaciones

-- Horarios de Técnicos
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
-- Miguel Torres (Lunes a Viernes 8am-5pm)
(1, 'Lunes', '08:00:00', '17:00:00'),
(1, 'Martes', '08:00:00', '17:00:00'),
(1, 'Miércoles', '08:00:00', '17:00:00'),
(1, 'Jueves', '08:00:00', '17:00:00'),
(1, 'Viernes', '08:00:00', '17:00:00'),
-- Laura Vargas (Lunes a Viernes 8am-5pm)
(2, 'Lunes', '08:00:00', '17:00:00'),
(2, 'Martes', '08:00:00', '17:00:00'),
(2, 'Miércoles', '08:00:00', '17:00:00'),
(2, 'Jueves', '08:00:00', '17:00:00'),
(2, 'Viernes', '08:00:00', '17:00:00'),
-- Santiago Mendoza (Lunes a Jueves 8am-5pm, Viernes 8am-2pm)
(3, 'Lunes', '08:00:00', '17:00:00'),
(3, 'Martes', '08:00:00', '17:00:00'),
(3, 'Miércoles', '08:00:00', '17:00:00'),
(3, 'Jueves', '08:00:00', '17:00:00'),
(3, 'Viernes', '08:00:00', '14:00:00'),
-- Patricia Rojas (Lunes a Viernes 8am-5pm)
(4, 'Lunes', '08:00:00', '17:00:00'),
(4, 'Martes', '08:00:00', '17:00:00'),
(4, 'Miércoles', '08:00:00', '17:00:00'),
(4, 'Jueves', '08:00:00', '17:00:00'),
(4, 'Viernes', '08:00:00', '17:00:00');

-- ==========================================
-- 5. TICKETS DE EJEMPLO (DEPENDE DE TODO LO ANTERIOR)
-- ==========================================

-- Tickets (con códigos manuales para evitar problemas con triggers)
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

-- ==========================================
-- 6. COMENTARIOS DE EJEMPLO
-- ==========================================

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
-- Este script inserta datos iniciales para:
-- - 7 roles del sistema
-- - 4 bloques de almuerzo
-- - 8 tipos de servicios TI
-- - 16 usuarios con diferentes roles
-- - 8 direcciones, 20 divisiones, 41 coordinaciones
-- - 4 técnicos con especializaciones y horarios
-- - 8 tickets de ejemplo para pruebas
-- - Comentarios para trazabilidad
--
-- Para ejecutar este script:
-- mysql -u root -p alcaldia_tickets_db < 02_initial_data_simple.sql
--
-- NOTA: Las contraseñas son ejemplos. En producción usar contraseñas seguras.
