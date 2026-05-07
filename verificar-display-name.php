<?php
// VERIFICAR QUE DISPLAY_NAME ESTÉ EN LA RESPUESTA DEL API
echo "🔍 VERIFICANDO CAMPO DISPLAY_NAME\n";
echo "===================================\n";

$url = 'http://localhost:8000/api/office?action=distribution';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response && $httpCode === 200) {
    $data = json_decode($response, true);
    
    if ($data && isset($data['data']) && is_array($data['data'])) {
        echo "✅ API devuelve datos\n";
        echo "📊 Total oficinas: " . count($data['data']) . "\n\n";
        
        // Mostrar primeros 5 registros con sus nombres
        echo "📋 Muestras de nombres:\n";
        echo "===================================\n";
        
        foreach (array_slice($data['data'], 0, 5) as $index => $office) {
            echo ($index + 1) . ". Nombre completo: {$office['name']}\n";
            if (isset($office['display_name'])) {
                echo "   Nombre abreviado: {$office['display_name']}\n";
                echo "   Longitud: " . strlen($office['display_name']) . " caracteres\n";
            } else {
                echo "   ❌ NO tiene display_name\n";
            }
            echo "\n";
        }
        
        // Verificar que todos tengan display_name
        $todosConDisplayName = true;
        foreach ($data['data'] as $office) {
            if (!isset($office['display_name'])) {
                $todosConDisplayName = false;
                break;
            }
        }
        
        if ($todosConDisplayName) {
            echo "✅ TODOS los registros tienen display_name\n";
        } else {
            echo "❌ ALGUNOS registros no tienen display_name\n";
        }
    } else {
        echo "❌ Error en la estructura de datos\n";
    }
} else {
    echo "❌ Error en la petición: HTTP $httpCode\n";
}

echo "\n🎯 VERIFICACIÓN COMPLETADA\n";
?>
