# M3 / M3 Expressive color system: research notes

Status: research for the Svelte 5 + Tailwind 4 + shadcn-svelte implementation.
Date of research: 2026-10-06.

Sources: the m3.material.io pages (rendered in a browser, because they are a JS app) and Google source code fetched raw from GitHub:

- `material-components/material-web` tokens (generated "Design system version: v0.192")
- `material-components-android` `color/res/values/tokens.xml` ("Version: 34.0.0")
- `material-foundation/material-color-utilities` (MCU) TypeScript `main`, plus the npm package `@material/material-color-utilities@0.4.0`, which was installed and executed to produce the computed tables below.

Every table says where its numbers come from. `[S#]` refers to the Sources list at the end.

---

## 0. TL;DR decisions for this project

| Topic | Decision | Evidence |
|---|---|---|
| Role set | 49 `md.sys.color.*` roles (list in section 1) | material-web `_md-sys-color.scss` supported tokens [S7] |
| Default static palette | **Current** M3 baseline (seed `#6750A4`), with the Aug-2024 "more colorful" light `on-*-container` = tone 30 | m3 baseline token table [S3], "What's new Aug 2024" [S2] |
| Dynamic algorithm | `SchemeTonalSpot`, `contrastLevel` 0 (standard), 0.5 (medium), 1.0 (high) | MCU dev guide [S14], `scheme_tonal_spot.ts` [S12] |
| Spec version | MCU `specVersion` `'2021'` (MCU default) for parity with the baseline. `'2025'` is opt-in (see 6.3, 6.4) | `DynamicScheme.DEFAULT_SPEC_VERSION = '2021'` [S11] |
| State layers | hover 0.08, focus 0.10, pressed 0.10, dragged 0.16 (current m3 site). material-web v0.192 still ships 0.12 for focus/pressed | [S4], [S9] |
| Disabled | container `on-surface` @ 12%, content `on-surface` @ 38% | material-web button tokens [S10], m3 "Disabled state layer opacity 0.38" [S4] |
| Elevation | level0..5 = 0, 1, 3, 6, 8, 12 dp. Shadows = key (30% opacity) + ambient (15% opacity) | [S6], [S8], [S16] |
| Surface tint | **Deprecated.** Use the surface-container roles instead of tint overlays | m3 elevation tokens page [S6], color "What's new Feb 2023" [S2] |
| CSS naming | `--md-sys-color-<role>` (same as material-web). shadcn vars alias them | section 7 |

---

## 1. Complete role list and tone mapping

### 1.1 How the system works (official)

- A source color produces 5 key colors (primary, secondary, tertiary, neutral, neutral variant). Each key color produces a tonal palette with tones 0–100, and then "tones from the palettes are then assigned to color roles" [S2b].
- "the algorithm assigns the color tone primary40 to the primary role and the tone primary100 to the on primary role" [S2b].
- Error is a static palette. "Error color roles are made static by default with any dynamic color scheme. They still adapt to light and dark theme." [S1]. In MCU (2021 spec), the error palette is `TonalPalette.fromHueAndChroma(25, 84)` when no palette is supplied [S11].
- m3 says "26 standard color roles organized into six groups: primary, secondary, tertiary, error, surface, and outline", plus optional **add-on roles**: fixed accents, `surface-dim`, `surface-bright`, and the legacy `background`/`on-background` [S1].

### 1.2 Role → palette + tone (light / dark), standard contrast

Notation: `P` primary, `S` secondary, `T` tertiary, `E` error, `N` neutral, `NV` neutral-variant. The tone numbers come from MCU `color_spec_2021.ts` [S11a], cross-checked against material-web `values-light`/`values-dark` [S7] and Android `tokens.xml` [S13]. Rows marked **(changed)** differ between the current spec and the older token files (see 1.3).

| # | Role (`md.sys.color.*`) | Palette | Light tone | Dark tone | Usage (m3 [S1], component tokens [S10]) |
|---|---|---|---|---|---|
| 1 | `primary` | P | 40 | 80 | High-emphasis fills, text, icons against surface |
| 2 | `on-primary` | P | 100 | 20 | Text/icons on primary |
| 3 | `primary-container` | P | 90 | 30 | Standout fill (e.g. FAB) |
| 4 | `on-primary-container` | P | **30** (changed, was 10) | 90 | Text/icons on primary-container |
| 5 | `primary-fixed` | P | 90 | 90 | Add-on. Same tone in light and dark |
| 6 | `primary-fixed-dim` | P | 80 | 80 | Add-on. Stronger fixed tone |
| 7 | `on-primary-fixed` | P | 10 | 10 | Text/icons on primary-fixed |
| 8 | `on-primary-fixed-variant` | P | 30 | 30 | Low-emphasis text/icons on primary-fixed |
| 9 | `inverse-primary` | P | 80 | 40 | Actions on inverse-surface (snackbar action) |
| 10 | `secondary` | S | 40 | 80 | Less prominent fills/text/icons. Focus ring color |
| 11 | `on-secondary` | S | 100 | 20 | |
| 12 | `secondary-container` | S | 90 | 30 | Recessive fills (tonal button, nav active indicator) |
| 13 | `on-secondary-container` | S | **30** (changed, was 10) | 90 | |
| 14 | `secondary-fixed` | S | 90 | 90 | Add-on |
| 15 | `secondary-fixed-dim` | S | 80 | 80 | Add-on |
| 16 | `on-secondary-fixed` | S | 10 | 10 | |
| 17 | `on-secondary-fixed-variant` | S | 30 | 30 | |
| 18 | `tertiary` | T | 40 | 80 | Contrasting accents |
| 19 | `on-tertiary` | T | 100 | 20 | |
| 20 | `tertiary-container` | T | 90 | 30 | e.g. input fields, emphasized small elements |
| 21 | `on-tertiary-container` | T | **30** (changed, was 10) | 90 | |
| 22 | `tertiary-fixed` | T | 90 | 90 | Add-on |
| 23 | `tertiary-fixed-dim` | T | 80 | 80 | Add-on |
| 24 | `on-tertiary-fixed` | T | 10 | 10 | |
| 25 | `on-tertiary-fixed-variant` | T | 30 | 30 | |
| 26 | `error` | E | 40 | 80 | |
| 27 | `on-error` | E | 100 | 20 | |
| 28 | `error-container` | E | 90 | 30 | |
| 29 | `on-error-container` | E | **30** (changed, was 10) | 90 | |
| 30 | `surface` | N | 98 | 6 | Default background |
| 31 | `surface-dim` | N | 87 | 6 | Add-on. Dimmest surface in both themes |
| 32 | `surface-bright` | N | 98 | 24 | Add-on. Brightest surface in both themes |
| 33 | `surface-container-lowest` | N | 100 | 4 | Lowest-emphasis container |
| 34 | `surface-container-low` | N | 96 | 10 | Elevated card |
| 35 | `surface-container` | N | 94 | 12 | Default container: nav bar, menu, standard toolbar |
| 36 | `surface-container-high` | N | 92 | 17 | Dialog |
| 37 | `surface-container-highest` | N | 90 | 22 | Filled card |
| 38 | `on-surface` | N | 10 | 90 | Text/icons on any surface or container |
| 39 | `surface-variant` | NV | 90 | 30 | Legacy-ish but still emitted |
| 40 | `on-surface-variant` | NV | 30 | 80 | Lower-emphasis text/icons on any surface |
| 41 | `outline` | NV | 50 | 60 | Important boundaries (text field outline, outlined button) |
| 42 | `outline-variant` | NV | 80 | 30 | Decorative (dividers, outlined card border) |
| 43 | `inverse-surface` | N | 20 | 90 | Snackbar background |
| 44 | `inverse-on-surface` | N | 95 | 20 | Text on inverse-surface |
| 45 | `scrim` | N | 0 | 0 | Used at 32% opacity [S5] |
| 46 | `shadow` | N | 0 | 0 | Shadow color |
| 47 | `surface-tint` | P | 40 | 80 | **Deprecated** (= primary) [S6] |
| 48 | `background` | N | 98 | 6 | Add-on/legacy. Equals `surface` |
| 49 | `on-background` | N | 10 | 90 | Add-on/legacy. Equals `on-surface` |

MCU also exposes non-role "key colors" (`primary-palette-key-color` and so on), and the 2025 spec adds `primary-dim`, `secondary-dim`, `tertiary-dim` and `error-dim` (they throw "undefined prior to 2025 spec" in the 2021 spec) [S11]. These are not part of the material-web `md.sys.color` web token set [S7], so this project does not need them.

### 1.3 The `on-*-container` light-tone change

- m3 "What's new, August 2024: More colorful text and icons. The following color roles are updated in light theme to be more colorful while still having accessible color contrast: On primary container, On secondary container, On tertiary container, On error container" [S2].
- MCU implements this as `onPrimaryContainer` light tone **30** (`return s.isDark ? 90 : 30`). The same applies to secondary, tertiary and error [S11a]. The Dart changelog 0.12.0 (2024-06-06) says: "Update `MaterialDynamicColors` to use the expressive on-colors spec" [S15].
- The m3 baseline token table now shows light `on-primary-container` = `#4F378B` (P30) [S3].
- **Older token files still use tone 10:** material-web v0.192 `values-light` maps `on-primary-container` to `primary10` (`#21005d`) [S7]. Android `tokens.xml` v34 also emits P10, with the comment "The resource value @color/m3_ref_palette_primary30 has been overridden by the config" [S13].
- **Decision:** use tone 30 (current spec).

### 1.4 Contrast levels (MCU 2021 spec)

`contrastLevel` takes values in [-1, 1]. Recommended values: `0.0` default, `0.5` "higher", `1.0` "highest", `-1.0` "reduced" [S14]. `ContrastCurve(low, normal, medium, high)` is the value at contrast -1 / 0 / 0.5 / 1, with linear interpolation in between [S11b]. m3 calls the levels Standard (default), Medium ("minimum contrast ratio of 3:1") and High ("7:1") [S2b].

Surface tones that move with contrast (all other surface tones are fixed) [S11a]:

| Role | Light (std / med / high) | Dark (std / med / high) |
|---|---|---|
| `surface-dim` | 87 / 80 / 75 | 6 (fixed) |
| `surface-bright` | 98 (fixed) | 24 / 29 / 34 |
| `surface-container-lowest` | 100 (fixed) | 4 / 2 / 0 |
| `surface-container-low` | 96 / 96 / 95 | 10 / 11 / 12 |
| `surface-container` | 94 / 92 / 90 | 12 / 16 / 20 |
| `surface-container-high` | 92 / 88 / 85 | 17 / 21 / 25 |
| `surface-container-highest` | 90 / 84 / 80 | 22 / 26 / 30 |

Target contrast ratios (`ContrastCurve` normal / medium / high) used to adjust foreground tones [S11a]:

| Role(s) | std (0) | medium (0.5) | high (1.0) |
|---|---|---|---|
| `on-surface`, `inverse-on-surface`, `on-primary`/`on-secondary`/`on-tertiary`/`on-error`, `on-*-fixed` | 7 | 11 | 21 |
| `on-surface-variant`, `on-*-container`, `on-*-fixed-variant` | 4.5 | 7 | 11 |
| `primary`, `secondary`, `tertiary`, `error`, `inverse-primary` | 4.5 | 7 | 7 |
| `on-background` | 3 | 4.5 | 7 |
| `outline` | 3 | 4.5 | 7 |
| `outline-variant` | 1 | 3 | 4.5 |
| `*-container`, `*-fixed`, `*-fixed-dim` (against surface) | 1 | 3 | 4.5 |

Tones move away from the spec tone only when the target ratio is not already met.

---

## 2. Baseline scheme (seed `#6750A4`)

### 2.1 Role hex values, current baseline (light and dark)

Values come from the m3 "Baseline color tokens" table, read with the context set to "Default, Light" and then "Default, Dark" [S3]. Dark matches material-web v0.192 [S7] and Android [S13] exactly. In light, only the four `on-*-container` rows differ from those files, and those rows show the older value in brackets.

| Role | Light | Dark | Ref tone (L / D) |
|---|---|---|---|
| `primary` | `#6750A4` | `#D0BCFF` | P40 / P80 |
| `on-primary` | `#FFFFFF` | `#381E72` | P100 / P20 |
| `primary-container` | `#EADDFF` | `#4F378B` | P90 / P30 |
| `on-primary-container` | `#4F378B` [mw/android: `#21005D`] | `#EADDFF` | P30 / P90 |
| `primary-fixed` | `#EADDFF` | `#EADDFF` | P90 |
| `primary-fixed-dim` | `#D0BCFF` | `#D0BCFF` | P80 |
| `on-primary-fixed` | `#21005D` | `#21005D` | P10 |
| `on-primary-fixed-variant` | `#4F378B` | `#4F378B` | P30 |
| `inverse-primary` | `#D0BCFF` | `#6750A4` | P80 / P40 |
| `secondary` | `#625B71` | `#CCC2DC` | S40 / S80 |
| `on-secondary` | `#FFFFFF` | `#332D41` | S100 / S20 |
| `secondary-container` | `#E8DEF8` | `#4A4458` | S90 / S30 |
| `on-secondary-container` | `#4A4458` [mw/android: `#1D192B`] | `#E8DEF8` | S30 / S90 |
| `secondary-fixed` | `#E8DEF8` | `#E8DEF8` | S90 |
| `secondary-fixed-dim` | `#CCC2DC` | `#CCC2DC` | S80 |
| `on-secondary-fixed` | `#1D192B` | `#1D192B` | S10 |
| `on-secondary-fixed-variant` | `#4A4458` | `#4A4458` | S30 |
| `tertiary` | `#7D5260` | `#EFB8C8` | T40 / T80 |
| `on-tertiary` | `#FFFFFF` | `#492532` | T100 / T20 |
| `tertiary-container` | `#FFD8E4` | `#633B48` | T90 / T30 |
| `on-tertiary-container` | `#633B48` [mw/android: `#31111D`] | `#FFD8E4` | T30 / T90 |
| `tertiary-fixed` | `#FFD8E4` | `#FFD8E4` | T90 |
| `tertiary-fixed-dim` | `#EFB8C8` | `#EFB8C8` | T80 |
| `on-tertiary-fixed` | `#31111D` | `#31111D` | T10 |
| `on-tertiary-fixed-variant` | `#633B48` | `#633B48` | T30 |
| `error` | `#B3261E` | `#F2B8B5` | E40 / E80 |
| `on-error` | `#FFFFFF` | `#601410` | E100 / E20 |
| `error-container` | `#F9DEDC` | `#8C1D18` | E90 / E30 |
| `on-error-container` | `#8C1D18` [mw/android: `#410E0B`] | `#F9DEDC` | E30 / E90 |
| `surface` | `#FEF7FF` | `#141218` | N98 / N6 |
| `surface-dim` | `#DED8E1` | `#141218` | N87 / N6 |
| `surface-bright` | `#FEF7FF` | `#3B383E` | N98 / N24 |
| `surface-container-lowest` | `#FFFFFF` | `#0F0D13` | N100 / N4 |
| `surface-container-low` | `#F7F2FA` | `#1D1B20` | N96 / N10 |
| `surface-container` | `#F3EDF7` | `#211F26` | N94 / N12 |
| `surface-container-high` | `#ECE6F0` | `#2B2930` | N92 / N17 |
| `surface-container-highest` | `#E6E0E9` | `#36343B` | N90 / N22 |
| `on-surface` | `#1D1B20` | `#E6E0E9` | N10 / N90 |
| `surface-variant` | `#E7E0EC` | `#49454F` | NV90 / NV30 |
| `on-surface-variant` | `#49454F` | `#CAC4D0` | NV30 / NV80 |
| `outline` | `#79747E` | `#938F99` | NV50 / NV60 |
| `outline-variant` | `#CAC4D0` | `#49454F` | NV80 / NV30 |
| `inverse-surface` | `#322F35` | `#E6E0E9` | N20 / N90 |
| `inverse-on-surface` | `#F5EFF7` | `#322F35` | N95 / N20 |
| `scrim` | `#000000` | `#000000` | N0 |
| `shadow` | `#000000` | `#000000` | N0 |
| `surface-tint` (deprecated) | `#6750A4` | `#D0BCFF` | P40 / P80 |
| `background` | `#FEF7FF` | `#141218` | N98 / N6 |
| `on-background` | `#1D1B20` | `#E6E0E9` | N10 / N90 |

The baseline is hand-curated. m3 says "The baseline static color scheme uses a hand-picked source color" [S2b]. Running `SchemeTonalSpot(#6750A4)` through MCU does **not** reproduce these hex values exactly. For example, it gives primary `#65558F` instead of `#6750A4`, because TonalSpot fixes primary chroma at 36 (see 6.3 and 6.4). For pixel-exact M3 baseline, ship this static table. For a custom seed, use MCU.

### 2.2 Baseline reference palettes (`md.ref.palette.*`), tones 0–100

Values come from Android `tokens.xml` [S13], which includes tone 98 for every palette, and agree with material-web `_md-ref-palette.scss` v0.192 [S7b], which omits 98 for the non-neutral palettes. Also defined: `white` `#FFFFFF`, `black` `#000000`.

| Tone | primary | secondary | tertiary | error | neutral | neutral-variant |
|---|---|---|---|---|---|---|
| 0 | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` |
| 4 | | | | | `#0F0D13` | |
| 6 | | | | | `#141218` | |
| 10 | `#21005D` | `#1D192B` | `#31111D` | `#410E0B` | `#1D1B20` | `#1D1A22` |
| 12 | | | | | `#211F26` | |
| 17 | | | | | `#2B2930` | |
| 20 | `#381E72` | `#332D41` | `#492532` | `#601410` | `#322F35` | `#322F37` |
| 22 | | | | | `#36343B` | |
| 24 | | | | | `#3B383E` | |
| 30 | `#4F378B` | `#4A4458` | `#633B48` | `#8C1D18` | `#48464C` | `#49454F` |
| 40 | `#6750A4` | `#625B71` | `#7D5260` | `#B3261E` | `#605D64` | `#605D66` |
| 50 | `#7F67BE` | `#7A7289` | `#986977` | `#DC362E` | `#79767D` | `#79747E` |
| 60 | `#9A82DB` | `#958DA5` | `#B58392` | `#E46962` | `#938F96` | `#938F99` |
| 70 | `#B69DF8` | `#B0A7C0` | `#D29DAC` | `#EC928E` | `#AEA9B1` | `#AEA9B4` |
| 80 | `#D0BCFF` | `#CCC2DC` | `#EFB8C8` | `#F2B8B5` | `#CAC5CD` | `#CAC4D0` |
| 87 | | | | | `#DED8E1` | |
| 90 | `#EADDFF` | `#E8DEF8` | `#FFD8E4` | `#F9DEDC` | `#E6E0E9` | `#E7E0EC` |
| 92 | | | | | `#ECE6F0` | |
| 94 | | | | | `#F3EDF7` | |
| 95 | `#F6EDFF` | `#F6EDFF` | `#FFECF1` | `#FCEEEE` | `#F5EFF7` | `#F5EEFA` |
| 96 | | | | | `#F7F2FA` | |
| 98 | `#FEF7FF` | `#FEF7FF` | `#FFF8F8` | `#FFF8F7` | `#FEF7FF` | `#FDF7FF` |
| 99 | `#FFFBFE` | `#FFFBFE` | `#FFFBFA` | `#FFFBF9` | `#FFFBFF` | `#FFFBFE` |
| 100 | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |

The neutral palette carries the extra tones 4, 6, 12, 17, 22, 24, 87, 92, 94 and 96 because of the surface-container roles. m3 says "Colors in these palettes are given a number from 0 to 100 in increments of 10, as well as 95, 98, and 99. Some palettes include more values." [S2b]. The Feb 2023 changes "Updated the default light theme surface from tone 99 to tone 98" and "Updated the chroma for the neutral palette, increasing it from 4 to 6" [S2].

---

## 3. States: state layers and disabled

### 3.1 State-layer opacities

| State | m3 site (current) [S4] | material-web v0.192 [S9] | Token |
|---|---|---|---|
| Hover | **0.08** | 0.08 | `md.sys.state.hover.state-layer-opacity` |
| Focus | **0.10** | 0.12 | `md.sys.state.focus.state-layer-opacity` |
| Pressed | **0.10** | 0.12 | `md.sys.state.pressed.state-layer-opacity` |
| Dragged | **0.16** | 0.16 | `md.sys.state.dragged.state-layer-opacity` |
| Disabled | **0.38** | (component tokens only) | "Disabled state layer opacity" |

The m3 page reads "Hover +8% opacity, Focus +10% opacity, Press +10% opacity, Drag +16% opacity" [S4]. The older 12% focus/press values remain in material-web v0.192. **Decision:** use 0.10, the current spec.

Rules [S4]:
- "The state layer is an overlay with a fixed opacity for each state and uses the same color as the content." For example, a `secondary-container` button gets an `on-secondary-container` state layer, and a surface with primary-colored content gets a `primary` state layer.
- "only one state layer can be applied at a given time". The layer order is container (1), then state layer (2), then content (3).
- "The size of state layers is 40dp while the interactive target size is 48dp" (circular layers on icon-sized targets).
- Disabled components "can't be focused, dragged, or pressed, and they don't change state when tapped or hovered over" [S4b].
- Hovering raises elevation by one level for buttons and the FAB [S5a].

### 3.2 Disabled opacities (component tokens)

From material-web `md-comp-filled-button` v0.192 [S10]. Other components follow the same pattern:

| Token | Value |
|---|---|
| `disabled-container-color` | `on-surface` |
| `disabled-container-opacity` | **0.12** |
| `disabled-label-text-color` | `on-surface` |
| `disabled-label-text-opacity` | **0.38** |
| `with-icon-disabled-icon-opacity` | **0.38** |
| `disabled-container-elevation` | level0 |

"Disabled states don't need to meet Material's contrast requirements." [S4b]

### 3.3 Focus ring (keyboard focus indicator)

From material-web `md-comp-focus-ring` [S10b]: `color` = **`secondary`**, `width` = `3px`, `outward-offset` = `2px`, `inward-offset` = `0px`, `active-width` = `8px` (the animated grow on focus), `duration` = `md.sys.motion.duration.long4`, `shape` = `corner-full` (follows the host shape). Note that the outlined text field's `focus-outline-color` is **`primary`** [S10c]. The ring and the input focus border are separate things.

### 3.4 Proposed CSS

```css
:root {
	--md-sys-state-hover-state-layer-opacity: 0.08;
	--md-sys-state-focus-state-layer-opacity: 0.1;
	--md-sys-state-pressed-state-layer-opacity: 0.1;
	--md-sys-state-dragged-state-layer-opacity: 0.16;
	--md-sys-state-disabled-container-opacity: 0.12; /* on-surface @ 12% */
	--md-sys-state-disabled-content-opacity: 0.38; /* on-surface @ 38% */
	--md-sys-scrim-opacity: 0.32;
}
/* state layer: content color (currentColor) at N% painted between container and content */
.m3-state-layer::before {
	content: '';
	position: absolute;
	inset: 0;
	border-radius: inherit;
	pointer-events: none;
	background: currentColor;
	opacity: 0;
	transition: opacity 150ms linear;
}
.m3-state-layer:hover::before { opacity: var(--md-sys-state-hover-state-layer-opacity); }
.m3-state-layer:focus-visible::before { opacity: var(--md-sys-state-focus-state-layer-opacity); }
.m3-state-layer:active::before { opacity: var(--md-sys-state-pressed-state-layer-opacity); }
```

---

## 4. Elevation

### 4.1 Levels

| Level | dp | material-web `md.sys.elevation.levelN` (generated) [S8] | Components at rest (m3 tokens page [S6]) |
|---|---|---|---|
| 0 | 0dp | 0 | App bar (not scrolled), filled/tonal/outlined buttons, button groups, filled/outlined cards, carousel, chips, full-screen dialog, FAB/extended FAB in nav rail, FAB menu list items, icon buttons, list, nav rail, segmented button, docked side sheet, slider, split button, tabs |
| 1 | 1dp | 1 | Banner, modal bottom sheet, elevated button, elevated card, elevated chips, modal nav drawer, modal side sheet |
| 2 | 3dp | 3 | App bar (scrolled), menu, navigation bar, rich tooltip, toolbar |
| 3 | 6dp | 6 | Date pickers, modal dialogs, extended FAB, FAB, FAB menu close button, search, time pickers |
| 4 | 8dp | 8 | Not a resting level (hover/drag) |
| 5 | 12dp | 12 | Not a resting level (hover/drag) |

- "Material uses six levels of elevation … 0, +1, +2, +3, +4, and +5. An element's resting state can be on levels 0 to +3, while levels +4 and +5 are reserved for user-interacted states such as hover and dragged." [S5]
- "hovering a FAB temporarily increases the elevation by 1 level, from level 3 to level 4. All Material buttons increase elevation by 1 level when hovered." [S5a]
- material-web overrides the dp values with level numbers 0–5 inside its web component, with the comment "Elevation levels on web should use the level number, not the dp value" [S8]. The generated tokens themselves are the dp values in the table.

### 4.2 Shadow definitions (material-web `elevation/internal/_elevation.scss` [S16])

material-web draws two pseudo-element shadows in `--md-elevation-shadow-color`, which defaults to `md.sys.color.shadow`. The **key** shadow (`::before`) has `opacity: 0.3`, and the **ambient** shadow (`::after`) has `opacity: 0.15`. The per-level values below are written in the source comments, and the clamp() math reproduces them:

| Level | Key shadow (x y blur spread) @ 30% | Ambient shadow (x y blur spread) @ 15% |
|---|---|---|
| 0 | `0 0 0 0` | `0 0 0 0` |
| 1 | `0 1px 2px 0` | `0 1px 3px 1px` |
| 2 | `0 1px 2px 0` | `0 2px 6px 2px` |
| 3 | `0 1px 3px 0` | `0 4px 8px 3px` |
| 4 | `0 2px 3px 0` | `0 6px 10px 4px` |
| 5 | `0 4px 4px 0` | `0 8px 12px 6px` |

Tailwind 4-friendly equivalent. For a single opaque shadow color, 30% alpha on the color is equivalent to `opacity: .3` on the layer:

```css
:root {
	--md-shadow-key: color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent);
	--md-shadow-ambient: color-mix(in srgb, var(--md-sys-color-shadow) 15%, transparent);
	--md-sys-elevation-level0: 0 0 0 0 transparent;
	--md-sys-elevation-level1: 0 1px 2px 0 var(--md-shadow-key), 0 1px 3px 1px var(--md-shadow-ambient);
	--md-sys-elevation-level2: 0 1px 2px 0 var(--md-shadow-key), 0 2px 6px 2px var(--md-shadow-ambient);
	--md-sys-elevation-level3: 0 1px 3px 0 var(--md-shadow-key), 0 4px 8px 3px var(--md-shadow-ambient);
	--md-sys-elevation-level4: 0 2px 3px 0 var(--md-shadow-key), 0 6px 10px 4px var(--md-shadow-ambient);
	--md-sys-elevation-level5: 0 4px 4px 0 var(--md-shadow-key), 0 8px 12px 6px var(--md-shadow-ambient);
}
@theme inline {
	--shadow-m3-0: var(--md-sys-elevation-level0);
	--shadow-m3-1: var(--md-sys-elevation-level1);
	--shadow-m3-2: var(--md-sys-elevation-level2);
	--shadow-m3-3: var(--md-sys-elevation-level3);
	--shadow-m3-4: var(--md-sys-elevation-level4);
	--shadow-m3-5: var(--md-sys-elevation-level5);
}
/* usage: class="shadow-m3-3 hover:shadow-m3-4" */
```

### 4.3 Surface tint: confirmed removed from M3

- m3 elevation tokens page: "**Surface tint color is deprecated.** Use elevation level tokens (0–5) instead." [S6]
- m3 color "What's new, Feb 2023: Tone-based surface colors. Tone-based surface color roles have replaced the previous approach of surfaces at +1 to +5 elevation. The new color roles are not tied to elevation and offer more flexibility and support for color features, such as user-controlled contrast." [S2]
- m3 applying-elevation: "You can pick from a range of surface and surface container color roles. These roles are not tied to elevation… Any overlapping containment areas or components should have different color roles in order to visually communicate separation." Also: "By default, Material 3's surfaces use tonal difference to indicate separation." [S5]
- Shadows: "Instead of applying shadows by default to all levels, use shadows only when required to create additional protection against a background or to encourage interaction" [S5a].
- Scrim: "Scrims use the scrim color role at an opacity of 32%." [S5]. Android `mtrl_scrim_color` is `#52000000` ("32% opacity black") [S13b].
- **Decision:** emit `--md-sys-color-surface-tint` only for compatibility, and never overlay it. Pick a surface-container role per component (see the table in 7.2).

---

## 5. M3 Expressive color guidance

M3 Expressive did not add new `md.sys.color` roles to the web token set. It changes how roles are used:

1. **Vibrant color, hierarchy through color.** "An expanded range of colors can be used to sharpen hierarchy and clarify key actions." Also: "Mixing these colors for key components or visual elements can help emphasize the main takeaway of a screen. Create visual hierarchy with surface tones. Use contrast between primary, secondary, and tertiary color roles to prioritize actions and simplify navigation." And: "Give the most important content, tasks, or actions visual prominence through ample space and the brightest surface mapping." [S17]
2. **Toolbars: Standard vs Vibrant** [S18, S18b]
   - *Standard (default)*: "A low-emphasis color scheme best used for focusing attention on the body content." Container = **`surface-container`**. Toggle tonal button = `secondary-container` / `on-secondary-container`. Standard icon button = `primary`.
   - *Vibrant*: "A high-emphasis color scheme that draws attention to the controls. It can also indicate a temporary change in the page behavior, such as entering edit mode." Container = **`primary-container`**. Toggle tonal button = `surface-container` / `on-surface`. Standard icon button = `on-primary-container`.
   - "Don't emphasize multiple buttons with bold, primary colors, such as a button and FAB together. Emphasize one action at a time." The docked toolbar (bottom app bar) container = `surface-container`. Toolbar elevation = level 2 (3dp) [S6].
3. **FAB (M3 Expressive update)** [S19]: "Added tone color styles: Primary, Secondary, Tertiary". "Renamed existing tonal color styles to match their token names: Primary to Primary container, Secondary to Secondary container, Tertiary to Tertiary container". "**Surface color FABs are no longer recommended**". "FAB variants are based on size, not color". "The small FAB is no longer recommended."
   - In practice, a FAB has 6 color styles: `primary-container` (default), `secondary-container`, `tertiary-container`, `primary`, `secondary` and `tertiary`, each with its `on-*` content color.
4. **FAB menu** [S20, S20b]: there are 3 color sets (primary, secondary, tertiary), each covering the close button and the menu items. The roles used are `primary`/`on-primary`, `primary-container`/`on-primary-container`, and the same pairs for secondary and tertiary. "Use the primary FAB menu color set with the primary or primary container FAB color styles". Secondary and tertiary work the same way.
   - The mapping of fill vs container to close button vs item could not be read from the rendered spec table. Material components conventionally use `primary` for the close button and `primary-container` for items. Treat this as **unverified**.
5. **More colorful light `on-*-container` (tone 30)**, Aug 2024. It affects badges, buttons, extended FAB, FAB, icon buttons, segmented buttons, chips, lists, menus, navigation bar/drawer/rail, switches and toolbars [S2]. MCU calls this the "expressive on-colors spec" [S15].
6. **Contrast levels are tokenized** (May 2025): Standard, Medium, High [S2].
7. **`SchemeExpressive` is not "M3 Expressive".** MCU describes `Variant.EXPRESSIVE` as "A Dynamic Color theme that is intentionally detached from the source color" [S12]. In the 2021 spec, primary hue is rotated +240° with chroma 40 [S11]. For seed `#6750A4` it produces a **green** secondary/tertiary (6.5). For an M3 Expressive app, keep the default `SchemeTonalSpot` ("The default Material You theme on Android 12 and 13" [S12]), and only offer `SchemeExpressive`/`SchemeVibrant` as optional user-selectable "styles".

---

## 6. Recipe: full scheme from a seed in the browser

### 6.1 Package facts (verified by installing and running `@material/material-color-utilities@0.4.0`, npm, last published 2026-01-21)

- Exports used: `argbFromHex`, `hexFromArgb`, `Hct` (`Hct.fromInt(argb)`), `DynamicScheme`, `MaterialDynamicColors`, `SchemeTonalSpot`, `SchemeExpressive`, `SchemeVibrant`, `SchemeNeutral`, `SchemeFidelity`, `SchemeContent`, `SchemeMonochrome`, `SchemeRainbow`, `SchemeFruitSalad`, `TonalPalette`, `Variant`.
- Constructor signature: `new SchemeTonalSpot(sourceColorHct: Hct, isDark: boolean, contrastLevel: number, specVersion?: '2021' | '2025', platform?: 'phone' | 'watch')`.
- `DynamicScheme.DEFAULT_SPEC_VERSION = '2021'` and `DEFAULT_PLATFORM = 'phone'`. The 2025 spec only applies to TonalSpot, Vibrant, Expressive and Neutral. Other variants silently fall back to 2021 (`maybeFallbackSpecVersion`) [S11]. On GitHub `main` there is also a `'2026'` spec (and a `CMF` variant) that is not in the npm 0.4.0 release.
- `MaterialDynamicColors` is used with **instance methods**: `new MaterialDynamicColors().primary()` returns a `DynamicColor`, and `.getArgb(scheme)` or `.getTone(scheme)` reads the value. Static fields such as `MaterialDynamicColors.primary` remain for back-compat. `DynamicScheme` also has ARGB getters for every role (`scheme.primary`, `scheme.surfaceContainerHigh`, …).
- **`themeFromSourceColor` / `applyTheme` are legacy.** They build on the deprecated `Scheme` class ("DEPRECATED. The `Scheme` class is deprecated in favor of `DynamicScheme`") and `CorePalette`, and they do **not** produce the surface-container, fixed, dim or bright roles. Do not use them.
- **Packaging bug in 0.4.0:** `dynamiccolor/color_spec_2025.js` imports `'./dynamic_color'` without the `.js` extension. Plain Node ESM throws `ERR_MODULE_NOT_FOUND`, which was reproduced. Bundlers resolve it (esbuild worked). **SvelteKit SSR consequence:** Node loads externalized deps directly, so either import MCU only in browser code (`$effect`, `onMount`, a dynamic `import()`), or set `ssr: { noExternal: ['@material/material-color-utilities'] }` in `vite.config.ts`. Precomputing the CSS at build time with a bundled script also works.

### 6.2 Code (TypeScript, type-checked with `tsc --strict` and executed)

```ts
// src/lib/m3/theme.ts
import {
	argbFromHex, hexFromArgb, Hct, DynamicScheme, MaterialDynamicColors,
	SchemeTonalSpot, SchemeExpressive, SchemeVibrant, SchemeNeutral,
	SchemeFidelity, SchemeContent, SchemeMonochrome,
} from '@material/material-color-utilities';

export type VariantName =
	| 'tonal-spot' | 'expressive' | 'vibrant' | 'neutral' | 'fidelity' | 'content' | 'monochrome';
export type SpecVersion = '2021' | '2025';
export interface ThemeOptions {
	variant?: VariantName; // default 'tonal-spot'
	contrastLevel?: number; // -1 reduced, 0 standard, 0.5 medium, 1 high
	specVersion?: SpecVersion; // MCU default '2021'
}

const SCHEMES = {
	'tonal-spot': SchemeTonalSpot, expressive: SchemeExpressive, vibrant: SchemeVibrant,
	neutral: SchemeNeutral, fidelity: SchemeFidelity, content: SchemeContent, monochrome: SchemeMonochrome,
} as const;

/** The 49 md.sys.color roles, as method names on MaterialDynamicColors. */
export const ROLES = [
	'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
	'primaryFixed', 'primaryFixedDim', 'onPrimaryFixed', 'onPrimaryFixedVariant',
	'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
	'secondaryFixed', 'secondaryFixedDim', 'onSecondaryFixed', 'onSecondaryFixedVariant',
	'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
	'tertiaryFixed', 'tertiaryFixedDim', 'onTertiaryFixed', 'onTertiaryFixedVariant',
	'error', 'onError', 'errorContainer', 'onErrorContainer',
	'surface', 'surfaceDim', 'surfaceBright',
	'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
	'surfaceContainerHigh', 'surfaceContainerHighest',
	'onSurface', 'surfaceVariant', 'onSurfaceVariant', 'outline', 'outlineVariant',
	'inverseSurface', 'inverseOnSurface', 'inversePrimary',
	'scrim', 'shadow', 'surfaceTint', 'background', 'onBackground',
] as const;

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

export function buildScheme(seedHex: string, isDark: boolean, opts: ThemeOptions = {}): DynamicScheme {
	const { variant = 'tonal-spot', contrastLevel = 0, specVersion = '2021' } = opts;
	return new SCHEMES[variant](Hct.fromInt(argbFromHex(seedHex)), isDark, contrastLevel, specVersion);
}

export function schemeToCssVars(scheme: DynamicScheme): Record<string, string> {
	const mdc = new MaterialDynamicColors();
	const out: Record<string, string> = {};
	for (const role of ROLES) {
		out[`--md-sys-color-${kebab(role)}`] = hexFromArgb(mdc[role]().getArgb(scheme));
	}
	return out;
}

/** Stylesheet text: light on :root, dark on .dark (matches `@custom-variant dark (&:is(.dark *))`). */
export function themeCss(seedHex: string, opts: ThemeOptions = {}): string {
	const block = (sel: string, vars: Record<string, string>) =>
		`${sel} {\n${Object.entries(vars).map(([k, v]) => `\t${k}: ${v};`).join('\n')}\n}`;
	return [
		block(':root', schemeToCssVars(buildScheme(seedHex, false, opts))),
		block('.dark', schemeToCssVars(buildScheme(seedHex, true, opts))),
	].join('\n\n');
}

/** Runtime application (browser only). */
export function applyScheme(
	seedHex: string, isDark: boolean, opts: ThemeOptions = {},
	el: HTMLElement = document.documentElement,
) {
	for (const [k, v] of Object.entries(schemeToCssVars(buildScheme(seedHex, isDark, opts)))) {
		el.style.setProperty(k, v);
	}
}
```

Svelte 5 usage (client only, so the SSR packaging issue does not apply). Injecting a `<style>` keeps the `.dark` toggle pure CSS:

```svelte
<script lang="ts">
	let { seed = '#6750A4', contrast = 0 }: { seed?: string; contrast?: number } = $props();
	let css = $state('');
	$effect(() => {
		const s = seed, c = contrast; // track
		import('$lib/m3/theme').then(({ themeCss }) => (css = themeCss(s, { contrastLevel: c })));
	});
</script>

<svelte:head>{@html `<style id="m3-dynamic">${css}</style>`}</svelte:head>
```

### 6.3 Palette construction per variant (MCU `DynamicSchemePalettesDelegateImpl2021` / `2025` [S11])

`src` = source hue/chroma. "rotated" = hue rotated by a piecewise table keyed on the source hue.

| Variant | Spec | Primary (hue, chroma) | Secondary | Tertiary | Neutral | Neutral-variant | Error |
|---|---|---|---|---|---|---|---|
| TonalSpot | 2021 | (src, **36**) | (src, 16) | (src+60°, 24) | (src, 6) | (src, 8) | (25, 84) |
| TonalSpot | 2025 phone | (src, 32 light / 26 dark) | (src, 16) | (rotated, 28) | (src, 5) | (src, 5×1.7) | (piecewise hue, 60) |
| Expressive | 2021 | (src+240°, 40) | (rotated, 24) | (rotated, 32) | (src+15°, 8) | (src+15°, 12) | (25, 84) |
| Expressive | 2025 phone | (src, 48 light / 36 dark) | (rotated, 24 light / 16 dark) | (rotated, 48) | (rotated, 18 light / 14 dark, 6 if yellow) | neutral chroma ×2.3 (×1.6 for hue 105–125) | (piecewise, 64) |
| Vibrant | 2021 | (src, 200) | (rotated, 24) | (rotated, 32) | (src, 10) | (src, 12) | (25, 84) |
| Vibrant | 2025 phone | (src, 74) | (rotated, 56) | (rotated, 56) | (rotated, 28) | neutral chroma ×1.29 | (piecewise, 80) |
| Neutral | 2021 | (src, 12) | (src, 8) | (src, 16) | (src, 2) | (src, 2) | (25, 84) |
| Fidelity / Content | 2021 | (src, src chroma) | (src, max(c−32, c×0.5)) | temperature complement / analogous | (src, c/8) | (src, c/8+4) | (25, 84) |
| Monochrome | 2021 | chroma 0 everywhere | | | | | (25, 84) |

**2025 spec role tones** [S11c] are no longer fixed numbers. Many are `tMaxC` (the tone with maximum chroma) or contrast-solved. For example, TonalSpot light `primary = tMaxC(primaryPalette)`. Dark surfaces: `surface` 4, `surface-container-low` 6, `surface-container` 9, `-high` 12, `-highest` 15, `surface-bright` 18, `-lowest` 0. `inverse-surface` 4 (light) / 98 (dark). Neutral surfaces get chroma multipliers (TonalSpot ×1.25…×1.7). The 2025 spec is more colorful and darker in dark mode, and it does **not** match the published baseline. That is why this doc recommends `'2021'` as the default and `'2025'` as an opt-in "expressive" toggle. No official m3.material.io statement was found that says web M3 Expressive apps must use the 2025 MCU spec.

### 6.4 Computed output for seed `#6750A4` (real MCU 0.4.0 run, `contrastLevel` 0, phone)

Use this table as a fixture for unit tests.

| Role | TonalSpot 2021 light | (tone) | TonalSpot 2021 dark | (tone) | TonalSpot 2025 light | (tone) | TonalSpot 2025 dark | (tone) |
|---|---|---|---|---|---|---|---|---|
| `primary` | `#65558f` | 40 | `#cfbdfe` | 80 | `#655789` | 40.3 | `#cdc0ec` | 80 |
| `on-primary` | `#ffffff` | 100 | `#36275d` | 20 | `#fdf7ff` | 97.8 | `#443a5f` | 27.1 |
| `primary-container` | `#e9ddff` | 90 | `#4d3d75` | 30 | `#d4c3fd` | 82 | `#574d72` | 35 |
| `on-primary-container` | `#4d3d75` | 30 | `#e9ddff` | 90 | `#493c6c` | 28.7 | `#e9deff` | 90.3 |
| `primary-fixed` | `#e9ddff` | 90 | `#e9ddff` | 90 | `#d4c3fd` | 82 | `#ded0fe` | 86 |
| `primary-fixed-dim` | `#cfbdfe` | 80 | `#cfbdfe` | 80 | `#c6b6ee` | 77 | `#d0c3ef` | 81 |
| `on-primary-fixed` | `#201047` | 10 | `#201047` | 10 | `#352857` | 19.9 | `#3c3256` | 23.5 |
| `on-primary-fixed-variant` | `#4d3d75` | 30 | `#4d3d75` | 30 | `#524576` | 32.7 | `#594e74` | 35.8 |
| `secondary` | `#625b71` | 40 | `#cbc2db` | 80 | `#625c71` | 40.3 | `#cbc2db` | 80 |
| `on-secondary` | `#ffffff` | 100 | `#332d41` | 20 | `#fdf7ff` | 97.8 | `#433d51` | 27.1 |
| `secondary-container` | `#e8def8` | 90 | `#4a4458` | 30 | `#e8def8` | 90 | `#3e384c` | 25 |
| `on-secondary-container` | `#4a4458` | 30 | `#e8def8` | 90 | `#554f63` | 34.7 | `#c4bbd4` | 77.4 |
| `secondary-fixed` | `#e8def8` | 90 | `#e8def8` | 90 | `#e8def8` | 90 | `#e8def8` | 90 |
| `secondary-fixed-dim` | `#cbc2db` | 80 | `#cbc2db` | 80 | `#dad0ea` | 85 | `#dad0ea` | 85 |
| `on-secondary-fixed` | `#1e192b` | 10 | `#1e192b` | 10 | `#423c50` | 26.7 | `#423c50` | 26.7 |
| `on-secondary-fixed-variant` | `#4a4458` | 30 | `#4a4458` | 30 | `#5f586e` | 38.8 | `#5f586e` | 38.8 |
| `tertiary` | `#7e5260` | 40 | `#efb8c8` | 80 | `#7b5270` | 40.3 | `#ffcfef` | 88 |
| `on-tertiary` | `#ffffff` | 100 | `#4a2532` | 20 | `#fff7f9` | 97.8 | `#69415f` | 33.3 |
| `tertiary-container` | `#ffd9e3` | 90 | `#633b48` | 30 | `#f4bfe3` | 83 | `#f4bfe3` | 83 |
| `on-tertiary-container` | `#633b48` | 30 | `#ffd9e3` | 90 | `#5f3956` | 29.5 | `#5f3956` | 29.5 |
| `tertiary-fixed` | `#ffd9e3` | 90 | `#ffd9e3` | 90 | `#f4bfe3` | 83 | `#f4bfe3` | 83 |
| `tertiary-fixed-dim` | `#efb8c8` | 80 | `#efb8c8` | 80 | `#e5b2d5` | 78 | `#e5b2d5` | 78 |
| `on-tertiary-fixed` | `#31101d` | 10 | `#31101d` | 10 | `#4a2642` | 20.9 | `#4a2642` | 20.9 |
| `on-tertiary-fixed-variant` | `#633b48` | 30 | `#633b48` | 30 | `#694260` | 33.4 | `#694260` | 33.4 |
| `error` | `#ba1a1a` | 40 | `#ffb4ab` | 80 | `#a8364b` | 40.3 | `#f97386` | 65 |
| `on-error` | `#ffffff` | 100 | `#690005` | 20 | `#fff7f7` | 97.8 | `#490013` | 12.3 |
| `error-container` | `#ffdad6` | 90 | `#93000a` | 30 | `#f97386` | 65 | `#871c34` | 30 |
| `on-error-container` | `#93000a` | 30 | `#ffdad6` | 90 | `#6e0523` | 22.2 | `#ff97a3` | 73.7 |
| `surface` | `#fdf7ff` | 98 | `#141218` | 6 | `#fdf7fe` | 98 | `#0f0d12` | 4 |
| `surface-dim` | `#ded8e0` | 87 | `#141218` | 6 | `#ded8e4` | 87 | `#0f0d12` | 4 |
| `surface-bright` | `#fdf7ff` | 98 | `#3b383e` | 24 | `#fdf7fe` | 98 | `#2e2b34` | 18 |
| `surface-container-lowest` | `#ffffff` | 100 | `#0f0d13` | 4 | `#ffffff` | 100 | `#000000` | 0 |
| `surface-container-low` | `#f8f2fa` | 96 | `#1d1b20` | 10 | `#f8f1fa` | 96 | `#141218` | 6 |
| `surface-container` | `#f2ecf4` | 94 | `#211f24` | 12 | `#f2ecf5` | 94 | `#1b181f` | 9 |
| `surface-container-high` | `#ece6ee` | 92 | `#2b292f` | 17 | `#ece6f0` | 92 | `#211e26` | 12 |
| `surface-container-highest` | `#e6e0e9` | 90 | `#36343a` | 22 | `#e7e0ec` | 90 | `#27242d` | 15 |
| `on-surface` | `#1d1b20` | 10 | `#e6e0e9` | 90 | `#34313a` | 20.9 | `#eae3ef` | 91 |
| `surface-variant` | `#e7e0eb` | 90 | `#49454e` | 30 | `#e7e0ec` | 90 | `#27242d` | 15 |
| `on-surface-variant` | `#49454e` | 30 | `#cac4cf` | 80 | `#615d68` | 40.3 | `#aea9b4` | 69.9 |
| `outline` | `#7a757f` | 50 | `#948f99` | 60 | `#7d7983` | 51.4 | `#78737e` | 49.4 |
| `outline-variant` | `#cac4cf` | 80 | `#49454e` | 30 | `#b5b0bb` | 72.5 | `#4a4650` | 30.5 |
| `inverse-surface` | `#322f35` | 20 | `#e6e0e9` | 90 | `#0f0d12` | 4 | `#fdf7fe` | 98 |
| `inverse-on-surface` | `#f5eff7` | 95 | `#322f35` | 20 | `#a09ba1` | 64.6 | `#575459` | 36.1 |
| `inverse-primary` | `#cfbdfe` | 80 | `#65558f` | 40 | `#d4c3fd` | 82 | `#645980` | 40.3 |
| `scrim` | `#000000` | 0 | `#000000` | 0 | `#000000` | 0 | `#000000` | 0 |
| `shadow` | `#000000` | 0 | `#000000` | 0 | `#000000` | 0 | `#000000` | 0 |
| `surface-tint` | `#65558f` | 40 | `#cfbdfe` | 80 | `#655789` | 40.3 | `#cdc0ec` | 80 |
| `background` | `#fdf7ff` | 98 | `#141218` | 6 | `#fdf7fe` | 98 | `#0f0d12` | 4 |
| `on-background` | `#1d1b20` | 10 | `#e6e0e9` | 90 | `#34313a` | 20.9 | `#eae3ef` | 91 |

### 6.5 Other variants for the same seed (2025 spec, light / dark, selected roles)

| Role | Expressive 2025 L | Expressive 2025 D | Vibrant 2025 L | Vibrant 2025 D |
|---|---|---|---|---|
| `primary` | `#6850a5` | `#d4c3ff` | `#6935d9` | `#b99fff` |
| `primary-container` | `#cab6ff` | `#c7b4f5` | `#ac8eff` | `#ac8eff` |
| `secondary` | `#4d6645` | `#bbcbb2` | `#7343a9` | `#bf8cf7` |
| `secondary-container` | `#d3f1c7` | `#1c2918` | `#e3c6ff` | `#5d2c92` |
| `tertiary` | `#376b21` | `#edffdf` | `#9d365d` | `#ff97b7` |
| `tertiary-container` | `#c2ffa2` | `#bffca0` | `#ff8eb2` | `#fc81aa` |
| `surface` | `#fff7ff` | `#120b1a` | `#fdf3ff` | `#16052a` |
| `surface-container` | `#f7e9ff` | `#1f152a` | `#f3e2ff` | `#240e3b` |
| `on-surface` | `#3d2a51` | `#f1dfff` | `#38264c` | `#f1dfff` |

---

## 7. Proposed CSS custom properties and the shadcn-svelte bridge

### 7.1 Naming

- **Source of truth:** `--md-sys-color-<role>`, with the role in kebab-case exactly as in the table in 1.2 (49 vars). This is identical to material-web, so its docs and token tables can be copied directly. The `:root` block holds light values and `.dark` holds dark values. That matches the project's `@custom-variant dark (&:is(.dark *))` in `src/routes/layout.css`.
- Also: `--md-sys-state-*` (3.4), `--md-sys-elevation-level0..5` (4.2), and optionally `--md-ref-palette-<palette><tone>` (2.2) for static brand palettes.
- **Tailwind utilities:** expose every role as `--color-m3-<role>` in `@theme inline`. The `m3-` prefix is needed because shadcn already owns `--color-primary`, `--color-secondary` and others, and shadcn "secondary" means M3 *secondary-container* (7.2). With the prefix, authors write `bg-m3-primary-container text-m3-on-primary-container`, `border-m3-outline-variant`, `bg-m3-surface-container-high`.
- **shadcn tokens become aliases** (`var(--md-sys-color-…)`). They are defined once and need no `.dark` copy, because the md vars switch underneath. Declare them on `:root, .dark` so that a nested `.dark` subtree also re-resolves. Custom properties inherit the already-computed value, so aliases declared only on `:root` would not follow a `.dark` class placed below `<html>`.

### 7.2 Mapping: shadcn semantic tokens → M3 roles

| shadcn token | M3 role | Rationale (M3 component evidence) |
|---|---|---|
| `--background` | `surface` | Default background [S1] |
| `--foreground` | `on-surface` | Text/icons on any surface [S1] |
| `--card` | `surface-container-low` | Elevated card container. Alternatives: filled card = `surface-container-highest`, outlined card = `surface` + `outline-variant` border [S10d] |
| `--card-foreground` | `on-surface` | |
| `--popover` | `surface-container` | Menu container = `surface-container`, elevation level2 [S10d] |
| `--popover-foreground` | `on-surface` | |
| `--primary` | `primary` | Filled button container |
| `--primary-foreground` | `on-primary` | |
| `--secondary` | `secondary-container` | shadcn "secondary" button ≈ M3 filled **tonal** button (`secondary-container`) [S10d] |
| `--secondary-foreground` | `on-secondary-container` | |
| `--muted` | `surface-container-highest` | Neutral subdued fill (skeletons, ghost hover, code blocks) |
| `--muted-foreground` | `on-surface-variant` | Lower-emphasis text [S1] |
| `--accent` | `color-mix(in srgb, var(--md-sys-color-on-surface) 10%, var(--md-sys-color-surface-container))` | shadcn uses `accent` for menu-item highlight on `popover`. In M3 that is an `on-surface` state layer (focus 10%) over `surface-container` [S4]. Simpler alternative: `secondary-container` |
| `--accent-foreground` | `on-surface` | (use `on-secondary-container` if accent is `secondary-container`) |
| `--destructive` | `error` | |
| `--destructive-foreground` (add) | `on-error` | Not in the current `layout.css`, but harmless and useful |
| `--border` | `outline-variant` | Dividers, outlined card border [S1, S10d] |
| `--input` | `outline` | Outlined text field `outline-color` = `outline` [S10c]. Meets 3:1 for boundaries |
| `--ring` | `secondary` | M3 focus ring color = `secondary` [S10b]. Note that shadcn renders `ring-ring/50` (50% alpha) while M3 uses a solid 3px ring with a 2px offset |
| `--chart-1` | `primary` | Proposal. M3 defines no chart roles |
| `--chart-2` | `tertiary` | Proposal |
| `--chart-3` | `secondary` | Proposal |
| `--chart-4` | `inverse-primary` | Proposal (P80 light / P40 dark, so it contrasts with chart-1) |
| `--chart-5` | `outline` | Proposal. Validate chart contrast separately |
| `--sidebar` | `surface-container` | "The most common combination of surface roles uses surface for a background area and surface container for a navigation area" [S1] |
| `--sidebar-foreground` | `on-surface-variant` | Inactive nav labels and icons |
| `--sidebar-primary` | `primary` | |
| `--sidebar-primary-foreground` | `on-primary` | |
| `--sidebar-accent` | `secondary-container` | Navigation drawer and navigation bar `active-indicator-color` = `secondary-container` [S10d] |
| `--sidebar-accent-foreground` | `on-secondary-container` | |
| `--sidebar-border` | `outline-variant` | |
| `--sidebar-ring` | `secondary` | |

Token usage observed in the installed shadcn-svelte components (`src/lib/components/ui`, "nova" style): `bg-muted` ×48, `text-muted-foreground` ×39, `focus-visible:ring-ring/50` ×16, `focus-visible:border-ring` ×13, `focus:bg-accent` ×9, `dark:bg-input/30` ×8, `disabled:bg-input/50` ×3. Two consequences:

- `--input` = `outline` makes `dark:bg-input/30` a 30% outline-tinted field background. If that looks too grey, map `--input` to `outline-variant`. This is the only mapping that needs a visual check.
- Input focus uses `border-ring`, so inputs get a `secondary` focus border. M3 text fields use `primary` [S10c]. If parity matters, add `focus-visible:border-primary` in the Input component instead of changing `--ring`.

### 7.3 Drop-in CSS (baseline scheme + bridge) for `src/routes/layout.css`

```css
/* ---- M3 sys color: baseline light (m3.material.io baseline, current spec) ---- */
:root {
	--md-sys-color-primary: #6750a4;
	--md-sys-color-on-primary: #ffffff;
	--md-sys-color-primary-container: #eaddff;
	--md-sys-color-on-primary-container: #4f378b;
	--md-sys-color-primary-fixed: #eaddff;
	--md-sys-color-primary-fixed-dim: #d0bcff;
	--md-sys-color-on-primary-fixed: #21005d;
	--md-sys-color-on-primary-fixed-variant: #4f378b;
	--md-sys-color-inverse-primary: #d0bcff;
	--md-sys-color-secondary: #625b71;
	--md-sys-color-on-secondary: #ffffff;
	--md-sys-color-secondary-container: #e8def8;
	--md-sys-color-on-secondary-container: #4a4458;
	--md-sys-color-secondary-fixed: #e8def8;
	--md-sys-color-secondary-fixed-dim: #ccc2dc;
	--md-sys-color-on-secondary-fixed: #1d192b;
	--md-sys-color-on-secondary-fixed-variant: #4a4458;
	--md-sys-color-tertiary: #7d5260;
	--md-sys-color-on-tertiary: #ffffff;
	--md-sys-color-tertiary-container: #ffd8e4;
	--md-sys-color-on-tertiary-container: #633b48;
	--md-sys-color-tertiary-fixed: #ffd8e4;
	--md-sys-color-tertiary-fixed-dim: #efb8c8;
	--md-sys-color-on-tertiary-fixed: #31111d;
	--md-sys-color-on-tertiary-fixed-variant: #633b48;
	--md-sys-color-error: #b3261e;
	--md-sys-color-on-error: #ffffff;
	--md-sys-color-error-container: #f9dedc;
	--md-sys-color-on-error-container: #8c1d18;
	--md-sys-color-surface: #fef7ff;
	--md-sys-color-surface-dim: #ded8e1;
	--md-sys-color-surface-bright: #fef7ff;
	--md-sys-color-surface-container-lowest: #ffffff;
	--md-sys-color-surface-container-low: #f7f2fa;
	--md-sys-color-surface-container: #f3edf7;
	--md-sys-color-surface-container-high: #ece6f0;
	--md-sys-color-surface-container-highest: #e6e0e9;
	--md-sys-color-on-surface: #1d1b20;
	--md-sys-color-surface-variant: #e7e0ec;
	--md-sys-color-on-surface-variant: #49454f;
	--md-sys-color-outline: #79747e;
	--md-sys-color-outline-variant: #cac4d0;
	--md-sys-color-inverse-surface: #322f35;
	--md-sys-color-inverse-on-surface: #f5eff7;
	--md-sys-color-scrim: #000000;
	--md-sys-color-shadow: #000000;
	--md-sys-color-surface-tint: #6750a4;
	--md-sys-color-background: #fef7ff;
	--md-sys-color-on-background: #1d1b20;
}

/* ---- M3 sys color: baseline dark ---- */
.dark {
	--md-sys-color-primary: #d0bcff;
	--md-sys-color-on-primary: #381e72;
	--md-sys-color-primary-container: #4f378b;
	--md-sys-color-on-primary-container: #eaddff;
	--md-sys-color-primary-fixed: #eaddff;
	--md-sys-color-primary-fixed-dim: #d0bcff;
	--md-sys-color-on-primary-fixed: #21005d;
	--md-sys-color-on-primary-fixed-variant: #4f378b;
	--md-sys-color-inverse-primary: #6750a4;
	--md-sys-color-secondary: #ccc2dc;
	--md-sys-color-on-secondary: #332d41;
	--md-sys-color-secondary-container: #4a4458;
	--md-sys-color-on-secondary-container: #e8def8;
	--md-sys-color-secondary-fixed: #e8def8;
	--md-sys-color-secondary-fixed-dim: #ccc2dc;
	--md-sys-color-on-secondary-fixed: #1d192b;
	--md-sys-color-on-secondary-fixed-variant: #4a4458;
	--md-sys-color-tertiary: #efb8c8;
	--md-sys-color-on-tertiary: #492532;
	--md-sys-color-tertiary-container: #633b48;
	--md-sys-color-on-tertiary-container: #ffd8e4;
	--md-sys-color-tertiary-fixed: #ffd8e4;
	--md-sys-color-tertiary-fixed-dim: #efb8c8;
	--md-sys-color-on-tertiary-fixed: #31111d;
	--md-sys-color-on-tertiary-fixed-variant: #633b48;
	--md-sys-color-error: #f2b8b5;
	--md-sys-color-on-error: #601410;
	--md-sys-color-error-container: #8c1d18;
	--md-sys-color-on-error-container: #f9dedc;
	--md-sys-color-surface: #141218;
	--md-sys-color-surface-dim: #141218;
	--md-sys-color-surface-bright: #3b383e;
	--md-sys-color-surface-container-lowest: #0f0d13;
	--md-sys-color-surface-container-low: #1d1b20;
	--md-sys-color-surface-container: #211f26;
	--md-sys-color-surface-container-high: #2b2930;
	--md-sys-color-surface-container-highest: #36343b;
	--md-sys-color-on-surface: #e6e0e9;
	--md-sys-color-surface-variant: #49454f;
	--md-sys-color-on-surface-variant: #cac4d0;
	--md-sys-color-outline: #938f99;
	--md-sys-color-outline-variant: #49454f;
	--md-sys-color-inverse-surface: #e6e0e9;
	--md-sys-color-inverse-on-surface: #322f35;
	--md-sys-color-scrim: #000000;
	--md-sys-color-shadow: #000000;
	--md-sys-color-surface-tint: #d0bcff;
	--md-sys-color-background: #141218;
	--md-sys-color-on-background: #e6e0e9;
}

/* ---- shadcn bridge: aliases only, so light/dark come from the md vars ---- */
:root,
.dark {
	--background: var(--md-sys-color-surface);
	--foreground: var(--md-sys-color-on-surface);
	--card: var(--md-sys-color-surface-container-low);
	--card-foreground: var(--md-sys-color-on-surface);
	--popover: var(--md-sys-color-surface-container);
	--popover-foreground: var(--md-sys-color-on-surface);
	--primary: var(--md-sys-color-primary);
	--primary-foreground: var(--md-sys-color-on-primary);
	--secondary: var(--md-sys-color-secondary-container);
	--secondary-foreground: var(--md-sys-color-on-secondary-container);
	--muted: var(--md-sys-color-surface-container-highest);
	--muted-foreground: var(--md-sys-color-on-surface-variant);
	--accent: color-mix(in srgb, var(--md-sys-color-on-surface) 10%, var(--md-sys-color-surface-container));
	--accent-foreground: var(--md-sys-color-on-surface);
	--destructive: var(--md-sys-color-error);
	--destructive-foreground: var(--md-sys-color-on-error);
	--border: var(--md-sys-color-outline-variant);
	--input: var(--md-sys-color-outline);
	--ring: var(--md-sys-color-secondary);
	--chart-1: var(--md-sys-color-primary);
	--chart-2: var(--md-sys-color-tertiary);
	--chart-3: var(--md-sys-color-secondary);
	--chart-4: var(--md-sys-color-inverse-primary);
	--chart-5: var(--md-sys-color-outline);
	--sidebar: var(--md-sys-color-surface-container);
	--sidebar-foreground: var(--md-sys-color-on-surface-variant);
	--sidebar-primary: var(--md-sys-color-primary);
	--sidebar-primary-foreground: var(--md-sys-color-on-primary);
	--sidebar-accent: var(--md-sys-color-secondary-container);
	--sidebar-accent-foreground: var(--md-sys-color-on-secondary-container);
	--sidebar-border: var(--md-sys-color-outline-variant);
	--sidebar-ring: var(--md-sys-color-secondary);
}

/* ---- Tailwind utilities for raw M3 roles: bg-m3-*, text-m3-*, border-m3-* ---- */
@theme inline {
	--color-destructive-foreground: var(--destructive-foreground);
	--color-m3-primary: var(--md-sys-color-primary);
	--color-m3-on-primary: var(--md-sys-color-on-primary);
	--color-m3-primary-container: var(--md-sys-color-primary-container);
	--color-m3-on-primary-container: var(--md-sys-color-on-primary-container);
	--color-m3-primary-fixed: var(--md-sys-color-primary-fixed);
	--color-m3-primary-fixed-dim: var(--md-sys-color-primary-fixed-dim);
	--color-m3-on-primary-fixed: var(--md-sys-color-on-primary-fixed);
	--color-m3-on-primary-fixed-variant: var(--md-sys-color-on-primary-fixed-variant);
	--color-m3-inverse-primary: var(--md-sys-color-inverse-primary);
	--color-m3-secondary: var(--md-sys-color-secondary);
	--color-m3-on-secondary: var(--md-sys-color-on-secondary);
	--color-m3-secondary-container: var(--md-sys-color-secondary-container);
	--color-m3-on-secondary-container: var(--md-sys-color-on-secondary-container);
	--color-m3-secondary-fixed: var(--md-sys-color-secondary-fixed);
	--color-m3-secondary-fixed-dim: var(--md-sys-color-secondary-fixed-dim);
	--color-m3-on-secondary-fixed: var(--md-sys-color-on-secondary-fixed);
	--color-m3-on-secondary-fixed-variant: var(--md-sys-color-on-secondary-fixed-variant);
	--color-m3-tertiary: var(--md-sys-color-tertiary);
	--color-m3-on-tertiary: var(--md-sys-color-on-tertiary);
	--color-m3-tertiary-container: var(--md-sys-color-tertiary-container);
	--color-m3-on-tertiary-container: var(--md-sys-color-on-tertiary-container);
	--color-m3-tertiary-fixed: var(--md-sys-color-tertiary-fixed);
	--color-m3-tertiary-fixed-dim: var(--md-sys-color-tertiary-fixed-dim);
	--color-m3-on-tertiary-fixed: var(--md-sys-color-on-tertiary-fixed);
	--color-m3-on-tertiary-fixed-variant: var(--md-sys-color-on-tertiary-fixed-variant);
	--color-m3-error: var(--md-sys-color-error);
	--color-m3-on-error: var(--md-sys-color-on-error);
	--color-m3-error-container: var(--md-sys-color-error-container);
	--color-m3-on-error-container: var(--md-sys-color-on-error-container);
	--color-m3-surface: var(--md-sys-color-surface);
	--color-m3-surface-dim: var(--md-sys-color-surface-dim);
	--color-m3-surface-bright: var(--md-sys-color-surface-bright);
	--color-m3-surface-container-lowest: var(--md-sys-color-surface-container-lowest);
	--color-m3-surface-container-low: var(--md-sys-color-surface-container-low);
	--color-m3-surface-container: var(--md-sys-color-surface-container);
	--color-m3-surface-container-high: var(--md-sys-color-surface-container-high);
	--color-m3-surface-container-highest: var(--md-sys-color-surface-container-highest);
	--color-m3-on-surface: var(--md-sys-color-on-surface);
	--color-m3-surface-variant: var(--md-sys-color-surface-variant);
	--color-m3-on-surface-variant: var(--md-sys-color-on-surface-variant);
	--color-m3-outline: var(--md-sys-color-outline);
	--color-m3-outline-variant: var(--md-sys-color-outline-variant);
	--color-m3-inverse-surface: var(--md-sys-color-inverse-surface);
	--color-m3-inverse-on-surface: var(--md-sys-color-inverse-on-surface);
	--color-m3-scrim: var(--md-sys-color-scrim);
	--color-m3-shadow: var(--md-sys-color-shadow);
}
```

Dynamic theming then only needs to override the 49 `--md-sys-color-*` vars, either with the `themeCss()` output (6.2) or with `el.style.setProperty`. Everything else, including the shadcn components, follows automatically.

---

## 8. Open items / not verified

- **FAB menu:** which of the fill and container pairs goes to the close button and which to the items. The rendered spec table lists the roles but not the element assignment (5.4).
- **Spec version for M3 Expressive:** there is no official m3.material.io statement about which MCU `specVersion` web M3 Expressive apps should use. MCU's default is `'2021'`. `'2025'` exists in npm 0.4.0, and `'2026'` exists only on GitHub `main`.
- **Material Theme Builder defaults** (variant and spec) were not checked. The web app was not inspected.
- **Compose / MDC-Android Expressive color defaults** were not inspected. Only `tokens.xml` v34 and `colors.xml` were read.
- **Chart color mapping** (7.2) is a project proposal. M3 defines no chart roles.
- The **"applying states" page's exact disabled container/content percentages** were not on the m3 page text. The 12% and 38% come from the material-web component tokens [S10], and the m3 state-layer token table lists "Disabled state layer opacity 0.38" [S4].

---

## Sources

- [S1] m3: Color roles. https://m3.material.io/styles/color/roles
- [S2] m3: Color system overview (What's new: Aug 2024 on-container change, Feb 2023 tone-based surfaces, May 2025 contrast). https://m3.material.io/styles/color/system/overview
- [S2b] m3: How the color system works. https://m3.material.io/styles/color/system/how-the-system-works
- [S3] m3: Static baseline color scheme, with the token table in Default Light and Default Dark contexts. https://m3.material.io/styles/color/static/baseline
- [S3b] m3: Dynamic color, user-generated source (`/styles/color/dynamic/user-generated-color` now redirects to `/choosing-a-source`). https://m3.material.io/styles/color/dynamic/user-generated-source
- [S4] m3: States, state layers (opacity token table). https://m3.material.io/foundations/interaction/states/state-layers
- [S4b] m3: States, applying states. https://m3.material.io/foundations/interaction/states/applying-states
- [S5] m3: Elevation, applying elevation (six levels, scrim 32%, surface roles not tied to elevation). https://m3.material.io/styles/elevation/applying-elevation
- [S5a] m3: Elevation overview (differences from M2, hover +1 level). https://m3.material.io/styles/elevation/overview
- [S6] m3: Elevation tokens ("Surface tint color is deprecated", component resting levels and dp). https://m3.material.io/styles/elevation/tokens
- [S7] material-web `tokens/_md-sys-color.scss` and `tokens/versions/v0_192/_md-sys-color.scss`. https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-color.scss
- [S7b] material-web `tokens/versions/v0_192/_md-ref-palette.scss`. https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-ref-palette.scss
- [S8] material-web `tokens/_md-sys-elevation.scss` and `versions/v0_192/_md-sys-elevation.scss`. https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-elevation.scss
- [S9] material-web `tokens/versions/v0_192/_md-sys-state.scss`. https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-state.scss
- [S10] material-web `tokens/versions/v0_192/_md-comp-filled-button.scss` (disabled 0.12 / 0.38). https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-comp-filled-button.scss
- [S10b] material-web `tokens/_md-comp-focus-ring.scss`. https://raw.githubusercontent.com/material-components/material-web/main/tokens/_md-comp-focus-ring.scss
- [S10c] material-web `tokens/versions/v0_192/_md-comp-outlined-text-field.scss`, `_md-comp-outlined-button.scss`. https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-comp-outlined-text-field.scss
- [S10d] material-web component tokens: `_md-comp-elevated-card.scss`, `_md-comp-filled-card.scss`, `_md-comp-outlined-card.scss`, `_md-comp-menu.scss`, `_md-comp-dialog.scss`, `_md-comp-filled-tonal-button.scss`, `_md-comp-navigation-drawer.scss`, `_md-comp-navigation-bar.scss`, `_md-comp-divider.scss`, `_md-comp-snackbar.scss`. https://github.com/material-components/material-web/tree/main/tokens/versions/v0_192
- [S11] MCU `typescript/dynamiccolor/dynamic_scheme.ts` (palettes per variant and spec, `DEFAULT_SPEC_VERSION`, error fallback (25, 84)). https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/dynamic_scheme.ts
- [S11a] MCU `typescript/dynamiccolor/color_spec_2021.ts` (role tones, contrast curves). https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/color_spec_2021.ts
- [S11b] MCU `typescript/dynamiccolor/contrast_curve.ts`. https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/contrast_curve.ts
- [S11c] MCU `typescript/dynamiccolor/color_spec_2025.ts`. https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/color_spec_2025.ts
- [S12] MCU `typescript/scheme/scheme_tonal_spot.ts`, `scheme_expressive.ts`, `scheme_vibrant.ts`. https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/scheme/scheme_tonal_spot.ts
- [S13] material-components-android `lib/java/com/google/android/material/color/res/values/tokens.xml` (v34.0.0). https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/color/res/values/tokens.xml
- [S13b] material-components-android `.../color/res/values/colors.xml` (`mtrl_scrim_color` #52000000). https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/color/res/values/colors.xml
- [S14] MCU dev guide "Creating a color scheme" (contrast levels, variants). https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/dev_guide/creating_color_scheme.md
- [S14b] MCU concepts "Scheme generation". https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/concepts/scheme_generation.md
- [S15] MCU Dart CHANGELOG (0.12.0 "expressive on-colors spec"). https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/dart/CHANGELOG.md
- [S16] material-web `elevation/internal/_elevation.scss` (key/ambient shadows). https://raw.githubusercontent.com/material-components/material-web/main/elevation/internal/_elevation.scss
- [S17] m3 blog: Start building with Material 3 Expressive. https://m3.material.io/blog/building-with-m3-expressive
- [S18] m3: Toolbars guidelines (standard vs vibrant). https://m3.material.io/components/toolbars/guidelines
- [S18b] m3: Toolbars specs (color roles per configuration). https://m3.material.io/components/toolbars/specs
- [S19] m3: FAB overview (M3 Expressive color update). https://m3.material.io/components/floating-action-button/overview
- [S20] m3: FAB menu guidelines (color sets). https://m3.material.io/components/fab-menu/guidelines
- [S20b] m3: FAB menu specs. https://m3.material.io/components/fab-menu/specs
- [S21] npm: `@material/material-color-utilities` 0.4.0. https://www.npmjs.com/package/@material/material-color-utilities
