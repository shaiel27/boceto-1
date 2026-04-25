# Guía de Instalación - Sistema de Gestión de Tickets

## 📋 Requisitos Previos

### Software Necesario
- **XAMPP** (Apache + MySQL + PHP) - Versión 8.0 o superior
- **Node.js** - Versión 16 o superior
- **npm** - Viene con Node.js
- **Git** - Para clonar el repositorio

### Nota Importante sobre PHP
El proyecto **REQUIERE** usar el PHP que viene con XAMPP, no el PHP del sistema. Esto es crítico para que el driver PDO MySQL funcione correctamente.

---

## 🚀 Paso a Paso de Instalación

### 1. Instalar XAMPP
1. Descargar XAMPP desde [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Ejecutar el instalador
3. Instalar en `C:\xampp` (ruta por defecto recomendada)
4. Iniciar **Apache** y **MySQL** desde el XAMPP Control Panel

### 2. Configurar Contraseña de MySQL
1. Abrir phpMyAdmin: http://localhost/phpmyadmin
2. Si pide contraseña, ejecutar en MySQL:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'NuevaClave123';
   FLUSH PRIVILEGES;
   ```
3. Editar `C:\xampp\phpMyAdmin\config.inc.php`:
   ```php
   $cfg['Servers'][$i]['password'] = 'NuevaClave123';
   ```

### 3. Clonar el Proyecto
```bash
git clone <URL-del-repositorio>
cd boceto-1
```

### 4. Crear Base de Datos
1. Abrir phpMyAdmin: http://localhost/phpmyadmin
2. Crear nueva base de datos:
   - Nombre: `tickets_system`
   - Collation: `utf8mb4_unicode_ci`

### 5. Importar Estructura y Datos
```bash
# Importar schema
mysql -u root -pNuevaClave123 tickets_system < tickets-backend/database.sql

# Importar datos adicionales (opcional)
mysql -u root -pNuevaClave123 tickets_system < populate-ticket-data.sql
```

### 6. Configurar Frontend
```bash
cd tickets-frontend
npm install
```

Verificar que el archivo `.env` contenga:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 7. Configurar Backend
```bash
cd tickets-backend
```

Verificar que `src/config/database.php` tenga:
```php
private $host = 'localhost';
private $port = '3306';
private $db_name = 'tickets_system';
private $username = 'root';
private $password = 'NuevaClave123';
```

### 8. Corregir Contraseñas de Usuarios
Ejecutar el script para hashear las contraseñas:
```bash
# IMPORTANTE: Usar PHP de XAMPP
& "C:\xampp\php\php.exe" fix-password.php
```

### 9. Iniciar Servidores

#### Backend (Terminal 1)
```bash
cd tickets-backend
# IMPORTANTE: Usar PHP de XAMPP, no el PHP del sistema
& "C:\xampp\php\php.exe" -S localhost:8000 -t public
```

#### Frontend (Terminal 2)
```bash
cd tickets-frontend
npm start
```

---

## 🔑 Credenciales de Acceso

| Rol | Email | Password |
|-----|-------|----------|
| Administrador | admin@alcaldia.gob | password123 |
| Técnico 1 | tech1@alcaldia.gob | password123 |
| Técnico 2 | tech2@alcaldia.gob | password123 |
| Usuario 1 | user1@alcaldia.gob | password123 |

---

## 🌐 URLs de Acceso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **phpMyAdmin:** http://localhost/phpmyadmin

---

## 🛠️ Scripts de Diagnóstico

El proyecto incluye scripts para verificar la instalación:

### Verificar Conexión a Base de Datos
```bash
cd tickets-backend
& "C:\xampp\php\php.exe" test-pdo.php
```

### Verificar Usuarios
```bash
cd tickets-backend
& "C:\xampp\php\php.exe" check-user.php
```

### Probar Login Directo
```bash
cd tickets-backend
& "C:\xampp\php\php.exe" debug-login.php
```

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "could not find driver"
**Causa:** Usando PHP del sistema en lugar de PHP de XAMPP  
**Solución:** Siempre usar `& "C:\xampp\php\php.exe"` para comandos PHP

### Error: "Access denied for user 'root'@'localhost'"
**Causa:** Contraseña de MySQL incorrecta  
**Solución:** Configurar contraseña `NuevaClave123` en MySQL y phpMyAdmin

### Error: "Call to a member function prepare() on null"
**Causa:** Conexión a base de datos fallida  
**Solución:** Verificar credenciales en `database.php` y que MySQL esté corriendo

### Error: 401 Unauthorized en Login
**Causa:** Contraseñas no hasheadas o query incorrecto  
**Solución:** Ejecutar `fix-password.php` para hashear contraseñas

---

## 📂 Estructura del Proyecto

```
boceto-1/
├── tickets-frontend/          # Aplicación React
│   ├── src/                  # Código fuente
│   ├── package.json          # Dependencias
│   └── .env                  # Configuración API
├── tickets-backend/           # API PHP
│   ├── src/                  # Código fuente
│   ├── public/               # Archivos públicos
│   └── src/config/database.php # Configuración BD
├── database-scripts/          # Scripts SQL (si existen)
├── populate-ticket-data.sql   # Datos de ejemplo
└── tickets-backend/database.sql # Schema completo
```

---

## 🔄 Comandos de Desarrollo Rápidos

### Crear acceso directo para Backend
Crear archivo `start-backend.bat` en `tickets-backend/`:
```batch
@echo off
cd /d "%~dp0"
C:\xampp\php\php.exe -S localhost:8000 -t public
```

### Verificar instalación completa
```bash
# Verificar PHP extensions
& "C:\xampp\php\php.exe" -m | Select-String -Pattern "pdo|mysql"

# Verificar conexión BD
& "C:\xampp\php\php.exe" test-pdo.php

# Verificar usuarios
& "C:\xampp\php\php.exe" check-user.php
```

---

## 🎯 Verificación Final

Después de la instalación, el sistema está funcionando correctamente cuando:

1. ✅ Backend responde en http://localhost:8000/api/test
2. ✅ Frontend carga en http://localhost:3000
3. ✅ Login funciona con admin@alcaldia.gob / password123
4. ✅ Dashboard muestra datos del sistema

---

## 📞 Soporte

Si encuentras problemas:

1. Verifica que XAMPP esté corriendo (Apache y MySQL en verde)
2. Siempre usa PHP de XAMPP: `& "C:\xampp\php\php.exe"`
3. Ejecuta los scripts de diagnóstico para identificar problemas
4. Revisa que la contraseña `NuevaClave123` esté configurada en todos lados

---

**Versión:** 1.0  
**Última actualización:** Abril 2026  
**Requisito crítico:** Usar PHP de XAMPP, nunca PHP del sistema
