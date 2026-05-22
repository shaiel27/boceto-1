# Public Board (Pantalla pública) — Implementación

Resumen
-------
Este documento describe cómo desplegar y probar la nueva pantalla pública `/public-board` que utiliza SSE y sonidos.

Endpoints
---------
- `GET /api/public-board?action=init` — devuelve el estado inicial (JSON)
- `GET /api/public-board?action=stream&since=ISO_TIMESTAMP` — SSE stream (conexión persistente)

Requisitos previos
------------------
- La tabla `Lunch_Notifications_Log` debe existir en la base de datos. Si ya la creaste a mano, perfecto.
- Asegúrate de que el archivo `tickets-backend/src/config/database.php` tenga las credenciales correctas para conectar.

Purgado de registros
---------------------
Se recomienda purgar notificaciones antiguas cada 15 días. Ejemplo de entrada de cron (ejecutar con el usuario que tenga acceso a mysql):

```
0 3 * * * mysql --defaults-file=/root/.my.cnf -D your_db -e "DELETE FROM Lunch_Notifications_Log WHERE Notification_Date < CURDATE() - INTERVAL 15 DAY;"
```

Configuración Apache / PHP para SSE
-----------------------------------
- Preferible usar PHP-FPM + mod_proxy_fcgi. Si usas mod_php, ajusta `mpm_prefork`/workers según RAM.
- Para evitar compresión/buffering en la ruta SSE, añade en tu VirtualHost:

```
<Location "/api/public-board/stream">
    SetEnv no-gzip 1
    ProxyTimeout 3600
</Location>
```

Pruebas rápidas
---------------
1. `GET /api/public-board?action=init` — debe devolver JSON con `active_tickets`, `technicians`, `lunch_blocks`, `server_time`, etc.
2. Abrir SSE: `curl -N "http://your-host/api/public-board?action=stream&since=2026-05-22T10:00:00Z"`
3. Generar test: insertar un ticket nuevo en la BD; se debe recibir `new_ticket` en la conexión SSE.
4. Para probar `lunch_started`: modificar temporalmente la hora de `Start_Time` de un `Lunch_Blocks` para que coincida con la hora actual; verás `lunch_started` y una fila en `Lunch_Notifications_Log`.

Notas para desarrolladores
-------------------------
- `tickets-backend/public/api-public-board.php` es el punto de entrada; usa `tickets-backend/src/controllers/PublicBoardController.php`.
- El método `tryMarkNotification` realiza un `INSERT IGNORE` en la tabla para evitar duplicados en entornos multi-process.
