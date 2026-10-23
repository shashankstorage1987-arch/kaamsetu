-- KaamSetu Initial Schema Migration (V1)
-- Database Engine: PostgreSQL 15+ with PostGIS and uuid-ossp extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. GLOBAL ENUMS
CREATE TYPE user_role AS ENUM ('WORKER', 'EMPLOYER', 'ADMIN');

CREATE TYPE trade_type AS ENUM (
  'ELECTRICAL',
  'HARDWARE',
  'SALON',
  'GROCERY',
  'RESTAURANT',
  'MEDICAL',
  'GARAGE',
  'OTHER'
);

CREATE TYPE profession_type AS ENUM (
  'HELPER',
  'BILLER',
  'SALES',
  'BARBER',
  'WAITER',
  'MECHANIC',
  'CASHIER',
  'DELIVERY',
  'OTHER'
);

CREATE TYPE shift_type AS ENUM ('DAY', 'NIGHT');

CREATE TYPE job_status AS ENUM ('ACTIVE', 'CLOSED');

CREATE TYPE job_close_reason AS ENUM (
  'HIRED_VIA_KAAMSETU',
  'HIRED_ELSEWHERE',
  'NO_LONGER_HIRING'
);

CREATE TYPE application_status AS ENUM (
  'NOTIFIED',
  'VIEWED',
  'INTERESTED',
  'HIRED',
  'NOT_SELECTED'
);

CREATE TYPE hire_status AS ENUM ('PENDING', 'CONFIRMED', 'MISMATCH');

CREATE TYPE report_reason AS ENUM (
  'NO_SHOW',
  'FAKE_EXPERIENCE',
  'INAPPROPRIATE_BEHAVIOR',
  'OTHER'
);

-- 2. TABLES

-- Table 1: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    aadhaar_verified BOOLEAN DEFAULT FALSE NOT NULL,
    aadhaar_ref_id VARCHAR(100) NULL,
    suspended BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role_status ON users(role, suspended);

-- Table 2: user_devices
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fcm_token VARCHAR(512) NOT NULL,
    platform VARCHAR(20) DEFAULT 'WEB' NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_device UNIQUE (user_id, fcm_token)
);

CREATE INDEX idx_user_devices_active ON user_devices(user_id) WHERE active = TRUE;

-- Table 3: worker_profiles
CREATE TABLE worker_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    total_experience_years NUMERIC(4, 1) DEFAULT 0.0 NOT NULL,
    languages TEXT[] DEFAULT '{}' NOT NULL,
    preferred_salary INTEGER NULL,
    preferred_distance_km NUMERIC(4, 1) DEFAULT 5.0 NOT NULL,
    is_available BOOLEAN DEFAULT FALSE NOT NULL,
    available_until TIMESTAMP WITH TIME ZONE NULL,
    address_line VARCHAR(255) NULL,
    area VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    location GEOGRAPHY(Point, 4326) NULL,
    photo_url VARCHAR(512) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_worker_location ON worker_profiles USING GIST (location);
CREATE INDEX idx_worker_avail ON worker_profiles(is_available, available_until) WHERE is_available = TRUE;

-- Table 4: worker_experience
CREATE TABLE worker_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES worker_profiles(user_id) ON DELETE CASCADE,
    trade trade_type NOT NULL,
    profession profession_type NOT NULL,
    previous_employer_name VARCHAR(150) NOT NULL,
    duration_months INTEGER NOT NULL CHECK (duration_months > 0),
    core_skills TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_worker_exp_search ON worker_experience(trade, profession, worker_id);

-- Table 5: employer_profiles
CREATE TABLE employer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    business_trade trade_type NOT NULL,
    years_in_business INTEGER DEFAULT 0 NOT NULL,
    typical_roles_hired TEXT[] DEFAULT '{}' NOT NULL,
    photo_url VARCHAR(512) NULL,
    address_line VARCHAR(255) NULL,
    area VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    location GEOGRAPHY(Point, 4326) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_employer_location ON employer_profiles USING GIST (location);

-- Table 6: jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES employer_profiles(user_id) ON DELETE CASCADE,
    trade trade_type NOT NULL,
    profession profession_type NOT NULL,
    experience_required_years NUMERIC(4, 1) DEFAULT 0.0 NOT NULL,
    salary INTEGER NOT NULL CHECK (salary > 0),
    shift shift_type DEFAULT 'DAY' NOT NULL,
    timing VARCHAR(100) NULL,
    radius_km NUMERIC(4, 1) DEFAULT 1.0 NOT NULL,
    status job_status DEFAULT 'ACTIVE' NOT NULL,
    close_reason job_close_reason NULL,
    location GEOGRAPHY(Point, 4326) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_jobs_location ON jobs USING GIST (location);
CREATE INDEX idx_jobs_search ON jobs(trade, profession, status, created_at DESC);

-- Table 7: job_interests
CREATE TABLE job_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES worker_profiles(user_id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL,
    status application_status DEFAULT 'NOTIFIED' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_job_worker_interest UNIQUE (job_id, worker_id)
);

CREATE INDEX idx_job_interests_funnel ON job_interests(job_id, status);

-- Table 8: hire_confirmations
CREATE TABLE hire_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES worker_profiles(user_id) ON DELETE CASCADE,
    employer_confirmed BOOLEAN DEFAULT TRUE NOT NULL,
    worker_confirmed BOOLEAN NULL,
    status hire_status DEFAULT 'PENDING' NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_hire_confirmation UNIQUE (job_id, worker_id)
);

-- Table 9: reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    details TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_reports_reported ON reports(reported_id);

-- Table 10: audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
