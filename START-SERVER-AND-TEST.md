# Instrucciones para Probar el Dashboard

## Diagnóstico PHP-PRO Completado

**Resultado**: El backend SÍ funciona y tiene datos reales:
- 57 tickets en total
- 51 resueltos
- 6 en proceso
- 17 técnicos activos
- 23 oficinas activas
- Tasa de resolución: 89.47%

## Pasos para Probar

### 1. Iniciar Servidor PHP
Abre una terminal y ejecuta:
```bash
cd c:\xampp\htdocs\boceto-1\tickets-backend
php -S localhost:8000 -t public
```

### 2. Probar Endpoint sin Autenticación
Abre en navegador:
```
http://localhost:8000/test-web-endpoint.php
```

Deberías ver los datos reales del dashboard.

### 3. Probar Endpoint con Autenticación
Primero haz login en el frontend, luego:
1. Abre consola del navegador (F12)
2. Ejecuta: `sessionStorage.getItem('auth_token')`
3. Copia el token
4. Abre Postman o usa curl:
```bash
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8000/api/dashboard?action=full
```

### 4. Probar Dashboard Frontend
1. Asegúrate que el servidor PHP esté corriendo (paso 1)
2. Abre el frontend
3. Haz login
4. Navega al Dashboard (sidebar → Dashboard)
5. Revisa la consola (F12) para ver los logs

## Si Funciona el Endpoint sin Auth pero no con Auth

El problema es la autenticación JWT. Verifica:
1. Que el token se esté enviando en el header Authorization
2. Que el token sea válido (no expirado)
3. Que el usuario tenga rol Admin en la base de datos

## Solución Rápida

Si el endpoint sin autenticación funciona, puedo crear un endpoint público temporal para que el Dashboard cargue datos mientras arreglamos la autenticación.
