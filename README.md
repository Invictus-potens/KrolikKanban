# KrolikKanban

Um aplicativo de kanban moderno construído com Next.js, React e Supabase.

## 🚀 Deploy no Railway

Este projeto está configurado para deploy automático no Railway usando Nixpack.

### Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Projeto conectado ao Railway
3. **Supabase configurado** (veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Railway:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=production
```

### Deploy Automático

1. Conecte seu repositório ao Railway
2. O Railway detectará automaticamente a configuração do Nixpack
3. O deploy será feito automaticamente a cada push para a branch principal

### Configurações

- **Builder**: Nixpack
- **Start Command**: `npm start`
- **Health Check**: `/`
- **Port**: Configurado automaticamente via variável `$PORT`

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em modo de produção
npm start
```

## 📁 Estrutura do Projeto

```
KrolikKanban/
├── app/                 # App Router do Next.js
├── components/          # Componentes React
├── lib/                # Utilitários e configurações
├── railway.toml        # Configuração do Railway
├── nixpacks.toml       # Configuração do Nixpack
├── supabase-schema.sql # Schema do banco de dados
├── SUPABASE_SETUP.md   # Guia de configuração do Supabase
├── MEMBER_SYSTEM.md    # Documentação do sistema de membros
└── Dockerfile          # Dockerfile opcional
```

## 🗄️ Banco de Dados (Supabase)

O projeto usa Supabase como backend. Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para configuração completa.

### Funcionalidades Implementadas

- ✅ **Configurações de Board** - Visibilidade, permissões, notificações
- ✅ **Sistema de Membros** - Roles: owner, admin, member, viewer (veja [MEMBER_SYSTEM.md](./MEMBER_SYSTEM.md))
- ✅ **Comentários com Menções** - Sistema @usuario
- ✅ **Checklists** - Listas de tarefas nos cards
- ✅ **Anexos** - Upload de arquivos
- ✅ **Observadores** - Usuários que acompanham cards
- ✅ **Etiquetas** - Categorização de cards
- ✅ **Row Level Security** - Segurança por usuário

## 🔧 Tecnologias

- **Next.js 15** - Framework React
- **React 19** - Biblioteca de UI
- **Supabase** - Backend como Serviço
- **Tailwind CSS** - Framework CSS
- **Zustand** - Gerenciamento de Estado
- **TypeScript** - Tipagem estática

## 📝 Licença

MIT
