<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn, type WithElementRef } from '#lib/utils.js';

	/**
	 * FAB docked in the bottom app bar: 56dp, corner large (16), icon 24, secondary-container
	 * (Compose `bottomAppBarFabColor`), elevation level0 in every state (`bottomAppBarFabElevation`,
	 * buttons.md §3.3) — the bar already carries level2.
	 */
	let {
		ref = $bindable(null),
		icon,
		label,
		class: className,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		icon: string;
		/** Accessible name. */
		label: string;
	} = $props();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="bottom-app-bar-fab"
	aria-label={label}
	class={cn(
		'relative grid size-14 shrink-0 cursor-pointer place-items-center rounded-m3-lg bg-secondary-container text-on-secondary-container shadow-m3-0',
		className
	)}
	{@attach ripple()}
	{...restProps}
>
	<Icon name={icon} />
</button>
