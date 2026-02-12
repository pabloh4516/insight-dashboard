
# Dashboard com Dados Reais e Graficos do Gateway de Pagamento

## Visao Geral

Substituir todos os dados mock do Dashboard Overview e da pagina de Eventos por dados reais vindos da tabela `events` do banco de dados, com atualizacao em tempo real via Supabase Realtime. Criar graficos especificos para o dominio de pagamentos e uma lista de eventos com filtros e detalhes expandiveis.

## Estrutura das Mudancas

### 1. Novo hook: `useGatewayStats` (`src/hooks/useGatewayStats.ts`)

Hook centralizado que consome `useSupabaseEvents` e calcula todas as metricas do gateway:

- **Contadores de hoje**: pagamentos hoje, saques hoje, testes hoje
- **Valor total recebido hoje**: soma de `meta.amount` dos eventos `payment`
- **Valor total sacado hoje**: soma de `meta.amount` dos eventos `withdrawal`
- **Dados para graficos**: agrupamento por hora/dia para volume de pagamentos e saques
- **Proporção**: contagem de payment vs withdrawal para grafico de pizza/donut
- **Sparklines**: series temporais simplificadas para os cards

### 2. Dashboard Overview reescrito (`src/pages/DashboardOverview.tsx`)

Substituir completamente o dashboard mock por um focado no gateway de pagamento:

**Cards principais (3 colunas)**:
- Pagamentos Hoje (count + sparkline + trend vs ontem)
- Saques Hoje (count + sparkline)
- Valor Recebido Hoje (R$ formatado)

**Cards secundarios (compactos)**:
- Total de Eventos
- Erros (eventos com status "error")
- Testes de Conexao

**Grafico principal - Volume por Hora/Dia**:
- AreaChart com duas series: pagamentos e saques
- Seletor de periodo (1h, 6h, 24h, 7d)
- Legenda clicavel para esconder/mostrar series

**Grafico secundario - Valor Acumulado**:
- AreaChart mostrando a soma acumulada de R$ recebidos ao longo do tempo

**Grafico de proporcao - Pagamentos vs Saques**:
- Barra horizontal ou mini donut mostrando a distribuicao

**Feed de atividade recente**:
- Lista dos ultimos 10 eventos reais (substituindo o mock)
- Cada item mostra tipo, summary, valor e horario
- Clique expande para detalhes do meta

**Saude dos Provedores (Acquirers)**:
- Extrair acquirers unicos dos `meta.acquirer` dos eventos
- Mostrar status baseado na taxa de sucesso recente de cada acquirer

### 3. Pagina de Eventos reescrita (`src/pages/EventsPage.tsx`)

Substituir a pagina mock por uma lista de eventos reais com:

**Filtros**:
- Tabs ou botoes para filtrar por tipo: Todos | Pagamentos | Saques | Testes
- Busca por texto no campo summary

**Tabela de eventos**:
- Colunas: Tipo (badge colorido), Status (badge), Summary, Valor (de meta.amount), Horario
- Ordenacao por data (mais recente primeiro)

**Detalhes expandiveis**:
- Ao clicar numa linha, expande para mostrar todos os campos `meta`:
  - Payment: transaction_id, amount (formatado R$), method, acquirer, user_email
  - Withdrawal: withdrawal_id, amount (formatado R$), user_email
  - Test: (sem meta adicional)

### 4. Feed de atividade real (`src/components/RecentActivityFeed.tsx`)

Atualizar para consumir eventos reais do banco:
- Usar `useSupabaseEvents` com limite de 10
- Mapear tipos payment/withdrawal/test para icones e labels
- Mostrar valor e horario relativo

### 5. Sidebar atualizada (`src/components/TelescopeSidebar.tsx`)

- Atualizar contadores na sidebar para refletir os tipos reais (payment, withdrawal, test)
- Renomear itens do menu que nao se aplicam mais ao dominio

---

## Detalhes Tecnicos

### Hook `useGatewayStats`

```text
Entrada: projectId (do ProjectContext)
Saida:
  - paymentsToday: number
  - withdrawalsToday: number
  - totalReceivedToday: number (soma meta.amount dos payments)
  - totalWithdrawnToday: number
  - errorsToday: number
  - testsToday: number
  - hourlyData: { hour: string, payments: number, withdrawals: number, paymentAmount: number }[]
  - cumulativeData: { hour: string, total: number }[]
  - acquirerStats: { name: string, count: number, successRate: number }[]
  - recentEvents: DbEvent[] (ultimos 10)
```

Toda a logica de agregacao sera feita no cliente a partir dos eventos ja carregados pelo `useSupabaseEvents`. Para periodos maiores (7d), sera feita query com filtro `from/to`.

### Formatacao de valores

- Usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` para formatar valores em Reais
- Sparklines usam o componente SVG ja existente `SparklineCard`

### Realtime

O `useSupabaseEvents` ja possui subscription Realtime. Novos eventos payment/withdrawal aparecerao automaticamente nos contadores e graficos sem refresh.

### Graficos

Reutilizar Recharts (ja instalado):
- `AreaChart` para volume por hora e valor acumulado
- `PieChart` ou barra horizontal para proporcao payment/withdrawal
- Manter o estilo visual atual (gradientes, cores do tema)

### Pagina de Eventos - Filtros

Usar estado local com tabs para tipo e input para busca. Passar os filtros para `useSupabaseEvents` via parametros `type` e `search`.

### Arquivos a criar

- `src/hooks/useGatewayStats.ts`

### Arquivos a modificar

- `src/pages/DashboardOverview.tsx` (reescrever com dados reais)
- `src/pages/EventsPage.tsx` (reescrever com dados reais + filtros + detalhes)
- `src/components/RecentActivityFeed.tsx` (usar dados reais)
- `src/components/TelescopeSidebar.tsx` (ajustar labels e contadores)
- `src/components/SystemHealthBar.tsx` (basear em dados reais)
- `src/components/ProviderHealth.tsx` (basear em acquirers reais)
