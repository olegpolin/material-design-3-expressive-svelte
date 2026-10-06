<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	/*
	 * M3 Expressive icon button (docs/research/buttons.md §2, §9.4).
	 * Uses the same CSS-variable protocol as `Button` (--btn-h, --btn-r*, --btn-icon …) so button
	 * groups can re-shape it; the width comes from --btn-w (narrow | default | wide per size).
	 */

	const TARGET =
		"after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-12 after:min-w-12 after:-translate-1/2 after:content-['']";
	const OUTLINE = "shadow-[inset_0_0_0_var(--btn-outline)_var(--md-sys-color-outline-variant)]";

	export const iconButtonVariants = tv({
		base: [
			"group/icon-button relative inline-flex shrink-0 cursor-pointer items-center justify-center align-middle select-none",
			"h-(--btn-h) w-(--btn-w) p-0",
			"[--btn-r-full:calc(var(--btn-h)/2)] [--btn-r:var(--btn-r-rest)] active:[--btn-r:var(--btn-r-pressed)]",
			"[border-start-start-radius:var(--btn-r-ss,var(--btn-r))] [border-start-end-radius:var(--btn-r-se,var(--btn-r))] [border-end-start-radius:var(--btn-r-es,var(--btn-r))] [border-end-end-radius:var(--btn-r-ee,var(--btn-r))]",
			// press morph: default-effects (no bounce); toggle shape change: fast-spatial
			"[--btn-shape-t:var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)] [--btn-color-t:var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)]",
			"[transition:border-radius_var(--btn-shape-t),border-start-start-radius_var(--btn-shape-t),border-start-end-radius_var(--btn-shape-t),border-end-start-radius_var(--btn-shape-t),border-end-end-radius_var(--btn-shape-t),background-color_var(--btn-color-t),color_var(--btn-color-t),box-shadow_var(--btn-color-t)]",
			"[&_[data-slot=icon]]:[--m3-icon-size:var(--btn-icon)]! [&_[data-slot=icon]]:[--m3-icon-opsz:var(--btn-icon-opsz)]!",
			"[&_svg]:pointer-events-none [&_svg]:size-(--btn-icon) [&_svg]:shrink-0",
			"disabled:pointer-events-none disabled:cursor-default aria-disabled:pointer-events-none aria-disabled:cursor-default",
			"disabled:text-on-surface/38 aria-disabled:text-on-surface/38",
		],
		variants: {
			variant: {
				standard: "bg-transparent text-on-surface-variant",
				filled: "bg-m3-primary text-on-primary disabled:bg-on-surface/10 aria-disabled:bg-on-surface/10",
				tonal: "bg-secondary-container text-on-secondary-container disabled:bg-on-surface/10 aria-disabled:bg-on-surface/10",
				outlined: `bg-transparent text-on-surface-variant ${OUTLINE}`,
			},
			size: {
				xs: `[--btn-h:32px] [--btn-icon:20px] [--btn-icon-opsz:20] [--btn-w-narrow:28px] [--btn-w-default:32px] [--btn-w-wide:40px] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] ${TARGET}`,
				sm: `[--btn-h:40px] [--btn-icon:24px] [--btn-icon-opsz:24] [--btn-w-narrow:32px] [--btn-w-default:40px] [--btn-w-wide:52px] [--btn-r-square:var(--radius-m3-md)] [--btn-r-pressed:var(--radius-m3-sm)] [--btn-outline:1px] ${TARGET}`,
				md: "[--btn-h:56px] [--btn-icon:24px] [--btn-icon-opsz:24] [--btn-w-narrow:48px] [--btn-w-default:56px] [--btn-w-wide:72px] [--btn-r-square:var(--radius-m3-lg)] [--btn-r-pressed:var(--radius-m3-md)] [--btn-outline:1px]",
				lg: "[--btn-h:96px] [--btn-icon:32px] [--btn-icon-opsz:32] [--btn-w-narrow:64px] [--btn-w-default:96px] [--btn-w-wide:128px] [--btn-r-square:var(--radius-m3-xl)] [--btn-r-pressed:var(--radius-m3-lg)] [--btn-outline:2px]",
				xl: "[--btn-h:136px] [--btn-icon:40px] [--btn-icon-opsz:40] [--btn-w-narrow:104px] [--btn-w-default:136px] [--btn-w-wide:184px] [--btn-r-square:var(--radius-m3-xl)] [--btn-r-pressed:var(--radius-m3-lg)] [--btn-outline:3px]",
			},
			width: {
				narrow: "[--btn-w:var(--btn-w-narrow)]",
				default: "[--btn-w:var(--btn-w-default)]",
				wide: "[--btn-w:var(--btn-w-wide)]",
			},
			shape: {
				round: "[--btn-r-rest:var(--btn-r-full)] [--btn-r-sel:var(--btn-r-square)]",
				square: "[--btn-r-rest:var(--btn-r-square)] [--btn-r-sel:var(--btn-r-full)]",
			},
			toggle: {
				true: "[--btn-shape-t:var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing)]",
				false: "",
			},
			selected: { true: "", false: "" },
		},
		compoundVariants: [
			{
				toggle: true,
				selected: true,
				class: "[--btn-r:var(--btn-r-sel)] [&_[data-slot=icon]]:[--m3-icon-fill:1]!",
			},
			{ toggle: true, selected: false, variant: "filled", class: "bg-surface-container text-on-surface-variant" },
			{ toggle: true, selected: true, variant: "tonal", class: "bg-m3-secondary text-on-secondary" },
			{
				toggle: true,
				selected: true,
				variant: "outlined",
				class: "bg-inverse-surface text-inverse-on-surface shadow-[inset_0_0_0_0_var(--md-sys-color-outline-variant)] disabled:bg-on-surface/10 aria-disabled:bg-on-surface/10",
			},
			{ toggle: true, selected: true, variant: "standard", class: "text-m3-primary" },
		],
		defaultVariants: {
			variant: "standard",
			size: "sm",
			width: "default",
			shape: "round",
			toggle: false,
			selected: false,
		},
	});

	export type IconButtonVariant = VariantProps<typeof iconButtonVariants>["variant"];
	export type IconButtonSize = VariantProps<typeof iconButtonVariants>["size"];
	export type IconButtonWidth = VariantProps<typeof iconButtonVariants>["width"];
	export type IconButtonShape = VariantProps<typeof iconButtonVariants>["shape"];

	/** Icon size per button size (px): 20 / 24 / 24 / 32 / 40. */
	export const ICON_BUTTON_ICON_SIZE = { xs: 20, sm: 24, md: 24, lg: 32, xl: 40 } as const;

	export type IconButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			/** `standard` (default) | `filled` | `tonal` | `outlined`. */
			variant?: IconButtonVariant;
			/** `xs` 32 | `sm` 40 (default) | `md` 56 | `lg` 96 | `xl` 136. */
			size?: IconButtonSize;
			/** `narrow` | `default` | `wide`. */
			width?: IconButtonWidth;
			shape?: IconButtonShape;
			/** Material Symbols name. Alternatively pass children. Selected toggles fill the icon. */
			icon?: string;
			toggle?: boolean;
			/** Selected state of a toggle icon button (bindable). */
			pressed?: boolean;
			onPressedChange?: (pressed: boolean) => void;
		};
</script>

<script lang="ts">
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	let {
		class: className,
		variant = "standard",
		size = "sm",
		width = "default",
		shape = "round",
		icon,
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
	}: IconButtonProps = $props();

	const isToggle = $derived(toggle && !href);
	const selected = $derived(isToggle && pressed);
	const classes = $derived(
		cn(iconButtonVariants({ variant, size, width, shape, toggle: isToggle, selected }), className)
	);

	function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		(onclick as ((e: MouseEvent) => void) | undefined)?.(e);
		if (!isToggle || e.defaultPrevented) return;
		pressed = !pressed;
		onPressedChange?.(pressed);
	}
</script>

{#snippet content()}
	{#if icon}
		<Icon name={icon} size={ICON_BUTTON_ICON_SIZE[size ?? "sm"]} fill={selected} />
	{/if}
	{@render children?.()}
{/snippet}

{#if href}
	<a
		bind:this={ref}
		data-slot="icon-button"
		data-variant={variant}
		data-size={size}
		data-width={width}
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
		{@render content()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="icon-button"
		data-variant={variant}
		data-size={size}
		data-width={width}
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
		{@render content()}
	</button>
{/if}
