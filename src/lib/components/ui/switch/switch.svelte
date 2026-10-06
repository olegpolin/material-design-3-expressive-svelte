<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	/**
	 * M3 switch (docs/research/inputs-selection.md §3).
	 * Track 52×32dp, 2dp outline when unselected. Handle 16dp unselected / 24dp selected or with icon /
	 * 28dp pressed, centered at x = 16 or 36dp. While pressed the handle snaps to 28dp; on release size
	 * and position spring back with fast-spatial (ζ 0.6, k 800). 16dp icons, 40dp state layer on the handle.
	 */
	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		icons = false,
		...restProps
	}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
		/**
		 * Handle icons. `true` / `"both"`: check when on, close when off. `"checked"`: check only when on.
		 */
		icons?: boolean | "checked" | "both";
	} = $props();

	let showChecked = $derived(icons !== false);
	let showUnchecked = $derived(icons === true || icons === "both");
</script>

<SwitchPrimitive.Root bind:ref bind:checked {...restProps}>
	{#snippet child({ props, checked: on })}
		<button
			{...props}
			data-slot="switch"
			data-icons={showUnchecked ? "both" : showChecked ? "checked" : undefined}
			class={cn("m3-switch peer", className)}
			{@attach ripple({ centered: true })}
		>
			<span class="handle" data-slot="switch-thumb" aria-hidden="true">
				{#if showChecked}
					<span class="icon icon-on" data-visible={on || undefined}>
						<Icon name="check" size={16} weight={500} />
					</span>
				{/if}
				{#if showUnchecked}
					<span class="icon icon-off" data-visible={!on || undefined}>
						<Icon name="close" size={16} weight={500} />
					</span>
				{/if}
			</span>
		</button>
	{/snippet}
</SwitchPrimitive.Root>

<style>
	.m3-switch {
		/* geometry: centers are measured from the outer edge (16 / 36dp); the 2dp border is always
		   present (track-colored when selected) so the padding box starts 2dp in. */
		--_cx: 14px;
		--_size: 16px;
		/* colors */
		--_track: var(--md-sys-color-surface-container-highest);
		--_outline: var(--md-sys-color-outline);
		--_handle: var(--md-sys-color-outline);
		--_icon: var(--md-sys-color-surface-container-highest);
		color: var(--md-sys-color-on-surface); /* state layer */

		--_spatial: var(--md-sys-motion-spring-fast-spatial-duration)
			var(--md-sys-motion-spring-fast-spatial-easing);
		--_effects: var(--md-sys-motion-spring-default-effects-duration)
			var(--md-sys-motion-spring-default-effects-easing);

		position: relative;
		display: inline-block;
		flex-shrink: 0;
		box-sizing: border-box;
		width: 52px;
		height: 32px;
		border: 2px solid var(--_outline);
		border-radius: var(--md-sys-shape-corner-full);
		background-color: var(--_track);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		user-select: none;
		transition:
			background-color var(--_effects),
			border-color var(--_effects);
	}
	/* 48dp touch target */
	.m3-switch::after {
		content: "";
		position: absolute;
		inset: -10px -2px;
	}

	.m3-switch[data-icons] {
		--_size: 24px;
	}
	.m3-switch:is(:hover, :focus-visible, :active) {
		--_handle: var(--md-sys-color-on-surface-variant);
	}

	.m3-switch[data-state="checked"] {
		--_cx: 34px;
		--_size: 24px;
		--_track: var(--md-sys-color-primary);
		--_outline: var(--md-sys-color-primary);
		--_handle: var(--md-sys-color-on-primary);
		--_icon: var(--md-sys-color-primary);
		color: var(--md-sys-color-primary);
	}
	.m3-switch[data-state="checked"]:is(:hover, :focus-visible, :active) {
		--_handle: var(--md-sys-color-primary-container);
	}
	.m3-switch:active {
		--_size: 28px;
	}

	/* Disabled */
	.m3-switch:is(:disabled, [data-disabled]) {
		--_track: color-mix(in srgb, var(--md-sys-color-surface-container-highest) calc(var(--md-sys-state-disabled-container-opacity) * 100%), transparent);
		--_outline: color-mix(in srgb, var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-container-opacity) * 100%), transparent);
		--_handle: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-content-opacity) * 100%),
			transparent
		);
		--_icon: color-mix(
			in srgb,
			var(--md-sys-color-surface-container-highest) calc(var(--md-sys-state-disabled-content-opacity) * 100%),
			transparent
		);
		cursor: default;
	}
	.m3-switch[data-state="checked"]:is(:disabled, [data-disabled]) {
		--_track: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-container-opacity) * 100%),
			transparent
		);
		--_outline: transparent;
		--_handle: var(--md-sys-color-surface);
		--_icon: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-content-opacity) * 100%),
			transparent
		);
	}

	/* The 40dp state layer sits on the handle and travels with it. */
	.m3-switch > :global([data-m3-ripple]) {
		inset: auto;
		top: 50%;
		left: var(--_cx);
		width: 40px;
		height: 40px;
		translate: -50% -50%;
		border-radius: var(--md-sys-shape-corner-full);
		transition: left var(--_spatial);
	}

	.handle {
		position: absolute;
		top: 50%;
		left: var(--_cx);
		width: var(--_size);
		height: var(--_size);
		translate: -50% -50%;
		display: grid;
		place-items: center;
		border-radius: var(--md-sys-shape-corner-full);
		background-color: var(--_handle);
		/* release / toggle: size + offset spring together (fast-spatial) */
		transition:
			left var(--_spatial),
			width var(--_spatial),
			height var(--_spatial),
			background-color var(--_effects);
	}
	/* While pressed the handle snaps (Compose SnapSpec) */
	.m3-switch:active .handle {
		transition: background-color var(--_effects);
	}
	.m3-switch:is(:disabled, [data-disabled]) .handle {
		transition: none;
	}

	.icon {
		grid-area: 1 / 1;
		display: grid;
		place-items: center;
		color: var(--_icon);
		opacity: 0;
		scale: 0.6;
		transition:
			opacity var(--md-sys-motion-spring-fast-effects-duration)
				var(--md-sys-motion-spring-fast-effects-easing),
			scale var(--_spatial),
			color var(--_effects);
	}
	.icon[data-visible] {
		opacity: 1;
		scale: 1;
	}
</style>
