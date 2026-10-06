<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	/**
	 * M3 card (navigation-containment.md §10).
	 *   elevated  surface-container-low, level1 (hover level2, dragged level4)
	 *   filled    surface-container-highest, level0 (hover level1, dragged level3)
	 *   outlined  surface + 1dp outline-variant, level0 (hover level1, dragged level3; focus outline on-surface)
	 * Corner 12dp (corner-medium) by default; `shape` allows larger expressive radii.
	 * Elevation / color changes run on the default-effects spring (no overshoot).
	 */
	export const cardVariants = tv({
		base: [
			"group/card relative isolate flex flex-col gap-(--card-spacing) overflow-hidden py-(--card-spacing) text-on-surface type-body-md [--card-spacing:--spacing(4)]",
			// full-bleed media as the first / last child drops the card padding on that side (the ripple
			// attachment prepends its overlay span, so "first" skips it)
			"has-[>[data-slot=card-media]:nth-child(1_of_:not([data-m3-ripple]))]:pt-0 has-[>[data-slot=card-media]:last-child]:pb-0",
			// Tailwind scans literally, so the spring vars are spelled out (default-effects for every property)
			"[transition:box-shadow_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing),border-color_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing),background-color_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)]",
			// dragged state layer: on-surface 16%
			"data-dragged:after:pointer-events-none data-dragged:after:absolute data-dragged:after:inset-0 data-dragged:after:z-10 data-dragged:after:rounded-[inherit] data-dragged:after:bg-on-surface/16 data-dragged:after:content-['']",
		],
		variants: {
			variant: {
				elevated: "bg-surface-container-low shadow-m3-1 data-dragged:shadow-m3-4",
				filled: "bg-surface-container-highest shadow-m3-0 data-dragged:shadow-m3-3",
				outlined: "border border-outline-variant bg-surface shadow-m3-0 data-dragged:shadow-m3-3",
			},
			shape: {
				md: "rounded-m3-md",
				lg: "rounded-m3-lg",
				"lg-increased": "rounded-m3-lg-increased",
				xl: "rounded-m3-xl",
				"xl-increased": "rounded-m3-xl-increased",
				xxl: "rounded-m3-xxl",
			},
			interactive: {
				// the state layer / ripple paints above full-bleed media too (Compose draws the indication over content)
				true: "cursor-pointer text-start no-underline select-none [&>[data-m3-ripple]]:z-10",
				false: "",
			},
			disabled: {
				true: "pointer-events-none cursor-default *:opacity-38",
				false: "",
			},
		},
		compoundVariants: [
			{
				interactive: true,
				variant: "elevated",
				class: "hover:shadow-m3-2 focus-visible:shadow-m3-1 active:shadow-m3-1",
			},
			{
				interactive: true,
				variant: "filled",
				class: "hover:shadow-m3-1 focus-visible:shadow-m3-0 active:shadow-m3-0",
			},
			{
				interactive: true,
				variant: "outlined",
				class: "hover:shadow-m3-1 focus-visible:border-on-surface active:shadow-m3-0",
			},
			// disabled containers: elevated surface 38% (level1), filled surface-variant 38%, outlined outline 12%
			{ disabled: true, variant: "elevated", class: "bg-surface/38 shadow-m3-1" },
			{ disabled: true, variant: "filled", class: "bg-surface-variant/38" },
			{ disabled: true, variant: "outlined", class: "border-outline/12" },
		],
		defaultVariants: { variant: "elevated", shape: "md", interactive: false, disabled: false },
	});

	export type CardVariant = VariantProps<typeof cardVariants>["variant"];
	export type CardShape = VariantProps<typeof cardVariants>["shape"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

	type CardProps = WithElementRef<HTMLAttributes<HTMLElement>> & {
		variant?: CardVariant;
		shape?: CardShape;
		/** The whole card is one action: state layer + ripple, hover elevation, focus ring. */
		interactive?: boolean;
		/** Renders the card as a link (implies `interactive`). */
		href?: HTMLAnchorAttributes["href"];
		disabled?: boolean;
		/** Dragged state: elevation level4 (elevated) / level3, 16% on-surface state layer. */
		dragged?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		children,
		variant = "elevated",
		shape = "md",
		interactive = false,
		href,
		disabled = false,
		dragged = false,
		onkeydown,
		...restProps
	}: CardProps = $props();

	let isInteractive = $derived(interactive || !!href);
	let classes = $derived(
		cn(cardVariants({ variant, shape, interactive: isInteractive, disabled }), className)
	);

	function handleKeydown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		onkeydown?.(e);
		if (e.defaultPrevented || e.target !== e.currentTarget) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			e.currentTarget.click();
		}
	}
</script>

{#if href && !disabled}
	<a
		bind:this={ref}
		data-slot="card"
		data-variant={variant}
		data-dragged={dragged || undefined}
		{href}
		class={classes}
		{onkeydown}
		{...restProps as HTMLAnchorAttributes}
		{@attach ripple()}
	>
		{@render children?.()}
	</a>
{:else if interactive && !href}
	<div
		bind:this={ref}
		data-slot="card"
		data-variant={variant}
		data-dragged={dragged || undefined}
		role="button"
		tabindex={disabled ? -1 : 0}
		aria-disabled={disabled || undefined}
		class={classes}
		onkeydown={handleKeydown}
		{...restProps}
		{@attach ripple({ disabled })}
	>
		{@render children?.()}
	</div>
{:else}
	<div
		bind:this={ref}
		data-slot="card"
		data-variant={variant}
		data-dragged={dragged || undefined}
		aria-disabled={disabled || undefined}
		class={classes}
		{onkeydown}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
