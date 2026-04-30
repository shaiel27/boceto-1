# Guía de Diagnóstico PHP-PRO - Dashboard

He creado 3 scripts de diagnóstico para identificar el problema de conexión del Dashboard.

## Scripts de Diagnóstico

### 1. test-dashboard-connection.php
**Propósito:** Verificar que el servidor PHP está corriendo y responde.

**Prueba:**
```bash
# En navegador
http://localhost:8000/test-dashboard-connection.php

# O con curl
curl http://localhost:8000/test-dashboard-connection.php
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Backend diagnostic tool running",
  "timestamp": "2024-04-30 11:30:00",
  "php_version": "8.x.x",
  "server_software": "PHP 8.x.x Development Server"
}
```

### 2. test-dashboard-data.php
**Propósito:** Verificar conexión a base de datos y disponibilidad de datos.

**Prueba:**
```bash
# En navegador
http://localhost:8000/test-dashboard-data.php

# O con curl
curl http://localhost:8000/test-dashboard-data.php
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "timestamp": "2024-04-30 11:30:00",
  "data": {
    "total_tickets": 10,
    "recent_tickets": [...],
    "technicians": [...]
  }
}
```

### 3. test-dashboard-with-auth.php
**Propósito:** Verificar autenticación JWT.

**Prueba:**
```bash
# Primero obtén el token del frontend (abre consola F12 y ejecuta)
sessionStorage.getItem('auth_token')

# Luego prueba con el token
curl -H "Authorization: Bearer TU_TOKEN_AQUI" http://localhost:8000/test-dashboard-with-auth.php
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Auth diagnostic tool",
  "timestamp": "2024-04-30 11:30:00",
  "auth_header_provided": true,
  "token_extracted": true,
  "token_preview": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "test_token_validation": true
}
```

## Pasos de Diagnóstico

### Paso 1: Verificar servidor corriendo
1. Abre http://localhost:8000/test-dashboard-connection.php en el navegador
2. Si ves error, el servidor PHP no está corriendo. Inicia con:
   ```bash
   cd tickets-backend
   php -S localhost:8000 -t public
   ```

### Paso 2: Verificar base de datos
1. Abre http://localhost:8000/test-dashboard-data.php
2. Si ves error de conexión, verifica:
   - MySQL/XAMPP está corriendo
   - Credenciales en `src/config/database.php`
   - Base de datos `tickets_system` existe

### Paso 3: Verificar autenticación
1. Abre el frontend y haz login
2. Abre consola del navegador (F12)
3. Ejecuta: `sessionStorage.getItem('auth_token')`
4. Copia el token
5. Prueba con curl o Postman:
   ```bash
   curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8000/test-dashboard-with-auth.php
   ```

### Paso 4: Verificar endpoint real
1. Con el token, prueba el endpoint real:
   ```bash
   curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8000/api/dashboard?action=full
   ```

## Problemas Comunes

### Error: "Backend server not available"
- **Causa:** Servidor PHP no corriendo
- **Solución:** Iniciar servidor con `php -S localhost:8000 -t public`

### Error: "Database connection failed"
- **Causa:** MySQL no corriendo o credenciales incorrectas
- **Solución:** Verificar XAMPP y configuración en `src/config/database.php`

### Error: 403 Forbidden
- **Causa:** Usuario no tiene rol Admin
- **Solución:** Verificar que el usuario tenga rol Admin en base de datos

### Error: 401 Unauthorized
- **Causa:** Token JWT inválido o expirado
- **Solución:** Hacer login nuevamente para obtener token fresco

### Error: CORS
- **Causa:** Origen no permitido
- **Solución:** Verificar CORS headers en `api-dashboard.php` y `index.php`

## Reportar Resultados

Por favor ejecuta las pruebas en orden y reporta:

1. **Resultado de test-dashboard-connection.php**
2. **Resultado de test-dashboard-data.php**
3. **Resultado de test-dashboard-with-auth.php** (con token)
4. **Resultado de /api/dashboard?action=full** (con token)
5. **Logs de la consola del navegador** (F12) cuando cargas el Dashboard

Con esta información podré identificar exactamente el problema y solucionarlo.
