<?php

namespace App\Http\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Middleware;

class RoleMiddleware implements Middleware
{
    private array $allowedRoles;

    public function __construct(array $allowedRoles)
    {
        $this->allowedRoles = $allowedRoles;
    }

    public function handle(Request $request, callable $next): Response
    {
        $user = $request->getUser();

        if ($user === null) {
            return Response::unauthorized('Usuario no autenticado');
        }

        $userRole = $user['role'] ?? null;

        if ($userRole === null) {
            return Response::forbidden('Rol no definido');
        }

        $roleNames = [
            1 => 'Admin',
            2 => 'Tecnico',
            3 => 'Jefe',
        ];

        $userRoleName = $roleNames[$userRole] ?? 'Desconocido';

        if (!in_array($userRole, $this->allowedRoles) && !in_array($userRoleName, $this->allowedRoles)) {
            return Response::forbidden('Rol no autorizado para esta acción');
        }

        return $next($request);
    }
}
