# Sistema de Gestión de Tickets - Alcaldía de San Cristóbal

Sistema interno de soporte técnico (Helpdesk) para la Alcaldía del Municipio San Cristóbal. Centraliza reportes de fallas de red, hardware y software de las distintas dependencias municipales.

## 📌 Visión General

Este sistema permite a las dependencias municipales reportar incidentes técnicos de manera eficiente, asignar técnicos especializados, y dar seguimiento completo a cada solicitud de servicio hasta su resolución.

## 🛠 Stack Tecnológico

- **Frontend:** React (TypeScript) + React Router + Lucide React
- **Backend:** PHP (API RESTful) con PDO
- **Base de Datos:** MySQL (alcaldia_tickets_db)
- **Arquitectura:** Desacoplada (Frontend y Backend en carpetas separadas)

## ✨ Características Principales

### Gestión de Tickets
- Creación de tickets con categorización por tipo de servicio
- Asignación automática y manual de técnicos
- Seguimiento de estados: Pendiente, En progreso, Verificada, Cerrada
- Sistema de prioridades: Baja, Media, Alta, Crítica
- Línea de tiempo de actividad por ticket
- Comentarios y notas técnicas

### Roles de Usuario
- **Cliente (Usuario):** Crear tickets, ver estado de solicitudes, añadir comentarios
- **Técnico:** Ver cola de trabajo, cambiar estados, añadir notas técnicas
- **Admin:** Control total, asignación manual, métricas globales, gestión de usuarios/oficinas

### Reportes y Métricas
- 6 tipos de reportes predefinidos
- Filtros avanzados por fecha, estado, oficina, prioridad
- Exportación en múltiples formatos (PDF, Excel, CSV)
- Estadísticas en tiempo real y KPIs
- Análisis de tiempos de respuesta
- Distribución por oficinas y tipos de servicio

### Interfaz de Usuario
- Diseño moderno y responsive
- Identidad visual institucional
- Navegación intuitiva con sidebar
- Dashboard con métricas en tiempo real
- Buscador integrado de tickets

## 🗄️ Estructura de la Base de Datos

### Entidades Principales
- `Users`: Almacena Admin (1), Técnicos (9) y Usuarios (10)
- `Technicians`: Relación 1:1 con Users para especialidades y estado
- `Office`: 10 oficinas principales (Hacienda, Registro Civil, Despacho, etc.)
- `Service_Request`: Tabla principal de tickets
- `TI_Service`: Áreas de atención (Redes, Soporte Técnico, Programación, Telefonía IP)
- `Ticket_Timeline`: Auditoría de cambios en tickets
- `Ticket_Assignments_History`: Historial de asignaciones

### Estados de Tickets
- `Pendiente`: Ticket creado, sin asignar
- `En progreso`: Técnico asignado trabajando
- `Verificada`: Solución aplicada, espera validación
- `Cerrada`: Ticket resuelto y validado

### Niveles de Prioridad
- `Baja`: Incidentes no críticos
- `Media`: Incidentes con impacto moderado
- `Alta`: Incidentes que afectan operaciones
- `Crítica`: Emergencias que requieren atención inmediata

## 🎨 Identidad Visual

Basado en el portal institucional `alcaldiasancristobal.gob.ve`:
- **Color Primario:** Azul Institucional (Logo y Navegación)
- **Color de Énfasis:** Rojo Coral (Alertas y Escudo)
- **Fondo:** Menta/Beige muy suave (Secciones)
- **Estilo:** Limpio, profesional, bordes redondeados

## 📁 Estructura del Proyecto

```
boceto-1/
├── tickets-frontend/          # Aplicación React (Frontend)
│   ├── public/                # Archivos estáticos
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── dashboard/    # Componentes del Dashboard
│   │   │   ├── admin/        # Componentes de administración
│   │   │   └── ui/           # Componentes UI reutilizables
│   │   ├── contexts/         # Contextos de React
│   │   ├── pages/            # Páginas principales
│   │   ├── App.tsx           # Componente principal
│   │   └── index.tsx         # Punto de entrada
│   ├── package.json          # Dependencias del frontend
│   └── README.md             # Documentación del frontend
├── tickets-backend/           # API PHP (Backend)
├── database-scripts/          # Scripts de base de datos
│   ├── schema.sql            # Esquema de la BD
│   └── data.sql              # Datos iniciales
├── consultas.sql              # Consultas SQL de referencia
├── datos_insercion.sql        # Scripts de inserción
├── sql Tickets1.sql           # Script SQL adicional
├── Proyect_Context.md         # Contexto del proyecto
└── README.md                  # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- PHP (v7.4 o superior)
- MySQL (v5.7 o superior)
- Servidor web (Apache/Nginx)

### Configuración del Frontend

```bash
cd tickets-frontend
npm install
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Configuración del Backend

1. Configurar el servidor web para apuntar a la carpeta `tickets-backend`
2. Crear la base de datos MySQL usando los scripts en `database-scripts/`
3. Configurar las credenciales de base de datos en el archivo de configuración del backend
4. Asegurar que el servidor PHP tenga las extensiones necesarias (pdo_mysql, json)

### Configuración de la Base de Datos

```bash
# Crear la base de datos
mysql -u root -p < database-scripts/schema.sql

# Insertar datos iniciales
mysql -u root -p alcaldia_tickets_db < database-scripts/data.sql
```

## 📖 Uso del Sistema

### Para Usuarios (Clientes)
1. Iniciar sesión con credenciales proporcionadas
2. Navegar al Dashboard
3. Crear nuevo ticket desde el botón "Nuevo Ticket"
4. Llenar formulario con descripción del incidente
5. Seleccionar tipo de servicio y prioridad
6. Seguir estado del ticket desde la lista de tickets

### Para Técnicos
1. Iniciar sesión con credenciales de técnico
2. Ver cola de tickets asignados
3. Actualizar estados de tickets
4. Añadir notas técnicas y comentarios
5. Solicitar reasignación si es necesario

### Para Administradores
1. Acceso completo a todas las funcionalidades
2. Asignación manual de técnicos
3. Gestión de usuarios y oficinas
4. Visualización de reportes y métricas
5. Configuración del sistema

## 🧪 Desarrollo

### Reglas de Desarrollo
- Siempre usar **TypeScript** para el frontend
- Las respuestas del backend deben ser siempre en **JSON**
- Usar **Prepared Statements (PDO)** para consultas SQL
- El código de los tickets debe seguir el formato `TK-XXXX` o `SC-2026-XXXX`
- Seguir los principios de diseño frontend establecidos
- Mantener coherencia con la estructura de la base de datos

### Scripts Disponibles (Frontend)
```bash
npm start       # Inicia servidor de desarrollo
npm build       # Construye para producción
npm test        # Ejecuta tests
```

## 📊 Reportes Implementados

1. **Resumen General de Tickets** - Estadísticas generales y KPIs
2. **Tickets por Oficina** - Distribución por oficinas municipales
3. **Tiempos de Respuesta** - Análisis por tipo de servicio
4. **Tickets de Alta Prioridad** - Reporte de tickets críticos
5. **Evolución Mensual** - Tendencias temporales
6. **Tickets por Tipo de Servicio** - Análisis por categorías técnicas

## 🔒 Seguridad

- Autenticación basada en tokens
- Roles y permisos diferenciados
- Validación de entradas en backend
- Prepared statements para prevenir SQL injection
- HTTPS recomendado para producción

## 📝 Licencia

Este proyecto es propiedad de la Alcaldía del Municipio San Cristóbal.

## 👥 Equipo de Desarrollo

Sistema desarrollado para el Departamento de Tecnología de Información de la Alcaldía de San Cristóbal.

## 📞 Soporte

Para reportar problemas o solicitar asistencia, contactar al departamento de TI de la Alcaldía.

---

**Versión:** 1.0.0  
**Última actualización:** Abril 2026
