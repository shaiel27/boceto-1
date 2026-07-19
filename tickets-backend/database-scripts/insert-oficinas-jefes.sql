-- ================================================================
-- Script: Insertar oficinas (bcoordinacion) + jefes reales
-- Generado automaticamente desde bcoordinacion(3).sql
--
-- Solo se asigna jefe a oficinas que tienen nombre en el campo jefe
-- ?? Reemplazar hash de password antes de ejecutar:
--    php -r "echo password_hash('password123', PASSWORD_DEFAULT);"
-- ================================================================

-- ================================================================
-- 0. INSERTAR OFICINAS (IGNORE si ya existen)
-- ================================================================
INSERT IGNORE INTO Office (ID_Office, Name_Office) VALUES
(1, 'INFORMATICA Y TECNOLOGIA'),
(2, 'DIVISION DE CATASTRO'),
(5, 'Oficina legal de catastro'),
(6, 'DIRECCION DE TALENTO HUMANO'),
(7, 'DIVISION DEL AREA LEGAL Y ARCHIVO'),
(8, 'DIVISION DE NOMINAS Y PRESTACIONES'),
(11, 'OFICINA DE CONTROL DE LICORES Y ESPECTÁCULOS PUBLICOS'),
(12, 'DIRECCION DE EDUCACION MUNICIPAL'),
(13, 'DIVISION DE RENTAS MUNICIPALES'),
(14, 'Coordinacion de Fiscales'),
(15, 'DIVISION DE JUSTICIA MUNICIPAL'),
(17, 'TESORERIA MUNICIPAL'),
(19, 'ARCHIVO HISTÓRICO DE SAN CRISTÓBAL \"DR. JOSE JOAQUÍN VILLAMIZAR MOLINA'),
(20, 'SINDICATURA MUNICIPAL'),
(21, 'OFICINA DE PUBLICIDAD Y PROPAGANDA'),
(22, 'DIRECCIÓN DE ADMINISTRACION'),
(23, 'DIVISION DE CONTABILIDAD'),
(24, 'DIVISION DE BIENES'),
(25, 'DIVISION DE COMPRAS'),
(26, 'DIVISION DE SERVICIOS GENERALES'),
(27, 'Oficina tecnica de catastro'),
(28, 'Coordinacion de tierras'),
(29, 'AUDITORÍA INTERNA'),
(30, 'DIRECCIÓN DE DESARROLLO URBANO LOCAL'),
(31, 'DIVISIÓN DE PROTECCIÓN AMBIENTAL'),
(32, 'DIVISIÓN DE INGENIERÍA MUNICIPAL'),
(33, 'DIVISIÓN DE PLANIFICACIÓN'),
(34, 'CONSEJO LOCAL DE PLANIFICACIÓN PÚBLICA'),
(36, 'ATENCIÓN AL CIUDADANO'),
(37, 'PROYECTOS MUNICIPALES'),
(38, 'DIRECCIÓN DE PLANIFICACIÓN Y PRESUPUESTO'),
(39, 'Coordinacion de Seguridad y Salud Laboral'),
(40, 'INSTITUTO AUTONOMO MUNICIPAL DE DESARROLLO INTEGRAL DE SAN CRISTOBAL'),
(41, 'PROTECCIÓN CIVIL MUNICIPAL'),
(42, 'DIRECCION DE VIALIDAD, TRANSITO, TRANSPORTE E INFRAESTRUCTURA'),
(43, 'DIVISION DE MANTENIMIENTO VIAL E INFRAESTRUCTURA'),
(44, 'DIVISION DE TRANSITO Y TRANSPORTE'),
(45, 'CONSULTORIA JURIDICA'),
(46, 'DIRECCIÓN EJECUTIVA DEL DESPACHO'),
(47, 'DIRECCIÓN GENERAL'),
(48, 'DESPACHO DEL ALCALDE (SA)'),
(49, 'MEDIOS COMUNICACIONALES Y MARKETING DIGITAL'),
(57, 'Coordinacion de Deposito'),
(58, 'DIVISION DE MANTENIMIENTO VEHICULAR'),
(59, 'Coordinacion del Vivero Municipal'),
(60, 'DIRECCION DE CONSTRUCCION DE OBRAS MUNICIPALES'),
(61, 'DIVISIÓN DE CONSTRUCCION Y REHABILITACION DE ESPACIOS PUBICOS'),
(62, 'DIRECCION DE DEPORTE Y RECREACCION'),
(63, 'DIVISION DE VIALIDAD'),
(66, 'DIVISIÓN DE SERVICIOS MUNICIPALES'),
(67, 'DIRECCION DE SALUD MUNICIPAL'),
(68, 'SISTEMA DE PROTECCIÓN INTEGRAL DEL NIÑO, NIÑA Y DEL ADOLESCENTE'),
(69, 'INSTITUTO AUTÓNOMO DE POLICÍA DEL MUNICIPIO SAN CRISTÓBAL'),
(70, 'CUERPO DE BOMBEROS'),
(71, 'CONCEJO MUNICIPAL BOLIVARIANO DEL MUNICIPIO SAN CRISTOBAL'),
(72, 'CONTRALORÍA DEL MUNICIPIO SAN CRISTOBAL'),
(73, 'REGISTRO CIVIL MUNICIPAL'),
(74, 'Coordinacion del Mercado Municipal La Guayana'),
(75, 'Coordinacion del Mercado Municipal La Villa'),
(76, 'Coordinacion del Mercado Municipal La Ermita'),
(77, 'Coordinacion del Cementerio Municipal'),
(78, 'COOPERACION PROTOCOLAR Y RELACIONES INTERINSTITUCIONALES'),
(79, 'DIRECCION DE VIVIENDA MUNICIPAL'),
(80, 'DIVISION DE ACTIVIDADES ECONOMICAS'),
(81, 'DIRECCION DE CULTURA MUNICIPAL'),
(82, 'Coordinacion de Alumbrado Publico'),
(83, 'Coordinacion de Redes'),
(84, 'SERVICIO AUTONOMO TERMINAL DE PASAJERO ING TEOFILO CARDENAS'),
(86, 'Coordinacion de Taquilla'),
(87, 'SECRETARIA DE SEGURIDAD CIUDADANA'),
(88, 'DIVISION DE ATENCION AL CONTRIBUYENTE'),
(89, 'Coordinacion de Asuntos Legales'),
(91, 'ESCUELA LUISA CACERES DE ARISMENDI'),
(92, 'SUPERINTENDENCIA MUNICIPAL DE ADMINISTRACION TRIBUTARIA'),
(93, 'Coordinacion de Aseo Urbano'),
(94, 'DIRECCION DE SERVICIOS PUBLICOS'),
(95, 'DIVISION DE CONTRATACIONES'),
(96, 'DIVISION DE COBRANZAS'),
(99, 'BANDA MUNICIPAL'),
(100, 'CONSEJO DE PROTECCIÓN'),
(101, 'CONSEJO MUNICIPAL DE DERECHO'),
(102, 'CONTRATACION COLECTIVA EMPLEADOS'),
(103, 'CONTRATACION COLECTIVA MAESTROS'),
(104, 'CONTRATACION COLECTIVA OBREROS'),
(105, 'Coordinacion de Actividad Fisica, Recreacion y Masificacion Municipal'),
(106, 'DIRECCION DE AMBIENTE Y DESARROLLO SOSTENIBLE'),
(107, 'Coordinación de Artes Plásticas, Escénicas, Musicales y Literatura.'),
(108, 'Coordinacion de Bienestar Social'),
(109, 'Coordinacion de Captacion y Capacitacion del Personal'),
(110, 'Coordinacion de Control Posterior'),
(111, 'Coordinacion de Demarcacion y Señalamiento Vial'),
(112, 'Coordinacion de Desarrollo Sostenible'),
(113, 'Coordinacion de Desmalezamineto de Calles, Avenidas y Espacios Publicos'),
(114, 'Coordinacion de Determinacion de Responsabilidades'),
(115, 'Coordinacion de Difusion de la informacion'),
(116, 'Coordinacion de Embellecimiento de Fachadas y Elaboracion de Murales'),
(117, 'Coordinación de Evaluación y Atención Social de Vivienda'),
(118, 'Coordinacion de Gestion de Riesgos'),
(119, 'Coordinacion de los centros de salud comunitarios'),
(120, 'Coordinación de Mantenimiento Vial y Rotura'),
(121, 'Coordinación de Movimientos de Tierra y Canalizaciones'),
(122, 'Coordinacion de Operaciones'),
(123, 'Coordinacion de Ordenamiento de Transporte'),
(124, 'Coordinación de Potestad Investigativa'),
(125, 'Coordinacion de Redes Sociales y Medios Digitales'),
(126, 'Coordinacion de Sala Situacional'),
(127, 'Coordinacion de Semaforos'),
(128, 'Coordinacion del Mercado Municipal de Santa Teresa'),
(129, 'DEFENSORIA DEL NIÑO, NIÑA Y ADOLECENTE'),
(130, 'DIRECCION DE PROMOCCION Y FOMENTO DE LA PRODUCCION AGROALIMENTARIA'),
(131, 'DIVISION DE ASUNTOS ADMINISTRATIVOS'),
(132, 'DIVISION DE ASUNTOS LITIGIOSOS'),
(133, 'DIVISION DE ATENCION PRIMARIA EN SALUD'),
(134, 'DIVISION DE BIENESTAR EDUCATIVO'),
(135, 'DIVISION DE DESARROLLO Y CONSERVACION DE VIVIENDA'),
(136, 'DIVISION DE DOCENCIA'),
(137, 'ESCUELA JOSE GONZALO MENDEZ'),
(138, 'ESCUELA JUANA MALDONADO G.'),
(139, 'ESCUELA MARCO TULIO RAMIREZ ROA'),
(140, 'ESCUELA REGINA DE VELAZQUEZ'),
(141, 'ESCUELA ROMULO GALLEGOS'),
(142, 'ESCUELA SAN JOSE'),
(143, 'ESCUELA SIMON RODRIGUEZ '),
(144, 'SECRETARIA DE GOBIERNO'),
(145, 'Coordinacion de Fiscales de Control Urbano'),
(146, 'Coordinacion de Atencion de Sugerencias y Denuncias'),
(147, 'DIVISION DE INMUEBLES'),
(148, 'Coordinacion de Protocolo y Cooperacion'),
(149, 'Coordinacion de Tributos'),
(150, 'Cordinacion de Programacion y Sistemas'),
(151, 'Coordinacion de Mantenimiento de Equipos de Computacion'),
(152, 'Coordinacion de Educacion y Justicia Municipal'),
(153, 'DIVISION DE GESTION DE TALENTO HUMANO'),
(154, 'Coordinacion de Nomina'),
(155, 'Coordinacion de Prestaciones Sociales'),
(156, 'DIVISIÓN DE PRESUPUESTO'),
(157, 'Coordinacion de Educacion'),
(158, 'Coordinacion de Redes Hidraulicas, Rejillas y Alcantarillado'),
(159, 'DIVISIÓN DE PLANIFICACIÓN URBANA'),
(160, 'Coordinacion de Obras'),
(161, 'Coordinacion de Ambiente'),
(162, 'Coordinacion de Información')
;

-- ================================================================
-- 1. CREAR USUARIOS JEFES (ROL = 3)
-- ================================================================
INSERT IGNORE INTO Users (ID_Users, Fk_Role, Email, Password, Username, Full_Name, is_system_user) VALUES
(6, 3, 'ANNYGUIRIGAY@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_annyguirigay', 'ABG. ANNY GUIRIGAY', TRUE),
(7, 3, 'DANIELAMALDONADO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_danielamaldonado', 'ABG. DANIELA MALDONADO', TRUE),
(8, 3, 'FARIDERAMIREZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_farideramirez', 'ABG. FARIDE RAMIREZ', TRUE),
(9, 3, 'MARIOHERNANIZARRAA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_mariohernanizarraa', 'ABG. MARIO HERNAN IZARRA A.', TRUE),
(10, 3, 'THIANAJAIMESHERNANDEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_thianajaimeshernandez', 'ABG. THIANA JAIMES HERNANDEZ', TRUE),
(11, 3, 'VIVIANACASTILLO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_vivianacastillo', 'ABG. VIVIANA CASTILLO', TRUE),
(12, 3, 'ANTONIOMARTINEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_antoniomartinez', 'ABOG. ANTONIO MARTINEZ', TRUE),
(13, 3, 'ESPJESUSAGUILARM@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_espjesusaguilarm', 'ABOG. ESP. JESUS AGUILAR M.', TRUE),
(14, 3, 'NELSONVIVASJAIMES@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_nelsonvivasjaimes', 'ABOG. NELSON VIVAS JAIMES', TRUE),
(15, 3, 'ANTONIOBRICEO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_antoniobriceo', 'CMDT. ANTONIO BRICEÑO', TRUE),
(16, 3, 'RAFAELCHACON@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_rafaelchacon', 'CNEL. RAFAEL CHACON', TRUE),
(17, 3, 'GLEDYDELGADO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_gledydelgado', 'DRA. GLEDY DELGADO', TRUE),
(18, 3, 'INDIRAUSECHE@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_indirauseche', 'DRA. INDIRA USECHE', TRUE),
(19, 3, 'FABIOLAMORENO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_fabiolamoreno', 'FABIOLA MORENO', TRUE),
(20, 3, 'ALBERTCONTRERAS@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_albertcontreras', 'ING. ALBERT CONTRERAS', TRUE),
(21, 3, 'ANGELAGARCIA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_angelagarcia', 'ING. ANGELA GARCIA', TRUE),
(22, 3, 'CARLOSACOSTA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_carlosacosta', 'ING. CARLOS ACOSTA', TRUE),
(23, 3, 'CARMENCORREDOR@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_carmencorredor', 'ING. CARMEN CORREDOR', TRUE),
(24, 3, 'CARMENOSORIO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_carmenosorio', 'ING. CARMEN OSORIO', TRUE),
(25, 3, 'DANIELNAVARRODUQUE@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_danielnavarroduque', 'ING. DANIEL NAVARRO DUQUE', TRUE),
(26, 3, 'FERNANDORUIZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_fernandoruiz', 'ING. FERNANDO RUIZ', TRUE),
(27, 3, 'JANICEGONZALEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_janicegonzalez', 'ING. JANICE GONZALEZ', TRUE),
(28, 3, 'JORFRENCONTRERAS@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_jorfrencontreras', 'ING. JORFREN CONTRERAS', TRUE),
(29, 3, 'JOSEGREGORIOHERNANDEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_josegregoriohernandez', 'ING. JOSE GREGORIO HERNANDEZ', TRUE),
(30, 3, 'JOVANFLOREZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_jovanflorez', 'ING. JOVAN FLOREZ', TRUE),
(31, 3, 'KARELISMORA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_karelismora', 'ING. KARELIS MORA', TRUE),
(32, 3, 'LUISANTONIOUZCATEGUI@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_luisantoniouzcategui', 'ING. LUIS ANTONIO UZCATEGUI', TRUE),
(33, 3, 'VALDEMARVASQUEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_valdemarvasquez', 'ING. VALDEMAR VASQUEZ', TRUE),
(34, 3, 'JUANALBERTOMARTINEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_juanalbertomartinez', 'JUAN ALBERTO MARTINEZ', TRUE),
(35, 3, 'LCDANERSAMONCADA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_lcdanersamoncada', 'LCDA NERSA MONCADA', TRUE),
(36, 3, 'MSCAINARUSANCHEZMUOZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_mscainarusanchezmuoz', 'LCDA. (MSc) AINARU SANCHEZ MUÑOZ', TRUE),
(37, 3, 'ANAMONCADA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_anamoncada', 'LCDA. ANA MONCADA', TRUE),
(38, 3, 'BELKISVASQUEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_belkisvasquez', 'LCDA. BELKIS VASQUEZ', TRUE),
(39, 3, 'CARMENDOSRAMOS@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_carmendosramos', 'LCDA. CARMEN DOS RAMOS', TRUE),
(40, 3, 'DALIAROSATERANGONZALEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_daliarosaterangonzalez', 'LCDA. DALIA ROSA TERAN GONZALEZ', TRUE),
(41, 3, 'DALIATERAN@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_daliateran', 'LCDA. DALIA TERAN', TRUE),
(42, 3, 'DAYANASANCHEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_dayanasanchez', 'LCDA. DAYANA SANCHEZ', TRUE),
(43, 3, 'EDELIARAQUELGUERREROARAQUE@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_edeliaraquelguerreroaraque', 'LCDA. EDELIA RAQUEL GUERRERO ARAQUE', TRUE),
(44, 3, 'ELAYNEEMENDEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_elayneemendez', 'LCDA. ELAYNE E. MENDEZ', TRUE),
(45, 3, 'ELAYNEEDITHMENDEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_elayneedithmendez', 'LCDA. ELAYNE EDITH MENDEZ', TRUE),
(46, 3, 'GLENYSDELGADO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_glenysdelgado', 'LCDA. GLENYS DELGADO', TRUE),
(47, 3, 'ISABELMEDINA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_isabelmedina', 'LCDA. ISABEL MEDINA', TRUE),
(48, 3, 'KARLAJUAREZGARCIA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_karlajuarezgarcia', 'LCDA. KARLA JUAREZ GARCIA', TRUE),
(49, 3, 'LINDAPARADA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_lindaparada', 'LCDA. LINDA PARADA', TRUE),
(50, 3, 'LUISANAARELLANO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_luisanaarellano', 'LCDA. LUISANA ARELLANO', TRUE),
(51, 3, 'MAYRACARDENAS@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_mayracardenas', 'LCDA. MAYRA CARDENAS', TRUE),
(52, 3, 'MSCMARIBELSANCHEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_mscmaribelsanchez', 'LCDA. MSC. MARIBEL SANCHEZ', TRUE),
(53, 3, 'NORISFIGUEROA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_norisfigueroa', 'LCDA. NORIS FIGUEROA', TRUE),
(54, 3, 'NUBIACASTRO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_nubiacastro', 'LCDA. NUBIA CASTRO', TRUE),
(55, 3, 'LCDOPEDROZAMBRANO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_lcdopedrozambrano', 'LCDO PEDRO ZAMBRANO', TRUE),
(56, 3, 'ALEXANDERGARCIA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_alexandergarcia', 'LCDO. ALEXANDER GARCIA', TRUE),
(57, 3, 'DARIOMARTINEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_dariomartinez', 'LCDO. DARIO MARTINEZ', TRUE),
(58, 3, 'FERNANDOARRUNDOLL@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_fernandoarrundoll', 'LCDO. FERNANDO ARRUNDOLL', TRUE),
(59, 3, 'GERSONHMONSALVEU@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_gersonhmonsalveu', 'LCDO. GERSON H. MONSALVE U.', TRUE),
(60, 3, 'LEONARDODUARTE@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_leonardoduarte', 'LCDO. LEONARDO DUARTE', TRUE),
(61, 3, 'YORMANESOSAFERREIRA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_yormanesosaferreira', 'LCDO. YORMAN E SOSA FERREIRA', TRUE),
(62, 3, 'MARTAORTIZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_martaortiz', 'MARTA ORTIZ', TRUE),
(63, 3, 'MSCJUANMARTINEZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_mscjuanmartinez', 'MSC JUAN MARTINEZ', TRUE),
(64, 3, 'MSCKAROLBUSTAMANTE@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_msckarolbustamante', 'MSC KAROL BUSTAMANTE', TRUE),
(65, 3, 'MARIBELCYPEREZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_maribelcyperez', 'MSc. MARIBELCY PEREZ', TRUE),
(66, 3, 'YENYTVALERO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_yenytvalero', 'MSc. YENYT VALERO', TRUE),
(67, 3, 'JUANABSUAREZU@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_juanabsuarezu', 'PROF. JUANA B. SUAREZ U.', TRUE),
(68, 3, 'MARIELAVEGA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_marielavega', 'PROF. MARIELA VEGA', TRUE),
(69, 3, 'ROSENDOANTONIOESPINOZA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_rosendoantonioespinoza', 'PROF. ROSENDO ANTONIO ESPINOZA', TRUE),
(70, 3, 'FRANKLEONARDOALVIAREZ@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_frankleonardoalviarez', 'T.S.U. FRANK LEONARDO ALVIAREZ', TRUE),
(71, 3, 'HECTORALONSOBECERRA@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_hectoralonsobecerra', 'TEC. HECTOR ALONSO BECERRA', TRUE),
(72, 3, 'NINETTMALDONADO@TICEKTS.GOB', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'jefe_ninettmaldonado', 'TSU. NINETT MALDONADO', TRUE)
;

-- ================================================================
-- 2. CREAR REGISTROS EN BOSS
-- ================================================================
INSERT IGNORE INTO Boss (ID_Boss, Name_Boss, Pronoun, Fk_User) VALUES
(3, 'ABG. ANNY GUIRIGAY', 'ABG.', 6),
(4, 'ABG. DANIELA MALDONADO', 'ABG.', 7),
(5, 'ABG. FARIDE RAMIREZ', 'ABG.', 8),
(6, 'ABG. MARIO HERNAN IZARRA A.', 'ABG.', 9),
(7, 'ABG. THIANA JAIMES HERNANDEZ', 'ABG.', 10),
(8, 'ABG. VIVIANA CASTILLO', 'ABG.', 11),
(9, 'ABOG. ANTONIO MARTINEZ', 'ABOG.', 12),
(10, 'ABOG. ESP. JESUS AGUILAR M.', 'ABOG.', 13),
(11, 'ABOG. NELSON VIVAS JAIMES', 'ABOG.', 14),
(12, 'CMDT. ANTONIO BRICEÑO', 'CMDT.', 15),
(13, 'CNEL. RAFAEL CHACON', 'CNEL.', 16),
(14, 'DRA. GLEDY DELGADO', 'DRA.', 17),
(15, 'DRA. INDIRA USECHE', 'DRA.', 18),
(16, 'FABIOLA MORENO', NULL, 19),
(17, 'ING. ALBERT CONTRERAS', 'ING.', 20),
(18, 'ING. ANGELA GARCIA', 'ING.', 21),
(19, 'ING. CARLOS ACOSTA', 'ING.', 22),
(20, 'ING. CARMEN CORREDOR', 'ING.', 23),
(21, 'ING. CARMEN OSORIO', 'ING.', 24),
(22, 'ING. DANIEL NAVARRO DUQUE', 'ING.', 25),
(23, 'ING. FERNANDO RUIZ', 'ING.', 26),
(24, 'ING. JANICE GONZALEZ', 'ING.', 27),
(25, 'ING. JORFREN CONTRERAS', 'ING.', 28),
(26, 'ING. JOSE GREGORIO HERNANDEZ', 'ING.', 29),
(27, 'ING. JOVAN FLOREZ', 'ING.', 30),
(28, 'ING. KARELIS MORA', 'ING.', 31),
(29, 'ING. LUIS ANTONIO UZCATEGUI', 'ING.', 32),
(30, 'ING. VALDEMAR VASQUEZ', 'ING.', 33),
(31, 'JUAN ALBERTO MARTINEZ', NULL, 34),
(32, 'LCDA NERSA MONCADA', NULL, 35),
(33, 'LCDA. (MSc) AINARU SANCHEZ MUÑOZ', 'LCDA.', 36),
(34, 'LCDA. ANA MONCADA', 'LCDA.', 37),
(35, 'LCDA. BELKIS VASQUEZ', 'LCDA.', 38),
(36, 'LCDA. CARMEN DOS RAMOS', 'LCDA.', 39),
(37, 'LCDA. DALIA ROSA TERAN GONZALEZ', 'LCDA.', 40),
(38, 'LCDA. DALIA TERAN', 'LCDA.', 41),
(39, 'LCDA. DAYANA SANCHEZ', 'LCDA.', 42),
(40, 'LCDA. EDELIA RAQUEL GUERRERO ARAQUE', 'LCDA.', 43),
(41, 'LCDA. ELAYNE E. MENDEZ', 'LCDA.', 44),
(42, 'LCDA. ELAYNE EDITH MENDEZ', 'LCDA.', 45),
(43, 'LCDA. GLENYS DELGADO', 'LCDA.', 46),
(44, 'LCDA. ISABEL MEDINA', 'LCDA.', 47),
(45, 'LCDA. KARLA JUAREZ GARCIA', 'LCDA.', 48),
(46, 'LCDA. LINDA PARADA', 'LCDA.', 49),
(47, 'LCDA. LUISANA ARELLANO', 'LCDA.', 50),
(48, 'LCDA. MAYRA CARDENAS', 'LCDA.', 51),
(49, 'LCDA. MSC. MARIBEL SANCHEZ', 'LCDA.', 52),
(50, 'LCDA. NORIS FIGUEROA', 'LCDA.', 53),
(51, 'LCDA. NUBIA CASTRO', 'LCDA.', 54),
(52, 'LCDO PEDRO ZAMBRANO', NULL, 55),
(53, 'LCDO. ALEXANDER GARCIA', 'LCDO.', 56),
(54, 'LCDO. DARIO MARTINEZ', 'LCDO.', 57),
(55, 'LCDO. FERNANDO ARRUNDOLL', 'LCDO.', 58),
(56, 'LCDO. GERSON H. MONSALVE U.', 'LCDO.', 59),
(57, 'LCDO. LEONARDO DUARTE', 'LCDO.', 60),
(58, 'LCDO. YORMAN E SOSA FERREIRA', 'LCDO.', 61),
(59, 'MARTA ORTIZ', NULL, 62),
(60, 'MSC JUAN MARTINEZ', NULL, 63),
(61, 'MSC KAROL BUSTAMANTE', NULL, 64),
(62, 'MSc. MARIBELCY PEREZ', 'MSc.', 65),
(63, 'MSc. YENYT VALERO', 'MSc.', 66),
(64, 'PROF. JUANA B. SUAREZ U.', 'PROF.', 67),
(65, 'PROF. MARIELA VEGA', 'PROF.', 68),
(66, 'PROF. ROSENDO ANTONIO ESPINOZA', 'PROF.', 69),
(67, 'T.S.U. FRANK LEONARDO ALVIAREZ', 'T.S.U.', 70),
(68, 'TEC. HECTOR ALONSO BECERRA', 'TEC.', 71),
(69, 'TSU. NINETT MALDONADO', 'TSU.', 72)
;

-- ================================================================
-- 3. ASIGNAR JEFES A OFICINAS
-- ================================================================
UPDATE Office SET Fk_Boss_ID = 3 WHERE ID_Office IN (20);
UPDATE Office SET Fk_Boss_ID = 4 WHERE ID_Office IN (89);
UPDATE Office SET Fk_Boss_ID = 5 WHERE ID_Office IN (15);
UPDATE Office SET Fk_Boss_ID = 6 WHERE ID_Office IN (46);
UPDATE Office SET Fk_Boss_ID = 7 WHERE ID_Office IN (7);
UPDATE Office SET Fk_Boss_ID = 8 WHERE ID_Office IN (68);
UPDATE Office SET Fk_Boss_ID = 9 WHERE ID_Office IN (92);
UPDATE Office SET Fk_Boss_ID = 10 WHERE ID_Office IN (45);
UPDATE Office SET Fk_Boss_ID = 11 WHERE ID_Office IN (29);
UPDATE Office SET Fk_Boss_ID = 12 WHERE ID_Office IN (70);
UPDATE Office SET Fk_Boss_ID = 13 WHERE ID_Office IN (41);
UPDATE Office SET Fk_Boss_ID = 14 WHERE ID_Office IN (87);
UPDATE Office SET Fk_Boss_ID = 15 WHERE ID_Office IN (39);
UPDATE Office SET Fk_Boss_ID = 16 WHERE ID_Office IN (19);
UPDATE Office SET Fk_Boss_ID = 17 WHERE ID_Office IN (44);
UPDATE Office SET Fk_Boss_ID = 18 WHERE ID_Office IN (151);
UPDATE Office SET Fk_Boss_ID = 19 WHERE ID_Office IN (42, 67);
UPDATE Office SET Fk_Boss_ID = 20 WHERE ID_Office IN (59);
UPDATE Office SET Fk_Boss_ID = 21 WHERE ID_Office IN (32);
UPDATE Office SET Fk_Boss_ID = 22 WHERE ID_Office IN (43, 63);
UPDATE Office SET Fk_Boss_ID = 23 WHERE ID_Office IN (1);
UPDATE Office SET Fk_Boss_ID = 24 WHERE ID_Office IN (40);
UPDATE Office SET Fk_Boss_ID = 25 WHERE ID_Office IN (150);
UPDATE Office SET Fk_Boss_ID = 26 WHERE ID_Office IN (34);
UPDATE Office SET Fk_Boss_ID = 27 WHERE ID_Office IN (83);
UPDATE Office SET Fk_Boss_ID = 28 WHERE ID_Office IN (79);
UPDATE Office SET Fk_Boss_ID = 29 WHERE ID_Office IN (93);
UPDATE Office SET Fk_Boss_ID = 30 WHERE ID_Office IN (82);
UPDATE Office SET Fk_Boss_ID = 31 WHERE ID_Office IN (26);
UPDATE Office SET Fk_Boss_ID = 32 WHERE ID_Office IN (86);
UPDATE Office SET Fk_Boss_ID = 33 WHERE ID_Office IN (28);
UPDATE Office SET Fk_Boss_ID = 34 WHERE ID_Office IN (17);
UPDATE Office SET Fk_Boss_ID = 35 WHERE ID_Office IN (137);
UPDATE Office SET Fk_Boss_ID = 36 WHERE ID_Office IN (95);
UPDATE Office SET Fk_Boss_ID = 37 WHERE ID_Office IN (94);
UPDATE Office SET Fk_Boss_ID = 38 WHERE ID_Office IN (30, 159);
UPDATE Office SET Fk_Boss_ID = 39 WHERE ID_Office IN (38, 156);
UPDATE Office SET Fk_Boss_ID = 40 WHERE ID_Office IN (110);
UPDATE Office SET Fk_Boss_ID = 41 WHERE ID_Office IN (140);
UPDATE Office SET Fk_Boss_ID = 42 WHERE ID_Office IN (12);
UPDATE Office SET Fk_Boss_ID = 43 WHERE ID_Office IN (6, 22);
UPDATE Office SET Fk_Boss_ID = 44 WHERE ID_Office IN (91);
UPDATE Office SET Fk_Boss_ID = 45 WHERE ID_Office IN (36);
UPDATE Office SET Fk_Boss_ID = 46 WHERE ID_Office IN (141);
UPDATE Office SET Fk_Boss_ID = 47 WHERE ID_Office IN (49);
UPDATE Office SET Fk_Boss_ID = 48 WHERE ID_Office IN (80);
UPDATE Office SET Fk_Boss_ID = 49 WHERE ID_Office IN (139);
UPDATE Office SET Fk_Boss_ID = 50 WHERE ID_Office IN (48);
UPDATE Office SET Fk_Boss_ID = 51 WHERE ID_Office IN (23);
UPDATE Office SET Fk_Boss_ID = 52 WHERE ID_Office IN (25);
UPDATE Office SET Fk_Boss_ID = 53 WHERE ID_Office IN (81);
UPDATE Office SET Fk_Boss_ID = 54 WHERE ID_Office IN (76);
UPDATE Office SET Fk_Boss_ID = 55 WHERE ID_Office IN (78);
UPDATE Office SET Fk_Boss_ID = 56 WHERE ID_Office IN (31);
UPDATE Office SET Fk_Boss_ID = 57 WHERE ID_Office IN (8);
UPDATE Office SET Fk_Boss_ID = 58 WHERE ID_Office IN (24);
UPDATE Office SET Fk_Boss_ID = 59 WHERE ID_Office IN (71);
UPDATE Office SET Fk_Boss_ID = 60 WHERE ID_Office IN (47);
UPDATE Office SET Fk_Boss_ID = 61 WHERE ID_Office IN (138);
UPDATE Office SET Fk_Boss_ID = 62 WHERE ID_Office IN (143);
UPDATE Office SET Fk_Boss_ID = 63 WHERE ID_Office IN (14);
UPDATE Office SET Fk_Boss_ID = 64 WHERE ID_Office IN (62);
UPDATE Office SET Fk_Boss_ID = 65 WHERE ID_Office IN (142);
UPDATE Office SET Fk_Boss_ID = 66 WHERE ID_Office IN (99);
UPDATE Office SET Fk_Boss_ID = 67 WHERE ID_Office IN (13);
UPDATE Office SET Fk_Boss_ID = 68 WHERE ID_Office IN (77);
UPDATE Office SET Fk_Boss_ID = 69 WHERE ID_Office IN (88);

-- Oficinas SIN jefe (no se asigna nadie):
-- IDs: 2, 5, 11, 21, 27, 33, 37, 57, 58, 60, 61, 66, 69, 72, 73, 74, 75, 84, 96, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 144, 145, 146, 147, 148, 149, 152, 153, 154, 155, 157, 158, 160, 161, 162

-- ================================================================
-- 4. VERIFICACION
-- ================================================================
-- SELECT COUNT(*) AS Sin_Jefe FROM Office WHERE Fk_Boss_ID IS NULL;
-- SELECT ID_Office, Name_Office FROM Office WHERE Fk_Boss_ID IS NULL;
