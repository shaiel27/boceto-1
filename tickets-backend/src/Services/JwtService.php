<?php

declare(strict_types=1);

namespace App\Services;

/**
 * JWT Service for secure token generation and validation
 * Following PHP-PRO strict typing and PHP Security Patterns
 * Simple implementation without external dependencies
 */
final class JwtService
{
    private const ALGORITHM = 'HS256';
    private const TOKEN_EXPIRY = 3600; // 1 hour
    private const REFRESH_EXPIRY = 604800; // 7 days

    private string $secretKey;

    public function __construct(string $secretKey)
    {
        if (empty($secretKey)) {
            throw new \InvalidArgumentException('JWT secret key cannot be empty');
        }
        $this->secretKey = $secretKey;
    }

    /**
     * Generate JWT token for authenticated user (simple implementation)
     */
    public function generateToken(int $userId, string $email, int $roleId, string $roleName): string
    {
        $issuedAt = time();
        $expire = $issuedAt + self::TOKEN_EXPIRY;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expire,
            'sub' => $userId,
            'email' => $email,
            'role_id' => $roleId,
            'role' => $roleName,
        ];

        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => self::ALGORITHM]));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));
        $signature = $this->sign($header . '.' . $payloadEncoded, $this->secretKey);

        return $header . '.' . $payloadEncoded . '.' . $signature;
    }

    /**
     * Generate refresh token
     */
    public function generateRefreshToken(int $userId): string
    {
        $issuedAt = time();
        $expire = $issuedAt + self::REFRESH_EXPIRY;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expire,
            'sub' => $userId,
            'type' => 'refresh',
        ];

        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => self::ALGORITHM]));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));
        $signature = $this->sign($header . '.' . $payloadEncoded, $this->secretKey);

        return $header . '.' . $payloadEncoded . '.' . $signature;
    }

    /**
     * Validate and decode JWT token
     * @return array{sub: int, email: string, role_id: int, role: string}|null
     */
    public function validateToken(string $token): ?array
    {
        try {
            $parts = explode('.', $token);
            
            if (count($parts) !== 3) {
                error_log('Invalid JWT format');
                return null;
            }

            [$header, $payloadEncoded, $signature] = $parts;

            // Verify signature
            $expectedSignature = $this->sign($header . '.' . $payloadEncoded, $this->secretKey);
            
            if (!hash_equals($signature, $expectedSignature)) {
                error_log('JWT signature invalid');
                return null;
            }

            // Decode payload
            $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);
            
            if (!is_array($payload)) {
                error_log('Invalid JWT payload');
                return null;
            }

            // Check expiration
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                error_log('JWT token expired');
                return null;
            }

            return $payload;
        } catch (\Exception $e) {
            error_log('JWT validation error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Base64 URL encode
     */
    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Sign data with HMAC-SHA256
     */
    private function sign(string $data, string $secret): string
    {
        return $this->base64UrlEncode(hash_hmac('sha256', $data, $secret, true));
    }

    /**
     * Extract user ID from token
     */
    public function getUserIdFromToken(string $token): ?int
    {
        $payload = $this->validateToken($token);
        return $payload['sub'] ?? null;
    }

    /**
     * Extract role from token
     */
    public function getRoleFromToken(string $token): ?string
    {
        $payload = $this->validateToken($token);
        return $payload['role'] ?? null;
    }

    /**
     * Check if token is expired
     */
    public function isTokenExpired(string $token): bool
    {
        return $this->validateToken($token) === null;
    }
}
