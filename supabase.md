
## Configurar Row Level Security (RLS)

O script SQL já configura as políticas RLS automaticamente. Isso garante que:
- Usuários só podem ver seus próprios dados
- Usuários só podem criar/editar/deletar seus próprios dados
- Dados são isolados por usuário


## Estrutura das Tabelas

### Users
- `id`: UUID (referência ao auth.users)
- `email`: Email do usuário
- `full_name`: Nome completo
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Tags
- `id`: UUID único
- `name`: Nome da tag
- `user_id`: ID do usuário proprietário
- `color`: Cor da tag (hex)
- `created_at`: Data de criação
- `updated_at`: Data de atualização


## Funcionalidades Implementadas

- ✅ Autenticação com email/senha
- ✅ Criação automática de perfil de usuário
- ✅ CRUD de notas
- ✅ CRUD de pastas
- ✅ CRUD de tags
- ✅ CRUD de eventos do calendário
- ✅ Row Level Security (RLS)
- ✅ Atualização automática de timestamps
- ✅ Índices para performance

## Próximos Passos

1. Implementar autenticação social (Google, GitHub)
2. Adicionar upload de arquivos
3. Implementar notificações push
4. Adicionar backup automático
5. Implementar busca avançada

## Troubleshooting

### Erro de CORS
- Verifique se as URLs estão corretas nas configurações de autenticação

### Erro de RLS
- Verifique se as políticas foram criadas corretamente
- Confirme se o usuário está autenticado

### Erro de conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto está ativo no Supabase

## Recursos Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript) 