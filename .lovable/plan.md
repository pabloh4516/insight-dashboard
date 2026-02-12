

# Corrigir Adquirentes e Contagem do Menu Lateral

## Problema 1: Apenas uma adquirente aparecendo no ProviderHealth

O componente `ProviderHealth` usa o hook `useGatewayStats`, que calcula as adquirentes a partir do campo `meta.acquirer` dos **eventos** salvos na tabela `events`. Se apenas a Cyberpayment tem eventos com esse campo preenchido, somente ela aparece.

Ja o componente `AcquirerHealthTable` usa `useHealthCheck`, que busca os dados diretamente da **API de saude** (`/api/v1/health`) -- por isso mostra todas as adquirentes corretamente.

### Solucao

Unificar a fonte de dados de adquirentes: o `ProviderHealth` deve usar os dados vindos da API de saude (do `useHealthCheck`) em vez de calcular a partir dos eventos. Isso garante que todas as adquirentes retornadas pela API aparecem, nao apenas as que tem eventos registrados.

## Problema 2: Contagem do menu lateral nao limpa ao abrir a pagina

O `useEventCounts` retorna a contagem total de eventos por tipo e mostra no sidebar. Esses numeros nunca sao zerados/limpos quando o usuario navega para a pagina correspondente, dando a impressao de que sao notificacoes nao lidas acumulando.

### Solucao

Implementar um sistema de "leitura" por pagina: ao navegar para uma pagina (ex: `/requests`), marcar aquele tipo como "visto" e exibir apenas a contagem de eventos **novos desde a ultima visita**. Isso pode ser feito armazenando o timestamp da ultima visita a cada pagina no `localStorage` e filtrando a contagem para mostrar apenas eventos com `created_at` posterior a esse timestamp.

## Etapas Tecnicas

### 1. Alterar ProviderHealth para usar dados do health check

- Importar `useHealthCheck` em vez de `useGatewayStats`
- Usar `checks.acquirers` (que vem da API de saude) para renderizar a lista
- Manter o layout visual atual, adaptando os campos (`transactions_24h`, `success_rate`, `last_transaction_at`)

### 2. Criar sistema de contagem "nao lida" no sidebar

- Criar um hook `useLastVisited` que armazena no `localStorage` um mapa `{ [eventType]: timestamp }` com a data da ultima visita a cada pagina
- Atualizar `useEventCounts` para aceitar um filtro `since` por tipo, contando apenas eventos com `created_at > lastVisited`
- No `TelescopeSidebar`, usar o timestamp salvo para cada tipo ao exibir a contagem
- Ao navegar para uma pagina, atualizar o timestamp daquele tipo no `localStorage`

### 3. Arquivos modificados

- `src/components/ProviderHealth.tsx` -- trocar de `useGatewayStats` para `useHealthCheck`
- `src/hooks/useSupabaseEvents.ts` -- adicionar filtro `since` no `useEventCounts`
- `src/components/TelescopeSidebar.tsx` -- integrar sistema de "ultima visita" para limpar contagens
- `src/hooks/useLastVisited.ts` -- novo hook para gerenciar timestamps de ultima visita por pagina

