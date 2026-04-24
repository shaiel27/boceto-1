<?php
class LunchBlock {
    private $conn;
    private $table_name = "Lunch_Blocks";

    public $ID_Lunch_Block;
    public $Block_Name;
    public $Start_Time;
    public $End_Time;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT ID_Lunch_Block, Block_Name, Start_Time, End_Time
                  FROM " . $this->table_name . "
                  ORDER BY ID_Lunch_Block";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT ID_Lunch_Block, Block_Name, Start_Time, End_Time
                  FROM " . $this->table_name . "
                  WHERE ID_Lunch_Block = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
