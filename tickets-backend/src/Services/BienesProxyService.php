<?php

declare(strict_types=1);

final class BienesProxyService
{
    private const BIENES_PATH  = '/bienes/bienes.php';
    private const UNIDADES_PATH = '/bienes/unidades.php';

    private string $host;
    private int $port;
    private int $fetchTimeout;

    public function __construct(
        string $host = '192.168.0.22',
        int $port = 8012,
        int $fetchTimeout = 120,
    ) {
        $this->host = $host;
        $this->port = $port;
        $this->fetchTimeout = $fetchTimeout;
    }

    /**
     * @param array{page?: int, limit?: int, query?: string} $params
     * @return array{success: bool, total: int, page: int, limit: int, data: array}
     */
    public function fetchBienes(array $params = []): array
    {
        $page  = max(1, (int)($params['page'] ?? 1));
        $limit = max(1, min(500, (int)($params['limit'] ?? 12)));
        $query = trim((string)($params['query'] ?? ''));

        $qs = http_build_query([
            'page'  => $page,
            'limit' => $limit,
            'query' => $query,
        ]);

        return $this->request(self::BIENES_PATH, $qs);
    }

    /**
     * @param array{page?: int, limit?: int, query?: string, tabla?: string} $params
     * @return array{success: bool, total: int, page: int, limit: int, data: array}
     */
    public function fetchUnidades(array $params = []): array
    {
        $page  = max(1, (int)($params['page'] ?? 1));
        $limit = max(1, min(500, (int)($params['limit'] ?? 12)));
        $query = trim((string)($params['query'] ?? ''));
        $tabla = trim((string)($params['tabla'] ?? ''));

        $qsParams = ['page' => $page, 'limit' => $limit];
        if ($query !== '') $qsParams['query'] = $query;
        if ($tabla !== '') $qsParams['tabla'] = $tabla;

        return $this->request(self::UNIDADES_PATH, http_build_query($qsParams));
    }

    /**
     * Fetch ALL unidades by paginating through the SIFA API.
     */
    public function fetchAllUnidades(array $params = []): array
    {
        $tabla = trim((string)($params['tabla'] ?? ''));
        $allData = [];
        $page = 1;
        $limit = 500;

        while (true) {
            $qsParams = ['page' => $page, 'limit' => $limit];
            if ($tabla !== '') $qsParams['tabla'] = $tabla;

            $response = $this->request(self::UNIDADES_PATH, http_build_query($qsParams));

            if (!$response['success']) {
                if ($page === 1) {
                    return ['success' => false, 'data' => [], 'total' => 0, 'synced' => 0];
                }
                break;
            }

            $items = $response['data'] ?? [];
            if (empty($items)) {
                break;
            }

            $allData = array_merge($allData, $items);
            $totalItems = $response['total'] ?? 0;

            if (count($allData) >= $totalItems) {
                break;
            }

            $page++;
        }

        return [
            'success' => true,
            'data'    => $allData,
            'total'   => count($allData),
            'synced'  => count($allData),
        ];
    }

    // ---------------------------------------------------------------
    // Private
    // ---------------------------------------------------------------

    private function request(string $path, string $queryString): array
    {
        $responseBody = $this->httpGet($path, $queryString);

        if ($responseBody !== null) {
            $decoded = json_decode($responseBody, true);
            if (is_array($decoded)) {
                return [
                    'success' => (bool)($decoded['success'] ?? false),
                    'total'   => (int)($decoded['total_filas'] ?? $decoded['total'] ?? 0),
                    'page'    => (int)($decoded['page'] ?? 1),
                    'limit'   => (int)($decoded['limit'] ?? 12),
                    'data'    => $decoded['data'] ?? [],
                ];
            }
        }

        return [
            'success' => false,
            'total'   => 0,
            'page'    => 1,
            'limit'   => 12,
            'data'    => [],
        ];
    }

    private function httpGet(string $path, string $queryString): ?string
    {
        $url = sprintf('http://%s:%d%s?%s', $this->host, $this->port, $path, $queryString);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => $this->fetchTimeout,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_HTTPHEADER     => ['Accept: application/json'],
            CURLOPT_FOLLOWLOCATION => false,
        ]);

        $body     = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($body === false || $httpCode !== 200) {
            error_log(sprintf(
                '[BienesProxy] HTTP %d, error: %s, url: %s',
                $httpCode,
                $error ?: 'unknown',
                $url,
            ));
            return null;
        }

        return $body;
    }
}
