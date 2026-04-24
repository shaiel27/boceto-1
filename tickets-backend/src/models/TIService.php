<?php
class TIService {
    private $conn;
    private $table_name = "TI_Service";

    public $ID_TI_Service;
    public $Type_Service;
    public $Details;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT ID_TI_Service, Type_Service, Details 
                  FROM " . $this->table_name . " 
                  ORDER BY ID_TI_Service";
        
        $stmt = $this->conn->prepare($query);
        
        try {
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Error al obtener servicios: " . $exception->getMessage();
            return false;
        }
    }

    public function getById($id) {
        $query = "SELECT ID_TI_Service, Type_Service, Details 
                  FROM " . $this->table_name . " 
                  WHERE ID_TI_Service = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        
        try {
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Error al obtener servicio: " . $exception->getMessage();
            return false;
        }
    }
}
?>
