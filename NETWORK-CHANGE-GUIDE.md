# Guia de Cambio de Red — Sistema de Tickets

## Direccion actual (se detecta automaticamente)
```
http://192.168.5.156:3000
```

## Cuando cambias de red (WiFi, Ethernet, ubicacion)

**NO necesitas modificar ningun archivo.** El sistema ahora detecta automaticamente el host desde el navegador.

El CORS es dinamico (acepta cualquier origen del mismo host) y las URLs del backend se resuelven usando `window.location.hostname`.

## Sintomas (si algo falla)
- `net::ERR_CONNECTION_TIMED_OUT`
- `CORS policy: No 'Access-Control-Allow-Origin' header`
- Frontend carga pero no conecta con backend

---

## Arranque (solo 2 terminales)

Antes necesitabas 3 terminales (API + SSE + Frontend). Ahora solo 2.

### 1. Averiguar tu IP

Ejecuta en PowerShell:
```powershell
ipconfig | Select-String "IPv4"
```

### 2. Iniciar Backend (1 terminal)

```powershell
cd "C:\Users\Shaiel\Desktop\shaiel\boceto-1\tickets-backend"
C:\xampp\php\php.exe -S 0.0.0.0:8000 -t public public/router.php
```

### 3. Iniciar Frontend (1 terminal)

```powershell
cd "C:\Users\Shaiel\Desktop\shaiel\boceto-1\tickets-frontend"
npm start
```

### 4. Probar

Abre en el navegador `http://TU_IP:3000` y verifica:
- Login funciona: `admin@alcaldia.gob` / `password123`
- Tablero publico: `http://TU_IP:3000/public-board`
- Pestaña Network en DevTools muestra requests a `TU_IP:8000`

---

## Arquitectura simplificada (Mayo 2026)

| Componente | Puerto | Descripcion |
|-----------|--------|-------------|
| Frontend (React) | 3000 | App web con resolucion dinamica de host |
| Backend API | 8000 | API REST + tablero publico (polling) |
| ~~SSE Server~~ | ~~8001~~ | **ELIMINADO** - reemplazado por polling |

### Que cambio:

1. **CORS dinamico** (`index.php`): Acepta automaticamente cualquier origen del mismo host. Ya no necesitas agregar IPs al array `$allowedOrigins`.

2. **Resolucion dinamica de URLs** (`api.ts`): El frontend usa `window.location.hostname` para determinar la URL del backend. Si la variable `REACT_APP_API_BASE` esta definida en `.env.local`, esa tiene prioridad.

3. **SSE eliminado**: El servidor SSE (puerto 8001) fue removido. El tablero publico ahora usa polling cada 5 segundos contra la API principal (puerto 8000), resolviendo el problema de bloqueo del servidor PHP single-threaded en Windows.

---

## Si necesitas forzar una IP especifica

Edita `tickets-frontend/.env.local`:
```
REACT_APP_API_BASE=http://192.168.X.X:8000
```
> El frontend debe reiniciarse (`npm start`) despues de cambiar este archivo.

---

## Errores comunes

| Error | Causa | Solucion |
|-------|-------|----------|
| `ERR_CONNECTION_TIMED_OUT` | Backend no iniciado o IP inaccesible | Verificar que el servidor PHP esta corriendo en 0.0.0.0:8000 |
| `CORS policy error` | Origen no coincide con el host | Verificar que frontend y backend estan en la misma maquina |
| Pagina en blanco | Frontend no compilo correctamente | Ctrl+C -> `npm start` |
| Tablero desconectado | API no responde | Verificar puerto 8000 |

---

*Ultima actualizacion: Mayo 2026*
*Arquitectura: Frontend (React :3000) + Backend (PHP :8000) - sin SSE*
