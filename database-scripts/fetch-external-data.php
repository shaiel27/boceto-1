<?php
/**
 * Archivo para traer datos de base de datos externa
 * Sin estilos, solo funcionalidad para obtener datos
 */

// Configuración de conexión a base de datos externa
$db_config = [
    'host' => '192.168.5.84',
    'port' => '5432', // Cambiar según el tipo de DB (MySQL: 3306, PostgreSQL: 5432)
    'dbname' => 'alcaldia_2026',
    'user' => 'postgres', // Usuario de la base de datos
    'password' => 'contrios', // Contraseña de la base de datos
    'charset' => 'utf8'
];

// Tipo de base de datos: 'mysql' o 'postgresql'
$db_type = 'postgresql'; // Cambiar a 'mysql' si es MySQL

try {
    if ($db_type === 'mysql') {
        // Conexión MySQL
        $dsn = "mysql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['dbname']};charset={$db_config['charset']}";
        $pdo = new PDO($dsn, $db_config['user'], $db_config['password']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } elseif ($db_type === 'postgresql') {
        // Conexión PostgreSQL
        $dsn = "pgsql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['dbname']}";
        $pdo = new PDO($dsn, $db_config['user'], $db_config['password']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } else {
        throw new Exception("Tipo de base de datos no soportado: $db_type");
    }

    echo "✅ Conexión exitosa a la base de datos\n\n";

    // Ejemplo: Traer datos de public.safactivo
    $query = "SELECT * FROM saf_activo LIMIT 10";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "=== Datos obtenidos ===\n";
    echo "Total registros: " . count($results) . "\n\n";
    
    if (!empty($results)) {
        // Mostrar encabezados
        echo "Campos: " . implode(', ', array_keys($results[0])) . "\n\n";
        
        // Mostrar datos
        foreach ($results as $row) {
            echo "Registro:\n";
            foreach ($row as $key => $value) {
                echo "  $key: $value\n";
            }
            echo "\n";
        }
    } else {
        echo "No se encontraron datos\n";
    }

} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

// Función para ejecutar consultas personalizadas
function executeQuery($pdo, $query, $params = []) {
    try {
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        echo "Error en consulta: " . $e->getMessage() . "\n";
        return false;
    }
}

// Ejemplo de uso:
// $data = executeQuery($pdo, "SELECT * FROM tabla WHERE campo = :valor", ['valor' => 'dato']);
    // C:\xampp\php\php.exe c:\Users\Shaiel\Desktop\shaiel\boceto-1\database-scripts\fetch-external-data.php
?>
