<?php
declare(strict_types=1);

/**
 * Ticket Comment Model
 * Handles ticket comments and operations
 * Following PHP-PRO strict typing and best practices
 */
final class TicketComment
{
    private PDO $conn;
    private string $table_name = "Ticket_Comments";

    public ?int $ID_Comment;
    public ?int $Fk_Service_Request;
    public ?int $Fk_User;
    public ?string $Comment;
    public ?string $Created_at;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /**
     * Create a new comment
     * @return bool
     */
    public function create(): bool
    {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET Fk_Service_Request = :Fk_Service_Request, 
                      Fk_User = :Fk_User, 
                      Comment = :Comment, 
                      Created_at = NOW()";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":Fk_Service_Request", $this->Fk_Service_Request, PDO::PARAM_INT);
            $stmt->bindParam(":Fk_User", $this->Fk_User, PDO::PARAM_INT);
            $stmt->bindParam(":Comment", $this->Comment, PDO::PARAM_STR);
            
            if ($stmt->execute()) {
                $this->ID_Comment = (int)$this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch(PDOException $exception) {
            error_log("Create comment error: " . $exception->getMessage());
            return false;
        }
    }

    /**
     * Get all comments for a ticket
     * @param int $ticketId
     * @return array<int, array{ID_Comment: int, Fk_Service_Request: int, Fk_User: int, Comment: string, Created_at: string, user_name: string, user_email: string}>
     */
    public function getByTicket(int $ticketId): array
    {
        $query = "SELECT tc.*, 
                         u.Full_Name as user_name, 
                         u.Email as user_email,
                         r.Role as user_role
                  FROM " . $this->table_name . " tc
                  LEFT JOIN Users u ON tc.Fk_User = u.ID_Users
                  LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE tc.Fk_Service_Request = :ticketId
                  ORDER BY tc.Created_at ASC";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":ticketId", $ticketId, PDO::PARAM_INT);
            $stmt->execute();
            
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Found " . count($comments) . " comments for ticket {$ticketId}");
            
            return $comments ?: [];
        } catch(PDOException $exception) {
            error_log("Get comments error: " . $exception->getMessage());
            return [];
        }
    }
}
