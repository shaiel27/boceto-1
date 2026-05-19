-- Actualizar contraseñas de todos los usuarios con hash bcrypt
-- Contraseña: password123

USE tickets_system;

-- Actualizar todos los usuarios con el hash bcrypt de 'password123'
UPDATE Users SET Password = '$2y$10$lsFr9WDLwHDyGMT.PaTTq.DZYNySp6T1/JjnMOkhl/2t72OQd3Cwa' WHERE 1=1;

-- Verificar la actualización
SELECT ID_Users, Email, SUBSTRING(Password, 1, 20) as Password_Hash_Prefix, Full_Name 
FROM Users;
