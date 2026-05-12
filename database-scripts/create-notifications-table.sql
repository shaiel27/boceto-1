-- Create Notifications table for storing user notifications
-- PHP-PRO: Strict typing and proper constraints
-- Integrado con tickets-backend/database.sql

CREATE TABLE IF NOT EXISTS Notifications (
    ID_Notification INT AUTO_INCREMENT PRIMARY KEY,
    Fk_User INT NOT NULL,
    Type VARCHAR(50) NOT NULL COMMENT 'Type of notification: ticket_assignment, ticket_created, etc.',
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    Fk_Service_Request INT NULL COMMENT 'Associated ticket ID if applicable',
    Is_Read TINYINT(1) DEFAULT 0 NOT NULL,
    Metadata JSON NULL COMMENT 'Additional notification data in JSON format',
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (Fk_User) REFERENCES Users(ID_Users) ON DELETE CASCADE,
    FOREIGN KEY (Fk_Service_Request) REFERENCES Service_Request(ID_Service_Request) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_user_notifications (Fk_User, Is_Read),
    INDEX idx_ticket_notifications (Fk_Service_Request),
    INDEX idx_type (Type),
    INDEX idx_created_at (Created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User notifications table';
