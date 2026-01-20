-- Mobile First Game Platform - Supabase Auth Schema
-- Invitation-only signup system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin email constant (used in functions)
-- Admin: taiseipaisen@gmail.com gets UNLIMITED invites
-- Regular users: Max 5 invites

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    invite_quota INTEGER DEFAULT 5,
    invites_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations table for invitation-only signup
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Index for faster invitation code lookup
CREATE INDEX IF NOT EXISTS idx_invitations_code ON public.invitations(code);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Invitations: Only admins can create/view, anyone can validate
CREATE POLICY "Invitations validation is public"
    ON public.invitations FOR SELECT
    USING (true);

-- Function to auto-create profile on user signup
-- Admin email gets unlimited invites (is_admin = true, invite_quota = -1)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    admin_email CONSTANT VARCHAR := 'taiseipaisen@gmail.com';
    user_is_admin BOOLEAN;
    user_quota INTEGER;
BEGIN
    -- Check if this user is the admin
    user_is_admin := (NEW.email = admin_email);

    -- Admin gets unlimited (-1), regular users get 5
    IF user_is_admin THEN
        user_quota := -1;  -- -1 means unlimited
    ELSE
        user_quota := 5;
    END IF;

    INSERT INTO public.profiles (id, username, email, is_admin, invite_quota, invites_sent)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
        NEW.email,
        user_is_admin,
        user_quota,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to check if user can create invitations
CREATE OR REPLACE FUNCTION public.can_create_invitation(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_quota INTEGER;
    user_sent INTEGER;
    user_is_admin BOOLEAN;
BEGIN
    SELECT invite_quota, invites_sent, is_admin
    INTO user_quota, user_sent, user_is_admin
    FROM public.profiles
    WHERE id = user_id;

    -- Admin has unlimited invites (quota = -1)
    IF user_is_admin OR user_quota = -1 THEN
        RETURN TRUE;
    END IF;

    -- Regular user: check quota
    RETURN user_sent < user_quota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining invites for a user
CREATE OR REPLACE FUNCTION public.get_remaining_invites(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_quota INTEGER;
    user_sent INTEGER;
    user_is_admin BOOLEAN;
BEGIN
    SELECT invite_quota, invites_sent, is_admin
    INTO user_quota, user_sent, user_is_admin
    FROM public.profiles
    WHERE id = user_id;

    -- Admin has unlimited invites
    IF user_is_admin OR user_quota = -1 THEN
        RETURN -1;  -- -1 indicates unlimited
    END IF;

    RETURN GREATEST(0, user_quota - user_sent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create invitation with quota check
CREATE OR REPLACE FUNCTION public.create_invitation(
    inviter_id UUID,
    invitee_email VARCHAR,
    invitation_code VARCHAR,
    expiry_days INTEGER DEFAULT 7
)
RETURNS JSON AS $$
DECLARE
    can_invite BOOLEAN;
    new_invitation_id UUID;
    result JSON;
BEGIN
    -- Check if user can create invitation
    can_invite := public.can_create_invitation(inviter_id);

    IF NOT can_invite THEN
        RETURN json_build_object(
            'success', FALSE,
            'error', 'Invitation quota exceeded. Maximum 5 invitations allowed.'
        );
    END IF;

    -- Create the invitation
    INSERT INTO public.invitations (email, code, expires_at, created_by)
    VALUES (
        invitee_email,
        invitation_code,
        NOW() + (expiry_days || ' days')::INTERVAL,
        inviter_id
    )
    RETURNING id INTO new_invitation_id;

    -- Increment invites_sent counter
    UPDATE public.profiles
    SET invites_sent = invites_sent + 1
    WHERE id = inviter_id;

    RETURN json_build_object(
        'success', TRUE,
        'invitation_id', new_invitation_id,
        'code', invitation_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can create invitations if they have quota
CREATE POLICY "Users can create invitations with quota"
    ON public.invitations FOR INSERT
    WITH CHECK (public.can_create_invitation(auth.uid()));

-- RPC function to increment invites_sent (callable from client)
CREATE OR REPLACE FUNCTION public.increment_invites_sent(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET invites_sent = invites_sent + 1
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample invitation (for testing - remove in production)
-- INSERT INTO public.invitations (email, code, expires_at)
-- VALUES ('test@example.com', 'INVITE-TEST-2024', NOW() + INTERVAL '7 days');
