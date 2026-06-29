-- =====================================================
-- Inserción de 15 técnicos (5 por servicio)
--   - Redes (ID 1): 5 técnicos
--   - Soporte (ID 2): 5 técnicos
--   - Programación (ID 3): 5 técnicos
--   - Contraseña por defecto: 123456
--   - Horario: Lunes a Viernes, 8:00 AM - 2:00 PM
--   - Bloque de almuerzo: 12:00 PM - 12:30 PM
-- =====================================================

USE tickets_system;

-- 1. Bloque de almuerzo
INSERT IGNORE INTO Lunch_Blocks (Block_Name, Start_Time, End_Time)
VALUES ('Bloque Almuerzo', '12:00:00', '12:30:00');

SET @lunch_id = (SELECT ID_Lunch_Block FROM Lunch_Blocks WHERE Block_Name = 'Bloque Almuerzo');

-- 2. Técnicos de Redes (Fk_TI_Service = 1)
-- 2.1 Luis Martínez
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'luis.martinez@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'luis_martinez', 'Luis Martínez', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Luis', 'Martínez', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (1, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 2.2 Ana Rodríguez
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'ana.rodriguez@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'ana_rodriguez', 'Ana Rodríguez', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Ana', 'Rodríguez', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (1, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 2.3 Pedro Sánchez
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'pedro.sanchez@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'pedro_sanchez', 'Pedro Sánchez', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Pedro', 'Sánchez', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (1, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 2.4 Carmen López
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'carmen.lopez@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'carmen_lopez', 'Carmen López', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Carmen', 'López', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (1, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 2.5 José Ramírez
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'jose.ramirez@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'jose_ramirez', 'José Ramírez', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'José', 'Ramírez', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (1, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 3. Técnicos de Soporte (Fk_TI_Service = 2)
-- 3.1 Rosa García
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'rosa.garcia@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'rosa_garcia', 'Rosa García', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Rosa', 'García', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (2, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 3.2 Manuel Torres
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'manuel.torres@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'manuel_torres', 'Manuel Torres', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Manuel', 'Torres', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (2, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 3.3 Elena Flores
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'elena.flores@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'elena_flores', 'Elena Flores', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Elena', 'Flores', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (2, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 3.4 Andrés Vargas
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'andres.vargas@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'andres_vargas', 'Andrés Vargas', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Andrés', 'Vargas', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (2, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 3.5 Patricia Rojas
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'patricia.rojas@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'patricia_rojas', 'Patricia Rojas', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Patricia', 'Rojas', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (2, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 4. Técnicos de Programación (Fk_TI_Service = 3)
-- 4.1 Daniel Castillo
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'daniel.castillo@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'daniel_castillo', 'Daniel Castillo', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Daniel', 'Castillo', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (3, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 4.2 Gabriela Herrera
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'gabriela.herrera@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'gabriela_herrera', 'Gabriela Herrera', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Gabriela', 'Herrera', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (3, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 4.3 Fernando Ortiz
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'fernando.ortiz@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'fernando_ortiz', 'Fernando Ortiz', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Fernando', 'Ortiz', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (3, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 4.4 Andrea Medina
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'andrea.medina@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'andrea_medina', 'Andrea Medina', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Andrea', 'Medina', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (3, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');

-- 4.5 Ricardo Peña
INSERT IGNORE INTO Users (Fk_Role, Email, Password, Username, Full_Name, is_system_user)
VALUES (2, 'ricardo.pena@alcaldia.gob', '$2y$10$sCuxE38rBE803VTEnSFvU.eb3gFKi29vnUu4V5ck95WuKQFkwrsHm', 'ricardo_pena', 'Ricardo Peña', TRUE);
SET @user_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status)
VALUES (@user_id, 'Ricardo', 'Peña', @lunch_id, 'Disponible');
SET @tech_id = LAST_INSERT_ID();
INSERT IGNORE INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status)
VALUES (3, @tech_id, 'Activo');
INSERT IGNORE INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) VALUES
(@tech_id, 'Lunes', '08:00:00', '14:00:00'),
(@tech_id, 'Martes', '08:00:00', '14:00:00'),
(@tech_id, 'Miércoles', '08:00:00', '14:00:00'),
(@tech_id, 'Jueves', '08:00:00', '14:00:00'),
(@tech_id, 'Viernes', '08:00:00', '14:00:00');
