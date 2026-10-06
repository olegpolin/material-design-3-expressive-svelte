<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { fabColors, type FabColor } from "./fab.svelte";

	/*
	 * M3 Expressive extended FAB (docs/research/buttons.md §3.4).
	 * `extended={false}` collapses it into a square FAB of the same height: the label width
	 * shrinks to 0 on default-spatial and fades out on fast-effects; expanding uses fast-spatial
	 * for the width and fast-effects for the fade (Compose ExtendedFloatingActionButton).
	 */
	export const extendedFabVariants = tv({
		base: [
			"group/extended-fab relative inline-flex shrink-0 cursor-pointer items-center align-middle whitespace-nowrap select-none",
			"h-(--fab-h) min-w-(--fab-h) rounded-(--fab-r) px-(--fab-px) data-[extended=false]:px-(--fab-px-collapsed)",
			"shadow-m3-3 hover:shadow-m3-4 focus-visible:shadow-m3-3 active:shadow-m3-3",
			"[--fab-spatial:var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing)] data-[extended=false]:[--fab-spatial:var(--md-sys-motion-spring-default-spatial-duration)_var(--md-sys-motion-spring-default-spatial-easing)]",
			"[transition:padding_var(--fab-spatial),box-shadow_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing),background-color_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)]",
			"[&_[data-slot=icon]]:[--m3-icon-size:var(--fab-icon)]! [&_[data-slot=icon]]:[--m3-icon-opsz:var(--fab-icon-opsz)]!",
			"disabled:pointer-events-none disabled:bg-on-surface/10 disabled:text-on-surface/38 disabled:shadow-none",
		],
		variants: {
			size: {
				small: "[--fab-h:56px] [--fab-r:var(--radius-m3-lg)] [--fab-icon:24px] [--fab-icon-opsz:24] [--fab-gap:8px] [--fab-px:16px] [--fab-px-collapsed:16px] type-title-md",
				medium: "[--fab-h:80px] [--fab-r:var(--radius-m3-lg-increased)] [--fab-icon:28px] [--fab-icon-opsz:28] [--fab-gap:12px] [--fab-px:26px] [--fab-px-collapsed:26px] type-title-lg",
				large: "[--fab-h:96px] [--fab-r:var(--radius-m3-xl)] [--fab-icon:36px] [--fab-icon-opsz:36] [--fab-gap:16px] [--fab-px:28px] [--fab-px-collapsed:30px] type-headline-sm",
			},
			color: fabColors,
			hasIcon: {
				true: "justify-start",
				// label-only extended FABs center their label
				false: "justify-center",
			},
		},
		defaultVariants: { size: "small", color: "primary-container", hasIcon: true },
	});

	export type ExtendedFabSize = VariantProps<typeof extendedFabVariants>["size"];
	export const EXTENDED_FAB_ICON_SIZE = { small: 24, medium: 28, large: 36 } as const;

	export type ExtendedFabProps = WithElementRef<HTMLButtonAttributes> & {
		/** `small` 56 (default) | `medium` 80 | `large` 96. */
		size?: ExtendedFabSize;
		color?: FabColor;
		/** Leading Material Symbols icon (required to collapse). */
		icon?: string;
		/** Label text; children override it. */
		label?: string;
		/** `false` collapses to a FAB (only when an icon is present). */
		extended?: boolean;
	};
</script>

<script lang="ts">
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	let {
		class: className,
		size = "small",
		color = "primary-container",
		icon,
		label,
		extended = true,
		ref = $bindable(null),
		type = "button",
		children,
		...restProps
	}: ExtendedFabProps = $props();

	let labelWidth = $state<number>();
	const isExtended = $derived(extended || !icon);
	const width = $derived(
		isExtended ? (labelWidth === undefined ? "auto" : `${labelWidth}px`) : "0px"
	);
</script>

<button
	bind:this={ref}
	data-slot="extended-fab"
	data-size={size}
	data-color={color}
	data-extended={isExtended}
	class={cn(extendedFabVariants({ size, color, hasIcon: !!icon }), className)}
	{type}
	{...restProps}
	{@attach ripple()}
>
	{#if icon}
		<Icon name={icon} size={EXTENDED_FAB_ICON_SIZE[size ?? "small"]} />
	{/if}
	<span
		data-slot="extended-fab-label"
		data-extended={isExtended}
		class={cn(
			"block overflow-hidden",
			icon && "ms-(--fab-gap) data-[extended=false]:ms-0",
			"[transition:width_var(--fab-spatial),margin_var(--fab-spatial),opacity_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]"
		)}
		style:width
		style:opacity={isExtended ? 1 : 0}
	>
		<span class="block w-max" bind:offsetWidth={labelWidth}>
			{#if children}{@render children()}{:else}{label}{/if}
		</span>
	</span>
</button>
