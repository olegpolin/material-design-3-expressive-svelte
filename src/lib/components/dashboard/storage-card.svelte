<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { CircularProgress } from '#lib/components/ui/progress/index.js';
	import Panel from './panel.svelte';
	import { STORAGE } from './data.js';

	let { loading = false, class: className }: { loading?: boolean; class?: string } = $props();

	const pct = Math.round((STORAGE.usedGb / STORAGE.totalGb) * 100);
</script>

<Panel title="Storage" description="{STORAGE.usedGb} of {STORAGE.totalGb} GB used" {loading} class={className}>
	<div class="flex flex-col items-center gap-5">
		<div class="relative grid place-items-center">
			<CircularProgress value={pct} size={152} thick wavy aria-label="Storage used, {pct}%" />
			<div class="absolute inset-0 grid place-content-center text-center">
				<span class="type-headline-lg-emphasized text-on-surface tabular-nums">{pct}%</span>
				<span class="type-label-md text-on-surface-variant">used</span>
			</div>
		</div>
		<ul class="flex w-full flex-col gap-2">
			{#each STORAGE.breakdown as b (b.id)}
				<li class="flex items-center gap-3">
					<!-- icons, not color dots: the gauge has one arc, so colored keys would point at nothing -->
					<Icon name={b.icon} size={20} class="shrink-0 text-on-surface-variant" />
					<span class="flex-1 type-body-md text-on-surface-variant">{b.label}</span>
					<span class="type-label-lg text-on-surface tabular-nums">{b.gb} GB</span>
				</li>
			{/each}
		</ul>
		<Button variant="outlined" size="sm" class="self-stretch">Manage storage</Button>
	</div>
</Panel>
