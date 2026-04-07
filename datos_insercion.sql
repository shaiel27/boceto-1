
-- ==========================================
-- LIMPIEZA DE DATOS EXISTENTES (OPCIONAL)
-- ==========================================

-- Descomenta las siguientes líneas si quieres limpiar la base de datos antes de insertar nuevos datos
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE Ticket_Attachments;
-- TRUNCATE TABLE Ticket_Comments;
-- TRUNCATE TABLE Ticket_Timeline;
-- TRUNCATE TABLE Ticket_Assignments_History;
-- TRUNCATE TABLE Service_Request;
-- TRUNCATE TABLE Technicians_Service;
-- TRUNCATE TABLE Technicians;
-- TRUNCATE TABLE Area_Office;
-- TRUNCATE TABLE TI_Service;
-- TRUNCATE TABLE Office;
-- TRUNCATE TABLE Users;
-- TRUNCATE TABLE Role;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- INSERCIÓN DE DATOS PARA ALCALDÍA TICKETS DB
-- ==========================================

USE alcaldia_tickets_db;

-- ==========================================
-- 1. INSERCIÓN DE ROLES (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Role (Role, Description) VALUES
('Administrador', 'Usuario con acceso completo al sistema'),
('Tecnico', 'Usuario técnico que resuelve tickets'),
('Usuario', 'Usuario regular que crea tickets');

-- ==========================================
-- 2. INSERCIÓN DE USUARIOS (20 usuarios - SIN ESPECIFICAR ID)
-- ==========================================

-- 1 Administrador
INSERT IGNORE INTO Users (Fk_Role, First_Name, Last_Name, CI, Telephone_Number, Email, Password) VALUES
(1, 'Carlos', 'Rodriguez', 'A12345678', '555-0001', 'admin@alcaldia.gov', 'admin123');

-- 9 Técnicos
INSERT IGNORE INTO Users (Fk_Role, First_Name, Last_Name, CI, Telephone_Number, Email, Password) VALUES
(2, 'Juan', 'Perez', 'B23456789', '555-0002', 'juan.perez@alcaldia.gov', 'tec123'),
(2, 'Maria', 'Gonzalez', 'C34567890', '555-0003', 'maria.gonzalez@alcaldia.gov', 'tec123'),
(2, 'Luis', 'Martinez', 'D45678901', '555-0004', 'luis.martinez@alcaldia.gov', 'tec123'),
(2, 'Ana', 'Sanchez', 'E56789012', '555-0005', 'ana.sanchez@alcaldia.gov', 'tec123'),
(2, 'Roberto', 'Lopez', 'F67890123', '555-0006', 'roberto.lopez@alcaldia.gov', 'tec123'),
(2, 'Patricia', 'Diaz', 'G78901234', '555-0007', 'patricia.diaz@alcaldia.gov', 'tec123'),
(2, 'Miguel', 'Torres', 'H89012345', '555-0008', 'miguel.torres@alcaldia.gov', 'tec123'),
(2, 'Sofia', 'Ramirez', 'I90123456', '555-0009', 'sofia.ramirez@alcaldia.gov', 'tec123'),
(2, 'Diego', 'Herrera', 'J01234567', '555-0010', 'diego.herrera@alcaldia.gov', 'tec123');

-- 10 Usuarios regulares
INSERT IGNORE INTO Users (Fk_Role, First_Name, Last_Name, CI, Telephone_Number, Email, Password) VALUES
(3, 'Pedro', 'Castillo', 'K12345678', '555-0011', 'pedro.castillo@alcaldia.gov', 'user123'),
(3, 'Laura', 'Vargas', 'L23456789', '555-0012', 'laura.vargas@alcaldia.gov', 'user123'),
(3, 'Andres', 'Mendoza', 'M34567890', '555-0013', 'andres.mendoza@alcaldia.gov', 'user123'),
(3, 'Carmen', 'Silva', 'N45678901', '555-0014', 'carmen.silva@alcaldia.gov', 'user123'),
(3, 'Ricardo', 'Morales', 'O56789012', '555-0015', 'ricardo.morales@alcaldia.gov', 'user123'),
(3, 'Beatriz', 'Ortiz', 'P67890123', '555-0016', 'beatriz.ortiz@alcaldia.gov', 'user123'),
(3, 'Fernando', 'Gutierrez', 'Q78901234', '555-0017', 'fernando.gutierrez@alcaldia.gov', 'user123'),
(3, 'Monica', 'Cruz', 'R89012345', '555-0018', 'monica.cruz@alcaldia.gov', 'user123'),
(3, 'Javier', 'Reyes', 'S90123456', '555-0019', 'javier.reyes@alcaldia.gov', 'user123'),
(3, 'Gabriela', 'Flores', 'T01234567', '555-0020', 'gabriela.flores@alcaldia.gov', 'user123');

-- ==========================================
-- 3. INSERCIÓN DE TÉCNICOS (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Technicians (Fk_Users, Status) VALUES
(2, 'Disponible'),
(3, 'Disponible'),
(4, 'Ocupado'),
(5, 'Disponible'),
(6, 'Disponible'),
(7, 'Ocupado'),
(8, 'Disponible'),
(9, 'Disponible'),
(10, 'Ocupado');

-- ==========================================
-- 4. INSERCIÓN DE OFICINAS (10 oficinas - SIN ESPECIFICAR ID)
-- ==========================================

INSERT IGNORE INTO Office (Name_Office, Building, Telephone_Number, Fk_Office_Boss) VALUES
('Oficina de Recursos Humanos', 'Edificio Central', '555-1001', 1),
('Departamento de Tecnología', 'Edificio Central', '555-1002', 1),
('Secretaría General', 'Edificio A', '555-1003', 1),
('Tesorería Municipal', 'Edificio B', '555-1004', 1),
('Oficina de Obras Públicas', 'Edificio C', '555-1005', 1),
('Departamento de Salud', 'Edificio D', '555-1006', 1),
('Oficina de Educación', 'Edificio E', '555-1007', 1),
('Secretaría de Transporte', 'Edificio F', '555-1008', 1),
('Departamento de Ambiente', 'Edificio G', '555-1009', 1),
('Oficina de Cultura', 'Edificio H', '555-1010', 1);

-- ==========================================
-- 5. INSERCIÓN DE TIPOS DE SERVICIO (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO TI_Service (Type_Service, Details) VALUES
('Redes', 'Instalación, configuración y mantenimiento de redes de datos y conectividad'),
('Programacion', 'Desarrollo y mantenimiento de software, sistemas y aplicaciones'),
('Servicio Tecnico', 'Soporte técnico general, reparación de hardware y mantenimiento de equipos');

-- ==========================================
-- 6. ASIGNACIÓN DE SERVICIOS A TÉCNICOS (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Technicians_Service (Fk_Technicians, Fk_TI_Service, status) VALUES
(1, 1, 'Disponible'), (1, 2, 'Disponible'), (1, 3, 'Disponible'),
(2, 1, 'Disponible'), (2, 2, 'Disponible'), (2, 3, 'Disponible'),
(3, 1, 'Ocupado'), (3, 2, 'Disponible'), (3, 3, 'Ocupado'),
(4, 1, 'Disponible'), (4, 2, 'Disponible'), (4, 3, 'Disponible'),
(5, 1, 'Disponible'), (5, 2, 'Ocupado'), (5, 3, 'Disponible'),
(6, 1, 'Disponible'), (6, 2, 'Disponible'), (6, 3, 'Ocupado'),
(7, 1, 'Disponible'), (7, 2, 'Disponible'), (7, 3, 'Disponible'),
(8, 1, 'Ocupado'), (8, 2, 'Disponible'), (8, 3, 'Disponible'),
(9, 1, 'Disponible'), (9, 2, 'Disponible'), (9, 3, 'Ocupado');

-- ==========================================
-- 7. INSERCIÓN DE ÁREAS DE OFICINA (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Area_Office (Area_Name, Description, Fk_Area_Boos, Fk_Office) VALUES
('Soporte Técnico', 'Área encargada del soporte técnico interno', 1, 2),
('Administración', 'Área administrativa general', 1, 1),
('Secretaría', 'Área de gestión documental', 1, 3),
('Finanzas', 'Área de gestión financiera', 1, 4),
('Infraestructura', 'Área de mantenimiento de infraestructura', 1, 5),
('Salud Ocupacional', 'Área de salud y bienestar', 1, 6),
('Capacitación', 'Área de formación y desarrollo', 1, 7),
('Logística', 'Área de transporte y logística', 1, 8),
('Medio Ambiente', 'Área de gestión ambiental', 1, 9),
('Cultura', 'Área de eventos y actividades culturales', 1, 10);

-- ==========================================
-- 8. INSERCIÓN DE TICKETS (8 casos - SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Service_Request (Ticket_Code, Fk_Users, FK_Office, FK_Area_Office, Fk_TI_Service, Fk_Technician_Current, Subject, Property_number, Description, Request_Type, User_Priority, System_Priority, Status) VALUES
('TKT-2024-001', 11, 1, 2, 3, 1, 'Computadora no enciende', 'PC-HR-001', 'La computadora de escritorio no enciende al presionar el botón de power', 'Incidente', 'Alta', 'Alta', 'En Progreso'),
('TKT-2024-002', 12, 2, 1, 2, 2, 'Microsoft Office no funciona', 'PC-TECH-03', 'No puedo abrir los documentos de Word y Excel, se cierran solos', 'Incidente', 'Media', 'Media', 'Pendiente'),
('TKT-2024-003', 13, 3, 3, 1, 3, 'Sin conexión a internet', 'PC-SEC-005', 'No tengo acceso a internet desde hace 2 días', 'Incidente', 'Alta', 'Alta', 'Resuelto'),
('TKT-2024-004', 14, 4, 4, 3, 4, 'Impresora no imprime', 'IMP-TES-01', 'La impresora HP LaserJet no responde cuando intento imprimir', 'Incidente', 'Media', 'Media', 'En Progreso'),
('TKT-2024-005', 15, 5, 5, 3, 5, 'Windows muy lento', 'PC-OBR-002', 'El sistema operativo funciona extremadamente lento', 'Incidente', 'Media', 'Baja', 'Pendiente'),
('TKT-2024-006', 16, 6, 6, 1, 6, 'No puedo enviar correos', 'PC-SAL-001', 'Outlook no envía correos, marca error de servidor', 'Incidente', 'Alta', 'Media', 'En Progreso'),
('TKT-2024-007', 17, 7, 7, 2, 7, 'No puedo crear tickets', 'PC-EDU-003', 'El sistema de tickets me da error al intentar crear una nueva solicitud', 'Incidente', 'Media', 'Alta', 'Resuelto'),
('TKT-2024-008', 18, 8, 8, 3, 8, 'Sospecha de virus', 'PC-TRANS-04', 'El antivirus detectó una amenaza pero no puede eliminarla', 'Incidente', 'Alta', 'Alta', 'En Progreso');

-- ==========================================
-- 8. INSERCIÓN DE COMENTARIOS EN TICKETS (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Ticket_Comments (Fk_Service_Request, Fk_User, Comment, Is_Internal) VALUES
(1, 1, 'Ticket asignado al técnico Juan Perez para revisión de hardware', FALSE),
(1, 2, 'Se detectó falla en la fuente de poder, se necesita reemplazo', TRUE),
(2, 1, 'Por favor verificar la instalación de Microsoft Office', FALSE),
(3, 3, 'Problema resuelto: se reinició el router y se configuró la IP', TRUE),
(4, 4, 'Se necesita limpiar los cabezales de la impresora', TRUE),
(5, 1, 'El ticket está en cola, se atenderá según prioridad', FALSE),
(6, 6, 'Se verificó la configuración del servidor SMTP', TRUE),
(7, 7, 'Se actualizó el sistema y se reinició el servicio', TRUE),
(8, 8, 'Se inició análisis profundo del sistema', TRUE);

-- ==========================================
-- 9. INSERCIÓN DE HISTORIAL DE ASIGNACIONES (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Ticket_Assignments_History (Fk_Service_Request, Fk_Technician, Fk_Assigned_By, Assignment_Date, Reason_Reassignment) VALUES
(1, 1, 1, '2024-01-15 09:00:00', 'Asignación inicial por especialidad en hardware'),
(2, 2, 1, '2024-01-15 10:30:00', 'Asignación por experiencia en software'),
(3, 3, 1, '2024-01-15 11:00:00', 'Asignación por urgencia y disponibilidad'),
(4, 4, 1, '2024-01-15 14:00:00', 'Asignación por especialidad en impresoras'),
(5, 5, 1, '2024-01-16 08:00:00', 'Asignación por disponibilidad'),
(6, 6, 1, '2024-01-16 09:30:00', 'Asignación por especialidad en correo'),
(7, 7, 1, '2024-01-16 10:00:00', 'Asignación por conocimiento del sistema'),
(8, 8, 1, '2024-01-16 11:30:00', 'Asignación por urgencia de seguridad');

-- ==========================================
-- 10. INSERCIÓN DE LÍNEA DE TIEMPO (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Ticket_Timeline (Fk_Service_Request, Fk_User_Action, Action_Type, Previous_Value, New_Value, Action_Date) VALUES
(1, 11, 'Creación', NULL, 'Pendiente', '2024-01-15 08:45:00'),
(1, 1, 'Asignación', 'Pendiente', 'En Progreso', '2024-01-15 09:00:00'),
(3, 13, 'Creación', NULL, 'Pendiente', '2024-01-15 10:45:00'),
(3, 3, 'Resolución', 'En Progreso', 'Resuelto', '2024-01-15 15:30:00'),
(7, 17, 'Creación', NULL, 'Pendiente', '2024-01-16 09:15:00'),
(7, 7, 'Resolución', 'En Progreso', 'Resuelto', '2024-01-16 16:45:00');

-- ==========================================
-- 11. INSERCIÓN DE ADJUNTOS (SIN ESPECIFICAR ID - AUTOINCREMENT)
-- ==========================================

INSERT IGNORE INTO Ticket_Attachments (Fk_Service_Request, File_Name, File_Path, File_Type) VALUES
(1, 'error_pc.jpg', '/adjuntos/tickets/TKT-2024-001/error_pc.jpg', 'jpg'),
(2, 'captura_error.png', '/adjuntos/tickets/TKT-2024-002/captura_error.png', 'png'),
(4, 'config_impresora.pdf', '/adjuntos/tickets/TKT-2024-004/config_impresora.pdf', 'pdf'),
(8, 'reporte_virus.txt', '/adjuntos/tickets/TKT-2024-008/reporte_virus.txt', 'txt');

-- ==========================================
-- RESUMEN DE DATOS INSERTADOS
-- ==========================================
-- Roles: 3 (Administrador, Tecnico, Usuario)
-- Usuarios: 20 (1 Admin, 9 Técnicos, 10 Usuarios regulares)
-- Técnicos: 9 (asociados a los usuarios técnicos)
-- Oficinas: 10
-- Áreas de Oficina: 10
-- Tipos de Servicio: 3 (Redes, Programacion, Servicio Tecnico)
-- Servicios asignados a técnicos: 27
-- Tickets: 8
-- Comentarios: 9
-- Historial de asignaciones: 8
-- Línea de tiempo: 6
-- Adjuntos: 4
