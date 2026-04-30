# Iniciar Servidor Backend PHP

## Instrucciones para iniciar el servidor backend

El Dashboard está configurado para cargar datos reales del backend PHP, pero el servidor debe estar ejecutándose.

### Paso 1: Abrir terminal
Abre una terminal en el directorio del proyecto:
```bash
cd c:\xampp\htdocs\boceto-1
```

### Paso 2: Iniciar servidor PHP
Ejecuta el siguiente comando para iniciar el servidor en el puerto 8000:
```bash
cd tickets-backend && php -S localhost:8000 -t public
```

### Paso 3: Verificar que el servidor está corriendo
Deberías ver un mensaje como:
```
PHP 8.x.x Development Server (http://localhost:8000) started
```

### Paso 4: Probar el endpoint
Abre en tu navegador: http://localhost:8000/api/dashboard?action=full

Deberías ver una respuesta JSON con los datos del dashboard.

## Solución de problemas

### Error: "php no se reconoce como comando interno"
- Asegúrate de tener PHP instalado
- Agrega PHP al PATH de Windows o usa XAMPP

### Error: "Connection refused"
- Verifica que el puerto 8000 no esté en uso
- Intenta con otro puerto: `php -S localhost:8001 -t public`
- Actualiza la URL en Dashboard.tsx si cambias el puerto

### Error: "Database connection failed"
- Verifica que MySQL/XAMPP esté corriendo
- Revisa la configuración en `tickets-backend/src/config/database.php`
- Asegúrate de que la base de datos `tickets_system` exista

## Verificar que el Dashboard usa datos reales

1. Abre el navegador y navega al Dashboard
2. Abre la consola del navegador (F12)
3. Si ves el mensaje "Backend server not available", el servidor no está corriendo
4. Si no ves ese mensaje, el Dashboard está cargando datos reales del backend

## Estructura de datos esperada

El endpoint `/api/dashboard?action=full` debe retornar:
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_tickets": 18,
      "pending_count": 5,
      "in_progress_count": 3,
      "resolved_count": 10,
      "critical_count": 2,
      "active_technicians": 4
    },
    "recent_tickets": [...],
    "technician_performance": [...]
  }
}
```

## Configuración CORS

El backend está configurado para aceptar peticiones desde `http://localhost:3000` (frontend React).
Si cambias el puerto del frontend, actualiza la configuración CORS en `tickets-backend/public/index.php`.
