<?php
/**
 * PHP-PRO: Verificar todas las tablas para encontrar el catálogo de problemas
 */

declare(strict_types=1);

echo "🔍 PHP-PRO: Verificando todas las tablas\n";
echo "========================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ Conexión a BD establecida\n\n";
        
        // Listar todas las tablas
        $stmt = $conn->query("SHOW TABLES");
        $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "📋 Todas las tablas disponibles:\n";
        echo "========================================\n";
        foreach ($tablas as $tabla) {
            echo "   - $tabla\n";
        }
        
        // Buscar tablas que puedan contener problemas
        echo "\n🔍 Buscando tablas relacionadas con problemas:\n";
        echo "========================================\n";
        foreach ($tablas as $tabla) {
            $lower = strtolower($tabla);
            if (str_contains($lower, 'problem') || str_contains($lower, 'catalog') || str_contains($lower, 'tipo')) {
                echo "   ⭐ $tabla\n";
                
                // Mostrar estructura
                $columns = $conn->query("DESCRIBE $tabla")->fetchAll(PDO::FETCH_ASSOC);
                echo "   Columnas: ";
                foreach ($columns as $col) {
                    echo $col['Field'] . " ";
                }
                echo "\n";
                
                // Mostrar algunos datos
                $data = $conn->query("SELECT * FROM $tabla LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
                if (count($data) > 0) {
                    echo "   Datos de ejemplo:\n";
                    foreach ($data as $row) {
                        echo "   " . json_encode($row, JSON_UNESCAPED_UNICODE) . "\n";
                    }
                }
                echo "\n";
            }
        }
        
        // Verificar estructura de Service_Request más detalladamente
        echo "\n📋 Estructura detallada de Service_Request:\n";
        echo "========================================\n";
        $columns = $conn->query("DESCRIBE Service_Request")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo "   {$col['Field']}: {$col['Type']} ({$col['Null']}, {$col['Key']})\n";
        }
        
        // Verificar datos de Fk_Problem_Catalog
        echo "\n📋 Datos de Fk_Problem_Catalog en Service_Request:\n";
        echo "========================================\n";
        $query = "SELECT Fk_Problem_Catalog, COUNT(*) as count 
                  FROM Service_Request 
                  WHERE Fk_Problem_Catalog IS NOT NULL 
                  GROUP BY Fk_Problem_Catalog 
                  ORDER BY count DESC";
        $result = $conn->query($query);
        $data = $result->fetchAll(PDO::FETCH_ASSOC);
        foreach ($data as $row) {
            echo "   ID: {$row['Fk_Problem_Catalog']}, Tickets: {$row['count']}\n";
        }
        
    } else {
        echo "❌ Error: No se pudo conectar a la BD\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n🎯 VERIFICACIÓN COMPLETADA\n";
?>
