<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import NavigationBadge, { type NavigationBadgeValue } from '#lib/components/ui/navigation-bar/navigation-badge.svelte';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn } from '#lib/utils.js';
	import { getTabsListContext } from './context.js';

	/**
	 * M3 tab (navigation-containment.md §7): title-small label (14/20/500, same metrics as label-large),
	 * 16dp horizontal padding, 24dp icon. Primary: active label/icon `primary`, icon stacked above the
	 * label by default (64dp row). Secondary: active `on-surface`, icon inline (8dp gap).
	 * Inactive: on-surface-variant → on-surface on hover/focus. Color fade defaultEffects.
	 * Badge: 4dp after the text, or anchored to a stacked icon (6dp overlap).
	 */
	let {
		ref = $bindable(null),
		icon,
		iconPosition,
		badge,
		class: className,
		children,
		...restProps
	}: TabsPrimitive.TriggerProps & {
		icon?: string;
		/** Defaults to `top` for primary tabs and `inline` for secondary tabs. */
		iconPosition?: 'top' | 'inline';
		badge?: NavigationBadgeValue;
	} = $props();

	const ctx = getTabsListContext();
	let primary = $derived(ctx.variant === 'primary');
	let stacked = $derived(!!icon && (iconPosition ?? (primary ? 'top' : 'inline')) === 'top');
</script>

<TabsPrimitive.Trigger
	bind:ref
	data-slot="tabs-trigger"
	data-icon-position={icon ? (stacked ? 'top' : 'inline') : undefined}
	class={cn(
		'group/tab relative flex h-full cursor-pointer items-center justify-center px-4 select-none',
		ctx.scrollable ? 'min-w-[90px] flex-none' : 'min-w-0 flex-1',
		'text-on-surface-variant hover:text-on-surface focus-visible:text-on-surface',
		primary ? 'data-[state=active]:text-m3-primary' : 'data-[state=active]:text-on-surface',
		'transition-colors duration-spring-default-effects ease-spring-default-effects',
		'focus-visible:outline-offset-[-3px]',
		'disabled:cursor-default disabled:text-on-surface/38',
		className
	)}
	{@attach ripple()}
	{...restProps}
>
	<span
		data-slot="tabs-trigger-content"
		class={cn('relative flex min-w-0 items-center', stacked ? 'flex-col gap-0.5' : 'gap-2')}
	>
		{#if icon}
			<span class="relative flex size-6 shrink-0">
				<Icon name={icon} />
				{#if stacked}<NavigationBadge value={badge} placement="icon" />{/if}
			</span>
		{/if}
		<span class="type-title-sm flex min-w-0 items-center gap-1 whitespace-nowrap">
			<span class="truncate">{@render children?.()}</span>
			{#if !stacked}<NavigationBadge value={badge} />{/if}
		</span>
	</span>
</TabsPrimitive.Trigger>
