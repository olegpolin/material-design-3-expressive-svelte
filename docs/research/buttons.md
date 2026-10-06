# M3 Expressive: button family specs

Research for the Svelte 5 + Tailwind 4 implementation of **common buttons, toggle buttons, icon buttons, FABs, extended FABs, the FAB menu, button groups, split buttons and segmented buttons**.

All numbers are in **dp**. On the web, 1dp = 1 CSS px.

## How this was sourced (read first)

1. **The official token database behind m3.material.io (primary source).** The spec pages are an Angular SPA. Their token tables are loaded from JSON files under `https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.<hash>.json`, and each file is the token set shown on that page. These files were downloaded and resolved (token → system token → value). They are labelled **[T1]–[T8]** below. They are newer than the Compose token files and win when the two disagree. The date-stamped path changes whenever the site republishes. Open the spec page in a browser and look at the network tab to get the current URL.
2. **Spec and guideline page prose** (rendered in a browser), labelled **[S1]–[S12]**. Some measurement diagrams are images only; any numbers taken from them are flagged.
3. **Jetpack Compose material3 source** (`androidx-main`), labelled **[C*]**. This covers behaviour that tokens don't encode: the press-squeeze algorithm, the FAB menu choreography, optical centering, spring parameters and paddings.
4. **material-web**, labelled **[W*]**. Used for web-specific focus ring, elevation shadow and ripple implementation details.

Where sources conflict, the conflict is called out in a **⚠ Conflict** note together with the recommended choice.

### Shared system values used throughout

| System token | Value | Source |
|---|---|---|
| `shape.corner.none / extra-small / small / medium / large / large-increased / extra-large / extra-large-increased / extra-extra-large` | 0 / 4 / 8 / 12 / 16 / 20 / 28 / 32 / 48 | [C10] |
| `shape.corner.full` | 50% of the shorter side (CircleShape) | [C10] |
| `elevation.level0..5` | 0 / 1 / 3 / 6 / 8 / 12 | [C11], confirmed by [T1][T3] |
| `state.hover.state-layer-opacity` | 0.08 | [T1], [C12] |
| `state.focus.state-layer-opacity` | 0.10 | [T1], [C12] |
| `state.pressed.state-layer-opacity` | 0.10 | [T1], [C12] |
| `state.dragged.state-layer-opacity` | 0.16 | [C12] |
| `state.focus-indicator.thickness` | 3dp | [T1], [W1] (3px) |
| `state.focus-indicator.outer-offset` | 2dp | [T1], [W1] (2px) |
| focus indicator color | `secondary` | [T1], [W1] |
| Minimum touch target | 48 × 48 (XS and S buttons and icon buttons must extend their target) | [S1], [S3], [C19] |
| `measurement.space25/50/75/100/125/150/175/200/250/300/400/600/800/900` | 2/4/6/8/10/12/14/16/20/24/32/48/64/72 | resolved in [T1][T2] |

**Type scale used by buttons** (Compose `TypeScaleTokens` [C15]; size/line-height in sp → px):

| Style | Size / line height | Weight | Tracking |
|---|---|---|---|
| label-large | 14 / 20 | 500 (Medium) | 0.1 |
| title-medium | 16 / 24 | 500 (Medium) | 0.2 (the web M3 spec historically says 0.15) |
| title-large | 22 / 28 | 400 | 0 |
| headline-small | 24 / 32 | 400 | 0 |
| headline-large | 32 / 40 | 400 | 0 |

**Springs** (`md.sys.motion.spring.*`). The token DB has `expressive` and `standard` contexts, for example `fast.spatial.stiffness` = 800 (expressive) and 1400 (standard) [T6]. Full values come from [C13]/[C14]:

| Spring | Expressive (damping / stiffness) | Standard (damping / stiffness) |
|---|---|---|
| fast spatial | 0.6 / 800 | 0.9 / 1400 |
| default spatial | 0.8 / 380 | 0.9 / 700 |
| slow spatial | 0.8 / 200 | 0.9 / 300 |
| fast effects | 1.0 / 3800 | 1.0 / 3800 |
| default effects | 1.0 / 1600 | 1.0 / 1600 |
| slow effects | 1.0 / 800 | 1.0 / 800 |

"Spatial" springs are for position, size and shape and may overshoot. "Effects" springs are for color, opacity and other non-spatial properties and are critically damped (no bounce).

---

## 1. Common buttons (filled, tonal, outlined, elevated, text)

### 1.1 Configurations [S1]

- **Sizes:** XS, S (default), M, L, XL. XS/M/L/XL are new in M3 Expressive.
- **Shapes:** round (default) and square (new in Expressive).
- **Colors:** elevated, filled (default), tonal, outlined, text.
- **Toggle (selection) variant:** new in Expressive and available for every style **except text**.
- **Small button padding:** the baseline 24dp is "Not recommended. Use 16dp".

### 1.2 Size table (official tokens `md.comp.button.{xsmall|small|medium|large|xlarge}` [T1])

| Token | XS | S | M | L | XL |
|---|---|---|---|---|---|
| `container.height` | **32** | **40** | **56** | **96** | **136** |
| `leading-space` / `trailing-space` | **12 / 12** | **16 / 16** | **24 / 24** | **48 / 48** | **64 / 64** |
| `icon.size` | 20 | 20 | 24 | 32 | 40 |
| `icon-label-space` | **4** | 8 | 8 | 12 | 16 |
| `label-text` | label-large | label-large | **title-medium** | **headline-small** | **headline-large** |
| `container.shape.round` | full | full | full | full | full |
| `container.shape.square` | 12 (medium) | 12 (medium) | 16 (large) | 28 (extra-large) | 28 (extra-large) |
| `pressed.container.shape` | 8 (small) | 8 (small) | 12 (medium) | 16 (large) | 16 (large) |
| `selected.container.shape.round` (round button when selected) | 12 | 12 | 16 | 28 | 28 |
| `selected.container.shape.square` (square button when selected) | full | full | full | full | full |
| `outlined.outline.width` | 1 | 1 | 1 | **2** | **3** |
| pressed shape spring | fast spatial | fast spatial | fast spatial | fast spatial | fast spatial |
| full radius in px (= height / 2) | 16 | 20 | 28 | 48 | 68 |
| vertical padding (derived: (height − line height) / 2; Compose uses the same values [C1]) | 6 | 10 | 16 | 32 | 48 |

The corner table on the spec page confirms these values: square 12/12/16/28/28, pressed 8/8/12/16/16, round full at every size [S1].

> **⚠ Conflict (XS padding and gap):** Compose's generated `ButtonXSmallTokens.kt` (v0_11_0) still says leading/trailing 16 and icon-label 8 [C18]. However, `ButtonDefaults.ExtraSmallContentPadding` hard-codes 12/12 and `ExtraSmallIconSpacing = 4.dp`, with a TODO to fix the tokens [C1]. The official DB says 12 / 4 [T1]. **Use 12 and 4.**
>
> **⚠ Correction to the brief:** the L label is **headline-small** and the XL label is **headline-large**. title-medium is the M style. Compose `textStyleFor()` agrees: height < 56 → labelLarge, < 96 → titleMedium, < 136 → headlineSmall, else headlineLarge [C1].

**With icon vs. without icon:** in Expressive, the padding is the same with or without an icon at every size (see the table above). The icon sits on the leading side and is never centered apart from the label [S2]. The old baseline small button used 24dp without an icon and 16dp with a leading icon (`ButtonDefaults.ContentPadding` / `ButtonWithIconContentPadding` [C1]); this is no longer recommended [S1]. The legacy baseline text button used 12dp horizontal padding, or 12/16 with an icon [C1]. In Expressive, text buttons use the size tokens above.

**Width:** the container hugs its label and must never be narrower than it. Labels never wrap or truncate and are always one line, in sentence case [S2]. The legacy Compose `ButtonDefaults.MinWidth` is 58dp [C1]. **Only one icon per button** [S2].

### 1.3 Colors (official tokens `md.comp.button.{elevated|filled|tonal|outlined|text}` [T1], table on [S1])

Default (non-toggle) button:

| Style | Container | Label & icon | Outline | State-layer color | Elevation (rest) |
|---|---|---|---|---|---|
| Elevated | `surface-container-low` | `primary` | none | `primary` | level1 (1dp) |
| Filled | `primary` | `on-primary` | none | `on-primary` | level0 |
| Tonal | `secondary-container` | `on-secondary-container` | none | `on-secondary-container` | level0 |
| Outlined | transparent | `on-surface-variant` | `outline-variant` | `on-surface-variant` | n/a |
| Text | transparent | `primary` | none | `primary` | n/a |

Toggle button:

| Style | Unselected container / content | Selected container / content |
|---|---|---|
| Elevated | `surface-container-low` / `primary` | `primary` / `on-primary` |
| Filled | `surface-container` / `on-surface-variant` | `primary` / `on-primary` |
| Tonal | `secondary-container` / `on-secondary-container` | `secondary` / `on-secondary` |
| Outlined | transparent + `outline-variant` outline / `on-surface-variant` | `inverse-surface` / `inverse-on-surface`, **no outline** (Compose `OutlinedToggleButtonDefaults.border` returns `null` when checked; outline width animates with fast spatial and outline color with default effects [C6]) |
| Text | — (no toggle text button) [S1] | — |

**Disabled** (all styles) [T1]: container `on-surface` at **10%** opacity, label and icon `on-surface` at **38%**. The elevation becomes level0 (the elevated button goes from 1 to 0 [S1]). Outlined disabled outline: `outline-variant` [T1]. Compose uses the outline color at 10% alpha instead [C1].

> **⚠ Conflict:** Compose `FilledButtonTokens` v0_11 lists the disabled content color as `on-surface-variant` [C18], but the newer official DB says `on-surface` [T1]. Use `on-surface`.

**Elevation by state** [T1]:

| Style | Enabled | Hovered | Focused | Pressed | Disabled |
|---|---|---|---|---|---|
| Elevated | 1 | 3 (level2) ⚠ | 1 | 1 | 0 |
| Filled / Tonal | 0 | 1 (level1) ⚠ | 0 | 0 | 0 |

> ⚠ Both `hovered.container.elevation` tokens are now marked deprecated with the message "No longer part of the design spec" [T1]. Compose still applies them [C1]. **Recommendation:** keep the elevation constant on hover and let the 8% state layer communicate hover.

The note on [S1] allows other color roles (for example `tertiary` / `on-tertiary`) as long as the container and text keep 3:1 contrast. Filled buttons "can use tertiary colors" [S2].

### 1.4 States and shape morph

- State layers: hover **8%**, focus **10%**, pressed **10%**, using the **content color** of the current state (tokens `*.state-layer.color` [T1]).
- **Pressed morph:** while pressed, both round and square buttons morph to the **same** pressed radius (8/8/12/16/16) [S1].
- **Selected (toggle):** a round button becomes square when selected (12/12/16/28/28). If the resting shape is square, the selected shape is **round** (full) [S1][T1]. Toggle buttons should use an outlined icon when unselected and a filled icon when selected [S2].
- **Morph spring:** tokens specify **fast spatial** for `pressed.container.corner-size` [T1]. Compose `ToggleButton` uses FastSpatial [C6]. Compose `Button` and `IconButton` deliberately use **DefaultEffects** "to prevent any bounce in this component" [C1][C7]. **Recommendation:** use fast spatial for toggle buttons and button groups, and default effects (no bounce) for plain buttons.
- **Focus indicator:** a 3dp `secondary` outline at a 2dp outward offset that follows the container shape (offset radius = radius + 2) [T1][W1][W2].

### 1.5 Touch target

XS (32) and S (40) buttons need a 48 × 48 hit area or larger [S1]. Compose enforces 48dp through `minimumInteractiveComponentSize` [C19].

---

## 2. Icon buttons

### 2.1 Configurations [S3]

- **Sizes:** XS, S (default), M, L, XL.
- **Shapes:** round (default) and square.
- **Colors:** filled (default), tonal, outlined, standard.
- **Widths:** narrow, default, wide.
- **Toggle:** available for every style.

### 2.2 Size table (`md.comp.icon-button.{xsmall..xlarge}` [T2]; widths = icon + leading + trailing, as Compose `*ContainerSize(widthOption)` computes them [C7])

| | XS | S | M | L | XL |
|---|---|---|---|---|---|
| container height | **32** | **40** | **56** | **96** | **136** |
| icon size | **20** | **24** | **24** | **32** | **40** |
| narrow padding (each side) → **width** | 4 → **28** | 4 → **32** | 12 → **48** | 16 → **64** | 32 → **104** |
| default padding → **width** | 6 → **32** | 8 → **40** | 16 → **56** | 32 → **96** | 48 → **136** |
| wide padding → **width** | 10 → **40** | 14 → **52** | 24 → **72** | 48 → **128** | 72 → **184** |
| round shape | full | full | full | full | full |
| square shape | 12 | 12 | 16 | 28 | 28 |
| pressed shape | 8 | 8 | 12 | 16 | 16 |
| selected shape (round → ) | 12 | 12 | 16 | 28 | 28 |
| selected shape (square → ) | full | full | full | full | full |
| outlined outline width | 1 | 1 | 1 | 2 | 3 |
| morph spring | fast spatial | fast spatial | fast spatial | fast spatial | fast spatial |

The corner table on [S3] matches: square 12/12/16/28/28, pressed 8/8/12/16/16. XS and S icon buttons need 48 × 48 targets [S3]. Do not stretch an icon button wider than the "wide" setting [S9].

### 2.3 Colors (`md.comp.icon-button.{filled|tonal|outlined|standard}` [T2], table on [S3])

| Style | Default container / icon | Toggle unselected container / icon | Toggle selected container / icon |
|---|---|---|---|
| Filled | `primary` / `on-primary` | `surface-container` / `on-surface-variant` | `primary` / `on-primary` |
| Tonal | `secondary-container` / `on-secondary-container` | `secondary-container` / `on-secondary-container` | `secondary` / `on-secondary` |
| Outlined | transparent + `outline-variant` outline (1dp at S) / `on-surface-variant` | same as default | `inverse-surface` / `inverse-on-surface`, no outline (Compose returns `null` border when checked [C7]) |
| Standard | none / `on-surface-variant` | none / `on-surface-variant` | none / **`primary`** |

- **Disabled:** icon `on-surface` at 38%. Container (filled, tonal, outlined-selected) `on-surface` at 10%. Outline `outline-variant` [T2].
- **States:** hover 8%, focus 10%, pressed 10%, using the icon color. The standard icon button's container is invisible at rest and visible only through the state layer [S3].
- **Focus ring:** 3dp `secondary`, 2dp offset [T2].
- **Compose note:** `iconButtonColors()` defaults to `LocalContentColor` for standard and outlined. The token values above are what Compose calls the "Vibrant" variants (`iconButtonVibrantColors`, `outlinedIconButtonVibrantBorder`) [C7]. Use the token values.

---

## 3. FAB and extended FAB

### 3.1 FAB sizes (`md.comp.fab.*` [T3]; variants on [S4])

| Variant | Container | Shape (radius) | Icon | Status in Expressive |
|---|---|---|---|---|
| Small FAB | 40 × 40 | medium **12** | 24 | "Not recommended. Use a larger size." [S4] |
| **FAB** (regular, default) | **56 × 56** | large **16** | **24** | available |
| **Medium FAB** (new) | **80 × 80** | large-increased **20** | **28** | new in Expressive |
| **Large FAB** | **96 × 96** | extra-large **28** | **36** | available |

> **⚠ Correction to the brief:** "Medium FAB" is a **new 80dp** size. The 56dp FAB is just "FAB". Compose `FabLargeTokens.IconSize` = 32 is marked "incorrect" in source, and `LargeIconSize = 36.dp` overrides it [C4]. The official token is 36 [T3]. Compose's medium FAB uses `ShapeDefaults.LargeIncreased` (20) [C4].

The FAB margin from the window edge is **16dp** (24dp in large and extra-large windows) [S6][S7].

### 3.2 FAB colors [S4][T3]

Expressive renamed the old "primary/secondary/tertiary" sets to **primary container / secondary container / tertiary container**, which match the color roles they actually use. It added new high-emphasis **primary / secondary / tertiary** sets [S4].

| Color style | Container | Icon (and state layer) |
|---|---|---|
| Primary container (**default**) | `primary-container` | `on-primary-container` |
| Secondary container | `secondary-container` | `on-secondary-container` |
| Tertiary container | `tertiary-container` | `on-tertiary-container` |
| Primary | `primary` | `on-primary` |
| Secondary | `secondary` | `on-secondary` |
| Tertiary | `tertiary` | `on-tertiary` |
| Surface (baseline) | `surface-container-high` | `primary` — "still available, but no longer recommended" [S4] |

The state-layer color must equal the icon color [S4]. Shadow color: `shadow` [T3].

### 3.3 FAB elevation and states [T3][S4]

| State | Elevation | State layer |
|---|---|---|
| Enabled | level3 = **6dp** | — |
| Hovered | level4 = **8dp** | 8% |
| Focused | level3 = 6dp | 10% |
| Pressed | level3 = 6dp | 10% |
| *Lowered* (resting / hover / focus / pressed) | 1 / 3 / 1 / 1 | **deprecated** ("Token is deprecated.") [T3] |

Compose: `FloatingActionButtonDefaults.elevation()` uses 6/6/6/8 (default/pressed/focused/hovered). `loweredElevation()` uses 1/1/1/3. `bottomAppBarFabElevation()` uses 0 [C4].

### 3.4 Extended FAB (`md.comp.extended-fab.{small|medium|large}` [T4], [S5])

| | Small ext. FAB | Medium ext. FAB | Large ext. FAB | Baseline ext. FAB (not recommended) |
|---|---|---|---|---|
| Height | **56** | **80** | **96** | 56 |
| Shape | large **16** | large-increased **20** | extra-large **28** | 16 |
| Icon | 24 | 28 | 36 | 24 |
| Icon–label gap | 8 | 12 | 16 | 12 |
| Leading / trailing padding | 16 / 16 | **26 / 26** | 28 / 28 | 16 / 20 |
| Label | **title-medium** | **title-large** | **headline-small** | label-large |
| Min width | 56 (= height) [C4] | 80 [C4] | 96 [C4] | 80 [S5] |

- Colors and elevation are the same six color styles and the same 6/8/6/6 elevations as the FAB. Label and icon both use the "on-" role [T4][S5]. Hover: "elevation 4" [S5].
- Baseline → Small: "the type style was updated from label large to title medium, and the inner padding was reduced" [S5].
- Margins: 16dp [S5].

> **⚠ Conflict (gaps):** Compose `ExtendedFabMediumTokens.IconLabelSpace` = 16 and `ExtendedFabLargeTokens.IconLabelSpace` = 20 are flagged "incorrect" in source and overridden to **12 / 16** [C4], which matches the official DB [T4]. Compose `ExtendedFabLargeTokens.IconSize` = 32 also differs from the DB value of 36. **Use the DB values.**

**Expand/collapse animation** (Compose [C4]):

- Collapse: `fadeOut(FastEffects) + shrinkHorizontally(DefaultSpatial, towards Start)`.
- Expand: `fadeIn(DefaultEffects) + expandHorizontally(FastSpatial, from Start)`.
- Collapsed it becomes a square FAB of the same height. Its size animates with FastSpatial and its opacity with FastEffects.

---

## 4. FAB menu (new in Expressive)

### 4.1 Structure and measurements (`md.comp.fab-menu` [T5]; [S6][S7])

| Element | Token | Value |
|---|---|---|
| Close button | container | **56 × 56**, shape **full** ("should always be 56dp" [S6]) |
| | icon size | **20** |
| | elevation | level3 (6dp); hover level4 (8dp) |
| | space between close button and the item list | **8** |
| Menu item | height | **56** (shares measurements with the **medium button** [S6]) |
| | shape | **full** |
| | leading / trailing padding | **24 / 24** |
| | icon | **24** |
| | icon–label gap | **8** |
| | label | **title-medium** |
| | gap between items | **4** |
| | container elevation | level0 in common tokens. The color sets give focused 6, hovered 8, pressed 6 (as on a FAB) |
| | min width | 56 [C5] |
| Item count | — | **2–6** items (do not use for one item) [S7] |
| Horizontal padding (Compose) | — | 16 [C5] |
| Web | — | Uses the standard menu component; a **4dp** gap between FAB and menu is recommended [S6] |

### 4.2 Colors (three sets) [T5][S7]

| Set | Close button container / icon | Item container / icon & label | Pair with FAB style |
|---|---|---|---|
| Primary | `primary` / `on-primary` | `primary-container` / `on-primary-container` | primary or primary-container FAB |
| Secondary | `secondary` / `on-secondary` | `secondary-container` / `on-secondary-container` | secondary or secondary-container FAB |
| Tertiary | `tertiary` / `on-tertiary` | `tertiary-container` / `on-tertiary-container` | tertiary or tertiary-container FAB |

State layers on both elements: 8 / 10 / 10% in the content color [T5].

### 4.3 Placement [S6][S7]

- Aligned to the trailing edge of the window (mirrored in RTL). It always opens in the same place as the FAB that opened it.
- The FAB **transforms into the close button**. They share the **top-trailing corner** as the anchor, and the menu animates from that corner.
- Medium and large FABs place the close button higher, aligned with the FAB's top edge, which leaves larger space underneath.
- Margins are 16dp, or 24dp in large and extra-large windows.
- When the window is too short, items scroll **behind** the close button. Selecting an item can use a container transform into a surface [S7].
- Never open a FAB menu from an extended FAB. Don't use it together with a floating toolbar or navigation rail [S7].

### 4.4 Open/close choreography (numeric, from Compose `FloatingActionButtonMenu.kt` [C5])

**ToggleFloatingActionButton** (FAB ↔ close button). `checkedProgress` animates 0→1 using the **FastSpatial** spring (expressive 0.6 / 800). Every property is a `lerp(start, end, progress)`:

| Property | FAB → close | Medium FAB → close | Large FAB → close |
|---|---|---|---|
| container size | 56 → 56 | 80 → 56 | 96 → 56 |
| corner radius | 16 → 28 (full) | 20 → 28 | 28 → 28 |
| icon size | 24 → 20 | 28 → 20 | 36 → 20 |
| container color | `primary-container` → `primary` | same | same |
| icon color | `on-primary-container` → `on-primary` | same | same |

The container stays anchored at the top-trailing corner; the content is centered in the animated box. The icon is usually crossfaded or rotated from the "add"/action icon to "close" by the app.

**Menu items:**

1. A **stagger** integer animatable runs from 0 to `itemCount` (open) or back to 0 (close) using the **SlowEffects** spring (damping 1.0, stiffness 800, `visibilityThreshold = 1`). Item *i* is visible when `i >= itemCount − stagger`. Items therefore appear **bottom-up**, nearest the FAB first, and disappear top-down.
2. Each visible item **reveals horizontally**: its measured width is multiplied by a 0→1 animatable on the **FastSpatial** spring. The item is clipped and aligned to the trailing edge, so it "grows" out of the trailing side. Its alpha goes 0→1 on the **FastEffects** spring.
3. The layout reserves the bottom padding `FAB height + 16 + 8` before the item list.

---

## 5. Button groups (standard and connected)

### 5.1 Configurations [S8]

- Sizes XS–XL, round or square shape.
- Selection modes: single-select, multi-select and selection-required.
- Button groups are **invisible containers**. They have no color of their own and use the color styles of the buttons inside (filled, tonal, outlined, elevated). Avoid standard icon buttons and text buttons in them [S8].

### 5.2 Standard button group (`md.comp.button-group.standard.*` [T6])

| | XS | S | M | L | XL |
|---|---|---|---|---|---|
| container height | 32 | 40 | 56 | 96 | 136 |
| **between-space** (gap) | **18** | **12** | **8** | **8** | **8** |
| `pressed.item.width.multiplier` | **15%** | 15% | 15% | 15% | 15% |
| width spring | fast spatial | fast spatial | fast spatial | fast spatial | fast spatial |

The gap is chosen so that each button keeps a 48dp accessible target [S8]. Compose only exposes the Small values: `ButtonGroupSmallTokens.BetweenSpace = 12`, `ExpandedRatio = 0.15f` [C2]. The group **hugs** its buttons' width [S9], should stay on **one line** without wrapping, and can collapse trailing items into an overflow menu at the trailing end [S9].

### 5.3 The press "squeeze" interaction

From [S8]/[S9]: when a button in a standard group is pressed or selected, it changes **shape and width**, and adjacent buttons temporarily change width. A selected toggle button also changes color and goes round↔square. In a connected group, only the pressed or selected button's **shape** changes.

Algorithm (Compose `ButtonGroup` measure policy [C2]):

```
ExpandedRatio r = 0.15
p = pressedAnimatable[i] in 0..1  (FastSpatial spring; expressive damping 0.6 / stiffness 800)

if i is a middle item:
    growth = round(p * min(r * w[i] / 2, compressionLimit[i-1], compressionLimit[i+1]))
    w[i-1] -= growth; w[i+1] -= growth; w[i] += 2*growth      // total +15%, each neighbour −7.5%
if i is first:  g = round(p * min(r * w[i], compressionLimit[i+1])); w[i+1] -= g; w[i] += g
if i is last:   g = round(p * min(r * w[i], compressionLimit[i-1])); w[i-1] -= g; w[i] += g
```

- `compressionLimit` is the maximum amount a neighbour may shrink (set per item in Compose via `animateWidth(interactionSource, compressionLimit)`, default 0 = unlimited). **Recommendation:** use the neighbour's horizontal padding so its label never clips.
- On **press** the progress animates to 1. On **release** Compose waits until the progress is **> 0.75**, then animates back to 0. A quick tap therefore still shows most of the squeeze.
- The total group width is unchanged, so the surrounding layout does not move. This is why the group reserves its gap [S9].

### 5.4 Connected button group (`md.comp.button-group.connected.*` [T6]; [S8])

| | XS | S | M | L | XL |
|---|---|---|---|---|---|
| container height | 32 | 40 | 56 | 96 | 136 |
| **between-space** | **2** | 2 | 2 | 2 | 2 |
| outer corners (round group) | full | full | full | full | full |
| **inner corner** (rest) | **8** ⚠ (spec text: 4) | 8 | 8 | 16 | 20 |
| **pressed inner corner** | 4 | 4 | 4 | 12 | 16 |
| **selected** inner corner | 50% (full) | 50% | 50% | 50% | 50% |
| min width (XS/S) | 48 | 48 | — | — | — |

- **Square connected group:** the outer corners take the same per-size values (XS 4, S 8, M 8, L 16, XL 20 per [S8] text).
- Selecting a button makes it **fully round** on all corners (Compose `connectedButtonCheckedShape = CornerFull` [C2]) and does **not** affect neighbours.
- In Compose, the leading item has full start corners and 8dp end corners, which become 4dp when pressed. The trailing item mirrors this. Middle items have 8dp on every corner, or 4dp when pressed [C2].
- A connected group should **span the width** of its container (each button grows), with an optional max width in large windows [S9]. Use it only for single- or multi-select toggle patterns. Don't mix color styles inside one [S9].
- It replaces the segmented button [S8][S12].

> **⚠ Conflict (XS inner corner):** the spec page text lists the inner corners as "XS: 4dp, S: 8dp, M: 8dp, L: 16dp, XL: 20dp" [S8], but token `md.comp.button-group.connected.xsmall.inner-corner.corner-size` = `corner-value.small` = 8 [T6]. **Recommendation:** use 8 (the token). An XS button with 4dp inner corners would be identical to its pressed state (4).

---

## 6. Split button (new in Expressive)

### 6.1 Overview [S10][S11]

- Sizes XS–XL. Colors: elevated, filled, tonal, outlined, using the **same colors and state layers as buttons**.
- The color does **not** change when selected; only a state layer is applied [S10].
- The leading button can have an icon, a label or both, with 1–2 word labels. The trailing button **always** shows the expand/collapse (menu) icon [S10][S11].
- RTL mirrors the order [S11].

### 6.2 Measurements (`md.comp.split-button.*` [T7]; [S10])

| | XS | S | M | L | XL |
|---|---|---|---|---|---|
| container height | 32 | 40 | 56 | 96 | 136 |
| between-space (gap) | **2** | 2 | 2 | 2 | 2 |
| outer corners | full | full | full | full | full |
| **inner corner** (rest) | **4** | **4** | **4** | **8** | **12** |
| inner corner, **hovered / focused / pressed** | 8 | 12 | 12 | 20 | 20 |
| trailing inner corner when **selected** | 50% (fully round) | 50% | 50% | 50% | 50% |
| leading button: leading / trailing padding | 12 / 10 | 16 / 12 | 24 / 24 | 48 / 48 | 64 / 64 |
| leading button: icon / label style | as button size (20 / label-large, …) | 20 / label-large | 24 / title-medium | 32 / headline-small | 40 / headline-large |
| trailing button: padding (each side) | 13 | 13 | 15 | 29 | 43 |
| trailing button: icon size | 22 | 22 | 26 | 38 | 50 |
| **trailing button width** (icon + 2 × padding) | **48** | **48** | **56** | **96** | **136** |
| menu-icon optical offset when unselected [S10] | −1 | −1 | −2 | −3 | −6 |

The inner corner values on the spec page agree: "Extra small 4dp, Small 4dp, Medium 4dp, Large 8dp, Extra large 12dp", and "The space should always be 2dp" [S10]. Compose: leading and trailing min width are both 48 [C3].

**Optical centering:** "Text and icons are optically centered when the buttons are asymmetrical" [S10]. Compose shifts content by `0.11 × (avgStartCornerRadius − avgEndCornerRadius)`, clamped to the content padding (`CenterOpticallyCoefficient = 0.11f` [C9]). For the trailing button this moves the icon toward the inner (leading) edge. That gives about −1.3 (XS), −1.8 (S), −2.6 (M), −4.4 (L) and −6.2 (XL), close to the spec's −1/−1/−2/−3/−6. When selected, the trailing button is symmetrical (fully round), so the icon is **centered** [S10].

### 6.3 Behavior [S10][S11][C3]

- The inner corners morph on hover, focus and press (the leading and trailing buttons each morph only their own inner corners). Compose animates this with **DefaultEffects** (no bounce) [C3].
- **Selected trailing button** (menu open): inner corners become full and the icon is centered. Compose draws an extra overlay of the content color at **10%** (`TrailingButtonStateLayerAlpha = PressedStateLayerOpacity`) while checked [C3]. The container color is unchanged [S10].
- **Icon rotation:** the menu icon "rotates inwards **180°** when opened and closed", using the **standard** motion scheme rather than expressive [S11]. The Compose samples use `animateFloatAsState(if (checked) 180f else 0f)` → `graphicsLayer.rotationZ` [C17]. Recommended spring: standard fast spatial (0.9 / 1400). This is my choice of speed; the guidelines only say "standard scheme".
- **Menu placement:** align the menu to the trailing button, or else to an edge of the split button. Place it **4dp** away from the split button [S11].

---

## 7. Segmented buttons (baseline; not recommended in Expressive)

"Segmented buttons are no longer recommended in the Material 3 expressive update … use the connected button group instead" [S12]. Specs for completeness (`md.comp.outlined-segmented-button` [T8], [S12]):

| Attribute | Value |
|---|---|
| Height | **40** (density: −4dp per step, applied to height only) [S12] |
| Shape | **full** on the outer ends of the group. Inner segments are square (Compose `itemShape`: first → start-rounded, last → end-rounded, middle → rectangle [C8]) |
| Outline | **1dp** `outline`. Neighbouring segments overlap by 1dp (`Arrangement.spacedBy(-1dp)` [C8]). The checked segment is drawn on top (z-index boost [C8]) |
| Segment width | container width / segment count. The container width is driven by the labels [S12] |
| Side padding | min **12** [S12][C8] |
| Gap between elements | **8** [S12][C8] |
| Icon | **18** (the checkmark appears when selected; the icon is optional when unselected) |
| Label | label-large |
| Min width per segment | 58 in Compose (`ButtonDefaults.MinWidth` [C8]). The spec only gives a 48dp target size [S12] |
| Target size | **48** [S12] |
| Unselected | container transparent; label/icon `on-surface` |
| Selected | container **`secondary-container`**; label/icon `on-secondary-container` |
| Disabled | label/icon `on-surface` 38%; outline `on-surface` **12%** |
| States | hover 8%, focus 10%, pressed 10% (the pressed token reuses focus opacity) [T8] |
| Focus ring | 3dp `secondary`, 2dp offset [T8] |
| Checkmark animation (Compose) | `fadeIn(DefaultEffects) + scaleIn(from 0, origin bottom-left, FastSpatial)`. The label slides by half of (icon + 8) using FastSpatial [C8] |

> The brief assumed "min-width 48". The spec only gives a 48dp *target*; 58 is Compose's min width.

---

## 8. State layers, ripple and focus (all components)

| Concern | Spec | Source |
|---|---|---|
| State-layer color | Same as the content (label/icon) color of the current state. For a FAB, the icon color | [T1][T3][S4] |
| Hover | 8% | [T1] |
| Focus | 10% state layer **plus** a focus ring | [T1] |
| Pressed | 10% (ripple) | [T1] |
| Dragged | 16% | [C12] |
| Disabled | no state layer. Container `on-surface` 10%, content `on-surface` 38% | [T1][T2] |
| Focus ring | `outline: 3px solid var(--md-sys-color-secondary); outline-offset: 2px`; radius follows the shape | [T1][W1][W2] |
| Focus ring animation (web) | Grows to an 8px "active-width" over the first 25% of `duration-long4` (600ms), then shrinks back to 3px over the remaining 75%, with emphasized easing | [W1][W2] |
| Ripple (web) | Press grows over **450ms** (standard easing) from **0.2** initial scale, with a min press time of **225ms**. Soft edge: max(75px, 35% of container). Hover layer transitions **15ms** linear, press fade-in **105ms**, press fade-out **375ms** linear. A touch delay of 150ms avoids ripples on scroll | [W4][W5] |
| Compose ripple alphas | pressed 0.10, focused 0.10, hovered 0.08, dragged 0.16 | [C16] |

**Elevation shadows for the web** (material-web: key shadow at 30% opacity plus ambient shadow at 15%, both in `--md-sys-color-shadow`) [W3]:

| Level (dp) | Key shadow | Ambient shadow |
|---|---|---|
| 1 (1dp) | `0 1px 2px 0` | `0 1px 3px 1px` |
| 2 (3dp) | `0 1px 2px 0` | `0 2px 6px 2px` |
| 3 (6dp) | `0 1px 3px 0` | `0 4px 8px 3px` |
| 4 (8dp) | `0 2px 3px 0` | `0 6px 10px 4px` |
| 5 (12dp) | `0 4px 4px 0` | `0 8px 12px 6px` |

---

## 9. Implementation notes (Svelte 5 + Tailwind 4)

These map onto the conventions in `docs/plan.md`: `--md-sys-color-*`, `--radius-m3-*`, `--shadow-m3-1..5`, `--md-sys-motion-spring-*`, the `text-*` type utilities, `{@attach ripple()}` and `tailwind-variants`.

### 9.1 Spring easings as CSS `linear()`

The following were computed by simulating each spring from 0→1 (critically or under-damped, unit mass) and sampling 25 points until it settled within 0.2%. They are derived values, not official, so treat the durations as approximations. If `docs/research/motion.md` defines these tokens too, keep a single definition.

```css
:root {
  /* expressive fast spatial: damping 0.6, stiffness 800 -> ~394ms, ~9% overshoot */
  --md-sys-motion-spring-fast-spatial: linear(0, 0.093, 0.295, 0.526, 0.735, 0.894, 1.005, 1.067, 1.091, 1.09, 1.075, 1.054, 1.033, 1.016, 1.003, 0.996, 0.992, 0.991, 0.992, 0.994, 0.996, 0.998, 0.999, 1, 1);
  --md-sys-motion-spring-fast-spatial-duration: 394ms;
  /* expressive default spatial: 0.8 / 380 -> ~458ms, ~1.4% overshoot */
  --md-sys-motion-spring-default-spatial: linear(0, 0.061, 0.191, 0.345, 0.498, 0.634, 0.746, 0.834, 0.899, 0.947, 0.978, 0.997, 1.008, 1.013, 1.014, 1.014, 1.012, 1.01, 1.008, 1.006, 1.004, 1.003, 1.002, 1.001, 1);
  --md-sys-motion-spring-default-spatial-duration: 458ms;
  /* expressive slow spatial: 0.8 / 200 -> ~612ms */
  --md-sys-motion-spring-slow-spatial: linear(0, 0.055, 0.178, 0.328, 0.478, 0.613, 0.727, 0.817, 0.886, 0.935, 0.969, 0.991, 1.005, 1.012, 1.014, 1.014, 1.013, 1.011, 1.009, 1.007, 1.005, 1.003, 1.002, 1.001, 1);
  --md-sys-motion-spring-slow-spatial-duration: 612ms;
  /* standard fast spatial: 0.9 / 1400 -> ~189ms (split-button chevron rotation) */
  --md-sys-motion-spring-standard-fast-spatial: linear(0, 0.04, 0.13, 0.243, 0.353, 0.467, 0.569, 0.658, 0.729, 0.792, 0.843, 0.884, 0.913, 0.938, 0.956, 0.97, 0.979, 0.987, 0.992, 0.996, 0.998, 0.999, 1, 1.001, 1);
  --md-sys-motion-spring-standard-fast-spatial-duration: 189ms;
  /* effects springs (damping 1.0, no overshoot) */
  --md-sys-motion-spring-fast-effects: linear(0, 0.085, 0.235, 0.402, 0.541, 0.656, 0.752, 0.819, 0.869, 0.909, 0.935, 0.955, 0.968, 0.978, 0.985, 0.989, 0.992, 0.995, 0.996, 0.998, 0.998, 0.999, 0.999, 0.999, 1);
  --md-sys-motion-spring-fast-effects-duration: 173ms;   /* 1.0 / 3800 */
  --md-sys-motion-spring-default-effects: linear(0, 0.071, 0.212, 0.365, 0.506, 0.625, 0.72, 0.793, 0.849, 0.891, 0.922, 0.944, 0.959, 0.971, 0.98, 0.986, 0.99, 0.993, 0.995, 0.997, 0.998, 0.998, 0.999, 0.999, 1);
  --md-sys-motion-spring-default-effects-duration: 251ms; /* 1.0 / 1600 */
  --md-sys-motion-spring-slow-effects: linear(0, 0.067, 0.197, 0.343, 0.483, 0.599, 0.695, 0.773, 0.831, 0.875, 0.908, 0.934, 0.952, 0.965, 0.975, 0.982, 0.987, 0.991, 0.994, 0.995, 0.997, 0.998, 0.998, 0.999, 1);
  --md-sys-motion-spring-slow-effects-duration: 340ms;    /* 1.0 / 800 */
}
```

For interruptible physics (button-group squeeze, FAB menu progress), use `Spring` from `svelte/motion`. Svelte's `Spring` takes `stiffness`/`damping` in its own 0–1 units, not N/m, so tune it visually against the curves above. Alternatively, run a small semi-implicit Euler integrator with the real stiffness and damping ratio: `a = -k(x - target) - 2ζ√k·v`.

### 9.2 Shape morph pitfall: never use `9999px` for "full"

CSS interpolates `border-radius: 9999px → 8px` linearly. The corner stays visually round for about 99% of the transition and then snaps. **Set "full" to height / 2** (XS 16, S 20, M 28, L 48, XL 68) so the press morph animates smoothly. For connected groups and split buttons, animate the four `border-*-radius` longhands independently.

### 9.3 Per-size CSS custom properties (buttons)

Drive every size-dependent value from one data attribute and keep variants color-only:

```css
[data-slot='button'] {
  --_h: 40px; --_px: 16px; --_gap: 8px; --_icon: 20px;
  --_r-full: calc(var(--_h) / 2); --_r-square: 12px; --_r-pressed: 8px; --_outline: 1px;
  height: var(--_h); padding-inline: var(--_px); gap: var(--_gap);
  border-radius: var(--_r, var(--_r-full));
  transition: border-radius var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects);
}
[data-slot='button'][data-size='xs'] { --_h: 32px;  --_px: 12px; --_gap: 4px;  --_icon: 20px; --_r-square: 12px; --_r-pressed: 8px;  --_outline: 1px; }
[data-slot='button'][data-size='sm'] { --_h: 40px;  --_px: 16px; --_gap: 8px;  --_icon: 20px; --_r-square: 12px; --_r-pressed: 8px;  --_outline: 1px; }
[data-slot='button'][data-size='md'] { --_h: 56px;  --_px: 24px; --_gap: 8px;  --_icon: 24px; --_r-square: 16px; --_r-pressed: 12px; --_outline: 1px; }
[data-slot='button'][data-size='lg'] { --_h: 96px;  --_px: 48px; --_gap: 12px; --_icon: 32px; --_r-square: 28px; --_r-pressed: 16px; --_outline: 2px; }
[data-slot='button'][data-size='xl'] { --_h: 136px; --_px: 64px; --_gap: 16px; --_icon: 40px; --_r-square: 28px; --_r-pressed: 16px; --_outline: 3px; }

[data-slot='button'][data-shape='square']                      { --_r: var(--_r-square); }
[data-slot='button'][aria-pressed='true']                      { --_r: var(--_r-square); } /* round -> square when selected */
[data-slot='button'][data-shape='square'][aria-pressed='true'] { --_r: var(--_r-full); }   /* square -> round */
[data-slot='button']:active:not(:disabled)                     { --_r: var(--_r-pressed); }
[data-slot='button'][aria-pressed] {
  transition-timing-function: var(--md-sys-motion-spring-fast-spatial);
  transition-duration: var(--md-sys-motion-spring-fast-spatial-duration);
}
```

Equivalent `tv()` size slots using Tailwind arbitrary values (the type utilities come from `layout.css`):

| size | classes |
|---|---|
| xs | `h-8 px-3 gap-1 text-label-lg [--_icon:20px] [--_r-square:12px] [--_r-pressed:8px]` |
| sm | `h-10 px-4 gap-2 text-label-lg [--_icon:20px] [--_r-square:12px] [--_r-pressed:8px]` |
| md | `h-14 px-6 gap-2 text-title-md [--_icon:24px] [--_r-square:16px] [--_r-pressed:12px]` |
| lg | `h-24 px-12 gap-3 text-headline-sm [--_icon:32px] [--_r-square:28px] [--_r-pressed:16px] [--_outline:2px]` |
| xl | `h-34 px-16 gap-4 text-headline-lg [--_icon:40px] [--_r-square:28px] [--_r-pressed:16px] [--_outline:3px]` |

(`h-34` = 136px with Tailwind 4's 4px spacing scale.)

Color variants (default / toggle unselected → selected via `aria-pressed`):

| variant | default | toggle unselected | toggle selected |
|---|---|---|---|
| filled | `bg-primary text-on-primary` | `bg-surface-container text-on-surface-variant` | `bg-primary text-on-primary` |
| tonal | `bg-secondary-container text-on-secondary-container` | same | `bg-secondary text-on-secondary` |
| outlined | `bg-transparent text-on-surface-variant` + inset `--_outline` ring/border in `outline-variant` | same | `bg-inverse-surface text-inverse-on-surface`, no ring |
| elevated | `bg-surface-container-low text-primary shadow-m3-1` | same | `bg-primary text-on-primary shadow-m3-1` |
| text | `bg-transparent text-primary` | — | — |
| disabled (all) | `disabled:bg-on-surface/10 disabled:text-on-surface/38 disabled:shadow-none` (outlined/text: transparent container; outlined keeps an `outline-variant` ring) | | |

State layer: the ripple attachment paints `currentColor` at 0.08 for hover, 0.10 for focus-visible and 0.10 for pressed, so it automatically matches the content color. Focus ring: `focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-secondary`.

**48dp target for XS/S** (and XS/S icon buttons):

```html
<button class="relative ... after:absolute after:left-1/2 after:top-1/2 after:size-full after:min-h-12 after:min-w-12 after:-translate-1/2 after:content-['']">
```

Don't put `overflow: hidden` on the element that carries the target pseudo-element. Clip the ripple on an inner layer instead, or the 48dp area is clipped as well.

### 9.4 Icon buttons

The same pattern applies, with `--_w` taken from `[data-width]`:

| size | h | icon | narrow / default / wide width | square r | pressed r |
|---|---|---|---|---|---|
| xs | 32 | 20 | 28 / 32 / 40 | 12 | 8 |
| sm | 40 | 24 | 32 / 40 / 52 | 12 | 8 |
| md | 56 | 24 | 48 / 56 / 72 | 16 | 12 |
| lg | 96 | 32 | 64 / 96 / 128 | 28 | 16 |
| xl | 136 | 40 | 104 / 136 / 184 | 28 | 16 |

Colors: filled `bg-primary text-on-primary` (toggle off: `bg-surface-container text-on-surface-variant`); tonal `bg-secondary-container text-on-secondary-container` (on: `bg-secondary text-on-secondary`); outlined `outline-variant` ring + `text-on-surface-variant` (on: `bg-inverse-surface text-inverse-on-surface`, no ring); standard `text-on-surface-variant` (on: `text-primary`). Use the icon's `fill` axis for selected toggles (outlined → filled icon [S2]).

### 9.5 FAB and extended FAB

```css
[data-slot='fab'][data-size='fab']    { --_s: 56px; --_r: 16px; --_icon: 24px; }
[data-slot='fab'][data-size='medium'] { --_s: 80px; --_r: 20px; --_icon: 28px; }
[data-slot='fab'][data-size='large']  { --_s: 96px; --_r: 28px; --_icon: 36px; }
[data-slot='fab'][data-size='small']  { --_s: 40px; --_r: 12px; --_icon: 24px; } /* legacy */
[data-slot='fab'] { box-shadow: var(--shadow-m3-3); }
[data-slot='fab']:hover:not(:active) { box-shadow: var(--shadow-m3-4); }
```

| extended size | classes |
|---|---|
| small | `h-14 min-w-14 px-4 gap-2 rounded-[16px] text-title-md [--_icon:24px]` |
| medium | `h-20 min-w-20 px-[26px] gap-3 rounded-[20px] text-title-lg [--_icon:28px]` |
| large | `h-24 min-w-24 px-7 gap-4 rounded-[28px] text-headline-sm [--_icon:36px]` |

Color props: `primary-container` (default) | `secondary-container` | `tertiary-container` | `primary` | `secondary` | `tertiary` (+ legacy `surface` = `bg-surface-container-high text-primary`).

### 9.6 Button group squeeze (Svelte)

- The standard group is `inline-flex` with `gap` = 18/12/8/8/8 (XS..XL).
- Measure each child's natural width once, using `ResizeObserver` or `bind:offsetWidth`.
- Keep one `progress[i]` spring per item. On `pointerdown` animate it to 1. On `pointerup`/`pointercancel`, wait until it is above 0.75, then animate to 0.
- On every frame set `style:width` from the §5.3 algorithm with `r = 0.15`, and set `flex: none` on the children.
- Respect `prefers-reduced-motion` by skipping the width change and keeping the shape change.
- The connected group uses `gap: 2px` and `w-full`, with children set to `flex: 1`. It has per-position corner classes (`rounded-s-full rounded-e-[8px]` for the first child, etc.) plus `active:` inner corners of 4 (XS–M) / 12 (L) / 16 (XL), and `aria-pressed=true` → full on all corners.

### 9.7 Split button

`inline-flex gap-0.5`. The leading segment uses `rounded-s-full rounded-e-[var(--_inner)]`; the trailing segment uses `rounded-e-full rounded-s-[var(--_inner)]`, with width = 48/48/56/96/136.

- `--_inner`: 4/4/4/8/12 at rest, and 8/12/12/20/20 on `:hover`, `:focus-visible` and `:active`.
- The trailing segment with `aria-expanded=true` gets full corners on every side.
- Chevron: `translate-x-[-1px|-1px|-2px|-3px|-6px]` when collapsed, `0` plus `rotate-180` when expanded, using the standard fast-spatial curve.
- Open the menu (bits-ui DropdownMenu) with `sideOffset={4}` and `align="end"`.

### 9.8 FAB menu

Use a single `open` boolean that drives three things:

1. A `Spring` progress (fast spatial) that lerps the FAB's size (56/80/96 → 56), radius (16/20/28 → 28), icon size (→ 20), and colors (`primary-container` → `primary`, `on-primary-container` → `on-primary`; use `color-mix(in oklab, …, … calc(p*100%))` in CSS). The FAB is anchored with `position: fixed; inset-inline-end: 16px` at the bottom and grows from the top-trailing corner.
2. A stagger counter driven by the slow-effects spring. Item *i* (top→bottom) is shown when `i >= n − stagger`.
3. Per item: `clip-path: inset(0 0 0 calc((1 - w) * 100%))` (or a scaleX wrapper with origin `right`), where w is driven by fast spatial, and `opacity` driven by fast effects.

Items are `h-14 px-6 gap-2 rounded-full text-title-md`, colored `bg-primary-container text-on-primary-container`, with a `gap-1` stack and an 8px gap above the 56px close button. Allow 2–6 items. Focus moves to the first item on open, and `Esc` closes the menu and returns focus to the FAB.

---

## Open questions / not verifiable

- The **measurement images** on [S1]/[S3]/[S4]/[S5]/[S6] are not text. Values come from the token DB, which those images are generated from, and could not be read off the images directly.
- **Connected group XS inner corner:** 4 (spec text) vs. 8 (token). See §5.4.
- **Split-button rotation spring speed:** the guidelines only say "standard motion scheme". Fast spatial (0.9/1400) is a recommendation.
- **Hover elevation** for filled, tonal and elevated buttons is deprecated in the DB but still used by Compose.
- **FAB menu item resting elevation:** the common token says level0, while the color-set tokens give focused/hovered/pressed elevations of 6/8/6. Compose's menu item Surface sets no shadow. Recommendation: no shadow at rest and none on hover, because the close button carries the elevation. This is a judgment call.
- The **CSS `linear()` spring approximations** and settle durations are derived (computed here), not published values.
- `material-components-android` XML resources were not consulted. Compose `androidx-main` and the m3.material.io token DB are newer and authoritative for Expressive.

---

## Sources

**m3.material.io pages (prose rendered in browser, fetched 2026-10-06)**
- [S1] https://m3.material.io/components/buttons/specs
- [S2] https://m3.material.io/components/buttons/guidelines
- [S3] https://m3.material.io/components/icon-buttons/specs
- [S4] https://m3.material.io/components/floating-action-button/specs
- [S5] https://m3.material.io/components/extended-fab/specs
- [S6] https://m3.material.io/components/fab-menu/specs
- [S7] https://m3.material.io/components/fab-menu/guidelines
- [S8] https://m3.material.io/components/button-groups/specs
- [S9] https://m3.material.io/components/button-groups/guidelines
- [S10] https://m3.material.io/components/split-button/specs
- [S11] https://m3.material.io/components/split-button/guidelines
- [S12] https://m3.material.io/components/segmented-buttons/specs

**m3.material.io token database (JSON behind the "Tokens & specs" tables, snapshot `2026-09-23_06-10-05`)**
- [T1] Buttons (`md.comp.button`, `.xsmall`…`.xlarge`, `.filled/.tonal/.outlined/.elevated/.text`): https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.1c4257f8804f9478.json
- [T2] Icon buttons: https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.0fe2282006ae098b.json
- [T3] FAB: https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.41587918e51cca98.json
- [T4] Extended FAB: https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.36500f77b86d20a5.json
- [T5] FAB menu: https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.1a076cec8bc202c2.json
- [T6] Button groups: https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.082d7fd6e058b011.json
- [T7] Split button (+ button colors): https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.624e8f2da4007fc8.json
- [T8] Segmented button: https://m3.material.io/_dsm/data/dsdb-m3/2026-09-23_06-10-05/TOKEN_TABLE.67e2613d87ca6f98.json

**Jetpack Compose material3 (`androidx/androidx`, branch `androidx-main`)**. Base: `https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/`
- [C1] `Button.kt` (ButtonDefaults: paddings, `textStyleFor`, `iconSizeFor`, `shapesFor`, colors, elevations)
- [C2] `ButtonGroup.kt` (ExpandedRatio 0.15, squeeze algorithm, connected shapes)
- [C3] `SplitButton.kt`
- [C4] `FloatingActionButton.kt`
- [C5] `FloatingActionButtonMenu.kt`
- [C6] `ToggleButton.kt`
- [C7] `IconButtonDefaults.kt`, `IconButton.kt`
- [C8] `SegmentedButton.kt`
- [C9] `HorizontalCenterOptically.kt` (`CenterOpticallyCoefficient = 0.11f`)
- [C10] `tokens/ShapeTokens.kt`
- [C11] `tokens/ElevationTokens.kt`
- [C12] `tokens/StateTokens.kt`
- [C13] `tokens/ExpressiveMotionTokens.kt`
- [C14] `tokens/StandardMotionTokens.kt`
- [C15] `tokens/TypeScaleTokens.kt`
- [C16] `Ripple.kt`
- [C17] Split button samples: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/samples/src/main/java/androidx/compose/material3/samples/SplitButtonSamples.kt
- [C18] Generated size/color tokens in `tokens/`: ButtonXSmallTokens, ButtonSmallTokens, ButtonMediumTokens, ButtonLargeTokens, ButtonXLargeTokens, BaselineButtonTokens, FilledButtonTokens, TonalButtonTokens, OutlinedButtonTokens, ElevatedButtonTokens, TextButtonTokens, IconButtonTokens, XSmallIconButtonTokens, SmallIconButtonTokens, MediumIconButtonTokens, LargeIconButtonTokens, XLargeIconButtonTokens, FilledIconButtonTokens, FilledTonalIconButtonTokens, OutlinedIconButtonTokens, FabSmallTokens, FabBaselineTokens, FabMediumTokens, FabLargeTokens, FabPrimaryContainerTokens, ExtendedFabSmallTokens, ExtendedFabMediumTokens, ExtendedFabLargeTokens, ExtendedFabPrimaryTokens, FabMenuBaselineTokens, ButtonGroupSmallTokens, ConnectedButtonGroupSmallTokens, SplitButtonXSmallTokens…SplitButtonXLargeTokens, OutlinedSegmentedButtonTokens (`.kt`). There is no `ExtendedFabTokens.kt`, `ButtonGroupTokens.kt`, `SplitButtonTokens.kt` or `ToggleButtonTokens.kt`. The size-suffixed files replace them.
- [C19] `InteractiveComponentSize.kt` (48dp minimum)

**material-web (`material-components/material-web`, branch `main`)**
- [W1] https://raw.githubusercontent.com/material-components/material-web/main/tokens/_md-comp-focus-ring.scss
- [W2] https://raw.githubusercontent.com/material-components/material-web/main/focus/internal/_focus-ring.scss
- [W3] https://raw.githubusercontent.com/material-components/material-web/main/elevation/internal/_elevation.scss
- [W4] https://raw.githubusercontent.com/material-components/material-web/main/ripple/internal/_ripple.scss
- [W5] https://raw.githubusercontent.com/material-components/material-web/main/ripple/internal/ripple.ts
