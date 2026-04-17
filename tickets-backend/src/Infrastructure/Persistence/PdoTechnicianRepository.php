<?php

namespace App\Infrastructure\Persistence;

use App\Core\Database;
use App\Domain\Technician\Technician;
use App\Domain\Technician\TechnicianSchedule;
use App\Domain\Technician\LunchBlock;
use App\Domain\Technician\TechnicianRepositoryInterface;
use PDO;

class PdoTechnicianRepository implements TechnicianRepositoryInterface
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findById(int $id): ?Technician
    {
        $stmt = $this->db->prepare("SELECT * FROM Technicians WHERE ID_Technicians = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapToEntity($data) : null;
    }

    public function findByUserId(int $userId): ?Technician
    {
        $stmt = $this->db->prepare("SELECT * FROM Technicians WHERE Fk_Users = :fk_users");
        $stmt->execute(['fk_users' => $userId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapToEntity($data) : null;
    }

    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM Technicians ORDER BY created_at DESC");
        $technicians = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $technicians[] = $this->mapToEntity($data);
        }
        return $technicians;
    }

    public function findActive(): array
    {
        $stmt = $this->db->query("SELECT * FROM Technicians WHERE Status = 'Activo' ORDER BY created_at DESC");
        $technicians = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $technicians[] = $this->mapToEntity($data);
        }
        return $technicians;
    }

    public function save(Technician $technician): Technician
    {
        if ($technician->getId() === null) {
            $stmt = $this->db->prepare(
                "INSERT INTO Technicians (Fk_Users, First_Name, Last_Name, Fk_Lunch_Block, Status) 
                 VALUES (:fk_users, :first_name, :last_name, :fk_lunch_block, :status)"
            );
            $stmt->execute([
                'fk_users' => $technician->getFkUsers(),
                'first_name' => $technician->getFirstName(),
                'last_name' => $technician->getLastName(),
                'fk_lunch_block' => $technician->getFkLunchBlock(),
                'status' => $technician->getStatus(),
            ]);
            $technician->setId((int)$this->db->lastInsertId());
        } else {
            $stmt = $this->db->prepare(
                "UPDATE Technicians SET First_Name = :first_name, Last_Name = :last_name, 
                 Fk_Lunch_Block = :fk_lunch_block, Status = :status 
                 WHERE ID_Technicians = :id"
            );
            $stmt->execute([
                'id' => $technician->getId(),
                'first_name' => $technician->getFirstName(),
                'last_name' => $technician->getLastName(),
                'fk_lunch_block' => $technician->getFkLunchBlock(),
                'status' => $technician->getStatus(),
            ]);
        }
        return $technician;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM Technicians WHERE ID_Technicians = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function findScheduleByTechnicianId(int $technicianId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM Technician_Schedules WHERE Fk_Technician = :fk_technician ORDER BY 
            CASE Day_Of_Week
                WHEN 'Lunes' THEN 1
                WHEN 'Martes' THEN 2
                WHEN 'Miércoles' THEN 3
                WHEN 'Jueves' THEN 4
                WHEN 'Viernes' THEN 5
                WHEN 'Sábado' THEN 6
                WHEN 'Domingo' THEN 7
            END");
        $stmt->execute(['fk_technician' => $technicianId]);
        $schedules = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $schedules[] = $this->mapToSchedule($data);
        }
        return $schedules;
    }

    public function saveSchedule(TechnicianSchedule $schedule): TechnicianSchedule
    {
        if ($schedule->getId() === null) {
            $stmt = $this->db->prepare(
                "INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time) 
                 VALUES (:fk_technician, :day_of_week, :work_start_time, :work_end_time)
                 ON DUPLICATE KEY UPDATE Work_Start_Time = :work_start_time, Work_End_Time = :work_end_time"
            );
            $stmt->execute([
                'fk_technician' => $schedule->getFkTechnician(),
                'day_of_week' => $schedule->getDayOfWeek(),
                'work_start_time' => $schedule->getWorkStartTime(),
                'work_end_time' => $schedule->getWorkEndTime(),
            ]);
            $schedule->setId((int)$this->db->lastInsertId());
        }
        return $schedule;
    }

    public function findLunchBlockById(int $id): ?LunchBlock
    {
        $stmt = $this->db->prepare("SELECT * FROM Lunch_Blocks WHERE ID_Lunch_Block = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapToLunchBlock($data) : null;
    }

    public function findAllLunchBlocks(): array
    {
        $stmt = $this->db->query("SELECT * FROM Lunch_Blocks ORDER BY Start_Time");
        $blocks = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $blocks[] = $this->mapToLunchBlock($data);
        }
        return $blocks;
    }

    public function findAvailableTechnicians(int $serviceId, int $officeId): array
    {
        $stmt = $this->db->prepare("
            SELECT DISTINCT t.*, lb.Block_Name, lb.Start_Time as lunch_start, lb.End_Time as lunch_end
            FROM Technicians t
            JOIN Users u ON t.Fk_Users = u.ID_Users
            JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
            LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
            WHERE ts.Fk_TI_Service = :service_id
            AND ts.status = 'Activo'
            AND t.Status = 'Activo'
            ORDER BY t.First_Name, t.Last_Name
        ");
        $stmt->execute(['service_id' => $serviceId]);
        $technicians = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $technicians[] = $this->mapToEntity($data);
        }
        return $technicians;
    }

    public function findServicesByTechnicianId(int $technicianId): array
    {
        $stmt = $this->db->prepare("
            SELECT ts.ID_TI_Service, ts.Type_Service, ts.Details
            FROM Technicians_Service tech_svc
            JOIN TI_Service ts ON tech_svc.Fk_TI_Service = ts.ID_TI_Service
            WHERE tech_svc.Fk_Technicians = :technician_id AND tech_svc.status = 'Activo'
        ");
        $stmt->execute(['technician_id' => $technicianId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function mapToEntity(array $data): Technician
    {
        return new Technician(
            (int)($data['ID_Technicians'] ?? $data['id'] ?? null),
            (int)($data['Fk_Users'] ?? $data['fk_users']),
            $data['First_Name'] ?? $data['first_name'] ?? '',
            $data['Last_Name'] ?? $data['last_name'] ?? '',
            $data['Fk_Lunch_Block'] ?? $data['fk_lunch_block'] ?? null,
            $data['Status'] ?? $data['status'] ?? 'Activo',
            $data['created_at'] ?? null
        );
    }

    private function mapToSchedule(array $data): TechnicianSchedule
    {
        return new TechnicianSchedule(
            (int)($data['ID_Schedule'] ?? $data['id'] ?? null),
            (int)($data['Fk_Technician'] ?? $data['fk_technician']),
            $data['Day_Of_Week'] ?? $data['day_of_week'] ?? '',
            $data['Work_Start_Time'] ?? $data['work_start_time'] ?? '08:00:00',
            $data['Work_End_Time'] ?? $data['work_end_time']
        );
    }

    private function mapToLunchBlock(array $data): LunchBlock
    {
        return new LunchBlock(
            (int)($data['ID_Lunch_Block'] ?? $data['id'] ?? null),
            $data['Block_Name'] ?? $data['block_name'] ?? '',
            $data['Start_Time'] ?? $data['start_time'] ?? '',
            $data['End_Time'] ?? $data['end_time'] ?? ''
        );
    }
}
