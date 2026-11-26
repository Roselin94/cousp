SET NAMES utf8mb4;
USE cousp_mis_db;

UPDATE departments SET name = 'Lékoumou' WHERE code = 'LEK';
UPDATE departments SET name = 'Bouenza' WHERE code = 'BOU';
UPDATE departments SET name = 'Niari' WHERE code = 'NIA';
UPDATE departments SET name = 'Kouilou' WHERE code = 'KOU';
UPDATE departments SET name = 'Cuvette-Ouest' WHERE code = 'CUW';

UPDATE diseases SET name = 'Variole du Singe (Mpox Clade I)', case_definition = "Éruption cutanéo-muqueuse vésiculo-pustuleuse inexpliquée, adénopathies fébriles, avec notion d'exposition ou contact." WHERE code = 'MPOX';
UPDATE diseases SET name = 'Choléra', case_definition = "Sujet de 5 ans ou plus présentant une diarrhée aqueuse aiguë profuse et soudaine avec déshydratation sévère." WHERE code = 'CHOLERA';
UPDATE diseases SET name = 'Maladie à Virus Ebola (MVE)', case_definition = "Fièvre d'apparition brutale, hémorragies inexpliquées ou décès communautaire inexpliqué après contact." WHERE code = 'EBOLA';
UPDATE diseases SET name = 'Poliomyélite Aiguë Flasque (PFA)', case_definition = "Toute paralysie flasque aiguë chez un enfant de moins de 15 ans ou syndrome paralytique fébrile." WHERE code = 'POLIO';
UPDATE diseases SET name = 'Rougeole', case_definition = "Fièvre, éruption maculo-papuleuse généralisée, toux, coryza ou conjonctivite." WHERE code = 'ROUGEOLE';

UPDATE alerts SET description = "Cluster de 3 patients avec éruptions vésiculo-pustuleuses et adénopathies fébriles en provenance d'une zone forestière." WHERE id = 'alt-001';
UPDATE alerts SET description = "Flambée soudaine de diarrhées aiguës profuses avec déshydratation sévère chez des pêcheurs du littoral." WHERE id = 'alt-002';

UPDATE incidents SET title = 'Riposte Épidémique Mpox Clade I - Sangha & Likouala' WHERE id = 'inc-001';

UPDATE health_facilities SET name = 'Centre Hospitalier Universitaire de Brazzaville (CHUB)' WHERE id = 'fosa-chu-bzv';
UPDATE health_facilities SET name = 'Hôpital de Référence de Talangaï' WHERE id = 'fosa-hop-talangai';
UPDATE health_facilities SET name = 'Hôpital Général de Loandjili (Pointe-Noire)' WHERE id = 'fosa-hop-loandjili';
UPDATE health_facilities SET name = "Hôpital de Base d'Ouesso (Sangha)" WHERE id = 'fosa-hop-ouesso';
UPDATE health_facilities SET name = "Hôpital de Base d'Impfondo (Likouala)" WHERE id = 'fosa-hop-impfondo';

UPDATE health_zones SET name = 'District Sanitaire Talangaï-Mfilou' WHERE id = 'hz-bzv-nord';
UPDATE health_zones SET name = 'District Sanitaire Bacongo-Makélékélé' WHERE id = 'hz-bzv-sud';
UPDATE health_zones SET name = 'District Sanitaire Tié-Tié / Lumumba' WHERE id = 'hz-pnr-centre';

UPDATE products SET name = 'Kits Réactifs PCR Mpox Temps Réel' WHERE code = 'PCR-MPOX-REG';
UPDATE products SET name = 'Tests de Diagnostic Rapide Choléra (Crystal VC)' WHERE code = 'RDT-CHOLERA';
UPDATE products SET name = 'Vaccin Oral contre le Choléra (Dukoral / Euvichol)' WHERE code = 'VACCIN-ORV';
