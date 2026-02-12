

# Redesign Visual — Estilo Profissional

Trocar o visual "videogame cyberpunk" por um estilo limpo e profissional, inspirado em ferramentas como Vercel, Linear e Datadog.

## O que muda

### Cores e Tipografia
- Remover fonte Orbitron (display futurista) — usar apenas JetBrains Mono para dados e Inter/system-ui para interface
- Trocar cores neon brilhantes por tons mais suaves e profissionais
- Remover todos os efeitos de glow (text-shadow, box-shadow neon)
- Remover animacoes de scan-line, glitch e border-glow

### Paleta nova
- Fundo: cinza escuro neutro (sem tom azulado exagerado)
- Texto: branco/cinza sem text-shadow
- Sucesso: verde suave (#22c55e)
- Erro: vermelho suave (#ef4444)
- Aviso: amarelo/amber (#f59e0b)
- Info: azul (#3b82f6)
- Destaques: sem glow, apenas cor solida ou badge com fundo sutil

### Componentes afetados
- Sidebar: remover "TELESCOPE" em Orbitron, usar texto normal, remover "Sistema Ativo" com ping neon
- StatusCard: remover glow e animacao de borda, usar cards simples com borda sutil
- PageHeader: remover gradiente neon na linha divisoria, usar linha cinza simples
- DataTable: manter funcional, ajustar cores dos badges
- LogsPage: manter layout estilo Vercel mas com cores profissionais
- LiveNotification: remover glow verde, usar toast simples
- Todas as paginas: trocar classes text-neon-* por cores normais do Tailwind

### Grid de fundo
- Remover grid-bg (linhas de circuito) do layout principal

---

## Detalhes tecnicos

### `src/index.css`
- Atualizar variaveis CSS: cores mais neutras, remover variaveis neon
- Remover classes utilitarias: glow-cyan, glow-green, glow-magenta, glow-red, text-neon-*, scan-line, grid-bg, circuit-line
- Remover keyframes: scanline, glitch, pulse-neon, border-glow
- Trocar font-display de Orbitron para Inter/system-ui
- Importar Inter do Google Fonts no lugar de Orbitron

### `tailwind.config.ts`
- Remover fontFamily display (Orbitron)
- Remover cores neon do objeto colors
- Remover keyframes pulse-neon e border-glow
- Atualizar cores semanticas (sucesso, erro, aviso, info)

### `src/components/StatusCard.tsx`
- Remover mapa de glow, usar cores com opacidade de fundo (bg-green-500/10 text-green-500)
- Remover animacao border-glow
- Remover font-display, usar font-semibold normal

### `src/components/PageHeader.tsx`
- Trocar text-neon-cyan por text-primary (azul neutro)
- Remover gradiente neon na linha divisoria, usar bg-border simples
- Remover font-display

### `src/components/TelescopeSidebar.tsx`
- Titulo: "Telescope" em font-semibold normal ao inves de Orbitron
- Remover ping neon verde do "Sistema Ativo"
- Simplificar botao Ao Vivo com cores normais
- Trocar todas as referencias neon por cores padrao

### `src/components/LiveNotification.tsx`
- Remover glow-green, usar borda verde sutil

### Todas as paginas (Requests, Jobs, Exceptions, etc.)
- Trocar text-neon-* por cores Tailwind normais (text-green-500, text-red-500, etc.)
- Remover font-display de labels e badges
- Manter a estrutura e funcionalidade intactas

### `src/pages/LogsPage.tsx`
- Manter layout estilo Vercel
- Trocar cores neon por cores profissionais
- Manter animacao de fade-in para novos logs

### `src/components/ActivityBar.tsx` e `src/components/LogsFilterPanel.tsx`
- Atualizar cores de neon para tons profissionais

### `src/pages/DashboardOverview.tsx`
- Remover glow-* dos cards de metricas
- Atualizar cores do grafico para tons profissionais

