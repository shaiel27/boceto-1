# Sistema de Gestión de Tickets

Sistema integral para la gestión de solicitudes de soporte técnico de la Alcaldía de San Cristóbal.

## Arquitectura

```
boceto-1/
├── tickets-backend/        API REST PHP (backend, puerto 8000)
│   ├── src/Services/       Servicios
│   ├── src/controllers/    Controladores
│   ├── src/models/         Modelos (ServiceRequest, etc.)
│   ├── public/index.php    Router único + proxy bienes
│   └── router.php          Entry point para PHP built-in server
├── tickets-frontend/       Aplicación web React (puerto 3000)
│   ├── src/components/     Componentes por rol
│   ├── src/services/       API clients (bienesApi, api)
│   └── src/setupProxy.js   Proxy CRA → XAMPP para bienes
├── tickets-App/            App móvil React Native / Expo
│   ├── app/(tabs)/         Pantallas (admin, requester, technician)
│   └── src/services/       API clients + bienesService
├── database-scripts/       SQL de esquema y datos
├── docs/                   Documentación
└── .agents/                Skills de IA
```

### Dependencia externa: SIFA (XAMPP, puerto 8012)

El sistema consulta bienes patrimoniales desde la API SIFA alojada en XAMPP:

```
tickets-backend (8000) ──proxy──→ XAMPP/SIFA (8012)
                                  └── /bienes/bienes.php?query=...
                                  └── /bienes/unidades.php?tabla=...
```

El frontend web en desarrollo usa `setupProxy.js` para acceder a SIFA directamente en `localhost:8012`. El backend PHP actúa como proxy para la app móvil y para producción web.

## Requisitos

- **PHP** 8.1+ con extensiones `pdo_mysql`, `mbstring`
- **MySQL** 8.0+ / MariaDB 10.5+
- **XAMPP** con Apache en puerto 8012 (para API SIFA de bienes)
- **Node.js** 18+ (para frontend y app móvil)
- **Composer** (opcional, el backend no lo requiere)

## Instalación rápida

### 1. Base de datos

```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS tickets_system;
USE tickets_system;

-- Ejecutar esquema
SOURCE tickets-backend/database.sql;
```

El archivo `database.sql` incluye el esquema completo y datos de prueba. También puedes usar `datos_insercion.sql` para reiniciar solo los datos semilla con contraseñas hasheadas.

> **Contraseña por defecto:** `password123` (hash bcrypt)

### 2. Backend (PHP)

```bash
cd tickets-backend
php -S 0.0.0.0:8000 router.php
```

El backend corre en `http://localhost:8000`. Usa `router.php` (no `-t public`) para que el proxy de bienes y el enrutamiento funcionen correctamente.

Variables de entorno (`.env`):

| Variable | Valor por defecto |
|---|---|
| DB_HOST | localhost |
| DB_PORT | 3306 |
| DB_NAME | tickets_system |
| DB_USER | root |
| DB_PASSWORD | (vacío) |
| JWT_SECRET | change-this-secret-in-production-min-32-chars!! |

### 3. Frontend web (React)

```bash
cd tickets-frontend
npm install
npm start
```

Se abre en `http://localhost:3000`. El proxy de desarrollo (`setupProxy.js`) redirige `/api/bienes` y `/api/unidades` a XAMPP en `localhost:8012`.

### 4. App móvil (Expo)

```bash
cd tickets-App
npm install
npx expo start
```

La app se conecta al backend vía `API_BASE_URL` definido en `src/constants/config.ts`. Ajusta la IP según tu red local.

## Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@alcaldia.gob | password123 | Admin |
| tech1@alcaldia.gob | password123 | Técnico |
| tech2@alcaldia.gob | password123 | Técnico |
| jefe1@alcaldia.gob | password123 | Jefe |
| jefe2@alcaldia.gob | password123 | Jefe |
| auditor@alcaldia.gob | password123 | Auditor |

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth | Inicio de sesión |
| GET | /api/tickets | Listar tickets |
| GET | /api/technicians | Listar técnicos |
| GET | /api/office | Listar oficinas |
| GET | /api/analytics | Estadísticas del dashboard |
| GET | /api/public-board | Tablero público |
| GET | /api/notifications | Notificaciones del usuario |
| GET | /api/dashboard | Dashboard administrativo |
| GET | /api/service | Servicios TI |
| GET | /api/assignments | Asignaciones de técnicos |
| POST | /api/users | Crear usuario |
| GET | /api/problem-report | Reporte de problemas |
| GET | /api/weekly-report | Reporte semanal de técnicos |
| GET | /api/bienes | **Proxy a SIFA** — consulta de bienes patrimoniales |
| GET | /api/unidades | **Proxy a SIFA** — unidades administrativas |

### Endpoint de Bienes

Proxy transparente directo a la API SIFA en XAMPP (`127.0.0.1:8012/bienes/bienes.php`). Sin overhead de servidor — la caché se maneja exclusivamente en el frontend:

| Capa | Mecanismo | TTL general | TTL lookups |
|---|---|---|---|
| Web (`bienesApi.ts`) | `Map` en memoria + `findBienByCode` | 5 min | 30 min |
| Móvil (`bienesService.ts`) | `Map` en memoria + `findBienByCode` | 5 min | 30 min |

`findBienByCode` incluye caché negativo (nulls) para códigos no encontrados.

Parámetros: `?query=`, `?page=`, `?limit=`

## Roles del sistema

- **Admin** — Acceso completo al sistema
- **Técnico** — Visualiza y gestiona tickets asignados
- **Jefe** — Crea solicitudes desde su oficina
- **Auditor** — Solo lectura del módulo de auditoría

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Backend | PHP 8+ (sin framework, PDO/MySQL) |
| Frontend web | React 19, TypeScript, React Router v6 |
| App móvil | React Native, Expo SDK 54, Expo Router |
| Base de datos | MySQL |
| Autenticación | JWT (HS256) |
| Tiempo real | SSE (Server-Sent Events) |
| PDF | jsPDF (frontend) |
| Estilos | CSS personalizado + variables CSS |
| Bienes (SIFA) | Proxy PHP → XAMPP, caché en archivos |

## Licencia

Uso interno — Alcaldía de San Cristóbal.
