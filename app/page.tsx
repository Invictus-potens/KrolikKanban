
'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BoardView from '@/components/board/BoardView';

export default function Home() {
  const { user, setUser, theme } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular usuário logado para desenvolvimento
    const simulateUser = () => {
      const mockUser = {
        id: '1',
        email: 'usuario@exemplo.com',
        user_metadata: {
          name: 'Usuário Exemplo'
        }
      };
      setUser(mockUser as any);
      setIsLoading(false);
    };

    // Tentar conectar ao Supabase, se falhar, usar dados simulados
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          simulateUser();
        }
      } catch (error) {
        console.log('Usando dados simulados para desenvolvimento');
        simulateUser();
      }
      setIsLoading(false);
    };

    checkUser();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.log('Supabase não configurado, usando modo desenvolvimento');
    }
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Redirect to auth if not logged in (desabilitado para desenvolvimento)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Bem-vindo ao Kanban</h1>
          <p className="text-gray-400 mb-6">Configure o Supabase para usar a autenticação</p>
          <button
            onClick={() => {
              const mockUser = {
                id: '1',
                email: 'usuario@exemplo.com',
                user_metadata: { name: 'Usuário Exemplo' }
              };
              setUser(mockUser as any);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continuar como Convidado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16">
        <BoardView />
      </main>
    </div>
  );
}
