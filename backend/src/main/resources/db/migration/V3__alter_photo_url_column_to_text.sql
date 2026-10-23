-- Migration: Alter photo_url column to TEXT for worker_profiles and employer_profiles
ALTER TABLE worker_profiles ALTER COLUMN photo_url TYPE TEXT;
ALTER TABLE employer_profiles ALTER COLUMN photo_url TYPE TEXT;
