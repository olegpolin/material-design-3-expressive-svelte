# material-design-3-expressive-svelte

A SvelteKit web app

A showcase of **Material Design 3 Expressive** built on shadcn-svelte: a landing page, a components catalog (actions, selection, inputs, navigation, containment, communication, styles), a desktop dashboard and a phone-framed mobile app. Every component follows the published M3 Expressive token values (sizes, corners, colors, type, springs); the research behind them is in `docs/research/` and the token cheat-sheet in `docs/foundation.md`.

## Tech Stack

- **[Svelte](https://svelte.dev)** (Svelte 5) - frontend framework
- **[SvelteKit](https://svelte.dev/docs/kit)** (SvelteKit 3) - full-stack framework
- **[Tailwind CSS](https://tailwindcss.com)** (Tailwind 4) - styling
- **[shadcn-svelte](https://shadcn-svelte.com)** - UI components (built on **[bits-ui](https://bits-ui.com)**)
- **[Material Color Utilities](https://github.com/material-foundation/material-color-utilities)** - seed-based dynamic color schemes
- **[Material Symbols](https://fonts.google.com/icons)** (Rounded, variable) - icons
- **Roboto Flex / Google Sans Flex** (via Fontsource) - the M3 plain and brand typefaces
- **[LayerChart](https://www.layerchart.com)** (through the shadcn-svelte Chart) - dashboard charts
- **[Embla Carousel](https://www.embla-carousel.com)** - M3 carousel

## Getting Started

```sh
npm i
npm run dev
```

## Where things live

- `src/routes/layout.css` — all M3 tokens (color roles, type scale, shape, motion springs, elevation) as CSS variables and Tailwind utilities
- `src/lib/m3/` — theme engine (`ThemeState`), spring motion helpers, expressive shape library, ripple/state-layer attachment
- `src/lib/components/ui/` — the component source (shadcn-svelte layout, restyled and extended to M3 Expressive)
- `src/routes/(app)/` — site shell, landing, components catalog, dashboard
- `src/routes/mobile/` — the phone-framed mobile app showcase
- `docs/` — plan, foundation cheat-sheet and spec research
