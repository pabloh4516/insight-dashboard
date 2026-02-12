

# Pagina de Logs ao Vivo (estilo Vercel)

Vou redesenhar a pagina de Registros para funcionar como a tela de logs da Vercel, com visualizacao ao vivo, busca, filtros na lateral e linhas de log aparecendo em tempo real.

## O que muda

### Layout da pagina
- Barra superior com campo de busca, botao "Ao Vivo" (verde pulsando) e periodo
- Painel de filtros na lateral esquerda (colapsavel) com checkboxes: Nivel (Alerta, Erro, Fatal), Tipo, Host, Rota, Status
- Area principal com tabela de logs estilo terminal

### Tabela de logs (estilo Vercel)
- Colunas: Horario (com milissegundos), Metodo, Status (badge colorido), Host, Rota, Mensagens
- Linhas com fundo amarelo/vermelho para warnings/errors (como na imagem)
- Monospace, compacta, sem bordas pesadas
- Novos logs aparecem no topo com animacao de fade-in
- Scroll automatico quando "Ao Vivo" esta ativo

### Integracao com dados ao vivo
- Usa o RealtimeContext existente para receber dados em tempo real
- Combina logs estaticos + logs que chegam ao vivo
- Filtra por nivel, busca por texto na mensagem/rota
- Botao "Ao Vivo" na propria pagina (independente do da sidebar)

### Mini timeline no topo
- Barra de atividade mostrando densidade de logs nos ultimos 30 minutos (como na imagem da Vercel)

---

## Detalhes tecnicos

### Arquivo modificado: `src/pages/LogsPage.tsx`
Reescrever completamente com:
- Estado local para busca, filtros de nivel, modo ao vivo
- `useRef` para scroll automatico
- `useMemo` para combinar logs estaticos + `liveEntries` filtrados por tipo "log" e outros tipos relevantes (requests, exceptions)
- Renderizacao de cada linha como row estilo terminal

### Arquivo modificado: `src/data/mockData.ts`
- Adicionar campo `host` nos logs e requests mock (ex: "pay.checkout.store", "api.gateway.com")
- Adicionar mais logs mock para volume maior

### Arquivo modificado: `src/hooks/useRealtimeData.ts`
- Gerar logs com hosts e rotas mais realistas para o modo ao vivo

### Novo componente: `src/components/LogsFilterPanel.tsx`
- Painel lateral com checkboxes para filtrar por nivel, host, rota
- Contadores ao lado de cada filtro (como na imagem: Warning 135, Error 4)
- Botao "Resetar" para limpar filtros

### Novo componente: `src/components/ActivityBar.tsx`
- Mini grafico de barras mostrando densidade de atividade nos ultimos 30 minutos
- Similar a barra de timeline no topo da imagem da Vercel

