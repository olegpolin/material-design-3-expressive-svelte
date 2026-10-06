<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import type { ComponentProps } from "svelte";
	import BottomSheetOverlay from "./bottom-sheet-overlay.svelte";
	import { getBottomSheetContext } from "./context.js";

	/**
	 * Sheet surface (navigation-containment.md §8): surface-container-low, level1, 28dp top corners
	 * (extra-large-top), max width 640dp centered (side margins 56dp on windows > 640dp), 72dp top
	 * margin (56dp on windows > 640dp). Drag handle 32 × 4dp, on-surface-variant at 40%, with 22dp
	 * above and below (48dp touch area).
	 * Motion: show / settle on default-spatial, hide on fast-effects (vaul's own easing is replaced).
	 */
	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		showHandle = true,
		onOpenAutoFocus,
		children,
		...restProps
	}: DrawerPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DrawerPrimitive.Portal>>;
		/** Show the drag handle (also cycles snap points on click). */
		showHandle?: boolean;
	} = $props();

	const ctx = getBottomSheetContext();

	// Standard (non-modal) sheets must not trap focus, lock scrolling or react to outside clicks.
	// vaul forwards these to the bits-ui dialog but doesn't type all of them.
	let dialogBehavior = $derived({
		trapFocus: ctx.modal,
		preventScroll: ctx.modal,
		interactOutsideBehavior: ctx.modal ? "close" : "ignore",
	} as Record<string, unknown>);
</script>

<DrawerPrimitive.Portal {...portalProps}>
	{#if ctx.modal}
		<BottomSheetOverlay />
	{/if}
	<DrawerPrimitive.Content
		bind:ref
		data-slot="bottom-sheet-content"
		data-modal={ctx.modal || undefined}
		class={cn(
			"inset-x-0 bottom-0 mx-auto flex w-full max-w-[640px] flex-col rounded-t-m3-xl bg-surface-container-low text-on-surface shadow-m3-1 outline-none",
			// the expressive spring overshoots a little: extend the surface below the bottom edge
			"after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[200%] after:bg-inherit after:content-['']",
			ctx.container ? "absolute z-10" : "fixed z-50 min-[640px]:max-w-[min(640px,calc(100%-112px))]",
			ctx.hasSnapPoints
				? "h-full"
				: "max-h-[calc(100%-72px)] min-[640px]:max-h-[calc(100%-56px)]",
			className
		)}
		{...dialogBehavior}
		onOpenAutoFocus={(e) => {
			onOpenAutoFocus?.(e);
			// a standard sheet coexists with the page: don't pull focus into it
			if (!ctx.modal) e.preventDefault();
		}}
		{...restProps}
	>
		{#if showHandle}
			<DrawerPrimitive.Handle
				data-slot="bottom-sheet-handle"
				class="my-[22px]! h-1! w-8! shrink-0 rounded-m3-full! bg-on-surface-variant! opacity-40! [&>[data-vaul-handle-hitarea]]:h-12! [&>[data-vaul-handle-hitarea]]:w-12!"
			/>
		{/if}
		{@render children?.()}
	</DrawerPrimitive.Content>
</DrawerPrimitive.Portal>

<style>
	/* Replace vaul's 0.5s cubic-bezier with the M3 springs. Vaul writes `transition: transform …`
	   inline on release / snap, and `transition: none` while dragging; only the timing is overridden
	   here, so dragging still follows the pointer 1:1. */
	:global([data-slot='bottom-sheet-content'][data-vaul-drawer]) {
		transition-duration: var(--md-sys-motion-spring-default-spatial-duration) !important;
		transition-timing-function: var(--md-sys-motion-spring-default-spatial-easing) !important;
		animation-duration: var(--md-sys-motion-spring-default-spatial-duration);
		animation-timing-function: var(--md-sys-motion-spring-default-spatial-easing);
	}
	:global([data-slot='bottom-sheet-content'][data-vaul-drawer][data-state='closed']) {
		transition-duration: var(--md-sys-motion-spring-fast-effects-duration) !important;
		transition-timing-function: var(--md-sys-motion-spring-fast-effects-easing) !important;
		animation-duration: var(--md-sys-motion-spring-fast-effects-duration);
		animation-timing-function: var(--md-sys-motion-spring-fast-effects-easing);
	}
</style>
