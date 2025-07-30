
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { X, Calendar, User, Tag, MessageCircle, CheckSquare, Paperclip, Activity, Edit2, Trash2, AtSign, Plus, Clock, AlertCircle } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  assigned_user_id?: string;
  labels: Label[];
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
  watchers?: string[];
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  mentions?: string[];
  user: {
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface CardModalProps {
  card: Card;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CardModal({ card, onClose, onUpdate }: CardModalProps) {
  const { theme, user } = useStore();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.due_date || '');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(card.labels.map(l => l.id));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>(card.attachments || []);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [watchers, setWatchers] = useState<string[]>(card.watchers || []);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [activity, setActivity] = useState<any[]>([]);
  const [showActivity, setShowActivity] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    fetchComments();
    fetchAvailableLabels();
    fetchAvailableUsers();
    fetchActivity();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('card_comments')
      .select(`
        *,
        users:users(name, email)
      `)
      .eq('card_id', card.id)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data.map(comment => ({ 
        ...comment, 
        user: comment.users 
      })));
    }
  };

  const fetchAvailableLabels = async () => {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('board_id', 'current_board_id');

    if (data) setAvailableLabels(data);
  };

  const fetchAvailableUsers = async () => {
    const mockUsers: User[] = [
      { id: '1', name: 'João Silva', email: 'joao@example.com' },
      { id: '2', name: 'Maria Santos', email: 'maria@example.com' },
      { id: '3', name: 'Pedro Oliveira', email: 'pedro@example.com' },
      { id: '4', name: 'Ana Costa', email: 'ana@example.com' },
    ];
    setAvailableUsers(mockUsers);
  };

  const fetchActivity = async () => {
    const mockActivity = [
      { id: '1', type: 'comment', user: 'João Silva', content: 'Comentário adicionado', timestamp: '2024-01-15T10:30:00Z' },
      { id: '2', type: 'update', user: 'Maria Santos', content: 'Título atualizado', timestamp: '2024-01-15T09:15:00Z' },
      { id: '3', type: 'assign', user: 'Pedro Oliveira', content: 'Usuário atribuído', timestamp: '2024-01-15T08:45:00Z' },
    ];
    setActivity(mockActivity);
  };

  const updateCard = async () => {
    const { error } = await supabase
      .from('cards')
      .update({
        title,
        description,
        due_date: dueDate || null,
      })
      .eq('id', card.id);

    if (!error) {
      onUpdate();
      setIsEditing(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const mentions = extractMentions(newComment);  

    const { error } = await supabase
      .from('card_comments')
      .insert([{
        card_id: card.id, 
        user_id: user?.id, 
        content: newComment, 
        mentions: mentions, 
      }]);

    if (!error) {
      setNewComment('');
      fetchComments();
      notifyMentionedUsers(mentions);
    }
  };

  const editComment = async (commentId: string) => {
    const { error } = await supabase
      .from('card_comments')
      .update({
        content: editCommentText, 
        updated_at: new Date().toISOString(), 
      })
      .eq('id', commentId);

    if (!error) {
      setEditingComment(null);
      setEditCommentText('');
      fetchComments();
    }
  };

  const deleteComment = async (commentId: string) => {
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
      const { error } = await supabase
        .from('card_comments')
        .delete()
        .eq('id', commentId);

      if (!error) {
        fetchComments();
      }
    }
  };

  const toggleLabel = async (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      setSelectedLabels(prev => prev.filter(id => id !== labelId));
    } else {
      setSelectedLabels(prev => [...prev, labelId]);
    }
    onUpdate();
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;  

    const newItem: ChecklistItem = { 
      id: Date.now().toString(), 
      text: newChecklistItem, 
      completed: false, 
    };  

    setChecklist([...checklist, newItem]);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(checklist.map(item =>  
      item.id === itemId ? { ...item, completed: !item.completed } : item 
    ));
  };

  const deleteChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };

  const assignUser = (userId: string) => {
    if (assignedUsers.includes(userId)) {
      setAssignedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setAssignedUsers(prev => [...prev, userId]);
    }
  };

  const toggleWatcher = (userId: string) => {
    if (watchers.includes(userId)) {
      setWatchers(prev => prev.filter(id => id !== userId));
    } else {
      setWatchers(prev => [...prev, userId]);
    }
  };

  const extractMentions = (text: string): string[] => { 
    const mentionRegex = /@(\w+)/g; 
    const matches = text.match(mentionRegex); 
    return matches ? matches.map(match => match.substring(1)) : []; 
  };

  const notifyMentionedUsers = (mentions: string[]) => { 
    console.log('Notificando usuários:', mentions); 
  };

  const handleMentionSelect = (userName: string) => { 
    const cursorPosition = newComment.lastIndexOf('@'); 
    const beforeMention = newComment.substring(0, cursorPosition); 
    const afterMention = newComment.substring(cursorPosition + mentionSearch.length + 1);  

    setNewComment(beforeMention + '@' + userName + ' ' + afterMention);
    setShowMentions(false);
    setMentionSearch('');
  };

  const handleCommentChange = (value: string) => { 
    setNewComment(value);  

    const lastAtIndex = value.lastIndexOf('@'); 
    if (lastAtIndex !== -1) { 
      const afterAt = value.substring(lastAtIndex + 1); 
      if (afterAt.length > 0 && !afterAt.includes(' ')) { 
        setMentionSearch(afterAt); 
        setShowMentions(true); 
      } else { 
        setShowMentions(false); 
      } 
    } else { 
      setShowMentions(false); 
    } 
  };

  const getCompletedChecklistCount = () => { 
    return checklist.filter(item => item.completed).length; 
  };

  const getPriorityColor = (priority: string) => { 
    switch (priority) { 
      case 'high': return 'text-red-500 bg-red-100'; 
      case 'medium': return 'text-yellow-500 bg-yellow-100'; 
      case 'low': return 'text-green-500 bg-green-100'; 
      default: return 'text-gray-500 bg-gray-100'; 
    } 
  };

  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase()) 
  );

  return ( 
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"> 
      <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex`}> 
        <div className="flex-1 p-6 overflow-y-auto"> 
          <div className="flex items-start justify-between mb-6"> 
            <div className="flex-1"> 
              {isEditing ? ( 
                <div className="space-y-3"> 
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className={`${theme === 'dark' ? 'text-white bg-slate-800' : 'text-gray-900 bg-gray-100'} border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 w-full`} 
                  /> 
                  <div className="flex gap-2"> 
                    <button 
                      onClick={updateCard} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium" 
                    > 
                      Salvar 
                    </button> 
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className={`${theme === 'dark' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} px-4 py-2 rounded-lg text-sm font-medium`} 
                    > 
                      Cancelar 
                    </button> 
                  </div> 
                </div> 
              ) : ( 
                <div className="flex items-center gap-2"> 
                  <h2 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-2xl font-bold`}> 
                    {title} 
                  </h2> 
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className={`${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} p-2 rounded-lg`} 
                  > 
                    <Edit2 className="w-4 h-4" /> 
                  </button> 
                </div> 
              )} 
            </div> 
            <button 
              onClick={onClose} 
              className={`${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} p-2 rounded-lg`} 
            > 
              <X className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} w-5 h-5`} /> 
            </button> 
          </div> 

          <div className="space-y-6"> 
            {/* Priority */} 
            <div> 
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`}>Prioridade</h3> 
              <div className="flex gap-2"> 
                {['low', 'medium', 'high'].map((p) => ( 
                  <button 
                    key={p} 
                    onClick={() => setPriority(p as 'low' | 'medium' | 'high')} 
                    className={`${ 
                      priority === p ? getPriorityColor(p) : `${theme === 'dark' ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'}` 
                    } px-3 py-1 rounded-full text-sm font-medium`} 
                  > 
                    {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'} 
                  </button> 
                ))} 
              </div> 
            </div> 

            {/* Labels */} 
            <div> 
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`}>Etiquetas</h3> 
              <div className="flex flex-wrap gap-2"> 
                {availableLabels.map((label) => ( 
                  <button 
                    key={label.id} 
                    onClick={() => toggleLabel(label.id)} 
                    className={`px-3 py-1 text-sm font-medium rounded-full text-white ${ 
                      selectedLabels.includes(label.id) ? 'opacity-100' : 'opacity-50' 
                    }`} 
                    style={{ backgroundColor: label.color }} 
                  > 
                    {label.name} 
                  </button> 
                ))} 
              </div> 
            </div> 

            {/* Assigned Users */} 
            <div> 
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`}>Usuários Atribuídos</h3> 
              <div className="flex flex-wrap gap-2"> 
                {availableUsers.map((user) => ( 
                  <button 
                    key={user.id} 
                    onClick={() => assignUser(user.id)} 
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${ 
                      assignedUsers.includes(user.id) 
                        ? 'bg-blue-600 text-white' 
                        : `${theme === 'dark' ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'}` 
                    }`} 
                  > 
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"> 
                      <span className="text-xs text-white">{user.name.charAt(0)}</span> 
                    </div> 
                    {user.name} 
                  </button> 
                ))} 
              </div> 
            </div> 

            {/* Description */} 
            <div> 
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`}>Descrição</h3> 
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                onBlur={updateCard} 
                placeholder="Adicione uma descrição mais detalhada..." 
                className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full px-3 py-2 rounded-lg`} 
                rows={4} 
              /> 
            </div> 

            {/* Due Date */} 
            <div> 
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-2`}>Data de Vencimento</h3> 
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                onBlur={updateCard} 
                className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2`} 
              /> 
            </div> 

            {/* Checklist */} 
            <div> 
              <div className="flex items-center justify-between mb-2"> 
                <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium`}> 
                  Checklist ({getCompletedChecklistCount()}/{checklist.length}) 
                </h3> 
                <div className="flex items-center gap-2"> 
                  <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'} w-24 h-2 rounded-full`}> 
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all" 
                      style={{ width: checklist.length ? `${(getCompletedChecklistCount() / checklist.length) * 100}%` : '0%' }} 
                    /> 
                  </div> 
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}> 
                    {checklist.length ? Math.round((getCompletedChecklistCount() / checklist.length) * 100) : 0}% 
                  </span> 
                </div> 
              </div> 

              <div className="space-y-2"> 
                {checklist.map((item) => ( 
                  <div key={item.id} className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}> 
                    <input 
                      type="checkbox" 
                      checked={item.completed} 
                      onChange={() => toggleChecklistItem(item.id)} 
                      className="w-4 h-4 text-blue-600 rounded" 
                    /> 
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> 
                      {item.text} 
                    </span> 
                    <button 
                      onClick={() => deleteChecklistItem(item.id)} 
                      className={`${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} p-1 rounded text-red-500`} 
                    > 
                      <Trash2 className="w-3 h-3" /> 
                    </button> 
                  </div> 
                ))} 

                <div className="flex gap-2"> 
                  <input 
                    type="text" 
                    value={newChecklistItem} 
                    onChange={(e) => setNewChecklistItem(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()} 
                    placeholder="Adicionar item ao checklist..." 
                    className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 flex-1`} 
                  /> 
                  <button 
                    onClick={addChecklistItem} 
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" 
                  > 
                    <Plus className="w-4 h-4" /> 
                  </button> 
                </div> 
              </div> 
            </div> 

            {/* Activity Toggle */} 
            <div> 
              <button 
                onClick={() => setShowActivity(!showActivity)} 
                className={`flex items-center gap-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} hover:text-blue-600`} 
              > 
                <Activity className="w-4 h-4" /> 
                {showActivity ? 'Ocultar' : 'Mostrar'} Atividade 
              </button> 
            </div> 

            {/* Activity Feed */} 
            {showActivity && ( 
              <div> 
                <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-4`}>Atividade</h3> 
                <div className="space-y-3"> 
                  {activity.map((item) => ( 
                    <div key={item.id} className="flex gap-3"> 
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0"> 
                        <Activity className="w-4 h-4 text-white" /> 
                      </div> 
                      <div className="flex-1"> 
                        <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}> 
                          <span className="font-medium">{item.user}</span> {item.content} 
                        </div> 
                        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}> 
                          {new Date(item.timestamp).toLocaleString()} 
                        </div> 
                      </div> 
                    </div> 
                  ))} 
                </div> 
              </div> 
            )} 

            {/* Comments */} 
            <div> 
              <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-4`}>Comentários</h3> 

              <div className="space-y-4 mb-4"> 
                {comments.map((comment) => ( 
                  <div key={comment.id} className="flex gap-3"> 
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"> 
                      <span className="text-white font-medium text-sm"> 
                        {comment.user.name.charAt(0)} 
                      </span> 
                    </div> 
                    <div className="flex-1"> 
                      <div className="flex items-center gap-2 mb-1"> 
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm font-medium`}> 
                          {comment.user.name} 
                        </span> 
                        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}> 
                          {new Date(comment.created_at).toLocaleString()} 
                        </span> 
                        {comment.updated_at && ( 
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}> 
                            (editado) 
                          </span> 
                        )} 
                      </div> 

                      {editingComment === comment.id ? ( 
                        <div className="space-y-2"> 
                          <textarea 
                            value={editCommentText} 
                            onChange={(e) => setEditCommentText(e.target.value)} 
                            className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full px-3 py-2 rounded-lg`} 
                            rows={2} 
                          /> 
                          <div className="flex gap-2"> 
                            <button 
                              onClick={() => editComment(comment.id)} 
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700" 
                            > 
                              Salvar 
                            </button> 
                            <button 
                              onClick={() => setEditingComment(null)} 
                              className={`${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-900'} px-3 py-1 rounded text-sm`} 
                            > 
                              Cancelar 
                            </button> 
                          </div> 
                        </div> 
                      ) : ( 
                        <div> 
                          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}> 
                            {comment.content} 
                          </p> 
                          {comment.user_id === user?.id && ( 
                            <div className="flex gap-2 mt-2"> 
                              <button 
                                onClick={() => { 
                                  setEditingComment(comment.id); 
                                  setEditCommentText(comment.content); 
                                }} 
                                className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} text-xs`} 
                              > 
                                Editar 
                              </button> 
                              <button 
                                onClick={() => deleteComment(comment.id)} 
                                className="text-xs text-red-500 hover:text-red-700" 
                              > 
                                Excluir 
                              </button> 
                            </div> 
                          )} 
                        </div> 
                      )} 
                    </div> 
                  </div> 
                ))} 
              </div> 

              {/* New Comment */} 
              <div className="flex gap-3"> 
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div> 
                <div className="flex-1 relative"> 
                  <textarea 
                    value={newComment} 
                    onChange={(e) => handleCommentChange(e.target.value)} 
                    onKeyPress={(e) => { 
                      if (e.key === 'Enter' && !e.shiftKey) { 
                        e.preventDefault(); 
                        addComment(); 
                      } 
                    }} 
                    placeholder="Escreva um comentário... (Use @ para mencionar usuários)" 
                    className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full px-3 py-2 rounded-lg`} 
                    rows={3} 
                  /> 

                  {/* Mentions Dropdown */} 
                  {showMentions && ( 
                    <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} absolute bottom-full mb-2 left-0 w-full border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} rounded-lg shadow-lg max-h-32 overflow-y-auto z-10`}> 
                      {filteredUsers.map((user) => ( 
                        <button 
                          key={user.id} 
                          onClick={() => handleMentionSelect(user.name)} 
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}`} 
                        > 
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"> 
                            <span className="text-white text-xs">{user.name.charAt(0)}</span> 
                          </div> 
                          <div> 
                            <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm font-medium`}> 
                              {user.name} 
                            </div> 
                            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs`}> 
                              {user.email} 
                            </div> 
                          </div> 
                        </button> 
                      ))} 
                    </div> 
                  )} 

                  <button 
                    onClick={addComment} 
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium" 
                  > 
                    Comentar 
                  </button> 
                </div> 
              </div> 
            </div> 
          </div> 
        </div> 

        {/* Sidebar */} 
        <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'} w-64 p-4 border-l ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}> 
          <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-4`}>Ações</h3> 
          <div className="space-y-2"> 
            <button 
              onClick={() => setIsEditing(true)} 
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} text-left`} 
            > 
              <Edit2 className="w-4 h-4" /> 
              <span className="text-sm">Editar</span> 
            </button> 
            <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} text-left`}> 
              <User className="w-4 h-4" /> 
              <span className="text-sm">Membros</span> 
            </button> 
            <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} text-left`}> 
              <Tag className="w-4 h-4" /> 
              <span className="text-sm">Etiquetas</span> 
            </button> 
            <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} text-left`}> 
              <CheckSquare className="w-4 h-4" /> 
              <span className="text-sm">Checklist</span> 
            </button> 
            <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} text-left`}> 
              <Calendar className="w-4 h-4" /> 
              <span className="text-sm">Data</span> 
            </button> 
            <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} text-left`}> 
              <Paperclip className="w-4 h-4" /> 
              <span className="text-sm">Anexos</span> 
            </button> 
            <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} text-left`}> 
              <AlertCircle className="w-4 h-4" /> 
              <span className="text-sm">Prioridade</span> 
            </button> 
          </div> 

          {/* Watchers */} 
          <div className="mt-6"> 
            <h3 className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium mb-3`}>Observadores</h3> 
            <div className="space-y-1"> 
              {availableUsers.map((user) => ( 
                <button 
                  key={user.id} 
                  onClick={() => toggleWatcher(user.id)} 
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm ${ 
                    watchers.includes(user.id) 
                      ? 'bg-blue-600 text-white' 
                      : `${theme === 'dark' ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'}` 
                  }`} 
                > 
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"> 
                    <span className="text-xs text-white">{user.name.charAt(0)}</span> 
                  </div> 
                  {user.name} 
                </button> 
              ))} 
            </div> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}
