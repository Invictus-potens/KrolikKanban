# KrolikKanban

Um sistema completo de gerenciamento de projetos com funcionalidades de Kanban, calendário, notas e muito mais.

## 🚀 Deploy no Railway

### Método Simples (Recomendado)

1. **Fork ou clone este repositório**
2. **Conecte ao Railway**:
   - Vá para [railway.app](https://railway.app)
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha este repositório

3. **Configure as variáveis de ambiente**:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - `PORT`: Porta (geralmente 3000)

4. **Deploy automático**:
   - O Railway detectará automaticamente que é um projeto Next.js
   - Usará o Nixpacks para build e deploy
   - O health check está configurado em `/api/health`

### Configuração do Supabase

1. **Crie um projeto no Supabase**
2. **Execute o schema SQL**:
   ```sql
   -- Copie e execute o conteúdo de supabaseSchema.sql
   ```
3. **Configure as variáveis de ambiente** no Railway

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd KrolikKanban

# Instale as dependências
npm install --legacy-peer-deps

# Configure as variáveis de ambiente
cp env.example .env
# Edite o .env com suas configurações do Supabase

# Execute o projeto
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
npm run type-check   # Verifica tipos TypeScript

# Com Makefile
make dev-all         # Setup completo e inicia desenvolvimento
make prod-build      # Build para produção
```

## 📁 Estrutura do Projeto

```
KrolikKanban/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   └── globals.css        # Estilos globais
├── components/             # Componentes React
│   ├── auth/              # Componentes de autenticação
│   ├── board/             # Componentes do Kanban
│   └── layout/            # Componentes de layout
├── lib/                   # Utilitários e configurações
│   ├── supabase.ts        # Configuração do Supabase
│   ├── store.ts           # Estado global (Zustand)
│   └── services.ts        # Serviços de API
└── supabaseSchema.sql     # Schema do banco de dados
```

## 🎯 Funcionalidades

### ✅ Implementadas
- **Autenticação** com Supabase Auth
- **Kanban Boards** com drag & drop
- **Cards** com prioridade, tags, responsável
- **Colunas** organizáveis
- **Dashboard** com resumo
- **Layout responsivo** com Tailwind CSS
- **TypeScript** para type safety
- **Estado global** com Zustand

### 🔄 Em Desenvolvimento
- Calendário de eventos
- Sistema de notas
- Gerenciamento de pastas
- Sistema de tags

## 🛡️ Segurança

- **Row Level Security (RLS)** configurado no Supabase
- **Autenticação** obrigatória para todas as operações
- **Validação** de dados no frontend e backend
- **TypeScript** para prevenir erros de tipo

## 📊 Monitoramento

- **Health Check**: `/api/health`
- **Logs**: Disponíveis no Railway Dashboard
- **Métricas**: Monitoramento automático do Railway

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# Railway
PORT=3000
NODE_ENV=production
```

### Build e Deploy

O projeto usa **Nixpacks** para build automático no Railway:

1. **Detecção automática** do tipo de projeto
2. **Instalação de dependências** com `npm install --legacy-peer-deps`
3. **Build** com `npm run build`
4. **Start** com `npm start`

## 🚀 Deploy em Outras Plataformas

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### DigitalOcean App Platform
```bash
# Use o arquivo app.yaml
```

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique os logs no Railway Dashboard
2. Teste localmente com `npm run dev`
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Abra uma issue no GitHub

---

**KrolikKanban** - Organize seus projetos de forma eficiente! 🎯
