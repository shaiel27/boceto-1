# Plan: Pantalla de Vista Pública de Tickets (SSE + Sonidos)

## Resumen

Pantalla pública **sin autenticación** que muestra en tiempo real el estado de los tickets y técnicos del sistema de gestión. Utiliza **Server-Sent Events (SSE)** para notificaciones push desde PHP y **Web Audio API** para sonidos ambientales.

---

## 1. Requisitos Funcionales

| # | Requisito | Tipo |
|---|-----------|------|
| 1 | Mostrar tickets activos (En Proceso) con oficina, técnico, prioridad y tiempo transcurrido | Visual |
| 2 | Mostrar técnicos con su estado: Disponible / Ocupado / Almuerzo / Inactivo | Visual |
| 3 | Notificación con sonido cuando se crea un nuevo ticket | Sonido + Visual |
| 4 | Notificación con sonido al inicio de cada bloque de almuerzo | Sonido + Visual |
| 5 | Notificación con sonido cuando un técnico solicita asistencia | Sonido + Visual |
| 6 | Toggle para silenciar/activar sonidos | Interacción |
| 7 | Actualización en tiempo real sin recargar página | Tiempo real |

---

## 2. Arquitectura de Tiempo Real: SSE

### 2.1 Diagrama de flujo

```
[Frontend React]                 [Backend PHP]
      |                                |
      |── GET /api/public-board/init ──|─→ Consulta BD → estado inicial
      |←──── JSON (estado completo) ──|  
      |                                |
      |── GET /api/public-board/stream |← (conexión persistente)
      |   ?since=timestamp             |
      |                                |
      |   <── event: new_ticket        |─→ Polling BD c/3s
      |   <── event: technician_status |    detecta cambios
      |   <── event: lunch_started     |    desde `since`
      |   <── event: assistance_request|
```

### 2.2 Endpoint REST: `GET /api/public-board/init`

Devuelve el estado inicial completo (sin autenticación). Rutear en `public/index.php`.

```json
{
  "success": true,
  "data": {
    "active_tickets": [
      {
        "id": 1,
        "ticket_code": "TICK-0001",
        "subject": "PC no enciende",
        "office_name": "Oficina de Catastro",
        "service_name": "Soporte Técnico",
        "priority": "Alta",
        "status": "En Proceso",
        "technician_name": "Juan Pérez",
        "technician_id": 5,
        "created_at": "2026-05-22 08:30:00",
        "elapsed_minutes": 135
      }
    ],
    "technicians": [
      {
        "id": 5,
        "name": "Juan Pérez",
        "status": "Ocupado",
        "status_reason": "Atendiendo: TICK-0001 - Catastro",
        "lunch_block": null,
        "active_tickets_count": 1
      }
    ],
    "lunch_blocks": [
      { "id": 1, "block_name": "Primer Turno", "start_time": "11:30", "end_time": "12:30" }
    ],
    "current_lunch": {
      "active": false,
      "block": null
    },
    "pending_assistance": [],
    "stats": {
      "pending": 5,
      "in_progress": 8,
      "today_created": 12
    },
    "server_time": "2026-05-22T10:15:00-04:00"
  }
}
```

### 2.3 Endpoint SSE: `GET /api/public-board/stream?since=ISO_TIMESTAMP`

Conexión persistente. PHP hace un loop con `sleep(3)` y consulta cambios desde `since`. Envía eventos SSE cuando detecta novedades.

**Eventos SSE emitidos:**

| Evento | Datos | Cuándo |
|--------|-------|--------|
| `new_ticket` | `{ticket_code, office_name, technician_name, priority, service_name, created_at}` | Nuevo `Service_Request` con `Created_at > since` |
| `technician_status` | `{id, name, status, status_reason, active_tickets_count}` | Cambio en estado de algún técnico |
| `lunch_started` | `{block_name, start_time, end_time}` | Hora actual coincide con `Start_Time` de un bloque (1 sola vez por bloque/día) |
| `lunch_ended` | `{block_name}` | Hora actual supera `End_Time` del bloque activo |
| `assistance_request` | `{ticket_code, technician_name, office_name}` | Nuevo `Assistance_Request` con `Status='PENDIENTE' AND Requested_At > since` |
| `ticket_closed` | `{ticket_code}` | Ticket pasa a estado `Cerrado` |
| `keepalive` | `{timestamp}` | Cada 15s si no hay otros eventos (evita timeout) |

**Formato SSE estándar:**
```
event: new_ticket
data: {"ticket_code":"TICK-0020","office_name":"Dirección de Administración","technician_name":"María García","priority":"Crítica"}

event: lunch_started
data: {"block_name":"Primer Turno","start_time":"11:30","end_time":"12:30"}

```

### 2.4 Lógica de detección de eventos (backend)

```
loop {
    current_since = since_recibido_del_cliente
    
    // 1. Nuevos tickets
    SELECT * FROM Service_Request 
    WHERE Created_at > current_since AND Status != 'Cerrado'
    → emitir new_ticket por cada uno
    
    // 2. Técnicos cuyo status cambió
    Obtener todos los técnicos con su status actual (Technician::getAll)
    Comparar con snapshot anterior
    → emitir technician_status si hay cambios
    
    // 3. Bloques de almuerzo (usar tabla auxiliar o session)
    Para cada Lunch_Block:
      si current_time entre Start_Time y End_Time, y no notificado hoy:
        → emitir lunch_started y marcar notificado
    
    // 4. Solicitudes de asistencia nuevas
    SELECT * FROM Assistance_Requests 
    WHERE Status = 'PENDIENTE' AND Requested_At > current_since
    → emitir assistance_request por cada una
    
    // 5. Tickets cerrados recientemente
    SELECT * FROM Ticket_Timeline
    WHERE New_Status = 'Cerrado' AND Created_at > current_since
    → emitir ticket_closed por cada uno
    
    sleep(3 segundos)
    enviar keepalive si no hubo eventos en los últimos 15s
}
```

---

## 3. Backend: Archivos Nuevos

### 3.1 `tickets-backend/public/api-public-board.php`

Punto de entrada. Sin autenticación. Delega según `action`:
- `action=init` → `PublicBoardController::getInitialState()`
- `action=stream` → `PublicBoardController::streamEvents($since)`
- defecto → 400

### 3.2 `tickets-backend/src/Controllers/PublicBoardController.php`

Clase con métodos:

```php
final class PublicBoardController
{
    private PDO $db;
    private ServiceRequest $ticketModel;
    private Technician $technicianModel;
    private LunchBlock $lunchBlock;
    private AssistanceRequest $assistanceRequest;

    public function __construct(PDO $db) { ... }

    // Devuelve estado completo inicial
    public function getInitialState(): array { ... }

    // Loop SSE: detecta cambios cada 3s y emite eventos
    public function streamEvents(string $since): never { ... }

    // Helpers privados
    private function getActiveTickets(): array { ... }
    private function getCurrentLunchBlock(): ?array { ... }
    private function formatSSE(string $event, array $data): string { ... }
}
```

**Queries clave:**

**Tickets activos** (En Proceso con técnico asignado):
```sql
SELECT sr.ID_Service_Request, sr.Ticket_Code, sr.Subject,
       sr.System_Priority, sr.Status, sr.Created_at,
       o.Name_Office,
       ts.Type_Service,
       CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
       t.ID_Technicians as technician_id
FROM Service_Request sr
JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request AND tt.Status = 'Activo'
JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Status = 'En Proceso'
ORDER BY sr.Created_at ASC
```

**Técnicos con estado:**
```sql
SELECT t.ID_Technicians, CONCAT(t.First_Name, ' ', t.Last_Name) as name,
       t.Status, t.Fk_Lunch_Block,
       lb.Block_Name, lb.Start_Time, lb.End_Time,
       (SELECT COUNT(*) FROM Ticket_Technicians tt
        JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
        WHERE tt.Fk_Technician = t.ID_Technicians
          AND tt.Status = 'Activo' AND sr.Status != 'Cerrado'
       ) as active_tickets_count
FROM Technicians t
LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
ORDER BY t.First_Name
```

### 3.3 Modificar `tickets-backend/public/index.php`

Agregar case en el switch:
```php
case '/api/public-board':
case '/api/public-board/':
    require_once 'api-public-board.php';
    break;
```

Sin autenticación (debe ir ANTES del bloque que requiere auth).

---

## 4. Frontend: Archivos Nuevos

### 4.1 `tickets-frontend/src/pages/PublicBoardPage.tsx`

```tsx
const PublicBoardPage: React.FC = () => {
  return (
    <div className="public-board-page">
      <PublicBoard />
    </div>
  );
};
```

### 4.2 `tickets-frontend/src/components/public-board/PublicBoard.tsx`

**Estado del componente:**
```typescript
interface PublicBoardState {
  activeTickets: ActiveTicket[];
  technicians: TechnicianStatus[];
  currentLunch: LunchInfo | null;
  pendingAssistance: AssistanceInfo[];
  stats: BoardStats;
  serverTime: string;
  soundEnabled: boolean;
  notification: BoardNotification | null; // notificación emergente activa
  connected: boolean; // estado de conexión SSE
}
```

**Ciclo de vida:**
1. `useEffect` al montar → fetch `GET /api/public-board/init`
2. `useEffect` después del init → abrir conexión SSE a `/api/public-board/stream?since=...`
3. En cada evento SSE, actualizar estado + disparar notificación/sonido
4. `useEffect` de limpieza → cerrar `EventSource`

**Layout visual:**

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]  SISTEMA DE GESTIÓN DE TICKETS  [Reloj]  [🔊|🔇]   │
│           Tablero Público · Alcaldía                         │
├────────────────────────────────────────┬─────────────────────┤
│                                        │                     │
│  ┌─── TICKETS EN PROCESO ─────────┐   │  ┌─── TÉCNICOS ──┐  │
│  │                                 │   │  │               │  │
│  │ [Crítica] TICK-0010            │   │  │ 🟢 Juan Pérez │  │
│  │  Oficina: Catastro             │   │  │    Disponible  │  │
│  │  Técnico: María García         │   │  │               │  │
│  │  ⏱ 2h 15m                      │   │  │ 🔴 Ana López  │  │
│  │                                 │   │  │    TICK-0010  │  │
│  │ [Alta] TICK-0008               │   │  │    Catastro    │  │
│  │  Oficina: Dirección Admin      │   │  │               │  │
│  │  Técnico: Carlos Ruiz          │   │  │ 🟡 Pedro Gil  │  │
│  │  ⏱ 45m                         │   │  │    Almuerzo    │  │
│  │                                 │   │  │               │  │
│  │ [Media] TICK-0005              │   │  └───────────────┘  │
│  │  Oficina: Obras Públicas       │   │                     │
│  │  Técnico: (sin asignar)        │   │  ┌─── ESTADÍSTICAS┐ │
│  │  ⏱ 3h 10m                      │   │  │               │ │
│  │                                 │   │  │ Pendientes: 5 │ │
│  └─────────────────────────────────┘   │  │ En Proceso: 8 │ │
│                                        │  │ Hoy: 12       │ │
│                                        │  │               │ │
│  Última actualización: 10:15:23       │  └───────────────┘  │
│  Estado: ● Conectado                  │                     │
└────────────────────────────────────────┴─────────────────────┘
```

### 4.3 `tickets-frontend/src/components/public-board/BoardNotification.tsx`

Sistema de notificaciones emergentes con sonido.

**Eventos de notificación:**
| Evento | Sonido | Duración | Animación |
|--------|--------|----------|-----------|
| Nuevo ticket | 3 tonos ascendentes (C5→E5→G5) | 6s | Slide-in desde centro con glow verde |
| Almuerzo iniciado | 2 tonos tipo campana | 5s | Slide-in desde centro con glow naranja |
| Solicitud asistencia | 3 tonos repetitivos (alerta) | 7s | Slide-in desde centro con glow rojo |
| Ticket cerrado | 2 tonos descendentes | 4s | Fade-out sutil |

**Sonidos con Web Audio API** (mismo patrón que `CenteredNotification.tsx` existente):

```typescript
const playNotificationSound = (type: NotificationType) => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);

  switch (type) {
    case 'new_ticket':
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);       // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);  // G5
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
      break;
    case 'lunch':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);           // A4
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);     // A5
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
      break;
    case 'assistance':
      for (let i = 0; i < 3; i++) {
        osc.frequency.setValueAtTime(600, ctx.currentTime + i * 0.4);
        osc.frequency.setValueAtTime(400, ctx.currentTime + i * 0.4 + 0.2);
      }
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.start(); osc.stop(ctx.currentTime + 1.5);
      break;
  }
};
```

**Toggle de sonido:** Botón fijo en esquina superior derecha (🔊/🔇). Estado persistido en `localStorage`.

### 4.4 `tickets-frontend/src/components/public-board/PublicBoard.css`

**Principios de diseño:**
- Fondo oscuro (`#0a0e1a`), ideal para TV/monitor público
- Letras grandes y alto contraste (mínimo 16px cuerpo, 24px+ encabezados)
- Tarjetas con glassmorphism sutil (fondo semitransparente, blur)
- Colores de prioridad: Crítica=rojo, Alta=naranja, Media=azul, Baja=gris
- Indicadores de estado: Verde=disponible, Rojo=ocupado, Naranja=almuerzo, Gris=inactivo
- Animaciones suaves (transiciones CSS de 0.3s, pulse en tickets críticos)
- Sin scroll horizontal, contenido auto-ajustable
- Basado en las variables CSS del sistema (`--institution-navy`, `--institution-gold`)

**Clases principales:**
```css
.public-board-page { /* layout full viewport, sin overflow */ }
.pb-header { /* logos, título, reloj, toggle sonido */ }
.pb-main { /* grid 70/30 */ }
.pb-tickets-section { /* columna izquierda */ }
.pb-ticket-card { /* tarjeta individual de ticket */ }
.pb-ticket-card.priority-critica { /* borde rojo, pulse */ }
.pb-ticket-card.priority-alta { /* borde naranja */ }
.pb-ticket-card.priority-media { /* borde azul */ }
.pb-technicians-section { /* columna derecha */ }
.pb-technician-item { /* fila de técnico */ }
.pb-technician-status.available { /* verde */ }
.pb-technician-status.busy { /* rojo */ }
.pb-technician-status.lunch { /* naranja */ }
.pb-notification-overlay { /* overlay de notificación emergente */ }
.pb-clock { /* reloj digital grande */ }
.pb-connection-status { /* indicador conectado/desconectado */ }
```

---

## 5. Ruteo

### 5.1 Frontend (`tickets-frontend/src/App.tsx`)

Agregar ruta pública (SIN `ProtectedRoute`):
```typescript
import PublicBoardPage from './pages/PublicBoardPage';

const router = createBrowserRouter([
  // ... rutas existentes ...
  { path: '/public-board', element: <PublicBoardPage /> },
]);
```

### 5.2 Backend (`tickets-backend/public/index.php`)

Agregar case antes del bloque de autenticación:
```php
case '/api/public-board':
case '/api/public-board/':
    require_once 'api-public-board.php';
    break;
```

---

## 6. Resumen de Archivos

| Archivo | Acción |
|---------|--------|
| `tickets-backend/public/api-public-board.php` | **CREAR** — Router del endpoint público |
| `tickets-backend/src/Controllers/PublicBoardController.php` | **CREAR** — Lógica SSE + consultas BD |
| `tickets-backend/public/index.php` | **MODIFICAR** — Agregar ruta `/api/public-board` |
| `tickets-frontend/src/pages/PublicBoardPage.tsx` | **CREAR** — Página wrapper |
| `tickets-frontend/src/components/public-board/PublicBoard.tsx` | **CREAR** — Componente principal |
| `tickets-frontend/src/components/public-board/PublicBoard.css` | **CREAR** — Estilos del tablero |
| `tickets-frontend/src/components/public-board/BoardNotification.tsx` | **CREAR** — Notificaciones + sonidos |
| `tickets-frontend/src/components/public-board/BoardNotification.css` | **CREAR** — Estilos de notificaciones |
| `tickets-frontend/src/App.tsx` | **MODIFICAR** — Ruta `/public-board` |

---

## 7. Consideraciones Técnicas

### 7.1 PHP SSE y buffering
- `header('Content-Type: text/event-stream')`
- `header('Cache-Control: no-cache')`
- `header('X-Accel-Buffering: no')` (para nginx)
- `ob_implicit_flush(true)` + `ob_end_flush()`
- Timeout en PHP: `set_time_limit(0)` (loop infinito)
- Timeout en navegador: EventSource reconecta automáticamente

### 7.2 Prevención de almuerzos duplicados
Usar una tabla o archivo temporal para registrar qué bloques de almuerzo ya fueron notificados hoy:
```sql
CREATE TABLE Lunch_Notifications_Log (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Fk_Lunch_Block INT NOT NULL,
    Notification_Date DATE NOT NULL,
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily (Fk_Lunch_Block, Notification_Date)
);
```

### 7.3 Seguridad
- Endpoint público (sin auth) — solo lectura
- No exponer datos sensibles (nombres completos de ciudadanos, etc.)
- Rate limiting opcional para evitar abuso del streaming
- Timeout de conexión SSE: 60s máximo, luego reconexión

### 7.4 Rendimiento
- Consultas ligeras y optimizadas con índices
- Loop de 3s entre cada verificación
- Snapshot en memoria PHP del estado anterior para detectar cambios
- Sin JOINs pesados, solo las tablas necesarias

### 7.5 Compatibilidad
- SSE soportado en Chrome, Firefox, Safari, Edge (98% de navegadores)
- No soportado en IE (no es relevante)
- Web Audio API soportado en todos los navegadores modernos
- Polyfill SSE disponible si se requiere en el futuro

---

## 8. Posibles Mejoras Futuras

- [ ] Integración de comandos de voz (Web Speech API)
- [ ] Pantalla táctil interactiva (kiosko físico)
- [ ] Múltiples pantallas con filtros por servicio/dirección
- [ ] Histórico de notificaciones del día
- [ ] Temas visuales intercambiables
- [ ] Soporte multi-idioma
- [ ] Dashboard público embebible (iframe)
