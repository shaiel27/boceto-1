# Sistema de Gestión de Tickets — Alcaldía

Sistema de gestión de tickets de servicio técnico para instituciones municipales. Backend PHP 8.2+ puro, MySQL, frontend React.

## Requisitos

| Componente | Requerido |
|------------|-----------|
| **PHP** | 8.2+ con extensiones `pdo_mysql`, `mbstring` |
| **MySQL** | 5.7+ / MariaDB 10.3+ |
| **Node.js** | 18+ con npm 9+ |
| **XAMPP** (recomendado) | PHP + MySQL integrados en Windows |

## Estructura

```
boceto 1/
├── tickets-backend/          # API PHP (puerto 8000)
│   ├── public/
│   │   ├── index.php         # Front controller (rutas con auth)
│   │   ├── router.php        # Router para php -S (reescritura)
│   │   ├── sse-server.php    # Servidor SSE autónomo (puerto 8001)
│   │   └── api-public-board.php  # Endpoint público (init + stream)
│   ├── src/
│   │   ├── controllers/      # Controladores
│   │   ├── config/           # Config DB, JWT
│   │   ├── Middleware/       # Auth middleware
│   │   └── Services/         # JWT, etc.
│   └── database-scripts/     # Schema SQL y migraciones
├── tickets-frontend/         # SPA React (puerto 3000)
│   └── src/
│       ├── components/       # Componentes React
│       ├── pages/            # Páginas
│       ├── contexts/         # Auth, Theme
│       ├── services/         # API client
│       └── styles/           # CSS variables institucionales
└── database-scripts/         # Migraciones (Lunch_Notifications_Log)
```

## Inicio rápido

### 1. Base de datos

Ejecutar el schema en MySQL:

```
mysql -u root -p < tickets-backend/database-scripts/final-schema.sql
mysql -u root -p < database-scripts/20260522_create_lunch_notifications_log.sql
```

### 2. Backend (2 terminales)

**Terminal A — API principal (puerto 8000):**

```powershell
cd "C:\Users\shaie\OneDrive\Desktop\Pasantias\boceto 1\tickets-backend"
C:\xampp\php\php.exe -S 0.0.0.0:8000 -t public public/router.php
```

**Terminal B — SSE Stream (puerto 8001):**

```powershell
cd "C:\Users\shaie\OneDrive\Desktop\Pasantias\boceto 1\tickets-backend"
C:\xampp\php\php.exe -S 0.0.0.0:8001 -t public public/sse-server.php
```

> **Por qué dos servidores:** `php -S` es single-threaded. La conexión SSE es de larga duración y bloquearía el único hilo. El stream corre en su propio proceso para no interferir con la API.

### 3. Frontend (1 terminal)

**Terminal C — React dev server:**

```powershell
cd "C:\Users\shaie\OneDrive\Desktop\Pasantias\boceto 1\tickets-frontend"
npm install
npm start
```

> El archivo `.env.local` ya está configurado con `REACT_APP_API_BASE=http://localhost:8000` y `REACT_APP_SSE_URL=http://localhost:8001`.

### 4. Verificar

| URL | Descripción |
|-----|-------------|
| `http://localhost:8000/api/public-board?action=init` | Endpoint init (JSON) |
| `http://localhost:8001/api/public-board?action=stream&since=...` | SSE stream |
| `http://localhost:3000/` | App principal (login) |
| `http://localhost:3000/public-board` | Tablero público |

## Producción

En producción usar Apache con `mod_rewrite` y el `.htaccess` incluido en `tickets-backend/`. El SSE funciona sobre Apache sin necesidad de puerto separado (Apache maneja concurrencia nativamente).

Configurar variables de entorno en Apache (`SetEnv` en VirtualHost o `.htaccess`):

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tickets_system
DB_USER=root
DB_PASSWORD=***
JWT_SECRET=cambiar-por-secreto-largo-y-aleatorio
```

Build del frontend para producción:

```powershell
cd tickets-frontend
npm run build
```

Los archivos estáticos se generan en `tickets-frontend/build/` y se sirven desde Apache.

## Purgar logs de notificaciones (cron)

```sql
DELETE FROM Lunch_Notifications_Log WHERE Notification_Date < CURDATE() - INTERVAL 15 DAY;
```

Opcional: crear un evento MySQL o entrada en crontab.

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Backend | PHP 8.2+ (sin framework) |
| Base de datos | MySQL 8 / MariaDB |
| Frontend | React 18 + React Router 6 |
| Estilos | CSS custom properties (variables institucionales) |
| Auth | JWT (stateless) |
| Real-time | Server-Sent Events (SSE) |
| Sonido | Web Audio API |
