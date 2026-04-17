<?php

namespace App\Infrastructure\Security;

use RuntimeException;

class JwtManager
{
    private string $secret;
    private int $algorithm;

    public function __construct(string $secret = null)
    {
        $this->secret = $secret ?? ($_ENV['JWT_SECRET'] ?? 'default-secret-key-change-in-production');
        $this->algorithm = 'HS256';
    }

    public function encode(array $payload): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => $this->algorithm]);
        $header = $this->base64UrlEncode($header);

        $payload['iat'] = time();
        $payload['exp'] = time() + (int)($_ENV['JWT_EXPIRES_IN'] ?? 86400);

        $payload = json_encode($payload);
        $payload = $this->base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $header . '.' . $payload, $this->secret, true);
        $signature = $this->base64UrlEncode($signature);

        return $header . '.' . $payload . '.' . $signature;
    }

    public function decode(string $token): ?array
    {
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

    public function validate(string $token): bool
    {
        return $this->decode($token) !== null;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
