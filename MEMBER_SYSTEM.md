# 👥 Sistema de Membros do Board

Este documento explica como funciona o sistema de membros do KrolikKanban.

## 🏗️ Estrutura do Sistema

### Roles (Funções)

1. **Owner (Dono)**
   - Pode fazer tudo no board
   - Pode deletar o board
   - Pode gerenciar todos os membros
   - Pode alterar configurações

2. **Admin (Administrador)**
   - Pode gerenciar membros
   - Pode alterar configurações
   - Pode criar/editar cards
   - Não pode deletar o board

3. **Member (Membro)**
   - Pode criar e editar cards
   - Pode comentar nos cards
   - Pode adicionar etiquetas
   - Não pode gerenciar membros

4. **Viewer (Visualizador)**
   - Apenas visualização
   - Não pode fazer alterações
   - Pode ver todos os cards

## 🔧 Funcionalidades Implementadas

### MemberService (`lib/memberService.ts`)

#### Métodos Principais:

- **`getBoardMembers(boardId)`** - Buscar membros do board
- **`addBoardMember(boardId, userId, role)`** - Adicionar membro
- **`removeBoardMember(boardId, userId)`** - Remover membro
- **`updateMemberRole(boardId, userId, role)`** - Atualizar role
- **`inviteUserByEmail(boardId, email, role)`** - Convidar por email
- **`getBoardOwner(boardId)`** - Buscar dono do board
- **`canManageMembers(boardId, userId)`** - Verificar permissões
- **`getAvailableUsers(boardId)`** - Usuários disponíveis

### MembersModal (`components/board/MembersModal.tsx`)

#### Funcionalidades:

- ✅ **Lista de membros** com roles
- ✅ **Dono do board** destacado
- ✅ **Convidar por email** (apenas admins/owner)
- ✅ **Remover membros** (apenas admins/owner)
- ✅ **Verificação de permissões**
- ✅ **Feedback visual** (sucesso/erro)
- ✅ **Loading states**
- ✅ **Responsivo**

## 🗄️ Schema do Banco

### Tabela `board_members`

```sql
CREATE TABLE IF NOT EXISTS public.board_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);
```

### Políticas de Segurança (RLS)

```sql
-- Membros podem ver outros membros
CREATE POLICY "Board members can view board members" ON public.board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      WHERE bm.board_id = board_members.board_id AND bm.user_id = auth.uid()
    )
  );

-- Apenas admins podem gerenciar membros
CREATE POLICY "Board admins can manage members" ON public.board_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      WHERE bm.board_id = board_members.board_id AND bm.user_id = auth.uid() AND bm.role = 'admin'
    )
  );
```

## 🎯 Fluxo de Uso

### 1. Acessar MembersModal
- Clique no botão "Membros" no board
- Modal abre com lista de membros atual

### 2. Convidar Novo Membro
- Digite o email do usuário
- Selecione a role (Visualizador/Membro/Administrador)
- Clique em "Convidar"
- Sistema verifica se usuário existe
- Adiciona ao board se válido

### 3. Gerenciar Membros
- **Remover**: Clique no X ao lado do membro
- **Ver permissões**: Role é exibida com ícone
- **Owner**: Sempre destacado com coroa

### 4. Verificações de Segurança
- ✅ Usuário deve existir no sistema
- ✅ Não pode convidar membro já existente
- ✅ Apenas admins/owner podem gerenciar
- ✅ Owner não pode ser removido
- ✅ Validação de roles

## 🔐 Segurança

### Permissões por Role

| Ação | Owner | Admin | Member | Viewer |
|------|-------|-------|--------|--------|
| Ver board | ✅ | ✅ | ✅ | ✅ |
| Criar cards | ✅ | ✅ | ✅ | ❌ |
| Editar cards | ✅ | ✅ | ✅ | ❌ |
| Comentar | ✅ | ✅ | ✅ | ❌ |
| Gerenciar membros | ✅ | ✅ | ❌ | ❌ |
| Configurações | ✅ | ✅ | ❌ | ❌ |
| Deletar board | ✅ | ❌ | ❌ | ❌ |

### Validações

- **Email válido**: Formato de email correto
- **Usuário existe**: Deve ter conta no sistema
- **Não duplicado**: Não pode convidar membro existente
- **Permissões**: Apenas admins/owner podem gerenciar
- **Role válida**: Apenas roles permitidas

## 🎨 Interface

### Estados Visuais

- **Loading**: Spinner durante carregamento
- **Sucesso**: Mensagem verde com ícone
- **Erro**: Mensagem vermelha com ícone
- **Permissões**: Botões desabilitados se sem permissão
- **Owner**: Destaque especial com coroa

### Responsividade

- ✅ Modal responsivo
- ✅ Lista scrollável
- ✅ Botões adaptáveis
- ✅ Texto legível em mobile

## 🧪 Testes

### Cenários de Teste

1. **Convidar usuário válido**
   - Email correto
   - Usuário existe
   - Role válida

2. **Convidar usuário inválido**
   - Email inexistente
   - Usuário já é membro
   - Email mal formatado

3. **Gerenciar permissões**
   - Admin remove membro
   - Owner remove admin
   - Member tenta gerenciar (deve falhar)

4. **Verificações de segurança**
   - Usuário sem permissão
   - Tentativa de remover owner
   - Acesso não autorizado

## 📝 Notas Técnicas

- **Row Level Security**: Todas as operações são seguras
- **Real-time**: Dados sempre atualizados
- **Error handling**: Tratamento robusto de erros
- **Type safety**: TypeScript em todo o sistema
- **Performance**: Índices otimizados no banco 