# Plan de Producción — Módulo Tablero Público

## 1. Correcciones aplicadas (rama `feature/public-board-db-lunchlog`)

### 1.1 Tickets cerrados desaparecen en tiempo real
**Bug**: Al cerrar un ticket desde el sistema, no desaparecía del tablero público sin refrescar.

**Fix**:
- Backend: `getTicketsClosedSince()` ahora envía `ticket_id` (ID_Service_Request) además de `ticket_code`
- Frontend: `ticket_closed` handler filtra `setActiveTickets(prev => prev.filter(t => t.id !== d.ticket_id))`

### 1.2 Sonidos institucionales (no alarmantes)
**Antes**: 5 pulsos de alarma para asistencia, tonos agudos.

**Ahora**: 
| Evento | Sonido | Sensación |
|--------|--------|-----------|
| Nuevo ticket | E5→C6 chime suave | Informativo |
| Almuerzo | A4→F4 triángulo | Anuncio cálido |
| Asistencia | C5 doble toque | Atención sin pánico |
| Cerrado | G4 tono único | Cierre digno |

**Política de audio**: AudioContext bloqueado por el navegador hasta primer click. Botón 🔇 parpadea en coral hasta que el operador hace click para desbloquear.

### 1.3 Header institucional del sistema
Se agregó `PublicHeader` con:
- Barra superior azul institucional (#074A71 → #066B9D)
- Línea decorativa inferior con los 4 colores del portal (navy, blue, gold, light blue)
- "ALCALDÍA DE SAN CRISTÓBOL" + "Sistema de Gestión de Tickets"
- Tag "DIRECCIÓN DE INFORMÁTICA Y TECNOLOGÍA"

### 1.4 Indicadores en tiempo real (stats bar)
| Indicador | Fuente SSE | Actualización |
|-----------|-----------|---------------|
| Sin técnico | `stats_updated.unassigned` | Cada 3s si cambia |
| En proceso | `stats_updated.in_progress` | Cada 3s si cambia |
| Pendientes | `stats_updated.pending` | Cada 3s si cambia |
| Hoy | `stats_updated.today_created` | Cada 3s si cambia |

### 1.5 Tickets sin técnico — alerta visual
- Tarjeta con borde coral + fondo rosado
- ⚠ parpadeante junto al código
- Banner "⚠ SIN TÉCNICO" al crearse
- Animación flash ×3 ciclos

---

## 2. Verificación pre-producción

### 2.1 Checklist funcional
- [ ] Crear ticket → aparece en tablero en ≤3s con sonido
- [ ] Cerrar ticket → desaparece del tablero en ≤3s
- [ ] Stats bar actualiza conteos en tiempo real
- [ ] Ticket sin técnico muestra alerta ⚠
- [ ] Sonido se desbloquea al primer click en botón
- [ ] Reloj muestra hora Venezuela correcta
- [ ] Header institucional visible en todo momento
- [ ] Conexión SSE se reconecta automáticamente (nativo de EventSource)
- [ ] Funciona en resolución 1920×1080 (TV estándar)

### 2.2 Comandos de prueba
```powershell
# Terminal 1 — API
C:\xampp\php\php.exe -S 0.0.0.0:8000 -t public public/router.php

# Terminal 2 — SSE
C:\xampp\php\php.exe -S 0.0.0.0:8001 -t public public/sse-server.php

# Terminal 3 — Frontend
npm start
```

### 2.3 URLs de prueba
| URL | Descripción |
|-----|-------------|
| `http://localhost:8000/api/public-board?action=init` | JSON con datos iniciales |
| `http://localhost:8001/api/public-board?action=init` | Igual desde server SSE |
| `http://localhost:3000/public-board` | Tablero público |

---

## 3. Despliegue a producción

### 3.1 Build del frontend
```powershell
cd tickets-frontend
set REACT_APP_API_BASE=https://alcaldiasancristobal.gob.ve/api
set REACT_APP_SSE_URL=https://alcaldiasancristobal.gob.ve/api
npm run build
```
Los archivos se generan en `tickets-frontend/build/`.

### 3.2 Configuración Apache
En producción NO se necesitan 2 puertos. Apache maneja concurrencia nativamente.

```apache
<VirtualHost *:443>
    ServerName alcaldiasancristobal.gob.ve
    DocumentRoot /var/www/tickets-frontend/build

    # API PHP
    Alias /api /var/www/tickets-backend/public
    <Directory /var/www/tickets-backend/public>
        Require all granted
        RewriteEngine On
        RewriteBase /api/
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>

    # SPA fallback
    <Directory /var/www/tickets-frontend/build>
        Require all granted
        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [L]
    </Directory>

    SetEnv DB_HOST localhost
    SetEnv DB_PORT 3306
    SetEnv DB_NAME tickets_system
    SetEnv DB_USER ***
    SetEnv DB_PASSWORD ***
    SetEnv JWT_SECRET ***
</VirtualHost>
```

### 3.3 Base de datos
Ejecutar migración si no está aplicada:
```sql
-- Verificar que Lunch_Notifications_Log existe
SHOW TABLES LIKE 'Lunch_Notifications_Log';

-- Si no existe, ejecutar:
source database-scripts/20260522_create_lunch_notifications_log.sql;
```

### 3.4 Purga automática (cron)
```cron
# Purgar notificaciones de almuerzo > 15 días — 3:00 AM diario
0 3 * * * mysql -u root -p'***' -D tickets_system -e "DELETE FROM Lunch_Notifications_Log WHERE Notification_Date < CURDATE() - INTERVAL 15 DAY;"
```

---

## 4. Arquitectura SSE

```
┌──────────────┐     HTTP (init)     ┌──────────────┐
│  Navegador   │ ──────────────────> │  PHP :8000   │
│  (TV/public) │ <────────────────── │  (API)       │
│              │     JSON data       │              │
│              │                     └──────────────┘
│              │     EventSource     ┌──────────────┐
│              │ ──────────────────> │  PHP :8001   │
│              │ <══════════════════ │  (SSE only)  │
│              │   SSE text/event-   │              │
│              │   stream (long-live)│              │
└──────────────┘                     └──────────────┘
                                              │
                                         ┌────┴────┐
                                         │  MySQL  │
                                         └─────────┘
```

- **API (:8000)**: `router.php → index.php → api-public-board.php` — maneja init + auth + todas las rutas
- **SSE (:8001)**: `sse-server.php` — solo stream, evita bloquear la API porque `php -S` es single-threaded
- En producción con Apache: un solo puerto, Apache maneja concurrencia

---

## 5. Variables de entorno requeridas

| Variable | Dev (recomendado) | Prod |
|----------|-------------------|------|
| `REACT_APP_API_BASE` | `http://localhost:8000` | `https://alcaldiasancristobal.gob.ve/api` |
| `REACT_APP_SSE_URL` | `http://localhost:8001` | `https://alcaldiasancristobal.gob.ve/api` |
| `DB_HOST` | `localhost` | `localhost` |
| `DB_NAME` | `tickets_system` | `tickets_system` |
| `JWT_SECRET` | `dev-secret` | `***` (mín 32 chars) |

---

## 6. Archivos del módulo

| Archivo | Función |
|---------|---------|
| `tickets-backend/src/controllers/PublicBoardController.php` | Lógica SSE, queries SQL |
| `tickets-backend/public/api-public-board.php` | Entry point init + stream |
| `tickets-backend/public/sse-server.php` | Servidor SSE autónomo (dev) |
| `tickets-backend/public/router.php` | Router para `php -S` |
| `tickets-frontend/src/pages/PublicBoardPage.tsx` | Página wrapper |
| `tickets-frontend/src/components/public-board/PublicBoard.tsx` | Componente principal |
| `tickets-frontend/src/components/public-board/PublicBoard.css` | Estilos institucionales |
| `tickets-frontend/src/components/public-board/BoardNotification.tsx` | Síntesis de audio |
| `tickets-frontend/src/components/public-board/Clock.tsx` | Reloj Venezuela |
| `tickets-frontend/src/components/public-board/PublicHeader.tsx` | Header institucional |
| `database-scripts/20260522_create_lunch_notifications_log.sql` | Migración BD |
