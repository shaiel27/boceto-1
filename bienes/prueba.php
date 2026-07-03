<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once __DIR__ . '/includes/db_connection.php';
require_once __DIR__ . '/includes/security.php';

if (session_status() === PHP_SESSION_NONE) Security::initSession();

$db = Database::getInstance();

echo "<h2>Diagnóstico de API — Respuesta RAW</h2><hr>";

// TEST 1: Sin parámetros extra
echo "<h3>TEST 1: Sin parámetros (ping)</h3>";
$r1 = $db->queryAlcaldiaApi(['limit' => '1']);
echo "<pre>" . json_encode($r1, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
echo "last_api_error: " . htmlspecialchars($db->last_api_error) . "<hr>";

// TEST 2: Con query real
echo "<h3>TEST 2: Con parámetro query=computadora</h3>";
$r2 = $db->queryAlcaldiaApi(['query' => 'computadora', 'page' => '1', 'limit' => '5']);
echo "<pre>" . json_encode($r2, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
echo "last_api_error: " . htmlspecialchars($db->last_api_error) . "<hr>";

// TEST 3: Con action
echo "<h3>TEST 3: Con action=buscar_bien</h3>";
$r3 = $db->queryAlcaldiaApi(['action' => 'buscar_bien', 'query' => 'computadora', 'page' => '1', 'limit' => '5']);
echo "<pre>" . json_encode($r3, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
echo "last_api_error: " . htmlspecialchars($db->last_api_error) . "<hr>";

// TEST 4: Ver URL que se construye
echo "<h3>TEST 4: URL base configurada</h3>";
$url_raw = \ConfigSecurity::get('PROXY_API_URL', 'http://192.168.0.22/api/index.php');
echo "URL: <b>" . htmlspecialchars($url_raw) . "</b><hr>";
?>
