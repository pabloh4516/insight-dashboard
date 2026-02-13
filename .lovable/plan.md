

## Animacao de Batimento Cardiaco na Barra de Saude do Sistema

Adicionar uma animacao estilo ECG (eletrocardiograma) ao componente `SystemHealthBar`, dando um visual de "batimento cardiaco" que reforce o conceito de monitoramento de saude em tempo real.

### O que sera feito

1. **Criar animacao CSS de linha ECG** no `src/index.css` com um keyframe que simula o tracado de um eletrocardiograma usando um SVG inline animado.

2. **Adicionar o elemento visual ao `SystemHealthBar`** (`src/components/SystemHealthBar.tsx`):
   - Inserir um pequeno SVG animado ao lado do icone de atividade (Activity) ou do score, simulando o tracado classico de batimento cardiaco (linha plana -> pico -> vale -> pico -> linha plana).
   - A cor da animacao acompanhara a cor do score (verde para saudavel, amarelo para atencao, vermelho para critico).
   - A velocidade da animacao variara conforme o estado: mais rapida quando critico, ritmo normal quando saudavel.

### Detalhes tecnicos

**Novo keyframe CSS** em `src/index.css`:
- `heartbeat-line`: animacao de translacao horizontal continua para o path SVG do ECG, criando efeito de monitor cardiaco.

**Alteracoes em `src/components/SystemHealthBar.tsx`**:
- Adicionar um elemento SVG com `viewBox` contendo o path do tracado ECG.
- Aplicar `overflow-hidden` no container e animar o path com `translateX` para simular o efeito de varredura.
- A duracao da animacao sera dinamica: 1.5s (score >= 80), 1s (score >= 50), 0.6s (score < 50).
- Posicionar entre o icone Activity e o titulo "Saude do Sistema", ou como fundo sutil atras da barra de progresso.

