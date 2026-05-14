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

    /**
     * Get tickets distribution by office - PHP-PRO
     * Returns only offices with resolved tickets, excluding offices with 0 tickets
     *
     * @param string|null $startDate Start date filter (YYYY-MM-DD format)
     * @param string|null $endDate End date filter (YYYY-MM-DD format)
     * @return array<array{id: int, name: string, resolved_count: int, avg_resolution_time: float}>
     */
    public function getTicketsByOffice(?string $startDate = null, ?string $endDate = null): array
    {
        try {
            // Build date filter conditions
            $dateCondition = "";
            $params = [];
            
            if ($startDate) {
                $dateCondition .= " AND sr.Created_at >= :startDate";
                $params[':startDate'] = $startDate . ' 00:00:00';
            }
            
            if ($endDate) {
                $dateCondition .= " AND sr.Created_at <= :endDate";
                $params[':endDate'] = $endDate . ' 23:59:59';
            }

            // PHP-PRO: Only offices with significant resolved tickets (min 5 tickets)
            $query = "SELECT 
                     o.ID_Office,
                     o.Name_Office,
                     o.Office_Type,
                     COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved_count,
                     AVG(CASE 
                         WHEN sr.Status = 'Cerrado' AND sr.Resolved_at IS NOT NULL 
                         THEN TIMESTAMPDIFF(HOUR, sr.Created_at, sr.Resolved_at)
                         ELSE NULL 
                     END) as avg_resolution_hours
                     FROM " . $this->table_name . " o
                     INNER JOIN Service_Request sr ON o.ID_Office = sr.Fk_Office
                     WHERE o.ID_Office IS NOT NULL
                     AND sr.Status = 'Cerrado'
                     AND sr.Resolved_at IS NOT NULL
                     " . $dateCondition . "
                     GROUP BY o.ID_Office, o.Name_Office, o.Office_Type
                     HAVING resolved_count > 0
                     ORDER BY resolved_count DESC, o.Name_Office ASC";

            $stmt = $this->conn->prepare($query);
            
            // Bind parameters if they exist
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // PHP-PRO: Agregar display_name con nombres abreviados para PDF
            foreach ($results as &$office) {
                $office['display_name'] = $this->abbreviateName($office['Name_Office']);
            }
            unset($office);

            // Format the results - simplified structure
            $formattedResults = [];
            foreach ($results as $row) {
                $formattedResults[] = [
                    'id' => (int)$row['ID_Office'],
                    'name' => $row['Name_Office'],
                    'display_name' => $row['display_name'],
                    'type' => $row['Office_Type'],
                    'resolved_count' => (int)$row['resolved_count'],
                    'avg_resolution_time' => round((float)$row['avg_resolution_hours'], 2)
                ];
            }

            error_log("getTicketsByOffice: Retrieved " . count($formattedResults) . " office records with resolved tickets");
            return $formattedResults;

        } catch (PDOException $e) {
            error_log("PDOException in getTicketsByOffice: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getTicketsByOffice: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get top 5 offices by total ticket count for executive summary
     */
    public function getTopOffices(): array
    {
        try {
            $query = "SELECT 
                     o.ID_Office,
                     o.Name_Office,
                     o.Office_Type,
                     COUNT(sr.ID_Service_Request) as ticket_count,
                     COUNT(CASE WHEN sr.Status = 'Pendiente' THEN 1 END) as pending_count,
                     COUNT(CASE WHEN sr.Status = 'En Proceso' THEN 1 END) as in_progress_count,
                     COUNT(CASE WHEN sr.Status = 'Cerrado' THEN 1 END) as resolved_count
                     FROM " . $this->table_name . " o
                     LEFT JOIN Service_Request sr ON o.ID_Office = sr.Fk_Office
                     GROUP BY o.ID_Office, o.Name_Office, o.Office_Type
                     HAVING ticket_count > 0
                     ORDER BY ticket_count DESC
                     LIMIT 5";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($results as &$office) {
                $office['display_name'] = $this->abbreviateName($office['Name_Office']);
            }
            unset($office);

            return $results;
        } catch (PDOException $e) {
            error_log("PDOException in getTopOffices: " . $e->getMessage());
            return [];
        } catch (Exception $e) {
            error_log("Exception in getTopOffices: " . $e->getMessage());
            return [];
        }
    }

    /**
     * PHP-PRO: Abreviar nombre de oficina de forma inteligente
     * - Mantiene primeras 3 palabras completas
     * - Abrevia palabras largas después de las primeras 3
     * - Máximo 35 caracteres para display_name
     */
    private function abbreviateName(string $name): string
    {
        // Si el nombre ya es corto, retornarlo tal cual
        if (strlen($name) <= 30) {
            return $name;
        }

        // Dividir en palabras
        $words = explode(' ', $name);
        $abbreviated = [];
        $charCount = 0;
        $wordCount = 0;
        $maxWords = 3;

        foreach ($words as $word) {
            // Mantener primeras 3 palabras completas
            if ($wordCount < $maxWords && ($charCount + strlen($word)) <= 30) {
                $abbreviated[] = $word;
                $charCount += strlen($word) + 1; // +1 por el espacio
                $wordCount++;
            } else {
                // Abreviar palabras largas después de las primeras 3
                if (strlen($word) > 4) {
                    // Mantener primeras 3 letras + punto
                    $abbreviated[] = strtoupper(substr($word, 0, 3)) . '.';
                } else {
                    $abbreviated[] = $word;
                }
            }
        }

        $result = implode(' ', $abbreviated);

        // Truncar si aún es muy largo
        if (strlen($result) > 35) {
            return substr($result, 0, 32) . '...';
        }

        return $result;
    }
}
?>
