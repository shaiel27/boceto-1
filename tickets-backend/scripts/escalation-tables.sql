-- Escalation and Alert Tables for Ticket Assignment System
-- Generated for improved ticket assignment logic

-- Table to track ticket escalations (when technician is assigned from different service)
CREATE TABLE IF NOT EXISTS Ticket_Escalations (
    ID_Escalation INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Original_Service_ID INT NOT NULL,
    Escalated_Service_ID INT NOT NULL,
    Escalated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fk_service_request (Fk_Service_Request),
    INDEX idx_escalated_at (Escalated_At)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to track pending ticket alerts (tickets that couldn't be assigned)
CREATE TABLE IF NOT EXISTS Pending_Ticket_Alerts (
    ID_Alert INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Service_Request INT NOT NULL,
    Alert_Type VARCHAR(50) NOT NULL COMMENT 'auto_assignment_failed, manual_review_needed, escalation_needed',
    Notified_At TIMESTAMP NULL,
    Resolved_At TIMESTAMP NULL,
    Resolution_Notes VARCHAR(500) NULL,
    INDEX idx_fk_service_request (Fk_Service_Request),
    INDEX idx_alert_type (Alert_Type),
    INDEX idx_resolved (Resolved_At)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store escalation thresholds configuration
CREATE TABLE IF NOT EXISTS Escalation_Config (
    ID_Config INT AUTO_INCREMENT PRIMARY KEY,
    Priority_Level VARCHAR(20) NOT NULL,
    Hours_Threshold INT NOT NULL DEFAULT 4,
    Notify_Admins BOOLEAN DEFAULT TRUE,
    Auto_Escalate BOOLEAN DEFAULT FALSE,
    INDEX idx_priority_level (Priority_Level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default escalation thresholds
INSERT INTO Escalation_Config (Priority_Level, Hours_Threshold, Notify_Admins, Auto_Escalate) VALUES
('Critica', 1, TRUE, TRUE),
('Alta', 4, TRUE, TRUE),
('Media', 12, TRUE, FALSE),
('Baja', 24, FALSE, FALSE)
ON DUPLICATE KEY UPDATE Hours_Threshold = VALUES(Hours_Threshold);

-- View to get pending tickets that need attention
CREATE OR REPLACE VIEW v_Pending_Tickets_Needing_Attention AS
SELECT 
    sr.ID_Service_Request,
    sr.Ticket_Code,
    sr.Subject,
    sr.System_Priority,
    sr.Created_at,
    TIMESTAMPDIFF(HOUR, sr.Created_at, NOW()) as Hours_Pending,
    ts.Type_Service as Service_Name,
    u.Full_Name as Requester_Name,
    o.Name_Office as Office_Name
FROM Service_Request sr
LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
LEFT JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
WHERE sr.Status = 'Pendiente'
ORDER BY 
    CASE sr.System_Priority
        WHEN 'Critica' THEN 1
        WHEN 'Alta' THEN 2
        WHEN 'Media' THEN 3
        WHEN 'Baja' THEN 4
        ELSE 3
    END,
    sr.Created_at ASC;

-- View to get escalation statistics
CREATE OR REPLACE VIEW v_Escalation_Stats AS
SELECT 
    DATE(te.Escalated_At) as Escalation_Date,
    COUNT(*) as Total_Escalations,
    COUNT(DISTINCT te.Fk_Service_Request) as Unique_Tickets_Escalated,
    te.Original_Service_ID,
    ts_orig.Type_Service as Original_Service_Name,
    te.Escalated_Service_ID,
    ts_esc.Type_Service as Escalated_Service_Name
FROM Ticket_Escalations te
LEFT JOIN TI_Service ts_orig ON te.Original_Service_ID = ts_orig.ID_TI_Service
LEFT JOIN TI_Service ts_esc ON te.Escalated_Service_ID = ts_esc.ID_TI_Service
GROUP BY DATE(te.Escalated_At), te.Original_Service_ID, te.Escalated_Service_ID
ORDER BY Escalation_Date DESC;