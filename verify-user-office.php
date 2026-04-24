<?php
// Script para verificar office_id del usuario
require_once 'tickets-backend/src/config/database.php';

$database = new Database();
$db = $database->getConnection();

$email = "divisioncompras@gmail.com";

echo "<h2>Verificación de Oficina del Usuario</h2>";
echo "<p>Email: $email</p>";

// Query 1: Obtener datos básicos del usuario
$query1 = "SELECT u.ID_Users, u.Email, u.Full_Name, u.Fk_Role, r.Role as role_name
           FROM Users u
           JOIN Role r ON u.Fk_Role = r.ID_Role
           WHERE u.Email = :email";
           
$stmt1 = $db->prepare($query1);
$stmt1->bindParam(":email", $email);
$stmt1->execute();
$userBasic = $stmt1->fetch(PDO::FETCH_ASSOC);

echo "<h3>1. Datos básicos del usuario:</h3>";
echo "<pre>" . print_r($userBasic, true) . "</pre>";

if ($userBasic) {
    $userId = $userBasic['ID_Users'];
    
    // Query 2: Verificar si tiene registro en Boss
    $query2 = "SELECT b.ID_Boss, b.Name_Boss, b.Fk_Office
               FROM Boss b
               WHERE b.Fk_User = :user_id";
               
    $stmt2 = $db->prepare($query2);
    $stmt2->bindParam(":user_id", $userId);
    $stmt2->execute();
    $bossRecord = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    echo "<h3>2. Registro Boss del usuario:</h3>";
    echo "<pre>" . print_r($bossRecord, true) . "</pre>";
    
    if ($bossRecord && $bossRecord['Fk_Office']) {
        $officeId = $bossRecord['Fk_Office'];
        
        // Query 3: Verificar la oficina
        $query3 = "SELECT o.ID_Office, o.Name_Office, o.Office_Type, o.Fk_Boss_ID
                   FROM Office o
                   WHERE o.ID_Office = :office_id";
                   
        $stmt3 = $db->prepare($query3);
        $stmt3->bindParam(":office_id", $officeId);
        $stmt3->execute();
        $officeData = $stmt3->fetch(PDO::FETCH_ASSOC);
        
        echo "<h3>3. Datos de la oficina:</h3>";
        echo "<pre>" . print_r($officeData, true) . "</pre>";
    } else {
        echo "<p style='color: red;'>El usuario no tiene un registro Boss con Fk_Office asignado.</p>";
    }
    
    // Query 4: Query completo como en el método login
    $query4 = "SELECT u.ID_Users, u.Username, u.Email, u.Full_Name, r.Role, r.ID_Role,
                      o.ID_Office as office_id
               FROM Users u
               JOIN Role r ON u.Fk_Role = r.ID_Role
               LEFT JOIN Boss b ON u.ID_Users = b.Fk_User
               LEFT JOIN Office o ON b.ID_Boss = o.Fk_Boss_ID
               WHERE u.Email = :email LIMIT 1";
               
    $stmt4 = $db->prepare($query4);
    $stmt4->bindParam(":email", $email);
    $stmt4->execute();
    $loginResult = $stmt4->fetch(PDO::FETCH_ASSOC);
    
    echo "<h3>4. Resultado del query de login:</h3>";
    echo "<pre>" . print_r($loginResult, true) . "</pre>";
} else {
    echo "<p style='color: red;'>Usuario no encontrado.</p>";
}
?>
