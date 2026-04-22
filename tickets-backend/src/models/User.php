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
        $query = "SELECT u.ID_Users, u.Username, u.Email, u.Full_Name, u.Password, r.Role, r.ID_Role
                  FROM " . $this->table_name . " u
                  JOIN Role r ON u.Fk_Role = r.ID_Role
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

    public function getById($id) {
        $query = "SELECT u.ID_Users, u.Full_Name, u.Email, u.created_at,
                         o.Name_Office as office_name,
                         o.Office_Type as office_type,
                         r.Role as role_name
                  FROM " . $this->table_name . " u
                  LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
                  LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
                  LEFT JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE u.ID_Users = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
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
                
                // Update office with boss ID
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
}
?>
