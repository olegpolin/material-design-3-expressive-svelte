<script lang="ts">
	import { Button, type ButtonShape } from '#lib/components/ui/button/index.js';
	import { IconButton, type IconButtonVariant } from '#lib/components/ui/icon-button/index.js';
	import { FabMenu, FabMenuItem } from '#lib/components/ui/fab/index.js';
	import { ButtonGroup, ButtonGroupItem } from '#lib/components/ui/button-group/index.js';
	import * as SplitButton from '#lib/components/ui/split-button/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { LinearProgress, CircularProgress } from '#lib/components/ui/progress/index.js';
	import { LoadingIndicator } from '#lib/components/ui/loading-indicator/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Chip, ChipSet } from '#lib/components/ui/chip/index.js';
	import { List, ListItem } from '#lib/components/ui/list/index.js';
	import * as NavigationBar from '#lib/components/ui/navigation-bar/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import HighlightCard from './highlight-card.svelte';

	// ---------------------------------------------------------------- button ladder
	const LADDER = [
		{ size: 'xs', label: 'XS' },
		{ size: 'sm', label: 'S' },
		{ size: 'md', label: 'M' },
		{ size: 'lg', label: 'L' },
		{ size: 'xl', label: 'XL' },
	] as const;
	let ladderShape = $state('round');

	// ---------------------------------------------------------------- toggle icon buttons
	const TOGGLES: { variant: IconButtonVariant; icon: string; label: string }[] = [
		{ variant: 'standard', icon: 'favorite', label: 'Favorite' },
		{ variant: 'filled', icon: 'bookmark', label: 'Bookmark' },
		{ variant: 'tonal', icon: 'notifications', label: 'Notifications' },
		{ variant: 'outlined', icon: 'star', label: 'Star' },
	];
	let toggled = $state<Record<string, boolean>>({ favorite: true, bookmark: false, notifications: true, star: false });

	// ---------------------------------------------------------------- FAB menu
	let fabOpen = $state(false);
	let fabAction = $state<string | null>(null);
	const FAB_ITEMS = [
		{ icon: 'photo_camera', label: 'Photo' },
		{ icon: 'mic', label: 'Voice note' },
		{ icon: 'checklist', label: 'List' },
		{ icon: 'edit_note', label: 'Note' },
	];

	// ---------------------------------------------------------------- slider
	let volume = $state(64);

	// ---------------------------------------------------------------- progress
	// Simulated download: chunky steps every 700ms (the wavy indicator tweens each step over 500ms).
	let download = $state(8);
	let downloading = $state(true);
	$effect(() => {
		if (!downloading) return;
		const id = setInterval(() => {
			download = download >= 100 ? 0 : Math.min(100, download + 4 + Math.round(Math.random() * 10));
		}, 700);
		return () => clearInterval(id);
	});

	// ---------------------------------------------------------------- switches
	const SWITCHES = [
		{ id: 'wifi', icon: 'wifi', label: 'Wi-Fi', icons: true },
		{ id: 'bluetooth', icon: 'bluetooth', label: 'Bluetooth', icons: true },
		{ id: 'dnd', icon: 'do_not_disturb_on', label: 'Do not disturb', icons: 'checked' },
	] as const;
	let switches = $state<Record<string, boolean>>({ wifi: true, bluetooth: false, dnd: true });

	// ---------------------------------------------------------------- chips
	const CHIPS = [
		{ id: 'vegan', label: 'Vegan', icon: 'eco' },
		{ id: 'quick', label: 'Under 30 min', icon: 'timer' },
		{ id: 'spicy', label: 'Spicy', icon: 'local_fire_department' },
		{ id: 'gluten', label: 'Gluten-free', icon: 'grain' },
		{ id: 'budget', label: 'Budget', icon: 'savings' },
	];
	let chips = $state<Record<string, boolean>>({ vegan: true, quick: false, spicy: true, gluten: false, budget: false });
	const chipCount = $derived(Object.values(chips).filter(Boolean).length);

	// ---------------------------------------------------------------- segmented list
	const LIST = [
		{ id: 'wifi', icon: 'wifi', headline: 'Wi-Fi', sub: 'Home-5G' },
		{ id: 'hotspot', icon: 'wifi_tethering', headline: 'Hotspot', sub: 'Off' },
		{ id: 'vpn', icon: 'vpn_key', headline: 'VPN', sub: 'Not connected' },
	];
	let listSelected = $state<string[]>(['wifi']);
	function toggleListItem(id: string) {
		listSelected = listSelected.includes(id) ? listSelected.filter((x) => x !== id) : [...listSelected, id];
	}

	// ---------------------------------------------------------------- navigation bar
	const NAV: { id: string; icon: string; label: string; badge?: number | boolean }[] = [
		{ id: 'home', icon: 'home', label: 'Home' },
		{ id: 'explore', icon: 'explore', label: 'Explore', badge: 3 },
		{ id: 'saved', icon: 'bookmarks', label: 'Saved' },
		{ id: 'profile', icon: 'person', label: 'Profile', badge: true },
	];
	let nav = $state('home');
	const navLabel = $derived(NAV.find((n) => n.id === nav)?.label ?? '');

	// ---------------------------------------------------------------- split button
	let splitAction = $state<string | null>(null);
	const SPLIT_ITEMS = [
		{ icon: 'schedule_send', label: 'Schedule send' },
		{ icon: 'draft', label: 'Save draft' },
		{ icon: 'forward_to_inbox', label: 'Send a copy' },
	];
</script>

<section aria-labelledby="highlights-title" class="flex flex-col gap-8">
	<div class="flex flex-col gap-3">
		<p class="type-label-lg text-m3-primary">Highlights</p>
		<h2 id="highlights-title" class="type-headline-lg-emphasized text-on-surface">Touch the spec</h2>
		<p class="type-body-lg max-w-[60ch] text-on-surface-variant">
			Every tile is a working component, not a picture. Press, toggle, drag and open them — shapes morph and
			springs settle exactly as the M3 Expressive tokens describe.
		</p>
	</div>

	<div class="@container/bento">
		<div class="grid grid-flow-dense grid-cols-1 gap-4 @2xl/bento:grid-cols-2 @6xl/bento:grid-cols-4">
			<!-- 1. Button size ladder -->
			<HighlightCard
				title="Common buttons"
				spec="5 sizes · round / square · spring press morph"
				class="@2xl/bento:col-span-2"
				stageClass="min-h-[152px] items-end justify-start gap-3"
			>
				{#snippet action()}
					<ButtonGroup
						variant="connected"
						size="xs"
						type="single"
						required
						itemVariant="tonal"
						bind:value={ladderShape}
						aria-label="Button shape"
						class="w-auto"
					>
						<ButtonGroupItem value="round" icon="circle" aria-label="Round" />
						<ButtonGroupItem value="square" icon="square" aria-label="Square" />
					</ButtonGroup>
				{/snippet}
				{#each LADDER as step (step.size)}
					<Button
						size={step.size}
						shape={ladderShape as ButtonShape}
						variant={step.size === 'xs' || step.size === 'sm' ? 'tonal' : 'filled'}
					>
						{step.label}
					</Button>
				{/each}
			</HighlightCard>

			<!-- 2. Toggle icon buttons -->
			<HighlightCard
				title="Toggle icon buttons"
				spec="4 styles · round → square when selected · icon fills"
				variant="filled"
			>
				{#each TOGGLES as t (t.icon)}
					<IconButton
						variant={t.variant}
						size="md"
						toggle
						icon={t.icon}
						aria-label={t.label}
						bind:pressed={toggled[t.icon]}
					/>
				{/each}
			</HighlightCard>

			<!-- 3. FAB menu -->
			<HighlightCard
				title="FAB menu"
				spec="FAB morphs to close · staggered items · fast spatial"
				variant="outlined"
				class="@2xl/bento:row-span-2"
				stageClass="min-h-[344px] flex-nowrap items-end justify-between"
			>
				<p class="type-body-md pb-4 text-on-surface-variant" aria-live="polite">
					{#if fabAction}
						Created <span class="type-label-lg text-on-surface">{fabAction}</span>
					{:else}
						Open the menu
					{/if}
				</p>
				<FabMenu color="tertiary" size="medium" icon="add" label="Create" bind:open={fabOpen}>
					{#each FAB_ITEMS as item (item.label)}
						<FabMenuItem icon={item.icon} label={item.label} onclick={() => (fabAction = item.label)} />
					{/each}
				</FabMenu>
			</HighlightCard>

			<!-- 4. Progress + loading -->
			<HighlightCard
				title="Progress & loading"
				spec="Wavy linear + circular · 7-shape loading morph"
				variant="outlined"
				class="@2xl/bento:col-span-2"
				stageClass="flex-col flex-nowrap items-stretch gap-5"
			>
				<div class="flex items-center gap-4">
					<LinearProgress value={download} wavy class="flex-1" aria-label="Download progress" />
					<span class="type-label-lg w-10 text-end text-on-surface-variant tabular-nums">{download}%</span>
				</div>
				<LinearProgress indeterminate wavy aria-label="Loading" />
				<div class="flex flex-wrap items-center gap-5">
					<CircularProgress value={download} wavy aria-label="Download progress" />
					<CircularProgress indeterminate wavy aria-label="Loading" />
					<LoadingIndicator />
					<LoadingIndicator contained />
					<IconButton
						variant="tonal"
						class="ms-auto"
						icon={downloading ? 'pause' : 'play_arrow'}
						aria-label={downloading ? 'Pause progress' : 'Resume progress'}
						onclick={() => (downloading = !downloading)}
					/>
				</div>
			</HighlightCard>

			<!-- 5. Slider -->
			<HighlightCard
				title="Slider"
				spec="5 sizes · value indicator · handle narrows on press"
				variant="filled"
				stageClass="flex-col flex-nowrap items-stretch gap-2"
			>
				<div class="flex items-center gap-3 text-on-surface">
					<Icon
						name={volume === 0 ? 'volume_off' : volume < 50 ? 'volume_down' : 'volume_up'}
						size={32}
						class="text-m3-primary"
					/>
					<span class="type-display-sm-emphasized tabular-nums">{volume}</span>
				</div>
				<Slider bind:value={volume} size="md" valueIndicator aria-label="Volume" class="w-full" />
			</HighlightCard>

			<!-- 6. Navigation bar -->
			<HighlightCard
				title="Navigation bar"
				spec="Tall 80dp · pill indicator · badges"
				variant="filled"
				class="@2xl/bento:row-span-2 @6xl/bento:col-span-2"
			>
				<div
					class="relative flex h-[300px] w-[360px] max-w-full flex-col overflow-hidden rounded-m3-xl border border-outline-variant bg-surface"
				>
					<div class="flex flex-1 flex-col gap-3 overflow-hidden p-4" aria-hidden="true">
						<span class="type-title-lg text-on-surface">{navLabel}</span>
						<div class="h-24 rounded-m3-lg bg-surface-container-high"></div>
						<div class="h-4 w-3/4 rounded-m3-full bg-surface-container-highest"></div>
						<div class="h-4 w-1/2 rounded-m3-full bg-surface-container-highest"></div>
					</div>
					<NavigationBar.Root variant="tall" aria-label="Demo navigation">
						{#each NAV as item (item.id)}
							<NavigationBar.Item
								icon={item.icon}
								label={item.label}
								badge={item.badge}
								selected={nav === item.id}
								onclick={() => (nav = item.id)}
							/>
						{/each}
					</NavigationBar.Root>
				</div>
			</HighlightCard>

			<!-- 7. Switches -->
			<HighlightCard
				title="Switch"
				spec="Handle grows when on · optional icons"
				stageClass="flex-col flex-nowrap items-stretch gap-1"
			>
				{#each SWITCHES as s (s.id)}
					<div class="flex min-h-12 items-center justify-between gap-4">
						<label for="landing-switch-{s.id}" class="type-body-lg inline-flex items-center gap-3 text-on-surface">
							<Icon name={s.icon} class="text-on-surface-variant" />
							{s.label}
						</label>
						<Switch id="landing-switch-{s.id}" icons={s.icons} bind:checked={switches[s.id]} />
					</div>
				{/each}
			</HighlightCard>

			<!-- 8. Chips -->
			<HighlightCard
				title="Filter chips"
				spec="{chipCount} selected · checkmark swap · shape morph"
				variant="outlined"
				stageClass="justify-start"
			>
				<ChipSet aria-label="Recipe filters">
					{#each CHIPS as c (c.id)}
						<Chip variant="filter" icon={c.icon} morph bind:selected={chips[c.id]}>{c.label}</Chip>
					{/each}
				</ChipSet>
			</HighlightCard>

			<!-- 9. Segmented list -->
			<HighlightCard
				title="Segmented list"
				spec="2dp gaps · 16 / 4dp corners · selection rounds"
				variant="outlined"
				stageClass="items-stretch"
			>
				<List variant="segmented" class="w-full">
					{#each LIST as item (item.id)}
						<ListItem
							headline={item.headline}
							supportingText={item.sub}
							leadingIcon={item.icon}
							trailingIcon={listSelected.includes(item.id) ? 'check' : undefined}
							selected={listSelected.includes(item.id)}
							onclick={() => toggleListItem(item.id)}
						/>
					{/each}
				</List>
			</HighlightCard>

			<!-- 10. Split button -->
			<HighlightCard
				title="Split button"
				spec="2dp gap · inner corners morph · chevron turns"
				stageClass="flex-col flex-nowrap gap-3"
			>
				<SplitButton.Root variant="filled" size="md">
					<SplitButton.Leading onclick={() => (splitAction = 'Sent')}>
						<Icon name="send" data-icon="inline-start" />
						Send
					</SplitButton.Leading>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<SplitButton.Trailing {...props} aria-label="More send options" />
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" sideOffset={4} class="w-auto min-w-48">
							<DropdownMenu.Group>
								{#each SPLIT_ITEMS as item (item.label)}
									<DropdownMenu.Item onSelect={() => (splitAction = item.label)}>
										<Icon name={item.icon} size={20} />
										{item.label}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</SplitButton.Root>
				<p class="type-body-md text-on-surface-variant" aria-live="polite">{splitAction ?? 'Try both halves'}</p>
			</HighlightCard>
		</div>
	</div>
</section>
