<?php
class Database
{
    private static $instance = null;
    private $conn = null;
    public $last_api_error = ""; // Cambiado de pg_error a api_error

    // Conexión local MySQL
    private $host = "localhost";
    private $db_name = "bienes_2026";
    private $username = "root";
    private $password = "";

    // Constructor privado para evitar instanciación externa
    private function __construct() {}

    // Evitar clonación
    private function __clone() {}

    // Evitar deserialización
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize singleton");
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Mantiene la conexión PDO local para MySQL (Bienes)
     */
    public function getConnection()
    {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch (PDOException $exception) {
                error_log("Error de conexión MySQL: " . $exception->getMessage());
                die("Error crítico de base de datos.");
            }
        }
        return $this->conn;
    }

    /**
     * SUSTITUTO DE POSTGRESQL: Hace peticiones seguras al API Proxy
     * * @param string $endpoint Ejemplo: '/bienes/consultar_api.php' o subrutas.
     * @param array $params Parámetros GET que se le enviarán a la consulta.
     * @return array Datos decodificados de la respuesta.
     */
    public function queryAlcaldiaApi($params = [])
    {
        // 1. Cargar dependencias de seguridad del entorno
        // Ajusta las rutas según la ubicación real de estos archivos respecto a Database.php
        require_once __DIR__.'/security.php';
        require_once __DIR__.'/ConfigSecurity.php';

        // Asegurar que la sesión y cabeceras base estén configuradas si no se han iniciado
        if (session_status() === PHP_SESSION_NONE) {
            Security::initSession();
        }

        // 2. Resolver URL base del Proxy de forma segura
        $proxy_url_raw = ConfigSecurity::get('PROXY_API_URL', 'http://192.168.0.22/api/index.php');
        $url_base = is_array($proxy_url_raw) 
            ? ($proxy_url_raw['url'] ?? $proxy_url_raw['value'] ?? $proxy_url_raw[0] ?? 'http://192.168.0.22/api/index.php') 
            : (string)$proxy_url_raw;

        // 3. Procesar parámetros dinámicos usando tu lógica de aplanado
        $queryString = '';
        if (!empty($params)) {
            $getLimpiado = $this->aplanarArrayParaQuery($params);
            $queryString = '?' . http_build_query($getLimpiado, '', '&', PHP_QUERY_RFC3986);
        }
        $url = $url_base . $queryString;

        // 4. Resolver API Key y generar el JWT dinámico obligatorio
        $api_key_raw = ConfigSecurity::get('PROXY_API_KEY', 'MiClaveSecretaUltraSegura123*');
        $api_key = is_array($api_key_raw) 
            ? ($api_key_raw['key'] ?? $api_key_raw['value'] ?? $api_key_raw[0] ?? 'MiClaveSecretaUltraSegura123*') 
            : (string)$api_key_raw;

        $forward_jwt = ConfigSecurity::generateJwt([
            'role' => 'proxy_client', 
            'user' => $_SESSION['usuario'] ?? 'guest'
        ]);

        // 5. Ejecutar Petición HTTP mediante cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET"); 
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);          
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "X-API-KEY: " . $api_key,
            "Authorization: Bearer " . $forward_jwt,
            "Content-Type: application/json"
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $this->last_api_error = "Error de red cURL: " . curl_error($ch);
            error_log($this->last_api_error);
            curl_close($ch);
            return ['total' => 0, 'results' => [], 'error' => true];
        }
        curl_close($ch);

        // 6. Procesar Respuesta
        if ($http_code === 200) {
            $data = json_encode(json_decode($response), true); // Validar que sea JSON
            return json_decode($response, true) ?? ['total' => 0, 'results' => []];
        } else {
            $this->last_api_error = "HTTP Server Error Code: " . $http_code;
            return ['total' => 0, 'page' => 1, 'limit' => 12, 'results' => []];
        }
    }

    /**
     * Función auxiliar privada para aplanar arrays complejos
     */
    private function aplanarArrayParaQuery($array, $prefijo = '') {
        $resultado = [];
        foreach ($array as $llave => $valor) {
            $nuevaLlave = $prefijo ? $prefijo . '[' . $llave . ']' : $llave;
            if (is_array($valor)) {
                $resultado = array_merge($resultado, $this->aplanarArrayParaQuery($valor, $nuevaLlave));
            } else {
                $resultado[$nuevaLlave] = (string)$valor;
            }
        }
        return $resultado;
    }
}
?>