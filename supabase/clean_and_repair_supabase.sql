-- ==============================================================================
-- SeedIQ Database Cleanup, Policy Repair & Auto-Confirmation Script
-- Target Supabase Project: cqcdfvetexaqqcfogcds (https://cqcdfvetexaqqcfogcds.supabase.co)
-- Execution Location: Supabase Dashboard -> SQL Editor (Run this once)
-- ==============================================================================

-- 1. UNBLOCK ALL REGISTERED USERS (Instantly marks all emails as confirmed)
-- This eliminates the "Email not confirmed" error when signing in!
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. FIX 42P17 INFINITE RECURSION IN PROFILES TABLE RLS POLICIES
-- Drop any recursive policies on public.profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_allow_all" ON public.profiles;

-- Create clean, non-recursive public.profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_all" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

-- 3. ENSURE ALL TABLES EXIST WITH NON-RECURSIVE POLICIES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'Farmer' CHECK (role IN ('Admin', 'Researcher', 'Farmer', 'Guest')),
    provider TEXT DEFAULT 'email',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    prediction_type TEXT NOT NULL CHECK (prediction_type IN ('crop', 'yield', 'seed', 'storage', 'quantum')),
    inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    results JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "predictions_select_all" ON public.predictions;
DROP POLICY IF EXISTS "predictions_insert_all" ON public.predictions;

CREATE POLICY "predictions_select_all" ON public.predictions
    FOR SELECT USING (true);

CREATE POLICY "predictions_insert_all" ON public.predictions
    FOR INSERT WITH CHECK (true);

-- 4. CREATE DATASETS STORAGE BUCKET (IF NOT ALREADY CREATED)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'seediq-datasets',
    'seediq-datasets',
    true,
    52428800,
    ARRAY['text/csv', 'application/json', 'application/vnd.ms-excel', 'text/plain']
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Storage policies for seediq-datasets
DROP POLICY IF EXISTS "storage_datasets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_datasets_insert" ON storage.objects;

CREATE POLICY "storage_datasets_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'seediq-datasets');

CREATE POLICY "storage_datasets_insert" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'seediq-datasets');

CREATE POLICY "storage_datasets_update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'seediq-datasets');

-- 5. AUTO-CREATE PROFILE TRIGGER FOR NEW SIGNUPS
-- Ensures every new user registered in Supabase auth automatically gets a row in public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, display_name, role, provider)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Farmer'),
        'supabase'
    )
    ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success check
SELECT 'SeedIQ database clean, unblocked, and ready!' AS status;
