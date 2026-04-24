<?php
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
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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

    public function updateStatus($id, $status, $assigned_to = null) {
        $query = "UPDATE " . $this->table_name . " 
                  SET Status = :Status";
        
        if ($status === 'Cerrado') {
            $query .= ", Resolved_at = NOW()";
        }
        
        $query .= " WHERE ID_Service_Request = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":Status", $status);
        
        try {
            if ($stmt->execute()) {
                // Si se cierra el ticket, actualizar status de técnicos asignados
                if ($status === 'Cerrado') {
                    require_once __DIR__ . '/Technician.php';
                    $technician = new Technician($this->conn);
                    
                    // Obtener técnicos asignados a este ticket
                    $assignedTechs = $this->getTicketTechnicians($id);
                    
                    foreach ($assignedTechs as $tech) {
                        // Verificar si el técnico tiene otros tickets activos (no cerrados)
                        $checkQuery = "SELECT COUNT(*) as active_count
                                     FROM Ticket_Technicians tt
                                     INNER JOIN service_request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                                     WHERE tt.Fk_Technician = :techId 
                                       AND tt.Status = 'Activo'
                                       AND sr.Status != 'Cerrado'";
                        $checkStmt = $this->conn->prepare($checkQuery);
                        $checkStmt->bindParam(":techId", $tech['ID_Technicians']);
                        $checkStmt->execute();
                        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
                        
                        // Si no tiene más tickets activos, cambiar a Disponible
                        if ($result['active_count'] == 0) {
                            $updateTechQuery = "UPDATE Technicians SET Status = 'Disponible' WHERE ID_Technicians = :techId";
                            $updateTechStmt = $this->conn->prepare($updateTechQuery);
                            $updateTechStmt->bindParam(":techId", $tech['ID_Technicians']);
                            $updateTechStmt->execute();
                        }
                    }
                }
                
                return true;
            }
        } catch(PDOException $exception) {
            echo "Update error: " . $exception->getMessage();
            return false;
        }
        
        return false;
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

    public function updatePriority($id, $priority) {
        $allowedPriorities = ['Baja', 'Media', 'Alta'];
        if (!in_array($priority, $allowedPriorities, true)) {
            return false;
        }
        
        $query = "UPDATE " . $this->table_name . " SET System_Priority = :priority WHERE ID_Service_Request = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":priority", $priority);
        $stmt->bindParam(":id", $id);
        
        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Update priority error: " . $exception->getMessage();
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
}
?>
