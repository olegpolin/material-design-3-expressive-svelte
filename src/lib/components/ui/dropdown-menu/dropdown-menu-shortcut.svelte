<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { menuShortcutVariants, useMenuVariant } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();

	const menu = useMenuVariant();
</script>

<kbd
	bind:this={ref}
	data-slot="dropdown-menu-shortcut"
	class={cn(menuShortcutVariants({ variant: menu.variant }), className)}
	{...restProps}
>
	{@render children?.()}
</kbd>
