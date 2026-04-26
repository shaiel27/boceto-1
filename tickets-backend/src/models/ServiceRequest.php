<?php
declare(strict_types=1);

class ServiceRequest {
    private $conn;
    private $table_name = "Service_Request";

    public $ID_Service_Request;
    public $Ticket_Code;
    public $Fk_Office;
    public $Fk_User_Requester;
    public $Fk_TI_Service;
    public $Fk_Problem_Catalog;
    public $Fk_Boss_Requester;
    public $Fk_Software_System;
    public $Subject;
    public $Property_Number;
    public $Description;
    public $System_Priority;
    public $Resolution_Notes;
    public $Status;
    public $Created_at;
    public $Resolved_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Create ticket using DTO (modern approach)
     */
    public function createWithDTO(object $dto, int $requesterId): ?int
    {
        $query = "INSERT INTO " . $this->table_name . "
                  SET Fk_Office = :Fk_Office,
                      Fk_User_Requester = :Fk_User_Requester,
                      Fk_TI_Service = :Fk_TI_Service,
                      Fk_Problem_Catalog = :Fk_Problem_Catalog,
                      Fk_Boss_Requester = :Fk_Boss_Requester,
                      Fk_Software_System = :Fk_Software_System,
                      Subject = :Subject,
                      Property_Number = :Property_Number,
                      Description = :Description,
                      System_Priority = :System_Priority,
                      Status = 'Pendiente',
                      Created_at = NOW()";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":Fk_Office", $dto->fkOffice, PDO::PARAM_INT);
        $stmt->bindParam(":Fk_User_Requester", $requesterId, PDO::PARAM_INT);
        $stmt->bindParam(":Fk_TI_Service", $dto->fkTiService, PDO::PARAM_INT);
        $stmt->bindParam(":Fk_Problem_Catalog", $dto->fkProblemCatalog, PDO::PARAM_INT);
        $stmt->bindParam(":Fk_Boss_Requester", $dto->fkBossRequester, PDO::PARAM_INT);
        $stmt->bindParam(":Fk_Software_System", $dto->fkSoftwareSystem, PDO::PARAM_INT);
        $stmt->bindParam(":Subject", $dto->subject);
        $stmt->bindParam(":Property_Number", $dto->propertyNumber);
        $stmt->bindParam(":Description", $dto->description);
        $stmt->bindParam(":System_Priority", $dto->systemPriority);

        try {
            if ($stmt->execute()) {
                $this->ID_Service_Request = (int) $this->conn->lastInsertId();
                return $this->ID_Service_Request;
            }
        } catch(PDOException $exception) {
            error_log("Create error: " . $exception->getMessage());
            throw new \RuntimeException("Error al crear ticket: " . $exception->getMessage());
        }

        return null;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET Fk_Office = :Fk_Office, Fk_User_Requester = :Fk_User_Requester, 
                      Fk_TI_Service = :Fk_TI_Service, Fk_Problem_Catalog = :Fk_Problem_Catalog,
                      Fk_Boss_Requester = :Fk_Boss_Requester, Fk_Software_System = :Fk_Software_System,
                      Subject = :Subject, Property_Number = :Property_Number, Description = :Description,
                      System_Priority = :System_Priority, Status = 'Pendiente', Created_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":Fk_Office", $this->Fk_Office);
        $stmt->bindParam(":Fk_User_Requester", $this->Fk_User_Requester);
        $stmt->bindParam(":Fk_TI_Service", $this->Fk_TI_Service);
        $stmt->bindParam(":Fk_Problem_Catalog", $this->Fk_Problem_Catalog);
        $stmt->bindParam(":Fk_Boss_Requester", $this->Fk_Boss_Requester);
        $stmt->bindParam(":Fk_Software_System", $this->Fk_Software_System);
        $stmt->bindParam(":Subject", $this->Subject);
        $stmt->bindParam(":Property_Number", $this->Property_Number);
        $stmt->bindParam(":Description", $this->Description);
        $stmt->bindParam(":System_Priority", $this->System_Priority);
        
        try {
            if ($stmt->execute()) {
                $this->ID_Service_Request = $this->conn->lastInsertId();
                
                // Asignar automáticamente técnico disponible (sin errores)
                try {
                    require_once __DIR__ . '/Technician.php';
                    $technician = new Technician($this->conn);
                    $availableTechnicians = $technician->getAvailableTechniciansByService($this->Fk_TI_Service);
                    
                    if (!empty($availableTechnicians)) {
                        $selectedTechnician = $availableTechnicians[0];
                        $technician->assignToTicket($this->ID_Service_Request, $selectedTechnician['ID_Technicians'], null, true);
                        
                        $updateQuery = "UPDATE " . $this->table_name . " SET Status = 'Técnicos Asignados' WHERE ID_Service_Request = :id";
                        $updateStmt = $this->conn->prepare($updateQuery);
                        $updateStmt->bindParam(":id", $this->ID_Service_Request);
                        $updateStmt->execute();
                    }
                } catch (Exception $e) {
                    // Si falla la asignación, el ticket se queda en Pendiente
                    error_log("Error assigning technician: " . $e->getMessage());
                }
                
                return true;
            }
        } catch(PDOException $exception) {
            echo "Create error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function getAll($limit = 50, $offset = 0) {
        $query = "SELECT sr.*, u.Full_Name as user_name, o.Name_Office as office_name,
                         ts.Type_Service as service_type_name, b.Name_Boss as boss_name
                  FROM " . $this->table_name . " sr
                  LEFT JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
                  LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                  LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                  LEFT JOIN Boss b ON sr.Fk_Boss_Requester = b.ID_Boss
                  ORDER BY sr.Created_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add technicians to each ticket
        foreach ($results as &$ticket) {
            $ticket['technicians'] = $this->getTicketTechnicians($ticket['ID_Service_Request']);
        }

        return $results;
    }

    public function getById($id) {
        $query = "SELECT sr.*, u.Full_Name as user_name, o.Name_Office as office_name, 
                         ts.Type_Service as service_type_name, b.Name_Boss as boss_name
                  FROM " . $this->table_name . " sr
                  LEFT JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
                  LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                  LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                  LEFT JOIN Boss b ON sr.Fk_Boss_Requester = b.ID_Boss
                  WHERE sr.ID_Service_Request = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result['technicians'] = $this->getTicketTechnicians($id);
        }
        
        return $result;
    }

    /**
     * Update ticket status
     * @param int $id
     * @param string $status
     * @param int|null $assigned_to
     * @return bool
     */
    public function updateStatus(int $id, string $status, ?int $assigned_to = null): bool
    {
        $allowedStatuses = ['Pendiente', 'En Proceso', 'Cerrado'];
        if (!in_array($status, $allowedStatuses, true)) {
            error_log("Invalid status: {$status}");
            return false;
        }
        
        $query = "UPDATE " . $this->table_name . " SET Status = :Status";
        
        if ($status === 'Cerrado') {
            $query .= ", Resolved_at = NOW()";
        }
        
        $query .= " WHERE ID_Service_Request = :id";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->bindParam(":Status", $status, PDO::PARAM_STR);
            
            $result = $stmt->execute();
            error_log("Update status result: " . ($result ? 'success' : 'failed') . " for ticket {$id} to {$status}");
            
            // If ticket is closed, release technicians
            if ($result && $status === 'Cerrado') {
                require_once __DIR__ . '/Technician.php';
                $technician = new Technician($this->conn);
                
                // Get all technicians assigned to this ticket
                $techQuery = "SELECT Fk_Technician FROM Ticket_Technicians 
                              WHERE Fk_Service_Request = :ticketId AND Status = 'Activo'";
                $techStmt = $this->conn->prepare($techQuery);
                $techStmt->bindParam(":ticketId", $id);
                $techStmt->execute();
                $assignedTechs = $techStmt->fetchAll(PDO::FETCH_ASSOC);
                
                error_log("Releasing " . count($assignedTechs) . " technicians from closed ticket {$id}");
                
                // Release each technician
                foreach ($assignedTechs as $tech) {
                    $technician->releaseFromTicket($id, $tech['Fk_Technician']);
                }
            }
            
            return $result;
        } catch(PDOException $exception) {
            error_log("Update status error: " . $exception->getMessage());
            return false;
        }
    }

    public function getStats() {
        $query = "SELECT 
                    COUNT(*) as total_tickets,
                    SUM(CASE WHEN Status = 'Pendiente' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN Status = 'En Proceso' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN Status = 'Cerrado' THEN 1 ELSE 0 END) as resolved
                  FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByUser($userId, $limit = 50, $offset = 0) {
        $query = "SELECT sr.*, 
                         u.Full_Name as user_name, 
                         o.Name_Office as office_name,
                         o.Office_Type as office_type,
                         ts.Type_Service as service_type_name, 
                         b.Name_Boss as boss_name
                  FROM " . $this->table_name . " sr
                  LEFT JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
                  LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                  LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                  LEFT JOIN Boss b ON sr.Fk_Boss_Requester = b.ID_Boss
                  WHERE sr.Fk_User_Requester = :userId
                  ORDER BY sr.Created_at DESC 
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":userId", $userId);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add technicians array to each ticket
        foreach ($results as &$result) {
            $result['technicians'] = $this->getTicketTechnicians($result['ID_Service_Request']);
        }
        
        return $results;
    }

    public function getTicketTechnicians($ticketId) {
        $query = "SELECT t.ID_Technicians, 
                         CONCAT(t.First_Name, ' ', t.Last_Name) as name,
                         tt.Is_Lead as is_lead,
                         tt.Assignment_Role as role,
                         tt.Assigned_At as assigned_at
                  FROM Ticket_Technicians tt
                  INNER JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
                  WHERE tt.Fk_Service_Request = :ticketId AND tt.Status = 'Activo'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":ticketId", $ticketId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update ticket priority
     * @param int $id
     * @param string $priority
     * @return bool
     */
    public function updatePriority(int $id, string $priority): bool
    {
        $allowedPriorities = ['Baja', 'Media', 'Alta', 'Crítica'];
        if (!in_array($priority, $allowedPriorities, true)) {
            error_log("Invalid priority: {$priority}");
            return false;
        }
        
        $query = "UPDATE " . $this->table_name . " SET System_Priority = :priority WHERE ID_Service_Request = :id";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":priority", $priority, PDO::PARAM_STR);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            
            $result = $stmt->execute();
            error_log("Update priority result: " . ($result ? 'success' : 'failed'));
            return $result;
        } catch(PDOException $exception) {
            error_log("Update priority error: " . $exception->getMessage());
            return false;
        }
    }

    public function getByTechnician($technicianId, $limit = 50, $offset = 0) {
        $query = "SELECT sr.*,
                         u.Full_Name as user_name,
                         o.Name_Office as office_name,
                         o.Office_Type as office_type,
                         ts.Type_Service as service_type_name,
                         b.Name_Boss as boss_name,
                         tt.Is_Lead as is_lead
                  FROM " . $this->table_name . " sr
                  LEFT JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
                  LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                  LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                  LEFT JOIN Boss b ON sr.Fk_Boss_Requester = b.ID_Boss
                  INNER JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request AND tt.Status = 'Activo'
                  WHERE tt.Fk_Technician = :technicianId
                  ORDER BY sr.Created_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":technicianId", $technicianId);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add technicians array to each ticket
        foreach ($results as &$result) {
            $result['technicians'] = $this->getTicketTechnicians($result['ID_Service_Request']);
        }

        return $results;
    }

    public function getFiltered($status = null, $serviceId = null, $priority = null, $limit = 50, $offset = 0) {
        $query = "SELECT sr.*,
                         u.Full_Name as user_name,
                         o.Name_Office as office_name,
                         o.Office_Type as office_type,
                         ts.Type_Service as service_type_name,
                         b.Name_Boss as boss_name
                  FROM " . $this->table_name . " sr
                  LEFT JOIN Users u ON sr.Fk_User_Requester = u.ID_Users
                  LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                  LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                  LEFT JOIN Boss b ON sr.Fk_Boss_Requester = b.ID_Boss
                  WHERE 1=1";

        $params = [];

        if ($status) {
            $query .= " AND sr.Status = :status";
            $params[':status'] = $status;
        }

        if ($serviceId) {
            $query .= " AND sr.Fk_TI_Service = :serviceId";
            $params[':serviceId'] = $serviceId;
        }

        if ($priority) {
            $query .= " AND sr.System_Priority = :priority";
            $params[':priority'] = $priority;
        }

        $query .= " ORDER BY sr.Created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add technicians array to each ticket
        foreach ($results as &$result) {
            $result['technicians'] = $this->getTicketTechnicians($result['ID_Service_Request']);
        }

        return $results;
    }
}
?>
