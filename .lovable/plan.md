
# Criar Pagina de Seguranca (/security)

## Visao Geral

Nova pagina dedicada a eventos de seguranca (`type: "security"`), com visualizacao especializada incluindo agrupamento por IP, card de alertas do dia e detalhes expandidos com campos especificos de seguranca.

---

## Arquivos a Criar/Modificar

### 1. Novo: `src/pages/SecurityPage.tsx`

Pagina customizada (nao usa GenericEventPage pois tem layout diferente com cards e agrupamento por IP). Contera:

**Card de resumo no topo:**
- Total de alertas hoje (filtra eventos com `created_at` de hoje)
- Subdivisao: warnings (tentativas suspeitas) vs errors (ataques bloqueados)

**Agrupamento por IP:**
- Secao que agrupa eventos por `meta.ip`
- Mostra contagem de tentativas por IP
- IPs com mais tentativas aparecem primeiro
- Badge colorido: vermelho para IPs com muitos erros

**Lista de eventos com detalhes expandidos:**
- Status colorido: warning = amarelo (tentativa suspeita), error = vermelho (ataque bloqueado)
- Ao expandir, mostra campos especificos: `meta.ip`, `meta.uri`, `meta.reason`, `meta.user_agent`
- Indicador "Ao Vivo" com destaque para eventos Realtime

**Filtros:**
- Tabs de status (Todos / Warning / Error)
- Busca por summary
- Toggle entre visualizacao por lista e por IP

### 2. Modificar: `src/components/TelescopeSidebar.tsx`

- Importar icone `Shield` do lucide-react
- Adicionar item "Seguranca" no array `navItems` com:
  - url: `/security`
  - icon: Shield
  - count: `counts?.security ?? null`
- Posicionar apos "Commands" e antes de "Registros"

### 3. Modificar: `src/App.tsx`

- Importar `SecurityPage`
- Adicionar rota: `<Route path="/security" element={<SecurityPage />} />`

### 4. Modificar: `src/hooks/useSupabaseEvents.ts`

- Adicionar `'security'` ao array de types em `useEventCounts` para que o contador apareca na sidebar

---

## Detalhes Tecnicos

### Estrutura do SecurityPage

```
SecurityPage
  +-- Card: Alertas Hoje (total / warnings / errors)
  +-- Secao: Top IPs Suspeitos (agrupado por meta.ip)
  +-- Filtros: Tabs + Busca
  +-- Lista de Eventos com EventRow customizado
```

### Agrupamento por IP

Usa `useMemo` para agrupar eventos por `meta.ip`:
```
const ipGroups = useMemo(() => {
  const groups: Record<string, DbEvent[]> = {};
  events.forEach(e => {
    const ip = String((e.meta as any)?.ip ?? 'desconhecido');
    (groups[ip] ??= []).push(e);
  });
  return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
}, [events]);
```

### Card de Alertas Hoje

Filtra eventos com `created_at >= inicio do dia atual` usando `startOfDay` do date-fns.

### Detalhes Expandidos

Ao clicar num evento, mostra grid com:
- IP de origem (`meta.ip`)
- URI alvo (`meta.uri`)
- Motivo do alerta (`meta.reason`)
- User Agent (`meta.user_agent`)
- Painel de erro se status = error
