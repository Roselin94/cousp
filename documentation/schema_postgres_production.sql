-- =============================================================================
-- COUSP-MIS : Schéma SQL Complet de Production PostgreSQL avec PostGIS
-- République du Congo - Ministère de la Santé et de la Population
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');
CREATE TYPE facility_type_enum AS ENUM (
    'HOPITAL_GENERAL', 
    'HOPITAL_REFERENCE', 
    'CENTRE_SANTE_INTEGRE', 
    'POSTE_SANTE', 
    'LABORATOIRE_NATIONAL', 
    'LABORATOIRE_REGIONAL', 
    'CENTRE_TRAITEMENT_EPIDEMIQUE'
);
CREATE TYPE alert_status_enum AS ENUM ('RECUE', 'EN_QUALIFICATION', 'VALIDEE', 'REJETEE', 'CLOTUREE');
CREATE TYPE alert_severity_enum AS ENUM ('FAIBLE', 'MODEREE', 'ELEVEE', 'CRITIQUE');
CREATE TYPE incident_activation_level_enum AS ENUM ('NIVEAU_1_VIGILANCE', 'NIVEAU_2_ALERTE', 'NIVEAU_3_URGENCE_MAJEURE');
CREATE TYPE incident_status_enum AS ENUM ('ACTIF', 'SOUS_CONTROLE', 'CLOTURE');
CREATE TYPE case_classification_enum AS ENUM ('SUSPECT', 'PROBABLE', 'CONFIRME', 'INVALIDE');
CREATE TYPE case_outcome_enum AS ENUM ('EN_COURS', 'GUERI', 'DECEDE', 'TRANSFERE', 'PERDU_DE_VUE');
CREATE TYPE gender_enum AS ENUM ('M', 'F', 'AUTRE');
CREATE TYPE lab_status_enum AS ENUM ('PRELEVE', 'EN_TRANSIT', 'RECU', 'EN_ANALYSE', 'VALIDE', 'REJETE');
CREATE TYPE lab_result_value_enum AS ENUM ('POSITIF', 'NEGATIF', 'INDETERMINE');
CREATE TYPE task_status_enum AS ENUM ('A_FAIRE', 'EN_COURS', 'EN_REVUE', 'TERMINE', 'ANNULE');
CREATE TYPE task_priority_enum AS ENUM ('FAIBLE', 'MOYENNE', 'ELEVEE', 'URGENTE');
CREATE TYPE movement_type_enum AS ENUM ('RECEPTION', 'DISTRIBUTION_URGENCE', 'TRANSFERT', 'CONSOMMATION', 'EXPIRATION', 'AJUSTEMENT');
CREATE TYPE sitrep_status_enum AS ENUM ('BROUILLON', 'EN_RELECTURE', 'APPROUVE', 'PUBLIE');

-- -----------------------------------------------------------------------------
-- 1. DIVISION ADMINISTRATIVE & SUBDIVISION SANITAIRE
-- -----------------------------------------------------------------------------

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    capital VARCHAR(100) NOT NULL,
    population INT NOT NULL CHECK (population > 0),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE districts_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'DISTRICT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE localities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_admin_id UUID NOT NULL REFERENCES districts_admin(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) DEFAULT 'VILLAGE',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE health_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    headquarter VARCHAR(100) NOT NULL,
    population INT NOT NULL CHECK (population >= 0),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE health_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_zone_id UUID NOT NULL REFERENCES health_zones(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    population INT NOT NULL CHECK (population >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE health_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_area_id UUID NOT NULL REFERENCES health_areas(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    type facility_type_enum NOT NULL,
    level INT NOT NULL DEFAULT 1,
    contact_phone VARCHAR(50),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. GESTION DES UTILISATEURS, SESSIONS ET RBAC/ABAC
-- -----------------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(100),
    organization VARCHAR(150) DEFAULT 'COUSP-MSP',
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    failed_login_attempts INT NOT NULL DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_resource_action UNIQUE (resource, action)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_territorial_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    health_zone_id UUID REFERENCES health_zones(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES health_facilities(id) ON DELETE CASCADE,
    is_national BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. SURVEILLANCE ÉPIDÉMIOLOGIQUE ET ALERTES
-- -----------------------------------------------------------------------------

CREATE TABLE diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    icd11_code VARCHAR(20),
    incubation_period_days INT,
    epidemic_threshold INT NOT NULL DEFAULT 1,
    alert_threshold INT NOT NULL DEFAULT 1,
    case_definition TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_number VARCHAR(30) UNIQUE NOT NULL,
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE RESTRICT,
    health_facility_id UUID NOT NULL REFERENCES health_facilities(id) ON DELETE RESTRICT,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_contact VARCHAR(50),
    reporter_type VARCHAR(50) NOT NULL DEFAULT 'AGENT_SANTE',
    suspected_cases INT NOT NULL DEFAULT 1 CHECK (suspected_cases > 0),
    suspected_deaths INT NOT NULL DEFAULT 0 CHECK (suspected_deaths >= 0),
    description TEXT NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status alert_status_enum NOT NULL DEFAULT 'RECUE',
    severity alert_severity_enum NOT NULL DEFAULT 'MODEREE',
    validated_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_deaths_le_cases CHECK (suspected_deaths <= suspected_cases)
);

CREATE TABLE surveillance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporting_year INT NOT NULL,
    epi_week INT NOT NULL CHECK (epi_week BETWEEN 1 AND 53),
    health_facility_id UUID NOT NULL REFERENCES health_facilities(id) ON DELETE CASCADE,
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE RESTRICT,
    cases_count INT NOT NULL DEFAULT 0 CHECK (cases_count >= 0),
    deaths_count INT NOT NULL DEFAULT 0 CHECK (deaths_count >= 0),
    submitted_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_surv_fosa_dis_week UNIQUE (health_facility_id, disease_id, reporting_year, epi_week)
);

-- -----------------------------------------------------------------------------
-- 4. INCIDENTS, OPÉRATIONS, ÉQUIPES ET TÂCHES (IMS)
-- -----------------------------------------------------------------------------

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    source_alert_id UUID UNIQUE REFERENCES alerts(id) ON DELETE SET NULL,
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE RESTRICT,
    primary_department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    activation_level incident_activation_level_enum NOT NULL DEFAULT 'NIVEAU_1_VIGILANCE',
    status incident_status_enum NOT NULL DEFAULT 'ACTIF',
    incident_commander_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    closing_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_close_after_start CHECK (closed_at IS NULL OR closed_at >= started_at)
);

CREATE TABLE operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    budget_xaf DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (budget_xaf >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_team VARCHAR(100) NOT NULL,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority task_priority_enum NOT NULL DEFAULT 'MOYENNE',
    status task_status_enum NOT NULL DEFAULT 'A_FAIRE',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. DOSSIERS CLINIQUES, CAS ÉPIDÉMIOLOGIQUES ET LABORATOIRE
-- -----------------------------------------------------------------------------

CREATE TABLE case_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_identifier VARCHAR(40) UNIQUE NOT NULL,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE RESTRICT,
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE RESTRICT,
    health_facility_id UUID NOT NULL REFERENCES health_facilities(id) ON DELETE RESTRICT,
    patient_pseudonym VARCHAR(100) NOT NULL,
    age_years INT NOT NULL CHECK (age_years >= 0 AND age_years <= 125),
    gender gender_enum NOT NULL,
    residence_department VARCHAR(100) NOT NULL,
    residence_district VARCHAR(100) NOT NULL,
    onset_date TIMESTAMPTZ NOT NULL,
    admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    classification case_classification_enum NOT NULL DEFAULT 'SUSPECT',
    outcome case_outcome_enum NOT NULL DEFAULT 'EN_COURS',
    outcome_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_admission_after_onset CHECK (admission_date >= onset_date)
);

CREATE TABLE lab_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(40) UNIQUE NOT NULL,
    case_record_id UUID NOT NULL REFERENCES case_records(id) ON DELETE CASCADE,
    sample_type VARCHAR(100) NOT NULL,
    collection_date TIMESTAMPTZ NOT NULL,
    cold_chain_maintained BOOLEAN NOT NULL DEFAULT TRUE,
    status lab_status_enum NOT NULL DEFAULT 'PRELEVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_request_id UUID UNIQUE NOT NULL REFERENCES lab_requests(id) ON DELETE CASCADE,
    test_method VARCHAR(100) NOT NULL,
    pathogen_detected VARCHAR(100),
    result_status lab_result_value_enum NOT NULL,
    ct_value DOUBLE PRECISION,
    analyzed_by VARCHAR(100) NOT NULL,
    validated_by VARCHAR(100) NOT NULL,
    validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. LOGISTIQUE STRATÉGIQUE, STOCKS, MOUVEMENTS ET FINANCES
-- -----------------------------------------------------------------------------

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    storage_condition VARCHAR(50) NOT NULL,
    minimum_alert_stock INT NOT NULL DEFAULT 10 CHECK (minimum_alert_stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_facility_id UUID NOT NULL REFERENCES health_facilities(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_number VARCHAR(50) NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_facility_product_batch UNIQUE (health_facility_id, product_id, batch_number)
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_number VARCHAR(40) UNIQUE NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_number VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    movement_type movement_type_enum NOT NULL,
    source_facility VARCHAR(150),
    dest_facility VARCHAR(150),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE financial_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE RESTRICT,
    amount_xaf DOUBLE PRECISION NOT NULL CHECK (amount_xaf > 0),
    purpose TEXT NOT NULL,
    grant_reference VARCHAR(100),
    disbursed_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. SITREP, PLANS D'URGENCE ET AUDIT LOGS
-- -----------------------------------------------------------------------------

CREATE TABLE sitreps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sitrep_number VARCHAR(40) UNIQUE NOT NULL,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE RESTRICT,
    reporting_period_start TIMESTAMPTZ NOT NULL,
    reporting_period_end TIMESTAMPTZ NOT NULL,
    total_cases INT NOT NULL DEFAULT 0 CHECK (total_cases >= 0),
    new_cases INT NOT NULL DEFAULT 0 CHECK (new_cases >= 0),
    total_deaths INT NOT NULL DEFAULT 0 CHECK (total_deaths >= 0),
    new_deaths INT NOT NULL DEFAULT 0 CHECK (new_deaths >= 0),
    response_summary TEXT NOT NULL,
    gaps_and_challenges TEXT,
    recommendations TEXT,
    status sitrep_status_enum NOT NULL DEFAULT 'BROUILLON',
    prepared_by VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_sitrep_dates CHECK (reporting_period_end >= reporting_period_start)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES DE HAUTE PERFORMANCE
-- -----------------------------------------------------------------------------

CREATE INDEX idx_departments_geom ON departments USING GIST (geom);
CREATE INDEX idx_health_facilities_geom ON health_facilities USING GIST (geom);
CREATE INDEX idx_alerts_status_date ON alerts (status, reported_at DESC);
CREATE INDEX idx_incidents_status_level ON incidents (status, activation_level);
CREATE INDEX idx_case_records_incident ON case_records (incident_id, classification, outcome);
CREATE INDEX idx_stock_items_facility_product ON stock_items (health_facility_id, product_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);

