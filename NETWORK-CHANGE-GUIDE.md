# Guía de Cambio de Red — Sistema de Tickets

## Dirección actual
```
http://192.168.1.6:3000
```

## Cuando cambias de red (WiFi, Ethernet, ubicación)

Las direcciones IP cambian y el frontend deja de conectar con el backend. Esta guía te dice exactamente qué archivos modificar.

## Síntomas
- `net::ERR_CONNECTION_TIMED_OUT`
- `CORS policy: No 'Access-Control-Allow-Origin' header`
- Frontend carga pero no conecta con backend

---

## Pasos (3 archivos)

### 1. Averiguar tu nueva IP

Ejecutá `npm start` en el frontend y mirá la salida:
```
On Your Network:  http://192.168.X.X:3000    ← esta es tu nueva IP
```

También podés ejecutar en PowerShell:
```powershell
ipconfig | Select-String "IPv4"
```

### 2. Actualizar CORS en el backend (2 archivos)

**Archivo: `tickets-backend/public/index.php`** (línea ~4)

Agregá tu nueva IP al array `$allowedOrigins`:
```php
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.6:3000',      // ← IP actual
    'http://TU_NUEVA_IP:3000',      // ← agregá esta línea
];
```

**Archivo: `tickets-backend/public/sse-server.php`** (línea ~8)

El mismo array, misma modificación. Agregá tu nueva IP.

### 3. Actualizar URL del backend en el frontend (1 archivo)

**Archivo: `tickets-frontend/.env.local`**

```
REACT_APP_API_BASE=http://TU_NUEVA_IP:8000
REACT_APP_SSE_URL=http://TU_NUEVA_IP:8001
```

> **Nota**: El archivo `.env.local` tiene prioridad sobre `.env`. Si no existe `.env.local`, editá `.env`.

### 4. Reiniciar servicios

**Backend (2 terminales):**
```powershell
cd "C:\Users\shaie\OneDrive\Desktop\Pasantias\boceto 1\tickets-backend"

# Terminal A — API (puerto 8000)
C:\xampp\php\php.exe -S 0.0.0.0:8000 -t public public/router.php

# Terminal B — SSE (puerto 8001)
C:\xampp\php\php.exe -S 0.0.0.0:8001 -t public public/sse-server.php
```

**Frontend (1 terminal):**
```powershell
cd "C:\Users\shaie\OneDrive\Desktop\Pasantias\boceto 1\tickets-frontend"
# Detener con Ctrl+C si está corriendo
npm start
```

### 5. Probar

Abrí en el navegador `http://TU_NUEVA_IP:3000` y verificá:
- Login funciona: `admin@alcaldia.gob` / `password123`
- Tablero público: `http://TU_NUEVA_IP:3000/public-board`
- Pestaña Network en DevTools muestra requests a `TU_NUEVA_IP:8000`

---

## Resumen rápido

| Archivo | Qué cambiar |
|---------|-------------|
| `tickets-backend/public/index.php` | Agregar IP a `$allowedOrigins` |
| `tickets-backend/public/sse-server.php` | Agregar IP a `$allowedOrigins` |
| `tickets-frontend/.env.local` | `REACT_APP_API_BASE=http://IP:8000` |

**Puertos fijos** (nunca cambian): backend `8000`, SSE `8001`, frontend `3000`.

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `ERR_CONNECTION_TIMED_OUT` | IP incorrecta en `.env.local` | Corregir `REACT_APP_API_BASE` |
| `CORS policy error` | IP no está en `$allowedOrigins` | Agregar IP a index.php y sse-server.php |
| `Failed to load resource` | Backend no iniciado | Arrancar los 2 servidores PHP |
| Página en blanco | Frontend no reiniciado | Ctrl+C → `npm start` después de cambiar `.env.local` |

---

*Última actualización: Mayo 2026*
*IP actual: `192.168.1.6`*
