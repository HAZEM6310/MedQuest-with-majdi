// FIXED: Use `id` instead of `user_id` for profiles table inserts/updates!

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';
import { cleanupAuthState } from '@/utils/authCleanup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, voucherCode?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkDeviceSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@medquest.com';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(async () => {
            await fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);

    return btoa(
      navigator.userAgent +
      navigator.language +
      screen.width + 'x' + screen.height +
      new Date().getTimezoneOffset() +
      canvas.toDataURL()
    ).slice(0, 50);
  };

  const checkDeviceSession = async (): Promise<boolean> => {
    if (!user) return false;

    const fingerprint = generateDeviceFingerprint();

    try {
      const { data: existingSession } = await supabase
        .from('device_sessions')
        .select('*')
        .eq('user_id', user.id) // device_sessions uses user_id
        .eq('is_active', true)
        .single();

      if (existingSession) {
        if (existingSession.device_fingerprint === fingerprint) {
          await supabase
            .from('device_sessions')
            .update({ last_active: new Date().toISOString() })
            .eq('id', existingSession.id);
          return true;
        } else {
          return false;
        }
      } else {
        await supabase
          .from('device_sessions')
          .upsert({
            user_id: user.id,
            device_fingerprint: fingerprint,
            is_active: true,
            last_active: new Date().toISOString()
          });
        return true;
      }
    } catch (error) {
      console.error('Device session check failed:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.user) {
        window.location.href = '/';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, voucherCode?: string) => {
    setIsLoading(true);
    try {
      cleanupAuthState();

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            voucher_code: voucherCode || null,
          },
        },
      });

      if (error) throw error;

      // Insert profile row using `id` (NOT user_id)
      if (data.user) {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            voucher_code: voucherCode || null,
            credits: 0
          });
      }

      if (email === ADMIN_EMAIL && data.user) {
        setTimeout(async () => {
          await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', data.user!.id);
        }, 1000);
      }

      if (voucherCode && data.user) {
        const voucherData = {
          userId: data.user.id,
          voucherCode: voucherCode.toUpperCase(),
          linkedAt: new Date().toISOString(),
        };

        const existingVouchers = JSON.parse(localStorage.getItem('voucherLinks') || '[]');
        existingVouchers.push(voucherData);
        localStorage.setItem('voucherLinks', JSON.stringify(existingVouchers));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      if (user) {
        await supabase
          .from('device_sessions')
          .update({ is_active: false })
          .eq('user_id', user.id); // device_sessions uses user_id
      }
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {}
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      checkDeviceSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}