<?php

namespace App\Infrastructure\Persistence;

use App\Core\Database;
use App\Domain\Catalog\TiService;
use App\Domain\Catalog\ProblemCatalog;
use App\Domain\Catalog\SoftwareSystem;
use App\Domain\Catalog\CatalogRepositoryInterface;
use PDO;

class PdoCatalogRepository implements CatalogRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findAllServices(): array
    {
        $stmt = $this->db->query("SELECT * FROM TI_Service ORDER BY Type_Service");
        $services = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $services[] = $this->mapToService($data);
        }
        return $services;
    }

    public function findServiceById(int $id): ?TiService
    {
        $stmt = $this->db->prepare("SELECT * FROM TI_Service WHERE ID_TI_Service = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapToService($data) : null;
    }

    public function findProblemsByServiceId(int $serviceId): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM Service_Problems_Catalog 
            WHERE Fk_TI_Service = :service_id 
            ORDER BY Estimated_Severity DESC, Problem_Name
        ");
        $stmt->execute(['service_id' => $serviceId]);
        $problems = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $problems[] = $this->mapToProblem($data);
        }
        return $problems;
    }

    public function findProblemById(int $id): ?ProblemCatalog
    {
        $stmt = $this->db->prepare("SELECT * FROM Service_Problems_Catalog WHERE ID_Problem_Catalog = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapToProblem($data) : null;
    }

    public function findAllSystems(): array
    {
        $stmt = $this->db->query("SELECT * FROM Software_Systems ORDER BY System_Name");
        $systems = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $systems[] = $this->mapToSystem($data);
        }
        return $systems;
    }

    public function findSystemById(int $id): ?SoftwareSystem
    {
        $stmt = $this->db->prepare("SELECT * FROM Software_Systems WHERE ID_System = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapToSystem($data) : null;
    }

    public function findSystemsByOfficeId(int $officeId): array
    {
        $stmt = $this->db->prepare("
            SELECT ss.* FROM Software_Systems ss
            JOIN Office_Systems os ON ss.ID_System = os.Fk_System_ID
            WHERE os.Fk_Office_ID = :office_id
            ORDER BY ss.System_Name
        ");
        $stmt->execute(['office_id' => $officeId]);
        $systems = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $systems[] = $this->mapToSystem($data);
        }
        return $systems;
    }

    private function mapToService(array $data): TiService
    {
        return new TiService(
            (int)($data['ID_TI_Service'] ?? $data['id'] ?? null),
            $data['Type_Service'] ?? $data['type_service'] ?? '',
            $data['Details'] ?? $data['details'] ?? null
        );
    }

    private function mapToProblem(array $data): ProblemCatalog
    {
        return new ProblemCatalog(
            (int)($data['ID_Problem_Catalog'] ?? $data['id'] ?? null),
            (int)($data['Fk_TI_Service'] ?? $data['fk_ti_service']),
            $data['Problem_Name'] ?? $data['problem_name'] ?? '',
            $data['Estimated_Severity'] ?? $data['estimated_severity'] ?? 'Media',
            $data['Typical_Description'] ?? $data['typical_description'] ?? null
        );
    }

    private function mapToSystem(array $data): SoftwareSystem
    {
        return new SoftwareSystem(
            (int)($data['ID_System'] ?? $data['id'] ?? null),
            $data['System_Name'] ?? $data['system_name'] ?? '',
            $data['Status'] ?? $data['status'] ?? 'Activo',
            $data['Description'] ?? $data['description'] ?? null
        );
    }
}
