# Modèle Physique de Données & Dictionnaire de Données (MPD)
**COUSP-MIS – République du Congo**

---

## 1. Conventions et Types

- **Clés primaires** : UUID v4 (`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`).
- **Coordonnées géographiques** : `geometry(Point, 4326)` pour la localisation précise (lat/long WGS 84).
- **Horodatages d'audit** : `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`, `created_by UUID REFERENCES users(id)`.
- **Statuts et Enums** : Types ENUM PostgreSQL explicites.

---

## 2. Dictionnaire des Tables Principales

### 2.1 Référentiels Territoriaux et Sanitaires
- `departments` : id, code (ex: `BZV`, `PNR`, `KOU`), name, capital, population, geom.
- `health_zones` : id, department_id, code, name, headquarter, population, geom.
- `health_areas` : id, health_zone_id, code, name, population.
- `health_facilities` : id, health_area_id, code, name, type (HOPITAL_GENERAL, CSI, POSTE_SANTE, LABORATOIRE), level, contact_phone, latitude, longitude, geom.

### 2.2 Gestion des Utilisateurs et Habilitations (IAM)
- `users` : id, email, password_hash (Argon2id), first_name, last_name, phone, title, organization, status (ACTIVE, SUSPENDED, PENDING), failed_login_attempts, last_login_at.
- `roles` : id, name, slug (SUPER_ADMIN, COUSP_DIRECTOR, EPIDEMIOLOGIST, LAB_TECH, LOGISTICIAN, FIELD_AGENT), description, is_system.
- `permissions` : id, resource (ex: `alerts`, `incidents`, `stocks`), action (`create`, `read`, `update`, `delete`, `validate`, `export`), description.
- `user_territorial_scopes` : id, user_id, department_id, health_zone_id, facility_id, scope_level (NATIONAL, DEPARTMENTAL, ZONE, FACILITY).
- `sessions` : id, user_id, refresh_token_hash, user_agent, ip_address, expires_at, is_revoked.

### 2.3 Surveillance et Alertes Sanitaires
- `diseases` : id, code, name, icd11_code, incubation_period_days, epidemic_threshold, alert_threshold, case_definition.
- `alerts` : id, alert_number (`ALT-2026-0001`), disease_id, health_facility_id, reporter_name, reporter_contact, reporter_type (COMMUNITY, HEALTH_AGENT, MEDIA, HOTLINE), suspected_cases, suspected_deaths, description, reported_at, status (RECEIVED, INVESTIGATING, VALIDATED, REJECTED), severity (LOW, MODERATE, HIGH, CRITICAL), validated_by, validated_at, rejection_reason.

### 2.4 Incidents et Opérations (IMS)
- `incidents` : id, incident_number (`INC-2026-0001`), title, source_alert_id, disease_id, primary_department_id, activation_level (LEVEL_1_MONITORING, LEVEL_2_ALERT, LEVEL_3_MAJOR_EMERGENCY), status (ACTIVE, CONTROLLED, CLOSED), incident_commander_id, started_at, closed_at, closing_summary.
- `operations` : id, incident_id, code, name, type (INVESTIGATION, VACCINATION, DECONTAMINATION, ACTIVE_SEARCH), status (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED), start_date, end_date, budget_xaf.
- `teams` : id, operation_id, name, leader_id, specialty (RAPID_RESPONSE, LAB, LOGISTICS, RISK_COMMUNICATION).
- `team_members` : id, team_id, user_id, role_in_team, deployed_at.
- `tasks` : id, operation_id, assigned_to_user_id, assigned_to_team_id, title, description, priority (LOW, MEDIUM, HIGH, URGENT), status (TODO, IN_PROGRESS, REVIEW, DONE), due_date, completed_at.

### 2.5 Cas Sanitaires et Laboratoires
- `case_records` : id, case_identifier (`CAS-BZV-2026-001`), incident_id, disease_id, health_facility_id, patient_pseudonym, age_years, gender (M, F, OTHER), residence_department_id, residence_district, onset_date, admission_date, classification (SUSPECT, PROBABLE, CONFIRMED, DISCARDED), outcome (UNDER_TREATMENT, DISCHARGED, DECEASED, TRANSFERRED), outcome_date.
- `lab_requests` : id, request_number (`LAB-REQ-2026-001`), case_record_id, sample_type (BLOOD, SWAB, SPUTUM, CSF, TISSUE), collection_date, cold_chain_maintained, destination_facility_id, status (COLLECTED, IN_TRANSIT, RECEIVED, PROCESSING, COMPLETED, REJECTED).
- `lab_results` : id, lab_request_id, test_method (RT_PCR, SEROLOGY, RDT, CULTURE, SEQUENCING), pathogen_detected, result_status (POSITIVE, NEGATIVE, INDETERMINATE), ct_value, analyzed_by, validated_by, validated_at.

### 2.6 Logistique, Stocks et Finance
- `products` : id, code, name, category (PPE, REAGENT, MEDICINE, VACCINE, MEDICAL_DEVICE), unit_of_measure, storage_condition (AMBIENT, COLD_2_8C, ULTRA_COLD_MINUS_80C), minimum_alert_stock.
- `stock_items` : id, health_facility_id, product_id, batch_number, expiry_date, quantity_available, quantity_reserved.
- `stock_movements` : id, movement_number (`MVT-2026-0001`), source_facility_id, destination_facility_id, product_id, batch_number, quantity, movement_type (RECEPTION, EMERGENCY_DISPATCH, CONSUMPTION, EXPIRATION, TRANSFER), incident_id, created_by, confirmed_by, status (PENDING, IN_TRANSIT, COMPLETED, CANCELLED).
- `partners` : id, name, type (UN_AGENCY, BILATERAL_DONOR, NGO, PRIVATE_SECTOR), contact_person, email, phone.
- `financial_contributions` : id, partner_id, incident_id, amount_xaf, purpose, grant_reference, disbursed_date.

### 2.7 SITREP, Documents et Traçabilité
- `sitreps` : id, sitrep_number (`SITREP-001`), incident_id, reporting_period_start, reporting_period_end, total_cases, new_cases, total_deaths, new_deaths, response_summary, gaps_and_challenges, recommendations, status (DRAFT, IN_REVIEW, APPROVED, PUBLISHED), prepared_by, approved_by, approved_at.
- `audit_logs` : id, user_id, action, resource, resource_id, old_values (JSONB), new_values (JSONB), ip_address, user_agent, timestamp.

