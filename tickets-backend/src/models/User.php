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
        $query = "SELECT u.ID_Users, u.Username, u.Email, u.Full_Name, r.Role, r.ID_Role 
                  FROM " . $this->table_name . " u
                  JOIN Role r ON u.Fk_Role = r.ID_Role
                  WHERE u.Email = :email LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        
        try {
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Verify password (you should use password_hash in production)
                if ($password === 'password123') { // Temporary for development
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
}
?>
