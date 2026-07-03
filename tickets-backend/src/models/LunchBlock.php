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

    public function create(string $blockName, string $startTime, string $endTime): ?int {
        $query = "INSERT INTO " . $this->table_name . " (Block_Name, Start_Time, End_Time)
                  VALUES (:block_name, :start_time, :end_time)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":block_name", $blockName);
        $stmt->bindParam(":start_time", $startTime);
        $stmt->bindParam(":end_time", $endTime);

        if ($stmt->execute()) {
            return (int)$this->conn->lastInsertId();
        }

        return null;
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
