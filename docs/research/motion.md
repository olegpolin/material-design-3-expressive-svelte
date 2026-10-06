# M3 Expressive motion: research notes for Svelte 5 + Tailwind 4

> Status: research, gathered 2026-10-06. Every number has a source. `[S#]` refers to the **Sources** list at the end.
> The values come from the m3.material.io pages (rendered in a browser, because the site is client-rendered) and from
> Google's source repos: `androidx` Compose Material3, `material-components-android` and `material-web`.
> **Computed** means the value came from this document's Node script (see section 3.1), not from Google.

---

## 0. TL;DR

* With M3 Expressive (May 2025), Material replaced easing + duration with a **physics (spring) system** as its primary motion model [S1].
  The easing/duration tokens still exist. They are now the fallback, and M3 **transitions** still use them [S1][S2][S4].
* Material ships two **motion schemes**, *expressive* (the default and recommended one, which overshoots) and *standard* (functional, with minimal bounce). Each scheme has
  **6 spring tokens**: `{fast, default, slow} × {spatial, effects}` [S1].
* A spring is defined by `dampingRatio` and `stiffness`, with mass = 1. *Spatial* springs (position, size, rotation, corner radius) may overshoot. *Effects*
  springs (color, opacity) always use `dampingRatio = 1`, so they never overshoot [S1][S5][S6].
* For the web, Google publishes a **cubic-bezier + duration** table that mimics each spring [S3]. This document also gives
  more accurate **CSS `linear()`** approximations, computed from the closed-form spring solution, with settle durations (section 3).

---

## 1. Legacy easing and duration tokens (still valid, used by transitions)

M3 says that "the easing and duration system is still used for transitions … but is no longer maintained" [S4].
M3 also says that "M3 transitions use the legacy easing and duration system" [S2].

### 1.1 Duration tokens

| Token (`md.sys.motion.duration.*`) | ms | Token | ms | Token | ms | Token | ms |
|---|---|---|---|---|---|---|---|
| short1 | **50** | medium1 | **250** | long1 | **450** | extra-long1 | **700** |
| short2 | **100** | medium2 | **300** | long2 | **500** | extra-long2 | **800** |
| short3 | **150** | medium3 | **350** | long3 | **550** | extra-long3 | **900** |
| short4 | **200** | medium4 | **400** | long4 | **600** | extra-long4 | **1000** |

Sources: m3.material.io token table [S4], Compose `MotionTokens.kt` [S7], MDC-Android `tokens.xml` [S8], material-web `v0_192/_md-sys-motion.scss` [S9]. All four sources agree.

What M3 says to use them for [S4]: short durations suit "small utility-focused transitions" (selection controls use 200ms with Standard easing). Medium durations suit transitions across a medium area (FAB→sheet uses 400ms with Emphasized). Long durations suit large expressive transitions (card→full screen uses 500ms with Emphasized). Extra long durations are for ambient transitions only (carousel auto-advance uses 1000ms with Emphasized).

### 1.2 Easing tokens

| Token (`md.sys.motion.easing.*`) | CSS | Notes |
|---|---|---|
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | [S4][S7][S8][S9] |
| `standard-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | [S4][S7][S8][S9] |
| `standard-decelerate` | `cubic-bezier(0, 0, 0, 1)` | [S4][S7][S8][S9] |
| `emphasized` | Android: `path(M 0,0 C 0.05, 0, 0.133333, 0.06, 0.166666, 0.4 C 0.208333, 0.82, 0.25, 1, 1, 1)` | m3.material.io lists the CSS value as "N/A (Use Standard as a fallback)" [S4]. material-web's token is `cubic-bezier(0.2, 0, 0, 1)` [S9], and so is Compose's `EasingEmphasizedCubicBezier` [S7]. material-web's internal `EASING.EMPHASIZED` is `cubic-bezier(.3,0,0,1)` [S10]. The path data is from [S4][S8]. |
| `emphasized` (exact, computed) | see `linear()` below | 29 points, max error 0.0024 compared with the path |
| `emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | m3.material.io [S4], Compose [S7], material-web [S9]. **MDC-Android tokens.xml has `(0.3, 0, 0.8, 0.2)`** [S8] |
| `emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | m3.material.io [S4], Compose [S7], material-web [S9]. **MDC-Android tokens.xml has `(0.1, 0.7, 0.1, 1)`** [S8] |
| `linear` | `cubic-bezier(0, 0, 1, 1)` | [S7][S8][S9] |
| `legacy` | `cubic-bezier(0.4, 0, 0.2, 1)` | (= M2 "standard") [S7][S8][S9] |
| `legacy-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | [S7][S8][S9] |
| `legacy-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | [S7][S8][S9] |

The **emphasized path as CSS `linear()`** was computed by sampling the two-segment cubic path and simplifying with Ramer–Douglas–Peucker (vertical tolerance 0.0025):

```css
linear(0, 0.0082 3.2%, 0.0329 6.25%, 0.0723 8.95%, 0.098 10.2%, 0.1269 11.35%, 0.1572 12.35%, 0.1917 13.3%, 0.2286 14.15%, 0.2704 14.95%, 0.3079 15.55%, 0.3486 16.1%, 0.479 17.5%, 0.5452 18.35%, 0.6074 19.4%, 0.66 20.6%, 0.6893 21.45%, 0.7167 22.4%, 0.7655 24.6%, 0.8078 27.25%, 0.8445 30.4%, 0.8833 35.05%, 0.9154 40.6%, 0.9419 47.2%, 0.9632 54.95%, 0.9795 64%, 0.9909 74.4%, 0.9977 86.35%, 1)
```

Computed: `cubic-bezier(0.2,0,0,1)` deviates from the true emphasized path by up to **0.166**, and `cubic-bezier(0.3,0,0,1)` by up to **0.262**. `linear()` is Baseline (widely available since Dec 2023) [S11], so use the `linear()` form.

### 1.3 Suggested easing and duration pairs (official) [S12]

| Easing | Duration | Transition type |
|---|---|---|
| Emphasized | 500ms | Begin and end on screen |
| Emphasized decelerate | 400ms | Enter the screen |
| Emphasized accelerate | 200ms | Exit the screen |
| Standard | 300ms | Begin and end on screen |
| Standard decelerate | 250ms | Enter the screen |
| Standard accelerate | 200ms | Exit the screen |

Rules [S12]:
* Emphasized is the recommended set. Standard suits small utility transitions and is "a fallback for platforms that don't support Emphasized easing, like iOS and Web" (`linear()` removes this limitation).
* Use emphasized-accelerate when an element exits permanently and emphasized when it exits temporarily (it ends at rest just off screen).
* Duration scales with the area the transition covers. Exits are shorter than enters (example: enter 500ms, exit 200ms).

---

## 2. The physics system: motion schemes and springs

### 2.1 Concepts (official) [S1]

* "The physics system has two preset motion schemes: expressive and standard." Material calls expressive its "opinionated motion scheme" and says it "should be used for most situations, particularly hero moments and key interactions". Standard "feels more functional with minimal bounce, and should be used for utilitarian products."
* A spring has three attributes: **stiffness, damping, initial velocity**. Springs "handle gestures, interruptions, and retargeting animations seamlessly".
* Token naming: `md.sys.motion.spring.{fast|default|slow}.{spatial|effects}`. The scheme name is **not** part of the token. The product selects a scheme, and that scheme applies to every token, so you can swap schemes without changing any token assignments [S1][S3].
* **Spatial** tokens are for "animations that move something on screen, for example the x and y position, rotation, size, rounded corners. This spring overshoots the final value and bounces into place."
* **Effects** tokens are for "color and opacity animations, where there shouldn't be any overshoot."
* **Speed** guidance [S1]:

| Speed | Spatial example | Effects example |
|---|---|---|
| Default | Things that partially cover the screen (bottom sheet, expanded navigation rail) | Opacity of content inside a navigation rail |
| Fast | Small components (switches, buttons) | Color change of the switch handle |
| Slow | Full-screen animations | Full-screen content refresh |

* "All component motion is driven by two tokens: expressive fast spatial and expressive fast effects" (caption on [S1]). The source code is more varied than that caption suggests (section 4).
* Token values "differ depending on if the device is a wearable, phone, or tablet" [S1]. The values below are the phone/Android values, which are the only ones published.
* Compose doc comments: standard is "Material's basic motion scheme for utilitarian UI elements and recurring interactions". Expressive is "Material's recommended motion scheme for prominent UI elements and hero interactions" [S5]. Spatial specs are for "animations that may change the shape or bounds"; for "color or alpha animations use the `effects` equivalent which ensures a 'non-spatial' motion" [S5].

### 2.2 Spring values (mass = 1)

| Token | **Expressive** dampingRatio | **Expressive** stiffness | **Standard** dampingRatio | **Standard** stiffness |
|---|---|---|---|---|
| `spring.fast.spatial` | **0.6** | **800** | **0.9** | **1400** |
| `spring.default.spatial` | **0.8** | **380** | **0.9** | **700** |
| `spring.slow.spatial` | **0.8** | **200** | **0.9** | **300** |
| `spring.fast.effects` | **1.0** | **3800** | **1.0** | **3800** |
| `spring.default.effects` | **1.0** | **1600** | **1.0** | **1600** |
| `spring.slow.effects` | **1.0** | **800** | **1.0** | **800** |

Sources: Compose `ExpressiveMotionTokens.kt` / `StandardMotionTokens.kt` (v0_14_0) [S6], consumed by `MotionScheme.kt` as `spring(dampingRatio, stiffness)` [S5]. MDC-Android `tokens.xml` has `m3_sys_motion_{expressive|standard}_spring_*_{damping|stiffness}` [S8], wrapped in styles `Motion.Material3.Spring.{Standard|Expressive}.{Fast|Default|Slow}.{Spatial|Effects}` [S13] and theme attrs `motionSpringFastSpatial`, `motionSpringDefaultSpatial`, `motionSpringSlowSpatial`, `motionSpringFastEffects`, `motionSpringDefaultEffects`, `motionSpringSlowEffects` (styleable `MaterialSpring` with `stiffness` and `damping` floats) [S14]. The m3.material.io token table shows the same Standard values (0.9/1400, 0.9/700, 0.9/300, 1/3800, 1/1600, 1/800) [S3]. **All sources agree.**

The effects springs are identical in both schemes. Only the spatial springs differ.

### 2.3 Official web conversion (Google's cubic-bezier table) [S3]

m3.material.io says to "use springs when possible, otherwise use curves that mimic the springs for animations without interruptions or gestures".

| Spring | Google curve | Google duration | Computed max deviation vs. true spring* |
|---|---|---|---|
| Expressive fast spatial | `cubic-bezier(0.42, 1.67, 0.21, 0.90)` | 350ms | 0.102 |
| Expressive default spatial | `cubic-bezier(0.38, 1.21, 0.22, 1.00)` | 500ms | 0.070 |
| Expressive slow spatial | `cubic-bezier(0.39, 1.29, 0.35, 0.98)` | 650ms | 0.084 |
| Expressive fast effects | `cubic-bezier(0.31, 0.94, 0.34, 1.00)` | 150ms | 0.074 |
| Expressive default effects | `cubic-bezier(0.34, 0.80, 0.34, 1.00)` | 200ms | 0.059 |
| Expressive slow effects | `cubic-bezier(0.34, 0.88, 0.34, 1.00)` | 300ms | 0.063 |
| Standard fast spatial | `cubic-bezier(0.27, 1.06, 0.18, 1.00)` | 350ms | 0.059 |
| Standard default spatial | `cubic-bezier(0.27, 1.06, 0.18, 1.00)` | 500ms | 0.058 |
| Standard slow spatial | `cubic-bezier(0.27, 1.06, 0.18, 1.00)` | 750ms | 0.060 |
| Standard fast effects | `cubic-bezier(0.31, 0.94, 0.34, 1.00)` | 150ms | 0.074 |
| Standard default effects | `cubic-bezier(0.34, 0.80, 0.34, 1.00)` | 200ms | 0.059 |
| Standard slow effects | `cubic-bezier(0.34, 0.88, 0.34, 1.00)` | 300ms | 0.063 |

\* Computed: the largest |bezier(t) − spring(t)| over the bezier's duration, both in wall-clock time. A cubic-bezier can only produce one overshoot "bump", so it cannot reproduce the 9.5% overshoot and settle of expressive fast spatial. The `linear()` strings in section 3 are about 40× closer.

---

## 3. Converting springs to CSS

### 3.1 Method

For a unit step (from 0 to 1, v₀ = 0) with ω₀ = √(k/m), m = 1:

* Underdamped (ζ < 1): ω_d = ω₀√(1−ζ²), `x(t) = 1 − e^(−ζω₀t)·(cos ω_d t + (ζω₀/ω_d)·sin ω_d t)`
* Critically damped (ζ = 1): `x(t) = 1 − e^(−ω₀t)·(1 + ω₀t)`

**Settle duration** = the last instant (resolution 0.05ms) at which |x − 1| ≥ 0.001. The curve is sampled at 2001 points across [0, settle]. Ramer–Douglas–Peucker (vertical distance, tolerance 0.0025, at most 40 points) then reduces it to a `linear()` with explicit `%` stops. The last stop is forced to exactly 1.

Script (run with Node; the output below is verbatim):

```js
// springs.mjs (abridged; the full script also benchmarks the Google beziers and fits Svelte params)
function springFn({ zeta, k, m = 1 }) {
  const w0 = Math.sqrt(k / m);
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return (t) => 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  return (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t); // zeta === 1
}
function settleTime(x, eps = 0.001) {
  let last = 0;
  for (let t = 0; t <= 5; t += 0.00005) if (Math.abs(x(t) - 1) >= eps) last = t;
  return last; // seconds
}
function rdp(pts, tol) { /* Ramer–Douglas–Peucker on vertical distance */
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let maxD = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const [x0, y0] = pts[a], [x1, y1] = pts[b], [x, y] = pts[i];
      const d = Math.abs(y - (y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)));
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const fmt = (n, d) => n.toFixed(d).replace(/\.?0+$/, '');
function toLinear(x, T, tol = 0.0025, maxPts = 40) {
  const dense = Array.from({ length: 2001 }, (_, i) => [i / 2000, i === 2000 ? 1 : x((i / 2000) * T)]);
  let pts; do { pts = rdp(dense, tol); tol *= 1.15; } while (pts.length > maxPts);
  return `linear(${pts.map(([p, y], i) => i === 0 ? '0' : i === pts.length - 1 ? '1' : `${fmt(y, 4)} ${fmt(p * 100, 2)}%`).join(', ')})`;
}
const x = springFn({ zeta: 0.6, k: 800 });
const T = settleTime(x);
console.log(Math.round(T * 1000) + 'ms', toLinear(x, T));
```

### 3.2 Results (computed)

The step response shape depends only on ζ. Stiffness only rescales time, by a factor of 1/√k. So springs that share a ζ also share the **same `linear()` string** and differ only in duration. Four curves cover all 12 tokens.

| Scheme / token | ζ | k | Settle, \|x−1\|<0.001 | Settle, <0.01 (ref) | Overshoot | Curve | Points | Max err |
|---|---|---|---|---|---|---|---|---|
| Expressive fast spatial | 0.6 | 800 | **359ms** | 221ms | **9.48%** | `ζ0.6` | 24 | 0.0022 |
| Expressive default spatial | 0.8 | 380 | **435ms** | 326ms | **1.52%** | `ζ0.8` | 20 | 0.0022 |
| Expressive slow spatial | 0.8 | 200 | **599ms** | 449ms | **1.52%** | `ζ0.8` | 20 | 0.0022 |
| Expressive fast effects | 1.0 | 3800 | **150ms** | 108ms | 0 | `ζ1.0` | 21 | 0.0017 |
| Expressive default effects | 1.0 | 1600 | **231ms** | 166ms | 0 | `ζ1.0` | 21 | 0.0017 |
| Expressive slow effects | 1.0 | 800 | **326ms** | 235ms | 0 | `ζ1.0` | 21 | 0.0017 |
| Standard fast spatial | 0.9 | 1400 | **224ms** | 137ms | **0.15%** | `ζ0.9` | 21 | 0.0019 |
| Standard default spatial | 0.9 | 700 | **317ms** | 194ms | **0.15%** | `ζ0.9` | 21 | 0.0019 |
| Standard slow spatial | 0.9 | 300 | **484ms** | 296ms | **0.15%** | `ζ0.9` | 21 | 0.0019 |
| Standard fast effects | 1.0 | 3800 | **150ms** | 108ms | 0 | `ζ1.0` | 21 | 0.0017 |
| Standard default effects | 1.0 | 1600 | **231ms** | 166ms | 0 | `ζ1.0` | 21 | 0.0017 |
| Standard slow effects | 1.0 | 800 | **326ms** | 235ms | 0 | `ζ1.0` | 21 | 0.0017 |

The overshoot matches the closed form e^(−πζ/√(1−ζ²)).

**`linear()` strings (computed):**

ζ = 0.6 (expressive fast spatial)
```css
linear(0, 0.0077 1.25%, 0.0313 2.6%, 0.0698 4%, 0.1254 5.55%, 0.18 6.85%, 0.2493 8.35%, 0.5292 13.95%, 0.6478 16.45%, 0.7586 19.05%, 0.8487 21.5%, 0.9236 23.95%, 0.9832 26.4%, 1.0298 28.95%, 1.0633 31.6%, 1.0788 33.45%, 1.0888 35.35%, 1.094 37.4%, 1.0943 39.65%, 1.0809 44.7%, 1.0188 58.8%, 0.9979 67.1%, 0.991 78%, 1)
```

ζ = 0.8 (expressive default + slow spatial)
```css
linear(0, 0.0062 1.35%, 0.0248 2.8%, 0.0557 4.35%, 0.1011 6.1%, 0.1994 9.2%, 0.4298 15.7%, 0.5342 18.8%, 0.6331 22.05%, 0.7167 25.2%, 0.7855 28.25%, 0.8444 31.4%, 0.8931 34.65%, 0.9325 38.05%, 0.9639 41.75%, 0.9871 45.75%, 1.003 50.2%, 1.012 55.25%, 1.0147 64.85%, 1)
```

ζ = 0.9 (standard fast + default + slow spatial)
```css
linear(0, 0.0056 1.3%, 0.0223 2.7%, 0.0501 4.2%, 0.0909 5.9%, 0.1785 8.9%, 0.3935 15.5%, 0.4924 18.7%, 0.5874 22.1%, 0.6681 25.4%, 0.7361 28.65%, 0.7939 31.95%, 0.8433 35.4%, 0.8848 39.05%, 0.9214 43.3%, 0.9501 47.95%, 0.9714 53.1%, 0.9862 58.95%, 0.9951 65.45%, 0.9999 73.45%, 1)
```

ζ = 1.0 (all effects, both schemes)
```css
linear(0, 0.0048 1.1%, 0.0196 2.3%, 0.0444 3.6%, 0.0815 5.1%, 0.1596 7.7%, 0.3639 13.8%, 0.4621 16.9%, 0.5561 20.2%, 0.6367 23.45%, 0.7064 26.75%, 0.766 30.15%, 0.8175 33.75%, 0.8605 37.55%, 0.899 42%, 0.9298 46.9%, 0.9535 52.35%, 0.9713 58.6%, 0.9833 65.5%, 0.9914 73.8%, 1)
```

Notes on the results:
* The 0.001 criterion gives fast-effects 150ms, which matches Google's 150ms exactly. Google's other durations are a little longer for spatial springs (350/500/650 vs. 359/435/599 computed), presumably because Google tuned them by eye.
* A CSS `transition` with these easings **does not preserve velocity when interrupted**. A real spring retargets smoothly. M3 itself limits the curve substitution to "animations without interruptions or gestures" [S3]. For interruptible or gesture-driven motion, use a JS spring (3.4).
* Overshoot side effects: spatial easings take values above 1 (up to 1.094), so `width`, `scale`, and `border-radius` will briefly exceed the target. Clamp where that matters, for example `max(0px, …)`. Avoid transitioning `border-radius` from `9999px`: the overshoot is computed on 9999px and the shape snaps. Use a concrete radius such as `calc(height / 2)`.

### 3.3 Web Animations API

```ts
// Same curves, usable from JS. Durations and easings come from the CSS tokens (section 6).
const cs = getComputedStyle(document.documentElement);
el.animate(
  [{ transform: 'scaleX(1)' }, { transform: 'scaleX(1.15)' }],
  {
    duration: parseFloat(cs.getPropertyValue('--md-sys-motion-spring-fast-spatial-duration')),
    easing: cs.getPropertyValue('--md-sys-motion-spring-fast-spatial-easing').trim(), // linear(...)
    fill: 'forwards',
  },
);
```

To handle **interruption** with WAAPI, read the current computed value, cancel, then start a new animation from that value. The velocity is still lost. For exact retargeting, use the analytic spring below.

### 3.4 Svelte 5 `Spring` (`svelte/motion`)

The implementation in Svelte `packages/svelte/src/motion/spring.js` [S15] (project has svelte 5.57.1 installed):
* Defaults: `stiffness = 0.15`, `damping = 0.8`, `precision = 0.01`. The `Spring` class **clamps stiffness and damping to [0, 1]**.
* It integrates once per animation frame with `dt = elapsed·60/1000`. The step is `velocity = (cur − last)/dt`, `acc = stiffness·Δ − damping·velocity`, `cur += (velocity + acc)·dt`.
  The velocity therefore grows by `acc` **per tick, whatever the elapsed time**, so the motion **depends on refresh rate**: a 120Hz display behaves differently from a 60Hz one.
  At refresh rate R this is equivalent to a physical spring with k = 60·R·s and c = R·d. At 60Hz that gives **s = k/3600** and **d = 2ζ√k/60**.

| Token | "Physical" mapping s = k/3600, d = 2ζ√k/60 | Clamped? | **Best fit at 60Hz** (grid search over Svelte's real integrator, min RMS vs. the true spring) | RMS err |
|---|---|---|---|---|
| Expressive fast spatial | s 0.2222, d 0.5657 | no (RMS 0.048, Euler error) | **stiffness 0.135, damping 0.390** | 0.011 |
| Expressive default spatial | s 0.1056, d 0.5198 | no (RMS 0.034) | **stiffness 0.070, damping 0.370** | 0.007 |
| Expressive slow spatial | s 0.0556, d 0.3771 | no (RMS 0.027) | **stiffness 0.040, damping 0.285** | 0.0055 |
| Fast effects (both) | s 1.0556, d 2.0548 | **yes, out of range** | **stiffness 0.305, damping 0.735** | 0.0062 |
| Default effects (both) | s 0.4444, d 1.3333 | **yes** | **stiffness 0.180, damping 0.620** | 0.0064 |
| Slow effects (both) | s 0.2222, d 0.9428 | no | **stiffness 0.110, damping 0.515** | 0.0056 |
| Standard fast spatial | s 0.3889, d 1.1225 | **yes** | **stiffness 0.170, damping 0.565** | 0.0074 |
| Standard default spatial | s 0.1944, d 0.7937 | no | **stiffness 0.105, damping 0.470** | 0.0065 |
| Standard slow spatial | s 0.0833, d 0.5196 | no | **stiffness 0.055, damping 0.365** | 0.0054 |

All values computed. Also: at 120Hz the 60Hz fit drifts (expressive fast spatial RMS 0.033; 144Hz 0.038; 240Hz 0.048), because the integrator depends on refresh rate. Set `precision` relative to the value range: with the default 0.01, a 0..1 progress value stops visibly early, so use ~0.001.

```svelte
<script lang="ts">
  import { Spring, prefersReducedMotion } from 'svelte/motion';
  // Expressive fast spatial at 60Hz. Approximate only (see the refresh-rate caveat above).
  const width = new Spring(0, { stiffness: 0.135, damping: 0.39, precision: 0.001 });
  $effect(() => { width.target = pressed ? 1 : 0; });
</script>
```

**Recommendation:** for M3 fidelity, write a small **analytic spring** (closed form with initial velocity, independent of frame rate) and drive it with `requestAnimationFrame`. You get exact Compose behavior plus velocity-preserving retargeting:

```ts
// Displacement e(t) toward target with initial displacement x0 = from - to and velocity v0 (units/s).
export function springAt(t: number, x0: number, v0: number, zeta: number, k: number) {
  const w0 = Math.sqrt(k); // mass = 1
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const e = Math.exp(-zeta * w0 * t);
    return e * (x0 * Math.cos(wd * t) + ((v0 + zeta * w0 * x0) / wd) * Math.sin(wd * t));
  }
  return Math.exp(-w0 * t) * (x0 + (v0 + w0 * x0) * t); // zeta === 1
}
// value(t) = to + springAt(t, from - to, v0, ...). On retarget, sample the current value and
// velocity ((value(t+h) - value(t))/h) and restart with the new target. Stop when |e| and |v| < threshold.
```

Use Svelte `Tween` with the `linear()`-equivalent JS easing only for non-interruptible cases. In practice, prefer plain CSS transitions with the tokens for those.

---

## 4. Component-specific motion (M3 Expressive, from Compose Material3 source)

Compose is Google's reference implementation of M3 Expressive. m3.material.io says "21 Material components use the motion physics system by default" on Compose [S1]. Many Compose call sites carry `// TODO Load the motionScheme tokens from the component tokens file`, so these assignments may still change.

| Component | Motion (token = scheme spring) | Numbers | Source |
|---|---|---|---|
| **Button** (press shape morph) | Corner radius animates on press with **`DefaultEffects`**. The code comment says this is "intentional here to prevent any bounce in this component". | Rest: `CornerFull` (round). Pressed: XS/S → `CornerSmall` 8dp, M → `CornerMedium` 12dp, L/XL → `CornerLarge` 16dp. Square variant: XS/S 12dp, M 16dp, L/XL 28dp. | Button.kt [S16]; Button*Tokens.kt, ShapeTokens.kt [S17] |
| **ToggleButton** (selected round↔square, press morph) | Shape: **`FastSpatial`** (bounces). Border width: `FastSpatial`. Border color: `DefaultEffects`. | Selected square shapes as above (12/16/28dp) | ToggleButton.kt [S16] |
| **IconButton / SplitButton** | Shape morph: `DefaultEffects` (no bounce, same comment) | — | IconButton.kt, SplitButton.kt [S16] |
| **ButtonGroup** (neighbor squeeze) | The pressed child grows and its neighbors compress, with **`FastSpatial`**. On release, the code waits until the press animation passes **0.75** progress before reversing. | `ButtonGroupDefaults.ExpandedRatio = 0.15` (the pressed item grows by 15% of its width, taken from its neighbors; 1f would make it 200%) | ButtonGroup.kt [S16] |
| **FAB menu** (staggered open) | The stagger is an **Int animatable over the visible item count (0 → N)** driven by **`SlowEffects`** (visibilityThreshold = 1). Each item's width uses `FastSpatial` and its alpha uses `FastEffects`. Items reveal bottom-up. | Item height 56dp, gap 4dp, gap to close button 8dp. ToggleFAB `checkedProgress` uses `FastSpatial`. Size goes 56/80/96dp → **56dp**, corner 16/20/28dp → **28dp** (full), icon 24/28/36dp → **20dp**. The icon morphs to a close "X" at 50% progress. | FloatingActionButtonMenu.kt [S16]; FabMenuBaselineTokens, Fab*Tokens [S17] |
| **Extended FAB** expand/collapse | Expand: width `FastSpatial`, alpha `FastEffects` (in-component). AnimatedVisibility expand: `fadeIn(DefaultEffects) + expandHorizontally(FastSpatial)`. Collapse: `fadeOut(FastEffects) + shrinkHorizontally(DefaultSpatial)`. | Min width 80dp | FloatingActionButton.kt [S16] |
| **Loading indicator** | **7 shapes**, cycled indefinitely: SoftBurst → Cookie9Sided → Pentagon → Pill → Sunny → Cookie4Sided → Oval → (wraps). The morph starts every **650ms** and is driven by `spring(dampingRatio = 0.6, stiffness = 200, visibilityThreshold = 0.1)`. The morph uses coerced progress, so the shape itself does not bounce. Rotation per morph is +90° (quarter turn) and follows the raw progress, so it does bounce. A global rotation of **360° per 4666ms, linear** runs on top. | Container 48dp, active indicator 38dp, container shape full. Computed effective spin ≈ 77°/s + 138°/s ≈ **216°/s** (~1.67s per turn); one full 7-shape cycle = 4550ms. Determinate: Circle (rotated 18°) → SoftBurst morph by progress, with rotation `−progress·180°`. | LoadingIndicator.kt [S18]; LoadingIndicatorTokens [S17]; spec page [S19] |
| **Wavy progress indicator** | Wave travels at **1 wavelength per second** by default (`waveSpeed = wavelength`). Progress changes use `tween(500ms /*long2*/, linear)`. Amplitude rising: `tween(500ms, standard)`. Amplitude falling: `tween(500ms, emphasizedAccelerate)`. Determinate amplitude is **0 at ≤10% and ≥95%**, full in between. | Linear: wavelength **40dp** determinate / **20dp** indeterminate, amplitude **3dp**, container height 10dp, thickness 4dp, track gap 4dp, stop 4dp. Circular: wavelength **15dp**, amplitude **1.6dp**, container 48dp, thickness 4dp. | WavyProgressIndicator.kt [S20]; Linear/CircularProgressIndicatorTokens [S17] |
| Indeterminate linear (flat and wavy) | Cycle **1750ms**. Line 1 head 0→1 over 1000ms (delay 0), tail 1000ms (delay 250). Line 2 head 850ms (delay 650), tail 850ms (delay 900). All use emphasized-accelerate. | — | ProgressIndicator.kt [S20] |
| Indeterminate circular | Cycle **6000ms**. Global rotation 0→1080° linear. Extra rotation steps of +90° every 1500ms, each taking 300ms with emphasized-decelerate. Sweep 0.1 ↔ 0.87 (3000ms each way, standard). (The source comments say "360 in 6s" and "90° in 500ms"; the constants say otherwise.) I did not verify that the *wavy* circular indeterminate reuses these specs. | — | ProgressIndicator.kt [S20] |
| **Switch** | Handle size and offset animate with **`FastSpatial`**. **While pressed the handle snaps** (`SnapSpec`, instant) to the pressed size. | Handle: unselected **16dp**, selected/with icon **24dp**, **pressed 28dp**. Track 52×32dp, outline 2dp. | Switch.kt [S21]; SwitchTokens [S17] |
| **Slider** | Handle width **halves** while pressed, dragged or focused. **Not animated** in Compose (instant size swap). | Handle 4×44dp. Pressed/focused width **2dp**. Track height 16dp. Handle–track gap 6dp. | Slider.kt [S21]; SliderTokens [S17] |
| **Navigation bar** (active indicator) | Indicator **width grows from the center** (`width × progress`) with **`FastSpatial`**. Indicator alpha uses `DefaultEffects`, and so do the colors. | — | NavigationBar.kt [S22] |
| NavigationItem (short bar / wide rail items) | Indicator progress: `DefaultSpatial`. Icon top↔start position: `DefaultSpatial`. Colors: `DefaultEffects`. | — | NavigationItem.kt [S22] |
| **Wide navigation rail** expand/collapse | Width animates with **`DefaultSpatial`** (modal variant: `FastSpatial`). Modal open state: `DefaultSpatial`. Content fades: `DefaultEffects`. | Collapsed **96dp** → expanded min **220dp**, max **360dp** | WideNavigationRail.kt [S22]; NavigationRail*Tokens [S17] |
| **Floating toolbar** | Default spec `FastSpatial` (also `expandHorizontally`). `exitAlwaysScrollBehavior` snaps with **`DefaultEffects`** and flings with spline decay. It settles to shown or hidden at **collapsedFraction 0.5**. | — | FloatingToolbar.kt [S23] |
| **Top app bar / bottom app bar** scroll | Top app bar `snapAnimationSpec = DefaultEffects`. Bottom app bar `snapAnimationSpec = FastSpatial`. | — | AppBar.kt [S23] |
| Checkbox / RadioButton | Checkbox: `DefaultSpatial` check, `FastEffects`/`DefaultEffects` colors. Radio: dot `FastSpatial`, color `DefaultEffects`. | — | Checkbox.kt, RadioButton.kt [S16] |

### 4.1 Transition patterns (legacy easing and duration; MDC-Android defaults)

M3 lists six patterns: container transform, forward and backward, lateral, top level, enter and exit, skeleton loaders [S2]. m3.material.io gives no numbers, so the values below are MDC-Android's defaults [S24]:

| Pattern | Duration | Easing | Other numbers |
|---|---|---|---|
| **Container transform** (`MaterialContainerTransform`) | enter **500ms** (long2), return **400ms** (medium4) | emphasized | Enter fade over progress 0–0.25, shape mask 0–0.75. Return fade 0.60–0.90, scale mask 0–0.90, shape mask 0.30–0.90 (arc-motion variants differ) |
| **Shared axis** X/Y/Z (`MaterialSharedAxis`) — forward/backward and lateral | **450ms** (long1) | emphasized | Slide distance **30dp** (X/Y). Z: incoming scale **0.8→1**, outgoing **1→1.1**. Plus fade-through at threshold 0.35 |
| **Fade through** (`MaterialFadeThrough`) — top level | **450ms** (long1) | emphasized | The outgoing view fades out over the first **35%**, then the incoming fades in. Incoming scale **0.92 → 1** |
| **Fade** (`MaterialFade`) — enter/exit within bounds | enter **400ms** (medium4), exit **150ms** (short3) | enter emphasized-decelerate, exit emphasized-accelerate | Enter: scale **0.8 → 1**, fade completes at **30%** of the duration |
| Elevation scale | — | — | scale **0.85** |

Guidance from M3 [S2][S25]:
* Android enter/exit expands and collapses along x/y and avoids scale and z-axis motion within the screen bounds.
* Top-level transitions fade the old screen out quickly, then fade the new one in.
* "Fully fade out content before fading new content in."
* "Common transitions should not use overt style effects like bouncy springs": use non-bouncy curves for page transitions.
* Skeleton loaders pulse from the top-left to the bottom-right, and content "quickly fades in" once loaded.

### 4.2 Ripple / state layer

| Implementation | Values |
|---|---|
| **material-web** `md-ripple` [S10] | Press grow **450ms**, `cubic-bezier(0.2,0,0,1)` (standard). Minimum press duration **225ms**. Touch delay **150ms**. Initial ripple size = max(w,h) × **0.2**. Final radius = √(w²+h²) + **10px** padding + soft edge max(0.35 × maxDim, **75px**). Press fade-in **105ms** linear, fade-out **375ms** linear. Hover state layer opacity transition **15ms** linear. The gradient is radial: pressed color at max(100% − 70px, 65%), transparent at 100%. |
| **Compose** ripple [S26] | Fade in **75ms** linear. Radius **225ms** FastOutSlowIn (= legacy `cubic-bezier(0.4,0,0.2,1)`). Fade out **150ms** linear. Start radius = max(w,h) × **0.3**. Bounded extra radius **10dp**. |

For the web build, use the material-web numbers.

---

## 5. Reduced motion

Official M3 guidance (Applying transitions → "Follows accessibility settings") [S25]: when the platform reduced-animation setting is on, transitions should:
* "Use subtle fades instead of intense sliding or scaling animations"
* "Disable decorative effects like parallax or shape morphing"

Implementation plan (my proposal, consistent with the above):
1. Use `@media (prefers-reduced-motion: reduce)` in CSS, and `prefersReducedMotion.current` from `svelte/motion` (Svelte ≥ 5.7) [S27] in JS.
2. **Spatial** springs: set the duration to 0ms, or swap slides and scales for a short effects-curve fade. Never overshoot.
3. **Effects** springs (color, opacity) may remain. They are the "subtle fades".
4. Turn off decorative loops: loading indicator shape morph (keep a simple rotation or a static shape), wavy amplitude (render the flat indicator), button and FAB shape morphs (instant swap).
5. Keep the press/ripple state layer feedback but shorten it. Do not remove feedback entirely.
6. WCAG 2.3.3 (AAA) Animation from Interactions applies to non-essential motion triggered by interaction.

---

## 6. Proposed CSS tokens (ready to paste)

Design choices:
* The `--md-sys-motion-duration-*` and `--md-sys-motion-easing-*` names match material-web [S9]. Emphasized uses the exact `linear()` path rather than a bezier.
* Spring tokens are scheme-independent aliases (`--md-sys-motion-spring-{speed}-{type}-easing|-duration`), as M3 intends [S1]. The default scheme is expressive. Switch with `data-motion-scheme="standard"` on any subtree.
* The raw `-stiffness` / `-damping` values are exposed for JS springs.
* Durations use the computed |x−1|<0.001 settle times. The commented-out block lists Google's bezier/duration pairs [S3] for anyone who wants parity with the official table instead.

```css
:root {
  /* ---------- Durations (legacy system, still used by transitions) ---------- */
  --md-sys-motion-duration-short1: 50ms;
  --md-sys-motion-duration-short2: 100ms;
  --md-sys-motion-duration-short3: 150ms;
  --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-duration-medium1: 250ms;
  --md-sys-motion-duration-medium2: 300ms;
  --md-sys-motion-duration-medium3: 350ms;
  --md-sys-motion-duration-medium4: 400ms;
  --md-sys-motion-duration-long1: 450ms;
  --md-sys-motion-duration-long2: 500ms;
  --md-sys-motion-duration-long3: 550ms;
  --md-sys-motion-duration-long4: 600ms;
  --md-sys-motion-duration-extra-long1: 700ms;
  --md-sys-motion-duration-extra-long2: 800ms;
  --md-sys-motion-duration-extra-long3: 900ms;
  --md-sys-motion-duration-extra-long4: 1000ms;

  /* ---------- Easings ---------- */
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0, 1, 1);
  --md-sys-motion-easing-standard-decelerate: cubic-bezier(0, 0, 0, 1);
  /* Exact emphasized path, M 0,0 C .05,0 .133333,.06 .166666,.4 C .208333,.82 .25,1 1,1 */
  --md-sys-motion-easing-emphasized: linear(0, 0.0082 3.2%, 0.0329 6.25%, 0.0723 8.95%, 0.098 10.2%, 0.1269 11.35%, 0.1572 12.35%, 0.1917 13.3%, 0.2286 14.15%, 0.2704 14.95%, 0.3079 15.55%, 0.3486 16.1%, 0.479 17.5%, 0.5452 18.35%, 0.6074 19.4%, 0.66 20.6%, 0.6893 21.45%, 0.7167 22.4%, 0.7655 24.6%, 0.8078 27.25%, 0.8445 30.4%, 0.8833 35.05%, 0.9154 40.6%, 0.9419 47.2%, 0.9632 54.95%, 0.9795 64%, 0.9909 74.4%, 0.9977 86.35%, 1);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
  --md-sys-motion-easing-linear: cubic-bezier(0, 0, 1, 1);
  --md-sys-motion-easing-legacy: cubic-bezier(0.4, 0, 0.2, 1);
  --md-sys-motion-easing-legacy-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --md-sys-motion-easing-legacy-decelerate: cubic-bezier(0, 0, 0.2, 1);

  /* ---------- Spring step-response curves (shape depends only on damping ratio) ---------- */
  --md-ref-motion-spring-curve-d60: linear(0, 0.0077 1.25%, 0.0313 2.6%, 0.0698 4%, 0.1254 5.55%, 0.18 6.85%, 0.2493 8.35%, 0.5292 13.95%, 0.6478 16.45%, 0.7586 19.05%, 0.8487 21.5%, 0.9236 23.95%, 0.9832 26.4%, 1.0298 28.95%, 1.0633 31.6%, 1.0788 33.45%, 1.0888 35.35%, 1.094 37.4%, 1.0943 39.65%, 1.0809 44.7%, 1.0188 58.8%, 0.9979 67.1%, 0.991 78%, 1);
  --md-ref-motion-spring-curve-d80: linear(0, 0.0062 1.35%, 0.0248 2.8%, 0.0557 4.35%, 0.1011 6.1%, 0.1994 9.2%, 0.4298 15.7%, 0.5342 18.8%, 0.6331 22.05%, 0.7167 25.2%, 0.7855 28.25%, 0.8444 31.4%, 0.8931 34.65%, 0.9325 38.05%, 0.9639 41.75%, 0.9871 45.75%, 1.003 50.2%, 1.012 55.25%, 1.0147 64.85%, 1);
  --md-ref-motion-spring-curve-d90: linear(0, 0.0056 1.3%, 0.0223 2.7%, 0.0501 4.2%, 0.0909 5.9%, 0.1785 8.9%, 0.3935 15.5%, 0.4924 18.7%, 0.5874 22.1%, 0.6681 25.4%, 0.7361 28.65%, 0.7939 31.95%, 0.8433 35.4%, 0.8848 39.05%, 0.9214 43.3%, 0.9501 47.95%, 0.9714 53.1%, 0.9862 58.95%, 0.9951 65.45%, 0.9999 73.45%, 1);
  --md-ref-motion-spring-curve-d100: linear(0, 0.0048 1.1%, 0.0196 2.3%, 0.0444 3.6%, 0.0815 5.1%, 0.1596 7.7%, 0.3639 13.8%, 0.4621 16.9%, 0.5561 20.2%, 0.6367 23.45%, 0.7064 26.75%, 0.766 30.15%, 0.8175 33.75%, 0.8605 37.55%, 0.899 42%, 0.9298 46.9%, 0.9535 52.35%, 0.9713 58.6%, 0.9833 65.5%, 0.9914 73.8%, 1);
}

/* ---------- Spring tokens: expressive scheme (default) ---------- */
:root,
[data-motion-scheme='expressive'] {
  --md-sys-motion-spring-fast-spatial-damping: 0.6;
  --md-sys-motion-spring-fast-spatial-stiffness: 800;
  --md-sys-motion-spring-fast-spatial-easing: var(--md-ref-motion-spring-curve-d60);
  --md-sys-motion-spring-fast-spatial-duration: 359ms;

  --md-sys-motion-spring-default-spatial-damping: 0.8;
  --md-sys-motion-spring-default-spatial-stiffness: 380;
  --md-sys-motion-spring-default-spatial-easing: var(--md-ref-motion-spring-curve-d80);
  --md-sys-motion-spring-default-spatial-duration: 435ms;

  --md-sys-motion-spring-slow-spatial-damping: 0.8;
  --md-sys-motion-spring-slow-spatial-stiffness: 200;
  --md-sys-motion-spring-slow-spatial-easing: var(--md-ref-motion-spring-curve-d80);
  --md-sys-motion-spring-slow-spatial-duration: 599ms;

  --md-sys-motion-spring-fast-effects-damping: 1;
  --md-sys-motion-spring-fast-effects-stiffness: 3800;
  --md-sys-motion-spring-fast-effects-easing: var(--md-ref-motion-spring-curve-d100);
  --md-sys-motion-spring-fast-effects-duration: 150ms;

  --md-sys-motion-spring-default-effects-damping: 1;
  --md-sys-motion-spring-default-effects-stiffness: 1600;
  --md-sys-motion-spring-default-effects-easing: var(--md-ref-motion-spring-curve-d100);
  --md-sys-motion-spring-default-effects-duration: 231ms;

  --md-sys-motion-spring-slow-effects-damping: 1;
  --md-sys-motion-spring-slow-effects-stiffness: 800;
  --md-sys-motion-spring-slow-effects-easing: var(--md-ref-motion-spring-curve-d100);
  --md-sys-motion-spring-slow-effects-duration: 326ms;
}

/* ---------- Spring tokens: standard scheme (opt-in per subtree) ---------- */
[data-motion-scheme='standard'] {
  --md-sys-motion-spring-fast-spatial-damping: 0.9;
  --md-sys-motion-spring-fast-spatial-stiffness: 1400;
  --md-sys-motion-spring-fast-spatial-easing: var(--md-ref-motion-spring-curve-d90);
  --md-sys-motion-spring-fast-spatial-duration: 224ms;

  --md-sys-motion-spring-default-spatial-damping: 0.9;
  --md-sys-motion-spring-default-spatial-stiffness: 700;
  --md-sys-motion-spring-default-spatial-easing: var(--md-ref-motion-spring-curve-d90);
  --md-sys-motion-spring-default-spatial-duration: 317ms;

  --md-sys-motion-spring-slow-spatial-damping: 0.9;
  --md-sys-motion-spring-slow-spatial-stiffness: 300;
  --md-sys-motion-spring-slow-spatial-easing: var(--md-ref-motion-spring-curve-d90);
  --md-sys-motion-spring-slow-spatial-duration: 484ms;

  /* effects springs are identical in both schemes; restated so the subtree is self-contained */
  --md-sys-motion-spring-fast-effects-damping: 1;
  --md-sys-motion-spring-fast-effects-stiffness: 3800;
  --md-sys-motion-spring-fast-effects-easing: var(--md-ref-motion-spring-curve-d100);
  --md-sys-motion-spring-fast-effects-duration: 150ms;
  --md-sys-motion-spring-default-effects-damping: 1;
  --md-sys-motion-spring-default-effects-stiffness: 1600;
  --md-sys-motion-spring-default-effects-easing: var(--md-ref-motion-spring-curve-d100);
  --md-sys-motion-spring-default-effects-duration: 231ms;
  --md-sys-motion-spring-slow-effects-damping: 1;
  --md-sys-motion-spring-slow-effects-stiffness: 800;
  --md-sys-motion-spring-slow-effects-easing: var(--md-ref-motion-spring-curve-d100);
  --md-sys-motion-spring-slow-effects-duration: 326ms;
}

/* ---------- Reduced motion: no spatial motion, keep subtle fades ---------- */
@media (prefers-reduced-motion: reduce) {
  :root,
  [data-motion-scheme] {
    --md-sys-motion-spring-fast-spatial-duration: 0ms;
    --md-sys-motion-spring-default-spatial-duration: 0ms;
    --md-sys-motion-spring-slow-spatial-duration: 0ms;
    --md-sys-motion-spring-fast-spatial-easing: var(--md-ref-motion-spring-curve-d100);
    --md-sys-motion-spring-default-spatial-easing: var(--md-ref-motion-spring-curve-d100);
    --md-sys-motion-spring-slow-spatial-easing: var(--md-ref-motion-spring-curve-d100);
    --md-sys-motion-reduced: 1; /* components read this to disable shape morphs / wavy / loaders */
  }
}

/* Optional: Google's official bezier substitutes [S3] (use instead of linear() for parity)
  expressive: fast-spatial cubic-bezier(0.42,1.67,0.21,0.90) 350ms | default-spatial cubic-bezier(0.38,1.21,0.22,1.00) 500ms
              slow-spatial cubic-bezier(0.39,1.29,0.35,0.98) 650ms | fast-effects cubic-bezier(0.31,0.94,0.34,1.00) 150ms
              default-effects cubic-bezier(0.34,0.80,0.34,1.00) 200ms | slow-effects cubic-bezier(0.34,0.88,0.34,1.00) 300ms
  standard:   all spatial cubic-bezier(0.27,1.06,0.18,1.00) at 350 / 500 / 750ms; effects same as expressive
*/
```

Usage in Tailwind 4 (the `ease-(--var)` / `duration-(--var)` arbitrary-property syntax is v4 syntax; I have not tested it against this repo's Tailwind config):

```html
<button class="transition-[border-radius] ease-(--md-sys-motion-spring-fast-effects-easing) duration-(--md-sys-motion-spring-fast-effects-duration)">
```

Or register a theme alias so that `ease-m3-fast-spatial` exists:

```css
@theme inline {
  --ease-m3-fast-spatial: var(--md-sys-motion-spring-fast-spatial-easing);
  --ease-m3-default-spatial: var(--md-sys-motion-spring-default-spatial-easing);
  --ease-m3-fast-effects: var(--md-sys-motion-spring-fast-effects-easing);
  --ease-m3-emphasized: var(--md-sys-motion-easing-emphasized);
}
```

---

## 7. Discrepancies and unverifiable items

1. **Emphasized-accelerate / -decelerate** differ in MDC-Android `tokens.xml`: `(0.3,0,0.8,0.2)` and `(0.1,0.7,0.1,1)` [S8]. m3.material.io, Compose and material-web all use `(0.3,0,0.8,0.15)` and `(0.05,0.7,0.1,1)`. This document uses the latter.
2. **Emphasized CSS**: the M3 site says there is no CSS form ("use Standard"). material-web tokens use `cubic-bezier(0.2,0,0,1)`, and material-web internals use `cubic-bezier(.3,0,0,1)`. This document uses the exact `linear()`.
3. **Press morph token**: the M3 site caption says components use fast spatial + fast effects. Compose deliberately uses `DefaultEffects` (no bounce) for Button, IconButton and SplitButton press morphs, and `FastSpatial` for ToggleButton and ButtonGroup.
4. **Google spring durations** (350/500/650/150/200/300; standard 350/500/750) are curve durations for the bezier substitutes, and Google does not explain how they were derived. The computed settle times differ (359/435/599/150/231/326; standard 224/317/484).
5. **Per-device spring values** (wearable/tablet) are mentioned [S1] but not published.
6. **Not found in official sources:** numeric specs for toolbar hide-on-scroll beyond the snap spec and the 0.5 threshold, any animated slider handle narrowing (Compose swaps instantly), the circular *wavy* indeterminate timing (not verified), and m3.material.io component pages with motion numbers (the loading-indicator spec page has none [S19]). Everything in section 4 comes from Compose source, not from design-spec pages.

---

## Sources

- [S1] M3 – Motion physics system, How it works: https://m3.material.io/styles/motion/overview/how-it-works
- [S2] M3 – Transitions, Transition patterns: https://m3.material.io/styles/motion/transitions/transition-patterns
- [S3] M3 – Motion physics system, Specs (spring tokens + "Web: Convert springs to curves"): https://m3.material.io/styles/motion/overview/specs
- [S4] M3 – Easing and duration, Tokens & specs: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- [S5] Compose `MotionScheme.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt
- [S6] Compose `ExpressiveMotionTokens.kt` / `StandardMotionTokens.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt , https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt
- [S7] Compose `MotionTokens.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/MotionTokens.kt
- [S8] MDC-Android motion `tokens.xml`: https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/motion/res/values/tokens.xml
- [S9] material-web `tokens/versions/v0_192/_md-sys-motion.scss` (via `tokens/_md-sys-motion.scss`): https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss
- [S10] material-web ripple + easing constants: https://raw.githubusercontent.com/material-components/material-web/main/ripple/internal/ripple.ts , https://raw.githubusercontent.com/material-components/material-web/main/ripple/internal/_ripple.scss , https://raw.githubusercontent.com/material-components/material-web/main/internal/motion/animation.ts
- [S11] MDN – `linear()` easing function: https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear
- [S12] M3 – Easing and duration, Applying easing and duration: https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration
- [S13] MDC-Android motion `styles.xml`: https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/motion/res/values/styles.xml
- [S14] MDC-Android motion `attrs.xml`: https://raw.githubusercontent.com/material-components/material-components-android/master/lib/java/com/google/android/material/motion/res/values/attrs.xml
- [S15] Svelte `spring.js`: https://raw.githubusercontent.com/sveltejs/svelte/main/packages/svelte/src/motion/spring.js
- [S16] Compose Material3 component sources (`Button.kt`, `ToggleButton.kt`, `IconButton.kt`, `SplitButton.kt`, `ButtonGroup.kt`, `FloatingActionButtonMenu.kt`, `FloatingActionButton.kt`, `Checkbox.kt`, `RadioButton.kt`): https://github.com/androidx/androidx/tree/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3
- [S17] Compose Material3 component tokens (`Button*Tokens`, `ShapeTokens`, `Fab*Tokens`, `FabMenuBaselineTokens`, `SwitchTokens`, `SliderTokens`, `LoadingIndicatorTokens`, `LinearProgressIndicatorTokens`, `CircularProgressIndicatorTokens`, `NavigationRailCollapsedTokens`, `NavigationRailExpandedTokens`): https://github.com/androidx/androidx/tree/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens
- [S18] Compose `LoadingIndicator.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt
- [S19] M3 – Loading indicator specs: https://m3.material.io/components/loading-indicator/specs
- [S20] Compose `WavyProgressIndicator.kt`, `ProgressIndicator.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/WavyProgressIndicator.kt , https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ProgressIndicator.kt
- [S21] Compose `Switch.kt`, `Slider.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Switch.kt , https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Slider.kt
- [S22] Compose `NavigationBar.kt`, `NavigationItem.kt`, `WideNavigationRail.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/NavigationBar.kt , https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/NavigationItem.kt , https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/WideNavigationRail.kt
- [S23] Compose `FloatingToolbar.kt`, `AppBar.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/FloatingToolbar.kt , https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBar.kt
- [S24] MDC-Android transitions (`MaterialContainerTransform`, `MaterialSharedAxis`, `MaterialFadeThrough`, `MaterialFade`, `FadeThroughProvider`, `ScaleProvider`, `MaterialElevationScale`, `res/values/dimens.xml`): https://github.com/material-components/material-components-android/tree/master/lib/java/com/google/android/material/transition
- [S25] M3 – Transitions, Applying transitions (accessibility / reduced motion, clean fades): https://m3.material.io/styles/motion/transitions/applying-transitions
- [S26] Compose `material-ripple/RippleAnimation.kt`: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material/material-ripple/src/commonMain/kotlin/androidx/compose/material/ripple/RippleAnimation.kt
- [S27] Svelte docs – `svelte/motion` (`Spring`, `Tween` since 5.8.0; `prefersReducedMotion` since 5.7.0): https://svelte.dev/docs/svelte/svelte-motion
