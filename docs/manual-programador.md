# Manual del Programador

## Sistema de Gestión de Tickets — Alcaldía de San Cristóbal

---

## Índice

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Arquitectura General](#3-arquitectura-general)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Backend (PHP)](#5-backend-php)
6. [Frontend Web (React)](#6-frontend-web-react)
7. [App Móvil (React Native / Expo)](#7-app-móvil-react-native--expo)
8. [Base de Datos](#8-base-de-datos)
9. [Autenticación y Autorización](#9-autenticación-y-autorización)
10. [API REST — Endpoints](#10-api-rest--endpoints)
11. [Integración con SIFA (Bienes)](#11-integración-con-sifa-bienes)
12. [Tiempo Real (SSE y Polling)](#12-tiempo-real-sse-y-polling)
13. [Patrones y Convenciones](#13-patrones-y-convenciones)
14. [Configuración del Entorno](#14-configuración-del-entorno)
15. [Despliegue](#15-despliegue)
16. [Solución de Problemas Comunes](#16-solución-de-problemas-comunes)

---

## 1. Stack Tecnológico

### Backend (`tickets-backend/`)

| Componente | Tecnología |
|---|---|
| **Lenguaje** | PHP 8.0+ con `declare(strict_types=1)` |
| **Framework** | Ninguno (PHP vanilla) |
| **Base de datos** | MySQL 8+ con PDO (driver `pdo_mysql`) |
| **Autenticación** | JWT custom (HMAC-SHA256, base64url) — sin librerías externas |
| **Servidor dev** | PHP Built-in Server (`php -S`) |
| **Servidor prod** | Apache 2.4 + mod_rewrite |
| **Puerto API** | `8000` |
| **Puerto SSE** | `8001` (deprecado, se usa polling) |
| **Codificación** | UTF-8, zona horaria `America/Caracas` (UTC-4) |

### Frontend Web (`tickets-frontend/`)

| Componente | Tecnología | Versión |
|---|---|---|
| **Framework** | React | 19.2.4 |
| **Lenguaje** | TypeScript | 4.9.5 |
| **Routing** | react-router-dom | 6.30.3 |
| **Bundler** | Create React App (react-scripts) | — |
| **Icons** | lucide-react | — |
| **Notificaciones** | sileo (toast) | — |
| **PDF** | jsPDF + jspdf-autotable | — |
| **Puerto** | `3000` |
| **Estilos** | CSS Modules + CSS Variables (light/dark) |

### App Móvil (`tickets-App/`)

| Componente | Tecnología | Versión |
|---|---|---|
| **Framework** | React Native | 0.81.5 |
| **SDK** | Expo | 54.0.35 |
| **Lenguaje** | TypeScript | 5.9.2 (strict) |
| **Routing** | expo-router | 6.0.23 (file-based) |
| **Estado global** | Zustand | 5.0.14 |
| **Server state** | TanStack React Query | 5.101.0 |
| **Formularios** | react-hook-form + zod | 7.77.0 / 4.4.3 |
| **Notificaciones push** | expo-notifications | 0.32.17 |
| **Almacenamiento** | AsyncStorage | 2.2.0 |

### Integración Externa

| Sistema | Propósito | Puerto |
|---|---|---|
| **SIFA (XAMPP)** | API de bienes patrimoniales | `8012` |
| **bienes.php** | Consulta de bienes por código | — |
| **unidades.php** | Consulta de unidades administrativas | — |

---

## 2. Requisitos del Sistema

### 2.1 Servidor (Backend + Base de Datos)

| Componente | Mínimo | Recomendado |
|---|---|---|
| **SO** | Windows Server 2016 / Ubuntu 20.04 | Windows Server 2022 / Ubuntu 24.04 |
| **PHP** | 8.0 | 8.3+ |
| **MySQL** | 8.0 | 8.4+ o MariaDB 11+ |
| **Apache** | 2.4 (mod_rewrite, mod_headers) | 2.4+ con PHP-FPM |
| **RAM** | 2 GB | 4 GB |
| **CPU** | 2 núcleos | 4 núcleos |
| **Disco** | 20 GB libres | 50 GB SSD |
| **Extensiones PHP** | `pdo_mysql`, `mbstring`, `json`, `fileinfo`, `gd` | mismas + `opcache`, `curl` |

### 2.2 Frontend Web

| Componente | Mínimo | Recomendado |
|---|---|---|
| **Navegador** | Chrome 90+, Firefox 90+, Edge 90+ | última versión estable |
| **Resolución** | 1024×768 | 1920×1080+ |
| **RAM (cliente)** | 4 GB | 8 GB |
| **Conexión** | 2 Mbps | 10 Mbps+ |

### 2.3 App Móvil

| Componente | Mínimo | Recomendado |
|---|---|---|
| **Android** | 7.0 (API 24) | 12+ (API 31+) |
| **iOS** | 14.0 | 17+ |
| **RAM** | 3 GB | 6 GB+ |
| **Expo Go** | última versión | última versión |

### 2.4 Entorno de Desarrollo

| Componente | Mínimo | Recomendado |
|---|---|---|
| **Node.js** | 18.0 LTS | 22.x LTS |
| **npm** | 9.x | 10.x+ |
| **PHP (CLI)** | 8.0 | 8.3+ |
| **XAMPP / Laragon** | — | sí (para proxy SIFA) |
| **Git** | 2.30+ | 2.40+ |
| **IDE** | VS Code / PHPStorm | VS Code + PHP Intelephense |
| **MySQL Client** | cualquier cliente | MySQL Workbench / TablePlus |

---

## 3. Arquitectura General

```
┌──────────────────────────────────────────────────────────────┐
│                        USUARIOS                               │
│   (Admin · Técnico · Jefe/Solicitante · Auditor)             │
└──────┬──────────────────────┬────────────────────┬───────────┘
       │                      │                    │
       ▼                      ▼                    ▼
┌──────────────┐    ┌────────────────┐    ┌──────────────────┐
│  Frontend    │    │   App Móvil    │    │  Tablero Público  │
│  Web (3000)  │    │  (Expo/RN)     │    │  (sin auth)      │
│  React 19    │    │  Expo SDK 54   │    │                  │
└──────┬───────┘    └───────┬────────┘    └────────┬─────────┘
       │                    │                       │
       └──────────┬─────────┘──────────────────────┘
                  │ HTTP REST (JSON)
                  ▼
        ┌──────────────────┐
        │   Backend PHP    │  ←── Apache / PHP Built-in
        │   Puerto 8000    │
        │   JWT Auth       │
        └───────┬──────────┘
                │
        ┌───────┴──────────┐
        │                  │
        ▼                  ▼
 ┌────────────┐    ┌──────────────┐
 │   MySQL    │    │  XAMPP/SIFA  │
 │  tickets_  │    │  Puerto 8012 │
 │  system    │    │  (bienes)    │
 └────────────┘    └──────────────┘
```

### Roles del Sistema

| ID | Nombre | Acceso |
|---|---|---|
| 1 | **Admin** | Full — Dashboard, tickets, técnicos, oficinas, reportes, auditoría, usuarios |
| 2 | **Técnico** | Dashboard técnico, tickets asignados, historial, perfil |
| 3 | **Solicitante/Jefe** | Crear tickets, ver propios, historial |
| 4 | **Auditor** | Solo módulo de auditoría (`/admin/audit`) |

---

## 4. Estructura del Proyecto

```
boceto-1/
├── tickets-backend/           ← API REST PHP
│   ├── public/
│   │   ├── index.php          ← Router principal + CORS + Auth middleware
│   │   ├── api-public-board.php
│   │   ├── api-dashboard.php
│   │   └── uploads/           ← Archivos subidos (tickets, comentarios)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.php   ← Clase Database (PDO)
│   │   ├── controllers/       ← 21 controladores (sin framework)
│   │   ├── models/            ← 15 modelos (Active Record simple)
│   │   ├── Services/          ← 7 servicios (JWT, Notificaciones, Reportes, etc.)
│   │   ├── Middleware/        ← AuthMiddleware + RoleMiddleware
│   │   └── DTO/               ← 13 DTOs + 1 enum
│   ├── database-scripts/      ← Documentación BD (diccionario, diagrama ER)
│   ├── scripts/               ← Scripts auxiliares SQL
│   ├── .env                   ← Config DB + JWT_SECRET
│   ├── router.php             ← Entry point para PHP Built-in Server
│   ├── .htaccess              ← Reglas Apache
│   └── apache-vhost.conf      ← VirtualHost de ejemplo
│
├── tickets-frontend/          ← Web App React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         ← Gestión de técnicos, tickets, etc.
│   │   │   ├── technician/    ← Dashboard, perfil del técnico
│   │   │   ├── requester/     ← Dashboard del solicitante
│   │   │   ├── auth/          ← Login, ProtectedRoute
│   │   │   ├── public-board/  ← Tablero público
│   │   │   ├── reports/       ← Generación de reportes PDF
│   │   │   ├── tickets/       ← Formulario de tickets
│   │   │   ├── bienes/        ← Consulta de bienes SIFA
│   │   │   ├── common/        ← Componentes compartidos
│   │   │   ├── dashboard/     ← KPIs, gráficos
│   │   │   ├── layout/        ← Navbars, Sidebars
│   │   │   ├── assistance/    ← Solicitudes de asistencia
│   │   │   └── ui/            ← Botones, inputs, tablas reutilizables
│   │   ├── pages/             ← 20 páginas (wrappers de componentes)
│   │   ├── services/
│   │   │   ├── api.ts         ← ~3000 líneas: todos los endpoints
│   │   │   ├── bienesApi.ts   ← Cliente proxy para SIFA
│   │   │   └── pdfService.ts  ← Generación PDF con jsPDF
│   │   ├── contexts/          ← AuthContext, ThemeContext
│   │   ├── styles/            ← variables.css (light/dark theme)
│   │   ├── App.tsx            ← Router con 18 rutas
│   │   └── index.tsx          ← Entry point
│   ├── setupProxy.js          ← Proxy CRA → XAMPP (bienes)
│   └── .env                   ← Config frontend
│
├── tickets-App/               ← App Móvil Expo
│   ├── app/                   ← File-based routing (expo-router)
│   │   ├── _layout.tsx        ← Root layout (providers, auth gate)
│   │   ├── (auth)/login.tsx   ← Pantalla de login
│   │   ├── (tabs)/
│   │   │   ├── admin/         ← Dashboard, tickets, técnicos, reportes
│   │   │   ├── technician/    ← Dashboard, detalle, perfil, asistencia
│   │   │   └── requester/     ← Dashboard, crear ticket, historial
│   ├── src/
│   │   ├── components/        ← UI components (Button, Card, FormField, etc.)
│   │   ├── constants/         ← colors.ts, config.ts, roles.ts, theme.ts
│   │   ├── contexts/          ← Auth, Toast, Ticket, Notification
│   │   ├── hooks/             ← useAuth, useTicketsQuery
│   │   ├── services/          ← api.ts, authService, ticketService, etc.
│   │   ├── stores/            ← Zustand stores (auth, ticket, toast)
│   │   ├── types/             ← user.ts, ticket.ts, api.ts
│   │   └── utils/             ← mappers.ts, validation.ts
│   ├── PLAN.md                ← Plan de desarrollo detallado
│   └── app.json               ← Config Expo
│
├── database-scripts/          ← Scripts SQL
│   ├── schema.sql             ← Esquema completo (tickets_municipal)
│   ├── reset_database.sql
│   ├── insert-data.sql
│   ├── data.sql               ← Datos de prueba completos
│   ├── diccionario-de-datos.md
│   ├── schema.dbml
│   └── diagrama-er.html       ← Diagrama ER interactivo (D3.js)
│
├── docs/                      ← Documentación
├── datos_insercion.sql        ← Seed data (tickets_system)
├── insert-oficinas-completas.sql
├── README.md
└── NETWORK-CHANGE-GUIDE.md    ← Guía de configuración de red
```

---

## 5. Backend (PHP)

### 4.1 Sin Framework — Arquitectura Plana

El backend no usa ningún framework. Cada request fluye así:

```
router.php (PHP Built-in Server)
  └→ public/index.php
       ├─ 1. CORS headers (dinámico según origen)
       ├─ 2. Auth Middleware (JWT) — excepto /api/auth y /api/public-board
       ├─ 3. Switch de rutas (path → controller)
       └─ 4. Controller require + ejecución
```

### 4.2 Controladores

Cada controlador es un archivo PHP independiente (sin clase, salvo excepciones como `PublicBoardController`, `StructureController`, `OfficeController`, etc.). Siguen este patrón:

```php
<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ModeloNecesario.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $modelo = new ModeloNecesario($db);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        // ...
    case 'POST':
        // ...
}

// Respuesta estándar:
echo json_encode(['success' => true, 'data' => $data, 'message' => '...']);
```

Algunos controladores sí son clases para manejo más complejo:
- `PublicBoardController` — estado inicial, polling, SSE streaming
- `OfficeController`, `StructureController`, `ProblemReportController`, `ReportController`

**Lista de 21 controladores:**

| Archivo | Endpoint | Métodos |
|---|---|---|
| `AuthController.php` | `/api/auth` | POST login, POST register, GET me, POST logout |
| `TicketController.php` | `/api/tickets` | CRUD completo, asignación, comentarios, adjuntos, timeline |
| `TechnicianController.php` | `/api/technicians` | CRUD técnicos, grouped-by-service, performance |
| `UserController.php` | `/api/users` | CRUD usuarios, cambio contraseña |
| `AdminDashboardController.php` | — | Dashboard admin (stats, KPIs) |
| `AnalyticsController.php` | `/api/analytics` | Analíticas y estadísticas |
| `AssignmentController.php` | `/api/assignments` | Asignación/desasignación de técnicos |
| `AuditLogController.php` | `/api/audit` | Log de auditoría |
| `PublicBoardController.php` | `/api/public-board` | Tablero público (init, poll, stream) |
| `EscalationController.php` | `/api/escalation` | Escalamiento automático de tickets |
| `LunchBlockController.php` | `/api/lunch-blocks` | Bloques de almuerzo |
| `NotificationController.php` | `/api/notifications` | Notificaciones de usuario |
| `OfficeController.php` | `/api/office` | CRUD oficinas (con estructura jerárquica) |
| `ProblemReportController.php` | `/api/problem-report` | Reportes por problema |
| `ReportController.php` | `/api/reports` | Reportes generales con DTOs |
| `ServiceController.php` | `/api/service` | Servicios TI |
| `StructureController.php` | `/api/structure` | Estructura institucional completa |
| `TechnicianHistoryController.php` | — | Historial del técnico |
| `TechnicianReportController.php` | `/api/technician-reports` | Reportes de técnicos |
| `TechnicianScheduleController.php` | `/api/technician-schedules` | Horarios de técnicos |
| `WeeklyReportController.php` | `/api/weekly-report` | Reporte semanal |

### 4.3 Modelos

Patrón **Active Record simple**: cada modelo es una clase que recibe `PDO` en el constructor y ejecuta consultas directamente. No hay ORM.

```php
class ServiceRequest {
    private $conn;
    private $table_name = "Service_Request";

    public $ID_Service_Request;
    public $Ticket_Code;
    // ... propiedades públicas

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createWithDTO(object $dto, int $requesterId): ?int { ... }
    public function getById(int $id): ?array { ... }
    public function getAll(?array $filters = []): array { ... }
    // etc.
}
```

**15 modelos:**

| Clase | Tabla | Propósito |
|---|---|---|
| `User` | `Users` | Login, CRUD, verificación |
| `ServiceRequest` | `Service_Request` | Tickets — CRUD, filtros, stats |
| `Technician` | `Technicians` | Técnicos, status auto-update, disponibilidad |
| `Office` | `Office` | CRUD con jerarquía |
| `TIService` | `TI_Service` | Servicios TI |
| `TicketComment` | `Ticket_Comments` | Comentarios de tickets |
| `TicketAttachment` | `Ticket_Attachments` | Archivos adjuntos |
| `TicketTimeline` | `Ticket_Timeline` | Línea de tiempo de eventos |
| `LunchBlock` | `Lunch_Blocks` | Bloques de almuerzo |
| `ServiceProblemsCatalog` | `Service_Problems_Catalog` | Catálogo de problemas |
| `SoftwareSystems` | `Software_Systems` | Sistemas de software |
| `Notification` | `Notifications` | Notificaciones de usuario |
| `AuditLog` | `audit_logs` | Registro de auditoría |
| `AssistanceRequest` | `Assistance_Requests` | Solicitudes de asistencia |
| `ProblemReport` | — | Reportes por problema (vistas) |

### 4.4 Servicios

| Servicio | Propósito |
|---|---|
| `JwtService` | Generar/validar JWT (HS256, base64url, 1 año expiración) |
| `AuditService` | Logging de acciones (login, CRUD, etc.) |
| `EscalationService` | Detectar tickets sin asignar según SLA y escalar |
| `NotificationService` | Crear notificaciones para usuarios |
| `TicketService` | Lógica de negocio de tickets (creación, cierre) |
| `ReportService` | Generación de reportes con DTOs |
| `OfficeSyncService` | Sincronización de oficinas con SIFA |

### 4.5 DTOs

13 Data Transfer Objects en `src/DTO/`:

| DTO | Uso |
|---|---|
| `CreateTicketDTO` | Creación de tickets |
| `DashboardStatsDTO` | Estadísticas del dashboard |
| `DateRangeDTO` | Rangos de fecha para reportes |
| `GeneralSummaryDTO` | Resumen general |
| `GeneralMonthlyDTO` | Reporte mensual |
| `OfficeReportDTO` | Reporte por oficina |
| `PriorityReportDTO` | Reporte por prioridad |
| `ResponseTimeDTO` | Tiempos de respuesta |
| `ServiceReportDTO` | Reporte por servicio |
| `TechnicianWorkloadDTO` | Carga de trabajo de técnicos |
| `WeeklyReportDTO` | Reporte semanal |
| `NotificationDTO` | Notificaciones |

### 4.6 Middleware

**AuthMiddleware** (`src/Middleware/AuthMiddleware.php`):
- `requireAuth()` — 401 si no hay token válido
- `optionalAuth()` — permite acceso público, pero si hay token lo valida
- `setUserContext()` — establece `$_SERVER['AUTH_USER_ID']`, `$_SERVER['AUTH_USER_ROLE']`, etc.
- Contexto accesible via `AuthMiddleware::getCurrentUserId()` y `getCurrentUserRole()`

**RoleMiddleware**:
- Verifica roles específicos (1=Admin, 2=Técnico, 3=Jefe, 4=Auditor)

### 4.7 Esquema de Rutas (index.php)

```
/api/auth              → POST (login/register/logout), GET (me)
/api/tickets           → CRUD + acciones (assign, comment, attach, close, etc.)
/api/users             → CRUD usuarios
/api/technicians       → CRUD técnicos, grouped, performance
/api/lunch-blocks      → Bloques de almuerzo
/api/technician-schedules → Horarios
/api/analytics         → Estadísticas
/api/service           → Servicios TI
/api/assignments       → Asignación de técnicos a tickets
/api/dashboard         → Dashboard admin
/api/public-board      → Tablero público (sin auth)
/api/office            → CRUD oficinas
/api/structure         → Estructura institucional
/api/notifications     → Notificaciones de usuario
/api/escalation        → Escalamiento
/api/reports           → Reportes generales
/api/audit             → Auditoría (rol Auditor, role_id=4)
/api/bienes            → Proxy a SIFA (bienes)
/api/unidades          → Proxy a SIFA (unidades)
/api/problem-report    → Reporte por problema
/api/weekly-report     → Reporte semanal
/api/technician-reports → Reporte de técnicos
```

---

## 6. Frontend Web (React)

### 5.1 Estructura de Componentes

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx         ← KPIs, gráficos, tickets recientes
│   │   ├── AdminTicketHub.tsx         ← CRUD tickets con tabla y filtros
│   │   ├── TechnicianManagement.tsx   ← CRUD técnicos (1,546 líneas)
│   │   └── ...
│   ├── technician/
│   │   ├── TechnicianDashboard.tsx    ← Bandeja de tickets del técnico
│   │   ├── TechnicianProfile.tsx      ← Perfil + cambio contraseña
│   │   └── ...
│   ├── requester/
│   │   ├── RequesterDashboard.tsx     ← Tickets del solicitante
│   │   └── ...
│   ├── public-board/
│   │   ├── PublicBoard.tsx            ← Tablero público (395 líneas)
│   │   ├── PublicBoard.css            ← 605 líneas de estilos
│   │   ├── Clock.tsx                  ← Reloj en vivo
│   │   └── BoardNotification.tsx      ← Notificaciones sonoras/visuales
│   ├── reports/
│   │   ├── Reports.tsx                ← Panel de reportes con filtros
│   │   ├── PDFTestReport.tsx          ← Generación PDF
│   │   └── TechnicianWeeklyReport.tsx
│   ├── tickets/
│   │   └── TicketForm.tsx             ← Formulario creación de tickets
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ProtectedRoute.tsx         ← Guard de rutas por rol
│   ├── layout/
│   │   └── Sidebar.tsx                ← Navegación lateral
│   ├── bienes/
│   │   ├── BienesPage.tsx             ← Consulta de bienes
│   │   └── BienesTest.tsx
│   ├── common/                        ← Componentes reutilizables
│   ├── dashboard/                     ← Componentes de dashboard
│   └── ui/                            ← UI primitives
├── pages/                             ← 20 wrappers
│   ├── DashboardPage.tsx
│   ├── AdminManagementPage.tsx
│   ├── TechnicianDashboardPage.tsx
│   ├── RequesterDashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── PublicBoardPage.tsx
│   └── ...
├── services/
│   ├── api.ts                         ← ~3000 líneas, todos los endpoints
│   ├── bienesApi.ts                   ← Cliente SIFA
│   └── pdfService.ts                  ← Generación PDF
└── styles/
    └── variables.css                  ← Tema light/dark
```

### 5.2 Sistema de Temas (variables.css)

```css
:root { /* Light Mode */
  --bg-primary: #fafafa;
  --bg-card: #ffffff;
  --text-main: #1e293b;
  --institution-navy-deep: #1a365d;
  --institution-gold: #c9a961;
  /* ... */
}
[data-theme='dark'] {
  --bg-primary: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  /* ... */
}
```

### 5.3 API Client (api.ts)

Archivo central de ~3000 líneas. Patrón:

```typescript
const ApiService = {
  // Auth
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> { ... },
  async getMe(): Promise<ApiResponse<User>> { ... },
  async logout(): Promise<ApiResponse<void>> { ... },

  // Tickets
  async getTickets(params?: Record<string, any>): Promise<ApiResponse<Ticket[]>> { ... },
  async getTicket(id: number): Promise<ApiResponse<Ticket>> { ... },
  async createTicket(data: CreateTicketDTO): Promise<ApiResponse<{id: number}>> { ... },
  async assignTechnician(ticketId: number, technicianId: number): Promise<ApiResponse<void>> { ... },
  async closeTicket(id: number, notes: string): Promise<ApiResponse<void>> { ... },
  // ... ~200 métodos
};
```

### 5.4 Sistema de Autenticación (AuthContext)

```typescript
// Context + useReducer
// Almacena token en sessionStorage
// Roles: isAdmin() → role === 1, isTechnician() → role === 2,
//        isBoss() → role === 3, isAuditor() → role === 4
```

### 5.5 Rutas (App.tsx)

18 rutas con `createBrowserRouter`:

| Ruta | Componente | Roles permitidos |
|---|---|---|
| `/` | DashboardPage | Admin (1) |
| `/login` | LoginPage | Público |
| `/register` | RegisterPage | Público |
| `/admin` | AdminManagementPage | Admin (1) |
| `/admin/tickets` | AdminTicketManagementPage | Admin (1) |
| `/admin/technicians` | TechnicianManagementPage | Admin (1) |
| `/admin/structure` | InstitutionalStructurePage | Admin (1) |
| `/admin/offices` | OfficeManagementPage | Admin (1) |
| `/admin/reports` | ReportsPage | Admin (1) |
| `/admin/register-user` | UserRegistrationPage | Admin (1) |
| `/admin/audit` | AuditPage | Auditor (4) |
| `/technician` | TechnicianDashboardPage | Técnico (2) |
| `/requester` | RequesterDashboardPage | Solicitante (3) |
| `/new-ticket` | TicketForm | Admin, Solicitante (1,3) |
| `/pdf-test` | PDFTestReport | Público |
| `/public-board` | PublicBoardPage | Público |
| `/bienes` | BienesPage | Todos (1,2,3,4) |
| `/bienes-test` | BienesTest | Público |

---

## 7. App Móvil (React Native / Expo)

### 6.1 File-based Routing (expo-router)

```
app/
├── _layout.tsx          ← Root layout (QueryClient, Toast, Auth, Notification providers)
├── index.tsx            ← Redirect según auth state
├── +not-found.tsx       ← 404
├── (auth)/
│   ├── _layout.tsx
│   └── login.tsx        ← Login con react-hook-form + zod
└── (tabs)/
    ├── _layout.tsx
    ├── admin/           ← Dashboard, tickets (CRUD), técnicos, usuarios, reportes
    ├── technician/      ← Dashboard, detalle ticket, perfil, asistencia, historial
    └── requester/       ← Dashboard, crear ticket, detalle, historial
```

### 6.2 Estado Global

Tres stores con **Zustand**:

```typescript
// authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

// ticketStore.ts
interface TicketStore {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  filters: TicketFilters;
  setFilters: (filters: Partial<TicketFilters>) => void;
  // ...
}

// toastStore.ts
interface ToastStore {
  toasts: Toast[];
  show: (message: string, type: ToastType) => void;
  dismiss: (id: string) => void;
}
```

### 6.3 Server State (TanStack React Query)

```typescript
// useTicketsQuery.ts
export function useAdminTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ['adminTickets', filters],
    queryFn: () => adminService.getTickets(filters),
    staleTime: 30_000,
    retry: 2,
  });
}

export function useTechnicianTickets(status?: string) {
  return useQuery({
    queryKey: ['technicianTickets', status],
    queryFn: () => technicianService.getMyTickets(status),
  });
}
```

### 6.4 Estado de Implementación

| Módulo | Estado |
|---|---|
| Login | ✅ Completo |
| Admin Dashboard | ✅ Completo |
| Admin Tickets (lista, detalle, crear) | ✅ Completo |
| Admin Técnicos | ✅ Completo |
| Admin Usuarios | ✅ Completo |
| Admin Reportes | ✅ Completo |
| Technician Dashboard | ✅ Completo |
| Technician Ticket Detail | ✅ Completo |
| Technician Profile | ✅ Completo |
| Technician Assistance | ✅ Completo |
| Technician History | ✅ Completo |
| Requester Dashboard | ✅ Completo |
| Requester Create Ticket | ✅ Completo |
| Requester Ticket Detail | ✅ Completo |
| Requester History | ✅ Completo |

---

## 8. Base de Datos

### 7.1 Esquemas

Dos variantes de base de datos:

| Variante | Activa | Notas |
|---|---|---|
| **tickets_system** | ✅ **Usada por el backend** | Incluye auditoría, notificaciones, escalamiento, bienes_cache |
| tickets_municipal | ❌ Versión anterior | Esquema más simple, con triggers |

### 7.2 Tablas Principales (tickets_system — 25 tablas)

**Core:**
- `Role` — Roles del sistema (Admin, Técnico, Jefe, Auditor)
- `Users` — Usuarios con email, password (bcrypt), full_name, role
- `Boss` — Jefes de oficina
- `Office` — Oficinas con jerarquía (coduniadm para SIFA)

**Tickets:**
- `Service_Request` — Tickets (subject, description, priority, status, timestamps)
- `Ticket_Technicians` — Asignación técnica-ticket (N:N)
- `Ticket_Comments` — Comentarios con archivos adjuntos
- `Ticket_Attachments` — Archivos (fotos, documentos)
- `Ticket_Timeline` — Línea de tiempo de eventos

**Servicios:**
- `TI_Service` — Servicios TI (Redes, Soporte, Programación, etc.)
- `Service_Problems_Catalog` — Catálogo de problemas por servicio
- `Technicians` — Técnicos con status (Disponible, Ocupado, Inactivo, Fuera de Servicio)
- `Technicians_Service` — Asignación técnico-servicio
- `Technician_Schedules` — Horarios semanales
- `Lunch_Blocks` — Bloques de almuerzo
- `Software_Systems` — Sistemas de software
- `Office_Systems` — Sistemas por oficina
- `Service_Permissions` — Permisos por servicio/oficina
- `Request_Settings` — Configuración de solicitudes

**Infraestructura:**
- `audit_logs` — Auditoría de acciones
- `Notifications` — Notificaciones de usuario
- `Assistance_Requests` — Solicitudes de asistencia entre técnicos
- `Ticket_Escalations` — Escalamiento automático
- `Pending_Ticket_Alerts` — Alertas de tickets pendientes
- `Escalation_Config` — Configuración de escalamiento
- `bienes_cache` — Caché de respuestas SIFA
- `Lunch_Notifications_Log` — Log de notificaciones de almuerzo

### 7.3 Vistas

- `v_tickets_completos` — Tickets con toda la información joins
- `v_tecnicos_disponibilidad` — Técnicos disponibles con servicios
- `v_catalogo_problemas` — Catálogo de problemas con servicio
- `v_estructura_oficinas` — Jerarquía de oficinas
- `v_horarios_tecnicos` — Horarios de técnicos
- `v_bloques_almuerzo` — Bloques de almuerzo
- `v_Pending_Tickets_Needing_Attention` — Tickets pendientes de atención
- `v_Escalation_Stats` — Estadísticas de escalamiento

### 7.4 Status de Técnicos

El campo `Technicians.Status` puede tener estos valores:

| Valor | Significado | Se establece cuando |
|---|---|---|
| `Disponible` | En horario laboral, sin almuerzo, sin tickets activos | Auto-update, reactivación |
| `Ocupado` | En almuerzo O tiene tickets activos | Auto-update, asignación |
| `Inactivo` | Fuera del horario laboral | Auto-update (según schedule) |
| `Fuera de Servicio` | Baja temporal/permanente (soft-delete) | Admin lo marca |

El método `Technician::updateTechniciansStatus()` ejecuta la lógica cada vez que se consultan técnicos:
1. Si `Fuera de Servicio` → se excluye del auto-update
2. Si fuera del horario laboral → `Inactivo`
3. Si en bloque de almuerzo → `Ocupado`
4. Si tiene tickets activos → `Ocupado`
5. Si no → `Disponible`

### 7.5 Generación de Código de Ticket

Formato: `TTT-NNNNNN` donde `TTT` son 3 letras del servicio y `NNNNNN` es secuencial.
- En `tickets_municipal`: via trigger `tr_generate_ticket_code`
- En `tickets_system`: via lógica PHP en el controlador

---

## 9. Autenticación y Autorización

### 8.1 Flujo de Login

```
Frontend                    Backend
   │                          │
   ├─ POST /api/auth ────────→│
   │  {email, password}       │
   │                          ├─ User::login() → verifica bcrypt
   │                          ├─ AuditService::logLogin()
   │                          ├─ JwtService::generateToken()
   │                          │  payload: {sub, email, role_id, role}
   │                          │  exp: 1 año
   │  ←──── {token, user} ────┤
   │                          │
   ├─ sessionStorage.setItem()│
   │                          │
   ├─ GET /api/auth ─────────→│ (en cada refresh)
   │  Authorization: Bearer   │
   │  ←──── {user} ───────────┤
```

### 8.2 Formato del Token JWT

```json
// Header
{"typ": "JWT", "alg": "HS256"}

// Payload
{
  "iat": 1717000000,
  "exp": 1748536000,   // +1 año
  "sub": 1,            // ID_Users
  "email": "admin@example.com",
  "role_id": 1,
  "role": "Admin"
}
```

### 8.3 Refresh Token

- Expiración: 7 días
- Generado con `JwtService::generateRefreshToken($userId)`
- Payload incluye `"type": "refresh"`

### 8.4 Protección de Rutas (Frontend)

```typescript
<ProtectedRoute allowedRoles={[1]}>
  <AdminComponent />
</ProtectedRoute>
```

Renderiza `null` o redirige a `/login` si el usuario no tiene el rol requerido.

---

## 10. API REST — Endpoints

### 9.1 Convenciones de Respuesta

```json
// Éxito
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}

// Error
{
  "success": false,
  "message": "Descripción del error",
  "errors": { "campo": ["Error específico"] }
}
```

### 9.2 Endpoints por Módulo

**Auth** (`/api/auth`):
```
POST   /api/auth              { action: "login", email, password }
POST   /api/auth              { action: "register", email, password, ... }
POST   /api/auth              { action: "logout" }
GET    /api/auth              → Obtener usuario actual (header Authorization)
```

**Tickets** (`/api/tickets`):
```
GET    /api/tickets?action=list&status=&office_id=&service_id=&...
GET    /api/tickets?action=single&id=N
GET    /api/tickets?action=stats
POST   /api/tickets?action=create          { subject, office_id, ... }
POST   /api/tickets?action=assign          { ticket_id, technician_ids[] }
POST   /api/tickets?action=comment         { ticket_id, comment }
POST   /api/tickets?action=attach          { ticket_id, file (multipart) }
POST   /api/tickets?action=close           { ticket_id, resolution_notes }
POST   /api/tickets?action=reopen          { ticket_id }
PUT    /api/tickets?action=update          { ticket_id, ... }
DELETE /api/tickets?action=delete          { ticket_id }
```

**Técnicos** (`/api/technicians`):
```
GET    /api/technicians?action=list
GET    /api/technicians?action=single&id=N
GET    /api/technicians?action=grouped-by-service
GET    /api/technicians?action=performance&id=N
POST   /api/technicians?action=create      { first_name, last_name, email, ... }
PUT    /api/technicians?action=update      { id, ... }
PUT    /api/technicians?action=update-status { id, status }
DELETE /api/technicians?action=deactivate  { id }
```

**Dashboard** (`/api/dashboard`):
```
GET    /api/dashboard?action=stats
GET    /api/dashboard?action=recent-tickets
```

**Tablero Público** (`/api/public-board`):
```
GET    /api/public-board?action=init       → Estado completo
GET    /api/public-board?action=poll&since=ISO8601 → Actualizaciones incrementales
GET    /api/public-board?action=stream     → SSE (Server-Sent Events)
```

**Reportes** (`/api/reports`):
```
GET    /api/reports?action=general&date_from=&date_to=
GET    /api/reports?action=by-office&office_id=N
GET    /api/reports?action=by-priority
GET    /api/reports?action=by-service
GET    /api/reports?action=response-times
GET    /api/reports?action=technician-workload&technician_id=N
GET    /api/reports?action=weekly&week_start=
```

**Proxy SIFA** (`/api/bienes`, `/api/unidades`):
```
GET    /api/bienes?search=codigo    → Proxy a XAMPP:8012/bienes/bienes.php
GET    /api/unidades?search=nombre  → Proxy a XAMPP:8012/bienes/unidades.php
```

---

## 11. Integración con SIFA (Bienes)

### 10.1 Arquitectura del Proxy

El frontend web tiene un proxy en CRA (`setupProxy.js`) que redirige las requests a XAMPP en puerto `8012`. El backend PHP también tiene un proxy directo en `public/index.php` (rutas `/api/bienes` y `/api/unidades`).

```
Frontend React (3000)
  └→ setupProxy.js
       └→ http://localhost:8012/bienes/bienes.php
  └→ Alternativa: API PHP (8000)
       └→ proxy vía file_get_contents → http://127.0.0.1:8012/bienes/bienes.php
```

### 10.2 Cache

Tabla `bienes_cache` en MySQL para almacenar respuestas de SIFA y reducir llamadas.

---

## 12. Tiempo Real (SSE y Polling)

### 11.1 Tablero Público

El tablero público usa **polling** (cada 5 segundos) como mecanismo principal de actualización:

```
init → GET /api/public-board?action=init
        Obtiene estado completo (tickets activos, técnicos, stats)

poll → GET /api/public-board?action=poll&since={server_time}
        Obtiene solo cambios desde el último timestamp
        Devuelve: new_tickets[], updated_tickets[], closed_tickets[],
                  new_assistance[], technicians_grouped, stats
```

También existe un endpoint SSE (`action=stream`) implementado, pero el frontend usa polling.

### 11.2 Eventos SSE

El endpoint SSE emite estos eventos:

| Evento | Disparador |
|---|---|
| `new_ticket` | Nuevo ticket creado |
| `technician_status` | Cambio de estado de técnico |
| `lunch_started` | Inicio de bloque de almuerzo |
| `lunch_ended` | Fin de bloque de almuerzo |
| `assistance_request` | Nueva solicitud de asistencia |
| `ticket_closed` | Ticket cerrado |
| `stats_updated` | Cambios en contadores de stats |
| `keepalive` | Cada 15s si no hay actividad |

---

## 13. Patrones y Convenciones

### 12.1 Código Backend

- **strict_types**: Todos los archivos PHP usan `declare(strict_types=1)`
- **Sin namespaces** en la mayoría de modelos/controladores (excepto `App\Services`, `App\Middleware`)
- **Carga manual**: `require_once` para cada archivo (sin autoloader)
- **Respuestas**: Siempre `echo json_encode(...)` con `success`, `data`, `message`
- **Errores**: `try/catch` global con `http_response_code(500)` y mensaje
- **Conexión DB**: Singleton vía `Database::getConnection()` (PDO)

### 12.2 Código Frontend

- **TypeScript estricto**: Interfaces para props, types para respuestas API
- **Componentes funcionales**: Sin clases (React.FC)
- **Estilos**: CSS Modules con variables CSS para temas
- **API**: Servicio centralizado `api.ts` con métodos estáticos
- **Estado**: Context + useReducer para auth, props para el resto

### 12.3 Código Móvil

- **File-based routing**: expo-router con layouts anidados
- **Estado global**: Zustand para auth, ticket, toast
- **Server state**: TanStack React Query con queries y mutations
- **Formularios**: react-hook-form + zod para validación
- **Nombres de archivos**: PascalCase para componentes, camelCase para servicios/utilerías

---

## 14. Configuración del Entorno

### 13.1 Backend (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tickets_system
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change-this-secret-in-production-min-32-chars!!
```

### 13.2 Frontend (.env)

```env
HOST=0.0.0.0
PORT=3000
REACT_APP_ENV=development
GENERATE_SOURCEMAP=false
DISABLE_ESLINT_PLUGIN=true
```

### 13.3 Inicio Rápido

```bash
# 1. Base de datos
mysql -u root -p < tickets-backend/database.sql

# 2. Backend (PHP Built-in Server)
cd tickets-backend
php -S 0.0.0.0:8000 router.php

# 3. Frontend Web
cd tickets-frontend
npm install
npm start

# 4. App Móvil
cd tickets-App
npm install
npx expo start
```

### 13.4 Usuarios de Prueba

| Email | Contraseña | Rol |
|---|---|---|
| `admin@example.com` | `password123` | Admin (1) |
| `tec1@example.com` | `password123` | Técnico (2) |
| `tec2@example.com` | `password123` | Técnico (2) |
| `jefe1@example.com` | `password123` | Jefe (3) |
| `jefe2@example.com` | `password123` | Jefe (3) |
| `auditor@example.com` | `password123` | Auditor (4) |

---

## 15. Despliegue

### 14.1 Producción (Apache)

```apache
<VirtualHost *:80>
    ServerName tickets.municipio.gob.ve
    DocumentRoot "/var/www/tickets-backend/public"
    
    <Directory "/var/www/tickets-backend/public">
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>
</VirtualHost>
```

### 14.2 Variables de Entorno en Producción

Configurar en Apache (VirtualHost) o php-fpm pool:
```apache
SetEnv DB_HOST localhost
SetEnv DB_PORT 3306
SetEnv DB_NAME tickets_system
SetEnv DB_USER tickets_user
SetEnv DB_PASSWORD contraseña_segura
SetEnv JWT_SECRET clave-secreta-muy-segura-de-32-caracteres!!
```

### 14.3 Frontend en Producción

```bash
cd tickets-frontend
npm run build
# Copiar build/ al servidor web (Nginx/Apache)
```

### 14.4 App Móvil en Producción

```bash
cd tickets-App
npx expo build:android  # APK/AAB
npx expo build:ios      # IPA (requiere macOS)
```

---

## 16. Solución de Problemas Comunes

### 15.1 Error "No se pudo conectar con el servicio de bienes"

**Causa**: XAMPP no está corriendo en puerto 8012.
**Solución**: Iniciar XAMPP Apache en puerto 8012, verificar que los archivos `bienes.php` y `unidades.php` existen.

### 15.2 Error "missing driver PDO MySQL"

**Causa**: El PHP ejecutándose no tiene `pdo_mysql` habilitado.
**Solución**: Usar el PHP de XAMPP: `C:\xampp\php\php.exe -S 0.0.0.0:8000 router.php`
O editar `php.ini`: `extension=pdo_mysql`

### 15.3 Token JWT inválido al recargar

**Causa**: El frontend guarda el token en `sessionStorage` pero el backend lo rechaza.
**Solución**: Verificar que el `.env` tenga `JWT_SECRET` correcto y que coincida entre sesiones.

### 15.4 CORS Errors

El backend tiene CORS dinámico: permite cualquier origen del mismo host. Si el frontend está en un puerto diferente y el backend no reconoce el origen, agregarlo a `$allowedOrigins` en `public/index.php`.

### 15.5 El tablero público no muestra técnicos

- Verificar que los técnicos tengan status `Disponible`, `Ocupado` o `Almuerzo`
- Los técnicos con status `Inactivo` o `Fuera de Servicio` están excluidos del tablero público
- Verificar que tengan asignación activa en `Technicians_Service` con `Status = 'Activo'`

---

## Apéndice A: Diagrama de Base de Datos

Ver `database-scripts/diagrama-er.html` — Diagrama ER interactivo con D3.js (25 tablas, 10 grupos de color).

## Apéndice B: Diccionario de Datos

Ver `database-scripts/diccionario-de-datos.md` — Documentación columna por columna de todas las tablas.

## Apéndice C: Guía de Red

Ver `NETWORK-CHANGE-GUIDE.md` — Guía detallada para cambiar configuraciones de red/IP en despliegues municipales.
