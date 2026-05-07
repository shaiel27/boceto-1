<?php
// DIAGNÓSTICO CRÍTICO DEL SISTEMA - POR QUÉ NINGÚN MÓDULO FUNCIONA
echo "🚨 DIAGNÓSTICO CRÍTICO DEL SISTEMA\n";
echo "==================================\n";

// PASO 1: Verificar si el servidor PHP está realmente corriendo
echo "📋 PASO 1: Verificando si el servidor PHP está corriendo\n";
echo "==================================\n";

$serverUrl = 'http://localhost:8000';
$testEndpoints = [
    '/' => 'Raíz del servidor',
    '/api/auth' => 'Autenticación',
    '/api/office' => 'Oficinas',
    '/api/tickets' => 'Tickets',
    '/api/users' => 'Usuarios'
];

$serverRunning = false;

if (function_exists('curl_init')) {
    foreach ($testEndpoints as $endpoint => $name) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $serverUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($httpCode === 200 || $httpCode === 404 || $httpCode === 405) {
            echo "✅ $name: Servidor responde (HTTP $httpCode)\n";
            $serverRunning = true;
        } else {
            echo "❌ $name: Error (HTTP $httpCode) - $error\n";
        }
    }
    
    if (!$serverRunning) {
        echo "\n🚨 PROBLEMA CRÍTICO: El servidor PHP NO está corriendo\n";
        echo "📋 SOLUCIÓN: Inicia el servidor PHP con:\n";
        echo "   cd c:\\xampp\\htdocs\\boceto-1\\tickets-backend\n";
        echo "   php -S localhost:8000 -t public\n";
        echo "\n⚠️ El frontend no puede conectar al backend si el servidor no está corriendo\n";
    }
} else {
    echo "❌ cURL no disponible para verificar el servidor\n";
}

// PASO 2: Verificar configuración del frontend
echo "\n📋 PASO 2: Verificando configuración del frontend\n";
echo "==================================\n";

$frontendApiFile = __DIR__ . '/tickets-frontend/src/services/api.ts';
if (file_exists($frontendApiFile)) {
    echo "✅ Archivo api.ts existe\n";
    
    $apiContent = file_get_contents($frontendApiFile);
    
    // Verificar URL base
    if (preg_match('/const\s+API_BASE_URL\s*=\s*[\'"]([^\'"]+)[\'"]/', $apiContent, $matches)) {
        echo "📡 API_BASE_URL: {$matches[1]}\n";
        
        if ($matches[1] === 'http://localhost:8000/api') {
            echo "✅ URL base correcta\n";
        } else {
            echo "❌ URL base incorrecta - debería ser http://localhost:8000/api\n";
        }
    }
    
    // Verificar si hay errores de configuración
    if (strpos($apiContent, 'localhost:3000') !== false) {
        echo "⚠️ Hay referencias a localhost:3000 (posible conflicto)\n";
    }
} else {
    echo "❌ Archivo api.ts NO existe\n";
}

// PASO 3: Verificar si hay errores en el backend
echo "\n📋 PASO 3: Verificando errores en el backend\n";
echo "==================================\n";

$backendFiles = [
    'src/config/database.php' => 'Configuración de BD',
    'src/models/Office.php' => 'Modelo Office',
    'src/controllers/OfficeController.php' => 'Controller Office',
    'public/index.php' => 'Router principal'
];

foreach ($backendFiles as $file => $description) {
    $filePath = __DIR__ . '/tickets-backend/' . $file;
    if (file_exists($filePath)) {
        echo "✅ $description existe\n";
        
        // Verificar si hay errores de sintaxis
        $output = [];
        $returnCode = 0;
        exec("php -l \"$filePath\" 2>&1", $output, $returnCode);
        
        if ($returnCode === 0) {
            echo "   ✅ Sin errores de sintaxis\n";
        } else {
            echo "   ❌ Errores de sintaxis:\n";
            foreach ($output as $line) {
                echo "      $line\n";
            }
        }
    } else {
        echo "❌ $description NO existe\n";
    }
}

// PASO 4: Verificar conexión a la base de datos
echo "\n📋 PASO 4: Verificando conexión a la base de datos\n";
echo "==================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ Conexión a BD establecida\n";
        
        // Verificar si hay datos
        $tables = ['Users', 'Office', 'Service_Request'];
        foreach ($tables as $table) {
            $result = $conn->query("SELECT COUNT(*) as count FROM $table");
            $count = $result->fetch(PDO::FETCH_ASSOC);
            echo "📊 $table: {$count['count']} registros\n";
        }
    } else {
        echo "❌ Error: No se pudo conectar a la BD\n";
    }
} catch (Exception $e) {
    echo "❌ Error en conexión BD: " . $e->getMessage() . "\n";
}

// PASO 5: Probar una llamada completa al endpoint
echo "\n📋 PASO 5: Probando llamada completa al endpoint\n";
echo "==================================\n";

if ($serverRunning && function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $serverUrl . '/api/office?action=distribution');
    curl_setopt($ch, CURLOPT_POST, false);
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
    
    echo "📡 Llamada a /api/office?action=distribution\n";
    echo "   HTTP Code: $httpCode\n";
    echo "   Error: $error\n";
    echo "   Response: $response\n";
    
    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            echo "   ✅ Respuesta JSON válida\n";
            echo "   📊 Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            if (isset($data['data'])) {
                echo "   📊 Data count: " . count($data['data']) . "\n";
            }
        } else {
            echo "   ❌ Respuesta JSON inválida\n";
        }
    }
}

// PASO 6: Verificar si hay problemas de CORS o headers
echo "\n📋 PASO 6: Verificando problemas de CORS\n";
echo "==================================\n";

if ($serverRunning && function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $serverUrl . '/api/office?action=distribution');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'OPTIONS');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Origin: http://localhost:3000',
        'Access-Control-Request-Method: GET',
        'Access-Control-Request-Headers: Content-Type'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "🌐 OPTIONS request (CORS preflight)\n";
    echo "   HTTP Code: $httpCode\n";
    
    if ($httpCode === 200) {
        echo "   ✅ CORS configurado correctamente\n";
    } else {
        echo "   ❌ Problemas con CORS\n";
    }
}

echo "\n🎯 DIAGNÓSTICO COMPLETADO\n";
echo "==================================\n";

if (!$serverRunning) {
    echo "🚨 PROBLEMA PRINCIPAL: El servidor backend NO está corriendo\n";
    echo "📋 SOLUCIÓN INMEDIATA:\n";
    echo "1. Abre una terminal\n";
    echo "2. Ejecuta: cd c:\\xampp\\htdocs\\boceto-1\\tickets-backend\n";
    echo "3. Ejecuta: php -S localhost:8000 -t public\n";
    echo "4. Mantén esa terminal abierta\n";
    echo "5. Abre el frontend en otra terminal\n";
} else {
    echo "✅ El servidor está corriendo, revisa otros problemas\n";
}

echo "\n📋 PASOS A SEGUIR:\n";
echo "==================================\n";
echo "1. 🔄 Asegúrate que el servidor PHP esté corriendo\n";
echo "2. 🌐 Verifica que el frontend apunte a localhost:8000\n";
echo "3. 🔐 Inicia sesión en el frontend\n";
echo "4. 📊 Prueba los módulos uno por uno\n";
echo "5. 📄 Revisa la consola del navegador para errores\n";
?>
