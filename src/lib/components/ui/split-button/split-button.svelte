<script lang="ts" module>
	import { tv } from "tailwind-variants";

	/*
	 * M3 Expressive split button (docs/research/buttons.md §6, §9.7): a leading button and a trailing
	 * menu button, 2dp apart. Outer corners full; inner corners 4/4/4/8/12 (XS–XL), morphing to
	 * 8/12/12/20/20 on hover / focus / press (default-effects). The trailing button becomes fully
	 * round while its menu is open (`aria-expanded`) and its chevron rotates 180° (standard scheme).
	 */
	export const splitButtonVariants = tv({
		base: "group/split-button inline-flex shrink-0 items-center gap-0.5 align-middle",
		variants: {
			size: {
				xs: "[--sb-inner:var(--radius-m3-xs)] [--sb-inner-active:var(--radius-m3-sm)] [--sb-ps:12px] [--sb-pe:10px] [--sb-trail-w:48px] [--sb-trail-icon:22px] [--sb-offset:-1px]",
				sm: "[--sb-inner:var(--radius-m3-xs)] [--sb-inner-active:var(--radius-m3-md)] [--sb-ps:16px] [--sb-pe:12px] [--sb-trail-w:48px] [--sb-trail-icon:22px] [--sb-offset:-1px]",
				md: "[--sb-inner:var(--radius-m3-xs)] [--sb-inner-active:var(--radius-m3-md)] [--sb-ps:24px] [--sb-pe:24px] [--sb-trail-w:56px] [--sb-trail-icon:26px] [--sb-offset:-2px]",
				lg: "[--sb-inner:var(--radius-m3-sm)] [--sb-inner-active:var(--radius-m3-lg-increased)] [--sb-ps:48px] [--sb-pe:48px] [--sb-trail-w:96px] [--sb-trail-icon:38px] [--sb-offset:-3px]",
				xl: "[--sb-inner:var(--radius-m3-md)] [--sb-inner-active:var(--radius-m3-lg-increased)] [--sb-ps:64px] [--sb-pe:64px] [--sb-trail-w:136px] [--sb-trail-icon:50px] [--sb-offset:-6px]",
			},
		},
		defaultVariants: { size: "sm" },
	});
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { setSplitButtonContext, type SplitButtonSize, type SplitButtonVariant } from "./context.js";

	let {
		ref = $bindable(null),
		variant = "filled",
		size = "sm",
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** `filled` (default) | `tonal` | `outlined` | `elevated`. */
		variant?: SplitButtonVariant;
		/** `xs` 32 | `sm` 40 (default) | `md` 56 | `lg` 96 | `xl` 136. */
		size?: SplitButtonSize;
	} = $props();

	setSplitButtonContext({
		get variant() {
			return variant;
		},
		get size() {
			return size;
		},
	});
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="split-button"
	data-variant={variant}
	data-size={size}
	class={cn(splitButtonVariants({ size }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
