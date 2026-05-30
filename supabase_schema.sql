-- Supabase SQL Database Schema
-- Run this in your Supabase SQL Editor to set up tables, triggers, and Row Level Security (RLS)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Business')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    script TEXT NOT NULL,
    video_style TEXT NOT NULL DEFAULT 'Corporate',
    voice TEXT NOT NULL DEFAULT '21m00Tcm4TlvDq8ikWAM', -- Default ElevenLabs Rachel Voice ID
    aspect_ratio TEXT NOT NULL DEFAULT '16:9',
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Generating', 'Completed', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own projects"
    ON public.projects FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. SCENES TABLE
CREATE TABLE IF NOT EXISTS public.scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    scene_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    narration TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('video', 'image')),
    thumbnail TEXT,
    audio_url TEXT,
    duration NUMERIC NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for scenes
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage scenes of their own projects"
    ON public.scenes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.scenes.project_id
            AND public.projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.scenes.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 5. SUBTITLES TABLE
CREATE TABLE IF NOT EXISTS public.subtitles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
    start_time NUMERIC NOT NULL DEFAULT 0.0,
    end_time NUMERIC NOT NULL DEFAULT 0.0,
    text TEXT NOT NULL
);

-- Enable RLS for subtitles
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage subtitles of their own scenes"
    ON public.subtitles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.scenes
            JOIN public.projects ON public.projects.id = public.scenes.project_id
            WHERE public.scenes.id = public.subtitles.scene_id
            AND public.projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.scenes
            JOIN public.projects ON public.projects.id = public.scenes.project_id
            WHERE public.scenes.id = public.subtitles.scene_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 6. EXPORTS TABLE
CREATE TABLE IF NOT EXISTS public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    resolution TEXT NOT NULL,
    file_size TEXT,
    duration NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for exports
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage exports of their own projects"
    ON public.exports FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.exports.project_id
            AND public.projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE public.projects.id = public.exports.project_id
            AND public.projects.user_id = auth.uid()
        )
    );

-- 7. AUTO-SYNC AUTH USERS TRIGGER
-- This function automatically creates a record in the public users table when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, plan)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        new.email,
        'Free'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
