# M3 Expressive: typography and shape research

Research notes for a Svelte 5 + Tailwind 4 implementation of the Material Design 3 (M3) Expressive type scale, corner radius scale, shape library, and shape morphing.

- Researched: 2026-10-06.
- Every fact below has a source tag such as **[S9]**. The tags are listed under [Sources](#sources).
- Values come from Google's own sources. In order of authority:
  1. The live m3.material.io design-token database (`dsdb`) that the token tables on m3.material.io are rendered from [S9][S10].
  2. Generated token files in `material-web` [S11–S13], `material-components-android` [S14][S15], and Jetpack Compose `material3` [S16–S25].
  3. The `androidx.graphics.shapes` source [S26].
- Where sources disagree, the conflict is called out in a "Discrepancy" note.

---

## Contents

1. [Type scale](#1-type-scale)
2. [Fonts: Roboto, Roboto Flex, Google Sans Flex](#2-fonts-roboto-roboto-flex-google-sans-flex)
3. [Corner radius scale](#3-corner-radius-scale)
4. [Shape morph guidance (buttons, springs)](#4-shape-morph-guidance)
5. [Shape library (35 shapes)](#5-shape-library-35-shapes)
6. [Loading indicator shape sequence](#6-loading-indicator)
7. [JS port of `androidx.graphics.shapes` and `MaterialShapes`](#7-js-port-of-androidxgraphicsshapes--materialshapes)
8. [Pre-generated SVG paths for all 35 shapes](#8-pre-generated-svg-paths)
9. [Tailwind 4 `@theme` recipe](#9-tailwind-4-theme-recipe)
10. [Open questions and things that could not be verified](#10-open-questions--unverifiable)
11. [Sources](#sources)

---

## 1. Type scale

### 1.1 Structure

- M3 has one type scale with **two sets of 15 styles**: 15 baseline and 15 emphasized. Both sets run from Display Large to Label Small [S1].
- The emphasized styles were added in the Expressive update. They "have a higher weight and other minor adjustments compared to the baseline styles". Baseline and emphasized styles are meant to be used together [S1].
- Token naming [S1]:
  - Baseline: `md.sys.typescale.display-large`
  - Emphasized: `md.sys.typescale.emphasized.display-large`
  - The emphasized token is **not** named `display-large-emphasized`. Compose names it `displayLargeEmphasized` [S17].
- "Material components don't use emphasized type styles by default." To use one, swap the baseline token for the emphasized token of the same style [S1].
- Recommended uses for emphasized styles [S1]:
  - Badges
  - Buttons (for primary actions)
  - Extended FAB
  - Selected list items
  - Selected menu items
  - Unread messages and other selected states
- Typeface roles [S1]:
  - **Brand** typeface: Display, Headline, and Title Large.
  - **Plain** typeface: Title Medium/Small, Body, and Label.
  - Roboto is the default for both.
- Scale construction [S1]:
  - Major Second ratio (1.125).
  - Base size 14.
- Unit conversion [S1]:
  - Web font size: `rem = sp / 16`.
  - Letter spacing: `tracking(px) / font-size(px)` gives `em`. Android stores it this way, for example display-large `letterSpacing = -0.00438596` = -0.25 / 57 [S15].
  - material-web stores tracking as rem instead, for example `-0.015625rem` = -0.25px [S11].
- Line-height guidance [S3]:
  - About 1.2 × size for title, headline, and display.
  - About 1.5 × size for body and label.
  - Use tabular figures for changing numbers.

### 1.2 Baseline type scale (exact values)

Context: audience = 3P, platform = web, language height = small (default) [S9]. Cross-checked against material-web v0.192 [S11] and MDC-Android 34.0.0 [S15]; all three agree on every value in this table.

| Token (`md.sys.typescale.*`) | Typeface role | Weight | Size px (rem) | Line height px (rem) | Tracking px (rem / em) |
|---|---|---|---|---|---|
| display-large | brand | 400 | 57 (3.5625) | 64 (4) | **-0.25** (-0.015625rem / -0.004386em) |
| display-medium | brand | 400 | 45 (2.8125) | 52 (3.25) | 0 |
| display-small | brand | 400 | 36 (2.25) | 44 (2.75) | 0 |
| headline-large | brand | 400 | 32 (2) | 40 (2.5) | 0 |
| headline-medium | brand | 400 | 28 (1.75) | 36 (2.25) | 0 |
| headline-small | brand | 400 | 24 (1.5) | 32 (2) | 0 |
| title-large | brand | 400 | 22 (1.375) | 28 (1.75) | 0 |
| title-medium | plain | 500 | 16 (1) | 24 (1.5) | 0.15 (0.009375rem / 0.009375em) |
| title-small | plain | 500 | 14 (0.875) | 20 (1.25) | 0.1 (0.00625rem / 0.007143em) |
| body-large | plain | 400 | 16 (1) | 24 (1.5) | 0.5 (0.03125rem / 0.03125em) |
| body-medium | plain | 400 | 14 (0.875) | 20 (1.25) | 0.25 (0.015625rem / 0.017857em) |
| body-small | plain | 400 | 12 (0.75) | 16 (1) | 0.4 (0.025rem / 0.033333em) |
| label-large | plain | 500 | 14 (0.875) | 20 (1.25) | 0.1 (0.00625rem / 0.007143em) |
| label-medium | plain | 500 | 12 (0.75) | 16 (1) | 0.5 (0.03125rem / 0.041667em) |
| label-small | plain | 500 | 11 (0.6875) | 16 (1) | 0.5 (0.03125rem / 0.045455em) |

Reference typeface tokens [S9][S12]:

- `md.ref.typeface.brand` = Roboto
- `md.ref.typeface.plain` = Roboto
- `weight-regular` = 400
- `weight-medium` = 500
- `weight-bold` = 700
- `weight-semibold` = 600 (dsdb only [S9])

> **Discrepancy:** Compose `TypeScaleTokens.kt` (token version `v0_103`) has three tracking values that differ from the table above [S16]:
>
> | Style | Compose | dsdb, material-web, and MDC-Android |
> |---|---|---|
> | DisplayLarge | -0.2sp | -0.25 |
> | BodyMedium | 0.2sp | 0.25 |
> | TitleMedium | 0.2sp | 0.15 |
>
> Use the dsdb values.

### 1.3 Emphasized type scale (M3 Expressive)

Context: same as 1.2 [S9]. Emphasized styles keep the baseline size, line height, and tracking; only the weight changes. Static fonts (Roboto) use the "static weight" column. Variable fonts use `md.sys.typescale.variable.emphasized.*`, which sets the `wght` axis.

| Token (`md.sys.typescale.emphasized.*`) | Static weight | Variable `wght` | Size / line height px | Tracking px |
|---|---|---|---|---|
| display-large | **500** | 500 | 57 / 64 | -0.25 |
| display-medium | **500** | 500 | 45 / 52 | 0 |
| display-small | **500** | 500 | 36 / 44 | 0 |
| headline-large | **500** | 500 | 32 / 40 | 0 |
| headline-medium | **500** | 500 | 28 / 36 | 0 |
| headline-small | **500** | 500 | 24 / 32 | 0 |
| title-large | **500** | 500 | 22 / 28 | 0 |
| title-medium | **700** | 600 | 16 / 24 | 0.15 |
| title-small | **700** | 600 | 14 / 20 | 0.1 |
| body-large | **500** | 500 | 16 / 24 | 0.5 |
| body-medium | **500** | 500 | 14 / 20 | 0.25 |
| body-small | **500** | 500 | 12 / 16 | 0.4 |
| label-large | **700** | 600 | 14 / 20 | 0.1 |
| label-medium | **700** | 600 | 12 / 16 | 0.5 |
| label-small | **700** | 600 | 11 / 16 | 0.5 |

**Summary rule:** emphasized weight is one step heavier than baseline:

| Baseline weight | Emphasized weight |
|---|---|
| 400 | 500 |
| 500 (static font) | 700 |
| 500 (variable font) | 600 |

Compose `Typography` exposes the same 15 emphasized styles (`displayLargeEmphasized` through `labelSmallEmphasized`). Its weights match the static column: Medium for display, headline, title-large, and body; Bold for title-medium, title-small, and label [S16][S17].

> **Discrepancy:** Compose `v0_103` gives emphasized tracking values that the dsdb does not [S16]. The dsdb keeps baseline tracking [S9].
>
> | Emphasized style | Compose | dsdb |
> |---|---|---|
> | display-large | 0 | -0.25 |
> | body-large | 0.15 | 0.5 |
>
> material-web v0.192 and MDC-Android 34.0.0 contain **no** emphasized tokens at all [S11][S15].

### 1.4 Variable-font type scale

Token sets: `md.sys.typescale.variable.*` and `md.sys.typescale.variable.emphasized.*` [S9].

- Font [S9]:
  - 3P (third-party) context: `md.ref.typeface.variable.brand` = `md.ref.typeface.variable.plain` = **Roboto Flex**.
  - 1P context (Google's own apps): **Google Sans Flex**.
- Axes for every style [S9]:
  - `wght` = the weight column above.
  - `wdth` = 100.
  - `GRAD` = 0.
  - `slnt` = 0.
  - `opsz` is **undefined**, so the browser applies automatic optical sizing (`font-optical-sizing: auto`, which is the default).
  - The static set pins `opsz` to the font size, for example `opsz` = 57 for display-large.
- `ROND` (Google Sans Flex "roundness" axis) [S9]:
  - Emphasized variable styles reference `md.ref.typeface.emphasized.rond`.
  - It resolves to **100** in the 1P (Google Sans Flex) context and 0 in 3P.
  - In other words, Google's Expressive emphasized text is fully rounded Google Sans Flex.
- Tracking resolves to 0 for every variable style in both contexts [S9]. Verify this before relying on it; see [section 10](#10-open-questions--unverifiable).
- 1P static set, for reference [S9]:
  - Brand = Google Sans, plain = Google Sans Text.
  - Same sizes and line heights.
  - Tracking 0 except body-small, label-medium, and label-small, which use 0.1.

### 1.5 Language-height line heights (`md.ref.typeface.*.line-height`)

M3 now scales line height by script category [S1][S9]:

| Category | Height vs. small | Scripts [S1] |
|---|---|---|
| Small (base) | base | Latin, Cyrillic, Greek, Hebrew |
| Medium | about 7% taller | CJK, Arabic, Indic, Thai, Vietnamese, … |
| Large | about 30% taller | Burmese, Telugu |
| Extra large | about 100% taller | Nastaliq |

Line height in px for each category [S9]:

| Style | small | medium | large | extra-large |
|---|---|---|---|---|
| display-large | 64 | 73 | 89 | 120 |
| display-medium | 52 | 56 | 71 | 99 |
| display-small | 44 | 47 | 57 | 80 |
| headline-large | 40 | 42 | 50 | 75 |
| headline-medium | 36 | 38 | 45 | 66 |
| headline-small | 32 | 35 | 41 | 59 |
| title-large | 28 | 31 | 36 | 53 |
| title-medium | 24 | 27 | 31 | 42 |
| title-small | 20 | 23 | 26 | 36 |
| body-large | 24 | 27 | 31 | 41 |
| body-medium | 20 | 23 | 26 | 35 |
| body-small | 16 | 18 | 21 | 30 |
| label-large | 20 | 23 | 26 | 36 |
| label-medium | 16 | 18 | 21 | 30 |
| label-small | 16 | 18 | 21 | 29 |

Implementation tip: put line heights in CSS variables and override them under `:lang(ja)`, `:lang(my)`, and so on.

---

## 2. Fonts: Roboto, Roboto Flex, Google Sans Flex

### 2.1 Guidance

- Static Roboto is the default for all M3 components. Variable fonts like Roboto Flex "aren't yet part of the M3 typescale" according to the fonts page [S2]. The token DB, however, already ships a `variable` set [S9].
- Roboto Flex [S2]:
  - Axes: slant, width, weight, grade, optical size.
  - Advanced axes: XOPQ, YOPQ, XTRA, YTUC, YTLC, YTAS, YTDE, YTFI.
- Recommended fallback order [S2]: **Roboto Flex → Roboto → Noto Sans**.
- M3 shapes "echo key visual attributes" of **Google Sans Flex**: "M3 shapes and Google Sans Flex share roundness visual attributes" [S5].
- Editorial treatments (hero moments that use custom, oversized type) [S4]:
  - Tune `wght`, `GRAD`, `wdth`, and `opsz`.
  - Use negative grade in dark mode to offset the heavier appearance of light-on-dark text.
  - Don't use editorial treatments for labels or purely informational text.

### 2.2 Axis ranges (Google Fonts metadata) [S29]

| Family | Axes (min..max, default) |
|---|---|
| Roboto Flex | `wght` 100..1000 (400), `wdth` 25..151 (100), `opsz` 8..144 (14), `GRAD` -200..150 (0), `slnt` -10..0, `XOPQ` 27..175 (96), `XTRA` 323..603 (468), `YOPQ` 25..135 (79), `YTAS` 649..854 (750), `YTDE` -305..-98 (-203), `YTFI` 560..788 (738), `YTLC` 416..570 (514), `YTUC` 528..760 (712) |
| Google Sans Flex | `wght` 1..1000 (400), `wdth` 25..151 (100), `opsz` 6..144 (18), `GRAD` 0..100 (0), `ROND` 0..100 (0), `slnt` -10..0 |
| Roboto | `wght` 100..900, `wdth` 75..100 |

Notes:

- Roboto Flex `GRAD` goes down to **-200**. The editorial page says "negative grade of 200" [S4].
- Google Sans Flex is available on Google Fonts. The metadata was last modified 2026-10-01 [S29].

### 2.3 Loading recipes

**A. Google Fonts CSS2 API**, verified to return variable `@font-face` rules on 2026-10-06 [S29]. Axis tags must be listed alphabetically, lowercase tags first, then uppercase.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Roboto Flex: the axes M3 actually uses (opsz, wdth, wght, GRAD) + slnt -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,slnt,wdth,wght,GRAD@8..144,-10..0,25..151,100..1000,-200..150&display=swap">
<!-- Roboto Flex: every axis (bigger download) -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,slnt,wdth,wght,GRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC@8..144,-10..0,25..151,100..1000,-200..150,27..175,323..603,25..135,649..854,-305..-98,560..788,416..570,528..760&display=swap">
<!-- Google Sans Flex incl. ROND (Expressive roundness) -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,GRAD,ROND@6..144,-10..0,25..151,1..1000,0..100,0..100&display=swap">
```

The returned `@font-face` rules declare these ranges [S29]:

- Roboto Flex: `font-weight: 100 1000; font-stretch: 25% 151%; font-style: oblique 0deg 10deg`.
- Google Sans Flex: `font-weight: 1 1000; font-stretch: 25% 151%`.

**B. Fontsource (self-hosted, npm).** This repo's `src/routes/layout.css` already imports `@fontsource-variable/roboto-flex` and `@fontsource-variable/google-sans-flex`.

- **Important:** each package's default entry (`index.css`) registers only the **`wght`** axis. Use `full.css` to get every axis [S30]:
  - Roboto Flex v5.3.0 also ships `opsz.css`, `wdth.css`, `grad.css`, `slnt.css`, `xopq.css`, …
  - Google Sans Flex v5.3.1 also ships `rond.css`, `opsz.css`, `wdth.css`, `grad.css`, `slnt.css`.
- The registered family names are `'Roboto Flex Variable'` and `'Google Sans Flex Variable'` [S30].

```css
@import '@fontsource-variable/roboto-flex/full.css';        /* wght+wdth+opsz+GRAD+slnt+XOPQ… */
@import '@fontsource-variable/google-sans-flex/full.css';   /* wght+wdth+opsz+GRAD+ROND+slnt */
```

**C. Manual `@font-face`**, if you host the woff2 files yourself:

```css
@font-face {
  font-family: 'Roboto Flex';
  src: url('/fonts/RobotoFlex.woff2') format('woff2-variations');
  font-weight: 100 1000;
  font-stretch: 25% 151%;
  font-style: oblique 0deg 10deg;
  font-display: swap;
}
```

**Using the axes:**

- Registered axes (`wght` → `font-weight`, `wdth` → `font-stretch`, `opsz` → `font-optical-sizing: auto`, `slnt` → `font-style: oblique`) should go through the standard CSS properties.
- Custom axes need `font-variation-settings`:

```css
.type-emphasized-1p { font-variation-settings: 'ROND' 100; }   /* Google Sans Flex emphasized [S9] */
.dark .text-grade-fix { font-variation-settings: 'GRAD' -25; }  /* example: negative grade in dark mode [S4] */
```

- `font-variation-settings` is not additive: a later declaration replaces every axis value, not just the one it names. To combine axes, set them through custom properties, for example `font-variation-settings: 'ROND' var(--rond, 0), 'GRAD' var(--grad, 0);`.

---

## 3. Corner radius scale

### 3.1 Values (verified in five sources)

| Token `md.sys.shape.corner.*` | dp / px | Compose `ShapeDefaults` | MDC-Android style | material-web (`v0_192`) | Added in Expressive? |
|---|---|---|---|---|---|
| `none` | 0 | `CornerNone` | `…Corner.None` | 0px | |
| `extra-small` | 4 | `ExtraSmall` | `…Corner.ExtraSmall` | 4px | |
| `small` | 8 | `Small` | `…Corner.Small` | 8px | |
| `medium` | 12 | `Medium` | `…Corner.Medium` | 12px | |
| `large` | 16 | `Large` | `…Corner.Large` | 16px | |
| `large-increased` | **20** | `LargeIncreased` | `…Corner.LargeIncreased` | (absent) | **yes** |
| `extra-large` | 28 | `ExtraLarge` | `…Corner.ExtraLarge` | 28px | |
| `extra-large-increased` | **32** | `ExtraLargeIncreased` | `…Corner.ExtraLargeIncreased` | (absent) | **yes** |
| `extra-extra-large` | **48** | `ExtraExtraLarge` | `…Corner.ExtraExtraLarge` | (absent) | **yes** |
| `full` | fully rounded | `CircleShape` (`CornerFull`) | `cornerSize 50%` | 9999px | changed |

Sources:

- Ten-step scale and the three Expressive additions: m3 corner-radius page [S6] and shape overview, May 2025 update [S5].
- dsdb [S10].
- Compose `ShapeTokens.kt` (`VERSION: 14_1_0`) [S18] and `Shapes.kt` [S19].
- MDC-Android `shape/res/values/tokens.xml` (Version 34.0.0) [S14], which also defines dimens `m3_sys_shape_corner_value_{none…extra_extra_large}`.
- material-web v0.192 [S13].

About `full`:

- The m3 overview says: "Updated fully rounded corners to use full. Previously, this was defined using 50% of the component size" [S5].
- The dsdb models `full` as `SHAPE_FAMILY_CIRCULAR` [S10].
- In CSS, use `calc(infinity * 1px)` (Tailwind's `rounded-full` [S31]) or `9999px`. To animate to or from `full`, see 4.3.

**Asymmetric tokens** [S6][S10][S13][S18]:

| Token | Rounded corners (dp) | Square corners |
|---|---|---|
| `extra-small.top` | top-left 4, top-right 4 | bottom 0 |
| `large.top` | top 16 | bottom 0 |
| `large.start` | top-left 16, bottom-left 16 | end 0 |
| `large.end` | top-right 16, bottom-right 16 | start 0 |
| `extra-large.top` | top 28 | bottom 0 |

- The dsdb also defines `md.sys.shape.corner-value.*` scalars for individual corners [S10].
- "Inner corner component tokens always map to individual corner shape tokens" (split buttons, menus) [S6].

**Guidance** [S6]:

- Optical roundness for nested shapes: `inner radius = outer radius - padding`, for example 48 - 14 = 34dp.
- Don't apply large or full corners to information-dense components.
- The shape family can be swapped from rounded to **cut**.

---

## 4. Shape morph guidance

### 4.1 Design guidance

- Shape morph is built into the Material shape library. It's used by the **standard button group** and the **loading indicator** [S7].
- "Shape morphing uses the expressive motion scheme by default. This can be switched to the standard motion scheme as needed" [S7].
- Platform support [S7]: "For Android, use the Shapes in Compose API. Web is not currently available." There is no official web implementation, so the port in [section 7](#7-js-port-of-androidxgraphicsshapes--materialshapes) is our own.
- Use morphing to communicate [S5]:
  - Interaction states, such as selection.
  - Actions in progress, such as typing or loading.
  - Changes in the environment, such as sound, temperature, or time of day.
- Contrast round and square shapes to create "tension" [S5].
- Shapes aren't semantic: don't assign one fixed meaning to a shape [S5].

### 4.2 Buttons: pressed and selected shape morph (Compose source)

`Button(shapes = ButtonShapes(shape, pressedShape))` animates the corner size between `shape` and `pressedShape` while pressed, using `MotionSchemeKeyTokens.DefaultEffects`. The code comment explains: "*DefaultEffects is intentional here to prevent any bounce in this component*" [S23].

That means a **critically-damped spring (damping 1.0, stiffness 1600)**, which settles to 0.1% in about 235 ms. Simulated in this research; see 4.4.

| Button size | Height | Round shape | Square shape | Pressed shape |
|---|---|---|---|---|
| XSmall | 32dp | full | medium 12 | **small 8** |
| Small (default) | 40dp | full | medium 12 | **small 8** |
| Medium | 56dp | full | large 16 | **medium 12** |
| Large | 96dp | full | extra-large 28 | **large 16** |
| XLarge | 136dp | full | extra-large 28 | **large 16** |

- Source: `Button{XSmall,Small,Medium,Large,XLarge}Tokens.kt`, fields `ContainerHeight`, `ContainerShapeRound`, `ContainerShapeSquare`, `PressedContainerShape`, `SelectedContainerShape{Round,Square}` [S24].
- Selected toggle buttons swap round ↔ square. A round button becomes square when selected, and a square button becomes round [S24].

### 4.3 Animating border-radius on the web

> Transitioning `border-radius: 9999px → 8px` spends almost the whole animation clamped at "fully round" and then snaps at the end.

Compose avoids this because `CircleShape` is 50% and is resolved against the actual size. On the web, resolve `full` to **half the component height** before animating. For example, a 40px-tall button goes `20px → 8px`:

```css
.btn { --h: 40px; border-radius: calc(var(--h) / 2); transition: border-radius 235ms cubic-bezier(.2, 0, 0, 1); }
.btn:active { border-radius: 8px; }
```

You can also animate a custom property registered with `@property --r { syntax: '<length>'; inherits: false; initial-value: 0px; }`. To approximate the spring, use a `linear()` easing generated from it (4.4).

### 4.4 Motion springs (system tokens)

Values from the dsdb `md.sys.motion.spring.*` tokens [S10] and Compose `ExpressiveMotionTokens.kt` / `StandardMotionTokens.kt` [S25]; the two agree. Settle time and overshoot were simulated in this research: settle means within 0.1% of the target.

| Spring | Expressive damping / stiffness | Expressive settle, overshoot | Standard damping / stiffness | Standard settle |
|---|---|---|---|---|
| fast spatial | **0.6 / 800** | about 358 ms, 9.3% | 0.9 / 1400 | about 212 ms |
| default spatial | **0.8 / 380** | about 434 ms, 1.4% | 0.9 / 700 | about 306 ms |
| slow spatial | **0.8 / 200** | about 598 ms, 1.5% | 0.9 / 300 | about 474 ms |
| fast effects | 1.0 / 3800 | about 154 ms | same | |
| default effects | 1.0 / 1600 | about 235 ms | same | |
| slow effects | 1.0 / 800 | about 330 ms | same | |

Classic easing tokens for non-spring transitions [S10]:

- `md.sys.motion.easing.emphasized` / `standard` = `cubic-bezier(0.2, 0, 0, 1)`.
- `emphasized.decelerate` = `cubic-bezier(0.05, 0.7, 0.1, 1)`.
- `emphasized.accelerate` = `cubic-bezier(0.3, 0, 0.8, 0.15)`.
- Durations: short1–4 = 50/100/150/200 ms, medium1–4 = 250–400 ms, long1–4 = 450–600 ms, extra-long1–4 = 700–1000 ms.

Spring to CSS `linear()` helper. This is an approximation; sample at least 30 points for underdamped springs.

```js
/** Damped harmonic oscillator from 0 to 1. Returns { easing: 'linear(...)', duration: ms } for CSS. */
export function springToCss(damping, stiffness, { samples = 40, eps = 0.001 } = {}) {
  const w0 = Math.sqrt(stiffness);
  const z = damping;
  const x = (t) => {
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
    }
    return 1 - (1 + w0 * t) * Math.exp(-w0 * t); // critically damped
  };
  let T = 0;
  for (let t = 0; t < 5; t += 0.001) if (Math.abs(x(t) - 1) > eps) T = t;
  const pts = Array.from({ length: samples + 1 }, (_, i) => +x((T * i) / samples).toFixed(4));
  pts[samples] = 1;
  return { easing: `linear(${pts.join(', ')})`, duration: Math.round(T * 1000) };
}
// springToCss(1, 1600)  -> button press morph (≈235ms)
// springToCss(0.6, 800) -> expressive fast spatial (bouncy)
```

### 4.5 Polygon morphing (`Morph`)

For morphing between library shapes, for example button-group or loading-indicator shapes, M3 uses `androidx.graphics.shapes.Morph` [S7][S26]. The algorithm, read from `Morph.kt`, `FeatureMapping.kt`, `PolygonMeasure.kt`, and `FloatMapping.kt` [S26]:

1. **Measure.** Represent each polygon as a closed list of cubic Béziers grouped into *features*: corners, each marked convex or concave, and the edges between them. Measure each cubic's length with a 3-segment polyline. Each corner gets a *progress* value in [0, 1) along the outline, taken at its middle cubic.
2. **Map features.** For every pair (corner of A, corner of B) with the **same convexity**, compute the squared distance between their representative points; a representative point is the midpoint of the feature's start and end anchors. Sort the pairs by distance. Greedily accept pairs that don't reuse a feature, aren't closer than 1e-4 in progress to an existing mapping, and keep the order monotone around the outline. The result is a piecewise-linear progress map A→B, called a `DoubleMapper`.
3. **Cut and align.** Rotate B's outline so that its progress 0 lines up with `map(0)`. Then walk both outlines together, splitting cubics at whichever next breakpoint comes first. The result is two lists of the **same number** of cubics.
4. **Interpolate.** For progress `t`, linearly interpolate all 8 numbers of each cubic pair. Values of `t` outside [0, 1] extrapolate, which gives spring overshoot for free.

The JS port in section 7 implements all four steps faithfully. It ran without error on all 35 × 35 = 1225 shape pairs and was checked visually; see [section 10](#10-open-questions--unverifiable).

---

## 5. Shape library (35 shapes)

- The Expressive update (May 2025) "Added 35 new shapes and shape morphing to Material Shape Library (Figma Design Kit) and Jetpack Compose" [S5]. The blog announcement says the same [S8].
- Guidance: use the shapes for "mostly visual elements" such as image crops, avatars, and decorative elements, and "Avoid applying unconventional shapes to text-heavy containers" [S6][S8].
- Implementation: `androidx.compose.material3.MaterialShapes` [S20]. Every polygon is `normalized()` into the unit square, and paths start at 0° (3 o'clock).
- The official reference image is at [S28].

Construction parameters, taken verbatim from `MaterialShapes.kt` [S20]:

- `customPolygon(points, reps, mirroring)`: repeats the listed `(x, y, rounding)` points `reps` times around the center (0.5, 0.5). With `mirroring`, it mirrors each section.
- `rounding(r, s)` = `CornerRounding(radius = r, smoothing = s)`.
- All coordinates are in the polygon's own space before `normalized()`.

| # | m3 name | Compose `MaterialShapes.` | Construction | Corners (concave) |
|---|---|---|---|---|
| 1 | Circle | `Circle` | `RoundedPolygon.circle(numVertices = 10)` | 10 (0) |
| 2 | Square | `Square` | `rectangle(1×1, rounding .30)` | 4 |
| 3 | Slanted | `Slanted` | custom 2 pts × 2 reps: (0.926, 0.970) r .189 s .811; (-0.021, 0.967) r .187 s .057 | 4 |
| 4 | Arch | `Arch` | `RoundedPolygon(4, perVertex [1, 1, .2, .2])`, rotated -135° | 4 |
| 5 | Fan | `Fan` | custom 4 pts × 1: (1.004, 1) r .148 s .417; (0, 1) r .151; (0, -.003) r .148; (.978, .020) r .803 | 4 |
| 6 | Arrow | `Arrow` | custom 4 pts × 1: (.5, .892) r .313; (-.216, 1.05) r .207; (.499, -.16) r .215 s 1; (1.225, 1.06) r .211 | 4 (1) |
| 7 | Semicircle | `SemiCircle` | `rectangle(1.6×1, perVertex [.2, .2, 1, 1])` | 4 |
| 8 | Oval | `Oval` | `circle()` (8 vertices), scaled (1, 0.64), rotated -45° | 8 |
| 9 | Pill | `Pill` | custom 3 pts × 2, mirrored: (.961, .039) r .426; (1.001, .428); (1, .609) r 1 | 10 |
| 10 | Triangle | `Triangle` | `RoundedPolygon(3, rounding .2)`, rotated -90° | 3 |
| 11 | Diamond | `Diamond` | custom 2 pts × 2: (.5, 1.096) r .151 s .524; (.040, .5) r .159 | 4 |
| 12 | Clamshell | `ClamShell` | custom 3 pts × 2: (.171, .841) r .159; (-.020, .5) r .140; (.170, .159) r .159 | 6 |
| 13 | Pentagon | `Pentagon` | custom 3 pts × 1, mirrored: (.5, -.009) r .172; (1.030, .365) r .164; (.828, .970) r .169 | 5 |
| 14 | Gem | `Gem` | custom 4 pts × 1, mirrored: (.499, 1.023) r .241 s .778; (-.005, .792) r .208; (.073, .258) r .228; (.433, 0) r .491 | 7 |
| 15 | Sunny | `Sunny` | `star(8, innerRadius .8, rounding .15)` | 16 (8) |
| 16 | Very sunny | `VerySunny` | custom 2 pts × 8: (.5, 1.080) r .085; (.358, .843) r .085 | 16 (8) |
| 17 | 4-sided cookie | `Cookie4Sided` | custom 2 pts × 4: (1.237, 1.236) r .258; (.5, .918) r .233 | 8 (4) |
| 18 | 6-sided cookie | `Cookie6Sided` | custom 2 pts × 6: (.723, .884) r .394; (.5, 1.099) r .398 | 12 (6) |
| 19 | 7-sided cookie | `Cookie7Sided` | `star(7, innerRadius .75, rounding .5)`, rotated -90° | 14 (7) |
| 20 | 9-sided cookie | `Cookie9Sided` | `star(9, innerRadius .8, rounding .5)`, rotated -90° | 18 (9) |
| 21 | 12-sided cookie | `Cookie12Sided` | `star(12, innerRadius .8, rounding .5)`, rotated -90° | 24 (12) |
| 22 | Ghost-ish | `Ghostish` | custom 4 pts × 1, mirrored: (.5, 0) r 1; (1, 0) r 1; (1, 1.140) r .254 s .106; (.575, .906) r .253 | 7 (3) |
| 23 | 4-leaf clover | `Clover4Leaf` | custom 2 pts × 4, mirrored: (.5, .074); (.725, -.099) r .476 | 12 (4) |
| 24 | 8-leaf clover | `Clover8Leaf` | custom 2 pts × 8: (.5, .036); (.758, -.101) r .209 | 16 (8) |
| 25 | Burst | `Burst` | custom 2 pts × 12: (.5, -.006) r .006; (.592, .158) r .006 | 24 (12) |
| 26 | Soft burst | `SoftBurst` | custom 2 pts × 10: (.193, .277) r .053; (.176, .055) r .053 | 20 (10) |
| 27 | Boom | `Boom` | custom 2 pts × 15: (.457, .296) r .007; (.5, -.051) r .007 | 30 (15) |
| 28 | Soft boom | `SoftBoom` | custom 4 pts × 16, mirrored: (.733, .454); (.839, .437) r .532; (.949, .449) r .439 s 1; (.998, .478) r .174 | 112 (16) |
| 29 | Flower | `Flower` | custom 3 pts × 8, mirrored: (.370, .187); (.416, .049) r .381; (.479, .001) r .095 | 40 (8) |
| 30 | Puffy | `Puffy` | custom 11 pts × 2, mirrored (see code), then scaled (1, 0.742) | 42 (10) |
| 31 | Puffy diamond | `PuffyDiamond` | custom 3 pts × 4, mirrored: (.870, .130) r .146; (.818, .357); (1, .332) r .853 | 20 (8) |
| 32 | Pixel circle | `PixelCircle` | custom 8 unrounded pts × 2, mirrored (stair steps) | 30 (13) |
| 33 | Pixel triangle | `PixelTriangle` | custom 13 unrounded pts × 1, mirrored (stair steps) | 25 (10) |
| 34 | Bun | `Bun` | custom 4 pts × 2, mirrored: (.796, .5); (.853, .518) r 1; (.992, .631) r 1; (.968, 1) r 1 | 14 (2) |
| 35 | Heart | `Heart` | custom 4 pts × 1, mirrored: (.5, .268) r .016; (.792, -.066) r .958; (1.064, .276) r 1; (.501, .946) r .129 | 7 (1) |

The corner counts were computed by the port; concave counts are in parentheses.

Visual check:

- The port's 35 shapes were rasterized with headless Edge and compared side by side with Google's reference image [S28].
- All 35 silhouettes match: Pill and Oval are diagonal, Ghost-ish has the wavy bottom, Puffy has 12 lobes, and Pixel circle and Pixel triangle are stepped.

---

## 6. Loading indicator

From `LoadingIndicator.kt` and `LoadingIndicatorTokens.kt` (tokens `v0_7_0`) [S21][S22], plus m3 [S7]:

- **Indeterminate**: cycles through **7 shapes** in this order, then wraps back to the first: `SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided → Oval`.
- **Determinate**: morphs `Circle` (pre-rotated 360°/20 = 18°) → `SoftBurst` as progress goes 0→1. The indicator also rotates by `-progress × 180°`.

Sizes:

| Property | Value |
|---|---|
| Container | 48 × 48dp, shape `CornerFull` |
| Active indicator | 38dp, so `ActiveIndicatorScale` = 38/48 |

Colors:

| Variant | Indicator color | Container color |
|---|---|---|
| Uncontained | `primary` | (none) |
| Contained | `onPrimaryContainer` | `primaryContainer` |

Indeterminate timing:

- A new morph starts every **650 ms** (`MorphIntervalMillis`).
- Each morph animates progress 0→1 with `spring(dampingRatio = 0.6, stiffness = 200, visibilityThreshold = 0.1)`. It overshoots and is not clamped.
- After each morph, the base rotation steps by +90°.
- While drawing, the shape is rotated by `progress × 90° + morphRotationTargetAngle + globalRotation`.
- `globalRotation` is a linear 0→360° loop every **4666 ms**.
- Shapes are scaled by `min over shapes of max(bounds/maxBounds)` × 38/48 so they never clip while rotating.

---

## 7. JS port of `androidx.graphics.shapes` + `MaterialShapes`

A faithful, dependency-free port in about 780 lines of ES module code. It covers:

- `CornerRounding`, `RoundedCorner` (radius + smoothing), `RoundedPolygon` (vertices / `numVertices` / `circle` / `rectangle` / `star`), `transformed`, `normalized`, `calculateBounds`, and `calculateMaxBounds`.
- `Morph`, including feature mapping and measuring.
- `MaterialShapes` builders with the exact constants from [S20].
- SVG `d` output.

Port notes:

- Uses Float64 instead of Kotlin Float32. Differences are below 1e-6 of the unit square.
- Coordinate system is y-down, as in Compose and SVG.
- `rotated(deg)` reproduces Compose `Matrix.rotateZ`: `x' = x·cos − y·sin`, `y' = x·sin + y·cos` [S27].
- Paths start at angle 0, which is what `RoundedPolygon.toShape()` and `toPath()` use by default [S20][S27].
- License: Apache-2.0 (derived from AOSP).

Usage:

```js
import { materialShape, toSvgPath, Morph } from '$lib/m3/material-shapes.js';
const d = toSvgPath(materialShape('cookie9Sided'), { scale: 100 }); // <path d={d}> in viewBox 0 0 100 100
const m = new Morph(materialShape('circle'), materialShape('square'));
const mid = m.toSvgPath(0.5, { scale: 100 });                     // drive t with a spring for M3 feel
```

```js
// material-shapes.js
// Port of androidx.graphics.shapes (RoundedPolygon, CornerRounding, star/circle/rectangle,
// normalized, Morph) and androidx.compose.material3.MaterialShapes to plain JS.
// Source: https://github.com/androidx/androidx/tree/androidx-main/graphics/graphics-shapes
//         https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt
// Apache-2.0 (derived work). Coordinates are y-down (screen space), same as Compose.

const EPS = 1e-4; // DistanceEpsilon
const ANGLE_EPS = 1e-6; // AngleEpsilon

// ---------- point helpers ([x, y] arrays) ----------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const dir = (a) => {
  const d = len(a);
  if (!(d > 0)) throw new Error('zero-length vector');
  return [a[0] / d, a[1] / d];
};
const rot90 = (a) => [-a[1], a[0]];
const lerp = (a, b, t) => (1 - t) * a + t * b;
const lerpP = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const posMod = (n, m) => ((n % m) + m) % m;
const clockwise = (a, b) => a[0] * b[1] - a[1] * b[0] > 0;
const isConvex = (prev, curr, next) => clockwise(sub(curr, prev), sub(next, curr));

// ---------- Cubic: [x0,y0, c0x,c0y, c1x,c1y, x1,y1] ----------
const straightLine = (x0, y0, x1, y1) => [
  x0, y0, lerp(x0, x1, 1 / 3), lerp(y0, y1, 1 / 3), lerp(x0, x1, 2 / 3), lerp(y0, y1, 2 / 3), x1, y1,
];

function circularArc(cx, cy, x0, y0, x1, y1) {
  const p0d = dir([x0 - cx, y0 - cy]);
  const p1d = dir([x1 - cx, y1 - cy]);
  const r0 = rot90(p0d);
  const r1 = rot90(p1d);
  const cw = dot(r0, [x1 - cx, y1 - cy]) >= 0;
  const cosa = dot(p0d, p1d);
  if (cosa > 0.999) return straightLine(x0, y0, x1, y1);
  const k =
    ((((len([x0 - cx, y0 - cy]) * 4) / 3) *
      (Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa))) /
      (1 - cosa)) *
    (cw ? 1 : -1);
  return [x0, y0, x0 + r0[0] * k, y0 + r0[1] * k, x1 - r1[0] * k, y1 - r1[1] * k, x1, y1];
}

function pointOnCurve(c, t) {
  const u = 1 - t;
  return [
    c[0] * u * u * u + c[2] * 3 * t * u * u + c[4] * 3 * t * t * u + c[6] * t * t * t,
    c[1] * u * u * u + c[3] * 3 * t * u * u + c[5] * 3 * t * t * u + c[7] * t * t * t,
  ];
}
const zeroLength = (c) => Math.abs(c[0] - c[6]) < EPS && Math.abs(c[1] - c[7]) < EPS;

function splitCubic(c, t) {
  const u = 1 - t;
  const p = pointOnCurve(c, t);
  return [
    [
      c[0], c[1],
      c[0] * u + c[2] * t, c[1] * u + c[3] * t,
      c[0] * u * u + c[2] * 2 * u * t + c[4] * t * t, c[1] * u * u + c[3] * 2 * u * t + c[5] * t * t,
      p[0], p[1],
    ],
    [
      p[0], p[1],
      c[2] * u * u + c[4] * 2 * u * t + c[6] * t * t, c[3] * u * u + c[5] * 2 * u * t + c[7] * t * t,
      c[4] * u + c[6] * t, c[5] * u + c[7] * t,
      c[6], c[7],
    ],
  ];
}
const reverseCubic = (c) => [c[6], c[7], c[4], c[5], c[2], c[3], c[0], c[1]];
const transformCubic = (c, f) => {
  const o = [];
  for (let i = 0; i < 8; i += 2) {
    const [x, y] = f(c[i], c[i + 1]);
    o.push(x, y);
  }
  return o;
};

// ---------- CornerRounding ----------
export const rounding = (radius = 0, smoothing = 0) => ({ radius, smoothing });
export const UNROUNDED = rounding();

// ---------- RoundedCorner (private class in RoundedPolygon.kt) ----------
class RoundedCorner {
  constructor(p0, p1, p2, r) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    const v01 = sub(p0, p1);
    const v21 = sub(p2, p1);
    const d01 = len(v01);
    const d21 = len(v21);
    if (d01 > 0 && d21 > 0) {
      this.d1 = mul(v01, 1 / d01);
      this.d2 = mul(v21, 1 / d21);
      this.cornerRadius = r?.radius ?? 0;
      this.smoothing = r?.smoothing ?? 0;
      this.cosAngle = dot(this.d1, this.d2);
      this.sinAngle = Math.sqrt(1 - this.cosAngle * this.cosAngle);
      this.expectedRoundCut =
        this.sinAngle > 1e-3 ? (this.cornerRadius * (this.cosAngle + 1)) / this.sinAngle : 0;
    } else {
      this.d1 = [0, 0];
      this.d2 = [0, 0];
      this.cornerRadius = 0;
      this.smoothing = 0;
      this.cosAngle = 0;
      this.sinAngle = 0;
      this.expectedRoundCut = 0;
    }
  }
  get expectedCut() {
    return (1 + this.smoothing) * this.expectedRoundCut;
  }
  actualSmoothing(allowedCut) {
    if (allowedCut > this.expectedCut) return this.smoothing;
    if (allowedCut > this.expectedRoundCut)
      return (
        (this.smoothing * (allowedCut - this.expectedRoundCut)) /
        (this.expectedCut - this.expectedRoundCut)
      );
    return 0;
  }
  getCubics(allowedCut0, allowedCut1 = allowedCut0) {
    const allowedCut = Math.min(allowedCut0, allowedCut1);
    const p1 = this.p1;
    if (this.expectedRoundCut < EPS || allowedCut < EPS || this.cornerRadius < EPS)
      return [straightLine(p1[0], p1[1], p1[0], p1[1])];
    const actualRoundCut = Math.min(allowedCut, this.expectedRoundCut);
    const s0 = this.actualSmoothing(allowedCut0);
    const s1 = this.actualSmoothing(allowedCut1);
    const actualR = (this.cornerRadius * actualRoundCut) / this.expectedRoundCut;
    const centerDistance = Math.sqrt(actualR * actualR + actualRoundCut * actualRoundCut);
    const center = add(p1, mul(dir(mul(add(this.d1, this.d2), 0.5)), centerDistance));
    const ci0 = add(p1, mul(this.d1, actualRoundCut));
    const ci2 = add(p1, mul(this.d2, actualRoundCut));
    const f0 = this.flanking(actualRoundCut, s0, p1, this.p0, ci0, ci2, center, actualR);
    const f2 = reverseCubic(this.flanking(actualRoundCut, s1, p1, this.p2, ci2, ci0, center, actualR));
    return [f0, circularArc(center[0], center[1], f0[6], f0[7], f2[0], f2[1]), f2];
  }
  flanking(actualRoundCut, smoothing, corner, sideStart, csi, ocsi, cc, actualR) {
    const sideDir = dir(sub(sideStart, corner));
    const curveStart = add(corner, mul(sideDir, actualRoundCut * (1 + smoothing)));
    const p = lerpP(csi, mul(add(csi, ocsi), 0.5), smoothing);
    const curveEnd = add(cc, mul(dir(sub(p, cc)), actualR));
    const tangent = rot90(sub(curveEnd, cc));
    const anchorEnd = lineIntersection(sideStart, sideDir, curveEnd, tangent) ?? csi;
    const anchorStart = mul(add(curveStart, mul(anchorEnd, 2)), 1 / 3);
    return [...curveStart, ...anchorStart, ...anchorEnd, ...curveEnd];
  }
}

function lineIntersection(p0, d0, p1, d1) {
  const rd1 = rot90(d1);
  const den = dot(d0, rd1);
  if (Math.abs(den) < EPS) return null;
  const num = dot(sub(p1, p0), rd1);
  if (Math.abs(den) < EPS * Math.abs(num)) return null;
  return add(p0, mul(d0, num / den));
}

// ---------- RoundedPolygon ----------
// features: [{ type: 'corner' | 'edge', convex?: boolean, cubics: Cubic[] }]
export class RoundedPolygon {
  constructor(features, center) {
    this.features = features;
    this.center = center;
    this.cubics = buildCubics(features, center);
  }
  transformed(f) {
    return new RoundedPolygon(
      this.features.map((ft) => ({ ...ft, cubics: ft.cubics.map((c) => transformCubic(c, f)) })),
      f(this.center[0], this.center[1]),
    );
  }
  /** Same as Compose Matrix().rotateZ(deg) (y-down, so positive = clockwise on screen). */
  rotated(deg) {
    const r = (deg * Math.PI) / 180;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return this.transformed((x, y) => [c * x - s * y, s * x + c * y]);
  }
  scaled(sx, sy = sx) {
    return this.transformed((x, y) => [x * sx, y * sy]);
  }
  calculateBounds(approximate = true) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = Number.MIN_VALUE; // mirrors Kotlin's Float.MIN_VALUE init
    let maxY = Number.MIN_VALUE;
    for (const c of this.cubics) {
      const b = cubicBounds(c, approximate);
      minX = Math.min(minX, b[0]);
      minY = Math.min(minY, b[1]);
      maxX = Math.max(maxX, b[2]);
      maxY = Math.max(maxY, b[3]);
    }
    return [minX, minY, maxX, maxY];
  }
  calculateMaxBounds() {
    let m = 0;
    const [cx, cy] = this.center;
    for (const c of this.cubics) {
      const mid = pointOnCurve(c, 0.5);
      m = Math.max(m, (c[0] - cx) ** 2 + (c[1] - cy) ** 2, (mid[0] - cx) ** 2 + (mid[1] - cy) ** 2);
    }
    const d = Math.sqrt(m);
    return [cx - d, cy - d, cx + d, cy + d];
  }
  /** Fit into the unit square [0,1]x[0,1], aspect preserved, centered (RoundedPolygon.normalized). */
  normalized() {
    const [l, t, r, b] = this.calculateBounds();
    const w = r - l;
    const h = b - t;
    const side = Math.max(w, h);
    const ox = (side - w) / 2 - l;
    const oy = (side - h) / 2 - t;
    return this.transformed((x, y) => [(x + ox) / side, (y + oy) / side]);
  }
}

function buildCubics(features, center) {
  const out = [];
  let first = null;
  let last = null;
  let splitStart = null;
  let splitEnd = null;
  if (features.length > 0 && features[0].cubics.length === 3) {
    const [s, e] = splitCubic(features[0].cubics[1], 0.5);
    splitStart = [features[0].cubics[0], s];
    splitEnd = [e, features[0].cubics[2]];
  }
  for (let i = 0; i <= features.length; i++) {
    let fc;
    if (i === 0 && splitEnd) fc = splitEnd;
    else if (i === features.length) {
      if (splitStart) fc = splitStart;
      else break;
    } else fc = features[i].cubics;
    for (const c of fc) {
      if (!zeroLength(c)) {
        if (last) out.push(last);
        last = c;
        if (!first) first = c;
      } else if (last) {
        last = last.slice();
        last[6] = c[6];
        last[7] = c[7];
      }
    }
  }
  if (last && first) out.push([last[0], last[1], last[2], last[3], last[4], last[5], first[0], first[1]]);
  else out.push([center[0], center[1], center[0], center[1], center[0], center[1], center[0], center[1]]);
  return out;
}

function cubicBounds(c, approximate) {
  if (zeroLength(c)) return [c[0], c[1], c[0], c[1]];
  let minX = Math.min(c[0], c[6]);
  let minY = Math.min(c[1], c[7]);
  let maxX = Math.max(c[0], c[6]);
  let maxY = Math.max(c[1], c[7]);
  if (approximate) {
    return [
      Math.min(minX, c[2], c[4]), Math.min(minY, c[3], c[5]),
      Math.max(maxX, c[2], c[4]), Math.max(maxY, c[3], c[5]),
    ];
  }
  for (const axis of [0, 1]) {
    const a = -c[axis] + 3 * c[2 + axis] - 3 * c[4 + axis] + c[6 + axis];
    const b = 2 * c[axis] - 4 * c[2 + axis] + 2 * c[4 + axis];
    const k = -c[axis] + c[2 + axis];
    const ts = [];
    if (Math.abs(a) < EPS) {
      if (b !== 0) ts.push((2 * k) / (-2 * b));
    } else {
      const disc = b * b - 4 * a * k;
      if (disc >= 0) ts.push((-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a));
    }
    for (const t of ts) {
      if (t < 0 || t > 1) continue;
      const v = pointOnCurve(c, t)[axis];
      if (axis === 0) {
        minX = Math.min(minX, v);
        maxX = Math.max(maxX, v);
      } else {
        minY = Math.min(minY, v);
        maxY = Math.max(maxY, v);
      }
    }
  }
  return [minX, minY, maxX, maxY];
}

/** RoundedPolygon(vertices: FloatArray, rounding, perVertexRounding, centerX, centerY) */
export function polygonFromVertices(vertices, round = UNROUNDED, perVertex = null, centerX, centerY) {
  const n = vertices.length / 2;
  if (n < 3) throw new Error('Polygons must have at least 3 vertices');
  const V = (i) => [vertices[i * 2], vertices[i * 2 + 1]];
  const corners = [];
  for (let i = 0; i < n; i++)
    corners.push(new RoundedCorner(V((i + n - 1) % n), V(i), V((i + 1) % n), perVertex?.[i] ?? round));
  // Scale cuts down when two neighbouring corners want more of a side than is available.
  const cutAdjusts = [];
  for (let ix = 0; ix < n; ix++) {
    const nx = (ix + 1) % n;
    const expectedRoundCut = corners[ix].expectedRoundCut + corners[nx].expectedRoundCut;
    const expectedCut = corners[ix].expectedCut + corners[nx].expectedCut;
    const side = len(sub(V(ix), V(nx)));
    if (expectedRoundCut > side) cutAdjusts.push([side / expectedRoundCut, 0]);
    else if (expectedCut > side)
      cutAdjusts.push([1, (side - expectedRoundCut) / (expectedCut - expectedRoundCut)]);
    else cutAdjusts.push([1, 1]);
  }
  const cornerCubics = [];
  for (let i = 0; i < n; i++) {
    const allowed = [0, 1].map((delta) => {
      const [roundCutRatio, cutRatio] = cutAdjusts[(i + n - 1 + delta) % n];
      return (
        corners[i].expectedRoundCut * roundCutRatio +
        (corners[i].expectedCut - corners[i].expectedRoundCut) * cutRatio
      );
    });
    cornerCubics.push(corners[i].getCubics(allowed[0], allowed[1]));
  }
  const features = [];
  for (let i = 0; i < n; i++) {
    const convex = isConvex(V((i + n - 1) % n), V(i), V((i + 1) % n));
    features.push({ type: 'corner', convex, cubics: cornerCubics[i] });
    const a = cornerCubics[i][cornerCubics[i].length - 1];
    const b = cornerCubics[(i + 1) % n][0];
    features.push({ type: 'edge', cubics: [straightLine(a[6], a[7], b[0], b[1])] });
  }
  let center;
  if (centerX === undefined || centerY === undefined) {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < n; i++) {
      sx += vertices[2 * i];
      sy += vertices[2 * i + 1];
    }
    center = [sx / n, sy / n];
  } else center = [centerX, centerY];
  return new RoundedPolygon(features, center);
}

/** RoundedPolygon(numVertices, radius = 1, centerX = 0, centerY = 0, rounding, perVertexRounding) */
export function regularPolygon(
  numVertices,
  { radius = 1, centerX = 0, centerY = 0, rounding: r = UNROUNDED, perVertexRounding = null } = {},
) {
  const v = [];
  for (let i = 0; i < numVertices; i++) {
    const a = ((Math.PI / numVertices) * 2) * i;
    v.push(Math.cos(a) * radius + centerX, Math.sin(a) * radius + centerY);
  }
  return polygonFromVertices(v, r, perVertexRounding, centerX, centerY);
}

/** RoundedPolygon.circle(numVertices = 8, radius = 1) */
export function circle(numVertices = 8, radius = 1, centerX = 0, centerY = 0) {
  return regularPolygon(numVertices, {
    radius: radius / Math.cos(Math.PI / numVertices),
    centerX,
    centerY,
    rounding: rounding(radius),
  });
}

/** RoundedPolygon.rectangle(width = 2, height = 2, rounding, perVertexRounding) */
export function rectangle({
  width = 2, height = 2, rounding: r = UNROUNDED, perVertexRounding = null, centerX = 0, centerY = 0,
} = {}) {
  const l = centerX - width / 2;
  const t = centerY - height / 2;
  const rr = centerX + width / 2;
  const b = centerY + height / 2;
  return polygonFromVertices([rr, b, l, b, l, t, rr, t], r, perVertexRounding, centerX, centerY);
}

/** RoundedPolygon.star(numVerticesPerRadius, radius = 1, innerRadius = .5, rounding, innerRounding, perVertexRounding) */
export function star(
  numVerticesPerRadius,
  {
    radius = 1, innerRadius = 0.5, rounding: r = UNROUNDED, innerRounding = null,
    perVertexRounding = null, centerX = 0, centerY = 0,
  } = {},
) {
  let pv = perVertexRounding;
  if (!pv && innerRounding)
    pv = Array.from({ length: numVerticesPerRadius }, () => [r, innerRounding]).flat();
  const v = [];
  for (let i = 0; i < numVerticesPerRadius; i++) {
    let a = ((Math.PI / numVerticesPerRadius) * 2) * i;
    v.push(Math.cos(a) * radius + centerX, Math.sin(a) * radius + centerY);
    a = (Math.PI / numVerticesPerRadius) * (2 * i + 1);
    v.push(Math.cos(a) * innerRadius + centerX, Math.sin(a) * innerRadius + centerY);
  }
  return polygonFromVertices(v, r, pv, centerX, centerY);
}

// ---------- SVG output ----------
const fmt = (n, d) => {
  const s = (+n.toFixed(d)).toString();
  return s === '-0' ? '0' : s;
};
/** Cubics -> SVG path "M..C..Z". scale multiplies coords (100 => viewBox "0 0 100 100"). */
export function cubicsToSvgPath(cubics, { scale = 1, digits = 3 } = {}) {
  if (!cubics.length) return '';
  const p = (x, y) => `${fmt(x * scale, digits)} ${fmt(y * scale, digits)}`;
  let d = `M${p(cubics[0][0], cubics[0][1])}`;
  for (const c of cubics) d += `C${p(c[2], c[3])} ${p(c[4], c[5])} ${p(c[6], c[7])}`;
  return `${d}Z`;
}
export const toSvgPath = (polygon, opts) => cubicsToSvgPath(polygon.cubics, opts);

// ---------- Morph (Morph.kt + FeatureMapping.kt + PolygonMeasure.kt + FloatMapping.kt) ----------
function closestProgressTo(c, threshold) {
  const segments = 3;
  let total = 0;
  let rem = threshold;
  let prev = [c[0], c[1]];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const pt = pointOnCurve(c, t);
    const seg = len(sub(pt, prev));
    if (seg >= rem) return [t - (1 - rem / seg) / segments, threshold];
    rem -= seg;
    total += seg;
    prev = pt;
  }
  return [1, total];
}
const measureCubic = (c) => closestProgressTo(c, Infinity)[1];
const findCubicCutPoint = (c, m) => closestProgressTo(c, m)[0];

class MeasuredCubic {
  constructor(cubic, start, end) {
    this.cubic = cubic;
    this.start = start;
    this.end = end;
    this.size = measureCubic(cubic);
  }
  cutAtProgress(p) {
    const b = Math.min(Math.max(p, this.start), this.end);
    const rel = (b - this.start) / (this.end - this.start);
    const t = findCubicCutPoint(this.cubic, rel * this.size);
    const [c1, c2] = splitCubic(this.cubic, t);
    return [new MeasuredCubic(c1, this.start, b), new MeasuredCubic(c2, b, this.end)];
  }
}

class MeasuredPolygon {
  constructor(features, cubics, outline) {
    this.features = features;
    this.cubics = [];
    let start = 0;
    for (let i = 0; i < cubics.length; i++) {
      if (outline[i + 1] - outline[i] > EPS) {
        this.cubics.push(new MeasuredCubic(cubics[i], start, outline[i + 1]));
        start = outline[i + 1];
      }
    }
    this.cubics[this.cubics.length - 1].end = 1;
  }
  static measure(polygon) {
    const cubics = [];
    const f2c = [];
    for (const f of polygon.features) {
      f.cubics.forEach((c, ci) => {
        if (f.type === 'corner' && ci === Math.floor(f.cubics.length / 2)) f2c.push([f, cubics.length]);
        cubics.push(c);
      });
    }
    const measures = [0];
    for (const c of cubics) measures.push(measures[measures.length - 1] + measureCubic(c));
    const total = measures[measures.length - 1];
    const outline = measures.map((m) => m / total);
    const features = f2c.map(([f, ix]) => ({
      progress: posMod((outline[ix] + outline[ix + 1]) / 2, 1),
      feature: f,
    }));
    return new MeasuredPolygon(features, cubics, outline);
  }
  cutAndShift(cp) {
    if (cp < EPS) return this;
    const ti = this.cubics.findIndex((c) => cp >= c.start && cp <= c.end);
    const [b1, b2] = this.cubics[ti].cutAtProgress(cp);
    const n = this.cubics.length;
    const cubics = [b2.cubic];
    for (let i = 1; i < n; i++) cubics.push(this.cubics[(i + ti) % n].cubic);
    cubics.push(b1.cubic);
    const outline = [];
    for (let i = 0; i < n + 2; i++)
      outline.push(i === 0 ? 0 : i === n + 1 ? 1 : posMod(this.cubics[(ti + i - 1) % n].end - cp, 1));
    const features = this.features.map((f) => ({ progress: posMod(f.progress - cp, 1), feature: f.feature }));
    return new MeasuredPolygon(features, cubics, outline);
  }
}

const progressInRange = (p, from, to) => (to >= from ? p >= from && p <= to : p >= from || p <= to);
const progressDistance = (a, b) => {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
};
function linearMap(xs, ys, x) {
  const n = xs.length;
  let s = 0;
  while (!progressInRange(x, xs[s], xs[(s + 1) % n])) s++;
  const e = (s + 1) % n;
  const sx = posMod(xs[e] - xs[s], 1);
  const sy = posMod(ys[e] - ys[s], 1);
  const pos = sx < 0.001 ? 0.5 : posMod(x - xs[s], 1) / sx;
  return posMod(ys[s] + sy * pos, 1);
}
const repPoint = (f) => {
  const a = f.cubics[0];
  const b = f.cubics[f.cubics.length - 1];
  return [(a[0] + b[6]) / 2, (a[1] + b[7]) / 2];
};
function featureMapper(f1s, f2s) {
  const c1 = f1s.filter((f) => f.feature.type === 'corner');
  const c2 = f2s.filter((f) => f.feature.type === 'corner');
  const dv = [];
  for (const a of c1) {
    for (const b of c2) {
      if (a.feature.convex !== b.feature.convex) continue; // convex never maps to concave
      const d = sub(repPoint(a.feature), repPoint(b.feature));
      dv.push({ d: dot(d, d), a, b });
    }
  }
  dv.sort((x, y) => x.d - y.d);
  let mapping;
  if (dv.length === 0) mapping = [[0, 0], [0.5, 0.5]];
  else if (dv.length === 1) {
    const a = dv[0].a.progress;
    const b = dv[0].b.progress;
    mapping = [[a, b], [(a + 0.5) % 1, (b + 0.5) % 1]];
  } else {
    mapping = [];
    const used1 = new Set();
    const used2 = new Set();
    for (const { a, b } of dv) {
      if (used1.has(a) || used2.has(b)) continue;
      let ins = mapping.findIndex((m) => m[0] > a.progress);
      if (ins < 0) ins = mapping.length;
      const n = mapping.length;
      if (n >= 1) {
        const [bf1, bf2] = mapping[(ins + n - 1) % n];
        const [af1, af2] = mapping[ins % n];
        if (
          progressDistance(a.progress, bf1) < EPS || progressDistance(a.progress, af1) < EPS ||
          progressDistance(b.progress, bf2) < EPS || progressDistance(b.progress, af2) < EPS
        ) continue;
        if (n > 1 && !progressInRange(b.progress, bf2, af2)) continue;
      }
      mapping.splice(ins, 0, [a.progress, b.progress]);
      used1.add(a);
      used2.add(b);
    }
  }
  const xs = mapping.map((m) => m[0]);
  const ys = mapping.map((m) => m[1]);
  return { map: (x) => linearMap(xs, ys, x), mapBack: (x) => linearMap(ys, xs, x) };
}

export class Morph {
  constructor(start, end) {
    this.start = start;
    this.end = end;
    this.match = Morph.match(start, end);
  }
  static match(p1, p2) {
    const m1 = MeasuredPolygon.measure(p1);
    const m2 = MeasuredPolygon.measure(p2);
    const mapper = featureMapper(m1.features, m2.features);
    const cut = mapper.map(0);
    const bs1 = m1.cubics;
    const bs2 = m2.cutAndShift(cut).cubics;
    const ret = [];
    let i1 = 0;
    let i2 = 0;
    let b1 = bs1[i1++];
    let b2 = bs2[i2++];
    while (b1 && b2) {
      const b1a = i1 === bs1.length ? 1 : b1.end;
      const b2a = i2 === bs2.length ? 1 : mapper.mapBack(posMod(b2.end + cut, 1));
      const minb = Math.min(b1a, b2a);
      let seg1;
      let seg2;
      if (b1a > minb + ANGLE_EPS) [seg1, b1] = b1.cutAtProgress(minb);
      else {
        seg1 = b1;
        b1 = bs1[i1++];
      }
      if (b2a > minb + ANGLE_EPS) [seg2, b2] = b2.cutAtProgress(posMod(mapper.map(minb) - cut, 1));
      else {
        seg2 = b2;
        b2 = bs2[i2++];
      }
      ret.push([seg1.cubic, seg2.cubic]);
    }
    if (b1 || b2) throw new Error("Expected both Polygon's Cubic to be fully matched");
    return ret;
  }
  /** Interpolated cubics at progress (0 = start, 1 = end; values outside [0,1] overshoot, like springs). */
  asCubics(progress) {
    const out = this.match.map(([a, b]) => a.map((v, i) => lerp(v, b[i], progress)));
    if (out.length) {
      const l = out[out.length - 1];
      l[6] = out[0][0];
      l[7] = out[0][1];
    }
    return out;
  }
  toSvgPath(progress, opts) {
    return cubicsToSvgPath(this.asCubics(progress), opts);
  }
}

// ---------- MaterialShapes (androidx.compose.material3.MaterialShapes) ----------
const r15 = rounding(0.15);
const r20 = rounding(0.2);
const r30 = rounding(0.3);
const r50 = rounding(0.5);
const r100 = rounding(1);
const P = (x, y, r = UNROUNDED) => ({ o: [x, y], r });
const R = (radius, smoothing = 0) => rounding(radius, smoothing);

function doRepeat(points, reps, center, mirroring) {
  const out = [];
  if (mirroring) {
    const ang = points.map((p) => (Math.atan2(p.o[1] - center[1], p.o[0] - center[0]) * 180) / Math.PI);
    const dist = points.map((p) => len(sub(p.o, center)));
    const actual = reps * 2;
    const section = 360 / actual;
    for (let it = 0; it < actual; it++) {
      for (let index = 0; index < points.length; index++) {
        const i = it % 2 === 0 ? index : points.length - 1 - index;
        if (i > 0 || it % 2 === 0) {
          const a = ((section * it + (it % 2 === 0 ? ang[i] : section - ang[i] + 2 * ang[0])) * Math.PI) / 180;
          out.push({ o: [Math.cos(a) * dist[i] + center[0], Math.sin(a) * dist[i] + center[1]], r: points[i].r });
        }
      }
    }
    return out;
  }
  const np = points.length;
  for (let it = 0; it < np * reps; it++) {
    const a = ((Math.floor(it / np) * 360) / reps) * (Math.PI / 180);
    const o = sub(points[it % np].o, center);
    out.push({
      o: [o[0] * Math.cos(a) - o[1] * Math.sin(a) + center[0], o[0] * Math.sin(a) + o[1] * Math.cos(a) + center[1]],
      r: points[it % np].r,
    });
  }
  return out;
}

function customPolygon(pnr, reps, { center = [0.5, 0.5], mirroring = false } = {}) {
  const pts = doRepeat(pnr, reps, center, mirroring);
  return polygonFromVertices(pts.flatMap((p) => p.o), UNROUNDED, pts.map((p) => p.r), center[0], center[1]);
}

/** Raw (un-normalized) builders; parameters copied verbatim from MaterialShapes.kt */
export const shapeBuilders = {
  circle: () => circle(10),
  square: () => rectangle({ width: 1, height: 1, rounding: r30 }),
  slanted: () => customPolygon([P(0.926, 0.97, R(0.189, 0.811)), P(-0.021, 0.967, R(0.187, 0.057))], 2),
  arch: () => regularPolygon(4, { perVertexRounding: [r100, r100, r20, r20] }).rotated(-135),
  fan: () =>
    customPolygon(
      [P(1.004, 1.0, R(0.148, 0.417)), P(0.0, 1.0, R(0.151)), P(0.0, -0.003, R(0.148)), P(0.978, 0.02, R(0.803))],
      1,
    ),
  arrow: () =>
    customPolygon(
      [P(0.5, 0.892, R(0.313)), P(-0.216, 1.05, R(0.207)), P(0.499, -0.16, R(0.215, 1.0)), P(1.225, 1.06, R(0.211))],
      1,
    ),
  semiCircle: () => rectangle({ width: 1.6, height: 1, perVertexRounding: [r20, r20, r100, r100] }),
  oval: () => circle().scaled(1, 0.64).rotated(-45),
  pill: () => customPolygon([P(0.961, 0.039, R(0.426)), P(1.001, 0.428), P(1.0, 0.609, R(1.0))], 2, { mirroring: true }),
  triangle: () => regularPolygon(3, { rounding: r20 }).rotated(-90),
  diamond: () => customPolygon([P(0.5, 1.096, R(0.151, 0.524)), P(0.04, 0.5, R(0.159))], 2),
  clamShell: () => customPolygon([P(0.171, 0.841, R(0.159)), P(-0.02, 0.5, R(0.14)), P(0.17, 0.159, R(0.159))], 2),
  pentagon: () =>
    customPolygon([P(0.5, -0.009, R(0.172)), P(1.03, 0.365, R(0.164)), P(0.828, 0.97, R(0.169))], 1, { mirroring: true }),
  gem: () =>
    customPolygon(
      [P(0.499, 1.023, R(0.241, 0.778)), P(-0.005, 0.792, R(0.208)), P(0.073, 0.258, R(0.228)), P(0.433, -0.0, R(0.491))],
      1,
      { mirroring: true },
    ),
  sunny: () => star(8, { innerRadius: 0.8, rounding: r15 }),
  verySunny: () => customPolygon([P(0.5, 1.08, R(0.085)), P(0.358, 0.843, R(0.085))], 8),
  cookie4Sided: () => customPolygon([P(1.237, 1.236, R(0.258)), P(0.5, 0.918, R(0.233))], 4),
  cookie6Sided: () => customPolygon([P(0.723, 0.884, R(0.394)), P(0.5, 1.099, R(0.398))], 6),
  cookie7Sided: () => star(7, { innerRadius: 0.75, rounding: r50 }).rotated(-90),
  cookie9Sided: () => star(9, { innerRadius: 0.8, rounding: r50 }).rotated(-90),
  cookie12Sided: () => star(12, { innerRadius: 0.8, rounding: r50 }).rotated(-90),
  ghostish: () =>
    customPolygon(
      [P(0.5, 0, R(1)), P(1, 0, R(1)), P(1, 1.14, R(0.254, 0.106)), P(0.575, 0.906, R(0.253))],
      1,
      { mirroring: true },
    ),
  clover4Leaf: () => customPolygon([P(0.5, 0.074), P(0.725, -0.099, R(0.476))], 4, { mirroring: true }),
  clover8Leaf: () => customPolygon([P(0.5, 0.036), P(0.758, -0.101, R(0.209))], 8),
  burst: () => customPolygon([P(0.5, -0.006, R(0.006)), P(0.592, 0.158, R(0.006))], 12),
  softBurst: () => customPolygon([P(0.193, 0.277, R(0.053)), P(0.176, 0.055, R(0.053))], 10),
  boom: () => customPolygon([P(0.457, 0.296, R(0.007)), P(0.5, -0.051, R(0.007))], 15),
  softBoom: () =>
    customPolygon(
      [P(0.733, 0.454), P(0.839, 0.437, R(0.532)), P(0.949, 0.449, R(0.439, 1)), P(0.998, 0.478, R(0.174))],
      16,
      { mirroring: true },
    ),
  flower: () =>
    customPolygon([P(0.37, 0.187), P(0.416, 0.049, R(0.381)), P(0.479, 0.001, R(0.095))], 8, { mirroring: true }),
  puffy: () =>
    customPolygon(
      [
        P(0.5, 0.053), P(0.545, -0.04, R(0.405)), P(0.67, -0.035, R(0.426)), P(0.717, 0.066, R(0.574)),
        P(0.722, 0.128), P(0.777, 0.002, R(0.36)), P(0.914, 0.149, R(0.66)), P(0.926, 0.289, R(0.66)),
        P(0.881, 0.346), P(0.94, 0.344, R(0.126)), P(1.003, 0.437, R(0.255)),
      ],
      2,
      { mirroring: true },
    ).scaled(1, 0.742),
  puffyDiamond: () =>
    customPolygon([P(0.87, 0.13, R(0.146)), P(0.818, 0.357), P(1.0, 0.332, R(0.853))], 4, { mirroring: true }),
  pixelCircle: () =>
    customPolygon(
      [
        P(0.5, 0.0), P(0.704, 0.0), P(0.704, 0.065), P(0.843, 0.065),
        P(0.843, 0.148), P(0.926, 0.148), P(0.926, 0.296), P(1.0, 0.296),
      ],
      2,
      { mirroring: true },
    ),
  pixelTriangle: () =>
    customPolygon(
      [
        P(0.11, 0.5), P(0.113, 0.0), P(0.287, 0.0), P(0.287, 0.087), P(0.421, 0.087), P(0.421, 0.17),
        P(0.56, 0.17), P(0.56, 0.265), P(0.674, 0.265), P(0.675, 0.344), P(0.789, 0.344), P(0.789, 0.439),
        P(0.888, 0.439),
      ],
      1,
      { mirroring: true },
    ),
  bun: () =>
    customPolygon([P(0.796, 0.5), P(0.853, 0.518, R(1)), P(0.992, 0.631, R(1)), P(0.968, 1.0, R(1))], 2, { mirroring: true }),
  heart: () =>
    customPolygon(
      [P(0.5, 0.268, R(0.016)), P(0.792, -0.066, R(0.958)), P(1.064, 0.276, R(1)), P(0.501, 0.946, R(0.129))],
      1,
      { mirroring: true },
    ),
};

const cache = new Map();
/** Normalized (unit-square) MaterialShapes polygon, e.g. materialShape('cookie9Sided'). */
export function materialShape(name) {
  if (!cache.has(name)) cache.set(name, shapeBuilders[name]().normalized());
  return cache.get(name);
}

/** LoadingIndicatorDefaults.IndeterminateIndicatorPolygons, in order. */
export const INDETERMINATE_LOADING_SHAPES = [
  'softBurst', 'cookie9Sided', 'pentagon', 'pill', 'sunny', 'cookie4Sided', 'oval',
];
```

---

## 8. Pre-generated SVG paths

- All 35 shapes come from the port above: normalized to a `0 0 100 100` viewBox, two decimals, starting at 3 o'clock, drawn clockwise in screen space.
- These are **exact** outputs of the ported algorithm, not hand traces.
- Use them with `<svg viewBox="0 0 100 100"><path d="…"/></svg>`, as `clip-path: path()` after scaling to element px, or in `mask-image` / CSS `shape()`.
- Shapes whose aspect ratio isn't 1:1 are centered in the box. Semicircle, Puffy, and Clamshell are shorter than they are wide; Arrow and Heart have small margins.

```js
// viewBox="0 0 100 100"; generated by materialShape(name) -> toSvgPath(p, { scale: 100, digits: 2 })
export const MATERIAL_SHAPE_PATHS = {
  circle:
    'M100 50C100 55.17 99.19 60.35 97.57 65.33C94.34 75.29 88.03 83.97 79.56 90.12C71.08 96.28 60.88 99.6 50.4 99.6C39.93 99.6 29.73 96.28 21.25 90.12C12.78 83.97 6.47 75.29 3.24 65.33C0 55.36 0 44.64 3.24 34.67C6.47 24.71 12.78 16.03 21.25 9.88C29.73 3.72 39.93 0.4 50.4 0.4C60.88 0.4 71.08 3.72 79.56 9.88C88.03 16.03 94.34 24.71 97.57 34.67C99.19 39.65 100 44.83 100 50Z',
  square:
    'M91.21 91.21C85.78 96.64 78.28 100 70 100C56.67 100 43.33 100 30 100C13.43 100 0 86.57 0 70C0 56.67 0 43.33 0 30C0 13.43 13.43 0 30 0C43.33 0 56.67 0 70 0C86.57 0 100 13.43 100 30C100 43.33 100 56.67 100 70C100 78.28 96.64 85.78 91.21 91.21Z',
  slanted:
    'M87.55 91.4C86.77 92.11 85.93 92.74 85.04 93.31C80.46 96.2 74.1 96.18 61.38 96.14C47.65 96.09 33.92 96.05 20.2 96.01C19.24 96 18.77 96 18.5 95.99C8.06 95.66 0 86.71 0.75 76.29C0.77 76.02 0.82 75.55 0.91 74.6C2.28 61.11 3.65 47.62 5.01 34.14C6.3 21.48 6.94 15.15 10.29 10.9C11.6 9.24 13.18 7.82 14.96 6.69C19.54 3.8 25.9 3.82 38.62 3.86C52.35 3.91 66.08 3.95 79.8 3.99C80.76 4 81.23 4 81.5 4.01C91.94 4.34 100 13.29 99.25 23.71C99.23 23.98 99.18 24.45 99.09 25.4C97.72 38.89 96.35 52.38 94.99 65.86C93.7 78.52 93.06 84.85 89.71 89.1C89.05 89.93 88.33 90.7 87.55 91.4Z',
  arch:
    'M14.64 14.64C23.69 5.6 36.19 0 50 0C77.61 0 100 22.39 100 50C100 61.95 100 73.91 100 85.86C100 93.67 93.67 100 85.86 100C61.95 100 38.05 100 14.14 100C6.33 100 0 93.67 0 85.86C0 73.91 0 61.95 0 50C0 36.19 5.6 23.69 14.64 14.64Z',
  fan:
    'M95.72 95.53C93.88 97.41 91.55 98.81 88.92 99.51C87.06 100 84.3 100 78.8 100C57.58 100 36.35 100 15.12 100C6.8 100 0.05 93.25 0.05 84.92C0.05 61.6 0.05 38.29 0.05 14.97C0.05 6.67 6.88 0 15.17 0.2C17.27 0.24 19.36 0.29 21.46 0.34C64.17 1.35 98.6 35.67 99.73 78.38C99.73 78.42 99.73 78.46 99.74 78.5C99.88 84 99.95 86.75 99.51 88.63C98.88 91.28 97.55 93.65 95.72 95.53Z',
  arrow:
    'M49.94 83.69C47.89 83.68 45.85 83.89 43.84 84.34C38.49 85.52 33.14 86.69 27.8 87.87C12.2 91.32 0 74.49 8.13 60.74C11.18 55.57 14.24 50.4 17.29 45.23C31.81 20.66 39.07 8.37 49.88 8.35C60.69 8.34 67.99 20.6 82.59 45.13C85.6 50.18 88.6 55.24 91.61 60.29C100 74.39 87.38 91.66 71.4 87.96C66.28 86.77 61.15 85.59 56.03 84.4C54.03 83.93 51.98 83.7 49.94 83.69Z',
  semiCircle:
    'M96.95 78.2C95.06 80.08 92.46 81.25 89.58 81.25C63.19 81.25 36.81 81.25 10.42 81.25C4.66 81.25 0 76.59 0 70.83C0 70.14 0 69.44 0 68.75C0 41.14 22.39 18.75 50 18.75C77.61 18.75 100 41.14 100 68.75C100 69.44 100 70.14 100 70.83C100 73.71 98.83 76.31 96.95 78.2Z',
  oval:
    'M90.85 9.15C94.25 12.55 96.61 16.99 97.74 22.27C100 32.82 97.14 45.86 89.78 58.52C82.43 71.18 71.18 82.43 58.52 89.78C45.86 97.14 32.82 100 22.27 97.74C11.72 95.48 4.52 88.28 2.26 77.73C0 67.18 2.86 54.14 10.22 41.48C17.57 28.82 28.82 17.57 41.48 10.22C54.14 2.86 67.18 0 77.73 2.26C83.01 3.39 87.45 5.75 90.85 9.15Z',
  pill:
    'M87.32 12.68C94.04 19.41 98.52 28.38 99.55 38.4C99.7 39.87 99.85 41.34 100 42.81C99.94 54.39 95.31 65.47 87.13 73.65C82.64 78.14 78.14 82.64 73.65 87.13C65.47 95.31 54.39 99.94 42.81 100C41.34 99.85 39.87 99.7 38.4 99.55C18.36 97.49 2.51 81.64 0.45 61.6C0.3 60.13 0.15 58.66 0 57.19C0.06 45.61 4.69 34.53 12.87 26.35C17.36 21.86 21.86 17.36 26.35 12.87C34.53 4.69 45.61 0.06 57.19 0C58.66 0.15 60.13 0.3 61.6 0.45C71.62 1.48 80.59 5.96 87.32 12.68Z',
  triangle:
    'M50 7.78C54.38 7.78 58.75 9.95 61.25 14.28C72.5 33.76 83.75 53.25 95 72.73C100 81.39 93.75 92.22 83.75 92.22C61.25 92.22 38.75 92.22 16.25 92.22C6.25 92.22 0 81.39 5 72.73C16.25 53.25 27.5 33.76 38.75 14.28C41.25 9.95 45.63 7.78 50 7.78Z',
  diamond:
    'M50 100C47.27 100 44.54 99.26 42.13 97.77C39.8 96.33 37.17 92.93 31.91 86.11C25.2 77.41 18.49 68.71 11.77 60.02C7.39 54.33 7.39 46.41 11.77 40.73C18.49 32.03 25.2 23.33 31.91 14.63C37.17 7.82 39.8 4.41 42.13 2.98C46.95 0 53.05 0 57.87 2.98C60.2 4.41 62.83 7.82 68.09 14.63C74.8 23.33 81.51 32.03 88.23 40.73C92.61 46.41 92.61 54.33 88.23 60.02C81.51 68.71 74.8 77.41 68.09 86.11C62.83 92.93 60.2 96.33 57.87 97.77C55.46 99.26 52.73 100 50 100Z',
  clamShell:
    'M18.73 81.56C16.36 80.18 14.35 78.17 12.96 75.68C9.43 69.37 5.89 63.06 2.35 56.75C0.01 52.55 0 47.44 2.34 43.24C5.85 36.94 9.36 30.65 12.87 24.35C15.64 19.37 20.9 16.28 26.6 16.28C42.18 16.28 57.75 16.28 73.32 16.28C79.01 16.28 84.26 19.35 87.04 24.32C90.57 30.63 94.11 36.94 97.65 43.25C99.99 47.45 100 52.56 97.66 56.76C94.15 63.06 90.64 69.35 87.13 75.65C84.36 80.63 79.1 83.72 73.4 83.72C57.82 83.72 42.25 83.72 26.68 83.72C23.83 83.72 21.1 82.95 18.73 81.56Z',
  pentagon:
    'M50 4.28C53.38 4.28 56.75 5.3 59.64 7.34C70.37 14.92 81.11 22.49 91.84 30.07C97.59 34.12 100 41.47 97.77 48.14C93.73 60.26 89.68 72.37 85.64 84.49C83.4 91.19 77.12 95.72 70.05 95.72C56.68 95.72 43.32 95.72 29.95 95.72C22.88 95.72 16.6 91.19 14.36 84.49C10.32 72.37 6.27 60.26 2.23 48.14C0 41.47 2.41 34.12 8.16 30.07C18.89 22.49 29.63 14.92 40.36 7.34C43.25 5.3 46.62 4.28 50 4.28Z',
  gem:
    'M49.95 100C49.14 100 48.33 99.95 47.52 99.87C43.56 99.46 39.76 97.72 32.16 94.24C26 91.42 19.84 88.59 13.68 85.77C5.27 81.91 0.42 72.98 1.75 63.83C3.14 54.36 4.52 44.89 5.9 35.42C6.8 29.28 10.15 23.78 15.19 20.17C22.73 14.76 30.27 9.36 37.81 3.96C41.4 1.38 45.72 0 50.14 0.01C54.56 0.02 58.87 1.41 62.45 4C69.97 9.44 77.49 14.87 85.01 20.3C90.04 23.93 93.37 29.45 94.24 35.59C95.59 45.06 96.93 54.54 98.28 64.02C99.58 73.17 94.69 82.09 86.27 85.91C80.1 88.71 73.93 91.51 67.75 94.31C60.14 97.76 56.34 99.49 52.38 99.88C51.57 99.96 50.76 100 49.95 100Z',
  sunny:
    'M99.69 50C99.69 51.79 99.07 53.59 97.83 55.04C95.3 58.01 92.77 60.98 90.24 63.95C89.18 65.19 88.54 66.74 88.41 68.37C88.1 72.26 87.79 76.15 87.48 80.04C87.18 83.84 84.15 86.87 80.35 87.17C76.46 87.48 72.57 87.79 68.68 88.1C67.05 88.23 65.5 88.87 64.26 89.93C61.29 92.46 58.32 94.99 55.35 97.52C52.45 100 48.17 100 45.27 97.52C42.3 94.99 39.33 92.46 36.36 89.93C35.11 88.87 33.57 88.23 31.94 88.1C28.05 87.79 24.16 87.48 20.27 87.17C16.46 86.87 13.44 83.84 13.14 80.04C12.83 76.15 12.52 72.26 12.21 68.37C12.08 66.74 11.44 65.19 10.38 63.95C7.85 60.98 5.32 58.01 2.79 55.04C0.31 52.14 0.31 47.86 2.79 44.96C5.32 41.99 7.85 39.02 10.38 36.05C11.44 34.81 12.08 33.26 12.21 31.63C12.52 27.74 12.83 23.85 13.14 19.96C13.44 16.16 16.46 13.13 20.27 12.83C24.16 12.52 28.05 12.21 31.94 11.9C33.57 11.77 35.11 11.13 36.36 10.07C39.33 7.54 42.3 5.01 45.27 2.48C48.17 0 52.45 0 55.35 2.48C58.32 5.01 61.29 7.54 64.26 10.07C65.5 11.13 67.05 11.77 68.68 11.9C72.57 12.21 76.46 12.52 80.35 12.83C84.15 13.13 87.18 16.16 87.48 19.96C87.79 23.85 88.1 27.74 88.41 31.63C88.54 33.26 89.18 34.81 90.24 36.05C92.77 39.02 95.3 41.99 97.83 44.96C99.07 46.41 99.69 48.21 99.69 50Z',
  verySunny:
    'M50 99.33C47.25 99.33 44.51 97.99 42.9 95.31C41.71 93.32 40.52 91.33 39.33 89.34C37.45 86.21 33.75 84.68 30.22 85.56C27.96 86.13 25.71 86.69 23.46 87.26C17.39 88.77 11.9 83.28 13.42 77.21C13.98 74.96 14.55 72.72 15.11 70.47C16 66.93 14.46 63.23 11.34 61.35C9.35 60.16 7.35 58.97 5.36 57.77C0 54.56 0 46.79 5.36 43.57C7.35 42.38 9.34 41.19 11.33 40C14.46 38.12 15.99 34.42 15.11 30.89C14.54 28.63 13.98 26.38 13.41 24.13C11.9 18.06 17.39 12.57 23.46 14.09C25.71 14.65 27.96 15.22 30.2 15.78C33.74 16.67 37.44 15.13 39.32 12.01C40.51 10.02 41.7 8.02 42.9 6.03C46.11 0.67 53.88 0.67 57.1 6.03C58.29 8.02 59.48 10.01 60.67 12C62.55 15.13 66.25 16.66 69.78 15.78C72.04 15.21 74.29 14.65 76.54 14.09C82.61 12.57 88.1 18.06 86.58 24.13C86.02 26.38 85.45 28.63 84.89 30.87C84 34.41 85.54 38.11 88.66 39.99C90.65 41.18 92.65 42.37 94.64 43.57C100 46.78 100 54.56 94.64 57.77C92.65 58.96 90.66 60.15 88.67 61.34C85.54 63.22 84.01 66.92 84.89 70.45C85.46 72.71 86.02 74.96 86.59 77.21C88.1 83.28 82.61 88.77 76.54 87.25C74.29 86.69 72.04 86.12 69.8 85.56C66.26 84.67 62.56 86.21 60.68 89.33C59.49 91.32 58.3 93.32 57.1 95.31C55.49 97.99 52.75 99.33 50 99.33Z',
  cookie4Sided:
    'M87.14 87.08C81.05 93.18 71.59 95.91 62.2 91.86C60.84 91.27 59.48 90.69 58.12 90.1C52.95 87.87 47.09 87.87 41.92 90.11C40.58 90.7 39.23 91.28 37.89 91.86C19.11 100 0.05 80.97 8.16 62.18C8.74 60.82 9.33 59.46 9.92 58.1C12.15 52.93 12.14 47.07 9.9 41.9C9.32 40.56 8.74 39.21 8.16 37.87C0.02 19.09 19.04 0.03 37.83 8.14C39.19 8.73 40.55 9.31 41.91 9.9C47.08 12.13 52.95 12.13 58.11 9.89C59.46 9.3 60.8 8.72 62.15 8.14C80.93 0 99.98 19.03 91.88 37.82C91.29 39.18 90.7 40.54 90.12 41.9C87.88 47.07 87.89 52.93 90.13 58.1C90.71 59.44 91.29 60.79 91.88 62.13C95.95 71.52 93.22 80.98 87.14 87.08Z',
  cookie6Sided:
    'M71.65 87.29C69.96 88.26 68.4 89.44 66.98 90.8C66.93 90.85 66.88 90.9 66.83 90.95C57.44 100 42.57 99.99 33.2 90.92C30.37 88.19 26.93 86.19 23.16 85.11C23.09 85.09 23.02 85.07 22.96 85.05C10.42 81.45 2.99 68.56 6.16 55.91C7.12 52.1 7.12 48.12 6.17 44.31C6.16 44.24 6.14 44.17 6.12 44.1C2.98 31.45 10.43 18.57 22.97 14.99C26.74 13.91 30.19 11.92 33.02 9.2C33.07 9.15 33.12 9.1 33.17 9.05C42.56 0 57.43 0.01 66.8 9.08C69.63 11.81 73.07 13.81 76.84 14.89C76.91 14.91 76.98 14.93 77.04 14.95C89.58 18.55 97.01 31.44 93.84 44.09C92.88 47.9 92.88 51.88 93.83 55.69C93.84 55.76 93.86 55.83 93.88 55.9C97.02 68.55 89.57 81.43 77.03 85.01C75.15 85.55 73.34 86.32 71.65 87.29Z',
  cookie7Sided:
    'M50 2.18C54.88 2.18 59.76 4.04 63.49 7.76C66.54 10.79 70.52 12.71 74.8 13.2C85.26 14.4 92.78 23.83 91.62 34.29C91.15 38.57 92.13 42.89 94.42 46.54C100 55.46 97.32 67.22 88.41 72.84C84.77 75.13 82.01 78.59 80.58 82.65C77.09 92.58 66.22 97.82 56.28 94.36C52.21 92.94 47.79 92.94 43.72 94.36C33.78 97.82 22.91 92.58 19.42 82.65C17.99 78.59 15.23 75.13 11.59 72.84C2.68 67.22 0 55.46 5.58 46.54C7.87 42.89 8.85 38.57 8.38 34.29C7.22 23.83 14.74 14.4 25.2 13.2C29.48 12.71 33.46 10.79 36.51 7.76C40.24 4.04 45.12 2.18 50 2.18Z',
  cookie9Sided:
    'M50 1.42C53.65 1.42 57.3 2.73 60.19 5.35C63.13 8.01 67 9.42 70.96 9.27C78.76 8.97 85.51 14.63 86.57 22.37C87.11 26.3 89.16 29.86 92.3 32.29C98.47 37.08 100 45.76 95.84 52.36C93.72 55.72 93.01 59.77 93.85 63.65C95.5 71.28 91.09 78.91 83.66 81.3C79.88 82.51 76.73 85.15 74.88 88.67C71.24 95.57 62.96 98.58 55.73 95.63C52.06 94.13 47.94 94.13 44.27 95.63C37.04 98.58 28.76 95.57 25.12 88.67C23.27 85.15 20.12 82.51 16.34 81.3C8.91 78.91 4.5 71.28 6.15 63.65C6.99 59.77 6.28 55.72 4.16 52.36C0 45.76 1.53 37.08 7.7 32.29C10.84 29.86 12.89 26.3 13.43 22.37C14.49 14.63 21.24 8.97 29.04 9.27C33 9.42 36.87 8.01 39.81 5.35C42.7 2.73 46.35 1.42 50 1.42Z',
  cookie12Sided:
    'M50 0.52C52.56 0.52 55.12 1.55 57 3.61C59.49 6.34 63.35 7.38 66.88 6.25C72.19 4.56 77.81 7.81 79 13.25C79.79 16.87 82.62 19.69 86.23 20.48C91.68 21.67 94.92 27.29 93.23 32.61C92.11 36.13 93.14 39.99 95.88 42.48C100 46.24 100 52.73 95.88 56.49C93.14 58.98 92.11 62.83 93.23 66.36C94.92 71.67 91.68 77.29 86.23 78.49C82.62 79.28 79.79 82.1 79 85.71C77.81 91.16 72.19 94.41 66.88 92.72C63.35 91.59 59.49 92.63 57 95.36C53.24 99.48 46.76 99.48 43 95.36C40.51 92.63 36.65 91.59 33.12 92.72C27.81 94.41 22.19 91.16 21 85.71C20.21 82.1 17.38 79.28 13.77 78.49C8.32 77.29 5.08 71.67 6.77 66.36C7.89 62.83 6.86 58.98 4.12 56.49C0 52.73 0 46.24 4.12 42.48C6.86 39.99 7.89 36.13 6.77 32.61C5.08 27.29 8.32 21.67 13.77 20.48C17.38 19.69 20.21 16.87 21 13.25C22.19 7.81 27.81 4.56 33.12 6.25C36.65 7.38 40.51 6.34 43 3.61C44.88 1.55 47.44 0.52 50 0.52Z',
  ghostish:
    'M50 0C76.32 0 97.66 21.34 97.66 47.66C97.66 57.11 97.66 66.56 97.66 76C97.66 90.69 81.91 100 69.05 92.92C66.86 91.71 64.67 90.5 62.47 89.3C58.98 87.37 55.06 86.37 51.07 86.37C50.36 86.37 49.64 86.37 48.93 86.37C44.94 86.37 41.02 87.37 37.53 89.3C35.33 90.5 33.14 91.71 30.95 92.92C18.09 100 2.34 90.69 2.34 76C2.34 66.56 2.34 57.11 2.34 47.66C2.34 21.34 23.68 0 50 0Z',
  clover4Leaf:
    'M50 9.81C50.48 9.44 50.97 9.07 51.45 8.7C62.76 0 78.77 1.04 88.87 11.13C98.96 21.23 100 37.24 91.3 48.55C90.93 49.03 90.56 49.52 90.19 50C90.56 50.48 90.93 50.97 91.3 51.45C100 62.76 98.96 78.77 88.87 88.87C78.77 98.96 62.76 100 51.45 91.3C50.97 90.93 50.48 90.56 50 90.19C49.52 90.56 49.03 90.93 48.55 91.3C37.24 100 21.23 98.96 11.13 88.87C1.04 78.77 0 62.76 8.7 51.45C9.07 50.97 9.44 50.48 9.81 50C9.44 49.52 9.07 49.03 8.7 48.55C0 37.24 1.04 21.23 11.13 11.13C21.23 1.04 37.24 0 48.55 8.7C49.03 9.07 49.52 9.44 50 9.81Z',
  clover8Leaf:
    'M50 7.13C50.73 6.74 51.45 6.36 52.18 5.97C63.22 0.11 76.83 6.12 79.94 18.22C80.06 18.71 80.19 19.2 80.31 19.69C81.1 19.93 81.89 20.17 82.67 20.41C94.62 24.07 100 37.94 93.64 48.7C93.38 49.13 93.13 49.57 92.87 50C93.26 50.73 93.64 51.45 94.03 52.18C99.89 63.22 93.88 76.83 81.78 79.94C81.29 80.06 80.8 80.19 80.31 80.31C80.07 81.1 79.83 81.89 79.59 82.67C75.93 94.62 62.06 100 51.3 93.64C50.87 93.38 50.43 93.13 50 92.87C49.27 93.26 48.55 93.64 47.82 94.03C36.78 99.89 23.17 93.88 20.06 81.78C19.94 81.29 19.81 80.8 19.69 80.31C18.9 80.07 18.11 79.83 17.33 79.59C5.38 75.93 0 62.06 6.36 51.3C6.62 50.87 6.87 50.43 7.13 50C6.74 49.27 6.36 48.55 5.97 47.82C0.11 36.78 6.12 23.17 18.22 20.06C18.71 19.94 19.2 19.81 19.69 19.69C19.93 18.9 20.17 18.11 20.41 17.33C24.07 5.38 37.94 0 48.7 6.36C49.13 6.62 49.57 6.87 50 7.13Z',
  burst:
    'M50 0.05C50.21 0.05 50.41 0.15 50.52 0.36C53.31 5.33 56.1 10.29 58.89 15.26C59.05 15.56 59.43 15.66 59.72 15.48C64.59 12.57 69.47 9.66 74.34 6.74C74.75 6.5 75.26 6.8 75.25 7.26C75.18 12.96 75.11 18.66 75.04 24.35C75.03 24.69 75.31 24.96 75.65 24.96C81.33 24.87 87.01 24.79 92.69 24.7C93.15 24.7 93.45 25.2 93.21 25.61C90.3 30.5 87.39 35.4 84.48 40.3C84.31 40.59 84.41 40.97 84.71 41.13C89.67 43.9 94.63 46.66 99.59 49.43C100 49.66 100 50.24 99.59 50.47C94.62 53.26 89.66 56.05 84.69 58.83C84.39 59 84.29 59.37 84.47 59.66C87.38 64.54 90.29 69.42 93.21 74.29C93.45 74.69 93.15 75.2 92.69 75.2C86.99 75.13 81.29 75.06 75.6 74.99C75.26 74.98 74.99 75.26 74.99 75.6C75.08 81.27 75.16 86.95 75.25 92.63C75.25 93.1 74.74 93.4 74.34 93.16C69.44 90.25 64.55 87.34 59.65 84.43C59.36 84.26 58.98 84.36 58.82 84.65C56.05 89.62 53.29 94.58 50.52 99.54C50.29 99.95 49.71 99.95 49.48 99.54C46.69 94.57 43.9 89.6 41.11 84.64C40.95 84.34 40.57 84.24 40.28 84.41C35.41 87.33 30.53 90.24 25.66 93.16C25.25 93.4 24.74 93.1 24.75 92.63C24.82 86.94 24.89 81.24 24.96 75.55C24.97 75.21 24.69 74.93 24.35 74.94C18.67 75.02 12.99 75.11 7.31 75.2C6.85 75.2 6.55 74.69 6.79 74.29C9.7 69.39 12.61 64.5 15.52 59.6C15.69 59.31 15.59 58.93 15.29 58.77C10.33 56 5.37 53.24 0.41 50.47C0 50.24 0 49.65 0.41 49.42C5.38 46.64 10.34 43.85 15.31 41.06C15.61 40.9 15.71 40.52 15.53 40.23C12.62 35.36 9.71 30.48 6.79 25.61C6.55 25.2 6.85 24.69 7.31 24.7C13.01 24.77 18.71 24.84 24.4 24.91C24.74 24.91 25.01 24.64 25.01 24.3C24.92 18.62 24.84 12.94 24.75 7.26C24.75 6.79 25.26 6.5 25.66 6.74C30.56 9.65 35.45 12.56 40.35 15.47C40.64 15.64 41.02 15.54 41.18 15.24C43.95 10.28 46.71 5.32 49.48 0.36C49.59 0.15 49.8 0.05 50 0.05Z',
  softBurst:
    'M18.66 27.24C19.36 26.28 19.73 25.07 19.63 23.81C19.4 20.81 19.17 17.82 18.94 14.83C18.65 10.99 22.5 8.18 26.07 9.63C28.87 10.77 31.66 11.91 34.46 13.04C36.81 14 39.5 13.12 40.83 10.96C42.4 8.4 43.98 5.85 45.55 3.29C47.57 0.01 52.34 0 54.37 3.27C55.96 5.84 57.56 8.4 59.15 10.97C60.49 13.12 63.18 13.99 65.53 13.02C68.3 11.88 71.08 10.74 73.86 9.6C77.42 8.13 81.28 10.92 81 14.76C80.78 17.78 80.56 20.79 80.35 23.8C80.16 26.33 81.83 28.62 84.3 29.21C87.21 29.92 90.13 30.63 93.05 31.33C96.79 32.24 98.27 36.77 95.79 39.72C93.84 42.02 91.9 44.33 89.95 46.64C88.32 48.58 88.32 51.41 89.96 53.34C91.91 55.63 93.85 57.92 95.8 60.2C98.29 63.14 96.83 67.67 93.09 68.6C90.16 69.32 87.23 70.04 84.3 70.76C81.84 71.37 80.17 73.67 80.37 76.19C80.6 79.19 80.83 82.18 81.06 85.17C81.35 89.01 77.5 91.82 73.93 90.37C71.13 89.23 68.34 88.09 65.54 86.96C63.19 86 60.5 86.88 59.17 89.04C57.6 91.6 56.02 94.15 54.45 96.71C52.43 99.99 47.66 100 45.63 96.73C44.04 94.16 42.44 91.6 40.85 89.03C39.51 86.88 36.82 86.01 34.47 86.98C31.7 88.12 28.92 89.26 26.14 90.4C22.58 91.87 18.72 89.08 19 85.24C19.22 82.22 19.44 79.21 19.65 76.2C19.84 73.67 18.17 71.38 15.7 70.79C12.79 70.08 9.87 69.37 6.95 68.67C3.21 67.76 1.73 63.23 4.21 60.28C6.16 57.98 8.1 55.67 10.05 53.36C11.68 51.42 11.68 48.59 10.04 46.66C8.09 44.37 6.15 42.08 4.2 39.8C1.71 36.86 3.17 32.33 6.91 31.4C9.84 30.68 12.77 29.96 15.7 29.24C16.93 28.93 17.96 28.21 18.66 27.24Z',
  boom:
    'M45.41 28.74C45.68 28.69 45.92 28.47 45.96 28.15C47.08 19.13 48.2 10.11 49.31 1.09C49.41 0.27 50.6 0.27 50.7 1.09C51.83 10.11 52.97 19.14 54.11 28.16C54.19 28.82 55.06 29 55.4 28.43C60.09 20.65 64.78 12.87 69.46 5.08C69.89 4.38 70.97 4.86 70.73 5.64C68.1 14.35 65.46 23.06 62.83 31.76C62.64 32.4 63.36 32.91 63.9 32.54C71.35 27.33 78.8 22.13 86.25 16.92C86.92 16.45 87.72 17.33 87.18 17.95C81.23 24.83 75.29 31.72 69.34 38.6C68.91 39.1 69.35 39.87 70 39.74C78.92 38.02 87.85 36.29 96.77 34.57C97.58 34.41 97.94 35.54 97.2 35.89C88.97 39.75 80.73 43.62 72.5 47.49C71.9 47.77 72 48.65 72.64 48.8C81.49 50.86 90.35 52.91 99.2 54.97C100 55.15 99.88 56.33 99.06 56.34C89.96 56.53 80.87 56.72 71.78 56.9C71.11 56.92 70.84 57.76 71.37 58.16C78.62 63.64 85.87 69.11 93.12 74.59C93.78 75.09 93.19 76.11 92.43 75.79C84.05 72.26 75.67 68.73 67.28 65.2C66.67 64.95 66.08 65.61 66.4 66.19C70.8 74.14 75.2 82.09 79.59 90.05C79.99 90.77 79.03 91.46 78.47 90.86C72.25 84.23 66.03 77.59 59.8 70.96C59.35 70.48 58.54 70.84 58.6 71.5C59.38 80.55 60.16 89.61 60.94 98.66C61.01 99.48 59.86 99.73 59.59 98.95C56.6 90.36 53.61 81.77 50.63 73.18C50.41 72.55 49.52 72.55 49.31 73.18C46.34 81.77 43.37 90.36 40.4 98.95C40.13 99.72 38.98 99.48 39.05 98.66C39.81 89.6 40.58 80.53 41.34 71.47C41.4 70.81 40.59 70.45 40.14 70.94C33.93 77.57 27.73 84.21 21.52 90.85C20.96 91.45 20 90.76 20.4 90.04C24.79 82.07 29.17 74.1 33.56 66.14C33.88 65.56 33.28 64.9 32.67 65.16C24.3 68.7 15.93 72.24 7.57 75.78C6.81 76.1 6.22 75.08 6.87 74.58C14.12 69.09 21.37 63.59 28.61 58.09C29.14 57.69 28.87 56.85 28.21 56.84C19.12 56.67 10.03 56.5 0.95 56.33C0.12 56.32 0 55.14 0.8 54.96C9.66 52.88 18.51 50.81 27.37 48.74C28.01 48.59 28.11 47.71 27.51 47.43C19.27 43.58 11.04 39.73 2.81 35.88C2.06 35.53 2.43 34.4 3.24 34.56C12.17 36.27 21.1 37.97 30.04 39.68C30.69 39.81 31.13 39.04 30.7 38.54C24.74 31.68 18.79 24.81 12.83 17.94C12.29 17.32 13.08 16.44 13.76 16.91C21.22 22.11 28.69 27.3 36.16 32.5C36.7 32.88 37.42 32.35 37.22 31.72C34.58 23.03 31.93 14.33 29.28 5.64C29.04 4.85 30.12 4.37 30.55 5.07C35.25 12.86 39.96 20.64 44.67 28.42C44.84 28.71 45.14 28.8 45.41 28.74Z',
  softBoom:
    'M73.39 45.38C75.37 45.06 77.34 44.75 79.32 44.43C82.45 43.93 85.63 43.85 88.79 44.19C89.96 44.32 91.13 44.45 92.31 44.58C94.14 44.78 95.9 45.36 97.48 46.3C97.67 46.41 97.85 46.52 98.04 46.63C99.25 47.35 100 48.66 100 50.07C100 51.48 99.25 52.79 98.03 53.51C97.84 53.62 97.66 53.73 97.47 53.83C95.89 54.77 94.12 55.35 92.29 55.54C91.12 55.67 89.94 55.79 88.77 55.92C85.62 56.25 82.43 56.16 79.3 55.65C77.33 55.33 75.35 55.01 73.38 54.69C75.33 55.15 77.27 55.61 79.22 56.07C82.3 56.81 85.28 57.95 88.06 59.48C89.09 60.05 90.13 60.61 91.16 61.18C92.77 62.06 94.18 63.28 95.29 64.75C95.41 64.93 95.54 65.1 95.67 65.27C96.52 66.4 96.71 67.89 96.16 69.2C95.62 70.5 94.43 71.43 93.03 71.62C92.82 71.65 92.61 71.68 92.39 71.71C90.57 71.96 88.71 71.83 86.95 71.31C85.82 70.97 84.69 70.64 83.56 70.3C80.51 69.41 77.6 68.11 74.91 66.44C73.21 65.38 71.51 64.33 69.81 63.28C71.43 64.45 73.05 65.62 74.67 66.79C77.24 68.65 79.55 70.85 81.53 73.32C82.27 74.24 83.01 75.16 83.75 76.08C84.9 77.51 85.73 79.18 86.19 80.96C86.25 81.17 86.3 81.38 86.35 81.59C86.7 82.95 86.3 84.41 85.3 85.4C84.3 86.4 82.85 86.8 81.48 86.44C81.27 86.39 81.07 86.33 80.86 86.28C79.08 85.82 77.41 84.98 75.98 83.82C75.07 83.08 74.15 82.34 73.23 81.6C70.76 79.61 68.57 77.29 66.72 74.72C65.55 73.09 64.39 71.47 63.22 69.85C64.27 71.55 65.32 73.25 66.36 74.96C68.03 77.66 69.32 80.57 70.21 83.61C70.54 84.75 70.87 85.88 71.2 87.01C71.72 88.78 71.85 90.63 71.59 92.45C71.56 92.67 71.53 92.88 71.5 93.09C71.3 94.49 70.37 95.68 69.07 96.22C67.76 96.76 66.27 96.57 65.14 95.72C64.97 95.59 64.8 95.46 64.62 95.33C63.16 94.22 61.94 92.81 61.06 91.19C60.5 90.16 59.93 89.12 59.37 88.08C57.85 85.3 56.72 82.32 55.99 79.23C55.53 77.29 55.08 75.34 54.62 73.39C54.94 75.37 55.25 77.34 55.57 79.32C56.07 82.45 56.15 85.63 55.81 88.79C55.68 89.96 55.55 91.13 55.42 92.31C55.22 94.14 54.64 95.9 53.7 97.48C53.59 97.67 53.48 97.85 53.37 98.04C52.65 99.25 51.34 100 49.93 100C48.52 100 47.21 99.25 46.49 98.03C46.38 97.84 46.27 97.66 46.17 97.47C45.23 95.89 44.65 94.12 44.46 92.29C44.33 91.12 44.21 89.94 44.08 88.77C43.75 85.62 43.84 82.43 44.35 79.3C44.67 77.33 44.99 75.35 45.31 73.38C44.85 75.33 44.39 77.27 43.93 79.22C43.19 82.3 42.05 85.28 40.52 88.06C39.95 89.09 39.39 90.13 38.82 91.16C37.94 92.77 36.72 94.18 35.25 95.29C35.07 95.41 34.9 95.54 34.73 95.67C33.6 96.52 32.11 96.71 30.8 96.16C29.5 95.62 28.57 94.43 28.38 93.03C28.35 92.82 28.32 92.61 28.29 92.39C28.04 90.57 28.17 88.71 28.69 86.95C29.03 85.82 29.36 84.69 29.7 83.56C30.59 80.51 31.89 77.6 33.56 74.91C34.62 73.21 35.67 71.51 36.72 69.81C35.55 71.43 34.38 73.05 33.21 74.67C31.35 77.24 29.15 79.55 26.68 81.53C25.76 82.27 24.84 83.01 23.92 83.75C22.49 84.9 20.82 85.73 19.04 86.19C18.83 86.25 18.62 86.3 18.41 86.35C17.05 86.7 15.59 86.3 14.6 85.3C13.6 84.3 13.2 82.85 13.56 81.48C13.61 81.27 13.67 81.07 13.72 80.86C14.18 79.08 15.02 77.41 16.18 75.98C16.92 75.07 17.66 74.15 18.4 73.23C20.39 70.76 22.71 68.57 25.28 66.72C26.91 65.55 28.53 64.39 30.15 63.22C28.45 64.27 26.75 65.32 25.04 66.36C22.34 68.03 19.43 69.32 16.39 70.21C15.25 70.54 14.12 70.87 12.99 71.2C11.22 71.72 9.37 71.85 7.55 71.59C7.33 71.56 7.12 71.53 6.91 71.5C5.51 71.3 4.32 70.37 3.78 69.07C3.24 67.76 3.43 66.27 4.28 65.14C4.41 64.97 4.54 64.8 4.67 64.62C5.78 63.16 7.19 61.94 8.81 61.06C9.84 60.5 10.88 59.93 11.92 59.37C14.7 57.85 17.68 56.72 20.77 55.99C22.71 55.53 24.66 55.08 26.61 54.62C24.63 54.94 22.66 55.25 20.68 55.57C17.55 56.07 14.37 56.15 11.21 55.81C10.04 55.68 8.87 55.55 7.69 55.42C5.86 55.22 4.1 54.64 2.52 53.7C2.33 53.59 2.15 53.48 1.96 53.37C0.75 52.65 0 51.34 0 49.93C0 48.52 0.75 47.21 1.97 46.49C2.16 46.38 2.34 46.27 2.53 46.17C4.11 45.23 5.88 44.65 7.71 44.46C8.88 44.33 10.06 44.21 11.23 44.08C14.38 43.75 17.57 43.84 20.7 44.35C22.67 44.67 24.65 44.99 26.62 45.31C24.67 44.85 22.73 44.39 20.78 43.93C17.7 43.19 14.72 42.05 11.94 40.52C10.91 39.95 9.87 39.39 8.84 38.82C7.23 37.94 5.82 36.72 4.71 35.25C4.59 35.07 4.46 34.9 4.33 34.73C3.48 33.6 3.29 32.11 3.84 30.8C4.38 29.5 5.57 28.57 6.97 28.38C7.18 28.35 7.39 28.32 7.61 28.29C9.43 28.04 11.29 28.17 13.05 28.69C14.18 29.03 15.31 29.36 16.44 29.7C19.49 30.59 22.4 31.89 25.09 33.56C26.79 34.62 28.49 35.67 30.19 36.72C28.57 35.55 26.95 34.38 25.33 33.21C22.76 31.35 20.45 29.15 18.47 26.68C17.73 25.76 16.99 24.84 16.25 23.92C15.1 22.49 14.27 20.82 13.81 19.04C13.75 18.83 13.7 18.62 13.65 18.41C13.3 17.05 13.7 15.59 14.7 14.6C15.7 13.6 17.15 13.2 18.52 13.56C18.73 13.61 18.93 13.67 19.14 13.72C20.92 14.18 22.59 15.02 24.02 16.18C24.93 16.92 25.85 17.66 26.77 18.4C29.24 20.39 31.43 22.71 33.28 25.28C34.45 26.91 35.61 28.53 36.78 30.15C35.73 28.45 34.68 26.75 33.64 25.04C31.97 22.34 30.68 19.43 29.79 16.39C29.46 15.25 29.13 14.12 28.8 12.99C28.28 11.22 28.15 9.37 28.41 7.55C28.44 7.33 28.47 7.12 28.5 6.91C28.7 5.51 29.63 4.32 30.93 3.78C32.24 3.24 33.73 3.43 34.86 4.28C35.03 4.41 35.2 4.54 35.38 4.67C36.84 5.78 38.06 7.19 38.94 8.81C39.5 9.84 40.07 10.88 40.63 11.92C42.15 14.7 43.28 17.68 44.01 20.77C44.47 22.71 44.92 24.66 45.38 26.61C45.06 24.63 44.75 22.66 44.43 20.68C43.93 17.55 43.85 14.37 44.19 11.21C44.32 10.04 44.45 8.87 44.58 7.69C44.78 5.86 45.36 4.1 46.3 2.52C46.41 2.33 46.52 2.15 46.63 1.96C47.35 0.75 48.66 0 50.07 0C51.48 0 52.79 0.75 53.51 1.97C53.62 2.16 53.73 2.34 53.83 2.53C54.77 4.11 55.35 5.88 55.54 7.71C55.67 8.88 55.79 10.06 55.92 11.23C56.25 14.38 56.16 17.57 55.65 20.7C55.33 22.67 55.01 24.65 54.69 26.62C55.15 24.67 55.61 22.73 56.07 20.78C56.81 17.7 57.95 14.72 59.48 11.94C60.05 10.91 60.61 9.87 61.18 8.84C62.06 7.23 63.28 5.82 64.75 4.71C64.93 4.59 65.1 4.46 65.27 4.33C66.4 3.48 67.89 3.29 69.2 3.84C70.5 4.38 71.43 5.57 71.62 6.97C71.65 7.18 71.68 7.39 71.71 7.61C71.96 9.43 71.83 11.29 71.31 13.05C70.97 14.18 70.64 15.31 70.3 16.44C69.41 19.49 68.11 22.4 66.44 25.09C65.38 26.79 64.33 28.49 63.28 30.19C64.45 28.57 65.62 26.95 66.79 25.33C68.65 22.76 70.85 20.45 73.32 18.47C74.24 17.73 75.16 16.99 76.08 16.25C77.51 15.1 79.18 14.27 80.96 13.81C81.17 13.75 81.38 13.7 81.59 13.65C82.95 13.3 84.41 13.7 85.4 14.7C86.4 15.7 86.8 17.15 86.44 18.52C86.39 18.73 86.33 18.93 86.28 19.14C85.82 20.92 84.98 22.59 83.82 24.02C83.08 24.93 82.34 25.85 81.6 26.77C79.61 29.24 77.29 31.43 74.72 33.28C73.09 34.45 71.47 35.61 69.85 36.78C71.55 35.73 73.25 34.68 74.96 33.64C77.66 31.97 80.57 30.68 83.61 29.79C84.75 29.46 85.88 29.13 87.01 28.8C88.78 28.28 90.63 28.15 92.45 28.41C92.67 28.44 92.88 28.47 93.09 28.5C94.49 28.7 95.68 29.63 96.22 30.93C96.76 32.24 96.57 33.73 95.72 34.86C95.59 35.03 95.46 35.2 95.33 35.38C94.22 36.84 92.81 38.06 91.19 38.94C90.16 39.5 89.12 40.07 88.08 40.63C85.3 42.15 82.32 43.28 79.23 44.01C77.29 44.47 75.34 44.92 73.39 45.38Z',
  flower:
    'M36.97 18.64C37.85 16 38.73 13.37 39.61 10.73C40.9 6.87 43.31 3.5 46.54 1.03C47.42 0.37 48.49 0 49.6 0C49.83 0 50.07 0 50.31 0C51.41 0 52.48 0.36 53.36 1.03C56.6 3.48 59.02 6.86 60.31 10.71C61.2 13.34 62.08 15.98 62.97 18.61C65.45 17.37 67.94 16.13 70.42 14.89C74.06 13.07 78.15 12.39 82.18 12.93C83.27 13.08 84.29 13.58 85.07 14.36C85.24 14.53 85.4 14.7 85.57 14.86C86.35 15.64 86.86 16.66 87.01 17.75C87.56 21.77 86.89 25.87 85.08 29.51C83.84 32 82.6 34.49 81.36 36.97C84 37.85 86.63 38.73 89.27 39.61C93.13 40.9 96.5 43.31 98.97 46.54C99.63 47.42 100 48.49 100 49.6C100 49.83 100 50.07 100 50.31C100 51.41 99.64 52.48 98.97 53.36C96.52 56.6 93.14 59.02 89.29 60.31C86.66 61.2 84.02 62.08 81.39 62.97C82.63 65.45 83.87 67.94 85.11 70.42C86.93 74.06 87.61 78.15 87.07 82.18C86.92 83.27 86.42 84.29 85.64 85.07C85.47 85.24 85.3 85.4 85.14 85.57C84.36 86.35 83.34 86.86 82.25 87.01C78.23 87.56 74.13 86.89 70.49 85.08C68 83.84 65.51 82.6 63.03 81.36C62.15 84 61.27 86.63 60.39 89.27C59.1 93.13 56.69 96.5 53.46 98.97C52.58 99.63 51.51 100 50.4 100C50.17 100 49.93 100 49.69 100C48.59 100 47.52 99.64 46.64 98.97C43.4 96.52 40.98 93.14 39.69 89.29C38.8 86.66 37.92 84.02 37.03 81.39C34.55 82.63 32.06 83.87 29.58 85.11C25.94 86.93 21.85 87.61 17.82 87.07C16.73 86.92 15.71 86.42 14.93 85.64C14.76 85.47 14.6 85.3 14.43 85.14C13.65 84.36 13.14 83.34 12.99 82.25C12.44 78.23 13.11 74.13 14.92 70.49C16.16 68 17.4 65.51 18.64 63.03C16 62.15 13.37 61.27 10.73 60.39C6.87 59.1 3.5 56.69 1.03 53.46C0.37 52.58 0 51.51 0 50.4C0 50.17 0 49.93 0 49.69C0 48.59 0.36 47.52 1.03 46.64C3.48 43.4 6.86 40.98 10.71 39.69C13.34 38.8 15.98 37.92 18.61 37.03C17.37 34.55 16.13 32.06 14.89 29.58C13.07 25.94 12.39 21.85 12.93 17.82C13.08 16.73 13.58 15.71 14.36 14.93C14.53 14.76 14.7 14.6 14.86 14.43C15.64 13.65 16.66 13.14 17.75 12.99C21.77 12.44 25.87 13.11 29.51 14.92C32 16.16 34.49 17.4 36.97 18.64Z',
  puffy:
    'M50 17.03C50.58 16.14 51.16 15.26 51.74 14.37C53.4 11.82 56.94 10.24 60.75 10.36C64.53 10.47 67.9 12.14 69.49 14.68C69.74 15.08 69.99 15.48 70.24 15.87C71.12 17.27 71.66 18.78 71.82 20.31C71.9 21.06 71.99 21.81 72.07 22.56C74.65 18.17 82.45 17.18 86.85 20.69C86.95 20.77 87.06 20.85 87.16 20.93C89.75 22.99 91.33 25.64 91.65 28.44C91.68 28.66 91.7 28.88 91.73 29.1C92.13 32.53 90.75 35.94 87.87 38.64C88.08 38.64 88.28 38.63 88.48 38.63C91.75 38.54 94.85 39.71 96.69 41.72C98.85 44.09 100 46.88 100 49.74C100 49.91 100 50.09 100 50.26C100 53.12 98.85 55.91 96.69 58.28C94.85 60.29 91.75 61.46 88.48 61.37C88.28 61.37 88.08 61.36 87.87 61.36C90.75 64.06 92.13 67.47 91.73 70.9C91.7 71.12 91.68 71.34 91.65 71.56C91.33 74.36 89.75 77.01 87.16 79.07C87.06 79.15 86.95 79.23 86.85 79.31C82.45 82.82 74.65 81.83 72.07 77.44C71.99 78.19 71.9 78.94 71.82 79.69C71.66 81.22 71.12 82.73 70.24 84.13C69.99 84.52 69.74 84.92 69.49 85.32C67.9 87.86 64.53 89.53 60.75 89.64C56.94 89.76 53.4 88.18 51.74 85.63C51.16 84.74 50.58 83.86 50 82.97C49.42 83.86 48.84 84.74 48.26 85.63C46.6 88.18 43.06 89.76 39.25 89.64C35.47 89.53 32.1 87.86 30.51 85.32C30.26 84.92 30.01 84.52 29.76 84.13C28.88 82.73 28.34 81.22 28.18 79.69C28.1 78.94 28.01 78.19 27.93 77.44C25.35 81.83 17.55 82.82 13.15 79.31C13.05 79.23 12.94 79.15 12.84 79.07C10.25 77.01 8.67 74.36 8.35 71.56C8.32 71.34 8.3 71.12 8.27 70.9C7.87 67.47 9.25 64.06 12.13 61.36C11.92 61.36 11.72 61.37 11.52 61.37C8.25 61.46 5.15 60.29 3.31 58.28C1.15 55.91 0 53.12 0 50.26C0 50.09 0 49.91 0 49.74C0 46.88 1.15 44.09 3.31 41.72C5.15 39.71 8.25 38.54 11.52 38.63C11.72 38.63 11.92 38.64 12.13 38.64C9.25 35.94 7.87 32.53 8.27 29.1C8.3 28.88 8.32 28.66 8.35 28.44C8.67 25.64 10.25 22.99 12.84 20.93C12.94 20.85 13.05 20.77 13.15 20.69C17.55 17.18 25.35 18.17 27.93 22.56C28.01 21.81 28.1 21.06 28.18 20.31C28.34 18.78 28.88 17.27 29.76 15.87C30.01 15.48 30.26 15.08 30.51 14.68C32.1 12.14 35.47 10.47 39.25 10.36C43.06 10.24 46.6 11.82 48.26 14.37C48.84 15.26 49.42 16.14 50 17.03Z',
  puffyDiamond:
    'M77.89 22.11C81.26 25.47 83 30.44 81.8 35.69C81.8 35.69 81.8 35.7 81.8 35.7C82.32 35.63 82.84 35.56 83.36 35.49C92.16 34.28 100 41.12 100 50C100 58.88 92.16 65.72 83.36 64.51C82.84 64.44 82.32 64.37 81.8 64.3C81.8 64.3 81.8 64.31 81.8 64.31C84.21 74.81 74.81 84.21 64.31 81.8C64.31 81.8 64.3 81.8 64.3 81.8C64.37 82.32 64.44 82.84 64.51 83.36C65.72 92.16 58.88 100 50 100C41.12 100 34.28 92.16 35.49 83.36C35.56 82.84 35.63 82.32 35.7 81.8C35.7 81.8 35.69 81.8 35.69 81.8C25.19 84.21 15.79 74.81 18.2 64.31C18.2 64.31 18.2 64.3 18.2 64.3C17.68 64.37 17.16 64.44 16.64 64.51C7.84 65.72 0 58.88 0 50C0 41.12 7.84 34.28 16.64 35.49C17.16 35.56 17.68 35.63 18.2 35.7C18.2 35.7 18.2 35.69 18.2 35.69C15.79 25.19 25.19 15.79 35.69 18.2C35.69 18.2 35.7 18.2 35.7 18.2C35.63 17.68 35.56 17.16 35.49 16.64C34.28 7.84 41.12 0 50 0C58.88 0 65.72 7.84 64.51 16.64C64.44 17.16 64.37 17.68 64.3 18.2C64.3 18.2 64.31 18.2 64.31 18.2C69.56 17 74.53 18.74 77.89 22.11Z',
  pixelCircle:
    'M50 0C56.8 0 63.6 0 70.4 0C70.4 2.17 70.4 4.33 70.4 6.5C75.03 6.5 79.67 6.5 84.3 6.5C84.3 9.27 84.3 12.03 84.3 14.8C87.07 14.8 89.83 14.8 92.6 14.8C92.6 19.73 92.6 24.67 92.6 29.6C95.07 29.6 97.53 29.6 100 29.6C100 43.2 100 56.8 100 70.4C97.53 70.4 95.07 70.4 92.6 70.4C92.6 75.33 92.6 80.27 92.6 85.2C89.83 85.2 87.07 85.2 84.3 85.2C84.3 87.97 84.3 90.73 84.3 93.5C79.67 93.5 75.03 93.5 70.4 93.5C70.4 95.67 70.4 97.83 70.4 100C63.6 100 56.8 100 50 100C43.2 100 36.4 100 29.6 100C29.6 97.83 29.6 95.67 29.6 93.5C24.97 93.5 20.33 93.5 15.7 93.5C15.7 90.73 15.7 87.97 15.7 85.2C12.93 85.2 10.17 85.2 7.4 85.2C7.4 80.27 7.4 75.33 7.4 70.4C4.93 70.4 2.47 70.4 0 70.4C0 56.8 0 43.2 0 29.6C2.47 29.6 4.93 29.6 7.4 29.6C7.4 24.67 7.4 19.73 7.4 14.8C10.17 14.8 12.93 14.8 15.7 14.8C15.7 12.03 15.7 9.27 15.7 6.5C20.33 6.5 24.97 6.5 29.6 6.5C29.6 4.33 29.6 2.17 29.6 0C36.4 0 43.2 0 50 0Z',
  pixelTriangle:
    'M11.1 50C11.2 33.33 11.3 16.67 11.4 0C17.2 0 23 0 28.8 0C28.8 2.9 28.8 5.8 28.8 8.7C33.27 8.7 37.73 8.7 42.2 8.7C42.2 11.47 42.2 14.23 42.2 17C46.83 17 51.47 17 56.1 17C56.1 20.17 56.1 23.33 56.1 26.5C59.9 26.5 63.7 26.5 67.5 26.5C67.53 29.13 67.57 31.77 67.6 34.4C71.4 34.4 75.2 34.4 79 34.4C79 37.57 79 40.73 79 43.9C82.3 43.9 85.6 43.9 88.9 43.9C88.9 47.97 88.9 52.03 88.9 56.1C85.6 56.1 82.3 56.1 79 56.1C79 59.27 79 62.43 79 65.6C75.2 65.6 71.4 65.6 67.6 65.6C67.57 68.23 67.53 70.87 67.5 73.5C63.7 73.5 59.9 73.5 56.1 73.5C56.1 76.67 56.1 79.83 56.1 83C51.47 83 46.83 83 42.2 83C42.2 85.77 42.2 88.53 42.2 91.3C37.73 91.3 33.27 91.3 28.8 91.3C28.8 94.2 28.8 97.1 28.8 100C23 100 17.2 100 11.4 100C11.3 83.33 11.2 66.67 11.1 50Z',
  bun:
    'M79.6 50C79.96 50.12 80.33 50.23 80.69 50.35C83.74 51.31 86.57 52.83 89.05 54.85C95.42 60.02 98.88 67.97 98.35 76.16C98.35 76.17 98.35 76.19 98.35 76.21C97.48 89.59 86.37 100 72.96 100C57.65 100 42.35 100 27.04 100C13.63 100 2.52 89.59 1.65 76.21C1.65 76.19 1.65 76.17 1.65 76.16C1.12 67.97 4.58 60.02 10.95 54.85C13.43 52.83 16.26 51.31 19.31 50.35C19.67 50.23 20.04 50.12 20.4 50C20.04 49.88 19.67 49.77 19.31 49.65C16.26 48.69 13.43 47.17 10.95 45.15C4.58 39.98 1.12 32.03 1.65 23.84C1.65 23.83 1.65 23.81 1.65 23.79C2.52 10.41 13.63 0 27.04 0C42.35 0 57.65 0 72.96 0C86.37 0 97.48 10.41 98.35 23.79C98.35 23.81 98.35 23.83 98.35 23.84C98.88 32.03 95.42 39.98 89.05 45.15C86.57 47.17 83.74 48.69 80.69 49.65C80.33 49.77 79.96 49.88 79.6 50Z',
  heart:
    'M50 28.59C50.16 28.59 50.33 28.53 50.44 28.39C54.29 23.99 58.15 19.58 62 15.18C70.46 5.49 85.63 5.85 93.63 15.91C100 23.92 99.85 35.3 93.27 43.13C78.9 60.23 64.53 77.33 50.16 94.43C50.12 94.48 50.06 94.51 50 94.51C49.94 94.51 49.88 94.48 49.84 94.43C35.47 77.33 21.1 60.23 6.73 43.13C0.15 35.3 0 23.92 6.37 15.91C14.37 5.85 29.54 5.49 38 15.18C41.85 19.58 45.71 23.99 49.56 28.39C49.67 28.53 49.84 28.59 50 28.59Z',
};
```

For CSS `clip-path` on arbitrary sizes, prefer an inline SVG `<clipPath clipPathUnits="objectBoundingBox">` with the path scaled to a `0..1` range. Get that path from `toSvgPath(p, { scale: 1, digits: 4 })`.

---

## 9. Tailwind 4 `@theme` recipe

Tailwind v4 rules that apply here [S31]:

- A `--text-*` theme variable creates a `text-*` font-size utility.
- `--text-*--line-height`, `--text-*--letter-spacing`, and `--text-*--font-weight` sub-variables set the defaults that come with that utility.
- There is **no font-family sub-variable**, so the brand/plain family needs a separate `font-*` utility or a custom `@utility`.
- `--radius-*` creates `rounded-*`. Tailwind's `rounded-full` is `calc(infinity * 1px)`.

> **Conflict in this repo:**
>
> - `src/routes/layout.css` (shadcn-svelte) already defines `--radius-sm … --radius-4xl` as multiples of `--radius`, and `--font-sans` / `--font-brand`.
> - Don't overwrite those. Namespace the M3 tokens as `m3-*` (for example `rounded-m3-xl`) so shadcn components keep working.
> - Alternatively, deliberately remap shadcn's names to M3 values.

### 9.1 Source-of-truth CSS custom properties

These use material-web naming (`--md-sys-…`), so a runtime theme can override them.

```css
:root {
  /* md.ref.typeface */
  --md-ref-typeface-brand: 'Roboto Flex Variable', 'Roboto Flex', Roboto, 'Noto Sans', system-ui, sans-serif;
  --md-ref-typeface-plain: 'Roboto Flex Variable', 'Roboto Flex', Roboto, 'Noto Sans', system-ui, sans-serif;
  --md-ref-typeface-weight-regular: 400;
  --md-ref-typeface-weight-medium: 500;
  --md-ref-typeface-weight-semibold: 600;
  --md-ref-typeface-weight-bold: 700;

  /* md.sys.typescale.* (baseline) */
  --md-sys-typescale-display-large-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-display-large-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-display-large-size: 3.5625rem; /* 57px */
  --md-sys-typescale-display-large-line-height: 4rem; /* 64px */
  --md-sys-typescale-display-large-tracking: -0.015625rem; /* -0.25px */
  --md-sys-typescale-display-medium-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-display-medium-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-display-medium-size: 2.8125rem; /* 45px */
  --md-sys-typescale-display-medium-line-height: 3.25rem; /* 52px */
  --md-sys-typescale-display-medium-tracking: 0; /* 0px */
  --md-sys-typescale-display-small-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-display-small-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-display-small-size: 2.25rem; /* 36px */
  --md-sys-typescale-display-small-line-height: 2.75rem; /* 44px */
  --md-sys-typescale-display-small-tracking: 0; /* 0px */
  --md-sys-typescale-headline-large-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-headline-large-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-headline-large-size: 2rem; /* 32px */
  --md-sys-typescale-headline-large-line-height: 2.5rem; /* 40px */
  --md-sys-typescale-headline-large-tracking: 0; /* 0px */
  --md-sys-typescale-headline-medium-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-headline-medium-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-headline-medium-size: 1.75rem; /* 28px */
  --md-sys-typescale-headline-medium-line-height: 2.25rem; /* 36px */
  --md-sys-typescale-headline-medium-tracking: 0; /* 0px */
  --md-sys-typescale-headline-small-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-headline-small-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-headline-small-size: 1.5rem; /* 24px */
  --md-sys-typescale-headline-small-line-height: 2rem; /* 32px */
  --md-sys-typescale-headline-small-tracking: 0; /* 0px */
  --md-sys-typescale-title-large-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-title-large-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-title-large-size: 1.375rem; /* 22px */
  --md-sys-typescale-title-large-line-height: 1.75rem; /* 28px */
  --md-sys-typescale-title-large-tracking: 0; /* 0px */
  --md-sys-typescale-title-medium-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-title-medium-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-title-medium-size: 1rem; /* 16px */
  --md-sys-typescale-title-medium-line-height: 1.5rem; /* 24px */
  --md-sys-typescale-title-medium-tracking: 0.009375rem; /* 0.15px */
  --md-sys-typescale-title-small-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-title-small-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-title-small-size: 0.875rem; /* 14px */
  --md-sys-typescale-title-small-line-height: 1.25rem; /* 20px */
  --md-sys-typescale-title-small-tracking: 0.00625rem; /* 0.1px */
  --md-sys-typescale-body-large-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-body-large-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-body-large-size: 1rem; /* 16px */
  --md-sys-typescale-body-large-line-height: 1.5rem; /* 24px */
  --md-sys-typescale-body-large-tracking: 0.03125rem; /* 0.5px */
  --md-sys-typescale-body-medium-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-body-medium-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-body-medium-size: 0.875rem; /* 14px */
  --md-sys-typescale-body-medium-line-height: 1.25rem; /* 20px */
  --md-sys-typescale-body-medium-tracking: 0.015625rem; /* 0.25px */
  --md-sys-typescale-body-small-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-body-small-weight: var(--md-ref-typeface-weight-regular); /* 400 */
  --md-sys-typescale-body-small-size: 0.75rem; /* 12px */
  --md-sys-typescale-body-small-line-height: 1rem; /* 16px */
  --md-sys-typescale-body-small-tracking: 0.025rem; /* 0.4px */
  --md-sys-typescale-label-large-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-label-large-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-label-large-size: 0.875rem; /* 14px */
  --md-sys-typescale-label-large-line-height: 1.25rem; /* 20px */
  --md-sys-typescale-label-large-tracking: 0.00625rem; /* 0.1px */
  --md-sys-typescale-label-medium-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-label-medium-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-label-medium-size: 0.75rem; /* 12px */
  --md-sys-typescale-label-medium-line-height: 1rem; /* 16px */
  --md-sys-typescale-label-medium-tracking: 0.03125rem; /* 0.5px */
  --md-sys-typescale-label-small-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-label-small-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-label-small-size: 0.6875rem; /* 11px */
  --md-sys-typescale-label-small-line-height: 1rem; /* 16px */
  --md-sys-typescale-label-small-tracking: 0.03125rem; /* 0.5px */

  /* md.sys.typescale.emphasized.* (M3 Expressive) */
  --md-sys-typescale-emphasized-display-large-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-emphasized-display-large-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-display-large-size: 3.5625rem; /* 57px */
  --md-sys-typescale-emphasized-display-large-line-height: 4rem; /* 64px */
  --md-sys-typescale-emphasized-display-large-tracking: -0.015625rem; /* -0.25px */
  --md-sys-typescale-emphasized-display-medium-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-emphasized-display-medium-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-display-medium-size: 2.8125rem; /* 45px */
  --md-sys-typescale-emphasized-display-medium-line-height: 3.25rem; /* 52px */
  --md-sys-typescale-emphasized-display-medium-tracking: 0; /* 0px */
  --md-sys-typescale-emphasized-display-small-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-emphasized-display-small-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-display-small-size: 2.25rem; /* 36px */
  --md-sys-typescale-emphasized-display-small-line-height: 2.75rem; /* 44px */
  --md-sys-typescale-emphasized-display-small-tracking: 0; /* 0px */
  --md-sys-typescale-emphasized-headline-large-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-emphasized-headline-large-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-headline-large-size: 2rem; /* 32px */
  --md-sys-typescale-emphasized-headline-large-line-height: 2.5rem; /* 40px */
  --md-sys-typescale-emphasized-headline-large-tracking: 0; /* 0px */
  --md-sys-typescale-emphasized-headline-medium-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-emphasized-headline-medium-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-headline-medium-size: 1.75rem; /* 28px */
  --md-sys-typescale-emphasized-headline-medium-line-height: 2.25rem; /* 36px */
  --md-sys-typescale-emphasized-headline-medium-tracking: 0; /* 0px */
  --md-sys-typescale-emphasized-headline-small-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-emphasized-headline-small-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-headline-small-size: 1.5rem; /* 24px */
  --md-sys-typescale-emphasized-headline-small-line-height: 2rem; /* 32px */
  --md-sys-typescale-emphasized-headline-small-tracking: 0; /* 0px */
  --md-sys-typescale-emphasized-title-large-font: var(--md-ref-typeface-brand);
  --md-sys-typescale-emphasized-title-large-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-title-large-size: 1.375rem; /* 22px */
  --md-sys-typescale-emphasized-title-large-line-height: 1.75rem; /* 28px */
  --md-sys-typescale-emphasized-title-large-tracking: 0; /* 0px */
  --md-sys-typescale-emphasized-title-medium-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-title-medium-weight: var(--md-ref-typeface-weight-bold); /* 700 */
  --md-sys-typescale-emphasized-title-medium-size: 1rem; /* 16px */
  --md-sys-typescale-emphasized-title-medium-line-height: 1.5rem; /* 24px */
  --md-sys-typescale-emphasized-title-medium-tracking: 0.009375rem; /* 0.15px */
  --md-sys-typescale-emphasized-title-small-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-title-small-weight: var(--md-ref-typeface-weight-bold); /* 700 */
  --md-sys-typescale-emphasized-title-small-size: 0.875rem; /* 14px */
  --md-sys-typescale-emphasized-title-small-line-height: 1.25rem; /* 20px */
  --md-sys-typescale-emphasized-title-small-tracking: 0.00625rem; /* 0.1px */
  --md-sys-typescale-emphasized-body-large-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-body-large-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-body-large-size: 1rem; /* 16px */
  --md-sys-typescale-emphasized-body-large-line-height: 1.5rem; /* 24px */
  --md-sys-typescale-emphasized-body-large-tracking: 0.03125rem; /* 0.5px */
  --md-sys-typescale-emphasized-body-medium-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-body-medium-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-body-medium-size: 0.875rem; /* 14px */
  --md-sys-typescale-emphasized-body-medium-line-height: 1.25rem; /* 20px */
  --md-sys-typescale-emphasized-body-medium-tracking: 0.015625rem; /* 0.25px */
  --md-sys-typescale-emphasized-body-small-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-body-small-weight: var(--md-ref-typeface-weight-medium); /* 500 */
  --md-sys-typescale-emphasized-body-small-size: 0.75rem; /* 12px */
  --md-sys-typescale-emphasized-body-small-line-height: 1rem; /* 16px */
  --md-sys-typescale-emphasized-body-small-tracking: 0.025rem; /* 0.4px */
  --md-sys-typescale-emphasized-label-large-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-label-large-weight: var(--md-ref-typeface-weight-bold); /* 700 */
  --md-sys-typescale-emphasized-label-large-size: 0.875rem; /* 14px */
  --md-sys-typescale-emphasized-label-large-line-height: 1.25rem; /* 20px */
  --md-sys-typescale-emphasized-label-large-tracking: 0.00625rem; /* 0.1px */
  --md-sys-typescale-emphasized-label-medium-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-label-medium-weight: var(--md-ref-typeface-weight-bold); /* 700 */
  --md-sys-typescale-emphasized-label-medium-size: 0.75rem; /* 12px */
  --md-sys-typescale-emphasized-label-medium-line-height: 1rem; /* 16px */
  --md-sys-typescale-emphasized-label-medium-tracking: 0.03125rem; /* 0.5px */
  --md-sys-typescale-emphasized-label-small-font: var(--md-ref-typeface-plain);
  --md-sys-typescale-emphasized-label-small-weight: var(--md-ref-typeface-weight-bold); /* 700 */
  --md-sys-typescale-emphasized-label-small-size: 0.6875rem; /* 11px */
  --md-sys-typescale-emphasized-label-small-line-height: 1rem; /* 16px */
  --md-sys-typescale-emphasized-label-small-tracking: 0.03125rem; /* 0.5px */
}

:root {
  /* md.sys.shape.corner.* (M3 Expressive scale) */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-large-increased: 20px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-extra-large-increased: 32px;
  --md-sys-shape-corner-extra-extra-large: 48px;
  --md-sys-shape-corner-full: calc(infinity * 1px); /* or 9999px; use height/2 when animating */
}
```

To switch to Google Sans Flex for Expressive brand moments:

```css
:root {
  --md-ref-typeface-brand: 'Google Sans Flex Variable', 'Roboto Flex Variable', Roboto, 'Noto Sans', sans-serif;
}
```

### 9.2 `@theme inline`: utilities that reference the variables

- `@theme inline` makes the generated utilities reference the variables, so runtime overrides work.
- The `text-*` names are short forms such as `display-lg`.

```css
@theme inline {
  --font-m3-brand: var(--md-ref-typeface-brand);
  --font-m3-plain: var(--md-ref-typeface-plain);

  --text-display-lg: var(--md-sys-typescale-display-large-size);
  --text-display-lg--line-height: var(--md-sys-typescale-display-large-line-height);
  --text-display-lg--letter-spacing: var(--md-sys-typescale-display-large-tracking);
  --text-display-lg--font-weight: var(--md-sys-typescale-display-large-weight);
  --text-display-md: var(--md-sys-typescale-display-medium-size);
  --text-display-md--line-height: var(--md-sys-typescale-display-medium-line-height);
  --text-display-md--letter-spacing: var(--md-sys-typescale-display-medium-tracking);
  --text-display-md--font-weight: var(--md-sys-typescale-display-medium-weight);
  --text-display-sm: var(--md-sys-typescale-display-small-size);
  --text-display-sm--line-height: var(--md-sys-typescale-display-small-line-height);
  --text-display-sm--letter-spacing: var(--md-sys-typescale-display-small-tracking);
  --text-display-sm--font-weight: var(--md-sys-typescale-display-small-weight);
  --text-headline-lg: var(--md-sys-typescale-headline-large-size);
  --text-headline-lg--line-height: var(--md-sys-typescale-headline-large-line-height);
  --text-headline-lg--letter-spacing: var(--md-sys-typescale-headline-large-tracking);
  --text-headline-lg--font-weight: var(--md-sys-typescale-headline-large-weight);
  --text-headline-md: var(--md-sys-typescale-headline-medium-size);
  --text-headline-md--line-height: var(--md-sys-typescale-headline-medium-line-height);
  --text-headline-md--letter-spacing: var(--md-sys-typescale-headline-medium-tracking);
  --text-headline-md--font-weight: var(--md-sys-typescale-headline-medium-weight);
  --text-headline-sm: var(--md-sys-typescale-headline-small-size);
  --text-headline-sm--line-height: var(--md-sys-typescale-headline-small-line-height);
  --text-headline-sm--letter-spacing: var(--md-sys-typescale-headline-small-tracking);
  --text-headline-sm--font-weight: var(--md-sys-typescale-headline-small-weight);
  --text-title-lg: var(--md-sys-typescale-title-large-size);
  --text-title-lg--line-height: var(--md-sys-typescale-title-large-line-height);
  --text-title-lg--letter-spacing: var(--md-sys-typescale-title-large-tracking);
  --text-title-lg--font-weight: var(--md-sys-typescale-title-large-weight);
  --text-title-md: var(--md-sys-typescale-title-medium-size);
  --text-title-md--line-height: var(--md-sys-typescale-title-medium-line-height);
  --text-title-md--letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  --text-title-md--font-weight: var(--md-sys-typescale-title-medium-weight);
  --text-title-sm: var(--md-sys-typescale-title-small-size);
  --text-title-sm--line-height: var(--md-sys-typescale-title-small-line-height);
  --text-title-sm--letter-spacing: var(--md-sys-typescale-title-small-tracking);
  --text-title-sm--font-weight: var(--md-sys-typescale-title-small-weight);
  --text-body-lg: var(--md-sys-typescale-body-large-size);
  --text-body-lg--line-height: var(--md-sys-typescale-body-large-line-height);
  --text-body-lg--letter-spacing: var(--md-sys-typescale-body-large-tracking);
  --text-body-lg--font-weight: var(--md-sys-typescale-body-large-weight);
  --text-body-md: var(--md-sys-typescale-body-medium-size);
  --text-body-md--line-height: var(--md-sys-typescale-body-medium-line-height);
  --text-body-md--letter-spacing: var(--md-sys-typescale-body-medium-tracking);
  --text-body-md--font-weight: var(--md-sys-typescale-body-medium-weight);
  --text-body-sm: var(--md-sys-typescale-body-small-size);
  --text-body-sm--line-height: var(--md-sys-typescale-body-small-line-height);
  --text-body-sm--letter-spacing: var(--md-sys-typescale-body-small-tracking);
  --text-body-sm--font-weight: var(--md-sys-typescale-body-small-weight);
  --text-label-lg: var(--md-sys-typescale-label-large-size);
  --text-label-lg--line-height: var(--md-sys-typescale-label-large-line-height);
  --text-label-lg--letter-spacing: var(--md-sys-typescale-label-large-tracking);
  --text-label-lg--font-weight: var(--md-sys-typescale-label-large-weight);
  --text-label-md: var(--md-sys-typescale-label-medium-size);
  --text-label-md--line-height: var(--md-sys-typescale-label-medium-line-height);
  --text-label-md--letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  --text-label-md--font-weight: var(--md-sys-typescale-label-medium-weight);
  --text-label-sm: var(--md-sys-typescale-label-small-size);
  --text-label-sm--line-height: var(--md-sys-typescale-label-small-line-height);
  --text-label-sm--letter-spacing: var(--md-sys-typescale-label-small-tracking);
  --text-label-sm--font-weight: var(--md-sys-typescale-label-small-weight);

  --text-display-lg-emphasized: var(--md-sys-typescale-emphasized-display-large-size);
  --text-display-lg-emphasized--line-height: var(--md-sys-typescale-emphasized-display-large-line-height);
  --text-display-lg-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-display-large-tracking);
  --text-display-lg-emphasized--font-weight: var(--md-sys-typescale-emphasized-display-large-weight);
  --text-display-md-emphasized: var(--md-sys-typescale-emphasized-display-medium-size);
  --text-display-md-emphasized--line-height: var(--md-sys-typescale-emphasized-display-medium-line-height);
  --text-display-md-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-display-medium-tracking);
  --text-display-md-emphasized--font-weight: var(--md-sys-typescale-emphasized-display-medium-weight);
  --text-display-sm-emphasized: var(--md-sys-typescale-emphasized-display-small-size);
  --text-display-sm-emphasized--line-height: var(--md-sys-typescale-emphasized-display-small-line-height);
  --text-display-sm-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-display-small-tracking);
  --text-display-sm-emphasized--font-weight: var(--md-sys-typescale-emphasized-display-small-weight);
  --text-headline-lg-emphasized: var(--md-sys-typescale-emphasized-headline-large-size);
  --text-headline-lg-emphasized--line-height: var(--md-sys-typescale-emphasized-headline-large-line-height);
  --text-headline-lg-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-headline-large-tracking);
  --text-headline-lg-emphasized--font-weight: var(--md-sys-typescale-emphasized-headline-large-weight);
  --text-headline-md-emphasized: var(--md-sys-typescale-emphasized-headline-medium-size);
  --text-headline-md-emphasized--line-height: var(--md-sys-typescale-emphasized-headline-medium-line-height);
  --text-headline-md-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-headline-medium-tracking);
  --text-headline-md-emphasized--font-weight: var(--md-sys-typescale-emphasized-headline-medium-weight);
  --text-headline-sm-emphasized: var(--md-sys-typescale-emphasized-headline-small-size);
  --text-headline-sm-emphasized--line-height: var(--md-sys-typescale-emphasized-headline-small-line-height);
  --text-headline-sm-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-headline-small-tracking);
  --text-headline-sm-emphasized--font-weight: var(--md-sys-typescale-emphasized-headline-small-weight);
  --text-title-lg-emphasized: var(--md-sys-typescale-emphasized-title-large-size);
  --text-title-lg-emphasized--line-height: var(--md-sys-typescale-emphasized-title-large-line-height);
  --text-title-lg-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-title-large-tracking);
  --text-title-lg-emphasized--font-weight: var(--md-sys-typescale-emphasized-title-large-weight);
  --text-title-md-emphasized: var(--md-sys-typescale-emphasized-title-medium-size);
  --text-title-md-emphasized--line-height: var(--md-sys-typescale-emphasized-title-medium-line-height);
  --text-title-md-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-title-medium-tracking);
  --text-title-md-emphasized--font-weight: var(--md-sys-typescale-emphasized-title-medium-weight);
  --text-title-sm-emphasized: var(--md-sys-typescale-emphasized-title-small-size);
  --text-title-sm-emphasized--line-height: var(--md-sys-typescale-emphasized-title-small-line-height);
  --text-title-sm-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-title-small-tracking);
  --text-title-sm-emphasized--font-weight: var(--md-sys-typescale-emphasized-title-small-weight);
  --text-body-lg-emphasized: var(--md-sys-typescale-emphasized-body-large-size);
  --text-body-lg-emphasized--line-height: var(--md-sys-typescale-emphasized-body-large-line-height);
  --text-body-lg-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-body-large-tracking);
  --text-body-lg-emphasized--font-weight: var(--md-sys-typescale-emphasized-body-large-weight);
  --text-body-md-emphasized: var(--md-sys-typescale-emphasized-body-medium-size);
  --text-body-md-emphasized--line-height: var(--md-sys-typescale-emphasized-body-medium-line-height);
  --text-body-md-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-body-medium-tracking);
  --text-body-md-emphasized--font-weight: var(--md-sys-typescale-emphasized-body-medium-weight);
  --text-body-sm-emphasized: var(--md-sys-typescale-emphasized-body-small-size);
  --text-body-sm-emphasized--line-height: var(--md-sys-typescale-emphasized-body-small-line-height);
  --text-body-sm-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-body-small-tracking);
  --text-body-sm-emphasized--font-weight: var(--md-sys-typescale-emphasized-body-small-weight);
  --text-label-lg-emphasized: var(--md-sys-typescale-emphasized-label-large-size);
  --text-label-lg-emphasized--line-height: var(--md-sys-typescale-emphasized-label-large-line-height);
  --text-label-lg-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-label-large-tracking);
  --text-label-lg-emphasized--font-weight: var(--md-sys-typescale-emphasized-label-large-weight);
  --text-label-md-emphasized: var(--md-sys-typescale-emphasized-label-medium-size);
  --text-label-md-emphasized--line-height: var(--md-sys-typescale-emphasized-label-medium-line-height);
  --text-label-md-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-label-medium-tracking);
  --text-label-md-emphasized--font-weight: var(--md-sys-typescale-emphasized-label-medium-weight);
  --text-label-sm-emphasized: var(--md-sys-typescale-emphasized-label-small-size);
  --text-label-sm-emphasized--line-height: var(--md-sys-typescale-emphasized-label-small-line-height);
  --text-label-sm-emphasized--letter-spacing: var(--md-sys-typescale-emphasized-label-small-tracking);
  --text-label-sm-emphasized--font-weight: var(--md-sys-typescale-emphasized-label-small-weight);
}

@theme inline {
  --radius-m3-none: var(--md-sys-shape-corner-none);
  --radius-m3-xs: var(--md-sys-shape-corner-extra-small);
  --radius-m3-sm: var(--md-sys-shape-corner-small);
  --radius-m3-md: var(--md-sys-shape-corner-medium);
  --radius-m3-lg: var(--md-sys-shape-corner-large);
  --radius-m3-lg-increased: var(--md-sys-shape-corner-large-increased);
  --radius-m3-xl: var(--md-sys-shape-corner-extra-large);
  --radius-m3-xl-increased: var(--md-sys-shape-corner-extra-large-increased);
  --radius-m3-2xl: var(--md-sys-shape-corner-extra-extra-large);
  --radius-m3-full: var(--md-sys-shape-corner-full);
}
```

Resulting classes:

- `text-display-lg`, `text-label-md-emphasized`, and so on: size, line height, tracking, and weight. Add `font-m3-brand` or `font-m3-plain` for the family.
- `rounded-m3-xs` … `rounded-m3-2xl`, `rounded-m3-full`.
- Side variants for the asymmetric tokens:
  - `rounded-t-m3-xl` = `extra-large.top`
  - `rounded-s-m3-lg` = `large.start`
  - `rounded-e-m3-lg` = `large.end`
  - `rounded-t-m3-xs` = `extra-small.top`

If you'd rather use literal values (no runtime theming), use the plain `@theme` form the task suggested:

```css
@theme {
  --text-display-lg: 3.5625rem;              /* 57px */
  --text-display-lg--line-height: 4rem;      /* 64px */
  --text-display-lg--letter-spacing: -0.015625rem; /* -0.25px */
  --text-display-lg--font-weight: 400;
  --radius-m3-xl: 28px;
  /* …repeat per row of tables 1.2, 1.3 and 3.1 */
}
```

### 9.3 Full type-style utilities (family included)

- A single class applies the complete M3 style, including the brand/plain family that `--text-*` cannot set.
- Emphasized variants on variable fonts: if you load the 1P look (Google Sans Flex), add `font-variation-settings: 'ROND' 100` to the `-emphasized` utilities. For the variable set, use weight 600 instead of 700 on title-m/s and labels (section 1.4).

```css
@utility type-display-lg {
  font-family: var(--md-sys-typescale-display-large-font);
  font-size: var(--md-sys-typescale-display-large-size);
  line-height: var(--md-sys-typescale-display-large-line-height);
  letter-spacing: var(--md-sys-typescale-display-large-tracking);
  font-weight: var(--md-sys-typescale-display-large-weight);
}
@utility type-display-md {
  font-family: var(--md-sys-typescale-display-medium-font);
  font-size: var(--md-sys-typescale-display-medium-size);
  line-height: var(--md-sys-typescale-display-medium-line-height);
  letter-spacing: var(--md-sys-typescale-display-medium-tracking);
  font-weight: var(--md-sys-typescale-display-medium-weight);
}
@utility type-display-sm {
  font-family: var(--md-sys-typescale-display-small-font);
  font-size: var(--md-sys-typescale-display-small-size);
  line-height: var(--md-sys-typescale-display-small-line-height);
  letter-spacing: var(--md-sys-typescale-display-small-tracking);
  font-weight: var(--md-sys-typescale-display-small-weight);
}
@utility type-headline-lg {
  font-family: var(--md-sys-typescale-headline-large-font);
  font-size: var(--md-sys-typescale-headline-large-size);
  line-height: var(--md-sys-typescale-headline-large-line-height);
  letter-spacing: var(--md-sys-typescale-headline-large-tracking);
  font-weight: var(--md-sys-typescale-headline-large-weight);
}
@utility type-headline-md {
  font-family: var(--md-sys-typescale-headline-medium-font);
  font-size: var(--md-sys-typescale-headline-medium-size);
  line-height: var(--md-sys-typescale-headline-medium-line-height);
  letter-spacing: var(--md-sys-typescale-headline-medium-tracking);
  font-weight: var(--md-sys-typescale-headline-medium-weight);
}
@utility type-headline-sm {
  font-family: var(--md-sys-typescale-headline-small-font);
  font-size: var(--md-sys-typescale-headline-small-size);
  line-height: var(--md-sys-typescale-headline-small-line-height);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking);
  font-weight: var(--md-sys-typescale-headline-small-weight);
}
@utility type-title-lg {
  font-family: var(--md-sys-typescale-title-large-font);
  font-size: var(--md-sys-typescale-title-large-size);
  line-height: var(--md-sys-typescale-title-large-line-height);
  letter-spacing: var(--md-sys-typescale-title-large-tracking);
  font-weight: var(--md-sys-typescale-title-large-weight);
}
@utility type-title-md {
  font-family: var(--md-sys-typescale-title-medium-font);
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  letter-spacing: var(--md-sys-typescale-title-medium-tracking);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}
@utility type-title-sm {
  font-family: var(--md-sys-typescale-title-small-font);
  font-size: var(--md-sys-typescale-title-small-size);
  line-height: var(--md-sys-typescale-title-small-line-height);
  letter-spacing: var(--md-sys-typescale-title-small-tracking);
  font-weight: var(--md-sys-typescale-title-small-weight);
}
@utility type-body-lg {
  font-family: var(--md-sys-typescale-body-large-font);
  font-size: var(--md-sys-typescale-body-large-size);
  line-height: var(--md-sys-typescale-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-body-large-tracking);
  font-weight: var(--md-sys-typescale-body-large-weight);
}
@utility type-body-md {
  font-family: var(--md-sys-typescale-body-medium-font);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  letter-spacing: var(--md-sys-typescale-body-medium-tracking);
  font-weight: var(--md-sys-typescale-body-medium-weight);
}
@utility type-body-sm {
  font-family: var(--md-sys-typescale-body-small-font);
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-body-small-tracking);
  font-weight: var(--md-sys-typescale-body-small-weight);
}
@utility type-label-lg {
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  line-height: var(--md-sys-typescale-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  font-weight: var(--md-sys-typescale-label-large-weight);
}
@utility type-label-md {
  font-family: var(--md-sys-typescale-label-medium-font);
  font-size: var(--md-sys-typescale-label-medium-size);
  line-height: var(--md-sys-typescale-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  font-weight: var(--md-sys-typescale-label-medium-weight);
}
@utility type-label-sm {
  font-family: var(--md-sys-typescale-label-small-font);
  font-size: var(--md-sys-typescale-label-small-size);
  line-height: var(--md-sys-typescale-label-small-line-height);
  letter-spacing: var(--md-sys-typescale-label-small-tracking);
  font-weight: var(--md-sys-typescale-label-small-weight);
}
@utility type-display-lg-emphasized {
  font-family: var(--md-sys-typescale-emphasized-display-large-font);
  font-size: var(--md-sys-typescale-emphasized-display-large-size);
  line-height: var(--md-sys-typescale-emphasized-display-large-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-display-large-tracking);
  font-weight: var(--md-sys-typescale-emphasized-display-large-weight);
}
@utility type-display-md-emphasized {
  font-family: var(--md-sys-typescale-emphasized-display-medium-font);
  font-size: var(--md-sys-typescale-emphasized-display-medium-size);
  line-height: var(--md-sys-typescale-emphasized-display-medium-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-display-medium-tracking);
  font-weight: var(--md-sys-typescale-emphasized-display-medium-weight);
}
@utility type-display-sm-emphasized {
  font-family: var(--md-sys-typescale-emphasized-display-small-font);
  font-size: var(--md-sys-typescale-emphasized-display-small-size);
  line-height: var(--md-sys-typescale-emphasized-display-small-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-display-small-tracking);
  font-weight: var(--md-sys-typescale-emphasized-display-small-weight);
}
@utility type-headline-lg-emphasized {
  font-family: var(--md-sys-typescale-emphasized-headline-large-font);
  font-size: var(--md-sys-typescale-emphasized-headline-large-size);
  line-height: var(--md-sys-typescale-emphasized-headline-large-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-headline-large-tracking);
  font-weight: var(--md-sys-typescale-emphasized-headline-large-weight);
}
@utility type-headline-md-emphasized {
  font-family: var(--md-sys-typescale-emphasized-headline-medium-font);
  font-size: var(--md-sys-typescale-emphasized-headline-medium-size);
  line-height: var(--md-sys-typescale-emphasized-headline-medium-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-headline-medium-tracking);
  font-weight: var(--md-sys-typescale-emphasized-headline-medium-weight);
}
@utility type-headline-sm-emphasized {
  font-family: var(--md-sys-typescale-emphasized-headline-small-font);
  font-size: var(--md-sys-typescale-emphasized-headline-small-size);
  line-height: var(--md-sys-typescale-emphasized-headline-small-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-headline-small-tracking);
  font-weight: var(--md-sys-typescale-emphasized-headline-small-weight);
}
@utility type-title-lg-emphasized {
  font-family: var(--md-sys-typescale-emphasized-title-large-font);
  font-size: var(--md-sys-typescale-emphasized-title-large-size);
  line-height: var(--md-sys-typescale-emphasized-title-large-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-title-large-tracking);
  font-weight: var(--md-sys-typescale-emphasized-title-large-weight);
}
@utility type-title-md-emphasized {
  font-family: var(--md-sys-typescale-emphasized-title-medium-font);
  font-size: var(--md-sys-typescale-emphasized-title-medium-size);
  line-height: var(--md-sys-typescale-emphasized-title-medium-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-title-medium-tracking);
  font-weight: var(--md-sys-typescale-emphasized-title-medium-weight);
}
@utility type-title-sm-emphasized {
  font-family: var(--md-sys-typescale-emphasized-title-small-font);
  font-size: var(--md-sys-typescale-emphasized-title-small-size);
  line-height: var(--md-sys-typescale-emphasized-title-small-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-title-small-tracking);
  font-weight: var(--md-sys-typescale-emphasized-title-small-weight);
}
@utility type-body-lg-emphasized {
  font-family: var(--md-sys-typescale-emphasized-body-large-font);
  font-size: var(--md-sys-typescale-emphasized-body-large-size);
  line-height: var(--md-sys-typescale-emphasized-body-large-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-body-large-tracking);
  font-weight: var(--md-sys-typescale-emphasized-body-large-weight);
}
@utility type-body-md-emphasized {
  font-family: var(--md-sys-typescale-emphasized-body-medium-font);
  font-size: var(--md-sys-typescale-emphasized-body-medium-size);
  line-height: var(--md-sys-typescale-emphasized-body-medium-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-body-medium-tracking);
  font-weight: var(--md-sys-typescale-emphasized-body-medium-weight);
}
@utility type-body-sm-emphasized {
  font-family: var(--md-sys-typescale-emphasized-body-small-font);
  font-size: var(--md-sys-typescale-emphasized-body-small-size);
  line-height: var(--md-sys-typescale-emphasized-body-small-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-body-small-tracking);
  font-weight: var(--md-sys-typescale-emphasized-body-small-weight);
}
@utility type-label-lg-emphasized {
  font-family: var(--md-sys-typescale-emphasized-label-large-font);
  font-size: var(--md-sys-typescale-emphasized-label-large-size);
  line-height: var(--md-sys-typescale-emphasized-label-large-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-label-large-tracking);
  font-weight: var(--md-sys-typescale-emphasized-label-large-weight);
}
@utility type-label-md-emphasized {
  font-family: var(--md-sys-typescale-emphasized-label-medium-font);
  font-size: var(--md-sys-typescale-emphasized-label-medium-size);
  line-height: var(--md-sys-typescale-emphasized-label-medium-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-label-medium-tracking);
  font-weight: var(--md-sys-typescale-emphasized-label-medium-weight);
}
@utility type-label-sm-emphasized {
  font-family: var(--md-sys-typescale-emphasized-label-small-font);
  font-size: var(--md-sys-typescale-emphasized-label-small-size);
  line-height: var(--md-sys-typescale-emphasized-label-small-line-height);
  letter-spacing: var(--md-sys-typescale-emphasized-label-small-tracking);
  font-weight: var(--md-sys-typescale-emphasized-label-small-weight);
}
```

---

## 10. Open questions / unverifiable

1. **The m3 web pages are a JavaScript single-page app, and their token tables are rendered from the dsdb JSON.** I read that JSON directly [S9][S10]: snapshot `2026-09-23_06-10-05`, dsdb version 38.2.9. Token values were resolved by picking the most specific context match for `audience=3p, platform=web`. Google's tooling may resolve contexts differently in edge cases.
2. **Tracking for the variable set (`md.sys.typescale.variable.*`)** resolves to 0 in the dsdb for every style. The static Roboto Flex context (`font=variable`) does too. This may be intentional, because Roboto Flex `opsz` handles spacing, or it may be a data gap. It is not confirmed by any prose page. For safety, keep the static tracking values unless matching Google's 1P look exactly.
3. **Emphasized tracking** disagrees between Compose `v0_103` [S16] (display-large-emphasized 0, body-large-emphasized 0.15) and the dsdb [S9] (same as baseline). I followed the dsdb.
4. **Shape-morph timing for button groups** is not stated numerically on m3.material.io. The values here come from Compose source: `DefaultEffects` spring for button press, expressive motion scheme for morphs [S7][S23][S25]. The ms durations in 4.4 are my simulations, not Google figures.
5. **Web support for shape morph:** the m3 page says "Web is not currently available" [S7]. The JS port is a third-party port of the Android algorithm. It is verified against Google's reference image [S28] but not pixel-diffed against an Android rendering.
6. **The dsdb typescale includes axes not covered here:** `CRSV`, `FILL`, and `HEXP` exist as tokens and are 0 or undefined in the 3P context. Their meaning isn't documented on the public pages.
7. Google Sans Flex availability on Google Fonts was confirmed from the API on 2026-10-06 [S29]. Licensing and terms are not reviewed here.

---

## Sources

- **[S1]** M3 Typography – Type scale & tokens: https://m3.material.io/styles/typography/type-scale-tokens
- **[S2]** M3 Typography – Fonts: https://m3.material.io/styles/typography/fonts
- **[S3]** M3 Typography – Applying type: https://m3.material.io/styles/typography/applying-type
- **[S4]** M3 Typography – Editorial treatments: https://m3.material.io/styles/typography/editorial-treatments
- **[S5]** M3 Shape – Overview & principles (incl. "M3 Expressive update", May 2025): https://m3.material.io/styles/shape/overview-principles
- **[S6]** M3 Shape – Corner radius scale: https://m3.material.io/styles/shape/corner-radius-scale
- **[S7]** M3 Shape – Shape morph: https://m3.material.io/styles/shape/shape-morph
- **[S8]** M3 blog – Start building with Material 3 Expressive (May 13, 2025): https://m3.material.io/blog/building-with-m3-expressive
- **[S9]** m3.material.io token DB, typography (backs the token tables on S1): https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TYPOGRAPHY.20543ce18892f7d9.json
- **[S10]** m3.material.io token DB, shape/motion/state: https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TYPE_UNSPECIFIED.20543ce18892f7d9.json
- **[S11]** material-web `_md-sys-typescale.scss` (v0.192): https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss
- **[S12]** material-web `_md-ref-typeface.scss` (v0.192): https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-ref-typeface.scss
- **[S13]** material-web `_md-sys-shape.scss` (v0.192): https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-shape.scss
- **[S14]** MDC-Android shape tokens.xml (Version 34.0.0): https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/shape/res/values/tokens.xml
- **[S15]** MDC-Android typography tokens.xml: https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/typography/res/values/tokens.xml
- **[S16]** Compose `TypeScaleTokens.kt` (v0_103): https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt (+ `TypefaceTokens.kt`, `TypographyTokens.kt` in the same folder)
- **[S17]** Compose `Typography.kt`: https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Typography.kt
- **[S18]** Compose `ShapeTokens.kt` (14_1_0): https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt
- **[S19]** Compose `Shapes.kt` (ShapeDefaults): https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Shapes.kt
- **[S20]** Compose `MaterialShapes.kt`: https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt
- **[S21]** Compose `LoadingIndicator.kt`: https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt
- **[S22]** Compose `LoadingIndicatorTokens.kt` (v0_7_0): https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/LoadingIndicatorTokens.kt
- **[S23]** Compose `Button.kt` (`shapeByInteraction`, `ButtonShapes`): https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Button.kt
- **[S24]** Compose button size tokens: https://github.com/androidx/androidx/tree/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens (`ButtonXSmallTokens.kt`, `ButtonSmallTokens.kt`, `ButtonMediumTokens.kt`, `ButtonLargeTokens.kt`, `ButtonXLargeTokens.kt`)
- **[S25]** Compose motion: `tokens/ExpressiveMotionTokens.kt`, `tokens/StandardMotionTokens.kt` (v0_14_0), `MotionScheme.kt` in the material3 folder above
- **[S26]** `androidx.graphics.shapes` source (`RoundedPolygon.kt`, `Shapes.kt`, `CornerRounding.kt`, `Cubic.kt`, `Morph.kt`, `FeatureMapping.kt`, `PolygonMeasure.kt`, `FloatMapping.kt`, `Features.kt`, `Utils.kt`): https://github.com/androidx/androidx/tree/androidx-main/graphics/graphics-shapes/src/commonMain/kotlin/androidx/graphics/shapes
- **[S27]** Compose `internal/ShapeUtil.kt` (`toPath`, `transformed(Matrix)`) and `ui-graphics/Matrix.kt` (`rotateZ`, `map`): https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/internal/ShapeUtil.kt , https://github.com/androidx/androidx/blob/androidx-main/compose/ui/ui-graphics/src/commonMain/kotlin/androidx/compose/ui/graphics/Matrix.kt
- **[S28]** Official MaterialShapes reference image: https://developer.android.com/images/reference/androidx/compose/material3/shapes.png
- **[S29]** Google Fonts metadata (axes): https://fonts.google.com/metadata/fonts ; CSS2 API: https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,slnt,wdth,wght,GRAD@8..144,-10..0,25..151,100..1000,-200..150 and https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,GRAD,ROND@6..144,-10..0,25..151,1..1000,0..100,0..100
- **[S30]** Fontsource packages: https://unpkg.com/@fontsource-variable/roboto-flex@5.3.0/ and https://unpkg.com/@fontsource-variable/google-sans-flex@5.3.1/
- **[S31]** Tailwind CSS docs – font-size (theme variables): https://tailwindcss.com/docs/font-size ; border-radius: https://tailwindcss.com/docs/border-radius
