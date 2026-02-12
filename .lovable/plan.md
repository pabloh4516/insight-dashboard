

# Restaurar Paginas do Telescope com Dados Reais

## Visao Geral

Recriar todas as paginas removidas, agora conectadas ao banco de dados real via `useSupabaseEvents`. Cada pagina filtra eventos pelo `type` correspondente. Sem dados mockup — tudo vem do gateway.

---

## Paginas a Criar

Cada pagina segue o mesmo padrao da `EventsPage` existente: usa `useSupabaseEvents` com filtro de `type`, exibe lista com busca, e expande detalhes do `meta` JSON.

| Pagina | Rota | Filtro `type` | Icone |
|--------|------|---------------|-------|
| ExceptionsPage | /exceptions | `exception` | AlertTriangle |
| QueriesPage | /queries | `query` | Database |
| JobsPage | /jobs | `job` | Cog |
| MailPage | /mails | `email` | Mail |
| CachePage | /cache | `cache` | HardDrive |
| CommandsPage | /commands | `command` | Terminal |
| RequestsPage | /requests | `request` | Globe |

---

## Estrutura de Cada Pagina

Todas seguem o mesmo template:

1. `PageHeader` com titulo, icone e contagem
2. Barra de busca por summary
3. Filtro por status (tabs: Todos / Success / Error / Warning)
4. Lista de eventos com expansao de detalhes (meta JSON)
5. Dados vindos de `useSupabaseEvents({ projectId, type: 'xxx' })`

Para evitar duplicacao, sera criado um **componente reutilizavel** `GenericEventPage` que recebe `type`, `title`, `icon` e renderiza toda a estrutura. Cada pagina sera apenas uma chamada a esse componente.

---

## Mudancas

### 1. Novo componente: `src/components/GenericEventPage.tsx`

Componente reutilizavel que:
- Recebe `type`, `title`, `subtitle`, `icon`
- Usa `useSupabaseEvents` com filtro pelo type
- Renderiza PageHeader + busca + tabs de status + lista de eventos
- Expande detalhes mostrando todos os campos do `meta` formatados
- Destaca erros com fundo vermelho

### 2. Criar 7 paginas (arquivos simples)

Cada uma importa `GenericEventPage` e passa as props:

- `src/pages/ExceptionsPage.tsx` — type: "exception", titulo: "Exceptions"
- `src/pages/QueriesPage.tsx` — type: "query", titulo: "Queries"
- `src/pages/JobsPage.tsx` — type: "job", titulo: "Jobs"
- `src/pages/MailPage.tsx` — type: "email", titulo: "Mail"
- `src/pages/CachePage.tsx` — type: "cache", titulo: "Cache"
- `src/pages/CommandsPage.tsx` — type: "command", titulo: "Commands"
- `src/pages/RequestsPage.tsx` — type: "request", titulo: "Requests"

### 3. Atualizar `src/App.tsx`

Adicionar rotas:
- `/exceptions` -> ExceptionsPage
- `/queries` -> QueriesPage
- `/jobs` -> JobsPage
- `/mails` -> MailPage
- `/cache` -> CachePage
- `/commands` -> CommandsPage
- `/requests` -> RequestsPage

### 4. Atualizar `src/components/TelescopeSidebar.tsx`

Adicionar os itens ao menu lateral com icones e contagens do `useEventCounts`:
- Requests (Globe)
- Exceptions (AlertTriangle)
- Queries (Database)
- Jobs (Cog)
- Mail (Mail)
- Cache (HardDrive)
- Commands (Terminal)

### 5. Atualizar `src/hooks/useSupabaseEvents.ts`

Adicionar os novos types ao array de contagem em `useEventCounts`:
- Garantir que `exception`, `query`, `cache`, `command` estejam incluidos no loop de contagem

---

## Resultado

- Menu lateral completo com todas as secoes do Telescope
- Todas as paginas consomem dados reais do banco
- Zero dados mockup — se o gateway ainda nao enviou eventos de um tipo, a pagina mostra "Nenhum evento encontrado"
- Quando o gateway enviar, aparece em tempo real

