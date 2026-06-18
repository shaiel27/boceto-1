<?php

declare(strict_types=1);

/**
 * User Systems Model
 * Manages the systems that a user has self-assigned.
 * Used to filter the software systems dropdown when creating tickets.
 */
final class UserSystem
{
    private PDO $conn;
    private string $table_name = 'User_Systems';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    /**
     * Get all systems assigned to a user.
     *
     * @param int $userId
     * @return array<int, array{id: int, name: string, description: string|null, assigned_at: string}>
     */
    public function getByUser(int $userId): array
    {
        $query = "SELECT ss.ID_System as id,
                         ss.System_Name as name,
                         ss.Description as description,
                         us.Assigned_At as assigned_at
                  FROM " . $this->table_name . " us
                  INNER JOIN Software_Systems ss ON us.Fk_System = ss.ID_System
                  WHERE us.Fk_User = :userId
                    AND ss.Status = 'Activo'
                  ORDER BY ss.System_Name ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $e) {
            error_log("UserSystem getByUser error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Bulk assign systems to a user.
     * Removes existing assignments and replaces with the provided list.
     *
     * @param int $userId
     * @param array<int> $systemIds
     * @return bool
     */
    public function assign(int $userId, array $systemIds): bool
    {
        try {
            $this->conn->beginTransaction();

            // Remove existing assignments
            $deleteQuery = "DELETE FROM " . $this->table_name . " WHERE Fk_User = :userId";
            $deleteStmt = $this->conn->prepare($deleteQuery);
            $deleteStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $deleteStmt->execute();

            // Insert new assignments
            if (!empty($systemIds)) {
                $insertQuery = "INSERT INTO " . $this->table_name . " (Fk_User, Fk_System, Assigned_At)
                                VALUES (:userId, :systemId, NOW())
                                ON DUPLICATE KEY UPDATE Assigned_At = NOW()";
                $insertStmt = $this->conn->prepare($insertQuery);

                foreach ($systemIds as $systemId) {
                    $insertStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
                    $insertStmt->bindParam(':systemId', $systemId, PDO::PARAM_INT);
                    $insertStmt->execute();
                }
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("UserSystem assign error: " . $e->getMessage());
            return false;
        }
    }
}
