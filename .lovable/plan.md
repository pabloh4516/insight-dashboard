

# Corrigir Edge Function `ingest` — Tipos Flexiveis e Tratamento de Erro

## Problema Identificado

1. **Tipo "payment" nao aceito**: O sistema externo envia `type: "payment"`, mas a funcao so aceita tipos fixos (`request`, `error`, `job`, etc.)
2. **Bug de tratamento de erro**: O `throw` dentro do `.map()` nao e capturado pelo `try/catch` externo, causando erro 500 sem mensagem util

## Solucao

### Opcao escolhida: Aceitar qualquer tipo (flexivel)

Como o Telescope sera usado para monitorar **varios sistemas diferentes**, cada um pode ter tipos de eventos proprios. Restringir a uma lista fixa e limitante.

### Mudancas no arquivo `supabase/functions/ingest/index.ts`

1. **Remover validacao restritiva de `type`** — aceitar qualquer string nao vazia como tipo de evento
2. **Manter validacao de `status`** — continuar validando apenas `success`, `warning`, `error` (faz sentido manter padronizado)
3. **Corrigir tratamento de erro** — mover a validacao para antes do `.map()` com um loop que retorna 400 corretamente
4. **Adicionar validacao basica** — garantir que `type` e `status` sao strings nao vazias

### Mudanca no `ProjectsPage.tsx`

5. **Tornar a URL dinamica** — usar `VITE_SUPABASE_URL` ao inves de URL hardcoded no exemplo "Como usar"

---

## Detalhes Tecnicos

### `supabase/functions/ingest/index.ts`

Remover o array `validTypes` e a checagem `if (!validTypes.includes(evt.type))`.

Manter `validStatuses` para padronizar os status.

Reestruturar a validacao: primeiro validar todos os eventos num loop `for`, depois fazer o `.map()` para criar os rows. Isso evita o bug do `throw` dentro de `.map()` que nao era capturado.

```text
// ANTES (bugado):
const rows = eventsArray.map((evt) => {
  if (!validTypes.includes(evt.type)) {
    throw new Error(`Invalid type: ${evt.type}`);  // nao capturado!
  }
  ...
});

// DEPOIS (corrigido):
for (const evt of eventsArray) {
  if (!evt.type || typeof evt.type !== 'string') {
    return Response 400 "Each event must have a non-empty type string"
  }
  if (!validStatuses.includes(evt.status)) {
    return Response 400 "Invalid status: ..."
  }
}
const rows = eventsArray.map(...)  // sem throws
```

### `src/pages/ProjectsPage.tsx`

Trocar a URL hardcoded pela variavel de ambiente:

```text
// ANTES:
https://dsdwtlvikwsxkediqqfm.supabase.co/functions/v1/ingest

// DEPOIS:
${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest
```

