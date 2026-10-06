<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "#lib/utils.js";
	import type { WithoutChildrenOrChild } from "#lib/utils.js";
	import SelectPortal from "./select-portal.svelte";
	import SelectScrollDownButton from "./select-scroll-down-button.svelte";
	import SelectScrollUpButton from "./select-scroll-up-button.svelte";
	import type { ComponentProps } from "svelte";

	/** M3 baseline menu surface: surface-container, 4dp corner, level 2, 8dp vertical list padding. */
	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		portalProps,
		children,
		preventScroll = true,
		...restProps
	}: WithoutChild<SelectPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>;
	} = $props();
</script>

<SelectPortal {...portalProps}>
	<SelectPrimitive.Content
		bind:ref
		{sideOffset}
		{preventScroll}
		data-slot="select-content"
		data-menu-surface=""
		class={cn(
			"m3-menu-surface relative z-50 max-h-(--bits-select-content-available-height) min-w-28 origin-(--bits-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-m3-xs bg-surface-container py-2 text-on-surface shadow-m3-2 outline-none",
			className
		)}
		{...restProps}
	>
		<SelectScrollUpButton />
		<SelectPrimitive.Viewport
			class="h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) scroll-my-2"
		>
			{@render children?.()}
		</SelectPrimitive.Viewport>
		<SelectScrollDownButton />
	</SelectPrimitive.Content>
</SelectPortal>

<style>
	/* Same open/close motion as the M3 menu (dropdown-menu-content.svelte): scale 0.8 → 1 FastSpatial + fade FastEffects.
	   Duplicated on purpose so a page that only uses Select still gets it. */
	:global(.m3-menu-surface[data-state="open"]) {
		animation:
			m3-menu-scale-in var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			m3-menu-fade-in var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}
	:global(.m3-menu-surface[data-state="closed"]) {
		animation:
			m3-menu-scale-out var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
			m3-menu-fade-out var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing)
			forwards;
	}
	@keyframes -global-m3-menu-scale-in {
		from {
			scale: 0.8;
		}
	}
	@keyframes -global-m3-menu-fade-in {
		from {
			opacity: 0;
		}
	}
	@keyframes -global-m3-menu-scale-out {
		to {
			scale: 0.8;
		}
	}
	@keyframes -global-m3-menu-fade-out {
		to {
			opacity: 0;
		}
	}
</style>
