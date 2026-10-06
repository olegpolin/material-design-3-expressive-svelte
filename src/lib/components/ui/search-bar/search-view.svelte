<script lang="ts" module>
	import type { Snippet } from "svelte";

	/** `docked`: results drop down under the bar. `fullscreen`: a full-screen view. `auto`: full-screen below 600px. */
	export type SearchViewMode = "auto" | "docked" | "fullscreen";

	export type SearchViewProps = {
		value?: string;
		open?: boolean;
		mode?: SearchViewMode;
		placeholder?: string;
		/** Leading icon of the collapsed bar (default `search`). */
		leadingIcon?: string;
		onleadingclick?: (event: MouseEvent) => void;
		leadingIconLabel?: string;
		/** Trailing actions of the bar (avatar, mic …). Hidden in the expanded full-screen header. */
		trailing?: Snippet;
		/** Fired with the query on Enter or when a suggestion is chosen. */
		onsubmit?: (value: string) => void;
		/** Filter suggestions by the query (bits-ui Command scoring). Turn off for server-side results. */
		filter?: boolean;
		/** Prepend a "search for <query>" row while typing (makes Enter submit the raw query). */
		queryItem?: boolean;
		/** Text shown when nothing matches. */
		emptyText?: string;
		/** Suggestions: `SearchView.Group` / `SearchView.Item` / `SearchView.Separator`. */
		children?: Snippet;
		class?: string;
	};
</script>

<script lang="ts">
	import { Command as CommandPrimitive, Dialog as DialogPrimitive } from "bits-ui";
	import { MediaQuery } from "svelte/reactivity";
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { setSearchViewContext } from "./context.js";
	import SearchBarAction from "./search-bar-action.svelte";
	import SearchViewItem from "./search-view-item.svelte";
	import SearchViewEmpty from "./search-view-empty.svelte";

	let {
		value = $bindable(""),
		open = $bindable(false),
		mode = "auto",
		placeholder = "Search",
		leadingIcon = "search",
		onleadingclick,
		leadingIconLabel,
		trailing,
		onsubmit,
		filter = true,
		queryItem = true,
		emptyText = "No results",
		children,
		class: className,
	}: SearchViewProps = $props();

	// M3 window size classes: compact < 600dp → full-screen search view.
	const compact = new MediaQuery("max-width: 599.98px", false);
	const fullscreen = $derived(mode === "fullscreen" || (mode === "auto" && compact.current));

	let root = $state<HTMLElement | null>(null);
	let input = $state<HTMLInputElement | null>(null);
	/** Highlighted suggestion (bits-ui Command value). */
	let highlighted = $state("");

	function submit(query: string) {
		value = query;
		open = false;
		if (!fullscreen) input?.blur();
		onsubmit?.(query);
	}

	setSearchViewContext({ select: submit });

	function onInputKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && open && !fullscreen) {
			e.preventDefault();
			open = false;
		} else if (e.key === "Enter" && (!open || !highlighted)) {
			e.preventDefault();
			submit(value);
		} else if (!open && !fullscreen && e.key.length === 1) {
			open = true;
		}
	}

	function onDockedFocusOut(e: FocusEvent) {
		const next = e.relatedTarget as Node | null;
		if (!next || !root?.contains(next)) open = false;
	}

	function onWindowPointerDown(e: PointerEvent) {
		if (!open || fullscreen) return;
		if (root && !root.contains(e.target as Node)) open = false;
	}

	function clear() {
		value = "";
		input?.focus();
	}

	const barClass =
		"group/search-bar relative flex h-14 w-full items-center gap-1 rounded-m3-full bg-surface-container-high ps-1 pe-1 text-on-surface";
	const inputClass =
		"type-body-lg relative h-full min-w-0 flex-1 bg-transparent text-on-surface caret-m3-primary outline-none placeholder:text-on-surface-variant [&::-webkit-search-cancel-button]:hidden";
	const hoverLayer =
		"pointer-events-none absolute inset-0 rounded-[inherit] bg-on-surface opacity-0 transition-opacity duration-spring-fast-effects ease-spring-fast-effects group-hover/search-bar:opacity-(--md-sys-state-hover-opacity)";
</script>

<svelte:window onpointerdown={onWindowPointerDown} />

{#snippet results()}
	<CommandPrimitive.List
		data-slot="search-view-list"
		class="search-view-results flex flex-col overflow-y-auto overscroll-contain py-2 outline-none"
	>
		{#if queryItem && value.trim()}
			<SearchViewItem value={value.trim()} icon="search" forceMount />
		{/if}
		{@render children?.()}
		{#if !(queryItem && value.trim())}
			<SearchViewEmpty>{emptyText}</SearchViewEmpty>
		{/if}
	</CommandPrimitive.List>
{/snippet}

{#if fullscreen}
	<!-- Collapsed bar: opens the full-screen view. -->
	<div data-slot="search-view" class={cn("w-full", className)}>
		<div class={cn(barClass, "mx-auto max-w-180 shadow-m3-3")}>
			<span aria-hidden="true" class={hoverLayer}></span>
			{#if onleadingclick}
				<SearchBarAction
					icon={leadingIcon}
					label={leadingIconLabel ?? leadingIcon}
					class="z-10"
					onclick={onleadingclick}
				/>
			{:else}
				<span class="relative grid size-12 shrink-0 place-items-center"><Icon name={leadingIcon} /></span>
			{/if}
			<button
				type="button"
				aria-haspopup="dialog"
				class={cn(
					"type-body-lg h-full min-w-0 flex-1 cursor-text truncate text-start outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-m3-secondary",
					value ? "text-on-surface" : "text-on-surface-variant"
				)}
				onclick={() => (open = true)}
			>
				{value || placeholder}
			</button>
			{#if trailing}
				<div class="relative z-10 flex shrink-0 items-center text-on-surface-variant">{@render trailing()}</div>
			{/if}
		</div>
	</div>

	<DialogPrimitive.Root bind:open>
		<DialogPrimitive.Portal>
			<DialogPrimitive.Content
				data-slot="search-view-fullscreen"
				class={cn(
					"fixed inset-0 z-50 flex flex-col bg-surface-container-low text-on-surface outline-none",
					"origin-top data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:duration-m3-long4 data-open:ease-m3-emphasized-decelerate",
					"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:duration-m3-medium3 data-closed:ease-[cubic-bezier(0,1,0,1)]"
				)}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					input?.focus();
				}}
			>
				<DialogPrimitive.Title class="sr-only">{placeholder}</DialogPrimitive.Title>
				<CommandPrimitive.Root
					bind:value={highlighted}
					shouldFilter={filter}
					loop
					label={placeholder}
					class="flex min-h-0 flex-1 flex-col"
				>
					<div class="px-3 pt-3">
						<div class={barClass}>
							<SearchBarAction icon="arrow_back" label="Close search" onclick={() => (open = false)} />
							<CommandPrimitive.Input
								bind:value
								bind:ref={input}
								type="search"
								{placeholder}
								autocomplete="off"
								class={inputClass}
								onkeydown={onInputKeydown}
							/>
							{#if value}
								<SearchBarAction icon="close" label="Clear search" class="text-on-surface-variant" onclick={clear} />
							{/if}
						</div>
					</div>
					<div class="search-view-fade flex min-h-0 flex-1 flex-col">
						{@render results()}
					</div>
				</CommandPrimitive.Root>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	</DialogPrimitive.Root>
{:else}
	<!-- Docked: the bar is the input; results drop 2dp below in a 12dp-corner container. -->
	<CommandPrimitive.Root
		bind:ref={root}
		bind:value={highlighted}
		shouldFilter={filter}
		loop
		label={placeholder}
		data-slot="search-view"
		data-state={open ? "open" : "closed"}
		class={cn("relative w-full max-w-180 min-w-0 sm:min-w-90", className)}
		onfocusout={onDockedFocusOut}
	>
		<div class={cn(barClass, "shadow-m3-3")}>
			<span aria-hidden="true" class={hoverLayer}></span>
			{#if onleadingclick}
				<SearchBarAction icon={leadingIcon} label={leadingIconLabel ?? leadingIcon} onclick={onleadingclick} />
			{:else}
				<span class="relative grid size-12 shrink-0 place-items-center"><Icon name={leadingIcon} /></span>
			{/if}
			<CommandPrimitive.Input
				bind:value
				bind:ref={input}
				type="search"
				{placeholder}
				autocomplete="off"
				aria-expanded={open}
				class={inputClass}
				onfocus={() => (open = true)}
				onclick={() => (open = true)}
				onkeydown={onInputKeydown}
			/>
			{#if value}
				<button
					type="button"
					aria-label="Clear search"
					class="relative grid size-12 shrink-0 cursor-pointer place-items-center rounded-m3-full text-on-surface-variant"
					onclick={clear}
					{@attach ripple()}
				>
					<Icon name="close" />
				</button>
			{/if}
			{#if trailing}
				<div class="relative flex shrink-0 items-center text-on-surface-variant">{@render trailing()}</div>
			{/if}
		</div>
		{#if open}
			<div
				data-slot="search-view-docked"
				class={cn(
					"absolute inset-x-0 top-full z-50 mt-0.5 flex max-h-[min(66vh,560px)] min-h-60 flex-col overflow-hidden rounded-m3-md bg-surface-container-high shadow-m3-3",
					"origin-top animate-in fade-in-0 slide-in-from-top-2 duration-m3-long4 ease-m3-emphasized-decelerate"
				)}
			>
				<div class="search-view-fade flex min-h-0 flex-1 flex-col">
					{@render results()}
				</div>
			</div>
		{/if}
	</CommandPrimitive.Root>
{/if}

<style>
	/* Results fade in over 100ms after a 50ms delay (inputs-selection.md §7.2). */
	.search-view-fade {
		animation: search-view-fade var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-linear)
			var(--md-sys-motion-duration-short1) both;
	}
	@keyframes search-view-fade {
		from {
			opacity: 0;
		}
	}
</style>
