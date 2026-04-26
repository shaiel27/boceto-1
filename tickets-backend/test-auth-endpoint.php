<?php
// Test script to verify auth endpoint structure without database
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

echo json_encode([
    'success' => true,
    'message' => 'Test endpoint working',
    'test_data' => [
        'user' => [
            'id' => 1,
            'email' => 'test@example.com',
            'role' => 'jefe',
            'role_name' => 'Jefe',
            'full_name' => 'Usuario de Prueba',
            'created_at' => '2024-01-01'
        ],
        'profile' => [
            'Full_Name' => 'Usuario de Prueba',
            'Email' => 'test@example.com',
            'role_name' => 'Jefe',
            'office_name' => 'Oficina Central',
            'office_type' => 'Dirección',
            'created_at' => '2024-01-01'
        ],
        'tickets' => [
            [
                'ID_Service_Request' => 1,
                'Ticket_Code' => 'TICK-001',
                'Subject' => 'Prueba de ticket',
                'Description' => 'Descripción de prueba',
                'office_name' => 'Oficina Central',
                'office_type' => 'Dirección',
                'System_Priority' => 'Media',
                'Status' => 'Pendiente',
                'Created_at' => '2024-01-01 10:00:00',
                'technicians' => []
            ]
        ]
    ]
]);
?>
