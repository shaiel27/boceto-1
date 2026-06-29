-- =====================================================
-- Fix: Prevent duplicate technician assignments
-- Adds unique constraint on Ticket_Technicians
-- so the same tech cannot be assigned twice to the same ticket
-- =====================================================

USE tickets_system;

-- Remove any existing duplicate active assignments first
DELETE t1 FROM Ticket_Technicians t1
INNER JOIN Ticket_Technicians t2 
WHERE t1.Fk_Service_Request = t2.Fk_Service_Request 
  AND t1.Fk_Technician = t2.Fk_Technician 
  AND t1.Status = 'Activo' 
  AND t2.Status = 'Activo' 
  AND t1.ID_Ticket_Technician > t2.ID_Ticket_Technician;

-- Add unique constraint to prevent duplicates
ALTER TABLE Ticket_Technicians 
ADD UNIQUE INDEX uq_ticket_technician (Fk_Service_Request, Fk_Technician);
