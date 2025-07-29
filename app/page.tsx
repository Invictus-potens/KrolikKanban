
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/lib/store';
import { 
  folderService, 
  tagService, 
  noteService, 
  calendarService, 
  kanbanService 
} from '@/lib/services';
import { 
  FolderOpen, 
  StickyNote, 
  Calendar, 
  Kanban, 
  Tag, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { 
    folders, 
    tags, 
    notes, 
    calendarEvents, 
    kanbanBoards,
    setFolders,
    setTags,
    setNotes,
    setCalendarEvents,
    setKanbanBoards
  } = useAppStore();

  useEffect(() => {
    if (user && !loading) {
      loadDashboardData();
    }
  }, [user, loading]);

  const loadDashboardData = async () => {
    try {
      const [foldersData, tagsData, notesData, eventsData, boardsData] = await Promise.all([
        folderService.getFolders(),
        tagService.getTags(),
        noteService.getNotes(),
        calendarService.getEvents(),
        kanbanService.getBoards()
      ]);

      setFolders(foldersData);
      setTags(tagsData);
      setNotes(notesData);
      setCalendarEvents(eventsData);
      setKanbanBoards(boardsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo ao KrolikKanban</h1>
          <p className="text-gray-600 mb-6">Faça login para começar a organizar suas tarefas</p>
          <Link
            href="/auth"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date();
  const todayEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.start_date);
    return eventDate.toDateString() === today.toDateString();
  });

  const pinnedNotes = notes.filter(note => note.is_pinned);
  const recentNotes = notes.slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo de volta! Aqui está um resumo das suas atividades.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notas</p>
              <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <StickyNote className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Boards</p>
              <p className="text-2xl font-bold text-gray-900">{kanbanBoards.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Kanban className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventos Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{todayEvents.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tags</p>
              <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Tag className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Notas Recentes</h2>
              <Link
                href="/notes"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver todas
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div key={note.id} className="flex items-start space-x-3">
                    {note.is_pinned && (
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma nota ainda</p>
                <Link
                  href="/notes"
                  className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Criar primeira nota
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Eventos de Hoje</h2>
              <Link
                href="/calendar"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver calendário
              </Link>
            </div>
          </div>
          <div className="p-6">
            {todayEvents.length > 0 ? (
              <div className="space-y-4">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-2"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.start_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum evento hoje</p>
                <Link
                  href="/calendar"
                  className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar evento
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/notes/new"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <StickyNote className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Nova Nota</span>
          </Link>
          
          <Link
            href="/kanban/new"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <Kanban className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Novo Board</span>
          </Link>
          
          <Link
            href="/calendar/new"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Calendar className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Novo Evento</span>
          </Link>
          
          <Link
            href="/folders/new"
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <FolderOpen className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Nova Pasta</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
