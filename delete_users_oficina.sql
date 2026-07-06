-- Eliminar todos los usuarios de oficina insertados
DELETE FROM Users WHERE Email LIKE '%@tickets.gob' AND Fk_Role = 3;
