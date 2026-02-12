

# Timeline de Disponibilidade por Hora

## Comportamento Desejado

A timeline de 30 blocos representa a hora atual:
- No inicio de cada hora (ex: 21:00), todos os blocos ficam vazios/cinza
- A cada 2 minutos, um novo bloco e preenchido (verde, amarelo ou vermelho)
- Ao final da hora, os 30 blocos estao preenchidos
- Quando vira a proxima hora (ex: 22:00), a timeline zera e recomeça

## Problema Atual

1. O hook carrega os ultimos 30 registros do banco **sem filtrar por hora** -- entao mistura checks de horas diferentes
2. Ha registros duplicados (varios checks no mesmo segundo) que "consomem" os 30 slots

## Correcoes

### 1. Filtrar checks pela hora atual (useHealthCheck.ts)

Ao carregar o historico do banco, filtrar apenas registros onde `checked_at` esta dentro da hora atual:
- Calcular o inicio da hora atual (ex: se sao 21:35, filtrar `checked_at >= 21:00:00`)
- Isso garante que ao virar a hora, a query retorna 0 registros e a timeline começa vazia

### 2. Deduplica no frontend (useHealthCheck.ts)

Antes de popular o `history`, agrupar registros que estao dentro do mesmo intervalo de 2 minutos, mantendo apenas 1 por slot. Isso evita que duplicatas consumam os 30 blocos.

### 3. Atualizar label do componente (UptimeTimeline.tsx)

Trocar "Disponibilidade (ultima hora)" para mostrar a hora atual, ex: "Disponibilidade (21:00 - 22:00)".

## Detalhes Tecnicos

### useHealthCheck.ts - Filtro por hora atual

Na query de carregamento inicial, adicionar `.gte('checked_at', startOfCurrentHour)` para trazer apenas os checks da hora vigente. Quando novos checks sao adicionados ao estado, verificar se ainda estamos na mesma hora; se a hora mudou, limpar o historico local.

### useHealthCheck.ts - Deduplicacao

Ao receber os dados do banco, calcular o "slot" de cada check (minuto 0-1 = slot 0, minuto 2-3 = slot 1, ..., minuto 58-59 = slot 29) e manter apenas o registro mais recente de cada slot.

### UptimeTimeline.tsx - Label dinamico

Usar a hora atual para exibir o intervalo, ex: "21:00 - 22:00". Cada bloco representara um intervalo de 2 minutos dentro da hora.

### Arquivos modificados

- `src/hooks/useHealthCheck.ts` -- filtro por hora + deduplicacao
- `src/components/UptimeTimeline.tsx` -- label dinamico com horario
