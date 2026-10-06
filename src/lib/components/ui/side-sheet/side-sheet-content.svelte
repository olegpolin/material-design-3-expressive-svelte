<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import type { ComponentProps, Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { getSideSheetContext, type SideSheetSide } from "./context.js";

	/**
	 * Side sheet surface (navigation-containment.md §9).
	 *   standard  inline `<aside>`: `surface`, level0, 1dp outline-variant divider on the inner edge,
	 *             default width 256dp (max 400dp); width animates open (default-spatial) / closed
	 *             (fast-effects).
	 *   modal     `surface-container-low`, level1, corner-large (16dp) on the inner edge, max 400dp,
	 *             scrim 32%; slides in on default-spatial, out on fast-effects.
	 *   detached  16dp margins and 16dp corners all around (both variants).
	 */
	type Props = WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
		side?: SideSheetSide;
		/** Sheet width in dp (clamped to 400dp). Default 256 (standard) / 400 (modal). */
		width?: number;
		detached?: boolean;
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SheetPrimitive.Portal>>;
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		class: className,
		side = "end",
		width,
		detached = false,
		portalProps,
		children,
		...restProps
	}: Props = $props();

	const ctx = getSideSheetContext();
	let w = $derived(Math.min(400, width ?? (ctx.variant === "modal" ? 400 : 256)));
</script>

{#if ctx.variant === "modal"}
	<SheetPrimitive.Portal {...portalProps}>
		<SheetPrimitive.Overlay
			data-slot="side-sheet-overlay"
			class="fixed inset-0 z-50 bg-scrim/32 [transition:opacity_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:[transition:opacity_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]"
		/>
		<SheetPrimitive.Content
			bind:ref
			data-slot="side-sheet-content"
			data-side={side}
			data-detached={detached || undefined}
			style="--side-sheet-width: {w}px"
			class={cn(
				"fixed z-50 flex w-[min(var(--side-sheet-width),calc(100vw-56px))] flex-col bg-surface-container-low text-on-surface shadow-m3-1 outline-none",
				"[transition:translate_var(--md-sys-motion-spring-default-spatial-duration)_var(--md-sys-motion-spring-default-spatial-easing)] data-ending-style:[transition:translate_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]",
				detached ? "inset-y-4 rounded-m3-lg" : "inset-y-0",
				side === "end"
					? [
							detached ? "end-4" : "end-0 rounded-s-m3-lg",
							"data-starting-style:translate-x-[calc(100%+16px)] data-ending-style:translate-x-[calc(100%+16px)] rtl:data-starting-style:-translate-x-[calc(100%+16px)] rtl:data-ending-style:-translate-x-[calc(100%+16px)]",
						]
					: [
							detached ? "start-4" : "start-0 rounded-e-m3-lg",
							"data-starting-style:-translate-x-[calc(100%+16px)] data-ending-style:-translate-x-[calc(100%+16px)] rtl:data-starting-style:translate-x-[calc(100%+16px)] rtl:data-ending-style:translate-x-[calc(100%+16px)]",
						],
				// the expressive spring overshoots a little: extend the surface past the outer edge
				!detached &&
					"after:pointer-events-none after:absolute after:inset-y-0 after:w-6 after:bg-inherit after:content-['']",
				!detached && (side === "end" ? "after:start-full" : "after:end-full"),
				className
			)}
			{...restProps}
		>
			{@render children?.()}
		</SheetPrimitive.Content>
	</SheetPrimitive.Portal>
{:else}
	<aside
		bind:this={ref}
		id={ctx.contentId}
		aria-labelledby={ctx.titleId}
		inert={!ctx.open}
		data-slot="side-sheet-content"
		data-state={ctx.open ? "open" : "closed"}
		data-side={side}
		data-detached={detached || undefined}
		style="--side-sheet-width: {w}px"
		class={cn(
			"relative shrink-0 overflow-hidden bg-surface text-on-surface",
			"w-(--side-sheet-width) data-[state=closed]:w-0",
			"[transition:width_var(--md-sys-motion-spring-default-spatial-duration)_var(--md-sys-motion-spring-default-spatial-easing),border-color_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)] data-[state=closed]:[transition:width_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing),border-color_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]",
			detached
				? "m-4 rounded-m3-lg data-[state=closed]:mx-0"
				: side === "end"
					? "border-s border-outline-variant data-[state=closed]:border-transparent"
					: "border-e border-outline-variant data-[state=closed]:border-transparent",
			className
		)}
		{...restProps as HTMLAttributes<HTMLElement>}
	>
		<div class="flex h-full w-(--side-sheet-width) flex-col">
			{@render children?.()}
		</div>
	</aside>
{/if}
