<script lang="ts">
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import SideSheetClose from "./side-sheet-close.svelte";
	import { SIDE_SHEET_ICON_BUTTON } from "./context.js";

	/**
	 * Header row: [back icon] title (title-large) [close icon]. 24dp start padding (16dp with a back
	 * icon), 12dp between elements.
	 */
	let {
		ref = $bindable(null),
		class: className,
		children,
		showClose = true,
		closeLabel = "Close",
		onBack,
		backLabel = "Back",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		showClose?: boolean;
		closeLabel?: string;
		/** Shows a back arrow at the start (for multi-level sheets). */
		onBack?: () => void;
		backLabel?: string;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="side-sheet-header"
	class={cn(
		"flex min-h-[72px] shrink-0 items-center gap-3 py-3 pe-3",
		onBack ? "ps-3" : "ps-6",
		className
	)}
	{...restProps}
>
	{#if onBack}
		<button
			type="button"
			class={SIDE_SHEET_ICON_BUTTON}
			aria-label={backLabel}
			onclick={onBack}
			{@attach ripple()}
		>
			<Icon name="arrow_back" size={24} />
		</button>
	{/if}
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		{@render children?.()}
	</div>
	{#if showClose}
		<SideSheetClose>
			{#snippet child({ props })}
				<button {...props} class={SIDE_SHEET_ICON_BUTTON} aria-label={closeLabel} {@attach ripple()}>
					<Icon name="close" size={24} />
				</button>
			{/snippet}
		</SideSheetClose>
	{/if}
</div>
