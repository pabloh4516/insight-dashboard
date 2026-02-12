

# 🤖 Telescope Dashboard — Estilo Robótico/Futurista

## Visão Geral
Painel de monitoramento completo inspirado no Laravel Telescope, com visual dark futurista/robótico, animações de scan, glitch effects, grid lines e cores neon (ciano, verde, magenta). Dados fictícios realistas simulando um gateway de pagamento.

---

## 🎨 Design & Tema
- **Fundo escuro** com texturas de grid/linhas de circuito
- **Cores neon**: ciano (#00F0FF), verde (#39FF14), magenta (#FF00FF), vermelho (#FF3131)
- **Tipografia monospace** para dados técnicos
- **Animações**: pulse nos indicadores, glow nos cards, fade-in sequencial na timeline, efeito de "scan line" sutil
- **Bordas com glow** nos cards e botões

---

## 📐 Layout

### Sidebar Esquerda
- Logo/título "TELESCOPE" com efeito glow
- Navegação com ícones para cada tipo de entrada (10 itens)
- Indicadores de contagem em tempo real com badge animado
- Ícone de status "SYSTEM ONLINE" pulsando

### Área Principal

#### 1. Dashboard Overview (página inicial)
- **Cards de status** com contadores para cada tipo (requests, exceptions, jobs, etc.)
- **Gráfico de atividade** (timeline de últimas 24h) usando Recharts
- **Últimas 5 entries** de cada tipo em mini-cards
- **Indicadores de saúde**: taxa de erro, queries lentas, jobs falhados

#### 2. Páginas por Tipo de Entrada

Cada um dos 10 tipos terá sua página dedicada:

**Requests (HTTP recebidos)**
- Tabela com método, URL, status code, duração, timestamp
- Código de status colorido (2xx verde, 4xx amarelo, 5xx vermelho)
- Clique para expandir e ver headers, payload, response

**Client Requests (chamadas externas)**
- Similar a requests, mas mostra o serviço destino (BSPAY, SuitPay, etc.)
- Badge do provedor com ícone

**Jobs**
- Status: processed ✅, failed ❌, pending ⏳
- Tempo de processamento, tentativas
- Nome do job com classe (ProcessWebhook, SendPostback, etc.)

**Exceptions**
- Classe da exception, mensagem, arquivo:linha
- Stack trace expandível
- Indicador de recorrência

**Logs**
- Nível (info 🔵, warning 🟡, error 🔴)
- Mensagem e contexto
- Filtro por nível

**Queries SQL**
- Query formatada com syntax highlighting
- Duração com destaque para queries lentas (>100ms em vermelho)
- Conexão utilizada

**Mail**
- Destinatário, assunto, mailable class
- Status de envio

**Events**
- Nome do evento (PaymentReceived, PaymentConfirmed, etc.)
- Listeners executados
- Payload do evento

**Cache**
- Operação: HIT (verde), MISS (vermelho), SET (ciano)
- Key do cache, TTL

**Commands**
- Nome do comando artisan
- Exit code, duração
- Arguments e options

#### 3. Timeline View
- Vista cronológica unificada de todas as entries
- Filtro por tipo, status e período
- Mostra a cadeia de eventos (ex: webhook → job → event → query → postback)
- Linhas conectando entries relacionadas

---

## 🔧 Funcionalidades
- **Busca global** por qualquer campo
- **Filtros** por tipo, status, período, duração
- **Auto-refresh simulado** com novos dados aparecendo com animação
- **Detalhes expandíveis** em cada entry
- **Contadores em tempo real** atualizando com animação de contagem

---

## 📊 Dados Mock
Dados fictícios realistas simulando:
- Gateway de pagamento com adquirentes (BSPAY, SuitPay, EzzeBank)
- Webhooks de pagamento, PIX, boleto
- Jobs de processamento de webhook e envio de postback
- Queries de atualização de transações
- Exceptions reais (timeout, validation, etc.)

