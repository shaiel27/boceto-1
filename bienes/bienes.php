<?php
error_reporting(0);
ini_set('display_errors', 0);
require_once __DIR__.'/includes/security.php';
require_once __DIR__.'/includes/ConfigSecurity.php';

Security::initSession();

header('Content-Type: application/json; charset=utf-8');
header('X-Accel-Buffering: no');

$proxy_url_raw = ConfigSecurity::get('PROXY_API_URL', 'http://192.168.0.22/api/index.php');
if (is_array($proxy_url_raw)) {
    $url_base = $proxy_url_raw['url'] ?? $proxy_url_raw['value'] ?? $proxy_url_raw[0] ?? 'http://192.168.0.22/api/index.php';
} else {
    $url_base = (string)$proxy_url_raw;
}

$api_key_raw = ConfigSecurity::get('PROXY_API_KEY', 'MiClaveSecretaUltraSegura123*');
$api_key = is_array($api_key_raw) ? ($api_key_raw['key'] ?? $api_key_raw['value'] ?? $api_key_raw[0] ?? 'MiClaveSecretaUltraSegura123*') : (string)$api_key_raw;
$forward_jwt = ConfigSecurity::generateJwt(['role' => 'proxy_client', 'user' => $_SESSION['usuario'] ?? 'guest']);

function fetchApi($url, $api_key, $jwt) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "X-API-KEY: " . $api_key,
        "Authorization: Bearer " . $jwt,
        "Content-Type: application/json"
    ]);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if (curl_errno($ch)) {
        curl_close($ch);
        return null;
    }
    curl_close($ch);
    if ($http_code === 200) {
        return json_decode($response, true);
    }
    return null;
}

$cache_dir = __DIR__ . '/cache';
if (!is_dir($cache_dir)) {
    mkdir($cache_dir, 0755, true);
}

$cache_file = $cache_dir . '/bienes_merged.json';
$cache_ttl = 7200;

$action = $_GET['action'] ?? '';
$page = max(1, intval($_GET['page'] ?? 1));
$limit = max(1, min(100, intval($_GET['limit'] ?? 12)));
$query = trim($_GET['query'] ?? '');

if ($action === 'refresh') {
    if (file_exists($cache_file)) {
        unlink($cache_file);
    }
    echo json_encode(['success' => true, 'message' => 'Cache limpiado']);
    exit();
}

$bienes = null;
$from_cache = false;

if (file_exists($cache_file) && (time() - filemtime($cache_file)) < $cache_ttl) {
    $cached = json_decode(file_get_contents($cache_file), true);
    if ($cached !== null && isset($cached['data'])) {
        $bienes = $cached['data'];
        $from_cache = true;
    }
}

if ($bienes === null) {
    $bienes_data = fetchApi($url_base . '?tabla=saf_activo&limit=16685', $api_key, $forward_jwt);

    if ($bienes_data !== null) {
        $bienes = $bienes_data['data'] ?? $bienes_data['results'] ?? [];

        // Unidades administrativas - spg_unidadadministrativa (FK real de saf_dta.coduniadm)
        $udata = fetchApi($url_base . '?tabla=spg_unidadadministrativa&limit=500', $api_key, $forward_jwt);
        $unidad_lookup = [];
        if ($udata !== null) {
            foreach (($udata['data'] ?? $udata['results'] ?? []) as $u) {
                $coduniadm = trim($u['coduniadm'] ?? '');
                $denuniadm = trim($u['denuniadm'] ?? '');
                if ($coduniadm !== '' && $coduniadm !== '----------') {
                    $unidad_lookup[$coduniadm] = $denuniadm;
                }
            }
        }

        // saf_dta: relacion bien-oficina (estact=I = incorporado)
        $dta_data = fetchApi($url_base . '?tabla=saf_dta&limit=20000', $api_key, $forward_jwt);
        $dta_lookup = [];
        if ($dta_data !== null) {
            foreach (($dta_data['data'] ?? $dta_data['results'] ?? []) as $d) {
                $codact = trim($d['codact'] ?? '');
                $coduniadm = trim($d['coduniadm'] ?? '');
                $estact = trim($d['estact'] ?? '');
                if ($codact === '' || $coduniadm === '') continue;
                if ($estact === 'I') {
                    $dta_lookup[$codact] = $coduniadm;
                }
            }
        }

        // Merge denuniadm into each bien
        foreach ($bienes as &$bien) {
            $bien['denuniadm'] = '';
            $codact = trim($bien['codact'] ?? '');

            // Primary: saf_dta (latest incorporation)
            if (isset($dta_lookup[$codact]) && isset($unidad_lookup[$dta_lookup[$codact]])) {
                $bien['denuniadm'] = $unidad_lookup[$dta_lookup[$codact]];
            }

            // Fallback: codcencos
            if ($bien['denuniadm'] === '') {
                $codcencos = trim($bien['codcencos'] ?? '');
                if ($codcencos !== '' && $codcencos !== '---' && isset($unidad_lookup[$codcencos])) {
                    $bien['denuniadm'] = $unidad_lookup[$codcencos];
                }
            }
        }
        unset($bien);

        file_put_contents($cache_file, json_encode(['data' => $bienes, 'cached_at' => time()], JSON_UNESCAPED_UNICODE));
        $from_cache = false;
    }

    // Fallback: API failed — serve stale cache if it exists
    if ($bienes === null && file_exists($cache_file)) {
        $cached = json_decode(file_get_contents($cache_file), true);
        if ($cached !== null && isset($cached['data'])) {
            $bienes = $cached['data'];
            $from_cache = true;
        }
    }

    // Only error if no cache at all (fresh or stale)
    if ($bienes === null) {
        echo json_encode(['success' => false, 'error' => 'Error al obtener bienes', 'total_filas' => 0, 'data' => []]);
        exit();
    }
}

// Filter + paginate
$filtered = $bienes;
if ($query !== '') {
    $qLower = mb_strtolower($query, 'UTF-8');
    $filtered = array_values(array_filter($bienes, function($b) use ($qLower) {
        foreach (['denact','codact','obsact','maract','modact','denuniadm','nompro'] as $f) {
            $v = trim($b[$f] ?? '');
            if ($v !== '' && mb_stripos($v, $qLower, 0, 'UTF-8') !== false) return true;
        }
        return false;
    }));
}

$total = count($filtered);
$page_data = array_slice($filtered, ($page - 1) * $limit, $limit);

echo json_encode([
    'success' => true,
    'tabla' => 'saf_activo',
    'total_filas' => $total,
    'page' => $page,
    'limit' => $limit,
    'cached' => $from_cache,
    'data' => $page_data
], JSON_UNESCAPED_UNICODE);