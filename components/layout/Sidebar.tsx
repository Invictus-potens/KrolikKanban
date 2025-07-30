
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Plus, Settings, Search, Users, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import MembersModal from '@/components/board/MembersModal';
import SettingsModal from '@/components/board/SettingsModal';

interface Board {
  id: string;
  title: string;
  background_color: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

export default function Sidebar() {
  const { user, theme, currentBoard, setCurrentBoard } = useStore();
  const [boards, setBoards] = useState<Board[]>([
    { id: '1', title: 'Projeto Principal', background_color: '#3B82F6' },
    { id: '2', title: 'Desenvolvimento', background_color: '#10B981' },
    { id: '3', title: 'Marketing', background_color: '#F59E0B' },
  ]);
  const [labels, setLabels] = useState<Label[]>([
    { id: '1', name: 'Urgente', color: '#EF4444' },
    { id: '2', name: 'Em Progresso', color: '#F59E0B' },
    { id: '3', name: 'Revisão', color: '#8B5CF6' },
    { id: '4', name: 'Concluído', color: '#10B981' },
  ]);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    if (user) {
      // Definir primeiro board como padrão se nenhum estiver selecionado
      if (!currentBoard && boards.length > 0) {
        setCurrentBoard(boards[0].id);
      }
    }
  }, [user, currentBoard, setCurrentBoard, boards]);

  const createBoard = async () => {
    if (!newBoardTitle.trim()) return;

    const newBoard = {
      id: `board-${Date.now()}`,
      title: newBoardTitle,
      background_color: '#3B82F6'
    };

    setBoards([newBoard, ...boards]);
    setNewBoardTitle('');
    setShowNewBoard(false);
    setCurrentBoard(newBoard.id);
  };

  return (
    <>
      <div className={`fixed left-0 top-0 h-full w-64 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} border-r ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} p-4 overflow-y-auto z-30`}>
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kanban</h1>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Quadros</h2>
              <button
                onClick={() => setShowNewBoard(true)}
                className={`w-5 h-5 rounded ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} flex items-center justify-center`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showNewBoard && (
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Título do quadro"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createBoard()}
                  className={`w-full px-3 py-2 text-sm rounded-lg ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none`}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={createBoard}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Criar
                  </button>
                  <button
                    onClick={() => setShowNewBoard(false)}
                    className={`px-3 py-1 text-sm rounded ${theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => setCurrentBoard(board.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    currentBoard === board.id
                      ? `${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                      : `${theme === 'dark' ? 'hover:bg-slate-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`
                  }`}
                >
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: board.background_color }} />
                  <span className="text-sm font-medium">{board.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>Etiquetas</h2>
            <div className="space-y-1">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-2 px-3 py-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{label.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Calendário</span>
              </button>
              <button
                onClick={() => setShowMembersModal(true)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Membros</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        boardId={currentBoard || ''}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        boardId={currentBoard || ''}
      />
    </>
  );
}
