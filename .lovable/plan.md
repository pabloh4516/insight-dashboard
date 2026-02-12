

# Atualizar Health Check para usar o endpoint correto e dados detalhados

## O que muda

A URL atual (`https://app.sellxpay.com.br/api/v1/health`) esta errada e retornava 404. A URL correta e `https://api.sellxpay.com.br/api/v1/health` e retorna um JSON rico com status de banco, Redis, fila e adquirentes.

## Alteracoes

### 1. Edge Function `health-check` - Corrigir URL e retornar JSON completo

- Trocar a URL para `https://api.sellxpay.com.br/api/v1/health`
- Em vez de consumir o body como texto, parsear o JSON e retornar todos os campos relevantes para o frontend
- Retornar: `status`, `statusCode`, `checks` (database, redis, queue, last_transaction, acquirers)

### 2. Hook `useHealthCheck` - Expandir o state com dados detalhados

Novo estado exposto:

- `status`: `"operational"` | `"degraded"` | `"down"` | `null`
- `statusCode`: HTTP status code
- `checks`: objeto com database, redis, queue, last_transaction, acquirers
- Logica de notificacao: disparar email quando transicionar para `"down"` ou quando o fetch falhar

### 3. `StatusBanner` - Usar as novas regras

- Fetch falhou / timeout / HTTP != 200 → Banner vermelho "Gateway OFFLINE"
- `status === "down"` → Banner vermelho "Gateway DOWN" (com detalhes de qual componente caiu)
- `status === "degraded"` → Banner amarelo "Gateway degradado"
- `checks.last_transaction.minutes_ago > 30` → Aplicar penalidade de inatividade do health check (substitui a logica atual de `lastEventAt` para inatividade quando o health check esta disponivel)
- `status === "operational"` e sem problemas → Banner verde normal

### 4. `SystemHealthBar` - Novos fatores granulares

Fatores adicionados ao tooltip:

- **Health check status**: "down" = -100, "degraded" = -30, "operational" = 0
- **Fila critica**: `checks.queue.status === "critical"` → -20
- **Inatividade (transacao)**: `checks.last_transaction.minutes_ago` usando os thresholds existentes (>10min = -20, >30min = -40, >60min = -70, >24h = -100)
- **Database/Redis**: mostrar latencia como informacao nos fatores
- **Adquirentes**: usar `checks.acquirers[].failure_rate` para enriquecer os dados de adquirentes

---

## Detalhes Tecnicos

### Edge Function `health-check/index.ts`

```text
URL: https://api.sellxpay.com.br/api/v1/health
Timeout: 10s
Retorno: { status, statusCode, checks, isUp, error? }
- isUp = statusCode === 200 && status !== "down"
- Se fetch falhar: { isUp: false, status: null, statusCode: null, error: message }
```

### Hook `useHealthCheck.ts`

Novo tipo:

```text
HealthCheckState {
  isUp: boolean | null
  status: "operational" | "degraded" | "down" | null
  statusCode: number | null
  lastCheckedAt: string | null
  error: string | null
  checks: {
    database: { status, latency_ms }
    redis: { status, latency_ms }
    queue: { status, failed_jobs }
    lastTransaction: { minutes_ago }
    acquirers: Array<{ name, failure_rate }>
  } | null
}
```

Logica de notificacao: disparar `notify-status-change` quando `prevStatus` era `"operational"` e novo status e `"down"` ou fetch falhou.

### StatusBanner.tsx

Prioridade de renderizacao:

1. `healthCheck.isUp === false` (fetch falhou) → Vermelho "Gateway OFFLINE (HTTP XXX)"
2. `healthCheck.status === "down"` → Vermelho "Gateway DOWN" + detalhes (DB/Redis offline)
3. `healthCheck.status === "degraded"` → Amarelo "Gateway degradado"
4. Inatividade via `checks.lastTransaction.minutes_ago > 30` → Amarelo/Vermelho de inatividade
5. Score normal com penalidades

### SystemHealthBar.tsx

Novos fatores no array:

- `"Status: down"` → impact -100
- `"Status: degraded"` → impact -30  
- `"Fila: X jobs falhados"` → impact -20 (se queue.status === "critical")
- `"Ultima transacao: Xmin atras"` → impact baseado nos thresholds
- Database e Redis latency como fatores informativos

### Arquivos modificados

- `supabase/functions/health-check/index.ts` - URL correta + retornar JSON completo
- `src/hooks/useHealthCheck.ts` - Novo tipo expandido + logica de status
- `src/components/StatusBanner.tsx` - Novas regras de banner (down/degraded/operational)
- `src/components/SystemHealthBar.tsx` - Fatores granulares do health check
