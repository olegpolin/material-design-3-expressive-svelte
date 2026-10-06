<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils.js';

	/**
	 * Bottom app bar (baseline; navigation-containment.md §6 — M3E recommends the docked toolbar instead).
	 * 80dp, surface-container, elevation level2, corner none, 4dp padding, up to 4 icon actions
	 * (`BottomAppBarAction`) and an optional FAB 12dp from the end / 12dp from the top
	 * (`BottomAppBarFab`, lowered to level0 per Compose `bottomAppBarFabElevation`).
	 * Hide on scroll: `{@attach hideOnScroll()}` from the toolbar folder.
	 */
	let {
		ref = $bindable(null),
		fab,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** FAB slot (end side). */
		fab?: Snippet;
		/** Icon actions (start side). */
		children?: Snippet;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="bottom-app-bar"
	class={cn(
		'flex h-20 w-full shrink-0 items-center rounded-m3-none bg-surface-container p-1 text-on-surface-variant shadow-m3-2',
		className
	)}
	{...restProps}
>
	<div class="flex min-w-0 flex-1 items-center">
		{@render children?.()}
	</div>
	{#if fab}
		<div class="flex shrink-0 self-start pe-3 pt-2">
			{@render fab()}
		</div>
	{/if}
</div>
