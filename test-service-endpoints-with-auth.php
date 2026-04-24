<?php
// Script para probar los endpoints de servicios con autenticación
$baseUrl = 'http://localhost:8000/tickets-backend/api/services';
$token = 'test-token'; // Token temporal para pruebas

echo "=== PRUEBA DE ENDPOINTS DE SERVICIOS CON AUTH ===\n\n";

// 1. Probar obtener tipos de servicio
echo "1. GET /api/services?action=services\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=services');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// 2. Probar obtener problemas por tipo de servicio
echo "2. GET /api/services?action=problems&service_id=1\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=problems&service_id=1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// 3. Probar obtener sistemas de software
echo "3. GET /api/services?action=software-systems\n";
echo str_repeat("-", 50) . "\n";
$ch = curl_init($baseUrl . '?action=software-systems');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

echo "=== FIN DE PRUEBAS ===\n";
?>
