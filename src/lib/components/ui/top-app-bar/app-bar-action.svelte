<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * App bar action: an S icon button (buttons.md §2.2): 40dp container, 24dp icon, full radius,
	 * 48dp touch target (the 4dp margin makes the 48dp layout slot; `after:` extends the hit area).
	 * standard inherits the slot color (leading on-surface / trailing on-surface-variant);
	 * filled / tonal are the single emphasized trailing action allowed by the app bar spec (§4).
	 */
	export const appBarActionVariants = tv({
		base: [
			'relative m-1 grid size-10 shrink-0 cursor-pointer place-items-center rounded-m3-full select-none',
			'after:absolute after:-inset-1',
			'transition-colors duration-spring-default-effects ease-spring-default-effects',
			'disabled:cursor-default disabled:text-on-surface/38'
		],
		variants: {
			variant: {
				standard: 'text-inherit aria-pressed:text-m3-primary',
				filled: 'bg-m3-primary text-on-primary disabled:bg-on-surface/10',
				tonal: 'bg-secondary-container text-on-secondary-container disabled:bg-on-surface/10'
			}
		},
		defaultVariants: { variant: 'standard' }
	});

	export type AppBarActionVariant = VariantProps<typeof appBarActionVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn, type WithElementRef } from '#lib/utils.js';

	let {
		ref = $bindable(null),
		icon,
		label,
		variant = 'standard',
		selected,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		icon?: string;
		/** Accessible name (icon-only button). */
		label: string;
		variant?: AppBarActionVariant;
		/** Toggle state; `undefined` = not a toggle. Standard selected icon = primary, filled. */
		selected?: boolean;
	} = $props();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="app-bar-action"
	aria-label={label}
	aria-pressed={selected}
	class={cn(appBarActionVariants({ variant }), className)}
	{@attach ripple()}
	{...restProps}
>
	{#if icon}
		<Icon name={icon} fill={!!selected} />
	{/if}
	{@render children?.()}
</button>
