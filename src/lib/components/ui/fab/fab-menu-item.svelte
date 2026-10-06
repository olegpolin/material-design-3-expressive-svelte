<script lang="ts">
	import { untrack } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { FAB_MENU_ITEM_COLORS, getFabMenuContext } from "./context.js";

	/*
	 * FAB menu item (buttons.md §4.1): 56dp high, full round, 24/24 padding, 24dp icon, 8dp
	 * icon-label gap, title-medium label, *-container colors of the menu's color set.
	 * Selecting an item closes the menu (call `e.preventDefault()` in `onclick` to keep it open).
	 */
	let {
		ref = $bindable(null),
		icon,
		label,
		class: className,
		onclick,
		children,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		/** Leading Material Symbols icon. */
		icon?: string;
		/** Label text; children override it. */
		label?: string;
	} = $props();

	const ctx = getFabMenuContext();
	const key = Symbol("fab-menu-item");

	// untracked: register() reads the registry, which must not become a dependency
	$effect(() => untrack(() => ctx.register(key)));

	const index = $derived(ctx.indexOf(key));
	const visible = $derived(ctx.isVisible(index));

	function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		(onclick as ((e: MouseEvent) => void) | undefined)?.(e);
		if (!e.defaultPrevented) ctx.close();
	}
</script>

<button
	bind:this={ref}
	type="button"
	role="menuitem"
	tabindex="-1"
	data-slot="fab-menu-item"
	data-visible={visible}
	class={cn(
		"relative inline-flex h-14 min-w-14 shrink-0 cursor-pointer items-center gap-2 rounded-m3-full px-6 whitespace-nowrap select-none type-title-md",
		"[transition:clip-path_var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing),opacity_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]",
		"[&_[data-slot=icon]]:[--m3-icon-size:24px]!",
		FAB_MENU_ITEM_COLORS[ctx.color],
		className
	)}
	style:clip-path={visible ? "inset(-5px round 33px)" : "inset(-5px -5px -5px 100% round 33px)"}
	style:opacity={visible ? 1 : 0}
	onclick={handleClick}
	{...restProps}
	{@attach ripple()}
>
	{#if icon}
		<Icon name={icon} size={24} />
	{/if}
	{#if children}{@render children()}{:else}{label}{/if}
</button>
