<?php
class TicketComment {
    private $conn;
    private $table_name = "Ticket_Comments";

    public $ID_Comment;
    public $Fk_Service_Request;
    public $Fk_User;
    public $Comment;
    public $Created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET Fk_Service_Request = :Fk_Service_Request, Fk_User = :Fk_User, 
                      Comment = :Comment, Created_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":Fk_Service_Request", $this->Fk_Service_Request);
        $stmt->bindParam(":Fk_User", $this->Fk_User);
        $stmt->bindParam(":Comment", $this->Comment);
        
        try {
            if ($stmt->execute()) {
                $this->ID_Comment = $this->conn->lastInsertId();
                return true;
            }
        } catch(PDOException $exception) {
            echo "Create error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function getByTicket($ticketId) {
        $query = "SELECT tc.*, u.Full_Name as user_name, u.Email as user_email
                  FROM " . $this->table_name . " tc
                  LEFT JOIN Users u ON tc.Fk_User = u.ID_Users
                  WHERE tc.Fk_Service_Request = :ticketId
                  ORDER BY tc.Created_at ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":ticketId", $ticketId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE ID_Comment = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        
        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Delete error: " . $exception->getMessage();
            return false;
        }
    }
}
?>
