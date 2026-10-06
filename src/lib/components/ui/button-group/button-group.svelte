<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	/*
	 * M3 Expressive button groups (docs/research/buttons.md §5, §9.6).
	 *
	 * standard  — invisible container, between-space 18/12/8/8/8 (XS–XL), press squeeze (+15% width,
	 *             neighbours give it up) on fast-spatial.
	 * connected — 2dp gap, spans its container, children flex equally; outer corners full (round) or
	 *             4/8/8/16/20 (square), inner corners 8/8/8/16/20 → pressed 4/4/4/12/16, a selected
	 *             item becomes fully round. Only the pressed/selected item's shape changes.
	 *
	 * Corners are driven through the button CSS-variable protocol (--btn-r-ss/-se/-es/-ee), declared on
	 * the children so `var(--btn-r-full)` resolves against each child's own height.
	 */
	export const buttonGroupVariants = tv({
		base: "group/button-group",
		variants: {
			variant: {
				standard: "inline-flex max-w-full flex-nowrap items-center gap-(--bg-gap)",
				connected: [
					"flex w-full flex-nowrap items-center gap-0.5 [&>*]:flex-1 [&>*]:basis-0",
					"[&>*]:[--btn-r-ss:var(--bg-inner)] [&>*]:[--btn-r-se:var(--bg-inner)] [&>*]:[--btn-r-es:var(--bg-inner)] [&>*]:[--btn-r-ee:var(--bg-inner)]",
					"[&>*:first-child]:[--btn-r-ss:var(--bg-outer)] [&>*:first-child]:[--btn-r-es:var(--bg-outer)]",
					"[&>*:last-child]:[--btn-r-se:var(--bg-outer)] [&>*:last-child]:[--btn-r-ee:var(--bg-outer)]",
					// selected → full on every corner; pressed (more specific) → pressed inner corner
					"[&>[data-state=on]]:[--bg-inner:var(--btn-r-full)] [&>[data-state=on]]:[--bg-outer:var(--btn-r-full)]",
					"[&>[aria-pressed=true]]:[--bg-inner:var(--btn-r-full)] [&>[aria-pressed=true]]:[--bg-outer:var(--btn-r-full)]",
					"[&>*:not(:disabled):active]:[--bg-inner:var(--bg-inner-pressed)]",
					// shape changes in a connected group use fast-spatial
					"[&>*]:[--btn-shape-t:var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing)]",
				],
			},
			size: {
				xs: "[--bg-gap:18px] [--bg-inner:var(--radius-m3-sm)] [--bg-inner-pressed:var(--radius-m3-xs)] [--bg-square:var(--radius-m3-xs)]",
				sm: "[--bg-gap:12px] [--bg-inner:var(--radius-m3-sm)] [--bg-inner-pressed:var(--radius-m3-xs)] [--bg-square:var(--radius-m3-sm)]",
				md: "[--bg-gap:8px] [--bg-inner:var(--radius-m3-sm)] [--bg-inner-pressed:var(--radius-m3-xs)] [--bg-square:var(--radius-m3-sm)]",
				lg: "[--bg-gap:8px] [--bg-inner:var(--radius-m3-lg)] [--bg-inner-pressed:var(--radius-m3-md)] [--bg-square:var(--radius-m3-lg)]",
				xl: "[--bg-gap:8px] [--bg-inner:var(--radius-m3-lg-increased)] [--bg-inner-pressed:var(--radius-m3-lg)] [--bg-square:var(--radius-m3-lg-increased)]",
			},
			shape: {
				round: "[&>*]:[--bg-outer:var(--btn-r-full)]",
				square: "[&>*]:[--bg-outer:var(--bg-square)]",
			},
		},
		compoundVariants: [
			// XS/S connected items keep a 48dp minimum width
			{ variant: "connected", size: ["xs", "sm"], class: "[&>*]:min-w-12" },
		],
		defaultVariants: { variant: "standard", size: "sm", shape: "round" },
	});

	export type ButtonGroupVariant = VariantProps<typeof buttonGroupVariants>["variant"];
</script>

<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { ButtonShape, ButtonVariant } from "#lib/components/ui/button/index.js";
	import { setButtonGroupContext, type ButtonGroupSize } from "./context.js";
	import { squeeze } from "./squeeze.js";

	let {
		ref = $bindable(null),
		variant = "standard",
		size = "sm",
		shape = "round",
		itemVariant = "filled",
		type,
		value = $bindable(),
		onValueChange,
		required = false,
		disabled = false,
		class: className,
		children,
		...restProps
	}: WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "onchange">> & {
		/** `standard` (gaps + press squeeze) | `connected` (2dp gap, full width). */
		variant?: ButtonGroupVariant;
		size?: ButtonGroupSize;
		shape?: ButtonShape;
		/** Default color style of `ButtonGroupItem`s: filled | tonal | outlined | elevated. */
		itemVariant?: ButtonVariant;
		/** Selection mode: `single` | `multiple`; omit for a group of action buttons. */
		type?: "single" | "multiple";
		/** Selected value(s): a string for `single`, a string[] for `multiple` (bindable). */
		value?: string | string[];
		onValueChange?: (value: string | string[]) => void;
		/** Selection-required: the last selected item can't be deselected. */
		required?: boolean;
		disabled?: boolean;
	} = $props();

	setButtonGroupContext({
		get variant() {
			return variant ?? "standard";
		},
		get size() {
			return size;
		},
		get shape() {
			return shape ?? "round";
		},
		get itemVariant() {
			return itemVariant;
		},
		get type() {
			return type;
		},
	});

	const rest = $derived(restProps as Record<string, unknown>);
	const classes = $derived(cn(buttonGroupVariants({ variant, size, shape }), className));

	function getValue() {
		return value ?? (type === "multiple" ? [] : "");
	}

	function setValue(next: string | string[]) {
		const empty = Array.isArray(next) ? next.length === 0 : !next;
		if (required && empty) return;
		value = next;
		onValueChange?.(next);
	}
</script>

{#if type}
	<ToggleGroupPrimitive.Root
		bind:ref
		type={type as never}
		bind:value={() => getValue() as never, (v: never) => setValue(v)}
		{disabled}
		data-slot="button-group"
		data-variant={variant}
		data-size={size}
		{...rest}
	>
		{#snippet child({ props })}
			<div
				{...props}
				class={classes}
				{@attach squeeze({ enabled: variant === "standard" })}
			>
				{@render children?.()}
			</div>
		{/snippet}
	</ToggleGroupPrimitive.Root>
{:else}
	<div
		bind:this={ref}
		role="group"
		data-slot="button-group"
		data-variant={variant}
		data-size={size}
		class={classes}
		{...restProps}
		{@attach squeeze({ enabled: variant === "standard" })}
	>
		{@render children?.()}
	</div>
{/if}
