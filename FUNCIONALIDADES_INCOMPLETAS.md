# 🚧 Funcionalidades Incompletas - KrolikKanban

Este documento lista todas as funcionalidades que não estão completamente implementadas e detalha exatamente o que falta para completá-las.

## 📊 Resumo Geral

- **Total de Funcionalidades**: 13 categorias principais
- **Completamente Implementadas**: 3 (23%)
- **Parcialmente Implementadas**: 8 (62%)
- **Não Implementadas**: 2 (15%)

---

## 🔐 1. Sistema de Autenticação

### ✅ **Implementado:**
- Login/registro básico com Supabase
- Formulário de autenticação responsivo
- Tratamento de erros básico

### ❌ **Faltando Implementar:**

#### 1.1 Autenticação Social
```typescript
// FALTA: Implementar em lib/auth.ts
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};
```

#### 1.2 Gerenciamento de Perfil
```typescript
// FALTA: Criar lib/userService.ts
export class UserService {
  static async updateProfile(userId: string, data: {
    name?: string;
    avatar_url?: string;
    theme?: 'light' | 'dark';
  }) {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
    return { error };
  }

  static async uploadAvatar(userId: string, file: File) {
    // Implementar upload para Supabase Storage
  }
}
```

#### 1.3 Remover Dados Simulados
```typescript
// FALTA: Remover de app/page.tsx (linhas 12-40)
// Substituir por autenticação real
const checkUser = async () => {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    setUser(currentUser);
  } else {
    // Redirecionar para /auth em vez de simular
    window.location.href = '/auth';
  }
};
```

#### 1.4 Página de Callback
```typescript
// FALTA: Criar app/auth/callback/page.tsx
export default function AuthCallback() {
  useEffect(() => {
    // Processar callback do OAuth
    // Redirecionar para dashboard
  }, []);
}
```

---

## 📋 2. Gerenciamento de Boards

### ✅ **Implementado:**
- Interface de criação de boards
- Configurações básicas na interface

### ❌ **Faltando Implementar:**

#### 2.1 Persistência Real de Boards
```typescript
// FALTA: Conectar Sidebar.tsx ao banco real
const loadBoards = async () => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });
  
  if (data) setBoards(data);
};
```

#### 2.2 Upload de Imagens de Fundo
```typescript
// FALTA: Implementar em SettingsModal.tsx
const uploadBackgroundImage = async (file: File) => {
  const fileName = `board-${boardId}-${Date.now()}`;
  const { data, error } = await supabase.storage
    .from('board-backgrounds')
    .upload(fileName, file);
  
  if (data) {
    const imageUrl = supabase.storage
      .from('board-backgrounds')
      .getPublicUrl(fileName).data.publicUrl;
    
    await updateBoardBackground(boardId, imageUrl);
  }
};
```

#### 2.3 Configurações Avançadas Persistidas
```typescript
// FALTA: Conectar SettingsModal ao banco real
const saveSettings = async () => {
  await BoardService.saveBoardSettings(boardId, boardSettings);
  // Atualizar estado local
  // Mostrar feedback de sucesso
};
```

---

## 📝 3. Gerenciamento de Listas

### ✅ **Implementado:**
- Interface de criação de listas
- Drag & drop visual

### ❌ **Faltando Implementar:**

#### 3.1 Persistência de Listas
```typescript
// FALTA: Conectar BoardView.tsx ao banco real
const loadLists = async (boardId: string) => {
  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      cards(*)
    `)
    .eq('board_id', boardId)
    .order('position', { ascending: true });
  
  if (data) setLists(data);
};
```

#### 3.2 Persistência do Drag & Drop
```typescript
// FALTA: Implementar em BoardView.tsx
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (active && over) {
    // Atualizar posições no banco
    await updateCardPosition(active.id, over.id);
    // Recarregar dados
    await loadLists(currentBoard);
  }
};
```

#### 3.3 Deletar Listas
```typescript
// FALTA: Implementar em ListColumn.tsx
const deleteList = async () => {
  // Verificar permissões
  if (!canDeleteList) return;
  
  // Deletar cards da lista primeiro
  await supabase
    .from('cards')
    .delete()
    .eq('list_id', list.id);
  
  // Deletar lista
  await supabase
    .from('lists')
    .delete()
    .eq('id', list.id);
  
  // Atualizar interface
  onUpdateList();
};
```

---

## 🃏 4. Gerenciamento de Cards

### ✅ **Implementado:**
- Interface do CardModal
- Visualização básica de cards

### ❌ **Faltando Implementar:**

#### 4.1 Persistência de Cards
```typescript
// FALTA: Conectar CardModal.tsx ao banco real
const updateCard = async () => {
  const { error } = await supabase
    .from('cards')
    .update({
      title,
      description,
      due_date: dueDate || null,
      assigned_user_id: assignedUsers[0] || null,
      priority
    })
    .eq('id', card.id);
  
  if (!error) {
    onUpdate();
    onClose();
  }
};
```

#### 4.2 Sistema de Prioridades
```typescript
// FALTA: Implementar em CardModal.tsx
const updatePriority = async (priority: 'low' | 'medium' | 'high') => {
  await supabase
    .from('cards')
    .update({ priority })
    .eq('id', card.id);
};
```

#### 4.3 Atribuição de Usuários
```typescript
// FALTA: Implementar em CardModal.tsx
const assignUser = async (userId: string) => {
  await supabase
    .from('cards')
    .update({ assigned_user_id: userId })
    .eq('id', card.id);
};
```

---

## 🏷️ 5. Sistema de Etiquetas

### ✅ **Implementado:**
- Visualização de etiquetas
- Interface básica

### ❌ **Faltando Implementar:**

#### 5.1 CRUD Completo de Etiquetas
```typescript
// FALTA: Criar lib/labelService.ts
export class LabelService {
  static async createLabel(boardId: string, name: string, color: string) {
    const { data, error } = await supabase
      .from('labels')
      .insert({
        board_id: boardId,
        name,
        color
      })
      .select()
      .single();
    
    return { data, error };
  }

  static async updateLabel(labelId: string, name: string, color: string) {
    const { error } = await supabase
      .from('labels')
      .update({ name, color })
      .eq('id', labelId);
    
    return { error };
  }

  static async deleteLabel(labelId: string) {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', labelId);
    
    return { error };
  }
}
```

#### 5.2 Aplicar/Remover Etiquetas em Cards
```typescript
// FALTA: Implementar em CardModal.tsx
const toggleLabel = async (labelId: string) => {
  const isApplied = selectedLabels.includes(labelId);
  
  if (isApplied) {
    // Remover etiqueta
    await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', card.id)
      .eq('label_id', labelId);
  } else {
    // Aplicar etiqueta
    await supabase
      .from('card_labels')
      .insert({
        card_id: card.id,
        label_id: labelId
      });
  }
};
```

---

## 💬 6. Sistema de Comentários

### ✅ **Implementado:**
- Interface de comentários no CardModal

### ❌ **Faltando Implementar:**

#### 6.1 Sistema de Menções (@usuario)
```typescript
// FALTA: Implementar em CardModal.tsx
const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

const addComment = async () => {
  const mentions = extractMentions(newComment);
  
  const { data, error } = await supabase
    .from('card_comments')
    .insert({
      card_id: card.id,
      user_id: user.id,
      content: newComment,
      mentions: mentions
    })
    .select()
    .single();
  
  if (data) {
    // Notificar usuários mencionados
    await notifyMentionedUsers(mentions);
  }
};
```

#### 6.2 Notificações de Menções
```typescript
// FALTA: Criar lib/notificationService.ts
export class NotificationService {
  static async notifyMentionedUsers(mentions: string[], cardId: string) {
    for (const mention of mentions) {
      const user = await MemberService.getUserByEmail(mention);
      if (user) {
        // Criar notificação
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'mention',
            card_id: cardId,
            message: `Você foi mencionado em um comentário`
          });
      }
    }
  }
}
```

#### 6.3 Editar/Deletar Comentários
```typescript
// FALTA: Implementar em CardModal.tsx
const editComment = async (commentId: string, newContent: string) => {
  const { error } = await supabase
    .from('card_comments')
    .update({ content: newContent })
    .eq('id', commentId)
    .eq('user_id', user.id); // Apenas próprio comentário
  
  return { error };
};

const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('card_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id); // Apenas próprio comentário
  
  return { error };
};
```

---

## ✅ 7. Checklists

### ✅ **Implementado:**
- Interface de checklist no CardModal

### ❌ **Faltando Implementar:**

#### 7.1 CRUD Completo de Checklist
```typescript
// FALTA: Implementar em CardModal.tsx
const addChecklistItem = async () => {
  const { data, error } = await supabase
    .from('card_checklist')
    .insert({
      card_id: card.id,
      text: newChecklistItem,
      position: checklist.length
    })
    .select()
    .single();
  
  if (data) {
    setChecklist([...checklist, data]);
    setNewChecklistItem('');
  }
};

const toggleChecklistItem = async (itemId: string) => {
  const item = checklist.find(i => i.id === itemId);
  if (!item) return;
  
  const { error } = await supabase
    .from('card_checklist')
    .update({ completed: !item.completed })
    .eq('id', itemId);
  
  if (!error) {
    setChecklist(checklist.map(i => 
      i.id === itemId ? { ...i, completed: !i.completed } : i
    ));
  }
};

const deleteChecklistItem = async (itemId: string) => {
  const { error } = await supabase
    .from('card_checklist')
    .delete()
    .eq('id', itemId);
  
  if (!error) {
    setChecklist(checklist.filter(i => i.id !== itemId));
  }
};
```

#### 7.2 Reordenação de Itens
```typescript
// FALTA: Implementar drag & drop para checklist
const reorderChecklistItems = async (itemId: string, newPosition: number) => {
  // Atualizar posições no banco
  await supabase
    .from('card_checklist')
    .update({ position: newPosition })
    .eq('id', itemId);
};
```

---

## 📎 8. Sistema de Anexos

### ✅ **Implementado:**
- Interface de anexos no CardModal

### ❌ **Faltando Implementar:**

#### 8.1 Upload Real de Arquivos
```typescript
// FALTA: Implementar em CardModal.tsx
const uploadAttachment = async (file: File) => {
  const fileName = `card-${card.id}-${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('card-attachments')
    .upload(fileName, file);
  
  if (data) {
    const fileUrl = supabase.storage
      .from('card-attachments')
      .getPublicUrl(fileName).data.publicUrl;
    
    await supabase
      .from('card_attachments')
      .insert({
        card_id: card.id,
        name: file.name,
        url: fileUrl,
        type: file.type,
        size: file.size,
        uploaded_by: user.id
      });
  }
};
```

#### 8.2 Visualização de Anexos
```typescript
// FALTA: Implementar preview de arquivos
const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon />;
  if (type.startsWith('video/')) return <VideoIcon />;
  if (type.includes('pdf')) return <FileTextIcon />;
  return <FileIcon />;
};
```

#### 8.3 Deletar Anexos
```typescript
// FALTA: Implementar em CardModal.tsx
const deleteAttachment = async (attachmentId: string) => {
  const attachment = attachments.find(a => a.id === attachmentId);
  if (!attachment) return;
  
  // Deletar do storage
  await supabase.storage
    .from('card-attachments')
    .remove([attachment.url]);
  
  // Deletar registro
  await supabase
    .from('card_attachments')
    .delete()
    .eq('id', attachmentId);
};
```

---

## 👀 9. Sistema de Observadores

### ✅ **Implementado:**
- Interface de observadores no CardModal

### ❌ **Faltando Implementar:**

#### 9.1 Adicionar/Remover Observadores
```typescript
// FALTA: Implementar em CardModal.tsx
const toggleWatcher = async (userId: string) => {
  const isWatching = watchers.includes(userId);
  
  if (isWatching) {
    // Remover observador
    await supabase
      .from('card_watchers')
      .delete()
      .eq('card_id', card.id)
      .eq('user_id', userId);
  } else {
    // Adicionar observador
    await supabase
      .from('card_watchers')
      .insert({
        card_id: card.id,
        user_id: userId
      });
  }
};
```

#### 9.2 Notificações para Observadores
```typescript
// FALTA: Implementar notificações automáticas
const notifyWatchers = async (cardId: string, action: string) => {
  const { data: watchers } = await supabase
    .from('card_watchers')
    .select('user_id')
    .eq('card_id', cardId);
  
  for (const watcher of watchers || []) {
    await supabase
      .from('notifications')
      .insert({
        user_id: watcher.user_id,
        type: 'card_update',
        card_id: cardId,
        message: `Card foi ${action}`
      });
  }
};
```

---

## ⚙️ 10. Configurações Avançadas

### ✅ **Implementado:**
- Interface do SettingsModal
- Estrutura de configurações

### ❌ **Faltando Implementar:**

#### 10.1 Persistência de Configurações
```typescript
// FALTA: Conectar SettingsModal ao banco real
const saveSettings = async () => {
  setIsLoading(true);
  
  try {
    // Salvar configurações do board
    await BoardService.saveBoardSettings(boardId, boardSettings);
    
    // Salvar configurações avançadas
    await supabase
      .from('board_settings')
      .upsert({
        board_id: boardId,
        notifications: boardSettings.notifications,
        permissions: boardSettings.permissions
      });
    
    setIsDirty(false);
    // Mostrar feedback de sucesso
  } catch (error) {
    // Mostrar erro
  } finally {
    setIsLoading(false);
  }
};
```

#### 10.2 Validação de Permissões
```typescript
// FALTA: Implementar verificações de permissão
const canEditSettings = userRole === 'owner' || userRole === 'admin';
const canDeleteBoard = userRole === 'owner';

// Desabilitar campos baseado em permissões
const isFieldDisabled = (field: string) => {
  if (field === 'delete') return !canDeleteBoard;
  return !canEditSettings;
};
```

---

## 🔔 11. Sistema de Notificações

### ❌ **Não Implementado:**

#### 11.1 Estrutura de Notificações
```sql
-- FALTA: Adicionar ao supabase-schema.sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mention', 'card_update', 'due_date', 'new_member')),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 11.2 Serviço de Notificações
```typescript
// FALTA: Criar lib/notificationService.ts
export class NotificationService {
  static async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    return { error };
  }

  static async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    
    return { error };
  }
}
```

#### 11.3 Componente de Notificações
```typescript
// FALTA: Criar components/layout/NotificationCenter.tsx
export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  const loadNotifications = async () => {
    const { data } = await NotificationService.getNotifications(user.id);
    setNotifications(data || []);
    setUnreadCount(data?.filter(n => !n.read).length || 0);
  };
  
  return (
    <div className="notification-center">
      {/* Interface de notificações */}
    </div>
  );
}
```

---

## 📊 12. Relatórios e Analytics

### ❌ **Não Implementado:**

#### 12.1 Dashboard de Analytics
```typescript
// FALTA: Criar components/analytics/Dashboard.tsx
export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalCards: 0,
    completedCards: 0,
    overdueCards: 0,
    productivity: 0
  });
  
  useEffect(() => {
    loadAnalytics();
  }, []);
  
  const loadAnalytics = async () => {
    // Buscar estatísticas do board
    const analytics = await AnalyticsService.getBoardStats(boardId);
    setStats(analytics);
  };
  
  return (
    <div className="analytics-dashboard">
      {/* Gráficos e estatísticas */}
    </div>
  );
}
```

#### 12.2 Serviço de Analytics
```typescript
// FALTA: Criar lib/analyticsService.ts
export class AnalyticsService {
  static async getBoardStats(boardId: string) {
    // Buscar estatísticas do board
    const { data: cards } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId);
    
    const totalCards = cards?.length || 0;
    const completedCards = cards?.filter(c => c.completed).length || 0;
    const overdueCards = cards?.filter(c => 
      c.due_date && new Date(c.due_date) < new Date() && !c.completed
    ).length || 0;
    
    return {
      totalCards,
      completedCards,
      overdueCards,
      productivity: totalCards > 0 ? (completedCards / totalCards) * 100 : 0
    };
  }
}
```

---

## 🔍 13. Busca e Filtros

### ✅ **Implementado:**
- Busca básica de membros

### ❌ **Faltando Implementar:**

#### 13.1 Busca Global
```typescript
// FALTA: Implementar em Header.tsx
const searchCards = async (query: string) => {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      list:lists(title),
      board:boards(title)
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('board_id', currentBoard);
  
  return { data, error };
};
```

#### 13.2 Filtros Avançados
```typescript
// FALTA: Criar components/filters/AdvancedFilters.tsx
export default function AdvancedFilters() {
  const [filters, setFilters] = useState({
    labels: [],
    assignedTo: null,
    dueDate: null,
    priority: null
  });
  
  const applyFilters = async () => {
    let query = supabase
      .from('cards')
      .select('*')
      .eq('board_id', currentBoard);
    
    if (filters.labels.length > 0) {
      query = query.in('labels', filters.labels);
    }
    
    if (filters.assignedTo) {
      query = query.eq('assigned_user_id', filters.assignedTo);
    }
    
    // Aplicar outros filtros...
    
    const { data } = await query;
    setFilteredCards(data || []);
  };
  
  return (
    <div className="advanced-filters">
      {/* Interface de filtros */}
    </div>
  );
}
```

---

## 📋 Checklist de Implementação

### 🔴 **Prioridade Alta (Crítico)**
- [ ] Remover dados simulados
- [ ] Conectar BoardView ao banco real
- [ ] Implementar persistência do drag & drop
- [ ] Conectar CardModal ao banco real
- [ ] Implementar upload de arquivos

### 🟡 **Prioridade Média (Importante)**
- [ ] Sistema de menções (@usuario)
- [ ] Notificações em tempo real
- [ ] Autenticação social
- [ ] CRUD completo de etiquetas
- [ ] Sistema de observadores

### 🟢 **Prioridade Baixa (Melhorias)**
- [ ] Analytics e relatórios
- [ ] Busca global avançada
- [ ] Filtros complexos
- [ ] Temas personalizados
- [ ] Exportação de dados

---

## 🎯 **Próximos Passos Recomendados**

1. **Semana 1**: Remover dados simulados e conectar ao Supabase
2. **Semana 2**: Implementar persistência do drag & drop
3. **Semana 3**: Conectar CardModal ao banco real
4. **Semana 4**: Implementar upload de arquivos e menções
5. **Semana 5**: Sistema de notificações e observadores
6. **Semana 6**: Autenticação social e melhorias finais

---

*Última atualização: $(date)* 