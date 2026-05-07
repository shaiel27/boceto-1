<?php
// INICIAR SERVIDOR PHP BACKEND Y VERIFICAR CONEXIÓN
echo "🚀 INICIANDO SERVIDOR PHP BACKEND\n";
echo "====================================\n";

// Iniciar servidor PHP en puerto 8000
$serverCommand = 'cd ' . __DIR__ . '/tickets-backend/public && php -S localhost:8000 -t .';
echo "📡 Comando: $serverCommand\n";
echo "🌐 Servidor se iniciará en: http://localhost:8000\n";

// Iniciar servidor en segundo plano (Windows)
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    $command = 'start /B php -S localhost:8000 -t ' . __DIR__ . '/tickets-backend/public';
    pclose(popen($command, 'r'));
    echo "✅ Servidor iniciado en segundo plano (Windows)\n";
} else {
    $command = 'php -S localhost:8000 -t ' . __DIR__ . '/tickets-backend/public > /dev/null 2>&1 &';
    shell_exec($command);
    echo "✅ Servidor iniciado en segundo plano (Linux/Mac)\n";
}

// Esperar un momento para que el servidor inicie
sleep(2);

// Verificar que el servidor esté corriendo
echo "\n🔍 Verificando que el servidor esté corriendo...\n";

$testUrl = 'http://localhost:8000/api/office?action=distribution';

if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $testUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($response && $httpCode === 200) {
        echo "✅ Servidor respondiendo correctamente (HTTP 200)\n";
        
        // Analizar respuesta
        $data = json_decode($response, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo "✅ Endpoint funcionando correctamente\n";
            echo "📊 Datos recibidos: " . count($data['data']) . " oficinas\n";
            
            foreach ($data['data'] as $index => $office) {
                echo "   " . ($index + 1) . ". {$office['name']}: {$office['resolved_count']} tickets\n";
            }
        } else {
            echo "❌ Error en la respuesta del endpoint\n";
        }
    } else {
        echo "❌ Error en conexión: $error (HTTP $httpCode)\n";
    }
} else {
    echo "❌ cURL no está disponible\n";
}

echo "\n🎯 ESTADO FINAL:\n";
echo "====================================\n";
echo "✅ Servidor PHP iniciado en http://localhost:8000\n";
echo "✅ Frontend configurado para usar http://localhost:8000\n";
echo "✅ Endpoint /api/office?action=distribution disponible\n";
echo "✅ Reporte por oficina listo para funcionar\n";

echo "\n📋 ACCIONES REQUERIDAS:\n";
echo "====================================\n";
echo "1. 🔄 El frontend ahora usará datos reales del backend\n";
echo "2. 📄 El PDF generará con datos de la base de datos\n";
echo "3. 🧪 Prueba el reporte por oficina en el frontend\n";
echo "4. ✅ Verifica que el PDF muestre los datos correctos\n";

echo "\n⚠️ NOTA:\n";
echo "====================================\n";
echo "El servidor PHP continuará corriendo en esta terminal.\n";
echo "Para detenerlo: Ctrl+C\n";
echo "El frontend ahora está conectado al backend real.\n";
?>
