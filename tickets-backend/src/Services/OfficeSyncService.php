<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/BienesProxyService.php';

final class OfficeSyncService
{
    private PDO $db;
    private BienesProxyService $sifa;

    public function __construct(
        PDO $db,
        ?BienesProxyService $sifa = null,
    ) {
        $this->db = $db;
        $this->sifa = $sifa ?? new BienesProxyService();
    }

    /**
     * Sync all offices from PostgreSQL (snof_hunidadamin) into MySQL Office table.
     *
     * Strategy:
     * 1. Fetch all from PostgreSQL
     * 2. UPSERT each: match by coduniadm → UPDATE name, or INSERT new
     * 3. Clean up stale SIFA records (coduniadm NOT in PostgreSQL set)
     *
     * @return array{success: bool, message: string, synced: int, total: int, inserted: int, updated: int, cleaned: int}
     */
    public function sync(): array
    {
        // 1. Fetch source data from SIFA API
        $sifaItems = $this->fetchFromSifa();
        if (empty($sifaItems)) {
            return $this->result(false, 'No se encontraron oficinas en SIFA', 0, 0);
        }

        $pgCodes = [];

        foreach ($sifaItems as $item) {
            $code = trim((string) ($item['coduniadm'] ?? ''));
            $name = trim((string) ($item['denuniadm'] ?? ''));

            if ($code !== '') {
                $pgCodes[$code] = $name;
            }
        }

        // 3. Load existing MySQL offices
        $existingRows = $this->db
            ->query("SELECT ID_Office, Name_Office, coduniadm FROM Office ORDER BY Name_Office ASC")
            ->fetchAll(PDO::FETCH_ASSOC);

        $existingByCode = [];

        foreach ($existingRows as $row) {
            $code = $row['coduniadm'] ?? '';
            if ($code !== '') {
                $existingByCode[$code] = $row;
            }
        }

        // 4. UPSERT: match solo por coduniadm (cada oficina tiene coduniadm único)
        $updateStmt = $this->db->prepare(
            "UPDATE Office SET Name_Office = :name, coduniadm = :coduniadm WHERE ID_Office = :id"
        );
        $insertStmt = $this->db->prepare(
            "INSERT INTO Office (coduniadm, Name_Office, created_at) VALUES (:coduniadm, :name, NOW())"
        );

        $inserted = 0;
        $updated = 0;

        foreach ($pgCodes as $code => $name) {
            $matchedId = null;

            // Try exact coduniadm match
            if (isset($existingByCode[$code])) {
                $matchedId = (int) $existingByCode[$code]['ID_Office'];
            }

            if ($matchedId !== null) {
                $updateStmt->bindValue(':name', $name);
                $updateStmt->bindValue(':coduniadm', $code);
                $updateStmt->bindValue(':id', $matchedId, PDO::PARAM_INT);
                $updateStmt->execute();
                $updated++;
            } else {
                $insertStmt->bindValue(':coduniadm', $code);
                $insertStmt->bindValue(':name', $name);
                $insertStmt->execute();
                $inserted++;
            }
        }

        // 5. Clean stale SIFA records (coduniadm NOT in PostgreSQL set)
        $pgCodeSet = [];
        foreach ($pgCodes as $code => $name) {
            $pgCodeSet[$code] = true;
        }

        $staleCodes = [];
        foreach ($existingByCode as $code => $row) {
            if (!isset($pgCodeSet[$code])) {
                $staleCodes[] = $code;
            }
        }

        $cleaned = 0;
        if (!empty($staleCodes)) {
            $placeholders = implode(',', array_fill(0, count($staleCodes), '?'));
                $cleanStmt = $this->db->prepare(
                    "DELETE FROM Office WHERE coduniadm IN ({$placeholders})
                     AND ID_Office NOT IN (
                         SELECT Fk_Office FROM Service_Request WHERE Fk_Office IS NOT NULL
                     )"
                );
            foreach ($staleCodes as $i => $code) {
                $cleanStmt->bindValue($i + 1, $code);
            }
            $cleanStmt->execute();
            $cleaned = $cleanStmt->rowCount();

            error_log('[OfficeSync] Limpiadas ' . $cleaned . ' oficinas obsoletas de ' . count($staleCodes) . ' candidatas');
        }

        return $this->result(
            true,
            "Sincronizacion completada: {$inserted} nuevas, {$updated} actualizadas, {$cleaned} obsoletas eliminadas",
            $inserted + $updated,
            count($sifaItems),
            $inserted,
            $updated,
            $cleaned,
        );
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private function fetchFromSifa(): array
    {
        try {
            $result = $this->sifa->fetchAllUnidades(['tabla' => 'sno_unidadadmin']);
            if (!$result['success']) {
                throw new RuntimeException('Error al obtener oficinas desde SIFA');
            }
            // sno_unidadadmin no tiene coduniadm; derivarlo desde depuniadm(2) + prouniadm(2)
            $data = $result['data'];
            foreach ($data as &$item) {
                $depuniadm = trim((string)($item['depuniadm'] ?? ''));
                $prouniadm = trim((string)($item['prouniadm'] ?? ''));
                if ($prouniadm !== '') {
                    $item['coduniadm'] = str_pad($depuniadm . $prouniadm, 10, '0', STR_PAD_LEFT);
                }
                if (empty($item['denuniadm']) && !empty($item['desuniadm'])) {
                    $item['denuniadm'] = $item['desuniadm'];
                }
            }
            unset($item);
            return $data;
        } catch (Exception $e) {
            error_log('[OfficeSync] Error SIFA: ' . $e->getMessage());
            throw $e;
        }
    }

    private static function normalize(string $s): string
    {
        $s = mb_strtolower(trim($s), 'UTF-8');
        $s = str_replace(
            ['á','é','í','ó','ú','ü','ñ','Á','É','Í','Ó','Ú','Ü','Ñ'],
            ['a','e','i','o','u','u','n','a','e','i','o','u','u','n'],
            $s
        );
        return $s;
    }

    private function result(
        bool $success,
        string $message,
        int $synced,
        int $total,
        int $inserted = 0,
        int $updated = 0,
        int $cleaned = 0,
    ): array {
        return [
            'success' => $success,
            'message' => $message,
            'synced'  => $synced,
            'total'   => $total,
            'inserted' => $inserted,
            'updated'  => $updated,
            'cleaned'  => $cleaned,
        ];
    }
}
