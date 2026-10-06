<script lang="ts">
	import { cn } from "#lib/utils.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { Icon } from "#lib/components/ui/icon/index.js";

	/**
	 * The M3 snackbar surface rendered inside svelte-sonner (via `snackbar()`).
	 * 48dp single line / 68dp two lines, 4dp corner, inverse-surface, level 3, body-medium,
	 * 16dp start padding (8dp next to a button), 8dp extra text end spacing,
	 * inverse-primary label-large action, 24dp close icon.
	 */
	let {
		message,
		action,
		onAction,
		closable = false,
		actionOnNewLine = false,
		closeToast,
		onclose,
	}: {
		message: string;
		/** Action label (text button). */
		action?: string;
		onAction?: () => void;
		/** Show the close (×) icon button. */
		closable?: boolean;
		/** Long action label on its own line (12dp offset, 4dp bottom padding). */
		actionOnNewLine?: boolean;
		/** Injected by svelte-sonner. */
		closeToast?: () => void;
		/** Internal: tells the snackbar queue this one is gone. */
		onclose?: () => void;
	} = $props();

	let hasButtons = $derived(!!action || closable);

	function dismiss() {
		closeToast?.();
		onclose?.();
	}
</script>

<div
	data-slot="snackbar"
	class={cn(
		"flex min-h-12 rounded-m3-xs bg-inverse-surface text-inverse-on-surface shadow-m3-3",
		actionOnNewLine ? "flex-col items-stretch ps-4 pe-2" : "items-center ps-4",
		!actionOnNewLine && (hasButtons ? "pe-2" : "pe-4")
	)}
>
	<p
		data-slot="snackbar-text"
		class={cn(
			"type-body-md min-w-0 flex-1 py-3.5",
			hasButtons && "pe-2",
			actionOnNewLine && "pt-3.5 pb-0"
		)}
	>
		{message}
	</p>
	{#if hasButtons}
		<div
			data-slot="snackbar-actions"
			class={cn("flex shrink-0 items-center", actionOnNewLine && "mt-1.5 justify-end pb-1")}
		>
			{#if action}
				<button
					type="button"
					data-slot="snackbar-action"
					class="type-label-lg relative h-10 rounded-m3-full px-3 text-inverse-primary"
					onclick={() => {
						onAction?.();
						dismiss();
					}}
					{@attach ripple()}
				>
					{action}
				</button>
			{/if}
			{#if closable}
				<button
					type="button"
					data-slot="snackbar-close"
					aria-label="Dismiss"
					class="relative grid size-10 place-items-center rounded-m3-full text-inverse-on-surface"
					onclick={dismiss}
					{@attach ripple()}
				>
					<Icon name="close" size={24} />
				</button>
			{/if}
		</div>
	{/if}
</div>
