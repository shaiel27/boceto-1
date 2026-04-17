<?php

// This script creates the additional tables needed for the backend services
// It should be included in the main index.php to ensure tables exist

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    
    // Create rate_limits table
    $db->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            request_time INT NOT NULL,
            INDEX idx_identifier_time (identifier, request_time),
            INDEX idx_cleanup (request_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Create notifications table
    $db->exec("
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            data JSON NULL,
            read_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_read (user_id, read_at),
            INDEX idx_type (type),
            INDEX idx_created (created_at),
            FOREIGN KEY (user_id) REFERENCES Users(ID_Users) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Create audit_logs table
    $db->exec("
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            email VARCHAR(50) NULL,
            action VARCHAR(100) NOT NULL,
            data JSON NULL,
            success TINYINT(1) DEFAULT 1,
            ip_address VARCHAR(45) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_action (user_id, action),
            INDEX idx_email_action (email, action),
            INDEX idx_created (created_at),
            INDEX idx_cleanup (created_at),
            FOREIGN KEY (user_id) REFERENCES Users(ID_Users) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
} catch (Exception $e) {
    error_log("Error creating service tables: " . $e->getMessage());
}
