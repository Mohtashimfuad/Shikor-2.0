-- =====================================================================
-- SHIKOR (শিকড়) - SUPABASE POSTGRESQL & POSTGIS SCHEMA MIGRATION
-- Citizen-Powered River Erosion Evidence & Resettlement Platform
-- =====================================================================
-- Run this entire script in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- NOTE: All statements use IF NOT EXISTS. It is 100% SAFE to run multiple times!
-- Even if you didn't click "Save snippet" in Supabase, clicking "RUN" already
-- executed and saved all tables permanently into your PostgreSQL database.
-- =====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'surveyor', 'ac_land_official', 'uno')),
  full_name_en TEXT NOT NULL,
  full_name_bn TEXT,
  phone_number TEXT UNIQUE NOT NULL,
  nid_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. High-Risk River Erosion Plots & Claims
CREATE TABLE IF NOT EXISTS public.erosion_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT UNIQUE NOT NULL,
  claimant_id UUID REFERENCES public.profiles(id),
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  union_name TEXT NOT NULL,
  mouza_name TEXT NOT NULL,
  jl_number TEXT NOT NULL,
  khatian_no TEXT NOT NULL,
  dag_no TEXT NOT NULL,
  total_area_acre NUMERIC(6,3) NOT NULL,
  submerged_area_acre NUMERIC(6,3) NOT NULL,
  erosion_year INT NOT NULL,
  river_basin TEXT NOT NULL,
  centroid_point GEOMETRY(Point, 4326),
  satellite_match_rate NUMERIC(5,2) DEFAULT 0.0,
  is_satellite_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'witness_confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Geotagged Phone Camera Media Evidence
CREATE TABLE IF NOT EXISTS public.claim_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES public.erosion_claims(id) ON DELETE CASCADE,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'tax_receipt')),
  storage_path TEXT NOT NULL,
  exif_lat NUMERIC(10,7),
  exif_lng NUMERIC(10,7),
  sha256_hash TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Community Witnesses (Proof of Prior Possession)
CREATE TABLE IF NOT EXISTS public.claim_witnesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES public.erosion_claims(id) ON DELETE CASCADE,
  witness_name TEXT NOT NULL,
  relation_or_designation TEXT NOT NULL,
  attestation_signature_hash TEXT NOT NULL,
  attested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Verifiable Land Loss Certificates
CREATE TABLE IF NOT EXISTS public.loss_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID UNIQUE REFERENCES public.erosion_claims(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  qr_verification_code TEXT NOT NULL,
  spectral_water_index NUMERIC(4,2),
  cryptographic_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Row Level Security (RLS) for Claims
ALTER TABLE public.erosion_claims ENABLE ROW LEVEL SECURITY;

-- Allow public read access to claims for verification and certificates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'erosion_claims' AND policyname = 'Public Read Claims'
  ) THEN
    CREATE POLICY "Public Read Claims" ON public.erosion_claims FOR SELECT USING (true);
  END IF;
END $$;

-- Allow inserting claims from the Shikor frontend
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'erosion_claims' AND policyname = 'Public Insert Claims'
  ) THEN
    CREATE POLICY "Public Insert Claims" ON public.erosion_claims FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow public read & insert for loss_certificates
ALTER TABLE public.loss_certificates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loss_certificates' AND policyname = 'Public Read Certificates'
  ) THEN
    CREATE POLICY "Public Read Certificates" ON public.loss_certificates FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loss_certificates' AND policyname = 'Public Insert Certificates'
  ) THEN
    CREATE POLICY "Public Insert Certificates" ON public.loss_certificates FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- =====================================================================
-- 8. STORAGE BUCKET CONFIGURATION (Private Bucket: citizen-evidence)
-- Note: 'storage.objects' already has RLS enabled by Supabase by default.
-- Do NOT run 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;' 
-- as Supabase restricts table altering on storage schema to internal superuser.
-- =====================================================================

-- Step A: Create or ensure private bucket exists (public = false)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('citizen-evidence', 'citizen-evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Step B: Allow uploading photos/videos to citizen-evidence bucket
DROP POLICY IF EXISTS "Allow public upload to citizen-evidence" ON storage.objects;
CREATE POLICY "Allow public upload to citizen-evidence"
ON storage.objects FOR INSERT
TO public, anon, authenticated
WITH CHECK (bucket_id = 'citizen-evidence');

-- Step C: Allow viewing/reading files
DROP POLICY IF EXISTS "Allow reading citizen-evidence" ON storage.objects;
CREATE POLICY "Allow reading citizen-evidence"
ON storage.objects FOR SELECT
TO public, anon, authenticated
USING (bucket_id = 'citizen-evidence');

-- Step D: Allow updates
DROP POLICY IF EXISTS "Allow updates on citizen-evidence" ON storage.objects;
CREATE POLICY "Allow updates on citizen-evidence"
ON storage.objects FOR UPDATE
TO public, anon, authenticated
USING (bucket_id = 'citizen-evidence');

-- =====================================================================
-- DONE! Check your tables in Supabase:
-- Click "Table Editor" in left sidebar -> You will see all 5 tables!
-- =====================================================================
