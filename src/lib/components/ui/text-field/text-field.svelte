<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from "svelte/elements";

	export type TextFieldVariant = "filled" | "outlined";

	type NativeAttrs = Omit<
		HTMLInputAttributes & HTMLTextareaAttributes,
		"value" | "prefix" | "children" | "class" | "type" | "size"
	>;

	export type TextFieldProps = NativeAttrs & {
		/** The native `<input>` / `<textarea>` element. */
		ref?: HTMLInputElement | HTMLTextAreaElement | null;
		value?: string | number | null;
		/** `filled` (default) or `outlined`. */
		variant?: TextFieldVariant;
		/** Floating label. Rests at body-large 16/24, floats to body-small 12/16 when focused or populated. */
		label?: string;
		/** Helper text under the field (body-small). Replaced by `errorText` while `error` is set. */
		supportingText?: string;
		error?: boolean;
		errorText?: string;
		/** Material Symbols name for a 24dp leading icon. */
		leadingIcon?: string;
		/** Material Symbols name for a 24dp trailing icon. Becomes an icon button when `ontrailingclick` is set. */
		trailingIcon?: string;
		/** Accessible name of the trailing icon button. */
		trailingIconLabel?: string;
		ontrailingclick?: (event: MouseEvent) => void;
		/** Accessible name of the leading icon button (when `onleadingclick` is set). */
		leadingIconLabel?: string;
		onleadingclick?: (event: MouseEvent) => void;
		/** Custom leading / trailing content (replaces the icon props). */
		leading?: Snippet;
		trailing?: Snippet;
		/** Short text shown before / after the input once the label has floated (e.g. "$", "kg"). */
		prefix?: string;
		suffix?: string;
		/** Enables the `current / max` character counter. */
		maxlength?: number;
		/** Render an auto-growing `<textarea>`. */
		multiline?: boolean;
		/** Minimum visible rows when `multiline`. */
		rows?: number;
		type?: HTMLInputAttributes["type"];
		class?: string;
		/** Extra classes for the native control. */
		inputClass?: string;
	};

	/** Types whose native UI always shows content, so the label must stay floated. */
	const ALWAYS_FLOATED = new Set(["date", "time", "datetime-local", "month", "week", "color", "file"]);
</script>

<script lang="ts">
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	let {
		ref = $bindable(null),
		value = $bindable(""),
		variant = "filled",
		label,
		supportingText,
		error = false,
		errorText,
		leadingIcon,
		trailingIcon,
		trailingIconLabel,
		ontrailingclick,
		leadingIconLabel,
		onleadingclick,
		leading,
		trailing,
		prefix,
		suffix,
		maxlength,
		multiline = false,
		rows = 1,
		type = "text",
		id: idProp,
		disabled = false,
		readonly = false,
		required = false,
		placeholder,
		class: className,
		inputClass,
		onfocus,
		onblur,
		...restProps
	}: TextFieldProps = $props();

	const uid = $props.id();
	const id = $derived(idProp ?? `text-field-${uid}`);
	const supportingId = $derived(`${id}-supporting`);

	let focused = $state(false);
	/** Browser autofill paints a value before any `input` event reaches `bind:value` (detected via `animationstart`). */
	let autofilled = $state(false);

	const outlined = $derived(variant === "outlined");
	const length = $derived(value == null ? 0 : String(value).length);
	const populated = $derived(length > 0 || autofilled || ALWAYS_FLOATED.has(String(type)));
	const floated = $derived(!!label && (focused || populated));
	const hasLeading = $derived(!!(leading || leadingIcon));
	const showErrorIcon = $derived(error && !trailing && !trailingIcon);
	const hasTrailing = $derived(!!(trailing || trailingIcon) || showErrorIcon);
	const supporting = $derived(error && errorText ? errorText : supportingText);
	const hasSupportingRow = $derived(!!supporting || maxlength != null);
	/** Prefix/suffix are hidden while the label rests on top of the input. */
	const affixVisible = $derived(!label || floated);

	// Label float geometry (docs/research/inputs-selection.md §5.1–5.2):
	// resting label center = 28dp (container middle); floated label center = 16dp (filled: 8 top + 16/2)
	// or 0 (outlined: on the outline). Scale 12/16 = 0.75 from the leading edge.
	// Outlined + leading icon: the floated label moves to the 16dp start padding (12 + 24 + 16 → 16).
	// `--tf-dir` is -1 in RTL so the inline shift mirrors.
	const labelTranslate = $derived.by(() => {
		if (!floated) return "0px 0px";
		if (!outlined) return "0px -12px";
		return hasLeading ? "calc(-36px * var(--tf-dir)) -28px" : "0px -28px";
	});

	// ---- state colors (§5.3 filled / §5.4 outlined) ------------------------------------------------
	const labelColor = $derived(
		disabled
			? "text-on-surface/38"
			: error
				? focused
					? "text-error"
					: "text-error group-hover/tf:text-on-error-container"
				: focused
					? "text-m3-primary"
					: outlined
						? "text-on-surface-variant group-hover/tf:text-on-surface"
						: "text-on-surface-variant"
	);
	const indicatorColor = $derived(
		disabled
			? "bg-on-surface/38"
			: error
				? focused
					? "bg-error"
					: "bg-error group-hover/tf:bg-on-error-container"
				: focused
					? "bg-m3-primary"
					: "bg-on-surface-variant group-hover/tf:bg-on-surface"
	);
	const outlineColor = $derived(
		disabled
			? "text-on-surface/12"
			: error
				? focused
					? "text-error"
					: "text-error group-hover/tf:text-on-error-container"
				: focused
					? "text-m3-primary"
					: "text-outline group-hover/tf:text-on-surface"
	);
	const iconColor = $derived(disabled ? "text-on-surface/38" : "text-on-surface-variant");
	const trailingColor = $derived(
		disabled
			? "text-on-surface/38"
			: error
				? focused
					? "text-error"
					: "text-error group-hover/tf:text-on-error-container"
				: "text-on-surface-variant"
	);
	const supportingColor = $derived(
		disabled ? "text-on-surface/38" : error ? "text-error" : "text-on-surface-variant"
	);

	const controlClass = $derived(
		cn(
			"type-body-lg block w-full min-w-0 bg-transparent outline-none",
			disabled ? "text-on-surface/38" : "text-on-surface",
			error ? "caret-error" : "caret-m3-primary",
			"placeholder:text-on-surface-variant placeholder:transition-opacity placeholder:duration-spring-fast-effects placeholder:ease-spring-fast-effects",
			label && !focused && "placeholder:opacity-0",
			// keep the field's own text color when the browser autofills it (see the autofill rules below)
			"[-webkit-text-fill-color:currentColor]",
			// filled + label: 8 top + 16 label line → input line starts at 24dp, 8dp bottom
			!outlined && label ? "pt-6 pb-2" : "py-4",
			multiline && "resize-none overflow-hidden",
			inputClass
		)
	);

	type FocusHandler = ((e: FocusEvent) => void) | null | undefined;

	function handleFocus(e: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		focused = true;
		(onfocus as FocusHandler)?.(e);
	}
	function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLElement }) {
		focused = false;
		(onblur as FocusHandler)?.(e);
	}

	/** Clicking anywhere on the container (label, icons, prefix) focuses the control. */
	function focusControl(e: MouseEvent) {
		if (disabled || e.button !== 0) return;
		const target = e.target as HTMLElement;
		if (target === ref || target.closest("button, a, input, textarea, select, [role='button']")) return;
		e.preventDefault();
		ref?.focus();
	}

	function handleAnimationStart(e: AnimationEvent) {
		if (e.animationName === "m3-tf-autofill-start") autofilled = true;
		else if (e.animationName === "m3-tf-autofill-end") autofilled = false;
	}

	/** Auto-grow: re-runs whenever `value` changes, and re-fits when the width changes (re-wrapping). */
	function autosize(el: HTMLTextAreaElement) {
		void value;
		const fit = () => {
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		};
		fit();
		let width = el.clientWidth;
		const ro = new ResizeObserver(() => {
			if (el.clientWidth === width) return;
			width = el.clientWidth;
			fit();
		});
		ro.observe(el);
		return () => ro.disconnect();
	}
</script>

{#snippet iconSlot(name: string, onclick: ((e: MouseEvent) => void) | undefined, aria: string | undefined, color: string)}
	{#if onclick}
		<button
			type="button"
			class={cn(
				"relative -m-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-m3-full",
				"after:absolute after:-inset-1 after:content-['']",
				color
			)}
			aria-label={aria ?? name}
			{disabled}
			{onclick}
			{@attach ripple()}
		>
			<Icon {name} />
		</button>
	{:else}
		<Icon {name} class={cn("shrink-0", color)} />
	{/if}
{/snippet}

<div
	data-slot="text-field"
	data-variant={variant}
	data-focused={focused || undefined}
	data-populated={populated || undefined}
	data-invalid={error || undefined}
	data-disabled={disabled || undefined}
	class={cn("inline-flex w-70 max-w-full min-w-0 flex-col text-start [--tf-dir:1] rtl:[--tf-dir:-1]", className)}
>
	<!-- Pointer convenience only: the control itself is the keyboard target. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		data-slot="text-field-container"
		class={cn(
			"group/tf relative flex gap-4",
			multiline ? "min-h-14 items-stretch" : "h-14 items-center",
			hasLeading ? "ps-3" : "ps-4",
			hasTrailing ? "pe-3" : "pe-4",
			outlined
				? "rounded-m3-xs"
				: cn("rounded-t-m3-xs", disabled ? "bg-on-surface/4" : "bg-surface-container-highest"),
			disabled ? "cursor-default" : "cursor-text"
		)}
		onmousedown={focusControl}
	>
		{#if !outlined}
			<!-- hover state layer (on-surface @ 8%) -->
			{#if !disabled}
				<span
					aria-hidden="true"
					class="pointer-events-none absolute inset-0 rounded-[inherit] bg-on-surface opacity-0 transition-opacity duration-spring-fast-effects ease-spring-fast-effects group-hover/tf:opacity-(--md-sys-state-hover-opacity)"
				></span>
			{/if}
			<!-- active indicator: 1dp → 2dp focused -->
			<span
				aria-hidden="true"
				data-slot="text-field-indicator"
				class={cn("tf-indicator pointer-events-none absolute inset-x-0 bottom-0", indicatorColor)}
				style:height={focused && !disabled ? "2px" : "1px"}
			></span>
		{:else}
			<span
				aria-hidden="true"
				data-slot="text-field-outline"
				class={cn("tf-outline pointer-events-none absolute inset-0 flex", outlineColor)}
				style:--tf-ow={focused && !disabled ? "2px" : "1px"}
			>
				<span class="tf-outline-start"></span>
				{#if label}
					<!-- Notch = floated label (12px; body-large tracking × 0.75) + 4dp each side. Sized by an invisible
					     copy of the label, so it is right from the first (server-rendered) paint. -->
					<span class="tf-outline-notch">
						<span class="tf-notch-text">{label}{#if required}&nbsp;*{/if}</span>
						<span class="tf-notch-top start-0 origin-left rtl:origin-right" data-open={floated || undefined}></span>
						<span class="tf-notch-top end-0 origin-right rtl:origin-left" data-open={floated || undefined}></span>
					</span>
				{/if}
				<span class="tf-outline-end"></span>
			</span>
		{/if}

		{#if leading}
			<div class={cn("relative flex shrink-0 items-center", iconColor)}>{@render leading()}</div>
		{:else if leadingIcon}
			<div class="relative flex shrink-0 items-center">
				{@render iconSlot(leadingIcon, onleadingclick, leadingIconLabel, iconColor)}
			</div>
		{/if}

		<div class={cn("relative flex min-w-0 flex-1", multiline ? "items-start" : "items-stretch self-stretch")}>
			{#if label}
				<label
					for={id}
					class={cn(
						"tf-label type-body-lg pointer-events-none absolute start-0 top-4 origin-[0_50%] whitespace-nowrap select-none rtl:origin-[100%_50%]",
						labelColor
					)}
					style:translate={labelTranslate}
					style:scale={floated ? 0.75 : 1}
				>
					{label}{#if required}<span aria-hidden="true">&nbsp;*</span>{/if}
				</label>
			{/if}

			{#if prefix}
				<span
					class={cn(
						"type-body-lg shrink-0 pe-0.5 whitespace-nowrap transition-opacity duration-spring-fast-effects ease-spring-fast-effects select-none",
						!outlined && label ? "pt-6 pb-2" : "py-4",
						disabled ? "text-on-surface/38" : "text-on-surface-variant",
						affixVisible ? "opacity-100" : "opacity-0"
					)}
				>
					{prefix}
				</span>
			{/if}

			{#if multiline}
				<textarea
					bind:this={ref}
					bind:value
					{id}
					{rows}
					{disabled}
					{readonly}
					{required}
					{placeholder}
					{maxlength}
					data-slot="text-field-input"
					aria-invalid={error || undefined}
					aria-describedby={hasSupportingRow ? supportingId : undefined}
					class={controlClass}
					onfocus={handleFocus}
					onblur={handleBlur}
					onanimationstart={handleAnimationStart}
					{@attach autosize}
					{...restProps as HTMLTextareaAttributes}
				></textarea>
			{:else}
				<input
					bind:this={ref}
					bind:value
					{id}
					{type}
					{disabled}
					{readonly}
					{required}
					{placeholder}
					{maxlength}
					data-slot="text-field-input"
					aria-invalid={error || undefined}
					aria-describedby={hasSupportingRow ? supportingId : undefined}
					class={controlClass}
					onfocus={handleFocus}
					onblur={handleBlur}
					onanimationstart={handleAnimationStart}
					{...restProps as HTMLInputAttributes}
				/>
			{/if}

			{#if suffix}
				<span
					class={cn(
						"type-body-lg shrink-0 ps-0.5 whitespace-nowrap transition-opacity duration-spring-fast-effects ease-spring-fast-effects select-none",
						!outlined && label ? "pt-6 pb-2" : "py-4",
						disabled ? "text-on-surface/38" : "text-on-surface-variant",
						affixVisible ? "opacity-100" : "opacity-0"
					)}
				>
					{suffix}
				</span>
			{/if}
		</div>

		{#if trailing}
			<div class={cn("relative flex shrink-0 items-center", trailingColor)}>{@render trailing()}</div>
		{:else if trailingIcon}
			<div class="relative flex shrink-0 items-center">
				{@render iconSlot(trailingIcon, ontrailingclick, trailingIconLabel, trailingColor)}
			</div>
		{:else if showErrorIcon}
			<div class="relative flex shrink-0 items-center">
				<Icon name="error" fill class={cn("shrink-0", trailingColor)} />
			</div>
		{/if}
	</div>

	{#if hasSupportingRow}
		<div
			id={supportingId}
			data-slot="text-field-supporting"
			class={cn("type-body-sm flex gap-4 px-4 pt-1", supportingColor)}
		>
			<span class="min-w-0 flex-1" aria-live={error ? "polite" : undefined}>{supporting ?? ""}</span>
			{#if maxlength != null}
				<span class="shrink-0 tabular-nums">{length} / {maxlength}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Label float: FastSpatial for position/size, FastEffects for color (inputs-selection.md §5.5). */
	.tf-label {
		transition:
			translate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			scale var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}
	/* Indicator / outline thickness: FastSpatial; color: FastEffects. */
	.tf-indicator {
		transition:
			height var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			background-color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}
	.tf-outline {
		transition: color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}
	.tf-outline > span {
		border-color: currentColor;
		border-style: solid;
		transition: border-width var(--md-sys-motion-spring-fast-spatial-duration)
			var(--md-sys-motion-spring-fast-spatial-easing);
	}
	/* 12dp start segment: the floated label sits 4dp further in (16dp). */
	/* Logical border sides so the outline and its notch mirror in RTL. */
	.tf-outline-start {
		width: 12px;
		flex-shrink: 0;
		border-width: 0;
		border-block-width: var(--tf-ow);
		border-inline-start-width: var(--tf-ow);
		border-start-start-radius: var(--md-sys-shape-corner-extra-small);
		border-end-start-radius: var(--md-sys-shape-corner-extra-small);
	}
	.tf-outline-notch {
		position: relative;
		flex-shrink: 0;
		max-width: calc(100% - 24px);
		overflow: hidden;
		border-width: 0;
		border-block-end-width: var(--tf-ow);
	}
	.tf-notch-text {
		display: block;
		visibility: hidden;
		height: 0;
		padding-inline: 4px;
		font-family: var(--md-ref-typeface-plain);
		font-size: 12px;
		letter-spacing: 0.375px;
		white-space: nowrap;
	}
	.tf-outline-end {
		flex: 1 1 auto;
		border-width: 0;
		border-block-width: var(--tf-ow);
		border-inline-end-width: var(--tf-ow);
		border-start-end-radius: var(--md-sys-shape-corner-extra-small);
		border-end-end-radius: var(--md-sys-shape-corner-extra-small);
	}
	/* The notch's top edge is two halves that retract outward when the label floats. */
	/* Drawn as a border (pixel-snapped like the other segments); the halves overlap by 1px so no seam shows. */
	.tf-notch-top {
		position: absolute;
		top: 0;
		width: calc(50% + 0.5px);
		height: 0;
		border-top: var(--tf-ow) solid currentColor;
		transition:
			scale var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
			border-width var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing);
	}
	.tf-notch-top[data-open] {
		scale: 0 1;
	}

	/* Autofill: keep the M3 container (the UA background is !important; a transition that never starts
	   outranks it in the cascade) and report the state to JS so the label floats over the filled value. */
	:global([data-slot="text-field-input"]:autofill) {
		transition:
			background-color 0s 600000s,
			color 0s 600000s;
		animation: m3-tf-autofill-start 1ms;
	}
	:global([data-slot="text-field-input"]:-webkit-autofill) {
		transition:
			background-color 0s 600000s,
			color 0s 600000s;
		animation: m3-tf-autofill-start 1ms;
	}
	:global([data-slot="text-field-input"]:not(:autofill)) {
		animation: m3-tf-autofill-end 1ms;
	}
	@keyframes -global-m3-tf-autofill-start {
		from {
			opacity: 1;
		}
	}
	@keyframes -global-m3-tf-autofill-end {
		from {
			opacity: 1;
		}
	}
</style>
