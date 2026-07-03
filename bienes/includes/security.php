<?php
/**
 * Super Seguridad Premium Core
 * Implementa protección robusta contra XSS, CSRF, Clickjacking y más.
 */

class Security
{
    public static function initSession()
    {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.use_only_cookies', 1);
            ini_set('session.use_strict_mode', 1);
            ini_set('session.cookie_httponly', 1);
            ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? 1 : 0);
            ini_set('session.cookie_samesite', 'Lax');
            session_start();
        }

        // Prevención de fijación de sesión (regenerar ID periódicamente)
        if (!isset($_SESSION['last_regeneration'])) {
            self::regenerateSession();
        } else {
            $interval = 60 * 30; // 30 minutos
            if (time() - $_SESSION['last_regeneration'] >= $interval) {
                self::regenerateSession();
            }
        }

        // Session Fingerprinting: Vincular sesión al Navegador (User Agent) para soportar IPs dinámicas en intranet
        $current_ua = $_SERVER['HTTP_USER_AGENT'] ?? 'UNKNOWN';

        if (!isset($_SESSION['fingerprint'])) {
            $_SESSION['fingerprint'] = hash('sha256', $current_ua);
        } else {
            $current_fingerprint = hash('sha256', $current_ua);
            if (!hash_equals($_SESSION['fingerprint'], $current_fingerprint)) {
                // Posible robo de sesión (Session Hijacking)
                session_destroy();
                http_response_code(403);
                die("Violación de Seguridad: Huella de sesión no coincide. Posible robo de sesión.");
            }
        }
    }

    // Limitador de Tasa (Rate Limiting) para APIs
    public static function apiRateLimit($max_requests = 30, $time_window = 60)
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
        $key = 'rate_limit_' . $ip;

        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = [
                'count' => 1,
                'start_time' => time()
            ];
        } else {
            $data = $_SESSION[$key];
            if (time() - $data['start_time'] < $time_window) {
                if ($data['count'] >= $max_requests) {
                    http_response_code(429);
                    die(json_encode(['error' => 'Demasiadas peticiones. Por favor, espere.']));
                }
                $_SESSION[$key]['count']++;
            } else {
                $_SESSION[$key] = [
                    'count' => 1,
                    'start_time' => time()
                ];
            }
        }
    }

    private static function regenerateSession()
    {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }

    // Configurar cabeceras de seguridad estrictas (HSTS, CSP, etc.)
    public static function setSecurityHeaders()
    {
        header("X-Frame-Options: DENY"); // Evita Clickjacking
        header("X-XSS-Protection: 1; mode=block"); // Fuerza filtro XSS
        header("X-Content-Type-Options: nosniff"); // Previene MIME-sniffing
        
        // HSTS solo debe enviarse si realmente se está usando HTTPS para evitar bloqueos en conexiones HTTP locales
        if (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] === 'on' || $_SERVER['HTTPS'] === 1)) {
            header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
        }
        
        header("Referrer-Policy: strict-origin-when-cross-origin");
        // CSP básico, ajustar según necesidades reales (por ahora permite estilos/scripts locales e inline controlados)
        header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';");
    }

    // Generar un token CSRF seguro
    public static function generateCSRFToken()
    {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    // Validar el token CSRF recibido en formularios o peticiones AJAX
    public static function validateCSRFToken($token)
    {
        if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            http_response_code(403);
            die("Error de Seguridad: Token CSRF Inválido.");
        }
        return true;
    }

    // Sanitización básica de entradas (evitar XSS en salidas)
    public static function sanitizeOutput($data)
    {
        return htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    // Validación de enteros (ej: para IDs)
    public static function sanitizeInt($data)
    {
        return filter_var($data, FILTER_SANITIZE_NUMBER_INT);
    }
}
?>