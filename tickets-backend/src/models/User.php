<?php

declare(strict_types=1);

class User {
    private $conn;
    private $table_name = "Users";

    public $ID_Users;
    public $Fk_Role;
    public $Email;
    public $Password;
    public $Username;
    public $Full_Name;
    public $is_system_user = 0;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login($email, $password) {
        // Select user by email. We'll enforce is_system_user OR role-based allowance after verifying password.
        $query = "SELECT u.ID_Users, u.Username, u.Email, u.Full_Name, u.Password, u.is_system_user, u.last_login_at,
                         r.Role, r.ID_Role,
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

                // Verify password — support both hashed and plaintext (seed data)
                $storedHash = $row['Password'];
                $valid = password_verify($password, $storedHash);
                if (!$valid && !password_get_info($storedHash)['algo']) {
                    $valid = ($password === $storedHash);
                }
                if (!$valid) {
                    return false;
                }
                // Upgrade plaintext to hash on successful login
                if (!password_get_info($storedHash)['algo']) {
                    $newHash = password_hash($password, PASSWORD_DEFAULT);
                    try {
                        $upgrade = $this->conn->prepare("UPDATE " . $this->table_name . " SET Password = :hash WHERE ID_Users = :id");
                        $upgrade->bindParam(':hash', $newHash);
                        $upgrade->bindParam(':id', $row['ID_Users'], PDO::PARAM_INT);
                        $upgrade->execute();
                    } catch (PDOException $e) {
                        error_log("Failed to upgrade password hash for user {$row['ID_Users']}: " . $e->getMessage());
                    }
                }
                // Decide whether this user is allowed to login.
                    // Preferred method: is_system_user = 1.
                    // For compatibility with pre-migration seeded data, allow users with internal roles (Admin, Tecnico, Jefe)
                    $isSystem = isset($row['is_system_user']) ? (int)$row['is_system_user'] : 0;
                    $roleId = isset($row['ID_Role']) ? (int)$row['ID_Role'] : null;

                    $allowedRoles = [1, 2, 3, 4]; // Admin, Tecnico, Jefe, Auditor
                    $allowed = ($isSystem === 1) || ($roleId !== null && in_array($roleId, $allowedRoles, true));

                    if (!$allowed) {
                        error_log("Login denied for user {$row['Email']}: not a system user and not in allowed roles");
                        return false;
                    }

                    // Update last_login_at for auditing (best-effort)
                    try {
                        $update = $this->conn->prepare("UPDATE " . $this->table_name . " SET last_login_at = NOW() WHERE ID_Users = :id");
                        $update->bindParam(':id', $row['ID_Users'], PDO::PARAM_INT);
                        $update->execute();
                    } catch (PDOException $e) {
                        // Don't block login on update failure, just log
                        error_log("Failed to update last_login_at for user {$row['ID_Users']}: " . $e->getMessage());
                    }

                    // Remove password from response
                    unset($row['Password']);
                    
                    // Ensure office_id is properly set (can be null if no office assigned)
                    if (!isset($row['office_id'])) {
                        $row['office_id'] = null;
                    }
                    
                    // Normalize is_system_user to int in returned row
                    $row['is_system_user'] = $isSystem;

                    return $row;
            }
        } catch(PDOException $exception) {
            echo "Login error: " . $exception->getMessage();
        }

        return false;
    }

    public function create() {
        // Decide if this user should be marked as a system user.
        // By default treat roles 1 (Admin), 2 (Tecnico), 3 (Jefe) as system users.
        $roleId = isset($this->Fk_Role) ? (int)$this->Fk_Role : 0;
        $isSystem = isset($this->is_system_user) ? (int)$this->is_system_user : (in_array($roleId, [1,2,3]) ? 1 : 0);

        $query = "INSERT INTO " . $this->table_name . " 
                  SET Fk_Role = :Fk_Role, Email = :Email, Password = :Password, 
                      Username = :Username, Full_Name = :Full_Name, is_system_user = :is_system_user, created_at = NOW()";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":Fk_Role", $this->Fk_Role);
        $stmt->bindParam(":Email", $this->Email);
        $stmt->bindParam(":Password", $this->Password);
        $stmt->bindParam(":Username", $this->Username);
        $stmt->bindParam(":Full_Name", $this->Full_Name);
        $stmt->bindValue(":is_system_user", $isSystem, PDO::PARAM_INT);

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
        // Only return technicians that are system users (internal staff)
        $query = "SELECT u.ID_Users, u.Full_Name, u.Email, t.ID_Technicians
                  FROM " . $this->table_name . " u
                  JOIN Technicians t ON u.ID_Users = t.Fk_Users
                  JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE r.Role = 'Tecnico' AND t.Status = 'Activo' AND COALESCE(u.is_system_user, 0) = 1";
        
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
        
            // Only include technicians whose Users record is marked as system users
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
                     AND COALESCE(u.is_system_user, 0) = 1
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
        $query = "SELECT u.ID_Users, u.Full_Name, u.Email, u.created_at, u.last_login_at,
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
            // Determine is_system_user for this created user (respect provided flag, otherwise infer from role)
            $isSystem = isset($data->is_system_user) ? (int)$data->is_system_user : (in_array((int)$data->role, [1,2,3]) ? 1 : 0);

            $query = "INSERT INTO " . $this->table_name . " 
                      (Fk_Role, Email, Password, Username, Full_Name, is_system_user) 
                      VALUES (:role, :email, :password, :username, :full_name, :is_system_user)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":role", $data->role);
            $stmt->bindParam(":email", $data->email);
            $stmt->bindParam(":password", $data->password);
            $stmt->bindParam(":username", $data->username);
            $stmt->bindParam(":full_name", $data->full_name);
            $stmt->bindValue(":is_system_user", $isSystem, PDO::PARAM_INT);
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

    /**
     * Change user password with validation
     * @param int $userId User ID
     * @param string $currentPassword Current password
     * @param string $newPassword New password
     * @return array{success: bool, message: string}
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): array
    {
        // Validate password length (minimum 8 characters)
        if (strlen($newPassword) < 8) {
            return [
                'success' => false,
                'message' => 'La nueva contraseña debe tener al menos 8 caracteres'
            ];
        }

        // Validate password complexity (at least one uppercase, one lowercase, one number)
        if (!preg_match('/[A-Z]/', $newPassword) || !preg_match('/[a-z]/', $newPassword) || !preg_match('/[0-9]/', $newPassword)) {
            return [
                'success' => false,
                'message' => 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
            ];
        }

        // Prevent reusing the same password
        if ($currentPassword === $newPassword) {
            return [
                'success' => false,
                'message' => 'La nueva contraseña no puede ser igual a la actual'
            ];
        }

        try {
            // Get current user data
            $query = "SELECT Password FROM " . $this->table_name . " WHERE ID_Users = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $userId, PDO::PARAM_INT);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                return [
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ];
            }

            // Verify current password
            if (!password_verify($currentPassword, $row['Password'])) {
                return [
                    'success' => false,
                    'message' => 'La contraseña actual es incorrecta'
                ];
            }

            // Hash new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Update password
            $updateQuery = "UPDATE " . $this->table_name . " SET Password = :password WHERE ID_Users = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(":password", $hashedPassword, PDO::PARAM_STR);
            $updateStmt->bindParam(":id", $userId, PDO::PARAM_INT);

            if ($updateStmt->execute()) {
                return [
                    'success' => true,
                    'message' => 'Contraseña cambiada exitosamente'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Error al actualizar la contraseña'
                ];
            }

        } catch(PDOException $exception) {
            error_log("Password change error: " . $exception->getMessage());
            return [
                'success' => false,
                'message' => 'Error al cambiar contraseña'
            ];
        }
    }
}
?>
