<?php
// DIAGNÓSTICO DEL ERROR - REPORTE POR OFICINA NO OBTIENE DATOS
echo "🔍 DIAGNÓSTICO DEL ERROR - REPORTE POR OFICINA\n";
echo "===============================================\n";

// PASO 1: Verificar si el servidor backend está corriendo
echo "📋 PASO 1: Verificando servidor backend\n";
echo "===============================================\n";

$serverUrl = 'http://localhost:8000';

if (function_exists('curl_init')) {
    // Probar endpoint raíz
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $serverUrl . '/');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($httpCode === 200 || $httpCode === 404) {
        echo "✅ Servidor backend está corriendo (HTTP $httpCode)\n";
        $serverRunning = true;
    } else {
        echo "❌ Servidor backend NO está corriendo (HTTP $httpCode) - $error\n";
        echo "📋 SOLUCIÓN: Inicia el servidor con:\n";
        echo "   cd c:\\xampp\\htdocs\\boceto-1\\tickets-backend\n";
        echo "   php -S localhost:8000 -t public\n";
        $serverRunning = false;
    }
} else {
    echo "❌ cURL no disponible\n";
    $serverRunning = false;
}

// PASO 2: Probar endpoint específico /api/office
if ($serverRunning) {
    echo "\n📋 PASO 2: Probando endpoint /api/office\n";
    echo "===============================================\n";
    
    $officeUrl = $serverUrl . '/api/office?action=distribution';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $officeUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "📡 URL: $officeUrl\n";
    echo "📊 HTTP Code: $httpCode\n";
    echo "📄 Response: $response\n";
    
    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            echo "✅ Endpoint funciona correctamente\n";
            echo "📊 Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            echo "📝 Message: " . ($data['message'] ?? 'No message') . "\n";
            
            if (isset($data['data']) && is_array($data['data'])) {
                echo "📊 Data count: " . count($data['data']) . " elementos\n";
                
                echo "📋 Datos:\n";
                foreach ($data['data'] as $index => $office) {
                    echo "   " . ($index + 1) . ". {$office['name']}: {$office['resolved_count']} tickets\n";
                }
            } else {
                echo "❌ No se encontró data en la respuesta\n";
            }
        } else {
            echo "❌ Respuesta JSON inválida\n";
        }
    } else {
        echo "❌ Error en endpoint: $error\n";
    }
}

// PASO 3: Verificar configuración del frontend
echo "\n📋 PASO 3: Verificando configuración del frontend\n";
echo "===============================================\n";

$frontendApiFile = __DIR__ . '/tickets-frontend/src/services/api.ts';
if (file_exists($frontendApiFile)) {
    echo "✅ Archivo api.ts existe\n";
    
    $apiContent = file_get_contents($frontendApiFile);
    
    // Verificar URL base
    if (preg_match('/const\s+API_BASE_URL\s*=\s*[\'"]([^\'"]+)[\'"]/', $apiContent, $matches)) {
        echo "📡 API_BASE_URL: {$matches[1]}\n";
        
        if ($matches[1] === 'http://localhost:8000') {
            echo "✅ URL base correcta (sin /api al final)\n";
        } else {
            echo "⚠️ URL base podría estar incorrecta\n";
        }
    }
    
    // Verificar método getOfficeReport
    if (strpos($apiContent, 'getOfficeReport') !== false) {
        echo "✅ Método getOfficeReport existe\n";
        
        // Verificar si tiene fallback a mock
        if (strpos($apiContent, 'getMockOfficeReport()') !== false) {
            echo "⚠️ Tiene fallback a mock (esto podría causar problemas)\n";
        } else {
            echo "✅ Sin fallback a mock\n";
        }
    } else {
        echo "❌ Método getOfficeReport NO existe\n";
    }
} else {
    echo "❌ Archivo api.ts NO existe\n";
}

// PASO 4: Verificar si hay problemas de autenticación
echo "\n📋 PASO 4: Verificando problemas de autenticación\n";
echo "===============================================\n";

if ($serverRunning && function_exists('curl_init')) {
    // Probar con token de autenticación
    $officeUrl = $serverUrl . '/api/office?action=distribution';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $officeUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer test-token'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "📡 Con token de autenticación:\n";
    echo "   HTTP Code: $httpCode\n";
    echo "   Response: $response\n";
    
    if ($httpCode === 401) {
        echo "❌ Problema de autenticación (HTTP 401)\n";
        echo "📋 El endpoint requiere autenticación válida\n";
    }
}

// PASO 5: Verificar el componente Reports.tsx
echo "\n📋 PASO 5: Verificando componente Reports.tsx\n";
echo "===============================================\n";

$reportsFile = __DIR__ . '/tickets-frontend/src/components/dashboard/Reports.tsx';
if (file_exists($reportsFile)) {
    echo "✅ Archivo Reports.tsx existe\n";
    
    $reportsContent = file_get_contents($reportsFile);
    
    // Verificar línea 980
    $lines = explode("\n", $reportsContent);
    if (isset($lines[979])) { // Línea 980 (índice 979)
        echo "📄 Línea 980: " . trim($lines[979]) . "\n";
    }
    
    // Verificar si hay manejo de errores
    if (strpos($reportsContent, 'No se pudieron obtener los datos del reporte por oficina') !== false) {
        echo "✅ Mensaje de error encontrado en el código\n";
        
        // Encontrar el contexto del error
        $errorPos = strpos($reportsContent, 'No se pudieron obtener los datos del reporte por oficina');
        $contextStart = max(0, $errorPos - 200);
        $contextEnd = min(strlen($reportsContent), $errorPos + 200);
        $context = substr($reportsContent, $contextStart, $contextEnd - $contextStart);
        
        echo "📋 Contexto del error:\n";
        echo "   " . str_replace("\n", "\n   ", $context) . "\n";
    }
}

echo "\n🎯 DIAGNÓSTICO COMPLETADO\n";
echo "===============================================\n";

if (!$serverRunning) {
    echo "🚨 PROBLEMA PRINCIPAL: Servidor backend NO está corriendo\n";
    echo "📋 SOLUCIÓN:\n";
    echo "1. Abre terminal\n";
    echo "2. cd c:\\xampp\\htdocs\\boceto-1\\tickets-backend\n";
    echo "3. php -S localhost:8000 -t public\n";
    echo "4. Mantén el servidor corriendo\n";
} else {
    echo "✅ Servidor está corriendo, revisa otros problemas\n";
    echo "📋 Revisa la consola del navegador para más detalles\n";
}

echo "\n📋 PASOS A SEGUIR:\n";
echo "===============================================\n";
echo "1. 🔄 Asegúrate que el servidor PHP esté corriendo\n";
echo "2. 🔐 Inicia sesión en el frontend\n";
echo "3. 📊 Intenta generar el reporte por oficina\n";
echo "4. 📄 Revisa la consola del navegador para errores\n";
echo "5. 📡 Verifica que las llamadas API funcionen\n";
?>
