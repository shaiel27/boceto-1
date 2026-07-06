-- ==========================================
-- SISTEMA DE GESTIÓN DE TÉCNICOS
-- Basado en: Control de Asistencia, Horario y Almuerzo - Julio 2026
-- Base de datos: tickets_system
-- Contraseña por defecto: password123
-- Hash bcrypt generado con PHP
-- Todos: role_id = 2 (Técnico)
-- Email: cedula@alcaldia.gob
-- ==========================================

USE tickets_system;

-- ==========================================
-- 1. USUARIOS (Técnicos)
-- IDs continúan desde datos_insercion.sql (admin=1, tech1=2, tech2=3, jefe1=4, jefe2=5, auditor=6)
-- ==========================================
INSERT INTO Users (ID_Users, Fk_Role, Email, Password, Username, Full_Name, is_system_user) VALUES
(7,  2, '5788895@alcaldia.gob',  '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'adolfo.briceno',       'Adolfo Antonio Briceño Perdomo', TRUE),
(8,  2, '10153055@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'ricardo.ramirez',      'Ricardo Marino Ramirez Delgado', TRUE),
(9,  2, '12633574@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'franklin.contreras',   'Franklin Contreras Soler', TRUE),
(10, 2, '12831684@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'jose.becerra',         'Jose Antonio Becerra Ramirez', TRUE),
(11, 2, '16124918@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'gretha.silva',         'Gretha Ladyner Silva Gonzalez', TRUE),
(12, 2, '26407378@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'joneiker.rodriguez',   'Joneiker Yorjan Rodriguez Nieto', TRUE),
(13, 2, '29507089@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'eudimarys.rincon',    'Eudimarys Sarahi Rincon Lopez', TRUE),
(14, 2, '28396685@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'juan.rodriguez',       'Juan Pablo Rodriguez Peña', TRUE),
(15, 2, '24154366@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'alberto.labrador',     'Alberto Jose Labrador Diaz', TRUE),
(16, 2, '9240710@alcaldia.gob',  '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'laura.vivas',          'Laura Marisol Vivas Marquez', TRUE),
(17, 2, '26981003@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'jean.gonzalez',        'Jean Carlos Gonzalez Sanchez', TRUE),
(18, 2, '10159008@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'yonny.leal',           'Yonny Escarlop Leal Malagon', TRUE),
(19, 2, '26205611@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'maria.ramirez',        'Maria Veronica Ramirez Guerrero', TRUE),
(20, 2, '9241474@alcaldia.gob',  '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'jorge.prada',          'Jorge Antonio Prada Montoya', TRUE),
(21, 2, '30617055@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'angel.carrero',        'Angel Raul Carrero Correa', TRUE),
(22, 2, '31098545@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'rafael.mora',          'Rafael Alejandro Mora Mora', TRUE),
(23, 2, '31180431@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'angela.maldonado',     'Angela De Dios Maldonado Mendoza', TRUE),
(24, 2, '10743549@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'marta.duque',          'Marta Zenaida Duque Ramirez', TRUE),
(25, 2, '30921139@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'saul.rivera',          'Saul Andre Rivera Contreras', TRUE),
(26, 2, '24693215@alcaldia.gob', '$2y$10$QKUBXW8Cq9d4SsnRbLUU0esniY1v4dqW0rw.IkapTEzOLCaGry7Sa', 'raisa.melendez',       'Raisa Marilin Melendez Joya', TRUE);

-- ==========================================
-- 2. TÉCNICOS (con bloque de almuerzo)
-- IDs continúan desde datos_insercion.sql (Carlos Diaz=1, Amna Verez=2)
-- Lunch_Blocks: 1=Primer turno(11:30-12:10), 2=Segundo turno(12:10-12:50),
--               3=Tercer Turno(12:50-13:30), 4=Cuarto Turno(13:30-14:00)
-- ==========================================
INSERT INTO Technicians (ID_Technicians, Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status) VALUES
(3,  7,  'Adolfo',    'Briceño Perdomo',   4,  'Activo'),
(4,  8,  'Ricardo',   'Ramirez Delgado',    2,  'Activo'),
(5,  9,  'Franklin',  'Contreras Soler',    2,  'Activo'),
(6,  10, 'Jose',      'Becerra Ramirez',    NULL, 'Activo'),
(7,  11, 'Gretha',    'Silva Gonzalez',     NULL, 'Activo'),
(8,  12, 'Joneiker',  'Rodriguez Nieto',    1,  'Activo'),
(9,  13, 'Eudimarys', 'Rincon Lopez',       3,  'Activo'),
(10, 14, 'Juan',      'Rodriguez Peña',     1,  'Activo'),
(11, 15, 'Alberto',   'Labrador Diaz',      2,  'Activo'),
(12, 16, 'Laura',     'Vivas Marquez',      1,  'Activo'),
(13, 17, 'Jean',      'Gonzalez Sanchez',   4,  'Activo'),
(14, 18, 'Yonny',     'Leal Malagon',       NULL, 'Activo'),
(15, 19, 'Maria',     'Ramirez Guerrero',   NULL, 'Activo'),
(16, 20, 'Jorge',     'Prada Montoya',      NULL, 'Activo'),
(17, 21, 'Angel',     'Carrero Correa',     2,  'Activo'),
(18, 22, 'Rafael',    'Mora Mora',          1,  'Activo'),
(19, 23, 'Angela',    'Maldonado Mendoza',  NULL, 'Activo'),
(20, 24, 'Marta',     'Duque Ramirez',      NULL, 'Activo'),
(21, 25, 'Saul',      'Rivera Contreras',   2,  'Activo'),
(22, 26, 'Raisa',     'Melendez Joya',      1,  'Activo');

-- ==========================================
-- 3. HORARIOS DE TÉCNICOS
-- ==========================================

-- Adolfo Briceño (Tech 3): L-V 08:00-16:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(3, 'Lunes',    '08:00:00', '16:00:00'),
(3, 'Martes',   '08:00:00', '16:00:00'),
(3, 'Miercoles','08:00:00', '16:00:00'),
(3, 'Jueves',   '08:00:00', '16:00:00'),
(3, 'Viernes',  '08:00:00', '16:00:00');

-- Ricardo Ramirez (Tech 4): L-V 08:00-16:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(4, 'Lunes',    '08:00:00', '16:00:00'),
(4, 'Martes',   '08:00:00', '16:00:00'),
(4, 'Miercoles','08:00:00', '16:00:00'),
(4, 'Jueves',   '08:00:00', '16:00:00'),
(4, 'Viernes',  '08:00:00', '16:00:00');

-- Franklin Contreras (Tech 5): L-V 08:00-14:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(5, 'Lunes',    '08:00:00', '14:00:00'),
(5, 'Martes',   '08:00:00', '14:00:00'),
(5, 'Miercoles','08:00:00', '14:00:00'),
(5, 'Jueves',   '08:00:00', '14:00:00'),
(5, 'Viernes',  '08:00:00', '14:00:00');

-- Jose Becerra (Tech 6): L-V 08:00-13:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(6, 'Lunes',    '08:00:00', '13:00:00'),
(6, 'Martes',   '08:00:00', '13:00:00'),
(6, 'Miercoles','08:00:00', '13:00:00'),
(6, 'Jueves',   '08:00:00', '13:00:00'),
(6, 'Viernes',  '08:00:00', '13:00:00');

-- Gretha Silva (Tech 7): Sin horario

-- Joneiker Rodriguez (Tech 8): L-V 08:00-14:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(8, 'Lunes',    '08:00:00', '14:00:00'),
(8, 'Martes',   '08:00:00', '14:00:00'),
(8, 'Miercoles','08:00:00', '14:00:00'),
(8, 'Jueves',   '08:00:00', '14:00:00'),
(8, 'Viernes',  '08:00:00', '14:00:00');

-- Eudimarys Rincon (Tech 9): L 08-17, M 08-15, W 10-17, J 10-17, V 08-15
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(9, 'Lunes',    '08:00:00', '17:00:00'),
(9, 'Martes',   '08:00:00', '15:00:00'),
(9, 'Miercoles','10:00:00', '17:00:00'),
(9, 'Jueves',   '10:00:00', '17:00:00'),
(9, 'Viernes',  '08:00:00', '15:00:00');

-- Juan Rodriguez (Tech 10): L 08-16, M 08-14, W 08-14, J 08-14, V 08-16
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(10, 'Lunes',   '08:00:00', '16:00:00'),
(10, 'Martes',  '08:00:00', '14:00:00'),
(10, 'Miercoles','08:00:00', '14:00:00'),
(10, 'Jueves',  '08:00:00', '14:00:00'),
(10, 'Viernes', '08:00:00', '16:00:00');

-- Alberto Labrador (Tech 11): L 08-14, M 08-17, W 08-14, J 08-17, V 08-17
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(11, 'Lunes',   '08:00:00', '14:00:00'),
(11, 'Martes',  '08:00:00', '17:00:00'),
(11, 'Miercoles','08:00:00', '14:00:00'),
(11, 'Jueves',  '08:00:00', '17:00:00'),
(11, 'Viernes', '08:00:00', '17:00:00');

-- Laura Vivas (Tech 12): L-V 08:00-14:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(12, 'Lunes',   '08:00:00', '14:00:00'),
(12, 'Martes',  '08:00:00', '14:00:00'),
(12, 'Miercoles','08:00:00', '14:00:00'),
(12, 'Jueves',  '08:00:00', '14:00:00'),
(12, 'Viernes', '08:00:00', '14:00:00');

-- Jean Gonzalez (Tech 13): L 08-14, M 08-16, W 08-14, J 08-16, V 08-14
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(13, 'Lunes',   '08:00:00', '14:00:00'),
(13, 'Martes',  '08:00:00', '16:00:00'),
(13, 'Miercoles','08:00:00', '14:00:00'),
(13, 'Jueves',  '08:00:00', '16:00:00'),
(13, 'Viernes', '08:00:00', '14:00:00');

-- Yonny Leal (Tech 14): L 08-17, M 08-14, W 08-17, J 08-14, V 08-17
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(14, 'Lunes',   '08:00:00', '17:00:00'),
(14, 'Martes',  '08:00:00', '14:00:00'),
(14, 'Miercoles','08:00:00', '17:00:00'),
(14, 'Jueves',  '08:00:00', '14:00:00'),
(14, 'Viernes', '08:00:00', '17:00:00');

-- Maria Ramirez (Tech 15): Sin horario

-- Jorge Prada (Tech 16): Sin horario

-- Angel Carrero (Tech 17): L-V 08:00-14:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(17, 'Lunes',   '08:00:00', '14:00:00'),
(17, 'Martes',  '08:00:00', '14:00:00'),
(17, 'Miercoles','08:00:00', '14:00:00'),
(17, 'Jueves',  '08:00:00', '14:00:00'),
(17, 'Viernes', '08:00:00', '14:00:00');

-- Rafael Mora (Tech 18): L-V 08:00-14:00
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(18, 'Lunes',   '08:00:00', '14:00:00'),
(18, 'Martes',  '08:00:00', '14:00:00'),
(18, 'Miercoles','08:00:00', '14:00:00'),
(18, 'Jueves',  '08:00:00', '14:00:00'),
(18, 'Viernes', '08:00:00', '14:00:00');

-- Angela Maldonado (Tech 19): Sin horario

-- Marta Duque (Tech 20): Sin horario

-- Saul Rivera (Tech 21): L 08-14, M 08-16, W 08-16, J 08-14, V 08-14
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(21, 'Lunes',   '08:00:00', '14:00:00'),
(21, 'Martes',  '08:00:00', '16:00:00'),
(21, 'Miercoles','08:00:00', '16:00:00'),
(21, 'Jueves',  '08:00:00', '14:00:00'),
(21, 'Viernes', '08:00:00', '14:00:00');

-- Raisa Melendez (Tech 22): L 08-17, M 08-18, W 08-15, J 08-15, V 08-22
INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(22, 'Lunes',   '08:00:00', '17:00:00'),
(22, 'Martes',  '08:00:00', '18:00:00'),
(22, 'Miercoles','08:00:00', '15:00:00'),
(22, 'Jueves',  '08:00:00', '15:00:00'),
(22, 'Viernes', '08:00:00', '22:00:00');

-- ==========================================
-- 4. RELACIÓN TÉCNICOS-SERVICIOS
-- Mantenimiento → Soporte (ID 2)
-- Redes → Redes (ID 1)
-- Programación → Programación (ID 3)
-- Administrativa → Soporte (ID 2)
-- ==========================================
INSERT INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status) VALUES
(2, 3,  'Activo'),  -- Adolfo Briceño - Mantenimiento → Soporte
(2, 4,  'Activo'),  -- Ricardo Ramirez - Mantenimiento → Soporte
(2, 5,  'Activo'),  -- Franklin Contreras - Mantenimiento → Soporte
(2, 6,  'Activo'),  -- Jose Becerra - Mantenimiento → Soporte
(2, 7,  'Activo'),  -- Gretha Silva - Mantenimiento → Soporte
(2, 8,  'Activo'),  -- Joneiker Rodriguez - Mantenimiento → Soporte
(3, 9,  'Activo'),  -- Eudimarys Rincon - Programación → Programación
(1, 10, 'Activo'),  -- Juan Rodriguez - Redes → Redes
(1, 11, 'Activo'),  -- Alberto Labrador - Redes → Redes
(2, 12, 'Activo'),  -- Laura Vivas - Mantenimiento → Soporte
(1, 13, 'Activo'),  -- Jean Gonzalez - Redes → Redes
(2, 14, 'Activo'),  -- Yonny Leal - Mantenimiento → Soporte
(2, 17, 'Activo'),  -- Angel Carrero - Administrativa → Soporte
(2, 18, 'Activo'),  -- Rafael Mora - Mantenimiento → Soporte
(1, 21, 'Activo'),  -- Saul Rivera - Redes → Redes
(3, 22, 'Activo');  -- Raisa Melendez - Programación → Programación
