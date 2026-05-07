<?php
// VERIFICAR CONFIGURACIÓN REAL DEL BACKEND
echo "🔍 VERIFICANDO CONFIGURACIÓN DEL BACKEND\n";
echo "==========================================\n";

$baseUrl = 'http://localhost:8000';

// Probar diferentes endpoints
$endpoints = [
    '/auth' => 'Autenticación',
    '/office' => 'Oficinas',
    '/tickets' => 'Tickets',
    '/users' => 'Usuarios',
    '/api/auth' => 'Autenticación con /api',
    '/api/office' => 'Oficinas con /api',
    '/api/tickets' => 'Tickets con /api'
];

foreach ($endpoints as $endpoint => $name) {
    $url = $baseUrl . $endpoint;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($httpCode === 200 || $httpCode === 405 || $httpCode === 404) {
        echo "✅ $name ($endpoint): Disponible (HTTP $httpCode)\n";
    } else {
        echo "❌ $name ($endpoint): Error (HTTP $httpCode) - $error\n";
    }
}

echo "\n🎯 CONCLUSIÓN:\n";
echo "==========================================\n";
echo "Si los endpoints SIN /api funcionan, usa API_BASE_URL = 'http://localhost:8000'\n";
echo "Si los endpoints CON /api funcionan, usa API_BASE_URL = 'http://localhost:8000/api'\n";
?>
