# Sistema de Gestión de Tickets Municipal - Base de Datos MySQL

## Descripción del Proyecto

Sistema completo de gestión de tickets para la Alcaldía del Municipio San Cristóbal con estructura jerárquica municipal. El sistema permite gestionar solicitudes de servicio técnico de manera eficiente a través de una estructura organizacional de 3 niveles: Direcciones -> Divisiones -> Coordinaciones.

## Estructura de la Base de Datos

### Módulos Principales

1. **Usuarios y Acceso**: Gestión de roles y permisos
2. **Estructura Institucional**: Direcciones, Divisiones y Coordinaciones
3. **Técnicos y Servicios TI**: Especialización y disponibilidad
4. **Horarios y Disponibilidad**: Gestión de jornadas laborales
5. **Gestión de Tickets**: Flujo completo de tickets con trazabilidad

## Archivos SQL Disponibles

### 1. `01_create_tables.sql` - Creación de Estructura
- **Propósito**: Creación de todas las tablas del sistema
- **Contenido**:
  - 15 tablas principales con relaciones
  - Foreign keys configuradas con cascadas apropiadas
  - Índices optimizados para rendimiento
  - Engine InnoDB con charset UTF8MB4
- **Ejecución**: `mysql -u root -p < 01_create_tables.sql`

### 2. `02_constraints_triggers.sql` - Reglas de Negocio
- **Propósito**: Constraints, triggers y automatización
- **Contenido**:
  - Constraints para integridad de datos
  - Triggers para generación automática de códigos
  - Procedimientos almacenados útiles
  - Vistas optimizadas para reportes
- **Ejecución**: `mysql -u root -p alcaldia_tickets_db < 02_constraints_triggers.sql`

### 3. `03_initial_data.sql` - Datos Iniciales
- **Propósito**: Datos iniciales para pruebas y demostración
- **Contenido**:
  - 7 roles del sistema
  - 4 bloques de almuerzo
  - 8 tipos de servicios TI
  - 16 usuarios con diferentes roles
  - Estructura institucional completa
  - 4 técnicos con especializaciones
  - 8 tickets de ejemplo
- **Ejecución**: `mysql -u root -p alcaldia_tickets_db < 03_initial_data.sql`

### 4. `04_dashboard_queries.sql` - Consultas Dashboard
- **Propósito**: Consultas optimizadas para el dashboard
- **Contenido**:
  - KPIs y estadísticas principales
  - Reportes por estructura institucional
  - Análisis de rendimiento de técnicos
  - Consultas temporales y tendencias
  - Métricas de SLA y rendimiento
- **Ejecución**: `mysql -u root -p alcaldia_tickets_db < 04_dashboard_queries.sql`

### 5. `database_complete.sql` - Instalación Completa
- **Propósito**: Script único para instalación completa
- **Contenido**: Todos los scripts anteriores en uno solo
- **Ejecución**: `mysql -u root -p < database_complete.sql`

## Instalación Rápida

### Opción 1: Instalación Completa (Recomendado)
```bash
mysql -u root -p < database_complete.sql
```

### Opción 2: Instalación Paso a Paso
```bash
# 1. Crear estructura
mysql -u root -p < 01_create_tables.sql

# 2. Configurar reglas de negocio
mysql -u root -p alcaldia_tickets_db < 02_constraints_triggers.sql

# 3. Insertar datos iniciales
mysql -u root -p alcaldia_tickets_db < 03_initial_data.sql

# 4. Configurar consultas de dashboard
mysql -u root -p alcaldia_tickets_db < 04_dashboard_queries.sql
```

## Características Técnicas

### Estructura Jerárquica
```
Direcciones (8)
  L Divisiones (20)
    L Coordinaciones (41)
```

### Roles del Sistema
- **Administrador**: Acceso completo
- **Director**: Gestión de dirección
- **Jefe_Division**: Administración de división
- **Coordinador**: Gestión de coordinación
- **Tecnico**: Atención de tickets
- **Usuario_Solicitante**: Creación de solicitudes
- **Secretaria**: Soporte administrativo

### Servicios TI
- Redes
- Soporte Técnico
- Programación
- Base de Datos
- Seguridad
- Telecomunicaciones
- Sistemas Operativos
- Correo Electrónico

### Automatización
- **Generación automática de códigos**: Formato `T-YYYY-NNNN`
- **Cálculo de prioridad del sistema**: Basado en prioridad de usuario y antigüedad
- **Registro automático de asignaciones**: Historial completo de cambios
- **Actualización de fechas de resolución**: Automática al cambiar estado

## Usuarios de Ejemplo

### Credenciales de Prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | carlos.rodriguez@alcaldia.gob.ve | admin123 |
| Director | luis.martinez@alcaldia.gob.ve | director123 |
| Técnico | miguel.torres@alcaldia.gob.ve | tecnico123 |
| Solicitante | juan.garcia@alcaldia.gob.ve | usuario123 |

**Nota**: Las contraseñas en la base de datos están encriptadas con bcrypt. Las contraseñas mostradas son para referencia del frontend.

## Vistas Útiles

### `v_service_requests_complete`
Vista completa de tickets con toda la información relacionada para el dashboard.

### `v_technician_performance`
Análisis de rendimiento de técnicos con estadísticas detalladas.

### `v_coordination_stats`
Estadísticas de tickets por coordinación con métricas de rendimiento.

### `v_recent_tickets`
Tickets recientes optimizados para visualización en tabla principal.

## Procedimientos Almacenados

### `get_dashboard_stats(start_date, end_date)`
Retorna estadísticas principales del dashboard con parámetros opcionales de fecha.

### `get_recent_tickets(limit, offset)`
Obtiene tickets recientes con paginación para la tabla principal.

### `get_next_available_technician(service_type)`
Obtiene el próximo técnico disponible para un servicio específico.

### `get_avg_resolution_time(days)`
Calcula tiempo promedio de resolución en días especificados.

### `get_tickets_by_coordination(start_date, end_date)`
Estadísticas de tickets por coordinación con filtros de fecha.

## Consultas Principales del Dashboard

### KPIs Principales
- Total de tickets
- Tickets por estado y prioridad
- Tickets creados/resueltos hoy
- Tiempo promedio de resolución

### Reportes por Estructura
- Tickets por dirección, división y coordinación
- Rendimiento por coordinación
- Top coordinaciones con más tickets

### Análisis de Técnicos
- Rendimiento individual de técnicos
- Disponibilidad y especialidades
- Tiempos de respuesta por técnico

### Análisis Temporal
- Tickets por día, semana y mes
- Evolución y tendencias
- Distribución por hora del día

### Métricas de Rendimiento
- SLA cumplimiento (tickets resueltos en <24h)
- Tasa de reapertura de tickets
- Distribución por prioridad y estado

## Configuración de MySQL

### Requisitos
- MySQL 8.0 o superior
- Motor InnoDB habilitado
- Soporte para triggers y procedimientos almacenados

### Configuración Recomendada
```ini
[mysqld]
# Configuración para el sistema de tickets
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 100
query_cache_size = 32M
tmp_table_size = 32M
max_heap_table_size = 32M
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

## Mantenimiento

### Backup Recomendado
```bash
mysqldump -u root -p alcaldia_tickets_db > backup_$(date +%Y%m%d).sql
```

### Optimización de Consultas
```sql
ANALYZE TABLE Service_Request;
OPTIMIZE TABLE Service_Request;
```

### Limpieza de Logs
- Considerar particionamiento por fecha para `Service_Request`
- Archivar tickets resueltos después de 1 año
- Limpiar logs binarios periódicamente

## Extensión y Personalización

### Para agregar nuevas coordinaciones:
```sql
INSERT INTO Coordinations (Fk_Division, Name_Coordination, Fk_Coordinator)
VALUES (ID_DIVISION, 'Nombre Coordinación', ID_USUARIO);
```

### Para agregar nuevos servicios:
```sql
INSERT INTO TI_Service (Type_Service, Details)
VALUES ('Nuevo Servicio', 'Descripción del servicio');
```

### Para modificar triggers:
- Editar el archivo `02_constraints_triggers.sql`
- Volver a ejecutar el script o usar `DROP TRIGGER` y recrear

## Consideraciones de Seguridad

- Las contraseñas están encriptadas con bcrypt
- Validación de formato de email y CI con expresiones regulares
- Restricciones de horarios laborales
- Auditoría completa de cambios con triggers
- Uso de prepared statements recomendado para prevenir inyección SQL

## Rendimiento y Optimización

### Índices Críticos
- `idx_service_request_code` - Para búsquedas por código
- `idx_service_request_status` - Para filtrado por estado
- `idx_service_request_created` - Para consultas temporales
- `idx_service_request_user` - Para tickets por usuario

### Consultas Optimizadas
- Usar vistas predefinidas para consultas frecuentes
- Implementar paginación con procedimientos almacenados
- Considerar particionamiento para tablas grandes

## Depuración y Troubleshooting

### Comandos Útiles
```sql
-- Verificar triggers
SHOW TRIGGERS;

-- Verificar procedimientos
SHOW PROCEDURE STATUS;

-- Verificar vistas
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Analizar consulta lenta
EXPLAIN SELECT * FROM Service_Request WHERE Status = 'Pendiente';
```

### Problemas Comunes
1. **Error de foreign key**: Verificar orden de ejecución de scripts
2. **Error de código duplicado**: El trigger genera códigos automáticamente
3. **Problemas de charset**: Usar UTF8MB4 para soporte completo

## Soporte y Documentación

### Para problemas o sugerencias:
1. Revisar el error log de MySQL
2. Verificar las constraints y triggers
3. Consultar la documentación de procedimientos
4. Revisar las vistas optimizadas
5. Usar `EXPLAIN` para optimizar consultas lentas

### Recursos Adicionales
- Documentación oficial de MySQL 8.0
- Guías de optimización de InnoDB
- Mejores prácticas para diseño de bases de datos

---

**Nota**: Este sistema está diseñado específicamente para la estructura municipal venezolana y puede ser adaptado según las necesidades particulares de cada alcaldía. La versión MySQL incluye todas las optimizaciones y características específicas del motor InnoDB.
