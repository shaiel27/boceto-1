<?php
// Router for PHP built-in server
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files if they exist
$requestedFile = __DIR__ . '/public' . $uri;
if (file_exists($requestedFile) && is_file($requestedFile)) {
    return false;
}

// Route all API requests to public/index.php
$_SERVER['SCRIPT_NAME'] = '/public/index.php';
require_once __DIR__ . '/public/index.php';
