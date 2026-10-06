/*
 * Shared visual system for the dashboard charts (one look for every plot).
 *
 * Series colors are plain M3 role variables (`var(--md-sys-color-*)`), not the shadcn
 * `--color-<key>` indirection: LayerChart portals its tooltip to <body>, outside the
 * `[data-chart]` scope where `--color-<key>` is defined, so indicator swatches resolved to
 * transparent. Role variables live on <html> and resolve everywhere, and they follow the
 * theme (seed / dark) without re-creating the charts.
 */

/** Social slot for the donut: needs the opposite lightness of `tertiary` in both schemes. */
export const TERTIARY_SOFT =
	'light-dark(var(--md-sys-color-tertiary-fixed-dim), var(--md-sys-color-tertiary-container))';

/**
 * Vertical area gradient stops: `pct`% of the color at the top, fading to (almost) transparent.
 * The end stop keeps the hue: `color-mix(…0%, transparent)` collapses to transparent *black*, and
 * SVG gradients interpolate un-premultiplied, which painted a grey band at the bottom of every area.
 */
export function fadeStops(color: string, pct: number): [string, string] {
	return [`color-mix(in srgb, ${color} ${pct}%, transparent)`, `color-mix(in srgb, ${color} 1%, transparent)`];
}

/**
 * Chart.Container overrides: label-small tick labels in on-surface-variant, a visible 1dp
 * crosshair (the shadcn container hides it), recessive grid lines.
 * `!` because the container's own descendant selectors are more specific.
 */
export const CHART_CLASS = [
	'[&_.lc-axis-tick-label]:fill-on-surface-variant! [&_.lc-axis-tick-label]:text-[11px]! [&_.lc-axis-tick-label]:font-medium! [&_.lc-axis-tick-label]:tracking-[0.5px]',
	'[&_.lc-grid_line]:stroke-outline-variant/70!',
	'[&_.lc-highlight-line]:stroke-outline! [&_.lc-highlight-line]:stroke-1! [&_.lc-highlight-line]:[stroke-dasharray:3_3]'
].join(' ');
