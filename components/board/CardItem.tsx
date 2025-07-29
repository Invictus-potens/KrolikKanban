
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, User, MessageCircle, Paperclip, CheckSquare } from 'lucide-react';
import CardModal from './CardModal';
import type { Database } from '@/lib/supabase';

type KanbanCard = Database['public']['Tables']['kanban_cards']['Row'];

interface CardItemProps {
  card: KanbanCard;
}

export default function CardItem({ card }: CardItemProps) {
  const [showModal, setShowModal] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getDueDateColor = () => {
    if (!card.due_date) return '';
    
    const dueDate = new Date(card.due_date);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return 'text-red-500 bg-red-50';
    } else if (isToday(dueDate)) {
      return 'text-orange-500 bg-orange-50';
    } else if (isTomorrow(dueDate)) {
      return 'text-yellow-500 bg-yellow-50';
    }
    return 'text-gray-500 bg-gray-50';
  };

  const formatDueDate = () => {
    if (!card.due_date) return '';
    
    const dueDate = new Date(card.due_date);
    if (isToday(dueDate)) return 'Hoje';
    if (isTomorrow(dueDate)) return 'Amanhã';
    return format(dueDate, 'dd/MM');
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowModal(true)}
        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      >
        <h4 className="font-medium text-gray-900 mb-2">
          {card.title}
        </h4>

        {card.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {card.due_date && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDueDateColor()}`}>
            <Calendar className="w-3 h-3" />
            {formatDueDate()}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {card.assigned_user_id && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>Atribuído</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {card.attachments && card.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Paperclip className="w-3 h-3" />
                <span>{card.attachments.length}</span>
              </div>
            )}
            
            {card.comments && card.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageCircle className="w-3 h-3" />
                <span>{card.comments.length}</span>
              </div>
            )}
            
            {card.checklist_items && card.checklist_items.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CheckSquare className="w-3 h-3" />
                <span>{card.checklist_items.filter(item => item.completed).length}/{card.checklist_items.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CardModal
          card={card}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
