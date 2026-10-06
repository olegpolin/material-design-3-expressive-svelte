<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	/*
	 * Outlined segmented button — baseline M3, *not recommended* in M3 Expressive (use a connected
	 * ButtonGroup instead). docs/research/buttons.md §7. Segments share the group width equally.
	 */
	let {
		ref = $bindable(null),
		type = "single",
		value = $bindable(),
		onValueChange,
		required = false,
		disabled = false,
		class: className,
		children,
		...restProps
	}: WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "onchange">> & {
		/** `single` (default) | `multiple`. */
		type?: "single" | "multiple";
		/** A string for `single`, a string[] for `multiple` (bindable). */
		value?: string | string[];
		onValueChange?: (value: string | string[]) => void;
		/** The last selected segment can't be deselected. */
		required?: boolean;
		disabled?: boolean;
	} = $props();

	const rest = $derived(restProps as Record<string, unknown>);

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

<ToggleGroupPrimitive.Root
	bind:ref
	type={type as never}
	bind:value={() => getValue() as never, (v: never) => setValue(v)}
	{disabled}
	data-slot="segmented-button"
	class={cn("inline-grid auto-cols-fr grid-flow-col", className)}
	{...rest}
>
	{@render children?.()}
</ToggleGroupPrimitive.Root>
