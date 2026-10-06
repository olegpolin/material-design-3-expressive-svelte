<script lang="ts">
	import { toast } from "svelte-sonner";
	import { Page, Section, Demo } from "#lib/components/showcase/index.js";
	import { Badge } from "#lib/components/ui/badge/index.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { LinearProgress, CircularProgress } from "#lib/components/ui/progress/index.js";
	import { LoadingIndicator } from "#lib/components/ui/loading-indicator/index.js";
	import { snackbar } from "#lib/components/ui/snackbar/index.js";
	import * as Tooltip from "#lib/components/ui/tooltip/index.js";
	import { Skeleton } from "#lib/components/ui/skeleton/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { LOADING_INDICATOR_SHAPES, SHAPE_LABELS, shapePath } from "#lib/m3/shapes.js";

	let value = $state(40);
	let liValue = $state(60);
	let skeletonLoading = $state(true);
	let archived = $state(0);

	const presets = [0, 25, 70, 100];

	const navItems = [
		{ icon: "mail", label: "Mail", count: 3 },
		{ icon: "chat", label: "Chat", count: 120, max: 99 },
		{ icon: "groups", label: "Spaces", dot: true },
		{ icon: "videocam", label: "Meet" },
	];
</script>

<svelte:head>
	<title>Communication · M3 Expressive</title>
</svelte:head>

{#snippet trigger(label: string, onclick: () => void, icon?: string)}
	<button
		type="button"
		class="type-label-lg inline-flex h-10 items-center gap-2 rounded-m3-full bg-secondary-container px-4 text-on-secondary-container"
		{onclick}
		{@attach ripple()}
	>
		{#if icon}<Icon name={icon} size={20} />{/if}
		{label}
	</button>
{/snippet}

{#snippet valueControls(get: () => number, set: (v: number) => void, id: string)}
	<div class="flex w-full flex-wrap items-center gap-3">
		<label for={id} class="type-label-lg text-on-surface-variant">Value</label>
		<input
			{id}
			type="range"
			min="0"
			max="100"
			value={get()}
			oninput={(e) => set(e.currentTarget.valueAsNumber)}
			class="h-10 w-48 accent-m3-primary"
		/>
		<span class="type-label-lg w-10 text-on-surface tabular-nums">{get()}%</span>
		<div class="flex gap-1">
			{#each presets as p (p)}
				<button
					type="button"
					class={[
						"type-label-md h-8 min-w-12 rounded-m3-full px-3",
						get() === p ? "bg-m3-secondary text-on-secondary" : "text-m3-primary",
					]}
					onclick={() => set(p)}
					{@attach ripple()}
				>
					{p}
				</button>
			{/each}
		</div>
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
			description="Small badges flag unread state; large badges carry a count up to 999+. Both use the error color and sit at the icon's top-trailing corner."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Small badge" class="gap-8" spec="6 × 6dp · full · error · offset 6 × 6dp">
					<Badge><Icon name="notifications" /></Badge>
					<Badge><Icon name="mail" /></Badge>
					<Badge><Icon name="shopping_cart" /></Badge>
				</Demo>
				<Demo label="Large badge" class="gap-8" spec="16dp high · min 16dp · max 34dp · label-small · offset 14 × 12dp">
					<Badge count={1}><Icon name="mail" /></Badge>
					<Badge count={99}><Icon name="chat" /></Badge>
					<Badge count={120} max={99}><Icon name="forum" /></Badge>
					<Badge count={1000}><Icon name="notifications" /></Badge>
				</Demo>
				<Demo label="Standalone" class="gap-6" spec="dot 6dp · large 16dp · 4dp padding">
					<Badge />
					<Badge count={3} />
					<Badge count={42} />
					<Badge content="New" />
					<Badge count={1000} />
				</Demo>
				<Demo label="On navigation items" spec="indicator 56 × 32dp · icon 24dp">
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
			description="Active indicator in primary, track in secondary-container separated by a 4dp gap, and a 4dp stop dot at the end. Flat progress moves on a spring (ζ 1 / k 50); wavy progress tweens 500ms and flattens near 0% and 100%."
		>
			<Demo label="Value" class="py-4">
				{@render valueControls(() => value, (v) => (value = v), "linear-value")}
			</Demo>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Determinate" spec="4dp · gap 4dp · stop 4dp · full corner">
					<LinearProgress {value} class="w-full" aria-label="Determinate progress" />
				</Demo>
				<Demo label="Indeterminate" spec="1750ms cycle · 2 lines · emphasized-accelerate">
					<LinearProgress indeterminate class="w-full" aria-label="Loading" />
				</Demo>
				<Demo label="Thick" spec="8dp · stop 4dp, 2dp trailing">
					<div class="flex w-full flex-col gap-6">
						<LinearProgress {value} thick class="w-full" aria-label="Thick determinate progress" />
						<LinearProgress indeterminate thick class="w-full" aria-label="Loading" />
					</div>
				</Demo>
				<Demo label="Wavy determinate" spec="10dp high · amplitude 3dp · wavelength 40dp · 1 λ/s">
					<LinearProgress {value} wavy class="w-full" aria-label="Wavy determinate progress" />
				</Demo>
				<Demo label="Wavy indeterminate" spec="wavelength 20dp · amplitude 3dp">
					<LinearProgress indeterminate wavy class="w-full" aria-label="Loading" />
				</Demo>
				<Demo label="Wavy thick" spec="14dp high · 8dp stroke">
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
			description="40dp flat and 48dp wavy by default. The indeterminate indicator now shows its track; its arc grows from 10% to 87% while spinning 1080° per 6s with extra 90° steps."
		>
			<Demo label="Value" class="py-4">
				{@render valueControls(() => value, (v) => (value = v), "circular-value")}
			</Demo>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Determinate" spec="40dp · 4dp stroke · gap 4dp">
					<CircularProgress {value} aria-label="Determinate progress" />
					<CircularProgress {value} thick aria-label="Thick determinate progress" />
				</Demo>
				<Demo label="Indeterminate" spec="6000ms cycle · arc 0.1 ↔ 0.87">
					<CircularProgress indeterminate aria-label="Loading" />
					<CircularProgress indeterminate thick aria-label="Loading" />
				</Demo>
				<Demo label="Wavy" spec="48dp · amplitude 1.6dp · wavelength 15dp">
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
			description="For waits between 200ms and 5s. Seven shapes morph every 650ms on a ζ 0.6 / k 200 spring, each adding a quarter turn on top of a 360°/4666ms spin."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Default" spec="48dp container · 38dp indicator · primary">
					<LoadingIndicator />
					<LoadingIndicator size={24} />
					<LoadingIndicator size={96} />
				</Demo>
				<Demo label="Contained" spec="48dp primary-container circle · on-primary-container">
					<LoadingIndicator contained />
					<LoadingIndicator contained size={72} />
				</Demo>
				<Demo label="Determinate" spec="circle (18°) → soft burst · rotation −180° × progress" class="flex-col items-start">
					<div class="flex items-center gap-4">
						<LoadingIndicator value={liValue} />
						<LoadingIndicator value={liValue} contained />
					</div>
					{@render valueControls(() => liValue, (v) => (liValue = v), "li-value")}
				</Demo>
				<Demo label="Inline" spec="Spinner = loading indicator in currentColor">
					<button
						type="button"
						disabled
						class="type-label-lg inline-flex h-10 items-center gap-2 rounded-m3-full bg-on-surface/12 px-4 text-on-surface/38"
					>
						<LoadingIndicator size={20} color="currentColor" />
						Saving…
					</button>
				</Demo>
			</div>
			<Demo label="Shape sequence" spec="softBurst → cookie9Sided → pentagon → pill → sunny → cookie4Sided → oval">
				<ol class="flex w-full flex-wrap justify-between gap-4">
					{#each LOADING_INDICATOR_SHAPES as shape, i (shape)}
						<li class="flex flex-col items-center gap-2">
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
			description="Brief messages at the bottom of the screen. One at a time: the next waits until the current one has faded out. Enter and exit scale 0.8 ↔ 1 with a fade."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Single line" spec="48dp · 4dp corner · inverse-surface · body-medium · 4s">
					{@render trigger("Single line", () => snackbar("Message sent"))}
				</Demo>
				<Demo label="With action" spec="action inverse-primary label-large · 10s">
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
				<Demo label="Closable" spec="close icon 24dp in a 40dp button">
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
				<Demo label="Queue & long action" spec="one at a time · action on its own line">
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
			description="Plain tooltips label icons; rich tooltips add a subhead and actions and stay open while you hover them. Both scale in from 0.8 with a fast spatial spring."
		>
			<div class="grid gap-6 md:grid-cols-2">
				<Demo label="Plain" spec="24dp · 4dp corner · inverse-surface · body-small · 8dp padding · 4dp gap">
					{#each [["edit", "Edit"], ["delete", "Move to trash"], ["share", "Share"], ["more_vert", "More options"]] as [icon, label] (icon)}
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<button
										{...props}
										type="button"
										aria-label={label}
										class="grid size-10 place-items-center rounded-m3-full text-on-surface-variant"
										{@attach ripple()}
									>
										<Icon name={icon} />
									</button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>{label}</Tooltip.Content>
						</Tooltip.Root>
					{/each}
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									class="type-label-lg h-10 rounded-m3-full px-3 text-m3-primary"
									{@attach ripple()}
								>
									Long label
								</button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom">
							Plain tooltips wrap at 200dp, so longer hints break onto a second line.
						</Tooltip.Content>
					</Tooltip.Root>
				</Demo>
				<Demo label="Rich" spec="≤ 320dp · 12dp corner · surface-container · level 2 · title-small + body-medium">
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									aria-label="About sync"
									class="grid size-10 place-items-center rounded-m3-full text-on-surface-variant"
									{@attach ripple()}
								>
									<Icon name="info" />
								</button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content variant="rich" subhead="Sync is paused">
							Files you change offline upload automatically when you reconnect. Large files wait for Wi-Fi.
							{#snippet actions()}
								<Tooltip.Action onclick={() => snackbar("Sync resumed")}>Resume</Tooltip.Action>
								<Tooltip.Action>Learn more</Tooltip.Action>
							{/snippet}
						</Tooltip.Content>
					</Tooltip.Root>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									class="type-label-lg h-10 rounded-m3-full px-3 text-m3-primary"
									{@attach ripple()}
								>
									Rich, no actions
								</button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content variant="rich" subhead="Storage" side="bottom">
							You're using 12.4 GB of your 15 GB.
						</Tooltip.Content>
					</Tooltip.Root>
				</Demo>
			</div>
		</Section>

		<!-- ----------------------------------------------------------------- Skeleton -->
		<Section
			title="Skeleton"
			description="Placeholder shapes in surface-container-highest with the M3 corner scale, swapped for content once loaded."
		>
			<Demo label="Loading placeholder" spec="surface-container-highest · avatar full · media 12dp · lines 4dp" class="flex-col items-stretch">
				<div class="flex">
					{@render trigger(skeletonLoading ? "Show content" : "Show skeleton", () => (skeletonLoading = !skeletonLoading))}
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each [0, 1] as card (card)}
						<div class="flex flex-col gap-4">
							{#if skeletonLoading}
								<div class="flex items-center gap-4">
									<Skeleton class="size-10 rounded-m3-full!" />
									<div class="flex flex-1 flex-col gap-2">
										<Skeleton class="h-4 w-1/2 rounded-m3-xs!" />
										<Skeleton class="h-3 w-1/3 rounded-m3-xs!" />
									</div>
								</div>
								<Skeleton class="aspect-video w-full rounded-m3-md!" />
								<div class="flex flex-col gap-2">
									<Skeleton class="h-3 w-full rounded-m3-xs!" />
									<Skeleton class="h-3 w-4/5 rounded-m3-xs!" />
								</div>
							{:else}
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
							{/if}
						</div>
					{/each}
				</div>
			</Demo>
		</Section>
	</Page>
</Tooltip.Provider>
