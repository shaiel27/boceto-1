# Backend - Sistema de Gestión de Tickets Municipal

Backend PHP puro con arquitectura DDD (Domain-Driven Design) para el sistema de gestión de tickets municipal.

## Arquitectura

```
src/
Core/                    # Infraestructura base
Domain/                  # Entidades y reglas de negocio
Infrastructure/         # Implementaciones MySQL
Application/            # Casos de uso
Http/                    # Controllers y Middleware
Services/                # Servicios transversales
```

## Instalación

### Prerrequisitos
- PHP 8.0+
- MySQL 5.7+ / MariaDB 10.3+
- Composer

### Configuración

1. **Instalar dependencias**
```bash
composer install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

3. **Crear base de datos**
```bash
php scripts/setup.php
```

4. **Ejecutar migraciones**
```bash
php scripts/migrate.php
```

5. **Cargar datos de ejemplo**
```bash
php scripts/seed.php
```

## Ejecución

### Servidor de desarrollo
```bash
composer start
# o
php -S localhost:8000 -t public
```

### Producción
Configurar Apache/Nginx para apuntar al directorio `public/` con el siguiente `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuario actual

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear ticket (Jefes)
- `GET /api/tickets/{id}` - Ver ticket
- `POST /api/tickets/{id}/assign` - Asignar técnicos (Admin)
- `PUT /api/tickets/{id}/status` - Cambiar estado (Admin/Técnicos)
- `POST /api/tickets/{id}/comments` - Agregar comentario
- `POST /api/tickets/{id}/attachments` - Subir archivo
- `GET /api/tickets/{id}/timeline` - Ver timeline

### Técnicos
- `GET /api/technicians` - Listar técnicos (Admin)
- `GET /api/technicians/available` - Técnicos disponibles
- `GET /api/technicians/{id}` - Ver técnico
- `PUT /api/technicians/{id}/schedule` - Actualizar horario

### Oficinas
- `GET /api/offices` - Listar oficinas
- `GET /api/offices/{id}` - Ver oficina
- `GET /api/offices/{id}/children` - Oficinas hijas
- `GET /api/offices/{id}/permissions` - Permisos de oficina

### Catálogos
- `GET /api/catalog/services` - Servicios TI
- `GET /api/catalog/problems` - Catálogo de problemas
- `GET /api/catalog/systems` - Sistemas de software

### Reportes (Admin)
- `GET /api/reports/general` - Reporte general
- `GET /api/reports/by-office` - Tickets por oficina
- `GET /api/reports/response-times` - Tiempos de respuesta
- `GET /api/reports/priority` - Tickets de alta prioridad
- `GET /api/reports/monthly` - Evolución mensual
- `GET /api/reports/by-service` - Tickets por servicio

## Roles y Permisos

### Admin (ID: 1)
- Acceso total al sistema
- Gestión de usuarios y técnicos
- Asignación de tickets
- Todos los reportes

### Técnico (ID: 2)
- Ver tickets asignados
- Actualizar estado de tickets
- Agregar comentarios y archivos
- Ver reportes básicos

### Jefe (ID: 3)
- Crear tickets
- Ver tickets propios
- Ver reportes de su oficina

## Tareas Programadas (Cron)

### SLA Check (cada 15 minutos)
```bash
*/15 * * * * /usr/bin/php /path/to/scripts/cron/check_sla.php
```

### Sync Availability (cada hora)
```bash
0 * * * * /usr/bin/php /path/to/scripts/cron/sync_availability.php
```

## Servicios

### NotificationService
- Notificaciones internas en base de datos
- Alertas SLA automáticas
- Notificaciones a administradores

### SLAService
- Cálculo de plazos por prioridad
- Detección de vencimientos
- Estadísticas de cumplimiento

### AuditService
- Log de todas las acciones críticas
- Auditoría de accesos
- Limpieza automática de logs antiguos

### FileUploadService
- Subida segura de archivos
- Validación de tipos MIME
- Almacenamiento fuera de public/

## Seguridad

- JWT para autenticación
- Rate limiting por IP/usuario
- Validación de entrada
- CORS configurado
- Headers de seguridad

## Testing

```bash
# Ejecutar tests
composer test

# Análisis estático
composer analyze
```

## Estructura de Base de Datos

El backend utiliza las siguientes tablas principales:
- `Users`, `Role`, `Boss` - Gestión de usuarios
- `Office` - Estructura organizacional jerárquica
- `Technicians`, `Technician_Schedules`, `Lunch_Blocks` - Gestión de técnicos
- `Service_Request` - Tickets principales
- `Ticket_Technicians`, `Ticket_Comments`, `Ticket_Attachments`, `Ticket_Timeline` - Relaciones de tickets
- `TI_Service`, `Service_Problems_Catalog` - Catálogos
- `Software_Systems`, `Office_Systems` - Sistemas por oficina

## Variables de Entorno

```env
DB_HOST=localhost
DB_NAME=tickets_municipal
DB_USER=root
DB_PASS=

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=86400

DISPLAY_ERRORS=0
TIMEZONE=America/Mexico_City
```

## Logs

- `storage/logs/app.log` - Aplicación
- `storage/logs/error.log` - Errores
- `storage/logs/audit.log` - Auditoría

## Rendimiento

- Optimizado para 100-500 usuarios concurrentes
- Uso de memoria: ~2-5MB por request
- Cache configurable con APCu o Redis
- Índices optimizados en base de datos
