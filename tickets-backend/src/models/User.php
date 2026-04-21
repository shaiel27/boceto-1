<?php
class User {
    private $conn;
    private $table_name = "Users";

    public $id;
    public $username;
    public $email;
    public $password;
    public $full_name;
    public $role;
    public $is_active;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function login($email, $password) {
        $query = "SELECT id, username, email, full_name, role, is_active FROM " . $this->table_name . " 
                  WHERE email = :email AND is_active = 1 LIMIT 1";
        
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
                  SET username = :username, email = :email, password = :password, 
                      full_name = :full_name, role = :role, is_active = 1, created_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":role", $this->role);
        
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
        $query = "SELECT id, username, email, full_name, role, is_active, created_at 
                  FROM " . $this->table_name . " ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
