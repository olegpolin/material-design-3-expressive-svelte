<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from "bits-ui";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	/**
	 * M3 checkbox (docs/research/inputs-selection.md §1).
	 * 18dp box · 2dp corner · 2dp outline · 40dp state layer · 48dp touch target.
	 * The check draws in with the default-spatial spring; unchecking snaps it away after 100ms.
	 * `aria-invalid` switches to the error palette.
	 */
	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();

	// Compose geometry (fractions of the 18dp box): (0.25,0.5) → (0.4,0.65) → (0.75,0.3).
	// Indeterminate "gravitates" every point to y = 0.5.
	const CHECK = "M4.5 9L7.2 11.7L13.5 5.4";
	const DASH = "M4.5 9L7.2 9L13.5 9";
</script>

<CheckboxPrimitive.Root bind:ref bind:checked bind:indeterminate {...restProps}>
	{#snippet child({ props, indeterminate: mixed })}
		<button
			{...props}
			data-slot="checkbox"
			class={cn("m3-checkbox peer", className)}
			{@attach ripple({ centered: true })}
		>
			<span class="box" aria-hidden="true">
				<svg viewBox="0 0 18 18" class="mark-svg">
					<path class="mark" d={mixed ? DASH : CHECK} pathLength="1" />
				</svg>
			</span>
		</button>
	{/snippet}
</CheckboxPrimitive.Root>

<style>
	.m3-checkbox {
		/* outline / container / icon / state layer */
		--_outline: var(--md-sys-color-on-surface-variant);
		--_container: var(--md-sys-color-primary);
		--_icon: var(--md-sys-color-on-primary);
		color: var(--md-sys-color-on-surface); /* the ripple paints in currentColor */

		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--md-sys-shape-corner-full);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
	}
	/* 48dp touch target */
	.m3-checkbox::after {
		content: "";
		position: absolute;
		inset: -4px;
		border-radius: inherit;
	}

	.m3-checkbox:is(:hover, :focus-visible, :active) {
		--_outline: var(--md-sys-color-on-surface);
	}
	/* Pressed state layer previews the next state (unselected → primary, selected → on-surface). */
	.m3-checkbox:active {
		color: var(--md-sys-color-primary);
	}
	.m3-checkbox:is([data-state="checked"], [data-state="indeterminate"]) {
		color: var(--md-sys-color-primary);
	}
	.m3-checkbox:is([data-state="checked"], [data-state="indeterminate"]):active {
		color: var(--md-sys-color-on-surface);
	}

	/* Error (all states) */
	.m3-checkbox:is([aria-invalid="true"], [aria-invalid=""]) {
		--_outline: var(--md-sys-color-error);
		--_container: var(--md-sys-color-error);
		--_icon: var(--md-sys-color-on-error);
		color: var(--md-sys-color-error);
	}

	/* Disabled */
	.m3-checkbox:is(:disabled, [data-disabled]) {
		--_outline: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-content-opacity) * 100%),
			transparent
		);
		--_container: var(--_outline);
		--_icon: var(--md-sys-color-surface);
		cursor: default;
	}

	.box {
		position: relative;
		display: block;
		width: 18px;
		height: 18px;
		border-radius: 2px;
		border: 2px solid var(--_outline);
		background-color: transparent;
		/* out: fast-effects */
		transition:
			background-color var(--md-sys-motion-spring-fast-effects-duration)
				var(--md-sys-motion-spring-fast-effects-easing),
			border-color var(--md-sys-motion-spring-fast-effects-duration)
				var(--md-sys-motion-spring-fast-effects-easing);
	}
	.m3-checkbox:is([data-state="checked"], [data-state="indeterminate"]) .box {
		/* selected: 0dp outline, filled container */
		border-color: var(--_container);
		background-color: var(--_container);
		/* in: default-effects */
		transition-duration: var(--md-sys-motion-spring-default-effects-duration);
		transition-timing-function: var(--md-sys-motion-spring-default-effects-easing);
	}
	.m3-checkbox:is(:disabled, [data-disabled]) .box {
		transition: none;
	}

	.mark-svg {
		position: absolute;
		inset: -2px; /* the 18-unit viewBox maps onto the box's border box */
		width: 18px;
		height: 18px;
		overflow: visible;
	}
	.mark {
		fill: none;
		stroke: var(--_icon);
		stroke-width: 2px;
		stroke-linecap: square;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		opacity: 0;
		d: path("M4.5 9L7.2 11.7L13.5 5.4");
		/* On → off: the check snaps to 0 after 100ms (Compose SnapAnimationDelay) */
		transition-property: stroke-dashoffset, opacity, d;
		transition-duration: 0s;
		transition-delay: 100ms;
	}
	.m3-checkbox:is([data-state="checked"], [data-state="indeterminate"]) .mark {
		stroke-dashoffset: 0;
		opacity: 1;
		transition:
			stroke-dashoffset var(--md-sys-motion-spring-default-spatial-duration)
				var(--md-sys-motion-spring-default-spatial-easing),
			d var(--md-sys-motion-spring-default-spatial-duration)
				var(--md-sys-motion-spring-default-spatial-easing),
			opacity 0s;
		transition-delay: 0s;
	}
	.m3-checkbox[data-state="indeterminate"] .mark {
		d: path("M4.5 9L7.2 9L13.5 9");
	}
</style>
