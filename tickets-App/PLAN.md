# Plan de Desarrollo: App Móvil — Sistema de Gestión de Tickets (Alcaldía)

## 1. Stack Tecnológico

### Frontend (Expo / React Native)
| Capa | Tecnología |
|------|-----------|
| Framework | **Expo SDK 54** (React Native 0.81.5, React 19.1) |
| Lenguaje | **TypeScript 5.9** estricto |
| Navegación | **expo-router** (file-based routing, tabs + stack) |
| HTTP Client | **fetch** nativo (misma firma que el frontend web) |
| Auth State | **React Context** + **AsyncStorage** (token persistente) |
| Notificaciones Push | **expo-notifications** (FCM/APNs) |
| Almacenamiento Local | **AsyncStorage** (settings, draft tickets) |
| Mapas (opcional) | **react-native-maps** (ubicación de oficinas) |
| Iconos | **@expo/vector-icons** (MaterialIcons / Ionicons) |

### Backend (PHP Existente — Reutilización)
| Capa | Estado |
|------|--------|
| API REST | **Ya implementada** en `tickets-backend/` — se reutiliza tal cual |
| Autenticación | `POST /api/auth` → JWT (HS256) — misma lógica que web |
| Endpoints Tickets | `GET/POST/PUT /api/tickets` — ya funcionales |
| Endpoints Técnicos | `GET /api/technicians`, `GET /api/technicians/...` — ya funcionales |
| Notificaciones | `GET /api/notifications` — ya implementado |
| Auditoría | `GET /api/audit` — solo para Admin |
| Reportes | `GET /api/weekly-report`, `GET /api/technician-reports` — ya implementados |
| CORS | **Requiere agregar origen de la app** (scheme `tickets-app://` o IP/dominio de desarrollo) |
| SSE (tiempo real) | Servidor SSE en puerto `:8001` — útil para notificaciones en vivo |

> **No se escribe nuevo backend.** Toda la lógica de negocio, modelos y controladores PHP ya existen. La app móvil consume los mismos endpoints que el frontend web.

---

## 2. Roles y Permisos

| Rol | Código | ID | Acceso en App |
|-----|--------|----|---------------|
| **ADMIN** | `SUPER_ADMIN` | 1 | Gestión global: usuarios, técnicos, tickets, reportes, auditoría |
| **TECNICO** | `TECHNICIAN` | 2 | Dashboard técnico: ver/actualizar tickets asignados, comentar, cerrar |
| **SOLICITANTE** | `BOSS/REQUESTER` | 3 | Crear tickets, seguimiento, historial |

> Según CONTEXT.md, el ciudadano **no se loguea**. Solo personal interno autenticado (`is_system_user = TRUE`).

---

## 3. Prioridad de Desarrollo

### Fase 1 — Técnicos (ALTA PRIORIDAD)
La app se enfoca primero en el **Técnico de campo** que necesita:
- Notificaciones push cuando le asignan un ticket
- Ver sus tickets asignados en tiempo real
- Actualizar estado del ticket (En Proceso → Resuelto)
- Agregar comentarios con fotos
- Ver su perfil / disponibilidad
- Cerrar tickets con notas de resolución

### Fase 2 — Solicitantes (MEDIA PRIORIDAD)
- Login con rol Solicitante (Jefe/Coordinador)
- Crear tickets nuevos
- Ver estado de tickets creados
- Historial de solicitudes

### Fase 3 — Admin (BAJA PRIORIDAD)
- Gestión básica de usuarios y técnicos
- Dashboard con métricas
- Reportes descargables

---

## 4. Arquitectura de la App

### 4.1 Estructura de Archivos

```
tickets-App/
├── app/                          # expo-router pages
│   ├── _layout.tsx               # Root layout (auth gate + providers)
│   ├── (auth)/                   # Auth group (no tab bar)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Main tabs (authenticated)
│   │   ├── _layout.tsx           # Tab navigator por rol
│   │   ├── technician/
│   │   │   ├── _layout.tsx       # Stack: Tickets → Comentarios
│   │   │   ├── index.tsx         # Lista de tickets asignados (inbox)
│   │   │   ├── [id].tsx          # Detalle del ticket + comentarios
│   │   │   └── profile.tsx       # Perfil / disponibilidad
│   │   ├── requester/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Mis tickets
│   │   │   ├── new.tsx           # Crear ticket
│   │   │   └── [id].tsx          # Detalle / seguimiento
│   │   ├── admin/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx         # Dashboard métricas
│   │   │   ├── tickets.tsx       # Gestión de tickets
│   │   │   ├── technicians.tsx   # Gestión de técnicos
│   │   │   └── users.tsx         # Gestión de usuarios
│   │   └── settings.tsx          # Settings / logout (compartido)
│   └── +not-found.tsx
│
├── src/
│   ├── services/
│   │   ├── api.ts                # Cliente HTTP (fetch con JWT)
│   │   ├── auth.ts               # AuthContext + proveedor
│   │   └── notifications.ts      # Push notifications setup
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Estado de autenticación
│   │   └── NotificationContext.tsx # Estado de notificaciones
│   ├── types/
│   │   ├── ticket.ts             # Interfaces de Ticket
│   │   ├── user.ts               # Interfaces de User / Technician
│   │   └── api.ts                # Tipos de respuesta API
│   ├── components/
│   │   ├── technician/
│   │   │   ├── TicketCard.tsx    # Card de ticket en lista
│   │   │   ├── TicketDetail.tsx  # Detalle expandido
│   │   │   ├── CommentList.tsx   # Lista de comentarios
│   │   │   ├── CommentInput.tsx  # Input + cámara para adjuntar
│   │   │   └── StatusBadge.tsx   # Badge de estado con color
│   │   ├── requester/
│   │   │   ├── TicketForm.tsx    # Formulario de creación
│   │   │   ├── ServicePicker.tsx # Selector de servicio/problema
│   │   │   └── OfficePicker.tsx  # Selector de oficina
│   │   ├── admin/
│   │   │   ├── StatsCard.tsx     # Tarjeta de métrica
│   │   │   └── UserList.tsx      # Lista de usuarios
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── Loading.tsx
│   ├── hooks/
│   │   ├── useAuth.ts            # Hook shortcut para AuthContext
│   │   ├── useTickets.ts         # Fetch + cache de tickets
│   │   └── useNotifications.ts   # Push notification handling
│   └── constants/
│       ├── colors.ts             # Paleta institucional
│       ├── roles.ts              # Mapeo de roles
│       └── config.ts             # URLs de API / SSE
│
├── assets/                       # Iconos, splash, fuentes
├── app.json                      # Expo config (ya existe)
├── package.json                  # (ya existe)
└── tsconfig.json                 # (ya existe)
```

### 4.2 Flujo de Navegación

```
App (_layout.tsx)
├── [No Token] → (auth)/
│   └── login.tsx → POST /api/auth → JWT almacenado
│
├── [Token Válido] → (tabs)/
│   │
│   ├── Rol TECHNICIAN →
│   │   Tab 1: Inbox (lista de tickets asignados)
│   │   Tab 2: Perfil (disponibilidad, horario)
│   │   Stack: TicketCard → TicketDetail (comentarios + acciones)
│   │
│   ├── Rol REQUESTER →
│   │   Tab 1: Mis Tickets (lista de tickets creados)
│   │   Tab 2: Nuevo Ticket (formulario de creación)
│   │   Stack: TicketCard → TicketDetail (solo lectura + seguimiento)
│   │
│   └── Rol ADMIN →
│       Tab 1: Dashboard (métricas globales)
│       Tab 2: Tickets (gestión + asignación)
│       Tab 3: Técnicos (CRUD)
│       Tab 4: Usuarios (CRUD)
│
└── Settings (logout, tema, acerca de)
```

### 4.3 Mocks Iniciales para Desarrollo Offline

Para desarrollar sin depender del backend en cada cambio, se creará un **API mock** que devuelve datos de prueba:

- `src/services/__mocks__/tickets.ts` — tickets de prueba para técnico
- `src/services/__mocks__/auth.ts` — login simulado con tokens falsos
- `src/services/__mocks__/users.ts` — usuarios de prueba

El `api.ts` detectará `__DEV__` y usará mocks automáticamente cuando el backend no esté disponible, switcheando a real API cuando detecte conectividad.

---

## 5. Fase 1 — Desarrollo Detallado (Técnicos)

### 5.1 Configuración Inicial

```
npm install expo-router expo-linking expo-constants expo-notifications
npm install @react-native-async-storage/async-storage
npm install react-native-safe-area-context react-native-screens
npm install expo-image-picker expo-file-system    # para fotos en comentarios
```

- Configurar `app.json` con scheme `tickets-app`
- Reemplazar `index.ts` para usar `expo-router` en vez de `App.tsx`
- Crear carpetas `app/`, `src/` y migrar estructura

### 5.2 Autenticación

**API:** `POST /api/auth` con `{ action: "login", email, password }`

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "id": 2,
      "email": "tech1@alcaldia.gob",
      "full_name": "Carlos Técnico",
      "fk_role": 2,
      "role_name": "Tecnico"
    }
  }
}
```

**En app:**
1. `AuthContext.tsx` — `useReducer` con persistencia en AsyncStorage
2. Al iniciar app, leer token de AsyncStorage → validar con `GET /api/auth` → restaurar sesión o redirigir a login
3. Logout → limpiar AsyncStorage + cancelar suscripciones push

### 5.3 Pantalla Principal del Técnico (Inbox)

**API:** `GET /api/tickets?action=technician-tickets`

**Elementos:**
- **Header** con foto + nombre + badge de estado (Disponible/Ocupado/Inactivo)
- **Tabs horizontales:** Pendientes | En Proceso | Resueltos
- **Lista infinita** de `TicketCard` con:
  - Código de ticket (TTT-000001)
  - Nombre del ciudadano/oficina
  - Prioridad (badge color: 🔴 Alta / 🟡 Media / 🟢 Baja)
  - Servicio (Redes, Soporte, Programación)
  - Tiempo transcurrido desde creación
  - Icono de adjuntos si tiene fotos
- **Pull-to-refresh** para recargar lista
- **Badge** en tab con conteo de tickets pendientes

### 5.4 Detalle del Ticket

**API:** `GET /api/tickets?id=XXX`

**Pantalla:**
- Información completa: código, oficina, ciudadano, servicio, problema, descripción
- Timeline de eventos (creación, asignaciones, cambios de estado)
- Comentarios (lista cronológica con fotos)
- Input para agregar comentario + botón de cámara
- **Acciones:**
  - "Tomar Ticket" (cambiar a En Proceso)
  - "Marcar como Resuelto" (solicita notas de resolución)
  - "Solicitar Asistencia" (modal explicando problema)

### 5.5 Actualización de Estado

**API:** `POST /api/tickets?action=update-status`

```json
{
  "ticket_id": 1,
  "status": "En Proceso",
  "notes": "Inicio revisión de red en oficina central"
}
```

**Flujo UX:**
1. Técnico presiona "Tomar Ticket" → ConfirmActionSheet → `PUT /api/tickets`
2. Feedback visual inmediato (optimistic update)
3. Ticket se mueve a la pestaña "En Proceso" automáticamente
4. Sonido háptico de confirmación

### 5.6 Comentarios con Fotos

**API:** `POST /api/tickets?action=comment` (multipart/form-data con archivos)

- Usar `expo-image-picker` para seleccionar foto de galería o tomar con cámara
- Comprimir imagen antes de subir (ImageManipulator)
- Upload como FormData (mismo formato que web)
- Feedback con barra de progreso

### 5.7 Notificaciones Push

**Arquitectura de Notificaciones:**

```
Backend PHP (existente)
  └── NotificationService.php
        └── create(user_id, type, message, metadata)
              └── INSERT INTO Notifications

App Móvil
  ├── expo-notifications (push token)
  ├── Polling cada 30s → GET /api/notifications?unread=true
  └── (Futuro) SSE desde :8001 para instantaneidad
```

**Flujo:**
1. Al login, registrar push token con Expo → enviar a backend (`POST /api/users?action=register-push-token`)
2. Backend almacena token en columna `push_token` de `Users` (nuevo campo)
3. Cuando se asigna un técnico → `NotificationService` crea notificación + envía push via Expo Push API
4. App recibe notificación → muestra alerta local + actualiza lista de tickets
5. Al abrir notificación → deep link al detalle del ticket

**Configuración:**
```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#1a365d"
        }
      ]
    ]
  }
}
```

**Mecanismo de polling como fallback:**
- `NotificationContext.tsx` inicia intervalo de 30s cuando app está en foreground
- `GET /api/notifications?unread=true&since={lastCheck}`
- Al recibir nuevas, dispara notificación local con `expo-notifications`
- Cuando app está en background, Expo Notifications maneja el push nativo

### 5.8 Perfil del Técnico

**API:** `GET /api/users?action=technician-profile`

**Pantalla:**
- Foto + nombre completo
- Estado actual (con switch para cambiar)
- Horario de trabajo (días y horas)
- Bloque de almuerzo
- Servicios que cubre
- Métricas personales (tickets resueltos hoy/semana/mes, tiempo promedio)
- Botón "Cambiar Contraseña"

### 5.9 Indicador de Conectividad

- `NetInfo` de `@react-native-community/netinfo`
- Banner "Sin conexión" cuando no hay internet
- Cola de acciones offline (comentarios pendientes) para enviar cuando vuelva la conexión

---

## 6. API Reference (Endpoints a Consumir)

### Autenticación
| Método | Endpoint | Body | Respuesta |
|--------|----------|------|-----------|
| POST | `/api/auth` | `{ action: "login", email, password }` | `{ success, data: { token, user } }` |
| GET | `/api/auth` | — (Authorization header) | `{ success, data: { user } }` |
| POST | `/api/auth` | `{ action: "logout" }` | `{ success }` |

### Tickets (Técnico)
| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/tickets?action=technician-tickets` | Tickets asignados al técnico autenticado |
| GET | `/api/tickets?id=X` | Detalle de ticket individual |
| POST | `/api/tickets?action=update-status` | Cambiar estado + notas |
| POST | `/api/tickets?action=comment` | Agregar comentario (multipart) |
| POST | `/api/tickets?action=assign` | Auto-asignación (tomar ticket) |
| POST | `/api/assignments` | Asignación manual |

### Notificaciones
| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/notifications` | Listar notificaciones del usuario |
| GET | `/api/notifications?unread=true` | Solo no leídas |
| PUT | `/api/notifications?id=X` | Marcar como leída |
| PUT | `/api/notifications?action=mark-all-read` | Marcar todas leídas |

### Perfil y Usuario
| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/users?action=technician-profile` | Perfil completo del técnico |
| PUT | `/api/users?action=change-password` | Cambiar contraseña |
| POST | `/api/users?action=register-push-token` | Registrar token Expo push |

### Servicios y Catálogo
| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/services` | Lista de servicios TI |
| GET | `/api/service?action=problems&service_id=X` | Catálogo de problemas por servicio |

### Oficinas
| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/api/office` | Lista de oficinas (para solicitantes) |

---

## 7. Plan de Implementación por Sprint

### Sprint 1 — Base + Auth (3-5 días)
- [ ] Migrar proyecto a `expo-router` (file-based routing)
- [ ] Implementar `api.ts` con fetch + JWT interceptor
- [ ] `AuthContext` con persistencia AsyncStorage
- [ ] Pantalla de Login (email + password)
- [ ] Pantalla de Registro (solo admin)
- [ ] `(auth)/` layout con redirect si hay sesión
- [ ] `(tabs)/_layout.tsx` con role-based tab routing
- [ ] Mock API para desarrollo offline

### Sprint 2 — Inbox del Técnico (3-5 días)
- [ ] Pantalla principal con tabs (Pendientes/En Proceso/Resueltos)
- [ ] `TicketCard` componente
- [ ] Pull-to-refresh + carga infinita
- [ ] Filtros (prioridad, servicio, búsqueda)
- [ ] Badge de conteo en tabs
- [ ] Indicador de conectividad (NetInfo)

### Sprint 3 — Detalle y Acciones del Ticket (3-5 días)
- [ ] `TicketDetail` con info completa
- [ ] Timeline de eventos
- [ ] Comentarios con fotos (expo-image-picker)
- [ ] Acciones: Tomar ticket, Resolver, Solicitar asistencia
- [ ] Optimistic updates + feedback visual
- [ ] ConfirmActionSheet para acciones destructivas

### Sprint 4 — Notificaciones Push (3-4 días)
- [ ] Configurar `expo-notifications` (canales, permisos)
- [ ] Registro de push token en backend
- [ ] Backend: columna `push_token`, integración Expo Push API
- [ ] Polling de notificaciones (fallback 30s)
- [ ] Deep linking desde notificación al ticket
- [ ] Notificación local al recibir nuevo ticket

### Sprint 5 — Perfil y Ajustes del Técnico (2-3 días)
- [ ] Pantalla de perfil con datos del técnico
- [ ] Cambio de estado disponible/ocupado
- [ ] Horario y servicios
- [ ] Cambio de contraseña
- [ ] Logout + limpiar datos locales

### Sprint 6 — Solicitante (3-4 días) [MEDIA PRIORIDAD]
- [ ] Tab "Mis Tickets" con lista de tickets creados
- [ ] Tab "Nuevo Ticket": formulario completo
- [ ] Selector de servicio → problema → oficina
- [ ] Validación de campos
- [ ] Confirmación + feedback al crear

### Sprint 7 — Admin (3-4 días) [BAJA PRIORIDAD]
- [ ] Dashboard con métricas globales (cards)
- [ ] Gestión de tickets (asignar técnicos)
- [ ] Lista de técnicos con estado
- [ ] CRUD básico de usuarios

### Sprint 8 — Pulido y QA (2-3 días)
- [ ] Manejo de errores global (toast/snackbar)
- [ ] Pantallas de loading y empty state
- [ ] Pruebas en dispositivo físico (Android + iOS)
- [ ] Ajustes de rendimiento (FlatList optimizada, lazy loading)
- [ ] Pruebas de conectividad offline
- [ ] Build de prueba con `eas build`

---

## 8. Datos de Prueba (Mocks)

### Técnico de prueba
```json
{
  "id": 2,
  "email": "tech1@alcaldia.gob",
  "password": "password123",
  "full_name": "Carlos Técnico",
  "role_id": 2,
  "role_name": "Tecnico",
  "status": "Disponible",
  "services": ["Redes", "Soporte Técnico"]
}
```

### Solicitante de prueba
```json
{
  "id": 3,
  "email": "req1@alcaldia.gob",
  "password": "password123",
  "full_name": "María Solicitante",
  "role_id": 3,
  "role_name": "Jefe",
  "office": "Dirección de Administración"
}
```

### Admin de prueba
```json
{
  "id": 1,
  "email": "admin@alcaldia.gob",
  "password": "password123",
  "full_name": "Admin Sistema",
  "role_id": 1,
  "role_name": "Admin"
}
```

---

## 9. Cambios Necesarios en Backend

| # | Cambio | Archivo | Prioridad |
|---|--------|---------|-----------|
| 1 | Agregar columna `push_token` en `Users` (VARCHAR(255) NULL) | DB migration | **Alta** |
| 2 | Endpoint `POST /api/users?action=register-push-token` en `UserController` | `UserController.php` | **Alta** |
| 3 | Servicio para enviar push via Expo Push API (`https://exp.host/--/api/v2/push/send`) | Nuevo `PushService.php` | **Alta** |
| 4 | Integrar PushService en `NotificationService.php` cuando se asigna ticket | `NotificationService.php` | **Alta** |
| 5 | Agregar `tickets-app://` origin en CORS de `index.php` | `public/index.php` | Media |
| 6 | Endpoint `GET /api/notifications?unread=true&since=timestamp` para polling | `NotificationController.php` | Media |
| 7 | Endpoint `PUT /api/notifications?action=mark-all-read` | `NotificationController.php` | Media |
| 8 | Endpoint para auto-asignación de ticket por técnico | `TicketController.php` (si no existe) | Baja |

---

## 10. URLs de Desarrollo

| Servicio | URL |
|----------|-----|
| Backend API | `http://192.168.1.6:8000` |
| SSE (eventos en vivo) | `http://192.168.1.6:8001` |
| App en Expo Go (QR) | `exp://192.168.1.6:8081` |
| API Base en config | `http://192.168.1.6:8000/api` |

> Cuando cambie la IP de red, seguir `NETWORK-CHANGE-GUIDE.md` para actualizar CORS y URLs.

---

## 11. Dependencias npm a Instalar (por fase)

### Base (Sprint 1)
```
expo-router
expo-linking
expo-constants
@react-native-async-storage/async-storage
react-native-safe-area-context
react-native-screens
@react-native-community/netinfo
```

### Técnico (Sprints 2-5)
```
expo-notifications
expo-image-picker
expo-file-system
expo-haptics
@react-native-community/datetimepicker
```

### Solicitante (Sprint 6)
```
(ninguna adicional — reutiliza componentes existentes)
```

### Admin (Sprint 7)
```
react-native-chart-kit    # gráficos de métricas
react-native-svg          # dependencia de chart-kit
```

---

## 12. Consideraciones Técnicas

### FlatList vs ScrollView
- Usar **FlatList** con `windowSize={5}` y `getItemLayout` para listas de tickets (virtualización nativa)
- Evitar `ScrollView` anidado — usar `FlatList` para comentarios dentro de detalle

### Optimistic Updates
- Al cambiar estado de ticket, actualizar UI inmediatamente antes de respuesta del servidor
- Revertir en caso de error (con feedback visual)

### Seguridad
- Token JWT en AsyncStorage (no SecureStore por simplicidad; evaluar `expo-secure-store` en producción)
- Cifrado de comunicaciones via HTTPS en producción
- No almacenar contraseñas en local
- Logout automático si token expira (401 interceptor)

### Performance
- Imágenes comprimidas al subir (max 1024px width)
- Cache de respuestas API con `AsyncStorage` (TTL 5 min)
- Lazy loading de pantallas admin (baja prioridad)

### Offline First
- Cachear última respuesta de tickets en AsyncStorage
- Mostrar datos cacheados si no hay conexión
- Cola de comentarios pendientes para enviar cuando vuelva conexión
- Badge "Pendiente de envío" en comentarios en cola

---

## 13. Criterios de Aceptación por Fase

### Fase 1 (Técnicos) — Completado cuando:
- [ ] Técnico puede iniciar sesión con credenciales del sistema
- [ ] Ve lista de sus tickets asignados con estados correctos
- [ ] Puede cambiar estado (Pendiente → En Proceso → Resuelto)
- [ ] Agrega comentarios con fotos a tickets
- [ ] Recibe notificación push cuando le asignan un ticket
- [ ] Ve su perfil con disponibilidad y horario
- [ ] Cambia su contraseña
- [ ] App funciona offline con datos cacheados

### Fase 2 (Solicitantes) — Completado cuando:
- [ ] Solicitante inicia sesión
- [ ] Crea tickets nuevos con selección de servicio/problema/oficina
- [ ] Ve estado de sus tickets creados
- [ ] Recibe notificación cuando su ticket cambia de estado

### Fase 3 (Admin) — Completado cuando:
- [ ] Admin ve dashboard con métricas globales
- [ ] Admin gestiona tickets (asigna técnicos)
- [ ] Admin ve lista de técnicos y usuarios
- [ ] Admin puede crear usuarios

---

## 14. Testing

| Tipo | Herramienta | Alcance |
|------|-------------|---------|
| Unitario | Jest + React Native Testing Library | Componentes UI, hooks, servicios |
| Integración | Jest | Flujo auth, creación de tickets |
| Manual | Expo Go (físico) | UX, navegación, notificaciones |
| E2E (futuro) | Detox / Maestro | Flujos críticos completos |

---

## 15. Build y Distribución

### Desarrollo
```bash
npx expo start              # Metro bundler + QR para Expo Go
npx expo start --tunnel     # Para probar en físico sin misma red
```

### Producción
```bash
npm install -g eas-cli
eas build --platform android     # APK/AAB
eas build --platform ios         # IPA (requiere Apple Developer)
eas submit --platform android    # Google Play Store
eas submit --platform ios        # App Store Connect
```
