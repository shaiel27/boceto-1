# Guía de primera ejecución en XAMPP (localhost)

> Después de mover `tickets-backend/`, `tickets-frontend/` y `tickets-App/` a `C:\xampp\htdocs\`.

---

## 1. Requisitos previos

| Herramienta | Versión |
|---|---|
| XAMPP | PHP 8.1+, MySQL 8.0+ |
| Node.js | 18+ |
| npm | (incluido con Node.js) |

Verifica que PHP tenga el driver `pdo_mysql` habilitado:
```
php -m | findstr pdo_mysql
```
Si no aparece, edita `C:\xampp\php\php.ini` y **descomenta**:
```
extension=mysqli
extension=pdo_mysql
```

---

## 2. Base de datos

### 2.1. Abre phpMyAdmin
Ve a http://localhost/phpmyadmin

### 2.2. Crea la base de datos
```sql
CREATE DATABASE IF NOT EXISTS tickets_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.3. Importa el esquema + datos de prueba
En phpMyAdmin, selecciona la base `tickets_system` → pestaña **Importar** → selecciona el archivo:

```
C:\xampp\htdocs\tickets-backend\database.sql
```

Esto crea todas las tablas e inserta datos de prueba.

> **Alternativa por consola:**
> ```
> mysql -u root -p < C:\xampp\htdocs\tickets-backend\database.sql
> ```

### 2.4. Hashear las contraseñas de los usuarios de prueba

El archivo `database.sql` inserta `'password_hash_here'` como placeholder. Debes reemplazarlo por hashes bcrypt reales.

Abre una terminal y ejecuta:
```bash
php -r "echo password_hash('password123', PASSWORD_DEFAULT);"
```

Copia el hash que genera. Luego edita `database.sql` y **reemplaza** `'password_hash_here'` por el hash copiado en **cada INSERT de Users** (hay 6 usuarios). Vuelve a ejecutar el SQL o haz UPDATE manual:

```sql
-- Ejemplo para un solo usuario (reemplaza HASH por el que generaste)
UPDATE tickets_system.Users SET Password = 'HASH' WHERE Email = 'admin@alcaldia.gob';
UPDATE tickets_system.Users SET Password = 'HASH' WHERE Email = 'tech1@alcaldia.gob';
UPDATE tickets_system.Users SET Password = 'HASH' WHERE Email = 'tech2@alcaldia.gob';
UPDATE tickets_system.Users SET Password = 'HASH' WHERE Email = 'jefe1@alcaldia.gob';
UPDATE tickets_system.Users SET Password = 'HASH' WHERE Email = 'jefe2@alcaldia.gob';
UPDATE tickets_system.Users SET Password = 'HASH' WHERE Email = 'auditor@alcaldia.gob';
```

---

## 3. Backend (PHP)

### Opción A: Servidor integrado de PHP (recomendado para desarrollo)

Abre una terminal **como Administrador** y ejecuta:
```bash
cd C:\xampp\htdocs\tickets-backend
C:\xampp\php\php.exe -S 0.0.0.0:8000 router.php
```

El backend queda disponible en: `http://localhost:8000`

**Importante:** Usa `router.php`, NO `-t public`, para que el proxy de bienes funcione.

### Opción B: Apache (producción local)

Crea un VirtualHost en `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:
```apache
<VirtualHost *:80>
    ServerName tickets-api.local
    DocumentRoot "C:/xampp/htdocs/tickets-backend/public"
    <Directory "C:/xampp/htdocs/tickets-backend/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Agrega al archivo `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1  tickets-api.local
```

---

## 4. Frontend web (React)

Abre otra terminal:
```bash
cd C:\xampp\htdocs\tickets-frontend
npm install
npm start
```

El frontend se abre en: `http://localhost:3000`

> El `setupProxy.js` redirige `/api/bienes` y `/api/unidades` a XAMPP en puerto 8012. Si tu XAMPP usa otro puerto, edítalo.

---

## 5. App móvil (Expo)

En otra terminal:
```bash
cd C:\xampp\htdocs\tickets-App
npm install
npx expo start
```

Escanea el código QR con Expo Go en tu teléfono.

**Importante:** Edita `tickets-App/src/constants/config.ts` y cambia la IP por la de tu computadora en la red local:
```ts
const API_HOST = '192.168.X.X';  // IP de tu PC
```

---

## 6. Credenciales de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@alcaldia.gob | password123 | Admin |
| tech1@alcaldia.gob | password123 | Técnico |
| tech2@alcaldia.gob | password123 | Técnico |
| jefe1@alcaldia.gob | password123 | Jefe |
| jefe2@alcaldia.gob | password123 | Jefe |
| auditor@alcaldia.gob | password123 | Auditor |

---

## 7. Resumen de URLs

| Componente | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Frontend web | http://localhost:3000 |
| phpMyAdmin | http://localhost/phpmyadmin |

---

## 8. Solución de problemas comunes

**Error: "Missing pdo_mysql driver"**
→ Asegúrate de ejecutar el backend con `C:\xampp\php\php.exe`, no con otro PHP.

**Error de conexión a base de datos**
→ Verifica que MySQL esté corriendo en el Panel de Control de XAMPP.

**El frontend no se conecta al backend**
→ Revisa que el backend esté corriendo en puerto 8000. Por defecto el frontent detecta automáticamente la URL del backend.

**Error: "password_hash_here"**
→ No has reemplazado los hashes en `database.sql`. Sigue el paso 2.4.
