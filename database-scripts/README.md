# Scripts de Base de Datos - Sistema de Gestión de Tickets Municipal

## Descripción

Este directorio contiene los scripts SQL necesarios para crear y poblar la base de datos del Sistema de Gestión de Tickets de la Alcaldía del Municipio San Cristóbal.

## Archivos

- **schema.sql**: Script de definición de la estructura de la base de datos (DDL)
- **data.sql**: Script de inserción de datos de ejemplo (DML)
- **README.md**: Este archivo de documentación

## Características de la Base de Datos

### Módulos Implementados

1. **Módulo de Usuarios y Acceso**
   - Roles de usuario (Administrador, Director, Jefe de División, Coordinador, Técnico TI, Solicitante)
   - Gestión de usuarios con autenticación

2. **Módulo de Estructura Institucional**
   - Direcciones (niveles jerárquicos superiores)
   - Divisiones (subdivisiones de direcciones)
   - Coordinaciones (oficinas operativas)
   - Asignación de responsables a cada nivel

3. **Módulo de Técnicos y Servicios TI**
   - Catálogo de servicios TI (Redes, Soporte, Programación, Seguridad, Telefonía, Impresoras)
   - Catálogo de problemas por servicio (diccionario de problemas típicos)
   - Permisos de servicios por área institucional
   - Asignación de técnicos a servicios

4. **Módulo de Horarios y Disponibilidad**
   - Bloques de horario de almuerzo
   - Horarios de trabajo de técnicos por día

5. **Módulo de Gestión de Tickets**
   - Creación de tickets con código automático
   - Asignación múltiple de técnicos a tickets
   - Historial de asignaciones
   - Comentarios en tickets
   - Adjuntos de tickets
   - Seguimiento de estado y prioridad

## Instrucciones de Instalación

### Requisitos Previos

- MySQL 8.0 o superior
- Cliente de MySQL (mysql command line client o herramienta gráfica como MySQL Workbench, DBeaver, etc.)

### Pasos de Instalación

1. **Abrir el cliente de MySQL**
   ```bash
   mysql -u root -p
   ```

2. **Ejecutar el script de estructura**
   ```bash
   source /ruta/a/database-scripts/schema.sql
   ```
   
   O desde la línea de comandos:
   ```bash
   mysql -u root -p < /ruta/a/database-scripts/schema.sql
   ```

3. **Ejecutar el script de datos**
   ```bash
   source /ruta/a/database-scripts/data.sql
   ```
   
   O desde la línea de comandos:
   ```bash
   mysql -u root -p < /ruta/a/database-scripts/data.sql
   ```

### Notas Importantes

- El script `schema.sql` crea una base de datos llamada `tickets_municipal` y elimina la base de datos si ya existe. **CUIDADO: Esto borrará todos los datos existentes.**
- Las contraseñas de usuario en el script `data.sql` están hasheadas con bcrypt. La contraseña por defecto para todos los usuarios es: `password123`
- **IMPORTANTE**: En producción, debe cambiar todas las contraseñas por defecto inmediatamente después de la instalación.

## Usuarios de Ejemplo

El script `data.sql` crea los siguientes usuarios (todos con contraseña: `password123`):

### Administradores
- **Carlos Mendoza** (ID: 1) - carlos.mendoza@alcaldia.gob.ve

### Directores
- **María González** (ID: 2) - maria.gonzalez@alcaldia.gob.ve (Dirección de Tecnología)
- **José Rodríguez** (ID: 3) - jose.rodriguez@alcaldia.gob.ve (Dirección de Administración)

### Jefes de División
- **Ana Martínez** (ID: 4) - ana.martinez@alcaldia.gob.ve
- **Pedro López** (ID: 5) - pedro.lopez@alcaldia.gob.ve

### Coordinadores
- **Luis Sánchez** (ID: 6) - luis.sanchez@alcaldia.gob.ve
- **Carmen Pérez** (ID: 7) - carmen.perez@alcaldia.gob.ve
- **Roberto Díaz** (ID: 8) - roberto.diaz@alcaldia.gob.ve

### Técnicos TI
- **Miguel Fernández** (ID: 9, Técnico ID: 1) - miguel.fernandez@alcaldia.gob.ve (Especialista en Redes y Seguridad)
- **Laura Gómez** (ID: 10, Técnico ID: 2) - laura.gomez@alcaldia.gob.ve (Especialista en Soporte e Impresoras)
- **Diego Torres** (ID: 11, Técnico ID: 3) - diego.torres@alcaldia.gob.ve (Especialista en Programación)
- **Sofía Ramírez** (ID: 12, Técnico ID: 4) - sofia.ramirez@alcaldia.gob.ve (Especialista en Soporte General)

### Solicitantes
- **Jorge Castro** (ID: 13) - jorge.castro@alcaldia.gob.ve
- **Elena Rojas** (ID: 14) - elena.rojas@alcaldia.gob.ve
- **Ricardo Morales** (ID: 15) - ricardo.morales@alcaldia.gob.ve
- **Patricia Herrera** (ID: 16) - patricia.herrera@alcaldia.gob.ve

## Vistas Útiles

El script `schema.sql` crea las siguientes vistas para facilitar las consultas:

### v_tickets_completos
Vista que muestra información completa de los tickets incluyendo:
- Datos del ticket (código, asunto, descripción, estado, prioridad)
- Información del solicitante
- Oficina de origen
- Tipo de servicio y problema
- Técnicos asignados

### v_tecnicos_disponibilidad
Vista que muestra información de técnicos incluyendo:
- Datos personales
- Servicios asignados
- Horario de almuerzo
- Estado actual

### v_catalogo_problemas
Vista que muestra el catálogo de problemas con:
- Tipo de servicio
- Nombre del problema
- Descripción típica
- Severidad estimada
- Cantidad de tickets asociados

## Triggers Implementados

### tr_generate_ticket_code
Genera automáticamente un código de ticket en el formato `TTT-NNNNNN` donde:
- `TTT`: Prefijo de 3 letras basado en el tipo de servicio
- `NNNNNN`: Número secuencial de 6 dígitos

### tr_update_resolved_at
Actualiza automáticamente la fecha de resolución cuando el estado del ticket cambia a "Resuelto".

## Índices

El script `schema.sql` crea índices en las siguientes tablas para optimizar el rendimiento:

- **Service_Request**: ticket_code, status, priority, created_at, user, coordination, service
- **Users**: email, CI, role
- **Technicians**: status, user
- **Ticket_Technicians**: ticket, technician
- **Service_Problems_Catalog**: service, severity

## Estructura Jerárquica de la Institución

```
Dirección de Tecnología e Información
├── División de Infraestructura de Redes
│   ├── Coordinación de Redes LAN/WAN
│   └── Coordinación de Conectividad Internet
├── División de Soporte Técnico
│   ├── Coordinación de Mesa de Ayuda
│   └── Coordinación de Mantenimiento de Equipos
└── División de Desarrollo de Software
    ├── Coordinación de Desarrollo Web
    └── Coordinación de Desarrollo Móvil

Dirección de Administración y Finanzas
└── División de Recursos Humanos
    ├── Coordinación de Nómina
    └── Coordinación de Beneficios
```

## Seguridad

- Todas las contraseñas están hasheadas con bcrypt
- Se aplican restricciones de integridad referencial (FOREIGN KEYS)
- Se implementan restricciones CHECK para validar permisos
- Los índices optimizan el rendimiento de consultas frecuentes

## Mantenimiento

### Backup de la Base de Datos

```bash
mysqldump -u root -p tickets_municipal > backup_tickets_$(date +%Y%m%d).sql
```

### Restaurar desde Backup

```bash
mysql -u root -p tickets_municipal < backup_tickets_YYYYMMDD.sql
```

### Actualizar Datos

Para actualizar datos existentes sin recrear la base de datos, puede ejecutar solo el script `data.sql` después de eliminar los datos existentes:

```sql
USE tickets_municipal;

-- Eliminar datos existentes (respetando el orden de las foreign keys)
DELETE FROM Ticket_Comments;
DELETE FROM Ticket_Assignments_History;
DELETE FROM Ticket_Technicians;
DELETE FROM Ticket_Attachments;
DELETE FROM Service_Request;
DELETE FROM Technician_Schedules;
DELETE FROM Technicians_Service;
DELETE FROM Service_Permissions;
DELETE FROM Technicians;
DELETE FROM Lunch_Blocks;
DELETE FROM Service_Problems_Catalog;
DELETE FROM TI_Service;
DELETE FROM Coordinations;
DELETE FROM Divisions;
DELETE FROM Directions;
DELETE FROM Users;
DELETE FROM Role;
```

Luego ejecutar el script `data.sql`.

## Soporte

Para cualquier problema o pregunta relacionada con la base de datos, contacte al equipo de desarrollo.

## Versión

- **Versión**: 1.0
- **Fecha**: Abril 2026
- **Motor**: MySQL 8.0+
- **Codificación**: UTF-8 (utf8mb4)
