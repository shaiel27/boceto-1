# API de Gestión Administrativa de Tickets

## Endpoints Disponibles

### 1. Obtener Todos los Tickets (Admin/Jefe)
```
GET /api/tickets
```
**Permisos**: administrador, técnico, jefe

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "ID_Service_Request": 1,
      "Subject": "Ticket ejemplo",
      "Status": "Pendiente",
      "System_Priority": "Alta",
      "technicians": [...]
    }
  ]
}
```

### 2. Filtrar Tickets
```
GET /api/tickets?action=filter&status=Pendiente&service_id=2&priority=Alta
```
**Parámetros**:
- `status`: Pendiente, En Proceso, Técnicos Asignados, Cerrado
- `service_id`: 1 (Redes), 2 (Soporte), 3 (Programación)
- `priority`: Baja, Media, Alta
- `limit`: Número de resultados (default: 50)
- `offset`: Paginación (default: 0)

**Permisos**: administrador, jefe

### 3. Obtener Ticket Específico
```
GET /api/tickets?action=single&id=1
```
**Permisos**: administrador, técnico, jefe, solicitante (solo sus tickets)

### 4. Obtener Técnicos Disponibles por Servicio
```
GET /api/tickets?action=available-technicians&service_id=2
```
**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "ID_Technicians": 1,
      "First_Name": "Carlos",
      "Last_Name": "Diaz",
      "Status": "Activo"
    }
  ]
}
```

### 5. Asignar Técnico a Ticket
```
POST /api/tickets?action=assign-technician
```
**Body**:
```json
{
  "ticket_id": 1,
  "technician_id": 2,
  "is_lead": true
}
```
**Permisos**: administrador

### 6. Asignar Múltiples Técnicos a Ticket
```
POST /api/tickets?action=assign-multiple-technicians
```
**Body**:
```json
{
  "ticket_id": 1,
  "technician_ids": [2, 3, 4]
}
```
**Permisos**: administrador

**Respuesta**:
```json
{
  "success": true,
  "message": "Asignados 3 técnicos exitosamente",
  "assigned_count": 3,
  "failed_assignments": []
}
```

### 7. Desasignar Técnico de Ticket
```
POST /api/tickets?action=unassign-technician
```
**Body**:
```json
{
  "ticket_id": 1,
  "technician_id": 2
}
```
**Permisos**: administrador

### 8. Actualizar Estado de Ticket (Cerrar)
```
PUT /api/tickets?id=1
```
**Body**:
```json
{
  "Status": "Cerrado"
}
```
**Estados disponibles**: Pendiente, En Proceso, Técnicos Asignados, Cerrado

**Permisos**: administrador, técnico

### 9. Actualizar Prioridad
```
PUT /api/tickets?action=priority&id=1
```
**Body**:
```json
{
  "System_Priority": "Alta"
}
```
**Permisos**: administrador

### 10. Agregar Comentario
```
POST /api/tickets?action=comment
```
**Body**:
```json
{
  "Fk_Service_Request": 1,
  "Comment": "El técnico está trabajando en el problema"
}
```
**Permisos**: Todos los usuarios autenticados

### 11. Obtener Comentarios de Ticket
```
GET /api/tickets?action=comments&id=1
```

### 12. Estadísticas de Tickets
```
GET /api/tickets?action=stats
```
**Permisos**: administrador, jefe

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "total_tickets": 100,
    "pending": 10,
    "in_progress": 25,
    "resolved": 65
  }
}
```

## Flujo de Trabajo Recomendado

### Para el Administrador:

1. **Ver todos los tickets pendientes**:
   ```
   GET /api/tickets?action=filter&status=Pendiente
   ```

2. **Ver técnicos disponibles para el servicio del ticket**:
   ```
   GET /api/tickets?action=available-technicians&service_id=2
   ```

3. **Asignar uno o más técnicos**:
   ```
   POST /api/tickets?action=assign-multiple-technicians
   ```

4. **Monitorear progreso**:
   ```
   GET /api/tickets?action=filter&status=En%20Proceso
   ```

5. **Cerrar ticket cuando se resuelva**:
   ```
   PUT /api/tickets?id=1
   { "Status": "Cerrado" }
   ```

### Para el Técnico:

1. **Ver tickets asignados**:
   ```
   GET /api/tickets?action=technician-tickets
   ```

2. **Actualizar estado a "En Proceso"**:
   ```
   PUT /api/tickets?id=1
   { "Status": "En Proceso" }
   ```

3. **Agregar comentarios de progreso**:
   ```
   POST /api/tickets?action=comment
   ```

4. **Cerrar ticket cuando se resuelva**:
   ```
   PUT /api/tickets?id=1
   { "Status": "Cerrado" }
   ```

## Notas Importantes

- Todos los endpoints requieren autenticación (token JWT en header Authorization)
- Los tickets pendientes se asignan automáticamente cuando técnicos se hacen disponibles (via `/api/assignments`)
- El sistema verifica disponibilidad de técnicos basándose en:
  - Área de servicio
  - Horario laboral
  - Bloque de almuerzo
  - Tickets activos actuales
