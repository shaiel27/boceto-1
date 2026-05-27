# Sistema de Gestión de Tickets

Sistema integral para la gestión de solicitudes de soporte técnico de la Alcaldía de San Cristóbal.

## Arquitectura

```
boceto-1/
├── tickets-backend/     API REST PHP (backend)
├── tickets-frontend/    Aplicación web React (frontend)
├── tickets-App/         Aplicación móvil React Native / Expo
├── database-scripts/    Scripts SQL de esquema y datos
├── docs/                Documentación del sistema
└── .agents/             Configuración de skills de IA
```

## Requisitos

- **PHP** 8.1+ con extensiones `pdo_mysql`, `mbstring`
- **MySQL** 8.0+ / MariaDB 10.5+
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
php -S localhost:8000 -t public
```

El backend corre en `http://localhost:8000`. Sin autenticación, algunos endpoints requieren token JWT.

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

Se abre en `http://localhost:3000`.

### 4. App móvil (Expo)

```bash
cd tickets-App
npm install
npx expo start
```

## Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@alcaldia.gob | password123 | Admin |
| tech1@alcaldia.gob | password123 | Técnico |
| tech2@alcaldia.gob | password123 | Técnico |
| jefe1@alcaldia.gob | password123 | Jefe |
| jefe2@alcaldia.gob | password123 | Jefe |

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

## Roles del sistema

- **Admin** — Acceso completo al sistema
- **Técnico** — Visualiza y gestiona tickets asignados
- **Jefe** — Crea solicitudes desde su oficina

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

## Licencia

Uso interno — Alcaldía de San Cristóbal.
