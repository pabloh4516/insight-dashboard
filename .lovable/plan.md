

# Adicionar Indicador "Ao Vivo" nas Paginas

## Problema
O hook `useSupabaseEvents` ja possui subscription Realtime via Supabase (novos eventos chegam automaticamente), mas nao ha nenhum indicador visual de "Ao Vivo" nas paginas. O usuario nao percebe que o sistema esta monitorando em tempo real.

## Mudancas

### 1. Indicador "Ao Vivo" na pagina de Logs (`src/pages/LogsPage.tsx`)
- Adicionar badge pulsante "Ao Vivo" ao lado do contador de registros na barra superior
- Destacar visualmente os eventos que chegaram via Realtime (os `liveEvents`) com uma animacao de fade-in e borda colorida
- Usar o retorno `liveEvents` do hook para saber quantos eventos novos chegaram em tempo real

### 2. Indicador "Ao Vivo" no componente GenericEventPage (`src/components/GenericEventPage.tsx`)
- Adicionar o mesmo badge pulsante "Ao Vivo" no header de todas as paginas genericas (Exceptions, Queries, Jobs, etc.)
- Destacar eventos recebidos via Realtime com animacao

### 3. Indicador no Sidebar (`src/components/TelescopeSidebar.tsx`)
- Atualizar os contadores no sidebar para refletir eventos em tempo real (ja funciona via `useEventCounts` com refetch de 30s)

## Detalhes Tecnicos

O hook `useSupabaseEvents` ja retorna:
- `events`: todos os eventos (Realtime + query inicial) deduplicados
- `liveEvents`: apenas os que chegaram via subscription Realtime
- A subscription ja esta ativa com `postgres_changes` no canal `events-realtime-{projectId}`

As mudancas sao puramente visuais:
- Badge com dot pulsante verde + texto "Ao Vivo" quando `liveEvents.length > 0` ou quando a subscription esta ativa
- Eventos do `liveEvents` recebem classe CSS com `animate-fade-in` e borda esquerda verde para destaque
- Contagem de "X novos" ao lado do badge quando ha eventos Realtime recentes

### Arquivos modificados:
- `src/pages/LogsPage.tsx` — adicionar badge "Ao Vivo" e destaque visual nos live events
- `src/components/GenericEventPage.tsx` — adicionar badge "Ao Vivo" no header

