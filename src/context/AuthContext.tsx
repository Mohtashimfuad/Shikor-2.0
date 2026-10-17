import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import {
  normalizeCitizenSignupErrorCode,
  type AccessRole,
  type CitizenSignupErrorCode,
  type OfficerApplicationStatus,
} from '../lib/phase1';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface DemoUser {
  email: string;
  demoPasswordLabel: string;
  fullName: string;
  role: 'citizen';
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'demo.citizen@shikor.demo',
    demoPasswordLabel: 'demo123',
    fullName: 'Demo Citizen',
    role: 'citizen',
  },
];

export interface AuthProfile {
  id: string;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  role: AccessRole;
  supabaseUser: User | null;
  isDemo: boolean;
}

export interface OfficerApplicationStatusInfo {
  id: string;
  status: Exclude<OfficerApplicationStatus, null> | 'draft';
  rejectionReason: string | null;
  submittedAt: string | null;
  createdAt: string;
}

interface CitizenSignupData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  nid: string;
  privacyConsent: boolean;
}

interface AuthContextValue {
  profile: AuthProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: string | null;
    profile: AuthProfile | null;
  }>;
  signUpCitizen: (data: CitizenSignupData) => Promise<{ error: CitizenSignupErrorCode | null }>;
  refreshProfile: () => Promise<AuthProfile | null>;
  getOfficerApplicationStatus: (userId: string) => Promise<OfficerApplicationStatusInfo | null>;
  setPassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

async function getTrustedProfile(user: User): Promise<AuthProfile | null> {
  try {
    const [{ data: profileRow, error: profileError }, { data: roleData, error: roleError }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('full_name_en, full_name_bn, phone_number')
          .eq('id', user.id)
          .maybeSingle(),
        supabase.rpc('current_access_role'),
      ]);

    if (profileError || roleError) return null;
    const role = roleData as AccessRole | null;
    if (!role || !['citizen', 'officer', 'admin'].includes(role)) return null;

    return {
      id: user.id,
      displayName:
        profileRow?.full_name_en ||
        (user.user_metadata?.full_name as string | undefined) ||
        user.email ||
        'User',
      email: user.email ?? '',
      phoneNumber: profileRow?.phone_number ?? null,
      role,
      supabaseUser: user,
      isDemo: false,
    };
  } catch {
    return null;
  }
}

async function getCitizenSignupErrorCode(error: unknown): Promise<unknown> {
  if (!error || typeof error !== 'object') return null;
  const errorRecord = error as Record<string, unknown>;
  const context = errorRecord.context;
  if (context && typeof context === 'object' && typeof (context as { clone?: unknown }).clone === 'function') {
    try {
      const body: unknown = await (context as Response).clone().json();
      if (body && typeof body === 'object' && 'error' in body) {
        return (body as { error?: unknown }).error;
      }
    } catch {
      // A malformed or unavailable error response falls back to a generic safe message.
    }
  }
  return errorRecord.name === 'FunctionsFetchError' ? 'network_error' : null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured();
  const [demoSession, setDemoSession] = useState<AuthProfile | null>(() => {
    try {
      const stored = sessionStorage.getItem('shikor_demo_session');
      if (!stored) return null;
      const parsed = JSON.parse(stored) as AuthProfile;
      return parsed.role === 'citizen' && parsed.isDemo ? parsed : null;
    } catch {
      return null;
    }
  });

  const refreshProfile = useCallback(async (): Promise<AuthProfile | null> => {
    if (isDemoMode) {
      setProfile(demoSession);
      return demoSession;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setProfile(null);
      return null;
    }
    const trustedProfile = await getTrustedProfile(data.user);
    setProfile(trustedProfile);
    return trustedProfile;
  }, [demoSession, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) {
      setProfile(demoSession);
      setLoading(false);
      return;
    }

    let mounted = true;
    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      const trustedProfile = !error && data.user ? await getTrustedProfile(data.user) : null;
      if (mounted) {
        setProfile(trustedProfile);
        setLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      } else {
        // Supabase recommends deferring follow-up Auth calls out of this callback.
        window.setTimeout(() => {
          if (mounted) void refreshProfile();
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [demoSession, isDemoMode, refreshProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (isDemoMode) {
        const match = DEMO_USERS.find(
          (candidate) =>
            candidate.email.toLowerCase() === email.trim().toLowerCase() &&
            candidate.demoPasswordLabel === password,
        );
        if (!match) return { error: 'invalid_credentials', profile: null };
        const demoProfile: AuthProfile = {
          id: 'demo-citizen',
          displayName: match.fullName,
          email: match.email,
          phoneNumber: null,
          role: 'citizen',
          supabaseUser: null,
          isDemo: true,
        };
        try {
          sessionStorage.setItem('shikor_demo_session', JSON.stringify(demoProfile));
        } catch {
          // The session still works in memory if session storage is unavailable.
        }
        setDemoSession(demoProfile);
        setProfile(demoProfile);
        return { error: null, profile: demoProfile };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error?.code === 'email_not_confirmed') return { error: 'email_verification_required', profile: null };
      if (error || !data.user) return { error: 'invalid_credentials', profile: null };

      const trustedProfile = await getTrustedProfile(data.user);
      setProfile(trustedProfile);
      if (!trustedProfile) return { error: 'email_verification_required', profile: null };
      return { error: null, profile: trustedProfile };
    },
    [isDemoMode],
  );

  const signUpCitizen = useCallback<AuthContextValue['signUpCitizen']>(
    async ({ email, password, fullName, phone, nid, privacyConsent }: CitizenSignupData) => {
      if (isDemoMode) return { error: 'registration_unavailable' };

      const { data, error } = await supabase.functions.invoke('citizen-signup', {
        body: {
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          nid: nid.trim(),
          privacyConsent,
        },
      });
      if (error || data?.ok !== true) {
        const errorCode = error ? await getCitizenSignupErrorCode(error) : data?.error;
        return { error: normalizeCitizenSignupErrorCode(errorCode) };
      }
      return { error: null };
    },
    [isDemoMode],
  );

  const getOfficerApplicationStatus = useCallback(async (userId: string) => {
    if (isDemoMode) return null;
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user || authData.user.id !== userId) return null;
    const { data, error } = await supabase
      .from('officer_applications')
      .select('id, status, rejection_reason, submitted_at, created_at')
      .eq('applicant_id', authData.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id as string,
      status: data.status as OfficerApplicationStatusInfo['status'],
      rejectionReason: data.rejection_reason as string | null,
      submittedAt: data.submitted_at as string | null,
      createdAt: data.created_at as string,
    };
  }, [isDemoMode]);

  const setPassword = useCallback(async (password: string) => {
    if (isDemoMode) return { error: 'password_setup_unavailable' };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? 'password_setup_failed' : null };
  }, [isDemoMode]);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      try {
        sessionStorage.removeItem('shikor_demo_session');
      } catch {
        // Ignore storage cleanup failures.
      }
      setDemoSession(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setProfile(null);
  }, [isDemoMode]);

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        isDemoMode,
        signIn,
        signUpCitizen,
        refreshProfile,
        getOfficerApplicationStatus,
        setPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
