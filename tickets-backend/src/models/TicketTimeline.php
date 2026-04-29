<?php
declare(strict_types=1);

class TicketTimeline {
    private $conn;
    private $table_name = "Ticket_Timeline";

    public $ID_Timeline;
    public $Fk_Service_Request;
    public $Fk_User_Actor;
    public $Action_Description;
    public $Old_Status;
    public $New_Status;
    public $Event_Date;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get timeline events for a specific ticket
     * @param int $ticketId
     * @return array
     */
    public function getByTicket(int $ticketId): array {
        $query = "SELECT tt.ID_Timeline,
                         tt.Fk_Service_Request,
                         tt.Fk_User_Actor,
                         tt.Action_Description,
                         tt.Old_Status,
                         tt.New_Status,
                         tt.Event_Date,
                         u.Full_Name as User_Name,
                         u.Username as User_Username
                  FROM " . $this->table_name . " tt
                  LEFT JOIN Users u ON tt.Fk_User_Actor = u.ID_Users
                  WHERE tt.Fk_Service_Request = :ticketId
                  ORDER BY tt.Event_Date ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":ticketId", $ticketId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new timeline event
     * @param int $ticketId
     * @param int $userId
     * @param string $actionDescription
     * @param string|null $oldStatus
     * @param string|null $newStatus
     * @return bool
     */
    public function create(int $ticketId, int $userId, string $actionDescription, ?string $oldStatus = null, ?string $newStatus = null): bool {
        $query = "INSERT INTO " . $this->table_name . "
                  SET Fk_Service_Request = :ticketId,
                      Fk_User_Actor = :userId,
                      Action_Description = :actionDescription,
                      Old_Status = :oldStatus,
                      New_Status = :newStatus,
                      Event_Date = NOW()";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":ticketId", $ticketId, PDO::PARAM_INT);
        $stmt->bindParam(":userId", $userId, PDO::PARAM_INT);
        $stmt->bindParam(":actionDescription", $actionDescription, PDO::PARAM_STR);
        $stmt->bindParam(":oldStatus", $oldStatus, PDO::PARAM_STR);
        $stmt->bindParam(":newStatus", $newStatus, PDO::PARAM_STR);

        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            error_log("Timeline create error: " . $exception->getMessage());
            return false;
        }
    }
}
?>
