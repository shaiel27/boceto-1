# Guía NSSM — Servicios Automáticos en el Servidor

Registra los 4 componentes del sistema como servicios de Windows para arranque automático.

## Requisitos

- NSSM (incluido en `tickets-backend\nssm-2.24\win64\nssm.exe`)
- PHP (XAMPP: `C:\xampp\php\php.exe`)
- Node.js (`C:\Program Files\nodejs\node.exe`)
- Backend: `C:\xampp\htdocs\tickets-backend`
- Frontend: `C:\xampp\htdocs\tickets-frontend`
- Expo App: `C:\xampp\htdocs\tickets-App`
- Ejecutar **PowerShell como Administrador**

## Instalación rápida (script automático)

```powershell
# 1. Abrir PowerShell como Administrador
# 2. Ejecutar:
cd C:\xampp\htdocs\tickets-backend
.\setup-nssm-server.ps1
```

## Instalación manual (paso a paso)

```powershell
# Rutas
$nssm = "C:\xampp\htdocs\tickets-backend\nssm-2.24\win64\nssm.exe"
$backend = "C:\xampp\htdocs\tickets-backend"
$frontend = "C:\xampp\htdocs\tickets-frontend"
$app = "C:\xampp\htdocs\tickets-App"
$php = "C:\xampp\php\php.exe"
$node = "C:\Program Files\nodejs\node.exe"

# Crear carpeta de logs
mkdir "$backend\logs" -Force

# ── 1. TicketsAPI (backend PHP, puerto 8000) ──
& $nssm install TicketsAPI $php "-S 0.0.0.0:8000 -t $backend\public"
& $nssm set TicketsAPI AppDirectory $backend
& $nssm set TicketsAPI AppStdout "$backend\logs\api-stdout.log"
& $nssm set TicketsAPI AppStderr "$backend\logs\api-stderr.log"
& $nssm set TicketsAPI AppRestartDelay 5000
& $nssm set TicketsAPI AppNoConsole 1

# ── 2. TicketsSSE (eventos SSE, puerto 8001) ──
& $nssm install TicketsSSE $php "-S 0.0.0.0:8001 -t $backend\public public/sse-server.php"
& $nssm set TicketsSSE AppDirectory $backend
& $nssm set TicketsSSE AppStdout "$backend\logs\sse-stdout.log"
& $nssm set TicketsSSE AppStderr "$backend\logs\sse-stderr.log"
& $nssm set TicketsSSE AppRestartDelay 5000
& $nssm set TicketsSSE AppNoConsole 1

# ── 3. TicketsFrontend (React dev server, puerto 3000) ──
$rewired = "$frontend\node_modules\react-app-rewired\bin\index.js"
& $nssm install TicketsFrontend $node "`"$rewired`" start"
& $nssm set TicketsFrontend AppDirectory $frontend
& $nssm set TicketsFrontend AppStdout "$backend\logs\frontend-stdout.log"
& $nssm set TicketsFrontend AppStderr "$backend\logs\frontend-stderr.log"
& $nssm set TicketsFrontend AppRestartDelay 5000
& $nssm set TicketsFrontend AppNoConsole 1

# ── 4. TicketsApp (Expo dev server, puerto 8081) ──
$expoCli = "$app\node_modules\expo\bin\cli"
& $nssm install TicketsApp $node "`"$expoCli`" start"
& $nssm set TicketsApp AppDirectory $app
& $nssm set TicketsApp AppStdout "$backend\logs\app-stdout.log"
& $nssm set TicketsApp AppStderr "$backend\logs\app-stderr.log"
& $nssm set TicketsApp AppRestartDelay 5000
& $nssm set TicketsApp AppNoConsole 1

# Iniciar todo
& $nssm start TicketsAPI
& $nssm start TicketsSSE
& $nssm start TicketsFrontend
& $nssm start TicketsApp
```

## Verificación

```powershell
# Estado de los 4 servicios
& $nssm status TicketsAPI
& $nssm status TicketsSSE
& $nssm status TicketsFrontend
& $nssm status TicketsApp

# Probar endpoints
curl http://localhost:3000          # Frontend React
curl http://localhost:8081          # Expo App
curl http://localhost:8000/api/public-board?action=init  # API pública
curl http://localhost:8001/api/public-board?action=init  # SSE
```

## Gestión diaria

| Acción | Comando |
|--------|---------|
| Reiniciar API | `& $nssm restart TicketsAPI` |
| Reiniciar SSE | `& $nssm restart TicketsSSE` |
| Reiniciar Frontend | `& $nssm restart TicketsFrontend` |
| Reiniciar Expo App | `& $nssm restart TicketsApp` |
| Ver logs | `Get-Content "$backend\logs\api-stdout.log" -Tail 20` |

## Desinstalación

```powershell
# Script automático
.\setup-nssm-server.ps1 -Remove

# O manual:
& $nssm stop TicketsApp
& $nssm remove TicketsApp confirm
& $nssm stop TicketsFrontend
& $nssm remove TicketsFrontend confirm
& $nssm stop TicketsSSE
& $nssm remove TicketsSSE confirm
& $nssm stop TicketsAPI
& $nssm remove TicketsAPI confirm
```

## Orden de arranque

Los servicios NSSM tienen `AppRestartDelay 5000` (reintentan cada 5s si fallan). El orden lógico:

1. **MySQL** (XAMPP) — base de datos
2. **TicketsAPI** — backend (reintenta hasta que MySQL esté listo)
3. **TicketsSSE** — SSE (reintenta hasta que MySQL esté listo)
4. **TicketsFrontend** — frontend React
5. **TicketsApp** — Expo app

Para que XAMPP arranque automático: Panel de Control → check **Svc** en Apache y MySQL.

## Arquitectura final

```
Windows
├── XAMPP (Servicios)
│   ├── Apache  (puerto 80) → sirve frontend build (opcional)
│   └── MySQL   (puerto 3306)
├── NSSM (Servicios)
│   ├── TicketsAPI      (puerto 8000) → Backend PHP
│   ├── TicketsSSE      (puerto 8001) → SSE events
│   ├── TicketsFrontend (puerto 3000) → React dev server
│   └── TicketsApp      (puerto 8081) → Expo dev server
```
