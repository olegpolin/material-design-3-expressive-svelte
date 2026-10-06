<script lang="ts" module>
	import type { TaskStatus } from './data.js';

	export type TaskFilters = {
		project: string;
		assignee: string;
		statuses: TaskStatus[];
		hideDone: boolean;
		overdueOnly: boolean;
		points: [number, number];
	};

	export const DEFAULT_FILTERS: TaskFilters = {
		project: 'all',
		assignee: 'all',
		statuses: [],
		hideDone: false,
		overdueOnly: false,
		points: [1, 13]
	};

	/** Number of filters that differ from the defaults (for the chip label / badge). */
	export function activeFilterCount(f: TaskFilters) {
		return (
			Number(f.project !== 'all') +
			Number(f.assignee !== 'all') +
			Number(f.statuses.length > 0) +
			Number(f.hideDone) +
			Number(f.overdueOnly) +
			Number(f.points[0] !== 1 || f.points[1] !== 13)
		);
	}
</script>

<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Chip, ChipSet } from '#lib/components/ui/chip/index.js';
	import { Divider } from '#lib/components/ui/divider/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import * as SideSheet from '#lib/components/ui/side-sheet/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { PROJECT_NAMES, STATUS_LABEL, TEAM } from './data.js';

	let {
		open = $bindable(false),
		filters,
		onapply
	}: {
		open?: boolean;
		filters: TaskFilters;
		onapply: (f: TaskFilters) => void;
	} = $props();

	// Draft copy: edits apply on "Apply"; closing the sheet discards them.
	let draft = $state<TaskFilters>(structuredClone(DEFAULT_FILTERS));

	/** Opens the sheet with a fresh draft of the current filters. */
	export function show() {
		draft = structuredClone($state.snapshot(filters)) as TaskFilters;
		open = true;
	}

	function toggleStatus(s: TaskStatus, on: boolean) {
		draft.statuses = on ? [...draft.statuses, s] : draft.statuses.filter((x) => x !== s);
	}

	const projectLabel = $derived(draft.project === 'all' ? 'All projects' : draft.project);
	const assigneeLabel = $derived(
		draft.assignee === 'all' ? 'Anyone' : (TEAM.find((m) => m.id === draft.assignee)?.name ?? 'Anyone')
	);
	const STATUSES = Object.keys(STATUS_LABEL) as TaskStatus[];
</script>

<SideSheet.Root bind:open>
	<SideSheet.Content width={360}>
		<SideSheet.Header>
			<SideSheet.Title>Filters</SideSheet.Title>
		</SideSheet.Header>
		<SideSheet.Body class="flex flex-col gap-6">
			<SideSheet.Description>Narrow down the tasks table. Changes apply when you press Apply.</SideSheet.Description>

			<section class="flex flex-col gap-3" aria-labelledby="flt-scope">
				<h3 id="flt-scope" class="type-title-sm text-on-surface-variant">Scope</h3>
				<Select.Root type="single" bind:value={draft.project}>
					<Select.Trigger class="w-full" aria-label="Project">
						<span class="flex flex-col items-start">
							<span class="type-body-sm text-on-surface-variant">Project</span>
							<span data-slot="select-value">{projectLabel}</span>
						</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="all" label="All projects" />
							{#each PROJECT_NAMES as p (p)}
								<Select.Item value={p} label={p} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={draft.assignee}>
					<Select.Trigger class="w-full" aria-label="Assignee">
						<span class="flex flex-col items-start">
							<span class="type-body-sm text-on-surface-variant">Assignee</span>
							<span data-slot="select-value">{assigneeLabel}</span>
						</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="all" label="Anyone" />
							{#each TEAM as m (m.id)}
								<Select.Item value={m.id} label={m.name} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</section>

			<Divider />

			<section class="flex flex-col gap-3" aria-labelledby="flt-status">
				<h3 id="flt-status" class="type-title-sm text-on-surface-variant">Status</h3>
				<ChipSet>
					{#each STATUSES as s (s)}
						<Chip
							variant="filter"
							selected={draft.statuses.includes(s)}
							onclick={() => toggleStatus(s, !draft.statuses.includes(s))}
						>
							{STATUS_LABEL[s]}
						</Chip>
					{/each}
				</ChipSet>
				<label class="flex min-h-12 cursor-pointer items-center justify-between gap-4" for="flt-hide-done">
					<span class="type-body-lg text-on-surface">Hide completed</span>
					<Switch id="flt-hide-done" bind:checked={draft.hideDone} />
				</label>
				<label class="flex min-h-12 cursor-pointer items-center justify-between gap-4" for="flt-overdue">
					<span class="type-body-lg text-on-surface">Overdue only</span>
					<Switch id="flt-overdue" bind:checked={draft.overdueOnly} icons />
				</label>
			</section>

			<Divider />

			<section class="flex flex-col gap-3" aria-labelledby="flt-points">
				<div class="flex items-baseline justify-between">
					<h3 id="flt-points" class="type-title-sm text-on-surface-variant">Story points</h3>
					<span class="type-label-lg text-on-surface tabular-nums">{draft.points[0]} – {draft.points[1]}</span>
				</div>
				<Slider
					type="multiple"
					bind:value={() => draft.points, (v) => (draft.points = [v[0], v[1]] as [number, number])}
					min={1}
					max={13}
					step={1}
					valueIndicator
					aria-labelledby="flt-points"
				/>
			</section>
		</SideSheet.Body>
		<SideSheet.Footer>
			<Button
				variant="filled"
				onclick={() => {
					onapply($state.snapshot(draft) as TaskFilters);
					open = false;
				}}>Apply</Button
			>
			<Button variant="outlined" onclick={() => (draft = structuredClone(DEFAULT_FILTERS))}>Reset</Button>
		</SideSheet.Footer>
	</SideSheet.Content>
</SideSheet.Root>
