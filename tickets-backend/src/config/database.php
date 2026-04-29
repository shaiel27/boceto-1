<?php
declare(strict_types=1);

/**
 * Database Configuration
 * Sets up PDO connection with Venezuela timezone (UTC-4)
 */
final class Database
{
    private string $host = 'localhost';
    private string $port = '3306';
    private string $db_name = 'tickets_system';
    private string $username = 'root';
    private string $password = 'NuevaClave123';
    private ?PDO $conn = null;

    public function __construct()
    {
        // Set Venezuela timezone (UTC-4) for all date/time operations
        date_default_timezone_set('America/Caracas');
    }

    public function getConnection(): PDO
    {
        if ($this->conn === null) {
            try {
                $dsn = sprintf(
                    "mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4",
                    $this->host,
                    $this->port,
                    $this->db_name
                );
                
                $this->conn = new PDO($dsn, $this->username, $this->password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
                
                error_log("Database connection established successfully");
            } catch(PDOException $exception) {
                error_log("Connection error: " . $exception->getMessage());
                throw new RuntimeException("Error de conexión a la base de datos: " . $exception->getMessage());
            }
        }

        return $this->conn;
    }
}
