<script lang="ts" module>
	export type ChipVariant = "assist" | "filter" | "input" | "suggestion";
</script>

<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn } from "#lib/utils.js";

	/**
	 * M3 chip (docs/research/inputs-selection.md §6).
	 * 32dp tall · 8dp corner · 1dp outline (flat) · 16dp side padding, 8dp on an icon side, 4dp next to
	 * an avatar · 18dp icons · 24dp avatar · label-large. `morph` opts into the Expressive shape morph
	 * (12dp → full when selected → 8dp pressed, fast-spatial).
	 */
	let {
		ref = $bindable(null),
		variant = "assist",
		elevated = false,
		selected = $bindable(false),
		icon,
		trailingIcon,
		avatar,
		removable = false,
		onremove,
		removeLabel,
		morph = false,
		disabled = false,
		href,
		class: className,
		children,
		...restProps
	}: Omit<HTMLButtonAttributes & HTMLAnchorAttributes, "children"> & {
		ref?: HTMLElement | null;
		variant?: ChipVariant;
		/** Elevated (surface-container-low + level 1) instead of the 1dp outline. */
		elevated?: boolean;
		/** Filter chips toggle it (bindable). Input chips render it. */
		selected?: boolean;
		/** Leading Material Symbol (18dp). On a selected filter chip the checkmark replaces it. */
		icon?: string;
		/** Trailing Material Symbol (18dp), e.g. `arrow_drop_down` on a filter chip. */
		trailingIcon?: string;
		/** Input chips: a 24dp avatar (an `<img>` or `Avatar`). */
		avatar?: Snippet;
		/** Input chips: show the trailing remove button. Backspace / Delete on the chip also removes. */
		removable?: boolean;
		onremove?: () => void;
		removeLabel?: string;
		morph?: boolean;
		disabled?: boolean;
		href?: string;
		children?: Snippet;
	} = $props();

	let labelEl = $state<HTMLElement | null>(null);

	let isFilter = $derived(variant === "filter");
	let isInput = $derived(variant === "input");
	// Filter chips without an icon grow a checkmark slot when selected.
	let collapsibleCheck = $derived(isFilter && !icon);
	let hasLeading = $derived(!avatar && (!!icon || (isFilter && selected)));
	let hasTrailing = $derived(!!trailingIcon || (isInput && removable));
	let isSelected = $derived((isFilter || isInput) && selected);

	let rootAttrs = $derived({
		"data-slot": "chip",
		"data-variant": variant,
		"data-elevated": elevated || undefined,
		"data-selected": isSelected || undefined,
		"data-leading": hasLeading || undefined,
		"data-avatar": (isInput && !!avatar) || undefined,
		"data-trailing": hasTrailing || undefined,
		"data-morph": morph || undefined,
	});

	// Static state preview for showcases (`data-preview="hover|focus|pressed"`); on input chips the
	// host carries it so the chip-level styles apply.
	let preview = $derived((restProps as Record<string, unknown>)["data-preview"] as string | undefined);

	/** The element keyboard focus should land on inside a chip root. */
	const focusTarget = (chip: Element) =>
		(chip.matches("button, a[href]") ? chip : chip.querySelector(".primary")) as HTMLElement | null;

	async function onPrimaryKeydown(e: KeyboardEvent) {
		if (!(isInput && removable && !disabled && (e.key === "Backspace" || e.key === "Delete"))) return;
		e.preventDefault();
		// Keep keyboard focus in the set: Backspace moves to the previous chip, Delete to the next.
		const parent = ref?.parentElement;
		const chips = parent ? [...parent.children].filter((c) => c.matches("[data-slot=chip]")) : [];
		const i = ref ? chips.indexOf(ref) : -1;
		const before = chips.slice(0, Math.max(0, i)).reverse();
		const after = i < 0 ? [] : chips.slice(i + 1);
		const order = e.key === "Backspace" ? [...before, ...after] : [...after, ...before];
		const next = order.map(focusTarget).find((t) => t && !t.matches(":disabled"));
		onremove?.();
		await tick();
		if (next?.isConnected) next.focus();
	}

	function remove(e: MouseEvent) {
		e.stopPropagation();
		if (!disabled) onremove?.();
	}
</script>

{#snippet content()}
	{#if isInput && avatar}
		<span class="avatar" aria-hidden="true">{@render avatar()}</span>
	{:else if isFilter}
		<span class="leading" data-collapsible={collapsibleCheck || undefined} aria-hidden="true">
			{#if icon}
				<span class="leading-icon" data-visible={!selected || undefined}><Icon name={icon} size={18} /></span>
			{/if}
			<span class="leading-icon" data-visible={selected || undefined}><Icon name="check" size={18} /></span>
		</span>
	{:else if icon}
		<span class="leading" aria-hidden="true"><Icon name={icon} size={18} /></span>
	{/if}
	<span class="label" bind:this={labelEl}>{@render children?.()}</span>
	{#if trailingIcon}
		<span class="trailing" aria-hidden="true"><Icon name={trailingIcon} size={18} /></span>
	{/if}
{/snippet}

{#if isFilter}
	<TogglePrimitive.Root bind:pressed={selected} bind:ref {disabled} {...restProps as Record<string, unknown>}>
		{#snippet child({ props })}
			<button
				{...props}
				{...rootAttrs}
				class={cn("m3-chip", className)}
				{@attach ripple()}
			>
				{@render content()}
			</button>
		{/snippet}
	</TogglePrimitive.Root>
{:else if isInput}
	<span
		bind:this={ref}
		{...rootAttrs}
		data-preview={preview}
		data-disabled={disabled || undefined}
		class={cn("m3-chip", className)}
		{@attach ripple()}
	>
		<button
			type="button"
			class="primary"
			{disabled}
			aria-pressed={selected ? "true" : undefined}
			{...restProps as HTMLButtonAttributes}
			onkeydown={(e) => {
				(restProps as HTMLButtonAttributes).onkeydown?.(e as never);
				if (!e.defaultPrevented) onPrimaryKeydown(e);
			}}
		>
			{@render content()}
		</button>
		{#if removable}
			<button
				type="button"
				class="remove"
				{disabled}
				tabindex={-1}
				aria-label={removeLabel ?? `Remove ${labelEl?.textContent?.trim() ?? ""}`.trim()}
				onpointerdown={(e) => e.stopPropagation()}
				onclick={remove}
				{@attach ripple({ centered: true })}
			>
				<Icon name="close" size={18} />
			</button>
		{/if}
	</span>
{:else if href && !disabled}
	<a
		bind:this={ref}
		{href}
		{...rootAttrs}
		class={cn("m3-chip", className)}
		{...restProps as HTMLAnchorAttributes}
		{@attach ripple()}
	>
		{@render content()}
	</a>
{:else}
	<button
		bind:this={ref}
		type="button"
		{disabled}
		{...rootAttrs}
		class={cn("m3-chip", className)}
		{...restProps as HTMLButtonAttributes}
		{@attach ripple()}
	>
		{@render content()}
	</button>
{/if}

<style>
	.m3-chip {
		--_container: transparent;
		--_outline: var(--md-sys-color-outline);
		--_label: var(--md-sys-color-on-surface-variant);
		--_leading: var(--md-sys-color-primary);
		--_trailing: var(--md-sys-color-on-surface-variant);
		--_layer: var(--_label);
		--_elevation: var(--md-sys-elevation-level0);
		--_radius: var(--md-sys-shape-corner-small);
		--_spatial: var(--md-sys-motion-spring-fast-spatial-duration)
			var(--md-sys-motion-spring-fast-spatial-easing);
		--_effects: var(--md-sys-motion-spring-default-effects-duration)
			var(--md-sys-motion-spring-default-effects-easing);
		--m3-ripple-color: var(--_layer);

		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		box-sizing: border-box;
		height: 32px;
		padding-inline: 16px;
		border-radius: var(--_radius);
		background-color: var(--_container);
		/* 1dp outline drawn inside so the 16 / 8dp paddings are measured from the edge */
		box-shadow:
			inset 0 0 0 1px var(--_outline),
			var(--_elevation);
		color: var(--_label);
		font-family: var(--md-sys-typescale-label-large-font);
		font-size: var(--md-sys-typescale-label-large-size);
		line-height: var(--md-sys-typescale-label-large-line-height);
		letter-spacing: var(--md-sys-typescale-label-large-tracking);
		font-weight: var(--md-sys-typescale-label-large-weight);
		white-space: nowrap;
		text-decoration: none;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		transition:
			padding var(--_spatial),
			border-radius var(--_spatial),
			background-color var(--_effects),
			color var(--_effects),
			box-shadow var(--_effects);
	}
	.m3-chip[data-leading] {
		padding-inline-start: 8px;
	}
	.m3-chip[data-avatar] {
		padding-inline-start: 4px;
	}
	.m3-chip[data-trailing] {
		padding-inline-end: 8px;
	}

	/* ---- variants ---- */
	.m3-chip[data-variant="assist"] {
		--_label: var(--md-sys-color-on-surface);
	}
	.m3-chip:is([data-variant="filter"], [data-variant="input"]) {
		--_outline: var(--md-sys-color-outline-variant);
	}
	.m3-chip:is([data-variant="filter"], [data-variant="input"]):is(
			:focus-visible,
			:has(.primary:focus-visible),
			[data-preview="focus"]
		) {
		--_outline: var(--md-sys-color-on-surface-variant);
	}
	.m3-chip[data-variant="input"] {
		--_leading: var(--md-sys-color-on-surface-variant);
	}
	.m3-chip[data-variant="input"]:is(:hover, :has(.primary:focus-visible), :active, [data-preview]) {
		--_leading: var(--md-sys-color-primary);
	}
	/* pressed state layer previews the next state */
	.m3-chip[data-variant="filter"]:is(:active, [data-preview="pressed"]) {
		--_layer: var(--md-sys-color-on-secondary-container);
	}

	.m3-chip[data-elevated] {
		--_container: var(--md-sys-color-surface-container-low);
		--_outline: transparent;
		--_elevation: var(--md-sys-elevation-level1);
	}
	.m3-chip[data-elevated]:is(:hover, [data-preview="hover"]):not(:disabled, [data-disabled]) {
		--_elevation: var(--md-sys-elevation-level2);
	}
	.m3-chip[data-elevated]:is(:focus-visible, :active, [data-preview="focus"], [data-preview="pressed"]) {
		--_elevation: var(--md-sys-elevation-level1);
	}

	.m3-chip[data-selected] {
		--_container: var(--md-sys-color-secondary-container);
		--_outline: transparent;
		--_label: var(--md-sys-color-on-secondary-container);
		--_leading: var(--md-sys-color-on-secondary-container);
		--_trailing: var(--md-sys-color-on-secondary-container);
	}
	.m3-chip[data-selected][data-variant="input"] {
		--_leading: var(--md-sys-color-primary);
	}
	.m3-chip[data-selected]:not([data-elevated], :disabled, [data-disabled]):is(:hover, [data-preview="hover"]) {
		--_elevation: var(--md-sys-elevation-level1);
	}
	.m3-chip[data-selected][data-variant="filter"]:is(:active, [data-preview="pressed"]) {
		--_layer: var(--md-sys-color-on-surface-variant);
	}

	/* ---- Expressive shape morph (opt-in): 12dp → full (16dp at 32dp tall) when selected → 8dp pressed ---- */
	.m3-chip[data-morph] {
		--_radius: var(--md-sys-shape-corner-medium);
	}
	.m3-chip[data-morph][data-selected] {
		--_radius: var(--md-sys-shape-corner-large);
	}
	.m3-chip[data-morph]:is(:active, [data-preview="pressed"]) {
		--_radius: var(--md-sys-shape-corner-small);
	}

	/* ---- disabled ---- */
	.m3-chip:is(:disabled, [data-disabled]) {
		--_label: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-content-opacity) * 100%),
			transparent
		);
		--_leading: var(--_label);
		--_trailing: var(--_label);
		--_outline: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-container-opacity) * 100%),
			transparent
		);
		--_elevation: var(--md-sys-elevation-level0);
		cursor: default;
	}
	.m3-chip:is([data-elevated], [data-selected]):is(:disabled, [data-disabled]) {
		--_container: color-mix(
			in srgb,
			var(--md-sys-color-on-surface) calc(var(--md-sys-state-disabled-container-opacity) * 100%),
			transparent
		);
		--_outline: transparent;
	}

	/* ---- parts ---- */
	.label {
		position: relative;
	}
	.leading,
	.trailing,
	.avatar {
		position: relative;
		display: grid;
		flex-shrink: 0;
		place-items: center;
	}
	.leading {
		width: 18px;
		height: 18px;
		margin-inline-end: 8px;
		color: var(--_leading);
		transition:
			width var(--_spatial),
			margin var(--_spatial),
			color var(--_effects);
	}
	.leading[data-collapsible] {
		width: 0;
		margin-inline-end: 0;
	}
	.m3-chip[data-selected] .leading[data-collapsible] {
		width: 18px;
		margin-inline-end: 8px;
	}
	.leading-icon {
		grid-area: 1 / 1;
		display: grid;
		opacity: 0;
		scale: 0.6;
		/* shrink / fade out: fast-effects */
		transition:
			opacity var(--md-sys-motion-spring-fast-effects-duration)
				var(--md-sys-motion-spring-fast-effects-easing),
			scale var(--_spatial);
	}
	.leading-icon[data-visible] {
		opacity: 1;
		scale: 1;
		/* expand / fade in: default-effects */
		transition:
			opacity var(--_effects),
			scale var(--_spatial);
	}
	.trailing {
		width: 18px;
		height: 18px;
		margin-inline-start: 8px;
		color: var(--_trailing);
	}
	.avatar {
		width: 24px;
		height: 24px;
		margin-inline-end: 8px;
		overflow: hidden;
		border-radius: var(--md-sys-shape-corner-full);
	}
	.avatar > :global(*) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* input chip: the primary action covers the whole chip; remove sits above it */
	.primary {
		display: inline-flex;
		align-items: center;
		height: 100%;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		letter-spacing: inherit;
		cursor: inherit;
		outline: none;
	}
	.primary::after {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}
	.m3-chip:has(.primary:focus-visible) {
		outline: 3px solid var(--md-sys-color-secondary);
		outline-offset: 2px;
	}
	.remove {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		margin: -3px -3px -3px 5px; /* 18dp icon, 8dp after the label, 8dp end padding */
		padding: 0;
		border: 0;
		border-radius: var(--md-sys-shape-corner-full);
		background: none;
		color: var(--_trailing);
		cursor: pointer;
	}
	/* ≥ 48dp touch target */
	.remove::after {
		content: "";
		position: absolute;
		inset: -12px;
	}
	.remove:disabled {
		cursor: default;
	}
</style>
