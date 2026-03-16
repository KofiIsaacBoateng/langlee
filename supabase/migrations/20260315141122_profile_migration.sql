CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    full_name TEXT,
    chinese_level TEXT,
    motivations TEXT[],
    interests TEXT[],
    onboarding_completed BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; -- secure

/*  POLICIES */
CREATE POLICY "Users can READ own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id); --Users can only read their own profile not others'

CREATE POLICY "Users can INSERT own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id); --Users can add to their own profile

CREATE POLICY "Users can UPDATE own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id); --Users can make changes to their own profile 


/* PERMISSIONS */
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
REVOKE INSERT ON TABLE public.profiles FROM authenticated;

GRANT SELECT ON TABLE public.profiles TO authenticated;

GRANT INSERT (
    id,
    full_name,
    chinese_level,
    motivations,
    interests,
    onboarding_completed,
    updated_at,
    is_premium,
    premium_expires_at
) ON TABLE public.profiles TO authenticated;

GRANT UPDATE (
    id,
    full_name,
    chinese_level,
    motivations,
    interests,
    onboarding_completed,
    updated_at,
    is_premium,
    premium_expires_at
) ON TABLE public.profiles TO authenticated;