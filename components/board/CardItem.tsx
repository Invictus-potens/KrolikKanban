
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, User, MessageCircle, Paperclip, CheckSquare } from 'lucide-react';
import CardModal from './CardModal';

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

interface CardItemProps {
  card: Card;
  onUpdateCard: () => void;
}

export default function CardItem({ card, onUpdateCard }: CardItemProps) {
  const { theme } = useStore();
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
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    return format(dueDate, 'MMM d');
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowModal(true)}
        className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg p-3 shadow-sm border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} cursor-pointer hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
      >
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
          {card.title}
        </h4>

        {card.description && (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2`}>
            {card.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {card.due_date && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDueDateColor()}`}>
                <Calendar className="w-3 h-3" />
                {formatDueDate()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MessageCircle className="w-3 h-3" />
              <span>2</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CheckSquare className="w-3 h-3" />
              <span>1/3</span>
            </div>
            {card.assigned_user_id && (
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CardModal
          card={card}
          onClose={() => setShowModal(false)}
          onUpdate={onUpdateCard}
        />
      )}
    </>
  );
}
