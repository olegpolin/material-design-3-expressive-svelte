<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { toast } from "svelte-sonner";
	import { Page, Section, Demo } from "#lib/components/showcase/index.js";
	import { Badge } from "#lib/components/ui/badge/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { IconButton } from "#lib/components/ui/icon-button/index.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { Slider } from "#lib/components/ui/slider/index.js";
	import { LinearProgress, CircularProgress } from "#lib/components/ui/progress/index.js";
	import { LoadingIndicator } from "#lib/components/ui/loading-indicator/index.js";
	import { Spinner } from "#lib/components/ui/spinner/index.js";
	import { snackbar } from "#lib/components/ui/snackbar/index.js";
	import * as Tooltip from "#lib/components/ui/tooltip/index.js";
	import { Skeleton } from "#lib/components/ui/skeleton/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { LOADING_INDICATOR_SHAPES, SHAPE_LABELS, shapePath } from "#lib/m3/shapes.js";

	let value = $state(40);
	let liValue = $state(60);
	let skeletonLoading = $state(true);
	let archived = $state(0);
	let saving = $state(false);
	let simulating = $state(false);
	let syncOpen = $state(false);

	const presets = [0, 25, 70, 100];

	const navItems = [
		{ icon: "mail", label: "Mail", count: 3 },
		{ icon: "chat", label: "Chat", count: 120, max: 99 },
		{ icon: "groups", label: "Spaces", dot: true },
		{ icon: "videocam", label: "Meet" },
	];

	const plainTooltips = [
		{ icon: "edit", label: "Edit" },
		{ icon: "delete", label: "Move to trash" },
		{ icon: "share", label: "Share" },
		{ icon: "more_vert", label: "More options" },
	];

	let timers: ReturnType<typeof setTimeout>[] = [];
	onDestroy(() => timers.forEach(clearTimeout));

	/** Uneven jumps 0 → 100% so the flat spring, the 500ms wavy tween and the amplitude ramps all show. */
	function simulate() {
		timers.forEach(clearTimeout);
		timers = [];
		simulating = true;
		value = 0;
		const steps = [6, 18, 33, 41, 57, 66, 78, 90, 97, 100];
		steps.forEach((v, i) => timers.push(setTimeout(() => (value = v), 500 + i * 700)));
		timers.push(setTimeout(() => (simulating = false), 500 + steps.length * 700));
	}

	function save() {
		saving = true;
		timers.push(
			setTimeout(() => {
				saving = false;
				snackbar("Changes saved");
			}, 2400)
		);
	}
</script>

<svelte:head>
	<title>Communication · M3 Expressive</title>
</svelte:head>

{#snippet trigger(label: string, onclick: () => void, icon?: string)}
	<Button variant="tonal" {onclick}>
		{#if icon}<Icon name={icon} />{/if}
		{label}
	</Button>
{/snippet}

{#snippet valueControls(get: () => number, set: (v: number) => void, label: string, onSimulate?: () => void)}
	<div class="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
		<Slider bind:value={get, set} aria-label={label} class="min-w-40 flex-1 sm:max-w-64" />
		<span class="type-label-lg w-11 text-on-surface tabular-nums">{get()}%</span>
		<div class="flex flex-wrap gap-1">
			{#each presets as p (p)}
				<button
					type="button"
					aria-pressed={get() === p}
					class={[
						"type-label-md h-8 min-w-12 rounded-m3-full px-3 transition-colors duration-spring-fast-effects ease-spring-fast-effects",
						get() === p ? "bg-m3-secondary text-on-secondary" : "text-m3-primary",
					]}
					onclick={() => set(p)}
					{@attach ripple()}
				>
					{p}
				</button>
			{/each}
		</div>
		{#if onSimulate}
			<Button variant="text" size="xs" class="sm:ms-auto" disabled={simulating} onclick={onSimulate}>
				<Icon name="download" />
				{simulating ? "Downloading…" : "Simulate download"}
			</Button>
		{/if}
	</div>
{/snippet}

<Tooltip.Provider>
	<Page
		title="Communication"
		description="Badges, progress and loading indicators, snackbars and tooltips — the M3 Expressive feedback components, with the wavy progress shape, the 4dp track gap and stop indicator, and the 7-shape loading morph."
	>
		<!-- ------------------------------------------------------------------ Badges -->
		<Section
			title="Badges"
			description="Small badges flag unread state; large badges carry a count up to 999+. Both use error / on-error and anchor to the icon's top-trailing corner exactly like Compose BadgedBox: x = icon width − offset, y = −badge height + offset. Screen readers hear a summary (“3 new”, “More than 999 new”) instead of the visual label."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Small badge" class="gap-8" spec="6 × 6dp · full · error · offset 6 × 6dp: inside the icon's top-trailing corner">
					<Badge><Icon name="notifications" /></Badge>
					<Badge><Icon name="mail" /></Badge>
					<Badge><Icon name="shopping_cart" /></Badge>
				</Demo>
				<Demo label="Large badge" class="gap-8" spec="16dp high · min 16dp · 4dp padding · label-small · offset 12 × 14dp: 2dp above, 12dp over the icon">
					<Badge count={1}><Icon name="mail" /></Badge>
					<Badge count={99}><Icon name="chat" /></Badge>
					<Badge count={120} max={99}><Icon name="forum" /></Badge>
					<Badge count={1000}><Icon name="notifications" /></Badge>
				</Demo>
				<Demo label="Standalone" class="gap-6" spec="dot 6dp · large 16dp · 999+ = 34dp wide">
					<Badge />
					<Badge count={3} />
					<Badge count={42} />
					<Badge content="New" />
					<Badge count={1000} />
					<span class="type-label-lg inline-flex items-center gap-2 text-on-surface">
						Inbox <Badge count={12} />
					</span>
				</Demo>
				<Demo label="On navigation items" spec="indicator 56 × 32dp · icon 24dp · badge anchored to the icon">
					<div class="flex gap-2">
						{#each navItems as item, i (item.label)}
							<div class="flex w-16 flex-col items-center gap-1">
								<div
									class={[
										"grid h-8 w-14 place-items-center rounded-m3-full",
										i === 0 ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant",
									]}
								>
									<Badge count={item.count} max={item.max} dot={item.dot} invisible={!item.count && !item.dot}>
										<Icon name={item.icon} fill={i === 0} />
									</Badge>
								</div>
								<span class="type-label-md text-on-surface-variant">{item.label}</span>
							</div>
						{/each}
					</div>
				</Demo>
			</div>
		</Section>

		<!-- ---------------------------------------------------------- Linear progress -->
		<Section
			title="Linear progress"
			description="Active indicator in primary, track in secondary-container (the token value; the MDC Android docs still say primary-container), a 4dp gap between them and a 4dp stop dot at the track end that disappears at 100%. Flat progress moves on a spring (ζ 1 / k 50, about 1.3s). Wavy progress tweens 500ms linear; its wave flattens at ≤ 10% and ≥ 95% with 500ms amplitude ramps. Indicators mirror in RTL."
		>
			<Demo label="Value" class="py-4">
				{@render valueControls(() => value, (v) => (value = v), "Linear progress value", simulate)}
			</Demo>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Determinate" spec="4dp · gap 4dp · stop 4dp · round caps · spring ζ 1 / k 50">
					<LinearProgress {value} class="w-full" aria-label="Determinate progress" />
				</Demo>
				<Demo label="Indeterminate" spec="1750ms · 2 lines: heads at 0 / 650ms, tails at 250 / 900ms · emphasized-accelerate">
					<LinearProgress indeterminate class="w-full" aria-label="Loading" />
				</Demo>
				<Demo label="Thick" spec="8dp · stop 4dp with 2dp trailing space">
					<div class="flex w-full flex-col gap-6">
						<LinearProgress {value} thick class="w-full" aria-label="Thick determinate progress" />
						<LinearProgress indeterminate thick class="w-full" aria-label="Loading" />
					</div>
				</Demo>
				<Demo label="Wavy determinate" spec="10dp high · amplitude 3dp · wavelength 40dp · 1 λ/s · 500ms linear">
					<LinearProgress {value} wavy class="w-full" aria-label="Wavy determinate progress" />
				</Demo>
				<Demo label="Wavy indeterminate" spec="wavelength 20dp · amplitude 3dp">
					<LinearProgress indeterminate wavy class="w-full" aria-label="Loading" />
				</Demo>
				<Demo label="Wavy thick" spec="14dp high · 8dp stroke · amplitude 3dp">
					<div class="flex w-full flex-col gap-6">
						<LinearProgress {value} wavy thick class="w-full" aria-label="Thick wavy progress" />
						<LinearProgress indeterminate wavy thick class="w-full" aria-label="Loading" />
					</div>
				</Demo>
			</div>
		</Section>

		<!-- -------------------------------------------------------- Circular progress -->
		<Section
			title="Circular progress"
			description="40dp flat and 48dp wavy by default (44 / 52dp thick). The indeterminate indicator now shows its track; its arc grows from 10% to 87% and back (3s each way, standard easing) while it spins 1080° per 6s plus a 90° emphasized-decelerate step every 1.5s."
		>
			<Demo label="Value" class="py-4">
				{@render valueControls(() => value, (v) => (value = v), "Circular progress value", simulate)}
			</Demo>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Determinate" spec="40dp · 4dp stroke · gap 4dp · thick 44dp / 8dp">
					<CircularProgress {value} aria-label="Determinate progress" />
					<CircularProgress {value} thick aria-label="Thick determinate progress" />
				</Demo>
				<Demo label="Indeterminate" spec="6000ms · 1080° + 90° steps (300ms) · arc 0.1 ↔ 0.87">
					<CircularProgress indeterminate aria-label="Loading" />
					<CircularProgress indeterminate thick aria-label="Loading" />
				</Demo>
				<Demo label="Wavy" spec="48dp · amplitude 1.6dp · wavelength 15dp · waves = max(5, round(2πr / λ))">
					<CircularProgress {value} wavy aria-label="Wavy progress" />
					<CircularProgress indeterminate wavy aria-label="Loading" />
					<CircularProgress indeterminate wavy thick aria-label="Loading" />
				</Demo>
				<Demo label="Sizes" spec="24 · 40 · 64 · 96dp">
					<CircularProgress indeterminate size={24} aria-label="Loading" />
					<CircularProgress indeterminate aria-label="Loading" />
					<CircularProgress {value} size={64} aria-label="Progress" />
					<CircularProgress {value} wavy size={96} aria-label="Wavy progress" />
				</Demo>
			</div>
		</Section>

		<!-- -------------------------------------------------------- Loading indicator -->
		<Section
			title="Loading indicator"
			description="For waits between 200ms and 5s: show nothing below 200ms and a progress indicator past 5s. Seven shapes morph every 650ms on a ζ 0.6 / k 200 spring that overshoots about 9.5%, each adding a quarter turn on top of a 360° / 4666ms linear spin. With reduced motion the morph stops and only the slow spin remains."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Default" spec="48dp container · 38dp indicator · primary · scales 24–240dp">
					<LoadingIndicator />
					<LoadingIndicator size={24} />
					<LoadingIndicator size={96} />
				</Demo>
				<Demo label="Contained" spec="primary-container circle · on-primary-container shape">
					<LoadingIndicator contained />
					<LoadingIndicator contained size={72} />
				</Demo>
				<Demo label="Determinate" spec="circle (18°) → soft burst · rotation −180° × progress" class="flex-col flex-nowrap items-stretch">
					<div class="flex items-center gap-4">
						<LoadingIndicator value={liValue} aria-label="Upload progress" />
						<LoadingIndicator value={liValue} contained aria-label="Upload progress" />
					</div>
					{@render valueControls(() => liValue, (v) => (liValue = v), "Loading indicator value")}
				</Demo>
				<Demo label="In a button" spec="Spinner · the button's icon size (20dp) · currentColor">
					<Button variant="filled" disabled={saving} onclick={save}>
						{#if saving}<Spinner aria-label="Saving" />{:else}<Icon name="save" />{/if}
						{saving ? "Saving…" : "Save"}
					</Button>
					<Button variant="tonal" disabled>
						<Spinner aria-label="Syncing" />
						Syncing
					</Button>
				</Demo>
			</div>
			<Demo label="Shape sequence" spec="softBurst → cookie9Sided → pentagon → pill → sunny → cookie4Sided → oval → (loop)">
				<ol class="grid w-full grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-7">
					{#each LOADING_INDICATOR_SHAPES as shape, i (shape)}
						<li class="flex flex-col items-center gap-2 text-center">
							<svg viewBox="0 0 100 100" class="size-12 fill-m3-primary" aria-hidden="true">
								<path d={shapePath(shape)} />
							</svg>
							<span class="type-label-sm text-on-surface-variant">{i + 1}. {SHAPE_LABELS[shape]}</span>
						</li>
					{/each}
				</ol>
			</Demo>
		</Section>

		<!-- ----------------------------------------------------------------- Snackbar -->
		<Section
			title="Snackbar"
			description="Brief messages at the bottom of the screen, above the navigation bar on phones. One at a time: the next waits until the current one has faded out. Enter and exit scale 0.8 ↔ 1 on the fast spatial spring with a fast effects fade. Swipe sideways to dismiss; hovering or focusing pauses the timer."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Single line" spec="48dp · 4dp corner · inverse-surface · body-medium · level 3 · 4s">
					{@render trigger("Single line", () => snackbar("Message sent"))}
				</Demo>
				<Demo label="With action" spec="inverse-primary label-large text button, 40dp · 10s">
					{@render trigger("With action", () =>
						snackbar(`Conversation archived${archived ? ` (${archived})` : ""}`, {
							action: "Undo",
							onAction: () => (archived += 1),
						})
					)}
				</Demo>
				<Demo label="Two lines" spec="68dp · text wraps · max width 600dp">
					{@render trigger("Two lines", () =>
						snackbar("Your photos are backed up. Free up 2.4 GB by removing the device copies of backed-up items.", {
							action: "Free up",
						})
					)}
				</Demo>
				<Demo label="Closable" spec="close icon 24dp, inverse-on-surface, in a 40dp button">
					{@render trigger("Closable", () =>
						snackbar("Connection lost. Retrying in the background.", { closable: true })
					)}
					{@render trigger("Action + close", () =>
						snackbar("Draft discarded", { action: "Restore", closable: true })
					)}
				</Demo>
				<Demo label="Duration" spec="short 4000ms · long 10000ms · indefinite">
					{@render trigger("Long (10s)", () => snackbar("Long snackbar — stays 10 seconds", { duration: "long" }))}
					{@render trigger("Indefinite", () =>
						snackbar("Indefinite until dismissed", { duration: "indefinite", closable: true })
					)}
				</Demo>
				<Demo label="Queue & long action" spec="one at a time · long action on its own line (84dp)">
					{@render trigger("Queue three", () => {
						snackbar("First of three");
						snackbar("Second of three");
						snackbar("Third of three");
					})}
					{@render trigger("Long action", () =>
						snackbar("The file couldn't be uploaded because the connection timed out.", {
							action: "Try again with mobile data",
							actionOnNewLine: true,
						})
					)}
					{@render trigger("toast()", () => toast("Plain sonner toast(), M3 styled", { action: { label: "OK", onClick: () => {} } }))}
				</Demo>
			</div>
		</Section>

		<!-- ----------------------------------------------------------------- Tooltips -->
		<Section
			title="Tooltips"
			description="Plain tooltips label icons. Rich tooltips add a subhead and actions and stay open while you hover them; the persistent kind opens on click and takes focus so its actions are reachable by keyboard. Hover opens with no delay (as in Compose BasicTooltipBox), keyboard focus opens too, Escape closes, and the trigger gets aria-describedby. Show and hide scale 0.8 ↔ 1 on the fast spatial spring with a fast effects fade."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Plain" spec="24dp min · 4dp corner · inverse-surface · body-small · 8 × 4dp padding · 4dp gap · max 200dp">
					{#each plainTooltips as t (t.icon)}
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<IconButton {...props} icon={t.icon} aria-label={t.label} />
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>{t.label}</Tooltip.Content>
						</Tooltip.Root>
					{/each}
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="text">Long label</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom">
							Plain tooltips wrap at 200dp, so longer hints break onto a second line.
						</Tooltip.Content>
					</Tooltip.Root>
				</Demo>
				<Demo label="Rich" spec="≤ 320dp · 12dp corner · surface-container · level 2 · padding 12 / 16 / 8dp · title-small + body-medium · text-button actions">
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="text">Rich on hover</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content variant="rich" subhead="Storage" side="bottom">
							You're using 12.4 GB of your 15 GB. Photos and videos take up the most space.
						</Tooltip.Content>
					</Tooltip.Root>
					<Tooltip.Persistent bind:open={syncOpen} subhead="Sync is paused" side="bottom">
						{#snippet trigger({ props })}
							<IconButton {...props} icon="info" aria-label="About sync" />
						{/snippet}
						Files you change offline upload automatically when you reconnect. Large files wait for Wi-Fi.
						{#snippet actions()}
							<Tooltip.Action
								onclick={() => {
									syncOpen = false;
									snackbar("Sync resumed");
								}}
							>
								Resume
							</Tooltip.Action>
							<Tooltip.Action onclick={() => (syncOpen = false)}>Not now</Tooltip.Action>
						{/snippet}
					</Tooltip.Persistent>
					<span class="type-body-sm text-on-surface-variant">Persistent: click the info button</span>
				</Demo>
			</div>
		</Section>

		<!-- ----------------------------------------------------------------- Skeleton -->
		<Section
			title="Skeleton"
			description="Placeholders in on-surface at 10%, so they show on any surface, filled cards included, with the M3 corner scale and a slow, synchronized pulse. Content fades in quickly once loaded."
		>
			<Demo label="Loading placeholder" spec="on-surface 10% · 8dp corner default · avatar full · media 12dp · lines 4dp · 2s pulse" class="flex-col flex-nowrap items-stretch">
				<div class="flex">
					{@render trigger(skeletonLoading ? "Show content" : "Show skeleton", () => (skeletonLoading = !skeletonLoading))}
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each [0, 1] as card (card)}
						<div
							class={["flex flex-col gap-4 rounded-m3-md p-4", card ? "bg-surface-container-highest" : "bg-surface"]}
							aria-busy={skeletonLoading}
						>
							{#if skeletonLoading}
								<div class="flex items-center gap-4">
									<Skeleton class="size-10 rounded-m3-full" />
									<div class="flex flex-1 flex-col gap-2">
										<Skeleton class="h-4 w-1/2 rounded-m3-xs" />
										<Skeleton class="h-3 w-1/3 rounded-m3-xs" />
									</div>
								</div>
								<Skeleton class="aspect-video w-full rounded-m3-md" />
								<div class="flex flex-col gap-2">
									<Skeleton class="h-3 w-full rounded-m3-xs" />
									<Skeleton class="h-3 w-4/5 rounded-m3-xs" />
								</div>
							{:else}
								<div class="flex flex-col gap-4" in:fade={{ duration: 150 }}>
									<div class="flex items-center gap-4">
										<div class="type-title-md grid size-10 place-items-center rounded-m3-full bg-primary-container text-on-primary-container">
											{card ? "K" : "A"}
										</div>
										<div class="flex flex-col">
											<span class="type-title-sm text-on-surface">{card ? "Kai Lindqvist" : "Ana Ruiz"}</span>
											<span class="type-body-sm text-on-surface-variant">{card ? "Yesterday" : "2 min ago"}</span>
										</div>
									</div>
									<div class="grid aspect-video w-full place-items-center rounded-m3-md bg-tertiary-container text-on-tertiary-container">
										<Icon name={card ? "landscape" : "photo_camera"} size={48} />
									</div>
									<p class="type-body-md text-on-surface-variant">
										{card ? "Weekend hike photos are ready to share." : "New shots from the morning walk."}
									</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
				<p class="type-body-sm px-1 text-on-surface-variant">Left: on surface. Right: on surface-container-highest (a filled card).</p>
			</Demo>
		</Section>
	</Page>
</Tooltip.Provider>
