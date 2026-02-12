

# Simplificar o Monitoramento

## Problema
O painel tem muitas informacoes tecnicas e a sidebar lista 17 itens sem organizacao, o que dificulta o uso para quem nao e tecnico.

## Mudancas Propostas

### 1. Sidebar: Agrupar em secoes colapsaveis
Organizar os 17 itens em 4 grupos logicos com titulos claros. Grupos fechados por padrao, exceto o que contem a rota ativa.

| Grupo | Itens |
|-------|-------|
| **Visao Geral** | Painel Geral, Eventos, Registros |
| **Operacoes** | Requests, Queries, Jobs, Mail, Cache, Commands |
| **Seguranca e Acesso** | Seguranca, Logins, Config |
| **Integracoes** | Webhooks In, Webhooks Out, Fallback |
| *(fixo, sem grupo)* | Projetos |

### 2. Dashboard: Resumo simplificado no topo
Adicionar um banner de status humano acima dos cards, com frases simples baseadas nos dados:

- **Tudo OK (score >= 80):** "Seu sistema esta funcionando normalmente. Nenhuma acao necessaria."
- **Atencao (score 50-79):** "Alguns problemas detectados. X erros nas ultimas 24h."
- **Critico (score < 50):** "Atencao! Problemas criticos detectados. Verifique os erros abaixo."

Sera um componente `StatusBanner` com icone, cor e texto descritivo, posicionado antes do SystemHealthBar.

### 3. Tooltips explicativos nos cards
Adicionar tooltips (ao passar o mouse) nos cards principais explicando o que significam em linguagem simples:

- **Requisicoes Hoje:** "Quantas vezes seu sistema foi chamado hoje"
- **Erros Hoje:** "Quantidade de falhas nas operacoes"
- **Jobs Processados:** "Tarefas automaticas que o sistema executou"
- **Alertas de Seguranca:** "Tentativas suspeitas de acesso detectadas"
- **Saude do Sistema:** "Nota geral baseada em erros e velocidade de resposta"

### 4. Feed de atividade com labels mais claros
Atualizar o `RecentActivityFeed` para incluir os 5 novos tipos de evento no `typeConfig` (webhook_in, webhook_out, login, config_change, acquirer_switch) que estao faltando.

---

## Detalhes Tecnicos

### Arquivos a Criar
- `src/components/StatusBanner.tsx` — Banner de status simplificado com frase descritiva

### Arquivos a Modificar
- `src/components/TelescopeSidebar.tsx` — Agrupar itens em secoes colapsaveis usando estado local
- `src/pages/DashboardOverview.tsx` — Adicionar StatusBanner no topo e tooltips nos cards
- `src/components/RecentActivityFeed.tsx` — Adicionar os 5 novos tipos ao typeConfig

### Sidebar: Implementacao dos grupos
Usar um array de grupos com estado `openGroups` (Set) para controlar quais estao expandidos. O grupo que contem a rota ativa abre automaticamente. Cada grupo tera um header clicavel com chevron de rotacao.

```text
interface SidebarGroup {
  label: string;
  items: NavItem[];
}
```

### StatusBanner: Logica
```text
score >= 80 → verde, icone check, "Sistema funcionando normalmente"
score 50-79 → amarelo, icone alerta, "Alguns problemas detectados"
score < 50  → vermelho, icone erro, "Problemas criticos detectados"
```

