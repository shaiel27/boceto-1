<?php
/**
 * PHP-PRO DIAGNÓSTICO PROFESIONAL - REPORTE POR OFICINA
 * 
 * Diagnóstico estructurado siguiendo principios PHP-PRO:
 * - Strict typing
 * - Type safety
 * - Proper error handling
 * - PSR compliance
 */

declare(strict_types=1);

echo "🔍 PHP-PRO DIAGNÓSTICO PROFESIONAL\n";
echo "===================================\n";

/**
 * Interface para diagnóstico
 */
interface DiagnósticoInterface
{
    public function verificarConexiónBD(): bool;
    public function verificarModeloOffice(): array;
    public function verificarOfficeController(): array;
    public function verificarEndpointAPI(): array;
    public function generarReporte(): array;
}

/**
 * Clase de diagnóstico PHP-PRO
 */
final class DiagnósticoOfficeReport implements DiagnósticoInterface
{
    private $conn;
    private array $errores = [];
    private array $warnings = [];
    private array $resultados = [];

    public function __construct()
    {
        try {
            require_once __DIR__ . '/tickets-backend/src/config/database.php';
            $database = new Database();
            $this->conn = $database->getConnection();
        } catch (Exception $e) {
            $this->conn = null;
            $this->errores[] = "Error de conexión BD: " . $e->getMessage();
        }
    }

    public function verificarConexiónBD(): bool
    {
        echo "\n📋 PASO 1: Verificando conexión a BD\n";
        echo "===================================\n";

        if ($this->conn === null) {
            echo "❌ No hay conexión a BD\n";
            return false;
        }

        try {
            // Verificar tablas críticas
            $tablas = ['Office', 'Service_Request', 'Users'];
            foreach ($tablas as $tabla) {
                $stmt = $this->conn->query("SHOW TABLES LIKE '$tabla'");
                if ($stmt->rowCount() > 0) {
                    echo "✅ Tabla '$tabla' existe\n";
                    
                    // Contar registros
                    $countStmt = $this->conn->query("SELECT COUNT(*) as count FROM $tabla");
                    $count = $countStmt->fetch(PDO::FETCH_ASSOC);
                    echo "   📊 Registros: {$count['count']}\n";
                } else {
                    $this->errores[] = "Tabla '$tabla' no existe";
                    echo "❌ Tabla '$tabla' NO existe\n";
                }
            }
            return true;
        } catch (PDOException $e) {
            $this->errores[] = "Error BD: " . $e->getMessage();
            echo "❌ Error PDO: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public function verificarModeloOffice(): array
    {
        echo "\n📋 PASO 2: Verificando modelo Office (PHP-PRO)\n";
        echo "===================================\n";

        $modelFile = __DIR__ . '/tickets-backend/src/models/Office.php';
        if (!file_exists($modelFile)) {
            $this->errores[] = "Modelo Office.php no existe";
            echo "❌ Modelo Office.php NO existe\n";
            return [];
        }

        echo "✅ Modelo Office.php existe\n";

        // Verificar strict typing
        $content = file_get_contents($modelFile);
        if (!str_contains($content, 'declare(strict_types=1)')) {
            $this->warnings[] = "Modelo Office no usa strict typing";
            echo "⚠️  No usa declare(strict_types=1)\n";
        } else {
            echo "✅ Usa strict typing\n";
        }

        // Verificar tipo de retorno en métodos
        if (str_contains($content, 'function getTicketsByOffice')) {
            echo "✅ Método getTicketsByOffice existe\n";
            
            // Verificar si retorna array tipado
            if (str_contains($content, ': array')) {
                echo "✅ Método tiene tipo de retorno array\n";
            } else {
                $this->warnings[] = "Método getTicketsByOffice sin tipo de retorno";
                echo "⚠️  Método sin tipo de retorno\n";
            }
        } else {
            $this->errores[] = "Método getTicketsByOffice no existe";
            echo "❌ Método getTicketsByOffice NO existe\n";
        }

        // Probar el modelo directamente
        if ($this->conn !== null) {
            try {
                require_once $modelFile;
                $office = new Office($this->conn);
                $data = $office->getTicketsByOffice();
                
                echo "📊 Resultado del modelo:\n";
                if (is_array($data) && count($data) > 0) {
                    echo "✅ Modelo devuelve " . count($data) . " oficinas\n";
                    $this->resultados['model_data'] = $data;
                    
                    // Verificar estructura de datos
                    $first = $data[0] ?? [];
                    $camposEsperados = ['id', 'name', 'type', 'resolved_count', 'avg_resolution_time'];
                    $camposFaltantes = array_diff($camposEsperados, array_keys($first));
                    
                    if (empty($camposFaltantes)) {
                        echo "✅ Estructura de datos correcta\n";
                    } else {
                        $this->errores[] = "Campos faltantes: " . implode(', ', $camposFaltantes);
                        echo "❌ Campos faltantes: " . implode(', ', $camposFaltantes) . "\n";
                    }
                } else {
                    $this->errores[] = "Modelo no devuelve datos o devuelve array vacío";
                    echo "❌ Modelo no devuelve datos\n";
                }
            } catch (Exception $e) {
                $this->errores[] = "Error al probar modelo: " . $e->getMessage();
                echo "❌ Error al probar modelo: " . $e->getMessage() . "\n";
            }
        }

        return $this->resultados;
    }

    public function verificarOfficeController(): array
    {
        echo "\n📋 PASO 3: Verificando OfficeController (PHP-PRO)\n";
        echo "===================================\n";

        $controllerFile = __DIR__ . '/tickets-backend/src/controllers/OfficeController.php';
        if (!file_exists($controllerFile)) {
            $this->errores[] = "OfficeController.php no existe";
            echo "❌ OfficeController.php NO existe\n";
            return [];
        }

        echo "✅ OfficeController.php existe\n";

        $content = file_get_contents($controllerFile);
        
        // Verificar strict typing
        if (!str_contains($content, 'declare(strict_types=1)')) {
            $this->warnings[] = "Controller no usa strict typing";
            echo "⚠️  No usa declare(strict_types=1)\n";
        } else {
            echo "✅ Usa strict typing\n";
        }

        // Verificar CORS headers
        if (str_contains($content, 'Access-Control-Allow-Origin')) {
            echo "✅ Tiene headers CORS\n";
        } else {
            $this->warnings[] = "Controller no tiene headers CORS";
            echo "⚠️  No tiene headers CORS\n";
        }

        // Verificar Content-Type JSON
        if (str_contains($content, 'Content-Type: application/json')) {
            echo "✅ Tiene Content-Type JSON\n";
        } else {
            $this->warnings[] = "Controller no tiene Content-Type JSON";
            echo "⚠️  No tiene Content-Type JSON\n";
        }

        return [];
    }

    public function verificarEndpointAPI(): array
    {
        echo "\n📋 PASO 4: Verificando endpoint API\n";
        echo "===================================\n";

        $url = 'http://localhost:8000/api/office?action=distribution';
        
        echo "📡 Probando: $url\n";
        
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
        $error = curl_error($ch);
        curl_close($ch);
        
        echo "📊 HTTP Code: $httpCode\n";
        echo "📄 Response length: " . strlen($response) . " bytes\n";
        
        if ($httpCode === 200) {
            echo "✅ Endpoint responde HTTP 200\n";
            
            if ($response) {
                $data = json_decode($response, true);
                if ($data && isset($data['success'])) {
                    echo "✅ Respuesta JSON válida\n";
                    echo "📊 Success: " . ($data['success'] ? 'true' : 'false') . "\n";
                    echo "📝 Message: " . ($data['message'] ?? 'No message') . "\n";
                    
                    if (isset($data['data']) && is_array($data['data'])) {
                        echo "📊 Data count: " . count($data['data']) . "\n";
                        
                        if (count($data['data']) > 0) {
                            echo "✅ Endpoint devuelve datos\n";
                            $this->resultados['api_data'] = $data['data'];
                        } else {
                            $this->errores[] = "Endpoint devuelve array vacío";
                            echo "❌ Endpoint devuelve array vacío\n";
                        }
                    } else {
                        $this->errores[] = "Endpoint no tiene data en respuesta";
                        echo "❌ Endpoint no tiene data\n";
                    }
                } else {
                    $this->errores[] = "Respuesta JSON inválida";
                    echo "❌ Respuesta JSON inválida\n";
                    echo "📄 Raw response: " . substr($response, 0, 200) . "...\n";
                }
            } else {
                $this->errores[] = "Response vacía";
                echo "❌ Response vacía\n";
            }
        } else {
            $this->errores[] = "Endpoint error HTTP $httpCode: $error";
            echo "❌ Error: $error\n";
        }
        
        return $this->resultados;
    }

    public function generarReporte(): array
    {
        echo "\n🎯 REPORTE PHP-PRO\n";
        echo "===================================\n";
        
        $reporte = [
            'errores' => $this->errores,
            'warnings' => $this->warnings,
            'resultados' => $this->resultados,
            'estado' => empty($this->errores) ? 'OK' : 'ERROR'
        ];
        
        echo "📊 Estado: " . $reporte['estado'] . "\n";
        echo "📋 Errores: " . count($this->errores) . "\n";
        echo "⚠️  Warnings: " . count($this->warnings) . "\n";
        
        if (!empty($this->errores)) {
            echo "\n❌ ERRORES:\n";
            foreach ($this->errores as $error) {
                echo "   - $error\n";
            }
        }
        
        if (!empty($this->warnings)) {
            echo "\n⚠️  WARNINGS:\n";
            foreach ($this->warnings as $warning) {
                echo "   - $warning\n";
            }
        }
        
        return $reporte;
    }
}

// Ejecutar diagnóstico
try {
    $diagnostico = new DiagnósticoOfficeReport();
    $diagnostico->verificarConexiónBD();
    $diagnostico->verificarModeloOffice();
    $diagnostico->verificarOfficeController();
    $diagnostico->verificarEndpointAPI();
    $reporte = $diagnostico->generarReporte();
    
    echo "\n🎯 DIAGNÓSTICO COMPLETADO\n";
    echo "===================================\n";
    
} catch (Exception $e) {
    echo "❌ Error fatal: " . $e->getMessage() . "\n";
}
?>
