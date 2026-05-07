<?php
// PRUEBA DIRECTA DEL BACKEND - ENDPOINT OFFICE
echo "🔍 PRUEBA DIRECTA DEL BACKEND - ENDPOINT OFFICE\n";
echo "===============================================\n";

try {
    // Incluir archivos necesarios
    require_once __DIR__ . '/tickets-backend/src/config/database.php';
    require_once __DIR__ . '/tickets-backend/src/models/Office.php';
    require_once __DIR__ . '/tickets-backend/src/controllers/OfficeController.php';
    
    echo "✅ Archivos incluidos correctamente\n\n";
    
    // Probar conexión a la base de datos
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ Conexión a BD establecida\n";
        
        // Probar el modelo Office directamente
        echo "\n📊 Probando modelo Office::getTicketsByOffice()\n";
        $office = new Office($conn);
        $officeData = $office->getTicketsByOffice();
        
        echo "📋 Resultados del modelo:\n";
        if (is_array($officeData) && count($officeData) > 0) {
            echo "✅ Modelo devuelve " . count($officeData) . " oficinas\n";
            foreach ($officeData as $index => $office) {
                echo "   " . ($index + 1) . ". {$office['name']}: {$office['resolved_count']} tickets\n";
            }
        } else {
            echo "❌ Modelo no devuelve datos o devuelve array vacío\n";
            echo "📄 Tipo de dato: " . gettype($officeData) . "\n";
            if (is_array($officeData)) {
                echo "📊 Count: " . count($officeData) . "\n";
            }
        }
        
        // Probar el controller
        echo "\n🎯 Probando OfficeController\n";
        
        // Simular variables del servidor
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET['action'] = 'distribution';
        
        // Capturar salida del controller
        ob_start();
        $controller = new OfficeController();
        $controller->handleRequest();
        $output = ob_get_clean();
        
        echo "📤 Salida del controller:\n";
        echo "$output\n";
        
        // Analizar respuesta
        if (!empty($output)) {
            $data = json_decode($output, true);
            if ($data) {
                echo "✅ Controller devuelve JSON válido\n";
                echo "📊 Success: " . ($data['success'] ? 'true' : 'false') . "\n";
                echo "📝 Message: " . ($data['message'] ?? 'No message') . "\n";
                
                if (isset($data['data']) && is_array($data['data'])) {
                    echo "📊 Data count: " . count($data['data']) . " elementos\n";
                } else {
                    echo "❌ No hay data en la respuesta del controller\n";
                }
            } else {
                echo "❌ Controller no devuelve JSON válido\n";
                echo "📄 Raw output: $output\n";
            }
        } else {
            echo "❌ Controller no devuelve ninguna salida\n";
        }
        
    } else {
        echo "❌ Error: No se pudo conectar a la BD\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n";
    echo "📄 Stack trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "❌ Error fatal: " . $e->getMessage() . "\n";
    echo "📄 Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n🎯 DIAGNÓSTICO COMPLETADO\n";
echo "===============================================\n";
?>
