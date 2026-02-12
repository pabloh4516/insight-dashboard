# Integracao Completa com Health Check do Gateway

## Visao Geral

Reescrever o sistema de monitoramento para consumir todos os dados do endpoint `/api/v1/health`, adicionar painel de componentes, timeline de disponibilidade, detalhes de adquirentes e notificacoes no browser.

---

## 1. Reescrever o Hook `useHealthCheck`

**Arquivo:** `src/hooks/useHealthCheck.ts`

Mudancas principais:

- Expandir o tipo `HealthChecks` para incluir os novos campos: `php`, `storage`, `database.connections`, `database.driver`, `acquirers[].transactions_24h`, `acquirers[].success_rate`, `acquirers[].last_transaction_at`, `last_transaction.last_at`, `last_transaction.status`
- Manter historico das ultimas 30 verificacoes em um array `history` no state
- Cada entrada do historico: `{ timestamp, status, isUp }`
- Adicionar logica de notificacao no browser: quando status mudar de "operational" para "down"/"degraded"/null, disparar `Notification API` e tocar som de alerta
- Manter a logica existente de disparar email via `notify-status-change`

Novo tipo exportado:

```text
HealthCheckEntry {
  timestamp: string
  status: "operational" | "degraded" | "down" | null
  isUp: boolean
}

HealthChecks {
  php: { status, version, memory_usage_mb, memory_limit } | null
  database: { status, latency_ms, driver, connections: { active, max, percent } } | null
  redis: { status, latency_ms } | null
  queue: { status, pending_jobs, failed_jobs } | null
  storage: { status, writable } | null
  lastTransaction: { status, last_at, minutes_ago } | null
  acquirers: Array<{ name, slug, status, transactions_24h, success_rate, failure_rate, last_transaction_at }>
}

HealthCheckState {
  ...campos existentes...
  history: HealthCheckEntry[]  // ultimas 30 verificacoes
}
```

---

## 2. Atualizar Edge Function `health-check`

**Arquivo:** `supabase/functions/health-check/index.ts`

- Parsear e retornar todos os campos novos do JSON (php, storage, database.connections, acquirers completo, last_transaction completo)
- Manter a estrutura atual mas passar os dados adicionais

---

## 3. Atualizar Score do Sistema

**Arquivo:** `src/components/SystemHealthBar.tsx`

Substituir a logica de score atual pela formula detalhada:

```text
Score base = 100

// Prioridade maxima
fetch falhou / status "down" → score = 0

// Status degraded
status === "degraded" → -30

// Componentes individuais
database.status === "error" → -40
database.status === "slow" → -10
redis.status === "error" → -30
redis.status === "slow" → -5
queue.status === "critical" → -25
queue.status === "warning" → -10
storage.status === "error" → -20

// Adquirentes
Cada adquirente "critical" → -15
Cada adquirente "warning" → -5

// Inatividade
minutes_ago > 1440 → -100
minutes_ago > 60 → -40
minutes_ago > 30 → -20
minutes_ago > 10 → -10

Score minimo = 0
```

Atualizar o tooltip com todos os fatores individuais listados.

---

## 4. Atualizar Banner de Status

**Arquivo:** `src/components/StatusBanner.tsx`

Manter a mesma prioridade de renderizacao ja implementada, mas atualizar as mensagens:

- Fetch falhou: "Gateway offline - sem resposta ha X minutos"
- status "down": "Gateway com falha critica - [listar componentes com problema]"
- status "degraded": "Gateway degradado - [listar componentes com problema]"
- Inatividade > 30min: "Nenhuma transacao nos ultimos X minutos"
- Tudo ok: "Sistema operacional"

---

## 5. Criar Painel de Componentes

**Novo arquivo:** `src/components/ComponentHealthPanel.tsx`

Card com grid de componentes, cada um com indicador colorido:


| Componente  | Verde | Amarelo | Vermelho |
| ----------- | ----- | ------- | -------- |
| PHP         | ok    | -       | -        |
| Database    | ok    | slow    | error    |
| Redis       | ok    | slow    | error    |
| Fila        | ok    | warning | critical |
| Storage     | ok    | -       | error    |
| Adquirentes | ok    | warning | critical |


Mostrar informacoes extras ao lado de cada componente:

- Database: latencia em ms, conexoes ativas/max
- Redis: latencia em ms
- Fila: jobs pendentes e falhados
- PHP: versao e memoria

---

## 6. Criar Timeline de Disponibilidade

**Novo arquivo:** `src/components/UptimeTimeline.tsx`

Barra horizontal com 30 blocos (1 bloco = 1 check de 2 min = 1 hora total).
Cada bloco colorido conforme o resultado daquele check:

- Verde: operational
- Amarelo: degraded
- Vermelho: down ou fetch falhou
- Cinza: sem dado ainda

Tooltip em cada bloco mostrando horario e status.

---

## 7. Criar Tabela de Adquirentes Detalhada

**Novo arquivo:** `src/components/AcquirerHealthTable.tsx`

Tabela com colunas:

- Nome (com slug em texto menor)
- Status (badge colorido: verde/amarelo/vermelho)
- Transacoes 24h
- Taxa de sucesso %
- Taxa de falha %
- Ultima transacao (tempo relativo usando `formatDistanceToNow`)

Dados vindos de `useHealthCheck().checks.acquirers`.

---

## 8. Notificacoes no Browser

**Dentro de** `src/hooks/useHealthCheck.ts`

Quando o status mudar de "operational" para qualquer outro estado:

- Pedir permissao via `Notification.requestPermission()` (uma vez)
- Disparar `new Notification("Gateway Alert", { body: "..." })`
- Tocar som de alerta usando `new Audio()` com um beep sintetizado via Web Audio API
- Manter a chamada existente ao `notify-status-change` para email

---

## 9. Integrar no Dashboard

**Arquivo:** `src/pages/DashboardOverview.tsx`

Adicionar os novos componentes abaixo do banner de status:

1. `UptimeTimeline` - timeline de disponibilidade (logo abaixo do banner)
2. `ComponentHealthPanel` - painel de componentes (na area do hero, ao lado ou abaixo da SystemHealthBar)
3. `AcquirerHealthTable` - substituir ou complementar o `ProviderHealth` existente com dados do health check

---

## Detalhes Tecnicos

### Arquivos a criar

- `src/components/ComponentHealthPanel.tsx`
- `src/components/UptimeTimeline.tsx`
- `src/components/AcquirerHealthTable.tsx`

### Arquivos a modificar

- `supabase/functions/health-check/index.ts` - retornar todos os campos
- `src/hooks/useHealthCheck.ts` - tipos expandidos, historico, notificacoes browser
- `src/components/StatusBanner.tsx` - mensagens atualizadas com lista de componentes
- `src/components/SystemHealthBar.tsx` - formula de score granular
- `src/pages/DashboardOverview.tsx` - integrar novos componentes

### Dependencias

- Nenhuma nova dependencia. Usa Web Audio API e Notification API nativas do browser.
- Componentes UI existentes: Badge, Table, Tooltip, Card.

&nbsp;

 1. Browser em background - setInterval de 2 min é throttled pelo Chrome quando a aba fica em segundo plano. Pede pra ele adicionar um listener de visibilitychange para re-checar imediatamente quando o

  usuário voltar à aba.

  2. Botão "Verificar agora" - Além do polling automático, ter um botão manual para forçar check instantâneo.

  3. Edge Function como proxy - Se o Supabase cair, o monitoramento cai junto. Ele deveria tratar o erro da Edge Function separado do erro do gateway (diferenciar "não consegui acessar minha edge function" de

  "gateway está offline").

  De resto, o plano está correto - tipos, score, timeline, notificações, tudo alinhado com o endpoint. Pode aprovar.