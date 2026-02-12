

# Corrigir Remetente de Email (NOTIFICATION_EMAIL_FROM)

## Problema

O Resend está rejeitando os emails porque o remetente está configurado como `contatojrpecom@gmail.com`, mas o domínio verificado no Resend é `sellx.com.br`. O Resend só permite enviar emails de domínios verificados.

## Solução

Atualizar a variável de ambiente `NOTIFICATION_EMAIL_FROM` para usar um endereço no domínio verificado, por exemplo:

- `alertas@sellx.com.br`
- `noreply@sellx.com.br`
- `contato@sellx.com.br`

## O que precisa ser feito

1. Atualizar o secret `NOTIFICATION_EMAIL_FROM` no backend para um endereço `@sellx.com.br`
2. Redesenhar (redeploy) a Edge Function `notify-status-change` para carregar o novo valor

## Nenhum código precisa ser alterado

A Edge Function já lê o remetente da variável de ambiente. Basta atualizar o valor do secret.

