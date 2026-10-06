<script lang="ts">
	import { Page, Section, Demo } from '#lib/components/showcase/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as BottomSheet from '#lib/components/ui/bottom-sheet/index.js';
	import * as SideSheet from '#lib/components/ui/side-sheet/index.js';
	import { List, ListItem, ListSubheader } from '#lib/components/ui/list/index.js';
	import { Divider } from '#lib/components/ui/divider/index.js';
	import { Carousel, CarouselItem } from '#lib/components/ui/carousel/index.js';
	import { shapePath, SHAPE_LABELS, type ShapeName } from '#lib/m3/shapes.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';

	const img = (seed: number | string, w = 600, h = 400) => `https://picsum.photos/seed/m3e${seed}/${w}/${h}`;

	// ------------------------------------------------------------------ cards
	const CARD_VARIANTS = [
		{ id: 'elevated', name: 'Elevated', spec: 'surface-container-low · level1 (hover level2) · corner 12dp' },
		{ id: 'filled', name: 'Filled', spec: 'surface-container-highest · level0 (hover level1) · corner 12dp' },
		{ id: 'outlined', name: 'Outlined', spec: 'surface · 1dp outline-variant (focus on-surface) · corner 12dp' }
	] as const;

	let clicks = $state(0);

	// draggable card: dragged = level4 (elevated) + 16% on-surface layer; springs back on release
	let drag = $state({ active: false, x: 0, y: 0 });
	let dragStart = { x: 0, y: 0 };
	function onDragStart(e: PointerEvent & { currentTarget: HTMLElement }) {
		e.currentTarget.setPointerCapture(e.pointerId);
		dragStart = { x: e.clientX - drag.x, y: e.clientY - drag.y };
		drag.active = true;
	}
	function onDragMove(e: PointerEvent) {
		if (!drag.active) return;
		drag.x = e.clientX - dragStart.x;
		drag.y = e.clientY - dragStart.y;
	}
	function onDragEnd() {
		drag = { active: false, x: 0, y: 0 };
	}

	// ------------------------------------------------------------------ dialogs
	let ringtone = $state('Callisto');
	const RINGTONES = ['None', 'Callisto', 'Ganymede', 'Luna', 'Oberon', 'Phobos', 'Dione', 'Titan', 'Europa', 'Io', 'Rhea'];

	// ------------------------------------------------------------------ sheets
	let phoneFrame = $state<HTMLElement | null>(null);
	let standardSnap = $state<number | string | null>('56px');
	const STANDARD_SNAPS = ['56px', 0.45, 0.88];
	let modalSnap = $state<number | string | null>(0.5);
	let standardSideOpen = $state(true);

	// ------------------------------------------------------------------ lists
	let selectedFolder = $state('inbox');
	let segmentedSelected = $state<string[]>(['wifi']);
	function toggleSegmented(id: string) {
		segmentedSelected = segmentedSelected.includes(id)
			? segmentedSelected.filter((x) => x !== id)
			: [...segmentedSelected, id];
	}

	// ------------------------------------------------------------------ carousel
	const PLACES = [
		{ label: 'Coastline', sub: 'Big Sur' },
		{ label: 'Alpine lake', sub: 'Dolomites' },
		{ label: 'Desert dunes', sub: 'Sahara' },
		{ label: 'Old town', sub: 'Lisbon' },
		{ label: 'Rainforest', sub: 'Costa Rica' },
		{ label: 'Glacier', sub: 'Iceland' },
		{ label: 'Canyon', sub: 'Utah' },
		{ label: 'Harbor', sub: 'Hamburg' }
	];
	const SHAPE_PLACEHOLDERS: { shape: ShapeName; cls: string }[] = [
		{ shape: 'cookie9Sided', cls: 'bg-primary-container text-m3-primary' },
		{ shape: 'clover4Leaf', cls: 'bg-secondary-container text-m3-secondary' },
		{ shape: 'sunny', cls: 'bg-tertiary-container text-tertiary' },
		{ shape: 'puffy', cls: 'bg-primary-fixed text-on-primary-fixed-variant' },
		{ shape: 'flower', cls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
		{ shape: 'gem', cls: 'bg-secondary-fixed text-on-secondary-fixed-variant' }
	];
</script>

<svelte:head>
	<title>Containment · M3 Expressive</title>
</svelte:head>

{#snippet phoneStatusBar()}
	<div class="flex h-8 shrink-0 items-center justify-between px-5 type-label-md text-on-surface">
		<span>9:41</span>
		<span class="flex items-center gap-1">
			<Icon name="signal_cellular_alt" size={16} />
			<Icon name="wifi" size={16} />
			<Icon name="battery_full" size={16} />
		</span>
	</div>
{/snippet}

{#snippet fakeContent(count: number)}
	<List class="bg-transparent">
		{#each Array.from({ length: count }, (_, i) => i) as i (i)}
			<ListItem
				headline={PLACES[i % PLACES.length].label}
				supportingText={PLACES[i % PLACES.length].sub}
				leadingAvatar={PLACES[i % PLACES.length].label[0]}
				onclick={() => {}}
			/>
		{/each}
	</List>
{/snippet}

<Page
	title="Containment"
	description="Cards, dialogs, bottom and side sheets, lists, dividers and carousels — the M3 Expressive surfaces that hold and group content. Everything below is live: hover, press, drag and open them."
>
	<!-- ============================================================== CARDS -->
	<Section
		title="Cards"
		description="Three container styles with a 12dp corner. Interactive cards get a state layer, ripple and one elevation level on hover; elevation and color changes run on the default-effects spring."
	>
		<div class="grid gap-6 md:grid-cols-3">
			{#each CARD_VARIANTS as v (v.id)}
				<Demo label={v.name} spec={v.spec} class="items-stretch">
					<Card.Root variant={v.id} class="w-full">
						<Card.Header>
							<Card.Title>{v.name} card</Card.Title>
							<Card.Description>Supporting text</Card.Description>
						</Card.Header>
						<Card.Content>
							Cards contain content and actions about a single subject. 16dp side padding.
						</Card.Content>
					</Card.Root>
				</Demo>
			{/each}
		</div>

		<Demo
			label="Interactive"
			spec="Whole card is one action · state layer on-surface 8 / 10 / 10% · ripple · hover +1 level · focus ring 3dp secondary"
		>
			{#each CARD_VARIANTS as v (v.id)}
				<Card.Root variant={v.id} interactive class="w-56" onclick={() => clicks++}>
					<Card.Header>
						<Card.Title>{v.name}</Card.Title>
						<Card.Description>Click, hover or Tab + Enter</Card.Description>
					</Card.Header>
					<Card.Content>
						<span class="inline-flex items-center gap-2 text-m3-primary">
							<Icon name="touch_app" size={24} />
							{clicks} clicks
						</span>
					</Card.Content>
				</Card.Root>
			{/each}
			<Card.Root variant="filled" href="#cards" class="w-56">
				<Card.Header>
					<Card.Title>Link card</Card.Title>
					<Card.Description>Rendered as &lt;a&gt; via href</Card.Description>
				</Card.Header>
			</Card.Root>
		</Demo>

		<div class="grid gap-6 lg:grid-cols-2">
			<Demo
				label="With media and actions"
				spec="Media full-bleed (inherits top corners) or inset (12dp) · actions end-aligned, 8dp gap"
				class="items-start"
			>
				<Card.Root variant="elevated" class="w-64">
					<Card.Media src={img(11)} alt="Mountain landscape" />
					<Card.Header>
						<Card.Title>Weekend trip</Card.Title>
						<Card.Description>3 nights · from $420</Card.Description>
					</Card.Header>
					<Card.Content>Hike to the summit, then unwind at a lakeside cabin.</Card.Content>
					<Card.Footer>
						<Button variant="outlined">Details</Button>
						<Button variant="filled">Book</Button>
					</Card.Footer>
				</Card.Root>
				<Card.Root variant="outlined" class="w-64">
					<Card.Header>
						<Card.Title>Inset media</Card.Title>
						<Card.Description>Card.Media inset</Card.Description>
						<Card.Action>
							<Icon name="more_vert" size={24} class="text-on-surface-variant" />
						</Card.Action>
					</Card.Header>
					<Card.Media src={img(12)} alt="City street" inset />
					<Card.Footer>
						<Button variant="text">Share</Button>
						<Button variant="tonal">Save</Button>
					</Card.Footer>
				</Card.Root>
			</Demo>

			<div class="flex flex-col gap-6">
				<Demo
					label="Expressive shapes"
					spec="shape md 12dp (spec) · lg 16 · xl 28 · xxl 48"
				>
					{#each ['md', 'lg', 'xl', 'xxl'] as const as s (s)}
						<Card.Root variant="filled" shape={s} class="size-24 items-center justify-center">
							<span class="type-label-lg text-on-surface-variant">{s}</span>
						</Card.Root>
					{/each}
				</Demo>
				<Demo
					label="Disabled · dragged"
					spec="Disabled content 38% · dragged level4 (elevated) / level3 + 16% on-surface layer — drag the right card"
				>
					<Card.Root variant="elevated" interactive disabled class="w-36">
						<Card.Header>
							<Card.Title>Disabled</Card.Title>
							<Card.Description>aria-disabled</Card.Description>
						</Card.Header>
					</Card.Root>
					<Card.Root
						variant="elevated"
						dragged={drag.active}
						class={[
							'w-36 cursor-grab touch-none select-none',
							drag.active
								? 'cursor-grabbing'
								: 'transition-[translate,box-shadow] duration-spring-default-spatial ease-spring-default-spatial'
						]}
						style="translate: {drag.x}px {drag.y}px"
						onpointerdown={onDragStart}
						onpointermove={onDragMove}
						onpointerup={onDragEnd}
						onpointercancel={onDragEnd}
					>
						<Card.Header>
							<Card.Title>Drag me</Card.Title>
							<Card.Description>{drag.active ? 'Dragged' : 'Enabled'}</Card.Description>
						</Card.Header>
					</Card.Root>
				</Demo>
			</div>
		</div>
	</Section>

	<!-- ============================================================== DIALOGS -->
	<Section
		title="Dialogs"
		description="Basic dialogs are 280–560dp wide with 28dp corners, 24dp padding and surface-container-high at level3 over a 32% scrim. They fade in while scaling 0.8 → 1 on the default-spatial spring and leave on fast-effects."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo
				label="Basic"
				spec="Headline small 24/32 · body medium · title→body 16dp · body→actions 24dp · actions 8dp gap, end-aligned"
			>
				<Dialog.Root>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="filled">Open basic dialog</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Discard draft?</Dialog.Title>
							<Dialog.Description>
								Your message will be deleted from this device. Drafts synced to other devices are kept.
							</Dialog.Description>
						</Dialog.Header>
						<Dialog.Footer>
							<Dialog.Close>
								{#snippet child({ props })}<Button {...props} variant="text">Cancel</Button>{/snippet}
							</Dialog.Close>
							<Dialog.Close>
								{#snippet child({ props })}<Button {...props} variant="text">Discard</Button>{/snippet}
							</Dialog.Close>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			</Demo>

			<Demo label="With hero icon" spec="Icon 24dp secondary · icon→title 16dp · content centered">
				<Dialog.Root>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="tonal">
								<Icon name="restart_alt" data-icon="inline-start" />Reset settings
							</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content icon="restart_alt">
						<Dialog.Header>
							<Dialog.Title>Reset settings?</Dialog.Title>
							<Dialog.Description>
								This will reset your app preferences back to their default settings. Your files and
								accounts are not affected.
							</Dialog.Description>
						</Dialog.Header>
						<Dialog.Footer>
							<Dialog.Close>
								{#snippet child({ props })}<Button {...props} variant="text">Cancel</Button>{/snippet}
							</Dialog.Close>
							<Dialog.Close>
								{#snippet child({ props })}<Button {...props} variant="text">Accept</Button>{/snippet}
							</Dialog.Close>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			</Demo>

			<Demo
				label="Scrolling list content"
				spec="Dialog.Body scrolls · 1dp outline dividers appear while content overflows · max height 100vh − 160dp"
			>
				<Dialog.Root>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outlined">Phone ringtone: {ringtone}</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content class="max-h-[min(520px,calc(100dvh-160px))] w-[min(360px,calc(100vw-48px))]">
						<Dialog.Header>
							<Dialog.Title>Phone ringtone</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body class="px-0">
							<List class="bg-transparent py-0">
								{#each RINGTONES as tone (tone)}
									<ListItem
										headline={tone}
										selected={ringtone === tone}
										leadingIcon={ringtone === tone ? 'radio_button_checked' : 'radio_button_unchecked'}
										onclick={() => (ringtone = tone)}
									/>
								{/each}
							</List>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.Close>
								{#snippet child({ props })}<Button {...props} variant="text">Cancel</Button>{/snippet}
							</Dialog.Close>
							<Dialog.Close>
								{#snippet child({ props })}<Button {...props} variant="text">OK</Button>{/snippet}
							</Dialog.Close>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			</Demo>

			<Demo
				label="Full-screen"
				spec="Header 56dp · close icon 24dp · title large · surface · header on scroll surface-container + level2 · body padding 24dp"
			>
				{#each [{ mode: 'always', label: 'Full-screen' }, { mode: true, label: 'Adaptive (full-screen < 600dp)' }] as const as fs (fs.label)}
					<Dialog.Root>
						<Dialog.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant={fs.mode === 'always' ? 'filled' : 'outlined'}>{fs.label}</Button>
							{/snippet}
						</Dialog.Trigger>
						<Dialog.Content fullscreen={fs.mode}>
							<Dialog.Header>
								<Dialog.Title>New event</Dialog.Title>
								<Dialog.Close>
									{#snippet child({ props })}<Button {...props} variant="text">Save</Button>{/snippet}
								</Dialog.Close>
							</Dialog.Header>
							<Dialog.Body>
								<div class="mx-auto flex max-w-[560px] flex-col gap-2">
									<Dialog.Description>
										Scroll this content: the header turns surface-container with level2 elevation.
									</Dialog.Description>
									<List class="-mx-4 bg-transparent">
										<ListItem headline="Team sync" supportingText="Title" leadingIcon="title" />
										<ListItem headline="Tue, Oct 6 · 10:00 – 10:30" supportingText="Time" leadingIcon="schedule" />
										<ListItem headline="Room 4B, Building 41" supportingText="Location" leadingIcon="location_on" />
										<ListItem headline="Every week" supportingText="Repeat" leadingIcon="repeat" />
										<ListItem headline="10 minutes before" supportingText="Reminder" leadingIcon="notifications" />
										<ListItem headline="Busy" supportingText="Availability" leadingIcon="event_busy" />
									</List>
									<Divider />
									{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
										<p class="type-body-md text-on-surface-variant">
											Notes paragraph {i + 1}. Full-screen dialogs fill the whole window on compact screens and hold
											complex tasks with multiple inputs.
										</p>
									{/each}
								</div>
							</Dialog.Body>
						</Dialog.Content>
					</Dialog.Root>
				{/each}
			</Demo>

			<Demo
				label="Alert dialog"
				spec="Same container (28dp, surface-container-high, level3) · Media = hero icon · Action / Cancel = text buttons"
			>
				<AlertDialog.Root>
					<AlertDialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="tonal">
								<Icon name="delete" data-icon="inline-start" />Delete album
							</Button>
						{/snippet}
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Media><Icon name="delete" /></AlertDialog.Media>
							<AlertDialog.Title>Permanently delete?</AlertDialog.Title>
							<AlertDialog.Description>
								Deleting “Summer 2026” also removes its 248 photos from all synced devices. This can’t be
								undone.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action>Delete</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</Demo>
		</div>
	</Section>

	<!-- ============================================================== BOTTOM SHEETS -->
	<Section
		title="Bottom sheets"
		description="surface-container-low with 28dp top corners, max 640dp wide, level1. A 32 × 4dp drag handle sits in a 48dp touch area (22dp above and below). Show / settle on the default-spatial spring, hide on fast-effects."
	>
		<div class="grid gap-6 md:grid-cols-2">
			<Demo
				label="Standard"
				spec="No scrim, page stays interactive · starts at the 56dp peek · snap points 56dp / 45% / 88% · drag the handle up"
				class="justify-center"
			>
				<div
					bind:this={phoneFrame}
					class="relative flex h-[560px] w-[300px] flex-col overflow-hidden rounded-m3-xl border border-outline-variant bg-surface"
				>
					{@render phoneStatusBar()}
					<div class="px-4 pt-2 pb-1 type-title-lg text-on-surface">Places</div>
					<div class="min-h-0 flex-1 overflow-y-auto">
						{@render fakeContent(8)}
					</div>
					{#if phoneFrame}
						<BottomSheet.Root
							open
							modal={false}
							dismissible={false}
							container={phoneFrame}
							snapPoints={STANDARD_SNAPS}
							bind:activeSnapPoint={standardSnap}
						>
							<BottomSheet.Content>
								<BottomSheet.Header>
									<BottomSheet.Title>Nearby</BottomSheet.Title>
									<BottomSheet.Description>4 places within 2 km</BottomSheet.Description>
								</BottomSheet.Header>
								<List class="bg-transparent py-0">
									<ListItem headline="Harbor café" supportingText="0.4 km · Open" leadingIcon="local_cafe" trailingText="4.6" />
									<ListItem headline="City museum" supportingText="0.9 km · Closes 6 PM" leadingIcon="museum" trailingText="4.8" />
									<ListItem headline="Riverside park" supportingText="1.2 km" leadingIcon="park" trailingText="4.5" />
									<ListItem headline="Night market" supportingText="1.8 km · Opens 7 PM" leadingIcon="storefront" trailingText="4.3" />
								</List>
							</BottomSheet.Content>
						</BottomSheet.Root>
					{/if}
				</div>
			</Demo>

			<div class="flex flex-col gap-6">
				<Demo label="Modal" spec="Scrim 32% · drag down or tap the scrim to dismiss · top margin 72dp (56dp > 640dp)">
					<BottomSheet.Root>
						<BottomSheet.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="filled">Open modal sheet</Button>
							{/snippet}
						</BottomSheet.Trigger>
						<BottomSheet.Content>
							<BottomSheet.Header>
								<BottomSheet.Title>Share to</BottomSheet.Title>
								<BottomSheet.Description>Pick an app or contact</BottomSheet.Description>
							</BottomSheet.Header>
							<div class="grid grid-cols-4 gap-y-4 px-4 pb-2">
								{#each [['mail', 'Email'], ['chat', 'Messages'], ['link', 'Copy link'], ['bluetooth', 'Nearby'], ['print', 'Print'], ['cloud_upload', 'Drive'], ['qr_code_2', 'QR code'], ['more_horiz', 'More']] as [icon, name] (name)}
									<button
										type="button"
										class="flex cursor-pointer flex-col items-center gap-2 rounded-m3-lg py-2 text-on-surface"
										{@attach ripple()}
									>
										<span class="flex size-14 items-center justify-center rounded-m3-lg bg-secondary-container text-on-secondary-container">
											<Icon name={icon} size={24} />
										</span>
										<span class="type-label-md">{name}</span>
									</button>
								{/each}
							</div>
							<BottomSheet.Footer>
								<BottomSheet.Close>
									{#snippet child({ props })}<Button {...props} variant="text">Cancel</Button>{/snippet}
								</BottomSheet.Close>
							</BottomSheet.Footer>
						</BottomSheet.Content>
					</BottomSheet.Root>
				</Demo>
				<Demo label="Modal with snap points" spec="snapPoints 50% / 90% · scrim fades in at the last snap point">
					<BottomSheet.Root snapPoints={[0.5, 0.9]} bind:activeSnapPoint={modalSnap}>
						<BottomSheet.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="tonal">Open expandable sheet</Button>
							{/snippet}
						</BottomSheet.Trigger>
						<BottomSheet.Content>
							<BottomSheet.Header>
								<BottomSheet.Title>Comments</BottomSheet.Title>
								<BottomSheet.Description>Drag up to expand · snap {modalSnap}</BottomSheet.Description>
							</BottomSheet.Header>
							<div class="min-h-0 flex-1 overflow-y-auto">
								{@render fakeContent(12)}
							</div>
						</BottomSheet.Content>
					</BottomSheet.Root>
				</Demo>
			</div>
		</div>
	</Section>

	<!-- ============================================================== SIDE SHEETS -->
	<Section
		title="Side sheets"
		description="Standard sheets sit inline (surface, 256dp default, max 400dp, 1dp divider) and animate their width; modal sheets are surface-container-low at level1 with 16dp corners on the inner edge over a 32% scrim."
	>
		<Demo
			label="Standard"
			spec="Inline · surface · width 256dp · divider outline-variant · title large on-surface-variant · 24dp padding · actions 72dp"
			class="p-0"
		>
			<SideSheet.Root variant="standard" bind:open={standardSideOpen}>
				<div class="flex h-[420px] w-full overflow-hidden rounded-m3-xl bg-surface">
					<div class="flex min-w-0 flex-1 flex-col gap-4 p-6">
						<div class="flex items-center justify-between gap-2">
							<span class="type-title-lg text-on-surface">Inbox</span>
							<SideSheet.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="tonal">
										<Icon name={standardSideOpen ? 'right_panel_close' : 'right_panel_open'} data-icon="inline-start" />
										{standardSideOpen ? 'Hide filters' : 'Show filters'}
									</Button>
								{/snippet}
							</SideSheet.Trigger>
						</div>
						<div class="grid min-h-0 flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 overflow-y-auto">
							{#each PLACES as p, i (p.label)}
								<Card.Root variant="filled" class="gap-2 pt-0">
									<Card.Media src={img(30 + i, 300, 200)} alt={p.label} />
									<Card.Content class="type-label-lg text-on-surface">{p.label}</Card.Content>
								</Card.Root>
							{/each}
						</div>
					</div>
					<SideSheet.Content>
						<SideSheet.Header>
							<SideSheet.Title>Filters</SideSheet.Title>
						</SideSheet.Header>
						<SideSheet.Body class="px-0">
							<List class="bg-transparent py-0">
								<ListItem headline="Unread only" leadingIcon="mark_email_unread" onclick={() => {}} />
								<ListItem headline="Starred" leadingIcon="star" onclick={() => {}} />
								<ListItem headline="Attachments" leadingIcon="attach_file" onclick={() => {}} />
							</List>
						</SideSheet.Body>
						<SideSheet.Footer>
							<Button variant="filled" size="xs">Apply</Button>
							<SideSheet.Close>
								{#snippet child({ props })}<Button {...props} variant="outlined" size="xs">Cancel</Button>{/snippet}
							</SideSheet.Close>
						</SideSheet.Footer>
					</SideSheet.Content>
				</div>
			</SideSheet.Root>
		</Demo>

		<Demo
			label="Modal"
			spec="surface-container-low · level1 · 16dp inner corners · max 400dp · scrim 32% · detached: 16dp margins + corners"
		>
			{#each [{ detached: false, side: 'end', label: 'Modal (end)' }, { detached: false, side: 'start', label: 'Modal (start)' }, { detached: true, side: 'end', label: 'Detached' }] as const as m (m.label)}
				<SideSheet.Root>
					<SideSheet.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant={m.detached ? 'tonal' : 'outlined'}>{m.label}</Button>
						{/snippet}
					</SideSheet.Trigger>
					<SideSheet.Content side={m.side} detached={m.detached} width={360}>
						<SideSheet.Header onBack={m.detached ? () => {} : undefined}>
							<SideSheet.Title>Edit details</SideSheet.Title>
						</SideSheet.Header>
						<SideSheet.Body class="flex flex-col gap-4">
							<SideSheet.Description>
								Side sheets show secondary content anchored to the edge of the screen.
							</SideSheet.Description>
							<List variant="segmented" class="-mx-2">
								<ListItem headline="Name" supportingText="Summer 2026" leadingIcon="badge" onclick={() => {}} />
								<ListItem headline="Location" supportingText="Lisbon, Portugal" leadingIcon="location_on" onclick={() => {}} />
								<ListItem headline="Shared with" supportingText="3 people" leadingIcon="group" onclick={() => {}} />
							</List>
						</SideSheet.Body>
						<SideSheet.Footer>
							<SideSheet.Close>
								{#snippet child({ props })}<Button {...props} variant="filled" size="xs">Save</Button>{/snippet}
							</SideSheet.Close>
							<SideSheet.Close>
								{#snippet child({ props })}<Button {...props} variant="outlined" size="xs">Cancel</Button>{/snippet}
							</SideSheet.Close>
						</SideSheet.Footer>
					</SideSheet.Content>
				</SideSheet.Root>
			{/each}
		</Demo>
	</Section>

	<!-- ============================================================== LISTS -->
	<Section
		title="Lists"
		description="Expressive list items: 56 / 72 / 88dp for one / two / three lines, 16dp side padding, 10dp vertical padding, 12dp between slots. Interactive items morph their corners on the fast-spatial spring (hover 12dp, pressed 16dp); selection fills secondary-container with 16dp corners."
	>
		<div class="grid gap-6 lg:grid-cols-2">
			<Demo label="One line" spec="56dp · leading icon 24dp / avatar 40dp · trailing icon / text label-small" class="p-0">
				<List class="w-full rounded-m3-xl">
					<ListItem headline="Leading icon" leadingIcon="inbox" trailingIcon="chevron_right" />
					<ListItem headline="Leading avatar" leadingAvatar="A" trailingText="100+" />
					<ListItem headline="Leading image" leadingImage={img(41, 112, 112)} trailingIcon="more_vert" />
					<ListItem headline="Headline only" />
				</List>
			</Demo>

			<Demo label="Two lines" spec="72dp · headline body-large · supporting body-medium on-surface-variant" class="p-0">
				<List class="w-full rounded-m3-xl">
					<ListItem
						headline="Ali Connors"
						supportingText="Brunch this weekend?"
						leadingAvatar={{ src: img(51, 80, 80), alt: '' }}
						trailingText="10 min"
					/>
					<ListItem headline="Overline + headline" overline="Overline" leadingIcon="label" trailingIcon="star" />
					<ListItem
						headline="Leading video"
						supportingText="114 × 64dp thumbnail"
						leadingVideo={img(52, 228, 128)}
						trailingText="3:24"
					/>
				</List>
			</Demo>

			<Demo label="Three lines" spec="88dp · leading / trailing top-aligned · supporting text up to 2 lines or overline + 1 line" class="p-0">
				<List class="w-full rounded-m3-xl" dividers>
					<ListItem
						overline="Travel"
						headline="Summer itinerary"
						supportingText="Flights, hotels and a day trip to Sintra"
						leadingImage={img(61, 112, 112)}
						trailingText="Jun 12"
					/>
					<ListItem
						headline="Two-line supporting text"
						supportingText="Supporting text that is long enough to wrap onto a second line and then get clamped."
						lines={3}
						leadingAvatar="M"
						trailingIcon="more_vert"
					/>
					<ListItem
						overline="Video"
						headline="Product walkthrough"
						supportingText="12 min · 1.2k views"
						leadingVideo={img(62, 228, 128)}
					/>
				</List>
			</Demo>

			<Demo
				label="Interactive · selected · disabled · dividers"
				spec="Selected secondary-container + emphasized headline · disabled 38% · dividers 1dp inset 16dp"
				class="p-0"
			>
				<List class="w-full rounded-m3-xl" dividers>
					<ListSubheader>Folders</ListSubheader>
					{#each [['inbox', 'Inbox', '24'], ['send', 'Sent', ''], ['drafts', 'Drafts', '3'], ['delete', 'Trash', '']] as [icon, name, count] (icon)}
						<ListItem
							headline={name}
							leadingIcon={icon}
							trailingText={count}
							selected={selectedFolder === icon}
							onclick={() => (selectedFolder = icon)}
						/>
					{/each}
					<ListItem headline="Archive (disabled)" leadingIcon="archive" disabled onclick={() => {}} />
					<ListItem headline="Link item" supportingText="href → <a>" leadingIcon="open_in_new" href="#lists" />
				</List>
			</Demo>
		</div>

		<Demo
			label="Segmented (expressive)"
			spec="2dp gaps · 4dp inner / 16dp outer corners · hover 12dp · pressed / selected 16dp · surface-container tiles"
			class="justify-center"
		>
			<div class="flex w-full max-w-md flex-col gap-4">
				<List variant="segmented">
					{#each [['wifi', 'Wi-Fi', 'Home-5G'], ['bluetooth', 'Bluetooth', '2 devices'], ['airplanemode_active', 'Airplane mode', 'Off'], ['data_saver_on', 'Data saver', 'Off']] as [icon, name, sub] (icon)}
						<ListItem
							headline={name}
							supportingText={sub}
							leadingIcon={icon}
							trailingIcon={segmentedSelected.includes(icon) ? 'check' : undefined}
							selected={segmentedSelected.includes(icon)}
							onclick={() => toggleSegmented(icon)}
						/>
					{/each}
				</List>
				<List variant="segmented">
					<ListSubheader>Display</ListSubheader>
					<ListItem headline="Brightness" leadingIcon="brightness_6" trailingText="Adaptive" onclick={() => {}} />
					<ListItem headline="Dark theme" leadingIcon="dark_mode" trailingText="System" onclick={() => {}} />
					<ListSubheader>Sound</ListSubheader>
					<ListItem headline="Volume" leadingIcon="volume_up" onclick={() => {}} />
				</List>
			</div>
		</Demo>
	</Section>

	<!-- ============================================================== DIVIDERS -->
	<Section title="Divider" description="1dp outline-variant hairlines that group content. Use them sparingly; spacing and surfaces usually separate better.">
		<Demo label="Horizontal" spec="Full width · inset start 16dp · middle inset 16dp both sides" class="p-0">
			<div class="flex w-full flex-col rounded-m3-xl bg-surface py-2">
				<div class="px-4 py-3 type-body-lg text-on-surface">Full width</div>
				<Divider />
				<div class="px-4 py-3 type-body-lg text-on-surface">Inset (start)</div>
				<Divider inset="start" />
				<div class="px-4 py-3 type-body-lg text-on-surface">Middle inset</div>
				<Divider inset="middle" />
				<div class="px-4 py-3 type-body-lg text-on-surface">End</div>
			</div>
		</Demo>
		<Demo label="Vertical" spec="1dp wide · stretches to the container · inset start / middle 16dp">
			<div class="flex h-24 items-stretch gap-4 rounded-m3-lg bg-surface px-4">
				<span class="self-center type-label-lg">Full</span>
				<Divider orientation="vertical" />
				<span class="self-center type-label-lg">Start inset</span>
				<Divider orientation="vertical" inset="start" />
				<span class="self-center type-label-lg">Middle inset</span>
				<Divider orientation="vertical" inset="middle" />
				<span class="self-center type-label-lg">End</span>
			</div>
		</Demo>
	</Section>

	<!-- ============================================================== CAROUSEL -->
	<Section
		title="Carousel"
		description="Items have 28dp corners and 8dp gaps. Multi-browse and hero items are masked as they move through the keylines (small items clamp(large ÷ 3, 40, 56)dp); snapping uses a spring of stiffness 400, critically damped. Drag, swipe or use ← → after focusing an item."
	>
		<Demo
			label="Multi-browse"
			spec="Large ≈ 186dp + medium + small · 16dp side / 8dp top-bottom padding · snaps item by item, flings may skip"
			class="block p-0 py-2"
		>
			<Carousel layout="multi-browse" height={220} aria-label="Places (multi-browse)">
				{#each PLACES as p, i (p.label)}
					<CarouselItem src={img(70 + i)} alt={p.label} label={p.label} onclick={() => {}} />
				{/each}
			</Carousel>
		</Demo>

		<Demo
			label="Hero"
			spec="1 large + 1 small (56dp) · one item per swipe · label fades as the item shrinks"
			class="block p-0 py-2"
		>
			<Carousel layout="hero" height={260} aria-label="Places (hero)">
				{#each PLACES as p, i (p.label)}
					<CarouselItem
						src={img(80 + i, 900, 500)}
						alt={p.label}
						label={p.label}
						supportingText={p.sub}
						onclick={() => {}}
					/>
				{/each}
			</Carousel>
		</Demo>

		<Demo
			label="Uncontained"
			spec="Fixed 160dp items · 16dp leading padding · items bleed past the trailing edge · free scroll (no snap)"
			class="block p-0 py-2"
		>
			<Carousel layout="uncontained" itemWidth={160} height={200} aria-label="Shapes (uncontained)">
				{#each [...SHAPE_PLACEHOLDERS, ...SHAPE_PLACEHOLDERS] as s, i (i)}
					<CarouselItem label={SHAPE_LABELS[s.shape]} onclick={() => {}}>
						<div class={['absolute inset-0 flex items-center justify-center', s.cls]}>
							<svg viewBox="0 0 100 100" class="size-24" aria-hidden="true">
								<path d={shapePath(s.shape)} fill="currentColor" />
							</svg>
						</div>
					</CarouselItem>
				{/each}
			</Carousel>
		</Demo>

		<Demo
			label="Full-screen"
			spec="One item per page · no padding · 16dp gap · vertical axis (axis='y') · swipe up / down"
			class="justify-center"
		>
			<div class="flex h-[560px] w-[300px] flex-col overflow-hidden rounded-m3-xl border border-outline-variant bg-surface-container-lowest">
				{@render phoneStatusBar()}
				<Carousel layout="full-screen" axis="y" height={528} aria-label="Stories (full-screen)">
					{#each PLACES.slice(0, 5) as p, i (p.label)}
						<CarouselItem src={img(90 + i, 600, 1100)} alt={p.label} label={p.label} supportingText={p.sub} />
					{/each}
				</Carousel>
			</div>
		</Demo>
	</Section>
</Page>
