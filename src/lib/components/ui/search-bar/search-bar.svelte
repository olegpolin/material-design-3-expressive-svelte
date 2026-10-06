<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type SearchBarProps = Omit<HTMLInputAttributes, "value" | "children" | "class" | "onsubmit"> & {
		ref?: HTMLInputElement | null;
		value?: string;
		/** Material Symbols name of the leading icon (default `search`). `null` hides it. */
		leadingIcon?: string | null;
		/** Makes the leading icon a 48dp icon button (e.g. a navigation menu or back arrow). */
		onleadingclick?: (event: MouseEvent) => void;
		leadingIconLabel?: string;
		/** Custom leading content (replaces `leadingIcon`). */
		leading?: Snippet;
		/** Trailing actions: icon buttons and/or a 30dp avatar. Use `SearchBarAction` / `SearchBarAvatar`. */
		trailing?: Snippet;
		/** Called with the query on Enter. */
		onsubmit?: (value: string) => void;
		/** Expressive "contained" layout: 24dp side margins that shrink to 12dp while focused. */
		contained?: boolean;
		/** Level 3 shadow (inputs-selection.md §7.1). Set `false` inside app bars. */
		elevated?: boolean;
		class?: string;
		/** Classes for the 56dp bar itself (the root is the margin wrapper). */
		barClass?: string;
	};
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		placeholder = "Search",
		leadingIcon = "search",
		onleadingclick,
		leadingIconLabel,
		leading,
		trailing,
		onsubmit,
		contained = true,
		elevated = true,
		disabled,
		class: className,
		barClass,
		"aria-label": ariaLabel,
		...restProps
	}: SearchBarProps = $props();

	const hasLeading = $derived(!!leading || !!leadingIcon);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		onsubmit?.(value);
	}

	/** Pointer convenience: pressing anywhere on the bar (outside its buttons) focuses the input. */
	function focusInput(e: MouseEvent) {
		if (disabled || e.button !== 0) return;
		const t = e.target as HTMLElement;
		if (t === ref || t.closest("button, a, input, [role='button']")) return;
		e.preventDefault();
		ref?.focus();
	}
</script>

<div
	data-slot="search-bar"
	class={cn(
		"group/search w-full",
		contained &&
			"px-6 transition-[padding] duration-spring-default-spatial ease-spring-default-spatial focus-within:px-3",
		className
	)}
>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<form
		role="search"
		class={cn(
			"group/search-bar relative mx-auto flex h-14 w-full max-w-180 items-center gap-1 rounded-m3-full bg-surface-container-high text-on-surface",
			elevated && "shadow-m3-3",
			hasLeading ? "ps-1" : "ps-4",
			trailing ? "pe-1" : "pe-4",
			disabled ? "cursor-default opacity-(--md-sys-state-disabled-content-opacity)" : "cursor-text",
			barClass
		)}
		onsubmit={submit}
		onmousedown={focusInput}
	>
		{#if !disabled}
			<span
				aria-hidden="true"
				class="pointer-events-none absolute inset-0 rounded-[inherit] bg-on-surface opacity-0 transition-opacity duration-spring-fast-effects ease-spring-fast-effects group-hover/search-bar:opacity-(--md-sys-state-hover-opacity)"
			></span>
		{/if}

		{#if leading}
			<div class="relative flex shrink-0 items-center">{@render leading()}</div>
		{:else if leadingIcon}
			{#if onleadingclick}
				<button
					type="button"
					class="relative grid size-12 shrink-0 cursor-pointer place-items-center rounded-m3-full text-on-surface"
					aria-label={leadingIconLabel ?? leadingIcon}
					{disabled}
					onclick={onleadingclick}
					{@attach ripple()}
				>
					<Icon name={leadingIcon} />
				</button>
			{:else}
				<span class="relative grid size-12 shrink-0 place-items-center text-on-surface">
					<Icon name={leadingIcon} />
				</span>
			{/if}
		{/if}

		<input
			bind:this={ref}
			bind:value
			type="search"
			data-slot="search-bar-input"
			{placeholder}
			{disabled}
			aria-label={ariaLabel ?? placeholder}
			autocomplete="off"
			class="type-body-lg relative h-full min-w-0 flex-1 bg-transparent text-on-surface caret-m3-primary outline-none placeholder:text-on-surface-variant [&::-webkit-search-cancel-button]:hidden"
			{...restProps}
		/>

		{#if trailing}
			<div class="relative flex shrink-0 items-center text-on-surface-variant">{@render trailing()}</div>
		{/if}
	</form>
</div>
