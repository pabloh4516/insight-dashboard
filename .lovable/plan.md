

# Adicionar 5 Novos Tipos de Evento

## Resumo
Adicionar suporte visual completo para `webhook_in`, `webhook_out`, `login`, `config_change` e `acquirer_switch` na sidebar, filtros da EventsPage, e paginas dedicadas usando o GenericEventPage.

---

## Arquivos a Criar

### 1. `src/pages/WebhooksInPage.tsx`
Pagina simples usando GenericEventPage com `type="webhook_in"`, titulo "Webhooks Recebidos", icone `ArrowDownLeft`.

### 2. `src/pages/WebhooksOutPage.tsx`
GenericEventPage com `type="webhook_out"`, titulo "Webhooks Enviados", icone `ArrowUpRight`.

### 3. `src/pages/LoginsPage.tsx`
GenericEventPage com `type="login"`, titulo "Logins", icone `LogIn`.

### 4. `src/pages/ConfigChangesPage.tsx`
GenericEventPage com `type="config_change"`, titulo "Alteracoes de Config", icone `Settings`.

### 5. `src/pages/AcquirerSwitchPage.tsx`
GenericEventPage com `type="acquirer_switch"`, titulo "Fallback de Adquirentes", icone `RefreshCw`.

---

## Arquivos a Modificar

### 6. `src/components/TelescopeSidebar.tsx`
- Importar icones: `ArrowDownLeft`, `ArrowUpRight`, `LogIn`, `Settings`, `RefreshCw`
- Adicionar 5 novos itens no array `navItems` (antes de "Registros"):
  - Webhooks Recebidos (`/webhooks-in`, ArrowDownLeft, `counts?.webhook_in`)
  - Webhooks Enviados (`/webhooks-out`, ArrowUpRight, `counts?.webhook_out`)
  - Logins (`/logins`, LogIn, `counts?.login`)
  - Alteracoes de Config (`/config-changes`, Settings, `counts?.config_change`)
  - Fallback Adquirentes (`/acquirer-switch`, RefreshCw, `counts?.acquirer_switch`)

### 7. `src/App.tsx`
- Importar as 5 novas paginas
- Adicionar 5 rotas: `/webhooks-in`, `/webhooks-out`, `/logins`, `/config-changes`, `/acquirer-switch`

### 8. `src/pages/EventsPage.tsx`
- Importar icones: `ArrowDownLeft`, `ArrowUpRight`, `LogIn`, `Settings`, `RefreshCw`
- Adicionar ao `typeConfig`:
  - `webhook_in`: icone ArrowDownLeft, label "Webhook In", cor azul (`bg-blue-500/15 text-blue-400`)
  - `webhook_out`: icone ArrowUpRight, label "Webhook Out", cor cyan (`bg-cyan-500/15 text-cyan-400`)
  - `login`: icone LogIn, label "Login", cor roxa (`bg-purple-500/15 text-purple-400`)
  - `config_change`: icone Settings, label "Config", cor laranja (`bg-orange-500/15 text-orange-400`)
  - `acquirer_switch`: icone RefreshCw, label "Fallback", cor vermelha (`bg-destructive/15 text-destructive`)
- Adicionar 5 novos TabsTrigger nos filtros

### 9. `src/hooks/useSupabaseEvents.ts`
- Adicionar `config_change` e `acquirer_switch` ao array de types em `useEventCounts` (os outros 3 ja existem)

---

## Detalhes Tecnicos

### Cores por tipo
| Tipo | Cor | Classe Tailwind |
|------|-----|-----------------|
| webhook_in | Azul | `bg-blue-500/15 text-blue-400` |
| webhook_out | Cyan | `bg-cyan-500/15 text-cyan-400` |
| login | Roxo | `bg-purple-500/15 text-purple-400` |
| config_change | Laranja | `bg-orange-500/15 text-orange-400` |
| acquirer_switch | Vermelho | `bg-destructive/15 text-destructive` |

### Detalhes expandidos
Os campos meta de cada tipo serao renderizados automaticamente pelo sistema existente de `Object.entries(meta)` no EventRow -- nao precisa de tratamento especial pois o GenericEventPage e o EventsPage ja iteram sobre todos os campos do meta JSON.

### Icones Lucide usados
- `ArrowDownLeft` para webhook_in
- `ArrowUpRight` para webhook_out
- `LogIn` para login
- `Settings` para config_change
- `RefreshCw` para acquirer_switch

