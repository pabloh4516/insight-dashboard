

# Refatorar Dashboard para Monitoramento Tecnico

## Objetivo
Transformar o dashboard de metricas financeiras para foco em saude tecnica do sistema: "O sistema esta saudavel? Tem erros? Tem ataques? As adquirentes estao respondendo?"

---

## O que sera REMOVIDO

### DashboardOverview.tsx
- Cards "Recebido Hoje" (R$) e "Sacado Hoje" (R$) no hero
- Card "Pagamentos Hoje" com sparkline
- Card "Saques Hoje" com sparkline  
- Card "Valor Recebido" com sparkline
- Grafico "Valor Acumulado (R$)" (cumulative chart)
- Grafico "Proporcao" (pie chart pagamentos vs saques)
- Referencia a `formatBRL`, `PieChart`, `Pie`, `Cell`, `DollarSign`, `CreditCard`, `ArrowDownToLine`

### useGatewayStats.ts
- Campos financeiros: `totalReceivedToday`, `totalWithdrawnToday`, `paymentsToday`, `withdrawalsToday`
- Dados hourly financeiros: `paymentAmount`, `withdrawalAmount`, `payments`, `withdrawals`
- `cumulativeData` inteiro
- Funcao `getAmount`

### EventsPage.tsx
- Coluna "Valor" (`formatBRL(amount)`) da linha do evento
- Manter filtros por tipo e detalhes expandidos com todos os campos meta

### RecentActivityFeed.tsx
- Remover exibicao de `formatBRL(amount)` na linha do evento
- Manter o feed funcional com todos os tipos de evento

---

## O que sera ADICIONADO/MODIFICADO

### useGatewayStats.ts — Novas metricas tecnicas
- `requestsToday`: count de `type === 'request'`
- `jobsToday`: count de `type === 'job'`
- `jobSuccessRate`: porcentagem de jobs com `status === 'success'`
- `securityAlertsToday`: count de `type === 'security'`
- Hourly data reformulado: `requests` e `errors` por hora (em vez de payments/withdrawals)
- Remover `cumulativeData`

### DashboardOverview.tsx — Novo layout

**Hero (manter):**
- SystemHealthBar (2 colunas) — score baseado em taxa de erro e latencia
- 2 mini-cards: "Requisicoes Hoje" e "Erros Hoje" (substituem R$ recebido/sacado)

**Cards principais (3 colunas):**
- Requisicoes Hoje (count requests) com sparkline
- Erros Hoje (count errors) com sparkline  
- Jobs Processados (count jobs + taxa de sucesso)

**Cards secundarios (4 colunas):**
- Total Eventos
- Alertas de Seguranca (com destaque se > 0)
- Adquirentes
- Card de erros expandivel (manter logica atual)

**Grafico principal:**
- "Volume de Requisicoes por Hora" — area chart com series: requests e errors
- Manter seletor de periodo e toggle de series

**Grafico secundario (substituir cumulative + pie):**
- "Erros por Hora" — area chart vermelho mostrando distribuicao de erros ao longo do tempo
- Remover pie chart completamente

**Rodape (manter):**
- RecentActivityFeed (ultimos 10 eventos de qualquer tipo)
- ProviderHealth (adquirentes — metrica tecnica)

### SystemHealthBar.tsx
- Ajustar calculo do score: baseado em taxa de erro + latencia media dos adquirentes (sem metricas financeiras)
- Adicionar fator de latencia media ao score

### EventsPage.tsx
- Expandir filtros de tipo para incluir: request, exception, job, email, command, query, security, payment, withdrawal
- Remover `formatBRL(amount)` da linha do evento
- Manter detalhes expandidos com todos os campos meta

---

## Detalhes Tecnicos

### Novo HourlyDataPoint
```text
interface HourlyDataPoint {
  hour: string;
  requests: number;
  errors: number;
}
```

### Novas metricas no GatewayStats
```text
interface GatewayStats {
  requestsToday: number;
  jobsToday: number;
  jobSuccessRate: number;
  securityAlertsToday: number;
  errorsToday: number;
  totalEvents: number;
  hourlyData: HourlyDataPoint[];
  acquirerStats: AcquirerStat[];
  recentErrors: DbEvent[];
  recentEvents: DbEvent[];
  isLoading: boolean;
  refetch: () => void;
}
```

### Arquivos modificados
1. `src/hooks/useGatewayStats.ts` — refatorar metricas
2. `src/pages/DashboardOverview.tsx` — novo layout tecnico
3. `src/components/SystemHealthBar.tsx` — incluir latencia no score
4. `src/components/RecentActivityFeed.tsx` — remover valor R$
5. `src/components/ProviderHealth.tsx` — remover `formatBRL`, manter totalAmount como referencia interna
6. `src/pages/EventsPage.tsx` — expandir filtros, remover coluna valor

