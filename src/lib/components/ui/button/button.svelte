<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	/*
	 * M3 Expressive common button (docs/research/buttons.md §1).
	 *
	 * Every size-dependent value is a CSS custom property set by the `size` variant, so other
	 * components (button group, split button) can re-shape a button by overriding variables
	 * instead of fighting class order:
	 *   --btn-h            container height            --btn-px      leading/trailing space
	 *   --btn-gap          icon-label space            --btn-icon    icon size (px), --btn-icon-opsz
	 *   --btn-r-full       height / 2 (animatable "full", never 9999px)
	 *   --btn-r-square     square corner               --btn-r-pressed  pressed corner
	 *   --btn-r            current corner (rest → selected → pressed)
	 *   --btn-r-ss/-se/-es/-ee  optional per-corner overrides (logical: start-start, start-end, end-start, end-end)
	 *   --btn-outline      outlined stroke width
	 */

	// 48dp minimum touch target for XS/S (buttons.md §1.5, §9.3).
	const TARGET =
		"after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-12 after:min-w-12 after:-translate-1/2 after:content-['']";

	// Disabled: container on-surface 10%, content on-surface 38%, elevation 0 (buttons.md §1.3).
	const DISABLED_CONTAINED =
		"disabled:bg-on-surface/10 disabled:text-on-surface/38 disabled:shadow-none aria-disabled:bg-on-surface/10 aria-disabled:text-on-surface/38 aria-disabled:shadow-none";
	const DISABLED_TEXT = "disabled:text-on-surface/38 aria-disabled:text-on-surface/38";
	const OUTLINE =
		"shadow-[inset_0_0_0_var(--btn-outline)_var(--md-sys-color-outline-variant)]";

	export const buttonVariants = tv({
		base: [
			"group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center align-middle whitespace-nowrap no-underline select-none",
			"h-(--btn-h) gap-(--btn-gap) px-(--btn-px)",
			// shape: rest → (selected) → pressed; "full" is the real half-height so it can animate
			"[--btn-r-full:calc(var(--btn-h)/2)] [--btn-r:var(--btn-r-rest)] active:[--btn-r:var(--btn-r-pressed)]",
			"[border-start-start-radius:var(--btn-r-ss,var(--btn-r))] [border-start-end-radius:var(--btn-r-se,var(--btn-r))] [border-end-start-radius:var(--btn-r-es,var(--btn-r))] [border-end-end-radius:var(--btn-r-ee,var(--btn-r))]",
			// motion: press morph on default-effects (no bounce), colors on default-effects
			"[--btn-shape-t:var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)] [--btn-color-t:var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)]",
			"[transition:border-radius_var(--btn-shape-t),border-start-start-radius_var(--btn-shape-t),border-start-end-radius_var(--btn-shape-t),border-end-start-radius_var(--btn-shape-t),border-end-end-radius_var(--btn-shape-t),background-color_var(--btn-color-t),color_var(--btn-color-t),box-shadow_var(--btn-color-t)]",
			// icons: Material Symbols (<Icon data-icon="inline-start" />) and stray SVGs
			"[&_[data-slot=icon]]:[--m3-icon-size:var(--btn-icon)]! [&_[data-slot=icon]]:[--m3-icon-opsz:var(--btn-icon-opsz)]!",
			"[&_svg]:pointer-events-none [&_svg]:size-(--btn-icon) [&_svg]:shrink-0",
			"disabled:pointer-events-none disabled:cursor-default aria-disabled:pointer-events-none aria-disabled:cursor-default",
		],
		variants: {
			variant: {
				filled: `bg-m3-primary text-on-primary ${DISABLED_CONTAINED}`,
				tonal: `bg-secondary-container text-on-secondary-container ${DISABLED_CONTAINED}`,
				outlined: `bg-transparent text-on-surface-variant ${OUTLINE} ${DISABLED_TEXT}`,
				elevated: `bg-surface-container-low text-m3-primary shadow-m3-1 ${DISABLED_CONTAINED}`,
				text: `bg-transparent text-m3-primary ${DISABLED_TEXT}`,
				// shadcn compatibility aliases (alert-dialog, pagination, dialog, sheet, input-group …)
				default: `bg-m3-primary text-on-primary ${DISABLED_CONTAINED}`,
				secondary: `bg-secondary-container text-on-secondary-container ${DISABLED_CONTAINED}`,
				outline: `bg-transparent text-on-surface-variant ${OUTLINE} ${DISABLED_TEXT}`,
				ghost: `bg-transparent text-on-surface-variant ${DISABLED_TEXT}`,
				destructive: `bg-error text-on-error ${DISABLED_CONTAINED}`,
				link: `bg-transparent text-m3-primary underline-offset-4 hover:underline ${DISABLED_TEXT}`,
			},
			size: {
				xs: `[--btn-h:32px] [--btn-px:12px] [--btn-gap:4px] [--btn-icon:20px] [--btn-icon-opsz:20] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] type-label-lg ${TARGET}`,
				sm: `[--btn-h:40px] [--btn-px:16px] [--btn-gap:8px] [--btn-icon:20px] [--btn-icon-opsz:20] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] type-label-lg ${TARGET}`,
				md: "[--btn-h:56px] [--btn-px:24px] [--btn-gap:8px] [--btn-icon:24px] [--btn-icon-opsz:24] [--btn-r-square:var(--radius-m3-lg)] [--btn-r-pressed:var(--radius-m3-md)] [--btn-outline:1px] type-title-md",
				lg: "[--btn-h:96px] [--btn-px:48px] [--btn-gap:12px] [--btn-icon:32px] [--btn-icon-opsz:32] [--btn-r-square:var(--radius-m3-xl)] [--btn-r-pressed:var(--radius-m3-lg)] [--btn-outline:2px] type-headline-sm",
				xl: "[--btn-h:136px] [--btn-px:64px] [--btn-gap:16px] [--btn-icon:40px] [--btn-icon-opsz:40] [--btn-r-square:var(--radius-m3-xl)] [--btn-r-pressed:var(--radius-m3-lg)] [--btn-outline:3px] type-headline-lg",
				// shadcn compatibility aliases
				default: `[--btn-h:40px] [--btn-px:16px] [--btn-gap:8px] [--btn-icon:20px] [--btn-icon-opsz:20] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] type-label-lg ${TARGET}`,
				icon: `w-(--btn-h) [--btn-h:40px] [--btn-px:0px] [--btn-gap:0px] [--btn-icon:24px] [--btn-icon-opsz:24] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] type-label-lg ${TARGET}`,
				"icon-xs": `w-(--btn-h) [--btn-h:32px] [--btn-px:0px] [--btn-gap:0px] [--btn-icon:20px] [--btn-icon-opsz:20] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] type-label-lg ${TARGET}`,
				"icon-sm": `w-(--btn-h) [--btn-h:32px] [--btn-px:0px] [--btn-gap:0px] [--btn-icon:20px] [--btn-icon-opsz:20] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] type-label-lg ${TARGET}`,
				"icon-lg": "w-(--btn-h) [--btn-h:56px] [--btn-px:0px] [--btn-gap:0px] [--btn-icon:24px] [--btn-icon-opsz:24] [--btn-r-square:var(--radius-m3-lg)] [--btn-r-pressed:var(--radius-m3-md)] [--btn-outline:1px] type-label-lg",
			},
			shape: {
				round: "[--btn-r-rest:var(--btn-r-full)] [--btn-r-sel:var(--btn-r-square)]",
				square: "[--btn-r-rest:var(--btn-r-square)] [--btn-r-sel:var(--btn-r-full)]",
			},
			/** Toggle (selection) button: shape morphs use fast-spatial (buttons.md §1.4). */
			toggle: {
				true: "[--btn-shape-t:var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing)]",
				false: "",
			},
			selected: {
				true: "",
				false: "",
			},
		},
		compoundVariants: [
			// selected: round → square, square → round; filled icon
			{
				toggle: true,
				selected: true,
				class: "[--btn-r:var(--btn-r-sel)] [&_[data-slot=icon]]:[--m3-icon-fill:1]!",
			},
			// toggle colors (buttons.md §1.3 "Toggle button")
			{
				toggle: true,
				selected: false,
				variant: ["filled", "default"],
				class: "bg-surface-container text-on-surface-variant",
			},
			{
				toggle: true,
				selected: true,
				variant: ["tonal", "secondary"],
				class: "bg-m3-secondary text-on-secondary",
			},
			{
				toggle: true,
				selected: true,
				variant: ["outlined", "outline"],
				class: "bg-inverse-surface text-inverse-on-surface shadow-[inset_0_0_0_0_var(--md-sys-color-outline-variant)] disabled:bg-on-surface/10",
			},
			{
				toggle: true,
				selected: true,
				variant: "elevated",
				class: "bg-m3-primary text-on-primary",
			},
		],
		defaultVariants: {
			variant: "filled",
			size: "sm",
			shape: "round",
			toggle: false,
			selected: false,
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];
	export type ButtonShape = VariantProps<typeof buttonVariants>["shape"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			/** Color style. `filled` (default) | `tonal` | `outlined` | `elevated` | `text`. */
			variant?: ButtonVariant;
			/** `xs` 32 | `sm` 40 (default) | `md` 56 | `lg` 96 | `xl` 136. */
			size?: ButtonSize;
			/** Resting shape: `round` (full, default) or `square`. */
			shape?: ButtonShape;
			/** Selection (toggle) button. Not available for `text` (ignored). */
			toggle?: boolean;
			/** Selected state of a toggle button (bindable). */
			pressed?: boolean;
			onPressedChange?: (pressed: boolean) => void;
		};
</script>

<script lang="ts">
	import { ripple } from "#lib/m3/ripple.svelte.js";

	let {
		class: className,
		variant = "filled",
		size = "sm",
		shape = "round",
		toggle = false,
		pressed = $bindable(false),
		onPressedChange,
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		onclick,
		children,
		...restProps
	}: ButtonProps = $props();

	const isToggle = $derived(toggle && variant !== "text" && variant !== "link" && !href);
	const classes = $derived(
		cn(buttonVariants({ variant, size, shape, toggle: isToggle, selected: isToggle && pressed }), className)
	);

	function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		(onclick as ((e: MouseEvent) => void) | undefined)?.(e);
		if (!isToggle || e.defaultPrevented) return;
		pressed = !pressed;
		onPressedChange?.(pressed);
	}
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		class={classes}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		onclick={onclick as HTMLAnchorAttributes["onclick"]}
		{...restProps}
		{@attach ripple()}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		data-variant={variant}
		data-size={size}
		data-shape={shape}
		data-selected={isToggle ? pressed : undefined}
		aria-pressed={isToggle ? pressed : undefined}
		class={classes}
		{type}
		{disabled}
		onclick={handleClick}
		{...restProps}
		{@attach ripple()}
	>
		{@render children?.()}
	</button>
{/if}
