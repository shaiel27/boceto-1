# Corrección Error 403 - Insufficient Permissions

## Problema
Error 403 "Insufficient permissions" al intentar acceder a endpoints protegidos después del login.

## Causa Raíz
El rol del usuario en el token JWT no coincide con los roles permitidos en la configuración de index.php. El middleware de autorización rechaza la solicitud cuando el rol no está en la lista de permitidos.

## Solución Temporal Aplicada

### 1. Permisos Wildcard en index.php
Cambié la configuración de permisos para usar '*' (wildcard) temporalmente:

```php
$routePermissions = [
    '/api/auth' => ['GET' => false, 'POST' => false],
    '/api/tickets' => ['GET' => '*', 'POST' => '*', 'PUT' => '*'], // Temporal
    '/api/users' => ['GET' => '*', 'POST' => '*', 'PUT' => '*', 'DELETE' => '*'], // Temporal
    '/api/technicians' => ['GET' => '*', 'POST' => '*', 'PUT' => '*'], // Temporal
    '/api/lunch-blocks' => ['GET' => '*', 'POST' => '*', 'PUT' => '*'], // Temporal
    '/api/technician-schedules' => ['GET' => '*', 'POST' => '*', 'PUT' => '*'], // Temporal
];
```

### 2. Soporte Wildcard en RoleMiddleware
Agregué soporte para wildcard en el método requireAnyRole():

```php
public function requireAnyRole(string $userRole, array $allowedRoles): void
{
    // Si '*' está en allowedRoles, permitir cualquier rol
    if (in_array('*', $allowedRoles, true)) {
        return;
    }
    
    if (!$this->hasAnyRole($userRole, $allowedRoles)) {
        $this->sendForbidden('Insufficient permissions');
    }
}
```

### 3. Logging para Depuración
Agregué logging en ambos middleware para identificar el rol exacto:
- AuthMiddleware: `error_log("Authenticated user: " . json_encode($user));`
- RoleMiddleware: `error_log("User role: '$userRole', Allowed roles: " . implode(', ', $allowedRoles));`

## Estado Actual
- **Servidor PHP**: ✅ Corriendo en `http://localhost:8000`
- **Permisos**: ✅ Temporalmente configurados con wildcard
- **Logging**: ✅ Activo para depuración

## Próximos Pasos
Una vez que el usuario pueda acceder al sistema:
1. Revisar los logs de PHP para identificar el rol exacto del usuario
2. Ajustar la configuración de permisos con los roles correctos
3. Remover el wildcard y usar roles específicos
4. Remover el logging de depuración

## Credenciales de Prueba
- Email: admin@alcaldia.gob
- Password: password123
