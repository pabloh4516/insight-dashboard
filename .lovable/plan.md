

## Responsividade Mobile e Configuracao PWA

Este plano transforma o Telescope em uma aplicacao totalmente responsiva e instalavel como PWA no celular.

---

### Parte 1: Responsividade Mobile

**Problema atual**: A sidebar tem largura fixa (w-64) e nao possui menu hamburger. O conteudo usa padding fixo (p-8) sem adaptacao para telas pequenas. Grids nao possuem breakpoints adequados para mobile.

**O que sera feito**:

1. **TelescopeLayout**: Adicionar um botao hamburger visivel apenas em telas pequenas (md:hidden). Em mobile, a sidebar sera escondida por padrao e aberta como um Sheet (drawer lateral) ao clicar no hamburger.

2. **TelescopeSidebar**: Receber uma prop `onClose` opcional para fechar o drawer apos clicar em um item de navegacao no mobile.

3. **Ajustes de padding e grids**: Reduzir o padding do conteudo principal de `p-8` para `p-4 md:p-8`. Revisar grids do Dashboard (como `grid-cols-2 md:grid-cols-4`) para funcionar em coluna unica no mobile onde necessario.

4. **Pagina de Auth**: Ja esta centralizada e responsiva, ajustes minimos de padding.

---

### Parte 2: PWA (Progressive Web App)

**O que sera feito**:

1. **Instalar `vite-plugin-pwa`** como dependencia.

2. **Configurar no `vite.config.ts`**: Adicionar o plugin com manifest (nome "Telescope", cores do tema, icones), service worker com `navigateFallbackDenylist: [/^\/~oauth/]`, e estrategia de cache.

3. **Atualizar `index.html`**: Adicionar meta tags para PWA (`theme-color`, `apple-mobile-web-app-capable`, link para manifest).

4. **Criar icones PWA**: Adicionar icones (192x192 e 512x512) no diretorio `public/`.

5. **Criar pagina `/install`**: Uma pagina dedicada com instrucoes visuais para instalar o app no celular, incluindo o botao para disparar o prompt de instalacao (evento `beforeinstallprompt`).

6. **Registrar rota `/install`** no App.tsx (acessivel mesmo sem login).

---

### Detalhes tecnicos

**TelescopeLayout (responsivo)**:
- Usar o componente `Sheet` (ja existente) com `side="left"` para o drawer mobile
- Estado `sidebarOpen` controlado no layout
- Sidebar desktop: `hidden md:flex` com `w-64`
- Botao hamburger: `md:hidden` no topo do conteudo

**vite.config.ts (PWA)**:
```text
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Telescope - Painel de Monitoramento',
    short_name: 'Telescope',
    theme_color: '#0a0b0d',
    background_color: '#0a0b0d',
    display: 'standalone',
    icons: [...]
  },
  workbox: {
    navigateFallbackDenylist: [/^\/~oauth/],
  }
})
```

**Arquivos que serao criados/modificados**:
- `src/components/TelescopeLayout.tsx` (responsivo com Sheet mobile)
- `src/components/TelescopeSidebar.tsx` (prop onClose, fechar ao navegar)
- `src/pages/DashboardOverview.tsx` (ajustes de grid mobile)
- `src/pages/InstallPage.tsx` (novo - pagina de instalacao PWA)
- `src/App.tsx` (rota /install)
- `vite.config.ts` (plugin PWA)
- `index.html` (meta tags PWA)
- `public/pwa-192x192.svg` e `public/pwa-512x512.svg` (icones)

