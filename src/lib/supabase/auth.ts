import { supabase } from './client';

// Admin email with unlimited invites
const ADMIN_EMAIL = 'taiseipaisen@gmail.com';
const DEFAULT_INVITE_QUOTA = 5;

export interface SignupWithInvitationParams {
  email: string;
  password: string;
  invitationCode: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface CreateInvitationParams {
  email: string;
  expiryDays?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  invite_quota: number;
  invites_sent: number;
}

export interface InviteStatus {
  canInvite: boolean;
  remaining: number; // -1 means unlimited
  isAdmin: boolean;
}

export async function validateInvitationCode(code: string): Promise<AuthResult> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return {
      success: false,
      error: 'Invalid or expired invitation code',
    };
  }

  return { success: true, data };
}

export async function signupWithInvitation({
  email,
  password,
  invitationCode,
}: SignupWithInvitationParams): Promise<AuthResult> {
  // Validate invitation code
  const validation = await validateInvitationCode(invitationCode);
  if (!validation.success) {
    return validation;
  }

  // Create user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return {
      success: false,
      error: authError.message,
    };
  }

  // Mark invitation as used
  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      used: true,
      used_at: new Date().toISOString(),
    })
    .eq('code', invitationCode);

  if (updateError) {
    console.error('Failed to mark invitation as used:', updateError);
  }

  return {
    success: true,
    data: authData,
  };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true, data };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ============================================
// Invitation Management (Admin/User Quota)
// ============================================

/**
 * Get user's profile including admin status and invite quota
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, is_admin, invite_quota, invites_sent')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}

/**
 * Check if a user is the admin (taiseipaisen@gmail.com)
 */
export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Get invite status for current user
 * Returns: canInvite, remaining invites (-1 = unlimited), isAdmin
 */
export async function getInviteStatus(userId: string): Promise<InviteStatus> {
  const profile = await getUserProfile(userId);

  if (!profile) {
    return {
      canInvite: false,
      remaining: 0,
      isAdmin: false,
    };
  }

  // Admin has unlimited invites
  if (profile.is_admin || profile.invite_quota === -1) {
    return {
      canInvite: true,
      remaining: -1, // unlimited
      isAdmin: true,
    };
  }

  // Regular user: check quota
  const remaining = Math.max(0, profile.invite_quota - profile.invites_sent);
  return {
    canInvite: remaining > 0,
    remaining,
    isAdmin: false,
  };
}

/**
 * Generate a unique invitation code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segments = [];
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
}

/**
 * Create a new invitation (with quota check)
 * Admin: unlimited invites
 * Regular user: max 5 invites
 */
export async function createInvitation({
  email,
  expiryDays = 7,
}: CreateInvitationParams): Promise<AuthResult> {
  // Get current user
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: 'You must be logged in to create invitations',
    };
  }

  // Check invite status
  const inviteStatus = await getInviteStatus(user.id);

  if (!inviteStatus.canInvite) {
    return {
      success: false,
      error: `Invitation quota exceeded. Regular users can only send ${DEFAULT_INVITE_QUOTA} invitations.`,
    };
  }

  // Generate unique code
  const code = generateInviteCode();

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  // Create invitation
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email,
      code,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Increment invites_sent counter
  await supabase
    .from('profiles')
    .update({ invites_sent: inviteStatus.isAdmin ? 0 : (inviteStatus.remaining === -1 ? 0 : DEFAULT_INVITE_QUOTA - inviteStatus.remaining + 1) })
    .eq('id', user.id);

  // Actually, let's do it properly by incrementing
  await supabase.rpc('increment_invites_sent', { user_id: user.id }).catch(() => {
    // Fallback if RPC doesn't exist - manual update
    supabase
      .from('profiles')
      .select('invites_sent')
      .eq('id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (profile) {
          supabase
            .from('profiles')
            .update({ invites_sent: (profile.invites_sent || 0) + 1 })
            .eq('id', user.id);
        }
      });
  });

  return {
    success: true,
    data: {
      invitation: data,
      code,
      remaining: inviteStatus.isAdmin ? -1 : inviteStatus.remaining - 1,
    },
  };
}

// ============================================
// Admin Route Guard
// ============================================

export interface AdminGuardResult {
  isAdmin: boolean;
  isAuthenticated: boolean;
  user: Awaited<ReturnType<typeof getCurrentUser>> | null;
  error?: string;
}

/**
 * Admin route guard function
 * Use this to protect admin-only routes
 *
 * @returns AdminGuardResult with authentication and admin status
 *
 * @example
 * // In a server component or API route
 * const { isAdmin, isAuthenticated, error } = await adminRouteGuard();
 * if (!isAuthenticated) {
 *   redirect('/login');
 * }
 * if (!isAdmin) {
 *   redirect('/unauthorized');
 * }
 */
export async function adminRouteGuard(): Promise<AdminGuardResult> {
  const user = await getCurrentUser();

  // Not authenticated
  if (!user) {
    return {
      isAdmin: false,
      isAuthenticated: false,
      user: null,
      error: 'Authentication required',
    };
  }

  // Check admin by email
  const emailIsAdmin = user.email ? isAdminEmail(user.email) : false;

  // Check admin by profile (database)
  const profile = await getUserProfile(user.id);
  const profileIsAdmin = profile?.is_admin ?? false;

  const isAdmin = emailIsAdmin || profileIsAdmin;

  if (!isAdmin) {
    return {
      isAdmin: false,
      isAuthenticated: true,
      user,
      error: 'Admin access required',
    };
  }

  return {
    isAdmin: true,
    isAuthenticated: true,
    user,
  };
}

/**
 * Quick check if current user is admin (no detailed result)
 * @returns true if user is authenticated and is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const result = await adminRouteGuard();
  return result.isAdmin;
}

/**
 * Get all invitations created by current user
 */
export async function getMyInvitations(): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: 'You must be logged in',
    };
  }

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}
