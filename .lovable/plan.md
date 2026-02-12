
# Erros, Latencia e Acquirer em Saques

## Visao Geral

Adicionar suporte completo para eventos de erro com destaque visual, latencia media por adquirente, e acquirer nos saques. Todas as mudancas se integram com os dados reais ja consumidos do banco.

---

## 1. Hook `useGatewayStats.ts` — Adicionar latencia

### Interface `AcquirerStat`
Adicionar campo `avgLatencyMs: number` ao tipo.

### Logica de agregacao dos acquirers
No loop que calcula `acqMap`, acumular tambem `totalLatency` e `latencyCount` a partir de `meta.response_time_ms` (quando presente). Calcular media: `totalLatency / latencyCount`.

### Novo campo: `recentErrors`
Adicionar `recentErrors: DbEvent[]` ao retorno — filtrar eventos com `status === 'error'`, limitar a 5.

---

## 2. Dashboard `DashboardOverview.tsx` — Card de erros

### Card de erros expandido
Substituir o card compacto "Erros" atual (linha 94) por um card maior quando `errorsToday > 0`:
- Fundo com tint vermelho sutil (`bg-destructive/5`)
- Contagem de erros + lista dos ultimos 3-5 erros recentes (summary truncado + acquirer + horario)
- Quando `errorsToday === 0`, manter card compacto normal

### Sem outras mudancas no dashboard
Os graficos e demais cards continuam iguais.

---

## 3. `ProviderHealth.tsx` — Latencia media

### Mostrar latencia ao lado do success rate
Para cada acquirer, alem da barra de success rate, mostrar a latencia media:
- Formato: "1.2s" ou "850ms"
- Cor: verde (< 1000ms), amarelo (1000-3000ms), vermelho (> 3000ms)

### Layout
Adicionar o indicador de latencia entre o valor em BRL e a barra de success rate.

---

## 4. `EventsPage.tsx` — Erros e latencia nos detalhes

### Detalhes de payment (expanded)
- Adicionar `MetaItem` para `response_time_ms` com formatacao ("1.2s") e cor condicional
- Quando `status === 'error'`: mostrar `error_code` e `error_message` em destaque com fundo vermelho sutil e texto vermelho

### Detalhes de withdrawal (expanded)
- Adicionar `MetaItem` para `Adquirente` mostrando `meta.acquirer`

### Linha do evento (collapsed)
- Quando `status === 'error'`: adicionar tint vermelho sutil no fundo da linha (`bg-destructive/5`)

---

## Detalhes Tecnicos

### Arquivos a modificar

1. **`src/hooks/useGatewayStats.ts`**
   - `AcquirerStat`: adicionar `avgLatencyMs: number`
   - Acumular `response_time_ms` no loop de acquirers
   - Adicionar `recentErrors` ao retorno

2. **`src/pages/DashboardOverview.tsx`**
   - Substituir card compacto "Erros" por card expandido com lista de erros recentes

3. **`src/components/ProviderHealth.tsx`**
   - Mostrar `avgLatencyMs` formatado ao lado de cada acquirer

4. **`src/pages/EventsPage.tsx`**
   - Payment expanded: adicionar `response_time_ms` e bloco de erro (`error_code` + `error_message`)
   - Withdrawal expanded: adicionar `Adquirente`
   - Linha com `status === 'error'`: fundo vermelho sutil

### Helper de formatacao de latencia

```text
formatLatency(ms: number): string
  - ms < 1000 -> "850ms"
  - ms >= 1000 -> "1.2s"

latencyColor(ms: number): string
  - < 1000 -> "text-primary" (verde)
  - 1000-3000 -> "text-warning" (amarelo)
  - > 3000 -> "text-destructive" (vermelho)
```

### Nenhuma mudanca no banco ou edge function
Todos os novos campos (`response_time_ms`, `error_code`, `error_message`, `acquirer` em saques) ja sao armazenados no campo JSONB `meta` — basta le-los no frontend.
