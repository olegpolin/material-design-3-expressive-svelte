<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";

	/**
	 * M3 outlined text-field look (inputs-selection.md §5.1/§5.4): 56dp, 4dp corner, 1dp `outline`
	 * → `on-surface` hover → 2dp `primary` focused/open, `error` when aria-invalid, 24dp trailing arrow.
	 * `size="sm"` is a dense 40dp variant (not an M3 spec size) kept for shadcn compatibility.
	 */
	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: "sm" | "default";
	} = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		"group/select-trigger type-body-lg relative flex w-fit min-w-0 cursor-pointer items-center justify-between gap-4 rounded-m3-xs border border-outline bg-transparent ps-4 pe-3 text-start whitespace-nowrap text-on-surface outline-none select-none",
		"data-[size=default]:h-14 data-[size=sm]:h-10",
		"transition-[border-color,box-shadow] duration-spring-fast-effects ease-spring-fast-effects",
		"hover:border-on-surface",
		"focus-visible:border-m3-primary focus-visible:shadow-[inset_0_0_0_1px_var(--md-sys-color-primary)]",
		"data-open:border-m3-primary data-open:shadow-[inset_0_0_0_1px_var(--md-sys-color-primary)]",
		"data-placeholder:text-on-surface-variant",
		"aria-invalid:border-error aria-invalid:hover:border-on-error-container aria-invalid:focus-visible:border-error aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--md-sys-color-error)] aria-invalid:data-open:border-error aria-invalid:data-open:shadow-[inset_0_0_0_1px_var(--md-sys-color-error)]",
		"disabled:pointer-events-none disabled:cursor-default disabled:border-on-surface/12 disabled:text-on-surface/38",
		"*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-3 *:data-[slot=select-value]:truncate",
		"[&_[data-slot=icon]]:pointer-events-none",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<Icon
		name="arrow_drop_down"
		class="text-on-surface-variant transition-transform duration-spring-fast-spatial ease-spring-fast-spatial group-disabled/select-trigger:text-on-surface/38 group-aria-invalid/select-trigger:text-error group-data-open/select-trigger:rotate-180"
	/>
</SelectPrimitive.Trigger>
