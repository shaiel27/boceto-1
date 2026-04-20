-- ==========================================
-- PROYECTO: SISTEMA DE GESTIÓN DE TICKETS (VERSIÓN MUNICIPAL JERÁRQUICA)
-- Script de Inserción de Datos
-- Motor: MySQL
-- ==========================================

USE tickets_municipal;

-- ==========================================
-- 1. INSERTAR ROLES
-- ==========================================

INSERT INTO Role (Role, Description) VALUES
('Administrador', 'Usuario con acceso completo al sistema'),
('Director', 'Encargado de una dirección municipal'),
('Jefe de División', 'Encargado de una división dentro de una dirección'),
('Coordinador', 'Encargado de una coordinación/oficina'),
('Técnico TI', 'Personal técnico encargado de resolver tickets'),
('Solicitante', 'Usuario que puede crear tickets de soporte');

-- ==========================================
-- 2. INSERTAR USUARIOS
-- ==========================================

-- Contraseña por defecto: 'password123' (en producción usar hash real)
INSERT INTO Users (ID_Users, Fk_Role, First_Name, Last_Name, CI, Telephone_Number, Email, Password) VALUES
-- Administradores
(1, 1, 'Carlos', 'Mendoza', '12345678', '+58-414-1234567', 'carlos.mendoza@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),

-- Directores
(2, 2, 'María', 'González', '23456789', '+58-424-2345678', 'maria.gonzalez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(3, 2, 'José', 'Rodríguez', '34567890', '+58-412-3456789', 'jose.rodriguez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),

-- Jefes de División
(4, 3, 'Ana', 'Martínez', '45678901', '+58-416-4567890', 'ana.martinez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(5, 3, 'Pedro', 'López', '56789012', '+58-414-5678901', 'pedro.lopez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),

-- Coordinadores
(6, 4, 'Luis', 'Sánchez', '67890123', '+58-424-6789012', 'luis.sanchez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(7, 4, 'Carmen', 'Pérez', '78901234', '+58-416-7890123', 'carmen.perez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(8, 4, 'Roberto', 'Díaz', '89012345', '+58-414-8901234', 'roberto.diaz@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),

-- Técnicos TI
(9, 5, 'Miguel', 'Fernández', '90123456', '+58-424-9012345', 'miguel.fernandez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(10, 5, 'Laura', 'Gómez', '01234567', '+58-416-0123456', 'laura.gomez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(11, 5, 'Diego', 'Torres', '11223344', '+58-414-1122334', 'diego.torres@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(12, 5, 'Sofía', 'Ramírez', '22334455', '+58-424-2233445', 'sofia.ramirez@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),

-- Solicitantes
(13, 6, 'Jorge', 'Castro', '33445566', '+58-416-3344556', 'jorge.castro@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(14, 6, 'Elena', 'Rojas', '44556677', '+58-414-4455667', 'elena.rojas@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(15, 6, 'Ricardo', 'Morales', '55667788', '+58-424-5566778', 'ricardo.morales@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC'),
(16, 6, 'Patricia', 'Herrera', '66778899', '+58-416-6677889', 'patricia.herrera@alcaldia.gob.ve', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY8x.5zG5qC');

-- ==========================================
-- 3. INSERTAR ESTRUCTURA INSTITUCIONAL
-- ==========================================

-- Direcciones
INSERT INTO Directions (ID_Direction, Name_Direction, Fk_Director) VALUES
(1, 'Dirección de Tecnología e Información', 2),
(2, 'Dirección de Administración y Finanzas', 3);

-- Divisiones
INSERT INTO Divisions (ID_Division, Fk_Direction, Name_Division, Fk_Division_Head) VALUES
(1, 1, 'División de Infraestructura de Redes', 4),
(2, 1, 'División de Soporte Técnico', 5),
(3, 1, 'División de Desarrollo de Software', 4),
(4, 2, 'División de Recursos Humanos', 5);

-- Coordinaciones
INSERT INTO Coordinations (ID_Coordination, Fk_Division, Name_Coordination, Fk_Coordinator) VALUES
(1, 1, 'Coordinación de Redes LAN/WAN', 6),
(2, 1, 'Coordinación de Conectividad Internet', 7),
(3, 2, 'Coordinación de Mesa de Ayuda', 8),
(4, 2, 'Coordinación de Mantenimiento de Equipos', 6),
(5, 3, 'Coordinación de Desarrollo Web', 7),
(6, 3, 'Coordinación de Desarrollo Móvil', 8),
(7, 4, 'Coordinación de Nómina', 6),
(8, 4, 'Coordinación de Beneficios', 7);

-- ==========================================
-- 4. INSERTAR SERVICIOS TI
-- ==========================================

INSERT INTO TI_Service (Type_Service, Details) VALUES
('Redes', 'Configuración y mantenimiento de redes de datos, conectividad, VPN'),
('Soporte', 'Soporte técnico general, mantenimiento de equipos, instalación de software'),
('Programación', 'Desarrollo de aplicaciones web, móviles y de escritorio'),
('Seguridad', 'Gestión de seguridad informática, antivirus, firewalls'),
('Telefonía', 'Sistema de telefonía IP, central telefónica'),
('Impresoras', 'Mantenimiento y configuración de impresoras y multifuncionales');

-- ==========================================
-- 5. INSERTAR CATÁLOGO DE PROBLEMAS
-- ==========================================

-- Problemas de Redes
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(1, 'Sin conexión a internet', 'El usuario no tiene acceso a internet desde su equipo', 'Alta'),
(1, 'Red interna lenta', 'La red interna presenta lentitud en la transferencia de archivos', 'Media'),
(1, 'No se conecta al WiFi', 'El dispositivo no puede conectarse a la red WiFi del municipio', 'Media'),
(1, 'VPN no conecta', 'No se puede establecer conexión VPN desde fuera de la sede', 'Alta'),
(1, 'Problema de IP duplicada', 'Conflicto de direcciones IP en la red', 'Media');

-- Problemas de Soporte
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(2, 'Equipo no enciende', 'El computador no responde al encendido', 'Alta'),
(2, 'Impresora atascada', 'La impresora tiene papel atascado o no imprime', 'Media'),
(2, 'Monitor sin señal', 'El monitor no muestra imagen del computador', 'Alta'),
(2, 'Teclado/Mouse no funciona', 'Periféricos de entrada no responden', 'Media'),
(2, 'Software no abre', 'Aplicación específica no se ejecuta', 'Baja'),
(2, 'Sistema operativo lento', 'El computador presenta lentitud general', 'Media'),
(2, 'Necesita instalación de software', 'Solicitud de instalación de nuevo software', 'Baja');

-- Problemas de Programación
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(3, 'Error en aplicación web', 'La aplicación web presenta errores o no carga', 'Alta'),
(3, 'Nueva funcionalidad requerida', 'Solicitud de nueva característica en sistema existente', 'Media'),
(3, 'Bug en sistema', 'Error o comportamiento incorrecto en sistema', 'Alta'),
(3, 'Reporte no genera datos', 'Los reportes del sistema no muestran información correcta', 'Alta');

-- Problemas de Seguridad
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(4, 'Antivirus no actualiza', 'El antivirus no puede actualizarse', 'Media'),
(4, 'Cuenta bloqueada', 'El usuario no puede acceder a su cuenta', 'Alta'),
(4, 'Correo spam/phishing', 'Recepción de correos sospechosos', 'Media'),
(4, 'Virus detectado', 'El sistema ha detectado malware', 'Alta');

-- Problemas de Telefonía
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(5, 'Teléfono no tiene tono', 'El teléfono IP no tiene línea', 'Alta'),
(5, 'No se pueden hacer llamadas externas', 'Solo funciona comunicación interna', 'Alta'),
(5, 'Mala calidad de audio', 'La llamada presenta ruido o intermitencia', 'Media');

-- Problemas de Impresoras
INSERT INTO Service_Problems_Catalog (Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(6, 'Impresora no imprime', 'La impresora no responde a comandos de impresión', 'Alta'),
(6, 'Tinta agotada', 'Necesita cambio de cartuchos de tinta', 'Baja'),
(6, 'Impresión borrosa', 'Los documentos salen con mala calidad', 'Media'),
(6, 'Impresora atascada', 'Papel atascado en la impresora', 'Media');

-- ==========================================
-- 6. INSERTAR BLOQUES DE ALMUERZO
-- ==========================================

INSERT INTO Lunch_Blocks (Block_Name, Start_Time, End_Time) VALUES
('Bloque A', '11:30:00', '12:00:00'),
('Bloque B', '12:00:00', '12:30:00'),
('Bloque C', '12:30:00', '13:00:00'),
('Bloque D', '13:00:00', '13:30:00'),
('Bloque E', '13:30:00', '14:00:00');

-- ==========================================
-- 7. INSERTAR TÉCNICOS
-- ==========================================

INSERT INTO Technicians (ID_Technicians, Fk_Users, Fk_Lunch_Block, Status) VALUES
(1, 9, 1, 'Activo'),
(2, 10, 2, 'Activo'),
(3, 11, 3, 'Activo'),
(4, 12, 4, 'Activo');

-- ==========================================
-- 8. INSERTAR SERVICIOS DE TÉCNICOS
-- ==========================================

-- Miguel Fernández (Técnico ID 1, User ID 9) - Especialista en Redes y Seguridad
INSERT INTO Technicians_Service (Fk_Technicians, Fk_TI_Service, Status) VALUES
(1, 1, 'Activo'),
(1, 4, 'Activo');

-- Laura Gómez (Técnico ID 2, User ID 10) - Especialista en Soporte e Impresoras
INSERT INTO Technicians_Service (Fk_Technicians, Fk_TI_Service, Status) VALUES
(2, 2, 'Activo'),
(2, 6, 'Activo');

-- Diego Torres (Técnico ID 3, User ID 11) - Especialista en Programación
INSERT INTO Technicians_Service (Fk_Technicians, Fk_TI_Service, Status) VALUES
(3, 3, 'Activo');

-- Sofía Ramírez (Técnico ID 4, User ID 12) - Especialista en Soporte General
INSERT INTO Technicians_Service (Fk_Technicians, Fk_TI_Service, Status) VALUES
(4, 2, 'Activo'),
(4, 5, 'Activo'),
(4, 6, 'Activo');

-- ==========================================
-- 9. INSERTAR PERMISOS DE SERVICIOS
-- ==========================================

-- Permisos para Dirección de Tecnología (acceso a todos los servicios)
INSERT INTO Service_Permissions (Fk_TI_Service, Fk_Direction, Fk_Division, Fk_Coordination, Is_Allowed) VALUES
(1, 1, NULL, NULL, TRUE),
(2, 1, NULL, NULL, TRUE),
(3, 1, NULL, NULL, TRUE),
(4, 1, NULL, NULL, TRUE),
(5, 1, NULL, NULL, TRUE),
(6, 1, NULL, NULL, TRUE);

-- Permisos para Dirección de Administración (solo Soporte e Impresoras)
INSERT INTO Service_Permissions (Fk_TI_Service, Fk_Direction, Fk_Division, Fk_Coordination, Is_Allowed) VALUES
(2, 2, NULL, NULL, TRUE),
(6, 2, NULL, NULL, TRUE);

-- Permisos específicos por coordinación
INSERT INTO Service_Permissions (Fk_TI_Service, Fk_Direction, Fk_Division, Fk_Coordination, Is_Allowed) VALUES
(1, NULL, NULL, 1, TRUE), -- Coordinación de Redes LAN/WAN
(1, NULL, NULL, 2, TRUE), -- Coordinación de Conectividad Internet
(2, NULL, NULL, 3, TRUE), -- Coordinación de Mesa de Ayuda
(2, NULL, NULL, 4, TRUE), -- Coordinación de Mantenimiento de Equipos
(3, NULL, NULL, 5, TRUE), -- Coordinación de Desarrollo Web
(3, NULL, NULL, 6, TRUE), -- Coordinación de Desarrollo Móvil
(6, NULL, NULL, 7, TRUE), -- Coordinación de Nómina
(6, NULL, NULL, 8, TRUE); -- Coordinación de Beneficios

-- ==========================================
-- 10. INSERTAR HORARIOS DE TÉCNICOS
-- ==========================================

-- Miguel Fernández
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(1, 'Lunes', '08:00:00', '17:00:00'),
(1, 'Martes', '08:00:00', '17:00:00'),
(1, 'Miércoles', '08:00:00', '17:00:00'),
(1, 'Jueves', '08:00:00', '17:00:00'),
(1, 'Viernes', '08:00:00', '16:00:00');

-- Laura Gómez
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(2, 'Lunes', '08:00:00', '16:00:00'),
(2, 'Martes', '08:00:00', '16:00:00'),
(2, 'Miércoles', '08:00:00', '16:00:00'),
(2, 'Jueves', '08:00:00', '16:00:00'),
(2, 'Viernes', '08:00:00', '16:00:00');

-- Diego Torres
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(3, 'Lunes', '09:00:00', '18:00:00'),
(3, 'Martes', '09:00:00', '18:00:00'),
(3, 'Miércoles', '09:00:00', '18:00:00'),
(3, 'Jueves', '09:00:00', '18:00:00'),
(3, 'Viernes', '09:00:00', '17:00:00');

-- Sofía Ramírez
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(4, 'Lunes', '08:30:00', '17:30:00'),
(4, 'Martes', '08:30:00', '17:30:00'),
(4, 'Miércoles', '08:30:00', '17:30:00'),
(4, 'Jueves', '08:30:00', '17:30:00'),
(4, 'Viernes', '08:30:00', '16:30:00');

-- ==========================================
-- 11. INSERTAR TICKETS DE EJEMPLO
-- ==========================================

-- Nota: Los códigos de ticket se generan automáticamente con el trigger
-- IDs del catálogo de problemas:
-- Redes: 1-5, Soporte: 6-12, Programación: 13-16, Seguridad: 17-20, Telefonía: 21-23, Impresoras: 24-27

INSERT INTO Service_Request (Fk_Users, Fk_Coordination, Fk_TI_Service, Fk_Problem_Catalog, Subject, Property_number, Description, System_Priority, Status) VALUES
(13, 1, 1, 1, 'Sin conexión a internet en oficina de redes', 'A-101', 'Desde hace 2 horas no tengo conexión a internet en mi computadora. He intentado reiniciar el equipo y el router pero sigue sin funcionar.', 'Alta', 'En Progreso'),
(13, 2, 1, 3, 'No puedo conectarme al WiFi del municipio', 'A-102', 'Mi laptop no detecta la red WiFi Municipal. Otros compañeros sí se conectan sin problemas.', 'Media', 'Pendiente'),
(14, 3, 2, 9, 'Impresora HP LaserJet atascada', 'B-201', 'La impresora de la coordinación tiene papel atascado y no puedo retirarlo. Necesito ayuda técnica.', 'Media', 'Resuelto'),
(14, 3, 2, 10, 'Monitor no muestra señal', 'B-202', 'Encendí el computador pero el monitor se queda en negro y muestra "No Signal". He verificado los cables y están conectados.', 'Alta', 'En Progreso'),
(15, 5, 3, 13, 'Error en módulo de reportes del sistema', 'C-301', 'Cuando intento generar el reporte de tickets mensuales, el sistema muestra un error "500 Internal Server Error". Esto ocurre desde ayer.', 'Alta', 'Pendiente'),
(15, 6, 3, 14, 'Necesito funcionalidad de exportar a Excel', 'C-302', 'Los usuarios solicitan poder exportar los reportes a formato Excel además de PDF. Actualmente solo se puede exportar a PDF.', 'Media', 'Pendiente'),
(16, 7, 4, 18, 'Cuenta de usuario bloqueada', 'D-401', 'Intenté ingresar al sistema y me indica que mi cuenta está bloqueada por múltiples intentos fallidos de contraseña.', 'Alta', 'Resuelto'),
(16, 7, 4, 19, 'Recibí correo sospechoso de phishing', 'D-402', 'Recibí un correo supuestamente del banco solicitando actualizar mis datos. Parece ser un intento de phishing.', 'Media', 'En Progreso'),
(17, 8, 5, 21, 'Teléfono IP no tiene tono', 'E-501', 'Mi extensión telefónica no tiene tono. No puedo hacer ni recibir llamadas.', 'Alta', 'Resuelto'),
(17, 8, 5, 22, 'No puedo llamar a números externos', 'E-502', 'Puedo hacer llamadas internas pero cuando intento llamar a números externos la llamada no se completa.', 'Alta', 'Pendiente'),
(13, 1, 2, 11, 'Sistema operativo muy lento', 'A-103', 'Mi computador está extremadamente lento. Tarda mucho en abrir aplicaciones y navegar por archivos.', 'Media', 'Pendiente'),
(14, 4, 6, 26, 'Impresión borrosa en multifuncional', 'B-203', 'La impresora multifuncional está imprimiendo con mala calidad, los textos salen borrosos y con líneas.', 'Media', 'En Progreso');

-- ==========================================
-- 12. INSERTAR ASIGNACIONES DE TÉCNICOS A TICKETS
-- ==========================================

-- Ticket 1 (Sin conexión internet) - Asignado a Miguel Fernández
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Fk_Assigned_By) VALUES
(1, 1, TRUE, 1);

-- Ticket 3 (Impresora atascada) - Asignado a Laura Gómez
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Fk_Assigned_By) VALUES
(3, 2, TRUE, 1);

-- Ticket 4 (Monitor sin señal) - Asignado a Sofía Ramírez
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Fk_Assigned_By) VALUES
(4, 4, TRUE, 1);

-- Ticket 7 (Cuenta bloqueada) - Asignado a Miguel Fernández
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Fk_Assigned_By) VALUES
(7, 1, TRUE, 1);

-- Ticket 8 (Correo phishing) - Asignado a Miguel Fernández
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Fk_Assigned_By) VALUES
(8, 1, TRUE, 1);

-- Ticket 9 (Teléfono sin tono) - Asignado a Sofía Ramírez
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Fk_Assigned_By) VALUES
(9, 4, TRUE, 1);

-- Ticket 12 (Impresión borrosa) - Asignado a Laura Gómez
INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Fk_Assigned_By) VALUES
(12, 2, TRUE, 1);

-- ==========================================
-- 13. INSERTAR HISTORIAL DE ASIGNACIONES
-- ==========================================

INSERT INTO Ticket_Assignments_History (Fk_Service_Request, Fk_Technician, Action_Type, Fk_Assigned_By) VALUES
(1, 1, 'Asignación Inicial', 1),
(3, 2, 'Asignación Inicial', 1),
(4, 4, 'Asignación Inicial', 1),
(7, 1, 'Asignación Inicial', 1),
(8, 1, 'Asignación Inicial', 1),
(9, 4, 'Asignación Inicial', 1),
(12, 2, 'Asignación Inicial', 1);

-- ==========================================
-- 14. INSERTAR COMENTARIOS EN TICKETS
-- ==========================================

INSERT INTO Ticket_Comments (Fk_Service_Request, Fk_User, Comment) VALUES
(1, 1, 'He verificado el switch y el puerto está activo. El problema parece estar en el equipo del usuario.'),
(1, 13, 'Gracias por la revisión. ¿Cuándo pueden pasar a revisar mi equipo?'),
(3, 2, 'Se retiró el papel atascado. La impresora funciona correctamente ahora.'),
(3, 14, 'Excelente, muchas gracias por la rápida respuesta.'),
(4, 4, 'El cable VGA estaba flojo. Se reconectó y ahora funciona correctamente.'),
(4, 14, 'Perfecto, ya puedo trabajar normalmente.'),
(7, 1, 'Se ha desbloqueado la cuenta. Por favor cambie su contraseña por seguridad.'),
(7, 16, 'Entendido, ya cambié mi contraseña. Gracias.'),
(9, 4, 'Se configuró correctamente la extensión. El teléfono ahora funciona.'),
(9, 17, 'Muchas gracias, ya puedo hacer y recibir llamadas.'),
(12, 2, 'Se limpiaron los cabezales de impresión. La calidad ha mejorado significativamente.'),
(12, 14, 'Gracias, ahora las impresiones salen nítidas.');

-- ==========================================
-- 15. ACTUALIZAR FECHAS DE RESOLUCIÓN PARA TICKETS RESUELTOS
-- ==========================================

UPDATE Service_Request SET Resolved_at = DATE_SUB(NOW(), INTERVAL 2 HOUR) WHERE ID_Service_Request = 3;
UPDATE Service_Request SET Resolved_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE ID_Service_Request = 7;
UPDATE Service_Request SET Resolved_at = DATE_SUB(NOW(), INTERVAL 3 HOUR) WHERE ID_Service_Request = 9;

-- ==========================================
-- FIN DEL SCRIPT DE INSERCIÓN DE DATOS
-- ==========================================
