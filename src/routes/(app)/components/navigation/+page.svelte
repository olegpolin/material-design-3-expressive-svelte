<script lang="ts">
	import { Page, Section, Demo } from '#lib/components/showcase/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import * as NavigationBar from '#lib/components/ui/navigation-bar/index.js';
	import * as NavigationRail from '#lib/components/ui/navigation-rail/index.js';
	import * as NavigationDrawer from '#lib/components/ui/navigation-drawer/index.js';
	import { TopAppBar, AppBarAction } from '#lib/components/ui/top-app-bar/index.js';
	import * as Toolbar from '#lib/components/ui/toolbar/index.js';
	import * as BottomAppBar from '#lib/components/ui/bottom-app-bar/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';

	type Destination = { id: string; icon: string; label: string; badge?: number | boolean };

	const barItems: Destination[] = [
		{ id: 'home', icon: 'home', label: 'Home' },
		{ id: 'explore', icon: 'explore', label: 'Explore', badge: true },
		{ id: 'inbox', icon: 'inbox', label: 'Inbox', badge: 3 },
		{ id: 'profile', icon: 'person', label: 'Profile' }
	];
	const tabletItems: Destination[] = [
		{ id: 'home', icon: 'home', label: 'Home' },
		{ id: 'explore', icon: 'explore', label: 'Explore' },
		{ id: 'inbox', icon: 'inbox', label: 'Inbox', badge: 12 },
		{ id: 'saved', icon: 'bookmark', label: 'Saved', badge: true },
		{ id: 'profile', icon: 'person', label: 'Profile' }
	];

	let shortVertical = $state('home');
	let shortHorizontal = $state('explore');
	let tall = $state('inbox');

	// Rail
	const railMain: Destination[] = [
		{ id: 'inbox', icon: 'inbox', label: 'Inbox', badge: 24 },
		{ id: 'sent', icon: 'send', label: 'Outbox' },
		{ id: 'favorites', icon: 'favorite', label: 'Favorites', badge: true },
		{ id: 'trash', icon: 'delete', label: 'Trash' }
	];
	const railLabels: Destination[] = [
		{ id: 'work', icon: 'work', label: 'Work' },
		{ id: 'family', icon: 'family_restroom', label: 'Family' }
	];
	let railExpanded = $state(false);
	let railSelected = $state('inbox');
	let railCentered = $state(false);
	let modalExpanded = $state(false);
	let modalSelected = $state('favorites');
	let plainSelected = $state('sent');

	// Drawer
	const drawerMain = [
		{ id: 'inbox', icon: 'inbox', label: 'Inbox', badge: '24' },
		{ id: 'outbox', icon: 'send', label: 'Outbox', badge: '100+' },
		{ id: 'favorites', icon: 'favorite', label: 'Favorites' },
		{ id: 'trash', icon: 'delete', label: 'Trash' }
	];
	const drawerLabels = [
		{ id: 'family', icon: 'bookmark', label: 'Family' },
		{ id: 'school', icon: 'bookmark', label: 'School' },
		{ id: 'work', icon: 'bookmark', label: 'Work' }
	];
	let drawerSelected = $state('inbox');
	let modalDrawerOpen = $state(false);
	let modalDrawerSelected = $state('favorites');

	// App bars
	let smallScrolled = $state(false);
	let starred = $state(true);
	let filtersOn = $state(false);
	let searchValue = $state('');

	// Toolbars
	let formatting = $state<Record<string, boolean>>({ bold: true, italic: false, underline: false });
	let vibrantSelected = $state('draw');
	let notesScroller = $state<HTMLElement | null>(null);

	// Tabs
	let primaryTab = $state('flights');
	let primaryTextTab = $state('overview');
	let secondaryTab = $state('all');
	let secondaryIconTab = $state('photos');
	let scrollTab = $state('t1');
	const scrollTabs = [
		'Trending',
		'Technology',
		'Science',
		'World news',
		'Business',
		'Entertainment',
		'Sports',
		'Health',
		'Travel',
		'Food'
	].map((label, i) => ({ value: `t${i + 1}`, label }));

	const frame = 'relative flex flex-col overflow-hidden rounded-m3-xl border border-outline-variant bg-surface';
</script>

<svelte:head>
	<title>Navigation · M3 Expressive</title>
</svelte:head>

{#snippet filler(count: number, label = 'Item')}
	<ul class="flex flex-col gap-2 p-4">
		{#each Array.from({ length: count }, (_, i) => i + 1) as i (i)}
			<li class="flex items-center gap-4 rounded-m3-lg bg-surface-container-low p-3">
				<span class="type-title-md grid size-10 shrink-0 place-items-center rounded-m3-full bg-primary-container text-on-primary-container">
					{String.fromCharCode(64 + ((i - 1) % 26) + 1)}
				</span>
				<span class="flex min-w-0 flex-col">
					<span class="type-body-lg truncate text-on-surface">{label} {i}</span>
					<span class="type-body-md truncate text-on-surface-variant">Supporting text for list row {i}</span>
				</span>
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet pageBody(title: string)}
	<div class="flex flex-1 flex-col gap-3 overflow-hidden p-4">
		<span class="type-title-lg text-on-surface">{title}</span>
		<div class="h-24 rounded-m3-lg bg-surface-container-high"></div>
		<div class="h-4 w-3/4 rounded-m3-full bg-surface-container-highest"></div>
		<div class="h-4 w-1/2 rounded-m3-full bg-surface-container-highest"></div>
	</div>
{/snippet}

{#snippet textButton(label: string, onclick: () => void, pressed?: boolean)}
	<button
		type="button"
		class="type-label-lg h-10 rounded-m3-full bg-secondary-container px-4 text-on-secondary-container aria-pressed:bg-m3-secondary aria-pressed:text-on-secondary"
		aria-pressed={pressed}
		{onclick}
		{@attach ripple()}
	>
		{label}
	</button>
{/snippet}

<Page
	title="Navigation"
	description="Navigation bar, navigation rail, navigation drawer, app bars, toolbars and tabs. Every demo is live: select destinations, expand the rail, scroll the frames."
>
	<!-- ============================================================ NAVIGATION BAR -->
	<Section
		title="Navigation bar"
		description="The M3 Expressive flexible bar is 64dp: vertical items on compact windows, horizontal items on medium windows. The 80dp tall bar is the baseline configuration. The active indicator grows from its center and the icon fills when selected. Arrow keys (and Home / End) move focus between destinations."
	>
		<div class="grid gap-6 lg:grid-cols-2">
			<Demo
				label="Short · vertical items"
				spec="64dp · surface-container · level2 · indicator 56×32dp full · label-medium · active label secondary · badge 6dp / 16dp"
			>
				<div class={[frame, 'h-[300px] w-[412px] max-w-full']}>
					{@render pageBody(barItems.find((i) => i.id === shortVertical)?.label ?? '')}
					<NavigationBar.Root variant="short" layout="vertical">
						{#each barItems as item (item.id)}
							<NavigationBar.Item
								icon={item.icon}
								label={item.label}
								badge={item.badge}
								selected={shortVertical === item.id}
								onclick={() => (shortVertical = item.id)}
							/>
						{/each}
					</NavigationBar.Root>
				</div>
			</Demo>
			<Demo
				label="Tall (baseline)"
				spec="80dp · 12dp top padding · indicator 56×32dp · fastSpatial size, defaultEffects alpha"
			>
				<div class={[frame, 'h-[300px] w-[412px] max-w-full']}>
					{@render pageBody(barItems.find((i) => i.id === tall)?.label ?? '')}
					<NavigationBar.Root variant="tall">
						{#each barItems as item (item.id)}
							<NavigationBar.Item
								icon={item.icon}
								label={item.label}
								badge={item.badge}
								selected={tall === item.id}
								onclick={() => (tall = item.id)}
							/>
						{/each}
					</NavigationBar.Root>
				</div>
			</Demo>
		</div>
		<Demo
			label="Short · horizontal items (medium window)"
			spec="64dp · indicator 40dp tall, hugs content, 16dp padding · icon → label 4dp · items take 60/70/80/90% for 3/4/5/6 items · active label on-secondary-container"
		>
			<!-- a medium window is ≥ 600dp wide: on phones the frame keeps that width and scrolls sideways -->
			<div class="w-full overflow-x-auto rounded-m3-xl">
				<div class={[frame, 'h-[260px] w-full min-w-[600px]']}>
					{@render pageBody(tabletItems.find((i) => i.id === shortHorizontal)?.label ?? '')}
					<NavigationBar.Root variant="short" layout="horizontal">
						{#each tabletItems as item (item.id)}
							<NavigationBar.Item
								icon={item.icon}
								label={item.label}
								badge={item.badge}
								selected={shortHorizontal === item.id}
								onclick={() => (shortHorizontal = item.id)}
							/>
						{/each}
					</NavigationBar.Root>
				</div>
			</div>
		</Demo>
	</Section>

	<!-- ============================================================ NAVIGATION RAIL -->
	<Section
		title="Navigation rail"
		description="Collapsed (96dp) and expanded (220–360dp, hugs the widest item) on the defaultSpatial spring. The modal rail floats over the content with a scrim, traps focus and closes on Escape, scrim click or selection. Up / Down move focus between items."
	>
		<Demo
			label="Standard · collapsed ⇄ expanded"
			spec="collapsed 96dp · items 64dp, 4dp gap, indicator 56×32 · expanded items 56dp full-width pill, label-large, 8dp icon gap · top 44dp · header → items 40dp · surface"
			class="flex-col flex-nowrap items-stretch"
		>
			<div class="flex flex-wrap gap-2">
				{@render textButton(railExpanded ? 'Collapse' : 'Expand', () => (railExpanded = !railExpanded), railExpanded)}
				{@render textButton('Center items', () => (railCentered = !railCentered), railCentered)}
			</div>
			<div class={[frame, 'h-[600px] w-full flex-row']}>
				<NavigationRail.Root bind:expanded={railExpanded} align={railCentered ? 'center' : 'top'}>
					{#snippet header()}
						<NavigationRail.MenuButton />
						<NavigationRail.Fab icon="edit" label="Compose" />
					{/snippet}
					{#each railMain as item (item.id)}
						<NavigationRail.Item
							icon={item.icon}
							label={item.label}
							badge={item.badge}
							selected={railSelected === item.id}
							onclick={() => (railSelected = item.id)}
						/>
					{/each}
					<NavigationRail.Section label="Labels">
						{#each railLabels as item (item.id)}
							<NavigationRail.Item
								icon={item.icon}
								label={item.label}
								selected={railSelected === item.id}
								onclick={() => (railSelected = item.id)}
							/>
						{/each}
					</NavigationRail.Section>
				</NavigationRail.Root>
				<div class="flex min-w-0 flex-1 flex-col bg-surface-container-low">
					{@render pageBody(
						[...railMain, ...railLabels].find((i) => i.id === railSelected)?.label ?? ''
					)}
				</div>
			</div>
		</Demo>
		<div class="grid gap-6 lg:grid-cols-2">
			<Demo
				label="Modal · expanded over content"
				spec="surface-container · level2 · 16dp end corners · scrim 32% · width on fastSpatial"
			>
				<div class={[frame, 'h-[600px] w-full flex-row [contain:layout]']}>
					<NavigationRail.Root modal bind:expanded={modalExpanded}>
						{#snippet header()}
							<NavigationRail.MenuButton />
							<NavigationRail.Fab icon="add" label="New message" color="tertiary" />
						{/snippet}
						{#each railMain as item (item.id)}
							<NavigationRail.Item
								icon={item.icon}
								label={item.label}
								badge={item.badge}
								selected={modalSelected === item.id}
								onclick={() => (modalSelected = item.id)}
							/>
						{/each}
					</NavigationRail.Root>
					<div class="flex min-w-0 flex-1 flex-col bg-surface-container-low">
						{@render pageBody(railMain.find((i) => i.id === modalSelected)?.label ?? '')}
					</div>
				</div>
			</Demo>
			<Demo label="Collapsed · centered, no header" spec="align center · badge on the icon's top-end corner">
				<div class={[frame, 'h-[600px] w-full flex-row']}>
					<NavigationRail.Root align="center">
						{#each railMain as item (item.id)}
							<NavigationRail.Item
								icon={item.icon}
								label={item.label}
								badge={item.badge}
								selected={plainSelected === item.id}
								onclick={() => (plainSelected = item.id)}
							/>
						{/each}
					</NavigationRail.Root>
					<div class="flex min-w-0 flex-1 flex-col bg-surface-container-low">
						{@render pageBody(railMain.find((i) => i.id === plainSelected)?.label ?? '')}
					</div>
				</div>
			</Demo>
		</div>
	</Section>

	<!-- ============================================================ NAVIGATION DRAWER -->
	<Section
		title="Navigation drawer"
		description="Baseline component (M3 Expressive recommends the expanded rail instead). Standard drawers sit inline; modal drawers use the sheet primitive."
	>
		<div class="grid gap-6 lg:grid-cols-2">
			<Demo
				label="Standard"
				spec="360dp · surface · level0 · items 56dp full radius, 12dp inset · label-large · icon 24 + 12dp gap · title-small headlines · divider inset 28dp"
			>
				<div class={[frame, 'h-[560px] w-[362px] max-w-full']}>
					<NavigationDrawer.Root headline="Mail">
						{#each drawerMain as item (item.id)}
							<NavigationDrawer.Item
								icon={item.icon}
								label={item.label}
								badge={item.badge}
								selected={drawerSelected === item.id}
								onclick={() => (drawerSelected = item.id)}
							/>
						{/each}
						<NavigationDrawer.Section headline="Labels">
							{#each drawerLabels as item (item.id)}
								<NavigationDrawer.Item
									icon={item.icon}
									label={item.label}
									selected={drawerSelected === item.id}
									onclick={() => (drawerSelected = item.id)}
								/>
							{/each}
						</NavigationDrawer.Section>
					</NavigationDrawer.Root>
				</div>
			</Demo>
			<Demo
				label="Modal"
				spec="360dp · surface-container-low · level1 · 16dp end corners · scrim 32% · open defaultSpatial, close fastEffects"
				class="flex-col flex-nowrap items-start"
			>
				{@render textButton('Open modal drawer', () => (modalDrawerOpen = true))}
				<p class="type-body-md text-on-surface-variant">
					Selected: <span class="text-on-surface">{modalDrawerSelected}</span>. Selecting an item closes the drawer.
				</p>
				<NavigationDrawer.Root variant="modal" bind:open={modalDrawerOpen} headline="Mail">
					{#each drawerMain as item (item.id)}
						<NavigationDrawer.Item
							icon={item.icon}
							label={item.label}
							badge={item.badge}
							selected={modalDrawerSelected === item.id}
							onclick={() => (modalDrawerSelected = item.id)}
						/>
					{/each}
					<NavigationDrawer.Section headline="Labels">
						{#each drawerLabels as item (item.id)}
							<NavigationDrawer.Item
								icon={item.icon}
								label={item.label}
								selected={modalDrawerSelected === item.id}
								onclick={() => (modalDrawerSelected = item.id)}
							/>
						{/each}
					</NavigationDrawer.Section>
				</NavigationDrawer.Root>
			</Demo>
		</div>
	</Section>

	<!-- ============================================================ APP BARS -->
	<Section
		title="App bars"
		description="Scroll each frame. The container turns surface-container when content scrolls under it; flexible bars collapse to 64dp, cross-fade their titles and snap open or closed when you stop mid-way."
	>
		<div class="grid gap-6 lg:grid-cols-2">
			<Demo
				label="Small"
				spec="64dp · title-large · 4dp side padding · leading on-surface · trailing on-surface-variant · 48dp action targets · toggle action: selected primary, round → square · scrolled surface-container (defaultEffects)"
			>
				<div class={[frame, 'h-[360px] w-[412px] max-w-full']}>
					<div class="min-h-0 flex-1 overflow-y-auto">
						<TopAppBar title="Inbox" bind:scrolled={smallScrolled}>
							{#snippet leading()}<AppBarAction icon="arrow_back" label="Back" />{/snippet}
							{#snippet trailing()}
								<AppBarAction icon="attach_file" label="Attach" />
								<AppBarAction icon="star" label="Star" selected={starred} onclick={() => (starred = !starred)} />
								<AppBarAction icon="more_vert" label="More" />
							{/snippet}
						</TopAppBar>
						{@render filler(12, 'Message')}
					</div>
				</div>
			</Demo>
			<Demo label="Center-aligned" spec="64dp · centered title-large · label-medium subtitle · one filled trailing action">
				<div class={[frame, 'h-[360px] w-[412px] max-w-full']}>
					<div class="min-h-0 flex-1 overflow-y-auto">
						<TopAppBar variant="center-aligned" title="Photos" subtitle="2,481 items">
							{#snippet leading()}<AppBarAction icon="menu" label="Menu" />{/snippet}
							{#snippet trailing()}<AppBarAction icon="add" label="Add" variant="filled" />{/snippet}
						</TopAppBar>
						{@render filler(12, 'Album')}
					</div>
				</div>
			</Demo>
			<Demo
				label="Medium flexible"
				spec="112dp (136 with subtitle) → 64dp · headline-medium · label-large subtitle · title baseline 24dp"
			>
				<div class={[frame, 'h-[420px] w-[412px] max-w-full']}>
					<div class="min-h-0 flex-1 overflow-y-auto">
						<TopAppBar variant="medium-flexible" title="Travel plans" subtitle="3 upcoming trips">
							{#snippet leading()}<AppBarAction icon="arrow_back" label="Back" />{/snippet}
							{#snippet trailing()}
								<AppBarAction icon="search" label="Search" />
								<AppBarAction icon="more_vert" label="More" />
							{/snippet}
						</TopAppBar>
						{@render filler(12, 'Trip')}
					</div>
				</div>
			</Demo>
			<Demo
				label="Large flexible"
				spec="120dp (152 with subtitle) → 64dp · display-small · title-medium subtitle · title baseline 28dp · tonal toggle action (selected secondary)"
			>
				<div class={[frame, 'h-[420px] w-[412px] max-w-full']}>
					<div class="min-h-0 flex-1 overflow-y-auto">
						<TopAppBar variant="large-flexible" title="Library">
							{#snippet leading()}<AppBarAction icon="menu" label="Menu" />{/snippet}
							{#snippet trailing()}
								<AppBarAction icon="search" label="Search" />
								<AppBarAction
									icon="tune"
									label="Filters"
									variant="tonal"
									selected={filtersOn}
									onclick={() => (filtersOn = !filtersOn)}
								/>
							{/snippet}
						</TopAppBar>
						{@render filler(12, 'Book')}
					</div>
				</div>
			</Demo>
			<Demo
				label="Search app bar"
				spec="64dp · field 56dp full · surface-container → surface-container-highest on scroll · hint body-large"
			>
				<div class={[frame, 'h-[360px] w-[412px] max-w-full']}>
					<div class="min-h-0 flex-1 overflow-y-auto">
						<TopAppBar variant="search" placeholder="Search messages" bind:searchValue>
							{#snippet searchTrailing()}
								<AppBarAction icon="mic" label="Voice search" />
							{/snippet}
							{#snippet trailing()}
								<span
									class="type-title-md m-2 grid size-8 place-items-center rounded-m3-full bg-tertiary-container text-on-tertiary-container"
									aria-label="Account"
									role="img"
								>
									O
								</span>
							{/snippet}
						</TopAppBar>
						{@render filler(12, searchValue ? `“${searchValue}” result` : 'Conversation')}
					</div>
				</div>
			</Demo>
			<Demo label="Controlled `scrolled`" spec="scrollContainer=null · drive the color yourself">
				<div class={[frame, 'w-[412px] max-w-full']}>
					<TopAppBar title="Settings" scrollContainer={null} scrolled={smallScrolled}>
						{#snippet leading()}<AppBarAction icon="arrow_back" label="Back" />{/snippet}
					</TopAppBar>
					<p class="type-body-md p-4 text-on-surface-variant">
						Mirrors the “Small” demo: scroll it and this bar switches too (scrolled = {smallScrolled}).
					</p>
				</div>
			</Demo>
		</div>
	</Section>

	<!-- ============================================================ TOOLBARS -->
	<Section
		title="Toolbars"
		description="Floating toolbars (horizontal or vertical, standard or vibrant, with an optional FAB) and the docked toolbar that replaces the bottom app bar. Arrow keys move focus between items."
	>
		<div class="grid gap-6 lg:grid-cols-2">
			<Demo
				label="Floating · horizontal"
				spec="64dp · full radius · 8dp padding · 4dp gap · level3 · FAB 56dp, 8dp gap · standard surface-container / vibrant primary-container"
				class="flex-col flex-nowrap items-start"
			>
				<Toolbar.Floating aria-label="Formatting">
					{#snippet fab()}<Toolbar.Fab icon="add" label="Insert" />{/snippet}
					{#each [['bold', 'format_bold'], ['italic', 'format_italic'], ['underline', 'format_underlined']] as [key, icon] (key)}
						<Toolbar.Button
							{icon}
							label={key}
							selected={formatting[key]}
							onclick={() => (formatting[key] = !formatting[key])}
						/>
					{/each}
					<Toolbar.Button icon="format_color_text" label="Text color" />
					<Toolbar.Button icon="more_vert" label="More" />
				</Toolbar.Floating>
				<Toolbar.Floating color="vibrant" aria-label="Drawing tools">
					{#snippet fab()}<Toolbar.Fab icon="check" label="Done" />{/snippet}
					{#each [['draw', 'draw'], ['brush', 'brush'], ['shapes', 'category'], ['text', 'title']] as [key, icon] (key)}
						<Toolbar.Button
							{icon}
							label={key}
							selected={vibrantSelected === key}
							onclick={() => (vibrantSelected = key)}
						/>
					{/each}
					<Toolbar.Button icon="undo" label="Undo" />
				</Toolbar.Floating>
				<Toolbar.Floating aria-label="Media">
					<Toolbar.Button icon="skip_previous" label="Previous" disabled />
					<Toolbar.Button icon="play_arrow" label="Play" />
					<Toolbar.Button icon="skip_next" label="Next" />
				</Toolbar.Floating>
			</Demo>
			<Demo label="Floating · vertical" spec="64dp wide · same tokens · FAB below the toolbar · ≥24dp screen margin">
				<div class="flex items-start gap-6">
					<Toolbar.Floating orientation="vertical" aria-label="Map tools">
						{#snippet fab()}<Toolbar.Fab icon="navigation" label="Navigate" />{/snippet}
						<Toolbar.Button icon="layers" label="Layers" />
						<Toolbar.Button icon="my_location" label="My location" selected />
						<Toolbar.Button icon="explore" label="Compass" />
					</Toolbar.Floating>
					<Toolbar.Floating orientation="vertical" color="vibrant" aria-label="Zoom">
						{#snippet fab()}<Toolbar.Fab icon="add_location" label="Add place" size="medium" />{/snippet}
						<Toolbar.Button icon="add" label="Zoom in" />
						<Toolbar.Button icon="remove" label="Zoom out" />
						<Toolbar.Button icon="fullscreen" label="Fullscreen" selected />
					</Toolbar.Floating>
				</div>
			</Demo>
			<Demo
				label="Floating · hide on scroll"
				spec="exits after 40dp of scroll, returns after 40dp back · snap on defaultEffects"
			>
				<div class={[frame, 'h-[400px] w-[412px] max-w-full']}>
					<div class="min-h-0 flex-1 overflow-y-auto" bind:this={notesScroller}>
						{@render filler(14, 'Note')}
					</div>
					<!-- the toolbar is a sibling of the scroller, so pass it explicitly -->
					<Toolbar.Floating
						class="absolute bottom-4 left-1/2 -translate-x-1/2"
						hideOnScroll={notesScroller ? { container: notesScroller } : false}
						aria-label="Note actions"
					>
						{#snippet fab()}<Toolbar.Fab icon="edit" label="New note" />{/snippet}
						<Toolbar.Button icon="check_box" label="Checklist" />
						<Toolbar.Button icon="brush" label="Drawing" />
						<Toolbar.Button icon="mic" label="Voice note" />
						<Toolbar.Button icon="image" label="Image" />
					</Toolbar.Floating>
				</div>
			</Demo>
			<Demo
				label="Docked toolbar · bottom app bar"
				spec="docked 64dp full width, 16dp side padding, surface-container · bottom app bar 80dp, level2, FAB 56dp level0, 16dp from the end"
				class="flex-col flex-nowrap items-stretch"
			>
				<div class={[frame, 'w-full']}>
					<Toolbar.Docked aria-label="Message actions">
						<Toolbar.Button icon="archive" label="Archive" />
						<Toolbar.Button icon="delete" label="Delete" />
						<Toolbar.Button icon="mark_email_unread" label="Mark unread" />
						<Toolbar.Button icon="schedule" label="Snooze" selected />
						<Toolbar.Button icon="more_vert" label="More" />
					</Toolbar.Docked>
				</div>
				<div class={[frame, 'w-full']}>
					<Toolbar.Docked color="vibrant" arrangement="center" aria-label="Player">
						<Toolbar.Button icon="shuffle" label="Shuffle" />
						<Toolbar.Button icon="skip_previous" label="Previous" />
						<Toolbar.Button icon="pause" label="Pause" selected />
						<Toolbar.Button icon="skip_next" label="Next" />
						<Toolbar.Button icon="repeat" label="Repeat" />
					</Toolbar.Docked>
				</div>
				<div class={[frame, 'w-full']}>
					<BottomAppBar.Root>
						{#snippet fab()}<BottomAppBar.Fab icon="add" label="Create" />{/snippet}
						<BottomAppBar.Action icon="check_box" label="Checklist" />
						<BottomAppBar.Action icon="edit" label="Edit" />
						<BottomAppBar.Action icon="mic" label="Voice" />
						<BottomAppBar.Action icon="image" label="Image" />
					</BottomAppBar.Root>
				</div>
			</Demo>
		</div>
	</Section>

	<!-- ============================================================ TABS -->
	<Section
		title="Tabs"
		description="Primary tabs sit below the top app bar; secondary tabs live inside content. The indicator measures the active tab and slides on the defaultSpatial spring."
	>
		<div class="grid gap-6 lg:grid-cols-2">
			<Demo
				label="Primary · icon + label"
				spec="64dp · indicator 3dp, 3dp top corners, content width (min 24dp) · active primary · title-small · badge overlaps icon"
				class="flex-col flex-nowrap items-stretch"
			>
				<Tabs.Root bind:value={primaryTab} class="overflow-hidden rounded-m3-lg">
					<Tabs.List>
						<Tabs.Trigger value="flights" icon="flight">Flights</Tabs.Trigger>
						<Tabs.Trigger value="trips" icon="luggage" badge={2}>Trips</Tabs.Trigger>
						<Tabs.Trigger value="explore" icon="explore" badge>Explore</Tabs.Trigger>
					</Tabs.List>
					{#each ['flights', 'trips', 'explore'] as v (v)}
						<Tabs.Content value={v} class="bg-surface p-4 text-on-surface-variant">Content for “{v}”.</Tabs.Content>
					{/each}
				</Tabs.Root>
			</Demo>
			<Demo label="Primary · label only" spec="48dp · 16dp horizontal padding · badge 4dp after the text" class="flex-col flex-nowrap items-stretch">
				<Tabs.Root bind:value={primaryTextTab} class="overflow-hidden rounded-m3-lg">
					<Tabs.List>
						<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
						<Tabs.Trigger value="specs">Specs</Tabs.Trigger>
						<Tabs.Trigger value="reviews" badge={128}>Reviews</Tabs.Trigger>
						<Tabs.Trigger value="faq" disabled>FAQ</Tabs.Trigger>
					</Tabs.List>
					{#each ['overview', 'specs', 'reviews', 'faq'] as v (v)}
						<Tabs.Content value={v} class="bg-surface p-4 text-on-surface-variant">Content for “{v}”.</Tabs.Content>
					{/each}
				</Tabs.Root>
			</Demo>
			<Demo label="Secondary" spec="48dp · indicator 2dp, full tab width · active on-surface · divider 1dp outline-variant" class="flex-col flex-nowrap items-stretch">
				<Tabs.Root bind:value={secondaryTab} class="overflow-hidden rounded-m3-lg">
					<Tabs.List variant="secondary">
						<Tabs.Trigger value="all">All</Tabs.Trigger>
						<Tabs.Trigger value="unread" badge={7}>Unread</Tabs.Trigger>
						<Tabs.Trigger value="starred">Starred</Tabs.Trigger>
					</Tabs.List>
					{#each ['all', 'unread', 'starred'] as v (v)}
						<Tabs.Content value={v} class="bg-surface p-4 text-on-surface-variant">Content for “{v}”.</Tabs.Content>
					{/each}
				</Tabs.Root>
			</Demo>
			<Demo label="Secondary · inline icons" spec="48dp · icon 24 · icon → label 8dp" class="flex-col flex-nowrap items-stretch">
				<Tabs.Root bind:value={secondaryIconTab} class="overflow-hidden rounded-m3-lg">
					<Tabs.List variant="secondary">
						<Tabs.Trigger value="photos" icon="photo">Photos</Tabs.Trigger>
						<Tabs.Trigger value="videos" icon="movie">Videos</Tabs.Trigger>
						<Tabs.Trigger value="audio" icon="music_note" badge>Audio</Tabs.Trigger>
					</Tabs.List>
					{#each ['photos', 'videos', 'audio'] as v (v)}
						<Tabs.Content value={v} class="bg-surface p-4 text-on-surface-variant">Content for “{v}”.</Tabs.Content>
					{/each}
				</Tabs.Root>
			</Demo>
		</div>
		<Demo
			label="Scrollable"
			spec="min tab width 90dp · 52dp start edge padding · the selected tab auto-scrolls toward the center (defaultSpatial)"
			class="flex-col flex-nowrap items-stretch"
		>
			<Tabs.Root bind:value={scrollTab} class="overflow-hidden rounded-m3-lg">
				<Tabs.List scrollable>
					{#each scrollTabs as tab (tab.value)}
						<Tabs.Trigger value={tab.value}>{tab.label}</Tabs.Trigger>
					{/each}
				</Tabs.List>
				{#each scrollTabs as tab (tab.value)}
					<Tabs.Content value={tab.value} class="flex items-center gap-3 bg-surface p-4 text-on-surface-variant">
						<Icon name="article" class="text-m3-primary" />
						Top stories in {tab.label}.
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		</Demo>
	</Section>
</Page>
