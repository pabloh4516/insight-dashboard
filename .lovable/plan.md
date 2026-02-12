# Detectar Queda do Gateway (Monitoramento de Inatividade)

## Problema Atual

O painel mostra "Sistema funcionando normalmente" mesmo quando o gateway para de enviar eventos. Isso acontece porque a logica atual so analisa erros entre os eventos existentes, mas nao detecta a *ausencia* de novos eventos.

## Solucao

### 1. Detectar gap de inatividade

Comparar o horario do ultimo evento recebido com o horario atual. Se passou mais tempo do que o esperado, considerar o sistema inativo.

Regras:

- **Sem eventos nas ultimas 24h**: Score vai a 0, banner vermelho com "Gateway parece estar offline"
- **Sem eventos nos ultimos 30 minutos**: Penalidade de -40 pontos no score
- **Sem eventos nos ultimos 10 minutos**: Penalidade de -20 pontos no score

### 2. Expor timestamp do ultimo evento

Adicionar `lastEventAt` ao retorno do hook `useGatewayStats` para que os componentes saibam quando foi o ultimo evento.

### 3. Atualizar StatusBanner

Antes de calcular o score normal, verificar se ha inatividade. Se o ultimo evento foi ha mais de 30 minutos, mostrar um banner especifico:

```text
Vermelho: "Seu gateway parece estar offline. Nenhum evento recebido nos ultimos X minutos."
Amarelo:  "Atencao: nenhum evento recebido nos ultimos X minutos."
```

### 4. Atualizar SystemHealthBar

Incluir a penalidade de inatividade nos fatores da barra de saude, com label descritivo:

```text
"Sem eventos ha X minutos" → -20 a -100 pontos
```

---

## Detalhes Tecnicos

### Arquivos a Modificar

`**src/hooks/useGatewayStats.ts**`

- Calcular `lastEventAt` a partir do evento mais recente no array
- Adicionar ao tipo `GatewayStats` e ao retorno do hook

`**src/components/StatusBanner.tsx**`

- Calcular minutos desde o ultimo evento usando `lastEventAt`
- Se inativo > 30min: mostrar banner vermelho/amarelo de inatividade *em vez de* banner normal
- Se inativo > 10min: adicionar penalidade extra no calculo do score

`**src/components/SystemHealthBar.tsx**`

- Importar `lastEventAt` do hook
- Calcular minutos de inatividade
- Adicionar fator ao array `factors` com penalidade proporcional:
  - Sem eventos ha 10-30min: -20 pontos
  - Sem eventos ha 30-60min: -40 pontos
  - Sem eventos ha mais de 1h: -70 pontos
  - Sem eventos ha mais de 24h: -100 pontos (score vai a 0)

### Logica de Inatividade (pseudocodigo)

```text
lastEventAt = max(events.created_at) ou null
minutesInactive = lastEventAt ? (now - lastEventAt) / 60000 : Infinity

if minutesInactive > 1440 (24h)  → penalty = 100
if minutesInactive > 60  (1h)    → penalty = 70
if minutesInactive > 30  (30min) → penalty = 40
if minutesInactive > 10  (10min) → penalty = 20
else                             → penalty = 0
```

Preciso de 3 coisas alem do que voce ja propos:

  1. Health check ativo: A cada 2 minutos, fazer um fetch em https://app.sellxpay.com.br/api/v1/health. Se retornar qualquer coisa diferente de 200, marcar como DOWN imediatamente (sem esperar gap de eventos).

   Mostrar o HTTP status code no banner.

  2. Combinar as duas detecções: O score final deve considerar AMBOS - o health check ativo E o gap de inatividade. Se o health check falha, score vai a 0 instantaneamente. Se o health check passa mas nao tem

  eventos novos, aplicar as penalidades de inatividade que voce propos.

  3. Notificação externa: Quando o status mudar de OK para DOWN, disparar uma notificacao (webhook, email ou Telegram) para eu ser avisado mesmo fora do painel.