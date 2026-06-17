<?php

declare(strict_types=1);

final class BienesProxyService
{
    private const XAMPP_HOST = '127.0.0.1';
    private const XAMPP_PORT = 8012;
    private const BIENES_PATH = '/bienes/bienes.php';
    private const UNIDADES_PATH = '/bienes/unidades.php';

    private string $cacheDir;
    private int $cacheTtl;
    private int $fetchTimeout;

    public function __construct(
        ?string $cacheDir = null,
        int $cacheTtl = 7200,
        int $fetchTimeout = 60
    ) {
        $this->cacheDir = $cacheDir ?? sys_get_temp_dir() . '/bienes_proxy_cache';
        $this->cacheTtl = $cacheTtl;
        $this->fetchTimeout = $fetchTimeout;

        if (!is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0755, true);
        }
    }

    /**
     * Proxy a search/listing request to the SIFA bienes API via XAMPP.
     *
     * @param array{page?: int, limit?: int, query?: string} $params
     * @return array{success: bool, total: int, page: int, limit: int, data: array, cached: bool, stale?: bool}
     */
    public function fetchBienes(array $params = []): array
    {
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = max(1, min(100, (int)($params['limit'] ?? 12)));
        $query = trim((string)($params['query'] ?? ''));

        $queryString = http_build_query([
            'page' => $page,
            'limit' => $limit,
            'query' => $query,
        ]);

        return $this->request(self::BIENES_PATH, $queryString);
    }

    /**
     * Proxy a unidades search request to the SIFA API via XAMPP.
     *
     * @param array{page?: int, limit?: int, query?: string, tabla?: string} $params
     * @return array{success: bool, total: int, page: int, limit: int, data: array, cached: bool, stale?: bool}
     */
    public function fetchUnidades(array $params = []): array
    {
        $page = max(1, (int)($params['page'] ?? 1));
        $limit = max(1, min(100, (int)($params['limit'] ?? 12)));
        $query = trim((string)($params['query'] ?? ''));
        $tabla = trim((string)($params['tabla'] ?? ''));

        $qsParams = ['page' => $page, 'limit' => $limit];
        if ($query !== '') $qsParams['query'] = $query;
        if ($tabla !== '') $qsParams['tabla'] = $tabla;

        return $this->request(self::UNIDADES_PATH, http_build_query($qsParams));
    }

    /**
     * Clear the local proxy cache.
     */
    public function clearCache(): void
    {
        $files = glob($this->cacheDir . '/*.json');
        if ($files === false) return;
        foreach ($files as $file) {
            @unlink($file);
        }
    }

    // -------------------------------------------------------------------------
    // Private
    // -------------------------------------------------------------------------

    /**
     * Core request method: check cache → fetch from XAMPP → fallback to stale cache.
     */
    private function request(string $path, string $queryString): array
    {
        $cacheKey = md5($path . '|' . $queryString);
        $cacheFile = $this->cacheDir . '/' . $cacheKey . '.json';

        // 1. Fresh cache hit
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $this->cacheTtl) {
            $cached = $this->readCache($cacheFile);
            if ($cached !== null) {
                $cached['cached'] = true;
                return $cached;
            }
        }

        // 2. Fetch from XAMPP
        $responseBody = $this->httpGet($path, $queryString);

        if ($responseBody !== null) {
            $decoded = json_decode($responseBody, true);
            if (is_array($decoded) && ($decoded['success'] ?? null) === true) {
                $result = [
                    'success' => true,
                    'total' => (int)($decoded['total_filas'] ?? $decoded['total'] ?? 0),
                    'page' => (int)($decoded['page'] ?? 1),
                    'limit' => (int)($decoded['limit'] ?? 12),
                    'data' => $decoded['data'] ?? [],
                    'cached' => false,
                ];
                $this->writeCache($cacheFile, $result);
                return $result;
            }

            // XAMPP returned non-success response
            if (is_array($decoded)) {
                // Try stale cache fallback even for non-success responses
                if (file_exists($cacheFile)) {
                    $stale = $this->readCache($cacheFile);
                    if ($stale !== null) {
                        $stale['cached'] = true;
                        $stale['stale'] = true;
                        return $stale;
                    }
                }
                return [
                    'success' => false,
                    'total' => 0,
                    'page' => 1,
                    'limit' => 12,
                    'data' => [],
                    'cached' => false,
                    'error' => $decoded['error'] ?? $decoded['message'] ?? 'Error del servicio SIFA',
                ];
            }
        }

        // 3. XAMPP unreachable — serve stale cache
        if (file_exists($cacheFile)) {
            $stale = $this->readCache($cacheFile);
            if ($stale !== null) {
                $stale['cached'] = true;
                $stale['stale'] = true;
                return $stale;
            }
        }

        return [
            'success' => false,
            'total' => 0,
            'page' => 1,
            'limit' => 12,
            'data' => [],
            'cached' => false,
            'error' => 'No se pudo conectar con el servicio de bienes (SIFA)',
        ];
    }

    private function httpGet(string $path, string $queryString): ?string
    {
        $url = sprintf('http://%s:%d%s?%s', self::XAMPP_HOST, self::XAMPP_PORT, $path, $queryString);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->fetchTimeout,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Connection: keep-alive',
            ],
            CURLOPT_FOLLOWLOCATION => false,
        ]);

        $body = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($body === false || $httpCode !== 200) {
            error_log(sprintf(
                '[BienesProxy] Failed: HTTP %d, error: %s, url: %s',
                $httpCode, $error ?: 'unknown', $url
            ));
            return null;
        }

        return $body;
    }

    private function readCache(string $file): ?array
    {
        $raw = @file_get_contents($file);
        if ($raw === false) return null;
        $data = json_decode($raw, true);
        return is_array($data) ? $data : null;
    }

    private function writeCache(string $file, array $data): void
    {
        @file_put_contents(
            $file,
            json_encode($data, JSON_UNESCAPED_UNICODE),
            LOCK_EX
        );
    }
}
