-- Migration V2: Add composite status index on jobs table for employer dashboard performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer_status ON jobs(employer_id, status);
