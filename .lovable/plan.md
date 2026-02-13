

# Monitoramento Automatico com Cron Job

## Resumo

Criar um cron job no banco de dados que executa o health check automaticamente a cada 2 minutos, independente de alguem estar com o painel aberto. Quando detectar mudanca de status (ex: gateway caiu), o email e enviado imediatamente. Alem disso, adicionar um **resumo periodico por email** a cada 1 hora quando o gateway estiver com problemas.

## Como vai funcionar

1. **Deteccao imediata**: A cada 2 minutos, o backend verifica o gateway automaticamente. Se detectar que caiu ou degradou, envia email **na hora**.
2. **Resumo periodico**: Enquanto o gateway estiver fora do ar, um lembrete e enviado a cada 1 hora para que voce nao esqueca.
3. **Sem duplicatas**: O sistema guarda o ultimo status conhecido no banco. So envia email quando ha mudanca real de status, ou quando o lembrete de 1h dispara.

## Etapas Tecnicas

### 1. Criar tabela `health_status_tracker`

Uma tabela simples para guardar o ultimo status conhecido de cada projeto:

```text
health_status_tracker
- project_id (uuid, PK, FK -> projects.id)
- last_status (text) -- 'operational', 'degraded', 'down'
- last_notified_at (timestamptz) -- quando o ultimo email foi enviado
- updated_at (timestamptz)
```

### 2. Criar Edge Function `cron-health-check`

Nova edge function que:
- Busca todos os projetos ativos
- Para cada projeto, chama a API de health
- Compara o status atual com o `last_status` na tabela `health_status_tracker`
- Se houve mudanca de status: envia email imediatamente via `notify-status-change`
- Se o status continua "down" ou "degraded" e ja passou 1 hora desde `last_notified_at`: envia lembrete
- Atualiza a tabela `health_status_tracker`

### 3. Habilitar extensoes `pg_cron` e `pg_net`

Necessarias para agendar tarefas no banco.

### 4. Criar o cron job

Agendar a execucao da edge function `cron-health-check` a cada 2 minutos:

```text
Intervalo: */2 * * * * (a cada 2 minutos)
Acao: chama a edge function via HTTP POST
```

### 5. Remover envio de email do frontend

O hook `useHealthCheck` no frontend continuara fazendo as notificacoes do navegador (som + popup), mas **nao enviara mais emails** -- isso fica 100% no backend.

### Arquivos modificados/criados

- **Migracao SQL**: criar tabela `health_status_tracker`, habilitar extensoes, criar cron job
- `supabase/functions/cron-health-check/index.ts` -- nova edge function
- `src/hooks/useHealthCheck.ts` -- remover chamada a `notify-status-change`

