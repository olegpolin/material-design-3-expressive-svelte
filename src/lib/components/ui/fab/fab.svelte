<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	/*
	 * M3 Expressive FAB (docs/research/buttons.md §3.1–3.3, §9.5).
	 * Elevation level3 at rest / focus / press, level4 on hover. State layer = icon color.
	 */

	/** Color styles shared by FAB and extended FAB (buttons.md §3.2). */
	export const fabColors = {
		"primary-container": "bg-primary-container text-on-primary-container",
		"secondary-container": "bg-secondary-container text-on-secondary-container",
		"tertiary-container": "bg-tertiary-container text-on-tertiary-container",
		primary: "bg-m3-primary text-on-primary",
		secondary: "bg-m3-secondary text-on-secondary",
		tertiary: "bg-tertiary text-on-tertiary",
		/** Baseline surface FAB: "still available, but no longer recommended". */
		surface: "bg-surface-container-high text-m3-primary",
	} as const;

	export type FabColor = keyof typeof fabColors;

	export const fabVariants = tv({
		base: [
			"group/fab relative inline-flex shrink-0 cursor-pointer items-center justify-center align-middle select-none",
			"size-(--fab-s) rounded-(--fab-r)",
			"shadow-m3-3 hover:shadow-m3-4 focus-visible:shadow-m3-3 active:shadow-m3-3",
			"transition-[box-shadow,background-color,color] duration-spring-default-effects ease-spring-default-effects",
			"[&_[data-slot=icon]]:[--m3-icon-size:var(--fab-icon)]! [&_[data-slot=icon]]:[--m3-icon-opsz:var(--fab-icon-opsz)]!",
			"[&_svg]:pointer-events-none [&_svg]:size-(--fab-icon) [&_svg]:shrink-0",
			"disabled:pointer-events-none disabled:bg-on-surface/10 disabled:text-on-surface/38 disabled:shadow-none",
		],
		variants: {
			size: {
				/** Legacy small FAB, 40dp: "Not recommended. Use a larger size." */
				small: "[--fab-s:40px] [--fab-r:var(--radius-m3-md)] [--fab-icon:24px] [--fab-icon-opsz:24] after:absolute after:top-1/2 after:left-1/2 after:size-12 after:-translate-1/2 after:content-['']",
				default: "[--fab-s:56px] [--fab-r:var(--radius-m3-lg)] [--fab-icon:24px] [--fab-icon-opsz:24]",
				medium: "[--fab-s:80px] [--fab-r:var(--radius-m3-lg-increased)] [--fab-icon:28px] [--fab-icon-opsz:28]",
				large: "[--fab-s:96px] [--fab-r:var(--radius-m3-xl)] [--fab-icon:36px] [--fab-icon-opsz:36]",
			},
			color: fabColors,
		},
		defaultVariants: { size: "default", color: "primary-container" },
	});

	export type FabSize = VariantProps<typeof fabVariants>["size"];
	export const FAB_ICON_SIZE = { small: 24, default: 24, medium: 28, large: 36 } as const;
	export const FAB_CONTAINER_SIZE = { small: 40, default: 56, medium: 80, large: 96 } as const;
	export const FAB_CORNER = { small: 12, default: 16, medium: 20, large: 28 } as const;

	export type FabProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			/** `default` 56 | `medium` 80 | `large` 96 (| legacy `small` 40). */
			size?: FabSize;
			/** `primary-container` (default) | `secondary-container` | `tertiary-container` | `primary` | `secondary` | `tertiary` | `surface`. */
			color?: FabColor;
			/** Material Symbols name. Alternatively pass children. */
			icon?: string;
		};
</script>

<script lang="ts">
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	let {
		class: className,
		size = "default",
		color = "primary-container",
		icon,
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: FabProps = $props();

	const classes = $derived(cn(fabVariants({ size, color }), className));
</script>

{#snippet content()}
	{#if icon}
		<Icon name={icon} size={FAB_ICON_SIZE[size ?? "default"]} />
	{/if}
	{@render children?.()}
{/snippet}

{#if href}
	<a
		bind:this={ref}
		data-slot="fab"
		data-size={size}
		data-color={color}
		class={classes}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		{...restProps}
		{@attach ripple()}
	>
		{@render content()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="fab"
		data-size={size}
		data-color={color}
		class={classes}
		{type}
		{disabled}
		{...restProps}
		{@attach ripple()}
	>
		{@render content()}
	</button>
{/if}
