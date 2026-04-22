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
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
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
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Update error: " . $exception->getMessage();
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
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
