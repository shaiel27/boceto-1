# Prueba de Integración Frontend-Backend

## Pasos para probar la integración

### 1. Iniciar el Backend
```bash
cd tickets-backend
composer install
php -S localhost:8000 -t public
```

### 2. Iniciar el Frontend
```bash
cd tickets-frontend
npm install
npm start
```

### 3. Probar Login

#### Credenciales de Prueba (después de ejecutar insert-data.sql):
- **Admin**: `admin@alcaldia.gob` / `password123`
- **Técnico**: `juan.perez@alcaldia.gob` / `password123`
- **Jefe**: `pedro.martinez@alcaldia.gob` / `password123`

#### Flujo de Prueba:
1. Abre `http://localhost:3000/login`
2. Ingresa credenciales válidas
3. Verifica que redirija al dashboard
4. Verifica que el token JWT se guarde en localStorage
5. Verifica que el usuario se cargue correctamente en el contexto

### 4. Verificar Endpoints API

#### Login (POST):
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alcaldia.gob","password":"password123"}'
```

#### Me (GET) - requiere token:
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

#### Tickets (GET) - requiere token:
```bash
curl -X GET http://localhost:8000/api/tickets \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

### 5. Verificar Funcionalidades

#### Autenticación:
- [ ] Login exitoso
- [ ] Login fallido con credenciales incorrectas
- [ ] Mensajes de error claros
- [ ] Loading states funcionales
- [ ] Redirección automática después de login

#### Estado:
- [ ] Token guardado en localStorage
- [ ] Contexto de autenticación actualizado
- [ ] Permisos por rol funcionales
- [ ] Logout funciona correctamente

#### Errores:
- [ ] Manejo de errores de red
- [ ] Validación de campos
- [ ] Mensajes de error específicos

### 6. Debug

#### Verificar en Consola del Navegador:
- Requests de red (Network tab)
- Tokens en localStorage
- Estado del contexto React
- Errores de consola

#### Verificar en Backend:
- Logs de errores
- Conexión a base de datos
- Respuestas JSON correctas

### 7. Casos de Prueba Adicionales

#### Login con diferentes roles:
1. Admin - acceso completo
2. Técnico - acceso limitado
3. Jefe - acceso a crear tickets

#### Escenarios de error:
- Credenciales inválidas
- Servidor backend caído
- Token expirado
- Sin conexión a internet

#### Flujo completo:
1. Login
2. Navegación entre páginas
3. Logout
4. Intento de acceso a página protegida sin login
