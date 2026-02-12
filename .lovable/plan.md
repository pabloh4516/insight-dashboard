

# Persistir Historico de Health Checks

## Problema

O historico de health checks e armazenado apenas em memoria (React state). Ao recarregar a pagina ou navegar, todos os checks anteriores sao perdidos. O usuario ve a timeline quase vazia porque so tem os checks feitos desde o ultimo carregamento.

## Solucao

Salvar cada resultado de health check em uma tabela no banco de dados, e ao carregar o dashboard, buscar os ultimos 30 registros para popular a timeline imediatamente.

## Etapas

### 1. Criar tabela `health_check_log`

Nova tabela com as colunas:
- `id` (uuid, PK)
- `project_id` (uuid, FK para projects)
- `checked_at` (timestamptz)
- `is_up` (boolean)
- `status` (text - operational/degraded/down)
- `status_code` (integer, nullable)
- `checks` (jsonb, nullable - dados detalhados dos componentes)

Politica RLS: leitura para usuarios autenticados do projeto; insert via service role (edge function).

### 2. Atualizar a Edge Function `health-check`

Apos consultar o endpoint de saude, inserir o resultado na tabela `health_check_log` usando o Supabase client com service role key.

### 3. Atualizar o hook `useHealthCheck`

- Ao inicializar, buscar os ultimos 30 registros da tabela `health_check_log` para popular `history` imediatamente
- Continuar com o polling normal a cada 2 minutos, adicionando novos entries ao estado local (que tambem serao salvos pela edge function)

### 4. Limpeza automatica

Adicionar uma politica de retencao (similar a tabela `events`) para manter apenas 7 dias de historico de health checks.

## Detalhes Tecnicos

- A edge function usara `SUPABASE_SERVICE_ROLE_KEY` (ja disponivel automaticamente) para inserir na tabela
- O frontend fara SELECT com o client autenticado (anon key + RLS)
- A timeline continuara mostrando 30 blocos, mas agora com dados persistidos entre sessoes
