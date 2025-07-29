
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/components/auth/AuthProvider';
import { kanbanService } from '@/lib/services';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import ListColumn from './ListColumn';
import { Plus } from 'lucide-react';
import type { Database } from '@/lib/supabase';

type KanbanBoard = Database['public']['Tables']['kanban_boards']['Row'];
type KanbanColumn = Database['public']['Tables']['kanban_columns']['Row'];
type KanbanCard = Database['public']['Tables']['kanban_cards']['Row'];

export default function BoardView() {
  const { user } = useAuth();
  const { 
    kanbanBoards, 
    kanbanColumns, 
    kanbanCards,
    selectedBoard,
    setSelectedBoard,
    setKanbanColumns,
    setKanbanCards,
    moveKanbanCard
  } = useAppStore();
  
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);

  // Load board data when component mounts
  useEffect(() => {
    if (user && selectedBoard) {
      loadBoardData();
    }
  }, [user, selectedBoard]);

  const loadBoardData = async () => {
    if (!selectedBoard) return;
    
    try {
      const [columnsData, cardsData] = await Promise.all([
        kanbanService.getColumns(selectedBoard),
        // We'll load cards for each column separately
        Promise.resolve([])
      ]);

      setKanbanColumns(selectedBoard, columnsData);
      
      // Load cards for each column
      for (const column of columnsData) {
        const columnCards = await kanbanService.getCards(column.id);
        setKanbanCards(column.id, columnCards);
      }
    } catch (error) {
      console.error('Error loading board data:', error);
    }
  };

  const createColumn = async () => {
    if (!newColumnTitle.trim() || !selectedBoard) return;

    try {
      const newColumn = await kanbanService.createColumn(selectedBoard, newColumnTitle);
      setKanbanColumns(selectedBoard, [...(kanbanColumns[selectedBoard] || []), newColumn]);
      setNewColumnTitle('');
      setShowNewColumn(false);
    } catch (error) {
      console.error('Error creating column:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCardById(active.id as string);
    setDraggedCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const activeCard = findCardById(active.id as string);
    const overColumnId = over.id as string;

    if (activeCard && activeCard.column_id !== overColumnId) {
      // Move card to different column
      const newCards = kanbanCards[overColumnId] || [];
      const updatedCard = { ...activeCard, column_id: overColumnId };
      
      setKanbanCards(overColumnId, [...newCards, updatedCard]);
      
      // Remove from old column
      const oldColumnCards = kanbanCards[activeCard.column_id] || [];
      setKanbanCards(activeCard.column_id, oldColumnCards.filter(card => card.id !== activeCard.id));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) {
      setDraggedCard(null);
      return;
    }

    const activeCard = findCardById(active.id as string);
    const overColumnId = over.id as string;

    if (activeCard && activeCard.column_id !== overColumnId) {
      try {
        // Update card in database
        await kanbanService.updateCard(activeCard.id, { column_id: overColumnId });
        
        // Update local state
        moveKanbanCard(activeCard.id, overColumnId, 0);
      } catch (error) {
        console.error('Error moving card:', error);
        // Revert changes on error
        loadBoardData();
      }
    }

    setDraggedCard(null);
  };

  const findCardById = (cardId: string): KanbanCard | null => {
    for (const columnCards of Object.values(kanbanCards)) {
      const card = columnCards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  if (!selectedBoard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Selecione um Board</h2>
          <p className="text-gray-600">Escolha um board para começar a trabalhar</p>
        </div>
      </div>
    );
  }

  const currentBoard = kanbanBoards.find(board => board.id === selectedBoard);
  const boardColumns = kanbanColumns[selectedBoard] || [];

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentBoard?.title}</h1>
            <p className="text-sm text-gray-600">{boardColumns.length} colunas</p>
          </div>
          <button
            onClick={() => setShowNewColumn(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Coluna</span>
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 h-full">
            <SortableContext items={boardColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
              {boardColumns.map((column) => (
                <ListColumn
                  key={column.id}
                  column={column}
                  cards={kanbanCards[column.id] || []}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>

      {/* New Column Modal */}
      {showNewColumn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Nova Coluna</h3>
            <input
              type="text"
              placeholder="Nome da coluna"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createColumn()}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={createColumn}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setShowNewColumn(false);
                  setNewColumnTitle('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
