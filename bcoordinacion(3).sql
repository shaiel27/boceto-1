-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-07-2026 a las 20:24:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.3.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sisco`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bcoordinacion`
--

CREATE TABLE `bcoordinacion` (
  `cod_dependencia` int(11) NOT NULL,
  `codigo` int(11) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `jefe` varchar(70) NOT NULL,
  `codnvo` int(6) NOT NULL,
  `oficina_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `bcoordinacion`
--

INSERT INTO `bcoordinacion` (`cod_dependencia`, `codigo`, `descripcion`, `jefe`, `codnvo`, `oficina_id`) VALUES
(1, 1, 'DESPACHO DEL ALCALDE (SA)', 'LCDA. NORIS FIGUEROA', 0, 48),
(2, 0, 'ATENCIÓN AL CIUDADANO', 'LCDA. KARLA JUAREZ GARCIA', 0, 36),
(3, 3, 'Coordinacion de Atencion de Sugerencias y Denuncias', '', 0, 146),
(4, 3, 'Coordinacion de Difusion de la informacion', '', 0, 115),
(5, 1, 'DIRECCIÓN EJECUTIVA DEL DESPACHO', 'ABG. MARIO HERNAN IZARRA A.', 0, 46),
(6, 2, 'DIVISION DE CONTRATACIONES', 'LCDA. CARMEN DOS RAMOS', 0, 95),
(7, 0, 'CONSEJO LOCAL DE PLANIFICACIÓN PÚBLICA', 'ING. JOSE GREGORIO HERNANDEZ ', 0, 34),
(8, 0, 'SINDICATURA MUNICIPAL', 'ABG. ANNY GUIRIGAY', 0, 20),
(9, 2, 'DIVISION DE INMUEBLES', '', 0, 147),
(10, 2, 'DIVISION DE ASUNTOS ADMINISTRATIVOS', '', 0, 131),
(11, 2, 'DIVISION DE ASUNTOS LITIGIOSOS', '', 0, 132),
(12, 0, 'AUDITORÍA INTERNA', 'ABOG. NELSON VIVAS JAIMES', 0, 29),
(13, 3, 'Coordinacion de Determinacion de Responsabilidades', '', 0, 114),
(14, 3, 'Coordinación de Potestad Investigativa', '', 0, 124),
(15, 3, 'Coordinacion de Control Posterior', 'LCDA. EDELIA RAQUEL GUERRERO ARAQUE', 0, 110),
(16, 0, 'REGISTRO CIVIL MUNICIPAL', '', 0, 73),
(17, 0, 'SECRETARIA DE GOBIERNO', '', 0, 144),
(18, 1, 'DIRECCIÓN GENERAL', 'MSC JUAN MARTINEZ', 0, 47),
(19, 3, 'Coordinacion de Seguridad y Salud Laboral', 'DRA. INDIRA USECHE', 0, 39),
(20, 0, 'ARCHIVO HISTÓRICO DE SAN CRISTÓBAL \"DR. JOSE JOAQUÍN VILLAMIZAR MOLINA', 'FABIOLA MORENO', 0, 19),
(21, 0, 'COOPERACION PROTOCOLAR Y RELACIONES INTERINSTITUCIONALES', 'LCDO. FERNANDO ARRUNDOLL', 0, 78),
(22, 3, 'Coordinacion de Protocolo y Cooperacion', '', 0, 148),
(23, 0, 'TESORERIA MUNICIPAL', 'LCDA. ANA MONCADA', 0, 17),
(24, 3, 'Coordinacion de Tributos', '', 0, 149),
(25, 3, 'Coordinacion de Taquilla', 'LCDA NERSA MONCADA', 0, 86),
(26, 0, 'INFORMATICA Y TECNOLOGIA', 'ING. FERNANDO RUIZ ', 0, 1),
(27, 3, 'Coordinacion de Redes', 'ING. JOVAN FLOREZ ', 0, 83),
(28, 3, 'Cordinacion de Programacion y Sistemas', 'ING. JORFREN CONTRERAS', 0, 150),
(29, 3, 'Coordinacion de Mantenimiento de Equipos de Computacion', 'ING. ANGELA GARCIA', 0, 151),
(30, 0, 'CONSULTORIA JURIDICA', 'ABOG. ESP. JESUS AGUILAR M.', 0, 45),
(31, 2, 'DIVISION DE JUSTICIA MUNICIPAL', 'ABG. FARIDE RAMIREZ ', 0, 15),
(32, 3, 'Coordinacion de Educacion y Justicia Municipal', '', 0, 152),
(33, 1, 'DIRECCION DE TALENTO HUMANO', 'LCDA. GLENYS DELGADO', 0, 6),
(34, 2, 'DIVISION DE GESTION DE TALENTO HUMANO', '', 0, 153),
(35, 3, 'Coordinacion de Captacion y Capacitacion del Personal', '', 0, 109),
(36, 3, 'Coordinacion de Bienestar Social', '', 0, 108),
(37, 2, 'DIVISION DEL AREA LEGAL Y ARCHIVO', 'ABG. THIANA JAIMES HERNANDEZ', 0, 7),
(38, 2, 'DIVISION DE NOMINAS Y PRESTACIONES', 'LCDO. LEONARDO DUARTE', 0, 8),
(39, 3, 'Coordinacion de Nomina', '', 0, 154),
(40, 3, 'Coordinacion de Prestaciones Sociales', '', 0, 155),
(41, 0, 'CONTRATACION COLECTIVA OBREROS', '', 0, 104),
(42, 0, 'CONTRATACION COLECTIVA EMPLEADOS', '', 0, 102),
(43, 1, 'DIRECCIÓN DE PLANIFICACIÓN Y PRESUPUESTO', 'LCDA. DAYANA SANCHEZ', 0, 38),
(44, 2, 'DIVISIÓN DE PLANIFICACIÓN', '', 0, 33),
(45, 2, 'DIVISIÓN DE PRESUPUESTO', 'LCDA. DAYANA SANCHEZ', 0, 156),
(46, 1, 'DIRECCIÓN DE ADMINISTRACION', 'LCDA. GLENYS DELGADO', 0, 22),
(47, 2, 'DIVISION DE COMPRAS', 'LCDO PEDRO ZAMBRANO', 0, 25),
(48, 3, 'Coordinacion de Deposito', '', 0, 57),
(49, 2, 'DIVISION DE CONTABILIDAD', 'LCDA. NUBIA CASTRO ', 0, 23),
(50, 2, 'DIVISION DE BIENES', 'LCDO.  YORMAN E SOSA FERREIRA', 0, 24),
(51, 2, 'DIVISION DE SERVICIOS GENERALES', 'JUAN ALBERTO MARTINEZ', 0, 26),
(52, 2, 'DIVISION DE MANTENIMIENTO VEHICULAR', '', 0, 58),
(53, 6, 'SUPERINTENDENCIA MUNICIPAL DE ADMINISTRACION TRIBUTARIA', 'ABOG. ANTONIO MARTINEZ', 0, 92),
(54, 3, 'Coordinacion de Fiscales', 'MSc. YENYT VALERO', 0, 14),
(55, 3, 'Coordinacion de Asuntos Legales', 'ABG. DANIELA MALDONADO', 0, 89),
(56, 2, 'DIVISION DE ACTIVIDADES ECONOMICAS', 'LCDA. MAYRA CARDENAS', 0, 80),
(57, 2, 'DIVISION DE RENTAS MUNICIPALES', 'T.S.U.  FRANK LEONARDO ALVIAREZ', 0, 13),
(58, 7, 'OFICINA DE PUBLICIDAD Y PROPAGANDA', '', 0, 21),
(59, 7, 'OFICINA DE CONTROL DE LICORES Y ESPECTÁCULOS PUBLICOS', '', 0, 11),
(60, 2, 'DIVISION DE COBRANZAS', '', 0, 96),
(61, 2, 'DIVISION DE ATENCION AL CONTRIBUYENTE', 'TSU. NINETT MALDONADO', 0, 88),
(62, 0, 'CONCEJO MUNICIPAL BOLIVARIANO DEL MUNICIPIO SAN CRISTOBAL', 'MARTA ORTIZ ', 0, 71),
(63, 0, 'CONTRALORÍA DEL MUNICIPIO SAN CRISTOBAL', '', 0, 72),
(64, 0, 'INSTITUTO AUTÓNOMO DE POLICÍA DEL MUNICIPIO SAN CRISTÓBAL', '', 0, 69),
(65, 1, 'SECRETARIA DE SEGURIDAD CIUDADANA', 'DRA. GLEDY DELGADO', 0, 87),
(66, 3, 'Coordinacion de Sala Situacional', '', 0, 126),
(67, 0, 'CUERPO DE BOMBEROS', 'CMDT. ANTONIO BRICEÑO ', 0, 70),
(68, 0, 'PROTECCIÓN CIVIL MUNICIPAL', 'CNEL. RAFAEL CHACON', 0, 41),
(69, 3, 'Coordinacion de Gestion de Riesgos', '', 0, 118),
(70, 3, 'Coordinacion de Operaciones', '', 0, 122),
(71, 3, 'Coordinacion de Educacion', '', 0, 157),
(72, 1, 'DIRECCION DE PROMOCCION Y FOMENTO DE LA PRODUCCION AGROALIMENTARIA', '', 0, 130),
(73, 1, 'DIRECCION DE DEPORTE Y RECREACCION', 'PROF. JUANA B. SUAREZ U.', 0, 62),
(74, 3, 'Coordinacion de Actividad Fisica, Recreacion y Masificacion Municipal', '', 0, 105),
(75, 1, 'DIRECCION DE VIALIDAD, TRANSITO, TRANSPORTE E INFRAESTRUCTURA', 'ING. CARLOS ACOSTA', 0, 42),
(76, 2, 'DIVISION DE TRANSITO Y TRANSPORTE', 'ING. ALBERT CONTRERAS', 0, 44),
(77, 3, 'Coordinacion de Operaciones de Transito', '', 0, 122),
(78, 3, 'Coordinacion de Ordenamiento de Transporte', '', 0, 123),
(79, 2, 'DIVISION DE VIALIDAD', 'ING. DANIEL NAVARRO DUQUE', 0, 63),
(80, 3, 'Coordinacion de Alumbrado Publico', 'ING. VALDEMAR VASQUEZ', 0, 82),
(81, 3, 'Coordinacion de Semaforos', '', 0, 127),
(82, 3, 'Coordinacion de Demarcacion y Señalamiento Vial', '', 0, 111),
(83, 2, 'DIVISION DE MANTENIMIENTO VIAL E INFRAESTRUCTURA', 'ING. DANIEL  NAVARRO DUQUE', 0, 43),
(84, 3, 'Coordinacion de Redes Hidraulicas, Rejillas y Alcantarillado', '', 0, 158),
(85, 3, 'Coordinación de Movimientos de Tierra y Canalizaciones', '', 0, 121),
(86, 3, 'Coordinación de Mantenimiento Vial y Rotura', '', 0, 120),
(87, 1, 'DIRECCION DE EDUCACION MUNICIPAL', 'LCDA. ELAYNE EDITH MENDEZ', 0, 12),
(88, 2, 'DIVISION DE DOCENCIA', '', 0, 136),
(89, 2, 'DIVISION DE BIENESTAR EDUCATIVO', '', 0, 134),
(90, 0, 'CONTRATACION COLECTIVA MAESTROS', '', 0, 103),
(91, 1, 'DIRECCION DE CULTURA MUNICIPAL', 'LCDO. ALEXANDER GARCIA', 0, 81),
(92, 3, 'Coordinación de Artes Plásticas, Escénicas, Musicales y Literatura.', '', 0, 107),
(93, 0, 'BANDA MUNICIPAL', 'PROF. ROSENDO ANTONIO ESPINOZA', 0, 99),
(94, 0, 'MEDIOS COMUNICACIONALES Y MARKETING DIGITAL', 'LCDA.  LUISANA ARELLANO', 0, 49),
(95, 3, 'Coordinacion de Información', '', 0, 162),
(96, 3, 'Coordinacion de Redes Sociales y Medios Digitales', '', 0, 125),
(97, 1, 'DIRECCIÓN DE DESARROLLO URBANO LOCAL', 'LCDA. DALIA TERAN', 0, 30),
(98, 3, 'Coordinacion de Fiscales de Control Urbano', '', 0, 145),
(99, 2, 'DIVISIÓN DE INGENIERÍA MUNICIPAL', 'ING. CARMEN OSORIO', 0, 32),
(100, 2, 'DIVISIÓN DE PLANIFICACIÓN URBANA', 'LCDA.  DALIA TERAN', 0, 159),
(101, 2, 'DIVISION DE CATASTRO', '', 0, 2),
(102, 7, 'Oficina tecnica de catastro', '', 0, 27),
(103, 7, 'Oficina legal de catastro', '', 0, 5),
(104, 3, 'Coordinacion de tierras', 'LCDA. (MSc) AINARU SANCHEZ MUÑOZ', 0, 28),
(105, 2, 'DIVISIÓN DE PROTECCIÓN AMBIENTAL', 'LCDO. GERSON H. MONSALVE U.', 0, 31),
(106, 0, 'PROYECTOS MUNICIPALES', '', 0, 37),
(107, 1, 'DIRECCION DE CONSTRUCCION DE OBRAS MUNICIPALES', '', 0, 60),
(108, 2, 'DIVISIÓN DE CONSTRUCCION Y REHABILITACION DE ESPACIOS PUBICOS', '', 0, 61),
(109, 3, 'Coordinacion de Desmalezamineto de Calles, Avenidas y Espacios Publicos', '', 0, 113),
(110, 3, 'Coordinacion de Embellecimiento de Fachadas y Elaboracion de Murales', '', 0, 116),
(111, 3, 'Coordinacion de Obras', '', 0, 160),
(112, 1, 'DIRECCION DE SERVICIOS PUBLICOS', 'LCDA. DALIA ROSA TERAN GONZALEZ', 0, 94),
(113, 2, 'DIVISIÓN DE SERVICIOS MUNICIPALES', '', 0, 66),
(114, 3, 'Coordinacion de Aseo Urbano', 'ING. LUIS ANTONIO UZCATEGUI ', 0, 93),
(115, 3, 'Coordinacion del Mercado Municipal La Guayana', '', 0, 74),
(116, 3, 'Coordinacion del Mercado Municipal La Villa', '', 0, 75),
(117, 3, 'Coordinacion del Mercado Municipal de Santa Teresa', '', 0, 128),
(118, 3, 'Coordinacion del Mercado Municipal La Ermita', 'LCDO. DARIO MARTINEZ', 0, 76),
(119, 3, 'Coordinacion del Cementerio Municipal', 'TEC. HECTOR ALONSO BECERRA', 0, 77),
(120, 1, 'DIRECCION DE AMBIENTE Y DESARROLLO SOSTENIBLE', '', 0, 106),
(121, 3, 'Coordinacion de Ambiente', '', 0, 161),
(122, 3, 'Coordinacion de Desarrollo Sostenible', '', 0, 112),
(123, 3, 'Coordinacion del Vivero Municipal', 'ING. CARMEN CORREDOR', 0, 59),
(124, 1, 'DIRECCION DE VIVIENDA MUNICIPAL', 'ING. KARELIS MORA', 0, 79),
(125, 3, 'Coordinación de Evaluación y Atención Social de Vivienda', '', 0, 117),
(126, 2, 'DIVISION DE DESARROLLO Y CONSERVACION DE VIVIENDA', '', 0, 135),
(127, 0, 'SERVICIO AUTONOMO TERMINAL DE PASAJERO ING TEOFILO CARDENAS', '', 0, 84),
(128, 1, 'DIRECCION DE SALUD MUNICIPAL', 'ING. CARLOS ACOSTA', 0, 67),
(129, 3, 'Coordinacion de los centros de salud comunitarios', '', 0, 119),
(130, 2, 'DIVISION DE ATENCION PRIMARIA EN SALUD', '', 0, 133),
(131, 0, 'INSTITUTO AUTONOMO MUNICIPAL DE DESARROLLO INTEGRAL DE SAN CRISTOBAL', 'ING. JANICE GONZALEZ', 0, 40),
(132, 0, 'SISTEMA DE PROTECCIÓN INTEGRAL DEL NIÑO, NIÑA Y DEL ADOLESCENTE', 'ABG. VIVIANA CASTILLO', 0, 68),
(133, 0, 'CONSEJO DE PROTECCIÓN', '', 0, 100),
(134, 0, 'CONSEJO MUNICIPAL DE DERECHO', '', 0, 101),
(135, 0, 'DEFENSORIA DEL NIÑO, NIÑA Y ADOLECENTE', '', 0, 129),
(136, 5, 'ESCUELA JOSE GONZALO MENDEZ', 'LCDA. BELKIS VASQUEZ', 0, 137),
(137, 5, 'ESCUELA JUANA MALDONADO G.', 'MSC KAROL BUSTAMANTE', 0, 138),
(138, 5, 'ESCUELA LUISA CACERES DE ARISMENDI', 'LCDA. ISABEL MEDINA', 0, 91),
(139, 5, 'ESCUELA REGINA DE VELAZQUEZ', 'LCDA. ELAYNE E. MENDEZ ', 0, 140),
(140, 5, 'ESCUELA SAN JOSE', 'PROF. MARIELA VEGA', 0, 142),
(141, 5, 'ESCUELA MARCO TULIO RAMIREZ ROA', 'LCDA. MSC. MARIBEL SANCHEZ', 0, 139),
(142, 5, 'ESCUELA SIMON RODRIGUEZ ', 'MSc. MARIBELCY PEREZ', 0, 143),
(143, 5, 'ESCUELA ROMULO GALLEGOS', 'LCDA. LINDA PARADA', 0, 141);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bcoordinacion`
--
ALTER TABLE `bcoordinacion`
  ADD PRIMARY KEY (`cod_dependencia`,`codigo`),
  ADD KEY `codnvo` (`codnvo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bcoordinacion`
--
ALTER TABLE `bcoordinacion`
  MODIFY `cod_dependencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
