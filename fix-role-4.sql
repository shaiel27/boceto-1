-- Fix: Add missing "Solicitante" role with ID 4
-- This fixes the foreign key constraint violation in UserRegistration

USE tickets_municipal;

-- Insert the Solicitante role with ID 4
INSERT INTO Role (ID_Role, Role, Description) VALUES
(4, 'Solicitante', 'Usuario que puede crear y solicitar tickets de soporte técnico');
