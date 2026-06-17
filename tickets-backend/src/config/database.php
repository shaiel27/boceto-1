<?php
declare(strict_types=1);

/**
 * Database Configuration
 * Sets up PDO connection with Venezuela timezone (UTC-4).
 *
 * Production: define DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (Apache/nginx/php-fpm env).
 * Local XAMPP: ensure you run PHP with pdo_mysql (e.g. C:\xampp\php\php.exe), not a bare CLI build without extensions.
 */
final class Database
{
    private string $host;
    private string $port;
    private string $db_name;
    private string $username;
    private string $password;
    private ?PDO $conn = null;

    public function __construct()
    {
        date_default_timezone_set('America/Caracas');

        $this->host = self::env('DB_HOST', 'localhost');
        $this->port = self::env('DB_PORT', '3306');
        $this->db_name = self::env('DB_NAME', 'tickets_system');
        $this->username = self::env('DB_USER', 'root');
        $this->password = self::env('DB_PASSWORD', '');
    }

    private static function env(string $key, string $default): string
    {
        $value = getenv($key);
        if ($value === false || $value === '') {
            return $default;
        }
        return $value;
    }

    public function getConnection(): PDO
    {
        if ($this->conn === null) {
            if (!extension_loaded('pdo_mysql')) {
                $ini = php_ini_loaded_file() ?: '(ningún php.ini cargado)';
                throw new RuntimeException(
                    'Error de conexión a la base de datos: falta el driver PDO MySQL (pdo_mysql). '
                    . 'En Windows suele ocurrir si `php` en el PATH no es el de XAMPP (p. ej. C:\\php\\php.exe sin extensiones). '
                    . 'Solución: ejecuta el backend con C:\\xampp\\php\\php.exe o habilita extension=pdo_mysql en php.ini. '
                    . 'php.ini activo: ' . $ini
                );
            }

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

                $phpTz = date_default_timezone_get();
                $offset = (new DateTimeImmutable('now', new DateTimeZone($phpTz)))->format('P');
                $this->conn->exec("SET time_zone = '{$offset}'");

                error_log("Database connection established successfully (tz={$offset})");
            } catch (PDOException $exception) {
                error_log("Connection error: " . $exception->getMessage());
                throw new RuntimeException("Error de conexión a la base de datos: " . $exception->getMessage());
            }
        }

        return $this->conn;
    }
}
