

# Gerenciamento de Usuarios e Acesso por Projeto

## Resumo

Voce podera criar usuarios diretamente pelo painel, informando e-mail e senha. Cada usuario criado so tera acesso aos projetos que voce atribuir a ele.

## Como vai funcionar

1. Na pagina de **Projetos**, ao abrir um projeto, voce vera uma secao "Membros" onde pode adicionar/remover usuarios
2. Uma nova pagina **Usuarios** no menu lateral mostra todos os usuarios que voce criou
3. O usuario convidado faz login com o e-mail e senha que voce definiu
4. Ele so ve os projetos aos quais foi atribuido

## Etapas Tecnicas

### 1. Banco de Dados

Criar tabela `project_members` para vincular usuarios a projetos:

```text
project_members
- id (uuid, PK)
- project_id (uuid, FK -> projects.id)
- user_id (uuid, FK -> auth.users.id)
- created_at (timestamptz)
- unique(project_id, user_id)
```

Politicas RLS:
- SELECT/INSERT/DELETE: apenas o dono do projeto (via projects.user_id = auth.uid())

Atualizar RLS de `projects` e `events`:
- Permitir SELECT tambem para membros (usuario que aparece em project_members)
- Usar funcao `security definer` para evitar recursao

### 2. Edge Function `invite-user`

Criar uma edge function que:
- Recebe `email`, `password` e `project_id`
- Valida que o usuario autenticado e dono do projeto
- Usa `supabase.auth.admin.createUser()` para criar o usuario com e-mail confirmado
- Insere o registro em `project_members`
- Retorna o usuario criado

### 3. Pagina de Usuarios (`/users`)

Nova pagina com:
- Formulario para criar usuario (e-mail + senha)
- Lista de usuarios criados (buscados de project_members)
- Botao para remover acesso de um usuario a um projeto

### 4. Secao de Membros na pagina de Projetos

Ao lado de cada projeto, mostrar os membros e permitir adicionar/remover.

### 5. Atualizar Sidebar

Adicionar link "Usuarios" no menu lateral, na secao fixa (junto com Projetos e Notificacoes).

### 6. Atualizar ProjectContext

O `useProjects` precisa retornar tambem projetos onde o usuario e membro (nao apenas dono), para que usuarios convidados vejam os projetos atribuidos.

### Arquivos modificados/criados

- **Migracoes SQL**: criar `project_members`, funcao `is_project_member`, atualizar RLS de `projects`, `events`, `health_check_log`, `notification_emails`
- `supabase/functions/invite-user/index.ts` -- nova edge function
- `src/pages/UsersPage.tsx` -- nova pagina
- `src/hooks/useProjectMembers.ts` -- novo hook
- `src/hooks/useProjects.ts` -- atualizar query para incluir projetos como membro
- `src/components/TelescopeSidebar.tsx` -- adicionar link Usuarios
- `src/App.tsx` -- adicionar rota /users

