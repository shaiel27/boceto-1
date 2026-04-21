# Tickets Backend API

Backend PHP para el Sistema de Gestión de Tickets de la Alcaldía de San Cristóbal.

## Estructura del Proyecto

```
tickets-backend/
├── src/
│   ├── config/
│   │   └── database.php          # Configuración de base de datos
│   ├── models/
│   │   ├── User.php             # Modelo de usuarios
│   │   └── ServiceRequest.php   # Modelo de tickets
│   └── controllers/
│       ├── AuthController.php     # Controlador de autenticación
│       ├── TicketController.php   # Controlador de tickets
│       └── UserController.php     # Controlador de usuarios
├── public/
│   └── index.php              # Router principal
├── database.sql               # Script SQL para crear la base de datos
├── .htaccess                # Configuración de Apache
└── README.md                # Este archivo
```

## Configuración

### 1. Base de Datos
1. Importa el archivo `database.sql` en MySQL
2. Actualiza las credenciales en `src/config/database.php` si es necesario

### 2. Servidor Web
Asegúrate de que Apache esté configurado para servir el directorio `public/`

## Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /api/auth` con `action=login`
  ```json
  {
    "action": "login",
    "email": "admin@alcaldia.gob",
    "password": "password123"
  }
  ```

### Tickets (`/api/tickets`)
- `GET /api/tickets` - Obtener todos los tickets
- `GET /api/tickets?action=stats` - Estadísticas de tickets
- `GET /api/tickets?action=single&id=1` - Obtener ticket específico
- `POST /api/tickets` - Crear nuevo ticket
  ```json
  {
    "user_id": 1,
    "office_id": 1,
    "service_type_id": 1,
    "subject": "Problema con computadora",
    "description": "No enciende el equipo",
    "priority": "Alta"
  }
  ```
- `PUT /api/tickets?id=1` - Actualizar ticket
  ```json
  {
    "status": "En Proceso",
    "assigned_to": 2
  }
  ```

### Usuarios (`/api/users`)
- `GET /api/users` - Obtener todos los usuarios
- `POST /api/users` - Crear nuevo usuario
  ```json
  {
    "username": "nuevo_usuario",
    "email": "usuario@alcaldia.gob",
    "password": "password123",
    "full_name": "Nombre Completo",
    "role": "requester"
  }
  ```

## Datos de Prueba

### Usuarios
- **Admin**: admin@alcaldia.gob / password123
- **Técnico**: tech1@alcaldia.gob / password123
- **Solicitante**: req1@alcaldia.gob / password123

## Integración con Frontend

Para integrar con el frontend existente:

1. Actualiza el archivo `api.ts` en el frontend para que apunte a los endpoints reales
2. Reemplaza los datos mock con las llamadas reales a la API
3. Configura CORS para permitir solicitudes desde el dominio del frontend

## Notas de Desarrollo

- Se usa PDO para la conexión a base de datos
- Las respuestas son en formato JSON
- Se incluye configuración CORS para desarrollo
- Las contraseñas deben ser hasheadas en producción
