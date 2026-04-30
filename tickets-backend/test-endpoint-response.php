<?php
declare(strict_types=1);

/**
 * Test what the actual endpoint returns
 */

// Test with curl
$url = 'http://localhost:8000/api/dashboard-public-temp?action=full';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Curl Error: " . ($error ?: 'None') . "\n";
echo "Response Length: " . strlen($response) . "\n";
echo "Response (first 500 chars):\n";
echo substr($response, 0, 500) . "\n";

// Check if response is HTML
if (strpos($response, '<') === 0) {
    echo "\n⚠️ Response is HTML, not JSON!\n";
    echo "This indicates a PHP error is being returned.\n";
}
