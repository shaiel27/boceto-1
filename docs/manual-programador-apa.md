# Manual de Programador y Diccionario de Datos

## Sistema de Gestión de Tickets para la Alcaldía de San Cristóbal

**Autor:** Dirección de Informática y Tecnología

**Año:** 2025

---

## Resumen

El presente manual describe la arquitectura técnica, los componentes de software y la estructura de datos del Sistema de Gestión de Tickets desarrollado para la Alcaldía de San Cristóbal. El sistema fue concebido como una herramienta integral para la administración del servicio de soporte tecnológico institucional, abarcando la recepción, asignación, seguimiento y resolución de solicitudes de tipo técnico. Abarca tres plataformas de acceso: una aplicación web construida con React, una aplicación móvil desarrollada en React Native con Expo, y una API REST escrita en PHP sin framework, todas ellas comunicándose con una base de datos MySQL. Este documento está dirigido a los desarrolladores que deban mantener, ampliar o depurar el sistema, y contiene tanto la descripción funcional como el diccionario de datos completo de las veintidós tablas que componen la base de datos.

*Palabras clave:* sistema de tickets, help desk, PHP, React, React Native, MySQL, Expo, API REST

---

## Capítulo 1. Introducción

### 1.1 Contexto del Proyecto

La Alcaldía de San Cristóbal, como entidad municipal, enfrenta cotidianamente una cantidad considerable de solicitudes de soporte técnico provenientes de sus distintas direcciones, divisiones y coordinaciones. Hasta el momento de este desarrollo, la gestión de dichas solicitudes se realizaba de forma manual o mediante herramientas no especializadas, lo cual generaba demoras en la asignación, dificultad para dar seguimiento y ausencia de métricas confiables sobre el rendimiento del equipo de tecnologías de la información.

El Sistema de Gestión de Tickets surge como respuesta a esa necesidad. La idea central es bastante directa: cada vez que un empleado de alguna dependencia municipal tiene un problema con su computadora, su red, o algún sistema de software, genera un ticket que ingresa al sistema, y desde ahí se encarga un técnico hasta resolverlo. Todo queda registrado, todo tiene seguimiento, y al final del día se pueden sacar reportes para saber cuánto tardamos, qué tipo de problemas son los más frecuentes, y en qué oficinas hay más demanda.

### 1.2 Objetivos

El sistema fue diseñado para cumplir varios propósitos simultáneos. En primer lugar, automatizar la creación y asignación de tickets de soporte técnico, de modo que un técnico disponible reciba la solicitud sin necesidad de que un administrador intervenga manualmente. En segundo lugar, proporcionar visibilidad completa sobre el estado de cada ticket, desde que se crea hasta que se cierra, incluyendo las incidencias que puedan surgir durante el proceso. En tercer lugar, generar información estadística que permita a la dirección de tecnologías de la información tomar decisiones basadas en datos reales.

### 1.3 Alcance

El sistema cubre tres tipos de servicio técnico: redes, soporte general y programación. Para cada uno de ellos existe un catálogo de problemas típicos, y el sistema permite registrar tanto problemas predefinidos como nuevos problemas que se incorporen con el tiempo. Los usuarios del sistema se organizan en cuatro roles: administrador, técnico, solicitante (jefe de oficina) y auditor, cada uno con funciones y permisos diferenciados.

---

## Capítulo 2. Stack Tecnológico

El sistema se compone de cuatro componentes principales que trabajan de forma coordinada. A continuación se describe cada uno de ellos en detalle.

### 2.1 Backend

El servidor fue desarrollado en PHP 8, utilizando un enfoque de arquitectura plana sin ningún framework. La razón de esta decisión fue bastante pragmática: se buscaba un código que cualquier programador con conocimientos básicos de PHP pudiera entender y modificar, sin necesidad de aprender Laravel, Symfony u otro framework que al final del día agrega complejidad para un proyecto de este tamaño. La conexión a la base de datos se maneja mediante PDO con el driver de MySQL, configurado en modo estricto con `declare(strict_types=1)` en todos los archivos (Fernández, 2019).

El servidor en desarrollo se ejecuta con el servidor integrado de PHP (`php -S`) en el puerto 8000, mientras que en producción se utiliza Apache con `mod_rewrite`. La autenticación se implementa mediante tokens JWT con el algoritmo HMAC-SHA256, sin el uso de librerías externas para la generación de los mismos. Todo el manejo del token se resuelve en un servicio interno que genera, valida y refresca los tokens.

El backend se organiza en una estructura de carpetas donde los controladores residen en `src/controllers`, los modelos en `src/models`, los servicios en `src/Services`, los DTOs en `src/DTO`, los enumeradores en `src/Enums` y el middleware de autenticación en `src/Middleware`. El punto de entrada de la aplicación es `public/index.php`, que funciona como router principal redirigiendo cada petición hacia su controlador correspondiente mediante una estructura `switch-case`. No se utiliza autoloader; cada archivo se incluye manualmente mediante `require_once`.

La clase `Database`, ubicada en `src/config/database.php`, se encarga de establecer y mantener la conexión PDO con el servidor MySQL. Configura la zona horaria en `America/Caracas` (UTC-4), establece el charset en `utf8mb4` y desactiva la emulación de prepared statements para aprovechar las ventajas de prepared statements nativos de MySQL. La conexión se singleton, es decir, se crea una sola vez y se reutiliza a lo largo de toda la ejecución del script.

### 2.2 Frontend Web

La interfaz web está construida con React 19 y TypeScript, utilizando `react-router-dom` para el manejo de rutas. El archivo `api.ts` concentra prácticamente toda la comunicación con el backend, con alrededor de tres mil líneas que cubren los distintos endpoints. Los estilos se manejan con CSS Modules y variables CSS que permiten alternar entre un tema claro y uno oscuro (Bakker, 2023).

No se usó ninguna librería de componentes como Material UI o Ant Design. En su lugar, se construyeron componentes propios que se ajustan a la identidad visual de la alcaldía, con los colores institucionales azul marino y dorado. Para la generación de reportes en PDF se emplea jsPDF junto con `jspdf-autotable`.

La estructura del frontend organiza los componentes por módulo funcional. La carpeta `components/admin/` contiene los componentes administrativos como el dashboard, la gestión de tickets, la gestión de técnicos y la gestión de usuarios. La carpeta `components/technician/` alberga los componentes del panel del técnico, incluyendo su dashboard y perfil. La carpeta `components/requester/` contiene los componentes del solicitante. La carpeta `components/public-board/` maneja el tablero público que se muestra en pantallas dentro de las oficinas. La carpeta `components/reports/` agrupa los componentes de generación de reportes, y `components/tickets/` contiene el formulario de creación de tickets.

Las rutas se definen en `App.tsx` utilizando `createBrowserRouter`, con un sistema de protección de rutas que verifica el rol del usuario antes de permitir el acceso a cada página. El contexto de autenticación (`AuthContext`) almacena el token del usuario en `sessionStorage` y proporciona métodos para verificar si el usuario tiene permisos de administrador, técnico, solicitante o auditor.

### 2.3 Aplicación Móvil

La versión móvil se desarrolló con React Native 0.81 y Expo SDK 54, empleando el sistema de enrutamiento basado en archivos que ofrece Expo Router. El manejo de estado global se resuelve con Zustand para la sesión del usuario y el estado de los tickets, mientras que para el estado del servidor se usa TanStack React Query. Los formularios utilizan `react-hook-form` combinado con Zod para la validación de datos (Expo, 2024; Zustand, 2024).

La aplicación está dirigida fundamentalmente a los técnicos y a los jefes de oficina, quienes pueden crear tickets, ver su estado y gestionar asistencia desde el celular. Los administradores también cuentan con pantallas propias para supervisar el sistema desde un dispositivo móvil.

La estructura de navegación de la app móvil se organiza en tres grupos principales. La carpeta `app/(auth)/` contiene la pantalla de login. La carpeta `app/(tabs)/admin/` agrupa las pantallas del administrador: dashboard, lista de tickets, gestión de técnicos, gestión de usuarios y reportes. La carpeta `app/(tabs)/technician/` contiene las pantallas del técnico: dashboard, detalle de ticket, perfil, solicitudes de asistencia e historial. La carpeta `app/(tabs)/requester/` incluye las pantallas del solicitante: dashboard, creación de tickets, detalle, historial y verificación de resoluciones.

Los servicios de comunicación con el backend se organizan en la carpeta `src/services/`, donde cada servicio se encarga de un dominio específico: autenticación, tickets, técnicos, usuarios, notificaciones, asistencia e historial. Los stores de Zustand, en `src/stores/`, manejan el estado de la sesión del usuario, el estado de los tickets y las notificaciones toast. Los tipos TypeScript, en `src/types/`, definen las interfaces para las respuestas de la API y los objetos de dominio (Padilla, 2020).

### 2.4 Base de Datos

Se emplea MySQL 8, con el charset `utf8mb4_unicode_ci` para garantizar el soporte completo de caracteres en español, incluyendo tildes y eñes. La zona horaria del servidor se configura en `America/Caracas` (UTC-4) mediante una instrucción `SET time_zone` que se ejecuta al establecer la conexión PDO (MySQL, 2024).

La base de datos `tickets_system` contiene veintidós tablas organizadas en módulos funcionales. El módulo de usuarios y acceso agrupa las tablas `Role`, `Users` y `Boss`. El módulo de infraestructura institucional contiene la tabla `Office`. El módulo de técnicos y servicios TI incluye las tablas `TI_Service`, `Technicians`, `Technicians_Service`, `Service_Problems_Catalog`, `Technician_Schedules` y `Lunch_Blocks`. El módulo de configuración de permisos y sistemas contiene las tablas `Service_Permissions`, `Request_Settings`, `Software_Systems` y `Office_Systems`. El módulo de gestión de tickets, que es el corazón del sistema, agrupa las tablas `Service_Request`, `Ticket_Technicians`, `Ticket_Comments`, `Ticket_Attachments` y `Ticket_Timeline`. El módulo de auditoría contiene la tabla `audit_logs`. El módulo de notificaciones contiene la tabla `Notifications`. El módulo de solicitudes de asistencia contiene la tabla `Assistance_Requests`. El módulo de escalamiento incluye las tablas `Ticket_Escalations`, `Pending_Ticket_Alerts` y `Escalation_Config`. Finalmente, la tabla `bienes_cache` almacena las respuestas temporales del SIFA.

### 2.5 Integración con SIFA

El sistema se conecta con el Sistema de Información de Fondo de Activos (SIFA) de la alcaldía para la consulta de bienes patrimoniales. Esta comunicación se realiza a través de un proxy implementado tanto en el frontend (mediante `setupProxy.js` de Create React App) como en el backend PHP, que redirige las peticiones hacia el servidor XAMPP que aloja la API de bienes en el puerto 8012. Las respuestas se almacenan en caché dentro de una tabla especial de la base de datos para evitar consultas repetitivas.

El proxy en el backend se implementa en la clase `BienesProxyService`, que recibe las peticiones del frontend en `/api/bienes` y `/api/unidades`, las reenvía al servidor XAMPP en el puerto 8012, y devuelve la respuesta al cliente. Antes de realizar cada consulta, el servicio verifica si existe una entrada válida en la tabla `bienes_cache`. Si la entrada existe y no ha expirado, se devuelve directamente desde la caché sin realizar la consulta al SIFA. Si no existe o expiró, se realiza la consulta al servidor externo y se almacena el resultado en caché para futuras consultas.

---

## Capítulo 3. Arquitectura del Sistema

### 3.1 Estructura General

El sistema se estructura en tres niveles principales. En la capa de presentación se encuentran la aplicación web, la aplicación móvil y el tablero público, este último accesible sin autenticación y diseñado para mostrarse en pantallas dentro de las oficinas. Todos estos componentes se comunican con el backend mediante peticiones HTTP REST que intercambian datos en formato JSON.

El backend actúa como punto central de toda la lógica de negocio. Recibe las peticiones, las valida, ejecuta las consultas correspondientes sobre la base de datos y devuelve las respuestas. Además, se comunica con el servidor de bienes patrimoniales cuando se requiere información sobre activos.

La capa de persistencia la conforma la base de datos MySQL con veintidós tablas organizadas en módulos funcionales, y la tabla de caché de bienes que almacena temporalmente las respuestas del SIFA.

### 3.2 Roles del Sistema

El sistema define cuatro roles con niveles de acceso distintos. El administrador tiene acceso total: puede gestionar usuarios, técnicos, oficinas, ver todos los tickets, generar reportes y consultar la auditoría. El técnico accede a su dashboard personal, ve los tickets que le están asignados, puede actualizar su estado y solicitar asistencia a otros técnicos. El solicitante, que en la práctica es un jefe de oficina, puede crear tickets para su dependencia, ver el historial de los mismos y verificar si la resolución le resulta conforme. Finalmente, el auditor tiene acceso exclusivo al módulo de auditoría, donde puede revisar los logs de actividad del sistema.

### 3.3 Flujo de un Ticket

La vida de un ticket comienza cuando un solicitante lo crea desde la interfaz web o móvil. Al momento de la creación, el sistema busca automáticamente un técnico disponible que pertenezca al servicio TI correspondiente (redes, soporte o programación). Si no hay técnicos disponibles, el ticket queda en estado pendiente hasta que alguno se libere.

Una vez asignado, el técnico cambia el estado a "en proceso" y comienza a trabajar en la resolución. Cuando considera que el problema está solucionado, pasa el ticket a "pendiente de verificación", y el solicitante evalúa si la solución es aceptable. Si el solicitante confirma, el ticket se cierra. Si no está conforme, el ticket regresa a "en proceso" pero se reasigna a un técnico distinto, excluyendo al anterior, para evitar que el mismo técnico intente resolver un problema que ya no pudo resolver la primera vez.

Existe además un mecanismo de escalamiento automático: si un ticket permanece en estado pendiente más tiempo del que su prioridad permite (una hora para prioridad crítica, cuatro para alta, doce para media y veinticuatro para baja), el sistema genera una alerta y opcionalmente escala el ticket al siguiente nivel de servicio.

### 3.4 Asignación Cruzada de Servicios

Una particularidad del sistema es la política de servicio cruzado implementada para la atención de tickets de soporte general. A partir de las dos de la tarde, si no hay técnicos de soporte disponibles, el sistema puede asignar técnicos de redes para cubrir los tickets de soporte. Esta política se implementó porque en la práctica, los técnicos de redes suelen tener disponibilidad en la tarde, y los tickets de soporte no requieren necesariamente conocimientos especializados en redes.

### 3.5 Asignación Automática de Técnicos

El sistema implementa un algoritmo de asignación automática que considera múltiples factores para seleccionar al técnico más adecuado para un ticket. En primer lugar, filtra los técnicos que pertenecen al servicio TI correspondiente al ticket. Luego, evalúa la disponibilidad de cada técnico, excluyendo a aquellos que estén marcados como "Inactivo" o "Fuera de Servicio". Entre los técnicos disponibles, el algoritmo selecciona al que tenga menor carga de trabajo activa, es decir, menos tickets asignados en estado "En Proceso". En caso de empate, se considera la prioridad del ticket, asignándolo preferentemente a técnicos con experiencia en problemas de alta prioridad.

Este mecanismo de asignación se ejecuta automáticamente al momento de la creación del ticket, sin necesidad de intervención del administrador. Sin embargo, el administrador siempre tiene la posibilidad de reasignar manualmente un ticket a otro técnico si lo considera necesario.

### 3.6 Generación de Códigos de Ticket

Cada ticket recibe un código único alfanumérico en el formato TTT-NNNNNN, donde TTT representan las tres primeras letras del tipo de servicio (RED para Redes, SOP para Soporte, PRO para Programación) y NNNNNN es un número secuencial de seis dígitos. La generación del código se realiza de forma atómica en el backend mediante una transacción que lee el último valor secuencial de la tabla `ticket_sequence`, incrementa el contador y devuelve el nuevo código. Este enfoque garantiza que no se generen códigos duplicados incluso bajo cargas concurrentes.

---

## Capítulo 4. Estructura del Proyecto

### 4.1 Organización de Directorios

El proyecto se organiza en tres carpetas principales. La carpeta `tickets-backend` contiene todo el servidor PHP, con los controladores en `src/controllers`, los modelos en `src/models`, los servicios en `src/Services`, y el punto de entrada en `public/index.php`. La carpeta `tickets-frontend` alberga la aplicación web de React, con los componentes organizados por módulo funcional y el servicio centralizado de API en `src/services/api.ts`. La carpeta `tickets-App` contiene la versión móvil con Expo, donde la estructura de navegación se define directamente por la disposición de archivos dentro de la carpeta `app/`.

Además existe una carpeta `database-scripts` con los scripts SQL para la creación del esquema, inserción de datos de prueba y una herramienta de reinicio de la base de datos. La carpeta `bienes` contiene los scripts PHP que sirven de puente hacia el SIFA.

### 4.2 Patrón de Controladores

El router principal, ubicado en `public/index.php`, funciona mediante una estructura `switch-case` que redirige cada endpoint hacia su controlador correspondiente. Cada controlador es un archivo PHP independiente que recibe la conexión a la base de datos, instancía los modelos necesarios y procesa la petición según el método HTTP (GET, POST, PUT o DELETE) y el parámetro `action` que se envía por la URL.

La mayoría de controladores no están encapsulados en clases, sino que son scripts planos. Esto fue una decisión deliberada para simplificar la lectura del código, aunque algunos controladores más complejos, como el del tablero público o el de reportes, sí implementan una clase con métodos estáticos.

El flujo de ejecución de una petición cualquiera es el siguiente: primero se establecen los headers CORS en función del origen de la petición. Luego se ejecuta el middleware de autenticación, que valida el token JWT si el endpoint lo requiere. Después se procesa la petición mediante la estructura `switch-case` del router, que determina qué controlador debe atender la solicitud. Finalmente, el controlador ejecuta la lógica de negocio correspondiente y devuelve una respuesta JSON con el resultado.

### 4.3 Modelos

Los modelos siguen un patrón Active Record simplificado. Cada modelo recibe la conexión PDO en su constructor y ejecuta consultas directamente sobre la tabla que le corresponde. No se utiliza ningún ORM. Las propiedades de los modelos son públicas y se mapean directamente desde los resultados de las consultas.

El modelo más importante es `ServiceRequest`, que maneja toda la lógica de negocio de los tickets: creación, consulta, actualización de estado, asignación de técnicos, comentarios y generación de reportes. Otros modelos relevantes son `Technician`, que gestiona la disponibilidad y los horarios de los técnicos; `User`, que maneja la autenticación y los perfiles; y `Notification`, que controla el sistema de notificaciones.

### 4.4 Servicios

El backend contiene nueve servicios que encapsulan la lógica de negocio transversal. El servicio `JwtService` genera y valida tokens JWT utilizando el algoritmo HMAC-SHA256, sin dependencias externas. El servicio `AuditService` registra las acciones relevantes en la tabla `audit_logs`, incluyendo información del usuario, la acción realizada, la entidad afectada y datos adicionales en formato JSON. El servicio `EscalationService` monitorea los tickets pendientes y genera alertas o escalamientos automáticos cuando se superan los umbrales de tiempo configurados por prioridad. El servicio `NotificationService` crea notificaciones para los usuarios cuando ocurren eventos relevantes, como la creación de un ticket, la asignación de un técnico o la solicitud de asistencia. El servicio `TicketService` contiene la lógica de negocio principal de los tickets, incluyendo la creación con generación automática de código, la asignación de técnicos con el algoritmo de selección automática y el manejo de los flujos de verificación e inconformidad. El servicio `ReportService` genera los distintos tipos de reportes utilizando DTOs para estructurar la información. El servicio `OfficeSyncService` sincroniza la información de oficinas desde el SIFA hacia la base de datos local.

### 4.5 DTOs

El backend utiliza trece Data Transfer Objects para estructurar la información que se transfiere entre capas. Los DTOs más relevantes incluyen `CreateTicketDTO`, que encapsula los datos necesarios para la creación de un ticket; `DashboardStatsDTO`, que agrupa las estadísticas del panel administrativo; `WeeklyReportDTO`, que contiene la información del reporte semanal de técnicos; y `NotificationDTO`, que estructura los datos de las notificaciones de usuario. Los DTOs de reporte, como `GeneralSummaryDTO`, `OfficeReportDTO`, `PriorityReportDTO` y `ServiceReportDTO`, se utilizan para generar los distintos tipos de reportes con la estructura adecuada.

### 4.6 Middleware

El sistema implementa dos middlewares de seguridad. El `AuthMiddleware` ofrece dos modos de operación: `requireAuth`, que rechaza la petición con un código 401 si no se proporciona un token válido; y `optionalAuth`, que permite el acceso sin token pero si se proporciona uno lo valida y establece el contexto del usuario. Los datos del usuario autenticado se almacenan en variables de servidor (`$_SERVER['AUTH_USER_ID']`, `$_SERVER['AUTH_USER_ROLE']`) y se pueden consultar mediante métodos estáticos del middleware.

El `RoleMiddleware` verifica que el usuario autenticado tenga uno de los roles permitidos para acceder al endpoint. Si el usuario no tiene el rol requerido, se devuelve un código de error 403 (Forbidden).

---

## Capítulo 5. Autenticación y Seguridad

### 5.1 Flujo de Autenticación

Cuando un usuario ingresa sus credenciales, el frontend envía una petición POST al endpoint `/api/auth` con la acción "login". El backend verifica la contraseña contra el hash bcrypt almacenado en la tabla `Users`, genera un token JWT con un año de expiración y devuelve tanto el token como los datos del usuario. El frontend almacena el token en `sessionStorage` y lo envía en el header `Authorization` de cada petición subsiguiente.

El hash bcrypt se genera mediante la función `password_hash` de PHP con el algoritmo `PASSWORD_BCRYPT`. La verificación se realiza con `password_verify`, que compara la contraseña ingresada contra el hash almacenado. Nunca se almacena la contraseña en texto plano, ni siquiera de forma temporal (PHP Group, 2024).

### 5.2 Estructura del Token

El payload del JWT contiene el identificador del usuario, su correo electrónico, el ID del rol y el nombre del rol. El secreto usado para firmar el token se define en la variable de entorno `JWT_SECRET`, y su valor por defecto viene documentado en el archivo `.env.example`. En producción, es fundamental reemplazar este valor por uno seguro de al menos 32 caracteres.

El token tiene una expiración de un año, lo cual es una decisión práctica para un sistema interno donde los usuarios no cambian con frecuencia. Si se requiriera mayor seguridad, se podría reducir el tiempo de expiración y implementar un mecanismo de refresh token.

### 5.3 Protección de Rutas

En el frontend, las rutas se protegen mediante el componente `ProtectedRoute`, que verifica el rol del usuario antes de renderizar el componente solicitado. Si el usuario no tiene el rol permitido, se redirige a la página de login o se muestra un mensaje de acceso denegado. En la versión móvil, la protección se implementa en el layout raíz de Expo Router, que verifica el estado de autenticación antes de permitir el acceso a las pantallas protegidas.

---

## Capítulo 6. API REST

### 6.1 Convenciones Generales

Todas las respuestas del backend siguen un formato estándar. En caso de éxito, se devuelve un objeto JSON con las propiedades `success` (true), `data` (los datos solicitados) y `message` (una descripción de la operación). En caso de error, `success` es false, `message` describe el problema y, en algunos casos, se incluye un objeto `errors` con detalles por campo.

La API utiliza los verbos HTTP de forma convencional: GET para consultas, POST para creaciones y actualizaciones, PUT para actualizaciones completas y DELETE para eliminaciones. Sin embargo, debido a que el router principal se basa en un `switch-case` de PHP, la mayoría de las operaciones se implementan como peticiones POST con un parámetro `action` en la URL que determina la operación específica a ejecutar.

### 6.2 Endpoints Principales

La API expone los siguientes módulos de endpoints. El de autenticación, en `/api/auth`, maneja login, registro, obtención del usuario actual y cierre de sesión. El de tickets, en `/api/tickets`, es el endpoint más extenso del sistema y permite crear tickets, listarlos con filtros, obtener uno por ID, asignar técnicos, agregar comentarios, subir archivos adjuntos, cambiar estados, verificar resoluciones, y generar reportes; el parámetro `action` en la URL determina qué operación se ejecuta.

El de técnicos, en `/api/technicians`, ofrece las operaciones CRUD sobre técnicos, consulta agrupada por servicio y métricas de rendimiento. El de usuarios, en `/api/users`, gestiona usuarios, cambio de contraseña, asignación de sistemas de software y consulta de perfiles. El de notificaciones, en `/api/notifications`, permite la obtención de notificaciones del usuario, el conteo de no leídas y el marcado de lectura.

Los de reportes, dispersos en `/api/reports`, `/api/weekly-report`, `/api/technician-reports` y `/api/problem-report`, ofrecen múltiples endpoints para diferentes tipos de reportes con filtros por fecha, oficina, servicio y prioridad. El de auditoría, en `/api/audit`, permite la consulta de logs de actividad y estadísticas, y requiere explícitamente el rol de auditor.

El del tablero público, en `/api/public-board`, expone el estado del tablero, la actualización incremental mediante polling y la transmisión en tiempo real mediante SSE, todo accesible sin autenticación. El de escalación, en `/api/escalation`, procesa el escalamiento automático de tickets pendientes. Los de oficinas y estructura, en `/api/office` y `/api/structure`, gestionan la estructura institucional. Finalmente, los de bienes, en `/api/bienes` y `/api/unidades`, funcionan como proxy transparente hacia la API de bienes patrimoniales del SIFA.

### 6.3 Endpoints Consumidos por el Frontend

El archivo `api.ts` del frontend contiene los métodos que consumen estos endpoints. Para dar una idea de la magnitud, hay alrededor de doscientos métodos que cubren desde la autenticación básica hasta funcionalidades específicas como la reset de secuencias de tickets o la consulta de turnos de técnicos. Cada método del servicio API retorna una promesa con un tipo genérico `ApiResponse<T>`, que encapsula la respuesta del servidor con los campos `success`, `data` y `message`.

### 6.4 Sistema de Notificaciones

El sistema de notificaciones opera mediante la tabla `Notifications` en la base de datos. Cuando ocurre un evento relevante, como la creación de un ticket o la asignación de un técnico, el backend crea un registro en esta tabla con el tipo de notificación, el título, el mensaje y los datos adicionales en formato JSON. El frontend consulta periódicamente el endpoint de notificaciones para verificar si hay nuevas notificaciones para el usuario actual.

Los tipos de notificación implementados incluyen: `ticket_created` (cuando se crea un nuevo ticket), `ticket_assignment` (cuando se asigna un técnico a un ticket), `technician_assigned` (cuando se notifica al técnico de su asignación), `ticket_verification` (cuando el ticket está pendiente de verificación por el solicitante), `assistance_request` (cuando un técnico solicita asistencia), `assistance_assigned` (cuando un técnico acepta una solicitud de asistencia), `assistance_rejected` (cuando un técnico rechaza una solicitud de asistencia) y `ticket_created_admin` (cuando se notifica al administrador de la creación de un ticket).

---

## Capítulo 7. Diccionario de Datos

A continuación se describe cada una de las tablas que componen la base de datos `tickets_system`, incluyendo el nombre de cada campo, su tipo de datos, las restricciones aplicables y una descripción de su propósito. Para cada tabla se indican también las claves foráneas que establecen las relaciones con otras tablas.

### 7.1 Módulo de Usuarios y Acceso

#### 7.1.1 Tabla Role

Esta tabla almacena los roles disponibles en el sistema. Es una tabla pequeña, con apenas cuatro registros en el estado actual. El campo `ID_Role` es la clave primaria autoincremental que identifica de manera única cada rol. El campo `Role` es un VARCHAR de 20 caracteres, no nulo y con restricción de unicidad, que almacena el nombre del rol; los valores actuales son "Admin", "Tecnico", "Jefe" y "Auditor". El campo `Description` es un TEXT nullable que contiene una descripción textual del rol y sus funcionalidades.

#### 7.1.2 Tabla Users

Contiene todos los usuarios registrados en el sistema, independientemente de su rol. Es una de las tablas centrales del esquema, pues casi todas las demás tablas establecen relaciones hacia ella. El campo `ID_Users` es la clave primaria autoincremental que identifica de manera única a cada usuario. El campo `Fk_Role` es una clave foránea que apunta hacia `Role.ID_Role` e indica el rol asignado. El campo `Email` es un VARCHAR de 100 caracteres, no nulo y único, que se utiliza como credencial de acceso. El campo `Password` es un VARCHAR de 255 caracteres que almacena el hash bcrypt de la contraseña, ya que nunca se guarda la contraseña en texto plano. El campo `Username` es un VARCHAR de 100 caracteres, no nulo y único, que sirve como nombre de usuario para identificación. El campo `Full_Name` es un VARCHAR de 200 caracteres no nulo que contiene el nombre completo. El campo `is_system_user` es un BOOLEAN con valor por defecto FALSE que indica si el usuario fue creado como parte del sistema de prueba o registrado manualmente por un administrador. El campo `last_login_at` es un TIMESTAMP nullable que registra la fecha y hora del último inicio de sesión, y el campo `created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP` que almacena la fecha de creación del registro. Se definieron dos índices para optimizar las consultas: `idx_users_system` sobre (`is_system_user`, `Email`) para acelerar las búsquedas de login, y `idx_users_active` sobre (`is_system_user`, `Full_Name`) para el listado de usuarios en la interfaz administrativa.

#### 7.1.3 Tabla Boss

Registra a los jefes de oficina que pueden solicitar tickets. Cada jefe está vinculado a un usuario del sistema mediante el campo `Fk_User`, que es una clave foránea hacia `Users.ID_Users` con restricción de unicidad, lo que garantiza que un usuario solo pueda estar vinculado a un registro de jefe. El campo `ID_Boss` es la clave primaria autoincremental. El campo `Name_Boss` es un VARCHAR de 200 caracteres no nulo con el nombre completo del jefe. El campo `Pronoun` es un VARCHAR de 20 caracteres nullable que indica el trato (Sr., Sra., etc.).

### 7.2 Infraestructura Institucional

#### 7.2.1 Tabla Office

Representa las distintas dependencias de la alcaldía: direcciones, divisiones, coordinaciones y áreas. Esta tabla contiene la estructura jerárquica de la organización. El campo `ID_Office` es la clave primaria autoincremental. El campo `Name_Office` es un VARCHAR de 100 caracteres no nulo con el nombre de la oficina. El campo `coduniadm` es un VARCHAR de 20 caracteres único y nullable que contiene el código de unidad administrativa proveniente del SIFA, utilizado para sincronizar la información de bienes patrimoniales con cada oficina. El campo `Fk_Boss_ID` es una clave foránea hacia `Boss.ID_Boss` que identifica al jefe responsable de la dependencia, y el campo `created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`.

### 7.3 Técnicos y Servicios de Tecnología de la Información

#### 7.3.1 Tabla TI_Service

Catálogo de los tipos de servicio técnico que ofrece el departamento de informática. El campo `ID_TI_Service` es la clave primaria autoincremental. El campo `Type_Service` es un VARCHAR de 50 caracteres no nulo con el nombre del servicio; los valores actuales son "Redes", "Soporte" y "Programación". El campo `Details` es un TEXT nullable con la descripción detallada del alcance del servicio.

#### 7.3.2 Tabla Technicians

Almacena la información de los técnicos de TI que resuelven tickets. El campo `ID_Technicians` es la clave primaria autoincremental. El campo `Fk_Users` es una clave foránea hacia `Users.ID_Users` con restricción de unicidad, lo que asegura que cada usuario solo pueda ser técnico una vez. Los campos `First_Name` y `Last_Name` son VARCHAR de 50 caracteres no nulos con el nombre y apellido del técnico respectivamente. El campo `Fk_Lunch_Block` es una clave foránea hacia `Lunch_Blocks.ID_Lunch_Block`, nullable, que contiene el bloque de almuerzo asignado al técnico; se establece como nulo cuando no tiene un turno fijo. El campo `Status` es un VARCHAR de 20 caracteres con valor por defecto "Disponible" que indica el estado actual de disponibilidad del técnico; los valores posibles son "Disponible", "Ocupado", "Inactivo" y "Fuera de Servicio". Este campo se actualiza automáticamente según la lógica de horarios, almuerzos y tickets activos: si el estado es "Fuera de Servicio", no se modifica (funciona como un soft delete); si el técnico está fuera de su horario laboral, se marca como "Inactivo"; si está dentro de un bloque de almuerzo, se marca como "Ocupado"; si tiene tickets activos asignados, también se marca como "Ocupado"; y si no cumple ninguna de las condiciones anteriores, se marca como "Disponible". El campo `created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`.

#### 7.3.3 Tabla Technicians_Service

Tabla de relación entre técnicos y servicios TI que permite que un técnico pertenezca a más de un servicio. El campo `ID_Technicians_Service` es la clave primaria autoincremental. El campo `Fk_TI_Service` es una clave foránea hacia `TI_Service.ID_TI_Service` y el campo `Fk_Technicians` es una clave foránea hacia `Technicians.ID_Technicians`. El campo `Status` es un VARCHAR de 15 caracteres con valor por defecto "Activo" que indica el estado de la asignación, y el campo `created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`.

#### 7.3.4 Tabla Service_Problems_Catalog

Catálogo de problemas típicos asociados a cada servicio TI. Inicialmente se pobla con problemas comunes, pero permite agregar nuevos tipos conforme se identifiquen. El campo `ID_Problem_Catalog` es la clave primaria autoincremental. El campo `Fk_TI_Service` es una clave foránea hacia `TI_Service.ID_TI_Service` que indica a qué servicio pertenece el problema. El campo `Problem_Name` es un VARCHAR de 200 caracteres no nulo con el nombre descriptivo del problema. El campo `Typical_Description` es un TEXT nullable con la descripción típica del problema, útil como referencia para los técnicos. El campo `Estimated_Severity` es un VARCHAR de 50 caracteres nullable que indica la severidad estimada ("Alta", "Media", "Baja").

#### 7.3.5 Tabla Lunch_Blocks

Define los turnos de almuerzo disponibles para los técnicos. La jornada de almuerzo se divide en cuatro turnos que van desde las 11:30 hasta las 14:00. El campo `ID_Lunch_Block` es la clave primaria autoincremental. El campo `Block_Name` es un VARCHAR de 50 caracteres no nulo con el nombre del turno (Primer turno, Segundo turno, etc.). Los campos `Start_Time` y `End_Time` son de tipo TIME no nulos que definen la franja horaria del bloque de almuerzo.

#### 7.3.6 Tabla Technician_Schedules

Registra los horarios laborales de cada técnico por día de la semana. El campo `ID_Schedule` es la clave primaria autoincremental. El campo `Fk_Technician` es una clave foránea hacia `Technicians.ID_Technicians`. El campo `Day_Of_Week` es un VARCHAR de 20 caracteres no nulo con el día de la semana (Lunes, Martes, etc.). Los campos `Work_Start_Time` y `Work_End_Time` son de tipo TIME, el primero con valor por defecto 08:00:00 y el segundo sin valor por defecto, que definen la jornada laboral del técnico para cada día.

### 7.4 Configuración de Permisos y Sistemas

#### 7.4.1 Tabla Service_Permissions

Define qué servicios TI pueden atender las solicitudes de cada oficina. El campo `ID_Permission` es la clave primaria autoincremental. El campo `Fk_TI_Service` es una clave foránea hacia `TI_Service.ID_TI_Service` y el campo `Fk_Office` es una clave foránea hacia `Office.ID_Office`. El campo `Is_Allowed` es un BOOLEAN con valor por defecto TRUE que indica si el servicio está permitido para la oficina en cuestión.

#### 7.4.2 Tabla Request_Settings

Configuración de solicitudes por oficina. El campo `ID_Setting` es la clave primaria autoincremental. El campo `Fk_Office_ID` es una clave foránea hacia `Office.ID_Office`. El campo `Can_Request_Directly` es un BOOLEAN con valor por defecto TRUE que indica si la oficina puede crear tickets directamente, mientras que el campo `Must_Be_Approved_By_Superior` es un BOOLEAN con valor por defecto FALSE que indica si las solicitudes requieren aprobación de un superior jerárquico antes de ser procesadas.

#### 7.4.3 Tabla Software_Systems

Catálogo de los sistemas de software utilizados en la alcaldía. El campo `ID_System` es la clave primaria autoincremental. El campo `System_Name` es un VARCHAR de 200 caracteres no nulo con el nombre del sistema. El campo `Description` es un TEXT nullable con la descripción de las funcionalidades. El campo `Status` es un VARCHAR de 20 caracteres con valor por defecto "Activo" que permite desactivar sistemas que ya no están en uso.

#### 7.4.4 Tabla Office_Systems

Tabla de relación entre oficinas y sistemas de software que permite indicar qué sistemas utiliza cada dependencia. El campo `ID_Office_System` es la clave primaria autoincremental. El campo `Fk_Office_ID` es una clave foránea hacia `Office.ID_Office` y el campo `Fk_System_ID` es una clave foránea hacia `Software_Systems.ID_System`.

### 7.5 Gestión de Tickets

Esta es la sección más extensa del diccionario de datos, pues la gestión de tickets constituye la funcionalidad central del sistema.

#### 7.5.1 Tabla Service_Request

Tabla principal del sistema. Cada registro representa un ticket de soporte técnico. El campo `ID_Service_Request` es la clave primaria autoincremental. El campo `Ticket_Code` es un VARCHAR de 50 caracteres único que almacena el código secuencial del ticket en formato TTT-NNNNNN, donde TTT representan las tres primeras letras del servicio y NNNNNN es un número secuencial generado automáticamente por el backend. El campo `Fk_Office` es una clave foránea hacia `Office.ID_Office` que indica la oficina de origen del ticket. El campo `Fk_User_Requester` es una clave foránea hacia `Users.ID_Users` con el usuario que creó la solicitud. El campo `Fk_TI_Service` es una clave foránea hacia `TI_Service.ID_TI_Service` con el tipo de servicio TI al que corresponde el ticket. El campo `Fk_Problem_Catalog` es una clave foránea hacia `Service_Problems_Catalog.ID_Problem_Catalog` con el problema del catálogo que mejor describe la solicitud. El campo `Fk_Boss_Requester` es una clave foránea hacia `Boss.ID_Boss` con el jefe que realizó la solicitud. El campo `Fk_Software_System` es una clave foránea hacia `Software_Systems.ID_System`, nullable, que contiene el sistema de software involucrado y es obligatorio cuando el servicio es de programación. El campo `Subject` es un VARCHAR de 500 caracteres no nulo con el asunto o título breve del ticket. El campo `Property_Number` es un VARCHAR de 50 caracteres nullable con el número de bien patrimonial asociado al problema, como un equipo o una impresora. El campo `Description` es un TEXT nullable con la descripción detallada del problema reportado por el solicitante. El campo `System_Priority` es un VARCHAR de 50 caracteres con valor por defecto "Media" que contiene la prioridad del ticket; los valores válidos son "Critica", "Alta", "Media" y "Baja", cada una con un peso de asignación diferente (10, 5, 2 y 1 respectivamente) que influye en la selección automática del técnico. El campo `Resolution_Notes` es un TEXT nullable con las notas de resolución escritas por el técnico al cerrar el ticket. El campo `Status` es un VARCHAR de 50 caracteres con valor por defecto "Pendiente" que refleja el estado actual del ticket en su ciclo de vida; los valores posibles incluyen "Pendiente", "En Proceso", "Pendiente de Verificación", "Cerrado", "Inconforme" y "Escalado". El campo `Created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP` que marca la fecha de creación. El campo `Updated_at` es un TIMESTAMP que se actualiza automáticamente con cada modificación. El campo `Closed_at` es un TIMESTAMP nullable que registra la fecha de cierre. El campo `Resolved_By` es un INTEGER nullable con el ID del usuario que marcó la resolución como completada.

#### 7.5.2 Tabla Ticket_Technicians

Registra las asignaciones de técnicos a tickets. Un ticket puede tener varios técnicos asignados, cada uno con un rol específico dentro del proceso de resolución. El campo `ID_Ticket_Technician` es la clave primaria autoincremental. El campo `Fk_Service_Request` es una clave foránea hacia `Service_Request.ID_Service_Request` y el campo `Fk_Technician` es una clave foránea hacia `Technicians.ID_Technicians`. El campo `Is_Lead` es un BOOLEAN con valor por defecto FALSE que indica si el técnico es el responsable principal del ticket. El campo `Assignment_Role` es un VARCHAR de 100 caracteres nullable con el rol de la asignación, que puede ser "Apoyo", "Especialista" o "Supervisor". El campo `Assigned_At` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`. El campo `Fk_Assigned_By` es una clave foránea hacia `Users.ID_Users` con el administrador que realizó la asignación. El campo `Status` es un VARCHAR de 50 caracteres con valor por defecto "Activo" que indica el estado de la asignación.

#### 7.5.3 Tabla Ticket_Comments

Almacena los comentarios que los distintos usuarios agregan a un ticket para documentar el seguimiento del caso. El campo `ID_Comment` es la clave primaria autoincremental. El campo `Fk_Service_Request` es una clave foránea hacia `Service_Request.ID_Service_Request`. El campo `Fk_User` es una clave foránea hacia `Users.ID_Users` con el usuario que escribió el comentario. El campo `Comment` es un TEXT no nulo con el texto del comentario. El campo `Created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`.

#### 7.5.4 Tabla Ticket_Attachments

Registra los archivos adjuntos subidos a un ticket, ya sea directamente o como parte de un comentario. El campo `ID_Attachment` es la clave primaria autoincremental. El campo `Fk_Service_Request` es una clave foránea hacia `Service_Request.ID_Service_Request`. El campo `Fk_Comment` es una clave foránea hacia `Ticket_Comments.ID_Comment`, nullable, que indica el comentario al que está asociado el archivo; puede ser nulo si se adjunta directamente al ticket sin asociarlo a un comentario específico. El campo `Fk_User` es una clave foránea hacia `Users.ID_Users` con el usuario que subió el archivo. El campo `File_Name` es un VARCHAR de 255 caracteres no nulo con el nombre original del archivo tal como fue subido. El campo `File_Path` es un VARCHAR de 1024 caracteres no nulo con la ruta donde se almacena el archivo en el servidor de uploads. El campo `File_Type` es un VARCHAR de 100 caracteres nullable con el tipo MIME del archivo. El campo `File_Size` es un INTEGER nullable con el tamaño del archivo en bytes. El campo `Uploaded_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`.

#### 7.5.5 Tabla Ticket_Timeline

Historial cronológico de todos los eventos significativos que ocurren durante la vida de un ticket. El campo `ID_Timeline` es la clave primaria autoincremental. El campo `Fk_Service_Request` es una clave foránea hacia `Service_Request.ID_Service_Request`. El campo `Fk_User_Actor` es una clave foránea hacia `Users.ID_Users` con el usuario que generó el evento. El campo `Action_Description` es un TEXT nullable con la descripción legible de lo que ocurrió; por ejemplo, "Administrador agregó al técnico Carlos como apoyo". El campo `Old_Status` es un VARCHAR de 50 caracteres nullable con el estado del ticket antes del cambio, y el campo `New_Status` es un VARCHAR de 50 caracteres nullable con el estado del ticket después del cambio. El campo `Event_Date` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`.

### 7.6 Módulo de Auditoría

#### 7.6.1 Tabla audit_logs

Registro detallado de todas las acciones relevantes que se realizan en el sistema. Esta tabla es consultada exclusivamente por los usuarios con rol de auditor. El campo `id` es la clave primaria autoincremental. El campo `user_id` es un INTEGER nullable que contiene el identificador del usuario que realizó la acción, y puede ser nulo en caso de acciones anónimas o ejecutadas por el propio sistema. El campo `email` es un VARCHAR de 100 caracteres nullable con el correo electrónico del usuario que ejecutó la acción. El campo `action` es un VARCHAR de 50 caracteres no nulo con el tipo de acción realizada, como login, logout, create, update o delete. El campo `entity_type` es un VARCHAR de 50 caracteres nullable con el tipo de entidad afectada, como ticket, user, technician u office. El campo `entity_id` es un INTEGER nullable con el identificador de la entidad afectada. El campo `description` es un TEXT nullable con la descripción legible de la acción. El campo `data` es un JSON nullable con datos adicionales de la acción en formato estructurado. El campo `severity` es un ENUM con valores 'info', 'warning' y 'critical', con valor por defecto 'info', que indica el nivel de severidad del evento registrado. El campo `success` es un TINYINT con valor por defecto 1 que indica si la acción se completó exitosamente. El campo `ip_address` es un VARCHAR de 45 caracteres nullable con la dirección IP desde la que se realizó la acción; se reservan 45 caracteres para acomodar direcciones IPv6 además de las IPv4 tradicionales. El campo `user_agent` es un VARCHAR de 500 caracteres nullable con la cadena del navegador o cliente utilizado. El campo `created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`. Se definieron cuatro índices para optimizar las consultas más frecuentes: `idx_audit_action` sobre (`action`) para filtrar por tipo de operación, `idx_audit_user` sobre (`user_id`) para buscar la actividad de un usuario específico, `idx_audit_entity` sobre (`entity_type`, `entity_id`) para localizar todos los eventos de una entidad particular, y `idx_audit_created` sobre (`created_at`) para consultas por rango de fechas.

### 7.7 Módulo de Notificaciones

#### 7.7.1 Tabla Notifications

Sistema de notificaciones para los usuarios del sistema. Cada registro representa una notificación dirigida a un usuario específico. El campo `ID_Notification` es la clave primaria autoincremental. El campo `Fk_User` es una clave foránea hacia `Users.ID_Users` con eliminación en cascada y es no nulo; la eliminación en cascada garantiza que al borrar un usuario se eliminen también sus notificaciones, evitando así registros huérfanos. El campo `Type` es un VARCHAR de 100 caracteres no nulo con el tipo de notificación; los tipos implementados son `ticket_created`, `ticket_assignment`, `technician_assigned`, `ticket_verification`, `assistance_request`, `assistance_assigned`, `assistance_rejected` y `ticket_created_admin`. El campo `Title` es un VARCHAR de 255 caracteres no nulo con el título breve de la notificación que se muestra al usuario. El campo `Message` es un TEXT no nulo con el mensaje descriptivo completo. El campo `Fk_Service_Request` es una clave foránea hacia `Service_Request.ID_Service_Request` con establecimiento en SET NULL al eliminar, y es nullable; si el ticket asociado se elimina, este campo se establece en nulo en lugar de eliminar la notificación, permitiendo conservar un registro de que existió una notificación al respecto. El campo `Is_Read` es un TINYINT con valor por defecto 0 y es no nulo, que indica si la notificación ha sido leída por el usuario. El campo `Metadata` es un JSON nullable con datos adicionales de la notificación, como identificadores de ticket o técnico que complementan la información básica. El campo `Created_at` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`. El campo `Updated_at` es un TIMESTAMP que se actualiza automáticamente cada vez que se modifica el registro. Se definieron cuatro índices para optimizar el rendimiento: `idx_user_notifications` sobre (`Fk_User`, `Is_Read`) para obtener rápidamente las notificaciones no leídas de un usuario, `idx_ticket_notifications` sobre (`Fk_Service_Request`) para buscar notificaciones asociadas a un ticket, `idx_type` sobre (`Type`) para filtrar por tipo de notificación, y `idx_created` sobre (`Created_at`) para consultas por rango de fechas.

### 7.8 Módulo de Solicitudes de Asistencia

#### 7.8.1 Tabla Assistance_Requests

Permite que un técnico solicite la ayuda de otro técnico para resolver un ticket que excede sus capacidades o conocimientos. El sistema gestiona el ciclo de vida completo de estas solicitudes desde que se crean hasta que se resuelven. El campo `ID_Request` es la clave primaria autoincremental. El campo `Fk_Ticket` es una clave foránea hacia `Service_Request.ID_Service_Request`, no nulo, que identifica el ticket para el cual se solicita asistencia. El campo `Fk_Requesting_Technician` es una clave foránea hacia `Users.ID_Users`, no nulo, que identifica al técnico que solicita la ayuda. El campo `Fk_Assigned_Technician` es una clave foránea hacia `Users.ID_Users`, nullable, que identifica al técnico que acepta la solicitud; es nulo mientras la solicitud está pendiente de ser aceptada. El campo `Status` es un ENUM con valores 'PENDIENTE', 'ASIGNADO', 'RECHAZADO' y 'CANCELADO', con valor por defecto 'PENDIENTE', que refleja el estado actual de la solicitud dentro de su ciclo de vida. El campo `Requested_At` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`. El campo `Updated_At` es un TIMESTAMP nullable que se actualiza cuando la solicitud cambia de estado. El campo `Notification_Count` es un INTEGER con valor por defecto 0 que contiene la cantidad de notificaciones enviadas al técnico asignado sobre esta solicitud, utilizado para evitar el envío excesivo de notificaciones repetitivas al mismo técnico. El campo `Last_Notified_At` es un TIMESTAMP nullable con la fecha y hora de la última notificación enviada. Se definieron dos índices: `idx_assistance_status` sobre (`Status`) para filtrar solicitudes por estado, y `idx_assistance_ticket` sobre (`Fk_Ticket`) para buscar todas las solicitudes de asistencia asociadas a un ticket específico.

### 7.9 Módulo de Escalamiento

#### 7.9.1 Tabla Ticket_Escalations

Registra los escalamientos que se producen cuando un ticket necesita ser trasladado a un nivel de servicio diferente, generalmente de un servicio más especializado a uno de mayor alcance. El campo `ID_Escalation` es la clave primaria autoincremental. El campo `Fk_Service_Request` es un INTEGER no nulo con el ticket que fue escalado; es importante señalar que esta clave foránea no tiene la restricción FOREIGN KEY definida en el esquema SQL, lo cual permite cierta flexibilidad pero también implica que se debe validar la integridad referencial en la capa de aplicación PHP. El campo `Original_Service_ID` es un INTEGER no nulo con el identificador del servicio TI de origen antes del escalamiento. El campo `Escalated_Service_ID` es un INTEGER no nulo con el identificador del servicio TI al que se escaló el ticket. El campo `Escalated_At` es un TIMESTAMP con valor por defecto `CURRENT_TIMESTAMP`.

#### 7.9.2 Tabla Pending_Ticket_Alerts

Almacena las alertas generadas por tickets que han excedido el tiempo máximo de espera configurado para su prioridad. El campo `ID_Alert` es la clave primaria autoincremental. El campo `Fk_Service_Request` es un INTEGER no nulo con el ticket que generó la alerta. El campo `Alert_Type` es un VARCHAR de 100 caracteres no nulo con el tipo de alerta generada. El campo `Notified_At` es un TIMESTAMP nullable con la fecha y hora en que se envió la notificación de alerta a los responsables. El campo `Resolved_At` es un TIMESTAMP nullable con la fecha y hora en que se resolvió la alerta. El campo `Resolution_Notes` es un VARCHAR de 1000 caracteres nullable con las notas sobre cómo se resolvió la alerta.

#### 7.9.3 Tabla Escalation_Config

Configuración de los umbrales de tiempo para el escalamiento automático según la prioridad del ticket. El campo `ID_Config` es la clave primaria autoincremental. El campo `Priority_Level` es un VARCHAR de 50 caracteres no nulo con el nivel de prioridad ("Critica", "Alta", "Media", "Baja"). El campo `Hours_Threshold` es un INTEGER no nulo con valor por defecto 4 que contiene la cantidad máxima de horas que un ticket puede permanecer sin atención antes de que se active el escalamiento; los valores configurados son: 1 hora para prioridad crítica, 4 para alta, 12 para media y 24 para baja. El campo `Notify_Admins` es un BOOLEAN con valor por defecto TRUE que indica si se deben notificar a los administradores cuando se activa el escalamiento. El campo `Auto_Escalate` es un BOOLEAN con valor por defecto FALSE que indica si el ticket se escala automáticamente al siguiente nivel de servicio sin intervención manual.

### 7.10 Caché de Bienes Patrimoniales

#### 7.10.1 Tabla bienes_cache

Almacena temporalmente las respuestas provenientes de la API de bienes patrimoniales del SIFA, con el propósito de reducir las consultas al servidor externo y mejorar los tiempos de respuesta para los usuarios que consultan frecuentemente los mismos activos. El campo `query_key` es un VARCHAR de 64 caracteres que funciona como clave primaria y contiene el hash de la consulta realizada, generado a partir de los parámetros de búsqueda. El campo `response` es un MEDIUMTEXT no nulo con la respuesta completa de la API en formato JSON; se utiliza MEDIUMTEXT en lugar de TEXT porque las respuestas de bienes patrimoniales pueden ser considerablemente extensas, especialmente cuando se realizan búsquedas amplias. El campo `is_lookup` es un TINYINT con valor por defecto 0 que indica si la consulta es de tipo búsqueda (1) o consulta por código específico (0), lo que determina el tiempo de vida de la caché, ya que las búsquedas generales se expiran más rápido que las consultas por código específico. El campo `cached_at` es un INTEGER UNSIGNED no nulo con el timestamp Unix de cuando se almacenó la respuesta en caché; se utiliza un entero en lugar de un TIMESTAMP para facilitar los cálculos de expiración en la capa de aplicación. Se definió un índice `idx_cached` sobre (`cached_at`) para facilitar la limpieza de entradas expiradas por parte del servicio de mantenimiento de caché.

### 7.11 Tabla ticket_sequence

Esta tabla funciona como generador atómico de secuencias para la generación de códigos de ticket. No almacena datos de negocio, sino que mantiene un contador que se incrementa de forma concurrente para garantizar que cada ticket recibe un código único. El campo `sequence_name` es un VARCHAR de 50 caracteres que funciona como clave primaria y contiene el nombre de la secuencia (por ejemplo, "RED" para tickets de redes, "SOP" para soporte, "PRO" para programación). El campo `current_value` es un INTEGER no nulo con el valor actual del contador. El campo `updated_at` es un TIMESTAMP que se actualiza automáticamente cada vez que se incrementa el contador. La generación del código se realiza mediante una transacción SQL que ejecuta `SELECT current_value + 1 FROM ticket_sequence WHERE sequence_name = 'XXX' FOR UPDATE`, incrementa el valor y lo devuelve, garantizando que no se produzcan duplicados incluso bajo cargas concurrentes de múltiples usuarios creando tickets simultáneamente.

### 7.12 Diagrama de Relaciones entre Tablas

Las relaciones entre las tablas del sistema se pueden visualizar de la siguiente manera. La tabla `Role` se relaciona con `Users` mediante una relación uno a muchos, donde cada rol puede ser asignado a múltiples usuarios. La tabla `Users` se conecta con `Boss` mediante una relación uno a uno, donde cada usuario puede estar vinculado a un solo registro de jefe. La tabla `Boss` se relaciona con `Office` mediante una relación uno a muchos, donde cada jefe puede ser responsable de una o más oficinas.

La tabla `Office` se conecta con `Service_Request` mediante una relación uno a muchos, donde cada oficina puede generar múltiples tickets. La tabla `Users` se relaciona con `Service_Request` como solicitante, y la tabla `Boss` se conecta con `Service_Request` como autorizante. La tabla `TI_Service` se vincula con `Service_Request` indicando el tipo de servicio solicitado. La tabla `Service_Problems_Catalog` se relaciona con `Service_Request` para indicar el problema específico reportado.

La tabla `Service_Request` se conecta con `Ticket_Technicians` mediante una relación uno a muchos, permitiendo que un ticket tenga múltiples técnicos asignados. La tabla `Technicians` se vincula con `Ticket_Technicians`, completando la relación de asignación. La tabla `Service_Request` también se relaciona con `Ticket_Comments`, `Ticket_Attachments` y `Ticket_Timeline`, todas ellas en configuración uno a muchos para documentar el seguimiento del ticket.

La tabla `Users` se conecta con `Notifications` para entregar notificaciones a usuarios específicos. La tabla `Service_Request` se vincula con `Notifications` para asociar notificaciones a tickets específicos. La tabla `Users` se relaciona con `Assistance_Requests` tanto como solicitante como destinatario de asistencia entre técnicos.

La tabla `Service_Request` se conecta con `Ticket_Escalations` para registrar los escalamientos de servicio. La tabla `Service_Request` también se vincula con `Pending_Ticket_Alerts` para generar alertas cuando los tickets exceden los tiempos máximos de espera.

La tabla `TI_Service` se conecta con `Technicians_Service` para asignar técnicos a servicios específicos. La tabla `Technicians` se vincula con `Technicians_Service` completando la relación. La tabla `TI_Service` se relaciona con `Service_Permissions` para configurar qué servicios puede atender cada oficina. La tabla `Office` se conecta con `Service_Permissions`, `Request_Settings` y `Office_Systems`, estableciendo la configuración institucional de cada dependencia.

La tabla `Software_Systems` se vincula con `Office_Systems` para indicar qué sistemas utiliza cada oficina. La tabla `audit_logs` se mantiene independiente, registrando todas las acciones del sistema sin relaciones directas con otras tablas, aunque almacena referencias a usuarios y entidades afectadas.

---

## Capítulo 8. Patrones y Convenciones de Código

### 8.1 Backend

Todos los archivos PHP declaran `strict_types` en la primera línea. Los modelos y controladores no utilizan namespaces, con la excepción de los servicios y middleware que se organizan bajo el namespace `App`. No se emplea un autoloader; cada archivo se incluye manualmente mediante `require_once`. Las respuestas siempre siguen el formato JSON estándar con `success`, `data` y `message`.

La convención de nombres para los archivos PHP sigue el patrón PascalCase para las clases (`Database.php`, `JwtService.php`, `AuthMiddleware.php`) y snake_case para los archivos que contienen scripts procedimentales (`index.php`, `router.php`). Los archivos de configuración se encuentran en `src/config/` y utilizan naming convencional (`database.php`, `CrossServicePolicy.php`).

### 8.2 Frontend Web

Se utiliza TypeScript de forma estricta con interfaces para las props de los componentes y tipos para las respuestas de la API. Todos los componentes son funcionales (no se usan clases). El estado de autenticación se maneja con Context y `useReducer`. El servicio de API se implementa como un objeto con métodos estáticos.

Los componentes se nombran en PascalCase (`AdminDashboard.tsx`, `TechnicianManagement.tsx`, `TicketForm.tsx`) y se organizan en carpetas por dominio funcional. Los estilos CSS se mantienen en archivos separados con la misma nomenclatura que el componente (`AdminDashboard.css`, `PublicBoard.css`).

### 8.3 Aplicación Móvil

El enrutamiento se define por la estructura de archivos dentro de la carpeta `app/` (file-based routing). El estado global se divide entre tres stores de Zustand: autenticación, tickets y notificaciones. El estado del servidor se gestiona con TanStack React Query. Los formularios combinan `react-hook-form` con Zod para la validación de esquemas.

Los componentes de la app móvil se nombran en PascalCase y se organizan en la carpeta `src/components/`. Los servicios de API se encuentran en `src/services/` y siguen la convención de un archivo por dominio (`authService.ts`, `ticketService.ts`, `technicianService.ts`). Los types TypeScript se definen en `src/types/` y utilizan interfaces para las estructuras de datos principales.

---

## Capítulo 9. Variables de Entorno

### 9.1 Backend

Las variables de entorno del backend se definen en el archivo `.env` de la raíz de `tickets-backend`. La conexión a la base de datos se configura mediante `DB_HOST` (localhost por defecto), `DB_PORT` (3306), `DB_NAME` (tickets_system), `DB_USER` (root) y `DB_PASSWORD`. El secreto para la firma de tokens JWT se define en `JWT_SECRET`.

En el entorno de desarrollo con XAMPP, las credenciales por defecto funcionan sin problemas. Para producción, es indispensable cambiar la contraseña de la base de datos y el valor de `JWT_SECRET`.

### 9.2 Frontend

El frontend utiliza las variables `REACT_APP_API_BASE` para definir la URL del backend, `REACT_APP_SSE_URL` para el servicio de eventos en tiempo real, y `REACT_APP_ENV` para indicar el entorno de ejecución. Si no se define `REACT_APP_API_BASE`, el frontend construye la URL dinámicamente a partir del hostname actual en el puerto 8000.

### 9.3 Resolución de URLs

El frontend implementa una lógica de resolución de URLs que prioriza las variables de entorno y cae en un fallback dinámico cuando no están definidas. Primero verifica si `REACT_APP_API_BASE` está definido y lo utiliza como base. Si no existe, construye la URL utilizando el protocolo y hostname de la ventana del navegador, añadiendo el puerto 8000. Si `REACT_APP_API_URL` está definido, lo utiliza como alternativa. Finalmente, si ninguna opción está disponible, usa `http://localhost:8000` como valor por defecto.

---

## Capítulo 10. Instalación y Puesta en Marcha

### 10.1 Base de Datos

El primer paso es crear la base de datos ejecutando el script SQL contenido en `tickets-backend/database.sql`. Este script crea todas las tablas, los índices y los datos iniciales de prueba, incluyendo roles, usuarios, oficinas, servicios TI, técnicos, catálogo de problemas y tickets de ejemplo.

### 10.2 Backend

Desde la carpeta `tickets-backend`, se ejecuta el servidor de desarrollo de PHP:

```bash
php -S 0.0.0.0:8000 router.php
```

Es recomendable usar el PHP de XAMPP si se está en Windows, ya que incluye las extensiones necesarias como `pdo_mysql`.

### 10.3 Frontend

Desde la carpeta `tickets-frontend`, se ejecuta `npm install` para instalar las dependencias, y luego `npm start` para iniciar el servidor de desarrollo de React en el puerto 3000.

### 10.4 Aplicación Móvil

Desde la carpeta `tickets-App`, se ejecuta `npm install` y luego `npx expo start`. La aplicación se puede probar en un dispositivo físico con Expo Go o en un emulador Android.

---

## Capítulo 11. Solución de Problemas Comunes

### 11.1 Error de Conexión a la Base de Datos

Si aparece un mensaje indicando que falta el driver PDO MySQL, significa que la versión de PHP que se está ejecutando no tiene habilitada la extensión `pdo_mysql`. En Windows, esto suele ocurrir cuando se ejecuta `php` desde el PATH del sistema en lugar de desde la instalación de XAMPP. La solución es usar la ruta completa del PHP de XAMPP: `C:\xampp\php\php.exe`.

### 11.2 Error de CORS

El backend incluye una configuración CORS dinámica que permite peticiones desde cualquier origen en la red local. Si por alguna razón se bloquea una petición, hay que verificar que el archivo `CrossServicePolicy.php` incluya el origen correcto en la lista de dominios permitidos.

### 11.3 Token JWT Inválido

Si el sistema rechaza las peticiones autenticadas después de un reinicio del servidor, puede deberse a que el valor de `JWT_SECRET` en el archivo `.env` fue modificado o no se está cargando correctamente. Verificar que el secret coincida con el que se usó al generar el token almacenado en el navegador.

### 11.4 El Tablero Público no Muestra Técnicos

Los técnicos aparecen en el tablero público solo si su estado es "Disponible" u "Ocupado". Los técnicos con estado "Inactivo" o "Fuera de Servicio" se excluyen deliberadamente. Verificar también que el técnico tenga al menos una asignación activa en la tabla `Technicians_Service`.

### 11.5 El Proxy de Bienes no Responde

El proxy de bienes patrimoniales requiere que XAMPP esté ejecutándose en el puerto 8012 y que los archivos `bienes.php` y `unidades.php` existan dentro de la carpeta `bienes`. Si el servidor no está activo, las consultas de bienes fallarán silenciosamente.

### 11.6 Errores de Tipado en el Backend

Si el backend muestra errores de tipo "TypeError" o "Declaration de strict_types", significa que algún parámetro no coincide con el tipo declarado. Verificar que los parámetros recibidos coincidan con los tipos esperados en la función o método. El modo estricto de PHP puede generar errores que en modo lenient serían ignorados.

---

## Referencias

Arduino, I., & Hidalgo, R. (2017). *Desarrollo web con PHP 7*. RA-MA Editorial.

Bakker, A. (2023). *React 19 documentation*. React. https://react.dev

Create React App. (2023). *Creating a production build*. React. https://create-react-app.dev

Expo. (2024). *Expo SDK 54 documentation*. Expo. https://docs.expo.dev

Fernández, A. (2019). *PHP 8 completo*. Anaya Multimedia.

MySQL. (2024). *MySQL 8.0 reference manual*. Oracle. https://dev.mysql.com/doc/refman/8.0/en/

OpenJS Foundation. (2024). *Node.js documentation*. Node.js. https://nodejs.org/en/docs

Padilla, J. (2020). *TypeScript en la práctica*. La Oveja Rota.

PHP Group. (2024). *PHP: manual de referencia*. PHP. https://www.php.net/manual/es

Rethings, D. (2023). *React Native with Expo*. Expo. https://docs.expo.dev/guides/overview

Zustand. (2024). *Zustand state management*. Zustand. https://zustand-demo.pmnd.rs
