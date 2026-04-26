<?php
class User {
    private $conn;
    private $table_name = "Users";

    public $ID_Users;
    public $Fk_Role;
    public $Email;
    public $Password;
    public $Username;
    public $Full_Name;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login($email, $password) {
        $query = "SELECT u.ID_Users, u.Username, u.Email, u.Full_Name, u.Password, r.Role, r.ID_Role,
                         o.ID_Office as office_id
                  FROM " . $this->table_name . " u
                  JOIN Role r ON u.Fk_Role = r.ID_Role
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
                  WHERE u.Email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);

        try {
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                // Verify password using password_verify
                if (password_verify($password, $row['Password'])) {
                    // Remove password from response
                    unset($row['Password']);
                    
                    // Ensure office_id is properly set (can be null if no office assigned)
                    if (!isset($row['office_id'])) {
                        $row['office_id'] = null;
                    }
                    
                    return $row;
                }
            }
        } catch(PDOException $exception) {
            echo "Login error: " . $exception->getMessage();
        }

        return false;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET Fk_Role = :Fk_Role, Email = :Email, Password = :Password, 
                      Username = :Username, Full_Name = :Full_Name, created_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":Fk_Role", $this->Fk_Role);
        $stmt->bindParam(":Email", $this->Email);
        $stmt->bindParam(":Password", $this->Password);
        $stmt->bindParam(":Username", $this->Username);
        $stmt->bindParam(":Full_Name", $this->Full_Name);
        
        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch(PDOException $exception) {
            echo "Create error: " . $exception->getMessage();
        }
        
        return false;
    }

    public function getAll() {
        $query = "SELECT u.ID_Users, u.Username, u.Email, u.Full_Name, r.Role, u.created_at 
                  FROM " . $this->table_name . " u
                  JOIN Role r ON u.Fk_Role = r.ID_Role
                  ORDER BY u.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTechnicians() {
        $query = "SELECT u.ID_Users, u.Full_Name, u.Email, t.ID_Technicians
                  FROM " . $this->table_name . " u
                  JOIN Technicians t ON u.ID_Users = t.Fk_Users
                  JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE r.Role = 'Tecnico' AND t.Status = 'Activo'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get technicians with their TI services
     * @return array<int, array{ID_Technicians: int, First_Name: string, Last_Name: string, Email: string, Status: string, TI_Services: array}>
     */
    public function getTechniciansWithServices(): array
    {
        error_log("=== getTechniciansWithServices START ===");
        
        $query = "SELECT t.ID_Technicians, 
                         t.First_Name, 
                         t.Last_Name, 
                         t.Status, 
                         u.Email,
                         ts.Fk_TI_Service,
                         s.Type_Service
                  FROM Technicians t
                  INNER JOIN Users u ON t.Fk_Users = u.ID_Users
                  LEFT JOIN Technicians_Service ts ON t.ID_Technicians = ts.Fk_Technicians
                  LEFT JOIN TI_Service s ON ts.Fk_TI_Service = s.ID_TI_Service
                  WHERE t.Status IN ('Activo', 'Disponible', 'Ocupado')
                  ORDER BY t.First_Name, t.Last_Name";

        error_log("Query: " . $query);

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("Raw results count: " . count($results));
            error_log("Raw results: " . json_encode($results));

            // Group by technician
            $technicians = [];
            foreach ($results as $row) {
                $techId = $row['ID_Technicians'];
                
                if (!isset($technicians[$techId])) {
                    $technicians[$techId] = [
                        'ID_Technicians' => $row['ID_Technicians'],
                        'First_Name' => $row['First_Name'],
                        'Last_Name' => $row['Last_Name'],
                        'Email' => $row['Email'],
                        'Status' => $row['Status'],
                        'TI_Services' => []
                    ];
                }
                
                if ($row['Fk_TI_Service'] && $row['Type_Service']) {
                    $technicians[$techId]['TI_Services'][] = [
                        'ID_TI_Service' => $row['Fk_TI_Service'],
                        'Type_Service' => $row['Type_Service']
                    ];
                }
            }

            $finalResult = array_values($technicians);
            error_log("Grouped technicians count: " . count($finalResult));
            error_log("Grouped technicians: " . json_encode($finalResult));
            error_log("=== getTechniciansWithServices END ===");
            
            return $finalResult;
        } catch (PDOException $e) {
            error_log("Error in getTechniciansWithServices: " . $e->getMessage());
            error_log("Error trace: " . $e->getTraceAsString());
            return [];
        }
    }

    public function getById($id) {
        $query = "SELECT u.ID_Users, u.Full_Name, u.Email, u.created_at,
                         COALESCE(o.ID_Office, NULL) as office_id,
                         COALESCE(o.Name_Office, '') as office_name,
                         COALESCE(o.Office_Type, '') as office_type,
                         r.Role as role_name
                  FROM " . $this->table_name . " u
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
                  LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE u.ID_Users = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Ensure created_at has a value if null
        if ($result && empty($result['created_at'])) {
            $result['created_at'] = date('Y-m-d H:i:s');
        }
        
        return $result;
    }

    public function createWithOffice($data) {
        try {
            $this->conn->beginTransaction();
            
            // Insert user
            $query = "INSERT INTO " . $this->table_name . " 
                      (Fk_Role, Email, Password, Username, Full_Name) 
                      VALUES (:role, :email, :password, :username, :full_name)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":role", $data->role);
            $stmt->bindParam(":email", $data->email);
            $stmt->bindParam(":password", $data->password);
            $stmt->bindParam(":username", $data->username);
            $stmt->bindParam(":full_name", $data->full_name);
            $stmt->execute();
            
            $userId = $this->conn->lastInsertId();
            
            // If role is Jefe (3), create Boss record and assign office
            if ($data->role == 3 && isset($data->office_id)) {
                $query = "INSERT INTO Boss (Name_Boss, Pronoun, Fk_User)
                          VALUES (:name_boss, :pronoun, :user_id)";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":name_boss", $data->name_boss);
                $stmt->bindParam(":pronoun", $data->pronoun);
                $stmt->bindParam(":user_id", $userId);
                $stmt->execute();

                $bossId = $this->conn->lastInsertId();

                // Update Office to link to this Boss
                $query = "UPDATE Office SET Fk_Boss_ID = :boss_id WHERE ID_Office = :office_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":boss_id", $bossId);
                $stmt->bindParam(":office_id", $data->office_id);
                $stmt->execute();
            }

            // If role is Solicitante (4) and has office_id, create Boss record as requester
            if ($data->role == 4 && isset($data->office_id)) {
                $query = "INSERT INTO Boss (Name_Boss, Pronoun, Fk_User)
                          VALUES (:name_boss, :pronoun, :user_id)";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":name_boss", $data->name_boss);
                $stmt->bindParam(":pronoun", $data->pronoun);
                $stmt->bindParam(":user_id", $userId);
                $stmt->execute();

                $bossId = $this->conn->lastInsertId();

                // Update Office to link to this Boss
                $query = "UPDATE Office SET Fk_Boss_ID = :boss_id WHERE ID_Office = :office_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":boss_id", $bossId);
                $stmt->bindParam(":office_id", $data->office_id);
                $stmt->execute();
            }
            
            $this->conn->commit();
            return $userId;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }

    public function getAllWithOffice() {
        $query = "SELECT u.ID_Users, u.Email, u.Full_Name, u.created_at, u.Fk_Role,
                         r.Role as role_name,
                         r.Description as role_description,
                         b.Name_Boss as boss_name,
                         b.Pronoun as boss_pronoun,
                         o.Name_Office as office_name,
                         o.Office_Type as office_type
                  FROM " . $this->table_name . " u
                  LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
                  ORDER BY u.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id, $data) {
        $fields = [];
        $params = [];

        if (isset($data->Email)) {
            $fields[] = "Email = :Email";
            $params[':Email'] = $data->Email;
        }
        if (isset($data->Password)) {
            $fields[] = "Password = :Password";
            $params[':Password'] = password_hash($data->Password, PASSWORD_DEFAULT);
        }
        if (isset($data->Full_Name)) {
            $fields[] = "Full_Name = :Full_Name";
            $params[':Full_Name'] = $data->Full_Name;
        }

        if (empty($fields)) {
            return false;
        }

        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE ID_Users = :id";
        $params[':id'] = $id;

        $stmt = $this->conn->prepare($query);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        try {
            return $stmt->execute();
        } catch(PDOException $exception) {
            echo "Update error: " . $exception->getMessage();
        }

        return false;
    }
}
?>
