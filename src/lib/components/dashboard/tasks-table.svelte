<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { IconButton } from '#lib/components/ui/icon-button/index.js';
	import * as Menu from '#lib/components/ui/menu/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import * as Table from '#lib/components/ui/table/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import { stateLayer } from '#lib/m3/ripple.svelte.js';
	import { cn } from '#lib/utils.js';
	import MemberAvatar from './member-avatar.svelte';
	import Panel from './panel.svelte';
	import StatusPill from './status-pill.svelte';
	import { formatDue, isoDate, ME, memberById, PRIORITY_LABEL, TODAY, type Task, type TaskPriority } from './data.js';

	let {
		tasks,
		total,
		loading = false,
		onstatus,
		ondelete,
		onassign,
		onedit,
		class: className
	}: {
		/** Already filtered rows. */
		tasks: Task[];
		/** Unfiltered row count (for the "filtered" hint). */
		total: number;
		loading?: boolean;
		onstatus?: (ids: string[], status: Task['status']) => void;
		ondelete?: (ids: string[]) => void;
		onassign?: (id: string) => void;
		onedit?: (id: string) => void;
		class?: string;
	} = $props();

	// ------------------------------------------------------------ sorting
	type SortKey = 'due' | 'points';
	let sort = $state<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);

	function toggleSort(key: SortKey) {
		sort = sort?.key !== key ? { key, dir: 'asc' } : sort.dir === 'asc' ? { key, dir: 'desc' } : null;
	}

	const sorted = $derived.by(() => {
		if (!sort) return tasks;
		const { key, dir } = sort;
		const m = dir === 'asc' ? 1 : -1;
		return [...tasks].sort((a, b) => (key === 'due' ? a.due.localeCompare(b.due) : a.points - b.points) * m);
	});

	// ------------------------------------------------------------ pagination
	let pageSize = $state(8);
	let page = $state(0);
	const pageCount = $derived(Math.max(1, Math.ceil(sorted.length / pageSize)));
	const current = $derived(Math.min(page, pageCount - 1));
	const rows = $derived(sorted.slice(current * pageSize, current * pageSize + pageSize));
	const rangeText = $derived(
		sorted.length === 0
			? '0 of 0'
			: `${current * pageSize + 1}–${Math.min(sorted.length, (current + 1) * pageSize)} of ${sorted.length}`
	);

	// ------------------------------------------------------------ selection
	let selected = $state<string[]>([]);
	// Only ids that are still in the filtered set count.
	const selectedVisible = $derived(selected.filter((id) => tasks.some((t) => t.id === id)));
	const pageIds = $derived(rows.map((r) => r.id));
	const pageSelected = $derived(pageIds.filter((id) => selectedVisible.includes(id)).length);
	const allOnPage = $derived(pageIds.length > 0 && pageSelected === pageIds.length);
	const someOnPage = $derived(pageSelected > 0 && !allOnPage);

	function toggleRow(id: string, on: boolean) {
		selected = on ? [...selected, id] : selected.filter((s) => s !== id);
	}
	function togglePage(on: boolean) {
		selected = on ? [...new Set([...selected, ...pageIds])] : selected.filter((id) => !pageIds.includes(id));
	}
	function bulk(fn: ((ids: string[]) => void) | undefined) {
		fn?.(selectedVisible);
		selected = [];
	}

	const PRIORITY: Record<TaskPriority, { icon: string; cls: string }> = {
		high: { icon: 'keyboard_double_arrow_up', cls: 'text-error' },
		medium: { icon: 'drag_handle', cls: 'text-on-surface-variant' },
		low: { icon: 'keyboard_arrow_down', cls: 'text-on-surface-variant' }
	};
	const todayIso = isoDate(TODAY);

	const HEAD = 'h-14 px-4 type-label-lg text-on-surface-variant';
	const CELL = 'h-14 px-4 py-0 type-body-md text-on-surface';
</script>

<!-- Sort control: the arrow sits on the side facing the column's content (leading for end-aligned
     numeric columns) so the label stays aligned with the values; hidden until hover/focus/active. -->
{#snippet sortButton(key: SortKey, label: string, end = false)}
	{@const active = sort?.key === key}
	<button
		type="button"
		class={cn(
			'group/sort -mx-2 inline-flex h-10 cursor-pointer items-center gap-1 rounded-m3-full px-2 type-label-lg',
			end && 'flex-row-reverse',
			active && 'text-on-surface'
		)}
		onclick={() => toggleSort(key)}
		{@attach stateLayer()}
	>
		{label}
		<Icon
			name={active && sort?.dir === 'desc' ? 'arrow_downward' : 'arrow_upward'}
			size={18}
			class={cn(
				'transition-opacity duration-spring-fast-effects ease-spring-fast-effects',
				active ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-60 group-focus-visible/sort:opacity-60'
			)}
		/>
	</button>
{/snippet}

{#snippet pagerButton(icon: string, label: string, disabled: boolean, go: () => void)}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<IconButton {...props} {icon} aria-label={label} {disabled} onclick={go} />
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>{label}</Tooltip.Content>
	</Tooltip.Root>
{/snippet}

<Panel
	title="Recent tasks"
	description={tasks.length === total ? `${total} tasks across all projects` : `${tasks.length} of ${total} tasks match your filters`}
	{loading}
	class={className}
	contentClass="px-0 max-[599px]:[&_[data-slot=table-container]]:max-h-[min(70dvh,600px)]"
>
	{#snippet skeleton()}
		<div class="flex flex-col">
			{#each [0, 1, 2, 3, 4, 5] as i (i)}
				<div class="flex h-14 items-center gap-4 border-b border-outline-variant px-6">
					<Skeleton class="size-[18px] rounded-m3-xs bg-on-surface/10" />
					<Skeleton class="h-4 flex-1 rounded-m3-xs bg-on-surface/10" />
					<Skeleton class="h-6 w-24 rounded-m3-sm bg-on-surface/10" />
					<Skeleton class="h-4 w-16 rounded-m3-xs bg-on-surface/10" />
				</div>
			{/each}
		</div>
	{/snippet}

	<!-- contextual action bar for the selection -->
	<div
		class={cn(
			'mx-4 mb-2 flex min-h-14 flex-wrap items-center gap-2 rounded-m3-lg px-2 transition-colors duration-spring-default-effects ease-spring-default-effects',
			selectedVisible.length ? 'bg-secondary-container text-on-secondary-container' : 'hidden'
		)}
		role="toolbar"
		aria-label="Selection actions"
	>
		<IconButton icon="close" aria-label="Clear selection" onclick={() => (selected = [])} class="text-inherit" />
		<span class="me-auto type-title-sm" aria-live="polite">{selectedVisible.length} selected</span>
		<Button variant="text" size="sm" onclick={() => bulk((ids) => onstatus?.(ids, 'done'))}>
			<Icon name="task_alt" data-icon="inline-start" />Mark done
		</Button>
		<Button variant="text" size="sm" onclick={() => bulk(ondelete)}>
			<Icon name="delete" data-icon="inline-start" />Delete
		</Button>
	</div>

	<Table.Root class="min-w-[880px] border-collapse">
		<Table.Caption class="sr-only">Recent tasks, {rangeText}</Table.Caption>
		<!-- sticky inside the table's own scroll box (it scrolls vertically on compact windows) -->
		<Table.Header class="sticky top-0 z-[1] bg-surface-container-low [&_tr]:border-outline-variant">
			<Table.Row class="border-b border-outline-variant hover:bg-transparent">
				<Table.Head scope="col" class={cn(HEAD, 'w-14 ps-6 pe-0')}>
					<Checkbox
						checked={allOnPage}
						indeterminate={someOnPage}
						onCheckedChange={(v) => togglePage(v)}
						aria-label="Select all tasks on this page"
						disabled={rows.length === 0}
					/>
				</Table.Head>
				<Table.Head scope="col" class={HEAD}>Task</Table.Head>
				<Table.Head scope="col" class={HEAD}>Project</Table.Head>
				<Table.Head scope="col" class={HEAD}>Assignee</Table.Head>
				<Table.Head scope="col" class={HEAD}>Status</Table.Head>
				<Table.Head scope="col" class={HEAD}>Priority</Table.Head>
				<Table.Head
					scope="col"
					class={cn(HEAD, 'group/th')}
					aria-sort={sort?.key === 'due' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
				>
					{@render sortButton('due', 'Due')}
				</Table.Head>
				<Table.Head
					scope="col"
					class={cn(HEAD, 'group/th text-end')}
					aria-sort={sort?.key === 'points' ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
				>
					{@render sortButton('points', 'Points', true)}
				</Table.Head>
				<Table.Head scope="col" class={cn(HEAD, 'w-16 pe-4')}><span class="sr-only">Actions</span></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each rows as t (t.id)}
				{@const m = memberById(t.assigneeId)}
				{@const isSelected = selectedVisible.includes(t.id)}
				{@const overdue = t.status !== 'done' && t.due < todayIso}
				<Table.Row
					data-state={isSelected ? 'selected' : undefined}
					class="border-b border-outline-variant transition-colors duration-spring-default-effects ease-spring-default-effects hover:bg-on-surface/8 data-[state=selected]:bg-secondary-container/60 has-aria-expanded:bg-on-surface/8"
				>
					<Table.Cell class={cn(CELL, 'ps-6 pe-0')}>
						<Checkbox
							checked={isSelected}
							onCheckedChange={(v) => toggleRow(t.id, v)}
							aria-label="Select {t.id}: {t.title}"
						/>
					</Table.Cell>
					<Table.Cell class={cn(CELL, 'max-w-72')}>
						<div class="flex min-w-0 flex-col">
							<span class="truncate type-body-md text-on-surface">{t.title}</span>
							<span class="type-label-sm text-on-surface-variant">{t.id}</span>
						</div>
					</Table.Cell>
					<Table.Cell class={cn(CELL, 'text-on-surface-variant')}>{t.project}</Table.Cell>
					<Table.Cell class={CELL}>
						<span class="flex items-center gap-2">
							<MemberAvatar member={m} size="sm" />
							{m.name}
						</span>
					</Table.Cell>
					<Table.Cell class={CELL}><StatusPill status={t.status} /></Table.Cell>
					<Table.Cell class={CELL}>
						<span class={cn('flex items-center gap-1', PRIORITY[t.priority].cls)}>
							<Icon name={PRIORITY[t.priority].icon} size={20} />
							<span class="text-on-surface">{PRIORITY_LABEL[t.priority]}</span>
						</span>
					</Table.Cell>
					<Table.Cell class={cn(CELL, 'tabular-nums', overdue && 'text-error')}>
						{formatDue(t.due)}{#if overdue}<span class="sr-only"> (overdue)</span>{/if}
					</Table.Cell>
					<Table.Cell class={cn(CELL, 'text-end tabular-nums')}>{t.points}</Table.Cell>
					<Table.Cell class={cn(CELL, 'pe-4 text-end')}>
						<Menu.Root>
							<Menu.Trigger>
								{#snippet child({ props })}
									<IconButton {...props} icon="more_vert" aria-label="Actions for {t.id}" />
								{/snippet}
							</Menu.Trigger>
							<Menu.Content align="end" class="min-w-48">
								<Menu.Group>
									<Menu.Item onSelect={() => onedit?.(t.id)}>
										<Icon name="edit" />Edit
									</Menu.Item>
									<Menu.Item onSelect={() => onassign?.(t.id)} disabled={t.assigneeId === ME.id}>
										<Icon name="person" />Assign to me
									</Menu.Item>
									{#if t.status !== 'done'}
										<Menu.Item onSelect={() => onstatus?.([t.id], 'done')}>
											<Icon name="task_alt" />Mark done
										</Menu.Item>
									{:else}
										<Menu.Item onSelect={() => onstatus?.([t.id], 'in-progress')}>
											<Icon name="restart_alt" />Reopen
										</Menu.Item>
									{/if}
									<Menu.Sub>
										<Menu.SubTrigger><Icon name="flag" />Set status</Menu.SubTrigger>
										<Menu.SubContent>
											<Menu.Group>
												{#each ['todo', 'in-progress', 'review', 'blocked'] as const as s (s)}
													<Menu.Item onSelect={() => onstatus?.([t.id], s)}>
														<StatusPill status={s} />
													</Menu.Item>
												{/each}
											</Menu.Group>
										</Menu.SubContent>
									</Menu.Sub>
								</Menu.Group>
								<Menu.Separator />
								<Menu.Group>
									<Menu.Item variant="destructive" onSelect={() => ondelete?.([t.id])}>
										<Icon name="delete" />Delete
									</Menu.Item>
								</Menu.Group>
							</Menu.Content>
						</Menu.Root>
					</Table.Cell>
				</Table.Row>
			{:else}
				<Table.Row class="hover:bg-transparent">
					<Table.Cell colspan={9} class="h-40 text-center type-body-md text-on-surface-variant">
						<span class="flex flex-col items-center gap-2">
							<Icon name="filter_alt_off" size={32} />
							No tasks match your filters.
						</span>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>

	<!-- pagination -->
	<nav class="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 px-4 pt-3" aria-label="Table pagination">
		<div class="flex items-center gap-3">
			<span class="type-body-sm text-on-surface-variant" id="rows-per-page">Rows per page</span>
			<Select.Root
				type="single"
				value={String(pageSize)}
				onValueChange={(v) => {
					pageSize = Number(v);
					page = 0;
				}}
			>
				<Select.Trigger size="sm" aria-labelledby="rows-per-page" class="min-w-20">
					<span data-slot="select-value">{pageSize}</span>
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each [5, 8, 12, 24] as n (n)}
							<Select.Item value={String(n)} label={String(n)} />
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>
		<span class="type-body-sm text-on-surface tabular-nums" aria-live="polite">{rangeText}</span>
		<div class="flex items-center">
			{@render pagerButton('first_page', 'First page', current === 0, () => (page = 0))}
			{@render pagerButton('chevron_left', 'Previous page', current === 0, () => (page = current - 1))}
			{@render pagerButton('chevron_right', 'Next page', current >= pageCount - 1, () => (page = current + 1))}
			{@render pagerButton('last_page', 'Last page', current >= pageCount - 1, () => (page = pageCount - 1))}
		</div>
	</nav>
</Panel>
