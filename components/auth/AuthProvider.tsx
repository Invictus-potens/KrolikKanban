'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { userService } from '@/lib/services';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser } = useAppStore();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        try {
          const profile = await userService.getCurrentUser();
          setUserProfile(profile);
          setStoreUser(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profile = await userService.getCurrentUser();
            setUserProfile(profile);
            setStoreUser(profile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserProfile(null);
            setStoreUser(null);
          }
        } else {
          setUserProfile(null);
          setStoreUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setStoreUser]);

  const value = {
    user,
    userProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}