-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : sam. 04 nov. 2023 à 19:05
-- Version du serveur : 10.5.21-MariaDB-0+deb11u1
-- Version de PHP : 8.1.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `Astiell_DragonBot`
--

-- --------------------------------------------------------

--
-- Structure de la table `Capture`
--

CREATE TABLE `Capture` (
  `Id_Pokemon` int(11) DEFAULT NULL,
  `Id_Discord` varchar(50) NOT NULL,
  `date_capture` date NOT NULL,
  `estShiny` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Déclencheurs `Capture`
--
DELIMITER $$
CREATE TRIGGER `trigger_Capture` AFTER INSERT ON `Capture` FOR EACH ROW BEGIN
    INSERT INTO PC (Id_Pokemon, Id_DresseurAct, Id_DresseurOri, dateCaptureEchange, estShiny) 
    VALUES (NEW.Id_Pokemon, NEW.Id_Discord, NEW.Id_Discord, NEW.date_capture, NEW.estShiny);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trigger_Capture_Monnaie` AFTER INSERT ON `Capture` FOR EACH ROW BEGIN
    UPDATE Utilisateur SET monnaie = monnaie + 100 WHERE Id_Discord = new.Id_Discord; 
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `Echange`
--

CREATE TABLE `Echange` (
  `Id_Echange` int(11) NOT NULL,
  `Id_Pokemon` int(11) NOT NULL,
  `Id_DA` varchar(50) NOT NULL,
  `Id_DO` varchar(50) NOT NULL,
  `dateEchange` date NOT NULL,
  `estShiny` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



--
-- Déclencheurs `Echange`
--
DELIMITER $$
CREATE TRIGGER `trigger_Echange` AFTER INSERT ON `Echange` FOR EACH ROW BEGIN
    INSERT INTO PC (Id_Pokemon, Id_DresseurAct, Id_DresseurOri, dateCaptureEchange, estShiny) 
    VALUES (NEW.Id_Pokemon, NEW.Id_DA, NEW.Id_DO, NEW.dateEchange, NEW.estShiny);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trigger_Echange_Delete` BEFORE DELETE ON `Echange` FOR EACH ROW BEGIN
DELETE FROM PC WHERE Id_DresseurAct = old.Id_DO AND dateCaptureEchange = old.dateEchange;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `Est_de_type`
--

CREATE TABLE `Est_de_type` (
  `Id_Pokemon` int(11) NOT NULL,
  `Id_Type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `Est_de_type`
--

INSERT INTO `Est_de_type` (`Id_Pokemon`, `Id_Type`) VALUES
(1, 4),
(1, 8),
(2, 4),
(2, 8),
(3, 4),
(3, 8),
(4, 2),
(5, 2),
(6, 2),
(6, 10),
(7, 3),
(8, 3),
(9, 3),
(10, 12),
(11, 12),
(12, 10),
(12, 12),
(13, 8),
(13, 12),
(14, 8),
(14, 12),
(15, 8),
(15, 12),
(16, 1),
(16, 10),
(17, 1),
(17, 10),
(18, 1),
(18, 10),
(19, 1),
(20, 1),
(21, 1),
(21, 10),
(22, 1),
(22, 10),
(23, 8),
(24, 8),
(25, 5),
(26, 5),
(27, 9),
(28, 9),
(29, 8),
(30, 8),
(31, 8),
(31, 9),
(32, 8),
(33, 8),
(34, 8),
(34, 9),
(35, 18),
(36, 18),
(37, 2),
(38, 2),
(39, 1),
(39, 18),
(40, 1),
(40, 18),
(41, 8),
(41, 10),
(42, 8),
(42, 10),
(43, 4),
(43, 8),
(44, 4),
(44, 8),
(45, 4),
(45, 8),
(46, 4),
(46, 12),
(47, 4),
(47, 12),
(48, 8),
(48, 12),
(49, 8),
(49, 12),
(50, 9),
(51, 9),
(52, 1),
(53, 1),
(54, 3),
(55, 3),
(56, 7),
(57, 7),
(58, 2),
(59, 2),
(60, 3),
(61, 3),
(62, 3),
(62, 7),
(63, 11),
(64, 11),
(65, 11),
(66, 7),
(67, 7),
(68, 7),
(69, 4),
(69, 8),
(70, 4),
(70, 8),
(71, 4),
(71, 8),
(72, 3),
(72, 8),
(73, 3),
(73, 8),
(74, 9),
(74, 13),
(75, 9),
(75, 13),
(76, 9),
(76, 13),
(77, 2),
(78, 2),
(79, 3),
(79, 11),
(80, 3),
(80, 11),
(81, 5),
(81, 17),
(82, 5),
(82, 17),
(83, 1),
(83, 10),
(84, 1),
(84, 10),
(85, 1),
(85, 10),
(86, 3),
(87, 3),
(87, 6),
(88, 8),
(89, 8),
(90, 3),
(91, 3),
(91, 6),
(92, 8),
(92, 14),
(93, 8),
(93, 14),
(94, 8),
(94, 14),
(95, 9),
(95, 13),
(96, 11),
(97, 11),
(98, 3),
(99, 3),
(100, 5),
(101, 5),
(102, 4),
(102, 11),
(103, 4),
(103, 11),
(104, 9),
(105, 9),
(106, 7),
(107, 7),
(108, 1),
(109, 8),
(110, 8),
(111, 9),
(111, 13),
(112, 9),
(112, 13),
(113, 1),
(114, 4),
(115, 1),
(116, 3),
(117, 3),
(118, 3),
(119, 3),
(120, 3),
(121, 3),
(121, 11),
(122, 11),
(122, 18),
(123, 10),
(123, 12),
(124, 6),
(124, 11),
(125, 5),
(126, 2),
(127, 12),
(128, 1),
(129, 3),
(130, 3),
(130, 10),
(131, 3),
(131, 6),
(132, 1),
(133, 1),
(134, 3),
(135, 5),
(136, 2),
(137, 1),
(138, 3),
(138, 13),
(139, 3),
(139, 13),
(140, 3),
(140, 13),
(141, 3),
(141, 13),
(142, 10),
(142, 13),
(143, 1),
(144, 6),
(144, 10),
(145, 5),
(145, 10),
(146, 2),
(146, 10),
(147, 15),
(148, 15),
(149, 10),
(149, 15),
(150, 11),
(151, 11);

-- --------------------------------------------------------

--
-- Structure de la table `PC`
--

CREATE TABLE `PC` (
  `PC_Id` int(11) NOT NULL,
  `Id_Pokemon` int(11) DEFAULT NULL,
  `Id_DresseurAct` varchar(50) DEFAULT NULL,
  `Id_DresseurOri` varchar(50) DEFAULT NULL,
  `dateCaptureEchange` date NOT NULL,
  `estShiny` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `Pokemon`
--

CREATE TABLE `Pokemon` (
  `Id_Pokemon` int(11) NOT NULL,
  `nom_Pokemon` varchar(50) NOT NULL,
  `estLegendaire` tinyint(1) DEFAULT NULL,
  `estFabuleux` tinyint(1) DEFAULT NULL,
  `tauxCapture` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `Pokemon`
--

INSERT INTO `Pokemon` (`Id_Pokemon`, `nom_Pokemon`, `estLegendaire`, `estFabuleux`, `tauxCapture`) VALUES
(1, 'Bulbizarre', 0, 0, 30),
(2, 'Herbizarre', 0, 0, 20),
(3, 'Florizarre', 0, 0, 5),
(4, 'Salameche', 0, 0, 30),
(5, 'Reptincel', 0, 0, 20),
(6, 'Dracaufeu', 0, 0, 5),
(7, 'Carapuce', 0, 0, 30),
(8, 'Carabaffe', 0, 0, 20),
(9, 'Tortank', 0, 0, 5),
(10, 'Chenipan', 0, 0, 40),
(11, 'Chrysacier', 0, 0, 40),
(12, 'Papilusion', 0, 0, 30),
(13, 'Aspicot', 0, 0, 40),
(14, 'Coconfort', 0, 0, 40),
(15, 'Dardargnan', 0, 0, 30),
(16, 'Roucool', 0, 0, 40),
(17, 'Roucoups', 0, 0, 30),
(18, 'Roucarnage', 0, 0, 20),
(19, 'Rattata', 0, 0, 40),
(20, 'Rattatac', 0, 0, 30),
(21, 'Piafabec', 0, 0, 40),
(22, 'Rapasdepic', 0, 0, 30),
(23, 'Abo', 0, 0, 30),
(24, 'Arbok', 0, 0, 20),
(25, 'Pikachu', 0, 0, 40),
(26, 'Raichu', 0, 0, 20),
(27, 'Sabelette', 0, 0, 30),
(28, 'Sablaireau', 0, 0, 20),
(29, 'Nidoran♀', 0, 0, 40),
(30, 'Nidorina', 0, 0, 30),
(31, 'Nidoqueen', 0, 0, 20),
(32, 'Nidoran♂', 0, 0, 40),
(33, 'Nidorino', 0, 0, 30),
(34, 'Nidoking', 0, 0, 20),
(35, 'Melofee', 0, 0, 20),
(36, 'Melodelfe', 0, 0, 5),
(37, 'Goupix', 0, 0, 20),
(38, 'Feunard', 0, 0, 5),
(39, 'Rondoudou', 0, 0, 30),
(40, 'Grodoudou', 0, 0, 20),
(41, 'Nosferapti', 0, 0, 40),
(42, 'Nosferalto', 0, 0, 30),
(43, 'Mystherbe', 0, 0, 40),
(44, 'Ortide', 0, 0, 30),
(45, 'Rafflesia', 0, 0, 5),
(46, 'Paras', 0, 0, 40),
(47, 'Parasect', 0, 0, 30),
(48, 'Mimitoss', 0, 0, 40),
(49, 'Aeromite', 0, 0, 30),
(50, 'Taupiqueur', 0, 0, 40),
(51, 'Triopikeur', 0, 0, 20),
(52, 'Miaouss', 0, 0, 30),
(53, 'Persian', 0, 0, 20),
(54, 'Psykokwak', 0, 0, 30),
(55, 'Akwakwak', 0, 0, 20),
(56, 'Férosinge', 0, 0, 30),
(57, 'Colossinge', 0, 0, 5),
(58, 'Caninos', 0, 0, 20),
(59, 'Arcanin', 0, 0, 5),
(60, 'Ptitard', 0, 0, 30),
(61, 'Têtarte', 0, 0, 20),
(62, 'Tartard', 0, 0, 5),
(63, 'Abra', 0, 0, 30),
(64, 'Kadabra', 0, 0, 20),
(65, 'Alakazam', 0, 0, 5),
(66, 'Machoc', 0, 0, 30),
(67, 'Machopeur', 0, 0, 20),
(68, 'Mackogneur', 0, 0, 5),
(69, 'Chétiflor', 0, 0, 40),
(70, 'Boustiflor', 0, 0, 30),
(71, 'Empiflor', 0, 0, 5),
(72, 'Tentacool', 0, 0, 40),
(73, 'Tentacruel', 0, 0, 20),
(74, 'Racaillou', 0, 0, 40),
(75, 'Gravalanch', 0, 0, 30),
(76, 'Grolem', 0, 0, 5),
(77, 'Ponyta', 0, 0, 20),
(78, 'Galopa', 0, 0, 5),
(79, 'Ramoloss', 0, 0, 20),
(80, 'Flagadoss', 0, 0, 5),
(81, 'Magnéti', 0, 0, 30),
(82, 'Magnéton', 0, 0, 20),
(83, 'Canarticho', 0, 0, 20),
(84, 'Doduo', 0, 0, 20),
(85, 'Dodrio', 0, 0, 5),
(86, 'Otaria', 0, 0, 20),
(87, 'Lamantine', 0, 0, 5),
(88, 'Tadmorv', 0, 0, 30),
(89, 'Grotadmorv', 0, 0, 20),
(90, 'Kokiyas', 0, 0, 30),
(91, 'Crustabri', 0, 0, 20),
(92, 'Fantominus', 0, 0, 40),
(93, 'Spectrum', 0, 0, 20),
(94, 'Ectoplasma', 0, 0, 5),
(95, 'Onix', 0, 0, 5),
(96, 'Soporifik', 0, 0, 40),
(97, 'Hypnomade', 0, 0, 20),
(98, 'Krabby', 0, 0, 30),
(99, 'Krabboss', 0, 0, 20),
(100, 'Voltorbe', 0, 0, 30),
(101, 'Électrode', 0, 0, 20),
(102, 'Noeunoeuf', 0, 0, 30),
(103, 'Noadkoko', 0, 0, 20),
(104, 'Osselait', 0, 0, 20),
(105, 'Ossatueur', 0, 0, 5),
(106, 'Kicklee', 0, 0, 5),
(107, 'Tygnon', 0, 0, 5),
(108, 'Excelangue', 0, 0, 5),
(109, 'Smogo', 0, 0, 30),
(110, 'Smogogo', 0, 0, 20),
(111, 'Rhinocorne', 0, 0, 30),
(112, 'Rhinoféros', 0, 0, 20),
(113, 'Leveinard', 0, 0, 20),
(114, 'Saquedeneu', 0, 0, 20),
(115, 'Kangourex', 0, 0, 3),
(116, 'Hypotrempe', 0, 0, 20),
(117, 'Hypocéan', 0, 0, 5),
(118, 'Poissirène', 0, 0, 30),
(119, 'Poissoroy', 0, 0, 20),
(120, 'Stari', 0, 0, 30),
(121, 'Staross', 0, 0, 20),
(122, 'M. Mime', 0, 0, 20),
(123, 'Insécateur', 0, 0, 20),
(124, 'Lippoutou', 0, 0, 20),
(125, 'Élektek', 0, 0, 20),
(126, 'Magmar', 0, 0, 20),
(127, 'Scarabrute', 0, 0, 20),
(128, 'Tauros', 0, 0, 30),
(129, 'Magicarpe', 0, 0, 40),
(130, 'Léviator', 0, 0, 5),
(131, 'Lokhlass', 0, 0, 3),
(132, 'Métamorph', 0, 0, 5),
(133, 'Évoli', 0, 0, 30),
(134, 'Aquali', 0, 0, 5),
(135, 'Voltali', 0, 0, 5),
(136, 'Pyroli', 0, 0, 5),
(137, 'Porygon', 0, 0, 20),
(138, 'Amonita', 0, 0, 20),
(139, 'Amonistar', 0, 0, 5),
(140, 'Kabuto', 0, 0, 20),
(141, 'Kabutops', 0, 0, 5),
(142, 'Ptéra', 0, 0, 5),
(143, 'Ronflex', 0, 0, 5),
(144, 'Artikodin', 1, 0, 3),
(145, 'Électhor', 1, 0, 3),
(146, 'Sulfura', 1, 0, 3),
(147, 'Minidraco', 0, 0, 20),
(148, 'Draco', 0, 0, 5),
(149, 'Dracolosse', 0, 0, 3),
(150, 'Mewtwo', 1, 0, 2),
(151, 'Mew', 0, 1, 2);

-- --------------------------------------------------------

--
-- Structure de la table `Type_Pokemon`
--

CREATE TABLE `Type_Pokemon` (
  `Id_Type` int(11) NOT NULL,
  `nom_Type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `Type_Pokemon`
--

INSERT INTO `Type_Pokemon` (`Id_Type`, `nom_Type`) VALUES
(1, 'Normal'),
(2, 'Feu'),
(3, 'Eau'),
(4, 'Plante'),
(5, 'Electrik'),
(6, 'Glace'),
(7, 'Combat'),
(8, 'Poison'),
(9, 'Sol'),
(10, 'Vol'),
(11, 'Psy'),
(12, 'Insecte'),
(13, 'Roche'),
(14, 'Spectre'),
(15, 'Dragon'),
(16, 'Ténèbres'),
(17, 'Acier'),
(18, 'Fée');

-- --------------------------------------------------------

--
-- Structure de la table `Utilisateur`
--

CREATE TABLE `Utilisateur` (
  `Id_Discord` varchar(50) NOT NULL,
  `nom_utilisateur` varchar(50) NOT NULL,
  `monnaie` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE OR REPLACE `Evolution` (
  `id_Pokemon_Evoluant` int(11) NOT NULL,
  `id_Pokemon_Evolue` int(11) NOT NULL,
  `stade_Evolution` int(3) NOT NULL,
  `type_Evolution` varchar(1) NOT NULL check (Type_Evolution in ('N', 'O', 'B', 'A', 'E')),
  PRIMARY KEY (`id_Pokemon_Evoluant`, `id_Pokemon_Evolue`),
  CONSTRAINT `fk_Evolue_id_Pokemon_Evoluant` FOREIGN KEY (`id_Pokemon_Evoluant`) REFERENCES `Pokemon` (`Id_Pokemon`),
  CONSTRAINT `fk_Evolue_id_Pokemon_Evolue` FOREIGN KEY (`id_Pokemon_Evolue`) REFERENCES `Pokemon` (`Id_Pokemon`)
);


INSERT INTO `Evolution` VALUES
(   1,   2,  1, 'N'),
(   2,   3,  2, 'N'),
(   4,   5,  1, 'N'),
(   5,   6,  2, 'N'),
(   7,   8,  1, 'N'),
(   8,   9,  2, 'N'),
(  10,  11,  0, 'N'),
(  11,  12,  1, 'N'),
(  13,  14,  0, 'N'),
(  14,  15,  1, 'N'),
(  16,  17,  1, 'N'),
(  17,  18,  2, 'N'),
(  19,  20,  2, 'N'),
(  21,  22,  2, 'N'),
(  23,  24,  2, 'N'),
(  25,  26,  2, 'O'),
(  27,  28,  2, 'N'),
(  29,  30,  1, 'N'),
(  30,  31,  2, 'O'),
(  32,  33,  1, 'N'),
(  33,  34,  2, 'O'),
(  35,  36,  2, 'O'),
(  37,  38,  2, 'O'),
(  39,  40,  2, 'O'),
(  41,  42,  2, 'N'),
(  43,  44,  1, 'N'),
(  44,  45,  2, 'O'),
(  46,  47,  2, 'N'),
(  48,  49,  2, 'N'),
(  50,  51,  2, 'N'),
(  52,  53,  2, 'N'),
(  54,  55,  2, 'N'),
(  56,  57,  2, 'N'),
(  58,  59,  2, 'O'),
(  60,  61,  1, 'N'),
(  61,  62,  2, 'O'),
(  63,  64,  1, 'N'),
(  64,  65,  2, 'E'),
(  66,  67,  1, 'N'),
(  67,  68,  2, 'E'),
(  69,  70,  1, 'N'),
(  70,  71,  2, 'O'),
(  72,  73,  2, 'N'),
(  74,  75,  1, 'N'),
(  75,  76,  2, 'E'),
(  77,  78,  2, 'N'),
(  79,  80,  2, 'N'),
(  81,  82,  2, 'N'),
(  84,  85,  2, 'N'),
(  86,  87,  2, 'N'),
(  88,  89,  2, 'N'),
(  90,  91,  2, 'O'),
(  92,  93,  1, 'N'),
(  93,  94,  2, 'E'),
(  96,  97,  2, 'N'),
(  98,  99,  2, 'N'),
( 100, 101,  2, 'N'),
( 102, 103,  2, 'O'),
( 104, 105,  2, 'N'),
( 109, 110,  2, 'N'),
( 111, 112,  2, 'N'),
( 116, 117,  1, 'N'),
( 118, 119,  1, 'N'),
( 120, 121,  2, 'O'),
( 129, 130,  2, 'N'),
( 133, 134,  2, 'O'),
( 133, 135,  2, 'O'),
( 133, 136,  2, 'O'),
( 138, 139,  2, 'N'),
( 140, 141,  2, 'N'),
( 147, 148,  2, 'N'),
( 148, 149,  3, 'N');


CREATE TABLE `Evolue` (
  `evolue_ID` int(11) NOT NULL AUTO_INCREMENT,
  `pokemon_Evoluant` int(11) NOT NULL,
  `pokemon_Evolue` int(11) NOT NULL,
  `id_Utilisateur` varchar(50) NOT NULL,
  `dateEvolution` date NOT NULL,
  PRIMARY KEY (`evolue_ID`),
  CONSTRAINT `fk_Evolution_evolue` FOREIGN KEY (`pokemon_Evoluant`, `pokemon_Evolue`) REFERENCES `Evolution` (`id_Pokemon_Evoluant`, `id_Pokemon_Evolue`),
  CONSTRAINT `fk_Evolution_evolue_UserID` FOREIGN KEY (`id_Utilisateur`) REFERENCES `Utilisateur` (`Id_Discord`)
);


/* stade_Evolution = 0, 1, 2, 3*/
/* 0 pour les pokémons insecte facile à faire évoluer */
/* 1 pour les pokémon junior dans une famille de 3 (Exemple : Bulbizarre) */
/* 2 pour les autres pokemons (Exemple : Herbizarre, Taupiqueur) */
/* 3 pour les familles de dragon et pokemon compliqué */
/* Type d'évolution possible Niveau (N), Objet (O), Bonheur (B), Attaque (A), Echange (E) */

CREATE OR REPLACE TABLE Objet
(
  Id_Objet INT AUTO_INCREMENT,
  nomObjet VARCHAR(50)  NOT NULL,
  prix INT,
  PRIMARY KEY(Id_Objet)
);

INSERT INTO `Objet` (nomObjet, prix) VALUES
("Pierre Eau", 1500), -- 1
("Pierre Feu", 1500), -- 2
("Pierre Foudre", 1500), -- 3
("Pierre Lune", 1500), -- 4
("Pierre Plante", 1500), -- 5
("Cable Link", 1200); -- 6 

CREATE or replace TABLE Possede(
   Id_Discord VARCHAR(50) ,
   Id_Objet INT,
   quantite INT,
   PRIMARY KEY(Id_Discord, Id_Objet),
   FOREIGN KEY(Id_Discord) REFERENCES Utilisateur(Id_Discord),
   FOREIGN KEY(Id_Objet) REFERENCES Objet(Id_Objet)
);


CREATE OR REPLACE TABLE EvolueAvec
(
   Id_Pokemon INT,
   Id_Objet INT,
   PRIMARY KEY(Id_Pokemon, Id_Objet),
   FOREIGN KEY(Id_Pokemon) REFERENCES Pokemon(Id_Pokemon),
   FOREIGN KEY(Id_Objet) REFERENCES Objet(Id_Objet)
);

INSERT INTO `EvolueAvec` VALUES
(  25, 3),
(  30, 4),
(  33, 4),
(  35, 4),
(  37, 2),
(  39, 4),
(  44, 5),
(  58, 2),
(  61, 1),
(  70, 5),
(  90, 1),
( 102, 5),
( 120, 1),
( 133, 1),
( 133, 2),
( 133, 3);




--
-- Index pour les tables déchargées
--

--
-- Index pour la table `Capture`
--
ALTER TABLE `Capture`
  ADD PRIMARY KEY (`Id_Discord`,`date_capture`),
  ADD KEY `Id_Pokemon` (`Id_Pokemon`);

--
-- Index pour la table `Echange`
--
ALTER TABLE `Echange`
  ADD PRIMARY KEY (`Id_Echange`),
  ADD KEY `Id_DA` (`Id_DA`),
  ADD KEY `Id_DO` (`Id_DO`),
  ADD KEY `Echange_ibfk_1` (`Id_Pokemon`);

--
-- Index pour la table `Est_de_type`
--
ALTER TABLE `Est_de_type`
  ADD PRIMARY KEY (`Id_Pokemon`,`Id_Type`),
  ADD KEY `Id_Type` (`Id_Type`);

--
-- Index pour la table `PC`
--
ALTER TABLE `PC`
  ADD PRIMARY KEY (`PC_Id`),
  ADD KEY `Id_Pokemon` (`Id_Pokemon`),
  ADD KEY `Id_Discord` (`Id_DresseurAct`),
  ADD KEY `Id_Discord_1` (`Id_DresseurOri`);

--
-- Index pour la table `Pokemon`
--
ALTER TABLE `Pokemon`
  ADD PRIMARY KEY (`Id_Pokemon`);

--
-- Index pour la table `Type_Pokemon`
--
ALTER TABLE `Type_Pokemon`
  ADD PRIMARY KEY (`Id_Type`);

--
-- Index pour la table `Utilisateur`
--
ALTER TABLE `Utilisateur`
  ADD PRIMARY KEY (`Id_Discord`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `Echange`
--
ALTER TABLE `Echange`
  MODIFY `Id_Echange` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `PC`
--
ALTER TABLE `PC`
  MODIFY `PC_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=314;

--
-- AUTO_INCREMENT pour la table `Type_Pokemon`
--
ALTER TABLE `Type_Pokemon`
  MODIFY `Id_Type` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `Capture`
--
ALTER TABLE `Capture`
  ADD CONSTRAINT `Capture_ibfk_1` FOREIGN KEY (`Id_Pokemon`) REFERENCES `Pokemon` (`Id_Pokemon`),
  ADD CONSTRAINT `Capture_ibfk_2` FOREIGN KEY (`Id_Discord`) REFERENCES `Utilisateur` (`Id_Discord`);

--
-- Contraintes pour la table `Echange`
--
ALTER TABLE `Echange`
  ADD CONSTRAINT `Echange_ibfk_1` FOREIGN KEY (`Id_Pokemon`) REFERENCES `Pokemon` (`Id_Pokemon`),
  ADD CONSTRAINT `Echange_ibfk_2` FOREIGN KEY (`Id_DA`) REFERENCES `Utilisateur` (`Id_Discord`),
  ADD CONSTRAINT `Echange_ibfk_3` FOREIGN KEY (`Id_DO`) REFERENCES `Utilisateur` (`Id_Discord`);

--
-- Contraintes pour la table `Est_de_type`
--
ALTER TABLE `Est_de_type`
  ADD CONSTRAINT `Est_de_type_ibfk_1` FOREIGN KEY (`Id_Pokemon`) REFERENCES `Pokemon` (`Id_Pokemon`),
  ADD CONSTRAINT `Est_de_type_ibfk_2` FOREIGN KEY (`Id_Type`) REFERENCES `Type_Pokemon` (`Id_Type`);

--
-- Contraintes pour la table `PC`
--
ALTER TABLE `PC`
  ADD CONSTRAINT `PC_ibfk_1` FOREIGN KEY (`Id_Pokemon`) REFERENCES `Pokemon` (`Id_Pokemon`),
  ADD CONSTRAINT `PC_ibfk_2` FOREIGN KEY (`Id_DresseurAct`) REFERENCES `Utilisateur` (`Id_Discord`),
  ADD CONSTRAINT `PC_ibfk_3` FOREIGN KEY (`Id_DresseurOri`) REFERENCES `Utilisateur` (`Id_Discord`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
