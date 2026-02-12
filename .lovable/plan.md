
# Adicionar Paginação às Páginas de Eventos

## Problema
- Atualmente, todas as páginas de eventos (Commands, Requests, Exceptions, etc.) carregam até 500 eventos do banco e exibem todos na tela
- Isso causa renderização pesada e scroll infinito
- Usuário pode ficar perdido em listas muito grandes

## Solução
Implementar paginação client-side com 25 itens por página (configurável) em:
1. **GenericEventPage** - Afeta Commands, Requests, Exceptions, Jobs, Mail, Cache, Queries, Webhooks
2. **EventsPage** - Página de eventos com filtros
3. **SecurityPage** - Página de segurança

## Mudanças Técnicas

### 1. Novo: `src/components/PaginationControls.tsx`
Componente reutilizável de paginação com:
- Navegação: Anterior/Próxima
- Indicador: "Página X de Y"
- Seletor de itens por página (10, 25, 50, 100)
- Estado integrado com URL params (opcional)

```typescript
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
  totalItems: number;
}
```

### 2. Modificar: `src/components/GenericEventPage.tsx`
- Adicionar estado de paginação com `useState(1)`
- Fatiar `events` array para mostrar apenas items do range
- Adicionar `<PaginationControls />` no rodapé
- Padrão: 25 itens por página

### 3. Modificar: `src/pages/EventsPage.tsx`
- Adicionar paginação (mesma abordagem)
- Padrão: 25 itens por página

### 4. Modificar: `src/pages/SecurityPage.tsx`
- Adicionar paginação na lista de eventos de segurança
- Manter agrupamento por IP sem paginação (é uma síntese)
- Padrão: 25 itens por página

## Benefícios
- ✅ Melhor performance (renderização de 25 itens vs 500)
- ✅ Interface menos poluída
- ✅ Scroll mais rápido
- ✅ Melhor experiência de usuário
- ✅ Consistente em todas as páginas de eventos

## Limites por Página
- Padrão: **25 itens** (otimista, bom para scroll)
- Seletor permite: 10, 25, 50, 100 itens

## Ordem de Implementação
1. Criar `PaginationControls.tsx`
2. Refatorar `GenericEventPage.tsx`
3. Refatorar `EventsPage.tsx`
4. Refatorar `SecurityPage.tsx`

