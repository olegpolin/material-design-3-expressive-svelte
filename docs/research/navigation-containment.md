# M3 Expressive: navigation, containment and communication specs

Research notes for a Svelte 5 + Tailwind 4 implementation of Material Design 3 Expressive (M3E).
Scope: navigation bar, navigation rail, navigation drawer, app bars (top + search), toolbars
(docked / floating), bottom app bar, tabs, bottom sheets, side sheets, cards, dialogs, lists,
divider, carousel, tooltips, badges, progress indicators, loading indicator, snackbar.
Menus are covered in a separate document (see `/components/menus` on m3.material.io).

Compiled 2026-10-06.

## How to read this document

- **Units.** `dp` maps 1:1 to CSS `px` at default zoom (1dp = 1px for the web). Type sizes in `sp`
  map 1:1 to `px` (use `rem` only if you want the type to follow user font scaling).
- **Colors** are M3 color *roles* (for example `secondary-container`). Map each one to a CSS custom
  property such as `--md-sys-color-secondary-container`.
- **Elevation levels** (Compose `ElevationTokens`, [T-ELV]): level0 = 0dp, level1 = 1dp,
  level2 = 3dp, level3 = 6dp, level4 = 8dp, level5 = 12dp.
- **Shape scale** (Compose `ShapeTokens`, [T-SHP]): none 0, extra-small 4, small 8, medium 12,
  large 16, large-increased 20, extra-large 28, extra-large-increased 32, extra-extra-large 48,
  full = 50% / pill. `*-top`, `*-end`, and `*-start` variants round only those corners.
- **State layers** ([T-STA]; the m3 nav-bar page lists the same values [M-NB]): hover 8%,
  focus 10%, pressed 10%, dragged 16%. Disabled content uses 38% opacity, and a disabled
  container uses 12% (outline) or 38% (container).
- **Source tags** such as `[T-NB]` point to the **Sources** section at the end. Each tag is a URL.
  - `T-*`: Jetpack Compose material3 generated token files (androidx-main).
  - `S-*`: Compose component source.
  - `W-*`: material-web `tokens/versions/latest` Sass tokens. These are generated from the same
    Google token database as v34.0.21.
  - `D-*`: material-components-android docs.
  - `M-*`: m3.material.io pages. These pages are JavaScript-rendered, so they were read in a real
    browser.

### Type roles used below (Compose `TypeScaleTokens` [T-TS])

| Role | Size / line height | Weight | Tracking |
|---|---|---|---|
| display-small | 36 / 44 | 400 | 0 |
| headline-medium | 28 / 36 | 400 | 0 |
| headline-small | 24 / 32 | 400 | 0 |
| title-large | 22 / 28 | 400 | 0 |
| title-medium | 16 / 24 | 500 | 0.2 (Compose) |
| title-small | 14 / 20 | 500 | 0.1 |
| body-large | 16 / 24 | 400 | 0.5 |
| body-medium | 14 / 20 | 400 | 0.2 (Compose) |
| body-small | 12 / 16 | 400 | 0.4 |
| label-large | 14 / 20 | 500 | 0.1 |
| label-medium | 12 / 16 | 500 | 0.5 |
| label-small | 11 / 16 | 500 | 0.5 |

### Motion scheme (springs) used by every component below

In Compose, components ask the theme for one of six `MotionSchemeKeyTokens` [S-MS]. The
**expressive** scheme ([T-XM]) is what `MaterialExpressiveTheme` provides. The **standard** scheme
([T-SM], [W-MOTION]) is the default for `MaterialTheme`.

| Key | Expressive damping / stiffness | Standard damping / stiffness | Approx. settle time (0.1%), expressive | Overshoot (expressive) |
|---|---|---|---|---|
| fastSpatial | 0.6 / 800 | 0.9 / 1400 | ~360 ms | ~9% |
| defaultSpatial | 0.8 / 380 | 0.9 / 700 | ~430 ms | ~1.4% |
| slowSpatial | 0.8 / 200 | 0.9 / 300 | ~600 ms | ~1.5% |
| fastEffects | 1.0 / 3800 | 1.0 / 3800 | ~155 ms | 0 |
| defaultEffects | 1.0 / 1600 | 1.0 / 1600 | ~235 ms | 0 |
| slowEffects | 1.0 / 800 | 1.0 / 800 | ~330 ms | 0 |

The settle times and overshoot were computed here by simulating a unit-mass spring. They are not
published values; use them to size CSS `linear()` spring easings.

- **Spatial** springs drive position, size, scale and shape.
- **Effects** springs drive color and opacity. They never overshoot.

Duration and easing tokens ([T-MT], [W-MOTION]):

- Durations:
  - short 1–4: 50, 100, 150, 200 ms
  - medium 1–4: 250, 300, 350, 400 ms
  - long 1–4: 450, 500, 550, 600 ms
  - extra-long 1–4: 700, 800, 900, 1000 ms
- Easings:
  - standard / emphasized: `cubic-bezier(.2,0,0,1)`
  - emphasized-decelerate: `(.05,.7,.1,1)`
  - emphasized-accelerate: `(.3,0,.8,.15)`
  - standard-decelerate: `(0,0,0,1)`
  - standard-accelerate: `(.3,0,1,1)`
  - legacy: `(.4,0,.2,1)`

Implementation suggestion: expose CSS custom properties such as `--md-motion-fast-spatial`
(a `linear(...)` easing plus a duration) and a small JavaScript spring helper (Svelte 5
`Spring` from `svelte/motion` accepts `stiffness` and `damping`). Note that Svelte's `damping`
parameter is **not** the same as a Compose damping ratio. Convert the units or write a tiny
custom integrator.

---

# NAVIGATION

## 1. Navigation bar (M3E "flexible" / short navigation bar)

The baseline 80dp bar is "not recommended" in M3E. Use the flexible bar, which is shorter and
supports horizontal items in medium windows [M-NB]. Compose calls it `ShortNavigationBar`
[S-SNB]. The default theme style is `Widget.Material3Expressive.BottomNavigationView` [D-BN].

Window-size rules [M-NB]:

- Compact windows use vertical items (icon above label).
- Medium windows (≥600dp) use horizontal items (icon to the start of the label) [D-BN].
- Vertical items share the width equally.
- Horizontal items have a fixed width, and the extra space goes to the ends of the bar.

### Container

| Property | Value | Source |
|---|---|---|
| Height | **64dp**. Baseline/tall is 80dp (`TallContainerHeight`). | [T-NB], [W-NB], [D-BN] |
| Width | Full window width | [M-NB] |
| Color | `surface-container` | [T-NB], [W-NB] |
| Elevation | level2 (3dp) | [T-NB], [W-NB], [D-BN] |
| Shape | corner-none | [T-NB] |
| Item between space | 0dp | [T-NB] |
| Window insets | Content is padded by system-bar insets; `minHeight` 64 applies *inside* the insets | [S-SNB] |

### Vertical item (compact)

| Property | Value | Source |
|---|---|---|
| Active indicator | **56 × 32dp**, shape full (16dp radius) | [T-NBV], [W-NB-V] |
| Indicator color | `secondary-container` | [T-NB] |
| Icon | 24dp. Active: `on-secondary-container`. Inactive: `on-surface-variant`. | [T-NB], [T-NBV] |
| Label | **label-medium** (12/16, 500). Active: **`secondary`**. Inactive: `on-surface-variant`. No longer bolded when active. | [T-NB], [D-BN] |
| Item top/bottom padding (`ContainerBetweenSpace`) | 6dp (baseline was 12 / 16) | [T-NBV], [D-BN] |
| Indicator → label gap | 4dp | [T-NB], [S-SNB] |
| Indicator padding around icon | horizontal (56−24)/2 = 16; vertical (32−24)/2 = 4 | [S-SNB] |
| State layer | Drawn only inside the indicator pill: on-secondary-container at 8 / 10 / 10% | [W-NB], [S-NI] |
| Disabled | Icon and label at 38% | [S-SNB] |

### Horizontal item (medium windows)

| Property | Value | Source |
|---|---|---|
| Active indicator height | **40dp** (hugs content), shape full | [T-NBH], [W-NB-H] |
| Indicator leading / trailing padding | 16dp / 16dp | [T-NBH] |
| Icon → label gap | 4dp | [T-NB], [W-NB-H], [D-BN] |
| Icon | 24dp | [T-NBH] |
| Label | label-medium. The active label uses the same color as the active icon (`on-secondary-container`). | [S-SNB] (`textColor(selected, enabled, isIconPositionTop)`) |
| Item arrangement (Compose `Centered`) | The items group occupies 60 / 70 / 80 / 90% of the bar for 3 / 4 / 5 / 6 items. Side padding = `(100 − 10·(n+3))/2` %. More than 6 items gives 0 padding. | [S-SNB] |

### Badges on nav items

See §16. In the nav bar the badge is anchored to the icon:

- Small badge: offset 6dp.
- Large badge: 12dp horizontal and 14dp vertical overlap.

### Motion

| Animation | Spec | Source |
|---|---|---|
| Indicator appear/disappear | The width grows from the center (0 → 56), and alpha goes 0 → 1 together with progress. Uses **defaultSpatial** (expressive: 0.8 / 380). | [S-NI] (`animateIndicatorProgressAsState`, `Indicator`) |
| Icon/label color change | defaultEffects (1.0 / 1600) | [S-NI] |
| Icon position change (top ↔ start) | defaultSpatial. The label style switches at 50% progress. | [S-NI] |
| Baseline (80dp) bar indicator | Size: fastSpatial. Alpha: defaultEffects. | [S-NB] |
| Destination transition | "Top level transition pattern" (fade-through). The icon becomes filled. | [M-NR-G] |

### Implementation note

Build a **custom** `<NavigationBar>` (a `<nav>` with `role="tablist"`-like semantics, or simply
`<a aria-current="page">` items). Nothing in shadcn maps directly.

- Use a CSS grid with `grid-auto-flow: column; grid-auto-columns: 1fr` for vertical items.
- Use `justify-content: center` plus the percentage side padding for horizontal items.
- Animate the indicator with `transform: scaleX()` from the center plus `opacity`, using a spring
  `linear()` easing.
- Switch the item layout with a container query at a 600px window width.

---

## 2. Navigation rail (M3E collapsed / expanded, standard / modal)

The baseline 80dp rail is replaced by the **collapsed** rail. The **expanded** rail replaces the
navigation drawer [M-NR], [D-NR]. Compose implements this as `WideNavigationRail` and
`ModalWideNavigationRail` [S-WNR].

### Container

| Property | Collapsed | Expanded (standard) | Expanded (modal) | Source |
|---|---|---|---|---|
| Width | **96dp** (narrow variant 80dp) | **220dp min – 360dp max**; hugs the widest item or header | same as standard | [T-NRC], [T-NRE], [W-NR-C], [W-NR-E] |
| Color | `surface` (fill can be turned off) | `surface` | **`surface-container`** | [T-NRC], [T-NRE], [M-NR-G] |
| Elevation | level0 | level0 | **level2** (3dp) | [T-NRC], [T-NRE] |
| Shape | none | none | **corner-large (16dp)** | [T-NRE] |
| Top space (top of rail → content) | **44dp** | 44dp | 44dp | [T-NRC], [T-NRE], [D-NR] |
| Header (menu button + FAB) → first item | min **40dp** | 40dp | 40dp | [T-NRB], [D-NR] |
| Item vertical spacing | **4dp** | 0dp (`between-item-space`) | 0dp | [T-NRC], [W-NR-E], [S-WNR] |
| Expanded vertical trailing space | - | 20dp | 20dp | [W-NR-E] |
| Scrim (modal) | - | - | `scrim` at 32% | [S-WNR], [T-SCR] |
| Item alignment | top (default) or center (center recommended on tablets). The menu and FAB always stay top-aligned. | | | [M-NR-G], [S-WNR] |

### Items

| Property | Collapsed (vertical item) | Expanded (horizontal item) | Source |
|---|---|---|---|
| Item min height | **64dp** (baseline was 60) | 48dp (min touch target); indicator 56 | [T-NRB], [D-NR], [S-WNR] |
| Item horizontal padding | 20dp, so a 56dp indicator is centered in 96 | 20dp item inset + 16 indicator padding | [S-WNR], [D-NR] |
| Item top / bottom padding | 6 / 4dp | - | [T-NRB], [D-NR] |
| Active indicator | **56 × 32dp**, full | **56dp tall**, hugs icon + label; leading/trailing 16dp; "full-width" option fills the container | [T-NRV], [T-NRH], [M-NR-G] |
| Icon | 24dp | 24dp | [T-NRB] |
| Icon ↔ label gap | 4dp (below the indicator) | **8dp** (inline) | [T-NRV], [T-NRH] |
| Label type | **label-medium** | **label-large** | [T-NRV], [T-NRH] |
| Active icon | `on-secondary-container` | same | [T-NRCol] |
| Active label | **`secondary`** (vertical) | `on-secondary-container` (horizontal) | [M-NR], [T-NRCol], [S-WNR] |
| Inactive icon / label | `on-surface-variant` | same | [T-NRCol] |
| Indicator color | `secondary-container` | same | [T-NRCol] |
| State layer color | on-secondary-container (8 / 10 / 10%) | same | [T-NRCol] |
| Target area | Always spans the **full rail width** | same | [M-NR] |

Header slot contents:

- Menu icon button (24dp icon, 48dp target).
- FAB, at elevation **level0** when it sits inside the rail [M-NR-G]. On expand, the FAB
  transitions to an Extended FAB [M-NR-G].

Badges: in the collapsed rail the badge goes on the icon's top-end corner. In the expanded rail it
goes **next to the label** [M-NR-G].

### Motion

| Animation | Spec | Source |
|---|---|---|
| Expand / collapse width (standard) | `animateDpAsState`, **defaultSpatial** (0.8 / 380 expressive) for both minWidth and fullRange width | [S-WNR] |
| Expand / collapse width (modal) | **fastSpatial** (0.6 / 800) | [S-WNR] |
| Item spacing 4 → 0, item min height 64 → 48 | defaultSpatial | [S-WNR] |
| Modal open/close state | defaultSpatial; scrim alpha defaultEffects | [S-WNR] |
| Item icon-position morph (top → start) | defaultSpatial; label style swaps at 50% | [S-NI] |
| Indicator select | Expands from the icon center (width × progress, alpha). defaultSpatial. | [S-NI], [M-NR-G] |
| Predictive back (modal) | Scales up to 24dp in x and 48dp in y, pivot at y = 0.5 | [S-WNR] |

### Implementation note

Build a custom `<NavigationRail expanded modal>`.

- Standard mode: a `<nav>` with `width` driven by a spring (animate the CSS `width` or a
  `grid-template-columns` track). Content reflows automatically [M-NR-G].
- Modal mode: reuse **bits-ui `Dialog`** (focus trap, scrim, Escape key) or shadcn **Sheet**
  (`side="left"`) with a custom surface: 16dp radius, surface-container, level2.
- shadcn **Sidebar** is not installed, and its collapsible "icon" mode has a different geometry.
  Borrowing only its state context is optional.

---

## 3. Navigation drawer (baseline; M3E says use the expanded rail instead)

The drawer is "no longer recommended in the Material 3 Expressive update" [M-ND].

| Property | Value | Source |
|---|---|---|
| Container width | **360dp**, height 100% | [T-ND], [M-ND] |
| Shape | Standard: corner-large-end (0, 16, 16, 0) [M-ND]. Bottom variant: large-top. | [T-ND], [W-ND] |
| Standard color / elevation | `surface` / level0 | [T-ND] |
| Modal color / elevation | **`surface-container-low`** / level1 | [T-ND], [M-ND] |
| Scrim | `scrim` 32% (Compose). material-web drawer token: neutral-variant20 at 40%. Android `DrawerLayout`: black at 60%. | [T-SCR], [W-ND], [D-ND] |
| Active indicator | **336 × 56dp**, full (28dp radius), `secondary-container` | [T-ND], [M-ND] |
| Container padding (left / right) | 28dp = 12dp indicator inset + 16dp inner start padding | [M-ND], [S-ND] (`ItemPadding` horizontal 12; item content start 16 / end 24) |
| Icon | 24dp, icon → label gap **12dp** | [T-ND], [S-ND] |
| Label | label-large. Active and every interacting state: `on-secondary-container`. Inactive: `on-surface-variant`. Inactive hover / focus / pressed: `on-surface`. | [T-ND] |
| Headline (section title) | title-small, `on-surface-variant` | [T-ND] |
| Badge label (trailing) | label-large, `on-surface-variant` | [T-ND] |
| Item min height | 56dp; padding between elements 0dp | [S-ND], [M-ND] |
| Divider insets | 28dp each side (Android) | [D-ND] |
| Min drawer width (Compose) | 240dp | [S-ND] |
| Open motion | defaultSpatial | [S-ND] |
| Close motion | **fastEffects** | [S-ND] |
| Swipe thresholds | 50% positional, 400dp/s velocity | [S-ND] |
| Predictive back | Scale x grows up to 12dp or shrinks up to 24dp; y up to 48dp | [S-ND] |

### Implementation note

Use shadcn **Sheet** (bits-ui Dialog) for the modal drawer. Use a plain `<aside>` for the standard
drawer. Item = an `<a>` with `aria-current`. Draw the indicator as the item background
(`rounded-full`, `mx-3`, `h-14`).

---

## 4. App bars (top): small, medium flexible, large flexible, search app bar

M3E renamed the component "app bar":

- Added the **search app bar**.
- Merged center-aligned into small, as the "centered" text configuration.
- Deprecated medium and large in favor of **medium flexible** and **large flexible**, which are
  shorter, have larger titles and subtitles, and wrap text [M-AB], [D-TAB].

### Common (all sizes) [T-AB], [W-AB]

| Property | Value |
|---|---|
| Container color | `surface` |
| **Scrolled container color** | **`surface-container`**, elevation level2 ("on scroll"). The switch fires when overlapped fraction > 0.01, animated with defaultEffects [S-AB]. |
| Elevation (flat) | level0 |
| Shape | none |
| Leading space / trailing space | 4dp / 4dp (horizontal padding). Title inset = 16 − 4 = 12dp after the nav icon area [S-AB]. |
| Icon button space | 0dp |
| Icon size | 24dp |
| Avatar | 32dp |
| Leading icon color | `on-surface` |
| Trailing icon color | `on-surface-variant` |
| Title color / subtitle color | `on-surface` / `on-surface-variant` |
| Title alignment | start (default) or centered |

### Per size

| Variant | Height (no subtitle / with subtitle) | Title type | Subtitle type | Title bottom padding (expanded) | Source |
|---|---|---|---|---|---|
| Small | **64dp** | title-large | label-medium | - | [T-ABS], [W-AB-S] |
| Medium flexible | **112dp / 136dp**; collapses to 64 | **headline-medium** | label-large | 24dp | [T-ABMF], [W-AB-MF], [S-AB] |
| Large flexible | **120dp / 152dp**; collapses to 64 | **display-small** | title-medium | 28dp | [T-ABLF], [W-AB-LF], [S-AB] |
| Medium (baseline, deprecated) | 112dp | headline-small | - | 24dp | [T-ABM], [M-AB] |
| Large (baseline, deprecated) | 152dp | headline-medium | - | 28dp | [T-ABL] |

Medium and large flexible bars **hug their text**, so they are taller when a subtitle is present
[M-AB].

Trailing actions may be replaced by **one filled or tonal icon button** (default or wide). In the
small bar an image or logo may replace the title [M-AB].

### Search app bar [W-AB], [W-AB-S], [M-AB]

| Property | Value |
|---|---|
| Container | `surface` app bar, 64dp tall |
| Search field height / shape | **56dp**, corner-full |
| Search field color | `surface-container` → **`surface-container-highest` on scroll** |
| Search leading / trailing space | 8dp / 8dp |
| Hint text | body-large, `on-surface-variant` |
| Elements | Leading button, then the search container (with optional trailing icon or avatar inside), then optional trailing buttons outside the field |
| Behavior | Tapping opens the **search view** (full-screen 72dp header or docked, `surface-container-high`, level3; docked shape extra-large 28) [T-SV], [W-SV] |

Search bar tokens (non app-bar) [T-SB], [W-SB]:

- Container: 56dp, full shape, `surface-container-high`, level3.
- Leading / trailing space 16dp; icon → label 16dp.
- Avatar 30dp.
- Contained variant: margins 24dp, avatar target 48dp, motion = fastSpatial spring.

### Scroll behavior [S-AB]

| Behavior | Spec |
|---|---|
| Pinned | Only the container color changes |
| Enter-always / exit-until-collapsed | Height offset follows the scroll. On release it snaps with `snapAnimationSpec` = **fastSpatial**; flings use spline decay. |
| Collapsing title | The top (large) title alpha uses `CubicBezierEasing(.8,0,.8,.15)` (`TopTitleAlphaEasing`). The small title cross-fades in. |

### Implementation note

Build a **custom** `<AppBar size="small|medium|large" centered>` (`<header>`).

- Scroll color: an `IntersectionObserver` or `scroll-timeline` toggles `data-scrolled`, which
  transitions `background-color` with an effects easing.
- Collapsing medium/large: use a CSS scroll-driven animation (`animation-timeline: scroll()`)
  where supported, with a JavaScript fallback.
- The search field can reuse shadcn **Input** / **InputGroup**. Its open state = **Dialog**
  (full-screen) or **Popover** (docked).

---

## 5. Toolbars (M3E): docked toolbar and floating toolbar

New in M3E. The **docked toolbar replaces the bottom app bar**. The floating toolbar can be
horizontal or vertical and supports standard and vibrant colors [M-TB], [D-DT], [D-FT].

Common rule [M-TB]: "all toolbars are 64dp high, center-aligned, have equal padding between items,
and have a minimum outside padding of 16dp."

### Docked toolbar [T-DT], [W-TB-D]

| Property | Value |
|---|---|
| Height | **64dp** |
| Width | 100% of the window. Rounded corners are allowed only on web or large screens [M-TB-G]. |
| Color | `surface-container` (standard). Vibrant variant exists: `primary-container` [D-DT]. |
| Shape | none |
| Leading / trailing padding | **16dp** |
| Item spacing | min **4dp**, default/max **32dp**. Compact windows: even spacing. Medium and wider: center everything, or center one key action with the rest at the edges [M-TB-G]. |
| Compose `FlexibleBottomAppBar` | Height 64. Default arrangement `SpaceBetween`; fixed arrangement = spacedBy(32) centered. Snap animation **fastSpatial**. [S-AB] |
| Scroll | Stays put, or animates off-screen [M-TB-G] |

### Floating toolbar [T-FT], [W-TB-F], [S-FT]

| Property | Value |
|---|---|
| Size | **64dp** tall (horizontal) / 64dp wide (vertical) |
| Shape | **corner-full** |
| Content padding | **8dp** on all sides (leading/top 8, trailing/bottom 8) |
| Item gap | **4dp** (`container-between-space`) |
| Screen offset (margin) | **16dp** horizontal [T-FT]. Vertical toolbars need a ≥ **24dp** margin [W-TB-F], [M-TB-G]. |
| Elevation | Token **level3** [W-TB-F]. The guidelines say floating toolbars "have elevation by default", which may be removed on distinct backgrounds [M-TB-G]. Compose `FloatingToolbarDefaults` currently uses level0, or level1 when paired with a FAB (marked TODO) [S-FT]. |
| Standard colors | Container `surface-container`. Icons `on-surface-variant`. Selected (toggle) button `secondary-container` / `on-secondary-container` [W-TB-STD]. |
| Vibrant colors | Container **`primary-container`**. Icons `on-primary-container`. Selected button **`surface-container` / `on-surface`** [T-FT], [W-TB-VIB]. |
| Disabled | `on-surface` at 38% |
| Items | Icon buttons (avoid square ones in a floating toolbar), buttons, text fields. Avoid wide buttons in vertical toolbars [M-TB-G]. |
| Overflow | When items don't fit before the 16dp margin, the trailing items move into a menu [M-TB-G] |

### Floating toolbar + FAB [W-TB-FAB], [S-FT]

| Property | Value |
|---|---|
| Toolbar → FAB gap | **8dp** |
| FAB size | 56dp (corner-large 16, level1) or medium 80dp (corner-large-increased 20, level2). Icon 24 / 28. Compose range: baseline FAB 56 to medium FAB 80. |
| FAB color | Standard: `secondary-container` / `on-secondary-container` [W-TB-FAB] (Compose uses `primary-container`) [S-FT]. Vibrant: `tertiary-container` / `on-tertiary-container` [W-TB-FAB], [S-FT]. |
| FAB elevation in Compose | level2; hover level3 [S-FT] |

### Motion and behavior [S-FT], [M-TB-G]

| Behavior | Spec |
|---|---|
| Expand / collapse (show or hide items) | `expandHorizontally` / `shrinkHorizontally` (or vertically) with **fastSpatial** |
| Exit-always scroll (hide on scroll) | Exit direction Bottom / Top / Start / End. Snap uses **defaultEffects**; fling uses spline decay. Collapse threshold `ScrollDistanceThreshold` = **40dp**. |
| Collapse into a FAB / key action on scroll | Compose only. Don't collapse *and* scroll off at the same time. |

### Implementation note

Build a custom `<Toolbar variant="docked|floating" color="standard|vibrant" orientation>`.

- Use `role="toolbar"` with roving tabindex. bits-ui **Toolbar** (installed with bits-ui) provides
  keyboard handling and toggle groups: `Toolbar.Root`, `Toolbar.Button`, `Toolbar.Group`.
- Implement hide-on-scroll with a scroll listener that toggles a `translate` transform.

---

## 6. Bottom app bar (baseline, not recommended in M3E)

| Property | Value | Source |
|---|---|---|
| Height | **80dp**. A 72dp "with FAB" container height token also exists. | [T-BAB], [W-BAB] |
| Color / elevation / shape | `surface-container` / level2 / none | [T-BAB], [M-TB] |
| Horizontal padding | 4dp (16 − 12 icon-button touch inset) | [S-AB] |
| Vertical padding | 4dp | [S-AB] |
| FAB padding | 12dp from the end; 8dp vertical (12 − 4) | [S-AB] |
| Hide on scroll | Height-offset scroll behavior; snap with fastSpatial | [S-AB] |

### Implementation note

Treat this as the docked toolbar plus an optional FAB slot. Don't build a separate component.

---

## 7. Tabs (primary and secondary)

Unchanged in M3E. Values are from [M-TABS] unless marked otherwise.

| Property | Primary | Secondary | Source |
|---|---|---|---|
| Container height (label only) | **48dp** | 48dp | [M-TABS], [T-PT], [T-ST] |
| Container height (icon + label stacked) | **64dp** | (icon tab) 64 | [M-TABS], [W-PT]. Compose `LargeTabHeight` and Android use 72dp [S-TAB], [D-TABS]. |
| Container color | `surface`, level0 | `surface` | [T-PT], [T-ST] |
| Active indicator height | **3dp** | **2dp** | [M-TABS], [W-PT], [W-ST]. Compose's default `SecondaryIndicator` also uses 3dp [S-TR]. |
| Active indicator shape | **3, 3, 0, 0** (rounded top) | square | [M-TABS], [W-PT] |
| Active indicator width | Matches the content (label or icon) width, min **24dp**, inset 2dp each side | Full tab width | [M-TABS], [S-TR] |
| Indicator color | `primary` | `primary` | [T-PT], [W-ST] |
| Divider | 1dp, `surface-variant` (tokens). Page roles list `outline-variant`. Sits inside the container at the bottom. | same | [T-ST], [W-PT], [M-TABS] |
| Label type | **title-small** (14/20/500; same metrics as label-large) | title-small | [T-PT], [T-ST], [W-PT] |
| Active label/icon | `primary` | `on-surface` | [T-PT], [T-ST] |
| Inactive label/icon | `on-surface-variant`. Hover / focus / pressed: `on-surface`. | same | [T-PT], [T-ST] |
| State layers | Active: primary. Inactive: on-surface (pressed: primary). | on-surface | [W-PT], [W-ST] |
| Icon | 24dp | 24dp | [M-TABS] |
| Inline icon → text gap | 8dp | - | [M-TABS], [S-TAB] |
| Text → badge gap | 4dp. A badge overlaps a stacked icon by 6dp. | | [M-TABS] |
| Horizontal text padding | 16dp | 16dp | [S-TAB] |
| Scrollable tabs | Min tab width 90dp (Compose) / 72dp (Android); edge start padding 52dp | | [S-TR], [D-TABS] |

### Motion [S-TR], [S-TAB]

- Indicator offset and width: **defaultSpatial** spring.
- Scrollable row auto-scroll: defaultSpatial.
- Label/icon color: fade-in uses defaultEffects; fade-out uses fastEffects.

### Implementation note

Base this on shadcn/bits-ui **Tabs** (`Tabs.Root`, `Tabs.List`, `Tabs.Trigger`). Add an absolutely
positioned indicator element that measures the active trigger (or its inner label span for
primary tabs) and moves with a spring.

---

## 8. Bottom sheets (standard and modal)

Both variants share specs. The modal sheet adds a scrim [M-BS].

| Property | Value | Source |
|---|---|---|
| Color | **`surface-container-low`** | [T-SHB], [M-BS] |
| Shape | **extra-large top (28dp top corners)**. Minimized: none. | [T-SHB] |
| Elevation | level1 (standard and modal) | [T-SHB], [D-BS] |
| Max width | **640dp**. Full width below that. | [S-SD], [M-BS] |
| Top margin | **72dp**. Windows > 640dp: top 56dp and side margins 56dp. | [M-BS] |
| Drag handle | **32 × 4dp**, `on-surface-variant` (material-web adds opacity 0.4), shape full (Compose passes `shapes.extraLarge`), centered | [T-SHB], [W-SHB], [S-SD] |
| Drag handle padding | **22dp** top and bottom, so the touch area is 48dp | [S-SD], [M-BS] |
| Peek height (standard, partially expanded) | 56dp | [S-SD] |
| Scrim | `scrim` at **32%** | [T-SCR], [S-SD] |

### Motion and drag physics [S-BS], [S-SD], [S-MBS]

| Animation | Spec |
|---|---|
| Show / expand | **defaultSpatial** |
| Hide | **fastEffects** |
| Anchored drag settle / fling | defaultSpatial |
| Scrim fade | defaultEffects |
| Positional threshold | 56dp |
| Velocity threshold | 125dp/s |
| Boundary dampening zone | 125dp above the hidden anchor (prevents expressive spring overshoot) |
| Legacy fallback spec | `tween(300ms, FastOutSlowIn)` |
| Predictive back | Scales x by up to 24dp and y by up to 48dp, pivoted at the sheet bottom |

### Implementation note

Use shadcn **Drawer** (**vaul-svelte**, already installed) for the modal and draggable bottom
sheet. It supports snap points, drag-to-dismiss and a handle. Restyle it:

- `rounded-t-[28px]`, `max-w-[640px]`, `bg-surface-container-low`.
- Handle `w-8 h-1` with `py-[22px]`.
- Swap vaul's default spring/tween for the defaultSpatial `linear()` easing.

The standard (non-modal) sheet is a fixed `<section>` with the same styles.

---

## 9. Side sheets (standard and modal)

| Property | Standard | Modal | Source |
|---|---|---|---|
| Width | Default **256dp** (docked width token); **max 400dp** | Max 400dp | [W-SS], [M-SS] |
| Color | `surface` | **`surface-container-low`** | [W-SS], [M-SS], [D-SS] |
| Elevation | level0 | level1 | [W-SS] |
| Shape | none (docked). Detached: corner-large 16. | **corner-large-start** (16dp on the inner edge). Detached: 16. | [W-SS], [D-SS] |
| Detached margins | 16dp | 16dp | [M-SS] |
| Start / end padding | 24dp | 24dp (16dp start when there is a back icon) | [M-SS] |
| Padding between top elements | 12dp | 12dp | [M-SS] |
| Headline | title-large, `on-surface-variant` | same | [W-SS] |
| Bottom actions area | 72dp tall; padding 16 top / 24 bottom; left-aligned | same | [M-SS] |
| Divider | `outline` (token) / `outline-variant` (page roles) | | [W-SS], [M-SS] |
| Scrim | - | `scrim` 32% | [T-SCR] |

Compose material3 has **no side-sheet tokens or component** (no `SheetSideTokens.kt` in androidx-main
[T-DIR]). Values come from material-web and m3.

### Implementation note

Use shadcn **Sheet** (`side="right"`/`"left"`, bits-ui Dialog) for the modal sheet. Use an
`<aside>` in the page grid for the standard sheet. For motion, reuse the drawer's springs: open
defaultSpatial, close fastEffects.

---

# CONTAINMENT

## 10. Cards (elevated, filled, outlined)

M3E did **not** change card radii. The m3 specs page still lists a **12dp** corner radius [M-CARD].

| Property | Elevated | Filled | Outlined | Source |
|---|---|---|---|---|
| Container color | **`surface-container-low`** | **`surface-container-highest`** | **`surface`** | [T-EC], [T-FC], [T-OC] |
| Shape | corner-medium **12dp** | 12dp | 12dp | [T-EC], [M-CARD] |
| Elevation: enabled | **level1** | level0 | level0 | [T-EC], [T-FC], [T-OC] |
| Elevation: hover | **level2** | **level1** | **level1** | same |
| Elevation: focus / pressed | level1 | level0 | level0 | same |
| Elevation: dragged | **level4** | **level3** | **level3** | same |
| Outline | - | - | **1dp `outline-variant`**. Focus: `on-surface`. Disabled: `outline` at 12%. | [T-OC] |
| Disabled | `surface` container at 38%, level1 | `surface-variant` at 38% | outline 12% | [T-EC], [T-FC], [T-OC] |
| State layer | `on-surface` (8 / 10 / 10 / 16%) | same | same | [W-EC] |
| Icon (inside card) | 24dp, `primary` | same | same | [T-EC] |
| Left / right padding | 16dp | | | [M-CARD] |
| Gap between cards | 8dp max | | | [M-CARD] |
| Focus indicator | `secondary` | | | [T-EC] |

Checkable cards (Android) [D-CARD]:

- Check icon: 24dp, margin 8dp.
- Checked stroke: `secondary`.

### Implementation note

Extend shadcn **Card** (`card.svelte`) with `variant` (elevated / filled / outlined) and an
`interactive` mode. In interactive mode the card renders as `<button>`/`<a>` with a state-layer
`::before` and a box-shadow transition between elevation levels (effects easing).

---

## 11. Dialogs (basic and full-screen)

### Basic dialog [M-DLG], [T-DLG], [S-AD]

| Property | Value |
|---|---|
| Width | **min 280dp, max 560dp** |
| Height | dynamic |
| Shape | **extra-large (28dp)** |
| Color | **`surface-container-high`** |
| Elevation | **level3** (6dp) |
| Padding | **24dp** on all sides |
| Icon (optional) | 24dp, `secondary`. Icon → title gap 16dp. With an icon, content is center-aligned; without one, it is start-aligned. |
| Headline | **headline-small** (24/32), `on-surface`. Headline → body gap **16dp**. |
| Supporting text | **body-medium**, `on-surface-variant` |
| Body → actions gap | 24dp |
| Actions | label-large, `primary` text buttons; 8dp between buttons (main and cross axis); right-aligned |
| Divider (optional) | 1dp, `outline` |
| Scrim | `scrim` at **32%** [T-SCR] |
| Window insets (Android) | 24dp horizontal, 80dp vertical [D-DLG] |

### Full-screen dialog [M-DLG], [W-FSD]

| Property | Value |
|---|---|
| Shape | 0dp; max width 560dp (on large screens) |
| Color | `surface` (token). The page lists `surface-container-high`. |
| Header | **56dp** tall; close icon 24dp; headline **title-large** `on-surface`; header on scroll: `surface-container` + level2 |
| Bottom action bar | 56dp |
| Padding | 24dp top / left / right; 8dp between elements |
| Action text | label-large, `primary` |
| Divider | 1dp |

### Motion

Compose `AlertDialog` relies on the platform window animation and has no Material motion token.
Use the M3 container-transform / fade + scale pattern with emphasized easings, or the expressive
springs (defaultSpatial for scale, defaultEffects for opacity). This is a recommendation, not a
published spec.

### Implementation note

Use shadcn **Dialog** / **AlertDialog** (bits-ui).

- Restyle: `rounded-[28px]`, `p-6`, `min-w-[280px] max-w-[560px]`,
  `bg-surface-container-high shadow-level3`, headline-small title.
- For the full-screen variant, set `size="fullscreen"` below the medium breakpoint.

---

## 12. Lists (M3E expressive list: standard and segmented)

M3E adds **expressive lists**: segmented style, rounded corners, a highlighted selection state and
customizable slots. Baseline lists are "not recommended" [M-LIST]. Android implements these with
`ListItemLayout` and position states first / middle / last / single [D-LIST].

### Item geometry [T-L], [W-LIST], [S-LID]

| Property | Value |
|---|---|
| One-line height | **56dp** |
| Two-line height | **72dp** |
| Three-line height | **88dp**. At ≥ 88dp, content and leading/trailing elements top-align; below that they center. The Compose breakpoint is the midpoint (80dp) minus padding. |
| Leading / trailing padding | **16dp / 16dp** |
| Top / bottom padding (expressive) | **10dp / 10dp** (baseline: 8, or 12 for three-line) [S-LI] |
| Gap between leading / content / trailing | **12dp** (expressive; baseline was 16) |
| Leading avatar | **40dp**, full; `primary-container` / `on-primary-container`; label title-medium |
| Leading icon | 24dp baseline / **20dp expressive**, `on-surface-variant` |
| Trailing icon | 24dp baseline / **20dp expressive** |
| Leading image | **56 × 56dp**; baseline shape none, expressive corner-small 8 |
| Leading video | small **100 × 56dp**, large **114 × 64dp**, corner-small 8 |
| Divider | 1dp, insets 16 leading / 16 trailing, 0 top/bottom (`outline` token; page lists `outline-variant`) |
| Min target | 48dp |

### Type and color

| Element | Type | Color | Selected color |
|---|---|---|---|
| Label (headline) | body-large | `on-surface` | `on-secondary-container` |
| Supporting text | **body-medium** | `on-surface-variant` | `on-secondary-container` |
| Overline | label-small | `on-surface-variant` | `on-secondary-container` |
| Trailing supporting text | label-small | `on-surface-variant` | `on-secondary-container` |
| Container | - | `surface`. Segmented items: `surface` per token; place them on a contrasting background. | **`secondary-container`** |

Disabled: content `on-surface` at 38%. State layer for disabled items: 10%.

Source for this table: [T-L], [W-LIST].

### Expressive shapes (shape morphing) [T-L], [M-LIST], [S-LID]

| State | Shape |
|---|---|
| Unselected item (segmented) | **4dp inner corners (extra-small), 16dp outer corners** on the first and last items (`ContainerShape` = corner-large) |
| Hovered | corner-medium **12dp** |
| Focused / pressed | corner-large **16dp** |
| Selected (any state) | **16dp** all around |
| Dragged (reorder) | 16dp, elevation **level4**; container `tertiary-container` / `on-tertiary-container`; drop zone `surface-container-low` [T-RL] |
| Segmented gap | **2dp** between items |

Swipe-to-reveal item (Android Views only): `surface` container, corner-large; action icon button
`primary` / `on-primary`.

### Motion [S-LI]

| Animation | Spec |
|---|---|
| Container / content color | defaultEffects |
| Shape morph (corner radius) | **fastSpatial** |
| Elevation (drag) | fastSpatial |

### Implementation note

Build the list on the shadcn **Item** component (installed: `item`) or on a custom `<ListItem>`
with leading / content / trailing slots (Svelte snippets).

- Segmented style: a `flex flex-col gap-[2px]` wrapper. Use `:first-child` / `:last-child` to set
  the 16dp outer radii and `rounded-[4px]` elsewhere.
- Selection: animate `border-radius` with a fastSpatial `linear()` easing.
- Single-select and multi-select lists: use bits-ui **RadioGroup** / **Checkbox** semantics, or
  `role="listbox"`.

---

## 13. Divider

| Property | Value | Source |
|---|---|---|
| Thickness | **1dp**. Android also has an 8dp "heavy" divider. | [T-DIV], [D-DIV] |
| Color | **`outline-variant`** | [T-DIV], [M-DIV] |
| Full-width | 100% | [M-DIV] |
| Inset | left margin 16dp, right 0 | [M-DIV] |
| Middle-inset | 16dp left and right | [M-DIV] |
| Gap to a subheader / supporting text | 4dp; right and bottom margins 8dp | [M-DIV] |

### Implementation note

Restyle shadcn **Separator** (bits-ui) and add an `inset="none|start|middle"` prop.

---

## 14. Carousel

Layouts [M-CAR]: multi-browse, uncontained, uncontained multi-aspect-ratio, hero, center-aligned
hero, full-screen.

### Item [W-CAR], [M-CAR]

| Property | Value |
|---|---|
| Item corner radius | **28dp** (corner-extra-large) |
| Item color | `surface`, level0. Hover: level1. State layer `on-surface`. |
| With outline | 1dp `outline`; disabled outline 12% |
| Disabled | 38% |
| Small item width | **40–56dp**, dynamic |
| Medium item width | dynamic: (large + small) / 2 target [S-KL] |
| Large item width | dynamic or user-set (preferred width) |

### Layout measurements [M-CAR]

| Layout | Leading / trailing padding | Top / bottom padding | Gap between items | Alignment |
|---|---|---|---|---|
| Multi-browse | 16 / 16dp | 8dp | **8dp** | vertically centered |
| Uncontained | 16dp leading (items bleed over the trailing padding while scrolling) | 8dp | 8dp | vertically centered |
| Uncontained multi-aspect | 16dp leading only | 8dp | 8dp | vertically centered |
| Hero | 16 / 16dp; at least 1 large + 1 small item | 8dp | 8dp | vertically centered |
| Center-aligned hero | 16 / 16dp; 1 large + 2 small items | 8dp | 8dp | vertically centered |
| Full-screen | 0 | 0 | **16dp** | centered |

### Keyline algorithm (Compose) [S-KL], [S-CAR]

- Target small item = `clamp(large/3, 40, 56)`. Target medium = `(large + small) / 2`.
- Anchor (off-screen) item size = 10dp.
- The arrangement search minimizes a "cost" over counts of large items, medium items (1 or 0) and
  small items (1).
- Items are **masked** (clipped) rather than resized, so content keeps its aspect ratio. Masks use
  `clipShape` = the 28dp rounded rectangle.
- Item z-index = `1 / (1 + distance)`.
- Compose default item spacing = 0. The m3 spec gap is 8dp, so pass `itemSpacing = 8.dp`.

### Motion

| Behavior | Spec | Source |
|---|---|---|
| Snap (multi-browse and hero) | `spring(stiffness = StiffnessMediumLow = 400, damping 1)` | [S-CAR] |
| Fling | Multi-browse: decay + snap. Hero: `singleAdvanceFlingBehavior` (one item per fling). Uncontained: no snap. | [S-CAR] |
| Parallax | Optional image parallax inside the mask (`CarouselParallaxScrollEffect`) | [S-CAR] |

### Implementation note

shadcn **Carousel** (embla-carousel-svelte) is **not installed** yet (`src/lib/components/ui` has no
carousel). Embla gives snapping and dragging, but M3 masking needs a custom "tween" plugin. Embla's
`scroll` event drives each slide's mask width (`clip-path: inset(... round 28px)`) based on keyline
interpolation.

Alternative: CSS scroll-snap plus scroll-driven animations (`view-timeline`) to animate each
item's `clip-path` and `width`. Simpler, and works without JavaScript in modern browsers.

---

# COMMUNICATION

## 15. Tooltips (plain and rich)

### Plain tooltip [M-TT], [T-PTT], [S-TT]

| Property | Value |
|---|---|
| Container height | **24dp** min |
| Min width / max width | 40dp / **200dp** |
| Padding | **8dp** horizontal, 4dp vertical |
| Shape | corner-extra-small **4dp** |
| Color | **`inverse-surface`**; text `inverse-on-surface` |
| Text | **body-small** (12/16) |
| Gap from anchor | 4dp |
| Caret (optional) | 16 × 8dp |

### Rich tooltip [M-TT], [T-RTT], [S-TT]

| Property | Value |
|---|---|
| Max width | **320dp** |
| Shape | corner-medium **12dp** |
| Color | **`surface-container`**, elevation **level2** |
| Padding | **12dp top**, **8dp bottom**, **16dp left/right** (m3). Compose uses baseline-to-subhead metrics: 28dp top to subhead first baseline, 24dp subhead to text, 16dp text bottom. |
| Subhead | **title-small**, `on-surface-variant` |
| Supporting text | **body-medium**, `on-surface-variant` |
| Actions | up to 2 text buttons; label-large, `primary`; min height 36dp; 8dp bottom padding |

### Motion and timing [S-TT], [S-BTT]

| Item | Spec |
|---|---|
| Show / hide scale | 0.8 → 1, **fastSpatial** |
| Show / hide opacity | 0 → 1, **fastEffects** |
| Auto-dismiss (plain, non-persistent) | **1500 ms** (`TooltipDuration`) |

### Implementation note

Plain tooltip: restyle shadcn **Tooltip** (bits-ui; set `delayDuration`).

Rich tooltip: bits-ui **Popover**, or **HoverCard** when it opens on hover. Rich tooltips can hold
actions, so they need focus management.

---

## 16. Badges

| Property | Value | Source |
|---|---|---|
| Small badge | **6 × 6dp**, full shape (3dp radius), `error` | [T-BDG], [M-BDG] |
| Large badge | **16dp** tall, min 16dp wide, full shape (8dp radius), `error` | [T-BDG], [M-BDG] |
| Large badge max size | **16 × 34dp** (for example "999+") | [M-BDG] |
| Large badge label | **label-small** (11/16), `on-error` | [T-BDG], [W-BDG] |
| Horizontal padding inside the large badge | 4dp | [S-BDG], [M-BDG] |
| Small badge offset | 6 × 6dp from the icon's top-trailing corner to the badge's bottom-leading corner | [M-BDG], [S-BDG] |
| Large badge offset | 14 × 12dp (14dp vertical overlap, 12dp horizontal) | [M-BDG], [S-BDG] |
| Placement in nav rail (expanded) / drawer | Next to the label (trailing) | [M-NR-G], [T-ND] |

### Implementation note

Custom `<Badge>`. shadcn **Badge** is a pill chip with different semantics, so reuse it only for
class merging. Position the badge with `absolute` relative to an icon wrapper. Use
`top: -6px; inset-inline-start: calc(100% - 6px)` for the small badge and
`top: -14px; inset-inline-start: calc(100% - 12px)` for the large badge.

---

## 17. Progress indicators (linear and circular; flat and wavy)

New in M3E [M-PI], [D-PI]:

- Configurable thickness (default 4dp, "thick" 8dp sample).
- **Wavy** shape.
- A gap between track and indicator.
- A stop indicator.
- The indeterminate circular indicator now shows its track.

### Shared [T-PI], [W-PI]

| Property | Value |
|---|---|
| Active indicator color | **`primary`** |
| Track color | **`secondary-container`**. The MDC Android docs still say `primary-container` [D-PI]. |
| Shapes (active, track, stop) | corner-full (round caps) |
| Track ↔ indicator gap | **4dp** |
| Stop indicator | **4dp** dot, `primary`, at the track end (linear determinate only) |

### Linear [T-LPI], [W-PI-L], [S-PI], [S-WPI]

| Property | Default (flat) | Wavy | Thick (8dp) |
|---|---|---|---|
| Track / active thickness | **4dp** | 4dp stroke | **8dp** |
| Container height | 4dp | **10dp** (`WaveHeight`) | flat 8dp; thick wavy 14dp |
| Wave amplitude | - | **3dp** | - |
| Wavelength (determinate) | - | **40dp** | - |
| Wavelength (indeterminate) | - | **20dp** | - |
| Stop size / stop trailing space | 4dp / 0dp. Compose internal default is 6dp (`StopIndicatorTrailingSpace`) | | 4dp / 2dp |
| Default width (Compose) | 240dp | 240dp | |
| Inset from screen edge | 4dp [M-PI] | | |

### Circular [T-CPI], [W-PI-C], [S-WPI], [D-PI]

| Property | Default (flat) | Wavy | Thick |
|---|---|---|---|
| Size (outer diameter) | **40dp** | **48dp** (`WaveSize`) | flat 44dp [D-PI]; wavy/thick token 52dp [W-PI-C] |
| Track / active thickness | **4dp** | 4dp | 8dp |
| Wave amplitude | - | **1.6dp** | |
| Wavelength | - | **15dp**. Vertex count = `max(5, round(2πr / wavelength))`. | |
| Track gap | 4dp | 4dp | 4dp |
| Wavy shape | The active path morphs between a circle and a `RoundedPolygon.star` (innerRadius 0.75, rounding 0.35 / smoothing 0.4, inner rounding 0.5) [S-CW] | | |

### Motion [S-PI], [S-WPI], [S-LW], [S-CW]

| Animation | Spec |
|---|---|
| Determinate progress (flat) | `spring(damping 1, StiffnessVeryLow = 50)`, visibility threshold 0.001 (about 1.3 s to settle) |
| Determinate progress (wavy) | `tween(500ms = DurationLong2, linear)` |
| Wave travel speed | default `waveSpeed = wavelength`, i.e. **1 wavelength per second** (linear, infinite). Period = `wavelength / speed × 1000 ms` = 1000 ms; minimum 50 ms. |
| Wave amplitude vs progress | Amplitude is 0 at progress ≤ 10% or ≥ 95%, otherwise full (`indicatorAmplitude`). MDC ramps 0.1 → 0.9. |
| Amplitude ramp up | `tween(500ms, standard easing)` |
| Amplitude ramp down | `tween(500ms, emphasized-accelerate)` |
| Linear indeterminate | Cycle **1750 ms**, two lines, emphasized-accelerate easing. Line 1 head: delay 0, 1000 ms. Line 1 tail: delay 250, 1000 ms. Line 2 head: delay 650, 850 ms. Line 2 tail: delay 900, 850 ms. |
| Circular indeterminate | **6000 ms** cycle. Global rotation 0 → **1080°** linear. Additional rotation +90° steps each **1500 ms**, each taking 300 ms (emphasized-decelerate). Arc length 0.1 → **0.87** → 0.1 (standard easing, 3000 ms each half). |

### Implementation note

Restyle and extend shadcn **Progress** (bits-ui `Progress`, which provides `value`, `max` and
ARIA) for the linear indicator. Circular and wavy indicators need **custom SVG**:

- Flat: `stroke-dasharray` with a 4dp gap segment.
- Wavy linear: an SVG `path` of sine segments clipped to `progress`, animated by translating the
  path by one wavelength per second (CSS `@keyframes`, `translateX(-40px)` over 1 s, linear).
- Wavy circular: a precomputed star/circle path, or a JavaScript-generated path.

---

## 18. Loading indicator (new in M3E)

Use it for waits between **200 ms and 5 s**:

- Under 200 ms: show no indicator.
- Over 5 s: use a progress indicator.
- Never transition a loading indicator into a determinate progress indicator.

Source: [M-LI-G].

| Property | Value | Source |
|---|---|---|
| Container size | **48 × 48dp** (default). Scales between **24 and 240dp** keeping the ratio. | [T-LI], [M-LI], [M-LI-G] |
| Active indicator (shape) size | **38dp**. Scale = 38 / 48. | [T-LI], [S-LDI] |
| Default (uncontained) color | `primary`, no container | [T-LI], [M-LI] |
| Contained | Container **`primary-container`**, full (circle). Indicator **`on-primary-container`**. Use over content and for pull-to-refresh. | [T-LI], [M-LI-G] |
| Shape sequence (indeterminate, 7 shapes) | **SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided → Oval**, looping | [S-LDI], [M-LI-G] |
| Determinate shapes | Circle (rotated 18°) → SoftBurst, morph with progress; rotation = −progress × 180° (counter-clockwise) | [S-LDI] |

### Motion [S-LDI]

| Animation | Spec |
|---|---|
| Morph cadence | A new morph starts every **650 ms** (`MorphIntervalMillis`) |
| Morph spring | `spring(dampingRatio = 0.6, stiffness = 200, visibilityThreshold = 0.1)`. Finishes in under 650 ms and overshoots slightly. |
| Per-morph rotation | Each morph adds **+90°** (`QuarterRotation`). Drawn rotation = `morphProgress × 90 + accumulatedQuarterTurns + globalRotation`. |
| Global rotation | 0 → 360° linear, **4666 ms**, infinite |

### Implementation note

Build a **custom SVG** loading indicator. Shapes are Material shape-library polygons
(`MaterialShapes`).

- Ship 7 precomputed SVG paths **with matching point counts**, so CSS `d:` path interpolation (or
  flubber / svg-path-morph) can morph them.
- Run the 650 ms morph on a stepped JavaScript timer with a spring easing.
- Rotate the wrapper with a 4666 ms linear CSS animation and add 90° per step.

shadcn **Spinner** (installed) can host the ARIA role and `aria-label`.

---

## 19. Snackbar

| Property | Value | Source |
|---|---|---|
| Height | **48dp** single line; **68dp** two lines | [T-SNK], [W-SNK] |
| Max width | 600dp (Compose) | [S-SNK] |
| Shape | corner-extra-small **4dp** | [T-SNK] |
| Color | **`inverse-surface`** | [T-SNK], [M-SNK] |
| Supporting text | **body-medium**, `inverse-on-surface` | [T-SNK] |
| Action | label-large text button, **`inverse-primary`** | [T-SNK] |
| Close icon | 24dp, `inverse-on-surface` | [T-SNK] |
| Elevation | **level3 (6dp)** | [T-SNK], [D-SNK] |
| Outer margin | Compose `SnackbarHost` item padding 12dp; Android 8dp | [S-SNK], [D-SNK] |
| Internal padding | Horizontal 16dp. Next to a button: 8dp. Single-line vertical padding 14dp (text 30dp to first baseline in two-line). Text end extra spacing 8dp. Long action on a new line: 12dp offset, 4dp bottom padding. | [S-SNK] |
| Auto-dismiss | Short **4000 ms**; Long **10000 ms**; Indefinite when there is an action (Compose default). Guideline: 4–10 s, depending on platform. | [S-SH], [M-SNK-G] |

### Motion [S-SH]

| Animation | Spec |
|---|---|
| Enter | Opacity 0 → 1 with **fastEffects**; scale **0.8 → 1** with **fastSpatial** |
| Exit | Opacity 1 → 0 with fastEffects; scale 1 → 0.8 with fastSpatial; then removed |
| Queueing | One at a time. The next snackbar appears after the current one fades out. Uses a `liveRegion = Polite` announcement. |

### Implementation note

Option 1: restyle shadcn **Sonner** (svelte-sonner, installed) with custom classes:

- `bg-inverse-surface text-inverse-on-surface rounded-[4px] min-h-12 max-w-[600px]`.
- Override its enter/exit animation to the scale 0.8 + fade spring.

Option 2: write a tiny custom `SnackbarHost` store (a queue) for exact M3 behavior (single
visible, `aria-live="polite"`).

---

## 20. Menus

Covered in a separate document. Spec page: https://m3.material.io/components/menus/specs. Compose
tokens: `MenuTokens.kt`, `StandardMenuTokens.kt`, `VibrantMenuTokens.kt`, `SegmentedMenuTokens.kt`.

---

## Quick component-to-primitive map

| M3E component | Base primitive in this repo | Notes |
|---|---|---|
| Navigation bar | Custom (`<nav>` + links) | Spring-animated indicator |
| Navigation rail (collapsed / expanded) | Custom. Modal = bits-ui **Dialog** / shadcn **Sheet**. | Width spring |
| Navigation drawer | shadcn **Sheet** (modal), `<aside>` (standard) | Not recommended in M3E |
| App bar / search app bar | Custom `<header>`. Search = **Input** + **Dialog** / **Popover**. | Scroll color state |
| Docked / floating toolbar | bits-ui **Toolbar** | `role="toolbar"` |
| Tabs | shadcn/bits-ui **Tabs** | Custom indicator |
| Bottom sheet | shadcn **Drawer** (vaul-svelte) | Snap points, handle |
| Side sheet | shadcn **Sheet** | |
| Cards | shadcn **Card** | Variants + state layer |
| Dialog | shadcn **Dialog** / **AlertDialog** | |
| Lists | shadcn **Item** or custom | Segmented shapes |
| Divider | shadcn **Separator** | Insets |
| Carousel | embla (shadcn **Carousel**, not installed) or CSS scroll-snap | Keyline masking |
| Tooltip plain / rich | shadcn **Tooltip** / **Popover** or **HoverCard** | |
| Badge | Custom | |
| Progress | shadcn **Progress** (linear) + custom SVG (circular, wavy) | |
| Loading indicator | Custom SVG (host in **Spinner**) | Shape morph |
| Snackbar | shadcn **Sonner** or custom host | |

## Discrepancies and unverifiable items

1. **Floating toolbar elevation.** material-web token = level3 [W-TB-F]. Compose defaults = level0,
   or level1 with a FAB, marked "TODO read from token" [S-FT]. The guidelines say floating toolbars
   have elevation by default [M-TB-G]. Recommendation: level3, removable.
2. **Floating-toolbar FAB color (standard).** material-web = `secondary-container` [W-TB-FAB];
   Compose = `primary-container` [S-FT].
3. **Secondary tab indicator.** 2dp per m3 [M-TABS] and material-web [W-ST]; Compose's default
   `SecondaryIndicator` draws 3dp [S-TR].
4. **Icon + label tab height.** 64dp per m3 and tokens [M-TABS], [T-PT]; Compose `LargeTabHeight`
   and Android use 72dp [S-TAB], [D-TABS].
5. **Progress track color.** `secondary-container` per Compose and material-web tokens [T-PI],
   [W-PI]; MDC Android docs still say `colorPrimaryContainer` [D-PI].
6. **Rail elevation.** MDC Android says the M3E rail elevation went "from 0dp to 3dp" [D-NR], but the
   collapsed and expanded tokens are level0; only the modal expanded rail is level2 [T-NRC],
   [T-NRE].
7. **Scrim opacity.** The generic scrim is 32% [T-SCR]. The material-web drawer token uses
   neutral-variant20 at 40% [W-ND]. Android `DrawerLayout` uses 60% black [D-ND].
8. **Snackbar margin.** 12dp in Compose [S-SNK] vs 8dp on Android [D-SNK]. The m3 page shows
   measurements only as images.
9. **Pixel-level measurements shown only as images** on m3.material.io could not be read as text.
   This covers nav bar, nav rail, app bars, toolbars and snackbar "measurements". Those numbers come
   from the token files instead.
10. **Unpublished motion.** No dialog or side-sheet enter/exit motion token exists in Compose.
    Expressive spring settle times in the motion table are computed, not published.
11. **Nav bar label typography.** Compose marks `LabelTextFont = LabelMedium` as a "missing token"
    added by hand [T-NB]. MDC Android uses title-small for nav bar labels [D-BN].
12. **Full-screen dialog container color.** Token = `surface` [W-FSD]; the m3 page color list
    shows `surface-container-high` [M-DLG].
13. **List divider color.** Token = `outline` [T-L], [W-LIST]; the page roles and the standalone
    divider use `outline-variant` [M-LIST], [T-DIV].
14. **Side sheets** have no Compose implementation or tokens [T-DIR]. Values come from material-web
    [W-SS] and m3 [M-SS].

---

## Sources

Compose tokens. Base:
`https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/`

| Tag | File |
|---|---|
| T-DIR | https://github.com/androidx/androidx/tree/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens |
| T-NB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarTokens.kt |
| T-NBH | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarHorizontalItemTokens.kt |
| T-NBV | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarVerticalItemTokens.kt |
| T-NRC | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailCollapsedTokens.kt |
| T-NRE | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailExpandedTokens.kt |
| T-NRB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailBaselineItemTokens.kt |
| T-NRH | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailHorizontalItemTokens.kt |
| T-NRV | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailVerticalItemTokens.kt |
| T-NRCol | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailColorTokens.kt |
| T-ND | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationDrawerTokens.kt |
| T-AB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarTokens.kt |
| T-ABS | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarSmallTokens.kt |
| T-ABM | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarMediumTokens.kt |
| T-ABMF | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarMediumFlexibleTokens.kt |
| T-ABL | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarLargeTokens.kt |
| T-ABLF | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarLargeFlexibleTokens.kt |
| T-BAB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/BottomAppBarTokens.kt |
| T-DT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DockedToolbarTokens.kt |
| T-FT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/FloatingToolbarTokens.kt |
| T-SB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SearchBarTokens.kt |
| T-SV | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SearchViewTokens.kt |
| T-PT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/PrimaryNavigationTabTokens.kt |
| T-ST | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SecondaryNavigationTabTokens.kt |
| T-SHB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SheetBottomTokens.kt |
| T-SCR | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ScrimTokens.kt |
| T-EC | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ElevatedCardTokens.kt |
| T-FC | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/FilledCardTokens.kt |
| T-OC | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/OutlinedCardTokens.kt |
| T-DLG | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DialogTokens.kt |
| T-L | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ListTokens.kt |
| T-RL | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ReorderListTokens.kt |
| T-DIV | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DividerTokens.kt |
| T-PTT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/PlainTooltipTokens.kt |
| T-RTT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/RichTooltipTokens.kt |
| T-BDG | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/BadgeTokens.kt |
| T-PI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ProgressIndicatorTokens.kt |
| T-LPI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/LinearProgressIndicatorTokens.kt |
| T-CPI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/CircularProgressIndicatorTokens.kt |
| T-LI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/LoadingIndicatorTokens.kt |
| T-SNK | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SnackbarTokens.kt |
| T-ELV | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ElevationTokens.kt |
| T-SHP | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt |
| T-STA | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StateTokens.kt |
| T-XM | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt |
| T-SM | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt |
| T-MT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/MotionTokens.kt |
| T-TS | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt |

Compose component source. Base:
`https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/`

| Tag | File |
|---|---|
| S-SNB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ShortNavigationBar.kt |
| S-NI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/NavigationItem.kt |
| S-NB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/NavigationBar.kt |
| S-WNR | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/WideNavigationRail.kt |
| S-ND | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/NavigationDrawer.kt |
| S-AB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBar.kt |
| S-FT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/FloatingToolbar.kt |
| S-TAB | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Tab.kt |
| S-TR | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TabRow.kt |
| S-SD | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SheetDefaults.kt |
| S-BS | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/BottomSheet.kt |
| S-MBS | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ModalBottomSheet.kt |
| S-AD | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AlertDialog.kt |
| S-LI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ListItem.kt |
| S-LID | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ListItemDefaults.kt |
| S-CAR | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/carousel/Carousel.kt |
| S-KL | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/carousel/Keylines.kt |
| S-TT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Tooltip.kt |
| S-BTT | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/foundation/foundation/src/commonMain/kotlin/androidx/compose/foundation/BasicTooltip.kt |
| S-BDG | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Badge.kt |
| S-PI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ProgressIndicator.kt |
| S-WPI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/WavyProgressIndicator.kt |
| S-LW | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/internal/LinearWavyProgressModifiers.kt |
| S-CW | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/internal/CircularWavyProgressModifiers.kt |
| S-LDI | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt |
| S-SNK | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Snackbar.kt |
| S-SH | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SnackbarHost.kt |
| S-MS | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt |

material-web generated tokens (latest, v34.0.21). Base:
`https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/`

| Tag | File |
|---|---|
| W-NB | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-nav-bar.scss |
| W-NB-H | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-nav-bar-item-horizontal.scss |
| W-NB-V | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-nav-bar-item-vertical.scss |
| W-NR-C | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-nav-rail-collapsed.scss |
| W-NR-E | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-nav-rail-expanded.scss |
| W-ND | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-navigation-drawer.scss |
| W-AB | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-app-bar.scss |
| W-AB-S | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-app-bar-small.scss |
| W-AB-MF | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-app-bar-medium-flexible.scss |
| W-AB-LF | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-app-bar-large-flexible.scss |
| W-SB | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-search-bar.scss |
| W-SV | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-search-view.scss |
| W-TB-D | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-toolbar-docked.scss |
| W-TB-F | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-toolbar-floating.scss |
| W-TB-FAB | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-toolbar-floating-fab.scss |
| W-TB-STD | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-toolbar-standard.scss |
| W-TB-VIB | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-toolbar-vibrant.scss |
| W-BAB | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-bottom-app-bar.scss |
| W-PT | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-primary-navigation-tab.scss |
| W-ST | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-secondary-navigation-tab.scss |
| W-SHB | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-sheet-bottom.scss |
| W-SS | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-sheet-side.scss |
| W-EC | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-elevated-card.scss |
| W-FSD | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-full-screen-dialog.scss |
| W-LIST | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-list.scss |
| W-CAR | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-carousel-item.scss |
| W-BDG | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-badge.scss |
| W-PI | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-progress-indicator.scss |
| W-PI-L | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-progress-indicator-linear.scss |
| W-PI-C | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-progress-indicator-circular.scss |
| W-SNK | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-comp-snackbar.scss |
| W-MOTION | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/latest/sass/_md-sys-motion.scss |

material-components-android docs. Base:
`https://github.com/material-components/material-components-android/blob/master/docs/components/`

| Tag | File |
|---|---|
| D-BN | https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md |
| D-NR | https://github.com/material-components/material-components-android/blob/master/docs/components/NavigationRail.md |
| D-ND | https://github.com/material-components/material-components-android/blob/master/docs/components/NavigationDrawer.md |
| D-TAB | https://github.com/material-components/material-components-android/blob/master/docs/components/TopAppBar.md |
| D-DT | https://github.com/material-components/material-components-android/blob/master/docs/components/DockedToolbar.md |
| D-FT | https://github.com/material-components/material-components-android/blob/master/docs/components/FloatingToolbar.md |
| D-TABS | https://github.com/material-components/material-components-android/blob/master/docs/components/Tabs.md |
| D-BS | https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md |
| D-SS | https://github.com/material-components/material-components-android/blob/master/docs/components/SideSheet.md |
| D-CARD | https://github.com/material-components/material-components-android/blob/master/docs/components/Card.md |
| D-DLG | https://github.com/material-components/material-components-android/blob/master/docs/components/Dialog.md |
| D-LIST | https://github.com/material-components/material-components-android/blob/master/docs/components/List.md |
| D-DIV | https://github.com/material-components/material-components-android/blob/master/docs/components/Divider.md |
| D-PI | https://github.com/material-components/material-components-android/blob/master/docs/components/ProgressIndicator.md |
| D-SNK | https://github.com/material-components/material-components-android/blob/master/docs/components/Snackbar.md |

m3.material.io (rendered in a browser; the measurements tables are text, the diagrams are images):

| Tag | URL |
|---|---|
| M-NB | https://m3.material.io/components/navigation-bar/specs |
| M-NR | https://m3.material.io/components/navigation-rail/specs |
| M-NR-G | https://m3.material.io/components/navigation-rail/guidelines |
| M-ND | https://m3.material.io/components/navigation-drawer/specs |
| M-AB | https://m3.material.io/components/app-bars/specs |
| M-TB | https://m3.material.io/components/toolbars/specs |
| M-TB-G | https://m3.material.io/components/toolbars/guidelines |
| M-TABS | https://m3.material.io/components/tabs/specs |
| M-BS | https://m3.material.io/components/bottom-sheets/specs |
| M-SS | https://m3.material.io/components/side-sheets/specs |
| M-CARD | https://m3.material.io/components/cards/specs |
| M-DLG | https://m3.material.io/components/dialogs/specs |
| M-LIST | https://m3.material.io/components/lists/specs |
| M-DIV | https://m3.material.io/components/divider/specs |
| M-CAR | https://m3.material.io/components/carousel/specs |
| M-TT | https://m3.material.io/components/tooltips/specs |
| M-BDG | https://m3.material.io/components/badges/specs |
| M-PI | https://m3.material.io/components/progress-indicators/specs |
| M-LI | https://m3.material.io/components/loading-indicator/specs |
| M-LI-G | https://m3.material.io/components/loading-indicator/guidelines |
| M-SNK | https://m3.material.io/components/snackbar/specs |
| M-SNK-G | https://m3.material.io/components/snackbar/guidelines |
| Menus (out of scope) | https://m3.material.io/components/menus/specs |
