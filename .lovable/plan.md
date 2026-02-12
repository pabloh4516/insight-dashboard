

# Redesign Visual — Estilo MoneyWise (Emerald/Premium)

Inspirado no site de referencia, transformar o dashboard de "funcional basico" para um visual premium com identidade visual marcante usando verde esmeralda como cor de destaque.

## Mudancas Visuais Principais

### 1. Paleta de Cores
- Trocar o azul primario (`--primary: 217 91% 60%`) por verde esmeralda (`--primary: 160 84% 39%`) similar ao da referencia
- Fundo principal ligeiramente mais escuro e neutro (`--background: 220 16% 4%`)
- Cards com fundo sutil e bordas mais suaves (`--card: 220 14% 7%`, `--border: 220 12% 12%`)
- Manter as cores semanticas (erro, aviso) mas ajustar sucesso para combinar com o primario

### 2. Textura de Fundo (Dot Grid)
- Adicionar um padrao de pontos sutil no fundo do layout principal (CSS radial-gradient), similar ao da referencia
- Aplicar no `TelescopeLayout` como background do `main`

### 3. Cards com mais Profundidade
- Aumentar border-radius dos cards para `12px` (`--radius: 0.75rem`)
- Adicionar hover com borda que clareia sutilmente (border-color transition)
- SparklineCards: borda superior colorida de 2px com a cor da metrica
- Cards de destaque (Hero) com fundo ligeiramente diferente para criar hierarquia

### 4. Sidebar Refinada
- Fundo da sidebar mais escuro que o conteudo principal
- Item ativo: fundo com opacidade do primario verde + borda esquerda verde (ao inves de borda direita)
- Logo/titulo com destaque: "Tele" normal + "scope" em cor primaria (verde)
- Botao "Ao Vivo" com estilo pill arredondado

### 5. Tipografia e Espacamento
- Aumentar levemente o espacamento entre secoes para o conteudo respirar
- Titulos de secao (SAUDE DO SISTEMA, ATIVIDADE) com letra esmeralda sutil
- Numeros grandes com peso 700 ao inves de 600

### 6. Grafico de Atividade
- Cores do grafico ajustadas para combinar com paleta esmeralda
- Linha de requisicoes em verde esmeralda (primario)
- Gradientes mais suaves e translucidos

### 7. Micro-animacoes
- Cards com fade-in staggered ao carregar (animation-delay incremental)
- Hover nos cards com transicao suave de border-color e leve translate-y (-1px)
- Sparklines com animacao de desenho (stroke-dashoffset)

---

## Detalhes Tecnicos

### `src/index.css`
- Atualizar variaveis CSS `:root`:
  - `--primary: 160 84% 39%` (emerald)
  - `--background: 220 16% 4%`
  - `--card: 220 14% 7%`
  - `--border: 220 12% 12%`
  - `--radius: 0.75rem`
  - `--sidebar-background: 220 16% 3%`
  - `--sidebar-border: 220 12% 10%`
  - `--sidebar-primary: 160 84% 39%`
- Adicionar classe `.dot-grid` com radial-gradient para fundo pontilhado
- Adicionar keyframe `fade-up` para entrada staggered dos cards
- Adicionar classe `.card-hover` com transicoes de borda e shadow

### `src/components/TelescopeLayout.tsx`
- Adicionar classe `dot-grid` no `main` para fundo com textura de pontos

### `src/components/TelescopeSidebar.tsx`
- Titulo: "Tele" + span verde "scope"
- Item ativo: trocar `border-r-2` por `border-l-2` com `bg-primary/10`
- Botao Ao Vivo com `rounded-full` (pill)

### `src/components/SparklineCard.tsx`
- Adicionar borda superior colorida de 2px
- Hover: `hover:border-[color]/40 hover:-translate-y-px` com transicao
- Numeros com `font-bold` (700)

### `src/components/SystemHealthBar.tsx`
- Ajustar cor da barra saudavel para usar o novo primario esmeralda

### `src/pages/DashboardOverview.tsx`
- Cores do AreaChart: requisicoes em esmeralda, manter tarefas e erros
- Atualizar gradientes SVG para combinar com nova paleta
- Adicionar animation-delay nos wrappers dos cards para staggered entry

### `src/components/RecentActivityFeed.tsx`
- Hover nos items com borda esquerda colorida por severidade

### `src/components/ProviderHealth.tsx`
- Status online: usar cor primaria esmeralda ao inves de success separado

