<?php
/**
 * PHP-PRO: Verificar estructura de catálogo de problemas
 * Para diseñar el reporte de problemas más frecuentes por servicio
 */

declare(strict_types=1);

echo "🔍 PHP-PRO: Verificando estructura de catálogo de problemas\n";
echo "========================================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ Conexión a BD establecida\n\n";
        
        // Verificar tablas relacionadas con problemas
        $tablas = [
            'TI_Service' => 'Catálogo de servicios',
            'TI_Problems' => 'Catálogo de problemas',
            'Service_Request' => 'Tickets/Service Requests',
            'TI_Problem_Categories' => 'Categorías de problemas'
        ];
        
        foreach ($tablas as $tabla => $descripcion) {
            $stmt = $conn->query("SHOW TABLES LIKE '$tabla'");
            if ($stmt->rowCount() > 0) {
                echo "✅ Tabla '$tabla' ($descripcion) existe\n";
                
                // Mostrar estructura de la tabla
                $columns = $conn->query("DESCRIBE $tabla")->fetchAll(PDO::FETCH_ASSOC);
                echo "   Columnas: ";
                foreach ($columns as $col) {
                    echo $col['Field'] . " ";
                }
                echo "\n";
                
                // Contar registros
                $countStmt = $conn->query("SELECT COUNT(*) as count FROM $tabla");
                $count = $countStmt->fetch(PDO::FETCH_ASSOC);
                echo "   Registros: {$count['count']}\n\n";
            } else {
                echo "❌ Tabla '$tabla' NO existe\n\n";
            }
        }
        
        // Verificar datos de servicios
        echo "📋 Servicios disponibles:\n";
        echo "========================\n";
        $services = $conn->query("SELECT * FROM TI_Service LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($services as $service) {
            echo "   ID: {$service['ID_Service']}, Nombre: {$service['Name_Service']}\n";
        }
        
        // Verificar datos de problemas
        echo "\n📋 Problemas disponibles:\n";
        echo "========================\n";
        $problems = $conn->query("SELECT * FROM TI_Problems LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($problems as $problem) {
            echo "   ID: {$problem['ID_Problem']}, Nombre: {$problem['Problem_Description']}\n";
            if (isset($problem['Fk_Service'])) {
                echo "   Servicio ID: {$problem['Fk_Service']}\n";
            }
            echo "\n";
        }
        
        // Verificar relación entre tickets y problemas
        echo "\n📋 Relación Tickets-Problemas:\n";
        echo "========================\n";
        $stmt = $conn->query("DESCRIBE Service_Request");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Columnas de Service_Request:\n";
        foreach ($columns as $col) {
            echo "   {$col['Field']} ({$col['Type']})\n";
            if (str_contains(strtolower($col['Field']), 'problem') || str_contains(strtolower($col['Field']), 'service')) {
                echo "   ⭐ Campo relevante para el reporte\n";
            }
        }
        
        // Consulta de prueba para ver distribución de problemas por servicio
        echo "\n📊 Distribución de problemas por servicio (consulta prueba):\n";
        echo "========================================================\n";
        
        try {
            $query = "SELECT 
                     ts.Name_Service as service_name,
                     tp.Problem_Description as problem_description,
                     COUNT(sr.ID_Service_Request) as ticket_count
                     FROM TI_Service ts
                     LEFT JOIN TI_Problems tp ON ts.ID_Service = tp.Fk_Service
                     LEFT JOIN Service_Request sr ON tp.ID_Problem = sr.Fk_Problem
                     WHERE sr.ID_Service_Request IS NOT NULL
                     GROUP BY ts.ID_Service, ts.Name_Service, tp.ID_Problem, tp.Problem_Description
                     ORDER BY ts.Name_Service, ticket_count DESC
                     LIMIT 20";
            
            $result = $conn->query($query);
            $data = $result->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($data) > 0) {
                foreach ($data as $row) {
                    echo "   {$row['service_name']}: {$row['problem_description']} ({$row['ticket_count']} tickets)\n";
                }
            } else {
                echo "   No se encontraron datos con esta consulta\n";
            }
        } catch (PDOException $e) {
            echo "   Error en consulta de prueba: " . $e->getMessage() . "\n";
        }
        
    } else {
        echo "❌ Error: No se pudo conectar a la BD\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n🎯 VERIFICACIÓN COMPLETADA\n";
?>
