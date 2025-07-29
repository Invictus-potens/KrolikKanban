# KrolikKanban

Uma aplicação completa para gerenciamento de tarefas, notas e projetos com funcionalidades de Kanban, calendário e organização.

## 🚀 Funcionalidades

- ✅ **Autenticação** - Login e registro de usuários
- ✅ **Dashboard** - Visão geral das atividades
- ✅ **Kanban Boards** - Gerenciamento de tarefas com drag & drop
- ✅ **Notas** - Sistema completo de notas com pastas e tags
- ✅ **Calendário** - Agendamento de eventos e lembretes
- ✅ **Pastas** - Organização hierárquica de conteúdo
- ✅ **Tags** - Sistema de etiquetas coloridas
- ✅ **Row Level Security** - Segurança por usuário
- ✅ **Interface Responsiva** - Design moderno e adaptável

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Deploy**: Docker, Docker Compose

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Conta no Supabase (gratuita)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/KrolikKanban.git
cd KrolikKanban
```

### 2. Configure o Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá para Settings > API e copie:
   - Project URL
   - anon/public key

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o banco de dados

1. Vá para o SQL Editor no Supabase
2. Execute o conteúdo do arquivo `supabaseSchema.sql`
3. Isso criará todas as tabelas e políticas RLS

### 5. Instale as dependências

```bash
npm install
```

### 6. Execute em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🐳 Deploy com Docker

### Deploy Local

```bash
# Construir e executar com Docker Compose
docker-compose up --build

# Acesse http://localhost
```

### Deploy em Produção

1. Configure as variáveis de ambiente no servidor
2. Execute:

```bash
# Construir a imagem
docker build -t krolikkanban .

# Executar o container
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=sua_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave \
  --name krolikkanban \
  krolikkanban
```

### Deploy com Docker Compose (Produção)

```bash
# Criar arquivo .env para produção
cp .env.example .env

# Editar variáveis de ambiente
nano .env

# Executar
docker-compose -f docker-compose.yml up -d
```

## 📁 Estrutura do Projeto

```
KrolikKanban/
├── app/                    # Páginas Next.js
│   ├── auth/              # Autenticação
│   ├── calendar/          # Calendário
│   ├── folders/           # Pastas
│   ├── kanban/            # Boards Kanban
│   ├── notes/             # Notas
│   └── tags/              # Tags
├── components/             # Componentes React
│   ├── auth/              # Componentes de autenticação
│   ├── board/             # Componentes do Kanban
│   └── layout/            # Layout e navegação
├── lib/                   # Utilitários e configurações
│   ├── services.ts        # Serviços do banco de dados
│   ├── store.ts           # Estado global (Zustand)
│   └── supabase.ts        # Configuração do Supabase
├── supabaseSchema.sql     # Schema do banco de dados
├── Dockerfile             # Configuração Docker
├── docker-compose.yml     # Orquestração Docker
└── nginx.conf             # Configuração Nginx
```

## 🔧 Configuração do Banco de Dados

O arquivo `supabaseSchema.sql` contém:

- Tabelas para usuários, notas, eventos, boards, etc.
- Políticas RLS (Row Level Security)
- Índices para performance
- Funções para atualização automática de timestamps
- Triggers para criação automática de perfis

## 🔐 Segurança

- **Row Level Security (RLS)** - Usuários só veem seus próprios dados
- **Autenticação Supabase** - Sistema robusto de auth
- **Rate Limiting** - Proteção contra ataques
- **Headers de Segurança** - Configurados no Nginx

## 🎨 Interface

- Design moderno e responsivo
- Tema claro/escuro
- Animações suaves
- Drag & drop intuitivo
- Notificações em tempo real

## 📱 Funcionalidades Principais

### Dashboard
- Visão geral das atividades
- Estatísticas em tempo real
- Ações rápidas
- Notas recentes e eventos do dia

### Kanban
- Boards personalizáveis
- Colunas e cards arrastáveis
- Prioridades e datas de vencimento
- Atribuição de responsáveis

### Notas
- Editor rico
- Organização por pastas
- Sistema de tags
- Notas fixadas
- Busca avançada

### Calendário
- Visualização mensal/semanal
- Eventos coloridos
- Lembretes configuráveis
- Integração com notificações

## 🚀 Deploy em Produção

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Railway

1. Conecte ao GitHub
2. Configure as variáveis de ambiente
3. Deploy automático

### DigitalOcean App Platform

1. Conecte o repositório
2. Configure as variáveis
3. Deploy com SSL automático

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/KrolikKanban/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/KrolikKanban/wiki)
- **Email**: seu-email@exemplo.com

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend como serviço
- [Next.js](https://nextjs.org) - Framework React
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Lucide](https://lucide.dev) - Ícones
- [Zustand](https://zustand-demo.pmnd.rs) - Gerenciamento de estado
