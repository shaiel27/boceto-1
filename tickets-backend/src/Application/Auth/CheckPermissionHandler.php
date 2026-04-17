<?php

namespace App\Application\Auth;

use App\Core\Request;
use RuntimeException;

class CheckPermissionHandler
{
    private array $rolePermissions = [
        1 => ['all'], // Admin
        2 => ['view_tickets', 'update_own_tickets', 'add_comments'], // Tecnico
        3 => ['create_tickets', 'view_own_tickets'], // Jefe
    ];

    public function handle(Request $request, array $requiredPermissions): void
    {
        $user = $request->getUser();
        
        if ($user === null) {
            throw new RuntimeException('Usuario no autenticado');
        }

        $role = $user['role'] ?? null;
        
        if ($role === null) {
            throw new RuntimeException('Rol no definido');
        }

        if (!isset($this->rolePermissions[$role])) {
            throw new RuntimeException('Rol inválido');
        }

        $permissions = $this->rolePermissions[$role];

        if (in_array('all', $permissions)) {
            return;
        }

        foreach ($requiredPermissions as $required) {
            if (!in_array($required, $permissions)) {
                throw new RuntimeException('Permiso denegado: ' . $required);
            }
        }
    }

    public function hasPermission(int $roleId, string $permission): bool
    {
        if (!isset($this->rolePermissions[$roleId])) {
            return false;
        }

        return in_array('all', $this->rolePermissions[$roleId]) 
            || in_array($permission, $this->rolePermissions[$roleId]);
    }
}
