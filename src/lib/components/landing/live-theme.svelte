<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import { getTheme } from '#lib/m3/theme.svelte.js';
	import type { ColorRole } from '#lib/m3/color-roles.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';

	const theme = getTheme();

	const SEEDS = [
		{ hex: '#6750A4', name: 'Baseline violet' },
		{ hex: '#0B57D0', name: 'Blue' },
		{ hex: '#006A6A', name: 'Teal' },
		{ hex: '#B3261E', name: 'Red' },
		{ hex: '#7D5260', name: 'Mauve' },
		{ hex: '#386A20', name: 'Green' },
		{ hex: '#8B5000', name: 'Amber' },
		{ hex: '#5B5B5B', name: 'Neutral' },
	];

	/** Role tiles that show the generated scheme (container + its on-color). */
	const ROLES: { bg: string; fg: string; role: ColorRole; label: string }[] = [
		{ bg: 'bg-m3-primary', fg: 'text-on-primary', role: 'primary', label: 'Primary' },
		{ bg: 'bg-primary-container', fg: 'text-on-primary-container', role: 'primary-container', label: 'Primary container' },
		{ bg: 'bg-secondary-container', fg: 'text-on-secondary-container', role: 'secondary-container', label: 'Secondary container' },
		{ bg: 'bg-tertiary-container', fg: 'text-on-tertiary-container', role: 'tertiary-container', label: 'Tertiary container' },
		{ bg: 'bg-surface-container-highest', fg: 'text-on-surface', role: 'surface-container-highest', label: 'Surface container highest' },
		{ bg: 'bg-inverse-surface', fg: 'text-inverse-on-surface', role: 'inverse-surface', label: 'Inverse surface' },
	];

	const isSelected = (hex: string) => theme.seed.toLowerCase() === hex.toLowerCase();

	/** Readable check-mark color on top of a seed swatch (relative luminance). */
	function onSeed(hex: string) {
		const [r, g, b] = [1, 3, 5].map((i) => {
			const c = parseInt(hex.slice(i, i + 2), 16) / 255;
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? '#000' : '#fff';
	}

	// Roving focus inside the seed radiogroup (arrow keys move + select).
	function onSeedKeydown(e: KeyboardEvent, index: number) {
		const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
		if (!delta) return;
		e.preventDefault();
		const next = (index + delta + SEEDS.length) % SEEDS.length;
		theme.seed = SEEDS[next].hex;
		const group = (e.currentTarget as HTMLElement).closest('[role=radiogroup]');
		group?.querySelectorAll<HTMLElement>('[role=radio]')[next]?.focus();
	}

	const hasSelection = $derived(SEEDS.some((s) => isSelected(s.hex)));
</script>

<section aria-labelledby="live-theme-title" class="@container/theme">
	<div
		class="grid gap-8 rounded-m3-xxl bg-surface-container p-6 sm:p-8 @4xl/theme:grid-cols-[minmax(0,1fr)_auto] @4xl/theme:items-center @4xl/theme:p-10"
	>
		<div class="flex flex-col gap-3">
			<p class="type-label-lg text-m3-primary">Dynamic color</p>
			<h2 id="live-theme-title" class="type-headline-lg-emphasized text-on-surface">Live theme</h2>
			<p class="type-body-lg max-w-[52ch] text-on-surface-variant">
				Pick a seed. Material Color Utilities generates all 49 roles for light and dark, and the whole page
				recolors in place.
			</p>
		</div>

		<div class="flex flex-col gap-6">
			<Tooltip.Provider>
				<div role="radiogroup" aria-label="Seed color" class="flex flex-wrap gap-2">
					{#each SEEDS as seed, i (seed.hex)}
						{@const selected = isSelected(seed.hex)}
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<button
										{...props}
										type="button"
										role="radio"
										aria-checked={selected}
										aria-label="{seed.name} {seed.hex}"
										tabindex={selected || (!hasSelection && i === 0) ? 0 : -1}
										class={[
											'grid size-12 cursor-pointer place-items-center',
											'transition-[border-radius,box-shadow] duration-spring-fast-spatial ease-spring-fast-spatial',
											selected
												? 'rounded-m3-lg shadow-[0_0_0_3px_var(--md-sys-color-surface-container),0_0_0_5px_var(--md-sys-color-on-surface)]'
												: 'rounded-[24px]',
										]}
										style:background-color={seed.hex}
										style:color={onSeed(seed.hex)}
										onclick={() => (theme.seed = seed.hex)}
										onkeydown={(e) => onSeedKeydown(e, i)}
										{@attach ripple()}
									>
										<Icon
											name="check"
											weight={600}
											class="transition-[opacity,scale] duration-spring-fast-spatial ease-spring-fast-spatial {selected
												? 'scale-100 opacity-100'
												: 'scale-50 opacity-0'}"
										/>
									</button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>{seed.name} · {seed.hex}</Tooltip.Content>
						</Tooltip.Root>
					{/each}
				</div>
			</Tooltip.Provider>

			<div class="flex flex-wrap items-center justify-between gap-4">
				<label for="landing-dark-mode" class="type-title-md inline-flex items-center gap-3 text-on-surface">
					<Icon name={theme.dark ? 'dark_mode' : 'light_mode'} fill={theme.dark} class="text-on-surface-variant" />
					Dark theme
				</label>
				<Switch id="landing-dark-mode" icons bind:checked={() => theme.dark, () => toggleMode()} />
			</div>
		</div>

		<ul class="grid grid-cols-2 gap-2 @xl/theme:grid-cols-3 @4xl/theme:col-span-2 @4xl/theme:grid-cols-6" aria-label="Generated roles">
			{#each ROLES as r (r.role)}
				<li
					class="flex min-h-24 flex-col justify-between gap-2 rounded-m3-lg p-3 transition-colors duration-spring-slow-effects ease-spring-slow-effects {r.bg} {r.fg}"
				>
					<span class="type-label-lg">{r.label}</span>
					<span class="type-label-md font-mono uppercase opacity-80">{theme.colors[r.role]}</span>
				</li>
			{/each}
		</ul>
	</div>
</section>
