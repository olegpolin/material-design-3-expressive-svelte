<script lang="ts">
	import { CalendarDate, type DateValue } from '@internationalized/date';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as ButtonGroup from '#lib/components/ui/button-group/index.js';
	import { Chip, ChipSet } from '#lib/components/ui/chip/index.js';
	import { DatePicker } from '#lib/components/ui/date-picker/index.js';
	import { ExtendedFab } from '#lib/components/ui/fab/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import * as Menu from '#lib/components/ui/menu/index.js';
	import { SearchBar } from '#lib/components/ui/search-bar/index.js';
	import { snackbar } from '#lib/components/ui/snackbar/index.js';
	import * as SplitButton from '#lib/components/ui/split-button/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { AppBarAction, TopAppBar } from '#lib/components/ui/top-app-bar/index.js';
	import ActivityCard from '#lib/components/dashboard/activity-card.svelte';
	import CategoriesCard from '#lib/components/dashboard/categories-card.svelte';
	import FiltersSheet, {
		activeFilterCount,
		DEFAULT_FILTERS,
		type TaskFilters
	} from '#lib/components/dashboard/filters-sheet.svelte';
	import MemberAvatar from '#lib/components/dashboard/member-avatar.svelte';
	import NewTaskDialog, { type NewTask } from '#lib/components/dashboard/new-task-dialog.svelte';
	import ProjectsCard from '#lib/components/dashboard/projects-card.svelte';
	import SessionsCard from '#lib/components/dashboard/sessions-card.svelte';
	import SourcesCard from '#lib/components/dashboard/sources-card.svelte';
	import StatTile from '#lib/components/dashboard/stat-tile.svelte';
	import StorageCard from '#lib/components/dashboard/storage-card.svelte';
	import TasksTable from '#lib/components/dashboard/tasks-table.svelte';
	import TeamCard from '#lib/components/dashboard/team-card.svelte';
	import {
		getCategories,
		getKpis,
		getSessions,
		getSources,
		isoDate,
		ME,
		memberById,
		NOTIFICATIONS,
		RANGES,
		rangeLabel,
		STATUS_LABEL,
		TASKS,
		TODAY,
		WORKSPACE,
		type RangeKey,
		type Task
	} from '#lib/components/dashboard/data.js';

	// ---------------------------------------------------------------- period
	let range = $state<RangeKey>('month');
	const maxDate = new CalendarDate(TODAY.getUTCFullYear(), TODAY.getUTCMonth() + 1, TODAY.getUTCDate());
	let endDate = $state<DateValue | undefined>(maxDate);
	const end = $derived(endDate ? new Date(Date.UTC(endDate.year, endDate.month - 1, endDate.day)) : TODAY);
	const subtitle = $derived(`${WORKSPACE.name} workspace · ${rangeLabel(range, end)}`);

	const kpis = $derived(getKpis(range));
	const sessions = $derived(getSessions(range, end));
	const categories = $derived(getCategories(range));
	const sources = $derived(getSources(range));

	// ---------------------------------------------------------------- chart series chips
	let showWeb = $state(true);
	let showMobile = $state(true);

	// ---------------------------------------------------------------- tasks + filters
	let tasks = $state<Task[]>(structuredClone(TASKS));
	let filters = $state<TaskFilters>(structuredClone(DEFAULT_FILTERS));
	let query = $state('');
	let searchOpen = $state(false);
	let filtersSheet = $state<ReturnType<typeof FiltersSheet>>();
	let sheetOpen = $state(false);
	const filterCount = $derived(activeFilterCount(filters));
	const todayIso = isoDate(TODAY);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const f = filters;
		return tasks.filter(
			(t) =>
				(!q || `${t.id} ${t.title} ${t.project} ${memberById(t.assigneeId).name}`.toLowerCase().includes(q)) &&
				(f.project === 'all' || t.project === f.project) &&
				(f.assignee === 'all' || t.assigneeId === f.assignee) &&
				(f.statuses.length === 0 || f.statuses.includes(t.status)) &&
				(!f.hideDone || t.status !== 'done') &&
				(!f.overdueOnly || (t.status !== 'done' && t.due < todayIso)) &&
				t.points >= f.points[0] &&
				t.points <= f.points[1]
		);
	});

	/** Active filters as removable input chips. */
	const filterChips = $derived.by(() => {
		const f = filters;
		const chips: { key: string; label: string; clear: () => void }[] = [];
		if (f.project !== 'all') chips.push({ key: 'project', label: f.project, clear: () => (filters.project = 'all') });
		if (f.assignee !== 'all')
			chips.push({ key: 'assignee', label: memberById(f.assignee).name, clear: () => (filters.assignee = 'all') });
		if (f.statuses.length)
			chips.push({
				key: 'status',
				label: f.statuses.length === 1 ? STATUS_LABEL[f.statuses[0]] : `${f.statuses.length} statuses`,
				clear: () => (filters.statuses = [])
			});
		if (f.hideDone) chips.push({ key: 'done', label: 'Hide completed', clear: () => (filters.hideDone = false) });
		if (f.overdueOnly) chips.push({ key: 'overdue', label: 'Overdue', clear: () => (filters.overdueOnly = false) });
		if (f.points[0] !== 1 || f.points[1] !== 13)
			chips.push({ key: 'points', label: `${f.points[0]}–${f.points[1]} pts`, clear: () => (filters.points = [1, 13]) });
		return chips;
	});

	function setStatus(ids: string[], status: Task['status']) {
		const before = tasks.filter((t) => ids.includes(t.id)).map((t) => ({ id: t.id, status: t.status }));
		for (const t of tasks) if (ids.includes(t.id)) t.status = status;
		snackbar(ids.length === 1 ? `${ids[0]} moved to ${STATUS_LABEL[status]}` : `${ids.length} tasks moved to ${STATUS_LABEL[status]}`, {
			action: 'Undo',
			onAction: () => {
				for (const b of before) {
					const t = tasks.find((x) => x.id === b.id);
					if (t) t.status = b.status;
				}
			}
		});
	}

	function remove(ids: string[]) {
		const snapshot = $state.snapshot(tasks) as Task[];
		tasks = tasks.filter((t) => !ids.includes(t.id));
		snackbar(ids.length === 1 ? `${ids[0]} deleted` : `${ids.length} tasks deleted`, {
			action: 'Undo',
			onAction: () => (tasks = snapshot)
		});
	}

	function assignToMe(id: string) {
		const t = tasks.find((x) => x.id === id);
		if (!t) return;
		t.assigneeId = ME.id;
		snackbar(`${id} assigned to you`);
	}

	let nextId = 1043;
	function createTask(n: NewTask) {
		const id = `ORB-${nextId++}`;
		tasks = [
			{
				id,
				title: n.title,
				project: n.project,
				assigneeId: n.assigneeId,
				status: 'todo',
				priority: n.urgent ? 'high' : 'medium',
				due: isoDate(new Date(TODAY.getTime() + 7 * 86_400_000)),
				points: 3
			},
			...tasks
		];
		snackbar(`Task ${id} created`, { action: 'Undo', onAction: () => (tasks = tasks.filter((t) => t.id !== id)) });
	}

	// ---------------------------------------------------------------- misc
	let dialogOpen = $state(false);
	let loading = $state(false);
	let unread = $state(NOTIFICATIONS.length);
	let weeklyReport = $state(false);

	function exportAs(kind: string) {
		snackbar(`Exported ${filtered.length} tasks as ${kind}`);
	}
</script>

<svelte:head>
	<title>Dashboard · Material 3 Expressive · Svelte</title>
</svelte:head>

{#snippet actions()}
	<AppBarAction icon="search" label="Search tasks" selected={searchOpen} onclick={() => (searchOpen = !searchOpen)} />
	<Menu.Root>
		<Menu.Trigger>
			{#snippet child({ props })}
				<AppBarAction {...props} label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
					<Badge count={unread} aria-label="" class="pointer-events-none">
						<Icon name="notifications" fill={unread > 0} />
					</Badge>
				</AppBarAction>
			{/snippet}
		</Menu.Trigger>
		<Menu.Content align="end" class="w-80 max-w-[calc(100vw-32px)]">
			<Menu.Group>
				<Menu.GroupHeading>Notifications</Menu.GroupHeading>
				{#each NOTIFICATIONS as n, i (n.id)}
					<Menu.Item class="h-auto min-h-14 items-start py-3">
						<Icon name={n.icon} />
						<span class="flex min-w-0 flex-1 flex-col whitespace-normal">
							<span class={i < unread ? 'type-body-md-emphasized' : 'type-body-md'}>{n.text}</span>
							<span class="type-body-sm text-on-surface-variant">{n.time}</span>
						</span>
					</Menu.Item>
				{/each}
			</Menu.Group>
			<Menu.Separator />
			<Menu.Group>
				<Menu.Item disabled={unread === 0} onSelect={() => (unread = 0)}>
					<Icon name="done_all" />Mark all as read
				</Menu.Item>
			</Menu.Group>
		</Menu.Content>
	</Menu.Root>
	<Menu.Root>
		<Menu.Trigger>
			{#snippet child({ props })}
				<AppBarAction {...props} label="Account: {ME.name}">
					<MemberAvatar member={ME} class="size-8" />
				</AppBarAction>
			{/snippet}
		</Menu.Trigger>
		<Menu.Content align="end" class="min-w-56">
			<Menu.Group>
				<Menu.Label class="flex flex-col">
					<span class="type-title-sm text-on-surface">{ME.name}</span>
					<span class="type-body-sm text-on-surface-variant">{ME.role} · {WORKSPACE.name}</span>
				</Menu.Label>
			</Menu.Group>
			<Menu.Separator />
			<Menu.Group>
				<Menu.Item><Icon name="account_circle" />Profile</Menu.Item>
				<Menu.Item><Icon name="settings" />Workspace settings</Menu.Item>
			</Menu.Group>
			<Menu.Separator />
			<Menu.Group>
				<Menu.Item onSelect={() => snackbar('Signing out is disabled in this demo')}>
					<Icon name="logout" />Sign out
				</Menu.Item>
			</Menu.Group>
		</Menu.Content>
	</Menu.Root>
{/snippet}

<div class="flex min-w-0 flex-col bg-surface pb-32 text-on-surface min-[840px]:pb-24">
	<!--
		Expanded windows: the page owns a medium flexible top app bar (the shell has a rail there).
		Compact / medium windows: the shell already shows a sticky small app bar, so the page uses a
		plain (non-sticky) header with the same type roles instead of stacking a second bar.
	-->
	<TopAppBar variant="medium-flexible" title="Dashboard" {subtitle} class="max-[839px]:hidden min-[840px]:px-2">
		{#snippet trailing()}
			{@render actions()}
		{/snippet}
	</TopAppBar>
	<header class="flex items-end gap-2 px-4 pt-4 pb-2 min-[600px]:px-6 min-[840px]:sr-only">
		<div class="flex min-w-0 flex-1 flex-col">
			<!-- the one page heading; visually provided by the app bar on expanded windows -->
			<h1 class="type-headline-md text-on-surface">Dashboard</h1>
			<p class="type-label-lg text-on-surface-variant min-[840px]:hidden">{subtitle}</p>
		</div>
		<div class="-me-2 flex shrink-0 items-center text-on-surface-variant min-[840px]:hidden">
			{@render actions()}
		</div>
	</header>

	<div class="flex flex-col gap-4 px-4 min-[600px]:gap-6 min-[600px]:px-6 min-[840px]:px-6">
		{#if searchOpen}
			<SearchBar
				bind:value={query}
				placeholder="Search tasks, projects or people"
				leadingIcon="search"
				elevated={false}
				autofocus
				class="max-w-2xl"
				barClass="bg-surface-container-high"
				onkeydown={(e) => {
					if (e.key === 'Escape') {
						query = '';
						searchOpen = false;
					}
				}}
			>
				{#snippet trailing()}
					{#if query}
						<AppBarAction icon="close" label="Clear search" onclick={() => (query = '')} />
					{/if}
				{/snippet}
			</SearchBar>
		{/if}

		<!-- ------------------------------------------------------------ filter row -->
		<section aria-label="Dashboard filters" class="flex flex-col gap-3">
			<div class="flex flex-wrap items-center gap-3">
				<ButtonGroup.Root
					variant="connected"
					type="single"
					size="sm"
					itemVariant="tonal"
					required
					bind:value={() => range, (v) => (range = v as RangeKey)}
					class="w-auto min-w-0 max-[599px]:w-full min-[600px]:min-w-[340px]"
					aria-label="Period"
				>
					{#each RANGES as r (r.value)}
						<ButtonGroup.Item value={r.value} aria-label="{r.label}: {r.long}">{r.label}</ButtonGroup.Item>
					{/each}
				</ButtonGroup.Root>
				<DatePicker
					label="Ending"
					bind:value={endDate}
					maxValue={maxDate}
					supportingText=""
					class="w-56 max-[599px]:w-full"
				/>
				<div class="ms-auto flex items-center gap-2 max-[599px]:ms-0">
					<SplitButton.Root variant="filled" size="sm">
						<SplitButton.Leading onclick={() => exportAs('CSV')}>
							<Icon name="download" data-icon="inline-start" />Export
						</SplitButton.Leading>
						<Menu.Root>
							<Menu.Trigger>
								{#snippet child({ props })}
									<SplitButton.Trailing {...props} aria-label="More export options" />
								{/snippet}
							</Menu.Trigger>
							<Menu.Content align="end" class="min-w-56">
								<Menu.Group>
									<Menu.Item onSelect={() => exportAs('CSV')}><Icon name="csv" />CSV spreadsheet</Menu.Item>
									<Menu.Item onSelect={() => exportAs('PDF')}><Icon name="picture_as_pdf" />PDF report</Menu.Item>
									<Menu.Item onSelect={() => snackbar('Share link copied')}><Icon name="link" />Copy share link</Menu.Item>
								</Menu.Group>
								<Menu.Separator />
								<Menu.Group>
									<Menu.CheckboxItem
										bind:checked={weeklyReport}
										onCheckedChange={(v) => snackbar(v ? 'Weekly report scheduled for Mondays' : 'Weekly report cancelled')}
									>
										Email weekly report
									</Menu.CheckboxItem>
								</Menu.Group>
							</Menu.Content>
						</Menu.Root>
					</SplitButton.Root>
				</div>
			</div>

			<ChipSet aria-label="Chart and table filters">
				<Chip variant="filter" bind:selected={showWeb} aria-label="Show web sessions">Web</Chip>
				<Chip variant="filter" bind:selected={showMobile} aria-label="Show mobile sessions">Mobile</Chip>
				<Chip
					variant="assist"
					icon="tune"
					aria-haspopup="dialog"
					aria-expanded={sheetOpen}
					onclick={() => filtersSheet?.show()}
				>
					{filterCount ? `More filters · ${filterCount}` : 'More filters'}
				</Chip>
				{#each filterChips as c (c.key)}
					<Chip variant="input" removable onremove={c.clear} removeLabel="Remove filter {c.label}">{c.label}</Chip>
				{/each}
			</ChipSet>
		</section>

		<!-- ------------------------------------------------------------ grid -->
		<div class="grid grid-cols-1 gap-4 min-[600px]:grid-cols-8 min-[600px]:gap-6 min-[1200px]:grid-cols-12">
			<h2 class="sr-only">Key metrics</h2>
			{#each kpis as kpi (kpi.id)}
				<StatTile {kpi} {loading} class="min-[600px]:col-span-4 min-[1200px]:col-span-3" />
			{/each}

			<SessionsCard data={sessions} {range} {showWeb} {showMobile} {loading} class="min-[600px]:col-span-8" />
			<SourcesCard data={sources} {loading} class="min-[600px]:col-span-4" />

			<CategoriesCard data={categories} {loading} class="min-[600px]:col-span-4 min-[1200px]:col-span-5" />
			<ProjectsCard {loading} class="min-[600px]:col-span-4" />
			<StorageCard {loading} class="min-[600px]:col-span-4 min-[1200px]:col-span-3" />

			<TasksTable
				tasks={filtered}
				total={tasks.length}
				{loading}
				onstatus={setStatus}
				ondelete={remove}
				onassign={assignToMe}
				class="min-[600px]:col-span-8 min-[1200px]:col-span-12"
			/>
			<div
				class="grid gap-4 min-[600px]:col-span-8 min-[600px]:grid-cols-2 min-[600px]:gap-6 min-[1200px]:col-span-12 min-[1200px]:grid-cols-[7fr_5fr]"
			>
				<ActivityCard {loading} />
				<TeamCard {loading} oninvite={() => snackbar('Invite link copied to clipboard')} />
			</div>
		</div>

		<footer class="flex flex-wrap items-center justify-between gap-4 pt-2 type-body-sm text-on-surface-variant">
			<span>{WORKSPACE.name} · {WORKSPACE.tagline} · mock data</span>
			<label class="flex cursor-pointer items-center gap-3" for="simulate-loading">
				Simulate loading
				<Switch id="simulate-loading" bind:checked={loading} />
			</label>
		</footer>
	</div>
</div>

<ExtendedFab
	icon="add"
	label="New task"
	color="primary-container"
	class="fixed end-4 bottom-[calc(96px+env(safe-area-inset-bottom))] z-20 min-[600px]:end-6 min-[600px]:bottom-20 min-[840px]:bottom-6"
	aria-haspopup="dialog"
	onclick={() => (dialogOpen = true)}
/>

<NewTaskDialog bind:open={dialogOpen} onsave={createTask} />
<FiltersSheet bind:this={filtersSheet} bind:open={sheetOpen} {filters} onapply={(f) => (filters = f)} />
