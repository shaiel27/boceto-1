<?php
class Office {
    private $conn;
    private $table_name = "Office";

    public $ID_Office;
    public $Name_Office;
    public $Office_Type;
    public $Fk_Parent_Office;
    public $Fk_Boss_ID;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT ID_Office, Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID, created_at
                  FROM " . $this->table_name . " 
                  ORDER BY Name_Office ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT ID_Office, Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID, created_at
                  FROM " . $this->table_name . " 
                  WHERE ID_Office = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
