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

    public function getAll() {
        $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, 
                          t.Fk_Lunch_Block, t.Status, t.created_at,
                          u.Email, u.Username,
                          lb.Block_Name, lb.Start_Time, lb.End_Time,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt 
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request 
                           WHERE tt.Fk_Technician = t.ID_Technicians AND tt.Status = 'Activo' AND sr.Status != 'Resuelto') as Tickets_Assigned,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt 
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request 
                           WHERE tt.Fk_Technician = t.ID_Technicians AND sr.Status = 'Resuelto') as Tickets_Resolved
                  FROM " . $this->table_name . " t
                  LEFT JOIN Users u ON t.Fk_Users = u.ID_Users
                  LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                  ORDER BY t.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, 
                          t.Fk_Lunch_Block, t.Status, t.created_at,
                          u.Email, u.Username,
                          lb.Block_Name, lb.Start_Time, lb.End_Time,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt 
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request 
                           WHERE tt.Fk_Technician = t.ID_Technicians AND tt.Status = 'Activo' AND sr.Status != 'Resuelto') as Tickets_Assigned,
                          (SELECT COUNT(*) FROM Ticket_Technicians tt 
                           JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request 
                           WHERE tt.Fk_Technician = t.ID_Technicians AND sr.Status = 'Resuelto') as Tickets_Resolved
                  FROM " . $this->table_name . " t
                  LEFT JOIN Users u ON t.Fk_Users = u.ID_Users
                  LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                  WHERE t.ID_Technicians = :id
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByUserId($userId) {
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
        $stmt->bindParam(":userId", $userId);
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

    public function delete($id) {
        try {
            $this->conn->beginTransaction();

            // Get technician user ID before deleting
            $getTechQuery = "SELECT Fk_Users FROM " . $this->table_name . " WHERE ID_Technicians = :id";
            $getTechStmt = $this->conn->prepare($getTechQuery);
            $getTechStmt->bindParam(":id", $id);
            $getTechStmt->execute();
            $techData = $getTechStmt->fetch(PDO::FETCH_ASSOC);
            $userId = $techData['Fk_Users'] ?? null;

            // Delete ticket assignments
            $deleteTicketsQuery = "DELETE FROM Ticket_Technicians WHERE Fk_Technician = :id";
            $deleteTicketsStmt = $this->conn->prepare($deleteTicketsQuery);
            $deleteTicketsStmt->bindParam(":id", $id);
            $deleteTicketsStmt->execute();

            // Delete schedules
            $deleteSchedulesQuery = "DELETE FROM Technician_Schedules WHERE Fk_Technician = :id";
            $deleteSchedulesStmt = $this->conn->prepare($deleteSchedulesQuery);
            $deleteSchedulesStmt->bindParam(":id", $id);
            $deleteSchedulesStmt->execute();

            // Delete services
            $deleteServicesQuery = "DELETE FROM Technicians_Service WHERE Fk_Technicians = :id";
            $deleteServicesStmt = $this->conn->prepare($deleteServicesQuery);
            $deleteServicesStmt->bindParam(":id", $id);
            $deleteServicesStmt->execute();

            // Delete technician
            $query = "DELETE FROM " . $this->table_name . " WHERE ID_Technicians = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            // Delete user if exists
            if ($userId) {
                $deleteUserQuery = "DELETE FROM Users WHERE ID_Users = :userId";
                $deleteUserStmt = $this->conn->prepare($deleteUserQuery);
                $deleteUserStmt->bindParam(":userId", $userId);
                $deleteUserStmt->execute();
            }

            $this->conn->commit();
            return true;

        } catch(PDOException $exception) {
            $this->conn->rollBack();
            error_log("Delete error: " . $exception->getMessage());
            return false;
        }
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

    public function getAvailableTechniciansByService($serviceId) {
        // Get current day and time
        $currentDay = date('l'); // Monday, Tuesday, etc.
        $currentTime = date('H:i:s');

        // Map English day names to Spanish
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

        // Primero intentar obtener técnicos en horario laboral
        $query = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Lunch_Block,
                         1 as priority_score
                  FROM " . $this->table_name . " t
                  INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                  LEFT JOIN Technician_Schedules sched ON t.ID_Technicians = sched.Fk_Technician
                  LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
                  WHERE ts.Fk_TI_Service = :serviceId
                    AND ts.Status = 'Activo'
                    AND t.Status IN ('Activo', 'Disponible')
                    AND sched.Day_Of_Week = :currentDay
                    AND sched.Work_Start_Time <= :currentTime
                    AND sched.Work_End_Time >= :currentTime
                    AND (lb.Start_Time IS NULL OR lb.Start_Time > :currentTime OR lb.End_Time <= :currentTime)
                    AND t.ID_Technicians NOT IN (
                        SELECT tt.Fk_Technician
                        FROM Ticket_Technicians tt
                        INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                        WHERE tt.Status = 'Activo'
                          AND sr.Status = 'En Proceso'
                    )
                  ORDER BY t.First_Name, t.Last_Name";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":serviceId", $serviceId);
        $stmt->bindParam(":currentDay", $currentDaySpanish);
        $stmt->bindParam(":currentTime", $currentTime);

        try {
            $stmt->execute();
            $technicians = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Si no hay técnicos en horario, obtener todos los disponibles sin restricción de tiempo
            if (empty($technicians)) {
                error_log("No technicians available in working hours, getting all available technicians for service {$serviceId}");
                
                $fallbackQuery = "SELECT t.ID_Technicians, t.First_Name, t.Last_Name, t.Status, t.Fk_Lunch_Block,
                                         2 as priority_score
                                  FROM " . $this->table_name . " t
                                  INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                                  WHERE ts.Fk_TI_Service = :serviceId
                                    AND ts.Status = 'Activo'
                                    AND t.Status IN ('Activo', 'Disponible')
                                    AND t.ID_Technicians NOT IN (
                                        SELECT tt.Fk_Technician
                                        FROM Ticket_Technicians tt
                                        INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                                        WHERE tt.Status = 'Activo'
                                          AND sr.Status = 'En Proceso'
                                    )
                                  ORDER BY priority_score, t.First_Name, t.Last_Name";

                $fallbackStmt = $this->conn->prepare($fallbackQuery);
                $fallbackStmt->bindParam(":serviceId", $serviceId);
                $fallbackStmt->execute();
                $technicians = $fallbackStmt->fetchAll(PDO::FETCH_ASSOC);
            }

            error_log("Available technicians for service {$serviceId} at {$currentDaySpanish} {$currentTime}: " . count($technicians));
            foreach ($technicians as $tech) {
                error_log("  - {$tech['First_Name']} {$tech['Last_Name']} (Priority: {$tech['priority_score']})");
            }

            return $technicians;
        } catch(PDOException $exception) {
            error_log("Error getting available technicians: " . $exception->getMessage());
            return [];
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
                          AND sr.Status = 'Cerrado') as Tickets_Resolved,
                         (SELECT COUNT(*)
                          FROM Ticket_Technicians tt
                          INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                          WHERE tt.Fk_Technician = t.ID_Technicians
                          AND tt.Status = 'Activo'
                          AND sr.Status != 'Cerrado') as Active_Tickets
                  FROM " . $this->table_name . " t
                  INNER JOIN Users u ON t.Fk_Users = u.ID_Users
                  INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                  WHERE ts.Fk_TI_Service = :serviceId
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

    public function assignToTicket($ticketId, $technicianId, $assignedBy = null, $isLead = true) {
        $query = "INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, Assigned_At, Status)
                  VALUES (:ticketId, :technicianId, :isLead, NOW(), 'Activo')";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":ticketId", $ticketId);
        $stmt->bindParam(":technicianId", $technicianId);
        $stmt->bindParam(":isLead", $isLead, PDO::PARAM_BOOL);

        try {
            if ($stmt->execute()) {
                // Update technician status to Ocupado
                $updateQuery = "UPDATE " . $this->table_name . " SET Status = 'Ocupado' WHERE ID_Technicians = :technicianId";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindParam(":technicianId", $technicianId);
                $updateStmt->execute();

                // Update ticket status to 'En Proceso' when technician is assigned
                $updateTicketQuery = "UPDATE Service_Request SET Status = 'En Proceso' WHERE ID_Service_Request = :ticketId";
                $updateTicketStmt = $this->conn->prepare($updateTicketQuery);
                $updateTicketStmt->bindParam(":ticketId", $ticketId);
                $updateTicketStmt->execute();

                error_log("Successfully assigned technician {$technicianId} to ticket {$ticketId} and updated ticket status to 'En Proceso'");
                return true;
            } else {
                error_log("Failed to execute assignToTicket query for technician {$technicianId} to ticket {$ticketId}");
            }
        } catch(PDOException $exception) {
            error_log("Error assigning technician: " . $exception->getMessage());
            error_log("Query: " . $query);
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
                              AND sr.Status != 'Cerrado'";

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
                               AND sr.Status != 'Cerrado'";
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
     * This method should be called periodically or when a technician becomes available
     */
    public function assignPendingTickets(): array
    {
        $assignedCount = 0;
        $results = [];

        try {
            // Get all pending tickets
            $pendingQuery = "SELECT ID_Service_Request, Fk_TI_Service
                             FROM Service_Request
                             WHERE Status = 'Pendiente'
                             ORDER BY Created_at ASC";

            $pendingStmt = $this->conn->prepare($pendingQuery);
            $pendingStmt->execute();
            $pendingTickets = $pendingStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($pendingTickets as $ticket) {
                $ticketId = $ticket['ID_Service_Request'];
                $serviceId = (int)$ticket['Fk_TI_Service'];

                // Get all technicians for this service (without time restrictions)
                $availableTechs = $this->getAllTechniciansByService($serviceId);

                // Filter only technicians with status 'Disponible' or 'Activo'
                $availableTechs = array_filter($availableTechs, function($tech) {
                    return in_array($tech['Status'], ['Disponible', 'Activo']);
                });

                // Reindex array after filtering
                $availableTechs = array_values($availableTechs);

                if (!empty($availableTechs)) {
                    $selectedTech = $availableTechs[0];
                    $assigned = $this->assignToTicket($ticketId, $selectedTech['ID_Technicians'], null, true);

                    if ($assigned) {
                        // Update ticket status to 'En Proceso' (already done in assignToTicket)
                        $assignedCount++;
                        $results[] = [
                            'ticket_id' => $ticketId,
                            'technician' => $selectedTech['First_Name'] . ' ' . $selectedTech['Last_Name'],
                            'service_id' => $serviceId
                        ];

                        error_log("Assigned technician {$selectedTech['First_Name']} {$selectedTech['Last_Name']} to ticket {$ticketId}");
                    }
                }
            }
        } catch (PDOException $e) {
            error_log("Error assigning pending tickets: " . $e->getMessage());
        }

        return [
            'assigned_count' => $assignedCount,
            'assignments' => $results
        ];
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
                                AND sr.Status != 'Cerrado'";
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
                          AND sr.Status = 'Cerrado') as Tickets_Resolved,
                         (SELECT COUNT(*)
                          FROM Ticket_Technicians tt
                          INNER JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                          WHERE tt.Fk_Technician = t.ID_Technicians
                          AND tt.Status = 'Activo'
                          AND sr.Status != 'Cerrado') as Active_Tickets
                  FROM " . $this->table_name . " t
                  INNER JOIN Users u ON t.Fk_Users = u.ID_Users
                  INNER JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                  WHERE ts.Fk_TI_Service = :serviceId
                    AND ts.Status = 'Activo'
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
}
?>
