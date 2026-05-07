<?php
// DIAGNÓSTICO COMPLETO DE LOGIN - PHP-PRO
echo "🔍 DIAGNÓSTICO COMPLETO DE LOGIN - PHP-PRO\n";
echo "==========================================\n";

// PASO 1: Verificar configuración del servidor
echo "📋 PASO 1: Verificando configuración del servidor\n";
echo "==========================================\n";

$serverUrl = 'http://localhost:8000';
echo "🌐 Servidor backend: $serverUrl\n";
echo "📡 Endpoint de login: $serverUrl/api/auth\n";

// PASO 2: Verificar endpoint de auth
echo "\n📋 PASO 2: Verificando endpoint de auth\n";
echo "==========================================\n";

$authUrl = $serverUrl . '/api/auth';

if (function_exists('curl_init')) {
    // Probar OPTIONS (CORS preflight)
    echo "🔍 Probando OPTIONS request (CORS preflight)...\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $authUrl);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'OPTIONS');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Origin: http://localhost:3000',
        'Access-Control-Request-Method: POST',
        'Access-Control-Request-Headers: Content-Type, Authorization'
    ]);
    
    $optionsResponse = curl_exec($ch);
    $optionsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $optionsHeaders = curl_getinfo($ch, CURLINFO_HEADER_OUT);
    curl_close($ch);
    
    echo "   HTTP Code: $optionsHttpCode\n";
    echo "   Response: $optionsResponse\n";
    
    // Probar POST request
    echo "\n🔍 Probando POST request (login)...\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $authUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Origin: http://localhost:3000'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'action' => 'login',
        'email' => 'admin@alcaldia.gob',
        'password' => 'password123'
    ]));
    
    $loginResponse = curl_exec($ch);
    $loginHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $loginError = curl_error($ch);
    curl_close($ch);
    
    echo "   HTTP Code: $loginHttpCode\n";
    if ($loginError) {
        echo "   Error: $loginError\n";
    }
    echo "   Response: $loginResponse\n";
    
    // Analizar respuesta
    if ($loginResponse) {
        $data = json_decode($loginResponse, true);
        if ($data && isset($data['success'])) {
            if ($data['success']) {
                echo "   ✅ Login exitoso\n";
                if (isset($data['token'])) {
                    echo "   🎫 Token recibido: " . substr($data['token'], 0, 20) . "...\n";
                }
            } else {
                echo "   ❌ Login fallido: " . ($data['message'] ?? 'Error desconocido') . "\n";
            }
        } else {
            echo "   ❌ Respuesta JSON inválida\n";
        }
    }
} else {
    echo "❌ cURL no está disponible\n";
}

// PASO 3: Verificar configuración del frontend
echo "\n📋 PASO 3: Verificando configuración del frontend\n";
echo "==========================================\n";

$frontendApiFile = __DIR__ . '/tickets-frontend/src/services/api.ts';
if (file_exists($frontendApiFile)) {
    echo "✅ Archivo api.ts existe\n";
    
    $apiContent = file_get_contents($frontendApiFile);
    if (strpos($apiContent, 'localhost:8000') !== false) {
        echo "✅ Frontend configurado para usar localhost:8000\n";
    } else {
        echo "❌ Frontend NO está configurado para usar localhost:8000\n";
    }
    
    // Verificar URL de login
    if (preg_match('/const\s+API_BASE_URL\s*=\s*[\'"]([^\'"]+)[\'"]/', $apiContent, $matches)) {
        echo "📡 API_BASE_URL: {$matches[1]}\n";
    }
} else {
    echo "❌ Archivo api.ts NO existe\n";
}

// PASO 4: Verificar usuarios en la base de datos
echo "\n📋 PASO 4: Verificando usuarios en la base de datos\n";
echo "==========================================\n";

try {
    require_once __DIR__ . '/tickets-backend/src/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        // Verificar tabla Users
        $userQuery = "SELECT ID_Users, Email, Username, Full_Name, Fk_Role FROM Users LIMIT 5";
        $userStmt = $conn->prepare($userQuery);
        $userStmt->execute();
        $users = $userStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "📊 Usuarios en la base de datos:\n";
        foreach ($users as $user) {
            echo "   ID: {$user['ID_Users']}, Email: {$user['Email']}, Username: {$user['Username']}\n";
            echo "   Nombre: {$user['Full_Name']}, Rol: {$user['Fk_Role']}\n";
        }
        
        // Verificar si el usuario de prueba existe
        $testUserQuery = "SELECT COUNT(*) as count FROM Users WHERE Email = 'admin@alcaldia.gob'";
        $testUserStmt = $conn->prepare($testUserQuery);
        $testUserStmt->execute();
        $testUserCount = $testUserStmt->fetch(PDO::FETCH_ASSOC);
        
        echo "\n🔍 Usuario de prueba (admin@alcaldia.gob):\n";
        echo "   Existe: " . ($testUserCount['count'] > 0 ? 'SÍ' : 'NO') . "\n";
        
        if ($testUserCount['count'] == 0) {
            echo "   ⚠️ Necesitas crear el usuario de prueba\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error en conexión a base de datos: " . $e->getMessage() . "\n";
}

// PASO 5: Verificar configuración JWT
echo "\n📋 PASO 5: Verificando configuración JWT\n";
echo "==========================================\n";

$jwtFile = __DIR__ . '/tickets-backend/src/Services/JwtService.php';
if (file_exists($jwtFile)) {
    echo "✅ JwtService.php existe\n";
    
    // Verificar configuración del secret
    $jwtContent = file_get_contents($jwtFile);
    if (strpos($jwtContent, 'your-secret-key') !== false) {
        echo "⚠️ JWT secret está usando valor por defecto\n";
    } else {
        echo "✅ JWT secret parece configurado\n";
    }
} else {
    echo "❌ JwtService.php NO existe\n";
}

echo "\n🎯 DIAGNÓSTICO COMPLETADO\n";
echo "==========================================\n";
echo "Revisa los resultados anteriores para identificar el problema de login.\n";

// PASO 6: Recomendaciones
echo "\n📋 RECOMENDACIONES:\n";
echo "==========================================\n";
echo "1. 🔄 Asegúrate que el servidor esté corriendo en localhost:8000\n";
echo "2. 📡 Verifica que el endpoint /api/auth responda correctamente\n";
echo "3. 👤 Confirma que el usuario admin@alcaldia.gob exista en la BD\n";
echo "4. 🔧 Revisa la configuración CORS en el backend\n";
echo "5. 🎫 Verifica la configuración JWT\n";
echo "6. 🌐 Asegúrate que el frontend apunte a localhost:8000\n";
?>
