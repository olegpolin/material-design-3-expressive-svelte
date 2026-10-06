<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { buttonVariants } from "#lib/components/ui/button/index.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { getSplitButtonContext } from "./context.js";

	/*
	 * Trailing (menu) segment: always shows the menu icon. Width 48/48/56/96/136, icon 22/22/26/38/50,
	 * optically offset −1/−1/−2/−3/−6 toward the inner edge while collapsed. While open
	 * (`aria-expanded="true"`, set by a DropdownMenu.Trigger child snippet, or `open`) it is fully
	 * round, gets a 10% content-color overlay and the icon is centered and rotated 180°.
	 *
	 *   <DropdownMenu.Trigger>
	 *     {#snippet child({ props })}<SplitButton.Trailing {...props} />{/snippet}
	 *   </DropdownMenu.Trigger>
	 */
	let {
		ref = $bindable(null),
		open,
		icon = "keyboard_arrow_down",
		type = "button",
		class: className,
		"aria-label": ariaLabel = "More options",
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		/** Expanded state when not driven by a menu trigger's `aria-expanded`. */
		open?: boolean;
		icon?: string;
	} = $props();

	const ctx = getSplitButtonContext();
</script>

<button
	bind:this={ref}
	aria-label={ariaLabel}
	aria-expanded={open}
	class={cn(
		buttonVariants({ variant: ctx.variant, size: ctx.size }),
		"group/trailing w-(--sb-trail-w) px-0 [--btn-icon:var(--sb-trail-icon)] [--btn-icon-opsz:24]",
		"[--sb-r:var(--sb-inner)] hover:[--sb-r:var(--sb-inner-active)] focus-visible:[--sb-r:var(--sb-inner-active)] active:[--sb-r:var(--sb-inner-active)] aria-expanded:[--sb-r:var(--btn-r-full)]",
		"[--btn-r-ss:var(--sb-r)] [--btn-r-es:var(--sb-r)] [--btn-r-se:var(--btn-r-full)] [--btn-r-ee:var(--btn-r-full)]",
		// selected: 10% content-color overlay, container color unchanged (buttons.md §6.3)
		"before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity before:duration-spring-default-effects before:ease-spring-default-effects aria-expanded:before:opacity-(--md-sys-state-pressed-opacity)",
		className
	)}
	{type}
	{...restProps}
	data-slot="split-button-trailing"
	{@attach ripple()}
>
	<span
		data-motion-scheme="standard"
		class="inline-flex translate-x-(--sb-offset) transition-[translate,rotate] duration-spring-fast-spatial ease-spring-fast-spatial group-aria-expanded/trailing:translate-x-0 group-aria-expanded/trailing:rotate-180"
	>
		<Icon name={icon} />
	</span>
</button>
