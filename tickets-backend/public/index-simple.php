<?php

// Versión simplificada del index.php que no requiere Composer

// Cargar variables de entorno manualmente
$_ENV['DB_HOST'] = 'localhost';
$_ENV['DB_NAME'] = 'tickets_municipal';
$_ENV['DB_USER'] = 'root';
$_ENV['DB_PASS'] = '';
$_ENV['DB_CHARSET'] = 'utf8mb4';
$_ENV['JWT_SECRET'] = 'test-secret-key-for-development';
$_ENV['JWT_EXPIRES_IN'] = '86400';
$_ENV['DISPLAY_ERRORS'] = '1';
$_ENV['TIMEZONE'] = 'America/Mexico_City';

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', '1');
date_default_timezone_set($_ENV['TIMEZONE']);

// Autoloader manual
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/../src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

// Importar clases necesarias
use App\Core\Router;
use App\Core\Request;
use App\Core\Response;

// Implementación simplificada de JWT para pruebas
class SimpleJwtManager {
    private string $secret;
    
    public function __construct() {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'default-secret';
    }
    
    public function encode(array $payload): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $header = $this->base64UrlEncode($header);
        
        $payload['iat'] = time();
        $payload['exp'] = time() + 86400;
        
        $payload = json_encode($payload);
        $payload = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $header . '.' . $payload, $this->secret, true);
        $signature = $this->base64UrlEncode($signature);
        
        return $header . '.' . $payload . '.' . $signature;
    }
    
    public function decode(string $token): ?array {
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return null;
        }
        
        [$header, $payload, $signature] = $tokenParts;
        
        $expectedSignature = hash_hmac('sha256', $header . '.' . $payload, $this->secret, true);
        $expectedSignature = $this->base64UrlEncode($expectedSignature);
        
        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }
        
        $decodedPayload = json_decode($this->base64UrlDecode($payload), true);
        if ($decodedPayload === null) {
            return null;
        }
        
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return null;
        }
        
        return $decodedPayload;
    }
    
    private function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}

// Implementación simplificada de Database
class SimpleDatabase {
    private static ?PDO $instance = null;
    
    public static function getInstance(): PDO {
        if (self::$instance === null) {
            try {
                self::$instance = new PDO(
                    "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset={$_ENV['DB_CHARSET']}",
                    $_ENV['DB_USER'],
                    $_ENV['DB_PASS'],
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $e) {
                throw new RuntimeException('Error de conexión: ' . $e->getMessage());
            }
        }
        return self::$instance;
    }
}

// Implementación simplificada de Request
class SimpleRequest {
    private array $params = [];
    private ?array $body = null;
    private array $query = [];
    private array $headers = [];
    private ?array $user = null;
    
    public function __construct() {
        $this->server = $_SERVER;
        $this->query = $_GET;
        $this->headers = $this->parseHeaders();
        $this->body = $this->parseBody();
    }
    
    public function getMethod(): string {
        return strtoupper($this->server['REQUEST_METHOD'] ?? 'GET');
    }
    
    public function getUri(): string {
        $uri = $this->server['REQUEST_URI'] ?? '/';
        $uri = parse_url($uri, PHP_URL_PATH);
        return rtrim($uri, '/') ?: '/';
    }
    
    public function get(string $key, $default = null) {
        return $this->body[$key] ?? $default;
    }
    
    public function getBody(): ?array {
        return $this->body;
    }
    
    public function getBearerToken(): ?string {
        $authHeader = $this->headers['authorization'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }
    
    public function setUser(array $user): void {
        $this->user = $user;
    }
    
    public function getUser(): ?array {
        return $this->user;
    }
    
    private function parseBody(): ?array {
        $contentType = $this->server['CONTENT_TYPE'] ?? '';
        
        if (stripos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true) ?? [];
        }
        
        if ($this->getMethod() === 'POST') {
            return $_POST;
        }
        
        return [];
    }
    
    private function parseHeaders(): array {
        $headers = [];
        foreach ($this->server as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $headers[substr($key, 5)] = $value;
            }
        }
        return $headers;
    }
}

// Implementación simplificada de Response
class SimpleResponse {
    public static function json(array $data, int $statusCode = 200): self {
        return new self(
            json_encode($data, JSON_UNESCAPED_UNICODE),
            $statusCode,
            [
                'Content-Type' => 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With'
            ]
        );
    }
    
    public static function success($data = null, string $message = 'OK', int $statusCode = 200): self {
        return self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
    
    public static function error(string $message, int $statusCode = 400): self {
        return self::json([
            'success' => false,
            'message' => $message,
        ], $statusCode);
    }
    
    private function __construct(private string $body, private int $statusCode, private array $headers) {}
    
    public function send(): void {
        http_response_code($this->statusCode);
        
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }
        
        echo $this->body;
    }
}

// Implementación simplificada de Router
class SimpleRouter {
    private array $routes = [];
    
    public function addRoute(string $method, string $path, callable $handler): void {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
        ];
    }
    
    public function get(string $path, callable $handler): void {
        $this->addRoute('GET', $path, $handler);
    }
    
    public function post(string $path, callable $handler): void {
        $this->addRoute('POST', $path, $handler);
    }
    
    public function dispatch(SimpleRequest $request): SimpleResponse {
        $method = $request->getMethod();
        $uri = $request->getUri();
        
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            
            if ($this->matchPath($route['path'], $uri)) {
                $handler = $route['handler'];
                return $handler($request);
            }
        }
        
        return SimpleResponse::error('Ruta no encontrada', 404);
    }
    
    private function matchPath(string $route, string $uri): bool {
        $route = preg_replace('/{[^}]+}/', '[^/]+', $route);
        $pattern = '#^' . str_replace('/', '\/', $route) . '$#';
        return preg_match($pattern, $uri);
    }
}

// Crear router y configurar rutas básicas
$router = new SimpleRouter();

// Manejo de CORS preflight requests
$router->addRoute('OPTIONS', '/{path}', function (SimpleRequest $request) {
    return SimpleResponse::json([], 200);
});

// Ruta de login
$router->post('/api/auth/login', function (SimpleRequest $request) {
    $email = $request->get('email');
    $password = $request->get('password');
    
    if (!$email || !$password) {
        return SimpleResponse::error('Email y contraseña son requeridos', 400);
    }
    
    // Simulación de usuario (en producción, consultar base de datos)
    $db = SimpleDatabase::getInstance();
    $stmt = $db->prepare("SELECT u.ID_Users, u.Email, u.Fk_Role, r.Role FROM Users u JOIN Role r ON u.Fk_Role = r.ID_Role WHERE u.Email = :email");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();
    
    if (!$user || $password !== 'password123') { // Simulación simple
        return SimpleResponse::error('Credenciales inválidas', 401);
    }
    
    $jwt = new SimpleJwtManager();
    $token = $jwt->encode([
        'user_id' => $user['ID_Users'],
        'email' => $user['Email'],
        'role' => $user['Fk_Role'],
        'role_name' => $user['Role'],
    ]);
    
    return SimpleResponse::success([
        'token' => $token,
        'user' => [
            'id' => $user['ID_Users'],
            'email' => $user['Email'],
            'role' => $user['Fk_Role'],
            'role_name' => $user['Role'],
        ],
    ], 'Login exitoso');
});

// Ruta de verificación de usuario
$router->get('/api/auth/me', function (SimpleRequest $request) {
    $token = $request->getBearerToken();
    
    if (!$token) {
        return SimpleResponse::error('Token requerido', 401);
    }
    
    $jwt = new SimpleJwtManager();
    $payload = $jwt->decode($token);
    
    if (!$payload) {
        return SimpleResponse::error('Token inválido', 401);
    }
    
    return SimpleResponse::success($payload, 'Usuario autenticado');
});

// Ruta de prueba
$router->get('/api/test', function (SimpleRequest $request) {
    return SimpleResponse::success([
        'message' => 'Backend funcionando correctamente',
        'timestamp' => date('Y-m-d H:i:s'),
        'database' => 'Conectado',
    ]);
});

// Manejar la solicitud
try {
    $request = new SimpleRequest();
    $response = $router->dispatch($request);
    $response->send();
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    $response = SimpleResponse::error('Error interno del servidor', 500);
    $response->send();
}
?>
