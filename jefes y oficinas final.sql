-- ============================================================
-- Script completo: Todas las oficinas con sus jefes
-- Generado desde la base de datos local: 2026-07-19 03:58:08
-- Total oficinas: 143
-- Total jefes (con usuario + boss): 143
-- Oficinas SIN jefe: 56
-- ============================================================

USE tickets_system;

-- ============================================================
-- 1. LIMPIAR datos antiguos (orden correcto por FK)
-- ============================================================
UPDATE Office SET Fk_Boss_ID = NULL;
DELETE FROM Boss WHERE Fk_User NOT IN (SELECT ID_Users FROM Users WHERE Fk_Role IN (1,2,4));
DELETE FROM Users WHERE Fk_Role = 3 AND Email LIKE '%@tickets.gob' AND ID_Users NOT IN (SELECT Fk_User FROM Boss);

-- ============================================================
-- 2. INSERTAR TODAS LAS OFICINAS (143)
-- ============================================================
INSERT IGNORE INTO Office (ID_Office, Name_Office, coduniadm, Fk_Boss_ID, created_at) VALUES
(99, 'DESPACHO DEL ALCALDE(SA)', '0000000001', 1000, '2026-06-03 09:45:20'),
(103, 'COORDINACION DE CEMENTERIO MUNICIPAL', '0000000105', NULL, '2026-06-03 09:45:20'),
(106, 'DIRECCION DE PROMOCION Y FOMENTO DE LA PRODUCCION AGROALIMENTARIA', '0000000108', NULL, '2026-06-03 09:45:20'),
(107, 'DIRECCION DE SERVICIOS PUBLICOS', '0000000009', 1111, '2026-06-03 09:45:20'),
(123, 'DIVISION DE MANTENIMIENTO VEHICULAR', '0000000028', 1051, '2026-06-03 09:45:20'),
(142, 'ESCUELA MUNICIPAL MARCO TULIO RAMIREZ ROA', '0000000052', NULL, '2026-06-03 09:45:20'),
(145, 'ESCUELA MUNICIPAL SAN JOSE', '0000000055', NULL, '2026-06-03 09:45:20'),
(149, 'Coordinacion de Mercado Municipal de Santa Teresa', '0000000059', NULL, '2026-06-03 09:45:20'),
(150, 'Coordinacion de Aseo Urbano', '0000000060', 1113, '2026-06-03 09:45:20'),
(152, 'OFICINA DE PUBLICIDAD Y PROPAGANDA', '0000000084', NULL, '2026-06-03 09:45:20'),
(153, 'DIRECCION DE COOPERACION PROTOCOLARES Y RELACIONES INTERINSTITUCIONALES', '0000000063', NULL, '2026-06-03 09:45:20'),
(164, 'DEFENSORIA DEL NI├æO Y DEL ADOLECENTE', '0000000075', NULL, '2026-06-03 09:45:21'),
(166, 'DIRECCION DE DEPORTE Y RECREACION', '0000000077', NULL, '2026-06-03 09:45:21'),
(187, 'COORDINACION DEL MERCADO MUNICIPAL LA ERMITA', '0000000090', 1117, '2026-06-03 09:45:21'),
(191, 'OFICINA DE CONTROL DE LICORES  Y ESPECTACULOS PUBLICOS', '0000000121', NULL, '2026-06-03 09:45:21'),
(192, 'COORDINACION DE GESTION DE RIESGO', '0000000094', NULL, '2026-06-03 09:45:21'),
(194, 'COORDINACION DE EDUCACION', '0000000096', 1070, '2026-06-03 09:45:21'),
(196, 'SECRETARIA DE SEGURIDAD CIUDADANA', '0000000098', 1064, '2026-06-03 09:45:21'),
(197, 'DIVISION DE TRANSITO Y TRANSPORTE', '0000000099', 1075, '2026-06-03 09:45:21'),
(199, 'COORDINACION LEGAL DE CATASTRO', '0000000101', NULL, '2026-06-03 09:45:21'),
(201, 'COORDINACION DE AMBIENTE', '0000000103', 1120, '2026-06-03 09:45:21'),
(202, 'DIVISION DE ATENCION PRIMARIA EN SALUD', '0000000122', 1129, '2026-06-03 09:45:21'),
(1661, 'DIRECCION DE DESARROLLO URBANO LOCAL', '0000000003', NULL, '2026-07-03 10:45:14'),
(1662, 'DIRECCION DE EDUCACION MUNICIPAL', '0000000004', 1086, '2026-07-03 10:45:14'),
(1663, 'REGISTRO CIVIL MUNICIPAL', '0000000064', 1015, '2026-07-03 10:45:14'),
(1665, 'DIRECCION DE TALENTO HUMANO', '0000000010', 1032, '2026-07-03 10:45:14'),
(1671, 'DIVISION DE CATASTRO', '0000000019', 1100, '2026-07-03 10:45:14'),
(1672, 'DIVISION DE COMPRAS', '0000000020', 1046, '2026-07-03 10:45:14'),
(1673, 'DIVISION DE CONTRATACIONES', '0000000022', 1005, '2026-07-03 10:45:14'),
(1675, 'DIVISION  DE  SERVICIOS MUNICIPALES', '0000000025', NULL, '2026-07-03 10:45:14'),
(1676, 'DIVISION DE INGENERIA MUNICIPAL', '0000000026', NULL, '2026-07-03 10:45:14'),
(1677, 'Coordinacion de Desarrollo Sostenible', '0000000029', 1121, '2026-07-03 10:45:14'),
(1678, 'ATENCION AL CIUDADANO', '0000000031', NULL, '2026-07-03 10:45:14'),
(1680, 'DIVISION DE SANEAMIENTO AMBIENTAL', '0000000037', NULL, '2026-07-03 10:45:14'),
(1681, 'DIVISION DE VIALIDAD', '0000000039', 1078, '2026-07-03 10:45:14'),
(1682, 'ADMINISTRACION BOMBERIL', '0000000040', NULL, '2026-07-03 10:45:14'),
(1683, 'ARCHIVO HIST├ôRICO DE SAN CRIST├ôBAL ?DR. JOS├ë JOAQU├ìN VILLAMIZAR MOLINA?', '0000000041', NULL, '2026-07-03 10:45:14'),
(1684, 'AUDITORIA INTERNA', '0000000042', NULL, '2026-07-03 10:45:14'),
(1685, 'BANDA MUSICAL', '0000000043', NULL, '2026-07-03 10:45:14'),
(1686, 'CONSEJO LOCAL DE PLANIFICACION PUBLICA', '0000000044', NULL, '2026-07-03 10:45:14'),
(1687, 'CONSULTORIA JURIDICA', '0000000045', 1029, '2026-07-03 10:45:14'),
(1688, 'CUERPO DE BOMBEROS', '0000000046', 1066, '2026-07-03 10:45:14'),
(1689, 'EDUCACION BASICA', '0000000047', NULL, '2026-07-03 10:45:14'),
(1690, 'ESCUELA MUNICIPAL JOSE GONZALO MENDEZ', '0000000049', NULL, '2026-07-03 10:45:14'),
(1691, 'ESCUELA MUNICIPAL LUISA CACERES DE ARISMENDI', '0000000051', NULL, '2026-07-03 10:45:14'),
(1692, 'ESCUELA MUNICIPAL REGINA DE VELASQUEZ', '0000000053', NULL, '2026-07-03 10:45:14'),
(1693, 'ESCUELA MUNICIPAL ROMULO GALLEGOS', '0000000054', NULL, '2026-07-03 10:45:14'),
(1694, 'ESCUELA MUNICIPAL SIMON RODRIGUEZ', '0000000056', NULL, '2026-07-03 10:45:14'),
(1695, 'Coordinacion de Mercado Municipal La Ermita', '0000000057', NULL, '2026-07-03 10:45:14'),
(1696, 'Coordinacion de Mercado Municipal La Guayana', '0000000058', NULL, '2026-07-03 10:45:14'),
(1697, 'OFICINA DE LICORES Y ESPECTACULOS PUBLICOS', '0000000061', NULL, '2026-07-03 10:45:14'),
(1698, 'DIRECCI├ôN DEL SISTEMA DE PROTECCI├ôN INTEGRAL DEL NI├æO NI├æA Y ADOLESCENTE', '0000000066', NULL, '2026-07-03 10:45:14'),
(1699, 'INFORMATICA Y TECNOLOGIA', '0000000067', 1025, '2026-07-03 10:45:14'),
(1700, 'PROYECTOS MUNICIPALES', '0000000068', 1105, '2026-07-03 10:45:14'),
(1702, 'CONTRATACION COLECTIVA EMPLEADOS', '0000000070', NULL, '2026-07-03 10:45:14'),
(1703, 'DIVISION DE GESTION DE TALENTO HUMANO', '0000000071', 1033, '2026-07-03 10:45:14'),
(1704, 'CONSEJO DE PROTECCION', '0000000072', NULL, '2026-07-03 10:45:14'),
(1705, 'DIVISION DEL AREA LEGAL Y ARCHIVO', '0000000073', 1036, '2026-07-03 10:45:14'),
(1706, 'CONSEJO MUNICIPAL DE DERECHO', '0000000074', 1133, '2026-07-03 10:45:14'),
(1707, 'DIRECCION DE CULTURA MUNICIPAL', '0000000076', 1090, '2026-07-03 10:45:14'),
(1708, 'DIVISION DE ASUNTOS ADMINISTRATIVOS', '0000000078', 1009, '2026-07-03 10:45:14'),
(1709, 'DIVISION DE BIENESTAR EDUCATIVO', '0000000079', 1088, '2026-07-03 10:45:14'),
(1710, 'DIVISION DE DOCENCIA', '0000000080', 1087, '2026-07-03 10:45:14'),
(1711, 'SINDICATURA MUNICIPAL', '0000000065', 1007, '2026-07-03 10:45:14'),
(1712, 'DIRECCION DE AMBIENTE Y DESARROLLO SOSTENIBLE', '0000000024', 1119, '2026-07-03 10:45:14'),
(1713, 'DIVISION DE JUSTICIA MUNICIPAL', '0000000027', 1030, '2026-07-03 10:45:14'),
(1714, 'DIVISION DE NOMINAS Y PRESTACIONES SOCIALES', '0000000030', NULL, '2026-07-03 10:45:14'),
(1715, 'DIVISION DE PLANIFICACION URBANA', '0000000033', NULL, '2026-07-03 10:45:14'),
(1716, 'DIVISION DE PRESUPUESTO', '0000000034', NULL, '2026-07-03 10:45:14'),
(1717, 'DIVISION DE PROTECCION AMBIENTAL', '0000000035', NULL, '2026-07-03 10:45:14'),
(1718, 'GASTOS DE PREVISION Y SEGURIDAD SOCIAL DEL PERSONAL', '0000000082', NULL, '2026-07-03 10:45:14'),
(1719, 'OFICINA DE LICORES Y ESPECT├üCULOS PUBLICOS', '0000000083', NULL, '2026-07-03 10:45:14'),
(1721, 'DIVISION DE ACTIVIDADES ECONOMICAS', '0000000085', NULL, '2026-07-03 10:45:14'),
(1722, 'DIRECCION DE CONSTRUCCION DE OBRAS MUNICIPALES', '0000000086', 1106, '2026-07-03 10:45:14'),
(1723, 'DIVISI├ôN DE CONSTRUCCION Y REHABILITACION DE ESPACIOS PUBLICOS', '0000000087', NULL, '2026-07-03 10:45:14'),
(1724, 'DIVISION DE INMUEBLES', '0000000088', 1008, '2026-07-03 10:45:14'),
(1725, 'SECRETAR├ìA DE GOBIERNO', '0000000089', 1016, '2026-07-03 10:45:14'),
(1733, 'COORDINACION T├ëCNICA DE CATASTRO', '0000000100', NULL, '2026-07-03 10:50:19'),
(1735, 'DIVISION DE MANTENIMIENTO VIAL E INFRAESTRUCTURA', '0000000015', 1082, '2026-07-03 11:03:46'),
(1736, 'COORDINACION DE TIERRAS', '0000000102', 1103, '2026-07-03 11:03:46'),
(1737, 'DIRECCION DE MEDIOS, COMUNICACIONES Y MARKETING DIGITAL', '0000000006', NULL, '2026-07-03 11:03:56'),
(1738, 'DIRECCION DE PLANIFICACION Y PRESUPUESTO', '0000000007', NULL, '2026-07-03 11:03:56'),
(1739, 'DIRECCION DE VIALIDAD, TRANSITO, TRANSPORTE E INFRAESTRUCTURA', '0000000011', 1074, '2026-07-03 11:03:56'),
(1740, 'DIRECCION EJECUTIVA DEL DESPACHO', '0000000012', NULL, '2026-07-03 11:03:56'),
(1741, 'DIRECCION GENERAL', '0000000013', NULL, '2026-07-03 11:03:56'),
(1742, 'CONTRATACION COLECTIVA OBREROS', '0000000016', 1040, '2026-07-03 11:03:56'),
(1743, 'DIVISION DE ASUNTOS LITIGIOSOS', '0000000017', 1010, '2026-07-03 11:03:56'),
(1744, 'DIVISION DE BIENES MUNICIPALES', '0000000018', NULL, '2026-07-03 11:03:56'),
(1745, 'DIVISION DE CONTABIIDAD', '0000000021', NULL, '2026-07-03 11:03:56'),
(1746, 'COORDINACION MERCADO MUNICIPAL LA VILLA', '0000000104', NULL, '2026-07-03 11:03:56'),
(1747, 'PROTECCION CIVIL MUNICIPAL', '0000000008', NULL, '2026-07-03 11:03:56'),
(1749, 'DIVISION DE ACTIVIDADES ECONOMICAS', '0000000014', NULL, '2026-07-03 11:07:08'),
(1750, 'CONTRATACION COLECTIVA EMPLEADOS', '0000000023', 1041, '2026-07-03 11:07:08'),
(1751, 'DIVISION DE RENTAS MUNICIPALES', '0000000036', NULL, '2026-07-03 11:07:08'),
(1752, 'OFICINA DE PUBLICIDAD Y PROPAGANDA', '0000000062', NULL, '2026-07-03 11:07:08'),
(1755, 'SUPERINTENDENCIA MUNICIPAL DE ADMINISTRACION TRIBUTARIA', '0000000005', NULL, '2026-07-03 11:19:53'),
(1756, 'TESORERIA MUNICIPAL', '0000000069', 1022, '2026-07-03 11:19:53'),
(1762, 'DIRECCION DE SALUD MUNICIPAL', '0000000107', 1127, '2026-07-03 11:37:51'),
(1763, 'OFICINA LEGAL DE CATASTRO', '0000000112', 1102, '2026-07-03 11:37:51'),
(1764, 'DIVISION DE ACTIVIDADES ECONOMICAS', '0000000113', 1055, '2026-07-03 11:37:51'),
(1765, 'SUPERINTENDENCIA MUNICIPAL DE ADMINISTRACION TRIBUTARIA', '0000000114', 1052, '2026-07-03 11:37:51'),
(1766, 'DIVISION DE RENTAS MUNICIPALES', '0000000115', 1056, '2026-07-03 11:37:51'),
(1767, 'DIVISION DE ATENCION AL CONTRIBUYENTE', '0000000117', 1060, '2026-07-03 11:37:51'),
(1768, 'COORDINACION DE FISCALES', '0000000118', 1053, '2026-07-03 11:37:51'),
(1769, 'OFICINA DE PUBLICIDAD Y PROPAGANDA', '0000000120', 1057, '2026-07-03 11:37:51'),
(1770, 'DIVISION DE DESARROLLO Y CONSERVACION DE VIVIENDA', '0000000123', 1125, '2026-07-03 11:37:51'),
(1771, 'COORDINACION DE FISCALES DE CONTROL URBANO', '0000000124', 1097, '2026-07-03 11:37:51'),
(1772, 'DIRECCION DE VIVIENDA MUNICIPAL', '0000000106', 1123, '2026-07-03 11:37:51'),
(1773, 'DESPACHO DEL ALCALDE (SA)', '0000000048', NULL, '2026-07-04 15:47:55'),
(1775, 'Coordinacion de Atencion de Sugerencias y Denuncias', '0000000146', 1002, '2026-07-04 15:47:55'),
(1782, 'Coordinacion de Control Posterior', '0000000110', 1014, '2026-07-04 15:47:55'),
(1787, 'Coordinacion de Protocolo y Cooperacion', '0000000148', 1021, '2026-07-04 15:47:55'),
(1788, 'Coordinacion de Tributos', '0000000149', 1023, '2026-07-04 15:47:55'),
(1791, 'Cordinacion de Programacion y Sistemas', '0000000150', 1027, '2026-07-04 15:47:55'),
(1792, 'Coordinacion de Mantenimiento de Equipos de Computacion', '0000000151', 1028, '2026-07-04 15:47:55'),
(1793, 'Coordinacion de Educacion y Justicia Municipal', '0000000152', 1031, '2026-07-04 15:47:55'),
(1794, 'Coordinacion de Captacion y Capacitacion del Personal', '0000000109', 1034, '2026-07-04 15:47:55'),
(1797, 'Coordinacion de Nomina', '0000000154', 1038, '2026-07-04 15:47:55'),
(1798, 'Coordinacion de Prestaciones Sociales', '0000000155', 1039, '2026-07-04 15:47:55'),
(1799, 'DIRECCI├ôN DE PLANIFICACI├ôN Y PRESUPUESTO', '0000000038', 1042, '2026-07-04 15:47:55'),
(1801, 'DIVISI├ôN DE PRESUPUESTO', '0000000156', 1044, '2026-07-04 15:47:55'),
(1812, 'Coordinacion de Sala Situacional', '0000000126', 1065, '2026-07-04 15:47:55'),
(1816, 'DIRECCION DE PROMOCCION Y FOMENTO DE LA PRODUCCION AGROALIMENTARIA', '0000000130', 1071, '2026-07-04 15:47:55'),
(1822, 'Coordinacion de Semaforos', '0000000127', 1080, '2026-07-04 15:47:55'),
(1823, 'Coordinacion de Demarcacion y Se├▒alamiento Vial', '0000000111', 1081, '2026-07-04 15:47:55'),
(1824, 'Coordinacion de Redes Hidraulicas, Rejillas y Alcantarillado', '0000000158', 1083, '2026-07-04 15:47:55'),
(1831, 'Coordinacion de Informaci├│n', '0000000162', 1094, '2026-07-04 15:47:55'),
(1832, 'Coordinacion de Redes Sociales y Medios Digitales', '0000000125', 1095, '2026-07-04 15:47:55'),
(1834, 'DIVISI├ôN DE INGENIER├ìA MUNICIPAL', '0000000032', 1098, '2026-07-04 15:47:55'),
(1835, 'DIVISI├ôN DE PLANIFICACI├ôN URBANA', '0000000159', 1099, '2026-07-04 15:47:55'),
(1839, 'Coordinacion de Embellecimiento de Fachadas y Elaboracion de Murales', '0000000116', 1109, '2026-07-04 15:47:55'),
(1840, 'Coordinacion de Obras', '0000000160', 1110, '2026-07-04 15:47:55'),
(1844, 'Coordinacion del Mercado Municipal de Santa Teresa', '0000000128', 1116, '2026-07-04 15:47:55'),
(1848, 'Coordinacion de los centros de salud comunitarios', '0000000119', 1128, '2026-07-04 15:47:55'),
(1852, 'DEFENSORIA DEL NI├æO, NI├æA Y ADOLECENTE', '0000000129', 1134, '2026-07-04 15:47:55'),
(1853, 'ESCUELA JOSE GONZALO MENDEZ', '0000000137', 1135, '2026-07-04 15:47:55'),
(1854, 'ESCUELA JUANA MALDONADO G.', '0000000138', 1136, '2026-07-04 15:47:55'),
(1855, 'ESCUELA LUISA CACERES DE ARISMENDI', '0000000091', 1137, '2026-07-04 15:47:55'),
(1856, 'ESCUELA REGINA DE VELAZQUEZ', '0000000140', 1138, '2026-07-04 15:47:55'),
(1857, 'ESCUELA SAN JOSE', '0000000142', 1139, '2026-07-04 15:47:55'),
(1858, 'ESCUELA MARCO TULIO RAMIREZ ROA', '0000000139', 1140, '2026-07-04 15:47:55'),
(1859, 'ESCUELA SIMON RODRIGUEZ ', '0000000143', 1141, '2026-07-04 15:47:55'),
(1860, 'ESCUELA ROMULO GALLEGOS', '0000000141', 1142, '2026-07-04 15:47:55');

-- ============================================================
-- 3. INSERTAR USUARIOS JEFES (143)
-- ============================================================
INSERT IGNORE INTO Users (ID_Users, Fk_Role, Email, Password, Username, Full_Name, is_system_user) VALUES
(100, 3, 'DESPACHO_DEL_ALCALDE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'despacho_del_alcalde', 'LCDA. NORIS FIGUEROA', TRUE),
(101, 3, 'ATENCION_AL_CIUDADANO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'atencion_al_ciudadano', 'LCDA. KARLA JUAREZ GARCIA', TRUE),
(102, 3, 'COORDINACION_DE_ATENCION_DE_SUGERENCIAS_Y_DENUNCIAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_atencion_de_sugerencias_y_denuncias', 'Coordinacion de Atencion de Sugerencias y Denuncias', TRUE),
(103, 3, 'COORDINACION_DE_DIFUSION_DE_LA_INFORMACION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_difusion_de_la_informacion', 'Coordinacion de Difusion de la informacion', TRUE),
(104, 3, 'DIRECCION_EJECUTIVA_DEL_DESPACHO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_ejecutiva_del_despacho', 'ABG. MARIO HERNAN IZARRA A.', TRUE),
(105, 3, 'DIVISION_DE_CONTRATACIONES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_contrataciones', 'LCDA. CARMEN DOS RAMOS', TRUE),
(106, 3, 'CONSEJO_LOCAL_DE_PLANIFICACION_PUBLICA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'consejo_local_de_planificacion_publica', 'ING. JOSE GREGORIO HERNANDEZ ', TRUE),
(107, 3, 'SINDICATURA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'sindicatura_municipal', 'ABG. ANNY GUIRIGAY', TRUE),
(108, 3, 'DIVISION_DE_INMUEBLES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_inmuebles', 'DIVISION DE INMUEBLES', TRUE),
(109, 3, 'DIVISION_DE_ASUNTOS_ADMINISTRATIVOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_asuntos_administrativos', 'DIVISION DE ASUNTOS ADMINISTRATIVOS', TRUE),
(110, 3, 'DIVISION_DE_ASUNTOS_LITIGIOSOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_asuntos_litigiosos', 'DIVISION DE ASUNTOS LITIGIOSOS', TRUE),
(111, 3, 'AUDITORIA_INTERNA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'auditoria_interna', 'ABOG. NELSON VIVAS JAIMES', TRUE),
(112, 3, 'COORDINACION_DE_DETERMINACION_DE_RESPONSABILIDADES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_determinacion_de_responsabilidades', 'Coordinacion de Determinacion de Responsabilidades', TRUE),
(113, 3, 'COORDINACION_DE_POTESTAD_INVESTIGATIVA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_potestad_investigativa', 'Coordinaci├│n de Potestad Investigativa', TRUE),
(114, 3, 'COORDINACION_DE_CONTROL_POSTERIOR@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_control_posterior', 'LCDA. EDELIA RAQUEL GUERRERO ARAQUE', TRUE),
(115, 3, 'REGISTRO_CIVIL_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'registro_civil_municipal', 'REGISTRO CIVIL MUNICIPAL', TRUE),
(116, 3, 'SECRETARIA_DE_GOBIERNO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'secretaria_de_gobierno', 'SECRETARIA DE GOBIERNO', TRUE),
(117, 3, 'DIRECCION_GENERAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_general', 'MSC JUAN MARTINEZ', TRUE),
(118, 3, 'COORDINACION_DE_SEGURIDAD_Y_SALUD_LABORAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_seguridad_y_salud_laboral', 'DRA. INDIRA USECHE', TRUE),
(119, 3, 'ARCHIVO_HISTORICO_DE_SAN_CRISTOBAL_DR_JOSE_JOAQUIN_VILLAMIZAR_MOLINA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'archivo_historico_de_san_cristobal_dr_jose_joaquin_villamizar_molina', 'FABIOLA MORENO', TRUE),
(120, 3, 'COOPERACION_PROTOCOLAR_Y_RELACIONES_INTERINSTITUCIONALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'cooperacion_protocolar_y_relaciones_interinstitucionales', 'LCDO. FERNANDO ARRUNDOLL', TRUE),
(121, 3, 'COORDINACION_DE_PROTOCOLO_Y_COOPERACION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_protocolo_y_cooperacion', 'Coordinacion de Protocolo y Cooperacion', TRUE),
(122, 3, 'TESORERIA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'tesoreria_municipal', 'LCDA. ANA MONCADA', TRUE),
(123, 3, 'COORDINACION_DE_TRIBUTOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_tributos', 'Coordinacion de Tributos', TRUE),
(124, 3, 'COORDINACION_DE_TAQUILLA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_taquilla', 'LCDA NERSA MONCADA', TRUE),
(125, 3, 'INFORMATICA_Y_TECNOLOGIA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'informatica_y_tecnologia', 'ING. FERNANDO RUIZ ', TRUE),
(126, 3, 'COORDINACION_DE_REDES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_redes', 'ING. JOVAN FLOREZ ', TRUE),
(127, 3, 'CORDINACION_DE_PROGRAMACION_Y_SISTEMAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'cordinacion_de_programacion_y_sistemas', 'ING. JORFREN CONTRERAS', TRUE),
(128, 3, 'COORDINACION_DE_MANTENIMIENTO_DE_EQUIPOS_DE_COMPUTACION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_mantenimiento_de_equipos_de_computacion', 'ING. ANGELA GARCIA', TRUE),
(129, 3, 'CONSULTORIA_JURIDICA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'consultoria_juridica', 'ABOG. ESP. JESUS AGUILAR M.', TRUE),
(130, 3, 'DIVISION_DE_JUSTICIA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_justicia_municipal', 'ABG. FARIDE RAMIREZ ', TRUE),
(131, 3, 'COORDINACION_DE_EDUCACION_Y_JUSTICIA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_educacion_y_justicia_municipal', 'Coordinacion de Educacion y Justicia Municipal', TRUE),
(132, 3, 'DIRECCION_DE_TALENTO_HUMANO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_talento_humano', 'LCDA. GLENYS DELGADO', TRUE),
(133, 3, 'DIVISION_DE_GESTION_DE_TALENTO_HUMANO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_gestion_de_talento_humano', 'DIVISION DE GESTION DE TALENTO HUMANO', TRUE),
(134, 3, 'COORDINACION_DE_CAPTACION_Y_CAPACITACION_DEL_PERSONAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_captacion_y_capacitacion_del_personal', 'Coordinacion de Captacion y Capacitacion del Personal', TRUE),
(135, 3, 'COORDINACION_DE_BIENESTAR_SOCIAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_bienestar_social', 'Coordinacion de Bienestar Social', TRUE),
(136, 3, 'DIVISION_DEL_AREA_LEGAL_Y_ARCHIVO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_del_area_legal_y_archivo', 'ABG. THIANA JAIMES HERNANDEZ', TRUE),
(137, 3, 'DIVISION_DE_NOMINAS_Y_PRESTACIONES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_nominas_y_prestaciones', 'LCDO. LEONARDO DUARTE', TRUE),
(138, 3, 'COORDINACION_DE_NOMINA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_nomina', 'Coordinacion de Nomina', TRUE),
(139, 3, 'COORDINACION_DE_PRESTACIONES_SOCIALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_prestaciones_sociales', 'Coordinacion de Prestaciones Sociales', TRUE),
(140, 3, 'CONTRATACION_COLECTIVA_OBREROS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'contratacion_colectiva_obreros', 'CONTRATACION COLECTIVA OBREROS', TRUE),
(141, 3, 'CONTRATACION_COLECTIVA_EMPLEADOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'contratacion_colectiva_empleados', 'CONTRATACION COLECTIVA EMPLEADOS', TRUE),
(142, 3, 'DIRECCION_DE_PLANIFICACION_Y_PRESUPUESTO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_planificacion_y_presupuesto', 'LCDA. DAYANA SANCHEZ', TRUE),
(143, 3, 'DIVISION_DE_PLANIFICACION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_planificacion', 'DIVISI├ôN DE PLANIFICACI├ôN', TRUE),
(144, 3, 'DIVISION_DE_PRESUPUESTO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_presupuesto', 'LCDA. DAYANA SANCHEZ', TRUE),
(145, 3, 'DIRECCION_DE_ADMINISTRACION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_administracion', 'LCDA. GLENYS DELGADO', TRUE),
(146, 3, 'DIVISION_DE_COMPRAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_compras', 'LCDO PEDRO ZAMBRANO', TRUE),
(147, 3, 'COORDINACION_DE_DEPOSITO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_deposito', 'Coordinacion de Deposito', TRUE),
(148, 3, 'DIVISION_DE_CONTABILIDAD@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_contabilidad', 'LCDA. NUBIA CASTRO ', TRUE),
(149, 3, 'DIVISION_DE_BIENES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_bienes', 'LCDO.  YORMAN E SOSA FERREIRA', TRUE),
(150, 3, 'DIVISION_DE_SERVICIOS_GENERALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_servicios_generales', 'JUAN ALBERTO MARTINEZ', TRUE),
(151, 3, 'DIVISION_DE_MANTENIMIENTO_VEHICULAR@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_mantenimiento_vehicular', 'DIVISION DE MANTENIMIENTO VEHICULAR', TRUE),
(152, 3, 'SUPERINTENDENCIA_MUNICIPAL_DE_ADMINISTRACION_TRIBUTARIA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'superintendencia_municipal_de_administracion_tributaria', 'ABOG. ANTONIO MARTINEZ', TRUE),
(153, 3, 'COORDINACION_DE_FISCALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_fiscales', 'MSc. YENYT VALERO', TRUE),
(154, 3, 'COORDINACION_DE_ASUNTOS_LEGALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_asuntos_legales', 'ABG. DANIELA MALDONADO', TRUE),
(155, 3, 'DIVISION_DE_ACTIVIDADES_ECONOMICAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_actividades_economicas', 'LCDA. MAYRA CARDENAS', TRUE),
(156, 3, 'DIVISION_DE_RENTAS_MUNICIPALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_rentas_municipales', 'T.S.U.  FRANK LEONARDO ALVIAREZ', TRUE),
(157, 3, 'OFICINA_DE_PUBLICIDAD_Y_PROPAGANDA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'oficina_de_publicidad_y_propaganda', 'OFICINA DE PUBLICIDAD Y PROPAGANDA', TRUE),
(158, 3, 'OFICINA_DE_CONTROL_DE_LICORES_Y_ESPECTACULOS_PUBLICOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'oficina_de_control_de_licores_y_espectaculos_publicos', 'OFICINA DE CONTROL DE LICORES Y ESPECT├üCULOS PUBLICOS', TRUE),
(159, 3, 'DIVISION_DE_COBRANZAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_cobranzas', 'DIVISION DE COBRANZAS', TRUE),
(160, 3, 'DIVISION_DE_ATENCION_AL_CONTRIBUYENTE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_atencion_al_contribuyente', 'TSU. NINETT MALDONADO', TRUE),
(161, 3, 'CONCEJO_MUNICIPAL_BOLIVARIANO_DEL_MUNICIPIO_SAN_CRISTOBAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'concejo_municipal_bolivariano_del_municipio_san_cristobal', 'MARTA ORTIZ ', TRUE),
(162, 3, 'CONTRALORIA_DEL_MUNICIPIO_SAN_CRISTOBAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'contraloria_del_municipio_san_cristobal', 'CONTRALOR├ìA DEL MUNICIPIO SAN CRISTOBAL', TRUE),
(163, 3, 'INSTITUTO_AUTONOMO_DE_POLICIA_DEL_MUNICIPIO_SAN_CRISTOBAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'instituto_autonomo_de_policia_del_municipio_san_cristobal', 'INSTITUTO AUT├ôNOMO DE POLIC├ìA DEL MUNICIPIO SAN CRIST├ôBAL', TRUE),
(164, 3, 'SECRETARIA_DE_SEGURIDAD_CIUDADANA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'secretaria_de_seguridad_ciudadana', 'DRA. GLEDY DELGADO', TRUE),
(165, 3, 'COORDINACION_DE_SALA_SITUACIONAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_sala_situacional', 'Coordinacion de Sala Situacional', TRUE),
(166, 3, 'CUERPO_DE_BOMBEROS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'cuerpo_de_bomberos', 'CMDT. ANTONIO BRICE├æO ', TRUE),
(167, 3, 'PROTECCION_CIVIL_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'proteccion_civil_municipal', 'CNEL. RAFAEL CHACON', TRUE),
(168, 3, 'COORDINACION_DE_GESTION_DE_RIESGOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_gestion_de_riesgos', 'Coordinacion de Gestion de Riesgos', TRUE),
(169, 3, 'COORDINACION_DE_OPERACIONES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_operaciones', 'Coordinacion de Operaciones', TRUE),
(170, 3, 'COORDINACION_DE_EDUCACION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_educacion', 'Coordinacion de Educacion', TRUE),
(171, 3, 'DIRECCION_DE_PROMOCCION_Y_FOMENTO_DE_LA_PRODUCCION_AGROALIMENTARIA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_promoccion_y_fomento_de_la_produccion_agroalimentaria', 'DIRECCION DE PROMOCCION Y FOMENTO DE LA PRODUCCION AGROALIMENTARIA', TRUE),
(172, 3, 'DIRECCION_DE_DEPORTE_Y_RECREACCION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_deporte_y_recreaccion', 'PROF. JUANA B. SUAREZ U.', TRUE),
(173, 3, 'COORDINACION_DE_ACTIVIDAD_FISICA_RECREACION_Y_MASIFICACION_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_actividad_fisica_recreacion_y_masificacion_municipal', 'Coordinacion de Actividad Fisica, Recreacion y Masificacion Municipal', TRUE),
(174, 3, 'DIRECCION_DE_VIALIDAD_TRANSITO_TRANSPORTE_E_INFRAESTRUCTURA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_vialidad_transito_transporte_e_infraestructura', 'ING. CARLOS ACOSTA', TRUE),
(175, 3, 'DIVISION_DE_TRANSITO_Y_TRANSPORTE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_transito_y_transporte', 'ING. ALBERT CONTRERAS', TRUE),
(176, 3, 'COORDINACION_DE_OPERACIONES_DE_TRANSITO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_operaciones_de_transito', 'Coordinacion de Operaciones de Transito', TRUE),
(177, 3, 'COORDINACION_DE_ORDENAMIENTO_DE_TRANSPORTE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_ordenamiento_de_transporte', 'Coordinacion de Ordenamiento de Transporte', TRUE),
(178, 3, 'DIVISION_DE_VIALIDAD@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_vialidad', 'ING. DANIEL NAVARRO DUQUE', TRUE),
(179, 3, 'COORDINACION_DE_ALUMBRADO_PUBLICO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_alumbrado_publico', 'ING. VALDEMAR VASQUEZ', TRUE),
(180, 3, 'COORDINACION_DE_SEMAFOROS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_semaforos', 'Coordinacion de Semaforos', TRUE),
(181, 3, 'COORDINACION_DE_DEMARCACION_Y_SENALAMIENTO_VIAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_demarcacion_y_senalamiento_vial', 'Coordinacion de Demarcacion y Se├▒alamiento Vial', TRUE),
(182, 3, 'DIVISION_DE_MANTENIMIENTO_VIAL_E_INFRAESTRUCTURA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_mantenimiento_vial_e_infraestructura', 'ING. DANIEL  NAVARRO DUQUE', TRUE),
(183, 3, 'COORDINACION_DE_REDES_HIDRAULICAS_REJILLAS_Y_ALCANTARILLADO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_redes_hidraulicas_rejillas_y_alcantarillado', 'Coordinacion de Redes Hidraulicas, Rejillas y Alcantarillado', TRUE),
(184, 3, 'COORDINACION_DE_MOVIMIENTOS_DE_TIERRA_Y_CANALIZACIONES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_movimientos_de_tierra_y_canalizaciones', 'Coordinaci├│n de Movimientos de Tierra y Canalizaciones', TRUE),
(185, 3, 'COORDINACION_DE_MANTENIMIENTO_VIAL_Y_ROTURA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_mantenimiento_vial_y_rotura', 'Coordinaci├│n de Mantenimiento Vial y Rotura', TRUE),
(186, 3, 'DIRECCION_DE_EDUCACION_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_educacion_municipal', 'LCDA. ELAYNE EDITH MENDEZ', TRUE),
(187, 3, 'DIVISION_DE_DOCENCIA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_docencia', 'DIVISION DE DOCENCIA', TRUE),
(188, 3, 'DIVISION_DE_BIENESTAR_EDUCATIVO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_bienestar_educativo', 'DIVISION DE BIENESTAR EDUCATIVO', TRUE),
(189, 3, 'CONTRATACION_COLECTIVA_MAESTROS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'contratacion_colectiva_maestros', 'CONTRATACION COLECTIVA MAESTROS', TRUE),
(190, 3, 'DIRECCION_DE_CULTURA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_cultura_municipal', 'LCDO. ALEXANDER GARCIA', TRUE),
(191, 3, 'COORDINACION_DE_ARTES_PLASTICAS_ESCENICAS_MUSICALES_Y_LITERATURA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_artes_plasticas_escenicas_musicales_y_literatura', 'Coordinaci├│n de Artes Pl├ísticas, Esc├®nicas, Musicales y Literatura.', TRUE),
(192, 3, 'BANDA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'banda_municipal', 'PROF. ROSENDO ANTONIO ESPINOZA', TRUE),
(193, 3, 'MEDIOS_COMUNICACIONALES_Y_MARKETING_DIGITAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'medios_comunicacionales_y_marketing_digital', 'LCDA.  LUISANA ARELLANO', TRUE),
(194, 3, 'COORDINACION_DE_INFORMACION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_informacion', 'Coordinacion de Informaci├│n', TRUE),
(195, 3, 'COORDINACION_DE_REDES_SOCIALES_Y_MEDIOS_DIGITALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_redes_sociales_y_medios_digitales', 'Coordinacion de Redes Sociales y Medios Digitales', TRUE),
(196, 3, 'DIRECCION_DE_DESARROLLO_URBANO_LOCAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_desarrollo_urbano_local', 'LCDA. DALIA TERAN', TRUE),
(197, 3, 'COORDINACION_DE_FISCALES_DE_CONTROL_URBANO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_fiscales_de_control_urbano', 'Coordinacion de Fiscales de Control Urbano', TRUE),
(198, 3, 'DIVISION_DE_INGENIERIA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_ingenieria_municipal', 'ING. CARMEN OSORIO', TRUE),
(199, 3, 'DIVISION_DE_PLANIFICACION_URBANA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_planificacion_urbana', 'LCDA.  DALIA TERAN', TRUE),
(200, 3, 'DIVISION_DE_CATASTRO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_catastro', 'DIVISION DE CATASTRO', TRUE),
(201, 3, 'OFICINA_TECNICA_DE_CATASTRO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'oficina_tecnica_de_catastro', 'Oficina tecnica de catastro', TRUE),
(202, 3, 'OFICINA_LEGAL_DE_CATASTRO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'oficina_legal_de_catastro', 'Oficina legal de catastro', TRUE),
(203, 3, 'COORDINACION_DE_TIERRAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_tierras', 'LCDA. (MSc) AINARU SANCHEZ MU├æOZ', TRUE),
(204, 3, 'DIVISION_DE_PROTECCION_AMBIENTAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_proteccion_ambiental', 'LCDO. GERSON H. MONSALVE U.', TRUE),
(205, 3, 'PROYECTOS_MUNICIPALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'proyectos_municipales', 'PROYECTOS MUNICIPALES', TRUE),
(206, 3, 'DIRECCION_DE_CONSTRUCCION_DE_OBRAS_MUNICIPALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_construccion_de_obras_municipales', 'DIRECCION DE CONSTRUCCION DE OBRAS MUNICIPALES', TRUE),
(207, 3, 'DIVISION_DE_CONSTRUCCION_Y_REHABILITACION_DE_ESPACIOS_PUBICOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_construccion_y_rehabilitacion_de_espacios_pubicos', 'DIVISI├ôN DE CONSTRUCCION Y REHABILITACION DE ESPACIOS PUBICOS', TRUE),
(208, 3, 'COORDINACION_DE_DESMALEZAMINETO_DE_CALLES_AVENIDAS_Y_ESPACIOS_PUBLICOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_desmalezamineto_de_calles_avenidas_y_espacios_publicos', 'Coordinacion de Desmalezamineto de Calles, Avenidas y Espacios Publicos', TRUE),
(209, 3, 'COORDINACION_DE_EMBELLECIMIENTO_DE_FACHADAS_Y_ELABORACION_DE_MURALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_embellecimiento_de_fachadas_y_elaboracion_de_murales', 'Coordinacion de Embellecimiento de Fachadas y Elaboracion de Murales', TRUE),
(210, 3, 'COORDINACION_DE_OBRAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_obras', 'Coordinacion de Obras', TRUE),
(211, 3, 'DIRECCION_DE_SERVICIOS_PUBLICOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_servicios_publicos', 'LCDA. DALIA ROSA TERAN GONZALEZ', TRUE),
(212, 3, 'DIVISION_DE_SERVICIOS_MUNICIPALES@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_servicios_municipales', 'DIVISI├ôN DE SERVICIOS MUNICIPALES', TRUE),
(213, 3, 'COORDINACION_DE_ASEO_URBANO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_aseo_urbano', 'ING. LUIS ANTONIO UZCATEGUI ', TRUE),
(214, 3, 'COORDINACION_DEL_MERCADO_MUNICIPAL_LA_GUAYANA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_del_mercado_municipal_la_guayana', 'Coordinacion del Mercado Municipal La Guayana', TRUE),
(215, 3, 'COORDINACION_DEL_MERCADO_MUNICIPAL_LA_VILLA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_del_mercado_municipal_la_villa', 'Coordinacion del Mercado Municipal La Villa', TRUE),
(216, 3, 'COORDINACION_DEL_MERCADO_MUNICIPAL_DE_SANTA_TERESA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_del_mercado_municipal_de_santa_teresa', 'Coordinacion del Mercado Municipal de Santa Teresa', TRUE),
(217, 3, 'COORDINACION_DEL_MERCADO_MUNICIPAL_LA_ERMITA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_del_mercado_municipal_la_ermita', 'LCDO. DARIO MARTINEZ', TRUE),
(218, 3, 'COORDINACION_DEL_CEMENTERIO_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_del_cementerio_municipal', 'TEC. HECTOR ALONSO BECERRA', TRUE),
(219, 3, 'DIRECCION_DE_AMBIENTE_Y_DESARROLLO_SOSTENIBLE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_ambiente_y_desarrollo_sostenible', 'DIRECCION DE AMBIENTE Y DESARROLLO SOSTENIBLE', TRUE),
(220, 3, 'COORDINACION_DE_AMBIENTE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_ambiente', 'Coordinacion de Ambiente', TRUE),
(221, 3, 'COORDINACION_DE_DESARROLLO_SOSTENIBLE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_desarrollo_sostenible', 'Coordinacion de Desarrollo Sostenible', TRUE),
(222, 3, 'COORDINACION_DEL_VIVERO_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_del_vivero_municipal', 'ING. CARMEN CORREDOR', TRUE),
(223, 3, 'DIRECCION_DE_VIVIENDA_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_vivienda_municipal', 'ING. KARELIS MORA', TRUE),
(224, 3, 'COORDINACION_DE_EVALUACION_Y_ATENCION_SOCIAL_DE_VIVIENDA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_evaluacion_y_atencion_social_de_vivienda', 'Coordinaci├│n de Evaluaci├│n y Atenci├│n Social de Vivienda', TRUE),
(225, 3, 'DIVISION_DE_DESARROLLO_Y_CONSERVACION_DE_VIVIENDA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_desarrollo_y_conservacion_de_vivienda', 'DIVISION DE DESARROLLO Y CONSERVACION DE VIVIENDA', TRUE),
(226, 3, 'SERVICIO_AUTONOMO_TERMINAL_DE_PASAJERO_ING_TEOFILO_CARDENAS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'servicio_autonomo_terminal_de_pasajero_ing_teofilo_cardenas', 'SERVICIO AUTONOMO TERMINAL DE PASAJERO ING TEOFILO CARDENAS', TRUE),
(227, 3, 'DIRECCION_DE_SALUD_MUNICIPAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'direccion_de_salud_municipal', 'ING. CARLOS ACOSTA', TRUE),
(228, 3, 'COORDINACION_DE_LOS_CENTROS_DE_SALUD_COMUNITARIOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'coordinacion_de_los_centros_de_salud_comunitarios', 'Coordinacion de los centros de salud comunitarios', TRUE),
(229, 3, 'DIVISION_DE_ATENCION_PRIMARIA_EN_SALUD@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'division_de_atencion_primaria_en_salud', 'DIVISION DE ATENCION PRIMARIA EN SALUD', TRUE),
(230, 3, 'INSTITUTO_AUTONOMO_MUNICIPAL_DE_DESARROLLO_INTEGRAL_DE_SAN_CRISTOBAL@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'instituto_autonomo_municipal_de_desarrollo_integral_de_san_cristobal', 'ING. JANICE GONZALEZ', TRUE),
(231, 3, 'SISTEMA_DE_PROTECCION_INTEGRAL_DEL_NINO_NINA_Y_DEL_ADOLESCENTE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'sistema_de_proteccion_integral_del_nino_nina_y_del_adolescente', 'ABG. VIVIANA CASTILLO', TRUE),
(232, 3, 'CONSEJO_DE_PROTECCION@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'consejo_de_proteccion', 'CONSEJO DE PROTECCI├ôN', TRUE),
(233, 3, 'CONSEJO_MUNICIPAL_DE_DERECHO@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'consejo_municipal_de_derecho', 'CONSEJO MUNICIPAL DE DERECHO', TRUE),
(234, 3, 'DEFENSORIA_DEL_NINO_NINA_Y_ADOLECENTE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'defensoria_del_nino_nina_y_adolecente', 'DEFENSORIA DEL NI├æO, NI├æA Y ADOLECENTE', TRUE),
(235, 3, 'ESCUELA_JOSE_GONZALO_MENDEZ@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_jose_gonzalo_mendez', 'LCDA. BELKIS VASQUEZ', TRUE),
(236, 3, 'ESCUELA_JUANA_MALDONADO_G@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_juana_maldonado_g', 'MSC KAROL BUSTAMANTE', TRUE),
(237, 3, 'ESCUELA_LUISA_CACERES_DE_ARISMENDI@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_luisa_caceres_de_arismendi', 'LCDA. ISABEL MEDINA', TRUE),
(238, 3, 'ESCUELA_REGINA_DE_VELAZQUEZ@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_regina_de_velazquez', 'LCDA. ELAYNE E. MENDEZ ', TRUE),
(239, 3, 'ESCUELA_SAN_JOSE@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_san_jose', 'PROF. MARIELA VEGA', TRUE),
(240, 3, 'ESCUELA_MARCO_TULIO_RAMIREZ_ROA@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_marco_tulio_ramirez_roa', 'LCDA. MSC. MARIBEL SANCHEZ', TRUE),
(241, 3, 'ESCUELA_SIMON_RODRIGUEZ@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_simon_rodriguez', 'MSc. MARIBELCY PEREZ', TRUE),
(242, 3, 'ESCUELA_ROMULO_GALLEGOS@tickets.gob', '$2y$12$kuWuI.ZL1CzTIrhOZwEtiOo9Z51ufqTu8QIP1xe2WNzoI40yDOmGe', 'escuela_romulo_gallegos', 'LCDA. LINDA PARADA', TRUE);

-- ============================================================
-- 4. INSERTAR REGISTROS EN BOSS (143)
-- ============================================================
INSERT IGNORE INTO Boss (ID_Boss, Name_Boss, Pronoun, Fk_User) VALUES
(1000, 'LCDA. NORIS FIGUEROA', NULL, 100),
(1001, 'LCDA. KARLA JUAREZ GARCIA', NULL, 101),
(1002, 'Coordinacion de Atencion de Sugerencias y Denuncias', NULL, 102),
(1003, 'Coordinacion de Difusion de la informacion', NULL, 103),
(1004, 'ABG. MARIO HERNAN IZARRA A.', NULL, 104),
(1005, 'LCDA. CARMEN DOS RAMOS', NULL, 105),
(1006, 'ING. JOSE GREGORIO HERNANDEZ ', NULL, 106),
(1007, 'ABG. ANNY GUIRIGAY', NULL, 107),
(1008, 'DIVISION DE INMUEBLES', NULL, 108),
(1009, 'DIVISION DE ASUNTOS ADMINISTRATIVOS', NULL, 109),
(1010, 'DIVISION DE ASUNTOS LITIGIOSOS', NULL, 110),
(1011, 'ABOG. NELSON VIVAS JAIMES', NULL, 111),
(1012, 'Coordinacion de Determinacion de Responsabilidades', NULL, 112),
(1013, 'Coordinaci├│n de Potestad Investigativa', NULL, 113),
(1014, 'LCDA. EDELIA RAQUEL GUERRERO ARAQUE', NULL, 114),
(1015, 'REGISTRO CIVIL MUNICIPAL', NULL, 115),
(1016, 'SECRETARIA DE GOBIERNO', NULL, 116),
(1017, 'MSC JUAN MARTINEZ', NULL, 117),
(1018, 'DRA. INDIRA USECHE', NULL, 118),
(1019, 'FABIOLA MORENO', NULL, 119),
(1020, 'LCDO. FERNANDO ARRUNDOLL', NULL, 120),
(1021, 'Coordinacion de Protocolo y Cooperacion', NULL, 121),
(1022, 'LCDA. ANA MONCADA', NULL, 122),
(1023, 'Coordinacion de Tributos', NULL, 123),
(1024, 'LCDA NERSA MONCADA', NULL, 124),
(1025, 'ING. FERNANDO RUIZ ', NULL, 125),
(1026, 'ING. JOVAN FLOREZ ', NULL, 126),
(1027, 'ING. JORFREN CONTRERAS', NULL, 127),
(1028, 'ING. ANGELA GARCIA', NULL, 128),
(1029, 'ABOG. ESP. JESUS AGUILAR M.', NULL, 129),
(1030, 'ABG. FARIDE RAMIREZ ', NULL, 130),
(1031, 'Coordinacion de Educacion y Justicia Municipal', NULL, 131),
(1032, 'LCDA. GLENYS DELGADO', NULL, 132),
(1033, 'DIVISION DE GESTION DE TALENTO HUMANO', NULL, 133),
(1034, 'Coordinacion de Captacion y Capacitacion del Personal', NULL, 134),
(1035, 'Coordinacion de Bienestar Social', NULL, 135),
(1036, 'ABG. THIANA JAIMES HERNANDEZ', NULL, 136),
(1037, 'LCDO. LEONARDO DUARTE', NULL, 137),
(1038, 'Coordinacion de Nomina', NULL, 138),
(1039, 'Coordinacion de Prestaciones Sociales', NULL, 139),
(1040, 'CONTRATACION COLECTIVA OBREROS', NULL, 140),
(1041, 'CONTRATACION COLECTIVA EMPLEADOS', NULL, 141),
(1042, 'LCDA. DAYANA SANCHEZ', NULL, 142),
(1043, 'DIVISI├ôN DE PLANIFICACI├ôN', NULL, 143),
(1044, 'LCDA. DAYANA SANCHEZ', NULL, 144),
(1045, 'LCDA. GLENYS DELGADO', NULL, 145),
(1046, 'LCDO PEDRO ZAMBRANO', NULL, 146),
(1047, 'Coordinacion de Deposito', NULL, 147),
(1048, 'LCDA. NUBIA CASTRO ', NULL, 148),
(1049, 'LCDO.  YORMAN E SOSA FERREIRA', NULL, 149),
(1050, 'JUAN ALBERTO MARTINEZ', NULL, 150),
(1051, 'DIVISION DE MANTENIMIENTO VEHICULAR', NULL, 151),
(1052, 'ABOG. ANTONIO MARTINEZ', NULL, 152),
(1053, 'MSc. YENYT VALERO', NULL, 153),
(1054, 'ABG. DANIELA MALDONADO', NULL, 154),
(1055, 'LCDA. MAYRA CARDENAS', NULL, 155),
(1056, 'T.S.U.  FRANK LEONARDO ALVIAREZ', NULL, 156),
(1057, 'OFICINA DE PUBLICIDAD Y PROPAGANDA', NULL, 157),
(1058, 'OFICINA DE CONTROL DE LICORES Y ESPECT├üCULOS PUBLICOS', NULL, 158),
(1059, 'DIVISION DE COBRANZAS', NULL, 159),
(1060, 'TSU. NINETT MALDONADO', NULL, 160),
(1061, 'MARTA ORTIZ ', NULL, 161),
(1062, 'CONTRALOR├ìA DEL MUNICIPIO SAN CRISTOBAL', NULL, 162),
(1063, 'INSTITUTO AUT├ôNOMO DE POLIC├ìA DEL MUNICIPIO SAN CRIST├ôBAL', NULL, 163),
(1064, 'DRA. GLEDY DELGADO', NULL, 164),
(1065, 'Coordinacion de Sala Situacional', NULL, 165),
(1066, 'CMDT. ANTONIO BRICE├æO ', NULL, 166),
(1067, 'CNEL. RAFAEL CHACON', NULL, 167),
(1068, 'Coordinacion de Gestion de Riesgos', NULL, 168),
(1069, 'Coordinacion de Operaciones', NULL, 169),
(1070, 'Coordinacion de Educacion', NULL, 170),
(1071, 'DIRECCION DE PROMOCCION Y FOMENTO DE LA PRODUCCION AGROALIMENTARIA', NULL, 171),
(1072, 'PROF. JUANA B. SUAREZ U.', NULL, 172),
(1073, 'Coordinacion de Actividad Fisica, Recreacion y Masificacion Municipal', NULL, 173),
(1074, 'ING. CARLOS ACOSTA', NULL, 174),
(1075, 'ING. ALBERT CONTRERAS', NULL, 175),
(1076, 'Coordinacion de Operaciones de Transito', NULL, 176),
(1077, 'Coordinacion de Ordenamiento de Transporte', NULL, 177),
(1078, 'ING. DANIEL NAVARRO DUQUE', NULL, 178),
(1079, 'ING. VALDEMAR VASQUEZ', NULL, 179),
(1080, 'Coordinacion de Semaforos', NULL, 180),
(1081, 'Coordinacion de Demarcacion y Se├▒alamiento Vial', NULL, 181),
(1082, 'ING. DANIEL  NAVARRO DUQUE', NULL, 182),
(1083, 'Coordinacion de Redes Hidraulicas, Rejillas y Alcantarillado', NULL, 183),
(1084, 'Coordinaci├│n de Movimientos de Tierra y Canalizaciones', NULL, 184),
(1085, 'Coordinaci├│n de Mantenimiento Vial y Rotura', NULL, 185),
(1086, 'LCDA. ELAYNE EDITH MENDEZ', NULL, 186),
(1087, 'DIVISION DE DOCENCIA', NULL, 187),
(1088, 'DIVISION DE BIENESTAR EDUCATIVO', NULL, 188),
(1089, 'CONTRATACION COLECTIVA MAESTROS', NULL, 189),
(1090, 'LCDO. ALEXANDER GARCIA', NULL, 190),
(1091, 'Coordinaci├│n de Artes Pl├ísticas, Esc├®nicas, Musicales y Literatura.', NULL, 191),
(1092, 'PROF. ROSENDO ANTONIO ESPINOZA', NULL, 192),
(1093, 'LCDA.  LUISANA ARELLANO', NULL, 193),
(1094, 'Coordinacion de Informaci├│n', NULL, 194),
(1095, 'Coordinacion de Redes Sociales y Medios Digitales', NULL, 195),
(1096, 'LCDA. DALIA TERAN', NULL, 196),
(1097, 'Coordinacion de Fiscales de Control Urbano', NULL, 197),
(1098, 'ING. CARMEN OSORIO', NULL, 198),
(1099, 'LCDA.  DALIA TERAN', NULL, 199),
(1100, 'DIVISION DE CATASTRO', NULL, 200),
(1101, 'Oficina tecnica de catastro', NULL, 201),
(1102, 'Oficina legal de catastro', NULL, 202),
(1103, 'LCDA. (MSc) AINARU SANCHEZ MU├æOZ', NULL, 203),
(1104, 'LCDO. GERSON H. MONSALVE U.', NULL, 204),
(1105, 'PROYECTOS MUNICIPALES', NULL, 205),
(1106, 'DIRECCION DE CONSTRUCCION DE OBRAS MUNICIPALES', NULL, 206),
(1107, 'DIVISI├ôN DE CONSTRUCCION Y REHABILITACION DE ESPACIOS PUBICOS', NULL, 207),
(1108, 'Coordinacion de Desmalezamineto de Calles, Avenidas y Espacios Publicos', NULL, 208),
(1109, 'Coordinacion de Embellecimiento de Fachadas y Elaboracion de Murales', NULL, 209),
(1110, 'Coordinacion de Obras', NULL, 210),
(1111, 'LCDA. DALIA ROSA TERAN GONZALEZ', NULL, 211),
(1112, 'DIVISI├ôN DE SERVICIOS MUNICIPALES', NULL, 212),
(1113, 'ING. LUIS ANTONIO UZCATEGUI ', NULL, 213),
(1114, 'Coordinacion del Mercado Municipal La Guayana', NULL, 214),
(1115, 'Coordinacion del Mercado Municipal La Villa', NULL, 215),
(1116, 'Coordinacion del Mercado Municipal de Santa Teresa', NULL, 216),
(1117, 'LCDO. DARIO MARTINEZ', NULL, 217),
(1118, 'TEC. HECTOR ALONSO BECERRA', NULL, 218),
(1119, 'DIRECCION DE AMBIENTE Y DESARROLLO SOSTENIBLE', NULL, 219),
(1120, 'Coordinacion de Ambiente', NULL, 220),
(1121, 'Coordinacion de Desarrollo Sostenible', NULL, 221),
(1122, 'ING. CARMEN CORREDOR', NULL, 222),
(1123, 'ING. KARELIS MORA', NULL, 223),
(1124, 'Coordinaci├│n de Evaluaci├│n y Atenci├│n Social de Vivienda', NULL, 224),
(1125, 'DIVISION DE DESARROLLO Y CONSERVACION DE VIVIENDA', NULL, 225),
(1126, 'SERVICIO AUTONOMO TERMINAL DE PASAJERO ING TEOFILO CARDENAS', NULL, 226),
(1127, 'ING. CARLOS ACOSTA', NULL, 227),
(1128, 'Coordinacion de los centros de salud comunitarios', NULL, 228),
(1129, 'DIVISION DE ATENCION PRIMARIA EN SALUD', NULL, 229),
(1130, 'ING. JANICE GONZALEZ', NULL, 230),
(1131, 'ABG. VIVIANA CASTILLO', NULL, 231),
(1132, 'CONSEJO DE PROTECCI├ôN', NULL, 232),
(1133, 'CONSEJO MUNICIPAL DE DERECHO', NULL, 233),
(1134, 'DEFENSORIA DEL NI├æO, NI├æA Y ADOLECENTE', NULL, 234),
(1135, 'LCDA. BELKIS VASQUEZ', NULL, 235),
(1136, 'MSC KAROL BUSTAMANTE', NULL, 236),
(1137, 'LCDA. ISABEL MEDINA', NULL, 237),
(1138, 'LCDA. ELAYNE E. MENDEZ ', NULL, 238),
(1139, 'PROF. MARIELA VEGA', NULL, 239),
(1140, 'LCDA. MSC. MARIBEL SANCHEZ', NULL, 240),
(1141, 'MSc. MARIBELCY PEREZ', NULL, 241),
(1142, 'LCDA. LINDA PARADA', NULL, 242);

-- ============================================================
-- 5. VINCULAR JEFES A OFICINAS
-- ============================================================
UPDATE Office SET Fk_Boss_ID = 1000 WHERE ID_Office = 99;
UPDATE Office SET Fk_Boss_ID = 1111 WHERE ID_Office = 107;
UPDATE Office SET Fk_Boss_ID = 1051 WHERE ID_Office = 123;
UPDATE Office SET Fk_Boss_ID = 1113 WHERE ID_Office = 150;
UPDATE Office SET Fk_Boss_ID = 1117 WHERE ID_Office = 187;
UPDATE Office SET Fk_Boss_ID = 1070 WHERE ID_Office = 194;
UPDATE Office SET Fk_Boss_ID = 1064 WHERE ID_Office = 196;
UPDATE Office SET Fk_Boss_ID = 1075 WHERE ID_Office = 197;
UPDATE Office SET Fk_Boss_ID = 1120 WHERE ID_Office = 201;
UPDATE Office SET Fk_Boss_ID = 1129 WHERE ID_Office = 202;
UPDATE Office SET Fk_Boss_ID = 1086 WHERE ID_Office = 1662;
UPDATE Office SET Fk_Boss_ID = 1015 WHERE ID_Office = 1663;
UPDATE Office SET Fk_Boss_ID = 1032 WHERE ID_Office = 1665;
UPDATE Office SET Fk_Boss_ID = 1100 WHERE ID_Office = 1671;
UPDATE Office SET Fk_Boss_ID = 1046 WHERE ID_Office = 1672;
UPDATE Office SET Fk_Boss_ID = 1005 WHERE ID_Office = 1673;
UPDATE Office SET Fk_Boss_ID = 1121 WHERE ID_Office = 1677;
UPDATE Office SET Fk_Boss_ID = 1078 WHERE ID_Office = 1681;
UPDATE Office SET Fk_Boss_ID = 1029 WHERE ID_Office = 1687;
UPDATE Office SET Fk_Boss_ID = 1066 WHERE ID_Office = 1688;
UPDATE Office SET Fk_Boss_ID = 1025 WHERE ID_Office = 1699;
UPDATE Office SET Fk_Boss_ID = 1105 WHERE ID_Office = 1700;
UPDATE Office SET Fk_Boss_ID = 1033 WHERE ID_Office = 1703;
UPDATE Office SET Fk_Boss_ID = 1036 WHERE ID_Office = 1705;
UPDATE Office SET Fk_Boss_ID = 1133 WHERE ID_Office = 1706;
UPDATE Office SET Fk_Boss_ID = 1090 WHERE ID_Office = 1707;
UPDATE Office SET Fk_Boss_ID = 1009 WHERE ID_Office = 1708;
UPDATE Office SET Fk_Boss_ID = 1088 WHERE ID_Office = 1709;
UPDATE Office SET Fk_Boss_ID = 1087 WHERE ID_Office = 1710;
UPDATE Office SET Fk_Boss_ID = 1007 WHERE ID_Office = 1711;
UPDATE Office SET Fk_Boss_ID = 1119 WHERE ID_Office = 1712;
UPDATE Office SET Fk_Boss_ID = 1030 WHERE ID_Office = 1713;
UPDATE Office SET Fk_Boss_ID = 1106 WHERE ID_Office = 1722;
UPDATE Office SET Fk_Boss_ID = 1008 WHERE ID_Office = 1724;
UPDATE Office SET Fk_Boss_ID = 1016 WHERE ID_Office = 1725;
UPDATE Office SET Fk_Boss_ID = 1082 WHERE ID_Office = 1735;
UPDATE Office SET Fk_Boss_ID = 1103 WHERE ID_Office = 1736;
UPDATE Office SET Fk_Boss_ID = 1074 WHERE ID_Office = 1739;
UPDATE Office SET Fk_Boss_ID = 1040 WHERE ID_Office = 1742;
UPDATE Office SET Fk_Boss_ID = 1010 WHERE ID_Office = 1743;
UPDATE Office SET Fk_Boss_ID = 1041 WHERE ID_Office = 1750;
UPDATE Office SET Fk_Boss_ID = 1022 WHERE ID_Office = 1756;
UPDATE Office SET Fk_Boss_ID = 1127 WHERE ID_Office = 1762;
UPDATE Office SET Fk_Boss_ID = 1102 WHERE ID_Office = 1763;
UPDATE Office SET Fk_Boss_ID = 1055 WHERE ID_Office = 1764;
UPDATE Office SET Fk_Boss_ID = 1052 WHERE ID_Office = 1765;
UPDATE Office SET Fk_Boss_ID = 1056 WHERE ID_Office = 1766;
UPDATE Office SET Fk_Boss_ID = 1060 WHERE ID_Office = 1767;
UPDATE Office SET Fk_Boss_ID = 1053 WHERE ID_Office = 1768;
UPDATE Office SET Fk_Boss_ID = 1057 WHERE ID_Office = 1769;
UPDATE Office SET Fk_Boss_ID = 1125 WHERE ID_Office = 1770;
UPDATE Office SET Fk_Boss_ID = 1097 WHERE ID_Office = 1771;
UPDATE Office SET Fk_Boss_ID = 1123 WHERE ID_Office = 1772;
UPDATE Office SET Fk_Boss_ID = 1002 WHERE ID_Office = 1775;
UPDATE Office SET Fk_Boss_ID = 1014 WHERE ID_Office = 1782;
UPDATE Office SET Fk_Boss_ID = 1021 WHERE ID_Office = 1787;
UPDATE Office SET Fk_Boss_ID = 1023 WHERE ID_Office = 1788;
UPDATE Office SET Fk_Boss_ID = 1027 WHERE ID_Office = 1791;
UPDATE Office SET Fk_Boss_ID = 1028 WHERE ID_Office = 1792;
UPDATE Office SET Fk_Boss_ID = 1031 WHERE ID_Office = 1793;
UPDATE Office SET Fk_Boss_ID = 1034 WHERE ID_Office = 1794;
UPDATE Office SET Fk_Boss_ID = 1038 WHERE ID_Office = 1797;
UPDATE Office SET Fk_Boss_ID = 1039 WHERE ID_Office = 1798;
UPDATE Office SET Fk_Boss_ID = 1042 WHERE ID_Office = 1799;
UPDATE Office SET Fk_Boss_ID = 1044 WHERE ID_Office = 1801;
UPDATE Office SET Fk_Boss_ID = 1065 WHERE ID_Office = 1812;
UPDATE Office SET Fk_Boss_ID = 1071 WHERE ID_Office = 1816;
UPDATE Office SET Fk_Boss_ID = 1080 WHERE ID_Office = 1822;
UPDATE Office SET Fk_Boss_ID = 1081 WHERE ID_Office = 1823;
UPDATE Office SET Fk_Boss_ID = 1083 WHERE ID_Office = 1824;
UPDATE Office SET Fk_Boss_ID = 1094 WHERE ID_Office = 1831;
UPDATE Office SET Fk_Boss_ID = 1095 WHERE ID_Office = 1832;
UPDATE Office SET Fk_Boss_ID = 1098 WHERE ID_Office = 1834;
UPDATE Office SET Fk_Boss_ID = 1099 WHERE ID_Office = 1835;
UPDATE Office SET Fk_Boss_ID = 1109 WHERE ID_Office = 1839;
UPDATE Office SET Fk_Boss_ID = 1110 WHERE ID_Office = 1840;
UPDATE Office SET Fk_Boss_ID = 1116 WHERE ID_Office = 1844;
UPDATE Office SET Fk_Boss_ID = 1128 WHERE ID_Office = 1848;
UPDATE Office SET Fk_Boss_ID = 1134 WHERE ID_Office = 1852;
UPDATE Office SET Fk_Boss_ID = 1135 WHERE ID_Office = 1853;
UPDATE Office SET Fk_Boss_ID = 1136 WHERE ID_Office = 1854;
UPDATE Office SET Fk_Boss_ID = 1137 WHERE ID_Office = 1855;
UPDATE Office SET Fk_Boss_ID = 1138 WHERE ID_Office = 1856;
UPDATE Office SET Fk_Boss_ID = 1139 WHERE ID_Office = 1857;
UPDATE Office SET Fk_Boss_ID = 1140 WHERE ID_Office = 1858;
UPDATE Office SET Fk_Boss_ID = 1141 WHERE ID_Office = 1859;
UPDATE Office SET Fk_Boss_ID = 1142 WHERE ID_Office = 1860;

-- Total oficinas con jefe vinculado: 87

-- ============================================================
-- 6. OFICINAS SIN JEFE ASIGNADO (56)
-- ============================================================
-- 103 = COORDINACION DE CEMENTERIO MUNICIPAL
-- 106 = DIRECCION DE PROMOCION Y FOMENTO DE LA PRODUCCION AGROALIMENTARIA
-- 142 = ESCUELA MUNICIPAL MARCO TULIO RAMIREZ ROA
-- 145 = ESCUELA MUNICIPAL SAN JOSE
-- 149 = Coordinacion de Mercado Municipal de Santa Teresa
-- 152 = OFICINA DE PUBLICIDAD Y PROPAGANDA
-- 153 = DIRECCION DE COOPERACION PROTOCOLARES Y RELACIONES INTERINSTITUCIONALES
-- 164 = DEFENSORIA DEL NI├æO Y DEL ADOLECENTE
-- 166 = DIRECCION DE DEPORTE Y RECREACION
-- 191 = OFICINA DE CONTROL DE LICORES  Y ESPECTACULOS PUBLICOS
-- 192 = COORDINACION DE GESTION DE RIESGO
-- 199 = COORDINACION LEGAL DE CATASTRO
-- 1661 = DIRECCION DE DESARROLLO URBANO LOCAL
-- 1675 = DIVISION  DE  SERVICIOS MUNICIPALES
-- 1676 = DIVISION DE INGENERIA MUNICIPAL
-- 1678 = ATENCION AL CIUDADANO
-- 1680 = DIVISION DE SANEAMIENTO AMBIENTAL
-- 1682 = ADMINISTRACION BOMBERIL
-- 1683 = ARCHIVO HIST├ôRICO DE SAN CRIST├ôBAL ?DR. JOS├ë JOAQU├ìN VILLAMIZAR MOLINA?
-- 1684 = AUDITORIA INTERNA
-- 1685 = BANDA MUSICAL
-- 1686 = CONSEJO LOCAL DE PLANIFICACION PUBLICA
-- 1689 = EDUCACION BASICA
-- 1690 = ESCUELA MUNICIPAL JOSE GONZALO MENDEZ
-- 1691 = ESCUELA MUNICIPAL LUISA CACERES DE ARISMENDI
-- 1692 = ESCUELA MUNICIPAL REGINA DE VELASQUEZ
-- 1693 = ESCUELA MUNICIPAL ROMULO GALLEGOS
-- 1694 = ESCUELA MUNICIPAL SIMON RODRIGUEZ
-- 1695 = Coordinacion de Mercado Municipal La Ermita
-- 1696 = Coordinacion de Mercado Municipal La Guayana
-- 1697 = OFICINA DE LICORES Y ESPECTACULOS PUBLICOS
-- 1698 = DIRECCI├ôN DEL SISTEMA DE PROTECCI├ôN INTEGRAL DEL NI├æO NI├æA Y ADOLESCENTE
-- 1702 = CONTRATACION COLECTIVA EMPLEADOS
-- 1704 = CONSEJO DE PROTECCION
-- 1714 = DIVISION DE NOMINAS Y PRESTACIONES SOCIALES
-- 1715 = DIVISION DE PLANIFICACION URBANA
-- 1716 = DIVISION DE PRESUPUESTO
-- 1717 = DIVISION DE PROTECCION AMBIENTAL
-- 1718 = GASTOS DE PREVISION Y SEGURIDAD SOCIAL DEL PERSONAL
-- 1719 = OFICINA DE LICORES Y ESPECT├üCULOS PUBLICOS
-- 1721 = DIVISION DE ACTIVIDADES ECONOMICAS
-- 1723 = DIVISI├ôN DE CONSTRUCCION Y REHABILITACION DE ESPACIOS PUBLICOS
-- 1733 = COORDINACION T├ëCNICA DE CATASTRO
-- 1737 = DIRECCION DE MEDIOS, COMUNICACIONES Y MARKETING DIGITAL
-- 1738 = DIRECCION DE PLANIFICACION Y PRESUPUESTO
-- 1740 = DIRECCION EJECUTIVA DEL DESPACHO
-- 1741 = DIRECCION GENERAL
-- 1744 = DIVISION DE BIENES MUNICIPALES
-- 1745 = DIVISION DE CONTABIIDAD
-- 1746 = COORDINACION MERCADO MUNICIPAL LA VILLA
-- 1747 = PROTECCION CIVIL MUNICIPAL
-- 1749 = DIVISION DE ACTIVIDADES ECONOMICAS
-- 1751 = DIVISION DE RENTAS MUNICIPALES
-- 1752 = OFICINA DE PUBLICIDAD Y PROPAGANDA
-- 1755 = SUPERINTENDENCIA MUNICIPAL DE ADMINISTRACION TRIBUTARIA
-- 1773 = DESPACHO DEL ALCALDE (SA)

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
