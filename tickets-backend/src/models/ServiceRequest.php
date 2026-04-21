<?php
class ServiceRequest {
    private $conn;
    private $table_name = "Service_Request";

    public $id;
    public $user_id;
    public $office_id;
    public $service_type_id;
    public $subject;
    public $description;
    public $priority;
    public $status;
    public $assigned_to;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id = :user_id, office_id = :office_id, service_type_id = :service_type_id,
                      subject = :subject, description = :description, priority = :priority,
                      status = 'Pendiente', created_at = NOW(), updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":office_id", $this->office_id);
        $stmt->bindParam(":service_type_id", $this->service_type_id);
        $stmt->bindParam(":subject", $this->subject);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":priority", $this->priority);
        
        try {
            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
        } catch(PDOException $exception) {
            echo "Create error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function getAll($limit = 50, $offset = 0) {
        $query = "SELECT sr.*, u.full_name as user_name, o.Office_Name as office_name, 
                         ts.Service_Name as service_type_name, t.full_name as technician_name
                  FROM " . $this->table_name . " sr
                  LEFT JOIN Users u ON sr.user_id = u.id
                  LEFT JOIN Office o ON sr.office_id = o.id
                  LEFT JOIN TI_Service ts ON sr.service_type_id = ts.id
                  LEFT JOIN Users t ON sr.assigned_to = t.id
                  ORDER BY sr.created_at DESC 
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->bindParam(":offset", $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT sr.*, u.full_name as user_name, o.Office_Name as office_name, 
                         ts.Service_Name as service_type_name, t.full_name as technician_name
                  FROM " . $this->table_name . " sr
                  LEFT JOIN Users u ON sr.user_id = u.id
                  LEFT JOIN Office o ON sr.office_id = o.id
                  LEFT JOIN TI_Service ts ON sr.service_type_id = ts.id
                  LEFT JOIN Users t ON sr.assigned_to = t.id
                  WHERE sr.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status, $assigned_to = null) {
        $query = "UPDATE " . $this->table_name . " 
                  SET status = :status, assigned_to = :assigned_to, updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":assigned_to", $assigned_to);
        
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
                    SUM(CASE WHEN status = 'Pendiente' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'En Proceso' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'Cerrado' THEN 1 ELSE 0 END) as resolved,
                    AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_resolution_hours
                  FROM " . $this->table_name;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
