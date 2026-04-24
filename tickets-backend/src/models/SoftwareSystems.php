<?php
class SoftwareSystems {
    private $conn;
    private $table_name = "Software_Systems";

    public $ID_System;
    public $System_Name;
    public $Description;
    public $Status;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT ID_System, System_Name, Description, Status 
                  FROM " . $this->table_name . " 
                  WHERE Status = 'Activo'
                  ORDER BY System_Name";
        
        $stmt = $this->conn->prepare($query);
        
        try {
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Error al obtener sistemas: " . $exception->getMessage();
            return false;
        }
    }

    public function getById($id) {
        $query = "SELECT ID_System, System_Name, Description, Status 
                  FROM " . $this->table_name . " 
                  WHERE ID_System = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        
        try {
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Error al obtener sistema: " . $exception->getMessage();
            return false;
        }
    }
}
?>
