
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import CardItem from './CardItem';
import { Plus, MoreHorizontal } from 'lucide-react';

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

interface List {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}

interface ListColumnProps {
  list: List;
  onUpdateList: () => void;
}

export default function ListColumn({ list, onUpdateList }: ListColumnProps) {
  const { theme } = useStore();
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: list.id,
  });

  const createCard = async () => {
    if (!newCardTitle.trim()) return;

    const { data, error } = await supabase
      .from('cards')
      .insert([{
        title: newCardTitle,
        list_id: list.id,
        position: list.cards.length
      }])
      .select()
      .single();

    if (data) {
      setNewCardTitle('');
      setShowNewCard(false);
      onUpdateList();
    }
  };

  const deleteList = async () => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', list.id);

    if (!error) {
      onUpdateList();
    }
  };

  return (
    <div
      ref={setDroppableRef}
      className={`flex-shrink-0 w-72 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg p-4 shadow-sm min-h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {list.title}
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-1 rounded hover:${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}
          >
            <MoreHorizontal className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>

          {showMenu && (
            <div className={`absolute right-0 top-full mt-1 w-48 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-lg border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} py-2 z-10`}>
              <button
                onClick={deleteList}
                className={`w-full px-4 py-2 text-left text-sm ${theme === 'dark' ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}
              >
                Delete List
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {list.cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onUpdateCard={onUpdateList}
          />
        ))}
      </div>

      {showNewCard ? (
        <div className="space-y-3">
          <textarea
            placeholder="Enter a title for this card..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && createCard()}
            className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={createCard}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add Card
            </button>
            <button
              onClick={() => setShowNewCard(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewCard(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} w-full`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add a card</span>
        </button>
      )}
    </div>
  );
}
