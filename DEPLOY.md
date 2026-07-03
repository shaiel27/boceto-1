# Guía de Implementación — Servidor 192.168.0.43

## Arquitectura

```
[Usuario] → Frontend React (puerto 3000 / build estático)
              ↓  (proxy /api/*)
         Backend PHP (puerto 8000)
              ↓  (cURL)
         XAMPP localhost:8012/bienes/   ← EN ESTE SERVIDOR
              ↓  (HTTP con API Key + JWT)
         Linux 192.168.0.22/api/index.php  ← SIFA (NO CAMBIA)
```

- **192.168.0.43**: Nuevo servidor del sistema de tickets (XAMPP + Backend + Frontend)
- **192.168.0.22**: Servidor Linux con SIFA API y PostgreSQL (no se modifica)

---

## 1. Instalar XAMPP en 192.168.0.43

1. Descargar e instalar XAMPP desde https://www.apachefriends.org/
2. Iniciar **Apache** y **MySQL** desde el Panel de Control de XAMPP

---

## 2. Copiar archivos al servidor

### 2.1 Carpeta bridge `bienes/` en XAMPP

Copiar la carpeta `bienes/` del proyecto a `C:\xampp\htdocs\bienes\`:

```
C:\xampp\htdocs\
  └── bienes/
      ├── bienes.php        ← bridge activos + oficinas + cache
      ├── unidades.php      ← bridge proxy genérico
      ├── index.html
      ├── includes/
      │   ├── security.php
      │   └── ConfigSecurity.php
      └── cache/            ← se crea automáticamente
```

**Nota**: `includes/ConfigSecurity.php` contiene las credenciales de acceso a la API SIFA. Debe tener la IP correcta:

```php
'PROXY_API_URL' => 'http://192.168.0.22/api/index.php',
'PROXY_API_KEY' => 'MiClaveSecretaUltraSegura123*',
```

### 2.2 Backend PHP

Copiar `tickets-backend/` a la ubicación que servirá Apache (puede ser dentro de XAMPP o aparte):

```
C:\xampp\htdocs\
  └── tickets-backend/
      ├── public/index.php  ← entry point (rutas)
      └── src/
          ├── config/database.php  ← credenciales MySQL
          ├── Services/
          │   ├── BienesProxyService.php  ← apunta a localhost:8012
          │   └── OfficeSyncService.php
          ├── Models/
          │   ├── Office.php
          │   ├── User.php
          │   └── ...
          └── Controllers/
              └── ...
```

### 2.3 Frontend React (build estático)

```bash
cd tickets-frontend
npm install
npm run build
```

Copiar `tickets-frontend/build/` a `C:\xampp\htdocs\tickets\` (o la carpeta que prefieras).

---

## 3. Configurar Base de Datos MySQL

1. Abrir phpMyAdmin: `http://192.168.0.43/phpmyadmin`
2. Crear base de datos: `tickets_system` (utf8mb4_unicode_ci)
3. Importar el esquema desde `database/schema.sql` (si existe)
4. Configurar credenciales en `tickets-backend/src/config/database.php`

---

## 4. Configurar Apache

### 4.1 Backend PHP como VirtualHost (recomendado)

Editar `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:8000>
    DocumentRoot "C:/xampp/htdocs/tickets-backend/public"
    <Directory "C:/xampp/htdocs/tickets-backend/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Agregar en `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1  api.tickets.local
```

(O usar el puerto 8000 directamente)

### 4.2 Frontend estático

Si usas build estático, el VirtualHost del frontend:

```apache
<VirtualHost *:80>
    DocumentRoot "C:/xampp/htdocs/tickets"
    <Directory "C:/xampp/htdocs/tickets">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 4.3 Proxy inverso (opcional, para rutas /api/)

Si el frontend estático necesita `/api/*`, agregar en el VirtualHost del frontend:

```apache
ProxyPass /api http://localhost:8000/api
ProxyPassReverse /api http://localhost:8000/api
```

Requiere habilitar `mod_proxy` y `mod_proxy_http` en Apache.

### 4.4 Como servicio (alternativa a VHost)

Si usas PHP built-in como servicio:

```batch
:: Crear servicio con NSSM (http://nssm.cc)
nssm install TicketsBackend "C:\xampp\php\php.exe" "-S 0.0.0.0:8000 -t C:\xampp\htdocs\tickets-backend\public"
nssm start TicketsBackend
```

---

## 5. Verificar Funcionamiento

Una vez todo configurado, probar:

```powershell
# Bridge XAMPP → SIFA (debe devolver JSON con bienes)
Invoke-WebRequest http://localhost:8012/bienes/bienes.php?limit=3

# Backend PHP
Invoke-WebRequest http://localhost:8000/api/office?action=all

# Sincronizar oficinas desde SIFA
Invoke-WebRequest http://localhost:8000/api/office?action=sync

# Bienes via backend
Invoke-WebRequest http://localhost:8000/api/bienes?limit=3
```

---

## 6. Resumen de Archivos Modificados

| Archivo | Cambio |
|---|---|
| `bienes/bienes.php` | Matching oficinas usa `spg_unidadadministrativa` (FK real) |
| `tickets-backend/public/index.php` | Rutas `/api/unidades` usan `spg_unidadadministrativa` |
| `tickets-backend/src/Services/BienesProxyService.php` | PHP-PRO, apunta a `localhost:8012` |
| `tickets-backend/src/Services/OfficeSyncService.php` | Sync usa `spg_unidadadministrativa` |
| `tickets-frontend/src/setupProxy.js` | Proxy dev → `localhost:8000` |

---

## 7. Notas Importantes

- `BienesProxyService.php` tiene `$host = 'localhost'` y `$port = 8012` por defecto. Si el bridge XAMPP usa otro puerto, cambiarlo.
- El cache de bienes se regenera automáticamente cada 5 minutos en `bienes/cache/bienes_merged.json`.
- `spg_unidadadministrativa` tiene 105 oficinas vs `sno_unidadadmin` (113). Las 8 adicionales de `sno` son sub-oficinas sin `coduniadm` que no tienen relación con activos.
- Sync de oficinas: `coduniadm` de `spg_unidadadministrativa` es FK directo de `saf_dta.coduniadm` — matching 100% correcto.
