<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

final class OfficeSyncService
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Sync offices from SIFA API via PHP proxy
     */
    public function sync(): array
    {
        $apiUrl = 'http://127.0.0.1:8012/bienes/unidades.php?tabla=spg_unidadadministrativa&limit=500';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || $response === false) {
            return [
                'success' => false,
                'message' => 'Error al conectar con la API de bienes',
                'synced' => 0,
                'total' => 0
            ];
        }

        $json = json_decode($response, true);
        if (!$json || !isset($json['success']) || !$json['success']) {
            return [
                'success' => false,
                'message' => 'Respuesta invalida de la API',
                'synced' => 0,
                'total' => 0
            ];
        }

        $items = $json['data'] ?? $json['results'] ?? [];
        if (empty($items)) {
            return [
                'success' => false,
                'message' => 'No se encontraron oficinas en la API',
                'synced' => 0,
                'total' => 0
            ];
        }

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
            'skipped' => $skipped
        ];
    }
}