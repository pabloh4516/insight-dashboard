
# Remover Dados Mockup Restantes

## Dados Mockup Identificados

Após a implementação do dashboard com dados reais (payment gateway), ainda existem **6 páginas e 2 componentes** utilizando dados mockup que não são mais relevantes para o projeto:

### Páginas com dados mockup (não são integradas com o gateway real):
1. **MailPage** (`src/pages/MailPage.tsx`) — lista de e-mails (mockData: `mails`)
2. **CachePage** (`src/pages/CachePage.tsx`) — operações de cache (mockData: `cacheEntries`)
3. **QueriesPage** (`src/pages/QueriesPage.tsx`) — consultas ao banco (mockData: `queries`)
4. **CommandsPage** (`src/pages/CommandsPage.tsx`) — comandos executados (mockData: `commands`)
5. **ExceptionsPage** (`src/pages/ExceptionsPage.tsx`) — exceções/erros (mockData: `exceptions`)
6. **JobsPage** (`src/pages/JobsPage.tsx`) — tarefas em fila (mockData: `jobs`)

### Páginas/Componentes usando mockup como fallback:
7. **TimelinePage** (`src/pages/TimelinePage.tsx`) — usa `allEntries` do mockData (deveria mostrar eventos reais)
8. **LogsPage** (`src/pages/LogsPage.tsx`) — usa `staticLogs`, `staticRequests`, `staticExceptions` como fallback

### Componentes/Hooks desatualizados:
9. **useRealtimeData** (`src/hooks/useRealtimeData.ts`) — gera dados mockup aleatórios (deprecado)
10. **RealtimeContext** (`src/contexts/RealtimeContext.tsx`) — usado por componentes mockup
11. **LiveNotification** (`src/components/LiveNotification.tsx`) — usa AnyEntry do mockData

---

## Estrategia de Remocao

### Opcao Escolhida: Remocao Completa

Como o projeto agora é focado **EXCLUSIVAMENTE** em monitoramento de gateway de pagamento (payment, withdrawal, test), as páginas mockup de Telescope genérico (Mail, Cache, Queries, Commands, Exceptions, Jobs, Timeline) não fazem mais sentido.

### Mudancas:

1. **Deletar arquivo `src/data/mockData.ts`** — remove todas as definicoes e dados mockup

2. **Deletar 6 páginas mockup** (não usadas no novo dominio):
   - `src/pages/MailPage.tsx`
   - `src/pages/CachePage.tsx`
   - `src/pages/QueriesPage.tsx`
   - `src/pages/CommandsPage.tsx`
   - `src/pages/ExceptionsPage.tsx`
   - `src/pages/JobsPage.tsx`

3. **Deletar/Refatorar TimelinePage**:
   - `src/pages/TimelinePage.tsx` — remover (substitui-se pelo EventsPage que ja mostra timeline real)

4. **Refatorar LogsPage** (`src/pages/LogsPage.tsx`):
   - Remover importacoes de mockData
   - Adaptar para consumir dados reais de `useSupabaseEvents`

5. **Deletar hooks/componentes obsoletos**:
   - `src/hooks/useRealtimeData.ts` — nao é mais usado
   - `src/components/LiveNotification.tsx` — baseado em mockData (pode estar nao utilizado)

6. **Atualizar RealtimeContext**:
   - Remover se nao estiver sendo usado, ou refatorar para trabalhar com dados reais

7. **Atualizar routes/navigation** (`src/App.tsx`):
   - Remover rotas para MailPage, CachePage, QueriesPage, CommandsPage, ExceptionsPage, JobsPage, TimelinePage
   - Manter apenas: Dashboard, Events (reais), ClientRequests, Requests, Projects, Auth

---

## Detalhes Tecnicos

### Rota de Navegacao

As rotas mockup serão removidas:
```text
REMOVIDAS:
- /mails
- /cache
- /queries
- /commands
- /exceptions
- /jobs
- /timeline

MANTIDAS (dados reais):
- /dashboard
- /events (EventsPage com filtros)
- /client-requests (ClientRequestsPage)
- /requests (RequestsPage)
- /projects
- /auth
```

### LogsPage

LogsPage precisará ser refatorado para:
- Remover importacoes de mockData
- Consumir dados de `useSupabaseEvents` ou criar um hook similar
- Mapear eventos reais (payment, withdrawal, test) para o formato UnifiedLog

### Verificacoes

- Verificar se LiveNotification esta sendo utilizado em algum lugar (provavelmente não)
- Verificar se RealtimeContext ainda é necessario ou pode ser removido

---

## Resultado Final

Apos remocao:
- **Projeto 100% focado em payment gateway**
- **Apenas dados reais do banco aparecem no dashboard**
- **Codebase mais limpo e sem dependencias de dados mockup**
- **Sidebar e navegacao refletindo apenas funcionalidades relevantes**

