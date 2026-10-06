<script lang="ts">
	import { Page, Section, Demo } from "#lib/components/showcase/index.js";
	import { Checkbox } from "#lib/components/ui/checkbox/index.js";
	import * as RadioGroup from "#lib/components/ui/radio-group/index.js";
	import { Switch } from "#lib/components/ui/switch/index.js";
	import { Slider, SLIDER_SIZES, type SliderSize } from "#lib/components/ui/slider/index.js";
	import { Chip, ChipSet } from "#lib/components/ui/chip/index.js";
	import * as Field from "#lib/components/ui/field/index.js";
	import * as Avatar from "#lib/components/ui/avatar/index.js";
	import type { Attachment } from "svelte/attachments";

	// ---------------------------------------------------------------- static state previews
	// Each control in a "States" grid gets `data-preview="hover|focus|pressed"`: the components style
	// that like the real pseudo-class, and this attachment lights the matching state layer on the
	// control's ripple overlay (pressed = the flat 10% layer). The grids are `inert`.
	type PreviewState = "hover" | "focus" | "pressed";
	const STATES: { label: string; preview?: PreviewState; disabled?: boolean }[] = [
		{ label: "Enabled" },
		{ label: "Hover", preview: "hover" },
		{ label: "Focus", preview: "focus" },
		{ label: "Pressed", preview: "pressed" },
		{ label: "Disabled", disabled: true },
	];
	const SLIDER_STATES = STATES.filter((st) => st.preview !== "hover");
	const previewStates: Attachment<HTMLElement> = (node) => {
		const apply = () => {
			for (const el of node.querySelectorAll<HTMLElement>("[data-preview]")) {
				const layer = el.querySelector<HTMLElement>(":scope > [data-m3-ripple]");
				if (!layer) continue;
				const state = el.dataset.preview;
				layer.toggleAttribute("data-hovered", state === "hover");
				layer.toggleAttribute("data-focused", state === "focus");
				layer.toggleAttribute("data-pressed", state === "pressed");
				layer.toggleAttribute("data-no-ripple", state === "pressed");
			}
		};
		queueMicrotask(apply);
		const observer = new MutationObserver(apply);
		observer.observe(node, { childList: true, subtree: true });
		return () => observer.disconnect();
	};

	// ---------------------------------------------------------------- checkbox
	let cbA = $state(false);
	let cbB = $state(true);
	let cbC = $state(false);
	let cbCIndeterminate = $state(true);
	let cbError = $state(false);
	let cbErrorChecked = $state(true);

	const toppings = ["Cheese", "Mushrooms", "Olives"] as const;
	let picked = $state<Record<string, boolean>>({ Cheese: true, Mushrooms: false, Olives: false });
	let pickedCount = $derived(toppings.filter((t) => picked[t]).length);
	let allPicked = $derived(pickedCount === toppings.length);
	let somePicked = $derived(pickedCount > 0 && !allPicked);

	let terms = $state(false);
	let termsTouched = $state(false);

	// ---------------------------------------------------------------- radio
	let delivery = $state("standard");
	let size = $state("m");

	// ---------------------------------------------------------------- switch
	let swPlain = $state(false);
	let swOn = $state(true);
	let swIcons = $state(true);
	let swIconsOff = $state(false);
	let swChecked = $state(true);
	let settings = $state({ wifi: true, bluetooth: false, airplane: false });

	// ---------------------------------------------------------------- slider
	const sizes = Object.keys(SLIDER_SIZES) as SliderSize[];
	let sizeValues = $state<Record<SliderSize, number>>({ xs: 30, sm: 45, md: 60, lg: 72, xl: 85 });
	let continuous = $state(42);
	let discrete = $state(40);
	let offset = $state(20);
	let rtlValue = $state(30);
	let rtlRange = $state([25, 60]);
	let range = $state([20, 70]);
	let rangeTicks = $state([2, 7]);
	let balance = $state(15);
	let vertical = $state([60, 35, 80]);
	let temp = $state(21.5);

	// ---------------------------------------------------------------- chips
	const cuisines = ["Italian", "Thai", "Mexican", "Japanese", "Indian", "Greek", "Lebanese"];
	let cuisinePicked = $state<string[]>(["Thai", "Japanese"]);
	function setCuisine(c: string, on: boolean) {
		cuisinePicked = on ? [...cuisinePicked, c] : cuisinePicked.filter((x) => x !== c);
	}

	const sorts = ["Relevance", "Newest", "Price"];
	let sort = $state("Relevance");

	let filterA = $state(false);
	let filterB = $state(true);
	let filterElevated = $state(false);
	let filterElevatedSel = $state(true);
	let filterIcon = $state(false);
	let filterDropdown = $state(false);
	let morphA = $state(false);
	let morphB = $state(true);

	const initialPeople = [
		{ id: 1, name: "Ada Lovelace", initials: "AL" },
		{ id: 2, name: "Grace Hopper", initials: "GH" },
		{ id: 3, name: "Alan Turing", initials: "AT" },
		{ id: 4, name: "Katherine Johnson", initials: "KJ" },
	];
	let people = $state(initialPeople.map((p) => ({ ...p })));
	let selectedPerson = $state<number | null>(2);
	const initialTags = ["design", "svelte", "material", "motion"];
	let tags = $state([...initialTags]);

	let lastAction = $state("—");
</script>

<svelte:head>
	<title>Selection · M3 Expressive</title>
</svelte:head>

{#snippet value(text: string | number)}
	<span dir="ltr" class="type-label-md min-w-10 text-on-surface-variant tabular-nums">{text}</span>
{/snippet}

{#snippet statesHeader(states: typeof STATES)}
	<span></span>
	{#each states as st (st.label)}
		<span class="type-label-md text-center text-on-surface-variant">{st.label}</span>
	{/each}
{/snippet}

{#snippet rowLabel(text: string)}
	<span class="type-label-lg pe-2 text-on-surface">{text}</span>
{/snippet}

{#snippet initials(text: string)}
	<Avatar.Root>
		<Avatar.Fallback class="bg-tertiary-container text-on-tertiary-container type-label-sm">{text}</Avatar.Fallback>
	</Avatar.Root>
{/snippet}

<Page
	title="Selection"
	description="Checkboxes, radio buttons, switches, the Expressive slider and chips. Every control is live: toggle, drag, press and hold, or tab through with the keyboard."
>
	<!-- ================================================================ CHECKBOX -->
	<Section
		title="Checkbox"
		description="Unselected, selected and indeterminate. The check draws in on the default-spatial spring and snaps away 100ms after unchecking. The pressed state layer previews the next state."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo label="States" spec="Box 18dp · corner 2dp · outline 2dp · state layer 40dp · target 48dp">
				<Checkbox bind:checked={cbA} aria-label="Unchecked example" />
				<Checkbox bind:checked={cbB} aria-label="Checked example" />
				<Checkbox
					bind:checked={cbC}
					bind:indeterminate={cbCIndeterminate}
					aria-label="Indeterminate example"
				/>
				{@render value(cbCIndeterminate ? "mixed" : cbC ? "on" : "off")}
			</Demo>

			<Demo label="Error & disabled" spec="Error: error / on-error · disabled: on-surface 38%">
				<Checkbox bind:checked={cbError} aria-invalid="true" aria-label="Error, unchecked" />
				<Checkbox bind:checked={cbErrorChecked} aria-invalid="true" aria-label="Error, checked" />
				<span class="mx-2 h-8 w-px bg-outline-variant"></span>
				<Checkbox disabled aria-label="Disabled, unchecked" />
				<Checkbox disabled checked aria-label="Disabled, checked" />
				<Checkbox disabled indeterminate aria-label="Disabled, indeterminate" />
			</Demo>

			<Demo label="Parent & children" spec="Label on-surface · parent indeterminate when some are selected">
				<Field.FieldSet class="w-full">
					<Field.Field orientation="horizontal" class="gap-1">
						<Checkbox
							id="toppings-all"
							checked={allPicked}
							indeterminate={somePicked}
							onCheckedChange={(v) => toppings.forEach((t) => (picked[t] = v))}
						/>
						<Field.FieldLabel for="toppings-all" class="text-body-lg! leading-6! font-normal text-on-surface"
							>All toppings</Field.FieldLabel
						>
					</Field.Field>
					<Field.FieldGroup class="gap-0 ps-10">
						{#each toppings as t (t)}
							<Field.Field orientation="horizontal" class="gap-1">
								<Checkbox id="topping-{t}" bind:checked={picked[t]} />
								<Field.FieldLabel for="topping-{t}" class="text-body-lg! leading-6! font-normal text-on-surface"
									>{t}</Field.FieldLabel
								>
							</Field.Field>
						{/each}
					</Field.FieldGroup>
				</Field.FieldSet>
			</Demo>

			<Demo label="Validation" spec="aria-invalid on the control, data-invalid on the field">
				<Field.FieldGroup>
					<Field.Field orientation="horizontal" class="gap-1" data-invalid={termsTouched && !terms}>
						<Checkbox
							id="terms"
							bind:checked={terms}
							aria-invalid={termsTouched && !terms}
							onCheckedChange={() => (termsTouched = true)}
						/>
						<Field.FieldContent>
							<Field.FieldLabel for="terms" class="text-body-lg! leading-6! font-normal text-on-surface"
								>Accept the terms</Field.FieldLabel
							>
							<Field.FieldDescription
								class={termsTouched && !terms ? "text-error" : "text-on-surface-variant"}
							>
								{termsTouched && !terms ? "You must accept to continue." : "Check, then uncheck to see the error."}
							</Field.FieldDescription>
						</Field.FieldContent>
					</Field.Field>
					<Field.Field orientation="horizontal" class="gap-1">
						<Checkbox id="disabled-cb" disabled checked />
						<Field.FieldLabel for="disabled-cb" class="text-body-lg! leading-6! font-normal text-on-surface/38"
							>Disabled option</Field.FieldLabel
						>
					</Field.Field>
				</Field.FieldGroup>
			</Demo>
		</div>

		<Demo
			label="States"
			spec="Hover 8% · focus 10% + 3dp secondary ring · pressed 10% (the layer previews the next state) · disabled 38%"
			class="block overflow-x-auto"
		>
			<div class="state-grid" inert {@attach previewStates}>
				{@render statesHeader(STATES)}
				{#each [["Unselected", false, false, false], ["Selected", true, false, false], ["Indeterminate", false, true, false], ["Error", false, false, true], ["Error, selected", true, false, true]] as const as [label, on, mixed, invalid] (label)}
					{@render rowLabel(label)}
					{#each STATES as st (st.label)}
						<div class="grid place-items-center">
							<Checkbox
								checked={on}
								indeterminate={mixed}
								aria-invalid={invalid || undefined}
								disabled={st.disabled}
								data-preview={st.preview}
								aria-label="{label}, {st.label}"
							/>
						</div>
					{/each}
				{/each}
			</div>
		</Demo>
	</Section>

	<!-- ================================================================ RADIO -->
	<Section
		title="Radio button"
		description="The 10dp dot grows on the fast-spatial spring (expressive overshoot); the ring color follows default-effects. Arrow keys move the selection."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo label="Radio group" spec="Ring 20dp · stroke 2dp · dot 10dp · state layer 40dp · target 48dp">
				<Field.FieldSet class="w-full">
					<Field.FieldLegend variant="label" class="type-title-sm text-on-surface">Delivery</Field.FieldLegend>
					<RadioGroup.Root bind:value={delivery} aria-label="Delivery" class="gap-0">
						{#each [["standard", "Standard · 3–5 days"], ["express", "Express · next day"], ["pickup", "Pick up in store"]] as [v, l] (v)}
							<Field.Field orientation="horizontal" class="gap-1">
								<RadioGroup.Item value={v} id="delivery-{v}" />
								<Field.FieldLabel for="delivery-{v}" class="text-body-lg! leading-6! font-normal text-on-surface"
									>{l}</Field.FieldLabel
								>
							</Field.Field>
						{/each}
					</RadioGroup.Root>
				</Field.FieldSet>
				{@render value(delivery)}
			</Demo>

			<Demo label="Horizontal & disabled" spec="Unselected on-surface-variant · selected primary · disabled 38%">
				<div class="flex w-full flex-col gap-4">
					<RadioGroup.Root bind:value={size} orientation="horizontal" aria-label="Size" class="gap-0">
						{#each ["s", "m", "l", "xl"] as v (v)}
							<Field.Field orientation="horizontal" class="w-auto gap-0 pe-3">
								<RadioGroup.Item value={v} id="size-{v}" disabled={v === "xl"} />
								<Field.FieldLabel
									for="size-{v}"
									class={["text-body-lg! leading-6! font-normal uppercase", v === "xl" ? "text-on-surface/38" : "text-on-surface"]}
									>{v}</Field.FieldLabel
								>
							</Field.Field>
						{/each}
					</RadioGroup.Root>
					<RadioGroup.Root value="b" disabled orientation="horizontal" aria-label="Disabled group" class="gap-0">
						<RadioGroup.Item value="a" aria-label="Disabled, unselected" />
						<RadioGroup.Item value="b" aria-label="Disabled, selected" />
					</RadioGroup.Root>
					{@render value(`size: ${size}`)}
				</div>
			</Demo>
		</div>

		<Demo
			label="States"
			spec="Unselected on-surface-variant → on-surface on hover / focus / press · selected primary · disabled 38%"
			class="block overflow-x-auto"
		>
			<div class="state-grid" inert {@attach previewStates}>
				{@render statesHeader(STATES)}
				{#each [["Unselected", ""], ["Selected", "x"]] as const as [label, v] (label)}
					{@render rowLabel(label)}
					{#each STATES as st (st.label)}
						<RadioGroup.Root value={v} disabled={st.disabled} aria-label="{label}, {st.label}" class="grid place-items-center">
							<RadioGroup.Item value="x" data-preview={st.preview} aria-label="{label}, {st.label}" />
						</RadioGroup.Root>
					{/each}
				{/each}
			</div>
		</Demo>
	</Section>

	<!-- ================================================================ SWITCH -->
	<Section
		title="Switch"
		description="Press and hold: the handle snaps to 28dp. Release: size and position spring together on fast-spatial (ζ 0.6, k 800)."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo
				label="Without icons"
				spec="Track 52×32dp · outline 2dp · handle 16 → 24dp selected → 28dp pressed · centers 16 / 36dp"
			>
				<Switch bind:checked={swPlain} aria-label="Plain switch" />
				<Switch bind:checked={swOn} aria-label="Plain switch, on" />
				{@render value(`${swPlain ? "on" : "off"} / ${swOn ? "on" : "off"}`)}
			</Demo>

			<Demo label="With icons" spec="Handle 24dp with icon · icons 16dp (check / close)">
				<Switch bind:checked={swIcons} icons aria-label="Switch with both icons" />
				<Switch bind:checked={swIconsOff} icons aria-label="Switch with both icons, off" />
				<Switch bind:checked={swChecked} icons="checked" aria-label="Switch with check icon only" />
			</Demo>

			<Demo label="Disabled" spec="Track on-surface 12% · handle surface / on-surface 38%">
				<Switch disabled aria-label="Disabled, off" />
				<Switch disabled checked aria-label="Disabled, on" />
				<Switch disabled icons aria-label="Disabled with icons, off" />
				<Switch disabled checked icons aria-label="Disabled with icons, on" />
			</Demo>

			<Demo label="Settings" spec="Label on-surface · body-large">
				<Field.FieldGroup class="gap-1">
					{#each [["wifi", "Wi-Fi"], ["bluetooth", "Bluetooth"], ["airplane", "Airplane mode"]] as const as [k, l] (k)}
						<Field.Field orientation="horizontal" class="justify-between gap-4">
							<Field.FieldLabel for="set-{k}" class="text-body-lg! leading-6! font-normal text-on-surface">{l}</Field.FieldLabel>
							<Switch id="set-{k}" bind:checked={settings[k]} icons={k === "airplane"} />
						</Field.Field>
					{/each}
				</Field.FieldGroup>
			</Demo>
		</div>

		<Demo
			label="States"
			spec="Handle outline → on-surface-variant (off), on-primary → primary-container (on) · pressed handle 28dp"
			class="block overflow-x-auto"
		>
			<div class="state-grid state-grid-wide" inert {@attach previewStates}>
				{@render statesHeader(STATES)}
				{#each [["Off", false, false], ["On", true, false], ["Off, icons", false, true], ["On, icons", true, true]] as const as [label, on, withIcons] (label)}
					{@render rowLabel(label)}
					{#each STATES as st (st.label)}
						<div class="grid place-items-center">
							<Switch
								checked={on}
								icons={withIcons}
								disabled={st.disabled}
								data-preview={st.preview}
								aria-label="{label}, {st.label}"
							/>
						</div>
					{/each}
				{/each}
			</div>
		</Demo>
	</Section>

	<!-- ================================================================ SLIDER -->
	<Section
		title="Slider"
		description="The Expressive slider: a 4dp handle with a 6dp gap on each side splits the track into active and inactive segments. The handle narrows to 2dp while pressed, dragged or focused."
	>
		<Demo
			label="Sizes"
			spec="Track 16 / 24 / 40 / 56 / 96dp · handle 44 / 44 / 52 / 68 / 108dp · outer corner 8 / 8 / 12 / 16 / 28dp · inner corner 2dp"
			class="flex-col items-stretch gap-6"
		>
			{#each sizes as s (s)}
				<div class="flex items-center gap-4">
					<span class="type-label-lg w-6 text-on-surface uppercase">{s}</span>
					<Slider bind:value={sizeValues[s]} size={s} valueIndicator aria-label="Slider size {s}" class="flex-1" />
					{@render value(sizeValues[s])}
				</div>
			{/each}
		</Demo>

		<div class="grid gap-6 md:grid-cols-2">
			<Demo
				label="Continuous with value indicator"
				spec="Value indicator 48×44dp · 12dp above the handle · inverse-surface · label-large"
				class="pt-20"
			>
				<Slider bind:value={continuous} valueIndicator aria-label="Volume" class="flex-1" />
				{@render value(continuous)}
			</Demo>

			<Demo label="Discrete (stops)" spec="step 10 · stop indicators 4dp · snaps to the closest stop" class="pt-20">
				<Slider bind:value={discrete} step={10} ticks valueIndicator aria-label="Discrete" class="flex-1" />
				{@render value(discrete)}
			</Demo>

			<Demo label="Range" spec="Two handles · inactive | active | inactive · stops at both ends" class="pt-20">
				<Slider bind:value={range} valueIndicator aria-label="Price range" class="flex-1" />
				{@render value(`${range[0]}–${range[1]}`)}
			</Demo>

			<Demo label="Range, discrete, size S" spec="min 0 · max 10 · step 1" class="pt-20">
				<Slider bind:value={rangeTicks} min={0} max={10} ticks size="sm" valueIndicator aria-label="Rating range" class="flex-1" />
				{@render value(`${rangeTicks[0]}–${rangeTicks[1]}`)}
			</Demo>

			<Demo label="Centered" spec="Active track grows from the center · −50…50" class="pt-20">
				<Slider
					bind:value={balance}
					min={-50}
					max={50}
					centered
					valueIndicator
					format={(v) => (v > 0 ? `+${v}` : `${v}`)}
					aria-label="Balance"
					class="flex-1"
				/>
				{@render value(balance > 0 ? `+${balance}` : balance)}
			</Demo>

			<Demo label="Centered, discrete, size M" spec="step 10 · handle 52dp" class="pt-20">
				<Slider bind:value={offset} min={-50} max={50} step={10} ticks centered size="md" valueIndicator aria-label="Offset" class="flex-1" />
				{@render value(offset > 0 ? `+${offset}` : offset)}
			</Demo>

			<Demo label="Fractional step" spec="step 0.5 · custom format" class="pt-20">
				<Slider
					bind:value={temp}
					min={16}
					max={28}
					step={0.5}
					valueIndicator
					format={(v) => `${v}°`}
					aria-label="Temperature"
					class="flex-1"
				/>
				{@render value(`${temp}°C`)}
			</Demo>

			<Demo label="Disabled" spec="Active on-surface 38% · inactive on-surface 12%">
				<div class="flex w-full flex-col gap-4">
					<Slider value={60} disabled aria-label="Disabled" />
					<Slider value={[20, 60]} step={10} ticks disabled aria-label="Disabled range" />
				</div>
			</Demo>

			<Demo label="Right-to-left" spec="dir=rtl inherited · starts on the right · arrows follow the reading direction" class="pt-20">
				<div dir="rtl" class="flex w-full flex-col gap-16">
					<div class="flex items-center gap-4">
						<Slider bind:value={rtlValue} valueIndicator aria-label="RTL slider" class="flex-1" />
						{@render value(rtlValue)}
					</div>
					<div class="flex items-center gap-4">
						<Slider bind:value={rtlRange} step={5} ticks size="sm" valueIndicator aria-label="RTL range" class="flex-1" />
						{@render value(`${rtlRange[0]}–${rtlRange[1]}`)}
					</div>
				</div>
			</Demo>

		</div>

		<Demo label="Vertical" spec="orientation vertical · start at the bottom · value indicator beside the handle" class="justify-around ps-16 sm:ps-20">
			<div class="flex flex-wrap items-end gap-x-8 gap-y-6 sm:gap-10">
				<div class="flex flex-col items-center gap-3">
					<Slider bind:value={vertical[0]} orientation="vertical" valueIndicator aria-label="Vertical XS" />
					{@render value(vertical[0])}
				</div>
				<div class="flex flex-col items-center gap-3">
					<Slider bind:value={vertical[1]} orientation="vertical" size="md" step={10} ticks valueIndicator aria-label="Vertical M" />
					{@render value(vertical[1])}
				</div>
				<div class="flex flex-col items-center gap-3">
					<Slider bind:value={vertical[2]} orientation="vertical" size="xl" valueIndicator aria-label="Vertical XL" />
					{@render value(vertical[2])}
				</div>
				<div class="flex flex-col items-center gap-3">
					<Slider value={[25, 75]} orientation="vertical" size="sm" aria-label="Vertical range" />
					{@render value("range")}
				</div>
			</div>
		</Demo>

		<Demo
			label="States"
			spec="No state layer: the handle narrows 4 → 2dp on focus / press · value indicator 12dp above"
			class="block overflow-x-auto"
		>
			<div class="state-grid state-grid-slider" inert {@attach previewStates}>
				{@render statesHeader(SLIDER_STATES)}
				{@render rowLabel("Standard")}
				{#each SLIDER_STATES as st (st.label)}
					<Slider value={40} valueIndicator disabled={st.disabled} data-preview={st.preview} aria-label="Slider, {st.label}" />
				{/each}
			</div>
		</Demo>
	</Section>

	<!-- ================================================================ CHIPS -->
	<Section
		title="Chips"
		description="Assist, filter, input and suggestion chips. Flat chips have a 1dp outline; elevated chips sit on surface-container-low at level 1 (shown here on surface-container-lowest so they stay visible in dark mode)."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo class="bg-surface-container-lowest" label="Assist" spec="32dp · corner 8dp · padding 16dp (8dp icon side) · icon 18dp primary">
				<ChipSet>
					<Chip icon="event" onclick={() => (lastAction = "Add to calendar")}>Add to calendar</Chip>
					<Chip icon="directions" elevated onclick={() => (lastAction = "Directions")}>Directions</Chip>
					<Chip onclick={() => (lastAction = "Share")}>Share</Chip>
					<Chip icon="open_in_new" href="#chips">Link chip</Chip>
					<Chip icon="event" disabled>Disabled</Chip>
					<Chip icon="directions" elevated disabled>Elevated disabled</Chip>
				</ChipSet>
				{@render value(`last: ${lastAction}`)}
			</Demo>

			<Demo class="bg-surface-container-lowest" label="Suggestion" spec="Label on-surface-variant · flat or elevated">
				<ChipSet>
					<Chip variant="suggestion" onclick={() => (lastAction = "Sounds good")}>Sounds good</Chip>
					<Chip variant="suggestion" onclick={() => (lastAction = "See you then")}>See you then</Chip>
					<Chip variant="suggestion" elevated icon="lightbulb" onclick={() => (lastAction = "Idea")}>Idea</Chip>
					<Chip variant="suggestion" disabled>Disabled</Chip>
				</ChipSet>
			</Demo>

			<Demo class="bg-surface-container-lowest"
				label="Filter chip set"
				spec="Selected: secondary-container, no outline · checkmark slot expands on fast-spatial"
			>
				<ChipSet aria-label="Cuisine">
					{#each cuisines as c (c)}
						<Chip
							variant="filter"
							bind:selected={() => cuisinePicked.includes(c), (v) => setCuisine(c, v)}>{c}</Chip
						>
					{/each}
				</ChipSet>
				{@render value(cuisinePicked.length ? cuisinePicked.join(", ") : "none")}
			</Demo>

			<Demo class="bg-surface-container-lowest" label="Filter states" spec="Unselected · selected · elevated · icon · trailing icon · disabled">
				<ChipSet>
					<Chip variant="filter" bind:selected={filterA}>Unselected</Chip>
					<Chip variant="filter" bind:selected={filterB}>Selected</Chip>
					<Chip variant="filter" elevated bind:selected={filterElevated}>Elevated</Chip>
					<Chip variant="filter" elevated bind:selected={filterElevatedSel}>Elevated selected</Chip>
					<Chip variant="filter" icon="local_shipping" bind:selected={filterIcon}>Free shipping</Chip>
					<Chip variant="filter" trailingIcon="arrow_drop_down" bind:selected={filterDropdown}>Brand</Chip>
					<Chip variant="filter" disabled>Disabled</Chip>
					<Chip variant="filter" disabled selected>Disabled selected</Chip>
				</ChipSet>
			</Demo>

			<Demo class="bg-surface-container-lowest" label="Single-select filter" spec="One filter chip selected at a time">
				<ChipSet aria-label="Sort by">
					{#each sorts as s (s)}
						<Chip variant="filter" bind:selected={() => sort === s, (v) => v && (sort = s)}>{s}</Chip>
					{/each}
				</ChipSet>
				{@render value(`sort: ${sort}`)}
			</Demo>

			<Demo class="bg-surface-container-lowest" label="Expressive shape morph" spec="morph: corner 12dp → full when selected → 8dp pressed (fast-spatial)">
				<ChipSet>
					<Chip variant="filter" morph bind:selected={morphA}>Press & hold</Chip>
					<Chip variant="filter" morph bind:selected={morphB} icon="star">Favorites</Chip>
					<Chip variant="filter" morph elevated>Elevated</Chip>
				</ChipSet>
			</Demo>

			<Demo class="bg-surface-container-lowest"
				label="Input chips with avatar"
				spec="Avatar 24dp · 4dp start, 8dp after avatar · remove 18dp (48dp target) · Backspace removes"
			>
				<ChipSet aria-label="Recipients">
					{#each people as p (p.id)}
						<Chip
							variant="input"
							removable
							selected={selectedPerson === p.id}
							onclick={() => (selectedPerson = selectedPerson === p.id ? null : p.id)}
							onremove={() => (people = people.filter((x) => x.id !== p.id))}
						>
							{#snippet avatar()}{@render initials(p.initials)}{/snippet}
							{p.name}
						</Chip>
					{/each}
					{#if people.length < initialPeople.length}
						<Chip icon="refresh" onclick={() => (people = initialPeople.map((p) => ({ ...p })))}>Reset</Chip>
					{/if}
				</ChipSet>
			</Demo>

			<Demo class="bg-surface-container-lowest" label="Input chips" spec="Leading icon on-surface-variant (primary on hover) · selected · disabled">
				<ChipSet aria-label="Tags">
					{#each tags as t (t)}
						<Chip variant="input" icon="tag" removable onremove={() => (tags = tags.filter((x) => x !== t))}>{t}</Chip>
					{/each}
					<Chip variant="input" selected removable>Selected</Chip>
					<Chip variant="input">Not removable</Chip>
					<Chip variant="input" disabled removable icon="tag">Disabled</Chip>
					{#if tags.length < initialTags.length}
						<Chip icon="refresh" onclick={() => (tags = [...initialTags])}>Reset</Chip>
					{/if}
				</ChipSet>
			</Demo>

			<Demo label="Scrolling chip set" spec="ChipSet scroll · gap 8dp · single line" class="bg-surface-container-lowest block">
				<ChipSet scroll aria-label="Categories">
					{#each ["All", "Music", "Podcasts", "Audiobooks", "Live", "Mixes", "Gaming", "News", "Sports", "Comedy"] as c (c)}
						<Chip variant="filter" selected={c === "All"}>{c}</Chip>
					{/each}
				</ChipSet>
			</Demo>
		</div>

		<Demo
			label="States"
			spec="Hover 8% · focus 10% (flat outline → on-surface-variant) · pressed 10% · elevated L1 → L2 on hover · disabled 38% / 12%"
			class="bg-surface-container-lowest block overflow-x-auto"
		>
			<div class="state-grid state-grid-chips" inert {@attach previewStates}>
				{@render statesHeader(STATES)}
				{#each [["Assist", "assist", false, false], ["Assist, elevated", "assist", true, false], ["Filter", "filter", false, false], ["Filter, selected", "filter", false, true], ["Filter, elevated", "filter", true, false], ["Input", "input", false, false]] as const as [label, variant, elevated, selected] (label)}
					{@render rowLabel(label)}
					{#each STATES as st (st.label)}
						<div class="grid place-items-center">
							<Chip
								{variant}
								{elevated}
								{selected}
								icon={variant === "filter" ? undefined : variant === "input" ? "tag" : "event"}
								removable={variant === "input"}
								disabled={st.disabled}
								data-preview={st.preview}>{variant === "input" ? "Tag" : "Label"}</Chip
							>
						</div>
					{/each}
				{/each}
			</div>
		</Demo>
	</Section>
</Page>

<style>
	/* "States" grids: a label column + one column per state */
	.state-grid {
		display: grid;
		grid-template-columns: auto repeat(5, minmax(56px, 1fr));
		align-items: center;
		gap: 12px 8px;
		min-width: max-content;
	}
	.state-grid-wide {
		grid-template-columns: auto repeat(5, minmax(72px, 1fr));
	}
	.state-grid-chips {
		grid-template-columns: auto repeat(5, minmax(120px, 1fr));
	}
	.state-grid-slider {
		grid-template-columns: auto repeat(4, minmax(160px, 1fr));
		/* room for the 44dp value indicator 12dp above the focused / pressed handles */
		row-gap: 64px;
		column-gap: 32px;
	}
	/* Static focus ring (the live one is the global :focus-visible rule) */
	.state-grid :global([data-preview="focus"]:not(.rail, .primary)),
	.state-grid :global(.rail[data-preview="focus"] [role="slider"]) {
		outline: 3px solid var(--md-sys-color-secondary);
		outline-offset: 2px;
	}
</style>
