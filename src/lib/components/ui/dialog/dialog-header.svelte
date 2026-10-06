<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { DIALOG_ICON_BUTTON, getDialogLayout } from "./context.svelte.js";

	/**
	 * Basic dialog: title + supporting text, 16dp apart; centered when the dialog has a hero icon.
	 * Full-screen dialog: a 56dp top bar with the close icon (24dp), the title (title-large) and
	 * any trailing children (the confirming action). On scroll it turns surface-container + level2.
	 */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const layout = getDialogLayout();
</script>

{#if layout.fullscreen}
	<div
		bind:this={ref}
		data-slot="dialog-header"
		data-scrolled={layout.scrolled || undefined}
		class={cn(
			"flex h-14 shrink-0 items-center gap-1 ps-1 pe-3 transition-[background-color,box-shadow] duration-spring-default-effects ease-spring-default-effects data-scrolled:bg-surface-container data-scrolled:shadow-m3-2",
			"[&>[data-slot=dialog-title]]:min-w-0 [&>[data-slot=dialog-title]]:flex-1 [&>[data-slot=dialog-title]]:truncate [&>[data-slot=dialog-title]]:ps-1",
			// adaptive dialog at >= 600dp keeps the basic container (surface-container-high): stay on it
			layout.fullscreen === true && "min-[600px]:data-scrolled:bg-surface-container-high",
			className
		)}
		{...restProps}
	>
		<DialogPrimitive.Close data-slot="dialog-close">
			{#snippet child({ props })}
				<button
					{...props}
					type="button"
					class={DIALOG_ICON_BUTTON}
					aria-label={layout.closeLabel}
					{@attach ripple()}
				>
					<Icon name={layout.closeIcon} size={24} class="text-on-surface" />
				</button>
			{/snippet}
		</DialogPrimitive.Close>
		{@render children?.()}
	</div>
{:else}
	<div
		bind:this={ref}
		data-slot="dialog-header"
		class={cn("flex flex-col gap-4", layout.hasIcon && "items-center text-center", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
