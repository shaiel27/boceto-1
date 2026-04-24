<?php
// Script para probar los endpoints de servicios
$baseUrl = 'http://localhost:8000/tickets-backend/public/services.php';

echo "=== PRUEBA DE ENDPOINTS DE SERVICIOS ===\n\n";

// 1. Probar obtener tipos de servicio
echo "1. GET /api/services?action=services\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=services');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Depuración: Verificar qué ruta está llegando
echo "=== DEPURACIÓN ===\n";
$ch = curl_init('http://localhost:8000/tickets-backend/api/debug');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
echo "Debug response: $response\n\n";

// 2. Probar obtener problemas por tipo de servicio
echo "2. GET /api/services?action=problems&service_id=1\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=problems&service_id=1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// 3. Probar obtener problemas por tipo de servicio (ID 2)
echo "3. GET /api/services?action=problems&service_id=2\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=problems&service_id=2');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// 4. Probar obtener problemas por tipo de servicio (ID 3)
echo "4. GET /api/services?action=problems&service_id=3\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=problems&service_id=3');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// 5. Probar obtener sistemas de software
echo "5. GET /api/services?action=software-systems\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=software-systems');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

echo "=== FIN DE PRUEBAS ===\n";
?>
