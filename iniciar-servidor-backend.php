<?php
// INICIAR SERVIDOR WEB PHP PARA BACKEND
echo "🚀 INICIANDO SERVIDOR WEB PHP PARA BACKEND\n";
echo "==============================================\n";

// Verificar si estamos en Windows
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    echo "🪟 Sistema operativo: Windows\n";
    
    // Iniciar servidor PHP en puerto 8000
    $command = 'start cmd /k "cd /d ' . __DIR__ . '\tickets-backend\public && php -S localhost:8000"';
    
    echo "📡 Comando: $command\n";
    echo "🌐 Servidor se iniciará en: http://localhost:8000/api/office?action=distribution\n";
    
    // Ejecutar comando
    shell_exec($command);
    
    echo "✅ Servidor iniciado en segundo plano\n";
    echo "📋 URL para el frontend: http://localhost:8000/api/office?action=distribution\n";
    
} else {
    echo "🐧 Sistema operativo: Linux/Mac\n";
    
    // Iniciar servidor PHP en puerto 8000
    $command = 'cd ' . __DIR__ . '/tickets-backend/public && php -S localhost:8000 > /dev/null 2>&1 &';
    
    echo "📡 Comando: $command\n";
    echo "🌐 Servidor se iniciará en: http://localhost:8000/api/office?action=distribution\n";
    
    // Ejecutar comando
    shell_exec($command);
    
    echo "✅ Servidor iniciado en segundo plano\n";
    echo "📋 URL para el frontend: http://localhost:8000/api/office?action=distribution\n";
}

echo "\n🎯 ACCIONES REQUERIDAS:\n";
echo "==============================================\n";
echo "1. ✅ Servidor web iniciado en puerto 8000\n";
echo "2. 🔄 Actualizar frontend para usar puerto 8000\n";
echo "3. 🧪 Probar conexión del frontend al backend\n";
echo "4. 📄 Verificar que el PDF use datos reales\n";

echo "\n⚠️ NOTA IMPORTANTE:\n";
echo "==============================================\n";
echo "El frontend estaba intentando conectar al puerto 80 (Apache/XAMPP)\n";
echo "Pero ahora usaremos el servidor PHP integrado en puerto 8000\n";
echo "Esto asegura que el backend esté disponible para el frontend\n";
?>
