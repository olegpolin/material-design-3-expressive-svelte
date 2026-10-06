<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	// Individual sheet parts (not the barrel) so the shadcn Sheet.Content / Button / lucide chain isn't pulled in.
	import SheetRoot from '#lib/components/ui/sheet/sheet.svelte';
	import SheetPortal from '#lib/components/ui/sheet/sheet-portal.svelte';
	import SheetOverlay from '#lib/components/ui/sheet/sheet-overlay.svelte';
	import SheetTitle from '#lib/components/ui/sheet/sheet-title.svelte';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { setNavigationDrawerContext } from './context.js';

	/**
	 * M3 navigation drawer (navigation-containment.md §3). 360dp wide, full height, 12dp indicator inset.
	 * standard: inline `<nav>`, surface, level0, large-end corners (0 16 16 0).
	 * modal: the `sheet` primitive (bits-ui Dialog) from the start edge, surface-container-low, level1,
	 * large-end corners, scrim 32%. Open = defaultSpatial, close = fastEffects.
	 */
	let {
		ref = $bindable(null),
		variant = 'standard',
		open = $bindable(false),
		closeOnSelect = true,
		headline,
		class: className,
		children,
		'aria-label': ariaLabel,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		variant?: 'standard' | 'modal';
		/** Modal only. */
		open?: boolean;
		/** Modal only: close after an item is activated. */
		closeOnSelect?: boolean;
		/** Optional drawer headline (title-small, on-surface-variant, 56dp row). */
		headline?: string;
		children?: Snippet;
	} = $props();

	let name = $derived(ariaLabel ?? headline ?? 'Navigation');
	let contentProps = $derived(restProps as Record<string, unknown>);

	setNavigationDrawerContext({
		get variant() {
			return variant;
		},
		itemActivated() {
			if (variant === 'modal' && closeOnSelect) open = false;
		}
	});
</script>

{#snippet body()}
	{#if headline}
		<div class="type-title-sm flex h-14 shrink-0 items-center px-4 text-on-surface-variant">{headline}</div>
	{/if}
	<ul class="flex flex-col">
		{@render children?.()}
	</ul>
{/snippet}

{#if variant === 'modal'}
	<SheetRoot bind:open>
		<SheetPortal>
			<SheetOverlay
				class="bg-scrim/32 supports-backdrop-filter:backdrop-blur-none data-closed:duration-spring-fast-effects data-open:duration-spring-default-effects"
			/>
			<DialogPrimitive.Content
				bind:ref
				data-slot="navigation-drawer"
				data-variant="modal"
				class={cn(
					'fixed inset-y-0 start-0 z-50 flex h-full w-[360px] max-w-[calc(100vw-56px)] flex-col overflow-y-auto',
					'rounded-e-m3-lg bg-surface-container-low px-3 py-3 text-on-surface shadow-m3-1 outline-none',
					'data-open:animate-in data-open:slide-in-from-left data-open:duration-spring-default-spatial data-open:ease-spring-default-spatial',
					'data-closed:animate-out data-closed:slide-out-to-left data-closed:duration-spring-fast-effects data-closed:ease-spring-fast-effects',
					className
				)}
				{...contentProps}
			>
				<SheetTitle class="sr-only">{name}</SheetTitle>
				<nav aria-label={name} class="flex flex-col">
					{@render body()}
				</nav>
			</DialogPrimitive.Content>
		</SheetPortal>
	</SheetRoot>
{:else}
	<nav
		bind:this={ref}
		data-slot="navigation-drawer"
		data-variant="standard"
		aria-label={name}
		class={cn(
			'flex h-full w-[360px] max-w-full shrink-0 flex-col overflow-y-auto rounded-e-m3-lg bg-surface px-3 py-3 text-on-surface shadow-m3-0',
			className
		)}
		{...restProps}
	>
		{@render body()}
	</nav>
{/if}
