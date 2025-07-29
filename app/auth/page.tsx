'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthForm } from '@/components/auth/AuthForm';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Bem-vindo ao KrolikKanban
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Organize suas tarefas, notas e projetos em um só lugar
          </p>
        </div>

        <AuthForm onSubmit={handleAuth} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
