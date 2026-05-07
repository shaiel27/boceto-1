<?php
// DIAGNÓSTICO COMPLETO PHP-PRO - REPORTE POR OFICINA
echo "🔍 DIAGNÓSTICO COMPLETO PHP-PRO - REPORTE POR OFICINA\n";
echo "====================================================\n\n";

// PASO 1: Verificar estructura del backend
echo "📋 PASO 1: Verificando estructura del backend\n";
echo "================================================\n";

$backendFiles = [
    'src/config/database.php',
    'src/models/Office.php', 
    'src/controllers/OfficeController.php',
    'public/index.php'
];

foreach ($backendFiles as $file) {
    $fullPath = __DIR__ . '/tickets-backend/' . $file;
    if (file_exists($fullPath)) {
        echo "✅ $file - EXISTE\n";
    } else {
        echo "❌ $file - NO EXISTE\n";
    }
}

// PASO 2: Verificar conexión a la base de datos
echo "\n📋 PASO 2: Verificando conexión a la base de datos\n";
echo "================================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ Conexión a base de datos establecida\n";
        
        // Verificar tablas necesarias
        $tables = ['Office', 'Service_Request'];
        foreach ($tables as $table) {
            $result = $conn->query("SHOW TABLES LIKE '$table'");
            if ($result->rowCount() > 0) {
                echo "✅ Tabla '$table' existe\n";
                
                // Verificar estructura
                $columns = $conn->query("DESCRIBE $table");
                echo "   📄 Columnas en '$table':\n";
                while ($col = $columns->fetch(PDO::FETCH_ASSOC)) {
                    echo "     - {$col['Field']}: {$col['Type']}\n";
                }
            } else {
                echo "❌ Tabla '$table' NO existe\n";
            }
        }
    } else {
        echo "❌ Error: No se pudo conectar a la base de datos\n";
    }
} catch (Exception $e) {
    echo "❌ Error en conexión: " . $e->getMessage() . "\n";
}

// PASO 3: Verificar datos en la base de datos
echo "\n📋 PASO 3: Verificando datos en la base de datos\n";
echo "================================================\n";

try {
    // Verificar oficinas
    $officeQuery = "SELECT ID_Office, Name_Office, Office_Type FROM Office LIMIT 10";
    $officeStmt = $conn->prepare($officeQuery);
    $officeStmt->execute();
    $offices = $officeStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Oficinas en la base de datos:\n";
    foreach ($offices as $office) {
        echo "   ID: {$office['ID_Office']}, Nombre: {$office['Name_Office']}, Tipo: {$office['Office_Type']}\n";
    }
    
    // Verificar tickets
    $ticketQuery = "SELECT COUNT(*) as total, 
                   COUNT(CASE WHEN Status = 'Cerrado' THEN 1 END) as cerrados,
                   COUNT(CASE WHEN Status = 'Pendiente' THEN 1 END) as pendientes
                   FROM Service_Request";
    $ticketStmt = $conn->prepare($ticketQuery);
    $ticketStmt->execute();
    $ticketStats = $ticketStmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n📄 Estadísticas de tickets:\n";
    echo "   Total: {$ticketStats['total']}\n";
    echo "   Cerrados: {$ticketStats['cerrados']}\n";
    echo "   Pendientes: {$ticketStats['pendientes']}\n";
    
    // Verificar tickets por oficina
    $ticketByOfficeQuery = "SELECT o.Name_Office, COUNT(*) as count 
                          FROM Office o 
                          LEFT JOIN Service_Request sr ON o.ID_Office = sr.Fk_Office 
                          WHERE sr.Status = 'Cerrado' 
                          GROUP BY o.ID_Office, o.Name_Office 
                          HAVING count > 0 
                          ORDER BY count DESC 
                          LIMIT 10";
    $ticketByOfficeStmt = $conn->prepare($ticketByOfficeQuery);
    $ticketByOfficeStmt->execute();
    $ticketsByOffice = $ticketByOfficeStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n📊 Tickets cerrados por oficina:\n";
    foreach ($ticketsByOffice as $office) {
        echo "   {$office['Name_Office']}: {$office['count']} tickets\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error en consulta de datos: " . $e->getMessage() . "\n";
}

// PASO 4: Probar el modelo Office
echo "\n📋 PASO 4: Probando el modelo Office\n";
echo "================================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/models/Office.php';
    $office = new Office($conn);
    
    echo "✅ Modelo Office instanciado\n";
    
    // Probar el método getTicketsByOffice
    $officeData = $office->getTicketsByOffice();
    
    echo "📊 Resultados de getTicketsByOffice():\n";
    echo "   Total de oficinas con tickets: " . count($officeData) . "\n";
    
    foreach ($officeData as $index => $office) {
        echo "   " . ($index + 1) . ". {$office['name']} ({$office['type']})\n";
        echo "      Resueltos: {$office['resolved_count']}\n";
        echo "      Tiempo Promedio: {$office['avg_resolution_time']} hrs\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error en modelo Office: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
}

// PASO 5: Probar el controller
echo "\n📋 PASO 5: Probando el OfficeController\n";
echo "================================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/controllers/OfficeController.php';
    
    // Simular petición HTTP
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_GET['action'] = 'distribution';
    
    echo "✅ Controller instanciado\n";
    
    // Capturar salida
    ob_start();
    $controller = new OfficeController();
    $controller->handleRequest();
    $output = ob_get_clean();
    
    echo "📤 Salida del controller:\n";
    echo $output . "\n";
    
    // Analizar respuesta JSON
    $response = json_decode($output, true);
    
    if ($response) {
        echo "✅ Respuesta JSON válida\n";
        echo "   Success: " . ($response['success'] ? 'true' : 'false') . "\n";
        echo "   Message: " . ($response['message'] ?? 'No message') . "\n";
        
        if (isset($response['data'])) {
            echo "   Data count: " . count($response['data']) . " elementos\n";
            
            foreach ($response['data'] as $index => $office) {
                echo "   " . ($index + 1) . ". {$office['name']}\n";
                echo "      Resueltos: {$office['resolved_count']}\n";
                echo "      Tiempo: {$office['avg_resolution_time']}\n";
            }
        }
    } else {
        echo "❌ Respuesta JSON inválida\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error en controller: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
}

// PASO 6: Verificar configuración del servidor web
echo "\n📋 PASO 6: Verificando configuración del servidor\n";
echo "================================================\n";

echo "🌐 Información del servidor:\n";
echo "   PHP Version: " . phpversion() . "\n";
echo "   Server API: " . php_sapi_name() . "\n";
echo "   Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'No definido') . "\n";
echo "   Script Name: " . ($_SERVER['SCRIPT_NAME'] ?? 'No definido') . "\n";

// Verificar extensión PDO
if (extension_loaded('pdo')) {
    echo "✅ PDO está cargado\n";
    echo "   Drivers PDO: " . implode(', ', PDO::getAvailableDrivers()) . "\n";
} else {
    echo "❌ PDO NO está cargado\n";
}

// PASO 7: Simular llamada desde frontend
echo "\n📋 PASO 7: Simulando llamada desde frontend\n";
echo "================================================\n";

$frontendUrl = 'http://localhost/tickets-backend/public/api/office?action=distribution';
echo "📡 URL que llamaría el frontend: $frontendUrl\n";

// Verificar si el endpoint es accesible
if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $frontendUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($response) {
        echo "✅ Respuesta del endpoint (HTTP $httpCode):\n";
        echo $response . "\n";
    } else {
        echo "❌ Error en llamada cURL: $error\n";
    }
} else {
    echo "❌ cURL no está disponible\n";
}

echo "\n🎯 DIAGNÓSTICO COMPLETADO\n";
echo "================================================\n";
echo "Revisa los resultados anteriores para identificar el problema de raíz.\n";
?>
