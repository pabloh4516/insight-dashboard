

# Integração Backend — Supabase via Lovable Cloud

Conectar o Telescope a um backend real com tabelas, RLS, Edge Function de ingestão e Realtime.

## Etapas

### 1. Ativar Lovable Cloud
- Habilitar o backend Supabase integrado no projeto
- Isso criará automaticamente a URL e chaves do Supabase

### 2. Criar tabelas no banco

**Tabela `projects`:**
- `id` (uuid, PK, auto-gerado)
- `name` (text, não nulo)
- `api_token` (text, unique, não nulo)
- `user_id` (uuid, referência a auth.users, ON DELETE CASCADE)
- `created_at` (timestamptz, default now())

**Tabela `events`:**
- `id` (uuid, PK, auto-gerado)
- `project_id` (text, não nulo)
- `type` (text, não nulo) — request, error, job, email, webhook_in, webhook_out, login
- `status` (text, não nulo) — success, warning, error
- `summary` (text)
- `meta` (jsonb)
- `created_at` (timestamptz, default now())

**Índices** em: `project_id`, `type`, `status`, `created_at`

**Realtime** ativado na tabela `events`

### 3. Row Level Security (RLS)

**Tabela `projects`:**
- SELECT: `user_id = auth.uid()` — usuário só vê seus projetos
- INSERT: `user_id = auth.uid()` — usuário cria projetos associados a si
- UPDATE: `user_id = auth.uid()` — só edita seus projetos
- DELETE: `user_id = auth.uid()` — só deleta seus projetos

**Tabela `events`:**
- SELECT: usuário vê eventos dos projetos que é dono (JOIN com projects onde `projects.user_id = auth.uid()`)
- INSERT: bloqueado para usuários normais (apenas service_role via Edge Function)

### 4. Edge Function `ingest`

Endpoint que sistemas externos chamam para enviar eventos:
- Recebe POST com `Authorization: Bearer {api_token}`
- Valida o token na tabela `projects` (usando service_role client)
- Aceita body com array de eventos
- Insere na tabela `events` com o `project_id` do token
- Retorna `{ success: true, count: N }` ou 401 se token inválido
- CORS habilitado

### 5. Integração no Frontend

**Arquivo `src/integrations/supabase/client.ts`:**
- Cliente Supabase configurado automaticamente pelo Lovable Cloud

**Novo: `src/hooks/useSupabaseEvents.ts`:**
- Hook que busca eventos da tabela `events` filtrados por `project_id`
- Suporta filtros por tipo, status e período
- Busca textual na coluna `summary`
- Subscribe no Realtime para novos eventos ao vivo

**Novo: `src/hooks/useProjects.ts`:**
- Hook para CRUD de projetos do usuário logado
- Gerar token API automaticamente (crypto.randomUUID)

**Novo: `src/pages/ProjectsPage.tsx`:**
- Página para gerenciar projetos (criar, ver token, deletar)
- Mostra o token API para copiar e usar no sistema externo

**Atualizar: `src/pages/DashboardOverview.tsx`:**
- Seletor de projeto no topo
- Cards de estatísticas calculados dos dados reais (COUNT, filtros)
- Gráfico de atividade com dados agregados do Supabase
- Feed de atividade com dados reais + Realtime

**Atualizar: Todas as páginas de listagem (Requests, Exceptions, etc.):**
- Manter a estrutura visual atual
- Trocar dados mock por queries ao Supabase filtradas por tipo
- Manter filtros funcionais com queries parametrizadas

**Atualizar: `src/components/TelescopeSidebar.tsx`:**
- Adicionar seletor de projeto na sidebar
- Contagens na sidebar vêm do banco real

**Atualizar: `src/contexts/RealtimeContext.tsx` e `src/hooks/useRealtimeData.ts`:**
- Trocar geração de dados mock por subscription real do Supabase Realtime
- Manter a mesma interface (liveEntries, isLive, toggleLive)

### 6. Autenticação

- Adicionar login/signup básico com Supabase Auth (email/password)
- Página de login simples
- Rotas protegidas — redirecionar para login se não autenticado
- Não precisa de tabela de profiles (apenas auth.users + projects)

---

## Detalhes técnicos

### Migração SQL (resumo)
```text
-- Tabela projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  api_token text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Tabela events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  summary text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS projects
CREATE POLICY "Users manage own projects" ON projects
  FOR ALL USING (user_id = auth.uid());

-- RLS events (SELECT via join)
CREATE POLICY "Users see own project events" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id::text = events.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Events INSERT blocked for anon/authenticated
CREATE POLICY "Only service_role inserts events" ON events
  FOR INSERT WITH CHECK (false);
```

### Edge Function `ingest`
- Arquivo: `supabase/functions/ingest/index.ts`
- Usa `createClient` com `SUPABASE_SERVICE_ROLE_KEY` para inserir eventos
- Valida token via query na tabela `projects`
- `verify_jwt = false` no config.toml (autenticação via api_token, não JWT)

### Realtime subscription
```text
supabase
  .channel('events-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'events',
    filter: `project_id=eq.${selectedProjectId}`
  }, callback)
  .subscribe()
```

### Ordem de implementação
1. Ativar Lovable Cloud
2. Criar migração com tabelas + RLS + índices
3. Criar Edge Function `ingest`
4. Adicionar autenticação (login/signup)
5. Criar página de projetos
6. Conectar dashboard aos dados reais
7. Conectar páginas de listagem aos dados reais

