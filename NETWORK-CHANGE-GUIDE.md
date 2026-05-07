# Guía de Cambio de Red - Sistema de Tickets

## Problema Común
Cuando cambias de red (WiFi, Ethernet, ubicación), las direcciones IP cambian y el frontend no puede conectar con el backend.

## Síntomas
- Error: `net::ERR_CONNECTION_TIMED_OUT`
- Error: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Frontend en `http://192.168.X.X:3000` no conecta con backend

## Pasos para Solucionar

### 1. Identificar tu nueva IP
Ejecuta en el frontend:
```bash
npm start
```
Busca la línea "On Your Network" para ver tu nueva IP, ejemplo:
```
On Your Network:  http://192.168.5.43:3000
```

### 2. Actualizar Frontend (api.ts)
Edita el archivo: `tickets-frontend/src/services/api.ts`

**Cambia estas líneas:**
```typescript
// Línea 4 - Reemplaza con tu nueva IP
export const API_BASE_URL = 'http://TU_NUEVA_IP:8000';

// Línea 5 - Reemplaza con tu nueva IP  
const DASHBOARD_API_BASE = 'http://TU_NUEVA_IP:8000/api/dashboard-public';
```

**Ejemplo con IP 192.168.5.43:**
```typescript
export const API_BASE_URL = 'http://192.168.5.43:8000';
const DASHBOARD_API_BASE = 'http://192.168.5.43:8000/api/dashboard-public';
```

### 3. Actualizar Backend (index.php)
Edita el archivo: `tickets-backend/public/index.php`

**Línea 3 - Agrega tu nueva IP al array:**
```php
$allowedOrigins = [
    'http://localhost:3000', 
    'http://192.168.100.8:3000', 
    'http://TU_NUEVA_IP:3000'  // <-- Agrega esta línea
];
```

**Ejemplo con IP 192.168.5.43:**
```php
$allowedOrigins = [
    'http://localhost:3000', 
    'http://192.168.100.8:3000', 
    'http://192.168.5.43:3000'
];
```

### 4. Reiniciar Servicios

**Iniciar Backend:**
```bash
cd c:\xampp\htdocs\boceto-1\tickets-backend
php -S 0.0.0.0:8000 -t public
```

**Reiniciar Frontend:**
```bash
# Detener con Ctrl+C si está corriendo
npm start
```

### 5. Probar Conexión
- Abre http://localhost:3000 en tu navegador
- Intenta hacer login con: `admin@alcaldia.gob` / `password123`
- Debería funcionar sin errores de conexión

## Alternativa: Usar localhost (Recomendado)

Si el backend corre en la misma máquina que el frontend, puedes usar `localhost` para evitar problemas futuros:

**En api.ts:**
```typescript
export const API_BASE_URL = 'http://localhost:8000';
const DASHBOARD_API_BASE = 'http://localhost:8000/api/dashboard-public';
```

**En index.php (backend):**
```php
$allowedOrigins = ['http://localhost:3000'];
```

## Verificación

Para confirmar que todo funciona:
1. Backend corriendo en puerto 8000
2. Frontend corriendo en puerto 3000
3. Login exitoso sin errores de consola
4. Los datos de tickets cargan correctamente

## Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `net::ERR_CONNECTION_TIMED_OUT` | IP incorrecta en api.ts | Actualizar API_BASE_URL |
| `CORS policy error` | IP no agregada en index.php | Agregar IP a $allowedOrigins |
| `Failed to load resource` | Backend no iniciado | Iniciar servidor PHP |
| `404 Not Found` | Puerto incorrecto | Usar puerto 8000 para backend |

## Recuerda
- **Backend siempre en puerto 8000**
- **Frontend siempre en puerto 3000**
- **IP cambia, puertos no**
- **Actualiza ambos archivos (api.ts y index.php)**

---
*Última actualización: Mayo 2026*
