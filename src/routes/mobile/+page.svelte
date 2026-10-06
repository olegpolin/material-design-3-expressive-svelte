<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Carousel, CarouselItem } from '#lib/components/ui/carousel/index.js';
	import { Chip, ChipSet } from '#lib/components/ui/chip/index.js';
	import { FabMenu, FabMenuItem } from '#lib/components/ui/fab/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { IconButton } from '#lib/components/ui/icon-button/index.js';
	import { List, ListItem } from '#lib/components/ui/list/index.js';
	import { LinearProgress } from '#lib/components/ui/progress/index.js';
	import {
		SearchBarAction,
		SearchView,
		SearchViewGroup,
		SearchViewItem
	} from '#lib/components/ui/search-bar/index.js';
	import { snackbar } from '#lib/components/ui/snackbar/index.js';
	import { AppBarAction, TopAppBar } from '#lib/components/ui/top-app-bar/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { shapePath, type ShapeName } from '#lib/m3/shapes.js';
	import ExitAction from '#lib/components/mobile/exit-action.svelte';
	import { getMobileShell } from '#lib/components/mobile/shell.svelte.js';
	import {
		continueListening,
		featured,
		formatDuration,
		homeFilters,
		photo,
		searchRecent,
		searchSuggestions,
		tracks,
		user,
		type HomeFilter
	} from '#lib/components/mobile/data.js';

	const shell = getMobileShell();
	const uid = $props.id();

	let filter = $state<HomeFilter>('all');
	let query = $state('');
	let searchOpen = $state(false);
	let fabOpen = $state(false);

	let continueItems = $derived(
		continueListening.filter((c) =>
			filter === 'all' ? true : filter === 'downloaded' ? c.downloaded : c.track.kind === filter
		)
	);

	/** Daily Mix cover: a cluster of shape-masked artist photos (one hero, two satellites). */
	const mix: { shape: ShapeName; seed: string; class: string }[] = [
		{ shape: 'cookie9Sided', seed: 'mix-e', class: 'start-2 top-0 size-[88px] rotate-6' },
		{ shape: 'clover4Leaf', seed: 'mix-i', class: 'start-0 bottom-0 size-12 -rotate-12' },
		{ shape: 'pill', seed: 'mix-j', class: 'end-0 bottom-1 h-12 w-9 rotate-12' }
	];

	/** Mini player › Next: the following item of "Continue listening" (wraps around). */
	function playNext() {
		const i = continueListening.findIndex((c) => c.track.id === shell.track.id);
		const next = continueListening[(i + 1) % continueListening.length];
		shell.play(next.track);
		shell.position = next.progress;
	}

	function toggleItem(id: string) {
		const item = continueListening.find((c) => c.id === id);
		if (!item) return;
		if (shell.track.id === item.track.id) shell.playing = !shell.playing;
		else {
			shell.play(item.track);
			shell.position = item.progress;
		}
	}
</script>

{#snippet sectionHeader(title: string, action?: string, onaction?: () => void)}
	<div class="flex min-h-12 items-center justify-between gap-2 ps-4 pe-2 pt-6 pb-1">
		<h2 class="type-title-lg text-on-surface">{title}</h2>
		{#if action && onaction}
			<Button variant="text" size="sm" onclick={onaction}>{action}</Button>
		{:else if action}
			<span class="type-label-lg pe-2 text-on-surface-variant">{action}</span>
		{/if}
	</div>
{/snippet}

{#snippet shapeArt(shape: ShapeName, src: string, cls: string)}
	<svg
		viewBox="0 0 100 100"
		preserveAspectRatio="none"
		class={['absolute drop-shadow-sm', cls]}
		aria-hidden="true"
	>
		<defs>
			<clipPath id="{uid}-{shape}"><path d={shapePath(shape)} /></clipPath>
		</defs>
		<!-- placeholder while the photo loads (and if it never does) -->
		<path d={shapePath(shape)} class="fill-on-tertiary-container/24" />
		<image
			href={src}
			width="100"
			height="100"
			preserveAspectRatio="xMidYMid slice"
			clip-path="url(#{uid}-{shape})"
		/>
	</svg>
{/snippet}

<TopAppBar variant="large-flexible" title="Good morning, {user.firstName}" subtitle="3 new episodes since yesterday">
	{#snippet leading()}
		<AppBarAction icon="menu" label="Open navigation drawer" onclick={() => (shell.drawerOpen = true)} />
	{/snippet}
	{#snippet trailing()}
		<AppBarAction icon="search" label="Search" onclick={() => (searchOpen = true)} />
		<ExitAction />
		<a
			href="/mobile/settings"
			aria-label="Profile and settings"
			class="relative m-1 grid size-10 shrink-0 place-items-center rounded-m3-full after:absolute after:-inset-1"
			{@attach ripple()}
		>
			<img src={user.avatar} alt="" class="size-8 rounded-m3-full bg-tertiary-container object-cover" />
		</a>
	{/snippet}
</TopAppBar>

<div class="flex flex-col pb-4">
	<!-- search bar → full-screen search view -->
	<div class="px-4 pt-1 pb-2">
		<SearchView
			mode="fullscreen"
			bind:open={searchOpen}
			bind:value={query}
			placeholder="Search songs, podcasts, notes"
			onsubmit={(q) => q && snackbar(`Searching for “${q}”`)}
		>
			{#snippet trailing()}
				<SearchBarAction icon="mic" label="Voice search" onclick={() => snackbar('Listening…')} />
			{/snippet}
			<SearchViewGroup heading="Recent">
				{#each searchRecent as r (r)}
					<SearchViewItem value={r} icon="history" trailingIcon="north_west" />
				{/each}
			</SearchViewGroup>
			<SearchViewGroup heading="Suggestions">
				{#each searchSuggestions as s (s.value)}
					<SearchViewItem value={s.value} supportingText={s.supportingText} icon={s.icon} />
				{/each}
			</SearchViewGroup>
		</SearchView>
	</div>

	<!-- filters -->
	<ChipSet scroll class="px-4" aria-label="Filter what you listen to">
		{#each homeFilters as f (f.id)}
			<Chip
				variant="filter"
				icon={f.icon}
				bind:selected={
					() => filter === f.id,
					(v) => {
						if (v) filter = f.id;
						else if (filter === f.id) filter = 'all';
					}
				}
			>
				{f.label}
			</Chip>
		{/each}
	</ChipSet>

	<!-- featured carousel -->
	{@render sectionHeader('Featured', 'See all', () => goto('/mobile/library', { reset: false }))}
	<Carousel layout="multi-browse" height={224} itemWidth={232} aria-label="Featured">
		{#each featured as f (f.id)}
			<CarouselItem
				src={f.image}
				label={f.title}
				supportingText={f.subtitle}
				onclick={() => {
					shell.play(f.track);
					snackbar(`Playing ${f.title}`);
				}}
			/>
		{/each}
	</Carousel>

	<!-- daily mix: expressive shapes -->
	<Card.Root
		variant="filled"
		shape="xl"
		class="mx-4 mt-6 flex-row items-center gap-2 bg-tertiary-container px-5 py-5 text-on-tertiary-container"
	>
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="type-label-lg opacity-80">Made for {user.firstName}</span>
			<span class="type-headline-sm-emphasized">Daily Mix 3</span>
			<span class="type-body-md opacity-80">Lumen Club and more</span>
			<div class="mt-3 flex gap-2">
				<Button
					size="sm"
					onclick={() => {
						shell.play(tracks.neon);
						snackbar('Playing Daily Mix 3');
					}}
				>
					<Icon name="play_arrow" fill data-icon="inline-start" />
					Play
				</Button>
				<IconButton
					icon="favorite"
					toggle
					aria-label="Save Daily Mix 3"
					class="text-on-tertiary-container"
					onPressedChange={(p) => snackbar(p ? 'Saved to your library' : 'Removed from your library')}
				/>
			</div>
		</div>
		<div class="relative h-[108px] w-[116px] shrink-0">
			{#each mix as m (m.shape)}
				{@render shapeArt(m.shape, photo(m.seed, 200, 200), m.class)}
			{/each}
		</div>
	</Card.Root>

	<!-- continue listening -->
	{@render sectionHeader('Continue listening', `${continueItems.length} in progress`)}
	{#if continueItems.length}
		<List variant="segmented" class="px-4">
			{#each continueItems as c (c.id)}
				{@const active = shell.track.id === c.track.id && shell.playing}
				<ListItem
					headline={c.track.title}
					supportingText="{c.track.artist} · {c.note}"
					leadingImage={c.track.image}
					leadingAlt=""
				>
					{#snippet trailing()}
						<IconButton
							icon={active ? 'pause_circle' : 'play_circle'}
							size="sm"
							aria-label="{active ? 'Pause' : 'Play'} {c.track.title}"
							class={active ? 'text-m3-primary' : undefined}
							onclick={() => toggleItem(c.id)}
						/>
					{/snippet}
				</ListItem>
			{/each}
		</List>
	{:else}
		<p class="type-body-md mx-4 rounded-m3-lg bg-surface-container px-4 py-6 text-center text-on-surface-variant">
			Nothing in progress for this filter.
		</p>
	{/if}

	<!-- room for the FAB above the mini player -->
	<div class="h-20" aria-hidden="true"></div>
</div>

<!-- now playing mini player -->
<div class="sticky bottom-0 z-10 px-3 pt-1 pb-3">
	<Card.Root
		variant="filled"
		shape="xl"
		class="flex-row items-center gap-3 bg-secondary-container py-2 ps-2 pe-1 text-on-secondary-container shadow-m3-2"
		role="region"
		aria-label="Now playing"
	>
		<img src={shell.track.image} alt="" class="size-14 shrink-0 rounded-m3-lg bg-surface-container-highest object-cover" />
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<div class="flex min-w-0 items-baseline justify-between gap-2">
				<span class="type-title-sm truncate">{shell.track.title}</span>
				<span class="type-label-sm shrink-0 tabular-nums opacity-80">
					{formatDuration(shell.position * shell.track.duration)}
				</span>
			</div>
			<span class="type-body-sm truncate opacity-80">{shell.track.artist}</span>
			<LinearProgress
				wavy
				value={shell.position * 100}
				aria-label="Playback position"
				class="w-full [&_[data-slot=progress-track]]:stroke-on-secondary-container/16"
			/>
		</div>
		<div class="flex shrink-0 items-center gap-1">
			<IconButton
				variant="filled"
				size="md"
				icon={shell.playing ? 'pause' : 'play_arrow'}
				aria-label={shell.playing ? 'Pause' : 'Play'}
				shape={shell.playing ? 'square' : 'round'}
				onclick={() => (shell.playing = !shell.playing)}
			/>
			<IconButton icon="skip_next" aria-label="Next" class="text-on-secondary-container" onclick={playNext} />
		</div>
	</Card.Root>
</div>

<!-- FAB menu, bottom-end above the mini player (fixed to the phone's content area) -->
<div class="fixed end-4 bottom-[104px] z-20">
	<FabMenu bind:open={fabOpen} color="primary" icon="add" label="Create" closeLabel="Close create menu" scrim>
		<FabMenuItem icon="edit_note" label="New note" onclick={() => goto('/mobile/compose', { reset: false })} />
		<FabMenuItem icon="playlist_add" label="New playlist" onclick={() => snackbar('Playlist “Untitled” created')} />
		<FabMenuItem icon="mic" label="Record a clip" onclick={() => snackbar('Recording started')} />
	</FabMenu>
</div>
