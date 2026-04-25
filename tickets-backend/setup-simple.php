<?php

// Script simple para probar el backend sin Composer
// Este script carga las clases manualmente y configura el entorno

// Cargar variables de entorno manualmente (simulando .env)
$_ENV['DB_HOST'] = 'localhost';
$_ENV['DB_NAME'] = 'tickets_system';
$_ENV['DB_USER'] = 'root';
$_ENV['DB_PASS'] = 'NuevaClave123';
$_ENV['DB_CHARSET'] = 'utf8mb4';
$_ENV['JWT_SECRET'] = 'test-secret-key-for-development';
$_ENV['JWT_EXPIRES_IN'] = '86400';
$_ENV['DISPLAY_ERRORS'] = '1';
$_ENV['TIMEZONE'] = 'America/Mexico_City';

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', '1');
date_default_timezone_set($_ENV['TIMEZONE']);

// Autoloader manual simple
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Crear tablas necesarias si no existen
try {
    $db = new PDO(
        "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset={$_ENV['DB_CHARSET']}",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    // Crear tabla rate_limits
    $db->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            request_time INT NOT NULL,
            INDEX idx_identifier_time (identifier, request_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Crear tabla notifications
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
            INDEX idx_user_read (user_id, read_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Crear tabla audit_logs
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
            INDEX idx_user_action (user_id, action)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    echo "Tablas de servicio creadas exitosamente\n";

} catch (Exception $e) {
    echo "Error al crear tablas: " . $e->getMessage() . "\n";
}

echo "Setup completado. Ahora puedes ejecutar:\n";
echo "php -S localhost:8000 -t public\n";
?>
