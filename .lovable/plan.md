

# Corrigir Exibicao do Score na Barra de Saude

## Problema
O score de saude do gateway exibe numeros com muitas casas decimais (ex: `63.57142857142857/100`) porque o calculo envolve divisoes que geram floats. O valor nao esta sendo arredondado antes da exibicao.

## Solucao
Arredondar o `score` para inteiro usando `Math.round()` antes de exibi-lo.

## Arquivo modificado
- `src/components/SystemHealthBar.tsx`

## Detalhes tecnicos
Na linha onde o score e calculado:
```
const score = Math.max(0, Math.min(100, 100 + factors.reduce(...)));
```
Envolver com `Math.round()`:
```
const score = Math.round(Math.max(0, Math.min(100, 100 + factors.reduce(...))));
```

Isso garante que tanto o numero exibido (`63`) quanto a barra de progresso (`width: 63%`) e o label (`Atencao`) usem um valor inteiro limpo.

Mudanca de 1 linha, sem impacto em outros componentes.
