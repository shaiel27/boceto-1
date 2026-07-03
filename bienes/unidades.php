<?php
error_reporting(0);
ini_set('display_errors', 0);
require_once __DIR__.'/includes/security.php';
require_once __DIR__.'/includes/ConfigSecurity.php';

Security::initSession();
Security::setSecurityHeaders();

$proxy_url_raw = ConfigSecurity::get('PROXY_API_URL', 'http://192.168.0.22/api/index.php');
if (is_array($proxy_url_raw)) {
    $url_base = $proxy_url_raw['url'] ?? $proxy_url_raw['value'] ?? $proxy_url_raw[0] ?? 'http://192.168.0.22/api/index.php';
} else {
    $url_base = (string)$proxy_url_raw;
}

$api_key_raw = ConfigSecurity::get('PROXY_API_KEY', 'MiClaveSecretaUltraSegura123*');
$api_key = is_array($api_key_raw) ? ($api_key_raw['key'] ?? $api_key_raw['value'] ?? $api_key_raw[0] ?? 'MiClaveSecretaUltraSegura123*') : (string)$api_key_raw;

$forward_jwt = ConfigSecurity::generateJwt(['role' => 'proxy_client', 'user' => $_SESSION['usuario'] ?? 'guest']);

$queryString = '';
if (!empty($_GET)) {
    $params = $_GET;
    $queryString = '?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986);
}

$url = $url_base . $queryString;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "X-API-KEY: " . $api_key,
    "Authorization: Bearer " . $forward_jwt,
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => "Error de conexion: " . curl_error($ch)]);
    curl_close($ch);
    exit();
}

curl_close($ch);

if ($http_code === 200) {
    header('Content-Type: application/json');
    echo $response;
} else {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'HTTP ' . $http_code]);
}