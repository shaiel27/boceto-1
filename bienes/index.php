<?php
error_reporting(0);
ini_set('display_errors', 0);
require_once __DIR__.'/includes/security.php';
require_once __DIR__.'/includes/ConfigSecurity.php';

Security::initSession();
Security::setSecurityHeaders();

$headers = getallheaders();
// Bypass authentication for public access
$isAuthenticated = true;
// =========================================================================

// =========================================================================
// SOLUCIÓN AL PROBLEMA OCULTO: Validar que ConfigSecurity no devuelva un Array
// =========================================================================
$proxy_url_raw = ConfigSecurity::get('PROXY_API_URL', 'http://192.168.0.22/api/index.php');

// Si el sistema te devolvió un arreglo con datos en vez de la URL en texto
if (is_array($proxy_url_raw)) {
    // Intentamos sacar el valor usando llaves comunes de almacenamiento de configs
    $url_base = $proxy_url_raw['url'] ?? $proxy_url_raw['value'] ?? $proxy_url_raw[0] ?? 'http://127.0.0.1/bienes/consultar_api.php';
} else {
    $url_base = (string)$proxy_url_raw;
}

// Función de respaldo por si $_GET sigue trayendo datos complejos
function aplanarArrayParaQuery($array, $prefijo = '') {
    $resultado = [];
    foreach ($array as $llave => $valor) {
        $nuevaLlave = $prefijo ? $prefijo . '[' . $llave . ']' : $llave;
        if (is_array($valor)) {
            $resultado = array_merge($resultado, aplanarArrayParaQuery($valor, $nuevaLlave));
        } else {
            $resultado[$nuevaLlave] = (string)$valor;
        }
    }
    return $resultado;
}

$queryString = '';
if (!empty($_GET)) {
    $getLimpiado = aplanarArrayParaQuery($_GET);
    $queryString = '?' . http_build_query($getLimpiado, '', '&', PHP_QUERY_RFC3986);
}

// LÍNEA 18 TOTALMENTE PROTEGIDA CONTRA ARRAYS
$url = $url_base . $queryString;

// Asegurar también que la API KEY sea un string y no un array de config
$api_key_raw = ConfigSecurity::get('PROXY_API_KEY', 'MiClaveSecretaUltraSegura123*');
$api_key = is_array($api_key_raw) ? ($api_key_raw['key'] ?? $api_key_raw['value'] ?? $api_key_raw[0] ?? 'MiClaveSecretaUltraSegura123*') : (string)$api_key_raw;

// Generar JWT dinámico para autenticarse contra la API remota
$forward_jwt = ConfigSecurity::generateJwt(['role' => 'proxy_client', 'user' => $_SESSION['usuario'] ?? 'guest']);

// =========================================================================

// 2. Inicializar cURL
$ch = curl_init();

// 3. Configurar las opciones de la petición
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET"); 
curl_setopt($ch, CURLOPT_TIMEOUT, 120);          

// 4. Inyectar la cabecera de seguridad con el Token y la Clave API
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "X-API-KEY: " . $api_key,
    "Authorization: Bearer " . $forward_jwt,
    "Content-Type: application/json"
]);

// 5. Ejecutar la petición y atrapar la respuesta
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// 6. Manejo de posibles errores de red/conexión
if (curl_errno($ch)) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Error de conexión de red: " . curl_error($ch)]);
    curl_close($ch);
    exit();
}

curl_close($ch);

// 7. Procesar y devolver la respuesta de la API como JSON puro
if ($http_code === 200) {
    header('Content-Type: application/json');
    echo $response;
} else {
    header('Content-Type: application/json');
    echo json_encode(['total' => 0, 'page' => 1, 'limit' => 12, 'results' => []]);
}
?>