<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\JwtService;

/**
 * Authentication Middleware
 * Validates JWT tokens and sets user context
 * Following PHP Security Patterns for session/token security
 */
final class AuthMiddleware
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    /**
     * Authenticate request using JWT token
     * Returns user data if valid, null otherwise
     * 
     * @return array{sub: int, email: string, role_id: int, role: string}|null
     */
    public function authenticate(): ?array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader)) {
            $this->sendUnauthorized('Authorization header missing');
            return null;
        }

        // Extract Bearer token
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $this->sendUnauthorized('Invalid authorization header format');
            return null;
        }

        $token = $matches[1];

        // Validate token
        $payload = $this->jwtService->validateToken($token);

        if ($payload === null) {
            $this->sendUnauthorized('Invalid or expired token');
            return null;
        }

        return $payload;
    }

    /**
     * Require authentication - halts execution if not authenticated
     * 
     * @return array{sub: int, email: string, role_id: int, role: string}
     */
    public function requireAuth(): array
    {
        $user = $this->authenticate();

        if ($user === null) {
            exit; // Already sent 401 response
        }
        
        // Debug logging
        error_log("Authenticated user: " . json_encode($user));

        return $user;
    }

    /**
     * Optional authentication - returns user if authenticated, null otherwise
     * Does not halt execution and does not send 401 response
     * 
     * @return array{sub: int, email: string, role_id: int, role: string}|null
     */
    public function optionalAuth(): ?array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader)) {
            return null; // No auth header, return null without error
        }

        // Extract Bearer token
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return null; // Invalid format, return null without error
        }

        $token = $matches[1];

        // Validate token
        $payload = $this->jwtService->validateToken($token);

        if ($payload === null) {
            return null; // Invalid token, return null without error
        }

        return $payload;
    }

    /**
     * Send 401 Unauthorized response
     */
    private function sendUnauthorized(string $message): void
    {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'error' => 'UNAUTHORIZED'
        ]);
    }

    /**
     * Get current authenticated user ID
     * Must be called after requireAuth()
     */
    public static function getCurrentUserId(): ?int
    {
        return $_SERVER['AUTH_USER_ID'] ?? null;
    }

    /**
     * Get current authenticated user role
     * Must be called after requireAuth()
     */
    public static function getCurrentUserRole(): ?string
    {
        return $_SERVER['AUTH_USER_ROLE'] ?? null;
    }

    /**
     * Set user context in server variables
     * Called after successful authentication
     */
    public function setUserContext(array $user): void
    {
        $_SERVER['AUTH_USER_ID'] = $user['sub'];
        $_SERVER['AUTH_USER_EMAIL'] = $user['email'];
        $_SERVER['AUTH_USER_ROLE_ID'] = $user['role_id'];
        $_SERVER['AUTH_USER_ROLE'] = $user['role'];
    }
}
