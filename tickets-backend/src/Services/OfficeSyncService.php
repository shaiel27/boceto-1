<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/BienesProxyService.php';

final class OfficeSyncService
{
    private PDO $db;
    private BienesProxyService $bienesProxy;

    public function __construct(
        PDO $db,
        ?BienesProxyService $bienesProxy = null,
        string $xamppHost = '127.0.0.1',
        int $xamppPort = 8012
    ) {
        $this->db = $db;
        $this->bienesProxy = $bienesProxy ?? new BienesProxyService(
            cacheDir: __DIR__ . '/../../cache/bienes',
            cacheTtl: 7200,
            fetchTimeout: 60,
            xamppHost: $xamppHost,
            xamppPort: $xamppPort
        );
    }

    /**
     * Sync offices from SIFA API via BienesProxyService
     */
    public function sync(): array
    {
        $result = $this->bienesProxy->fetchUnidades([
            'tabla' => 'spg_unidadadministrativa',
            'limit' => 500,
        ]);

        if (!$result['success'] || empty($result['data'])) {
            return [
                'success' => false,
                'message' => 'Error al conectar con la API de bienes',
                'synced' => 0,
                'total' => 0,
            ];
        }

        $items = $result['data'];
        $synced = 0;
        $skipped = 0;

        foreach ($items as $item) {
            $coduniadm = trim($item['coduniadm'] ?? '');
            $nameOffice = trim($item['denuniadm'] ?? '');

            if ($coduniadm === '' || $coduniadm === '----------') {
                $skipped++;
                continue;
            }
            if ($nameOffice === '' || $nameOffice === 'NINGUNA') {
                $skipped++;
                continue;
            }

            $stmt = $this->db->prepare(
                "INSERT INTO Office (coduniadm, Name_Office, created_at)
                 VALUES (:coduniadm, :name, NOW())
                 ON DUPLICATE KEY UPDATE Name_Office = :name2"
            );
            $stmt->bindValue(':coduniadm', $coduniadm);
            $stmt->bindValue(':name', $nameOffice);
            $stmt->bindValue(':name2', $nameOffice);
            $stmt->execute();

            $synced++;
        }

        return [
            'success' => true,
            'message' => "Sincronizacion completada: $synced oficinas sincronizadas",
            'synced' => $synced,
            'total' => count($items),
            'skipped' => $skipped,
        ];
    }
}