
USE cousp_mis_db;

-- 1. ROLES
INSERT IGNORE INTO roles (id, name, slug, description, is_system, created_at, updated_at) VALUES
(UUID(), 'Super Administrateur Système', 'SUPER_ADMIN', 'Administration technique, sécurité et audits globaux', 1, NOW(), NOW()),
(UUID(), 'Directeur Général COUSP', 'COUSP_DIRECTOR', 'Coordination stratégique et déclaration des urgences nationales', 1, NOW(), NOW()),
(UUID(), 'Épidémiologiste National', 'EPIDEMIOLOGIST', 'Surveillance SIMR, qualification des alertes et enquêtes terrain', 1, NOW(), NOW()),
(UUID(), 'Biologiste Laboratoire National', 'LAB_TECH', 'Validation analytique des prélèvements et confirmation biologique', 1, NOW(), NOW()),
(UUID(), 'Gestionnaire Logistique Stratégique', 'LOGISTICIAN', 'Gestion des stocks d urgence, dotations et prévention des ruptures', 1, NOW(), NOW()),
(UUID(), 'Point Focal Départemental DDSSS', 'FIELD_AGENT', 'Direction Départementale des Soins et Services de Santé', 1, NOW(), NOW()),
(UUID(), 'Observateur Partenaire (OMS/CDC)', 'PARTNER_OBSERVER', 'Accès en lecture restreinte aux SITREP et agrégats statistiques', 1, NOW(), NOW());

-- 2. DEPARTEMENTS
INSERT IGNORE INTO departments (id, code, name, capital, population, latitude, longitude, created_at, updated_at) VALUES
(UUID(), 'BZV', 'Brazzaville', 'Brazzaville', 2145000, -4.2634, 15.2429, NOW(), NOW()),
(UUID(), 'PNR', 'Pointe-Noire', 'Pointe-Noire', 1150000, -4.7977, 11.8504, NOW(), NOW()),
(UUID(), 'KOU', 'Kouilou', 'Hinda', 130000, -4.2000, 11.9500, NOW(), NOW()),
(UUID(), 'NIA', 'Niari', 'Dolisie', 334000, -4.2000, 12.6667, NOW(), NOW()),
(UUID(), 'BOU', 'Bouenza', 'Madingou', 430000, -4.1500, 13.5500, NOW(), NOW()),
(UUID(), 'LEK', 'Lékoumou', 'Sibiti', 135000, -3.6833, 13.3500, NOW(), NOW()),
(UUID(), 'POO', 'Pool', 'Kinkala', 320000, -4.3611, 14.7644, NOW(), NOW()),
(UUID(), 'PLA', 'Plateaux', 'Djambala', 235000, -2.5444, 14.7528, NOW(), NOW()),
(UUID(), 'CUV', 'Cuvette', 'Owando', 210000, -0.4819, 15.8999, NOW(), NOW()),
(UUID(), 'CUW', 'Cuvette-Ouest', 'Ewo', 98000, -0.8725, 14.8206, NOW(), NOW()),
(UUID(), 'SNG', 'Sangha', 'Ouesso', 125000, 1.6136, 16.0517, NOW(), NOW()),
(UUID(), 'LIK', 'Likouala', 'Impfondo', 205000, 1.6381, 18.0672, NOW(), NOW());

-- 3. MALADIES SIMR
INSERT IGNORE INTO diseases (id, code, name, icd11_code, incubation_period_days, epidemic_threshold, alert_threshold, case_definition, created_at) VALUES
(UUID(), 'MPOX', 'Variole du Singe (Mpox Clade I)', '1E71', 21, 1, 1, 'Éruption cutanéo-muqueuse vésiculo-pustuleuse inexpliquée, adénopathies fébriles, avec notion d exposition ou contact.', NOW()),
(UUID(), 'CHOLERA', 'Choléra', '1A00', 5, 1, 1, 'Sujet de 5 ans ou plus présentant une diarrhée aqueuse aiguë profuse et soudaine avec déshydratation sévère.', NOW()),
(UUID(), 'EBOLA', 'Maladie à Virus Ebola (MVE)', '1D60', 21, 1, 1, 'Fièvre d apparition brutale, hémorragies inexpliquées ou décès communautaire inexpliqué après contact.', NOW()),
(UUID(), 'POLIO', 'Poliomyélite Aiguë Flasque (PPA)', '1C81', 14, 1, 1, 'Toute paralysie flasque aiguë chez un enfant de moins de 15 ans ou syndrome paralytique fébrile.', NOW()),
(UUID(), 'ROUGEOLE', 'Rougeole', '1F03', 14, 5, 3, 'Fièvre, éruption maculo-papuleuse généralisée, toux, coryza ou conjonctivite.', NOW());

-- 4. PRODUITS D URGENCE
INSERT IGNORE INTO products (id, code, name, category, unit_of_measure, storage_condition, minimum_alert_stock, created_at) VALUES
(UUID(), 'PPE-KIT-FULL', 'Kit Complet Protection Individuelle (EPI Niveau 3)', 'EPI', 'KIT', 'AMBIENT', 50, NOW()),
(UUID(), 'RDT-CHOLERA', 'Tests de Diagnostic Rapide Choléra (Crystal VC)', 'DIAGNOSTIC', 'BOITE_25', 'AMBIENT', 20, NOW()),
(UUID(), 'PCR-MPOX-REG', 'Kits Réactifs PCR Mpox Temps Réel', 'REACTIF', 'KIT_100_TESTS', 'COLD_MINUS_20C', 10, NOW()),
(UUID(), 'SRO-ZINC', 'Sels de Réhydratation Orale + Sulfate de Zinc', 'MEDICAMENT', 'CARTON_100', 'AMBIENT', 100, NOW()),
(UUID(), 'VACCIN-ORV', 'Vaccin Oral contre le Choléra (Dukoral / Euvichol)', 'VACCIN', 'DOSES', 'COLD_2_8C', 500, NOW());

-- 5. PARTENAIRES
INSERT IGNORE INTO partners (id, name, type, contact_person, email, phone, created_at) VALUES
(UUID(), 'Organisation Mondiale de la Santé (OMS)', 'AGENCE_ONU', 'Représentant Résident Congo', 'afwcocog@who.int', '+242 06 660 00 00', NOW()),
(UUID(), 'UNICEF Congo', 'AGENCE_ONU', 'Chef Section Survie de l Enfant', 'brazzaville@unicef.org', '+242 06 669 00 00', NOW()),
(UUID(), 'Africa CDC', 'INSTITUTION_REGIONALE', 'Coordinateur Régional Afrique Centrale', 'africacdc@africa-union.org', '+242 05 500 00 00', NOW());
