<?php
// includes/ConfigSecurity.php
// ---------------------------------------------------------------------
// AES-256-GCM Encryption and .env Loading Helper for connection settings
// ---------------------------------------------------------------------

class ConfigSecurity {
    // A fixed key derived from a secret. In production, this key should come from a server environment variable.
    // We use a constant fallback that can be overridden by $_ENV['ENCRYPTION_KEY'] or putenv.
    private static function getEncryptionKey(): string {
        $key = $_ENV['ENCRYPTION_KEY'] ?? getenv('ENCRYPTION_KEY') ?? '';
        if (empty($key)) {
            // A default key for fallback (must be 32 bytes for AES-256)
            $key = '7d2e4f7a8b9c0d1e2f3a4b5c6d7e8f9a'; 
        }
        return substr(hash('sha256', $key, true), 0, 32);
    }

    /**
     * Encrypt a string using AES-256-GCM.
     */
    public static function encrypt(string $plaintext): string {
        if ($plaintext === '') return '';
        $key = self::getEncryptionKey();
        $iv_length = openssl_cipher_iv_length('aes-256-gcm');
        $iv = openssl_random_pseudo_bytes($iv_length);
        
        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($ciphertext === false) {
            throw new Exception('Encryption failed.');
        }

        // Return base64 encoded string: IV + Tag + Ciphertext
        return base64_encode($iv . $tag . $ciphertext);
    }

    /**
     * Decrypt an AES-256-GCM encrypted string.
     */
    public static function decrypt(string $encrypted): string {
        if ($encrypted === '') return '';
        $data = base64_decode($encrypted);
        if ($data === false) {
            return $encrypted; // Not valid base64, return as is
        }

        $key = self::getEncryptionKey();
        $iv_length = openssl_cipher_iv_length('aes-256-gcm');
        $tag_length = 16; // Standard tag length for GCM is 16 bytes

        if (strlen($data) < ($iv_length + $tag_length)) {
            return $encrypted; // Data too short to be valid ciphertext, return as is
        }

        $iv = substr($data, 0, $iv_length);
        $tag = substr($data, $iv_length, $tag_length);
        $ciphertext = substr($data, $iv_length + $tag_length);

        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            return $encrypted; // Decryption failed, return as is
        }

        return $plaintext;
    }

    /**
     * Parse and load a .env file into $_ENV and putenv.
     */
    public static function loadEnv(string $filePath): void {
        if (!file_exists($filePath)) {
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            // Skip comments
            if ($line === '' || $line[0] === '#') {
                continue;
            }

            // Split by first =
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $name = trim($parts[0]);
                $value = trim($parts[1]);

                // Strip quotes if present
                if (preg_match('/^"([^"]*)"$/', $value, $matches) || preg_match("/^'([^']*)'$/", $value, $matches)) {
                    $value = $matches[1];
                }

                $_ENV[$name] = $value;
                putenv("{$name}={$value}");
            }
        }
    }

    /**
     * Retrieve a configuration value from environment.
     * If the value starts with "ENC:", it automatically decrypts the rest of the string.
     */
    public static function get(string $name, string $default = ''): string {
        $value = $_ENV[$name] ?? getenv($name);
        if ($value === false || $value === null) {
            $value = $default;
        }
        if (is_string($value) && strpos($value, 'ENC:') === 0) {
            return self::decrypt(substr($value, 4));
        }
        return (string)$value;
    }

    // ---------------------------------------------------------------------
    // JWT handling (HS256)
    // ---------------------------------------------------------------------
    public static function generateJwt(array $payload, int $expSeconds = 3600): string {
        $secret = self::get('JWT_SECRET', 'default_jwt_secret');
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload['exp'] = time() + $expSeconds;
        $b64 = function (string $data): string {
            return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
        };
        $headerB64 = $b64(json_encode($header));
        $payloadB64 = $b64(json_encode($payload));
        $signature = hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true);
        $signatureB64 = $b64($signature);
        return "$headerB64.$payloadB64.$signatureB64";
    }

    public static function verifyJwt(string $jwt): ?array {
        $secret = self::get('JWT_SECRET', 'default_jwt_secret');
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) return null;
        [$headerB64, $payloadB64, $sigB64] = $parts;
        $b64decode = function (string $data): string {
            $padding = 4 - (strlen($data) % 4);
            if ($padding < 4) $data .= str_repeat('=', $padding);
            return base64_decode(strtr($data, '-_', '+/'));
        };
        $header = json_decode($b64decode($headerB64), true);
        if (!isset($header['alg']) || $header['alg'] !== 'HS256') return null;
        $payload = json_decode($b64decode($payloadB64), true);
        $expectedSig = hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true);
        $expectedB64 = rtrim(strtr(base64_encode($expectedSig), '+/', '-_'), '=');
        if (!hash_equals($expectedB64, $sigB64)) return null;
        if (isset($payload['exp']) && $payload['exp'] < time()) return null;
        return $payload;
    }

}

// Automatically load environment variables
ConfigSecurity::loadEnv(__DIR__ . '/../.env');
