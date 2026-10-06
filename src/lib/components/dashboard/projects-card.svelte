<script lang="ts">
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { IconButton } from '#lib/components/ui/icon-button/index.js';
	import { LinearProgress } from '#lib/components/ui/progress/index.js';
	import { cn } from '#lib/utils.js';
	import Panel from './panel.svelte';
	import { PROJECTS } from './data.js';

	let { loading = false, class: className }: { loading?: boolean; class?: string } = $props();

	const STATUS = {
		'in-progress': { label: 'On track', cls: 'text-on-surface-variant' },
		'at-risk': { label: 'At risk', cls: 'text-error' },
		done: { label: 'Done', cls: 'text-tertiary' }
	} as const;
</script>

<Panel title="Projects" description="Delivery progress" {loading} class={className}>
	{#snippet action()}
		<IconButton icon="open_in_new" aria-label="Open projects" />
	{/snippet}
	<ul class="flex flex-col gap-5">
		{#each PROJECTS as p (p.id)}
			{@const s = STATUS[p.status]}
			<li class="flex flex-col gap-2">
				<div class="flex items-center gap-3">
					<span
						class={cn(
							'grid size-10 shrink-0 place-items-center rounded-m3-md',
							p.status === 'done'
								? 'bg-tertiary-container text-on-tertiary-container'
								: p.status === 'at-risk'
									? 'bg-error-container text-on-error-container'
									: 'bg-secondary-container text-on-secondary-container'
						)}
					>
						<Icon name={p.icon} size={20} />
					</span>
					<div class="flex min-w-0 flex-1 flex-col">
						<span class="truncate type-title-sm text-on-surface">{p.name}</span>
						<span class="type-body-sm text-on-surface-variant">
							<span class={s.cls}>{s.label}</span> · due {p.due}
						</span>
					</div>
					<span class="type-label-lg text-on-surface tabular-nums">{p.progress}%</span>
				</div>
				<LinearProgress
					value={p.progress}
					wavy={p.status !== 'done'}
					aria-label="{p.name} progress"
					class={cn(
						p.status === 'at-risk' &&
							'[&_[data-slot=progress-indicator]]:stroke-error [&_[data-slot=progress-stop]]:fill-error [&_[data-slot=progress-track]]:stroke-error-container',
						p.status === 'done' && '[&_[data-slot=progress-indicator]]:stroke-tertiary'
					)}
				/>
			</li>
		{/each}
	</ul>
</Panel>
