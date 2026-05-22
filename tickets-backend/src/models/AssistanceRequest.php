<?php
declare(strict_types=1);

final class AssistanceRequest
{
    private PDO $conn;
    private string $table_name = "Assistance_Requests";

    public ?int $ID_Request;
    public ?int $Fk_Ticket;
    public ?int $Fk_Requesting_Technician;
    public ?int $Fk_Assigned_Technician;
    public string $Status;
    public string $Requested_At;
    public ?string $Updated_At;
    public int $Notification_Count;
    public ?string $Last_Notified_At;

    public function __construct(PDO $db)
    {
        $this->conn = $db;
        $this->Status = 'PENDIENTE';
        $this->Notification_Count = 0;
    }

    public function create(): bool
    {
        $query = "INSERT INTO " . $this->table_name . "
                  SET Fk_Ticket = :ticket,
                      Fk_Requesting_Technician = :tech,
                      Status = 'PENDIENTE',
                      Requested_At = NOW(),
                      Notification_Count = 0,
                      Last_Notified_At = NOW()";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":ticket", $this->Fk_Ticket, PDO::PARAM_INT);
            $stmt->bindParam(":tech", $this->Fk_Requesting_Technician, PDO::PARAM_INT);
            if ($stmt->execute()) {
                $this->ID_Request = (int)$this->conn->lastInsertId();
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Create assistance request error: " . $e->getMessage());
            return false;
        }
    }

    public function getPending(): array
    {
        $query = "SELECT ar.*, 
                         sr.Ticket_Code, sr.Subject as ticket_subject,
                         u.Full_Name as technician_name
                  FROM " . $this->table_name . " ar
                  LEFT JOIN Service_Request sr ON ar.Fk_Ticket = sr.ID_Service_Request
                  LEFT JOIN Users u ON ar.Fk_Requesting_Technician = u.ID_Users
                  WHERE ar.Status = 'PENDIENTE'
                  ORDER BY ar.Requested_At ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $e) {
            error_log("Get pending assistance requests error: " . $e->getMessage());
            return [];
        }
    }

    public function getByTicket(int $ticketId): ?array
    {
        $query = "SELECT ar.*, u.Full_Name as technician_name
                  FROM " . $this->table_name . " ar
                  LEFT JOIN Users u ON ar.Fk_Requesting_Technician = u.ID_Users
                  WHERE ar.Fk_Ticket = :ticket
                  ORDER BY ar.Requested_At DESC
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":ticket", $ticketId, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Get assistance by ticket error: " . $e->getMessage());
            return null;
        }
    }

    public function assign(int $requestId, int $adminUserId): bool
    {
        $query = "UPDATE " . $this->table_name . "
                  SET Status = 'ASIGNADO',
                      Fk_Assigned_Technician = :admin,
                      Updated_At = NOW()
                  WHERE ID_Request = :id AND Status = 'PENDIENTE'";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":admin", $adminUserId, PDO::PARAM_INT);
            $stmt->bindParam(":id", $requestId, PDO::PARAM_INT);
            return $stmt->execute() && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Assign assistance request error: " . $e->getMessage());
            return false;
        }
    }

    public function reject(int $requestId): bool
    {
        $query = "UPDATE " . $this->table_name . "
                  SET Status = 'RECHAZADO',
                      Updated_At = NOW()
                  WHERE ID_Request = :id AND Status = 'PENDIENTE'";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $requestId, PDO::PARAM_INT);
            return $stmt->execute() && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Reject assistance request error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update last notified timestamp and increment count.
     * Returns true if 5+ minutes have passed since last notification.
     */
    public function shouldRenotify(): array
    {
        $query = "SELECT ID_Request, Fk_Ticket, Fk_Requesting_Technician,
                         TIMESTAMPDIFF(MINUTE, Last_Notified_At, NOW()) as minutes_since
                  FROM " . $this->table_name . "
                  WHERE Status = 'PENDIENTE'
                    AND (Last_Notified_At IS NULL OR TIMESTAMPDIFF(MINUTE, Last_Notified_At, NOW()) >= 5)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $e) {
            error_log("Should renotify check error: " . $e->getMessage());
            return [];
        }
    }

    public function markNotified(int $requestId): bool
    {
        $query = "UPDATE " . $this->table_name . "
                  SET Notification_Count = Notification_Count + 1,
                      Last_Notified_At = NOW()
                  WHERE ID_Request = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $requestId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Mark notified error: " . $e->getMessage());
            return false;
        }
    }
}
