-- ==============================================================================
-- Roundtable Database Schema - Phase 2 Migration
-- Tables: sessions, participants
-- ==============================================================================

-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(16) NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT 'Roundtable Discussion',
    host_participant_id UUID NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ NULL
);

-- Index for fast lookup by room_code and status
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON public.sessions (room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions (status);

-- 3. Participants Table
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    participant_identity VARCHAR(128) NOT NULL,
    device_type VARCHAR(20) NOT NULL DEFAULT 'laptop' CHECK (device_type IN ('desktop', 'laptop', 'phone', 'tablet', 'unknown')),
    preferred_caption_language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (preferred_caption_language IN ('en', 'hi', 'mr')),
    speech_language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (speech_language IN ('en', 'hi', 'mr')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at TIMESTAMPTZ NULL,
    is_guest BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uq_session_participant_identity UNIQUE (session_id, participant_identity)
);

-- Foreign key reference for host_participant_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_host_participant'
    ) THEN
        ALTER TABLE public.sessions
        ADD CONSTRAINT fk_sessions_host_participant
        FOREIGN KEY (host_participant_id)
        REFERENCES public.participants(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_session_id ON public.participants (session_id);
CREATE INDEX IF NOT EXISTS idx_participants_identity ON public.participants (participant_identity);

-- 4. Row Level Security (RLS)
-- Server-side backend uses service_role key which bypasses RLS.
-- RLS policies protect tables if accessed through Supabase client APIs directly.
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Allow read access to active sessions for anyone with the room code
CREATE POLICY "Public read active sessions by room_code"
    ON public.sessions
    FOR SELECT
    USING (status = 'active');

-- Allow read access to participants belonging to active sessions
CREATE POLICY "Read participants for session"
    ON public.participants
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.sessions
        WHERE public.sessions.id = public.participants.session_id
    ));
