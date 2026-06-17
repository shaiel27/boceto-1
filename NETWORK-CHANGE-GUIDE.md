# Guía de Cambio de Red — Sistema de Tickets

## Dirección actual (se detecta automáticamente)
```
http://192.168.100.88:3000   ← Web
http://192.168.100.88:8000   ← Backend API
exp://192.168.100.88:8081     ← Expo Metro Bundler
```

## Cuando cambias de red (WiFi, Ethernet, ubicación)

### App Web (React) — Automático
**NO necesitas modificar nada.** El frontend web usa `window.location.hostname` para resolver el backend. El CORS es dinámico.

### App Móvil (Expo/React Native) — Manual
La app móvil tiene el IP hardcodeado. Debes actualizar **1 archivo**:

**`tickets-App/src/constants/config.ts`:**
```ts
const API_HOST = '192.168.100.88';
export const API_BASE_URL = `http://${API_HOST}:8000`;
```

> Después de cambiar, reinicia con:
> ```powershell
> $env:EXPO_PACKAGER_PROXY_URL = "http://192.168.100.88:8081"
> npx expo start --clear
> ```
> `EXPO_PACKAGER_PROXY_URL` (SDK 50+) fuerza la IP/URL del Metro bundler.
> `REACT_NATIVE_PACKAGER_HOSTNAME` ya no funciona en SDK 50+.
> Si no usas `--clear`, el bundle cacheado con el IP viejo sigue activo.

---

## Síntomas (si algo falla)

| App | Error | Causa |
|-----|-------|-------|
| Web | `ERR_CONNECTION_TIMED_OUT` | Backend no iniciado |
| Web | `CORS policy error` | Frontend y backend en distintas máquinas |
| Web | Página en blanco | Frontend no compiló |
| **Móvil** | **"Error de conexión con el servidor" al hacer login** | **IP cambió, actualizar `config.ts`** |
| Móvil | Pantalla de carga infinita | Backend no responde en el IP configurado |
| Móvil | App usa IP vieja tras cambio de red | Metro cache tiene bundle anterior — usar `--clear` |
| Móvil | "Unable to connect to development server" | Expo no bindeó a la IP correcta — set `EXPO_PACKAGER_PROXY_URL` y `--clear` |

---

## Arranque completo (3 terminales)

### 1. Averiguar tu IP

```powershell
ipconfig | Select-String "IPv4"
# o más específico:
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" }).IPAddress
```

### 2. Iniciar Backend (Terminal 1)

```powershell
cd "C:\Users\Shaiel\Desktop\shaiel\boceto-1\tickets-backend"
C:\xampp\php\php.exe -S 0.0.0.0:8000 -t public public\router.php
```

### 3. Iniciar Frontend Web (Terminal 2)

```powershell
cd "C:\Users\Shaiel\Desktop\shaiel\boceto-1\tickets-frontend"
npm start
```

### 4. Iniciar App Móvil (Terminal 3)

```powershell
cd "C:\Users\Shaiel\Desktop\shaiel\boceto-1\tickets-App"
$env:EXPO_PACKAGER_PROXY_URL = "http://192.168.100.88:8081"
npx expo start --clear
```
> `EXPO_PACKAGER_PROXY_URL` fuerza la IP/URL del Metro bundler (SDK 50+).
> `--clear` limpia el cache para evitar bundle viejo.

---

## Probar

### Web
Abre `http://TU_IP:3000` en el navegador:
- Login: `admin@alcaldia.gob` / `password123`
- Pestaña Network en DevTools muestra requests a `TU_IP:8000`

### Móvil
Escanea el QR con Expo Go o conecta por USB:
- Si el QR apunta a IP incorrecta: `$env:EXPO_PACKAGER_PROXY_URL="http://192.168.100.88:8081"; npx expo start --clear`
- Verifica que el login funcione
- Si falla: revisa `tickets-App/src/constants/config.ts`

---

## Arquitectura

| Componente | Puerto | Descripción |
|-----------|--------|-------------|
| Backend API (PHP) | 8000 | API REST + polling para notificaciones |
| Frontend Web (React) | 3000 | App web con resolución dinámica de host |
| App Móvil (Expo) | 8081 | Metro bundler, IP hardcodeado en `config.ts` |
| ~~SSE Server~~ | ~~8001~~ | **ELIMINADO** — reemplazado por polling |

---

## Si necesitas forzar una IP en el frontend web

Edita `tickets-frontend/.env.local`:
```
REACT_APP_API_BASE=http://192.168.X.X:8000
```
> El frontend debe reiniciarse después de cambiar este archivo.

---

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `ERR_CONNECTION_TIMED_OUT` (web) | Backend no iniciado o IP inaccesible | Verificar `php.exe -S` corriendo en `0.0.0.0:8000` |
| `CORS policy error` (web) | Origen no coincide con el host | Verificar que frontend y backend están en la misma máquina |
| "Error de conexión con el servidor" (móvil) | IP cambió por DHCP | Actualizar `tickets-App/src/constants/config.ts` con el nuevo IP |
| App móvil no carga datos | IP incorrecto en `config.ts` | Revisar con `ipconfig`, actualizar y reiniciar Expo |
| Página en blanco (web) | Frontend no compiló | `Ctrl+C` → `npm start` |
| Expo QR muestra IP equivocada | Metro bindeó a interfaz incorrecta | `$env:EXPO_PACKAGER_PROXY_URL="http://192.168.X.X:8081"; npx expo start --clear` |
| App Expo Go sigue con datos viejos | Bundle cacheado en Metro | Parar Expo, ejecutar `npx expo start --clear`, volver a escanear QR |

---
## Cambio rápido de IP (3 pasos)

```powershell
# 1. Averiguar IP actual
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" }).IPAddress

# 2. Editar tickets-App\src\constants\config.ts → cambiar API_HOST

# 3. Reiniciar Expo con cache limpio y proxy URL
cd tickets-App
$env:EXPO_PACKAGER_PROXY_URL = "http://192.168.X.X:8081"
npx expo start --clear
```

---

*Última actualización: Junio 2026*
*Arquitectura: Backend PHP (:8000) + Frontend Web (:3000) + App Móvil (Expo)*
