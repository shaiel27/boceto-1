<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/src/config/database.php';

if (!extension_loaded('pdo_mysql')) {
    fwrite(STDERR, "FAIL: pdo_mysql no cargado. php.ini: " . (php_ini_loaded_file() ?: 'ninguno') . PHP_EOL);
    exit(1);
}

try {
    $db = new Database();
    $db->getConnection();
    echo 'OK: PDO MySQL y conexión a la base configurada.' . PHP_EOL;
} catch (Throwable $e) {
    fwrite(STDERR, 'FAIL: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}
