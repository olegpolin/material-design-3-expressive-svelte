<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { cn } from "#lib/utils.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { getSplitButtonContext } from "./context.js";

	/** Leading segment: icon and/or a 1–2 word label. Padding 12/10 · 16/12 · 24/24 · 48/48 · 64/64. */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Omit<ComponentProps<typeof Button>, "variant" | "size" | "shape" | "toggle"> = $props();

	const ctx = getSplitButtonContext();
</script>

<Button
	bind:ref
	data-slot="split-button-leading"
	variant={ctx.variant}
	size={ctx.size}
	class={cn(
		"ps-(--sb-ps) pe-(--sb-pe)",
		"[--sb-r:var(--sb-inner)] hover:[--sb-r:var(--sb-inner-active)] focus-visible:[--sb-r:var(--sb-inner-active)] active:[--sb-r:var(--sb-inner-active)]",
		"[--btn-r-ss:var(--btn-r-full)] [--btn-r-es:var(--btn-r-full)] [--btn-r-se:var(--sb-r)] [--btn-r-ee:var(--sb-r)]",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</Button>
