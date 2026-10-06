<script lang="ts" module>
	import type { DateValue } from "@internationalized/date";

	export type DatePickerProps = {
		value?: DateValue;
		open?: boolean;
		/** Floating label (always floated: the field shows mm/dd/yyyy segments). */
		label?: string;
		supportingText?: string;
		error?: boolean;
		errorText?: string;
		disabled?: boolean;
		minValue?: DateValue;
		maxValue?: DateValue;
		isDateUnavailable?: (date: DateValue) => boolean;
		locale?: string;
		class?: string;
		onValueChange?: (value: DateValue | undefined) => void;
	};
</script>

<script lang="ts">
	import { DatePicker as DatePickerPrimitive } from "bits-ui";
	import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	/**
	 * M3 docked date picker (inputs-selection.md §9): an outlined date field (56dp) whose trailing
	 * calendar button opens a 360 × 456dp card — corner large 16dp, surface-container-high, level 3,
	 * 64dp header with month / year steppers, 48dp day cells with a 40dp full-round indicator
	 * (selected = primary / on-primary, today = 1dp primary outline), Cancel / OK actions.
	 */
	let {
		value = $bindable(),
		open = $bindable(false),
		label = "Date",
		supportingText = "MM/DD/YYYY",
		error = false,
		errorText,
		disabled = false,
		minValue,
		maxValue,
		isDateUnavailable,
		locale = "en-US",
		class: className,
		onValueChange,
	}: DatePickerProps = $props();

	const uid = $props.id();
	let placeholder = $state<DateValue>(today(getLocalTimeZone()));
	let labelWidth = $state(0);
	let field = $state<HTMLElement | null>(null);
	let content = $state<HTMLElement | null>(null);

	/** Focus the selected (or today's) day without scrolling the page while the card is being positioned. */
	function focusDay(e: Event) {
		e.preventDefault();
		setTimeout(() => {
			const day =
				content?.querySelector<HTMLElement>("[data-bits-day][data-selected]") ??
				content?.querySelector<HTMLElement>("[data-bits-day][data-today]") ??
				content?.querySelector<HTMLElement>("[data-bits-day]:not([data-outside-month])");
			day?.focus({ preventScroll: true });
		});
	}
	let valueOnOpen: DateValue | undefined;

	const monthFmt = $derived(new DateFormatter(locale, { month: "short" }));
	const monthLabel = $derived(monthFmt.format(placeholder.toDate(getLocalTimeZone())));

	function onOpenChange(next: boolean) {
		if (next) {
			valueOnOpen = value;
			if (value) placeholder = value;
		}
	}
	function cancel() {
		value = valueOnOpen;
		onValueChange?.(value);
		open = false;
	}
	function confirm() {
		open = false;
	}
	function shiftYear(delta: number) {
		placeholder = placeholder.add({ years: delta });
	}

	let focused = $state(false);
	const active = $derived(focused || open);
	const outlineColor = $derived(
		disabled
			? "text-on-surface/12"
			: error
				? active
					? "text-error"
					: "text-error group-hover/date-field:text-on-error-container"
				: active
					? "text-m3-primary"
					: "text-outline group-hover/date-field:text-on-surface"
	);
	const labelColor = $derived(
		disabled ? "text-on-surface/38" : error ? "text-error" : active ? "text-m3-primary" : "text-on-surface-variant"
	);

	const supporting = $derived(error && errorText ? errorText : supportingText);

	const stepper =
		"relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-m3-full text-on-surface-variant disabled:pointer-events-none disabled:opacity-(--md-sys-state-disabled-content-opacity)";
</script>

<div data-slot="date-picker" class={cn("inline-flex w-70 max-w-full flex-col", className)}>
	<DatePickerPrimitive.Root
		bind:value
		bind:open
		bind:placeholder
		{onOpenChange}
		{onValueChange}
		{disabled}
		{minValue}
		{maxValue}
		{isDateUnavailable}
		{locale}
		closeOnDateSelect={false}
		weekdayFormat="narrow"
		fixedWeeks
	>
		<div
			class={cn(
				"group/date-field relative flex h-14 items-center gap-4 ps-4 pe-3",
				disabled ? "text-on-surface/38" : "text-on-surface"
			)}
			data-invalid={error || undefined}
			bind:this={field}
			onfocusin={() => (focused = true)}
			onfocusout={() => (focused = false)}
		>
			<!-- outline with a notch for the (always floated) label -->
			<span
				aria-hidden="true"
				class={cn("dp-outline pointer-events-none absolute inset-0 flex", outlineColor)}
				style:--dp-ow={active && !disabled ? "2px" : "1px"}
			>
				<span class="dp-seg-start"></span>
				<span class="dp-seg-notch" style:width="{labelWidth + 8}px"></span>
				<span class="dp-seg-end"></span>
			</span>
			<DatePickerPrimitive.Label
				class={cn(
					"type-body-sm pointer-events-none absolute start-4 top-0 -translate-y-1/2 whitespace-nowrap select-none",
					labelColor
				)}
			>
				<span bind:offsetWidth={labelWidth}>{label}</span>
			</DatePickerPrimitive.Label>
			<DatePickerPrimitive.Input
				id="date-picker-{uid}"
				class="type-body-lg relative flex min-w-0 flex-1 items-center"
				aria-invalid={error || undefined}
			>
				{#snippet children({ segments })}
					{#each segments as { part, value: segmentValue }, i (i)}
						<DatePickerPrimitive.Segment
							{part}
							class={cn(
								"rounded-m3-xs tabular-nums outline-none",
								part === "literal"
									? "px-px text-on-surface-variant"
									: "px-0.5 focus:bg-primary-container focus:text-on-primary-container data-placeholder:text-on-surface-variant"
							)}
						>
							{segmentValue}
						</DatePickerPrimitive.Segment>
					{/each}
				{/snippet}
			</DatePickerPrimitive.Input>
			<DatePickerPrimitive.Trigger
				class={cn(
					"relative -m-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-m3-full after:absolute after:-inset-1 after:content-['']",
					disabled ? "text-on-surface/38" : error ? "text-error" : "text-on-surface-variant"
				)}
				aria-label="Choose date"
				{@attach ripple()}
			>
				<Icon name="calendar_today" />
			</DatePickerPrimitive.Trigger>
		</div>

		<DatePickerPrimitive.Portal>
			<DatePickerPrimitive.Content
				sideOffset={4}
				align="start"
				customAnchor={field}
				bind:ref={content}
				onOpenAutoFocus={focusDay}
				class="m3-menu-surface z-50 flex w-90 flex-col overflow-hidden rounded-m3-lg bg-surface-container-high text-on-surface shadow-m3-3 outline-none origin-(--bits-popover-content-transform-origin)"
			>
				<DatePickerPrimitive.Calendar class="flex flex-col">
					{#snippet children({ months, weekdays })}
						<!-- 64dp header: month and year steppers -->
						<DatePickerPrimitive.Header class="flex h-16 items-center justify-between px-3">
							<div class="flex items-center">
								<DatePickerPrimitive.PrevButton class={stepper} aria-label="Previous month" {@attach ripple()}>
									<Icon name="chevron_left" />
								</DatePickerPrimitive.PrevButton>
								<span class="type-label-lg w-10 text-center text-on-surface-variant">{monthLabel}</span>
								<DatePickerPrimitive.NextButton class={stepper} aria-label="Next month" {@attach ripple()}>
									<Icon name="chevron_right" />
								</DatePickerPrimitive.NextButton>
							</div>
							<DatePickerPrimitive.Heading class="sr-only" />
							<div class="flex items-center">
								<button type="button" class={stepper} aria-label="Previous year" onclick={() => shiftYear(-1)} {@attach ripple()}>
									<Icon name="chevron_left" />
								</button>
								<span class="type-label-lg w-10 text-center text-on-surface-variant">{placeholder.year}</span>
								<button type="button" class={stepper} aria-label="Next year" onclick={() => shiftYear(1)} {@attach ripple()}>
									<Icon name="chevron_right" />
								</button>
							</div>
						</DatePickerPrimitive.Header>

						{#each months as month (month.value.toString())}
							<DatePickerPrimitive.Grid class="mx-3 w-[calc(100%-24px)] border-collapse select-none">
								<DatePickerPrimitive.GridHead>
									<DatePickerPrimitive.GridRow class="flex">
										{#each weekdays as day, i (i)}
											<DatePickerPrimitive.HeadCell
												class="type-body-lg flex h-12 flex-1 items-center justify-center text-on-surface"
											>
												{day}
											</DatePickerPrimitive.HeadCell>
										{/each}
									</DatePickerPrimitive.GridRow>
								</DatePickerPrimitive.GridHead>
								<DatePickerPrimitive.GridBody>
									{#each month.weeks as week (week.map((d) => d.toString()).join())}
										<DatePickerPrimitive.GridRow class="flex">
											{#each week as date (date.toString())}
												<DatePickerPrimitive.Cell
													{date}
													month={month.value}
													class="flex h-12 flex-1 items-center justify-center p-0"
												>
													<DatePickerPrimitive.Day
														class={cn(
															"type-body-lg relative grid size-10 cursor-pointer place-items-center rounded-m3-full text-on-surface outline-none",
															"transition-colors duration-spring-fast-effects ease-spring-fast-effects",
															"focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-m3-secondary",
															"data-today:shadow-[inset_0_0_0_1px_var(--md-sys-color-primary)] data-today:text-m3-primary",
															"data-selected:bg-m3-primary data-selected:text-on-primary data-selected:shadow-none",
															"data-outside-month:pointer-events-none data-outside-month:invisible",
															"data-disabled:pointer-events-none data-disabled:text-on-surface/38 data-unavailable:text-on-surface/38 data-unavailable:line-through"
														)}
														{@attach ripple()}
													/>
												</DatePickerPrimitive.Cell>
											{/each}
										</DatePickerPrimitive.GridRow>
									{/each}
								</DatePickerPrimitive.GridBody>
							</DatePickerPrimitive.Grid>
						{/each}
					{/snippet}
				</DatePickerPrimitive.Calendar>

				<!-- 56dp actions row -->
				<div class="flex h-14 items-center justify-end gap-2 px-3">
					<button
						type="button"
						class="type-label-lg relative h-10 cursor-pointer rounded-m3-full px-3 text-m3-primary"
						onclick={cancel}
						{@attach ripple()}>Cancel</button
					>
					<button
						type="button"
						class="type-label-lg relative h-10 cursor-pointer rounded-m3-full px-3 text-m3-primary"
						onclick={confirm}
						{@attach ripple()}>OK</button
					>
				</div>
			</DatePickerPrimitive.Content>
		</DatePickerPrimitive.Portal>
	</DatePickerPrimitive.Root>

	{#if supporting}
		<p
			class={cn(
				"type-body-sm px-4 pt-1",
				disabled ? "text-on-surface/38" : error ? "text-error" : "text-on-surface-variant"
			)}
		>
			{supporting}
		</p>
	{/if}
</div>

<style>
	.dp-outline {
		transition: color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}
	.dp-outline > span {
		border-color: currentColor;
		border-style: solid;
		transition: border-width var(--md-sys-motion-spring-fast-spatial-duration)
			var(--md-sys-motion-spring-fast-spatial-easing);
	}
	.dp-seg-start {
		width: 12px;
		flex-shrink: 0;
		border-width: var(--dp-ow) 0 var(--dp-ow) var(--dp-ow);
		border-start-start-radius: var(--md-sys-shape-corner-extra-small);
		border-end-start-radius: var(--md-sys-shape-corner-extra-small);
	}
	.dp-seg-notch {
		flex-shrink: 0;
		border-width: 0 0 var(--dp-ow) 0;
	}
	.dp-seg-end {
		flex: 1 1 auto;
		border-width: var(--dp-ow) var(--dp-ow) var(--dp-ow) 0;
		border-start-end-radius: var(--md-sys-shape-corner-extra-small);
		border-end-end-radius: var(--md-sys-shape-corner-extra-small);
	}
</style>
