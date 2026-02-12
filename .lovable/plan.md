

# Limpeza Automatica de Eventos (Retencao 90 Dias)

## O que vai acontecer
Todo dia, automaticamente, o sistema vai apagar eventos com mais de 90 dias. Voce nao precisa fazer nada manualmente.

## Como funciona

O banco de dados vai executar uma tarefa agendada (cron job) que roda uma vez por dia, a meia-noite (UTC), e deleta todos os eventos com `created_at` anterior a 90 dias atras.

## Mudancas Tecnicas

### 1. Habilitar extensoes necessarias
Ativar `pg_cron` e `pg_net` no banco para permitir tarefas agendadas.

### 2. Criar funcao de limpeza no banco
Uma funcao SQL `cleanup_old_events()` que:
- Deleta eventos onde `created_at < now() - interval '90 days'`
- Retorna a quantidade de registros removidos

### 3. Agendar execucao diaria
Usar `pg_cron` para rodar `cleanup_old_events()` todo dia a meia-noite UTC:

```text
Agenda: '0 0 * * *' (meia-noite UTC, todo dia)
Acao: DELETE FROM events WHERE created_at < now() - interval '90 days'
```

### 4. Criar indice para performance
Adicionar um indice na coluna `created_at` da tabela `events` para que a limpeza seja rapida mesmo com muitos registros.

```text
CREATE INDEX idx_events_created_at ON events(created_at);
```

## Estimativas de volume
| Eventos/dia | Total em 90 dias | Deletados/dia |
|-------------|-------------------|---------------|
| 1.000 | ~90.000 | ~1.000 |
| 5.000 | ~450.000 | ~5.000 |
| 10.000 | ~900.000 | ~10.000 |

## Resumo dos arquivos/recursos
- **Migracao SQL**: Criar indice `idx_events_created_at`, funcao `cleanup_old_events()`, e agendar cron job diario
- **Nenhum arquivo de codigo modificado** — tudo acontece no banco de dados automaticamente

