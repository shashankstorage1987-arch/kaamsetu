-- V4: Allow fresher worker experiences with duration_months >= 0 and optional previous_employer_name

ALTER TABLE worker_experience DROP CONSTRAINT IF EXISTS worker_experience_duration_months_check;
ALTER TABLE worker_experience ADD CONSTRAINT worker_experience_duration_months_check CHECK (duration_months >= 0);

ALTER TABLE worker_experience ALTER COLUMN previous_employer_name DROP NOT NULL;
