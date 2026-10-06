<script lang="ts" module>
	/** `true` = small dot badge, number/string = large badge, `0`/`false`/`undefined` = no badge. */
	export type NavigationBadgeValue = number | string | boolean | null | undefined;

	export function hasBadge(value: NavigationBadgeValue) {
		return value !== undefined && value !== null && value !== false && value !== 0 && value !== '';
	}
</script>

<script lang="ts">
	import { cn } from '#lib/utils.js';

	/**
	 * M3 badge used by the navigation components (navigation-containment.md §16).
	 * Small: 6×6dp dot. Large: 16dp tall, min 16dp wide, 4dp horizontal padding, label-small, max "999+".
	 * `placement="icon"` anchors it to the top-end corner of a 24dp icon wrapper (which must be `relative`):
	 * small = 6×6dp offset into the icon, large = 12dp horizontal / 14dp vertical overlap (Compose BadgedBox).
	 */
	let {
		value,
		placement = 'inline',
		class: className
	}: {
		value: NavigationBadgeValue;
		placement?: 'icon' | 'inline';
		class?: string;
	} = $props();

	let dot = $derived(value === true);
	let text = $derived(
		typeof value === 'number' ? (value > 999 ? '999+' : String(value)) : typeof value === 'string' ? value : ''
	);
</script>

{#if hasBadge(value)}
	<span
		data-slot="navigation-badge"
		class={cn(
			'pointer-events-none inline-flex shrink-0 items-center justify-center rounded-m3-full bg-error text-on-error',
			dot ? 'size-1.5' : 'type-label-sm h-4 min-w-4 max-w-[34px] px-1',
			placement === 'icon' &&
				(dot ? 'absolute start-[calc(100%-6px)] top-0' : 'absolute start-[calc(100%-12px)] -top-0.5'),
			className
		)}
	>
		{#if dot}
			<span class="sr-only">New</span>
		{:else}
			{text}
		{/if}
	</span>
{/if}
