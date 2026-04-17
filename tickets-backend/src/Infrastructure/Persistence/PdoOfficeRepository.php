<?php

namespace App\Infrastructure\Persistence;

use App\Core\Database;
use App\Domain\Organization\Office;
use App\Domain\Organization\OfficeRepositoryInterface;
use PDO;

class PdoOfficeRepository implements OfficeRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findById(int $id): ?Office
    {
        $stmt = $this->db->prepare("SELECT * FROM Office WHERE ID_Office = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapToEntity($data) : null;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM Office ORDER BY created_at DESC");
        $offices = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $offices[] = $this->mapToEntity($data);
        }
        return $offices;
    }

    public function findByType(string $type): array
    {
        $stmt = $this->db->prepare("SELECT * FROM Office WHERE Office_Type = :type ORDER BY created_at DESC");
        $stmt->execute(['type' => $type]);
        $offices = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $offices[] = $this->mapToEntity($data);
        }
        return $offices;
    }

    public function findChildren(int $parentId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM Office WHERE Fk_Parent_Office = :parent_id ORDER BY created_at DESC");
        $stmt->execute(['parent_id' => $parentId]);
        $offices = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $offices[] = $this->mapToEntity($data);
        }
        return $offices;
    }

    public function findTree(): array
    {
        $stmt = $this->db->query("
            SELECT o.*, parent.Name_Office as parent_name 
            FROM Office o 
            LEFT JOIN Office parent ON o.Fk_Parent_Office = parent.ID_Office
            ORDER BY 
                CASE o.Office_Type
                    WHEN 'Direction' THEN 1
                    WHEN 'Division' THEN 2
                    WHEN 'Coordination' THEN 3
                END,
                o.Name_Office
        ");
        $offices = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $offices[] = $this->mapToEntity($data);
        }
        return $offices;
    }

    public function save(Office $office): Office
    {
        if ($office->getId() === null) {
            $stmt = $this->db->prepare(
                "INSERT INTO Office (Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID) 
                 VALUES (:name_office, :office_type, :fk_parent_office, :fk_boss_id)"
            );
            $stmt->execute([
                'name_office' => $office->getNameOffice(),
                'office_type' => $office->getOfficeType(),
                'fk_parent_office' => $office->getFkParentOffice(),
                'fk_boss_id' => $office->getFkBossId(),
            ]);
            $office->setId((int)$this->db->lastInsertId());
        } else {
            $stmt = $this->db->prepare(
                "UPDATE Office SET Name_Office = :name_office, Office_Type = :office_type, 
                 Fk_Parent_Office = :fk_parent_office, Fk_Boss_ID = :fk_boss_id 
                 WHERE ID_Office = :id"
            );
            $stmt->execute([
                'id' => $office->getId(),
                'name_office' => $office->getNameOffice(),
                'office_type' => $office->getOfficeType(),
                'fk_parent_office' => $office->getFkParentOffice(),
                'fk_boss_id' => $office->getFkBossId(),
            ]);
        }
        return $office;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM Office WHERE ID_Office = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function findPermissionsByOfficeId(int $officeId): array
    {
        $stmt = $this->db->prepare("
            SELECT sp.*, ts.Type_Service 
            FROM Service_Permissions sp
            JOIN TI_Service ts ON sp.Fk_TI_Service = ts.ID_TI_Service
            WHERE sp.Fk_Office = :office_id AND sp.Is_Allowed = 1
        ");
        $stmt->execute(['office_id' => $officeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findRequestSettings(int $officeId): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM Request_Settings WHERE Fk_Office_ID = :office_id");
        $stmt->execute(['office_id' => $officeId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ?: null;
    }

    private function mapToEntity(array $data): Office
    {
        return new Office(
            (int)($data['ID_Office'] ?? $data['id'] ?? null),
            $data['Name_Office'] ?? $data['name_office'] ?? '',
            $data['Office_Type'] ?? $data['office_type'] ?? '',
            $data['Fk_Parent_Office'] ?? $data['fk_parent_office'] ?? null,
            $data['Fk_Boss_ID'] ?? $data['fk_boss_id'] ?? null,
            $data['created_at'] ?? null
        );
    }
}
