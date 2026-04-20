# Configuración con XAMPP

## Pasos para configurar el sistema con XAMPP

### 1. Iniciar Servicios XAMPP
1. Abre el panel de control de XAMPP
2. Inicia **Apache** y **MySQL**
3. Verifica que ambos servicios estén en verde (corriendo)

### 2. Configurar Base de Datos
1. Abre phpMyAdmin (http://localhost/phpmyadmin)
2. Crea la base de datos:
   - Nombre: `tickets_municipal`
   - Collation: `utf8mb4_unicode_ci`

### 3. Importar Schema y Datos
Usa los scripts SQL que ya tienes:

```sql
-- Ejecutar en este orden:
-- 1. database-scripts/schema.sql
-- 2. database-scripts/insert-data.sql
```

O ejecuta desde línea de comandos:
```bash
mysql -u root tickets_municipal < database-scripts/schema.sql
mysql -u root tickets_municipal < database-scripts/insert-data.sql
```

### 4. Verificar Datos Importados
En phpMyAdmin, ejecuta:
```sql
SELECT COUNT(*) as total_users FROM Users;
SELECT COUNT(*) as total_tickets FROM Service_Request;
```

Deberías ver:
- Usuarios: 7 (admin + 3 técnicos + 3 jefes)
- Tickets: 6

### 5. Configurar Backend
1. Abre terminal/cmd en la carpeta del backend
2. Ejecuta el setup simplificado:
```bash
cd C:\Users\Admin\Desktop\shaiel\boceto-1\tickets-backend
php setup-simple.php
```

### 6. Iniciar Backend
```bash
php -S localhost:8000 -t public
```

### 7. Probar Endpoints
Abre otra terminal y prueba:

#### Test básico:
```bash
curl http://localhost:8000/api/test
```

#### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@alcaldia.gob\",\"password\":\"password123\"}"
```

### 8. Configurar Frontend
Asegúrate que el frontend tenga en `.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 9. Iniciar Frontend
```bash
cd C:\Users\Admin\Desktop\shaiel\boceto-1\tickets-frontend
npm start
```

### 10. Probar Integración
1. Abre `http://localhost:3000/login`
2. Ingresa: `admin@alcaldia.gob` / `password123`
3. Debería redirigir al dashboard

## Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@alcaldia.gob | password123 |
| Técnico 1 | juan.perez@alcaldia.gob | password123 |
| Técnico 2 | maria.gonzalez@alcaldia.gob | password123 |
| Técnico 3 | carlos.rodriguez@alcaldia.gob | password123 |
| Jefe 1 | pedro.martinez@alcaldia.gob | password123 |
| Jefe 2 | ana.lopez@alcaldia.gob | password123 |
| Jefe 3 | luis.sanchez@alcaldia.gob | password123 |

## Troubleshooting

### "Cannot connect to database"
- Verifica que MySQL esté corriendo en XAMPP
- Verifica que la base de datos `tickets_municipal` exista
- Revisa credenciales en `setup-simple.php`

### "404 Not Found"
- Asegúrate que el backend esté corriendo en el puerto 8000
- Verifica la URL: `http://localhost:8000/api/test`

### "CORS error"
- El backend simplificado ya tiene CORS configurado
- Verifica que el frontend use la URL correcta

### "Login fails"
- Verifica que los usuarios existan en la base de datos
- Revisa el password: debe ser `password123` para todos

## Estructura de Archivos Importantes

```
tickets-backend/
|-- public/
|   |-- index-simple.php    # Backend simplificado
|   |-- .htaccess           # Configuración Apache
|-- src/                    # Código fuente del backend
|-- setup-simple.php        # Script de configuración
```

```
tickets-frontend/
|-- src/
|   |-- services/api.ts      # Servicio API
|   |-- contexts/AuthContext.tsx  # Contexto de autenticación
|   |-- components/auth/LoginForm.tsx
|-- .env                     # Configuración URL API
```

Una vez que todo funcione, puedes instalar Composer para usar el backend completo.
