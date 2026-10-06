<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { Button, buttonVariants, type ButtonVariant } from "#lib/components/ui/button/index.js";
	import {
		ICON_BUTTON_ICON_SIZE,
		iconButtonVariants,
		type IconButtonVariant,
	} from "#lib/components/ui/icon-button/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { getButtonGroupContext } from "./context.js";

	/*
	 * A button inside a ButtonGroup. Size and shape come from the group. In a selecting group
	 * (`type="single" | "multiple"`) it is a bits-ui ToggleGroup item styled as an M3 toggle button;
	 * otherwise a plain Button. With `icon` and no children it renders as an icon button.
	 */
	let {
		value = "",
		variant,
		icon,
		disabled = false,
		class: className,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes, "value"> & {
		/** Item value for selecting groups. */
		value?: string;
		/** Color style; defaults to the group's `itemVariant`. */
		variant?: ButtonVariant;
		/** Material Symbols icon (leading, or the whole content when there are no children). */
		icon?: string;
	} = $props();

	const ctx = getButtonGroupContext();
	// attribute passthrough shared by the toggle-item / icon / Button branches
	const rest = $derived(restProps as Record<string, unknown>);
	const color = $derived(variant ?? ctx.itemVariant);
	const iconOnly = $derived(!!icon && !children);

	const ICON_VARIANT: Record<string, IconButtonVariant> = {
		filled: "filled",
		default: "filled",
		elevated: "filled",
		destructive: "filled",
		tonal: "tonal",
		secondary: "tonal",
		outlined: "outlined",
		outline: "outlined",
		text: "standard",
		ghost: "standard",
		link: "standard",
	};

	function itemClass(selected: boolean, toggle: boolean) {
		return cn(
			iconOnly
				? iconButtonVariants({
						variant: ICON_VARIANT[color ?? "filled"],
						size: ctx.size,
						shape: ctx.shape,
						toggle,
						selected,
					})
				: buttonVariants({ variant: color, size: ctx.size, shape: ctx.shape, toggle, selected }),
			className
		);
	}
</script>

{#snippet content(selected: boolean)}
	{#if icon}
		<Icon
			name={icon}
			data-icon={iconOnly ? undefined : "inline-start"}
			size={iconOnly ? ICON_BUTTON_ICON_SIZE[ctx.size] : 20}
			fill={selected}
		/>
	{/if}
	{@render children?.()}
{/snippet}

{#if ctx.type}
	<ToggleGroupPrimitive.Item {value} {disabled} {...rest}>
		{#snippet child({ props, pressed })}
			<button
				{...props}
				data-slot={iconOnly ? "icon-button" : "button"}
				data-size={ctx.size}
				class={itemClass(pressed, true)}
				{@attach ripple()}
			>
				{@render content(pressed)}
			</button>
		{/snippet}
	</ToggleGroupPrimitive.Item>
{:else if iconOnly}
	<button
		type="button"
		data-slot="icon-button"
		data-size={ctx.size}
		class={itemClass(false, false)}
		{disabled}
		{...rest}
		{@attach ripple()}
	>
		{@render content(false)}
	</button>
{:else}
	<Button variant={color} size={ctx.size} shape={ctx.shape} class={className} {disabled} {...rest}>
		{@render content(false)}
	</Button>
{/if}
