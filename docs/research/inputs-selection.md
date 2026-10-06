# M3 Expressive: Selection Controls, Inputs & Chips — Research Spec

Research date: 2026-10-06. Target: Svelte 5 + Tailwind 4 + bits-ui 2.x (shadcn-svelte base already in `src/lib/components/ui`).

**How to read this file**

- Every numeric value has a source tag in brackets, e.g. `[c-switch-tok]`. The tags resolve to URLs in [Sources](#sources).
- Units: `dp` → CSS `px` 1:1 on the web. `sp` → `px` (or `rem` at 16px root).
- Colors use **M3 color roles** (`primary`, `on-surface-variant`, `surface-container-highest` …). `x @ 38%` means "role x at 0.38 opacity".
- State-layer opacities (all components) [c-state-tok]: **hover 0.08, focus 0.10, pressed 0.10, dragged 0.16**.
- Focus indicator (all controls) [m3-switch][m3-checkbox]: color `secondary`, **thickness 3dp, offset 2dp**.
- Elevation levels [c-elev-tok]: L0 0dp, L1 1dp, L2 3dp, L3 6dp, L4 8dp, L5 12dp.
- Shape scale [c-shape-tok]: none 0, extra-small 4, small 8, medium 12, large 16, large-increased 20, extra-large 28, extra-large-increased 32, extra-extra-large 48, full = 50%.
- Type scale used here [c-type-tok]: `body-large` 16/24 +0.5 w400 · `body-medium` 14/20 +0.2 w400 · `body-small` 12/16 +0.4 w400 · `label-large` 14/20 +0.1 w500 · `label-medium` 12/16 +0.5 w500 · `label-small` 11/16 +0.5 w500 · `title-medium` 16/24 +0.2 w500.
- Source precedence when sources disagree: m3.material.io spec page (rendered in a browser, the token tables expose baseline light-scheme hex values) > Jetpack Compose `androidx-main` tokens (generated, most recent) > MDC-Android `tokens.xml` (generated) > material-web `v0_192` (pre-Expressive, maintenance mode). Every disagreement is listed in [Discrepancies](#discrepancies--unverifiable-items).

---

## 0. Motion system (shared by every component below)

M3 Expressive replaces duration+easing with **springs** (motion scheme). Compose wires component animations to `MotionSchemeKeyTokens` (FastSpatial, DefaultEffects …). `MaterialExpressiveTheme` uses the *expressive* scheme; `MaterialTheme` uses the *standard* scheme. [c-motion-scheme]

| Token | Expressive damping / stiffness [c-expr-motion] | Standard damping / stiffness [c-std-motion] |
|---|---|---|
| fast-spatial | 0.6 / 800 | 0.9 / 1400 |
| default-spatial | 0.8 / 380 | 0.9 / 700 |
| slow-spatial | 0.8 / 200 | 0.9 / 300 |
| fast-effects | 1.0 / 3800 | 1.0 / 3800 |
| default-effects | 1.0 / 1600 | 1.0 / 1600 |
| slow-effects | 1.0 / 800 | 1.0 / 800 |

"Spatial" = position/size/shape (may overshoot). "Effects" = color/opacity (critically damped, no overshoot).

Derived CSS equivalents (mass = 1, settle at 0.1% residual; **these are my calculations, not official values**):

| Token | Expressive ≈ duration / overshoot | Standard ≈ duration / overshoot |
|---|---|---|
| fast-spatial | 407ms / 9.5% | 205ms / 0.15% |
| default-spatial | 443ms / 1.5% | 290ms / 0.15% |
| slow-spatial | 611ms / 1.5% | 443ms / 0.15% |
| fast-effects | 150ms / 0 | 150ms / 0 |
| default-effects | 231ms / 0 | 231ms / 0 |
| slow-effects | 326ms / 0 | 326ms / 0 |

Legacy easing curves still used by some web/Android code [mw-easing][c-motion-tok][mdc-motion-tok]: standard `cubic-bezier(0.2,0,0,1)`, emphasized-decelerate `cubic-bezier(0.05,0.7,0.1,1)`, emphasized-accelerate `cubic-bezier(0.3,0,0.8,0.15)`. Durations: short1 50, short2 100, short3 150, medium3 350, medium4 400, long4 600 (ms).

Spring → CSS `linear()` helper (for Tailwind/CSS transitions; Svelte's `Spring` class uses a different, non-physical parameterisation, so don't map these numbers onto it directly):

```ts
// src/lib/motion/spring.ts
export function springToLinear(stiffness: number, dampingRatio: number, samples = 48) {
  const w0 = Math.sqrt(stiffness); // mass = 1
  const z = dampingRatio;
  const settle = z < 1 ? Math.log(1000) / (z * w0) : 9.23 / w0; // seconds
  const x = (t: number) => {
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t); // critically damped
  };
  const pts = Array.from({ length: samples + 1 }, (_, i) => +x((i / samples) * settle).toFixed(4));
  return { durationMs: Math.round(settle * 1000), easing: `linear(${pts.join(', ')})` };
}
// e.g. expressive fast-spatial: springToLinear(800, 0.6)
```

---

## 1. Checkbox

### 1.1 Dimensions

| Element | Value | Source |
|---|---|---|
| Container (box) | 18 × 18dp | [m3-checkbox][c-checkbox-tok][mw-checkbox-v] |
| Container corner | 2dp | [m3-checkbox][c-checkbox-tok] |
| Unselected outline width (all states incl. disabled/error) | 2dp | [m3-checkbox][c-checkbox-tok] |
| Selected outline width | 0dp (filled box) | [c-checkbox-tok] |
| Icon (checkmark) size | 18dp, center-aligned | [m3-checkbox] |
| Checkmark stroke | 2dp, square cap | [c-checkbox] (`StrokeWidth = 2.dp`, `StrokeCap.Square`) |
| State layer | 40dp circle (corner full) | [m3-checkbox][c-checkbox-tok] |
| Touch target | 48dp | [m3-checkbox] |
| Legacy Compose box (flag off) | 20dp box with 2dp padding | [c-checkbox] (`CheckboxSize = 20.dp`, `CheckboxDefaultPadding = 2.dp`) |

Checkmark geometry (Compose, fractions of box width, styling fix enabled) [c-checkbox]: polyline `(0.25, 0.50) → (0.40, 0.65) → (0.75, 0.30)`. For indeterminate, the same path "gravitates" to y = 0.5, giving a horizontal bar `(0.25,0.5)→(0.75,0.5)`. material-web builds the mark from two `<rect>`s (short end and long end, long = 10px, both 2px thick) that rotate into a check or collapse into the dash [mw-checkbox-s].

### 1.2 Colors

| State | Unselected outline | Selected container | Selected icon | State layer (unsel / sel) |
|---|---|---|---|---|
| Enabled | `on-surface-variant` | `primary` | `on-primary` | — |
| Hover | `on-surface` | `primary` | `on-primary` | `on-surface` / `primary` @ 8% |
| Focus | `on-surface` | `primary` | `on-primary` | `on-surface` / `primary` @ 10% |
| Pressed | `on-surface` | `primary` | `on-primary` | **`primary` / `on-surface`** @ 10% (swapped: the ripple previews the next state) |
| Disabled | `on-surface` @ 38% | `on-surface` @ 38% | `surface` | — |
| Error (all states) | `error` | `error` | `on-error` | `error` @ 8/10/10% |

Sources: [m3-checkbox][c-checkbox-tok][mdc-checkbox-tok]. The adjacent text label uses `on-surface` and does not change with state [m3-checkbox].

### 1.3 Animation

| Transition | Compose (expressive) [c-checkbox] | material-web (CSS) [mw-checkbox-s] |
|---|---|---|
| Off → On: check draw | path trimmed 0→100% of its length, `DefaultSpatial` spring | box + icon `scale(0.6→1)` 350ms emphasized-decelerate, opacity 50ms linear; marks transition 350ms emphasized-decelerate |
| On → Off | check fraction **snaps** to 0 after a 100ms delay (`SnapAnimationDelay = 100`) | scale 1→0.6 150ms emphasized-accelerate, opacity 50ms linear |
| On ↔ Indeterminate | morph ("center gravitation") `DefaultSpatial` | rects transform/width 350ms |
| Box fill/outline color | in: `DefaultEffects`; out: `FastEffects`; disabled: no animation | — |

### 1.4 Implementation note

Use **bits-ui `Checkbox.Root`** (`checked`, `indeterminate`, `disabled`, `name`, `required`; renders `button[role=checkbox]` with `data-state="checked|unchecked|indeterminate"`). Render a 48px hit area containing a 40px `::before` state layer and an 18px box. Draw the mark as one inline SVG `<path d="M4.5 9 L7.2 11.7 L13.5 5.4">` (an 18-unit viewBox with the Compose fractions) with `pathLength="1"` and `stroke-dasharray: 1`, and animate `stroke-dashoffset 1→0` with the default-spatial spring (`linear()`). When unchecking, wait 100ms and then hide the mark instantly. Map `aria-invalid` to the error palette. Replace the current shadcn checkbox entirely.

---

## 2. Radio button

### 2.1 Dimensions

| Element | Value | Source |
|---|---|---|
| Icon (outer ring) | 20dp | [m3-radio][c-radio-tok][mw-radio-v] |
| Ring stroke | 2dp | [c-radio] (`RadioStrokeWidth`) |
| Inner dot (visible) | 10dp diameter (Compose `RadioButtonDotSize = 12dp`, drawn at radius 6 − stroke/2 = 5dp; material-web uses `r="5"` in a 20-unit viewBox) | [c-radio][mw-radio-ts] |
| Padding around icon | 2dp (Compose) | [c-radio] |
| State layer | 40dp circle | [m3-radio][c-radio-tok] |
| Touch target | 48dp | [m3-radio] |

### 2.2 Colors

| State | Unselected icon | Selected icon | State layer (unsel / sel) |
|---|---|---|---|
| Enabled | `on-surface-variant` | `primary` | — |
| Hover | `on-surface` | `primary` | `on-surface` / `primary` @ 8% |
| Focus | `on-surface` | `primary` | `on-surface` / `primary` @ 10% |
| Pressed | `on-surface` | `primary` | **`primary` / `on-surface`** @ 10% (swapped) |
| Disabled | `on-surface` @ 38% | `on-surface` @ 38% | — |

Sources: [m3-radio][c-radio-tok][mdc-radio-tok]. Adjacent label: `on-surface` [m3-radio].

### 2.3 Animation

- Compose: dot radius 0 → 6dp with the `FastSpatial` spring (expressive gives a visible overshoot); ring/dot color `DefaultEffects`; disabled state snaps [c-radio].
- material-web: `@keyframes inner-circle-grow { scale(0) → scale(1) }` 300ms emphasized-decelerate; ring color `fill 50ms linear` [mw-radio-s].

### 2.4 Implementation note

Use **bits-ui `RadioGroup.Root` / `RadioGroup.Item`** (roving focus, arrow keys, `data-state="checked"`). Each item is a 48px target with a 40px state layer and a 20px SVG: `circle r=9 stroke-width=2` plus a `circle r=5` dot animated with `transform: scale()` and the fast-spatial spring (`transform-origin: center`).

---

## 3. Switch

### 3.1 Dimensions

| Element | Value | Source |
|---|---|---|
| Track | 52 × 32dp, corner full | [m3-switch][c-switch-tok][mdc-switch-tok] |
| Track outline (unselected only) | 2dp | [m3-switch][c-switch-tok] |
| Handle unselected (no icon) | 16 × 16dp | [m3-switch][c-switch-tok] |
| Handle unselected with icon | 24 × 24dp | [m3-switch][c-switch-tok] |
| Handle selected | 24 × 24dp | [m3-switch][c-switch-tok] |
| Handle pressed (any state) | 28 × 28dp | [m3-switch][c-switch-tok] |
| Icon (selected / unselected) | 16dp | [m3-switch][c-switch-tok] |
| State layer | 40dp circle, centered on handle | [m3-switch][c-switch-tok] |
| Touch target | 48dp | [m3-switch][mw-switch-v] |

Handle placement from the Compose layout math (x = left edge of the handle inside the 52dp track; the handle is vertically centered) [c-switch]:

| State | Size | x | Handle center x |
|---|---|---|---|
| Unselected, no icon | 16 | 8 | 16 |
| Unselected, with icon | 24 | 4 | 16 |
| Selected | 24 | 24 | 36 |
| Pressed, unselected | 28 | 2 (= outline width) | 16 |
| Pressed, selected | 28 | 22 | 36 |

The handle center only ever sits at 16 or 36, so implement it as `left: 16|36px; translate(-50%,-50%)` and change `width`/`height`.

### 3.2 Colors

| Part | Enabled | Hover | Focus | Pressed | Disabled |
|---|---|---|---|---|---|
| Track — selected | `primary` | `primary` | `primary` | `primary` | `on-surface` @ 12% |
| Track — unselected | `surface-container-highest` | same | same | same | `surface-container-highest` @ 12% |
| Track outline — unselected | `outline` | `outline` | `outline` | `outline` | `on-surface` @ 12% |
| Handle — selected | `on-primary` | `primary-container` | `primary-container` | `primary-container` | `surface` @ 100% |
| Handle — unselected | `outline` | `on-surface-variant` | `on-surface-variant` | `on-surface-variant` | `on-surface` @ 38% |
| Icon — selected | `on-primary-container` (Compose) / `primary` (spec, MDC) | same | same | same | `on-surface` @ 38% |
| Icon — unselected | `surface-container-highest` | same | same | same | `surface-container-highest` @ 38% |
| State layer | — | sel `primary` / unsel `on-surface` @ 8% | @ 10% | @ 10% | — |

Sources: [m3-switch][c-switch-tok][mdc-switch-tok]. Compose composites the translucent disabled colors over `surface` before drawing them.

### 3.3 Animation

- Compose (expressive): handle **size and offset** animate together with the `FastSpatial` spring (damping 0.6, stiffness 800, which gives about 9.5% overshoot over about 400ms). While **pressed**, the size (→28) and offset **snap** (`SnapSpec`); on release they spring to the target. Compose does not animate the colors [c-switch].
- material-web (pre-Expressive CSS): handle position `margin 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)` (custom overshoot), handle size `250ms` standard easing, handle color `67ms linear`, track color/opacity `67ms linear`, icon `transform 167ms standard, opacity 33ms linear, fill 67ms linear` [mw-switch-handle][mw-switch-track][mw-switch-icon].

### 3.4 Implementation note

Use **bits-ui `Switch.Root` + `Switch.Thumb`** (`data-state="checked|unchecked"`, Space/Enter keyboard support). Style the root as the 52×32 track, with `border: 2px` only when unchecked, and position the thumb absolutely. For the pressed state, use `:active` on the root (or set a `data-pressed` attribute on `pointerdown`): the thumb goes to 28px with `transition: none`. On release, transition `left`, `width` and `height` with `springToLinear(800, 0.6)`. Icons are optional (`check`/`close`, 16px) via a prop; when icons are shown, the unselected thumb is 24px.

---

## 4. Slider (M3 Expressive)

### 4.1 Variants & configurations [m3-slider][m3-slider-g][mdc-slider-doc]

- Variants: **standard**, **centered** (value grows from the middle, with zero or the default value in the middle), **range** (two handles).
- Configurations: horizontal or vertical orientation (avoid vertical range sliders); sizes **XS (default) / S / M / L / XL**; stop indicators (the discrete mode); value indicator; inset icon (standard slider only, sizes M/L/XL only, never on centered or range sliders).
- The active and inactive tracks always have the same height. Reserve XL for hero moments [m3-slider-g].

### 4.2 Common dimensions

| Element | Value | Source |
|---|---|---|
| Handle width (enabled, hover, disabled) | 4dp | [m3-slider][c-slider-tok][mdc-slider-tok] |
| Handle width (pressed / dragged / focused) | 2dp | [m3-slider][c-slider-tok]. Compose and MDC simply halve the width (`THUMB_WIDTH_PRESSED_RATIO = .5`) [c-slider][mdc-baseslider] |
| Handle shape | full | [c-slider-tok] |
| Gap between handle and track (each side) | 6dp (`active-handle-leading-space` / `trailing-space` / `padding`) | [m3-slider][c-slider-tok][mdc-slider-tok] |
| Track inner corner (corners facing the handle) | 2dp | [c-slider] (`TrackInsideCornerSize = 2.dp`), [mdc-slider-styles] (`trackInsideCornerSize 2dp`) |
| Stop indicator | 4dp dot, full | [m3-slider][c-slider-tok][mdc-slider-tok] |
| Stop indicator trailing space | 4dp (spec page) / 6dp (Compose token) | [m3-slider][c-slider-tok] |
| Value indicator container | 44dp tall × 48dp wide | [m3-slider] (measurements table) |
| Value indicator → handle gap ("active bottom space") | 12dp | [m3-slider][c-slider-tok][mdc-slider-tok] |
| Value indicator text | `label-large` (Compose); the spec table lists 14/20, w400, +0.5 | [c-slider-tok][m3-slider] |
| Inset icon padding from track end | 10dp (MDC) | [mdc-slider-dimens] |
| Focus ring inset padding | 4dp (Compose) / 2dp (MDC) | [c-slider][mdc-slider-dimens] |

### 4.3 Per-size dimensions

| Size | Track height | Track outer corner | Handle height | Inset icon |
|---|---|---|---|---|
| XS (default) | 16dp | 8dp | 44dp | — |
| S | 24dp | 8dp | 44dp | — |
| M | 40dp | 12dp | **52dp** (spec page) / 44dp (MDC tokens.xml) | 24dp |
| L | 56dp | 16dp | 68dp | 24dp |
| XL | 96dp | 28dp | 108dp | 32dp |

Sources: [m3-slider] (measurements table), [mdc-slider-tok] (`m3_comp_slider_{xsmall…xlarge}_*`), [m3-slider-g] (track sizes).

Track geometry rules (Compose `drawTrack`) [c-slider]:
- The active track runs from the start to `handleCenter − (handleWidth/2 + 6dp)`. The inactive track runs from `handleCenter + (handleWidth/2 + 6dp)` to the end. Outer ends use the size's corner radius; ends next to the handle use 2dp.
- Compose computes the gap from the handle's **layout** width (4dp), not the visually shrunk 2dp. So when the handle is pressed, the visible gap grows by 1dp on each side.
- The handle travels between the corner insets: with stops, values map onto `[corner, width − corner]` so the handle can sit exactly on the first and last stops.
- The stop indicator at the end of the inactive track is always drawn (the 3:1 contrast rule). It can be removed only if the inactive track itself has 3:1 contrast [m3-slider-g]. Compose centers it `cornerSize` from the end.
- Centered: inactive track on both sides, active track between the center and the handle, stop indicators at both ends [c-slider].
- Range: inactive | gap | handle | gap | active | gap | handle | gap | inactive [c-slider].

### 4.4 Colors

| Part | Enabled | Hover | Focus | Pressed | Disabled |
|---|---|---|---|---|---|
| Active track | `primary` | `primary` | `primary` | `primary` | `on-surface` @ 38% |
| Inactive track | `secondary-container` | same | same | same | `on-surface` @ 12% |
| Handle | `primary` | `primary` | `primary` | `primary` | `on-surface` @ 38% |
| Stop on inactive track | `on-secondary-container` | — | — | — | `on-surface` |
| Stop on active track | `on-primary` | — | — | — | `inverse-on-surface` |
| Value indicator container | `inverse-surface` | | | | |
| Value indicator text | `inverse-on-surface` | | | | |
| Inset icon | active `on-primary`, inactive `on-secondary-container` (inferred from the spec's color-role list) | | | | |

Sources: [m3-slider][c-slider-tok][mdc-slider-tok]. The spec page marks the old 40dp state-layer and halo tokens *[Deprecated]*, and MDC sets `haloColor` to transparent [mdc-slider-styles]. So the expressive slider has **no state layer**; the handle width change is the only interaction feedback.

### 4.5 Animation

- Handle shrink 4→2dp on press, drag or focus: **instant** in both Compose (`Thumb` swaps the size with no animation) and MDC [c-slider][mdc-baseslider]. A short fast-spatial transition would be acceptable polish, but the spec doesn't call for one.
- Value indicator (MDC): reveal (scale and fade, anchored to the handle). **Enter = `motionDurationMedium4` (400ms) with emphasized easing; exit = `motionDurationShort3` (150ms) with emphasized-accelerate.** If the theme lacks those attributes, the fallbacks are 83ms / 117ms [mdc-baseslider][mdc-motion-tok]. The indicator shows only while pressed, dragged or keyboard-focused, and on only one handle at a time for range sliders [m3-slider-g].
- Snapping with stops: the handle snaps to the closest stop while dragging and on track tap [m3-slider-g].

### 4.6 Implementation note

Use **bits-ui `Slider.Root` / `Slider.Thumb` / `Slider.Tick` / `Slider.ThumbLabel`** (`type="single"|"multiple"`, `step`, `orientation`, keyboard, pointer, `thumbPositioning`, `trackPadding`) for behaviour and a11y only, and **draw the track yourself**. Compute `pct` per thumb and render 2–3 absolutely positioned segments (`inactive`, `active`, `inactive`). Offset each segment end by `calc(var(--handle-w)/2 + 6px)` from the adjacent thumb, and set per-corner radii: the size's corner on the outside, `2px` toward the handle. `Slider.Range` can't express the gaps. Expose `size: 'xs'|'s'|'m'|'l'|'xl'`, `variant: 'standard'|'centered'|'range'`, `stops`, `valueIndicator` and `insetIcon`. Hide the native thumb visuals. The thumb element is a 4×H pill that becomes `width: 2px` on `[data-active]`/`:focus-visible`.

---

## 5. Text fields (filled & outlined)

### 5.1 Dimensions & padding

| Attribute | Filled | Outlined | Source |
|---|---|---|---|
| Container height | 56dp | 56dp | [m3-tf][c-otf-tok][c-tf-defaults] |
| Min width (Compose) | 280dp | 280dp | [c-tf-defaults] |
| Corner | extra-small **top** (4,4,0,0) | extra-small (4 all) | [c-ftf-tok][c-otf-tok] |
| Top/bottom padding with label | 8dp | 16dp to input (label sits on the outline) | [m3-tf][c-tf] (`TextFieldWithLabelVerticalPadding = 8.dp`), [mw-ftf] |
| Top/bottom padding without label | 16dp | 16dp | [mw-ftf][mw-otf] |
| Start/end padding (no icon) | 16dp | 16dp | [m3-tf][c-tf-impl] |
| Start/end padding on icon side | 12dp | 12dp | [m3-tf][mw-ftf] |
| Icon ↔ text gap | 16dp | 16dp | [m3-tf][mw-ftf] (`icon-input-space`) |
| Leading / trailing icon | 24dp (48dp touch target) | 24dp | [c-ftf-tok][c-otf-tok] |
| Prefix/suffix ↔ input gap | 2dp | 2dp | [c-tf-impl][mw-ftf] |
| Active indicator (filled) | 1dp enabled/hover/disabled, **2dp focused** | — | [c-ftf-tok][c-tf-defaults] |
| Outline (outlined) | — | 1dp enabled/hover/disabled, **2dp focused** | [c-otf-tok][c-tf-defaults] |
| Floating label cut-out padding | — | 4dp each side of label | [m3-tf][c-otf] (`OutlinedTextFieldInnerPadding = 4.dp`), [mw-outlined-field] |
| Supporting text / counter top padding | 4dp | 4dp | [m3-tf][c-tf-impl] |
| Supporting text start/end padding | 16dp | 16dp | [mw-filled-field][mw-outlined-field] |
| Supporting text ↔ counter gap | 16dp | 16dp | [m3-tf] |
| Target size | 56dp | 56dp | [m3-tf] |

### 5.2 Typography

| Element | Style | Source |
|---|---|---|
| Input text | `body-large` 16/24 | [c-ftf-tok][c-otf-tok] |
| Label resting (empty, unfocused) | `body-large` 16/24, vertically centered | [c-ftf-tok][m3-tf] |
| Label floated (focused or populated) | `body-small` 12/16 | [mw-ftf-v] (`label-text-populated-size = body-small`) |
| Supporting text, error text, counter | `body-small` 12/16 | [c-ftf-tok] |
| Placeholder | `body-large`, `on-surface-variant`; when a label exists, visible only while focused and empty | [c-ftf-tok][c-tf-impl] |

Filled vertical stack when the label is floated: 8 top + 16 label line + 24 input line + 8 bottom = 56 [c-tf][c-tf-impl] (`MinFocusedLabelLineHeight 16`, `MinTextLineHeight 24`). Outlined: the floated label is vertically centered on the top outline.

### 5.3 Colors — filled [c-ftf-tok]

| Part | Enabled | Hover | Focused | Disabled | Error | Error hover | Error focused |
|---|---|---|---|---|---|---|---|
| Container | `surface-container-highest` | + `on-surface` state layer @ 8% | same as enabled | `on-surface` @ 4% | as enabled | + layer @ 8% | as enabled |
| Active indicator | `on-surface-variant` 1dp | `on-surface` 1dp | `primary` 2dp | `on-surface` @ 38% 1dp | `error` 1dp | `on-error-container` | `error` 2dp |
| Label | `on-surface-variant` | `on-surface-variant` | `primary` | `on-surface` @ 38% | `error` | `on-error-container` | `error` |
| Input | `on-surface` | `on-surface` | `on-surface` | `on-surface` @ 38% | `on-surface` | `on-surface` | `on-surface` |
| Leading icon | `on-surface-variant` | same | same | `on-surface` @ 38% | `on-surface-variant` | same | same |
| Trailing icon | `on-surface-variant` | same | same | `on-surface` @ 38% | `error` | `on-error-container` | `error` |
| Supporting text | `on-surface-variant` | same | same | `on-surface` @ 38% | `error` | `error` | `error` |
| Caret | `primary` | | | | | | `error` |
| Prefix / suffix | `on-surface-variant` | | | | | | |

### 5.4 Colors — outlined [c-otf-tok]

Same as filled for label, input, icons, supporting text and caret, with these differences:

- The container is transparent.
- Outline: `outline` (enabled) → `on-surface` (hover, 1dp) → `primary` (focused, 2dp) → `on-surface` @ 12% (disabled, 1dp). In error: `error`, `on-error-container` on hover, `error` 2dp when focused.
- The outlined **hover label** is `on-surface` (filled uses `on-surface-variant`).

### 5.5 Animation

- Compose [c-tf-impl]:
  - Label float progress 0↔1 uses `FastSpatial` (a spring, so the expressive scheme gives a small overshoot); label color uses `FastEffects`.
  - Placeholder opacity uses `FastEffects`, or `SlowEffects` when it appears after focus. Prefix/suffix opacity uses `FastEffects`.
  - Indicator/outline **thickness** uses `FastSpatial`; its color uses `FastEffects`.
- material-web: label float via WAAPI, **150ms, `cubic-bezier(0.2,0,0,1)`**. It computes `translate + scale` (scale = floated width / resting width) so the label morphs rather than re-flows [mw-field-ts].

### 5.6 Behaviour notes [m3-tf-g]

- Every field needs a label (or an adjacent label aligned to the container's leading edge). Labels never truncate or wrap.
- Required fields: asterisk after the label.
- Error: replace the supporting text with the error text (don't stack both), and show an error icon in the trailing slot.
- Counter: `current / max`, end-aligned on the supporting row.
- Multi-line fields grow; text areas have a fixed height and scroll. On the web, prefer text areas.
- Read-only fields look like normal fields and are labelled as read-only.

### 5.7 Implementation note

Build this **custom**, with a native `<input>`/`<textarea>` and `<label>`. The shadcn `input`/`input-group` primitives don't model floating labels or the indicator. Drive state with CSS:

- focused: `:focus-within`
- populated: `:has(input:not(:placeholder-shown))` or a `data-populated` attribute
- error: `aria-invalid`
- disabled: `:disabled`

Animate the label with `transform: translateY() scale(0.75)` (12/16 = 0.75) and `transform-origin: left top`, so the animation stays on the GPU. For the outlined variant, draw the outline as a `<fieldset>`/`<legend>` (the legend width animates the notch) or as three border segments. Optionally integrate with the existing shadcn `field`/formsnap for validation messages.

---

## 6. Chips (assist / filter / input / suggestion)

### 6.1 Dimensions (all four types)

| Attribute | Value | Source |
|---|---|---|
| Container height | 32dp | [m3-chips][c-assist-tok][mdc-chip-tok] |
| Corner (baseline) | small = 8dp | [m3-chips][c-assist-tok] |
| Corner (Compose expressive `shapes` overload) | unselected medium 12dp → selected **full** → pressed small 8dp, morphing with `FastSpatial` | [c-chips-tok][c-chip] |
| Outline (flat, unselected) | 1dp | [m3-chips][c-assist-tok][c-filter-tok] |
| Outline (selected filter/input) | 0dp | [c-filter-tok][c-input-tok] |
| Leading / trailing icon | 18dp | [m3-chips][c-assist-tok][c-input-tok] |
| Avatar (input chip) | 24dp, corner full (12dp radius) | [m3-chips][c-input-tok] |
| Start/end padding, no icon | 16dp | [m3-chips][mw-assist] |
| Start/end padding on the icon side | 8dp | [m3-chips][mw-filter][mw-input] |
| Avatar side padding | 4dp start, 8dp after avatar | [m3-chips] |
| Gap between elements | 8dp (Compose compact variant 4dp) | [m3-chips][c-chip] |
| Close (remove) icon touch target | ≥48dp | [m3-chips] |
| Label text | `label-large` 14/20 w500 | [c-assist-tok] |
| Elevated chip elevation | L1 (1dp); hover L2 (3dp); focus/pressed L1; disabled L0 | [c-assist-tok][c-filter-tok] |
| Dragged elevation | L4 (8dp) | [c-assist-tok] |

### 6.2 Colors

| Type / state | Container | Outline | Label | Leading icon | Trailing icon |
|---|---|---|---|---|---|
| Assist — flat | transparent | `outline-variant` (Compose) / `outline` (spec page) | `on-surface` | `primary` | — |
| Assist — elevated | `surface-container-low` | none | `on-surface` | `primary` | — |
| Suggestion — flat | transparent | `outline-variant` (Compose) / `outline` (spec page) | `on-surface-variant` | `primary` | — |
| Suggestion — elevated | `surface-container-low` | none | `on-surface-variant` | `primary` | — |
| Filter — unselected flat | transparent | `outline-variant` (focus: `on-surface-variant`) | `on-surface-variant` | `primary` | `on-surface-variant` |
| Filter — unselected elevated | `surface-container-low` | none | `on-surface-variant` | `primary` | `on-surface-variant` |
| Filter — selected | `secondary-container` (flat hover → L1 elevation) | none | `on-secondary-container` | `on-secondary-container` (checkmark) | `on-secondary-container` |
| Input — unselected | transparent | `outline-variant` (focus: `on-surface-variant`) | `on-surface-variant` | `on-surface-variant` (hover/focus/pressed `primary`) | `on-surface-variant` |
| Input — selected | `secondary-container` | none | `on-secondary-container` | `primary` | `on-secondary-container` |
| Disabled (any) | flat: none; elevated / selected: `on-surface` @ 12% | `on-surface` @ 12% (newest Compose `ChipsTokens`: 10%) | `on-surface` @ 38% | `on-surface` @ 38% | `on-surface` @ 38% |

State layers [mw-assist][mw-filter-v] (opacities 8/10/10/16%):

- Assist and suggestion chips: `on-surface` / `on-surface-variant`.
- Filter chips on hover: unselected `on-surface-variant`, selected `on-secondary-container`.
- Pressed colors swap: unselected pressed is `on-secondary-container`, selected pressed is `on-surface-variant`.

Sources: [c-assist-tok][c-suggest-tok][c-filter-tok][c-input-tok][c-chips-tok][m3-chips].

### 6.3 Animation

- Filter/input chips: when the leading icon (checkmark) or trailing icon appears or disappears, its slot **expands/shrinks** with `FastSpatial` and fades with `DefaultEffects` [c-chip].
- Non-selectable chips with changing icons: fade-in `SlowEffects`, fade-out `FastEffects`, expand `FastSpatial`, shrink `DefaultEffects` [c-chip].
- Expressive shape morph (opt-in): unselected 12dp → pressed 8dp → selected full, `FastSpatial` [c-chips-tok][c-chip].
- Elevated chips animate elevation between levels (Compose `animateElevation`) [c-chip].

### 6.4 Dropdown chip

None of Compose, MDC or material-web has a dedicated token set for it. Build it as a filter- or assist-style chip with a trailing 18dp `arrow_drop_down` icon that opens a menu; once a value is chosen it shows as selected (`secondary-container`). **Not verified against an official spec page.**

### 6.5 Implementation note

- Assist / suggestion: a plain `<button>` (or `<a>`).
- Filter: **bits-ui `Toggle`** (`aria-pressed`), or `ToggleGroup` (`type="single"|"multiple"`) for chip sets. Animate the checkmark slot with `grid-template-columns: 0fr → 1fr` (or `width`) using the fast-spatial spring.
- Input: a container `<span>` (row-like group) holding a focusable label button and a separate remove `<button aria-label="Remove …">` with a 48px hit area.
- Dropdown chip: a bits-ui `DropdownMenu.Trigger` rendered with the chip styles (`child` snippet).

---

## 7. Search

### 7.1 Search bar (unfocused) [m3-search][c-searchbar-tok][mdc-search-tok]

| Attribute | Value |
|---|---|
| Height | 56dp |
| Width | min 360dp, max 720dp ([c-searchbar] `SearchBarMinWidth/MaxWidth`) |
| Shape | full |
| Container | `surface-container-high`; elevation L3 (6dp) |
| Leading / trailing icon | 24dp; leading `on-surface`, trailing `on-surface-variant` |
| Avatar | 30dp, full |
| Input text / placeholder | `body-large`; `on-surface` / `on-surface-variant` |
| Contained (expressive) outer margin | 24dp unfocused → 12dp focused (the bar expands on focus) |
| Contained leading/trailing space (to 48dp tap target) | 4dp; 16dp when there are no actions |
| Contained icon ↔ label gap (from tap target) | 4dp |
| Divided (baseline) leading/trailing space | 16dp; icon ↔ label 16dp |
| State layer | `on-surface` @ 8% hover / 10% pressed |

### 7.2 Search view (focused) [m3-search][c-searchview-tok][mdc-search-tok]

| Attribute | Contained (expressive) | Divided (baseline) |
|---|---|---|
| Full-screen container | full width/height, corner none, `surface-container-low` (spec color list) | header 72dp, corner none, `surface-container-high` |
| Full-screen bar height | 56dp | 72dp header |
| Docked container | 360–720dp wide; 240dp tall minimum, 2/3 of screen height maximum (1/2 when a gap is used, Compose) | header 56dp, corner extra-large 28dp |
| Docked results shape | corner medium 12dp, 2dp gap below the bar (the bar stays full-round) | — |
| Margins | 12dp | — |
| Divider | — | `outline` |
| Elevation | L3 | L3 |

Animation (Compose `SearchBar`) [c-searchbar][c-motion-tok]:

- Expand: **600ms**, emphasized-decelerate.
- Collapse: **350ms**, `cubic-bezier(0,1,0,1)`.
- Results content fades in over 100ms after a 50ms delay.

Implementation note: build the bar yourself (`<search>`/`role="search"` + input). For suggestions, use bits-ui `Combobox` (docked, anchored to a popover), or `Command` inside a bits-ui `Dialog` for the full-screen view.

---

## 8. Menus

### 8.1 Baseline menu [m3-menus][c-menu-tok][c-menu][mw-menu]

| Attribute | Value |
|---|---|
| Container width | 112dp min, 280dp max |
| Corner | extra-small 4dp |
| Container | `surface-container`, elevation L2 (3dp) |
| List vertical padding | 8dp top/bottom |
| Item height | 48dp |
| Item start/end padding | 12dp (with or without icons) |
| Gap between item elements | 12dp |
| Leading/trailing icon | 24dp, `on-surface-variant` |
| Label | `on-surface` (`body-large`); selected item background `secondary-container` / `on-secondary-container` (Compose `MenuTokens`) |
| Divider | 1dp `outline-variant`, 8dp vertical padding |
| Open animation | scale 0.8 → 1 (`FastSpatial`) + alpha 0 → 1 (`FastEffects`), origin at the anchor ([c-menu] `ClosedScaleTarget = 0.8f`) |

### 8.2 Expressive vertical menu (standard / vibrant, optional groups) [m3-menus][c-segmenu-tok][c-stdmenu-tok][c-vibmenu-tok][c-menu-defaults]

| Attribute | Value |
|---|---|
| Container | standard `surface-container-low`, vibrant `tertiary-container`; elevation L2 |
| Container shape | corner large 16dp; "active" container (the main menu while a submenu is open) 24dp |
| Item height | 44dp |
| Item padding | 16dp start/end, 8dp top/bottom, 12dp between elements |
| Item icons | 20dp |
| Item shape | extra-small 4dp; first/last child medium 12dp outer corners; selected item medium 12dp |
| Selected item | standard `tertiary-container` / `on-tertiary-container`; vibrant `tertiary` / `on-tertiary` |
| Unselected item text / icons | standard `on-surface` / `on-surface-variant`; vibrant `on-tertiary-container` |
| Item typography | label `body-large`, supporting `body-medium`, trailing text `label-small` |
| Groups | 2dp gap between groups; group padding 4dp; group corners (top/bottom): leading 16/8, middle 8, trailing 8/16, standalone 16, inactive 8 |
| Disabled | content @ 38% |
| Motion | shape morph on focus/hover between groups (`FastSpatial`), expand/shrink `FastSpatial`, fade `FastEffects` |

Implementation note: use **bits-ui `DropdownMenu`** (also `ContextMenu` and `Menubar`) with `DropdownMenu.Sub` for submenus and `CheckboxItem`/`RadioItem` for selected states, and restyle the content and items. Use `transform-origin: var(--bits-dropdown-menu-content-transform-origin)` for the 0.8 → 1 scale.

---

## 9. Date & time pickers (container summary only)

| Element | Value | Source |
|---|---|---|
| Modal date picker | 360 × 568dp, corner extra-large 28dp, `surface-container-high`, L3 | [c-date-tok][mw-date-modal-v] |
| Modal header | 120dp (range-selection header 128dp); headline `headline-large` (range: `title-large`) | [c-date-tok] |
| Modal day cell | 40 × 40dp, full; today = 1dp `primary` outline; selected `primary`/`on-primary`; in-range band `secondary-container`, 40dp tall | [c-date-tok] |
| Year cell | 72 × 36dp, full; selected `primary`/`on-primary` | [c-date-tok] |
| Docked date picker | 360 × 456dp, corner large 16dp, L3; day cell 48dp with 40dp state layer; header 64dp; month/year menu button 40dp tall, 18dp icon | [mw-date-docked-v] |
| Time picker container | corner extra-large 28dp, `surface-container-high`, L3 | [c-time-tok] |
| Clock dial | 256dp, `surface-container-highest`; selector handle 48dp, center dot 8dp, track 2dp, `primary` | [c-time-tok] |
| Time selector (hour/minute boxes) | 96 × 80dp (24h vertical: 114dp wide), corner small 8dp, `display-large`; selected `primary-container`, unselected `surface-container-highest` | [c-time-tok] |
| AM/PM selector | vertical 52 × 80dp, horizontal 216 × 38dp, corner small 8dp, 1dp `outline`; selected `tertiary-container` / `on-tertiary-container`, `title-medium` | [c-time-tok] |

Implementation note: use bits-ui `DatePicker` / `Calendar` / `RangeCalendar` / `DateField` (input mode) and `TimeField`. The clock dial has to be custom (SVG + pointer math).

---

## 10. Implementation summary

| Component | Primitive | Custom work |
|---|---|---|
| Checkbox | bits-ui `Checkbox` | SVG mark + stroke-dash draw, state layer, error variant |
| Radio | bits-ui `RadioGroup` | 20px ring/dot SVG, dot spring |
| Switch | bits-ui `Switch` | handle geometry table (§3.1), press snap/release spring, optional icons |
| Slider | bits-ui `Slider` (behaviour/a11y only) | gapped track renderer, sizes XS–XL, centered/range, stops, value indicator, inset icon |
| Text field | none (native input) | floating label, indicator/outline, supporting/counter row |
| Chips | `<button>`, bits-ui `Toggle`/`ToggleGroup`, `DropdownMenu.Trigger` | icon slot expand, optional shape morph |
| Search | bits-ui `Combobox` / `Command` + `Dialog` | bar, contained/divided layouts, expand animation |
| Menu | bits-ui `DropdownMenu` / `ContextMenu` / `Menubar` | baseline + expressive vertical styles, group shapes |
| Date/Time | bits-ui `DatePicker`, `Calendar`, `RangeCalendar`, `TimeField` | M3 skin, clock dial |

Suggested CSS custom properties:

```css
--md-state-hover: .08;
--md-state-focus: .10;
--md-state-pressed: .10;
--md-state-dragged: .16;
--md-focus-ring: 3px;
--md-focus-offset: 2px;
/* plus spring easings from §0: --md-spring-fast-spatial, --md-spring-fast-spatial-dur, … */
```

---

## Discrepancies & unverifiable items

1. **Slider M handle height**: the spec page measurements table says 52dp; MDC `tokens.xml` `m3_comp_slider_medium_active_handle_height` says 44dp [m3-slider][mdc-slider-tok]. Recommend 52dp (spec) and check it in Figma.
2. **Slider stop indicator colors**: spec and MDC use `on-secondary-container` on the inactive track and `on-primary` on the active track. Compose `defaultSliderColors` uses `secondary-container` for active ticks and `primary` for inactive ticks [m3-slider][mdc-slider-tok][c-slider]. Recommend the spec values.
3. **Slider stop trailing space**: spec says 4dp, the Compose token says 6dp, and the Compose code actually centers the dot one corner radius from the end [m3-slider][c-slider-tok][c-slider].
4. **Slider value indicator**: the spec gives a 44 × 48dp container, but no shape token appears in the readable text (the measurement diagrams are images). The old 28dp label-container token is deprecated. Text style: Compose uses `label-large` (w500); the spec table says w400 with +0.5 tracking. **Shape not verified** (likely full/pill).
5. **Slider value-indicator animation**: there is no official expressive spec text; the numbers come from MDC-Android code (400ms/150ms). The handle shrink is instant in both Google implementations.
6. **Switch selected icon color**: spec and MDC say `primary`; Compose `SwitchTokens` says `on-primary-container` [m3-switch][mdc-switch-tok][c-switch-tok].
7. **Assist/suggestion flat outline**: the spec color list says `outline`; the Compose/MDC tokens say `outline-variant` [m3-chips][c-assist-tok].
8. **Chip shape**: the spec page says 8dp. The newest Compose `ChipsTokens` (v37.2.1, `androidx-main`) adds an expressive morph 12 → full (selected) → 8 (pressed), used only by the new `shapes:` overloads [c-chips-tok][c-chip]. Treat it as upcoming and opt-in.
9. **Text-field focus indicator**: spec and Compose say 2dp; material-web hard-codes 3px ("remove when focus tokens update to 3px") [c-ftf-tok][mw-ftf].
10. **Checkbox box**: the token says 18dp; legacy Compose draws a 20dp box with 2dp padding, behind the `isCheckboxStylingFixEnabled` flag [c-checkbox].
11. **Dropdown chip**: no token set found anywhere; the design in §6.4 is inferred.
12. **Spring → ms conversions** in §0 are my own calculations, not published values.
13. m3.material.io renders client-side, so plain WebFetch returns only the page title. I read the spec values by rendering the pages in a browser. Several measurement diagrams (date pickers, the expressive vertical menu, the search divided style) are images only, so I used tokens for those.
14. The material-web tokens are `v0_192`, which predates Expressive (old 20dp round slider handle, 4dp track) [mw-slider-v]. I used them only for padding constants and as CSS motion references.

---

## Sources

m3.material.io (read via browser rendering, 2026-10-06)
- [m3-checkbox] https://m3.material.io/components/checkbox/specs
- [m3-radio] https://m3.material.io/components/radio-button/specs
- [m3-switch] https://m3.material.io/components/switch/specs
- [m3-slider] https://m3.material.io/components/sliders/specs
- [m3-slider-g] https://m3.material.io/components/sliders/guidelines
- [m3-tf] https://m3.material.io/components/text-fields/specs
- [m3-tf-g] https://m3.material.io/components/text-fields/guidelines
- [m3-chips] https://m3.material.io/components/chips/specs
- [m3-search] https://m3.material.io/components/search/specs
- [m3-menus] https://m3.material.io/components/menus/specs
- [m3-date] https://m3.material.io/components/date-pickers/specs (diagrams only; values taken from tokens)

Jetpack Compose Material3, `androidx-main` (base: https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/)
- [c-checkbox-tok] …/tokens/CheckboxTokens.kt · [c-checkbox] …/Checkbox.kt
- [c-radio-tok] …/tokens/RadioButtonTokens.kt · [c-radio] …/RadioButton.kt
- [c-switch-tok] …/tokens/SwitchTokens.kt · [c-switch] …/Switch.kt
- [c-slider-tok] …/tokens/SliderTokens.kt · [c-slider] …/Slider.kt (SliderDefaults, Thumb, Track, drawTrack)
- [c-ftf-tok] …/tokens/FilledTextFieldTokens.kt · [c-otf-tok] …/tokens/OutlinedTextFieldTokens.kt
- [c-tf-defaults] …/TextFieldDefaults.kt · [c-tf-impl] …/internal/TextFieldImpl.kt · [c-tf] …/TextField.kt · [c-otf] …/OutlinedTextField.kt
- [c-assist-tok] …/tokens/AssistChipTokens.kt · [c-filter-tok] …/tokens/FilterChipTokens.kt · [c-input-tok] …/tokens/InputChipTokens.kt · [c-suggest-tok] …/tokens/SuggestionChipTokens.kt · [c-chips-tok] …/tokens/ChipsTokens.kt · [c-chip] …/Chip.kt
- [c-searchbar-tok] …/tokens/SearchBarTokens.kt · [c-searchview-tok] …/tokens/SearchViewTokens.kt · [c-searchbar] …/SearchBar.kt
- [c-menu-tok] …/tokens/MenuTokens.kt · [c-segmenu-tok] …/tokens/SegmentedMenuTokens.kt · [c-stdmenu-tok] …/tokens/StandardMenuTokens.kt · [c-vibmenu-tok] …/tokens/VibrantMenuTokens.kt · [c-menu] …/Menu.kt · [c-menu-defaults] …/MenuDefaults.kt
- [c-date-tok] …/tokens/DatePickerModalTokens.kt · [c-time-tok] …/tokens/TimePickerTokens.kt
- [c-motion-scheme] …/MotionScheme.kt · [c-expr-motion] …/tokens/ExpressiveMotionTokens.kt · [c-std-motion] …/tokens/StandardMotionTokens.kt · [c-motion-tok] …/tokens/MotionTokens.kt
- [c-shape-tok] …/tokens/ShapeTokens.kt · [c-type-tok] …/tokens/TypeScaleTokens.kt · [c-elev-tok] …/tokens/ElevationTokens.kt · [c-state-tok] …/tokens/StateTokens.kt

Material Components Android (base: https://github.com/material-components/material-components-android/blob/master/)
- [mdc-slider-tok] lib/java/com/google/android/material/slider/res/values/tokens.xml
- [mdc-slider-styles] lib/java/com/google/android/material/slider/res/values/styles.xml
- [mdc-slider-dimens] lib/java/com/google/android/material/slider/res/values/dimens.xml
- [mdc-baseslider] lib/java/com/google/android/material/slider/BaseSlider.java
- [mdc-slider-doc] docs/components/Slider.md
- [mdc-switch-tok] lib/java/com/google/android/material/materialswitch/res/values/tokens.xml
- [mdc-chip-tok] lib/java/com/google/android/material/chip/res/values/tokens.xml
- [mdc-checkbox-tok] lib/java/com/google/android/material/checkbox/res/values/tokens.xml
- [mdc-radio-tok] lib/java/com/google/android/material/radiobutton/res/values/tokens.xml
- [mdc-search-tok] lib/java/com/google/android/material/search/res/values/tokens.xml
- [mdc-menu-tok] lib/java/com/google/android/material/menu/res/values/tokens.xml
- [mdc-motion-tok] lib/java/com/google/android/material/motion/res/values/tokens.xml

material-web (base: https://github.com/material-components/material-web/blob/main/)
- [mw-checkbox-v] tokens/versions/v0_192/_md-comp-checkbox.scss · [mw-switch-v] …/_md-comp-switch.scss · [mw-slider-v] …/_md-comp-slider.scss · [mw-radio-v] …/_md-comp-radio-button.scss · [mw-ftf-v] …/_md-comp-filled-text-field.scss · [mw-otf-v] …/_md-comp-outlined-text-field.scss · [mw-filter-v] …/_md-comp-filter-chip.scss · [mw-date-docked-v] …/_md-comp-date-picker-docked.scss · [mw-date-modal-v] …/_md-comp-date-picker-modal.scss · [mw-time-v] …/_md-comp-time-picker.scss
- [mw-ftf] tokens/_md-comp-filled-text-field.scss · [mw-otf] tokens/_md-comp-outlined-text-field.scss · [mw-filled-field] tokens/_md-comp-filled-field.scss · [mw-outlined-field] tokens/_md-comp-outlined-field.scss
- [mw-assist] tokens/_md-comp-assist-chip.scss · [mw-filter] tokens/_md-comp-filter-chip.scss · [mw-input] tokens/_md-comp-input-chip.scss · [mw-menu] tokens/_md-comp-menu.scss
- [mw-switch-handle] switch/internal/_handle.scss · [mw-switch-track] switch/internal/_track.scss · [mw-switch-icon] switch/internal/_icon.scss
- [mw-checkbox-s] checkbox/internal/_checkbox.scss · [mw-radio-s] radio/internal/_radio.scss · [mw-radio-ts] radio/internal/radio.ts
- [mw-field-ts] field/internal/field.ts · [mw-easing] internal/motion/animation.ts
