<?php
// Script para depurar exactamente qué datos devuelve el backend del reporte por oficina
echo "🔍 DEPURACIÓN DE DATOS DEL REPORTE POR OFICINA\n";
echo "================================================\n\n";

// Simular la respuesta del backend con la estructura exacta que debería devolver
echo "📄 RESPUESTA ESPERADA DEL BACKEND:\n";
echo "================================================\n";

$expectedResponse = [
    'success' => true,
    'message' => 'Distribución de tickets por oficina obtenida exitosamente',
    'data' => [
        [
            'id' => 1,
            'name' => 'Catastro',
            'type' => 'Dirección',
            'resolved_count' => 25,
            'avg_resolution_time' => 4.2
        ],
        [
            'id' => 2,
            'name' => 'Obras',
            'type' => 'Dirección',
            'resolved_count' => 23,
            'avg_resolution_time' => 3.8
        ],
        [
            'id' => 3,
            'name' => 'Bienestar',
            'type' => 'Coordinación',
            'resolved_count' => 21,
            'avg_resolution_time' => 5.1
        ],
        [
            'id' => 4,
            'name' => 'Hacienda',
            'type' => 'Dirección',
            'resolved_count' => 17,
            'avg_resolution_time' => 6.3
        ],
        [
            'id' => 5,
            'name' => 'Salud',
            'type' => 'Coordinación',
            'resolved_count' => 15,
            'avg_resolution_time' => 4.5
        ],
        [
            'id' => 6,
            'name' => 'Educación',
            'type' => 'Dirección',
            'resolved_count' => 19,
            'avg_resolution_time' => 3.9
        ]
    ]
];

echo "📋 Estructura de datos:\n";
echo "success: " . ($expectedResponse['success'] ? 'true' : 'false') . "\n";
echo "message: " . $expectedResponse['message'] . "\n";
echo "data count: " . count($expectedResponse['data']) . " elementos\n\n";

echo "📊 Datos individuales:\n";
foreach ($expectedResponse['data'] as $index => $office) {
    echo "Elemento " . ($index + 1) . ":\n";
    echo "  id: " . $office['id'] . "\n";
    echo "  name: " . $office['name'] . "\n";
    echo "  type: " . $office['type'] . "\n";
    echo "  resolved_count: " . $office['resolved_count'] . "\n";
    echo "  avg_resolution_time: " . $office['avg_resolution_time'] . "\n\n";
}

echo "🔍 VERIFICACIÓN DE ESTRUCTURA JSON:\n";
echo "================================================\n";
echo "JSON que debería recibir el frontend:\n";
echo json_encode($expectedResponse, JSON_PRETTY_PRINT) . "\n\n";

echo "📋 VERIFICACIÓN DE CAMPOS ESPERADOS:\n";
echo "================================================\n";
echo "✅ Campos que el frontend espera:\n";
echo "   - office.name (nombre de la oficina)\n";
echo "   - office.resolved_count (tickets resueltos)\n";
echo "   - office.avg_resolution_time (tiempo promedio)\n\n";

echo "✅ Campos que el frontend está extrayendo:\n";
echo "   - name: office.name || 'N/A'\n";
echo "   - resolvedCount: office.resolved_count || 0\n";
echo "   - avgTime: office.avg_resolution_time || 0\n\n";

echo "🎯 DIAGNÓSTICO POSIBLE:\n";
echo "================================================\n";
echo "Si el PDF no muestra los datos correctos, verificar:\n";
echo "1. 📄 Que el backend esté devolviendo 'success: true'\n";
echo "2. 📊 Que los datos estén en 'response.data'\n";
echo "3. 🔍 Que los campos tengan los nombres correctos\n";
echo "4. 📋 Que el frontend esté accediendo a 'response.data'\n";
echo "5. 🖨️ Que el PDF esté usando los datos extraídos correctamente\n\n";

echo "✅ DEPURACIÓN COMPLETADA\n";
echo "================================================\n";
?>
