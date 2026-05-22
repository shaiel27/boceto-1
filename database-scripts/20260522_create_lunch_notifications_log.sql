-- Migration: create Lunch_Notifications_Log
-- Date: 2026-05-22
CREATE TABLE IF NOT EXISTS Lunch_Notifications_Log (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Fk_Lunch_Block INT NOT NULL,
  Notification_Date DATE NOT NULL,
  Notification_Type ENUM('start','end') NOT NULL DEFAULT 'start',
  Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_daily_type (Fk_Lunch_Block, Notification_Date, Notification_Type),
  INDEX idx_block_date (Fk_Lunch_Block, Notification_Date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: create event to purge old rows (requires EVENT SCHEDULER enabled)
-- CREATE EVENT IF NOT EXISTS ev_purge_lunch_notifications
-- ON SCHEDULE EVERY 1 DAY
-- DO
--   DELETE FROM Lunch_Notifications_Log WHERE Notification_Date < CURDATE() - INTERVAL 15 DAY;
