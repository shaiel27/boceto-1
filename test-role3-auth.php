<?php
// Test script to verify role 3 authentication and dashboard data
require_once 'tickets-backend/src/config/database.php';
require_once 'tickets-backend/src/models/User.php';
require_once 'tickets-backend/src/models/ServiceRequest.php';

echo "<h2>Test Role 3 Authentication</h2>";

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$serviceRequest = new ServiceRequest($db);

// Test 1: Check if we have role 3 users in database
echo "<h3>1. Checking Role 3 Users</h3>";
$query = "SELECT u.ID_Users, u.Email, u.Full_Name, r.Role 
          FROM Users u 
          JOIN Role r ON u.Fk_Role = r.ID_Role 
          WHERE u.Fk_Role = 3";
$stmt = $db->prepare($query);
$stmt->execute();
$role3Users = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($role3Users) > 0) {
    echo "<p>Found " . count($role3Users) . " role 3 users:</p>";
    echo "<ul>";
    foreach ($role3Users as $user) {
        echo "<li>ID: {$user['ID_Users']}, Email: {$user['Email']}, Name: {$user['Full_Name']}, Role: {$user['Role']}</li>";
    }
    echo "</ul>";
} else {
    echo "<p>No role 3 users found in database.</p>";
}

// Test 2: Check user profile data
if (count($role3Users) > 0) {
    echo "<h3>2. Testing User Profile Data</h3>";
    $testUser = $role3Users[0];
    $profileData = $user->getById($testUser['ID_Users']);
    
    if ($profileData) {
        echo "<p>Profile data for user {$testUser['ID_Users']}:</p>";
        echo "<pre>" . json_encode($profileData, JSON_PRETTY_PRINT) . "</pre>";
    } else {
        echo "<p>Error: Could not retrieve profile data for user {$testUser['ID_Users']}</p>";
    }
}

// Test 3: Check user tickets
if (count($role3Users) > 0) {
    echo "<h3>3. Testing User Tickets</h3>";
    $testUser = $role3Users[0];
    $tickets = $serviceRequest->getByUser($testUser['ID_Users'], 10, 0);
    
    if (count($tickets) > 0) {
        echo "<p>Found " . count($tickets) . " tickets for user {$testUser['ID_Users']}:</p>";
        echo "<pre>" . json_encode($tickets, JSON_PRETTY_PRINT) . "</pre>";
    } else {
        echo "<p>No tickets found for user {$testUser['ID_Users']}</p>";
    }
}

// Test 4: Check database structure
echo "<h3>4. Database Structure Check</h3>";
$tables = ['Users', 'Role', 'Boss', 'Office', 'Service_Request'];
foreach ($tables as $table) {
    $query = "DESCRIBE $table";
    try {
        $stmt = $db->prepare($query);
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<p>Table '$table' has " . count($columns) . " columns</p>";
    } catch (Exception $e) {
        echo "<p>Error checking table '$table': " . $e->getMessage() . "</p>";
    }
}

echo "<h3>5. Test Complete</h3>";
echo "<p>If you see this data correctly, the backend is working. Check the browser console for frontend authentication issues.</p>";
?>
