<?php
declare(strict_types=1);

final class TicketAttachment
{
    private PDO $conn;
    private string $table_name = "Ticket_Attachments";

    public ?int $ID_Attachment;
    public ?int $Fk_Service_Request;
    public ?int $Fk_Comment;
    public ?int $Fk_User;
    public ?string $File_Name;
    public ?string $File_Path;
    public ?string $File_Type;
    public ?int $File_Size;
    public ?string $Uploaded_at;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function create(): bool
    {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET Fk_Service_Request = :Fk_Service_Request,
                      Fk_Comment = :Fk_Comment,
                      Fk_User = :Fk_User,
                      File_Name = :File_Name,
                      File_Path = :File_Path,
                      File_Type = :File_Type,
                      File_Size = :File_Size,
                      Uploaded_at = NOW()";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":Fk_Service_Request", $this->Fk_Service_Request, PDO::PARAM_INT);
            $stmt->bindParam(":Fk_Comment", $this->Fk_Comment, PDO::PARAM_INT);
            $stmt->bindParam(":Fk_User", $this->Fk_User, PDO::PARAM_INT);
            $stmt->bindParam(":File_Name", $this->File_Name, PDO::PARAM_STR);
            $stmt->bindParam(":File_Path", $this->File_Path, PDO::PARAM_STR);
            $stmt->bindParam(":File_Type", $this->File_Type, PDO::PARAM_STR);
            $stmt->bindParam(":File_Size", $this->File_Size, PDO::PARAM_INT);

            if ($stmt->execute()) {
                $this->ID_Attachment = (int)$this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch (PDOException $exception) {
            error_log("Create attachment error: " . $exception->getMessage());
            return false;
        }
    }

    public function getByTicket(int $ticketId): array
    {
        $query = "SELECT ta.*, u.Full_Name as user_name
                  FROM " . $this->table_name . " ta
                  LEFT JOIN Users u ON ta.Fk_User = u.ID_Users
                  WHERE ta.Fk_Service_Request = :ticketId
                  ORDER BY ta.Uploaded_at ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":ticketId", $ticketId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $exception) {
            error_log("Get attachments error: " . $exception->getMessage());
            return [];
        }
    }

    public function getByComment(int $commentId): array
    {
        $query = "SELECT ta.*, u.Full_Name as user_name
                  FROM " . $this->table_name . " ta
                  LEFT JOIN Users u ON ta.Fk_User = u.ID_Users
                  WHERE ta.Fk_Comment = :commentId
                  ORDER BY ta.Uploaded_at ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":commentId", $commentId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $exception) {
            error_log("Get comment attachments error: " . $exception->getMessage());
            return [];
        }
    }
}
