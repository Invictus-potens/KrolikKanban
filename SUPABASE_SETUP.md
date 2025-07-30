# 🚀 Configuração do Supabase

Este guia explica como configurar o Supabase para o projeto KrolikKanban.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Digite um nome para o projeto (ex: "krolik-kanban")
5. Defina uma senha para o banco de dados
6. Escolha uma região próxima
7. Clique em "Create new project"

### 2. Executar Schema SQL

1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em **Run** para executar o schema

### 3. Configurar Autenticação

1. Vá para **Authentication** > **Settings**
2. Em **Site URL**, adicione:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seu-dominio.railway.app` (produção)
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/auth/callback`
   - `https://seu-dominio.railway.app/auth/callback`

### 4. Configurar Storage (Opcional)

Para upload de imagens de background:

1. Vá para **Storage**
2. Crie um bucket chamado `board-backgrounds`
3. Configure as políticas de acesso:

```sql
-- Permitir upload de imagens para usuários autenticados
CREATE POLICY "Users can upload board backgrounds" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'board-backgrounds' AND
    auth.role() = 'authenticated'
  );

-- Permitir visualização de imagens públicas
CREATE POLICY "Anyone can view board backgrounds" ON storage.objects
  FOR SELECT USING (bucket_id = 'board-backgrounds');
```

### 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

Para encontrar essas credenciais:
1. Vá para **Settings** > **API**
2. Copie a **Project URL** e **anon public** key

### 6. Configurar Railway (Produção)

No Railway, adicione as variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
NODE_ENV=production
```

## 🔐 Políticas de Segurança

O schema já inclui Row Level Security (RLS) configurado:

- **Usuários** só podem ver/editar seu próprio perfil
- **Boards** são visíveis baseados na visibilidade e membros
- **Cards e Lists** só podem ser gerenciados por membros do board
- **Configurações** só podem ser alteradas por admins

## 📊 Estrutura do Banco

### Tabelas Principais

- **`users`** - Perfis dos usuários
- **`boards`** - Boards do kanban
- **`board_settings`** - Configurações avançadas
- **`lists`** - Colunas do kanban
- **`cards`** - Cards do kanban
- **`labels`** - Etiquetas dos cards
- **`card_comments`** - Comentários dos cards
- **`board_members`** - Membros dos boards
- **`card_checklist`** - Checklists dos cards
- **`card_attachments`** - Anexos dos cards
- **`card_watchers`** - Observadores dos cards

### Relacionamentos

```
users (1) ←→ (N) boards
boards (1) ←→ (N) lists
lists (1) ←→ (N) cards
cards (N) ←→ (N) labels (via card_labels)
cards (1) ←→ (N) card_comments
boards (1) ←→ (N) board_members
cards (1) ←→ (N) card_checklist
cards (1) ←→ (N) card_attachments
cards (N) ←→ (N) users (via card_watchers)
```

## 🧪 Testando

1. Execute o projeto localmente: `npm run dev`
2. Acesse `http://localhost:3000`
3. Teste a criação de boards e cards
4. Verifique se as configurações estão sendo salvas

## 🚨 Troubleshooting

### Erro de CORS
- Verifique se as URLs estão corretas nas configurações de autenticação

### Erro de RLS
- Certifique-se de que o usuário está autenticado
- Verifique se as políticas estão ativas

### Erro de Tipos
- Execute `npm run build` para verificar se os tipos estão corretos

## 📝 Notas

- O schema inclui triggers automáticos para `updated_at`
- Todas as tabelas têm RLS habilitado
- Índices foram criados para melhor performance
- Função automática para criar perfil de usuário 