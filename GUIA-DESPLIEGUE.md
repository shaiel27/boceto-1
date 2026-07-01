# Guía de Despliegue — Tickets System en XAMPP (Producción)

## 1. Estructura Final en el Servidor

```
C:\xampp\
├── htdocs\
│   ├── tickets-backend\     → Código PHP de la API
│   │   └── public\
│   │       └── index.php
│   └── tickets\             → Build estático del frontend React
│       ├── index.html
│       ├── static\
│       └── ...
├── apache\conf\
│   ├── httpd.conf
│   └── extra\
│       └── httpd-vhosts.conf
└── mysql\data\tickets_system\
```

---

## 2. Configuración de Apache

### 2.1 Habilitar módulos necesarios (httpd.conf)

Buscar y **descomentar** (quitar `#`) estas líneas en `C:\xampp\apache\conf\httpd.conf`:

```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

### 2.2 Agregar escucha en puerto 8012 (httpd.conf)

Al final del archivo, agregar:

```apache
Listen 8012
```

### 2.3 Configurar VirtualHost para backend (httpd-vhosts.conf)

Abrir `C:\xampp\apache\conf\extra\httpd-vhosts.conf` y agregar:

```apache
# ============================================================
# VirtualHost: tickets-backend API (puerto 8012)
# ============================================================
<VirtualHost *:8012>
    ServerName localhost
    DocumentRoot "C:/xampp/htdocs/tickets-backend/public"

    <Directory "C:/xampp/htdocs/tickets-backend/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /

        # Enrutar todo lo que no sea archivo/directorio a index.php
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php [QSA,L]

        # CORS — permitir origen desde frontend (mismo equipo)
        <IfModule mod_headers.c>
            Header always set Access-Control-Allow-Origin "*"
            Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
            Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
        </IfModule>

        # Preflight
        RewriteCond %{REQUEST_METHOD} OPTIONS
        RewriteRule ^(.*)$ - [R=200,L]
    </Directory>

    ErrorLog "C:/xampp/apache/logs/tickets-backend-error.log"
    CustomLog "C:/xampp/apache/logs/tickets-backend-access.log" common
</VirtualHost>
```

### 2.4 Configurar VirtualHost para frontend + reverse proxy (httpd-vhosts.conf)

Dentro del VirtualHost principal de XAMPP (puerto 80), o creando uno nuevo:

```apache
# ============================================================
# VirtualHost: tickets-frontend (puerto 80) + reverse proxy
# ============================================================
<VirtualHost *:80>
    ServerName localhost

    DocumentRoot "C:/xampp/htdocs"

    <Directory "C:/xampp/htdocs">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # --- Reverse Proxy: /api → backend en puerto 8012 ---
    ProxyPass /api http://localhost:8012/api
    ProxyPassReverse /api http://localhost:8012/api

    # --- Reverse Proxy: /public-board (si el backend lo sirve) ---
    ProxyPass /public-board http://localhost:8012/public-board
    ProxyPassReverse /public-board http://localhost:8012/public-board

    # --- Reverse Proxy: /services.php ---
    ProxyPass /services.php http://localhost:8012/services.php
    ProxyPassReverse /services.php http://localhost:8012/services.php
</VirtualHost>
```

**Importante:** Desactivar o comentar cualquier otro VirtualHost en puerto 80 que pueda interferir.

---

## 3. Modificaciones de Código Necesarias

### 3.1 tickets-frontend → `src/services/api.ts`

**Objetivo:** Cuando el frontend se sirve desde el mismo dominio que el backend (reverse proxy), `API_BASE_URL` debe ser `""` (cadena vacía) para que use rutas relativas (`/api/tickets`).

Revisar la función `resolveApiBase()`. Con `REACT_APP_API_BASE=""` en el build, el código actual ya devuelve `""` en esta línea:

```typescript
if (explicit) return explicit;
```

No necesita modificación adicional, **siempre y cuando se construya con**:

```bash
npx cross-env REACT_APP_API_BASE="" npm run build
```

### 3.2 tickets-backend → `public/index.php`

**Objetivo:** Las rutas de bienes proxy deben apuntar al servidor SIFA correcto.

Buscar esta línea (aproximadamente línea 95):

```php
$bienesProxy = new App\Services\BienesProxyService('192.168.5.206', 8012);
```

Reemplazar `'192.168.5.206'` con la IP del servidor SIFA que te proporcionen, por ejemplo:

```php
$bienesProxy = new App\Services\BienesProxyService('192.168.1.100', 8012);
```

### 3.3 tickets-backend → `.htaccess`

**Objetivo:** Ajustar `RewriteBase` y CORS para que funcione bajo Apache sin subdirectorio.

Reemplazar el contenido de `tickets-backend/.htaccess` con:

```apache
RewriteEngine On
RewriteBase /

# Servicios públicos
RewriteCond %{REQUEST_URI} ^/services\.php
RewriteRule ^.*$ - [L]

# Enrutar todo lo demás a index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ public/index.php [QSA,L]

# CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Preflight
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ - [R=200,L]
```

### 3.4 tickets-backend → Carga de `.env` en `public/index.php`

`getenv()` no lee archivos `.env` automáticamente. Agregar este bloque **al inicio de `public/index.php`**, antes de cualquier otro código:

```php
// Cargar variables de entorno desde .env
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}
```

---

## 4. Build del Frontend

En el servidor (tiene Node.js), ejecutar:

```powershell
# Ir a la carpeta del frontend
cd C:\xampp\htdocs\tickets-frontend

# Instalar dependencias (solo primera vez)
npm install

# Build de producción con API_BASE_URL vacía (rutas relativas)
npx cross-env REACT_APP_API_BASE="" npm run build

# Crear carpeta destino para el frontend
New-Item -ItemType Directory -Force -Path "C:\xampp\htdocs\tickets"

# Mover el build a la carpeta pública
Move-Item -Path "build\*" -Destination "C:\xampp\htdocs\tickets\" -Force
```

**Nota:** Si `cross-env` no está instalado globalmente:

```powershell
npm install -g cross-env
```

---

## 5. Base de Datos

### 5.1 Crear la base de datos

Abrir phpMyAdmin (`http://localhost/phpmyadmin`) o consola MySQL:

```sql
CREATE DATABASE IF NOT EXISTS tickets_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 5.2 Importar esquema

Ejecutar `C:\xampp\htdocs\tickets-backend\database.sql`:

```powershell
mysql -u root -p tickets_system < C:\xampp\htdocs\tickets-backend\database.sql
```

O importarlo desde phpMyAdmin.

### 5.3 Configurar .env

Editar `C:\xampp\htdocs\tickets-backend\.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tickets_system
DB_USER=root
DB_PASSWORD=
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

---

## 6. Instalación en el Servidor (Checklist)

| # | Paso | Hecho |
|---|------|:----:|
| 1 | Copiar `tickets-backend/` a `C:\xampp\htdocs\tickets-backend\` | ☐ |
| 2 | Copiar `tickets-frontend/` a `C:\xampp\htdocs\tickets-frontend\` | ☐ |
| 3 | Editar `tickets-backend/.htaccess` con el contenido nuevo | ☐ |
| 4 | Editar `tickets-backend/public/index.php`: agregar carga de `.env` | ☐ |
| 5 | Editar `tickets-backend/public/index.php`: IP servidor SIFA | ☐ |
| 6 | Editar `tickets-backend/.env` con credenciales MySQL y JWT secret | ☐ |
| 7 | Ejecutar `npm install` en `tickets-frontend` | ☐ |
| 8 | Ejecutar build y mover a `C:\xampp\htdocs\tickets\` | ☐ |
| 9 | Crear base de datos e importar `database.sql` | ☐ |
| 10 | Habilitar módulos Apache (`rewrite`, `headers`, `proxy`, `proxy_http`) | ☐ |
| 11 | Agregar `Listen 8012` en `httpd.conf` | ☐ |
| 12 | Configurar VirtualHost puerto 8012 en `httpd-vhosts.conf` | ☐ |
| 13 | Configurar VirtualHost puerto 80 con reverse proxy en `httpd-vhosts.conf` | ☐ |
| 14 | Reiniciar Apache desde XAMPP Control Panel | ☐ |
| 15 | **Probar:** `http://localhost/tickets/` (frontend carga) | ☐ |
| 16 | **Probar:** `http://localhost:8012/api/tickets` (backend directo) | ☐ |
| 17 | **Probar:** `http://localhost/api/tickets` (reverse proxy) | ☐ |
| 18 | **Probar:** Login, tablero público, creación de tickets | ☐ |

---

## 7. Mapa de Archivos a Modificar (Resumen Rápido)

| Archivo | Cambio |
|---------|--------|
| `C:\xampp\apache\conf\httpd.conf` | Descomentar módulos: `rewrite`, `headers`, `proxy`, `proxy_http` |
| `C:\xampp\apache\conf\httpd.conf` | Agregar `Listen 8012` |
| `C:\xampp\apache\conf\extra\httpd-vhosts.conf` | VirtualHost puerto 8012 (backend) |
| `C:\xampp\apache\conf\extra\httpd-vhosts.conf` | VirtualHost puerto 80 (frontend + reverse proxy) |
| `tickets-backend/.htaccess` | Reemplazar por el nuevo contenido |
| `tickets-backend/.env` | Credenciales MySQL + JWT secret |
| `tickets-backend/public/index.php` | Agregar carga manual de `.env` |
| `tickets-backend/public/index.php` | IP servidor SIFA en `BienesProxyService()` |
| `tickets-frontend/src/services/api.ts` | Verificar — build con `REACT_APP_API_BASE=""` es suficiente |

---

## 8. Solución de Problemas Comunes

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `http://localhost:8012` no responde | `Listen 8012` no agregado | Verificar `httpd.conf` |
| `http://localhost/api/...` da 404 | `mod_proxy` no habilitado | Descomentar en `httpd.conf` |
| Error CORS en frontend | Reverse proxy mal configurado | Verificar `ProxyPass` y `ProxyPassReverse` |
| API responde HTML en vez de JSON | `.htaccess` no enruta a `index.php` | Verificar `AllowOverride All` y `RewriteEngine On` |
| `getenv('DB_HOST')` devuelve vacío | `.env` no se carga automáticamente | Implementar carga manual (Sección 3.4) |
| Bienes proxy no funciona | IP del servidor SIFA incorrecta | Verificar IP en `index.php` y conectividad de red |
| Build falla | Módulos npm no instalados | Ejecutar `npm install` antes del build |
