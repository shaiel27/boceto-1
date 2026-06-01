# Diccionario de Datos — tickets_system

## 1. Role

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Role | INT | NO | PK | AUTO_INCREMENT | Identificador único del rol |
| Role | VARCHAR(20) | NO | UNIQUE | — | Nombre del rol (Admin, Tecnico, Jefe, Auditor) |
| Description | TEXT | SÍ | — | NULL | Descripción del rol |

## 2. Users

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Users | INT | NO | PK | AUTO_INCREMENT | Identificador único del usuario |
| Fk_Role | INT | SÍ | FK → Role(ID_Role) | NULL | Rol asignado al usuario |
| Email | VARCHAR(100) | NO | UNIQUE | — | Correo electrónico del usuario |
| Password | VARCHAR(255) | NO | — | — | Contraseña hasheada |
| Username | VARCHAR(100) | NO | UNIQUE | — | Nombre de usuario único |
| Full_Name | VARCHAR(200) | NO | — | — | Nombre completo del usuario |
| is_system_user | BOOLEAN | SÍ | — | FALSE | Indica si es un usuario del sistema |
| last_login_at | TIMESTAMP | SÍ | — | NULL | Fecha y hora del último inicio de sesión |
| created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de creación del registro |

## 3. Boss

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Boss | INT | NO | PK | AUTO_INCREMENT | Identificador único del jefe |
| Name_Boss | VARCHAR(200) | NO | — | — | Nombre del jefe |
| Pronoun | VARCHAR(20) | SÍ | — | NULL | Pronombre de tratamiento |
| Fk_User | INT | SÍ | FK → Users(ID_Users) | NULL | Relación con el usuario (UNIQUE) |

## 4. Office

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Office | INT | NO | PK | AUTO_INCREMENT | Identificador único de la oficina |
| Name_Office | VARCHAR(100) | NO | — | — | Nombre de la oficina |
| Office_Type | VARCHAR(20) | NO | — | — | Tipo de oficina |
| Fk_Parent_Office | INT | SÍ | FK → Office(ID_Office) | NULL | Oficina padre (jerarquía) |
| Fk_Boss_ID | INT | SÍ | FK → Boss(ID_Boss) | NULL | Jefe asignado a la oficina |
| created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de creación |

## 5. Technicians

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Technicians | INT | NO | PK | AUTO_INCREMENT | Identificador único del técnico |
| Fk_Users | INT | SÍ | FK → Users(ID_Users) | NULL | Relación con el usuario (UNIQUE) |
| First_Name | VARCHAR(50) | NO | — | — | Nombre del técnico |
| Last_Name | VARCHAR(50) | NO | — | — | Apellido del técnico |
| Fk_Lunch_Block | INT | SÍ | — | NULL | Bloque de almuerzo asignado |
| Status | VARCHAR(20) | SÍ | — | 'Disponible' | Estado del técnico |
| created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de creación |

## 6. TI_Service

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_TI_Service | INT | NO | PK | AUTO_INCREMENT | Identificador único del servicio TI |
| Type_Service | VARCHAR(50) | NO | — | — | Tipo de servicio (Redes, Soporte, Programación) |
| Details | TEXT | SÍ | — | NULL | Detalles del servicio |

## 7. Technicians_Service

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Technicians_Service | INT | NO | PK | AUTO_INCREMENT | Identificador único de la relación técnico-servicio |
| Fk_TI_Service | INT | SÍ | FK → TI_Service(ID_TI_Service) | NULL | Servicio TI asignado |
| Fk_Technicians | INT | SÍ | FK → Technicians(ID_Technicians) | NULL | Técnico asignado |
| Status | VARCHAR(15) | SÍ | — | 'Activo' | Estado de la asignación |
| created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de creación |

## 8. Service_Problems_Catalog

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Problem_Catalog | INT | NO | PK | AUTO_INCREMENT | Identificador único del problema |
| Fk_TI_Service | INT | SÍ | FK → TI_Service(ID_TI_Service) | NULL | Servicio TI al que pertenece el problema |
| Problem_Name | VARCHAR(200) | NO | — | — | Nombre del problema |
| Typical_Description | TEXT | SÍ | — | NULL | Descripción típica del problema |
| Estimated_Severity | VARCHAR(50) | SÍ | — | NULL | Severidad estimada (Alta, Media, Baja) |

## 9. Technician_Schedules

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Schedule | INT | NO | PK | AUTO_INCREMENT | Identificador único del horario |
| Fk_Technician | INT | SÍ | FK → Technicians(ID_Technicians) | NULL | Técnico asociado |
| Day_Of_Week | VARCHAR(20) | NO | — | — | Día de la semana |
| Work_Start_Time | TIME | SÍ | — | '08:00:00' | Hora de inicio de jornada |
| Work_End_Time | TIME | NO | — | — | Hora de fin de jornada |

## 10. Lunch_Blocks

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Lunch_Block | INT | NO | PK | AUTO_INCREMENT | Identificador único del bloque de almuerzo |
| Block_Name | VARCHAR(50) | NO | — | — | Nombre del bloque |
| Start_Time | TIME | NO | — | — | Hora de inicio del bloque |
| End_Time | TIME | NO | — | — | Hora de fin del bloque |

## 11. Service_Permissions

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Permission | INT | NO | PK | AUTO_INCREMENT | Identificador único del permiso |
| Fk_TI_Service | INT | SÍ | FK → TI_Service(ID_TI_Service) | NULL | Servicio TI |
| Fk_Office | INT | SÍ | FK → Office(ID_Office) | NULL | Oficina |
| Is_Allowed | BOOLEAN | SÍ | — | TRUE | Indica si el permiso está concedido |

## 12. Request_Settings

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Setting | INT | NO | PK | AUTO_INCREMENT | Identificador único de la configuración |
| Fk_Office_ID | INT | SÍ | FK → Office(ID_Office) | NULL | Oficina asociada |
| Can_Request_Directly | BOOLEAN | SÍ | — | TRUE | Permite solicitudes directas sin aprobación |
| Must_Be_Approved_By_Superior | BOOLEAN | SÍ | — | FALSE | Requiere aprobación de un superior |

## 13. Software_Systems

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_System | INT | NO | PK | AUTO_INCREMENT | Identificador único del sistema |
| System_Name | VARCHAR(200) | NO | — | — | Nombre del sistema de software |
| Description | TEXT | SÍ | — | NULL | Descripción del sistema |
| Status | VARCHAR(20) | SÍ | — | 'Activo' | Estado del sistema |

## 14. Office_Systems

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Office_System | INT | NO | PK | AUTO_INCREMENT | Identificador único de la relación oficina-sistema |
| Fk_Office_ID | INT | SÍ | FK → Office(ID_Office) | NULL | Oficina |
| Fk_System_ID | INT | SÍ | FK → Software_Systems(ID_System) | NULL | Sistema de software |

## 15. Service_Request (Tickets)

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Service_Request | INT | NO | PK | AUTO_INCREMENT | Identificador único del ticket |
| Ticket_Code | VARCHAR(50) | SÍ | UNIQUE | NULL | Código único del ticket |
| Fk_Office | INT | SÍ | FK → Office(ID_Office) | NULL | Oficina que solicita |
| Fk_User_Requester | INT | SÍ | FK → Users(ID_Users) | NULL | Usuario solicitante |
| Fk_TI_Service | INT | SÍ | FK → TI_Service(ID_TI_Service) | NULL | Servicio TI solicitado |
| Fk_Problem_Catalog | INT | SÍ | FK → Service_Problems_Catalog(ID_Problem_Catalog) | NULL | Problema del catálogo |
| Fk_Boss_Requester | INT | SÍ | FK → Boss(ID_Boss) | NULL | Jefe que autoriza la solicitud |
| Fk_Software_System | INT | SÍ | FK → Software_Systems(ID_System) | NULL | Sistema de software afectado |
| Subject | VARCHAR(500) | NO | — | — | Asunto del ticket |
| Property_Number | VARCHAR(50) | SÍ | — | NULL | Número de propiedad del equipo |
| Description | TEXT | SÍ | — | NULL | Descripción detallada del problema |
| System_Priority | VARCHAR(50) | SÍ | — | 'Media' | Prioridad del ticket |
| Resolution_Notes | TEXT | SÍ | — | NULL | Notas de resolución |
| Status | VARCHAR(50) | SÍ | — | 'Pendiente' | Estado del ticket |
| Created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de creación |
| Resolved_at | TIMESTAMP | SÍ | — | NULL | Fecha de resolución |

## 16. Ticket_Technicians

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Ticket_Technician | INT | NO | PK | AUTO_INCREMENT | Identificador único de la asignación |
| Fk_Service_Request | INT | SÍ | FK → Service_Request(ID_Service_Request) | NULL | Ticket asignado |
| Fk_Technician | INT | SÍ | FK → Technicians(ID_Technicians) | NULL | Técnico asignado |
| Is_Lead | BOOLEAN | SÍ | — | FALSE | Indica si es el técnico principal |
| Assignment_Role | VARCHAR(100) | SÍ | — | NULL | Rol en la asignación |
| Assigned_At | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de asignación |
| Fk_Assigned_By | INT | SÍ | FK → Users(ID_Users) | NULL | Usuario que asignó |
| Status | VARCHAR(50) | SÍ | — | 'Activo' | Estado de la asignación |

## 17. Ticket_Comments

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Comment | INT | NO | PK | AUTO_INCREMENT | Identificador único del comentario |
| Fk_Service_Request | INT | SÍ | FK → Service_Request(ID_Service_Request) | NULL | Ticket al que pertenece |
| Fk_User | INT | SÍ | FK → Users(ID_Users) | NULL | Usuario que comenta |
| Comment | TEXT | NO | — | — | Contenido del comentario |
| Created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha del comentario |

## 18. Ticket_Attachments

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Attachment | INT | NO | PK | AUTO_INCREMENT | Identificador único del adjunto |
| Fk_Service_Request | INT | SÍ | FK → Service_Request(ID_Service_Request) | NULL | Ticket asociado |
| Fk_Comment | INT | SÍ | FK → Ticket_Comments(ID_Comment) | NULL | Comentario asociado |
| Fk_User | INT | SÍ | FK → Users(ID_Users) | NULL | Usuario que subió el archivo |
| File_Name | VARCHAR(255) | NO | — | — | Nombre del archivo |
| File_Path | VARCHAR(1024) | NO | — | — | Ruta del archivo en el sistema |
| File_Type | VARCHAR(100) | SÍ | — | NULL | Tipo MIME del archivo |
| File_Size | INT | SÍ | — | NULL | Tamaño del archivo en bytes |
| Uploaded_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de subida |

## 19. Ticket_Timeline

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Timeline | INT | NO | PK | AUTO_INCREMENT | Identificador único del evento |
| Fk_Service_Request | INT | SÍ | FK → Service_Request(ID_Service_Request) | NULL | Ticket asociado |
| Fk_User_Actor | INT | SÍ | FK → Users(ID_Users) | NULL | Usuario que realizó la acción |
| Action_Description | TEXT | SÍ | — | NULL | Descripción de la acción |
| Old_Status | VARCHAR(50) | SÍ | — | NULL | Estado anterior |
| New_Status | VARCHAR(50) | SÍ | — | NULL | Estado nuevo |
| Event_Date | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha del evento |

## 20. audit_logs

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| id | INT | NO | PK | AUTO_INCREMENT | Identificador único del registro de auditoría |
| user_id | INT | SÍ | — | NULL | ID del usuario que realizó la acción |
| email | VARCHAR(100) | SÍ | — | NULL | Correo del usuario |
| action | VARCHAR(50) | NO | — | — | Acción realizada |
| entity_type | VARCHAR(50) | SÍ | — | NULL | Tipo de entidad afectada |
| entity_id | INT | SÍ | — | NULL | ID de la entidad afectada |
| description | TEXT | SÍ | — | NULL | Descripción del evento |
| data | JSON | SÍ | — | NULL | Datos adicionales en formato JSON |
| severity | ENUM('info','warning','critical') | SÍ | — | 'info' | Severidad del evento |
| success | TINYINT(1) | SÍ | — | 1 | Indica si la acción fue exitosa |
| ip_address | VARCHAR(45) | SÍ | — | NULL | Dirección IP del usuario |
| user_agent | VARCHAR(500) | SÍ | — | NULL | User-Agent del navegador |
| created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha del registro |

## 21. Notifications

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Notification | INT | NO | PK | AUTO_INCREMENT | Identificador único de la notificación |
| Fk_User | INT | NO | FK → Users(ID_Users) ON DELETE CASCADE | — | Usuario destinatario |
| Type | VARCHAR(100) | NO | — | — | Tipo de notificación |
| Title | VARCHAR(255) | NO | — | — | Título de la notificación |
| Message | TEXT | NO | — | — | Mensaje de la notificación |
| Fk_Service_Request | INT | SÍ | FK → Service_Request(ID_Service_Request) ON DELETE SET NULL | NULL | Ticket relacionado |
| Is_Read | TINYINT(1) | NO | — | 0 | Indica si fue leída |
| Metadata | JSON | SÍ | — | NULL | Metadatos adicionales |
| Created_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de creación |
| Updated_at | TIMESTAMP | NO | — | CURRENT_TIMESTAMP ON UPDATE | Fecha de última actualización |

## 22. Ticket_Escalations

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Escalation | INT | NO | PK | AUTO_INCREMENT | Identificador único de la escalación |
| Fk_Service_Request | INT | NO | — | — | Ticket escalado |
| Original_Service_ID | INT | NO | — | — | ID del servicio original |
| Escalated_Service_ID | INT | NO | — | — | ID del servicio al que se escaló |
| Escalated_At | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de escalación |

## 23. Pending_Ticket_Alerts

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Alert | INT | NO | PK | AUTO_INCREMENT | Identificador único de la alerta |
| Fk_Service_Request | INT | NO | — | — | Ticket asociado |
| Alert_Type | VARCHAR(100) | NO | — | — | Tipo de alerta |
| Notified_At | TIMESTAMP | SÍ | — | NULL | Fecha de notificación |
| Resolved_At | TIMESTAMP | SÍ | — | NULL | Fecha de resolución |
| Resolution_Notes | VARCHAR(1000) | SÍ | — | NULL | Notas de resolución |

## 24. Escalation_Config

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Config | INT | NO | PK | AUTO_INCREMENT | Identificador único de la configuración |
| Priority_Level | VARCHAR(50) | NO | — | — | Nivel de prioridad |
| Hours_Threshold | INT | NO | — | 4 | Umbral en horas para escalar |
| Notify_Admins | BOOLEAN | SÍ | — | TRUE | Notificar a administradores |
| Auto_Escalate | BOOLEAN | SÍ | — | FALSE | Escalar automáticamente |

## 25. Assistance_Requests

| Columna | Tipo | Nulable | PK/FK | Default | Descripción |
|---------|------|---------|-------|---------|-------------|
| ID_Request | INT | NO | PK | AUTO_INCREMENT | Identificador único de la solicitud de asistencia |
| Fk_Ticket | INT | NO | FK → Service_Request(ID_Service_Request) | — | Ticket asociado |
| Fk_Requesting_Technician | INT | NO | FK → Users(ID_Users) | — | Técnico que solicita ayuda |
| Fk_Assigned_Technician | INT | SÍ | FK → Users(ID_Users) | NULL | Técnico asignado para ayudar |
| Status | ENUM('PENDIENTE','ASIGNADO','RECHAZADO','CANCELADO') | SÍ | — | 'PENDIENTE' | Estado de la solicitud |
| Requested_At | TIMESTAMP | NO | — | CURRENT_TIMESTAMP | Fecha de solicitud |
| Updated_At | TIMESTAMP | SÍ | — | NULL | Fecha de última actualización |
| Notification_Count | INT | SÍ | — | 0 | Contador de notificaciones |
| Last_Notified_At | TIMESTAMP | SÍ | — | NULL | Última notificación enviada |

---

## Resumen de Relaciones (Diagrama conceptual)

```
Role ──< Users ── Boss
                  │
Office ──< Service_Request ──> Service_Problems_Catalog
  │         │                    │
  │         │                    └── TI_Service ──< Technicians_Service >── Technicians
  │         │                                              │
  │         │                                              └── Technician_Schedules
  │         │                                              └── Lunch_Blocks
  │         │
  │         ├── Ticket_Technicians >── Technicians
  │         ├── Ticket_Comments >── Users
  │         ├── Ticket_Attachments >── Users, Ticket_Comments
  │         ├── Ticket_Timeline >── Users
  │         ├── Ticket_Escalations
  │         ├── Pending_Ticket_Alerts
  │         ├── Notifications >── Users
  │         └── Assistance_Requests >── Users, Users
  │
  ├── Service_Permissions >── TI_Service
  ├── Request_Settings
  ├── Office_Systems >── Software_Systems
  └── audit_logs
```

> **Notación:** `──<` = Uno a muchos, `>──` = Muchos a uno, `>`──` = Muchos a muchos.
