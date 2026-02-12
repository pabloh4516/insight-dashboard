# Pagina de Configuracao de Notificacoes por Email

## O que sera feito

Criar uma nova pagina "Notificacoes" acessivel pela sidebar onde o usuario pode gerenciar os emails que recebem alertas quando o gateway cai ou volta ao normal.

## Arquitetura

### 1. Nova tabela `notification_emails`

Armazenar os emails de notificacao no banco de dados (em vez de depender apenas dos secrets fixos):

```text
notification_emails
- id: uuid (PK, default gen_random_uuid())
- project_id: uuid (NOT NULL, referencia ao projeto)
- email: text (NOT NULL)
- enabled: boolean (default true)
- created_at: timestamptz (default now())
```

RLS: usuarios so veem/editam emails dos seus proprios projetos (via join com `projects.user_id = auth.uid()`).

### 2. Nova pagina `NotificationsPage.tsx`

- Listar emails cadastrados com toggle de ativo/inativo
- Formulario para adicionar novo email (com validacao)
- Botao para remover email
- Botao para enviar email de teste

### 3. Atualizar Edge Function `notify-status-change`

- Em vez de ler apenas o secret `NOTIFICATION_EMAIL_TO`, buscar todos os emails ativos da tabela `notification_emails` para o projeto
- Manter fallback para o secret caso a tabela esteja vazia (compatibilidade)
- Enviar email para todos os destinatarios ativos

### 4. Atualizar Sidebar

- Adicionar item "Notificacoes" na secao de navegacao com icone de sino (Bell)

### 5. Atualizar Rotas

- Adicionar rota `/notifications` no `App.tsx`

## Detalhes Tecnicos

### Tabela SQL

```sql
CREATE TABLE public.notification_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  email text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_emails ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
CREATE POLICY "Users can view own notification emails"
  ON public.notification_emails FOR SELECT
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));

CREATE POLICY "Users can insert own notification emails"
  ON public.notification_emails FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));

CREATE POLICY "Users can update own notification emails"
  ON public.notification_emails FOR UPDATE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));

CREATE POLICY "Users can delete own notification emails"
  ON public.notification_emails FOR DELETE
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id::text = notification_emails.project_id::text AND projects.user_id = auth.uid()));
```

### NotificationsPage.tsx

- Usa `useProject()` para obter o `selectedProject.id`
- CRUD direto via Supabase client na tabela `notification_emails`
- Validacao de email com regex simples
- Toggle de ativo/inativo via Switch component
- Botao "Enviar teste" que chama a edge function `notify-status-change` com status de teste

### Edge Function `notify-status-change`

- Recebe `project_id` no body junto com `status`, `statusCode`, `checkedAt`
- Busca emails ativos: `SELECT email FROM notification_emails WHERE project_id = $1 AND enabled = true`
- Se nenhum email na tabela, usa fallback do secret `NOTIFICATION_EMAIL_TO`
- Envia para todos os emails encontrados

### Sidebar

- Adicionar "Notificacoes" com icone `Bell` na secao fixa (junto com "Projetos"), abaixo dos grupos colapsaveis

### Arquivos a criar

- `src/pages/NotificationsPage.tsx`

### Arquivos a modificar

- `supabase/functions/notify-status-change/index.ts` - buscar emails do banco
- `src/components/TelescopeSidebar.tsx` - adicionar link
- `src/App.tsx` - adicionar rota
- Migration SQL para criar a tabela

Deve ter tambem as configurações do resend OK