# Setup Rápido para Windows

## Comando para Iniciar el Backend

### Usando XAMPP (recomendado - ya tiene drivers MySQL):
```powershell
C:\xampp\php\php.exe -S localhost:8000 -t public
```

### Desde el directorio del backend (si PHP está en PATH):
```powershell
php -S localhost:8000 -t public
```

### Desde cualquier ubicación:
```powershell
cd "c:\Users\shaie\OneDrive\Desktop\Pasantias\boceto 1\tickets-backend"
C:\xampp\php\php.exe -S localhost:8000 -t public
```

El backend estará disponible en: **http://localhost:8000**

---

## Requisitos Previos

### 1. Verificar si PHP está instalado
```powershell
php --version
```

Si PHP no está instalado, necesitas instalarlo primero:
- Descarga PHP desde https://www.php.net/downloads.php
- O usa XAMPP/WAMP que incluye PHP + MySQL + Apache

### 2. Verificar configuración de base de datos
Asegúrate que `src/config/database.php` tenga las credenciales correctas de tu base de datos MySQL.

---

## Probar los Endpoints

#### Test básico:
```bash
curl http://localhost:8000/api/test
```

#### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alcaldia.gob","password":"password123"}'
```

#### Verificar token:
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## Configuración del Frontend

Asegúrate que el frontend tenga la URL correcta del API:
- En `src/services/api.ts`: `const API_BASE_URL = 'http://localhost:8000/api';`
- O usa variable de entorno: `REACT_APP_API_URL=http://localhost:8000/api`

---

## Credenciales de Prueba

El backend usa estos datos de prueba (verifica en tu base de datos):
- **Email**: `admin@alcaldia.gob`
- **Password**: `password123`
- **Roles**: Admin, Técnico, Jefe, Solicitante

---

## Troubleshooting

### "Connection error: could not find driver"
El driver PDO de MySQL no está habilitado. Sigue estos pasos:

1. **Encuentra tu archivo php.ini**:
   ```powershell
   php --ini
   ```
   Esto mostrará la ubicación del archivo php.ini cargado.

2. **Edita php.ini** y descomenta estas líneas (quita el `;` al inicio):
   ```ini
   extension=pdo_mysql
   extension=mysqli
   ```

3. **Reinicia el servidor PHP**:
   - Detén el servidor actual (Ctrl+C)
   - Vuelve a ejecutar: `php -S localhost:8000 -t public`

4. **Verifica que el driver esté cargado**:
   ```powershell
   php -m | findstr mysql
   ```
   Deberías ver `mysqli` y `pdo_mysql` en la lista.

**Si usas XAMPP/WAMP**:
- El archivo php.ini está en: `C:\xampp\php\php.ini` o `C:\wamp64\bin\php\php8.x.x\php.ini`
- XAMPP/WAMP ya tienen estos drivers habilitados por defecto

### "php no es reconocido"
- Instala XAMPP o WAMP
- O instala PHP standalone desde php.net
- Agrega PHP al PATH de Windows

### "Conexión a base de datos falla"
- Verifica que MySQL esté corriendo
- Verifica credenciales en `src/config/database.php`
- Asegúrate que la base de datos `tickets_system` exista

### "CORS errors"
- El backend ya tiene CORS configurado en `src/Middleware/CorsMiddleware.php`
- Verifica que el frontend use la URL correcta

### "404 Not Found"
- Verifica que estés en el directorio correcto
- Asegúrate que el archivo `public/index.php` exista
- Revisa la configuración del .htaccess si usas Apache

---

## Estructura del Proyecto

```
tickets-backend/
├── public/
│   ├── index.php          # Entry point principal
│   └── .htaccess          # Configuración de rutas
├── src/
│   ├── config/            # Configuración (database.php)
│   ├── controllers/       # Controladores (Auth, Ticket, User, etc.)
│   ├── models/           # Modelos (User, Technician, Ticket, etc.)
│   ├── Services/          # Servicios (JWT, Email, etc.)
│   └── Middleware/       # Middleware (Auth, CORS, etc.)
└── README-SETUP.md       # Este archivo
```
