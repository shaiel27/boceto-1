# Sistema de Gestión de Tickets - Alcaldía de San Cristóbal

## 📌 Visión General
Sistema interno de soporte técnico (Helpdesk) para la Alcaldía del Municipio San Cristóbal. El objetivo es centralizar reportes de fallas de red, hardware y software de las distintas dependencias municipales.

## 🛠 Stack Tecnológico
- **Frontend:** React (Vite) + Tailwind CSS + Axios.
- **Backend:** PHP (API RESTful) con PDO.
- **Base de Datos:** MySQL (alcaldia_tickets_db).
- **Arquitectura:** Desacoplada (Frontend y Backend en carpetas separadas).

## 🗄️ Estructura de la Base de Datos (MySQL)
El sistema se rige por las siguientes entidades clave:
- `Users`: Almacena Admin (1), Técnicos (9) y Usuarios (10).
- `Technicians`: Relación 1:1 con Users para gestionar especialidades y estado.
- `Office`: 10 oficinas principales (Hacienda, Registro Civil, Despacho, etc.).
- `Service_Request`: Tabla principal de tickets.
  - **Estados:** `Pendiente`, `En progreso`, `Verificada`, `Cerrada`.
  - **Prioridades:** `Baja`, `Media`, `Alta`, `Crítica`.
- `TI_Service`: Áreas de atención (Redes, Soporte Técnico, Programación, Telefonía IP).
- `Ticket_Timeline` & `Ticket_Assignments_History`: Tablas para auditoría y trazabilidad.

## 🎨 Identidad Visual (Look & Feel)
Basado en el portal institucional `alcaldiasancristobal.gob.ve`:
- **Color Primario:** Azul Institucional (Logo y Nav).
- **Color de Énfasis:** Rojo Coral (Alertas y Escudo).
- **Fondo:** Menta/Beige muy suave (Sección actualidad).
- **Componentes:** Estilo limpio, profesional, bordes redondeados (`rounded-xl`).

## 👥 Roles y Permisos
1. **Cliente (Usuario):** Puede crear tickets, ver el estado de sus solicitudes y añadir comentarios.
2. **Técnico:** Puede ver su cola de trabajo asignada, cambiar estados de tickets y añadir notas técnicas.
3. **Admin:** Control total, asignación manual de técnicos, visualización de métricas globales y gestión de usuarios/oficinas.

## 📁 Organización de Archivos Sugerida
/backend/api/ -> Endpoints en PHP (login.php, get_tickets.php, etc.)
/frontend/src/ -> Componentes de React
  /components/ui/ -> Botones, Badges, Inputs.
  /components/layout/ -> Sidebar, Topbar.
  /pages/ -> Dashboard, TicketDetail, Login.
  /services/ -> api.js (Configuración de Axios).

## 🚀 Reglas de Desarrollo para la IA
- Siempre usa **Tailwind CSS** para los estilos.
- Las respuestas del backend deben ser siempre en **JSON**.
- Al realizar consultas SQL, asegúrate de usar **Prepared Statements (PDO)**.
- El código de los tickets debe seguir el formato `TK-XXXX` o `SC-2026-XXXX`.