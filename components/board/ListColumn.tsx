
'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { kanbanService } from '@/lib/services';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import CardItem from './CardItem';
import { Plus, MoreHorizontal } from 'lucide-react';
import type { Database } from '@/lib/supabase';

type KanbanColumn = Database['public']['Tables']['kanban_columns']['Row'];
type KanbanCard = Database['public']['Tables']['kanban_cards']['Row'];

interface ListColumnProps {
  column: KanbanColumn;
  cards: KanbanCard[];
}

export default function ListColumn({ column, cards }: ListColumnProps) {
  const { addKanbanCard, removeKanbanColumn } = useAppStore();
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
  });

  const createCard = async () => {
    if (!newCardTitle.trim()) return;

    try {
      const newCard = await kanbanService.createCard(column.id, newCardTitle);
      addKanbanCard(column.id, newCard);
      setNewCardTitle('');
      setShowNewCard(false);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const deleteColumn = async () => {
    try {
      await kanbanService.deleteColumn(column.id);
      removeKanbanColumn(column.id);
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  return (
    <div
      ref={setDroppableRef}
      className="flex-shrink-0 w-72 bg-white rounded-lg p-4 shadow-sm min-h-full flex flex-col border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {column.title}
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={deleteColumn}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Excluir Coluna
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>

      {showNewCard ? (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Digite o título do card..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createCard()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={createCard}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setShowNewCard(false);
                setNewCardTitle('');
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewCard(true)}
          className="mt-4 w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Adicionar Card</span>
        </button>
      )}
    </div>
  );
}
