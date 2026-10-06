# Foundation cheat-sheet

Everything the theme layer provides: Tailwind classes, CSS variables, and JS/TS exports.
Source files: `src/routes/layout.css` (all tokens), `src/lib/m3/*.ts`. Live demo: `/components/styles`.
Spec numbers come from `docs/research/{color,typography-shape,motion}.md`. Don't hard-code values these tokens already cover.

---

## 1. Color

### 1.1 Utilities (any Tailwind color prefix works: `bg-`, `text-`, `border-`, `ring-`, `outline-`, `fill-`, `stroke-`, `divide-`, `from-`, `shadow-` …)

Every M3 role is an **unprefixed** color name, with three exceptions:

| M3 role | Utility color name | Note |
|---|---|---|
| `primary` | **`m3-primary`** | Bare `primary` is shadcn's `--primary`. It is the same color, but use `m3-primary` in M3 code. |
| `secondary` | **`m3-secondary`** | ⚠ Bare `secondary` is shadcn's `--secondary`, which is **M3 `secondary-container`**. |
| `background` | **`m3-background`** | Bare `background` is shadcn's `--background`, which is M3 `surface`. |
| every other role | role name as is | `primary-container`, `on-primary`, `on-secondary`, `secondary-container`, `tertiary`, `error`, … |

All 49 roles: `m3-primary` `on-primary` `primary-container` `on-primary-container` `primary-fixed` `primary-fixed-dim` `on-primary-fixed` `on-primary-fixed-variant` `inverse-primary` · `m3-secondary` `on-secondary` `secondary-container` `on-secondary-container` `secondary-fixed` `secondary-fixed-dim` `on-secondary-fixed` `on-secondary-fixed-variant` · `tertiary` `on-tertiary` `tertiary-container` `on-tertiary-container` `tertiary-fixed` `tertiary-fixed-dim` `on-tertiary-fixed` `on-tertiary-fixed-variant` · `error` `on-error` `error-container` `on-error-container` · `surface` `surface-dim` `surface-bright` `surface-container-lowest` `surface-container-low` `surface-container` `surface-container-high` `surface-container-highest` `on-surface` `surface-variant` `on-surface-variant` · `outline` `outline-variant` · `inverse-surface` `inverse-on-surface` · `scrim` `shadow` `surface-tint` (deprecated, do not overlay) · `m3-background` `on-background`

Examples: `bg-primary-container text-on-primary-container`, `bg-m3-primary text-on-primary`, `bg-surface-container-high`, `border-outline-variant`, `text-on-surface-variant`, `fill-m3-primary`, `bg-inverse-surface text-inverse-on-surface`, `text-m3-secondary`.

Opacity modifiers work (they use color-mix), which makes the M3 disabled pattern easy:
- disabled container: `bg-on-surface/12`
- disabled content: `text-on-surface/38`
- scrim: `bg-scrim/32`

There is **no** `accent`, `muted`, `destructive`, `border`, `input` or `ring` role in M3. Those names are shadcn tokens (1.3).

### 1.2 CSS variables

- `--md-sys-color-<role>`: 49 roles in kebab-case. `:root` holds the light baseline and `.dark` holds the dark baseline (hex values in color.md §2.1). ThemeState overrides them inline on `<html>` for custom seeds.
- Use them in arbitrary values or `style:`, for example `style:color="var(--md-sys-color-tertiary)"` or `ripple({ color: 'var(--md-sys-color-tertiary)' })`.

### 1.3 shadcn bridge (untouched shadcn components look M3)

| shadcn token / utility | M3 role |
|---|---|
| `background` | surface |
| `foreground` | on-surface |
| `card` / `card-foreground` | surface-container-low / on-surface |
| `popover` / `popover-foreground` | surface-container / on-surface |
| `primary` / `primary-foreground` | primary / on-primary |
| `secondary` / `secondary-foreground` | **secondary-container / on-secondary-container** |
| `muted` / `muted-foreground` | surface-container-highest / on-surface-variant |
| `accent` / `accent-foreground` | on-surface 10% over surface-container / on-surface |
| `destructive` / `destructive-foreground` | error / on-error |
| `border` | outline-variant (also the default border color of `*`) |
| `input` | outline |
| `ring` | secondary |
| `chart-1..5` | primary, tertiary, secondary, inverse-primary, outline |
| `sidebar`, `-foreground`, `-primary`, `-primary-foreground`, `-accent`, `-accent-foreground`, `-border`, `-ring` | surface-container, on-surface-variant, primary, on-primary, secondary-container, on-secondary-container, outline-variant, secondary |
| `--radius` | 12px (`--md-sys-shape-corner-medium`). shadcn's `rounded-sm…4xl` derive from it. |

### 1.4 State layers and disabled

| Variable | Value |
|---|---|
| `--md-sys-state-hover-opacity` | 0.08 |
| `--md-sys-state-focus-opacity` | 0.1 |
| `--md-sys-state-pressed-opacity` | 0.1 |
| `--md-sys-state-dragged-opacity` | 0.16 |
| `--md-sys-state-disabled-container-opacity` | 0.12 (on-surface) |
| `--md-sys-state-disabled-content-opacity` | 0.38 (on-surface) |
| `--md-sys-scrim-opacity` | 0.32 |

The focus indicator is global: `:focus-visible { outline: 3px solid var(--md-sys-color-secondary); outline-offset: 2px }` in `@layer base`. Override per component if needed. For example, text fields use a primary border instead, and an `outline-none` utility beats the base rule.

---

## 2. Typography

The **brand** typeface (`--md-ref-typeface-brand`) is Google Sans Flex. It is used for display, headline and title-large.
The **plain** typeface (`--md-ref-typeface-plain`) is Roboto Flex. It is used for title-medium/small, body and label.
Both fonts are loaded with every axis (`full.css`), so `font-stretch`, `font-optical-sizing`, and `font-variation-settings: 'GRAD' …, 'ROND' …` all work.

| Class | What it sets |
|---|---|
| `type-{style}` | **Complete M3 style**: family + size + line-height + tracking + weight. Use this by default. |
| `type-{style}-emphasized` | Same, with emphasized weight plus `font-variation-settings: 'ROND' 100` (rounded Google Sans Flex). |
| `text-{style}` / `text-{style}-emphasized` | Size + line-height + tracking + weight only, **no family** (inherits `font-sans` = Roboto Flex). Combine with `font-brand` if needed. `leading-*`, `tracking-*` and `font-*` utilities override the parts. |
| `font-sans`, `font-plain` | Roboto Flex stack |
| `font-brand` | Google Sans Flex stack |

`{style}` ∈ `display-lg` `display-md` `display-sm` `headline-lg` `headline-md` `headline-sm` `title-lg` `title-md` `title-sm` `body-lg` `body-md` `body-sm` `label-lg` `label-md` `label-sm`

| Style | Size / line height (px) | Tracking (px) | Weight (baseline / emphasized) | Family |
|---|---|---|---|---|
| display-lg | 57 / 64 | -0.25 | 400 / 500 | brand |
| display-md | 45 / 52 | 0 | 400 / 500 | brand |
| display-sm | 36 / 44 | 0 | 400 / 500 | brand |
| headline-lg | 32 / 40 | 0 | 400 / 500 | brand |
| headline-md | 28 / 36 | 0 | 400 / 500 | brand |
| headline-sm | 24 / 32 | 0 | 400 / 500 | brand |
| title-lg | 22 / 28 | 0 | 400 / 500 | brand |
| title-md | 16 / 24 | 0.15 | 500 / 600 | plain |
| title-sm | 14 / 20 | 0.1 | 500 / 600 | plain |
| body-lg | 16 / 24 | 0.5 | 400 / 500 | plain |
| body-md | 14 / 20 | 0.25 | 400 / 500 | plain |
| body-sm | 12 / 16 | 0.4 | 400 / 500 | plain |
| label-lg | 14 / 20 | 0.1 | 500 / 600 | plain |
| label-md | 12 / 16 | 0.5 | 500 / 600 | plain |
| label-sm | 11 / 16 | 0.5 | 500 / 600 | plain |

The emphasized weights are the variable-font values, so 600 rather than the static 700 (typography-shape.md §1.3–1.4).
Use the emphasized styles for: the button label of a primary action, badges, the extended FAB, selected list and menu items, and unread messages.

CSS variables: `--md-sys-typescale-{full-name}-{font|weight|size|line-height|tracking}` and `--md-sys-typescale-emphasized-{full-name}-…`. Here `full-name` is the long form, for example `display-large` or `label-small`. Also available: `--md-ref-typeface-brand|plain`, `--md-ref-typeface-weight-{regular|medium|semibold|bold}`, `--md-ref-typeface-emphasized-rond` (100).

---

## 3. Shape

### 3.1 Corner radius: `rounded-m3-*` (all side and corner variants work too: `rounded-t-m3-xl`, `rounded-s-m3-lg`, `rounded-tl-m3-md` …)

| Class | px | Token |
|---|---|---|
| `rounded-m3-none` | 0 | `--md-sys-shape-corner-none` |
| `rounded-m3-xs` | 4 | `--md-sys-shape-corner-extra-small` |
| `rounded-m3-sm` | 8 | `--md-sys-shape-corner-small` |
| `rounded-m3-md` | 12 | `--md-sys-shape-corner-medium` |
| `rounded-m3-lg` | 16 | `--md-sys-shape-corner-large` |
| `rounded-m3-lg-increased` | 20 | `--md-sys-shape-corner-large-increased` |
| `rounded-m3-xl` | 28 | `--md-sys-shape-corner-extra-large` |
| `rounded-m3-xl-increased` | 32 | `--md-sys-shape-corner-extra-large-increased` |
| `rounded-m3-xxl` | 48 | `--md-sys-shape-corner-extra-extra-large` |
| `rounded-m3-full` | 9999 | `--md-sys-shape-corner-full` |

Asymmetric tokens: `extra-small.top` = `rounded-t-m3-xs`, `large.top` = `rounded-t-m3-lg`, `large.start` = `rounded-s-m3-lg`, `large.end` = `rounded-e-m3-lg`, `extra-large.top` = `rounded-t-m3-xl`.

**Animating to or from full:** don't transition from 9999px, because the radius stays clamped and then snaps. Use the real value instead, half the height (`rounded-[20px]` for a 40px-tall button), then animate to the pressed radius.

### 3.2 Shape library: `#lib/m3/shapes.js`

```ts
import { SHAPES, SHAPE_NAMES, SHAPE_LABELS, LOADING_INDICATOR_SHAPES, shapePath, morphPath, getMorph,
         materialShape, type ShapeName } from '#lib/m3/shapes.js';
```

| Export | Usage |
|---|---|
| `type ShapeName` | Union of the 35 names: `circle` `square` `slanted` `arch` `fan` `arrow` `semiCircle` `oval` `pill` `triangle` `diamond` `clamShell` `pentagon` `gem` `sunny` `verySunny` `cookie4Sided` `cookie6Sided` `cookie7Sided` `cookie9Sided` `cookie12Sided` `ghostish` `clover4Leaf` `clover8Leaf` `burst` `softBurst` `boom` `softBoom` `flower` `puffy` `puffyDiamond` `pixelCircle` `pixelTriangle` `bun` `heart` |
| `SHAPES` | `Record<ShapeName, () => RoundedPolygon>`, the raw MaterialShapes.kt builders |
| `SHAPE_NAMES` | `ShapeName[]` in library order |
| `SHAPE_LABELS` | `Record<ShapeName, string>`, the m3 display names (`'9-sided cookie'` …) |
| `shapePath(name, size = 100, digits = 2)` | SVG `d` for `viewBox="0 0 size size"` (cached): `<svg viewBox="0 0 100 100"><path d={shapePath('cookie9Sided')} /></svg>` |
| `morphPath(a, b, progress, size = 100, digits = 2)` | Interpolated `d`. `progress` 0 = a, 1 = b. Values outside [0, 1] overshoot, so you can drive it with a spring. The Morph is cached per pair. |
| `getMorph(a, b)` | Cached `Morph`. `.toSvgPath(t, { scale })` and `.asCubics(t)` |
| `materialShape(name)` | Normalized (unit-square) `RoundedPolygon` |
| `LOADING_INDICATOR_SHAPES` | `['softBurst','cookie9Sided','pentagon','pill','sunny','cookie4Sided','oval']`, the indeterminate cycle. Spec: a morph every 650ms on spring ζ 0.6 / k 200, +90° per morph, plus a global spin of 360° per 4666ms linear. Container 48dp, indicator 38dp. |
| `RoundedPolygon`, `Morph`, `circle`, `rectangle`, `star`, `regularPolygon`, `polygonFromVertices`, `rounding`, `toSvgPath`, `cubicsToSvgPath` | The low-level port (androidx.graphics.shapes) |

For a clip-path at an arbitrary size, use `<clipPath clipPathUnits="objectBoundingBox"><path d={shapePath(name, 1, 4)} /></clipPath>`.

---

## 4. Elevation

| Class | Level | dp | Use at rest |
|---|---|---|---|
| `shadow-m3-0` | 0 | 0 | most components |
| `shadow-m3-1` | 1 | 1 | elevated button/card, modal sheets, banner |
| `shadow-m3-2` | 2 | 3 | menu, nav bar, scrolled app bar, toolbar, rich tooltip |
| `shadow-m3-3` | 3 | 6 | FAB, dialogs, search, pickers |
| `shadow-m3-4` | 4 | 8 | hover/drag only |
| `shadow-m3-5` | 5 | 12 | hover/drag only |

Variables: `--md-sys-elevation-level0..5`. Buttons and FABs go up one level on hover (`hover:shadow-m3-2`). Prefer tonal `surface-container-*` roles over shadows for separation. Surface tint is deprecated.

---

## 5. Motion

### 5.1 CSS utilities

| Class | Value |
|---|---|
| `ease-spring-fast-spatial` + `duration-spring-fast-spatial` | expressive ζ 0.6 k 800 → linear(), 359ms (standard scheme: ζ 0.9 k 1400, 224ms) |
| `ease-spring-default-spatial` + `duration-spring-default-spatial` | ζ 0.8 k 380, 435ms (std: ζ 0.9 k 700, 317ms) |
| `ease-spring-slow-spatial` + `duration-spring-slow-spatial` | ζ 0.8 k 200, 599ms (std: ζ 0.9 k 300, 484ms) |
| `ease-spring-fast-effects` + `duration-spring-fast-effects` | ζ 1 k 3800, 150ms (both schemes) |
| `ease-spring-default-effects` + `duration-spring-default-effects` | ζ 1 k 1600, 231ms |
| `ease-spring-slow-effects` + `duration-spring-slow-effects` | ζ 1 k 800, 326ms |
| `ease-m3-standard` / `-standard-accelerate` / `-standard-decelerate` | cubic-bezier(0.2,0,0,1) / (0.3,0,1,1) / (0,0,0,1) |
| `ease-m3-emphasized` | exact emphasized path as linear() |
| `ease-m3-emphasized-accelerate` / `-emphasized-decelerate` | cubic-bezier(0.3,0,0.8,0.15) / (0.05,0.7,0.1,1) |
| `ease-m3-linear`, `ease-m3-legacy`, `ease-m3-legacy-accelerate`, `ease-m3-legacy-decelerate` | |
| `duration-m3-short1..4` | 50 / 100 / 150 / 200ms |
| `duration-m3-medium1..4` | 250 / 300 / 350 / 400ms |
| `duration-m3-long1..4` | 450 / 500 / 550 / 600ms |
| `duration-m3-extra-long1..4` | 700 / 800 / 900 / 1000ms |

Pair them with Tailwind's `transition-*`, for example `transition-[border-radius] ease-spring-default-effects duration-spring-default-effects`.

Rules:
- **Spatial** springs (position, size, rotation, corner radius) overshoot.
- **Effects** springs (color, opacity) never overshoot.
- Fast is for small components, default for partial-screen motion, slow for full-screen motion.
- Button, icon button and split button press morphs use **default-effects** (no bounce).
- Toggle-button shape changes and the button-group squeeze use **fast-spatial**.

The `ease-spring-*` and `duration-spring-*` values follow the **motion scheme**:
- The default is expressive.
- `data-motion-scheme="standard"` on any element switches its subtree. ThemeState sets this attribute on `<html>`.

They also follow **reduced motion**: under `prefers-reduced-motion: reduce`, spatial durations become 0ms with no overshoot and `--md-sys-motion-reduced` is set to 1. Effects springs are kept.

Tailwind's `translate-x-*`, `scale-*` and `rotate-*` use the individual `translate`/`scale`/`rotate` properties, which `transition-transform` covers.

### 5.2 CSS variables

`--md-sys-motion-duration-{short1…extra-long4}`, `--md-sys-motion-easing-{standard|standard-accelerate|standard-decelerate|emphasized|emphasized-accelerate|emphasized-decelerate|linear|legacy|legacy-accelerate|legacy-decelerate}`, `--md-sys-motion-spring-{fast|default|slow}-{spatial|effects}-{easing|duration|damping|stiffness}`, `--md-ref-motion-spring-curve-d{60|80|90|100}`, `--md-sys-motion-reduced` (0/1).

### 5.3 JS: `#lib/m3/motion.js`

| Export | Usage |
|---|---|
| `DURATION` | `{ short1: 50, …, extraLong4: 1000 }` (ms) |
| `EASING` | `{ standard, standardAccelerate, standardDecelerate, emphasized, emphasizedAccelerate, emphasizedDecelerate, linear, legacy, legacyAccelerate, legacyDecelerate }`, CSS strings for WAAPI `easing` |
| `SPRING_CURVES` | `{ d60, d80, d90, d100 }`, linear() strings |
| `SPRINGS[scheme][token]` | `{ dampingRatio, stiffness, durationMs, css }`. `scheme` ∈ `'expressive' \| 'standard'` and `token` ∈ `'fast-spatial' \| 'default-spatial' \| 'slow-spatial' \| 'fast-effects' \| 'default-effects' \| 'slow-effects'` |
| `SPRING_TOKENS`, `type SpringToken`, `type MotionScheme`, `type SpringParams`, `type SpringSpec` | |
| `springCss(token)` | `{ easing, duration, transition }` as `var(--md-sys-motion-spring-…)` refs, so they follow the scheme and reduced motion: `style:transition={`transform ${springCss('fast-spatial').transition}`}` |
| `springTransition(token, ...props)` | `'transform <dur> <ease>, opacity <dur> <ease>'` |
| `activeSpring(token, el?)` | The `SpringSpec` for the scheme active at `el` (reads the closest `[data-motion-scheme]`) |
| `springValue(t, spring, from = 0, to = 1, velocity = 0)` | Analytic, frame-rate-independent value at `t` seconds |
| `springAt(t, x0, v0, spring)` / `springVelocity(...)` | Displacement and velocity helpers |
| `animateSpring(from, to, spring, onFrame, { velocity?, threshold?, reducedMotion?, onComplete? })` | rAF-driven spring, **returns cancel()**. `onFrame(value, velocity)`. To retarget: cancel, then call again from the last value with `{ velocity }`. |

```ts
let progress = $state(0), vel = 0, cancel: (() => void) | undefined;
function go(target: number) {
	cancel?.();
	cancel = animateSpring(progress, target, SPRINGS[theme.motionScheme]['fast-spatial'],
		(v, dv) => { progress = v; vel = dv; }, { velocity: vel, reducedMotion: prefersReducedMotion.current });
}
```

The CSS easings don't preserve velocity when interrupted. Use `animateSpring` (or WAAPI with a fresh start value) for interruptible or gesture motion. `Spring` from `svelte/motion` is frame-rate dependent. If you use it anyway, take the fitted params from motion.md §3.4.

---

## 6. Ripple and state layer: `#lib/m3/ripple.svelte.js`

```svelte
<script lang="ts">
	import { ripple, stateLayer } from '#lib/m3/ripple.svelte.js';
</script>
<button class="rounded-m3-full bg-m3-primary text-on-primary" {@attach ripple()}>Save</button>
<button {@attach ripple({ color: 'var(--md-sys-color-primary)', centered: true })}>…</button>
<a href="/x" class="rounded-m3-md" {@attach stateLayer()}>No ripple, flat pressed layer</a>
```

| Export | Notes |
|---|---|
| `ripple(options?)` | Hover 8%, focus-visible 10%, and a press ripple at 10% that grows from the pointer. The ripple grows over 450ms on the standard easing and stays pressed for at least 225ms. Touch input waits 150ms first, so scrolling doesn't trigger ripples. The ripple fades in over 105ms and out over 375ms (material-web). Space and Enter press the ripple from the center, and programmatic or keyboard clicks show a centered ripple. |
| `stateLayer(options?)` | Same hover and focus layer, with pressed shown as a flat 10% layer instead of a ripple |
| `RippleOptions` | `{ color?: string; disabled?: boolean; centered?: boolean }`. The default color is `currentColor`, which is the content color the spec asks for. |
| `RIPPLE_TIMING` | The material-web constants |

Behavior:
- The attachment prepends `<span data-m3-ripple aria-hidden>`, which has `absolute inset-0 overflow-hidden pointer-events-none` and `border-radius: inherit`. The host only needs its final `rounded-*`.
- A host with `position: static` gets `position: relative`.
- The layer is hidden while the host matches `[disabled]`, `[aria-disabled=true]`, or `[data-disabled]` (unless `data-disabled="false"`).
- Under `prefers-reduced-motion`, the ripple shows at full size immediately with no grow.
- The overlay paints over non-positioned content at low opacity. If a child must sit above it, give that child `relative`.
- The CSS that styles the overlay lives in `layout.css` (`[data-m3-ripple]`).

---

## 7. Theme state: `#lib/m3/theme.svelte.js`

The root layout already calls `createTheme(); theme.start();`. Read the theme anywhere below it:

```ts
import { getTheme } from '#lib/m3/theme.svelte.js';
const theme = getTheme();
theme.seed = '#0b57d0';           // regenerates both schemes with MCU (lazy-loaded in the browser)
theme.variant = 'vibrant';        // 'tonalSpot'|'expressive'|'vibrant'|'fidelity'|'content'|'neutral'|'monochrome'|'rainbow'|'fruitSalad'
theme.contrast = 0.5;             // -1 … 1 (0 standard, 0.5 medium, 1 high)
theme.specVersion = '2025';       // '2021' (default, matches baseline) | '2025'
theme.motionScheme = 'standard';  // writes <html data-motion-scheme>
theme.dark = true;                // mirrors mode-watcher; setter calls setMode()
theme.reset();                    // back to the static baseline (removes inline vars)
```

| Member | |
|---|---|
| `seed`, `variant`, `contrast`, `specVersion`, `motionScheme` | `$state` |
| `dark` | Getter that reads mode-watcher `mode.current === 'dark'`. The setter calls `setMode`. Use `toggleMode` from `mode-watcher` for a toggle. |
| `isBaseline` | True for seed #6750A4 + tonalSpot + contrast 0 + spec 2021. The static layout.css baseline is then in effect, with no inline vars. |
| `ready` | False while MCU is loading |
| `lightColors` / `darkColors` | `ColorMap \| null`, role → hex |
| `colors` | The active mode's `ColorMap`, falling back to the baseline while loading |
| `cssVars` | The active mode's `{ '--md-sys-color-…': hex }` |
| `apply()` | Writes the vars and `data-motion-scheme` to `<html>`. The effect in `start()` calls it automatically. |
| `toCss()` | Stylesheet text with both schemes (`:root` / `.dark`) |
| `start()` | Creates the effects and restores the saved configuration from `localStorage` (`m3-theme`); every later change is saved. Call only during component init. |
| `createTheme()` / `getTheme()` | `createContext` pair |
| `SCHEME_VARIANTS`, `DEFAULT_SEED`, `buildColorMap(mcu, seed, isDark, variant?, contrast?, spec?)`, `type SchemeVariant`, `type SpecVersion` | |

`#lib/m3/color-roles.js` exports `COLOR_ROLES` (the 49 kebab-case roles), `type ColorRole`, `type ColorMap`, `cssVar(role)`, `roleToCamel(role)`, `BASELINE_LIGHT`, and `BASELINE_DARK`.

**SSR note:** `@material/material-color-utilities@0.4.0` is never imported statically. ThemeState loads it with `import()` inside an effect, and `vite.config.ts` also sets `ssr.noExternal` for it. Keep it that way.

---

## 8. Icons

`<Icon name="favorite" fill size={24} weight={400} grade={0} />` from `#lib/components/ui/icon/index.js` uses Material Symbols Rounded. The `.m3-icon` class animates `font-variation-settings` (FILL/wght/GRAD/opsz) on the fast-effects spring, so toggling `fill` morphs the icon smoothly.
