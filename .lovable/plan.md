
# Proteção da Chamada ao Health Check com Token Secreto

## Visão Geral

Adicionar um token de autenticação na chamada ao endpoint `/api/v1/health` do gateway. O token será armazenado como variável de ambiente na Edge Function e incluído no header `Authorization` durante a requisição.

---

## Implementação

### 1. Adicionar Variável de Ambiente na Edge Function

**Arquivo:** `supabase/config.toml`

Não é necessário editar o arquivo `config.toml` para declarar a variável - o Supabase permite que qualquer variável de ambiente seja definida. A configuração será feita através do Cloud UI.

**O que o usuário fará:**
- Abrir o Cloud View do Lovable
- Navegar até a seção de Edge Functions > Environment Variables
- Adicionar a variável: `GATEWAY_HEALTH_TOKEN=<token-fornecido-pelo-usuario>`

### 2. Atualizar Edge Function `health-check`

**Arquivo:** `supabase/functions/health-check/index.ts`

**Mudanças:**

a) Adicionar leitura da variável de ambiente no início da função:
```
const token = Deno.env.get('GATEWAY_HEALTH_TOKEN');
```

b) Modificar o `fetch()` para incluir o header `Authorization`:
```typescript
const response = await fetch(HEALTH_URL, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  },
  signal: controller.signal,
});
```

c) Adicionar validação de erro caso o token não esteja configurado:
```typescript
if (!token) {
  return new Response(JSON.stringify({
    isUp: false,
    status: null,
    statusCode: null,
    checks: null,
    error: 'GATEWAY_HEALTH_TOKEN not configured',
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

---

## Detalhes Técnicos

### Segurança

- ✅ O token fica **apenas na Edge Function (backend)**
- ✅ O frontend continua chamando a Edge Function normalmente via `supabase.functions.invoke('health-check')`
- ✅ A Edge Function adiciona o token na chamada ao gateway
- ✅ Nenhum token é exposto no JavaScript do navegador

### Fluxo

```
Frontend (browser)
  └─> supabase.functions.invoke('health-check')
        └─> Edge Function (backend)
              └─> fetch('https://api.sellxpay.com.br/api/v1/health', {
                    headers: { Authorization: 'Bearer TOKEN' }
                  })
              └─> Gateway responde
        └─> retorna resposta ao frontend
```

### Tratamento de Erros

A Edge Function verificará se `GATEWAY_HEALTH_TOKEN` está definido. Se não estiver:
- Retorna status HTTP 500
- Inclui mensagem de erro: "GATEWAY_HEALTH_TOKEN not configured"
- Mantém a estrutura da resposta igual (isUp: false, status: null, etc.)

---

## Arquivos a Modificar

- `supabase/functions/health-check/index.ts` - adicionar token no header e validação

## Arquivos que NÃO precisam ser editados

- `supabase/config.toml` - variáveis de ambiente são configuradas via UI, não via arquivo
- Frontend (`src/hooks/useHealthCheck.ts`, `src/pages/DashboardOverview.tsx`, etc.) - nenhuma mudança necessária

---

## Próximos Passos do Usuário

1. Após a implementação, o usuário abrirá o Cloud View
2. Navegar até Settings > Edge Functions > Environment Variables
3. Adicionar: `GATEWAY_HEALTH_TOKEN=<seu-token-aqui>`
4. Salvar as mudanças
5. Testar acessando o dashboard e verificar se o health check continua funcionando
