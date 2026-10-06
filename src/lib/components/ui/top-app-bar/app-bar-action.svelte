<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * App bar action: an S icon button (buttons.md §2.2): 40dp container, 24dp icon, full radius,
	 * 48dp touch target (the 4dp margin makes the 48dp layout slot; `after:` extends the hit area).
	 * standard inherits the slot color (leading on-surface / trailing on-surface-variant);
	 * filled / tonal are the single emphasized trailing action allowed by the app bar spec (§4).
	 * Toggle (`selected` set) follows the M3E icon-button toggle colors (icon-button.svelte): standard
	 * selected = primary; filled unselected = surface-container / on-surface-variant; tonal selected =
	 * secondary / on-secondary. Selected morphs round (20px) → square (12dp) on fastSpatial; colors use
	 * defaultEffects.
	 */
	export const appBarActionVariants = tv({
		base: [
			'app-bar-action relative m-1 grid size-10 shrink-0 cursor-pointer place-items-center rounded-[20px] select-none',
			'aria-pressed:rounded-m3-md after:absolute after:-inset-1',
			'disabled:cursor-default disabled:text-on-surface/38'
		],
		variants: {
			variant: {
				standard: 'text-inherit aria-pressed:text-m3-primary',
				filled:
					'bg-m3-primary text-on-primary aria-[pressed=false]:bg-surface-container aria-[pressed=false]:text-on-surface-variant disabled:bg-on-surface/10',
				tonal:
					'bg-secondary-container text-on-secondary-container aria-pressed:bg-m3-secondary aria-pressed:text-on-secondary disabled:bg-on-surface/10'
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

<style>
	.app-bar-action {
		transition:
			color var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing),
			background-color var(--md-sys-motion-spring-default-effects-duration)
				var(--md-sys-motion-spring-default-effects-easing),
			border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing);
	}
</style>
