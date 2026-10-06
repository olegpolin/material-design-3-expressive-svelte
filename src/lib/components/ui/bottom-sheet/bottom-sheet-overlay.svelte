<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "#lib/utils.js";
	import { getBottomSheetContext } from "./context.js";

	// Scrim: `scrim` at 32%; fades on default-effects (in) / fast-effects (out).
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DrawerPrimitive.OverlayProps = $props();

	const ctx = getBottomSheetContext();
</script>

<DrawerPrimitive.Overlay
	bind:ref
	data-slot="bottom-sheet-overlay"
	class={cn("inset-0 bg-scrim/32", ctx.container ? "absolute z-10" : "fixed z-50", className)}
	{...restProps}
/>

<style>
	:global([data-slot='bottom-sheet-overlay'][data-vaul-overlay]) {
		transition-duration: var(--md-sys-motion-spring-default-effects-duration) !important;
		transition-timing-function: var(--md-sys-motion-spring-default-effects-easing) !important;
		animation-duration: var(--md-sys-motion-spring-default-effects-duration);
		animation-timing-function: var(--md-sys-motion-spring-default-effects-easing);
	}
	:global([data-slot='bottom-sheet-overlay'][data-vaul-overlay][data-state='closed']) {
		animation-duration: var(--md-sys-motion-spring-fast-effects-duration);
		animation-timing-function: var(--md-sys-motion-spring-fast-effects-easing);
	}
</style>
