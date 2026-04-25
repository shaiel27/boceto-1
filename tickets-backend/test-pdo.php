<?php
echo "=== PHP Version ===\n";
echo phpversion() . "\n\n";

echo "=== PDO Drivers Available ===\n";
print_r(PDO::getAvailableDrivers());

echo "\n=== MySQL Extensions ===\n";
$extensions = get_loaded_extensions();
foreach ($extensions as $ext) {
    if (stripos($ext, 'mysql') !== false || stripos($ext, 'pdo') !== false) {
        echo "- $ext\n";
    }
}

echo "\n=== Testing Direct Connection ===\n";
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tickets_system', 'root', 'NuevaClave123');
    echo "✅ Direct PDO connection: SUCCESS\n";
} catch(PDOException $e) {
    echo "❌ Direct PDO connection failed: " . $e->getMessage() . "\n";
}

echo "\n=== Testing Database Class ===\n";
require_once 'src/config/database.php';
$database = new Database();
$conn = $database->getConnection();

if ($conn === null) {
    echo "❌ Database class returned null\n";
} else {
    echo "✅ Database class connection: SUCCESS\n";
}
?>
