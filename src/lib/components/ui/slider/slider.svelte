<script lang="ts" module>
	export type SliderSize = "xs" | "sm" | "md" | "lg" | "xl";

	/** Per-size dimensions in dp (docs/research/inputs-selection.md §4.3). */
	export const SLIDER_SIZES: Record<SliderSize, { track: number; handle: number; corner: number }> = {
		xs: { track: 16, handle: 44, corner: 8 },
		sm: { track: 24, handle: 44, corner: 8 },
		md: { track: 40, handle: 52, corner: 12 },
		lg: { track: 56, handle: 68, corner: 16 },
		xl: { track: 96, handle: 108, corner: 28 },
	};

	/** Handle layout width (4dp) / 2 + 6dp handle–track gap. Compose uses the layout width, so the
	 * visible gap grows by 1dp per side while the handle is shrunk to 2dp. */
	const GAP = 4 / 2 + 6;
	const INNER_CORNER = 2;

	const defaultFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format;
</script>

<script lang="ts">
	import { untrack } from "svelte";
	import { Slider as SliderPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	type BaseProps = Omit<
		SliderPrimitive.RootProps,
		| "type"
		| "value"
		| "onValueChange"
		| "onValueCommit"
		| "children"
		| "child"
		| "thumbPositioning"
		| "trackPadding"
		| "dir"
	>;

	/**
	 * M3 Expressive slider (docs/research/inputs-selection.md §4).
	 * 4dp handle (2dp while pressed / dragged / focused), 6dp gap on each side, track split into
	 * active / inactive segments (2dp inner corners, per-size outer corners), 4dp stop indicators,
	 * value indicator 48×44dp 12dp above the handle. Sizes xs–xl, standard / centered / range,
	 * discrete stops, horizontal / vertical, RTL (auto-detected from the inherited `direction`).
	 * `aria-label` / `aria-labelledby` name the handle(s) (the root has no role); range handles get
	 * `thumbLabels` or "<label>, start" / "<label>, end". Keys: arrows, Home / End, PageUp / PageDown
	 * (10% of the range).
	 */
	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		min = 0,
		max = 100,
		step = 1,
		size = "xs",
		centered = false,
		ticks = false,
		valueIndicator = false,
		format = defaultFormat,
		orientation = "horizontal",
		disabled = false,
		dir,
		thumbLabels,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledby,
		onValueChange,
		onValueCommit,
		class: className,
		...restProps
	}: Omit<BaseProps, "step"> & {
		/** A number for a single slider, `[start, end]` for a range slider. */
		value?: number | number[];
		/** Inferred from `value` when omitted (array → `"multiple"`, i.e. a range slider). */
		type?: "single" | "multiple";
		step?: number;
		size?: SliderSize;
		/** Active track grows from the middle of the range (single sliders only). */
		centered?: boolean;
		/** Discrete mode: draw a stop indicator at every `step`. */
		ticks?: boolean;
		/** Show the value label above the handle while pressed, dragged or keyboard-focused. */
		valueIndicator?: boolean;
		format?: (value: number) => string;
		/** Reading direction for horizontal sliders. Default: the inherited CSS `direction`. */
		dir?: "ltr" | "rtl";
		/** Accessible names per handle (range sliders). */
		thumbLabels?: string[];
		"aria-label"?: string;
		"aria-labelledby"?: string;
		onValueChange?: (value: number & number[]) => void;
		onValueCommit?: (value: number & number[]) => void;
	} = $props();

	let multiple = $derived(type ? type === "multiple" : Array.isArray(value));
	let dims = $derived(SLIDER_SIZES[size]);
	let vertical = $derived(orientation === "vertical");

	// Seed an uncontrolled slider once (range → [min, max], centered → the middle, else min).
	untrack(() => {
		if (value === undefined) value = type === "multiple" ? [min, max] : centered ? (min + max) / 2 : min;
	});

	let railSize = $state(0);

	// Horizontal sliders follow the page direction unless `dir` is set; vertical ones always grow
	// bottom → top (bits-ui would flip a vertical `rtl` slider to top → bottom).
	let inheritedDir = $state<"ltr" | "rtl">("ltr");
	const detectDir = (node: HTMLElement) => {
		inheritedDir = getComputedStyle(node).direction === "rtl" ? "rtl" : "ltr";
	};
	let rtl = $derived(!vertical && (dir ?? inheritedDir) === "rtl");

	function thumbLabel(index: number) {
		if (thumbLabels?.[index]) return thumbLabels[index];
		if (!ariaLabel || !multiple) return ariaLabel;
		return `${ariaLabel}, ${index === 0 ? "start" : "end"}`;
	}

	const snapToStep = (v: number) => {
		const snapped = step > 0 ? min + Math.round((v - min) / step) * step : v;
		// trim float noise (0.1 + 0.2) to the step's precision
		const decimals = (String(step).split(".")[1] ?? "").length;
		return Math.min(max, Math.max(min, Number(snapped.toFixed(decimals))));
	};

	// PageUp / PageDown: ±10% of the range (bits-ui only handles arrows and Home / End).
	function onPageKey(e: KeyboardEvent) {
		if (disabled || (e.key !== "PageUp" && e.key !== "PageDown")) return;
		const rail = e.currentTarget as HTMLElement;
		const thumbs = [...rail.querySelectorAll<HTMLElement>("[role=slider]")];
		const index = thumbs.indexOf(e.target as HTMLElement);
		if (index < 0) return;
		e.preventDefault();
		const big = Math.max(step, Math.round((max - min) / 10 / step) * step);
		const current = values[index] ?? min;
		let next = snapToStep(current + (e.key === "PageUp" ? big : -big));
		if (multiple) {
			// keep range handles from crossing
			next = Math.min(values[index + 1] ?? max, Math.max(values[index - 1] ?? min, next));
			const arr = [...values];
			arr[index] = next;
			value = arr;
		} else {
			value = next;
		}
		onValueChange?.(value as number & number[]);
		onValueCommit?.(value as number & number[]);
	}
	// bits-ui focuses the thumb programmatically on pointerdown, which Chrome reports as
	// :focus-visible. Track pointer-initiated focus so only keyboard focus shows the ring,
	// the 2dp handle and the value indicator (a key press on the thumb shows them again).
	let pointerFocus = $state(false);
	const railHandlers = {
		onpointerdown: () => (pointerFocus = true),
		onkeydown: (e: KeyboardEvent) => {
			pointerFocus = false;
			onPageKey(e);
		},
		onfocusout: (e: FocusEvent) => {
			const rail = e.currentTarget as HTMLElement;
			if (!(e.relatedTarget instanceof Node && rail.contains(e.relatedTarget))) pointerFocus = false;
		},
	};

	const frac = (v: number) => (max === min ? 0 : Math.min(1, Math.max(0, (v - min) / (max - min))));
	let values = $derived(Array.isArray(value) ? value : [value ?? min]);
	let fracs = $derived(values.map(frac));

	type Pos = { f: number; px: number };
	type Segment = { key: string; active: boolean; from: Pos; to: Pos; outerStart: boolean; outerEnd: boolean };

	let segments = $derived.by((): Segment[] => {
		const inset = dims.corner;
		const start: Pos = { f: 0, px: -inset };
		const end: Pos = { f: 1, px: inset };
		const before = (f: number): Pos => ({ f, px: -GAP });
		const after = (f: number): Pos => ({ f, px: GAP });
		const seg = (key: string, active: boolean, from: Pos, to: Pos): Segment => ({
			key,
			active,
			from,
			to,
			outerStart: from === start,
			outerEnd: to === end,
		});

		if (multiple && fracs.length > 1) {
			const lo = Math.min(...fracs);
			const hi = Math.max(...fracs);
			return [
				seg("inactive-start", false, start, before(lo)),
				seg("active", true, after(lo), before(hi)),
				seg("inactive-end", false, after(hi), end),
			];
		}
		const h = fracs[0] ?? 0;
		if (centered) {
			const mid: Pos = { f: 0.5, px: 0 };
			return [
				seg("inactive-start", false, start, before(h)),
				seg("inactive-end", false, after(h), end),
				h >= 0.5 ? seg("active", true, mid, before(h)) : seg("active", true, after(h), mid),
			];
		}
		return [seg("active", true, start, before(h)), seg("inactive", false, after(h), end)];
	});

	let stops = $derived.by(() => {
		let list: number[];
		if (ticks && step > 0 && (max - min) / step <= 1000) {
			const n = Math.round((max - min) / step);
			list = Array.from({ length: n + 1 }, (_, i) => Math.min(1, (i * step) / (max - min)));
		} else if (multiple || centered) {
			list = [0, 1];
		} else {
			list = [1];
		}
		const lo = Math.min(...fracs);
		const hi = Math.max(...fracs);
		return list
			.filter((f) => !railSize || fracs.every((h) => Math.abs(f - h) * railSize > GAP))
			.map((f) => {
				let active: boolean;
				if (multiple) active = f > lo && f < hi;
				else if (centered) active = (f >= 0.5 && f < hi) || (f <= 0.5 && f > lo);
				else active = f < hi;
				return { f, active };
			});
	});

	const startCss = (p: Pos) => `calc(${p.f * 100}% + ${p.px}px)`;
	const endCss = (p: Pos) => `calc(${(1 - p.f) * 100}% - ${p.px}px)`;
</script>

<span
	data-slot="slider"
	data-size={size}
	data-orientation={orientation}
	data-disabled={disabled || undefined}
	data-rtl={rtl || undefined}
	class={cn("m3-slider", vertical ? "inline-block h-60" : "block w-full", className)}
	{@attach detectDir}
	style:--_track="{dims.track}px"
	style:--_handle="{dims.handle}px"
	style:--_corner="{dims.corner}px"
	style:--_inner="{INNER_CORNER}px"
>
	<SliderPrimitive.Root
		bind:ref
		bind:value={value as never}
		type={multiple ? "multiple" : "single"}
		{min}
		{max}
		{step}
		{orientation}
		{disabled}
		dir={rtl ? "rtl" : "ltr"}
		thumbPositioning="exact"
		onValueChange={onValueChange as never}
		onValueCommit={onValueCommit as never}
		{...restProps}
	>
		{#snippet child({ props, thumbItems })}
			{#if vertical}
				<span
					{...props}
					{...railHandlers}
					class="rail"
					data-pointer-focus={pointerFocus || undefined}
					bind:clientHeight={railSize}
				>
					{@render track(thumbItems)}
				</span>
			{:else}
				<span
					{...props}
					{...railHandlers}
					class="rail"
					data-pointer-focus={pointerFocus || undefined}
					bind:clientWidth={railSize}
				>
					{@render track(thumbItems)}
				</span>
			{/if}
		{/snippet}
	</SliderPrimitive.Root>
</span>

{#snippet track(thumbItems: { index: number; value: number }[])}
	{#each segments as s (s.key)}
		<span
			aria-hidden="true"
			class="segment"
			data-active={s.active || undefined}
			style:--_s={startCss(s.from)}
			style:--_e={endCss(s.to)}
			style:--_rs={s.outerStart ? "var(--_corner)" : "var(--_inner)"}
			style:--_re={s.outerEnd ? "var(--_corner)" : "var(--_inner)"}
		></span>
	{/each}
	{#each stops as stop (stop.f)}
		<span aria-hidden="true" class="stop" data-active={stop.active || undefined} style:--_p="{stop.f * 100}%"
		></span>
	{/each}
	{#each thumbItems as thumb (thumb.index)}
		<SliderPrimitive.Thumb
			index={thumb.index}
			aria-label={thumbLabel(thumb.index)}
			aria-labelledby={ariaLabelledby}
			aria-valuetext={format(thumb.value)}
		>
			{#snippet child({ props })}
				<span {...props} class="handle" data-slot="slider-thumb">
					{#if valueIndicator}
						<span class="value-indicator type-label-lg" aria-hidden="true">{format(thumb.value)}</span>
					{/if}
				</span>
			{/snippet}
		</SliderPrimitive.Thumb>
	{/each}
{/snippet}

<style>
	.m3-slider {
		--_active: var(--md-sys-color-primary);
		--_inactive: var(--md-sys-color-secondary-container);
		--_handle-color: var(--md-sys-color-primary);
		--_stop-inactive: var(--md-sys-color-on-secondary-container);
		--_stop-active: var(--md-sys-color-on-primary);

		position: relative;
		box-sizing: border-box;
		flex-shrink: 0;
		/* the handle travels between the outer-corner insets so it can sit exactly on the end stops */
		padding-inline: var(--_corner);
		-webkit-tap-highlight-color: transparent;
		user-select: none;
	}
	.m3-slider[data-orientation="vertical"] {
		padding-inline: 0;
		padding-block: var(--_corner);
	}
	.m3-slider[data-disabled] {
		--_active: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-content-opacity) * 100%),
			transparent
		);
		--_inactive: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-container-opacity) * 100%),
			transparent
		);
		--_handle-color: var(--_active);
		--_stop-inactive: var(--md-sys-color-on-surface);
		--_stop-active: var(--md-sys-color-inverse-on-surface);
	}

	.rail {
		position: relative;
		display: block;
		width: 100%;
		height: var(--_handle);
		cursor: pointer;
		outline: none;
	}
	.m3-slider[data-orientation="vertical"] .rail {
		width: var(--_handle);
		height: 100%;
	}
	.m3-slider[data-disabled] .rail {
		cursor: default;
	}
	/* ≥ 48dp touch target across the whole track (incl. the corner insets) */
	.rail::before {
		content: "";
		position: absolute;
		inset: min(0px, (var(--_handle) - 48px) / 2) calc(-1 * var(--_corner));
	}
	.m3-slider[data-orientation="vertical"] .rail::before {
		inset: calc(-1 * var(--_corner)) min(0px, (var(--_handle) - 48px) / 2);
	}

	.segment {
		position: absolute;
		top: 50%;
		left: var(--_s);
		right: var(--_e);
		height: var(--_track);
		translate: 0 -50%;
		background-color: var(--_inactive);
		border-radius: var(--_rs) var(--_re) var(--_re) var(--_rs);
		pointer-events: none;
	}
	.segment[data-active] {
		background-color: var(--_active);
	}
	/* RTL: the start of the range is on the right (bits-ui positions the thumbs with `right`) */
	.m3-slider[data-rtl] .segment {
		left: var(--_e);
		right: var(--_s);
		border-radius: var(--_re) var(--_rs) var(--_rs) var(--_re);
	}
	.m3-slider[data-orientation="vertical"] .segment {
		top: var(--_e);
		bottom: var(--_s);
		left: 50%;
		right: auto;
		width: var(--_track);
		height: auto;
		translate: -50% 0;
		/* start = bottom */
		border-radius: var(--_re) var(--_re) var(--_rs) var(--_rs);
	}

	.stop {
		position: absolute;
		top: 50%;
		left: var(--_p);
		width: 4px;
		height: 4px;
		translate: -50% -50%;
		border-radius: var(--md-sys-shape-corner-full);
		background-color: var(--_stop-inactive);
		pointer-events: none;
	}
	.stop[data-active] {
		background-color: var(--_stop-active);
	}
	.m3-slider[data-rtl] .stop {
		left: auto;
		right: var(--_p);
		translate: 50% -50%;
	}
	.m3-slider[data-orientation="vertical"] .stop {
		top: auto;
		bottom: var(--_p);
		left: 50%;
		translate: -50% 50%;
	}

	.handle {
		/* bits-ui sets position / left|bottom / translate inline */
		top: 0;
		display: block;
		width: 4px;
		height: 100%;
		border-radius: var(--md-sys-shape-corner-full);
		background-color: var(--_handle-color);
		cursor: grab;
	}
	.m3-slider[data-orientation="vertical"] .handle {
		top: auto;
		left: 0;
		width: 100%;
		height: 4px;
	}
	/* pressed / dragged / focused: 2dp, instant (Compose and MDC don't animate it) */
	.handle[data-active],
	.rail:not([data-pointer-focus]) .handle:focus-visible,
	.rail:is([data-preview="pressed"], [data-preview="focus"]) .handle {
		width: 2px;
	}
	/* the dragged handle (and its value indicator) paints above the other range handle */
	.handle[data-active],
	.handle:focus-visible {
		z-index: 1;
	}
	.rail[data-pointer-focus] .handle:focus-visible {
		outline: none;
	}
	.m3-slider[data-orientation="vertical"] .handle[data-active],
	.m3-slider[data-orientation="vertical"] .rail:not([data-pointer-focus]) .handle:focus-visible,
	.m3-slider[data-orientation="vertical"] .rail:is([data-preview="pressed"], [data-preview="focus"]) .handle {
		width: 100%;
		height: 2px;
	}
	.handle[data-active] {
		cursor: grabbing;
	}
	.m3-slider[data-disabled] .handle {
		cursor: default;
	}

	.value-indicator {
		position: absolute;
		bottom: calc(100% + 12px);
		left: 50%;
		translate: -50% 0;
		display: grid;
		place-items: center;
		min-width: 48px;
		height: 44px;
		padding-inline: 4px;
		box-sizing: border-box;
		border-radius: var(--md-sys-shape-corner-full);
		background-color: var(--md-sys-color-inverse-surface);
		color: var(--md-sys-color-inverse-on-surface);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
		transform-origin: bottom center;
		opacity: 0;
		scale: 0;
		/* exit: short3 (150ms) emphasized-accelerate */
		transition:
			opacity var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate),
			scale var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-emphasized-accelerate);
	}
	.m3-slider[data-orientation="vertical"] .value-indicator {
		bottom: auto;
		left: auto;
		top: 50%;
		right: calc(100% + 12px);
		translate: 0 -50%;
		transform-origin: right center;
	}
	.handle[data-active] .value-indicator,
	.rail:not([data-pointer-focus]) .handle:focus-visible .value-indicator,
	.rail:is([data-preview="pressed"], [data-preview="focus"]) .handle:last-child .value-indicator {
		opacity: 1;
		scale: 1;
		/* enter: medium4 (400ms) emphasized */
		transition:
			opacity var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized),
			scale var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized);
	}
</style>
