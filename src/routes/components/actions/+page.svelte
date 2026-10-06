<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { Page, Section, Demo } from '#lib/components/showcase/index.js';
	import { Button, type ButtonVariant } from '#lib/components/ui/button/index.js';
	import { IconButton, type IconButtonVariant } from '#lib/components/ui/icon-button/index.js';
	import {
		Fab,
		ExtendedFab,
		FabMenu,
		FabMenuItem,
		type FabColor,
		type FabMenuColor
	} from '#lib/components/ui/fab/index.js';
	import { ButtonGroup, ButtonGroupItem } from '#lib/components/ui/button-group/index.js';
	import * as SplitButton from '#lib/components/ui/split-button/index.js';
	import { SegmentedButton, SegmentedButtonItem } from '#lib/components/ui/segmented-button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';

	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	// ------------------------------------------------------------------ data (spec values: docs/research/buttons.md)
	const VARIANTS: { id: NonNullable<ButtonVariant>; name: string }[] = [
		{ id: 'filled', name: 'Filled' },
		{ id: 'tonal', name: 'Tonal' },
		{ id: 'outlined', name: 'Outlined' },
		{ id: 'elevated', name: 'Elevated' },
		{ id: 'text', name: 'Text' }
	];
	const TOGGLE_VARIANTS = VARIANTS.filter((v) => v.id !== 'text');

	const BUTTON_SIZES: { id: Size; name: string; spec: string }[] = [
		{ id: 'xs', name: 'Extra small', spec: 'Height 32dp · Pad 12dp · Icon 20dp · Gap 4dp · Label large · Corner full → pressed 8dp' },
		{ id: 'sm', name: 'Small (default)', spec: 'Height 40dp · Pad 16dp · Icon 20dp · Gap 8dp · Label large · Corner full → pressed 8dp' },
		{ id: 'md', name: 'Medium', spec: 'Height 56dp · Pad 24dp · Icon 24dp · Gap 8dp · Title medium · Corner full → pressed 12dp' },
		{ id: 'lg', name: 'Large', spec: 'Height 96dp · Pad 48dp · Icon 32dp · Gap 12dp · Headline small · Outline 2dp · Corner full → pressed 16dp' },
		{ id: 'xl', name: 'Extra large', spec: 'Height 136dp · Pad 64dp · Icon 40dp · Gap 16dp · Headline large · Outline 3dp · Corner full → pressed 16dp' }
	];

	const ICON_VARIANTS: { id: NonNullable<IconButtonVariant>; name: string }[] = [
		{ id: 'standard', name: 'Standard' },
		{ id: 'filled', name: 'Filled' },
		{ id: 'tonal', name: 'Tonal' },
		{ id: 'outlined', name: 'Outlined' }
	];
	const WIDTHS = ['narrow', 'default', 'wide'] as const;
	const ICON_SIZES: { id: Size; name: string; spec: string }[] = [
		{ id: 'xs', name: 'Extra small', spec: 'Height 32dp · Icon 20dp · Width 28 / 32 / 40dp · Square 12dp · Pressed 8dp' },
		{ id: 'sm', name: 'Small (default)', spec: 'Height 40dp · Icon 24dp · Width 32 / 40 / 52dp · Square 12dp · Pressed 8dp' },
		{ id: 'md', name: 'Medium', spec: 'Height 56dp · Icon 24dp · Width 48 / 56 / 72dp · Square 16dp · Pressed 12dp' },
		{ id: 'lg', name: 'Large', spec: 'Height 96dp · Icon 32dp · Width 64 / 96 / 128dp · Square 28dp · Pressed 16dp · Outline 2dp' },
		{ id: 'xl', name: 'Extra large', spec: 'Height 136dp · Icon 40dp · Width 104 / 136 / 184dp · Square 28dp · Pressed 16dp · Outline 3dp' }
	];

	const FAB_COLORS: { id: FabColor; name: string }[] = [
		{ id: 'primary-container', name: 'Primary container' },
		{ id: 'secondary-container', name: 'Secondary container' },
		{ id: 'tertiary-container', name: 'Tertiary container' },
		{ id: 'primary', name: 'Primary' },
		{ id: 'secondary', name: 'Secondary' },
		{ id: 'tertiary', name: 'Tertiary' }
	];
	const FAB_SIZES = [
		{ id: 'default', name: 'FAB', icon: 'edit', spec: '56 × 56dp · Corner 16dp · Icon 24dp · Elevation 3 → hover 4' },
		{ id: 'medium', name: 'Medium FAB', icon: 'edit', spec: '80 × 80dp · Corner 20dp · Icon 28dp · Elevation 3 → hover 4' },
		{ id: 'large', name: 'Large FAB', icon: 'edit', spec: '96 × 96dp · Corner 28dp · Icon 36dp · Elevation 3 → hover 4' }
	] as const;
	const EXTENDED_SIZES = [
		{ id: 'small', name: 'Small extended FAB', spec: 'Height 56dp · Pad 16dp · Icon 24dp · Gap 8dp · Title medium · Corner 16dp' },
		{ id: 'medium', name: 'Medium extended FAB', spec: 'Height 80dp · Pad 26dp · Icon 28dp · Gap 12dp · Title large · Corner 20dp' },
		{ id: 'large', name: 'Large extended FAB', spec: 'Height 96dp · Pad 28dp · Icon 36dp · Gap 16dp · Headline small · Corner 28dp' }
	] as const;

	const GROUP_SPECS: Record<Size, { standard: string; connected: string }> = {
		xs: { standard: 'Height 32dp · Gap 18dp · Pressed +15% width', connected: 'Height 32dp · Gap 2dp · Inner 8dp → pressed 4dp · Selected full · Min width 48dp' },
		sm: { standard: 'Height 40dp · Gap 12dp · Pressed +15% width', connected: 'Height 40dp · Gap 2dp · Inner 8dp → pressed 4dp · Selected full · Min width 48dp' },
		md: { standard: 'Height 56dp · Gap 8dp · Pressed +15% width', connected: 'Height 56dp · Gap 2dp · Inner 8dp → pressed 4dp · Selected full' },
		lg: { standard: 'Height 96dp · Gap 8dp · Pressed +15% width', connected: 'Height 96dp · Gap 2dp · Inner 16dp → pressed 12dp · Selected full' },
		xl: { standard: 'Height 136dp · Gap 8dp · Pressed +15% width', connected: 'Height 136dp · Gap 2dp · Inner 20dp → pressed 16dp · Selected full' }
	};

	const SPLIT_SPECS: Record<Size, string> = {
		xs: 'Height 32dp · Gap 2dp · Inner 4dp → 8dp · Leading pad 12/10dp · Trailing 48dp, icon 22dp',
		sm: 'Height 40dp · Gap 2dp · Inner 4dp → 12dp · Leading pad 16/12dp · Trailing 48dp, icon 22dp',
		md: 'Height 56dp · Gap 2dp · Inner 4dp → 12dp · Leading pad 24/24dp · Trailing 56dp, icon 26dp',
		lg: 'Height 96dp · Gap 2dp · Inner 8dp → 20dp · Leading pad 48/48dp · Trailing 96dp, icon 38dp',
		xl: 'Height 136dp · Gap 2dp · Inner 12dp → 20dp · Leading pad 64/64dp · Trailing 136dp, icon 50dp'
	};

	const SIZE_NAMES: Record<Size, string> = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' };
	const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl'];

	// ------------------------------------------------------------------ interactive state
	let toggles = $state<Record<string, boolean>>({
		'filled-round': true,
		'filled-square': false,
		'tonal-round': false,
		'tonal-square': true,
		'outlined-round': true,
		'outlined-square': false,
		'elevated-round': false,
		'elevated-square': true
	});
	let sizeToggles = $state<Record<Size, boolean>>({ xs: true, sm: false, md: true, lg: false, xl: true });
	let iconToggles = $state<Record<string, boolean>>({
		standard: true,
		filled: false,
		tonal: true,
		outlined: false,
		'standard-sq': false,
		'filled-sq': true,
		'tonal-sq': false,
		'outlined-sq': true
	});

	let fabExtended = $state(true);
	let menuOpen = $state<Record<FabMenuColor, boolean>>({ primary: false, secondary: false, tertiary: false });
	let scrimMenuOpen = $state(false);
	let lastMenuAction = $state('—');

	let standardSelection = $state<Record<Size, string>>({ xs: 'day', sm: 'week', md: 'day', lg: 'week', xl: 'day' });
	let connectedSelection = $state<Record<Size, string>>({ xs: 'list', sm: 'grid', md: 'list', lg: 'grid', xl: 'list' });
	let connectedMulti = $state<string[]>(['bold', 'italic']);
	let squareConnected = $state('center');

	let segmentedSingle = $state('week');
	let segmentedMulti = $state<string[]>(['walk', 'bike']);

	// ------------------------------------------------------------------ simulated states (States demo)
	/** Forces the ripple attachment's state layer of the wrapped control into a state. */
	function simulate(state: 'hovered' | 'focused' | 'pressed'): Attachment<HTMLElement> {
		return (node) => {
			const frame = requestAnimationFrame(() => {
				const layer = node.querySelector<HTMLElement>('[data-m3-ripple]');
				if (!layer) return;
				if (state === 'pressed') layer.setAttribute('data-no-ripple', '');
				layer.setAttribute(`data-${state}`, '');
			});
			return () => cancelAnimationFrame(frame);
		};
	}

	const STATE_CLASSES = {
		enabled: '',
		hovered: '',
		focused: 'outline-3 outline-offset-2 outline-m3-secondary',
		pressed: '[--btn-r:var(--btn-r-pressed)]'
	} as const;
	const STATES = ['enabled', 'hovered', 'focused', 'pressed', 'disabled'] as const;
</script>

<svelte:head>
	<title>Actions · M3 Expressive</title>
</svelte:head>

{#snippet stateRow(variant: ButtonVariant)}
	<div class="flex flex-wrap items-center gap-4">
		{#each STATES as state (state)}
			<div class="flex flex-col items-center gap-2">
				{#if state === 'disabled'}
					<Button {variant} disabled>Label</Button>
				{:else if state === 'enabled'}
					<Button {variant}>Label</Button>
				{:else}
					<span class="inline-flex" {@attach simulate(state)}>
						<Button {variant} class={STATE_CLASSES[state]} tabindex={-1}>Label</Button>
					</span>
				{/if}
				<span class="type-label-sm text-on-surface-variant">{state}</span>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet menuItems()}
	<DropdownMenu.Group>
		<DropdownMenu.Item><Icon name="content_copy" size={20} /> Duplicate</DropdownMenu.Item>
		<DropdownMenu.Item><Icon name="drive_file_rename_outline" size={20} /> Rename</DropdownMenu.Item>
		<DropdownMenu.Item><Icon name="archive" size={20} /> Archive</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item><Icon name="delete" size={20} /> Delete</DropdownMenu.Item>
	</DropdownMenu.Group>
{/snippet}

{#snippet split(variant: 'filled' | 'tonal' | 'outlined' | 'elevated', size: Size, label: string)}
	<SplitButton.Root {variant} {size}>
		<SplitButton.Leading>
			<Icon name="edit" data-icon="inline-start" />
			{label}
		</SplitButton.Leading>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<SplitButton.Trailing {...props} aria-label="More {label.toLowerCase()} options" />
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" sideOffset={4} class="w-auto min-w-48">
				{@render menuItems()}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</SplitButton.Root>
{/snippet}

<Page
	title="Actions"
	description="Buttons, icon buttons, FABs, the FAB menu, button groups, split buttons and segmented buttons — every variant, size and state from the M3 Expressive spec. Press things: shapes morph on springs."
>
	<!-- ================================================================== COMMON BUTTONS -->
	<Section
		title="Common buttons"
		description="Five color styles in five sizes. Round by default; square is new in Expressive. While pressed every button morphs to the pressed corner on the default-effects spring (no bounce)."
	>
		<Demo label="Color styles" spec="Height 40dp · Pad 16dp · Label large · Corner full (20dp) → pressed 8dp">
			{#each VARIANTS as v (v.id)}
				<Button variant={v.id}>{v.name}</Button>
			{/each}
		</Demo>

		{#each BUTTON_SIZES as s (s.id)}
			<Demo label={s.name} spec={s.spec}>
				{#each VARIANTS as v (v.id)}
					<Button variant={v.id} size={s.id}>
						<Icon name="add" data-icon="inline-start" />
						{v.name}
					</Button>
				{/each}
			</Demo>
		{/each}

		<Demo label="Round vs square" spec="Square 12 / 12 / 16 / 28 / 28dp · Pressed 8 / 8 / 12 / 16 / 16dp (both shapes)">
			{#each BUTTON_SIZES.slice(0, 4) as s (s.id)}
				<div class="flex items-center gap-2">
					<Button size={s.id} variant="tonal">Round</Button>
					<Button size={s.id} variant="tonal" shape="square">Square</Button>
				</div>
			{/each}
		</Demo>

		<Demo label="With icons" spec="One icon per button · leading or trailing · padding unchanged with an icon">
			<Button><Icon name="send" data-icon="inline-start" /> Send</Button>
			<Button variant="tonal">Next <Icon name="arrow_forward" data-icon="inline-end" /></Button>
			<Button variant="outlined"><Icon name="download" data-icon="inline-start" /> Download</Button>
			<Button variant="elevated"><Icon name="favorite" data-icon="inline-start" /> Like</Button>
			<Button variant="text"><Icon name="open_in_new" data-icon="inline-start" /> Open</Button>
			<Button variant="filled" href="#common-buttons">Link button</Button>
		</Demo>

		<Demo
			label="Toggle buttons"
			spec="Selected: round → square, square → round · fast-spatial spring · icon fills · no text toggle"
		>
			{#each TOGGLE_VARIANTS as v (v.id)}
				<div class="flex items-center gap-2">
					<Button variant={v.id} toggle bind:pressed={toggles[`${v.id}-round`]}>
						<Icon name="bookmark" data-icon="inline-start" />
						{v.name}
					</Button>
					<Button variant={v.id} toggle shape="square" bind:pressed={toggles[`${v.id}-square`]}>
						<Icon name="star" data-icon="inline-start" />
						Square
					</Button>
				</div>
			{/each}
		</Demo>

		<Demo label="Toggle sizes" spec="Selected corner 12 / 12 / 16 / 28 / 28dp (round) · full (square)">
			{#each BUTTON_SIZES.slice(0, 4) as s (s.id)}
				<Button variant="tonal" size={s.id} toggle bind:pressed={sizeToggles[s.id]}>
					<Icon name="check" data-icon="inline-start" />
					{SIZE_NAMES[s.id]}
				</Button>
			{/each}
		</Demo>

		<Demo label="Extra large toggle" spec="Height 136dp · Selected corner 28dp">
			<Button variant="filled" size="xl" toggle bind:pressed={sizeToggles.xl}>
				<Icon name="favorite" data-icon="inline-start" />
				Favorite
			</Button>
		</Demo>

		<Demo label="Disabled" spec="Container on-surface 10% · Content on-surface 38% · Elevation 0">
			{#each VARIANTS as v (v.id)}
				<Button variant={v.id} disabled>{v.name}</Button>
			{/each}
			<Button variant="outlined" toggle pressed disabled>Selected</Button>
		</Demo>

		<Demo
			label="States"
			spec="State layer in the content color: hover 8% · focus 10% + 3dp secondary ring at 2dp · pressed 10% · disabled none"
			class="flex-col items-start"
		>
			{@render stateRow('filled')}
			{@render stateRow('tonal')}
			{@render stateRow('outlined')}
			{@render stateRow('text')}
			<p class="type-body-sm text-on-surface-variant">
				Hover, focus and pressed are simulated here; hover, Tab to and press the live buttons above to see them for real.
			</p>
		</Demo>
	</Section>

	<!-- ================================================================== ICON BUTTONS -->
	<Section
		title="Icon buttons"
		description="Four color styles, five sizes, three widths and two shapes. Toggle icon buttons switch to a filled icon when selected."
	>
		{#each ICON_SIZES as s (s.id)}
			<Demo label={s.name} spec={s.spec}>
				{#each WIDTHS as w (w)}
					<div class="flex flex-wrap items-center gap-2">
						{#each ICON_VARIANTS as v (v.id)}
							<IconButton
								variant={v.id}
								size={s.id}
								width={w}
								icon="settings"
								aria-label="{v.name} {w} settings"
							/>
						{/each}
					</div>
				{/each}
			</Demo>
		{/each}

		<Demo label="Round vs square" spec="Round full · Square 12dp (S) · Pressed 8dp (S)">
			{#each ICON_VARIANTS as v (v.id)}
				<div class="flex items-center gap-2">
					<IconButton variant={v.id} icon="share" aria-label="{v.name} round" />
					<IconButton variant={v.id} shape="square" icon="share" aria-label="{v.name} square" />
				</div>
			{/each}
		</Demo>

		<Demo
			label="Toggle icon buttons"
			spec="Selected: filled → primary · tonal → secondary · outlined → inverse-surface · standard icon → primary"
		>
			{#each ICON_VARIANTS as v (v.id)}
				<div class="flex items-center gap-2">
					<IconButton
						variant={v.id}
						toggle
						bind:pressed={iconToggles[v.id]}
						icon="favorite"
						aria-label="{v.name} favorite"
					/>
					<IconButton
						variant={v.id}
						toggle
						shape="square"
						bind:pressed={iconToggles[`${v.id}-sq`]}
						icon="bookmark"
						aria-label="{v.name} bookmark"
					/>
				</div>
			{/each}
			<IconButton variant="tonal" size="md" width="wide" toggle bind:pressed={iconToggles.tonal} icon="star" aria-label="Star" />
		</Demo>

		<Demo label="Disabled" spec="Icon on-surface 38% · Container on-surface 10%">
			{#each ICON_VARIANTS as v (v.id)}
				<IconButton variant={v.id} icon="delete" disabled aria-label="{v.name} disabled" />
			{/each}
			<IconButton variant="outlined" toggle pressed icon="delete" disabled aria-label="Outlined selected disabled" />
		</Demo>
	</Section>

	<!-- ================================================================== FAB -->
	<Section
		title="Floating action buttons"
		description="Three sizes and six color styles. The *-container styles replace the old primary/secondary/tertiary sets; solid primary/secondary/tertiary are new high-emphasis sets."
	>
		{#each FAB_SIZES as s (s.id)}
			<Demo label={s.name} spec={s.spec}>
				{#each FAB_COLORS as c (c.id)}
					<Fab size={s.id} color={c.id} icon={s.icon} aria-label="{c.name} {s.name}" title={c.name} />
				{/each}
			</Demo>
		{/each}

		<Demo label="Baseline (not recommended)" spec="Small FAB 40dp · Corner 12dp · Surface: surface-container-high / primary">
			<Fab size="small" icon="edit" aria-label="Small FAB" />
			<Fab color="surface" icon="edit" aria-label="Surface FAB" />
			<Fab color="surface" size="large" icon="edit" aria-label="Large surface FAB" />
		</Demo>

		{#each EXTENDED_SIZES as s (s.id)}
			<Demo label={s.name} spec={s.spec}>
				<ExtendedFab size={s.id} icon="edit" label="Compose" />
				<ExtendedFab size={s.id} color="secondary" icon="navigation" label="Navigate" />
				<ExtendedFab size={s.id} color="tertiary-container" label="Label only" />
			</Demo>
		{/each}

		<Demo
			label="Extended FAB collapse"
			spec="Collapses to a square FAB · width default-spatial + fade fast-effects; expands on fast-spatial"
			class="flex-col items-start"
		>
			<Button variant="tonal" size="xs" toggle bind:pressed={() => !fabExtended, (v) => (fabExtended = !v)}>
				<Icon name="unfold_less" data-icon="inline-start" />
				{fabExtended ? 'Collapse' : 'Expand'}
			</Button>
			<div class="flex flex-wrap items-center gap-4">
				<ExtendedFab size="small" icon="edit" label="Compose" extended={fabExtended} />
				<ExtendedFab size="medium" color="primary" icon="add" label="New item" extended={fabExtended} />
				<ExtendedFab size="large" color="tertiary-container" icon="photo_camera" label="Capture" extended={fabExtended} />
			</div>
		</Demo>
	</Section>

	<!-- ================================================================== FAB MENU -->
	<Section
		title="FAB menu"
		description="The FAB morphs into a 56dp round close button anchored at its top-trailing corner; items reveal bottom-up from the trailing edge. Esc or a click outside closes it."
	>
		<Demo
			label="Color sets"
			spec="Close 56dp full · Icon 24 → 20dp · Items 56dp, pad 24dp, gap 4dp, 8dp above close · Title medium · Fast-spatial morph, slow-effects stagger"
			class="min-h-[440px] items-end justify-around"
		>
			{#each [{ c: 'primary', size: 'default' }, { c: 'secondary', size: 'medium' }, { c: 'tertiary', size: 'large' }] as const as m (m.c)}
				<div class="flex flex-col items-center gap-3">
					<FabMenu color={m.c} size={m.size} bind:open={menuOpen[m.c]} label="Create ({m.c})">
						<FabMenuItem icon="mail" label="Email" onclick={() => (lastMenuAction = `${m.c}: Email`)} />
						<FabMenuItem icon="chat" label="Chat" onclick={() => (lastMenuAction = `${m.c}: Chat`)} />
						<FabMenuItem icon="event" label="Event" onclick={() => (lastMenuAction = `${m.c}: Event`)} />
						<FabMenuItem icon="description" label="Document" onclick={() => (lastMenuAction = `${m.c}: Document`)} />
					</FabMenu>
					<span class="type-label-sm text-on-surface-variant">{m.c} · {m.size === 'default' ? '56' : m.size === 'medium' ? '80' : '96'}dp FAB</span>
				</div>
			{/each}
		</Demo>
		<Demo label="With scrim" spec="Scrim at 32% · 6 items maximum" class="min-h-[520px] items-end justify-between">
			<p class="type-body-md max-w-64 self-start text-on-surface-variant">
				Last action: <span class="type-label-lg text-on-surface">{lastMenuAction}</span>
			</p>
			<FabMenu color="primary" size="medium" scrim bind:open={scrimMenuOpen} icon="edit" label="Edit">
				<FabMenuItem icon="photo" label="Photo" onclick={() => (lastMenuAction = 'Photo')} />
				<FabMenuItem icon="videocam" label="Video" onclick={() => (lastMenuAction = 'Video')} />
				<FabMenuItem icon="mic" label="Voice note" onclick={() => (lastMenuAction = 'Voice note')} />
				<FabMenuItem icon="checklist" label="List" onclick={() => (lastMenuAction = 'List')} />
				<FabMenuItem icon="brush" label="Drawing" onclick={() => (lastMenuAction = 'Drawing')} />
				<FabMenuItem icon="text_fields" label="Text note" onclick={() => (lastMenuAction = 'Text note')} />
			</FabMenu>
		</Demo>
	</Section>

	<!-- ================================================================== BUTTON GROUPS -->
	<Section
		title="Button groups"
		description="Standard groups keep a gap and squeeze: the pressed button grows 15% and its neighbours give the space up (fast-spatial). Connected groups replace segmented buttons: 2dp apart, only the pressed or selected button changes shape."
	>
		{#each SIZES as size (size)}
			<Demo label="Standard · {SIZE_NAMES[size]}" spec={GROUP_SPECS[size].standard}>
				<ButtonGroup {size} itemVariant="tonal">
					<ButtonGroupItem icon="arrow_back" aria-label="Back" />
					<ButtonGroupItem variant="filled">Primary action</ButtonGroupItem>
					<ButtonGroupItem>Secondary</ButtonGroupItem>
					<ButtonGroupItem icon="more_vert" aria-label="More" />
				</ButtonGroup>
			</Demo>
		{/each}

		<Demo label="Standard · single select" spec="Selected toggle: color + round ↔ square · press squeeze on the pressed item">
			{#each ['xs', 'sm', 'md'] as const as size (size)}
				<ButtonGroup {size} type="single" required itemVariant="tonal" bind:value={standardSelection[size]}>
					<ButtonGroupItem value="day">Day</ButtonGroupItem>
					<ButtonGroupItem value="week">Week</ButtonGroupItem>
					<ButtonGroupItem value="month">Month</ButtonGroupItem>
				</ButtonGroup>
			{/each}
		</Demo>

		<Demo label="Standard · icon buttons, multi select" spec="Icon toggles fill when selected">
			<ButtonGroup size="md" type="multiple" itemVariant="filled" value={['bold']}>
				<ButtonGroupItem value="bold" icon="format_bold" aria-label="Bold" />
				<ButtonGroupItem value="italic" icon="format_italic" aria-label="Italic" />
				<ButtonGroupItem value="underline" icon="format_underlined" aria-label="Underline" />
				<ButtonGroupItem value="color" icon="format_color_text" aria-label="Text color" />
			</ButtonGroup>
		</Demo>

		{#each SIZES as size (size)}
			<Demo label="Connected · {SIZE_NAMES[size]} · single select" spec={GROUP_SPECS[size].connected}>
				<ButtonGroup variant="connected" {size} type="single" required itemVariant="tonal" bind:value={connectedSelection[size]}>
					<ButtonGroupItem value="list" icon="view_list">List</ButtonGroupItem>
					<ButtonGroupItem value="grid" icon="grid_view">Grid</ButtonGroupItem>
					<ButtonGroupItem value="board" icon="view_kanban">Board</ButtonGroupItem>
				</ButtonGroup>
			</Demo>
		{/each}

		<Demo label="Connected · multi select, outlined" spec="Each selected item is fully round · neighbours unaffected">
			<ButtonGroup variant="connected" size="sm" type="multiple" itemVariant="outlined" bind:value={connectedMulti}>
				<ButtonGroupItem value="bold" icon="format_bold" aria-label="Bold" />
				<ButtonGroupItem value="italic" icon="format_italic" aria-label="Italic" />
				<ButtonGroupItem value="underline" icon="format_underlined" aria-label="Underline" />
				<ButtonGroupItem value="strike" icon="format_strikethrough" aria-label="Strikethrough" />
			</ButtonGroup>
		</Demo>

		<Demo label="Connected · square" spec="Outer corners 4 / 8 / 8 / 16 / 20dp (XS–XL) · selected full">
			<ButtonGroup variant="connected" shape="square" size="md" type="single" required itemVariant="filled" bind:value={squareConnected}>
				<ButtonGroupItem value="start" icon="format_align_left" aria-label="Align start" />
				<ButtonGroupItem value="center" icon="format_align_center" aria-label="Align center" />
				<ButtonGroupItem value="end" icon="format_align_right" aria-label="Align end" />
				<ButtonGroupItem value="justify" icon="format_align_justify" aria-label="Justify" />
			</ButtonGroup>
		</Demo>
	</Section>

	<!-- ================================================================== SPLIT BUTTON -->
	<Section
		title="Split buttons"
		description="A leading action and a trailing menu button, 2dp apart. Inner corners morph on hover, focus and press; the trailing button turns fully round while the menu is open and its chevron rotates 180°."
	>
		<Demo label="Color styles" spec={SPLIT_SPECS.sm}>
			{@render split('filled', 'sm', 'Edit')}
			{@render split('tonal', 'sm', 'Edit')}
			{@render split('outlined', 'sm', 'Edit')}
			{@render split('elevated', 'sm', 'Edit')}
		</Demo>
		{#each SIZES as size (size)}
			<Demo label={SIZE_NAMES[size]} spec={SPLIT_SPECS[size]}>
				{@render split(size === 'sm' ? 'tonal' : 'filled', size, 'Edit')}
			</Demo>
		{/each}
	</Section>

	<!-- ================================================================== SEGMENTED -->
	<Section
		title="Segmented buttons (legacy)"
		description="Baseline M3 component, no longer recommended in Expressive — use a connected button group instead. Kept for completeness."
	>
		<Demo label="Single select" spec="Height 40dp · Outline 1dp · Pad 12dp · Label large · Selected secondary-container + 18dp check">
			<SegmentedButton type="single" required bind:value={segmentedSingle}>
				<SegmentedButtonItem value="day">Day</SegmentedButtonItem>
				<SegmentedButtonItem value="week">Week</SegmentedButtonItem>
				<SegmentedButtonItem value="month">Month</SegmentedButtonItem>
				<SegmentedButtonItem value="year">Year</SegmentedButtonItem>
			</SegmentedButton>
		</Demo>
		<Demo label="Multi select with icons" spec="Icon replaced by the checkmark when selected">
			<SegmentedButton type="multiple" bind:value={segmentedMulti}>
				<SegmentedButtonItem value="walk" icon="directions_walk">Walk</SegmentedButtonItem>
				<SegmentedButtonItem value="bike" icon="directions_bike">Bike</SegmentedButtonItem>
				<SegmentedButtonItem value="transit" icon="directions_transit">Transit</SegmentedButtonItem>
			</SegmentedButton>
		</Demo>
		<Demo label="Disabled" spec="Label on-surface 38% · Outline on-surface 12%">
			<SegmentedButton type="single" value="a" disabled>
				<SegmentedButtonItem value="a">On</SegmentedButtonItem>
				<SegmentedButtonItem value="b">Off</SegmentedButtonItem>
			</SegmentedButton>
		</Demo>
	</Section>
</Page>
