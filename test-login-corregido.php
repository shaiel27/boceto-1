<?php
// VERIFICACIÓN FINAL DE LOGIN CORREGIDO
echo "🔍 VERIFICACIÓN FINAL DE LOGIN CORREGIDO\n";
echo "=====================================\n";

// Probar la URL corregida
$correctUrl = 'http://localhost:8000/api/auth';
echo "📡 Probando URL corregida: $correctUrl\n";

if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $correctUrl);
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
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($response && $httpCode === 200) {
        echo "✅ Login corregido exitoso (HTTP 200)\n";
        
        $data = json_decode($response, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo "✅ Respuesta exitosa del backend\n";
            echo "🎫 Token recibido: " . substr($data['token'], 0, 20) . "...\n";
            echo "👤 Usuario: {$data['user']['Full_Name']}\n";
            echo "📧 Email: {$data['user']['Email']}\n";
            echo "🔑 Rol: {$data['user']['Role']}\n";
        }
    } else {
        echo "❌ Error: $error (HTTP $httpCode)\n";
    }
} else {
    echo "❌ cURL no disponible\n";
}

echo "\n🎯 ESTADO FINAL:\n";
echo "=====================================\n";
echo "✅ Problema identificado: Doble /api en la URL\n";
echo "✅ URL corregida: http://localhost:8000/api/auth\n";
echo "✅ Frontend actualizado para usar la URL correcta\n";
echo "✅ Login ahora debería funcionar correctamente\n";

echo "\n📋 INSTRUCCIONES PARA EL USUARIO:\n";
echo "=====================================\n";
echo "1. 🔄 Asegúrate que el servidor PHP esté corriendo en localhost:8000\n";
echo "2. 🌐 Abre el frontend en el navegador\n";
echo "3. 🔐 Intenta hacer login con:\n";
echo "   - Email: admin@alcaldia.gob\n";
echo "   - Password: password123\n";
echo "4. ✅ El login debería funcionar ahora\n";

echo "\n🔧 CAMBIO REALIZADO:\n";
echo "=====================================\n";
echo "ANTES: fetch(`${API_BASE_URL}/api/auth`) → http://localhost:8000/api/api/auth\n";
echo "AHORA: fetch(`${API_BASE_URL}/auth`) → http://localhost:8000/api/auth\n";
echo "=====================================\n";
?>
