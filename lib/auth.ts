
import { supabase, isSupabaseConfigured } from './supabase';

export const signUp = async (email: string, password: string, name: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
