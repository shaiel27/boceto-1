<?php
class Technician {
    private $conn;
    private $table_name = "Technicians";

    public $ID_Technicians;
    public $Fk_Users;
    public $First_Name;
    public $Last_Name;
    public $Fk_Lunch_Block;
    public $Status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT t.ID_Technicians, t.Fk_Users, t.First_Name, t.Last_Name, 
                          t.Fk_Lunch_Block, t.Status, t.created_at,
                          u.Email, u.Username,
                          lb.Block_Name, lb.Start_Time, lb.End_Time
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
                          lb.Block_Name, lb.Start_Time, lb.End_Time
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
        $query = "UPDATE " . $this->table_name . " 
                  SET First_Name = :First_Name, Last_Name = :Last_Name, 
                      Fk_Lunch_Block = :Fk_Lunch_Block, Status = :Status
                  WHERE ID_Technicians = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":First_Name", $data->First_Name);
        $stmt->bindParam(":Last_Name", $data->Last_Name);
        $stmt->bindParam(":Fk_Lunch_Block", $data->Fk_Lunch_Block);
        $stmt->bindParam(":Status", $data->Status);
        $stmt->bindParam(":id", $id);
        
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
        $query = "DELETE FROM " . $this->table_name . " WHERE ID_Technicians = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        
        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch(PDOException $exception) {
            echo "Delete error: " . $exception->getMessage();
        }
        
        return false;
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
}
?>
