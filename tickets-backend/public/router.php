<?php
// Simple router for PHP built-in server to emulate Apache's mod_rewrite behaviour
// Usage: php -S 0.0.0.0:8000 -t public router.php

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$publicDir = __DIR__;
$requested = $publicDir . $uri;

// If the request maps to an existing file, let the built-in server serve it
if ($uri !== '/' && file_exists($requested)) {
    return false;
}

// Otherwise forward the request to index.php (front controller)
require_once $publicDir . '/index.php';
