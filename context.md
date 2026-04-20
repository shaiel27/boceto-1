# CONTEXTO DEL PROYECTO

Estoy creando un **Sistema de Gestión de Tickets de Servicio Técnico para una Alcaldía** usando **PHP 8.2+ puro (sin frameworks)** con MySQL.

## ⚠️ ACLARACIÓN CRÍTICA: MODELO DE ACCESO
**Los ciudadanos NO se loguean en este sistema.** El acceso autenticado está reservado exclusivamente para personal interno:

| Rol | Puede Login | Función Principal |
|-----|-------------|------------------|
| `SUPER_ADMIN` | ✅ | Gestión global: usuarios, roles, configuración, auditoría |
| `DIRECTOR` | ✅ | Supervisión de toda una Dirección (múltiples Divisiones) |
| `DIVISION_HEAD` | ✅ | Gestión de tickets y técnicos de su División |
| `COORDINATION_HEAD` | ✅ | Creación de tickets, asignación inicial, seguimiento en su Coordinación |
| `TECHNICIAN` | ✅ | Recepción de tickets asignados, actualización de estado, comentarios |

### Implicaciones Técnicas:
1. **Autenticación**: Solo se valida contra usuarios con `is_system_user = TRUE` (nuevo campo en `Users`)
2. **Creación de Tickets**: 
   - Vía interna: Un `COORDINATION_HEAD` u otro staff crea el ticket **en nombre de un ciudadano** (se registra el CI/nombre del ciudadano como metadata)
   - Vía pública (opcional futuro): Endpoint sin auth con captcha + validación estricta → crea ticket con `Fk_Users = NULL` o usuario "genérico"
3. **Consultas**: Los técnicos solo ven tickets asignados; los jefes ven tickets de su área; el admin ve todo. **Nunca se exponen datos de ciudadanos a roles no autorizados**.
4. **Entidad User**: Distinguir entre `SystemUser` (puede login) y `CitizenRecord` (solo datos de contacto para trazabilidad).

---

## 🗄️ Base de Datos (YA DEFINIDA - Ajustes Sugeridos)
El esquema MySQL actual requiere una pequeña modificación para soportar este modelo:

```sql
-- Agregar campo para distinguir usuarios del sistema
ALTER TABLE Users 
ADD COLUMN is_system_user BOOLEAN DEFAULT FALSE AFTER Fk_Role,
ADD COLUMN last_login_at TIMESTAMP NULL AFTER created_at;

-- Índices para optimizar login y filtrado
CREATE INDEX idx_users_system ON Users(is_system_user, Email);
CREATE INDEX idx_users_active ON Users(is_system_user, Status);

-- (Opcional) Tabla separada para ciudadanos externos si se prefiere normalizar:
-- CREATE TABLE Citizens (...); -- Pero por simplicidad, usamos Users con is_system_user=FALSE