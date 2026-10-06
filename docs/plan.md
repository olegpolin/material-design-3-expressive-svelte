# Material Design 3 Expressive showcase — architecture plan

This document is the contract every build agent follows. Read it fully before touching code.
Research with exact spec values lives in `docs/research/*.md` — **always use those numbers**, never guess.

## Stack rules (non-negotiable)

- Svelte 5 runes only (`$state`, `$derived`, `$props`, snippets, `{@attach}`), no legacy syntax. Follow `.agents/skills/svelte-core-bestpractices/SKILL.md`.
- Tailwind 4 with `@theme` tokens defined in `src/routes/layout.css`. Use the semantic utilities defined there (`bg-primary-container`, `text-on-surface`, `rounded-m3-lg`, `text-title-md`, `duration-m3-medium2`, …) instead of raw values.
- shadcn-svelte conventions: every component in its own folder under `src/lib/components/ui/<name>/` with `index.ts` barrel, `data-slot` attributes, `cn()` for classes, `tailwind-variants` (`tv`) for variants, `bind:ref`, `...restProps` passthrough, bits-ui primitives for behavior/a11y where one exists. Imports use the `#lib/...` alias (see `components.json`).
- Icons: use `Icon` from `#lib/components/ui/icon` (Material Symbols Rounded variable font: `name`, `fill`, `weight`, `size` props). Do **not** use lucide in showcase pages. shadcn components that import lucide internally (e.g. `x`, `check`, `chevron-down`) must be switched to `Icon`.
- Every interactive M3 component gets the ripple/state-layer attachment: `{@attach ripple()}` from `#lib/m3/ripple.svelte.ts`. Container element needs `position: relative; overflow: hidden` (or the attachment creates a clipped overlay).
- Motion: use the spring easing CSS vars (`--md-sys-motion-spring-*`) and duration tokens from `layout.css`; prefer CSS transitions/animations; use `Spring` from `svelte/motion` or the Web Animations API for interruptible physics (button group squeeze, FAB menu, nav rail). Respect `prefers-reduced-motion`.
- Accessibility: keyboard operable, focus-visible ring per spec (3dp outline, `--md-sys-color-secondary`), ARIA from bits-ui, 48dp minimum touch targets (use `after:` pseudo element for small controls).
- Run `npx @sveltejs/mcp svelte-autofixer <file>` on each Svelte file you write and `npm run check` before finishing. Zero errors.

## Directory layout

```
src/lib/m3/
  theme.svelte.ts      # ThemeState class: seed, variant (TONAL_SPOT|EXPRESSIVE|VIBRANT|...), dark, contrast -> CSS vars (material-color-utilities)
  motion.ts            # spring + easing constants (JS mirrors of CSS tokens), helper `springCss(name)`
  ripple.svelte.ts     # `ripple(opts)` attachment: hover/focus/pressed state layer + expanding ripple
  shapes.ts            # expressive shape library: `shapePath(name, size)` + `SHAPES` list (RoundedPolygon port)
  context.ts           # createContext helpers if needed
src/lib/components/ui/
  icon/                # Material Symbols icon
  button/              # M3 common button: variant filled|tonal|outlined|elevated|text, size xs|sm|md|lg|xl, shape round|square, toggle
  icon-button/         # standard|filled|tonal|outlined, sizes, width narrow|default|wide, toggle
  fab/                 # Fab (small|medium|large, color primary|secondary|tertiary|surface) + ExtendedFab + FabMenu
  button-group/        # standard + connected, press squeeze animation
  split-button/
  segmented-button/
  chip/                # assist|filter|input|suggestion
  card/                # elevated|filled|outlined (edit existing shadcn card)
  checkbox/ radio-group/ switch/ slider/ (edit existing; slider gets sizes xs..xl, centered, range, ticks)
  text-field/          # filled|outlined with floating label, supporting text, icons, counter, error
  search-bar/
  dialog/              # basic + full-screen (edit existing)
  bottom-sheet/        # based on drawer (vaul)
  side-sheet/          # based on sheet
  menu/                # dropdown-menu restyled (edit existing dropdown-menu)
  tabs/                # primary|secondary (edit existing)
  navigation-bar/      # short|tall
  navigation-rail/     # collapsed|expanded|modal
  navigation-drawer/
  top-app-bar/         # small|medium-flexible|large-flexible|search
  toolbar/             # floating (horizontal|vertical, standard|vibrant) + docked
  list/                # list + list-item (one/two/three line, leading/trailing)
  divider/             # separator restyled
  badge/
  tooltip/             # plain + rich
  snackbar/            # sonner restyled + helper
  progress/            # LinearProgress, CircularProgress, each with `wavy` and determinate/indeterminate
  loading-indicator/
  carousel/            # optional
  avatar/ skeleton/ table/ scroll-area/ (restyle lightly)
src/routes/
  +layout.svelte       # fonts, ModeWatcher, ThemeState provider, app shell (nav rail desktop / nav bar mobile)
  +page.svelte         # landing page
  components/+page.svelte            # components index
  components/actions/+page.svelte    # buttons, icon buttons, FAB, FAB menu, button groups, split, segmented
  components/selection/+page.svelte  # checkbox, radio, switch, slider, chips
  components/inputs/+page.svelte     # text fields, search, menus, date/time (if any)
  components/navigation/+page.svelte # nav bar, rail, drawer, app bars, toolbars, tabs
  components/containment/+page.svelte# cards, dialogs, sheets, lists, divider, carousel
  components/communication/+page.svelte # badges, progress, loading indicator, snackbar, tooltips
  components/styles/+page.svelte     # color roles, typography scale, shape library, motion springs demo
  dashboard/+page.svelte             # desktop dashboard
  mobile/+layout.svelte              # phone frame on desktop, full-bleed on real phones
  mobile/+page.svelte                # mobile app home (tall nav bar, top app bar, FAB menu, lists, chips)
  mobile/(other screens)             # detail, settings, compose, etc.
```

## Theme / tokens in `layout.css`

- `:root` carries `--md-sys-color-*` for the light baseline, `.dark` for dark; `ThemeState` overrides them inline on `<html>` when a seed is chosen.
- `--md-ref-typeface-brand: 'Google Sans Flex Variable'`, `--md-ref-typeface-plain: 'Roboto Flex Variable'`.
- Type scale tokens as Tailwind `--text-*` so `text-display-lg`, `text-label-lg-emphasized` etc. work; shape tokens as `--radius-m3-*`; motion durations/easings/springs; elevation shadows `--shadow-m3-1..5`; state layer opacities.
- shadcn semantic tokens are mapped onto M3 roles (`--primary: var(--md-sys-color-primary)` …) so untouched shadcn components look right.

## Showcase expectations

- Every component page shows **all variants × sizes × states** (enabled, hover, focus, pressed, disabled, selected, error) with short captions and the spec dp values visible on hover/tooltips or small labels.
- Live, interactive demos (toggle, press, open) — not static pictures.
- Landing page: expressive hero with shape-morphing blob, big display type, seed color picker, cards linking to pages.
- Dashboard: navigation rail (expanded on wide, collapsed on medium), top app bar, stat cards, charts (LayerChart via shadcn chart), data table, FAB.
- Mobile: a 412×915 phone frame on desktop (rounded 28, status bar) rendering real routes; tall navigation bar, large flexible top app bar, FAB menu, bottom sheet, lists, chips, search bar, snackbar.
