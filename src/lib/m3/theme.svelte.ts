/**
 * Runtime M3 theming (docs/research/color.md §6).
 *
 * The static baseline scheme lives in src/routes/layout.css. When the configuration differs from the
 * baseline (seed #6750A4, tonalSpot, contrast 0, spec 2021) ThemeState generates both schemes with
 * @material/material-color-utilities and writes the active mode's `--md-sys-color-*` vars inline on
 * <html>; everything else (shadcn aliases, Tailwind utilities) follows automatically.
 *
 * MCU 0.4.0 has an ESM packaging bug under plain Node (see color.md §6.1), so it is only ever loaded
 * in the browser via dynamic import() from `start()`'s effect (and vite.config.ts also bundles it for SSR).
 *
 * Usage (root layout):   const theme = createTheme(); theme.start();
 * Usage (anywhere below): const theme = getTheme(); theme.seed = '#0b57d0';
 */
import { createContext } from 'svelte';
import { mode, setMode } from 'mode-watcher';
import type { DynamicScheme } from '@material/material-color-utilities';
import { BASELINE_DARK, BASELINE_LIGHT, COLOR_ROLES, cssVar, roleToCamel, type ColorMap } from './color-roles.js';
import type { MotionScheme } from './motion.js';

type MCU = typeof import('@material/material-color-utilities');

export type SchemeVariant =
	| 'tonalSpot'
	| 'expressive'
	| 'vibrant'
	| 'fidelity'
	| 'content'
	| 'neutral'
	| 'monochrome'
	| 'rainbow'
	| 'fruitSalad';

export type SpecVersion = '2021' | '2025';

/** Variants with UI labels; MCU class per variant. */
export const SCHEME_VARIANTS: readonly { value: SchemeVariant; label: string }[] = [
	{ value: 'tonalSpot', label: 'Tonal spot (default)' },
	{ value: 'expressive', label: 'Expressive' },
	{ value: 'vibrant', label: 'Vibrant' },
	{ value: 'fidelity', label: 'Fidelity' },
	{ value: 'content', label: 'Content' },
	{ value: 'neutral', label: 'Neutral' },
	{ value: 'monochrome', label: 'Monochrome' },
	{ value: 'rainbow', label: 'Rainbow' },
	{ value: 'fruitSalad', label: 'Fruit salad' }
];

export const DEFAULT_SEED = '#6750A4';
const HEX_RE = /^#?[0-9a-f]{6}$/i;
const STORAGE_KEY = 'm3-theme';

interface PersistedTheme {
	seed: string;
	variant: SchemeVariant;
	contrast: number;
	specVersion: SpecVersion;
	motionScheme: MotionScheme;
}

function schemeClass(mcu: MCU, variant: SchemeVariant) {
	switch (variant) {
		case 'tonalSpot':
			return mcu.SchemeTonalSpot;
		case 'expressive':
			return mcu.SchemeExpressive;
		case 'vibrant':
			return mcu.SchemeVibrant;
		case 'fidelity':
			return mcu.SchemeFidelity;
		case 'content':
			return mcu.SchemeContent;
		case 'neutral':
			return mcu.SchemeNeutral;
		case 'monochrome':
			return mcu.SchemeMonochrome;
		case 'rainbow':
			return mcu.SchemeRainbow;
		case 'fruitSalad':
			return mcu.SchemeFruitSalad;
	}
}

/** Build the 49-role hex map for one mode with MCU (color.md §6.2 recipe). */
export function buildColorMap(
	mcu: MCU,
	seed: string,
	isDark: boolean,
	variant: SchemeVariant = 'tonalSpot',
	contrast = 0,
	specVersion: SpecVersion = '2021'
): ColorMap {
	const Scheme = schemeClass(mcu, variant);
	const scheme: DynamicScheme = new Scheme(mcu.Hct.fromInt(mcu.argbFromHex(seed)), isDark, contrast, specVersion);
	const mdc = new mcu.MaterialDynamicColors() as unknown as Record<
		string,
		() => { getArgb(s: DynamicScheme): number }
	>;
	const out = {} as ColorMap;
	for (const role of COLOR_ROLES) out[role] = mcu.hexFromArgb(mdc[roleToCamel(role)]().getArgb(scheme));
	return out;
}

export class ThemeState {
	/** Source color (hex). */
	seed = $state(DEFAULT_SEED);
	variant = $state<SchemeVariant>('tonalSpot');
	/** -1 reduced, 0 standard, 0.5 medium, 1 high. */
	contrast = $state(0);
	/** MCU spec. '2021' matches the published baseline; '2025' is the newer, more colorful opt-in. */
	specVersion = $state<SpecVersion>('2021');
	/** Spring scheme written to <html data-motion-scheme>. */
	motionScheme = $state<MotionScheme>('expressive');

	#mcu = $state.raw<MCU | null>(null);

	/** Mirrors mode-watcher's `mode`; assigning calls `setMode`. */
	get dark() {
		return mode.current === 'dark';
	}
	set dark(value: boolean) {
		setMode(value ? 'dark' : 'light');
	}

	/** True when the static baseline from layout.css is in effect (no inline overrides). */
	isBaseline = $derived(
		this.seed.toLowerCase() === DEFAULT_SEED.toLowerCase() &&
			this.variant === 'tonalSpot' &&
			this.contrast === 0 &&
			this.specVersion === '2021'
	);

	/** True once MCU is loaded (or not needed). */
	ready = $derived(this.isBaseline || this.#mcu !== null);

	/** Light scheme hex map (`null` while MCU is loading or the seed is not a valid #rrggbb). */
	lightColors = $derived.by(() => this.#compute(false));
	/** Dark scheme hex map (`null` while MCU is loading or the seed is not a valid #rrggbb). */
	darkColors = $derived.by(() => this.#compute(true));

	/** Active-mode role → hex map (falls back to the baseline while loading). */
	colors = $derived<ColorMap>(
		(this.dark ? this.darkColors : this.lightColors) ?? (this.dark ? BASELINE_DARK : BASELINE_LIGHT)
	);

	/** Active-mode `--md-sys-color-*` → hex map. */
	cssVars = $derived(
		Object.fromEntries(COLOR_ROLES.map((r) => [cssVar(r), this.colors[r]])) as Record<string, string>
	);

	#compute(isDark: boolean): ColorMap | null {
		if (this.isBaseline) return isDark ? BASELINE_DARK : BASELINE_LIGHT;
		const mcu = this.#mcu;
		const seed = this.seed.trim();
		if (!mcu || !HEX_RE.test(seed)) return null;
		return buildColorMap(mcu, seed.startsWith('#') ? seed : `#${seed}`, isDark, this.variant, this.contrast, this.specVersion);
	}

	/**
	 * Write the active mode's color vars inline on <html> (or remove them for the baseline) and set
	 * `data-motion-scheme`. Called automatically by `start()`; safe to call manually. No-op on the server.
	 */
	apply() {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		root.dataset.motionScheme = this.motionScheme;
		if (this.isBaseline) {
			for (const role of COLOR_ROLES) root.style.removeProperty(cssVar(role));
			return;
		}
		const map = this.dark ? this.darkColors : this.lightColors;
		if (!map) return; // still loading / invalid seed: keep whatever is applied
		for (const role of COLOR_ROLES) root.style.setProperty(cssVar(role), map[role]);
	}

	/** Back to the static M3 baseline (removes the inline vars). Motion scheme is left as is. */
	reset() {
		this.seed = DEFAULT_SEED;
		this.variant = 'tonalSpot';
		this.contrast = 0;
		this.specVersion = '2021';
		this.apply();
	}

	/** Stylesheet text with both schemes (`:root` light, `.dark` dark) — e.g. for a "copy CSS" button. */
	toCss() {
		const light = this.lightColors ?? BASELINE_LIGHT;
		const dark = this.darkColors ?? BASELINE_DARK;
		const block = (sel: string, map: ColorMap) =>
			`${sel} {\n${COLOR_ROLES.map((r) => `\t${cssVar(r)}: ${map[r]};`).join('\n')}\n}`;
		return `${block(':root', light)}\n\n${block('.dark', dark)}\n`;
	}

	/**
	 * Start syncing state → DOM. Must be called during component initialisation (root layout),
	 * because it creates effects. Effects never run on the server.
	 */
	start() {
		this.#restore();
		$effect(() => {
			if (!this.isBaseline && !this.#mcu) {
				import('@material/material-color-utilities').then((m) => (this.#mcu = m));
			}
		});
		$effect(() => this.apply());
		$effect(() => this.#persist());
	}

	/** Load the saved configuration from localStorage (browser only, best effort). */
	#restore() {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const saved = JSON.parse(raw) as Partial<PersistedTheme>;
			if (typeof saved.seed === 'string' && HEX_RE.test(saved.seed)) this.seed = saved.seed;
			if (SCHEME_VARIANTS.some((v) => v.value === saved.variant)) this.variant = saved.variant as SchemeVariant;
			if (typeof saved.contrast === 'number' && saved.contrast >= -1 && saved.contrast <= 1)
				this.contrast = saved.contrast;
			if (saved.specVersion === '2021' || saved.specVersion === '2025') this.specVersion = saved.specVersion;
			if (saved.motionScheme === 'expressive' || saved.motionScheme === 'standard')
				this.motionScheme = saved.motionScheme;
		} catch {
			// ignore corrupt or blocked storage
		}
	}

	/** Save the configuration (runs in an effect, so it tracks every field it reads). */
	#persist() {
		const data: PersistedTheme = {
			seed: this.seed,
			variant: this.variant,
			contrast: this.contrast,
			specVersion: this.specVersion,
			motionScheme: this.motionScheme
		};
		if (typeof localStorage === 'undefined') return;
		try {
			if (this.isBaseline && this.motionScheme === 'expressive') localStorage.removeItem(STORAGE_KEY);
			else localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch {
			// storage unavailable (private mode, quota): the theme still works for the session
		}
	}
}

const [getThemeContext, setThemeContext] = createContext<ThemeState>();

/** Create the ThemeState and provide it via context (call once, in the root layout). */
export function createTheme() {
	return setThemeContext(new ThemeState());
}

/** Read the ThemeState provided by the root layout. */
export function getTheme() {
	return getThemeContext();
}
