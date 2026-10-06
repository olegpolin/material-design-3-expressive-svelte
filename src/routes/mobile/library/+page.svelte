<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { ButtonGroup, ButtonGroupItem } from '#lib/components/ui/button-group/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { IconButton } from '#lib/components/ui/icon-button/index.js';
	import { List, ListItem } from '#lib/components/ui/list/index.js';
	import * as Menu from '#lib/components/ui/menu/index.js';
	import { SearchBarAvatar } from '#lib/components/ui/search-bar/index.js';
	import { snackbar } from '#lib/components/ui/snackbar/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import * as Toolbar from '#lib/components/ui/toolbar/index.js';
	import { TopAppBar } from '#lib/components/ui/top-app-bar/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import ExitAction from '#lib/components/mobile/exit-action.svelte';
	import { getMobileShell } from '#lib/components/mobile/shell.svelte.js';
	import { library, user, type LibraryItem } from '#lib/components/mobile/data.js';

	type TabId = keyof typeof library;

	const shell = getMobileShell();
	const tabs: { id: TabId; label: string; icon: string; noun: string }[] = [
		{ id: 'songs', label: 'Songs', icon: 'music_note', noun: 'songs' },
		{ id: 'albums', label: 'Albums', icon: 'album', noun: 'albums' },
		{ id: 'podcasts', label: 'Podcasts', icon: 'podcasts', noun: 'shows' }
	];
	const sorts = [
		{ id: 'recent', label: 'Recently added' },
		{ id: 'az', label: 'Title A–Z' },
		{ id: 'artist', label: 'Artist' }
	] as const;

	let query = $state('');
	let tab = $state<string>('songs');
	let view = $state<string>('grid');
	let sortIndex = $state(0);
	let downloadedOnly = $state(false);
	let selecting = $state(false);
	let menuFor = $state<string | null>(null);

	const selected = new SvelteSet<string>();
	const removed = new SvelteSet<string>();
	const liked = new SvelteSet<string>(
		Object.values(library)
			.flat()
			.filter((i) => i.liked)
			.map((i) => i.id)
	);
	const downloaded = new SvelteSet<string>(
		Object.values(library)
			.flat()
			.filter((i) => i.downloaded)
			.map((i) => i.id)
	);

	let current = $derived(tabs.find((t) => t.id === tab) ?? tabs[0]);
	let sort = $derived(sorts[sortIndex]);
	let items = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const list = library[current.id].filter(
			(i) =>
				!removed.has(i.id) &&
				(!downloadedOnly || downloaded.has(i.id)) &&
				(!q || i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q))
		);
		return list.toSorted((a, b) =>
			sort.id === 'recent'
				? b.added - a.added
				: sort.id === 'az'
					? a.title.localeCompare(b.title)
					: a.subtitle.localeCompare(b.subtitle)
		);
	});

	function open(item: LibraryItem) {
		if (selecting) {
			toggleSelected(item.id);
			return;
		}
		shell.play({ id: item.id, title: item.title, artist: item.subtitle, kind: 'music', duration: 210, image: item.image });
		snackbar(`Playing ${item.title}`);
	}

	function toggleSelected(id: string) {
		if (selected.has(id)) selected.delete(id);
		else selected.add(id);
	}

	function toggleLiked(item: LibraryItem, value: boolean) {
		if (value) liked.add(item.id);
		else liked.delete(item.id);
	}

	function remove(item: LibraryItem) {
		removed.add(item.id);
		snackbar(`Removed “${item.title}”`, { action: 'Undo', onAction: () => removed.delete(item.id) });
	}

	function toggleDownload(item: LibraryItem) {
		if (downloaded.has(item.id)) {
			downloaded.delete(item.id);
			snackbar('Download removed');
		} else {
			downloaded.add(item.id);
			snackbar(`Downloading ${item.title}`);
		}
	}

	function setSelecting(value: boolean) {
		selecting = value;
		if (!value) selected.clear();
	}
</script>

{#snippet itemMenu(item: LibraryItem, trigger: 'grid' | 'list')}
	<Menu.Root bind:open={() => menuFor === item.id, (o) => (menuFor = o ? item.id : null)}>
		<Menu.Trigger>
			{#snippet child({ props })}
				<IconButton
					{...props}
					icon="more_vert"
					size="sm"
					width={trigger === 'grid' ? 'narrow' : 'default'}
					aria-label="More options for {item.title}"
				/>
			{/snippet}
		</Menu.Trigger>
		<Menu.Content align="end" class="min-w-52">
			<Menu.Group>
				<Menu.Item onSelect={() => snackbar(`“${item.title}” will play next`)}>
					<Icon name="queue_music" />Play next
				</Menu.Item>
				<Menu.Item onSelect={() => snackbar('Added to Morning Focus')}>
					<Icon name="playlist_add" />Add to playlist
				</Menu.Item>
				<Menu.Item onSelect={() => toggleDownload(item)}>
					<Icon name={downloaded.has(item.id) ? 'download_done' : 'download'} />
					{downloaded.has(item.id) ? 'Remove download' : 'Download'}
				</Menu.Item>
				<Menu.Item onSelect={() => snackbar('Link copied')}><Icon name="share" />Share</Menu.Item>
			</Menu.Group>
			<Menu.Separator />
			<Menu.Group>
				<Menu.Item variant="destructive" onSelect={() => remove(item)}>
					<Icon name="delete" />Remove from library
				</Menu.Item>
			</Menu.Group>
		</Menu.Content>
	</Menu.Root>
{/snippet}

{#snippet grid()}
	<div class="grid grid-cols-2 gap-3 px-4">
		{#each items as item (item.id)}
			{@const isSelected = selected.has(item.id)}
			<Card.Root
				variant={isSelected ? 'filled' : 'elevated'}
				shape="lg"
				class={['gap-0 pb-1', isSelected && 'bg-secondary-container text-on-secondary-container']}
				oncontextmenu={(e: MouseEvent) => {
					e.preventDefault();
					menuFor = item.id;
				}}
			>
				<Card.Media class="aspect-square bg-surface-container-highest">
					<button
						type="button"
						class={[
							'absolute inset-0 cursor-pointer overflow-hidden',
							'transition-[padding] duration-spring-fast-spatial ease-spring-fast-spatial',
							isSelected && 'p-3'
						]}
						aria-label={selecting ? `Select ${item.title}` : `Play ${item.title}`}
						aria-pressed={selecting ? isSelected : undefined}
						onclick={() => open(item)}
						{@attach ripple()}
					>
						<img
							src={item.image}
							alt=""
							loading="lazy"
							draggable="false"
							class={[
								'size-full object-cover transition-[border-radius] duration-spring-fast-spatial ease-spring-fast-spatial',
								isSelected ? 'rounded-m3-xl' : 'rounded-none'
							]}
						/>
					</button>
					{#if selecting}
						<span class="absolute start-1 top-1 rounded-m3-full bg-surface/80">
							<Checkbox
								checked={isSelected}
								onCheckedChange={() => toggleSelected(item.id)}
								aria-label="Select {item.title}"
							/>
						</span>
					{:else if downloaded.has(item.id)}
						<span
							class="pointer-events-none absolute start-2 top-2 grid size-7 place-items-center rounded-m3-full bg-surface/80 text-on-surface"
							title="Downloaded"
						>
							<Icon name="download_done" size={18} />
						</span>
					{/if}
					<IconButton
						variant="filled"
						size="sm"
						toggle
						icon="favorite"
						class="absolute end-2 top-2"
						bind:pressed={() => liked.has(item.id), (v) => toggleLiked(item, v)}
						aria-label="Favorite {item.title}"
					/>
				</Card.Media>
				<div class="flex min-w-0 items-center gap-1 ps-3 pt-2">
					<div class="flex min-w-0 flex-1 flex-col">
						<span class="type-title-sm truncate">{item.title}</span>
						<span class="type-body-sm truncate text-on-surface-variant">{item.subtitle}</span>
					</div>
					{@render itemMenu(item, 'grid')}
				</div>
			</Card.Root>
		{/each}
	</div>
{/snippet}

{#snippet list()}
	<List>
		{#each items as item (item.id)}
			<ListItem
				headline={item.title}
				supportingText={item.subtitle}
				leadingImage={item.image}
				selected={selecting ? selected.has(item.id) : undefined}
				onclick={() => open(item)}
				oncontextmenu={(e: MouseEvent) => {
					e.preventDefault();
					menuFor = item.id;
				}}
			/>
		{/each}
	</List>
{/snippet}

<TopAppBar variant="search" placeholder="Search your library" bind:searchValue={query}>
	{#snippet searchTrailing()}
		<SearchBarAvatar src={user.avatar} label="Profile and settings" onclick={() => goto('/mobile/settings')} />
	{/snippet}
	{#snippet trailing()}
		<ExitAction />
	{/snippet}
</TopAppBar>

<Tabs.Root bind:value={tab} class="pb-32">
	<Tabs.List variant="primary" class="sticky top-16 z-10" aria-label="Library sections">
		{#each tabs as t (t.id)}
			<Tabs.Trigger value={t.id} icon={t.icon}>{t.label}</Tabs.Trigger>
		{/each}
	</Tabs.List>

	<div class="flex min-h-14 items-center justify-between gap-3 ps-4 pe-4">
		<p class="type-label-lg min-w-0 truncate text-on-surface-variant" aria-live="polite">
			{#if selecting}
				{selected.size} selected
			{:else}
				{items.length} {current.noun} · {sort.label}{downloadedOnly ? ' · downloaded' : ''}
			{/if}
		</p>
		<ButtonGroup
			variant="connected"
			size="sm"
			type="single"
			required
			itemVariant="tonal"
			bind:value={view}
			class="w-[104px] shrink-0"
			aria-label="Layout"
		>
			<ButtonGroupItem value="list" icon="view_list" aria-label="List view" />
			<ButtonGroupItem value="grid" icon="grid_view" aria-label="Grid view" />
		</ButtonGroup>
	</div>

	{#each tabs as t (t.id)}
		<Tabs.Content value={t.id}>
			{#if items.length === 0}
				<div class="flex flex-col items-center gap-3 px-8 py-16 text-center text-on-surface-variant">
					<Icon name="search_off" size={48} />
					<p class="type-body-lg">No {t.noun} match{query ? ` “${query}”` : ' these filters'}.</p>
				</div>
			{:else if view === 'grid'}
				{@render grid()}
			{:else}
				{@render list()}
			{/if}
		</Tabs.Content>
	{/each}
</Tabs.Root>

<!-- floating toolbar + FAB, exits on scroll (fixed to the phone's content area) -->
<Toolbar.Floating
	color="vibrant"
	hideOnScroll
	aria-label="Library actions"
	class="fixed bottom-4 left-1/2 z-20 -translate-x-1/2"
>
	{#snippet fab()}
		<Toolbar.Fab
			icon="shuffle"
			label="Shuffle play"
			onclick={() => {
				const pick = items[Math.floor(items.length / 2)];
				if (pick) open(pick);
			}}
		/>
	{/snippet}
	<Toolbar.Button
		icon="sort"
		label="Sort: {sort.label}"
		onclick={() => {
			sortIndex = (sortIndex + 1) % sorts.length;
			snackbar(`Sorted by ${sorts[sortIndex].label.toLowerCase()}`);
		}}
	/>
	<Toolbar.Button
		icon="filter_list"
		label="Downloaded only"
		selected={downloadedOnly}
		onclick={() => (downloadedOnly = !downloadedOnly)}
	/>
	<Toolbar.Button icon="checklist" label="Select" selected={selecting} onclick={() => setSelecting(!selecting)} />
	<Menu.Root variant="vibrant">
		<Menu.Trigger>
			{#snippet child({ props })}
				<Toolbar.Button {...props} icon="more_vert" label="More actions" />
			{/snippet}
		</Menu.Trigger>
		<Menu.Content side="top" align="end" sideOffset={12} class="min-w-52">
			<Menu.Group>
				<Menu.Item
					disabled={selected.size === 0}
					onSelect={() => {
						snackbar(`${selected.size} items added to queue`);
						setSelecting(false);
					}}
				>
					<Icon name="queue_music" />Queue selection
				</Menu.Item>
				<Menu.Item onSelect={() => (view = view === 'grid' ? 'list' : 'grid')}>
					<Icon name={view === 'grid' ? 'view_list' : 'grid_view'} />{view === 'grid' ? 'List' : 'Grid'} view
				</Menu.Item>
				<Menu.Item onSelect={() => snackbar('Library refreshed')}><Icon name="sync" />Refresh</Menu.Item>
			</Menu.Group>
		</Menu.Content>
	</Menu.Root>
</Toolbar.Floating>
