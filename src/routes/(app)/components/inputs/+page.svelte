<script lang="ts">
	import { Page, Section, Demo } from '#lib/components/showcase/index.js';
	import { TextField } from '#lib/components/ui/text-field/index.js';
	import {
		SearchBar,
		SearchBarAction,
		SearchBarAvatar,
		SearchView,
		SearchViewGroup,
		SearchViewItem,
		SearchViewSeparator
	} from '#lib/components/ui/search-bar/index.js';
	import * as Menu from '#lib/components/ui/menu/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import type { MenuVariant } from '#lib/components/ui/menu/index.js';
	import { DatePicker } from '#lib/components/ui/date-picker/index.js';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';

	// ------------------------------------------------------------------ text fields
	let filledValue = $state('Ada Lovelace');
	let outlinedValue = $state('Ada Lovelace');
	let query = $state('');
	let password = $state('correct horse');
	let showPassword = $state(false);
	let amount = $state('');
	let weight = $state('72');
	let bio = $state('');
	let username = $state('m3_fan_2026_with_a_long_name');
	let notesFilled = $state('Multi-line fields grow with their content.\nPress Enter for a new line.');
	let notesOutlined = $state('');

	// ------------------------------------------------------------------ form
	let form = $state({ name: '', email: '', city: '', country: '', message: '' });
	let submitted = $state(false);
	let sent = $state(false);
	const emailInvalid = $derived(submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email));
	const nameInvalid = $derived(submitted && form.name.trim() === '');
	const countryInvalid = $derived(submitted && !form.country);
	const COUNTRIES = [
		{ value: 'de', label: 'Germany' },
		{ value: 'fr', label: 'France' },
		{ value: 'jp', label: 'Japan' },
		{ value: 'us', label: 'United States' },
		{ value: 'br', label: 'Brazil' }
	];
	const countryLabel = $derived(COUNTRIES.find((c) => c.value === form.country)?.label);

	function submitForm(e: SubmitEvent) {
		e.preventDefault();
		submitted = true;
		sent = !emailInvalid && !nameInvalid && !countryInvalid;
	}

	// ------------------------------------------------------------------ search
	let barValue = $state('');
	let barSubmitted = $state<string | null>(null);
	let dockedValue = $state('');
	let dockedSubmitted = $state<string | null>(null);
	let fullValue = $state('');
	let fullSubmitted = $state<string | null>(null);
	const RECENT = ['material design 3 expressive', 'spring motion tokens', 'shape morphing'];
	const SUGGESTIONS = [
		{ value: 'Text fields', icon: 'text_fields', supporting: 'Filled and outlined' },
		{ value: 'Search', icon: 'search', supporting: 'Bar and view' },
		{ value: 'Menus', icon: 'menu', supporting: 'Baseline and expressive' },
		{ value: 'Date pickers', icon: 'calendar_month', supporting: 'Docked and modal' },
		{ value: 'Sliders', icon: 'tune', supporting: 'Expressive sizes XS to XL' }
	];

	// ------------------------------------------------------------------ menus
	let lastAction = $state<string | null>(null);
	let showRuler = $state(true);
	let showGrid = $state(false);
	let density = $state('comfortable');
	let sortBy = $state('date');
	let wrap = $state(true);

	const MENU_VARIANTS: { variant: MenuVariant; label: string; spec: string }[] = [
		{
			variant: 'expressive',
			label: 'Expressive vertical menu (standard)',
			spec: 'Corner 16dp (24dp while a submenu is open) · Items 44dp · Padding 16dp · Icons 20dp · Groups 2dp gap · Selected tertiary-container 12dp'
		},
		{
			variant: 'vibrant',
			label: 'Expressive vertical menu (vibrant)',
			spec: 'Container tertiary-container · Selected tertiary / on-tertiary · Level 2'
		}
	];

	// ------------------------------------------------------------------ select
	let fruit = $state<string | undefined>(undefined);
	let size = $state('m');
	// ------------------------------------------------------------------ date picker
	let birthday = $state<DateValue | undefined>(undefined);
	let trip = $state<DateValue | undefined>(today(getLocalTimeZone()).add({ days: 3 }));
	const minTrip = today(getLocalTimeZone());

	const FRUITS = ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Grapes', 'Mango', 'Pineapple', 'Strawberry'];
	let pet = $state<string | undefined>(undefined);

	// ------------------------------------------------------------------ states matrix
	const TF_VARIANTS = ['filled', 'outlined'] as const;
	const STATES: { name: string; value?: string; error?: boolean; disabled?: boolean; readonly?: boolean }[] = [
		{ name: 'Enabled' },
		{ name: 'Populated', value: 'Ada' },
		{ name: 'Error', value: 'Ada', error: true },
		{ name: 'Disabled', value: 'Ada', disabled: true },
		{ name: 'Read-only', value: 'Ada', readonly: true }
	];
</script>

<svelte:head>
	<title>Inputs · M3 Expressive</title>
</svelte:head>

<Page
	title="Inputs"
	description="Text fields, search, menus, select and the date picker, built to the Material 3 Expressive specs. Everything here is live: focus the fields, type, open the menus."
>
	<!-- ============================================================ TEXT FIELDS -->
	<Section
		id="text-fields"
		title="Text fields"
		description="Filled and outlined. The label floats from body-large to body-small on a fast-spatial spring; the indicator or outline thickens from 1dp to 2dp in primary on focus."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo
				label="Filled"
				spec="Height 56dp · Top corners 4dp · Indicator 1dp → 2dp · Padding 16dp · Label 16/24 → 12/16"
				class="flex-col items-stretch"
			>
				<TextField label="Empty" class="w-full" />
				<TextField label="With value" bind:value={filledValue} class="w-full" />
				<TextField
					label="Placeholder on focus"
					placeholder="name@example.com"
					supportingText="The placeholder only shows while focused"
					class="w-full"
				/>
				<TextField
					label="Error"
					value="not-an-email"
					error
					errorText="Enter a valid email address"
					class="w-full"
				/>
				<TextField label="Disabled" value="Can't touch this" disabled class="w-full" />
			</Demo>

			<Demo
				label="Outlined"
				spec="Height 56dp · Corner 4dp · Outline 1dp → 2dp · Label notch 4dp each side"
				class="flex-col items-stretch"
			>
				<TextField variant="outlined" label="Empty" class="w-full" />
				<TextField variant="outlined" label="With value" bind:value={outlinedValue} class="w-full" />
				<TextField
					variant="outlined"
					label="Placeholder on focus"
					placeholder="name@example.com"
					supportingText="The placeholder only shows while focused"
					class="w-full"
				/>
				<TextField
					variant="outlined"
					label="Error"
					value="not-an-email"
					error
					errorText="Enter a valid email address"
					class="w-full"
				/>
				<TextField variant="outlined" label="Disabled" value="Can't touch this" disabled class="w-full" />
			</Demo>

			<Demo
				label="Icons"
				spec="Icons 24dp · Trailing icon button 48dp target · Icon side padding 12dp · Icon ↔ text 16dp"
				class="flex-col items-stretch"
			>
				<TextField
					label="Search"
					leadingIcon="search"
					trailingIcon={query ? 'cancel' : undefined}
					trailingIconLabel="Clear"
					ontrailingclick={() => (query = '')}
					bind:value={query}
					class="w-full"
				/>
				<TextField
					variant="outlined"
					label="Password"
					type={showPassword ? 'text' : 'password'}
					leadingIcon="lock"
					trailingIcon={showPassword ? 'visibility_off' : 'visibility'}
					trailingIconLabel={showPassword ? 'Hide password' : 'Show password'}
					ontrailingclick={() => (showPassword = !showPassword)}
					bind:value={password}
					class="w-full"
				/>
				<TextField
					variant="outlined"
					label="Email"
					leadingIcon="mail"
					value="ada@"
					error
					errorText="Missing domain"
					class="w-full"
				/>
			</Demo>

			<Demo
				label="Prefix & suffix"
				spec="Prefix/suffix body-large on-surface-variant · 2dp gap · shown once the label floats"
				class="flex-col items-stretch"
			>
				<TextField label="Amount" prefix="$" suffix="USD" inputmode="decimal" bind:value={amount} class="w-full" />
				<TextField
					variant="outlined"
					label="Weight"
					suffix="kg"
					type="number"
					bind:value={weight}
					class="w-full"
				/>
				<TextField
					variant="outlined"
					label="Website"
					leadingIcon="language"
					prefix="https://"
					placeholder="example.com"
					class="w-full"
				/>
			</Demo>

			<Demo
				label="Supporting text & counter"
				spec="Supporting text body-small 12/16 · 4dp top · 16dp sides · Counter end-aligned, 16dp gap"
				class="flex-col items-stretch"
			>
				<TextField
					label="Bio"
					supportingText="Tell people a little about yourself"
					maxlength={80}
					bind:value={bio}
					class="w-full"
				/>
				<TextField
					variant="outlined"
					label="Username"
					required
					maxlength={20}
					error={username.length > 20}
					errorText="Usernames are 20 characters or fewer"
					supportingText="Letters, numbers and underscores"
					bind:value={username}
					class="w-full"
				/>
			</Demo>

			<Demo
				label="Multi-line & read-only"
				spec="Grows with content from 56dp · Read-only looks enabled, is labelled as such"
				class="flex-col items-stretch"
			>
				<TextField label="Notes" multiline bind:value={notesFilled} class="w-full" />
				<TextField
					variant="outlined"
					label="Message"
					multiline
					rows={3}
					maxlength={200}
					bind:value={notesOutlined}
					class="w-full"
				/>
				<TextField
					variant="outlined"
					label="Account ID (read-only)"
					value="ACC-2026-0042"
					readonly
					trailingIcon="content_copy"
					trailingIconLabel="Copy account ID"
					ontrailingclick={() => navigator.clipboard?.writeText('ACC-2026-0042')}
					class="w-full"
				/>
			</Demo>
		</div>

		<Demo
			label="States"
			spec="Hover and focus are live · Error: label, indicator, supporting text and trailing icon in error · Disabled: content on-surface 38%, filled container on-surface 4%, outline on-surface 12%"
			class="block"
		>
			<div class="overflow-x-auto">
				<div class="grid min-w-max grid-cols-[auto_repeat(5,minmax(9.5rem,1fr))] items-start gap-x-3 gap-y-3">
					<span></span>
					{#each STATES as s (s.name)}
						<span class="type-label-md px-1 text-on-surface-variant">{s.name}</span>
					{/each}
					{#each TF_VARIANTS as variant (variant)}
						<span class="type-label-md self-center pe-2 text-on-surface-variant capitalize">{variant}</span>
						{#each STATES as s (s.name)}
							<TextField
								{variant}
								label="Name"
								value={s.value ?? ''}
								error={s.error}
								errorText={s.error ? 'Error text' : undefined}
								supportingText="Supporting text"
								disabled={s.disabled}
								readonly={s.readonly}
								class="w-full"
							/>
						{/each}
					{/each}
				</div>
			</div>
		</Demo>

		<Demo
			label="A small form"
			spec="Field.FieldSet / FieldGroup layout · error replaces supporting text · select = outlined field"
			class="block"
		>
			<form class="mx-auto flex max-w-xl flex-col" novalidate onsubmit={submitForm}>
				<Field.FieldSet>
					<Field.FieldLegend class="type-title-lg text-on-surface">Contact us</Field.FieldLegend>
					<Field.FieldDescription class="type-body-md text-on-surface-variant">
						Submit with empty fields to see the error states.
					</Field.FieldDescription>
					<Field.FieldGroup class="gap-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<TextField
								variant="outlined"
								label="Name"
								required
								autocomplete="name"
								bind:value={form.name}
								error={nameInvalid}
								errorText="Please tell us your name"
								class="w-full"
							/>
							<TextField
								variant="outlined"
								label="Email"
								type="email"
								required
								autocomplete="email"
								leadingIcon="mail"
								bind:value={form.email}
								error={emailInvalid}
								errorText="Enter a valid email address"
								class="w-full"
							/>
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<TextField variant="outlined" label="City" bind:value={form.city} class="w-full" />
							<Field.Field data-invalid={countryInvalid || undefined} class="gap-0">
								<Select.Root type="single" bind:value={form.country}>
									<Select.Trigger
										id="country-select"
										label="Country"
										required
										class="w-full"
										aria-invalid={countryInvalid || undefined}
										aria-describedby={countryInvalid ? 'country-error' : undefined}
									>
										<span data-slot="select-value">{countryLabel ?? 'Choose one'}</span>
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											{#each COUNTRIES as c (c.value)}
												<Select.Item value={c.value} label={c.label} />
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
								{#if countryInvalid}
									<p id="country-error" class="type-body-sm px-4 pt-1 text-error" aria-live="polite">Choose a country</p>
								{/if}
							</Field.Field>
						</div>
						<TextField
							variant="outlined"
							label="Message"
							multiline
							rows={3}
							maxlength={300}
							bind:value={form.message}
							class="w-full"
						/>
					</Field.FieldGroup>
				</Field.FieldSet>
				<div class="mt-6 flex items-center justify-end gap-3">
					{#if sent}
						<span class="type-body-md me-auto text-on-surface-variant">Thanks, {form.name}! (nothing was sent)</span>
					{/if}
					<Button
						variant="text"
						type="button"
						onclick={() => {
							form = { name: '', email: '', city: '', country: '', message: '' };
							submitted = false;
							sent = false;
						}}>Reset</Button
					>
					<Button type="submit"><Icon name="send" data-icon="inline-start" />Send</Button>
				</div>
			</form>
		</Demo>
	</Section>

	<!-- ============================================================ SEARCH -->
	<Section
		id="search"
		title="Search"
		description="The search bar is a 56dp pill on surface-container-high. Focusing it expands the bar by shrinking its 24dp side margins to 12dp. The search view shows suggestions docked below the bar on large screens and full screen on compact ones."
	>
		<Demo
			label="Search bar"
			spec="Height 56dp · Corner full · surface-container-high · Level 3 · Margins 24dp → 12dp on focus · Icons 24dp in 48dp targets · Avatar 30dp"
			class="flex-col items-stretch px-0"
		>
			<SearchBar
				bind:value={barValue}
				placeholder="Search messages"
				leadingIcon="menu"
				leadingIconLabel="Open navigation"
				onleadingclick={() => (barSubmitted = '(menu pressed)')}
				onsubmit={(v) => (barSubmitted = v)}
			>
				{#snippet trailing()}
					<SearchBarAction icon="mic" label="Voice search" />
					<SearchBarAvatar initials="AL" label="Account: Ada Lovelace" />
				{/snippet}
			</SearchBar>
			<SearchBar placeholder="No actions: 16dp side padding" leadingIcon={null} elevated={false} />
			<p class="type-body-sm px-6 text-on-surface-variant">
				Submitted: <span class="text-on-surface">{barSubmitted ?? '—'}</span>
			</p>
		</Demo>

		<div class="grid gap-6 md:grid-cols-2">
			<Demo
				label="Search view · docked"
				spec="Results corner 12dp · 2dp below the bar · Min 240dp, max 2/3 screen · Level 3 · List items 56/72dp · ↑ ↓ Enter Esc"
				class="min-h-80 flex-col items-stretch justify-start"
			>
				<SearchView
					mode="docked"
					placeholder="Search components"
					bind:value={dockedValue}
					onsubmit={(v) => (dockedSubmitted = v)}
				>
					{#snippet trailing()}
						<SearchBarAvatar initials="M3" />
					{/snippet}
					<SearchViewGroup heading="Recent">
						{#each RECENT as r (r)}
							<SearchViewItem value={r} icon="history" trailingIcon="north_west" />
						{/each}
					</SearchViewGroup>
					<SearchViewSeparator />
					<SearchViewGroup heading="Components">
						{#each SUGGESTIONS as s (s.value)}
							<SearchViewItem value={s.value} icon={s.icon} supportingText={s.supporting} />
						{/each}
					</SearchViewGroup>
				</SearchView>
				<p class="type-body-sm px-2 text-on-surface-variant">
					Submitted: <span class="text-on-surface">{dockedSubmitted ?? '—'}</span>
				</p>
			</Demo>

			<Demo
				label="Search view · full screen"
				spec="Grows out of the bar (container transform) · surface-container-low · 56dp bar, 12dp margins · Expand 600ms emphasized-decelerate · Collapse 350ms · Results fade 100ms after 50ms · Used automatically below 600dp"
				class="min-h-80 flex-col items-stretch justify-start"
			>
				<SearchView
					mode="fullscreen"
					placeholder="Search components"
					bind:value={fullValue}
					onsubmit={(v) => (fullSubmitted = v)}
				>
					{#snippet trailing()}
						<SearchBarAvatar initials="M3" />
					{/snippet}
					<SearchViewGroup heading="Recent">
						{#each RECENT as r (r)}
							<SearchViewItem value={r} icon="history" trailingIcon="north_west" />
						{/each}
					</SearchViewGroup>
					<SearchViewGroup heading="Components">
						{#each SUGGESTIONS as s (s.value)}
							<SearchViewItem value={s.value} icon={s.icon} supportingText={s.supporting} />
						{/each}
					</SearchViewGroup>
				</SearchView>
				<p class="type-body-sm px-2 text-on-surface-variant">
					Submitted: <span class="text-on-surface">{fullSubmitted ?? '—'}</span>
				</p>
			</Demo>
		</div>
	</Section>

	<!-- ============================================================ MENUS -->
	<Section
		id="menus"
		title="Menus"
		description="Built on bits-ui DropdownMenu, so keyboard navigation, typeahead and submenus come for free. Menus open from their anchor with a 0.8 → 1 scale on the fast-spatial spring and a fast-effects fade."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo
				label="Baseline menu"
				spec="Width 112–280dp · Corner 4dp · surface-container · Level 2 · 8dp list padding · Items 48dp, 12dp padding · Icons 24dp · Divider 1dp, 8dp padding"
			>
				<Menu.Root>
					<Menu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="tonal"><Icon name="edit" data-icon="inline-start" />Edit</Button>
						{/snippet}
					</Menu.Trigger>
					<Menu.Content>
						<Menu.Group>
							<Menu.Item onSelect={() => (lastAction = 'Cut')}>
								<Icon name="content_cut" />Cut<Menu.Shortcut>Ctrl+X</Menu.Shortcut>
							</Menu.Item>
							<Menu.Item onSelect={() => (lastAction = 'Copy')}>
								<Icon name="content_copy" />Copy<Menu.Shortcut>Ctrl+C</Menu.Shortcut>
							</Menu.Item>
							<Menu.Item onSelect={() => (lastAction = 'Paste')}>
								<Icon name="content_paste" />Paste<Menu.Shortcut>Ctrl+V</Menu.Shortcut>
							</Menu.Item>
							<Menu.Item disabled><Icon name="redo" />Redo<Menu.Shortcut>Ctrl+Y</Menu.Shortcut></Menu.Item>
						</Menu.Group>
						<Menu.Separator />
						<Menu.Group>
							<Menu.Sub>
								<Menu.SubTrigger><Icon name="share" />Share</Menu.SubTrigger>
								<Menu.SubContent>
									<Menu.Group>
										<Menu.Item onSelect={() => (lastAction = 'Email')}><Icon name="mail" />Email</Menu.Item>
										<Menu.Item onSelect={() => (lastAction = 'Message')}><Icon name="sms" />Message</Menu.Item>
										<Menu.Item onSelect={() => (lastAction = 'Copy link')}><Icon name="link" />Copy link</Menu.Item>
									</Menu.Group>
								</Menu.SubContent>
							</Menu.Sub>
							<Menu.Item onSelect={() => (lastAction = 'Rename')} inset>Rename</Menu.Item>
						</Menu.Group>
						<Menu.Separator />
						<Menu.Group>
							<Menu.Item variant="destructive" onSelect={() => (lastAction = 'Delete')}>
								<Icon name="delete" />Delete
							</Menu.Item>
						</Menu.Group>
					</Menu.Content>
				</Menu.Root>

				<Menu.Root>
					<Menu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outlined"><Icon name="visibility" data-icon="inline-start" />View</Button>
						{/snippet}
					</Menu.Trigger>
					<Menu.Content>
						<Menu.Group>
							<Menu.GroupHeading>Show</Menu.GroupHeading>
							<Menu.CheckboxItem bind:checked={showRuler}>Ruler</Menu.CheckboxItem>
							<Menu.CheckboxItem bind:checked={showGrid}>Grid</Menu.CheckboxItem>
						</Menu.Group>
						<Menu.Separator />
						<Menu.RadioGroup bind:value={density}>
							<Menu.GroupHeading>Density</Menu.GroupHeading>
							<Menu.RadioItem value="comfortable">Comfortable</Menu.RadioItem>
							<Menu.RadioItem value="compact">Compact</Menu.RadioItem>
						</Menu.RadioGroup>
					</Menu.Content>
				</Menu.Root>

				<p class="type-body-sm basis-full text-on-surface-variant">
					Last action: <span class="text-on-surface">{lastAction ?? '—'}</span> · Ruler {showRuler ? 'on' : 'off'} ·
					Grid {showGrid ? 'on' : 'off'} · {density}
				</p>
			</Demo>

			{#each MENU_VARIANTS as m (m.variant)}
				<Demo label={m.label} spec={m.spec}>
					<Menu.Root variant={m.variant}>
						<Menu.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant={m.variant === 'vibrant' ? 'filled' : 'tonal'}>
									<Icon name="sort" data-icon="inline-start" />Sort & view
								</Button>
							{/snippet}
						</Menu.Trigger>
						<Menu.Content>
							<Menu.RadioGroup bind:value={sortBy}>
								<Menu.GroupHeading>Sort by</Menu.GroupHeading>
								<Menu.RadioItem value="date"><Icon name="schedule" />Date modified</Menu.RadioItem>
								<Menu.RadioItem value="name"><Icon name="sort_by_alpha" />Name</Menu.RadioItem>
								<Menu.RadioItem value="size"><Icon name="straighten" />File size</Menu.RadioItem>
							</Menu.RadioGroup>
							<Menu.Group>
								<Menu.CheckboxItem bind:checked={wrap}><Icon name="wrap_text" />Wrap lines</Menu.CheckboxItem>
								<Menu.Sub>
									<Menu.SubTrigger><Icon name="palette" />Theme</Menu.SubTrigger>
									<Menu.SubContent>
										<Menu.Group>
											<Menu.Item onSelect={() => (lastAction = 'Light')}><Icon name="light_mode" />Light</Menu.Item>
											<Menu.Item onSelect={() => (lastAction = 'Dark')}><Icon name="dark_mode" />Dark</Menu.Item>
											<Menu.Item onSelect={() => (lastAction = 'System')}><Icon name="contrast" />System</Menu.Item>
										</Menu.Group>
									</Menu.SubContent>
								</Menu.Sub>
							</Menu.Group>
							<Menu.Group>
								<Menu.Item onSelect={() => (lastAction = 'Settings')}>
									<Icon name="settings" />Settings<Menu.Shortcut>Ctrl+,</Menu.Shortcut>
								</Menu.Item>
								<Menu.Item disabled><Icon name="help" />Help</Menu.Item>
							</Menu.Group>
						</Menu.Content>
					</Menu.Root>
				</Demo>
			{/each}

			<Demo
				label="Expressive menu without groups"
				spec="Single 16dp container · 4dp padding · First/last item 12dp outer corners"
			>
				<Menu.Root variant="expressive">
					<Menu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outlined"><Icon name="more_vert" data-icon="inline-start" />More</Button>
						{/snippet}
					</Menu.Trigger>
					<Menu.Content>
						<Menu.Item onSelect={() => (lastAction = 'Pin')}><Icon name="keep" />Pin</Menu.Item>
						<Menu.Item onSelect={() => (lastAction = 'Archive')}><Icon name="archive" />Archive</Menu.Item>
						<Menu.Separator />
						<Menu.Item onSelect={() => (lastAction = 'Report')}><Icon name="flag" />Report</Menu.Item>
					</Menu.Content>
				</Menu.Root>
			</Demo>
		</div>
	</Section>

	<!-- ============================================================ SELECT -->
	<Section
		id="select"
		title="Select"
		description="The shadcn Select restyled: the trigger is an outlined text field and the listbox is a baseline M3 menu."
	>
		<Demo
			label="Select"
			spec="Trigger 56dp, outline 1dp → 2dp primary · Floating label + notch · Arrow 24dp rotates on open · Menu items 48dp · Selected secondary-container"
		>
			<Select.Root type="single" bind:value={pet}>
				<Select.Trigger class="w-64" label="Favourite pet">
					<span data-slot="select-value">{pet ?? 'Choose one'}</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each ['Cat', 'Dog', 'Rabbit', 'Parrot'] as p (p)}
							<Select.Item value={p} label={p} />
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={fruit}>
				<Select.Trigger class="w-64">
					<span data-slot="select-value">{fruit || 'Pick a fruit'}</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.GroupHeading>Fruits</Select.GroupHeading>
						{#each FRUITS as f (f)}
							<Select.Item value={f} label={f} />
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={size}>
				<Select.Trigger class="w-48" aria-label="T-shirt size">
					<span data-slot="select-value"><Icon name="apparel" class="text-on-surface-variant" />Size {size.toUpperCase()}</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="s" label="Small" />
						<Select.Item value="m" label="Medium" />
						<Select.Item value="l" label="Large" />
						<Select.Separator />
						<Select.Item value="xl" label="Extra large" disabled />
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<Select.Root type="single">
				<Select.Trigger class="w-48" aria-invalid="true">
					<span data-slot="select-value">Invalid</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="a" label="Option A" />
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" disabled>
				<Select.Trigger class="w-48">
					<span data-slot="select-value">Disabled</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="a" label="Option A" />
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</Demo>
	</Section>

	<!-- ============================================================ DATE PICKER -->
	<Section
		id="date-picker"
		title="Date picker"
		description="Docked date picker on bits-ui DatePicker: type into the date segments or open the calendar from the trailing icon."
	>
		<Demo
			label="Docked date picker"
			spec="Card 360 × 456dp · Corner 16dp · surface-container-high · Level 3 · Header 64dp · Day cells 48dp, 40dp indicator · Selected primary · Today 1dp primary outline"
			class="items-start"
		>
			<DatePicker label="Birthday" bind:value={birthday} />
			<DatePicker
				label="Departure"
				bind:value={trip}
				minValue={minTrip}
				supportingText="Today or later"
			/>
			<DatePicker label="Disabled" disabled />
			<p class="type-body-sm basis-full text-on-surface-variant">
				Birthday: <span class="text-on-surface">{birthday?.toString() ?? '—'}</span> · Departure:
				<span class="text-on-surface">{trip?.toString() ?? '—'}</span>
			</p>
		</Demo>
	</Section>
</Page>
