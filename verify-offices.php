<?php
// Script para verificar las oficinas que devuelve el backend
require_once 'tickets-backend/src/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "<h2>Verificación de Oficinas</h2>";

// Query 1: Obtener todas las oficinas
$query1 = "SELECT ID_Office, Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID
           FROM Office 
           ORDER BY ID_Office ASC";
           
$stmt1 = $db->prepare($query1);
$stmt1->execute();
$allOffices = $stmt1->fetchAll(PDO::FETCH_ASSOC);

echo "<h3>Todas las oficinas en la base de datos:</h3>";
echo "<pre>" . print_r($allOffices, true) . "</pre>";

// Query 2: Verificar si la oficina 95 existe
$query2 = "SELECT ID_Office, Name_Office, Office_Type, Fk_Parent_Office, Fk_Boss_ID
           FROM Office 
           WHERE ID_Office = 95";
           
$stmt2 = $db->prepare($query2);
$stmt2->execute();
$office95 = $stmt2->fetch(PDO::FETCH_ASSOC);

echo "<h3>Oficina con ID 95:</h3>";
echo "<pre>" . print_r($office95, true) . "</pre>";

// Query 3: Verificar el formato que devuelve el endpoint de oficinas
echo "<h3>Formato JSON que devuelve el endpoint /api/users?action=offices:</h3>";
echo json_encode($allOffices, JSON_PRETTY_PRINT);
?>
