<script lang="ts" module>
	/** Preset seed colors (baseline purple first). */
	export const SEED_PRESETS: readonly { hex: string; name: string }[] = [
		{ hex: '#6750A4', name: 'Baseline purple' },
		{ hex: '#0B57D0', name: 'Blue' },
		{ hex: '#006A6A', name: 'Teal' },
		{ hex: '#B3261E', name: 'Red' },
		{ hex: '#7D5260', name: 'Mauve' },
		{ hex: '#386A20', name: 'Green' },
		{ hex: '#8B5000', name: 'Amber' },
		{ hex: '#5B5B5B', name: 'Grey' }
	];

	const CONTRAST_LABELS: Record<string, string> = {
		'-1': 'Reduced',
		'-0.5': 'Slightly reduced',
		'0': 'Standard',
		'0.5': 'Medium',
		'1': 'High'
	};

	const HEX_RE = /^#[0-9a-f]{6}$/i;
</script>

<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { resetMode, userPrefersMode } from 'mode-watcher';
	import { Button } from '#lib/components/ui/button/index.js';
	import { ButtonGroup, ButtonGroupItem } from '#lib/components/ui/button-group/index.js';
	import { Chip, ChipSet } from '#lib/components/ui/chip/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { IconButton } from '#lib/components/ui/icon-button/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { TextField } from '#lib/components/ui/text-field/index.js';
	import { DEFAULT_SEED, getTheme, SCHEME_VARIANTS, type SpecVersion } from '#lib/m3/theme.svelte.js';
	import { springTransition, type MotionScheme } from '#lib/m3/motion.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn } from '#lib/utils.js';

	/**
	 * Modal theme panel styled as an M3 modal side sheet (navigation-containment.md §9):
	 * 360dp wide (never wider than the window minus 56dp), surface-container-low, level 1,
	 * 16dp corners on the start (inner) edge, 24dp side padding, title-large headline,
	 * 72dp bottom action area. Built on the bits-ui Dialog (focus trap, Escape, outside click,
	 * focus return). Opens on the default-spatial spring, closes on fast-effects.
	 * The scrim (32%) is only drawn in compact / medium windows so the page stays readable while
	 * you tweak the theme on larger screens.
	 */
	let { open = $bindable(false) }: { open?: boolean } = $props();

	const theme = getTheme();
	const titleId = $props.id();

	let swatch = $derived(HEX_RE.test(theme.seed.trim()) ? theme.seed.trim().toLowerCase() : DEFAULT_SEED.toLowerCase());
	let contrastLabel = $derived(CONTRAST_LABELS[String(theme.contrast)] ?? theme.contrast.toFixed(1));
	let pristine = $derived(theme.isBaseline && theme.motionScheme === 'expressive');
	let status = $derived(
		!theme.ready ? 'Loading color utilities…' : theme.isBaseline ? 'Static baseline scheme' : 'Generated with MCU'
	);

	// Spring demo: the ball travels to the other end of its track every time it is pressed or the
	// motion scheme changes; the CSS spring tokens follow <html data-motion-scheme>.
	let ballAtEnd = $state(false);

	function setMotionScheme(value: string) {
		if (value !== 'expressive' && value !== 'standard') return;
		theme.motionScheme = value satisfies MotionScheme;
		ballAtEnd = !ballAtEnd;
	}

	function resetAll() {
		theme.reset();
		theme.motionScheme = 'expressive';
	}

	const sheetMotion = [
		'transition-[translate] duration-spring-default-spatial ease-spring-default-spatial',
		'data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full',
		'rtl:data-[starting-style]:-translate-x-full rtl:data-[ending-style]:-translate-x-full',
		'data-[ending-style]:duration-spring-fast-effects data-[ending-style]:ease-spring-fast-effects'
	];
</script>

{#snippet sectionLabel(text: string, id?: string)}
	<h3 {id} class="type-title-sm text-on-surface">{text}</h3>
{/snippet}

<DialogPrimitive.Root bind:open>
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay
			data-slot="theme-panel-scrim"
			class={cn(
				'fixed inset-0 z-50 bg-scrim/32 min-[840px]:bg-transparent',
				'transition-opacity duration-spring-default-effects ease-spring-default-effects',
				'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0'
			)}
		/>
		<DialogPrimitive.Content
			data-slot="theme-panel"
			aria-labelledby="{titleId}-title"
			class={cn(
				'fixed inset-y-0 end-0 z-50 flex w-[min(360px,calc(100vw-56px))] flex-col',
				'rounded-s-m3-lg bg-surface-container-low text-on-surface shadow-m3-1 outline-none',
				// fills the sliver the spatial spring's overshoot would otherwise open at the window edge
				'after:pointer-events-none after:absolute after:inset-y-0 after:start-full after:w-6 after:bg-surface-container-low',
				sheetMotion
			)}
		>
			<!-- header: 24dp start padding, title-large on-surface-variant, close icon button -->
			<header class="flex shrink-0 items-center gap-3 ps-6 pe-3 pt-3 pb-2">
				<DialogPrimitive.Title id="{titleId}-title" class="type-title-lg min-w-0 flex-1 text-on-surface-variant">
					Theme
				</DialogPrimitive.Title>
				<IconButton icon="close" aria-label="Close theme panel" onclick={() => (open = false)} />
			</header>
			<DialogPrimitive.Description class="type-body-md shrink-0 px-6 pb-4 text-on-surface-variant">
				Every color role is generated from one seed with material-color-utilities and applied live.
			</DialogPrimitive.Description>

			<div class="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pb-6">
				<!-- seed color -->
				<section aria-labelledby="{titleId}-seed" class="flex flex-col gap-4">
					{@render sectionLabel('Seed color', `${titleId}-seed`)}
					<div class="flex items-center gap-4">
						<label
							class={cn(
								'relative size-14 shrink-0 cursor-pointer rounded-m3-full shadow-m3-1',
								'ring-1 ring-outline-variant ring-inset',
								'has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-m3-secondary'
							)}
							style:background-color={swatch}
							{@attach ripple({ color: '#fff' })}
						>
							<span class="sr-only">Pick any seed color</span>
							<input
								type="color"
								value={swatch}
								oninput={(e) => (theme.seed = e.currentTarget.value)}
								class="absolute inset-0 size-full cursor-pointer rounded-m3-full opacity-0"
							/>
							<span
								aria-hidden="true"
								class="pointer-events-none absolute -end-1 -bottom-1 grid size-6 place-items-center rounded-m3-full bg-surface-container-highest text-on-surface-variant shadow-m3-1"
							>
								<Icon name="colorize" size={16} />
							</span>
						</label>
						<TextField
							variant="outlined"
							label="Hex"
							class="min-w-0 flex-1"
							inputClass="font-mono uppercase"
							spellcheck={false}
							autocomplete="off"
							error={!HEX_RE.test(theme.seed.trim())}
							bind:value={() => theme.seed, (v) => (theme.seed = String(v ?? ''))}
						/>
					</div>
					<div role="group" aria-label="Preset seed colors" class="grid grid-cols-8 gap-1.5">
						{#each SEED_PRESETS as preset (preset.hex)}
							{@const selected = theme.seed.trim().toLowerCase() === preset.hex.toLowerCase()}
							<button
								type="button"
								aria-label="{preset.name} ({preset.hex})"
								aria-pressed={selected}
								class={cn(
									'relative grid aspect-square w-full max-w-10 cursor-pointer place-items-center text-white',
									'after:absolute after:-inset-1',
									selected ? 'rounded-m3-md' : 'rounded-[20px]'
								)}
								style:background-color={preset.hex}
								style:transition={springTransition('fast-spatial', 'border-radius')}
								onclick={() => (theme.seed = preset.hex)}
								{@attach ripple()}
							>
								<span
									class={cn('grid', selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0')}
									style:transition="{springTransition('fast-spatial', 'scale')}, {springTransition(
										'fast-effects',
										'opacity'
									)}"
								>
									<Icon name="check" size={20} weight={600} />
								</span>
							</button>
						{/each}
					</div>
				</section>

				<!-- scheme variant -->
				<section aria-labelledby="{titleId}-variant" class="flex flex-col gap-3">
					{@render sectionLabel('Scheme variant', `${titleId}-variant`)}
					<ChipSet role="group" aria-labelledby="{titleId}-variant">
						{#each SCHEME_VARIANTS as v (v.value)}
							<Chip
								variant="filter"
								bind:selected={
									() => theme.variant === v.value,
									(s) => {
										if (s) theme.variant = v.value;
									}
								}
							>
								{v.label.replace(' (default)', '')}
							</Chip>
						{/each}
					</ChipSet>
				</section>

				<!-- contrast -->
				<section aria-labelledby="{titleId}-contrast" class="flex flex-col gap-2">
					<div class="flex items-baseline justify-between gap-2">
						{@render sectionLabel('Contrast', `${titleId}-contrast`)}
						<span class="type-label-md text-on-surface-variant tabular-nums">{contrastLabel}</span>
					</div>
					<Slider
						min={-1}
						max={1}
						step={0.5}
						centered
						ticks
						valueIndicator
						aria-label="Contrast level"
						format={(v) => (v > 0 ? `+${v}` : String(v))}
						bind:value={() => theme.contrast, (v) => (theme.contrast = Array.isArray(v) ? (v[0] ?? 0) : (v ?? 0))}
					/>
					<div class="type-label-sm flex justify-between text-on-surface-variant" aria-hidden="true">
						<span>Reduced</span><span>Standard</span><span>High</span>
					</div>
				</section>

				<!-- dark mode -->
				<section class="flex flex-col gap-1">
					<div class="flex min-h-12 items-center justify-between gap-4">
						<label for="{titleId}-dark" class="flex min-w-0 flex-col">
							<span class="type-title-sm text-on-surface">Dark theme</span>
							<span class="type-body-sm text-on-surface-variant">
								{userPrefersMode.current === 'system' ? 'Following the system setting' : 'Set manually'}
							</span>
						</label>
						<Switch id="{titleId}-dark" icons bind:checked={() => theme.dark, (v) => (theme.dark = v)} />
					</div>
					{#if userPrefersMode.current !== 'system'}
						<Button variant="text" size="xs" class="self-start" onclick={() => resetMode()}>
							<Icon name="brightness_auto" size={20} />
							Use system setting
						</Button>
					{/if}
				</section>

				<!-- motion scheme + spring demo -->
				<section aria-labelledby="{titleId}-motion" class="flex flex-col gap-3">
					{@render sectionLabel('Motion scheme', `${titleId}-motion`)}
					<ButtonGroup
						variant="connected"
						type="single"
						required
						itemVariant="tonal"
						aria-labelledby="{titleId}-motion"
						bind:value={() => theme.motionScheme, (v) => setMotionScheme(String(v))}
					>
						<ButtonGroupItem value="expressive" icon="bubble_chart">Expressive</ButtonGroupItem>
						<ButtonGroupItem value="standard" icon="linear_scale">Standard</ButtonGroupItem>
					</ButtonGroup>
					<button
						type="button"
						aria-label="Replay the {theme.motionScheme} spring"
						class="relative h-12 w-full cursor-pointer rounded-m3-full bg-surface-container-highest"
						onclick={() => (ballAtEnd = !ballAtEnd)}
						{@attach ripple()}
					>
						<span
							aria-hidden="true"
							class="absolute top-1 size-10 rounded-m3-full bg-m3-primary shadow-m3-1 transition-[inset-inline-start] duration-spring-default-spatial ease-spring-default-spatial"
							style:inset-inline-start={ballAtEnd ? 'calc(100% - 44px)' : '4px'}
						></span>
					</button>
					<p class="type-body-sm text-on-surface-variant">
						{theme.motionScheme === 'expressive'
							? 'Expressive springs overshoot and settle (default spatial: ζ 0.8, k 380).'
							: 'Standard springs are critically damped-ish and quicker (default spatial: ζ 0.9, k 700).'}
						Tap the track to replay.
					</p>
				</section>

				<!-- spec version -->
				<section aria-labelledby="{titleId}-spec" class="flex flex-col gap-3">
					{@render sectionLabel('Color spec', `${titleId}-spec`)}
					<ButtonGroup
						variant="connected"
						type="single"
						required
						itemVariant="tonal"
						aria-labelledby="{titleId}-spec"
						bind:value={
							() => theme.specVersion,
							(v) => {
								if (v === '2021' || v === '2025') theme.specVersion = v satisfies SpecVersion;
							}
						}
					>
						<ButtonGroupItem value="2021">2021</ButtonGroupItem>
						<ButtonGroupItem value="2025">2025</ButtonGroupItem>
					</ButtonGroup>
					<p class="type-body-sm text-on-surface-variant">
						2021 matches the published baseline; 2025 is the newer, more colorful opt-in.
					</p>
				</section>
			</div>

			<!-- bottom action area: 72dp, 16dp top / 24dp bottom padding -->
			<footer class="flex min-h-[72px] shrink-0 items-center gap-3 border-t border-outline-variant px-6 pt-4 pb-6">
				<Button variant="text" disabled={pristine} onclick={resetAll}>
					<Icon name="restart_alt" size={20} />
					Reset
				</Button>
				<span class="type-body-sm min-w-0 flex-1 truncate text-end text-on-surface-variant" aria-live="polite">
					{status}
				</span>
			</footer>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>
