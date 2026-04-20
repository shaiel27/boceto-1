-- ==========================================
-- PROYECTO: SISTEMA DE GESTIÓN DE TICKETS
-- Script de Inserción de Datos de Ejemplo
-- Motor: MySQL
-- ==========================================

USE tickets_municipal;

-- ==========================================
-- 1. MÓDULO DE USUARIOS Y ACCESO (LOGIN)
-- ==========================================

-- Insertar Roles
INSERT INTO Role (Role, Description) VALUES
('Admin', 'Administrador del sistema con acceso total'),
('Tecnico', 'Técnico de TI encargado de resolver tickets'),
('Jefe', 'Jefe de oficina que puede solicitar tickets');

-- Insertar Usuarios (contraseña: 'password123' en hash real)
INSERT INTO Users (Fk_Role, Email, Password) VALUES
(1, 'admin@alcaldia.gob', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- Admin
(2, 'juan.perez@alcaldia.gob', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- Técnico 1
(2, 'maria.gonzalez@alcaldia.gob', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- Técnico 2
(2, 'carlos.rodriguez@alcaldia.gob', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- Técnico 3
(3, 'pedro.martinez@alcaldia.gob', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- Jefe 1
(3, 'ana.lopez@alcaldia.gob', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- Jefe 2
(3, 'luis.sanchez@alcaldia.gob', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- Jefe 3

-- Insertar Jefes (Boss)
INSERT INTO Boss (Name_Boss, pronoun, Fk_User) VALUES
('Ing. Pedro Martínez', 'Sr.', 5),
('Lic. Ana López', 'Sra.', 6),
('Arq. Luis Sánchez', 'Sr.', 7);

-- ==========================================
-- 2. INFRAESTRUCTURA INSTITUCIONAL (UNIFICADA)
-- ==========================================

-- Insertar Direcciones (nivel superior)
INSERT INTO Office (Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID) VALUES
('Dirección de Vialidad', 'Direction', NULL, 1),
('Dirección de Salud', 'Direction', NULL, 2),
('Dirección de Educación', 'Direction', NULL, 3);

-- Insertar Divisiones (nivel medio)
INSERT INTO Office (Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID) VALUES
('División de Mantenimiento', 'Division', 1, NULL),
('División de Infraestructura', 'Division', 1, NULL),
('División de Atención Primaria', 'Division', 2, NULL),
('División de Hospitales', 'Division', 2, NULL),
('División de Escuelas', 'Division', 3, NULL),
('División de Programas Educativos', 'Division', 3, NULL);

-- Insertar Coordinaciones (nivel inferior)
INSERT INTO Office (Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID) VALUES
('Coordinación de Equipos', 'Coordination', 4, NULL),
('Coordinación de Vehículos', 'Coordination', 4, NULL),
('Coordinación de Clínicas Rurales', 'Coordination', 7, NULL),
('Coordinación de Centros de Salud', 'Coordination', 7, NULL),
('Coordinación de Educación Básica', 'Coordination', 9, NULL),
('Coordinación de Educación Media', 'Coordination', 9, NULL);

-- ==========================================
-- 3. TÉCNICOS Y SERVICIOS TI
-- ==========================================

-- Insertar Servicios TI
INSERT INTO TI_Service (Type_Service, Details) VALUES
('Redes', 'Configuración y mantenimiento de redes, conectividad, WiFi'),
('Soporte', 'Soporte técnico general, hardware, software básico'),
('Programación', 'Desarrollo de software, sistemas a medida, integraciones');

-- Insertar Catálogo de Problemas por Servicio
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
-- Problemas de Redes
(1, 'Sin conexión a internet', 'Los usuarios no tienen acceso a internet', 'Alta'),
(1, 'WiFi lento', 'La conexión WiFi es muy lenta o intermitente', 'Media'),
(1, 'Problema con VPN', 'No se puede conectar a la VPN corporativa', 'Alta'),
(1, 'Falla en servidor de archivos', 'El servidor de archivos no responde', 'Alta'),
-- Problemas de Soporte
(2, 'Computadora no enciende', 'El equipo no se enciende', 'Media'),
(2, 'Impresora no funciona', 'La impresora no imprime o da errores', 'Media'),
(2, 'Pantalla dañada', 'La pantalla tiene líneas o no muestra imagen', 'Media'),
(2, 'Teclado/Mouse defectuoso', 'El teclado o mouse no funcionan correctamente', 'Baja'),
-- Problemas de Programación
(3, 'Error en sistema contable', 'El sistema contable muestra errores', 'Alta'),
(3, 'Necesito nuevo módulo', 'Se requiere un nuevo módulo de funcionalidad', 'Media'),
(3, 'Integración con sistema externo', 'Se necesita integrar con otro sistema', 'Alta'),
(3, 'Reporte no genera correctamente', 'Los reportes no se generan como esperado', 'Media');

-- Insertar Bloques de Almuerzo
INSERT INTO Lunch_Blocks (Block_Name, Start_Time, End_Time) VALUES
('Mañana', '11:00:00', '11:30:00'),
('Mediodía', '12:00:00', '12:30:00'),
('Tarde', '13:00:00', '13:30:00'),
('Tardío', '14:00:00', '14:30:00');

-- Insertar Técnicos
INSERT INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status) VALUES
(2, 'Juan', 'Pérez', 1, 'Activo'),
(3, 'María', 'González', 2, 'Activo'),
(4, 'Carlos', 'Rodríguez', 3, 'Activo');

-- Insertar Servicios asignados a Técnicos
INSERT INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, status) VALUES
-- Juan Pérez (especializado en Redes y Soporte)
(1, 1, 'Activo'),
(2, 1, 'Activo'),
-- María González (especializada en Soporte y Programación)
(2, 2, 'Activo'),
(3, 2, 'Activo'),
-- Carlos Rodríguez (especializado en Programación y Redes)
(1, 3, 'Activo'),
(3, 3, 'Activo');

-- Insertar Horarios de Técnicos
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
-- Juan Pérez (Lunes a Viernes, 8:00 - 17:00)
(1, 'Lunes', '08:00:00', '17:00:00'),
(1, 'Martes', '08:00:00', '17:00:00'),
(1, 'Miércoles', '08:00:00', '17:00:00'),
(1, 'Jueves', '08:00:00', '17:00:00'),
(1, 'Viernes', '08:00:00', '17:00:00'),
-- María González (Lunes a Viernes, 8:00 - 17:00)
(2, 'Lunes', '08:00:00', '17:00:00'),
(2, 'Martes', '08:00:00', '17:00:00'),
(2, 'Miércoles', '08:00:00', '17:00:00'),
(2, 'Jueves', '08:00:00', '17:00:00'),
(2, 'Viernes', '08:00:00', '17:00:00'),
-- Carlos Rodríguez (Lunes a Viernes, 8:00 - 17:00)
(3, 'Lunes', '08:00:00', '17:00:00'),
(3, 'Martes', '08:00:00', '17:00:00'),
(3, 'Miércoles', '08:00:00', '17:00:00'),
(3, 'Jueves', '08:00:00', '17:00:00'),
(3, 'Viernes', '08:00:00', '17:00:00');

-- ==========================================
-- 4. CONFIGURACIÓN DE PERMISOS Y SISTEMAS
-- ==========================================

-- Insertar Permisos de Servicio por Oficina
INSERT INTO Service_Permissions (Fk_TI_Service, Fk_Office, Is_Allowed) VALUES
-- Dirección de Vialidad puede solicitar todos los servicios
(1, 1, TRUE),
(2, 1, TRUE),
(3, 1, TRUE),
-- Dirección de Salud puede solicitar Soporte y Programación
(2, 2, TRUE),
(3, 2, TRUE),
-- Dirección de Educación puede solicitar todos los servicios
(1, 3, TRUE),
(2, 3, TRUE),
(3, 3, TRUE);

-- Insertar Configuración de Solicitudes por Oficina
INSERT INTO Request_Settings (Fk_Office_ID, Can_Request_Directly, Must_Be_Approved_By_Superior) VALUES
(1, TRUE, FALSE),
(2, TRUE, TRUE),
(3, TRUE, FALSE),
(4, TRUE, FALSE),
(5, TRUE, FALSE),
(6, TRUE, TRUE),
(7, TRUE, FALSE),
(8, TRUE, FALSE),
(9, TRUE, FALSE),
(10, TRUE, FALSE),
(11, TRUE, FALSE),
(12, TRUE, FALSE);

-- Insertar Sistemas de Software
INSERT INTO Software_Systems (System_Name, Description, Status) VALUES
('Sistema Contable', 'Sistema de contabilidad municipal', 'Activo'),
('Sistema RRHH', 'Sistema de recursos humanos', 'Activo'),
('Sistema de Inventario', 'Sistema de gestión de inventario', 'Activo'),
('Sistema de Citas', 'Sistema de agendamiento de citas médicas', 'Activo'),
('Portal Educativo', 'Portal de gestión educativa', 'Activo');

-- Insertar Sistemas por Oficina
INSERT INTO Office_Systems (Fk_Office_ID, Fk_System_ID) VALUES
-- Dirección de Vialidad
(1, 1),
(1, 3),
-- Dirección de Salud
(2, 1),
(2, 2),
(2, 4),
-- Dirección de Educación
(3, 1),
(3, 2),
(3, 5);

-- ==========================================
-- 5. MÓDULO DE GESTIÓN DE TICKETS
-- ==========================================

-- Insertar Tickets de Ejemplo
INSERT INTO Service_Request (
    Fk_Office, Fk_User_Requester, Fk_TI_Service, Fk_Problem_Catalog, 
    Fk_Boss_Requester, Fk_Software_System, Subject, Property_number, Description, 
    System_Priority, Status
) VALUES
-- Ticket 1: Problema de Redes - Alta prioridad (Pedro Martínez - Boss ID 1)
(11, 5, 1, 1, 1, NULL, 'Sin conexión a internet en Coordinación de Equipos', 'EQ-001', 
 'Desde esta mañana no tenemos acceso a internet en toda la coordinación', 'Alta', 'En Proceso'),
-- Ticket 2: Problema de Soporte - Media prioridad (Pedro Martínez - Boss ID 1)
(11, 5, 2, 6, 1, NULL, 'Impresora HP no funciona', 'EQ-002', 
 'La impresora principal no imprime y muestra error de papel atascado', 'Media', 'Pendiente'),
-- Ticket 3: Problema de Programación - Alta prioridad (Ana López - Boss ID 2)
(2, 6, 3, 10, 2, 1, 'Error en sistema contable', 'SA-001', 
 'El sistema contable muestra error al generar reportes mensuales', 'Alta', 'Pendiente'),
-- Ticket 4: Problema de Soporte - Baja prioridad (Pedro Martínez - Boss ID 1)
(12, 5, 2, 8, 1, NULL, 'Teclado dañado', 'EQ-003', 
 'El teclado del equipo de recepción tiene varias teclas que no funcionan', 'Baja', 'Resuelto'),
-- Ticket 5: Problema de Redes - Media prioridad (Luis Sánchez - Boss ID 3)
(13, 7, 1, 2, 3, NULL, 'WiFi lento en Clínicas Rurales', 'CR-001', 
 'La conexión WiFi es muy lenta en las clínicas rurales', 'Media', 'En Proceso'),
-- Ticket 6: Problema de Programación - Media prioridad (Luis Sánchez - Boss ID 3)
(9, 7, 3, 11, 3, 5, 'Necesito nuevo módulo en Portal Educativo', 'ED-001', 
 'Se requiere un módulo para gestión de calificaciones', 'Media', 'Pendiente');

-- Actualizar ticket resuelto con fecha de resolución
UPDATE Service_Request SET Resolved_at = NOW() - INTERVAL 2 DAY WHERE ID_Service_Request = 4;

-- Insertar Asignaciones de Técnicos a Tickets
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Assignment_Role, Fk_Assigned_By, Status) VALUES
-- Ticket 1: Juan Pérez (Lead) y María González
(1, 1, TRUE, 'Responsable Principal', 1, 'Activo'),
(1, 2, FALSE, 'Apoyo', 1, 'Activo'),
-- Ticket 3: María González (Lead) y Carlos Rodríguez
(3, 2, TRUE, 'Responsable Principal', 1, 'Activo'),
(3, 3, FALSE, 'Especialista', 1, 'Activo'),
-- Ticket 4: Juan Pérez (solo)
(4, 1, TRUE, 'Responsable Principal', 1, 'Finalizado'),
-- Ticket 5: Carlos Rodríguez (Lead) y Juan Pérez
(5, 3, TRUE, 'Responsable Principal', 1, 'Activo'),
(5, 1, FALSE, 'Apoyo', 1, 'Activo');

-- Insertar Comentarios en Tickets
INSERT INTO Ticket_Comments (Fk_Service_Request, Fk_User, Comment) VALUES
-- Comentarios en Ticket 1 (En Proceso)
(1, 5, 'Ya reinicié el router pero sigue sin funcionar'),
(1, 2, 'Voy a revisar la configuración del servidor'),
(1, 1, 'El problema está en el switch principal, lo estoy reemplazando'),
-- Comentarios en Ticket 4 (Resuelto)
(4, 5, 'El teclado necesita ser reemplazado'),
(4, 1, 'Ya instalé un teclado nuevo, el ticket está resuelto'),
-- Comentarios en Ticket 5 (En Proceso)
(5, 7, 'El problema afecta a 3 clínicas rurales diferentes'),
(5, 3, 'Estoy revisando la infraestructura de red de las clínicas');

-- Insertar Adjuntos en Tickets
INSERT INTO Ticket_Attachments (Fk_Service_Request, File_Name, File_Path) VALUES
(1, 'error_router.jpg', '/uploads/tickets/error_router.jpg'),
(3, 'screenshot_error.png', '/uploads/tickets/screenshot_error.png'),
(5, 'diagrama_red.pdf', '/uploads/tickets/diagrama_red.pdf');

-- Insertar Timeline de Tickets
INSERT INTO Ticket_Timeline (Fk_Service_Request, Fk_User_Actor, Action_Description, Old_Status, New_Status) VALUES
-- Ticket 1: Cambios de estado
(1, 5, 'Ticket creado por solicitante', NULL, 'Pendiente'),
(1, 1, 'Admin asignó a Juan Pérez como técnico principal', NULL, 'Pendiente'),
(1, 1, 'Admin asignó a María González como apoyo', NULL, 'Pendiente'),
(1, 1, 'Admin cambió estado a En Proceso', 'Pendiente', 'En Proceso'),
-- Ticket 3: Cambios de estado
(3, 6, 'Ticket creado por solicitante', NULL, 'Pendiente'),
(3, 1, 'Admin asignó a María González como técnico principal', NULL, 'Pendiente'),
(3, 1, 'Admin asignó a Carlos Rodríguez como especialista', NULL, 'Pendiente'),
-- Ticket 4: Cambios de estado
(4, 5, 'Ticket creado por solicitante', NULL, 'Pendiente'),
(4, 1, 'Admin asignó a Juan Pérez como técnico principal', NULL, 'Pendiente'),
(4, 1, 'Admin cambió estado a Resuelto', 'Pendiente', 'Resuelto'),
-- Ticket 5: Cambios de estado
(5, 7, 'Ticket creado por solicitante', NULL, 'Pendiente'),
(5, 1, 'Admin asignó a Carlos Rodríguez como técnico principal', NULL, 'Pendiente'),
(5, 1, 'Admin asignó a Juan Pérez como apoyo', NULL, 'Pendiente'),
(5, 1, 'Admin cambió estado a En Proceso', 'Pendiente', 'En Proceso');

-- ==========================================
-- VERIFICACIÓN DE DATOS
-- ==========================================

-- Verificar usuarios insertados
SELECT * FROM Users;

-- Verificar estructura de oficinas
SELECT * FROM v_estructura_oficinas;

-- Verificar técnicos con sus servicios
SELECT * FROM v_tecnicos_disponibilidad;

-- Verificar tickets completos
SELECT * FROM v_tickets_completos;

-- Verificar catálogo de problemas
SELECT * FROM v_catalogo_problemas;

-- ==========================================
-- FIN DEL SCRIPT DE INSERCIÓN
-- ==========================================
