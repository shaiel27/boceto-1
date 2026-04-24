-- ==========================================
-- POBLADO DE DATOS PARA SISTEMA DE TICKETS
-- ==========================================
-- Este archivo contiene las sentencias INSERT para poblar las tablas
-- necesarias para el funcionamiento del sistema de gestión de tickets.

USE tickets_system;

-- ==========================================
-- 1. TI_SERVICE (Tipos de Servicio)
-- ==========================================
INSERT INTO TI_Service (ID_TI_Service, Type_Service, Details) VALUES
(1, 'Redes', 'Problemas de conectividad, internet, VPN y red interna'),
(2, 'Programación', 'Desarrollo de software, nuevas funcionalidades y errores en sistemas'),
(3, 'Soporte Técnico', 'Mantenimiento de hardware, equipos e impresoras');

-- ==========================================
-- 2. SOFTWARE_SYSTEMS (Sistemas de Software)
-- ==========================================
INSERT INTO Software_Systems (ID_System, System_Name, Description, Status) VALUES
(1, 'Sistema de Recursos Humanos', 'Módulo de nómina, personal y gestión de empleados', 'Activo'),
(2, 'Sistema de Finanzas', 'Contabilidad, presupuesto y gestión financiera', 'Activo'),
(3, 'Sistema de Catastro', 'Gestión de impuestos inmobiliarios y catastro', 'Activo'),
(4, 'Sistema de Trámites', 'Gestión de solicitudes ciudadanas y trámites municipales', 'Activo'),
(5, 'Sistema de Obras Públicas', 'Gestión de proyectos de construcción y mantenimiento', 'Activo'),
(6, 'Sistema de Salud', 'Gestión de centros de salud y programas médicos', 'Activo'),
(7, 'Sistema de Educación', 'Gestión de escuelas, estudiantes y personal docente', 'Activo'),
(8, 'Sistema de Vialidad', 'Gestión de vías, semáforos y transporte', 'Activo'),
(9, 'Sistema de Compras', 'Gestión de procesos de licitación y compras', 'Activo'),
(10, 'Sistema de Archivo', 'Gestión documental y archivo municipal', 'Activo');

-- ==========================================
-- 3. SERVICE_PROBLEMS_CATALOG (Catálogo de Problemas)
-- ==========================================

-- Problemas para Redes (ID_TI_Service = 1)
INSERT INTO Service_Problems_Catalog (ID_Problem_Catalog, Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(1, 1, 'Sin conexión a internet', 'No puedo acceder a internet o la conexión es muy lenta', 'Alta'),
(2, 1, 'Problemas de red interna', 'No puedo acceder a recursos compartidos o impresoras en red', 'Media'),
(3, 1, 'VPN no conecta', 'No puedo conectarme a la VPN corporativa', 'Alta'),
(4, 1, 'Wi-Fi no funciona', 'La red Wi-Fi no es accesible o desconecta frecuentemente', 'Alta'),
(5, 1, 'Intermitencia en conexión', 'La conexión se corta y restablece constantemente', 'Media');

-- Problemas para Programación (ID_TI_Service = 2)
INSERT INTO Service_Problems_Catalog (ID_Problem_Catalog, Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(6, 2, 'Sistema no responde', 'El sistema está lento o no responde a las acciones', 'Alta'),
(7, 2, 'Error en funcionalidad', 'Algún módulo del sistema presenta errores al ejecutarse', 'Media'),
(8, 2, 'Nueva funcionalidad requerida', 'Necesito una nueva función, reporte o módulo en el sistema', 'Baja'),
(9, 2, 'Datos incorrectos', 'El sistema muestra datos erróneos o inconsistentes', 'Alta'),
(10, 2, 'Problema de exportación', 'No puedo exportar reportes o datos a Excel/PDF', 'Media');

-- Problemas para Soporte Técnico (ID_TI_Service = 3)
INSERT INTO Service_Problems_Catalog (ID_Problem_Catalog, Fk_TI_Service, Problem_Name, Typical_Description, Estimated_Severity) VALUES
(11, 3, 'Equipo no enciende', 'El equipo no prende o se apaga solo', 'Alta'),
(12, 3, 'Pantalla dañada', 'La pantalla está rota, con líneas o no muestra imagen', 'Alta'),
(13, 3, 'Teclado/mouse no funciona', 'El teclado o mouse no responde o tiene teclas fallando', 'Media'),
(14, 3, 'Impresora atascada', 'La impresora tiene papel atascado o no imprime', 'Media'),
(15, 3, 'Equipo lento', 'El equipo tiene rendimiento muy bajo', 'Alta'),
(16, 3, 'No se escucha sonido', 'Los altavoces o audífonos no emiten sonido', 'Baja'),
(17, 3, 'No hay imagen en proyector', 'El proyector no muestra la imagen del equipo', 'Alta'),
(18, 3, 'Unidad de CD/DVD no funciona', 'La unidad de disco no lee o no abre', 'Baja');

-- ==========================================
-- 4. SERVICE_PERMISSIONS (Permisos de Servicio)
-- ==========================================
-- Configurar permisos para que todas las oficinas puedan solicitar los tres tipos de servicio
-- Nota: Ajustar según las necesidades específicas de cada oficina

-- Permisos para Direcciones existentes (IDs basados en datos reales)
INSERT INTO Service_Permissions (ID_Permission, Fk_TI_Service, Fk_Office, Is_Allowed) VALUES
(1, 1, 1, TRUE),  -- DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA - Redes
(2, 2, 1, TRUE),  -- DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA - Programación
(3, 3, 1, TRUE),  -- DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA - Soporte Técnico
(4, 1, 6, TRUE),  -- DIRECCIÓN DE TALENTO HUMANO - Redes
(5, 2, 6, TRUE),  -- DIRECCIÓN DE TALENTO HUMANO - Programación
(6, 3, 6, TRUE),  -- DIRECCIÓN DE TALENTO HUMANO - Soporte Técnico
(7, 1, 12, TRUE), -- DIRECCIÓN DE EDUCACIÓN - Redes
(8, 2, 12, TRUE), -- DIRECCIÓN DE EDUCACIÓN - Programación
(9, 3, 12, TRUE), -- DIRECCIÓN DE EDUCACIÓN - Soporte Técnico
(10, 1, 22, TRUE), -- DIRECCIÓN DE ADMINISTRACIÓN - Redes
(11, 2, 22, TRUE), -- DIRECCIÓN DE ADMINISTRACIÓN - Programación
(12, 3, 22, TRUE); -- DIRECCIÓN DE ADMINISTRACIÓN - Soporte Técnico

-- Permisos para Divisiones principales (IDs basados en datos reales)
INSERT INTO Service_Permissions (ID_Permission, Fk_TI_Service, Fk_Office, Is_Allowed) VALUES
(13, 1, 2, TRUE), -- DIVISIÓN DE CATASTRO - Redes
(14, 2, 2, TRUE), -- DIVISIÓN DE CATASTRO - Programación
(15, 3, 2, TRUE), -- DIVISIÓN DE CATASTRO - Soporte Técnico
(16, 1, 5, TRUE), -- ÁREA LEGAL DE CATASTRO - Redes
(17, 2, 5, TRUE), -- ÁREA LEGAL DE CATASTRO - Programación
(18, 3, 5, TRUE), -- ÁREA LEGAL DE CATASTRO - Soporte Técnico
(19, 1, 7, TRUE), -- DIVISIÓN DE ÁREA LEGAL Y ARCHIVO - Redes
(20, 2, 7, TRUE), -- DIVISIÓN DE ÁREA LEGAL Y ARCHIVO - Programación
(21, 3, 7, TRUE), -- DIVISIÓN DE ÁREA LEGAL Y ARCHIVO - Soporte Técnico
(22, 1, 8, TRUE), -- DIVISIÓN DE PRESTACIONES Y NÓMINA - Redes
(23, 2, 8, TRUE), -- DIVISIÓN DE PRESTACIONES Y NÓMINA - Programación
(24, 3, 8, TRUE); -- DIVISIÓN DE PRESTACIONES Y NÓMINA - Soporte Técnico

-- Permisos para Coordinaciones (IDs 11-98)
-- Para simplificar, permitimos todos los servicios a todas las coordinaciones
-- Se puede ajustar según necesidades específicas

-- ==========================================
-- 5. OFFICE_SYSTEMS (Relación Oficina-Sistema)
-- ==========================================

-- Sistemas para DIRECCIÓN DE TALENTO HUMANO (ID 6)
INSERT INTO Office_Systems (ID_Office_System, Fk_Office_ID, Fk_System_ID) VALUES
(1, 6, 1), -- Sistema de Recursos Humanos
(2, 6, 10); -- Sistema de Archivo

-- Sistemas para DIRECCIÓN DE EDUCACIÓN (ID 12)
INSERT INTO Office_Systems (ID_Office_System, Fk_Office_ID, Fk_System_ID) VALUES
(3, 12, 7), -- Sistema de Educación
(4, 12, 10); -- Sistema de Archivo

-- Sistemas para DIRECCIÓN DE ADMINISTRACIÓN (ID 22)
INSERT INTO Office_Systems (ID_Office_System, Fk_Office_ID, Fk_System_ID) VALUES
(5, 22, 2), -- Sistema de Finanzas
(6, 22, 9), -- Sistema de Compras
(7, 22, 10); -- Sistema de Archivo

-- Sistemas para DIVISIÓN DE CATASTRO (ID 2)
INSERT INTO Office_Systems (ID_Office_System, Fk_Office_ID, Fk_System_ID) VALUES
(8, 2, 3), -- Sistema de Catastro
(9, 2, 10); -- Sistema de Archivo

-- Sistemas para DIVISIÓN DE RENTAS (ID 13)
INSERT INTO Office_Systems (ID_Office_System, Fk_Office_ID, Fk_System_ID) VALUES
(10, 13, 3), -- Sistema de Catastro
(11, 13, 10); -- Sistema de Archivo

-- ==========================================
-- 6. REQUEST_SETTINGS (Configuración de Solicitudes)
-- ==========================================
-- Configurar que las oficinas pueden solicitar directamente sin aprobación
-- Nota: Ajustar según el flujo de aprobación deseado

INSERT INTO Request_Settings (ID_Setting, Fk_Office_ID, Can_Request_Directly, Must_Be_Approved_By_Superior) VALUES
(1, 1, TRUE, FALSE), -- DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA
(2, 2, TRUE, FALSE), -- DIVISIÓN DE CATASTRO
(3, 5, TRUE, FALSE), -- ÁREA LEGAL DE CATASTRO
(4, 6, TRUE, FALSE), -- DIRECCIÓN DE TALENTO HUMANO
(5, 7, TRUE, FALSE), -- DIVISIÓN DE ÁREA LEGAL Y ARCHIVO
(6, 8, TRUE, FALSE), -- DIVISIÓN DE PRESTACIONES Y NÓMINA
(7, 10, TRUE, FALSE), -- SOLVENCIAS
(8, 12, TRUE, FALSE), -- DIRECCIÓN DE EDUCACIÓN
(9, 13, TRUE, FALSE), -- DIVISIÓN DE RENTAS
(10, 22, TRUE, FALSE); -- DIRECCIÓN DE ADMINISTRACIÓN

-- ==========================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ==========================================
SELECT 'TI_Service' as Tabla, COUNT(*) as Registros FROM TI_Service
UNION ALL
SELECT 'Software_Systems', COUNT(*) FROM Software_Systems
UNION ALL
SELECT 'Service_Problems_Catalog', COUNT(*) FROM Service_Problems_Catalog
UNION ALL
SELECT 'Service_Permissions', COUNT(*) FROM Service_Permissions
UNION ALL
SELECT 'Office_Systems', COUNT(*) FROM Office_Systems
UNION ALL
SELECT 'Request_Settings', COUNT(*) FROM Request_Settings;

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================
