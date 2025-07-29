
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/components/auth/AuthProvider';
import { kanbanService } from '@/lib/services';
import { X, Calendar, User, Tag, MessageCircle, CheckSquare, Paperclip, Activity, Edit2, Trash2, AtSign, Plus, Clock, AlertCircle } from 'lucide-react';
import type { Database } from '@/lib/supabase';

type KanbanCard = Database['public']['Tables']['kanban_cards']['Row'];

interface CardModalProps {
  card: KanbanCard;
  onClose: () => void;
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const { user } = useAuth();
  const { updateKanbanCard, removeKanbanCard } = useAppStore();
  
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.due_date || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateCard = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedCard = await kanbanService.updateCard(card.id, {
        title,
        description,
        due_date: dueDate || null
      });
      
      updateKanbanCard(card.id, updatedCard);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCard = async () => {
    if (!user) return;
    
    try {
      await kanbanService.deleteCard(card.id);
      removeKanbanCard(card.id);
      onClose();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDueDateColor = () => {
    if (!card.due_date) return '';
    
    const dueDate = new Date(card.due_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate < today) {
      return 'text-red-500 bg-red-50';
    } else if (dueDate.toDateString() === today.toDateString()) {
      return 'text-orange-500 bg-orange-50';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'text-yellow-500 bg-yellow-50';
    }
    return 'text-gray-500 bg-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Card</h2>
              <p className="text-sm text-gray-500">ID: {card.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={deleteCard}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="mb-6">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-semibold text-gray-900 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                placeholder="Título do card..."
              />
            ) : (
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            )}
          </div>

          {/* Due Date */}
          {card.due_date && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Data de vencimento:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getDueDateColor()}`}>
                  {formatDueDate(card.due_date)}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Descrição</h4>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Adicione uma descrição..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {description ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
                ) : (
                  <p className="text-gray-500 italic">Nenhuma descrição</p>
                )}
              </div>
            )}
          </div>

          {/* Due Date Editor */}
          {isEditing && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Data de Vencimento</h4>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Card Info */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Criado em:</span>
              <p>{new Date(card.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <span className="font-medium">Atualizado em:</span>
              <p>{new Date(card.updated_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={updateCard}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
