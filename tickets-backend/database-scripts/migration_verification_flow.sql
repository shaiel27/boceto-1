-- Migration: Add verification flow support
-- Branch: feature/ticket-verification-flow
-- Date: Junio 2026

ALTER TABLE Service_Request
    ADD COLUMN is_returned TINYINT(1) DEFAULT 0 COMMENT 'Marca tickets devueltos por inconformidad (tablero purpura)'
    AFTER Status;
