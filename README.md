# layout-test — workspace modular e fluido

Protótipo de **shell de produto**: um espaço de trabalho de 5 colunas pensado como
esqueleto reaproveitável para ferramentas tipo editor / dashboard / builder.
Foco em **layout modular**, **microinterações fluidas** e **customização ao vivo**
(tema claro/escuro, superfícies, itens e movimento).

> React 18 + Vite · sem dependências de UI · tudo via CSS custom properties.

---

## A ideia de produto

A tela é dividida em colunas com papéis bem definidos. O conteúdo flui da esquerda
para a direita: cada coluna **alimenta** a próxima. Nada é fixo demais — superfícies,
cores, espaçamentos e até a animação são editáveis em tempo real.

```
┌────┬──────────┬───────────────────────┬───────────────┬────┐
│ C1 │   C2     │          C3           │      C4       │ C5 │
│    │          │                       │               │    │
│ í  │  menu    │   coluna central      │   cards       │ a  │
│ c  │  de      │   flutuante e         │   (grid       │ t  │
│ o  │  opções  │   responsiva          │   fluido)     │ a  │
│ n  │  (texto) │                       │               │ l  │
│ e  │          │                       │               │ h  │
│ s  │          │                       │               │ o  │
└────┴──────────┴───────────────────────┴───────────────┴────┘
 fixa    fixa        flex: 1 (cresce)     redimensionável  fixa
```

| Coluna | Papel | Comportamento |
|--------|-------|---------------|
| **C1** | Rail de ícones — seções do app | Fixa. Seleciona a seção ativa e popula a C2. Inclui toggle de tema. |
| **C2** | Menu secundário (opções de texto) | Fixa. Lista as opções da seção da C1; a opção escolhida define o conteúdo da C3. |
| **C3** | Coluna central flutuante | Responsiva (`flex: 1`). Renderiza o conteúdo da opção ativa — incluindo o painel **Ajustes**. |
| **C4** | Zona de cards | Grid fluido. Cards arrastáveis e redimensionáveis; colunas **nascem** ao arrastar um card para a lateral. Colapsa quando vazia. |
| **C5** | Rail de atalhos | Fixa. Cada item adiciona um card na C4, com **badge** de quantos estão abertos. |

---

## O que é "modular e fluido" aqui

- **Fluxo de dados entre colunas** — C1 → C2 → C3 é um pipeline: seção define opções,
  opção define conteúdo. Trocar de seção reconfigura tudo à direita sem recarregar nada.
- **Cards por geometria, não por DOM** — a C4 é uma única superfície (`board`); cada card
  é posicionado por `transform`. Reordenar, criar coluna nova (arrastando para a calha) ou
  redimensionar **nunca remonta** componentes — só muda o transform. Isso mantém o drag suave.
- **Colapso responsivo não-destrutivo** — se a largura não comporta todas as colunas de cards,
  elas empilham automaticamente; ao alargar, voltam ao layout original. A estrutura lógica é preservada.
- **C4 que respira** — sem nenhum card aberto, a coluna some (largura 0). O primeiro atalho da C5 a traz de volta.
- **Tudo dirigido por CSS custom properties** — o estado de tema vira `--vars` aplicadas
  ao vivo no nó raiz. Editar um slider reflete instantaneamente, sem rebuild.

---

## Painel de customização (seção "Ajustes")

Quatro abas, cada uma editando uma camada do design:

| Aba | Edita |
|-----|-------|
| **Global** | Fundo do app, cor do texto, cor secundária, cor das linhas, espaço entre colunas. "auto" segue o tema claro/escuro. |
| **Colunas** | Superfície de cada coluna (C1–C5): cor de fundo, intensidade, opacidade, raio, desfoque (glass), borda + cor, sombra, recuo interno. |
| **Itens** | Elementos internos por coluna: tamanho/raio de ícones, e cores **normal / hover / selecionado** (fundo, ícone/texto, borda), badge (C5), marca de ativo (C2). |
| **Efeitos** | Movimento global: elevação e escala no hover, escala ao clicar, escala do ícone, e velocidades das transições. |

> Nota de implementação: propriedades dirigidas por `var()` **não** têm `transition`
> (evita o bug do Chromium em que o valor congela ao mudar a variável). Por isso o fade
> de fundo no hover é instantâneo, enquanto transform/elevação continuam animados.

---

## Stack

- **React 18** (`useState`, `useRef`, `useLayoutEffect`) — sem libs de estado nem de UI.
- **Vite 5** — dev server e build.
- **CSS puro** com custom properties, `color-mix()` para tints e `backdrop-filter: blur()` para glass.
- **Pointer Events** para drag/resize.

---

## Como rodar

```bash
git clone https://github.com/Davymota/layout-test.git
cd layout-test
npm install
npm run dev      # http://localhost:5173
```

Scripts:

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |

---

## Estrutura de arquivos

```
layout-test/
├── index.html          # entrada Vite
├── vite.config.js      # plugin React
├── src/
│   ├── main.jsx        # bootstrap React (StrictMode)
│   ├── App.jsx         # todo o app: 5 colunas, drag/resize, painel de Ajustes
│   └── styles.css      # tokens de tema (claro/escuro) + todas as CSS vars
└── package.json
```

Dentro de `App.jsx`, os blocos de configuração ficam no topo e são o "esqueleto" do produto:

- `SECTIONS` — seções da C1 e as opções de texto que cada uma joga na C2.
- `TARGETS` / `PROPS` — colunas e propriedades de superfície editáveis (aba Colunas).
- `ITEM_TARGETS` — colunas com itens internos editáveis (aba Itens).
- `CARD_TYPES` — tipos de card que a C5 adiciona na C4.

---

## Ideias / próximos passos

- Persistir o tema customizado (localStorage / export de preset JSON).
- Conteúdo real por seção da C1 (hoje só "Ajustes" tem painel funcional).
- Salvar disposição dos cards da C4.
- Acessibilidade: navegação por teclado no drag e foco visível.
- Extrair as colunas em componentes/slots para virar um shell reutilizável de verdade.

---

*Protótipo de exploração de layout — não é um produto final.*
