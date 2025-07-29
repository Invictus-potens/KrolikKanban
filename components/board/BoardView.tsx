
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import ListColumn from './ListColumn';
import { Plus } from 'lucide-react';

interface List {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  assigned_user_id?: string;
  labels: Label[];
}

interface Label {
  id: string;
  name: string;
  color: string;
}

export default function BoardView() {
  const { currentBoard, theme } = useStore();
  const [lists, setLists] = useState<List[]>([
    {
      id: '1',
      title: 'A Fazer',
      position: 0,
      cards: [
        {
          id: '1',
          title: 'Configurar autenticação',
          description: 'Implementar sistema de login com Supabase',
          position: 0,
          due_date: '2024-12-25',
          labels: [{ id: '1', name: 'Urgente', color: '#EF4444' }]
        },
        {
          id: '2',
          title: 'Criar interface do usuário',
          description: 'Design responsivo para dispositivos móveis',
          position: 1,
          labels: [{ id: '2', name: 'Design', color: '#8B5CF6' }]
        }
      ]
    },
    {
      id: '2',
      title: 'Em Progresso',
      position: 1,
      cards: [
        {
          id: '3',
          title: 'Implementar drag and drop',
          description: 'Funcionalidade de arrastar e soltar cards',
          position: 0,
          labels: [{ id: '3', name: 'Desenvolvimento', color: '#10B981' }]
        }
      ]
    },
    {
      id: '3',
      title: 'Concluído',
      position: 2,
      cards: [
        {
          id: '4',
          title: 'Setup inicial do projeto',
          description: 'Configuração do Next.js e Tailwind',
          position: 0,
          labels: [{ id: '4', name: 'Concluído', color: '#10B981' }]
        }
      ]
    }
  ]);
  const [showNewList, setShowNewList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);

  const createList = async () => {
    if (!newListTitle.trim()) return;

    const newList = {
      id: `list-${Date.now()}`,
      title: newListTitle,
      position: lists.length,
      cards: []
    };

    setLists([...lists, newList]);
    setNewListTitle('');
    setShowNewList(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = lists
      .flatMap(list => list.cards)
      .find(card => card.id === active.id);
    setDraggedCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeList = lists.find(list => 
      list.cards.some(card => card.id === activeId)
    );
    const overList = lists.find(list => 
      list.id === overId || list.cards.some(card => card.id === overId)
    );

    if (!activeList || !overList) return;

    if (activeList.id !== overList.id) {
      setLists(lists => {
        const activeCardIndex = activeList.cards.findIndex(card => card.id === activeId);
        const activeCard = activeList.cards[activeCardIndex];
        
        const newActiveLists = activeList.cards.filter(card => card.id !== activeId);
        const newOverCards = [...overList.cards, activeCard];

        return lists.map(list => {
          if (list.id === activeList.id) {
            return { ...list, cards: newActiveLists };
          }
          if (list.id === overList.id) {
            return { ...list, cards: newOverCards };
          }
          return list;
        });
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggedCard(null);
  };

  const updateLists = () => {
    // Força re-render das listas
    setLists([...lists]);
  };

  if (!currentBoard) {
    return (
      <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2}`}>
            Selecione um quadro para começar
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Escolha um quadro da barra lateral ou crie um novo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'} p-6 min-h-screen`}>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-h-full overflow-x-auto">
          <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                onUpdateList={updateLists}
              />
            ))}
          </SortableContext>

          <div className="flex-shrink-0 w-72">
            {showNewList ? (
              <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg p-4 shadow-sm`}>
                <input
                  type="text"
                  placeholder="Digite o título da lista..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createList()}
                  className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500`}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={createList}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Adicionar Lista
                  </button>
                  <button
                    onClick={() => setShowNewList(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewList(true)}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700'} border-2 border-dashed ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'}`}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Adicionar outra lista</span>
              </button>
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
