<?php
declare(strict_types=1);

/**
 * Technician Model
 * Handles technician data and operations
 * Following PHP-PRO strict typing and best practices
 */
final class Technician
{
    private PDO $conn;
    private string $table_name = "Technicians";

    public ?int $ID_Technicians;
    public ?int $Fk_Users;
    public ?string $First_Name;
    public ?string $Last_Name;
    public ?int $Fk_Lunch_Block;
    public ?string $Status;
    public ?string $created_at;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function getAll(): array {
        // Actualizar estado de técnicos basado en horario laboral, almuerzo y tickets antes de retornar
        $currentDay = date('l');
        $currentTime = date('H:i:s');
        $dayMap = [
            'Monday' => 'Lunes',
            'Tuesday' => 'Martes',
            'Wednesday' => 'Miercoles',
            'Thursday' => 'Jueves',
            'Friday' => 'Viernes',
            'Saturday' => 'Sabado',
            'Sunday' => 'Domingo'
        ];
        $currentDaySpanish = $dayMap[$currentDay] ?? $currentDay;
        $this->updateTechniciansStatus($currentDaySpanish, $currentTime);

        $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name,
                          t.Fk_Lunch_Block, t.Status, t.created_at,
                          u.Email, u.Username,
                          lb.Block_Name, lb.Start_Time, lb.End_Time,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                           WHERE tt.Fk_Technician = t.ID_Technicians AND tt.Status = 'Activo' AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Tickets_Assigned,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                           WHERE tt.Fk_Technician = t.ID_Technicians AND sr.Status IN ('Cerrado', 'Resuelto')) as Tickets_Resolved
                  FROM " . $this->table_name . " t
                  LEFT JOIN Users u ON t.Fk_Users = u.ID_Users
                  LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                  ORDER BY t.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add status reason to each technician
        foreach ($technicians as &$tech) {
            $tech['Status_Reason'] = $this->calculateStatusReasonForTechnician($tech['ID_Technicians'], $currentDaySpanish, $currentTime);
        }

        return $technicians;
    }

    /**
     * Calculate status reason for a specific technician
     */
    private function calculateStatusReasonForTechnician(int $technicianId, string $currentDaySpanish, string $currentTime): ?string {
        $query = "SELECT sched.Work_Start_Time, sched.Work_End_Time,
                         lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                         (SELECT COUNT(*)
                          FROM Ticket_Technicians tt
                          INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                          WHERE tt.Fk_Technician = :techIdSub
                          AND tt.Status = 'Activo'
                          AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Active_Tickets_Count
                  FROM " . $this->table_name . " t
                  LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                  LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician AND sched.Day_Of_Week = :currentDay
                  WHERE t.ID_Technicians = :techIdMain";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":techIdSub", $technicianId);
        $stmt->bindParam(":techIdMain", $technicianId);
        $stmt->bindParam(":currentDay", $currentDaySpanish);
        $stmt->execute();
        $tech = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tech) {
            return null;
        }

        $currentSeconds = strtotime($currentTime);
        $workStart = $tech['Work_Start_Time'];
        $workEnd = $tech['Work_End_Time'];
        $lunchStart = $tech['Lunch_Start'];
        $lunchEnd = $tech['Lunch_End'];
        $activeTickets = $tech['Active_Tickets_Count'];

        // Determine if in work hours
        $isInWorkHours = false;
        if ($workStart && $workEnd) {
            $workStartSeconds = strtotime($workStart);
            $workEndSeconds = strtotime($workEnd);
            $isInWorkHours = ($currentSeconds >= $workStartSeconds && $currentSeconds <= $workEndSeconds);
        }

        // Determine if in lunch block
        $isInLunchBlock = false;
        if ($lunchStart && $lunchEnd) {
            $lunchStartSeconds = strtotime($lunchStart);
            $lunchEndSeconds = strtotime($lunchEnd);
            $isInLunchBlock = ($currentSeconds >= $lunchStartSeconds && $currentSeconds <= $lunchEndSeconds);
        }

        // Determine if has active tickets
        $hasActiveTickets = ($activeTickets > 0);

        return $this->calculateStatusReason($isInWorkHours, $isInLunchBlock, $hasActiveTickets);
    }

    public function getById(int $id): array|false {
        $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, 
                          t.Fk_Lunch_Block, t.Status, t.created_at,
                          u.Email, u.Username,
                          lb.Block_Name, lb.Start_Time, lb.End_Time,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt 
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request 
                           WHERE tt.Fk_Technician = t.ID_Technicians AND tt.Status = 'Activo' AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Tickets_Assigned,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt 
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request 
                           WHERE tt.Fk_Technician = t.ID_Technicians AND sr.Status IN ('Cerrado', 'Resuelto')) as Tickets_Resolved
                  FROM " . $this->table_name . " t
                  LEFT JOIN Users u ON t.Fk_Users = u.ID_Users
                  LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                  WHERE t.ID_Technicians = :id
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByUserId(int $userId): array|false {
        $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, 
                          t.Fk_Lunch_Block, t.Status, t.created_at,
                          u.Email, u.Username,
                          lb.Block_Name, lb.Start_Time, lb.End_Time
                  FROM " . $this->table_name . " t
                  LEFT JOIN Users u ON t.Fk_Users = u.ID_Users
                  LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                  WHERE t.Fk_Users = :userId
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":userId", $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getServices($technicianId) {
        $query = "SELECT ts.ID_TI_Service, ts.Type_Service, ts.Details
                  FROM Technicians_Service tcs
                  JOIN TI_Service ts ON tcs.Fk_TI_Service = ts.ID_TI_Service
                  WHERE tcs.Fk_Technicians = :technicianId AND tcs.Status = 'Activo'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":technicianId", $technicianId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getSchedules($technicianId) {
        $query = "SELECT ID_Schedule, Fk_Technician, Day_Of_Week, 
                          Work_Start_Time, Work_End_Time
                  FROM Technician_Schedules
                  WHERE Fk_Technician = :technicianId
                  ORDER BY FIELD(Day_Of_Week, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo')";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":technicianId", $technicianId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET Fk_Users = :Fk_Users, First_Name = :First_Name, 
                      Last_Name = :Last_Name, Fk_Lunch_Block = :Fk_Lunch_Block, 
                      Status = :Status, created_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":Fk_Users", $data->Fk_Users);
        $stmt->bindParam(":First_Name", $data->First_Name);
        $stmt->bindParam(":Last_Name", $data->Last_Name);
        $stmt->bindParam(":Fk_Lunch_Block", $data->Fk_Lunch_Block);
        $stmt->bindParam(":Status", $data->Status);
        
        try {
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
        } catch(PDOException $exception) {
            echo "Create error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function update($id, $data) {
        // Construir query dinámicamente basado en los campos proporcionados
        $fields = [];
        $params = [];

        if (isset($data->First_Name)) {
            $fields[] = "First_Name = :First_Name";
            $params[':First_Name'] = $data->First_Name;
        }
        if (isset($data->Last_Name)) {
            $fields[] = "Last_Name = :Last_Name";
            $params[':Last_Name'] = $data->Last_Name;
        }
        if (isset($data->Fk_Lunch_Block)) {
            $fields[] = "Fk_Lunch_Block = :Fk_Lunch_Block";
            $params[':Fk_Lunch_Block'] = $data->Fk_Lunch_Block;
        }
        if (isset($data->Status)) {
            $fields[] = "Status = :Status";
            $params[':Status'] = $data->Status;
        }

        if (empty($fields)) {
            return false; // No hay campos para actualizar
        }

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE ID_Technicians = :id";
        $params[':id'] = $id;

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch(PDOException $exception) {
            echo "Update error: " . $exception->getMessage();
        }

        return false;
    }

    public function deactivate($id) {
        try {
            $query = "UPDATE " . $this->table_name . " SET Status = 'Fuera de Servicio' WHERE ID_Technicians = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            return $stmt->execute();
        } catch(PDOException $exception) {
            error_log("Deactivate error: " . $exception->getMessage());
            return false;
        }
    }

    public function reactivate($id) {
        try {
            $query = "UPDATE " . $this->table_name . " SET Status = 'Disponible' WHERE ID_Technicians = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            return $stmt->execute();
        } catch(PDOException $exception) {
            error_log("Reactivate error: " . $exception->getMessage());
            return false;
        }
    }

    public function delete($id) {
        return $this->deactivate($id);
    }

    public function addService($technicianId, $serviceId) {
        $query = "INSERT INTO Technicians_Service (Fk_TI_Service, Fk_Technicians, Status, created_at)
                  VALUES (:serviceId, :technicianId, 'Activo', NOW())";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":serviceId", $serviceId);
        $stmt->bindParam(":technicianId", $technicianId);
        
        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Add service error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function removeServices($technicianId) {
        $query = "DELETE FROM Technicians_Service WHERE Fk_Technicians = :technicianId";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":technicianId", $technicianId);
        
        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Remove services error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function addSchedule($technicianId, $dayOfWeek, $startTime, $endTime) {
        $query = "INSERT INTO Technician_Schedules (Fk_Technician, Day_Of_Week, Work_Start_Time, Work_End_Time)
                  VALUES (:technicianId, :dayOfWeek, :startTime, :endTime)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":technicianId", $technicianId);
        $stmt->bindParam(":dayOfWeek", $dayOfWeek);
        $stmt->bindParam(":startTime", $startTime);
        $stmt->bindParam(":endTime", $endTime);
        
        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Add schedule error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function removeSchedules($technicianId) {
        $query = "DELETE FROM Technician_Schedules WHERE Fk_Technician = :technicianId";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":technicianId", $technicianId);

        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Remove schedules error: " . $exception->getMessage();
        }

        return false;
    }

/**
     * Get available technicians for a specific service
     * PHP-PRO: Uses capacity-based selection WITH strict schedule filtering
     * Filters by: work hours, lunch block, capacity limit, status, and ticket priority
     */
    public function getAvailableTechniciansByService(int $serviceId, int $ticketPriorityWeight = 0): array
    {
        try {
            $currentDay = date('l');
            $currentTime = date('H:i:s');
            $yesterday = date('Y-m-d H:i:s', strtotime('-24 hours'));

            $dayMap = [
                'Monday' => 'Lunes',
                'Tuesday' => 'Martes',
                'Wednesday' => 'Miercoles',
                'Thursday' => 'Jueves',
                'Friday' => 'Viernes',
                'Saturday' => 'Sabado',
                'Sunday' => 'Domingo'
            ];
            $currentDaySpanish = $dayMap[$currentDay] ?? $currentDay;

            $this->updateTechniciansStatus($currentDaySpanish, $currentTime);

            $capacityLimit = 5;
            $priorityAdjustment = $ticketPriorityWeight > 0 ? (10 - $ticketPriorityWeight) : 5;

            $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Lunch_Block,
                             lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                             sched.Work_Start_Time, sched.Work_End_Time,
                             (SELECT COUNT(*)
                             FROM Ticket_Technicians tt
                             INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                             WHERE tt.Fk_Technician = t.ID_Technicians
                             AND tt.Status = 'Activo'
                             AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Active_Tickets_Count,
                             (SELECT COUNT(*)
                             FROM Ticket_Technicians tt
                             WHERE tt.Fk_Technician = t.ID_Technicians
                             AND tt.Assigned_At >= ?) as Recent_Assignments_Count,
                             (SELECT AVG(TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at))
                             FROM Ticket_Technicians tt
                             INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                             WHERE tt.Fk_Technician = t.ID_Technicians
                             AND sr.Status IN ('Cerrado', 'Resuelto')
                             AND sr.Resolved_at IS NOT NULL) as Avg_Resolution_Hours
                    FROM " . $this->table_name . " t
                    INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                    LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                    LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician AND sched.Day_Of_Week = ?
                    WHERE ts.Fk_TI_Service = ?
                    AND ts.Status = 'Activo'
                        AND t.Status = 'Disponible'
                        AND (
                            (sched.Work_Start_Time IS NOT NULL AND sched.Work_End_Time IS NOT NULL 
                            AND TIME(?) >= sched.Work_Start_Time AND TIME(?) <= sched.Work_End_Time)
                            OR (sched.Work_Start_Time IS NULL)
                        )
                        AND (
                            (lb.Start_Time IS NOT NULL AND lb.End_Time IS NOT NULL 
                            AND NOT (TIME(?) >= lb.Start_Time AND TIME(?) <= lb.End_Time))
                            OR (lb.Start_Time IS NULL)
                        )
                    HAVING Active_Tickets_Count < ?
                    ORDER BY 
                        CASE 
                            WHEN sched.Work_Start_Time IS NOT NULL AND sched.Work_End_Time IS NOT NULL 
                            AND TIME(?) >= sched.Work_Start_Time AND TIME(?) <= sched.Work_End_Time 
                            THEN 0 
                            ELSE 1 
                        END,
                        (Active_Tickets_Count * ?) ASC,
                        Avg_Resolution_Hours ASC,
                        Recent_Assignments_Count ASC,
                        t.First_Name, t.Last_Name";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(1, $yesterday, \PDO::PARAM_STR);
            $stmt->bindValue(2, $currentDaySpanish, \PDO::PARAM_STR);
            $stmt->bindValue(3, $serviceId, \PDO::PARAM_INT);
            $stmt->bindValue(4, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(5, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(6, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(7, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(8, $capacityLimit, \PDO::PARAM_INT);
            $stmt->bindValue(9, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(10, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(11, $priorityAdjustment, \PDO::PARAM_INT);
            $stmt->execute();
            $technicians = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            if (empty($technicians)) {
                error_log("No technicians in primary query, trying fallback for service {$serviceId}");

                $fallbackQuery = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Lunch_Block,
                                         lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                                         sched.Work_Start_Time, sched.Work_End_Time,
                                         (SELECT COUNT(*)
                                         FROM Ticket_Technicians tt
                                         INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                                         WHERE tt.Fk_Technician = t.ID_Technicians
                                         AND tt.Status = 'Activo'
                                         AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Active_Tickets_Count,
                                         (SELECT COUNT(*)
                                         FROM Ticket_Technicians tt
                                         WHERE tt.Fk_Technician = t.ID_Technicians
                                         AND tt.Assigned_At >= ?) as Recent_Assignments_Count,
                                         2 as fallback_priority
                                 FROM " . $this->table_name . " t
                                 INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                                 LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                                 LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician AND sched.Day_Of_Week = ?
                                 WHERE ts.Fk_TI_Service = ?
                                    AND ts.Status = 'Activo'
                                    AND t.Status != 'Fuera de Servicio'
                                    AND (
                                        (sched.Work_Start_Time IS NOT NULL AND sched.Work_End_Time IS NOT NULL 
                                        AND TIME(?) >= sched.Work_Start_Time AND TIME(?) <= sched.Work_End_Time)
                                        OR (sched.Work_Start_Time IS NULL)
                                    )
                                    AND (
                                        (lb.Start_Time IS NOT NULL AND lb.End_Time IS NOT NULL 
                                        AND NOT (TIME(?) >= lb.Start_Time AND TIME(?) <= lb.End_Time))
                                        OR (lb.Start_Time IS NULL)
                                    )
                                 HAVING Active_Tickets_Count < ?
                                 ORDER BY 
                                    CASE 
                                        WHEN sched.Work_Start_Time IS NOT NULL AND sched.Work_End_Time IS NOT NULL 
                                        AND TIME(?) >= sched.Work_Start_Time AND TIME(?) <= sched.Work_End_Time 
                                        THEN 0 
                                        ELSE 1 
                                    END,
                                    Active_Tickets_Count ASC, 
                                    Recent_Assignments_Count ASC, 
                                    t.First_Name, t.Last_Name";

                $fallbackStmt = $this->conn->prepare($fallbackQuery);
                $fallbackStmt->bindValue(1, $yesterday, \PDO::PARAM_STR);
                $fallbackStmt->bindValue(2, $currentDaySpanish, \PDO::PARAM_STR);
                $fallbackStmt->bindValue(3, $serviceId, \PDO::PARAM_INT);
                $fallbackStmt->bindValue(4, $currentTime, \PDO::PARAM_STR);
                $fallbackStmt->bindValue(5, $currentTime, \PDO::PARAM_STR);
                $fallbackStmt->bindValue(6, $currentTime, \PDO::PARAM_STR);
                $fallbackStmt->bindValue(7, $currentTime, \PDO::PARAM_STR);
                $fallbackStmt->bindValue(8, $capacityLimit, \PDO::PARAM_INT);
                $fallbackStmt->bindValue(9, $currentTime, \PDO::PARAM_STR);
                $fallbackStmt->bindValue(10, $currentTime, \PDO::PARAM_STR);
                $fallbackStmt->execute();
                $technicians = $fallbackStmt->fetchAll(\PDO::FETCH_ASSOC);
            }

            error_log("Available technicians for service {$serviceId} at {$currentDaySpanish} {$currentTime} (priority weight: {$ticketPriorityWeight}): " . count($technicians));
            foreach ($technicians as $tech) {
                $score = ($tech['Active_Tickets_Count'] * 2) + ($tech['Recent_Assignments_Count'] ?? 0);
                error_log("  - {$tech['First_Name']} {$tech['Last_Name']} (Status: {$tech['Status']}, Active: {$tech['Active_Tickets_Count']}, Recent: " . ($tech['Recent_Assignments_Count'] ?? 0) . ", Score: {$score})");
            }

            return $technicians;
        } catch (\PDOException $exception) {
            error_log("PDOException in getAvailableTechniciansByService: " . $exception->getMessage());
            return [];
        } catch (\Exception $exception) {
            error_log("Exception in getAvailableTechniciansByService: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get technicians from related services (for escalation)
     * Returns technicians from services that are related/similar to the requested service
     * Filters by work hours and lunch block
     *
     * @param int $serviceId The original service ID
     * @return array<int, array<string, mixed>>
     */
    public function getTechniciansFromRelatedServices(int $serviceId): array
    {
        $relatedServices = $this->getRelatedServiceIds($serviceId);
        
        if (empty($relatedServices)) {
            return [];
        }

        try {
            $currentDay = date('l');
            $currentTime = date('H:i:s');
            $yesterday = date('Y-m-d H:i:s', strtotime('-24 hours'));

            $dayMap = [
                'Monday' => 'Lunes', 'Tuesday' => 'Martes', 'Wednesday' => 'Miercoles',
                'Thursday' => 'Jueves', 'Friday' => 'Viernes', 'Saturday' => 'Sabado', 'Sunday' => 'Domingo'
            ];
            $currentDaySpanish = $dayMap[$currentDay] ?? $currentDay;

            $placeholders = implode(',', array_fill(0, count($relatedServices), '?'));

            $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Lunch_Block,
                             ts.Fk_TI_Service,
                             lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                             sched.Work_Start_Time, sched.Work_End_Time,
                             (SELECT COUNT(*)
                             FROM Ticket_Technicians tt
                             INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                             WHERE tt.Fk_Technician = t.ID_Technicians
                             AND tt.Status = 'Activo'
                             AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Active_Tickets_Count
                    FROM " . $this->table_name . " t
                    INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                    LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                    LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician AND sched.Day_Of_Week = ?
                    WHERE ts.Fk_TI_Service IN ({$placeholders})
                        AND ts.Status = 'Activo'
                        AND t.Status = 'Disponible'
                        AND (
                            (sched.Work_Start_Time IS NOT NULL AND sched.Work_End_Time IS NOT NULL 
                            AND TIME(?) >= sched.Work_Start_Time AND TIME(?) <= sched.Work_End_Time)
                            OR (sched.Work_Start_Time IS NULL)
                        )
                        AND (
                            (lb.Start_Time IS NOT NULL AND lb.End_Time IS NOT NULL 
                            AND NOT (TIME(?) >= lb.Start_Time AND TIME(?) <= lb.End_Time))
                            OR (lb.Start_Time IS NULL)
                        )
                    HAVING Active_Tickets_Count < 5
                    ORDER BY 
                        CASE 
                            WHEN sched.Work_Start_Time IS NOT NULL AND sched.Work_End_Time IS NOT NULL 
                            AND TIME(?) >= sched.Work_Start_Time AND TIME(?) <= sched.Work_End_Time 
                            THEN 0 
                            ELSE 1 
                        END,
                        Active_Tickets_Count ASC, 
                        t.First_Name, t.Last_Name";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(1, $currentDaySpanish, \PDO::PARAM_STR);
            foreach ($relatedServices as $index => $relatedServiceId) {
                $stmt->bindValue($index + 2, $relatedServiceId, \PDO::PARAM_INT);
            }
            $stmt->bindValue(count($relatedServices) + 2, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(count($relatedServices) + 3, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(count($relatedServices) + 4, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(count($relatedServices) + 5, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(count($relatedServices) + 6, $currentTime, \PDO::PARAM_STR);
            $stmt->bindValue(count($relatedServices) + 7, $currentTime, \PDO::PARAM_STR);
            $stmt->execute();

            $technicians = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            error_log("Found " . count($technicians) . " technicians from related services for escalation (service {$serviceId})");
            return $technicians;
        } catch (\PDOException $exception) {
            error_log("PDOException in getTechniciansFromRelatedServices: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Get related service IDs for escalation
     * Returns services that can handle tickets from the given service
     * Uses a smarter logic to find truly related services
     *
     * @param int $serviceId The original service ID
     * @return array<int, int>
     */
    private function getRelatedServiceIds(int $serviceId): array
    {
        try {
            $query = "SELECT ID_TI_Service, Type_Service FROM TI_Service WHERE ID_TI_Service != ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(1, $serviceId, \PDO::PARAM_INT);
            $stmt->execute();
            $services = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            if (empty($services)) {
                return [];
            }

            $relatedIds = [];
            $currentServiceName = '';
            
            foreach ($services as $service) {
                if ((int)$service['ID_TI_Service'] === $serviceId) {
                    $currentServiceName = strtolower($service['Type_Service'] ?? '');
                    continue;
                }
                $relatedIds[] = (int)$service['ID_TI_Service'];
            }

            usort($relatedIds, function($a, $b) use ($services, $currentServiceName) {
                $serviceA = $this->findServiceById($services, $a);
                $serviceB = $this->findServiceById($services, $b);
                
                $nameA = strtolower($serviceA['Type_Service'] ?? '');
                $nameB = strtolower($serviceB['Type_Service'] ?? '');
                
                $priorityA = $this->calculateServicePriority($nameA, $currentServiceName);
                $priorityB = $this->calculateServicePriority($nameB, $currentServiceName);
                
                return $priorityB - $priorityA;
            });

            return array_slice($relatedIds, 0, 5);
        } catch (\PDOException $exception) {
            error_log("PDOException in getRelatedServiceIds: " . $exception->getMessage());
            return [];
        }
    }

    /**
     * Find a service by ID from the services array
     */
    private function findServiceById(array $services, int $serviceId): array
    {
        foreach ($services as $service) {
            if ((int)$service['ID_TI_Service'] === $serviceId) {
                return $service;
            }
        }
        return [];
    }

    /**
     * Calculate priority for service relationship
     * Higher priority means more related
     */
    private function calculateServicePriority(string $serviceName, string $currentServiceName): int
    {
        $keywords = [
            'soporte' => ['soporte', 'ayuda', 'asistencia', 'helpdesk'],
            'redes' => ['red', 'network', 'wifi', 'internet', 'conectividad'],
            'programacion' => ['program', 'desarrollo', 'software', 'app', 'sistema'],
            'hardware' => ['hardware', 'equipo', 'computadora', 'impresora'],
            'seguridad' => ['seguridad', 'security', 'acesso', 'password'],
            'base de datos' => ['database', 'datos', 'sql', 'mysql'],
        ];

        foreach ($keywords as $category => $terms) {
            foreach ($terms as $term) {
                if (str_contains($currentServiceName, $term)) {
                    foreach ($terms as $relatedTerm) {
                        if (str_contains($serviceName, $relatedTerm)) {
                            return 10;
                        }
                    }
                }
            }
        }

        return 1;
    }

    /**
     * Actualizar estado de técnicos basado en horario laboral, bloque de almuerzo y tickets activos
     * Lógica completa de estados según esquema de base de datos:
     * - 'Inactivo': Fuera de horario laboral
     * - 'Ocupado': Con tickets activos o en bloque de almuerzo
     * - 'Disponible': En horario laboral, fuera de almuerzo, sin tickets
     */
    /**
     * Calculate status reason for a technician based on current conditions
     * Returns: 'schedule' (outside work hours), 'lunch' (in lunch block), 'ticket' (has active tickets), or null (available)
     */
    private function calculateStatusReason(bool $isInWorkHours, bool $isInLunchBlock, bool $hasActiveTickets): ?string
    {
        if (!$isInWorkHours) {
            return 'schedule';
        }
        if ($isInLunchBlock) {
            return 'lunch';
        }
        if ($hasActiveTickets) {
            return 'ticket';
        }
        return null; // Available
    }

    private function updateTechniciansStatus($currentDaySpanish, $currentTime) {
        try {
            error_log("=== updateTechniciansStatus ===");
            error_log("Current Day: {$currentDaySpanish}, Current Time: {$currentTime}");

            // Obtener todos los técnicos con sus horarios, bloques de almuerzo y tickets activos
            $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Lunch_Block,
                             lb.Start_Time as Lunch_Start, lb.End_Time as Lunch_End,
                             sched.Work_Start_Time, sched.Work_End_Time,
                             (SELECT COUNT(*)
                              FROM Ticket_Technicians tt
                              INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                              WHERE tt.Fk_Technician = t.ID_Technicians
                              AND tt.Status = 'Activo'
                              AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Active_Tickets_Count
                      FROM " . $this->table_name . " t
                      LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                      LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician AND sched.Day_Of_Week = :currentDay
                      WHERE t.Status != 'Fuera de Servicio'";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":currentDay", $currentDaySpanish);
            $stmt->execute();
            $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Found " . count($technicians) . " technicians to update status");

            // Convertir tiempo actual a segundos
            $currentSeconds = strtotime($currentTime);

            foreach ($technicians as $tech) {
                $workStart = $tech['Work_Start_Time'];
                $workEnd = $tech['Work_End_Time'];
                $lunchStart = $tech['Lunch_Start'];
                $lunchEnd = $tech['Lunch_End'];
                $currentStatus = $tech['Status'];
                $activeTickets = $tech['Active_Tickets_Count'];

                error_log("Technician: {$tech['First_Name']} {$tech['Last_Name']}");
                error_log("  Work Schedule: {$workStart} - {$workEnd}");
                error_log("  Lunch Block: {$lunchStart} - {$lunchEnd}");
                error_log("  Current Time: {$currentTime}");
                error_log("  Current Status: {$currentStatus}");
                error_log("  Active Tickets: {$activeTickets}");

                // Determinar si está en horario laboral
                $isInWorkHours = false;
                if ($workStart && $workEnd) {
                    $workStartSeconds = strtotime($workStart);
                    $workEndSeconds = strtotime($workEnd);
                    $isInWorkHours = ($currentSeconds >= $workStartSeconds && $currentSeconds <= $workEndSeconds);
                }

                // Determinar si está en bloque de almuerzo
                $isInLunchBlock = false;
                if ($lunchStart && $lunchEnd) {
                    $lunchStartSeconds = strtotime($lunchStart);
                    $lunchEndSeconds = strtotime($lunchEnd);
                    $isInLunchBlock = ($currentSeconds >= $lunchStartSeconds && $currentSeconds <= $lunchEndSeconds);
                }

                // Determinar si tiene tickets activos
                $hasActiveTickets = ($activeTickets > 0);

                error_log("  Is in work hours: " . ($isInWorkHours ? 'YES' : 'NO'));
                error_log("  Is in lunch block: " . ($isInLunchBlock ? 'YES' : 'NO'));
                error_log("  Has active tickets: " . ($hasActiveTickets ? 'YES' : 'NO'));

                // Determinar nuevo estado según lógica completa
                $newStatus = $currentStatus;
                $statusReason = $this->calculateStatusReason($isInWorkHours, $isInLunchBlock, $hasActiveTickets);

                if (!$isInWorkHours) {
                    // Fuera de horario laboral -> Inactivo
                    $newStatus = 'Inactivo';
                    error_log("  Reason: Outside work hours");
                } elseif ($isInLunchBlock) {
                    // En bloque de almuerzo -> Ocupado
                    $newStatus = 'Ocupado';
                    error_log("  Reason: In lunch block");
                } elseif ($hasActiveTickets) {
                    // Tiene tickets activos -> Ocupado
                    $newStatus = 'Ocupado';
                    error_log("  Reason: Has active tickets");
                } else {
                    // En horario laboral, fuera de almuerzo, sin tickets -> Disponible
                    $newStatus = 'Disponible';
                    error_log("  Reason: Available (in work hours, no lunch, no tickets)");
                }

                // Actualizar estado si cambió
                if ($newStatus !== $currentStatus) {
                    $updateQuery = "UPDATE " . $this->table_name . " SET Status = :newStatus WHERE ID_Technicians = :techId";
                    $updateStmt = $this->conn->prepare($updateQuery);
                    $updateStmt->bindParam(":newStatus", $newStatus);
                    $updateStmt->bindParam(":techId", $tech['ID_Technicians']);
                    $updateStmt->execute();
                    error_log("  ACTION: Updated from '{$currentStatus}' to '{$newStatus}'");
                } else {
                    error_log("  ACTION: No change needed (already '{$currentStatus}')");
                }
            }
        } catch(PDOException $exception) {
            error_log("Error updating technicians status: " . $exception->getMessage());
        }
    }

    /**
     * Get all technicians by service ID for admin manual assignment
     * Returns all technicians assigned to a specific TI service
     * 
     * @param int $serviceId The TI Service ID
     * @return array<int, array{ID_Technicians: int, First_Name: string, Last_Name: string, Status: string, Email: string|null}>
     */
    public function getAllTechniciansByService(int $serviceId): array
    {
        if ($serviceId <= 0) {
            error_log("Invalid service ID provided: {$serviceId}");
            return [];
        }

        $query = "SELECT DISTINCT 
                         t.ID_Technicians, 
                         t.First_Name, 
                         t.Last_Name, 
                         t.Status, 
                         u.Email,
                         (SELECT COUNT(*)
                          FROM Ticket_Technicians tt
                          INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                          WHERE tt.Fk_Technician = t.ID_Technicians
                          AND sr.Status IN ('Cerrado', 'Resuelto')) as Tickets_Resolved,
                         (SELECT COUNT(*)
                          FROM Ticket_Technicians tt
                          INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                          WHERE tt.Fk_Technician = t.ID_Technicians
                          AND tt.Status = 'Activo'
                          AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Active_Tickets
                  FROM " . $this->table_name . " t
                  INNER JOIN Users u ON t.Fk_Users = u.ID_Users
                  INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                  WHERE ts.Fk_TI_Service = :serviceId
                    AND t.Status != 'Fuera de Servicio'
                  ORDER BY t.First_Name ASC, t.Last_Name ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":serviceId", $serviceId, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("getAllTechniciansByService: Found " . count($result) . " technicians for service {$serviceId}");

            return $result;

        } catch (PDOException $e) {
            error_log("PDOException in getAllTechniciansByService: " . $e->getMessage());
            error_log("Query: " . $query);
            error_log("Service ID: {$serviceId}");
            return [];
        } catch (Exception $e) {
            error_log("Exception in getAllTechniciansByService: " . $e->getMessage());
            return [];
        }
    }

    public function assignToTicket(int $ticketId, int $technicianId, ?int $assignedBy = null, bool $isLead = true, bool $allowCrossService = false): bool {
        try {
            // Validación 1: Verificar si el técnico existe
            $techQuery = "SELECT ID_Technicians, Status FROM " . $this->table_name . " WHERE ID_Technicians = :technicianId";
            $techStmt = $this->conn->prepare($techQuery);
            $techStmt->bindParam(":technicianId", $technicianId);
            $techStmt->execute();
            $technician = $techStmt->fetch(PDO::FETCH_ASSOC);

            if (!$technician) {
                error_log("Error: Técnico {$technicianId} no existe");
                return false;
            }

            // Validación 2: Verificar disponibilidad según el tipo de asignación
            // - Para asignaciones automáticas (allowCrossService = false) el técnico debe estar 'Disponible'
            // - Para asignaciones manuales/escaladas (allowCrossService = true) permitimos asignar aunque esté 'Ocupado'
            //   pero nunca permitiremos asignar a un técnico que esté 'Inactivo'
            $techStatus = $technician['Status'];
                if ($techStatus === 'Inactivo' || $techStatus === 'Fuera de Servicio') {
                error_log("Error: Técnico {$technicianId} está {$techStatus} y no puede ser asignado");
                return false;
            }

            if (!$allowCrossService && $techStatus !== 'Disponible') {
                error_log("Error: Técnico {$technicianId} no está Disponible (Status: {$techStatus}) y no puede ser asignado automáticamente");
                return false;
            }

            // Validación 3: Verificar si el técnico tiene el servicio del ticket
            // Solo aplicar esta validación en asignación automática ($allowCrossService = false)
            if (!$allowCrossService) {
                $ticketQuery = "SELECT Fk_TI_Service FROM Service_Request WHERE ID_Service_Request = :ticketId";
                $ticketStmt = $this->conn->prepare($ticketQuery);
                $ticketStmt->bindParam(":ticketId", $ticketId);
                $ticketStmt->execute();
                $ticket = $ticketStmt->fetch(PDO::FETCH_ASSOC);

                if (!$ticket) {
                    error_log("Error: Ticket {$ticketId} no existe");
                    return false;
                }

                $serviceId = $ticket['Fk_TI_Service'];

                $serviceQuery = "SELECT COUNT(*) as has_service
                                FROM Technicians_Service
                                WHERE Fk_Technicians = :technicianId AND Fk_TI_Service = :serviceId AND Status = 'Activo'";
                $serviceStmt = $this->conn->prepare($serviceQuery);
                $serviceStmt->bindParam(":technicianId", $technicianId);
                $serviceStmt->bindParam(":serviceId", $serviceId);
                $serviceStmt->execute();
                $serviceResult = $serviceStmt->fetch(PDO::FETCH_ASSOC);

                if (!$serviceResult || $serviceResult['has_service'] == 0) {
                    error_log("Error: Técnico {$technicianId} no tiene el servicio {$serviceId} requerido por el ticket");
                    return false;
                }
            } else {
                error_log("Asignación manual: Permitiendo asignación cruzada para técnico {$technicianId} al ticket {$ticketId}");
            }

            // Validación 4: Verificar si el técnico ya está asignado a este ticket
            $existingQuery = "SELECT COUNT(*) as already_assigned
                             FROM Ticket_Technicians
                             WHERE Fk_Service_Request = :ticketId AND Fk_Technician = :technicianId AND Status = 'Activo'";
            $existingStmt = $this->conn->prepare($existingQuery);
            $existingStmt->bindParam(":ticketId", $ticketId);
            $existingStmt->bindParam(":technicianId", $technicianId);
            $existingStmt->execute();
            $existingResult = $existingStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingResult['already_assigned'] > 0) {
                error_log("Error: Técnico {$technicianId} ya está asignado al ticket {$ticketId}");
                return false;
            }

            // Todas las validaciones pasaron, proceder con la asignación.
            // Para mitigar condiciones de carrera volvemos a validar la capacidad del técnico dentro
            // de una transacción y usamos SELECT ... FOR UPDATE para bloquear las filas relevantes.
            // Si ya hay una transacción activa (ej. desde TicketService::createTicket), reusarla.
            $capacityLimit = 5; // TODO: extraer a configuración si se requiere
            $ownsTransaction = !$this->conn->inTransaction();

            try {
                if ($ownsTransaction) {
                    $this->conn->beginTransaction();
                }

                // Revalidar tickets activos del técnico con bloqueo
                $checkCapacityQuery = "SELECT COUNT(*) as active_count
                                       FROM Ticket_Technicians tt
                                       INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                                       WHERE tt.Fk_Technician = :technicianId
                                         AND tt.Status = 'Activo'
                                         AND sr.Status NOT IN ('Cerrado', 'Resuelto') FOR UPDATE";

                $checkStmt = $this->conn->prepare($checkCapacityQuery);
                $checkStmt->bindParam(":technicianId", $technicianId, PDO::PARAM_INT);
                $checkStmt->execute();
                $capacityResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
                $activeCount = (int)($capacityResult['active_count'] ?? 0);

                if ($activeCount >= $capacityLimit && !$allowCrossService) {
                    if ($ownsTransaction) {
                        $this->conn->rollBack();
                    }
                    error_log("Capacity full for technician {$technicianId} (active: {$activeCount}), cannot assign automatically");
                    return false;
                }

                // Insertar asignación
                $query = "INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Assigned_At, Status, Fk_Assigned_By)
                          VALUES (:ticketId, :technicianId, :isLead, NOW(), 'Activo', :assignedBy)";

                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":ticketId", $ticketId, PDO::PARAM_INT);
                $stmt->bindParam(":technicianId", $technicianId, PDO::PARAM_INT);
                $stmt->bindParam(":isLead", $isLead, PDO::PARAM_BOOL);
                $stmt->bindParam(":assignedBy", $assignedBy, PDO::PARAM_INT);

                if (!$stmt->execute()) {
                    if ($ownsTransaction) {
                        $this->conn->rollBack();
                    }
                    error_log("Failed to execute assignToTicket query for technician {$technicianId} to ticket {$ticketId}");
                    return false;
                }

                // Update technician status to Ocupado unless admin forced assignment while keeping him in another state
                $updateQuery = "UPDATE " . $this->table_name . " SET Status = 'Ocupado' WHERE ID_Technicians = :technicianId";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(":technicianId", $technicianId, PDO::PARAM_INT);
                $updateStmt->execute();

                // Update ticket status to 'En Proceso' when technician is assigned
                $updateTicketQuery = "UPDATE Service_Request SET Status = 'En Proceso' WHERE ID_Service_Request = :ticketId";
                $updateTicketStmt = $this->conn->prepare($updateTicketQuery);
                $updateTicketStmt->bindParam(":ticketId", $ticketId, PDO::PARAM_INT);
                $updateTicketStmt->execute();

                if ($ownsTransaction) {
                    $this->conn->commit();
                }

                $assignmentType = $allowCrossService ? 'manual (cross-service)' : 'automatic';
                error_log("Successfully assigned technician {$technicianId} to ticket {$ticketId} ({$assignmentType}) and updated ticket status to 'En Proceso'");
                return true;

            } catch (PDOException $e) {
                if ($this->conn->inTransaction() && $ownsTransaction) {
                    $this->conn->rollBack();
                }
                error_log("Error assigning technician inside transaction: " . $e->getMessage());
                return false;
            }
            } catch(PDOException $exception) {
                error_log("Error assigning technician: " . $exception->getMessage());
                error_log("Params: ticketId={$ticketId}, technicianId={$technicianId}, isLead=" . ($isLead ? 'true' : 'false'));
            }

        return false;
    }

    public function releaseFromTicket($ticketId, $technicianId) {
        // Mark the technician-ticket relationship as Finalizado (not Inactivo to preserve history)
        $query = "UPDATE Ticket_Technicians SET Status = 'Finalizado' WHERE Fk_Service_Request = :ticketId AND Fk_Technician = :technicianId";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":ticketId", $ticketId);
        $stmt->bindParam(":technicianId", $technicianId);

        try {
            if ($stmt->execute()) {
                // Check if technician has other active tickets
                $checkQuery = "SELECT COUNT(*) as active_tickets
                              FROM Ticket_Technicians tt
                              JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                              WHERE tt.Fk_Technician = :technicianId
                              AND tt.Status = 'Activo'
                              AND sr.Status NOT IN ('Cerrado', 'Resuelto')";

                $checkStmt = $this->conn->prepare($checkQuery);
                $checkStmt->bindParam(":technicianId", $technicianId);
                $checkStmt->execute();
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

                $activeTickets = (int)$result['active_tickets'];

                // If no active tickets, restore technician to Disponible
                if ($activeTickets === 0) {
                    $updateQuery = "UPDATE " . $this->table_name . " SET Status = 'Disponible' WHERE ID_Technicians = :technicianId";
                    $updateStmt = $this->conn->prepare($updateQuery);
                    $updateStmt->bindParam(":technicianId", $technicianId);
                    $updateStmt->execute();

                    error_log("Technician {$technicianId} released from ticket {$ticketId} and restored to Disponible");

                    try {
                        $this->assignPendingTickets();
                    } catch (\Exception $e) {
                        error_log("Error assigning pending tickets after release: " . $e->getMessage());
                    }
                } else {
                    error_log("Technician {$technicianId} released from ticket {$ticketId} but still has {$activeTickets} active tickets");
                }

                return true;
            }
        } catch(PDOException $exception) {
            error_log("Error releasing technician from ticket: " . $exception->getMessage());
        }

        return false;
    }

    public function unassignFromTicket($ticketId, $technicianId) {
        // Mark the technician-ticket relationship as Finalizado (not Inactivo to preserve history)
        $query = "UPDATE Ticket_Technicians SET Status = 'Finalizado' WHERE Fk_Service_Request = :ticketId AND Fk_Technician = :technicianId";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":ticketId", $ticketId);
        $stmt->bindParam(":technicianId", $technicianId);

        try {
            if ($stmt->execute()) {
                // Check if technician has other active tickets
                $checkQuery = "SELECT COUNT(*) as active_count
                             FROM Ticket_Technicians tt
                             INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                             WHERE tt.Fk_Technician = :technicianId
                               AND tt.Status = 'Activo'
                               AND sr.Status NOT IN ('Cerrado', 'Resuelto')";
                $checkStmt = $this->conn->prepare($checkQuery);
                $checkStmt->bindParam(":technicianId", $technicianId);
                $checkStmt->execute();
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

                // If no more active tickets, set technician to Disponible
                if ($result['active_count'] == 0) {
                    $updateQuery = "UPDATE " . $this->table_name . " SET Status = 'Disponible' WHERE ID_Technicians = :technicianId";
                    $updateStmt = $this->conn->prepare($updateQuery);
                    $updateStmt->bindParam(":technicianId", $technicianId);
                    $updateStmt->execute();

                    try {
                        $this->assignPendingTickets();
                    } catch (\Exception $e) {
                        error_log("Error assigning pending tickets after unassign: " . $e->getMessage());
                    }
                }

                return true;
            }
        } catch(PDOException $exception) {
            error_log("Error unassigning technician: " . $exception->getMessage());
        }

        return false;
    }

    /**
     * Assign pending tickets to available technicians
     * Uses intelligent selection based on workload, schedule, priority, and availability
     * Includes escalation logic for when no technicians are available in the original service
     *
     * @return array Assignment results with count and details
     */
    public function assignPendingTickets(): array
    {
        $assignedCount = 0;
        $escalatedCount = 0;
        $results = [];
        $escalations = [];

        try {
            $pendingQuery = "SELECT ID_Service_Request, Fk_TI_Service, System_Priority, Created_at
                             FROM Service_Request
                             WHERE Status = 'Pendiente'
                             ORDER BY 
                                CASE System_Priority
                                    WHEN 'Critica' THEN 1
                                    WHEN 'Alta' THEN 2
                                    WHEN 'Media' THEN 3
                                    WHEN 'Baja' THEN 4
                                    ELSE 3
                                END,
                                Created_at ASC";

            $pendingStmt = $this->conn->prepare($pendingQuery);
            $pendingStmt->execute();
            $pendingTickets = $pendingStmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Found " . count($pendingTickets) . " pending tickets to assign");

            foreach ($pendingTickets as $ticket) {
                $ticketId = $ticket['ID_Service_Request'];
                $serviceId = (int)$ticket['Fk_TI_Service'];
                $priority = $ticket['System_Priority'] ?? 'Media';
                $priorityWeight = $this->getPriorityWeight($priority);

                $assigned = false;
                $escalated = false;

                $availableTechs = $this->getAvailableTechniciansByService($serviceId, $priorityWeight);

                error_log("Found " . count($availableTechs) . " available technicians for service {$serviceId}, ticket priority: {$priority}");

                if (!empty($availableTechs)) {
                    // Try each available technician in order until one assignment succeeds
                    foreach ($availableTechs as $selectedTech) {
                        error_log("Trying to assign technician: {$selectedTech['First_Name']} {$selectedTech['Last_Name']} " .
                                  "(Active Tickets: {$selectedTech['Active_Tickets_Count']}) to ticket {$ticketId}");

                        $assigned = $this->assignToTicket($ticketId, $selectedTech['ID_Technicians'], null, true);

                        if ($assigned) {
                            $assignedCount++;
                            $results[] = [
                                'ticket_id' => $ticketId,
                                'technician' => $selectedTech['First_Name'] . ' ' . $selectedTech['Last_Name'],
                                'service_id' => $serviceId,
                                'priority' => $priority,
                                'escalated' => false
                            ];

                            error_log("Successfully assigned technician {$selectedTech['First_Name']} {$selectedTech['Last_Name']} to ticket {$ticketId}");
                            // stop trying others
                            break;
                        } else {
                            error_log("Failed to assign technician {$selectedTech['First_Name']} {$selectedTech['Last_Name']} to ticket {$ticketId}");
                        }
                    }
                } else {
                    error_log("No available technicians found for service {$serviceId}, attempting escalation for ticket {$ticketId}");

                    $relatedTechs = $this->getTechniciansFromRelatedServices($serviceId);

                    if (!empty($relatedTechs)) {
                        foreach ($relatedTechs as $selectedTech) {
                            error_log("Escalating: trying technician {$selectedTech['First_Name']} {$selectedTech['Last_Name']} from related service");
                            $assigned = $this->assignToTicket($ticketId, $selectedTech['ID_Technicians'], null, true, true);

                            if ($assigned) {
                                $assignedCount++;
                                $escalatedCount++;
                                $escalated = true;
                                $results[] = [
                                    'ticket_id' => $ticketId,
                                    'technician' => $selectedTech['First_Name'] . ' ' . $selectedTech['Last_Name'],
                                    'service_id' => $serviceId,
                                    'related_service_id' => (int)$selectedTech['Fk_TI_Service'],
                                    'priority' => $priority,
                                    'escalated' => true
                                ];

                                $this->recordEscalation($ticketId, $serviceId, (int)$selectedTech['Fk_TI_Service']);

                                error_log("Successfully escalated assignment to technician {$selectedTech['First_Name']} {$selectedTech['Last_Name']} for ticket {$ticketId}");
                                break;
                            }
                        }
                    } else {
                        $escalations[] = [
                            'ticket_id' => $ticketId,
                            'service_id' => $serviceId,
                            'priority' => $priority,
                            'created_at' => $ticket['Created_at']
                        ];
                        error_log("No technicians available even after escalation for ticket {$ticketId}");
                    }
                }
            }

            if (!empty($escalations)) {
                $this->notifyUnassignedTickets($escalations);
            }

        } catch (PDOException $e) {
            error_log("Error assigning pending tickets: " . $e->getMessage());
        }

        return [
            'assigned_count' => $assignedCount,
            'escalated_count' => $escalatedCount,
            'unassigned_count' => count($escalations),
            'assignments' => $results,
            'unassigned' => $escalations
        ];
    }

    /**
     * Get numeric weight for priority
     *
     * @param string $priority Priority string
     * @return int Weight value
     */
    private function getPriorityWeight(string $priority): int
    {
        return match (strtolower($priority)) {
            'critica', 'critical' => 10,
            'alta', 'high' => 5,
            'media', 'medium' => 2,
            'baja', 'low' => 1,
            default => 2,
        };
    }

    /**
     * Record escalation in database for audit trail
     *
     * @param int $ticketId Ticket ID
     * @param int $originalServiceId Original service ID
     * @param int $escalatedServiceId Service ID where escalation happened
     */
    private function recordEscalation(int $ticketId, int $originalServiceId, int $escalatedServiceId): void
    {
        try {
            $query = "INSERT INTO Ticket_Escalations (Fk_Service_Request, Original_Service_ID, Escalated_Service_ID, Escalated_At)
                      VALUES (?, ?, ?, NOW())";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(1, $ticketId, \PDO::PARAM_INT);
            $stmt->bindValue(2, $originalServiceId, \PDO::PARAM_INT);
            $stmt->bindValue(3, $escalatedServiceId, \PDO::PARAM_INT);
            $stmt->execute();

            error_log("Recorded escalation for ticket {$ticketId}: {$originalServiceId} -> {$escalatedServiceId}");
        } catch (\PDOException $exception) {
            error_log("Failed to record escalation: " . $exception->getMessage());
        }
    }

    /**
     * Notify about unassigned tickets (for escalation monitoring)
     *
     * @param array<int, array<string, mixed>> $unassignedTickets List of unassigned tickets
     */
    private function notifyUnassignedTickets(array $unassignedTickets): void
    {
        try {
            $query = "INSERT INTO Pending_Ticket_Alerts (Fk_Service_Request, Alert_Type, Created_At)
                      VALUES (?, 'auto_assignment_failed', NOW())";

            $stmt = $this->conn->prepare($query);

            foreach ($unassignedTickets as $ticket) {
                try {
                    $stmt->bindValue(1, $ticket['ticket_id'], \PDO::PARAM_INT);
                    $stmt->execute();
                } catch (\PDOException $e) {
                    error_log("Failed to create alert for ticket {$ticket['ticket_id']}: " . $e->getMessage());
                }
            }

            error_log("Created " . count($unassignedTickets) . " pending ticket alerts");
        } catch (\PDOException $exception) {
            error_log("Failed to notify unassigned tickets: " . $exception->getMessage());
        }
    }

    /**
     * Close a ticket and release all assigned technicians
     * This method marks all technician-ticket relationships as Finalizado
     * and updates the ticket status to 'Cerrado'
     *
     * @param int $ticketId The ticket ID to close
     * @return bool True if successful, false otherwise
     */
    public function closeTicket(int $ticketId): bool
    {
        try {
            // Get all technicians assigned to this ticket
            $query = "SELECT Fk_Technician FROM Ticket_Technicians
                      WHERE Fk_Service_Request = :ticketId AND Status = 'Activo'";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":ticketId", $ticketId);
            $stmt->execute();
            $assignedTechnicians = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Mark all technician-ticket relationships as Finalizado
            $updateQuery = "UPDATE Ticket_Technicians SET Status = 'Finalizado'
                           WHERE Fk_Service_Request = :ticketId AND Status = 'Activo'";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(":ticketId", $ticketId);
            $updateStmt->execute();

            // Update ticket status to 'Cerrado' and set resolved timestamp
            $ticketUpdateQuery = "UPDATE Service_Request
                                 SET Status = 'Cerrado', Resolved_at = NOW()
                                 WHERE ID_Service_Request = :ticketId";
            $ticketUpdateStmt = $this->conn->prepare($ticketUpdateQuery);
            $ticketUpdateStmt->bindParam(":ticketId", $ticketId);
            $ticketUpdateStmt->execute();

            // Release all technicians to 'Disponible' status
            foreach ($assignedTechnicians as $tech) {
                $technicianId = $tech['Fk_Technician'];

                // Check if technician has other active tickets
                $checkQuery = "SELECT COUNT(*) as active_count
                              FROM Ticket_Technicians tt
                              INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                              WHERE tt.Fk_Technician = :technicianId
                                AND tt.Status = 'Activo'
                                AND sr.Status NOT IN ('Cerrado', 'Resuelto')";
                $checkStmt = $this->conn->prepare($checkQuery);
                $checkStmt->bindParam(":technicianId", $technicianId);
                $checkStmt->execute();
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

                // If no more active tickets, set technician to Disponible
                if ($result['active_count'] == 0) {
                    $updateTechQuery = "UPDATE " . $this->table_name . " SET Status = 'Disponible'
                                       WHERE ID_Technicians = :technicianId";
                    $updateTechStmt = $this->conn->prepare($updateTechQuery);
                    $updateTechStmt->bindParam(":technicianId", $technicianId);
                    $updateTechStmt->execute();

                    error_log("Technician {$technicianId} released to Disponible after closing ticket {$ticketId}");
                }
            }

            try {
                $this->assignPendingTickets();
            } catch (\Exception $e) {
                error_log("Error assigning pending tickets after close: " . $e->getMessage());
            }

            error_log("Ticket {$ticketId} closed successfully with " . count($assignedTechnicians) . " technicians released");
            return true;

        } catch (PDOException $e) {
            error_log("Error closing ticket: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all technicians grouped by TI Service type
     * Returns technicians organized by service area (Redes, Soporte, Programación)
     *
     * @return array<string, array{service_id: int, service_name: string, technicians: array}>
     */
    public function getAllTechniciansGroupedByService(): array
    {
        try {
            // Get all TI Services
            $servicesQuery = "SELECT ID_TI_Service, Type_Service, Details
                             FROM TI_Service
                             ORDER BY ID_TI_Service ASC";
            $servicesStmt = $this->conn->prepare($servicesQuery);
            $servicesStmt->execute();
            $services = $servicesStmt->fetchAll(PDO::FETCH_ASSOC);

            $groupedTechnicians = [];

            foreach ($services as $service) {
                $serviceId = (int)$service['ID_TI_Service'];
                $serviceName = $service['Type_Service'];

                // Get technicians for this service
                $query = "SELECT DISTINCT 
                         t.ID_Technicians, 
                         t.First_Name, 
                         t.Last_Name, 
                         t.Status, 
                         u.Email,
                         (SELECT COUNT(*)
                          FROM Ticket_Technicians tt
                          INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                          WHERE tt.Fk_Technician = t.ID_Technicians
                          AND sr.Status IN ('Cerrado', 'Resuelto')) as Tickets_Resolved,
                         (SELECT COUNT(*)
                          FROM Ticket_Technicians tt
                          INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                          WHERE tt.Fk_Technician = t.ID_Technicians
                          AND tt.Status = 'Activo'
                          AND sr.Status NOT IN ('Cerrado', 'Resuelto')) as Active_Tickets
                  FROM " . $this->table_name . " t
                  INNER JOIN Users u ON t.Fk_Users = u.ID_Users
                  INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                  WHERE ts.Fk_TI_Service = :serviceId
                    AND ts.Status = 'Activo'
                    AND t.Status != 'Fuera de Servicio'
                  ORDER BY t.First_Name ASC, t.Last_Name ASC";

                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":serviceId", $serviceId, PDO::PARAM_INT);
                $stmt->execute();
                $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $groupedTechnicians[] = [
                    'service_id' => $serviceId,
                    'service_name' => $serviceName,
                    'service_details' => $service['Details'],
                    'technicians' => $technicians,
                    'count' => count($technicians)
                ];
            }

            error_log("getAllTechniciansGroupedByService: Retrieved " . count($groupedTechnicians) . " service groups");
            return $groupedTechnicians;

        } catch (PDOException $e) {
            error_log("PDOException in getAllTechniciansGroupedByService: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getAllTechniciansGroupedByService: " . $e->getMessage());
            return [];
        }
    }
/**
     * Get technician performance metrics
     * Returns performance data including average resolution time and resolved tickets count
     *
     * @param string|null $startDate Start date filter (YYYY-MM-DD format)
     * @param string|null $endDate End date filter (YYYY-MM-DD format)
     * @return array<array{id: int, name: string, service: string, avg_resolution_time: float, resolved_tickets: int}>
     */
    public function getTechnicianPerformanceMetrics(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            $dateCondition = "";
            $params = [];
            
            if ($startDate) {
                $dateCondition .= " AND sr.Created_at >= :startDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
            }
            
            if ($endDate) {
                $dateCondition .= " AND sr.Created_at <= :endDate";
                $params[':endDate'] = $endDate . ' 23:59:59';
            }

            $query = "SELECT DISTINCT 
                     t.ID_Technicians,
                     CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
                     s.Type_Service as service_type,
                     COUNT(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') THEN 1 END) as resolved_tickets,
                     AVG(CASE 
                         WHEN sr.Status IN ('Cerrado', 'Resuelto') AND sr.Resolved_at IS NOT NULL 
                         THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)
                         ELSE NULL 
                     END) as avg_resolution_hours
                     FROM " . $this->table_name . " t
                     INNER JOIN Users u ON t.Fk_Users = u.ID_Users
                     INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                     INNER JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service
                     LEFT JOIN Ticket_Technicians tt ON t.ID_Technicians = tt.Fk_Technician
                     LEFT JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                     WHERE ts.Status = 'Activo'
                     " . $dateCondition . "
                     GROUP BY t.ID_Technicians, t.First_Name, t.Last_Name, s.Type_Service
                     ORDER BY technician_name ASC, service_type ASC";

            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $groupedResults = [];
            foreach ($results as $row) {
                $serviceType = $row['service_type'];
                
                if (!isset($groupedResults[$serviceType])) {
                    $groupedResults[$serviceType] = [];
                }
                
                $groupedResults[$serviceType][] = [
                    'id' => (int)$row['ID_Technicians'],
                    'name' => $row['technician_name'],
                    'service' => $row['service_type'],
                    'resolved_tickets' => (int)$row['resolved_tickets'],
                    'avg_resolution_time' => round((float)$row['avg_resolution_hours'], 2)
                ];
            }

            error_log("getTechnicianPerformanceMetrics: Retrieved " . count($groupedResults) . " service groups");
            return $groupedResults;

        } catch (PDOException $e) {
            error_log("PDOException in getTechnicianPerformanceMetrics: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getTechnicianPerformanceMetrics: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Look up technician ID by user ID
     */
    public function getTechIdByUserId(int $userId): ?int
    {
        $query = "SELECT ID_Technicians FROM " . $this->table_name . " WHERE Fk_Users = :uid LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? (int)$row['ID_Technicians'] : null;
    }

    /**
     * Get performance metrics for the currently authenticated technician
     * Returns resolved tickets today, this week, this month, and average resolution time
     */
    public function getMyPerformanceMetrics(int $technicianId): array
    {
        try {
            $query = "SELECT 
                        COUNT(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') AND DATE(sr.Resolved_at) = CURDATE() THEN 1 END) as resolved_today,
                        COUNT(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') AND sr.Resolved_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as resolved_week,
                        COUNT(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') AND sr.Resolved_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as resolved_month,
                        ROUND(AVG(CASE WHEN sr.Status IN ('Cerrado', 'Resuelto') AND sr.Resolved_at IS NOT NULL 
                            THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at) END), 1) as avg_resolution_hours
                      FROM Ticket_Technicians tt
                      INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                      WHERE tt.Fk_Technician = :techId";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':techId', $technicianId, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                return [
                    'resolved_today' => 0,
                    'resolved_week' => 0,
                    'resolved_month' => 0,
                    'avg_resolution_time' => '--',
                ];
            }

            $avg = $row['avg_resolution_hours'];
            $avgDisplay = ($avg !== null) ? round((float)$avg, 1) . 'h' : '--';

            return [
                'resolved_today' => (int)($row['resolved_today'] ?? 0),
                'resolved_week' => (int)($row['resolved_week'] ?? 0),
                'resolved_month' => (int)($row['resolved_month'] ?? 0),
                'avg_resolution_time' => $avgDisplay,
            ];
        } catch (PDOException $e) {
            error_log("PDOException in getMyPerformanceMetrics: " . $e->getMessage());
            return [
                'resolved_today' => 0,
                'resolved_week' => 0,
                'resolved_month' => 0,
                'avg_resolution_time' => '--',
            ];
        }
    }
}
?>
