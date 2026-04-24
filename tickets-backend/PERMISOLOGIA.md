# Mejoras de Permisología y Seguridad

## Resumen de Cambios

Se ha implementado un sistema robusto de autenticación y autorización siguiendo las mejores prácticas de **PHP Security Patterns** y **PHP-PRO**.

## Archivos Creados

### 1. `src/Services/JwtService.php`
Servicio JWT con implementación propia sin dependencias externas:
- Generación de tokens JWT con HMAC-SHA256
- Validación de tokens con verificación de firma
- Expiración de tokens (1 hora para access, 7 días para refresh)
- Strict typing según PHP-PRO
- Sin dependencias externas (no requiere Composer)

### 2. `src/Middleware/AuthMiddleware.php`
Middleware de autenticación:
- Validación de tokens Bearer
- Extracción de datos del usuario autenticado
- Contexto de usuario en `$_SERVER`
- Respuestas 401 para tokens inválidos
- Métodos: `requireAuth()`, `optionalAuth()`, `authenticate()`

### 3. `src/Middleware/RoleMiddleware.php`
Middleware de autorización basado en roles (RBAC):
- Definición de roles: administrador, tecnico, jefe, solicitante
- Verificación de roles individuales y múltiples
- Validación de ownership de recursos
- Respuestas 403 para permisos insuficientes
- Métodos estáticos para mapeos de roles

## Archivos Modificados

### 1. `public/index.php`
- CORS headers más restrictivos (whitelist de orígenes)
- Headers de seguridad adicionales (X-Frame-Options, X-XSS-Protection, etc.)
- Autoload de clases con namespace `App\`
- Inicialización de servicios JWT y middleware
- Definición de permisos por ruta y método HTTP
- Aplicación de middleware antes de enrutar

### 2. `src/controllers/AuthController.php`
- Reemplazo de mock tokens por JWT reales
- Validación de inputs (email, contraseña)
- Generación de tokens JWT al login
- Uso de contexto de middleware para `/api/auth` (GET)
- Strict typing con `declare(strict_types=1)`

### 3. `src/controllers/TicketController.php`
- Validación de permisos por rol en cada endpoint
- Verificación de ownership (usuarios solo ven sus tickets)
- Sanitización de inputs con `htmlspecialchars()` y `strip_tags()`
- Validación de prioridades (whitelist)
- Solo técnicos y administradores pueden actualizar estados
- Solo admins y jefes pueden ver estadísticas

## Vulnerabilidades Corregidas

### Antes
- ❌ Tokens mock inseguros (`mock_token_{id}`)
- ❌ Sin middleware de autenticación
- ❌ Sin verificación de roles
- ❌ CORS demasiado permisivo (`*`)
- ❌ Sin validación de ownership
- ❌ Sin sanitización de inputs
- ❌ Sin headers de seguridad

### Después
- ✅ JWT con HMAC-SHA256 y expiración
- ✅ Middleware de autenticación robusto
- ✅ RBAC con verificación de roles
- ✅ CORS con whitelist de orígenes
- ✅ Verificación de ownership por recurso
- ✅ Sanitización de inputs (XSS prevention)
- ✅ Headers de seguridad (X-Frame-Options, X-XSS-Protection)

## Configuración de Permisos por Ruta

```php
$routePermissions = [
    '/api/auth' => [
        'GET' => false,  // No requiere auth (pero usa middleware context)
        'POST' => false  // Login/register no requieren auth
    ],
    '/api/tickets' => [
        'GET' => ['administrador', 'tecnico', 'jefe'],
        'POST' => ['administrador', 'jefe', 'solicitante'],
        'PUT' => ['administrador', 'tecnico']
    ],
    '/api/users' => [
        'GET' => ['administrador'],
        'POST' => ['administrador'],
        'PUT' => ['administrador'],
        'DELETE' => ['administrador']
    ],
    // ... más rutas
];
```

## Uso en el Frontend

El frontend debe enviar el token JWT en el header `Authorization`:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Variables de Entorno

Configurar la clave secreta JWT:

```bash
# En .env o configuración del servidor
JWT_SECRET=your-secret-key-change-in-production
```

## Próximos Pasos Recomendados

1. Actualizar los demás controladores (UserController, TechnicianController, etc.) con la misma lógica de permisos
2. Implementar rate limiting para prevenir brute force
3. Agregar tokens CSRF para operaciones POST/PUT/DELETE
4. Implementar refresh tokens para renovación de sesiones
5. Agregar logging de intentos de acceso fallidos
6. Implementar tests unitarios para middleware y servicios

## Patrones de Seguridad Aplicados

- **Input Validation**: Validación de email, contraseña, prioridades
- **Output Encoding**: `htmlspecialchars()` para prevenir XSS
- **SQL Injection**: Uso de prepared statements (ya existente)
- **Authentication**: JWT con firma HMAC-SHA256
- **Authorization**: RBAC con verificación de roles y ownership
- **Session Security**: Tokens con expiración
- **CORS**: Whitelist de orígenes permitidos
- **Security Headers**: X-Frame-Options, X-XSS-Protection, X-Content-Type-Options

## Compatibilidad

- PHP 7.4+ (strict typing)
- Sin dependencias externas (JWT implementado desde cero)
- Compatible con PSR-12 (estilo de código)
- Namespaces `App\` para autoload automático
