

# Dashboard Redesign — Visual Rico e Profissional

Transformar o painel de "grid de cards com numeros" para um dashboard moderno com hierarquia visual clara, mais dados contextuais e micro-interacoes.

## O que muda visualmente

### Hero Section (topo)
- Card principal grande mostrando o status geral do sistema: uptime, requests/min em tempo real, e um indicador de saude (barra de progresso verde/amarelo/vermelho)
- Ao lado, dois mini-cards destacados: "Taxa de Erro" com sparkline embutido e "Tempo de Resposta Medio" com tendencia (seta para cima/baixo)

### Cards de metricas (2a linha)
- Trocar o grid de 10 cards identicos por um layout mais inteligente:
  - Cards maiores para metricas criticas (Requisicoes, Erros, Tarefas) com sparklines inline
  - Cards menores para metricas secundarias (Cache, Comandos, E-mails) em formato compacto horizontal
- Cada card mostra variacao percentual vs periodo anterior (ex: "+12% vs ontem") com seta verde/vermelha
- Hover nos cards mostra tooltip com mini-grafico das ultimas 6 horas

### Grafico de atividade (melhorado)
- Trocar de AreaChart simples para um grafico mais rico com:
  - Selector de periodo no topo (1h, 6h, 24h, 7d)
  - Legenda interativa (clicar para mostrar/esconder series)
  - Linha de media pontilhada
  - Gradiente mais suave no preenchimento

### Feed de atividade recente (novo)
- Coluna lateral ou secao abaixo do grafico com os ultimos 8-10 eventos do sistema
- Cada item mostra: icone do tipo, descricao curta, horario relativo ("ha 2min")
- Items coloridos por severidade (vermelho para erros, verde para sucesso)
- Link para a pagina de detalhe correspondente

### Indicadores de saude dos provedores (novo)
- Barra horizontal mostrando status dos provedores (BSPAY, SuitPay, EzzeBank)
- Bolinhas verde/amarelo/vermelho ao lado do nome
- Latencia media de cada provedor

---

## Detalhes tecnicos

### `src/pages/DashboardOverview.tsx`
- Reescrever o layout completo com as novas secoes
- Adicionar estado para periodo selecionado no grafico
- Importar novos componentes: SparklineCard, RecentActivityFeed, ProviderHealth
- Usar grid CSS mais elaborado: hero ocupa full-width, cards criticos em 3 colunas, secundarios em linha compacta

### Novo: `src/components/SparklineCard.tsx`
- Card de metrica com sparkline SVG embutido (sem dependencia extra, SVG puro com polyline)
- Props: title, value, trend (numero positivo/negativo), sparkData (array de numeros), color
- A trend mostra seta para cima/baixo com cor verde/vermelha e porcentagem

### Novo: `src/components/RecentActivityFeed.tsx`
- Lista vertical dos ultimos eventos do allEntries (mockData)
- Cada item: icone do tipo, texto resumido, badge de status, horario relativo
- Usa date-fns `formatDistanceToNow` para horarios relativos
- Clicavel: navega para a pagina do tipo correspondente

### Novo: `src/components/ProviderHealth.tsx`
- Componente que mostra status dos provedores de pagamento
- Dados mockados: BSPAY (online, 245ms), SuitPay (online, 450ms), EzzeBank (offline, timeout)
- Indicador visual com bolinha de cor e barra de latencia

### Novo: `src/components/SystemHealthBar.tsx`
- Barra horizontal que resume a saude geral baseada em: taxa de erro, jobs falhados, provedores offline
- Score de 0-100 com gradiente de cor (verde > amarelo > vermelho)
- Breakdown em hover mostrando cada fator

### `src/data/mockData.ts`
- Adicionar sparkline data para cada categoria (array de 12 valores representando ultimas 12 horas)
- Adicionar dados de provedores com status e latencia
- Adicionar valores de comparacao "vs ontem" para cada metrica

### `src/components/StatusCard.tsx`
- Manter como fallback para paginas internas
- Nao sera mais usado no dashboard principal (substituido pelo SparklineCard)

