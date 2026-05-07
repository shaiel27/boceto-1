<?php
// DIAGNÓSTICO COMPLETO DEL SISTEMA - CONEXIÓN BD E INTEGRACIÓN
echo "🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA\n";
echo "=====================================\n";

// PASO 1: Verificar conexión a la base de datos
echo "📋 PASO 1: Verificando conexión a la base de datos\n";
echo "=====================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ Conexión a base de datos establecida\n";
        
        // Verificar tablas principales
        $tables = ['Users', 'Office', 'Service_Request', 'Technicians'];
        foreach ($tables as $table) {
            $result = $conn->query("SHOW TABLES LIKE '$table'");
            if ($result->rowCount() > 0) {
                echo "✅ Tabla '$table' existe\n";
                
                // Contar registros
                $countResult = $conn->query("SELECT COUNT(*) as count FROM $table");
                $count = $countResult->fetch(PDO::FETCH_ASSOC);
                echo "   📊 Registros en '$table': {$count['count']}\n";
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

// PASO 2: Verificar estado del servidor backend
echo "\n📋 PASO 2: Verificando estado del servidor backend\n";
echo "=====================================\n";

$backendUrl = 'http://localhost:8000';
$endpoints = [
    '/api/auth' => 'Autenticación',
    '/api/tickets' => 'Tickets',
    '/api/users' => 'Usuarios',
    '/api/office' => 'Oficinas',
    '/api/technicians' => 'Técnicos'
];

if (function_exists('curl_init')) {
    foreach ($endpoints as $endpoint => $name) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $backendUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_NOBODY, true); // Solo HEAD request
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($httpCode === 200 || $httpCode === 405) {
            echo "✅ $name: Endpoint disponible (HTTP $httpCode)\n";
        } else {
            echo "❌ $name: Error (HTTP $httpCode) - $error\n";
        }
    }
} else {
    echo "❌ cURL no disponible para verificar endpoints\n";
}

// PASO 3: Verificar datos específicos del reporte por oficina
echo "\n📋 PASO 3: Verificando datos del reporte por oficina\n";
echo "=====================================\n";

try {
    if (isset($conn)) {
        // Verificar datos de oficinas
        $officeQuery = "SELECT COUNT(*) as count FROM Office";
        $officeStmt = $conn->prepare($officeQuery);
        $officeStmt->execute();
        $officeCount = $officeStmt->fetch(PDO::FETCH_ASSOC);
        echo "📊 Total de oficinas: {$officeCount['count']}\n";
        
        // Verificar tickets por oficina
        $ticketOfficeQuery = "SELECT o.Name_Office, COUNT(sr.ID_Service_Request) as ticket_count
                             FROM Office o
                             LEFT JOIN Service_Request sr ON o.ID_Office = sr.Fk_Office
                             GROUP BY o.ID_Office, o.Name_Office
                             HAVING ticket_count > 0
                             ORDER BY ticket_count DESC
                             LIMIT 5";
        $ticketOfficeStmt = $conn->prepare($ticketOfficeQuery);
        $ticketOfficeStmt->execute();
        $ticketsByOffice = $ticketOfficeStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "📊 Tickets por oficina (Top 5):\n";
        foreach ($ticketsByOffice as $office) {
            echo "   {$office['Name_Office']}: {$office['ticket_count']} tickets\n";
        }
        
        // Verificar tickets cerrados
        $closedTicketsQuery = "SELECT COUNT(*) as count FROM Service_Request WHERE Status = 'Cerrado'";
        $closedStmt = $conn->prepare($closedTicketsQuery);
        $closedStmt->execute();
        $closedCount = $closedStmt->fetch(PDO::FETCH_ASSOC);
        echo "📊 Total de tickets cerrados: {$closedCount['count']}\n";
    }
} catch (Exception $e) {
    echo "❌ Error al verificar datos: " . $e->getMessage() . "\n";
}

// PASO 4: Verificar configuración del frontend
echo "\n📋 PASO 4: Verificando configuración del frontend\n";
echo "=====================================\n";

$frontendApiFile = __DIR__ . '/tickets-frontend/src/services/api.ts';
if (file_exists($frontendApiFile)) {
    echo "✅ Archivo api.ts existe\n";
    
    $apiContent = file_get_contents($frontendApiFile);
    
    // Verificar URL base
    if (preg_match('/const\s+API_BASE_URL\s*=\s*[\'"]([^\'"]+)[\'"]/', $apiContent, $matches)) {
        echo "📡 API_BASE_URL: {$matches[1]}\n";
    }
    
    // Verificar si está usando datos mock o reales
    if (strpos($apiContent, 'getMockOfficeReport') !== false) {
        echo "⚠️ Frontend está usando datos mock para reporte por oficina\n";
    } else {
        echo "✅ Frontend está configurado para usar datos reales\n";
    }
    
    // Verificar método getOfficeReport
    if (strpos($apiContent, 'getOfficeReport') !== false) {
        echo "✅ Método getOfficeReport existe\n";
    } else {
        echo "❌ Método getOfficeReport NO existe\n";
    }
} else {
    echo "❌ Archivo api.ts NO existe\n";
}

// PASO 5: Verificar si el modelo Office fue modificado
echo "\n📋 PASO 5: Verificando modificaciones recientes\n";
echo "=====================================\n";

$officeModelFile = __DIR__ . '/tickets-backend/src/models/Office.php';
if (file_exists($officeModelFile)) {
    echo "✅ Modelo Office.php existe\n";
    
    $modelContent = file_get_contents($officeModelFile);
    
    // Verificar si tiene el filtro HAVING resolved_count >= 5
    if (strpos($modelContent, 'HAVING resolved_count >= 5') !== false) {
        echo "⚠️ Modelo Office tiene filtro >= 5 (modificación reciente)\n";
    } else {
        echo "✅ Modelo Office sin filtro restrictivo\n";
    }
    
    // Verificar si tiene el método getTicketsByOffice
    if (strpos($modelContent, 'getTicketsByOffice') !== false) {
        echo "✅ Método getTicketsByOffice existe\n";
    } else {
        echo "❌ Método getTicketsByOffice NO existe\n";
    }
} else {
    echo "❌ Modelo Office.php NO existe\n";
}

// PASO 6: Verificar endpoint /api/office en el backend
echo "\n📋 PASO 6: Verificando endpoint /api/office\n";
echo "=====================================\n";

$indexFile = __DIR__ . '/tickets-backend/public/index.php';
if (file_exists($indexFile)) {
    echo "✅ Archivo index.php existe\n";
    
    $indexContent = file_get_contents($indexFile);
    
    // Verificar si tiene la ruta /api/office
    if (strpos($indexContent, "'/api/office'") !== false) {
        echo "✅ Ruta /api/office está configurada\n";
    } else {
        echo "❌ Ruta /api/office NO está configurada\n";
    }
} else {
    echo "❌ Archivo index.php NO existe\n";
}

echo "\n🎯 DIAGNÓSTICO COMPLETADO\n";
echo "=====================================\n";
echo "Revisa los resultados anteriores para identificar problemas.\n";

// PASO 7: Recomendaciones basadas en el diagnóstico
echo "\n📋 RECOMENDACIONES:\n";
echo "=====================================\n";
echo "1. 🔧 Si la conexión a BD falla: Revisa configuración de database.php\n";
echo "2. 🌐 Si los endpoints no responden: Inicia servidor PHP en localhost:8000\n";
echo "3. 📊 Si no hay datos: Verifica que las tablas tengan registros\n";
echo "4. 🔄 Si el frontend usa mock: Cambia a datos reales\n";
echo "5. 🏢 Si el filtro >= 5 está activo: Revertir a filtro > 0\n";
echo "6. 📡 Si /api/office no existe: Agregar la ruta en index.php\n";
?>
