<?php
class ServiceProblemsCatalog {
    private $conn;
    private $table_name = "Service_Problems_Catalog";

    public $ID_Problem_Catalog;
    public $Fk_TI_Service;
    public $Problem_Name;
    public $Typical_Description;
    public $Estimated_Severity;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getByServiceId($serviceId) {
        $query = "SELECT ID_Problem_Catalog, Fk_TI_Service, Problem_Name, 
                         Typical_Description, Estimated_Severity 
                  FROM " . $this->table_name . " 
                  WHERE Fk_TI_Service = :service_id 
                  ORDER BY ID_Problem_Catalog";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":service_id", $serviceId);
        
        try {
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Error al obtener problemas: " . $exception->getMessage();
            return false;
        }
    }

    public function getById($id) {
        $query = "SELECT ID_Problem_Catalog, Fk_TI_Service, Problem_Name, 
                         Typical_Description, Estimated_Severity 
                  FROM " . $this->table_name . " 
                  WHERE ID_Problem_Catalog = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        
        try {
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Error al obtener problema: " . $exception->getMessage();
            return false;
        }
    }
}
?>
