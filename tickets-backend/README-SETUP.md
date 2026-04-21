# Setup Rápido para Windows (Sin Composer)

## Problema
PHP y Composer no están instalados o no están en el PATH de Windows.

## Solución Alternativa

### 1. Verificar si PHP está instalado
```powershell
php --version
```

Si PHP no está instalado, necesitas instalarlo primero:
- Descarga PHP desde https://www.php.net/downloads.php
- O usa XAMPP/WAMP que incluye PHP + MySQL + Apache

### 2. Usar el backend simplificado

He creado una versión simplificada que no requiere Composer:

#### Opción A: Usar el index-simple.php
```powershell
cd tickets-backend
php -S localhost:8000 -t public
```

Luego accede a `http://localhost:8000/api/test` para probar.

#### Opción B: Configurar el .htaccess para usar index-simple.php
Edita `public/.htaccess` y cambia:
```
RewriteRule ^(.*)$ index.php [QSA,L]
```
a:
```
RewriteRule ^(.*)$ index-simple.php [QSA,L]
```

### 3. Probar los endpoints

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

### 4. Configuración del Frontend

Asegúrate que `.env` en el frontend tenga:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 5. Credenciales de Prueba

El backend simplificado usa estos datos de prueba:
- **Email**: `admin@alcaldia.gob`
- **Password**: `password123`
- **Roles**: Admin (1), Técnico (2), Jefe (3)

## Si tienes PHP pero no Composer

Puedes instalar Composer manualmente:

```powershell
# Descargar Composer
Invoke-WebRequest -Uri https://getcomposer.org/installer -OutFile composer-setup.php

# Instalar
php composer-setup.php

# Mover al PATH
Move-Item composer.phar C:\xampp\php\composer.phar

# Agregar al PATH de Windows
```

## Next Steps

1. **Probar el backend simplificado** primero
2. **Verificar conexión a base de datos** MySQL
3. **Probar login desde frontend**
4. **Si funciona, instalar Composer** para el backend completo

## Troubleshooting

### "php no es reconocido"
- Instala XAMPP o WAMP
- O instala PHP standalone desde php.net
- Agrega PHP al PATH de Windows

### "Conexión a base de datos falla"
- Verifica que MySQL esté corriendo
- Verifica credenciales en setup-simple.php
- Asegúrate que la base de datos `tickets_municipal` exista

### "CORS errors"
- El backend simplificado ya tiene CORS configurado
- Verifica que el frontend use la URL correcta

### "404 Not Found"
- Verifica que estés usando `index-simple.php`
- Revisa la configuración del .htaccess
