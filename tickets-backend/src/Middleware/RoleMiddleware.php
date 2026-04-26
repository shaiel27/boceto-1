<?php

declare(strict_types=1);

namespace App\Middleware;

/**
 * Role-based Authorization Middleware
 * Enforces role-based access control (RBAC)
 * Following PHP Security Patterns for authorization
 */
final class RoleMiddleware
{
    // Role definitions matching database
    public const ROLE_ADMIN = 'Admin';
    public const ROLE_TECHNICIAN = 'Tecnico';
    public const ROLE_BOSS = 'Jefe';
    public const ROLE_REQUESTER = 'Solicitante';

    // Role ID mappings
    private const ROLE_IDS = [
        self::ROLE_ADMIN => 1,
        self::ROLE_TECHNICIAN => 2,
        self::ROLE_BOSS => 3,
        self::ROLE_REQUESTER => 4,
    ];

    /**
     * Check if user has required role
     */
    public function hasRole(string $userRole, string $requiredRole): bool
    {
        return strtolower($userRole) === strtolower($requiredRole);
    }

    /**
     * Check if user has any of the required roles
     * 
     * @param string $userRole
     * @param array<string> $allowedRoles
     */
    public function hasAnyRole(string $userRole, array $allowedRoles): bool
    {
        $userRoleLower = strtolower($userRole);
        foreach ($allowedRoles as $role) {
            if (strtolower($role) === $userRoleLower) {
                return true;
            }
        }
        return false;
    }

    /**
     * Require specific role - halts execution if not authorized
     */
    public function requireRole(string $userRole, string $requiredRole): void
    {
        if (!$this->hasRole($userRole, $requiredRole)) {
            $this->sendForbidden('Insufficient permissions');
        }
    }

    /**
     * Require any of the specified roles - halts execution if not authorized
     * 
     * @param string $userRole
     * @param array<string> $allowedRoles
     */
    public function requireAnyRole(string $userRole, array $allowedRoles): void
    {
        // Debug logging
        error_log("User role: '$userRole', Allowed roles: " . implode(', ', $allowedRoles));
        
        // Si '*' está en allowedRoles, permitir cualquier rol
        if (in_array('*', $allowedRoles, true)) {
            return;
        }
        
        if (!$this->hasAnyRole($userRole, $allowedRoles)) {
            $this->sendForbidden('Insufficient permissions');
        }
    }

    /**
     * Check if user is admin (has full access)
     */
    public function isAdmin(string $userRole): bool
    {
        return $this->hasRole($userRole, self::ROLE_ADMIN);
    }

    /**
     * Check if user is technician
     */
    public function isTechnician(string $userRole): bool
    {
        return $this->hasRole($userRole, self::ROLE_TECHNICIAN);
    }

    /**
     * Check if user is boss
     */
    public function isBoss(string $userRole): bool
    {
        return $this->hasRole($userRole, self::ROLE_BOSS);
    }

    /**
     * Check if user is requester
     */
    public function isRequester(string $userRole): bool
    {
        return $this->hasRole($userRole, self::ROLE_REQUESTER);
    }

    /**
     * Check resource ownership
     * Used to verify if user can access/modify specific resource
     */
    public function checkOwnership(int $resourceUserId, int $currentUserId, bool $isAdmin): bool
    {
        // Admins can access any resource
        if ($isAdmin) {
            return true;
        }

        // Users can only access their own resources
        return $resourceUserId === $currentUserId;
    }

    /**
     * Send 403 Forbidden response
     */
    private function sendForbidden(string $message): void
    {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'error' => 'FORBIDDEN'
        ]);
        exit;
    }

    /**
     * Get role ID from role name
     */
    public static function getRoleId(string $roleName): ?int
    {
        return self::ROLE_IDS[strtolower($roleName)] ?? null;
    }

    /**
     * Get role name from role ID
     */
    public static function getRoleName(int $roleId): ?string
    {
        $flipped = array_flip(self::ROLE_IDS);
        return $flipped[$roleId] ?? null;
    }

    /**
     * Get all available roles
     * 
     * @return array<string>
     */
    public static function getAllRoles(): array
    {
        return array_keys(self::ROLE_IDS);
    }
}
