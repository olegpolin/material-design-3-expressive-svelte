<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	/**
	 * M3 radio button (docs/research/inputs-selection.md §2).
	 * 20dp ring · 2dp stroke · 10dp dot (grows on the fast-spatial spring) · 40dp state layer · 48dp target.
	 */
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> = $props();
</script>

<RadioGroupPrimitive.Item bind:ref {...restProps}>
	{#snippet child({ props })}
		<button
			{...props}
			data-slot="radio-group-item"
			class={cn("m3-radio peer", className)}
			{@attach ripple({ centered: true })}
		>
			<svg viewBox="0 0 20 20" class="icon" aria-hidden="true">
				<circle class="ring" cx="10" cy="10" r="9" />
				<circle class="dot" cx="10" cy="10" r="5" />
			</svg>
		</button>
	{/snippet}
</RadioGroupPrimitive.Item>

<style>
	.m3-radio {
		--_icon: var(--md-sys-color-on-surface-variant);
		color: var(--md-sys-color-on-surface); /* state layer (ripple uses currentColor) */

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
	.m3-radio::after {
		content: "";
		position: absolute;
		inset: -4px;
		border-radius: inherit;
	}
	.m3-radio:is(:hover, :focus-visible, :active, [data-preview]) {
		--_icon: var(--md-sys-color-on-surface);
	}
	/* Pressed layer previews the next state: unselected → primary, selected → on-surface */
	.m3-radio:is(:active, [data-preview="pressed"]) {
		color: var(--md-sys-color-primary);
	}
	.m3-radio[data-state="checked"] {
		--_icon: var(--md-sys-color-primary);
		color: var(--md-sys-color-primary);
	}
	.m3-radio[data-state="checked"]:is(:active, [data-preview="pressed"]) {
		color: var(--md-sys-color-on-surface);
	}
	.m3-radio:is(:disabled, [data-disabled]) {
		--_icon: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-content-opacity) * 100%),
			transparent
		);
		cursor: default;
	}

	.icon {
		width: 20px;
		height: 20px;
		overflow: visible;
	}
	.ring {
		fill: none;
		stroke: var(--_icon);
		stroke-width: 2px;
		transition: stroke var(--md-sys-motion-spring-default-effects-duration)
			var(--md-sys-motion-spring-default-effects-easing);
	}
	.dot {
		fill: var(--_icon);
		transform-box: fill-box;
		transform-origin: center;
		scale: 0;
		/* Shrink without overshoot: a spring past 0 would flip the dot into a negative scale and
		   flash a tiny mirrored dot (Compose clamps the radius at 0). */
		transition:
			scale var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
			fill var(--md-sys-motion-spring-default-effects-duration)
				var(--md-sys-motion-spring-default-effects-easing);
	}
	.m3-radio[data-state="checked"] .dot {
		scale: 1;
		/* Grow: fast-spatial (expressive overshoot) */
		transition-property: scale, fill;
		transition-duration: var(--md-sys-motion-spring-fast-spatial-duration),
			var(--md-sys-motion-spring-default-effects-duration);
		transition-timing-function: var(--md-sys-motion-spring-fast-spatial-easing),
			var(--md-sys-motion-spring-default-effects-easing);
	}
	/* Disabled snaps (Compose) */
	.m3-radio:is(:disabled, [data-disabled]) :is(.ring, .dot) {
		transition: none;
	}
</style>
