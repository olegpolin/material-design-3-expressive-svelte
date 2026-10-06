<script lang="ts">
	import { Page } from '#lib/components/showcase/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { springTransition } from '#lib/m3/motion.js';
	import { shapePath, type ShapeName } from '#lib/m3/shapes.js';
	import { cn } from '#lib/utils.js';

	type Group = {
		slug: string;
		title: string;
		description: string;
		icon: string;
		shape: ShapeName;
		/** Shape fill (text color drives `fill-current`) and icon color, written out for Tailwind. */
		shapeClass: string;
		iconClass: string;
		items: string[];
	};

	const groups: Group[] = [
		{
			slug: 'styles',
			title: 'Styles',
			description: 'The foundation every component reads from: color roles, type, shape, motion and elevation.',
			icon: 'style',
			shape: 'cookie9Sided',
			shapeClass: 'text-m3-primary',
			iconClass: 'text-on-primary',
			items: ['Color roles', 'Type scale', 'Corner radius', 'Shape library', 'Motion springs', 'Elevation', 'State layers']
		},
		{
			slug: 'actions',
			title: 'Actions',
			description: 'Buttons in five sizes and shapes that morph when pressed, plus FABs and button groups.',
			icon: 'touch_app',
			shape: 'softBurst',
			shapeClass: 'text-primary-container',
			iconClass: 'text-on-primary-container',
			items: ['Buttons', 'Icon buttons', 'FAB', 'Extended FAB', 'FAB menu', 'Button groups', 'Split button', 'Segmented button']
		},
		{
			slug: 'selection',
			title: 'Selection',
			description: 'Controls for picking options and values, from checkboxes to the Expressive slider.',
			icon: 'check_box',
			shape: 'cookie4Sided',
			shapeClass: 'text-secondary-container',
			iconClass: 'text-on-secondary-container',
			items: ['Checkbox', 'Radio button', 'Switch', 'Slider', 'Chips']
		},
		{
			slug: 'inputs',
			title: 'Inputs',
			description: 'Text entry and choosing from lists: fields with floating labels, search, menus and pickers.',
			icon: 'keyboard',
			shape: 'pill',
			shapeClass: 'text-tertiary-container',
			iconClass: 'text-on-tertiary-container',
			items: ['Text fields', 'Search', 'Menus', 'Select', 'Date picker']
		},
		{
			slug: 'navigation',
			title: 'Navigation',
			description: 'Ways to move between destinations, with bars and rails that adapt to the window size.',
			icon: 'explore',
			shape: 'arch',
			shapeClass: 'text-primary-fixed-dim',
			iconClass: 'text-on-primary-fixed',
			items: ['Navigation bar', 'Navigation rail', 'Navigation drawer', 'App bars', 'Toolbars', 'Tabs']
		},
		{
			slug: 'containment',
			title: 'Containment',
			description: 'Surfaces that hold and group content, from cards and lists to dialogs and sheets.',
			icon: 'stacks',
			shape: 'square',
			shapeClass: 'text-secondary-fixed-dim',
			iconClass: 'text-on-secondary-fixed',
			items: ['Cards', 'Dialogs', 'Bottom sheets', 'Side sheets', 'Lists', 'Divider', 'Carousel']
		},
		{
			slug: 'communication',
			title: 'Communication',
			description: 'Status and feedback: badges, wavy progress, the shape-morphing loader, snackbars and tooltips.',
			icon: 'chat_bubble',
			shape: 'flower',
			shapeClass: 'text-tertiary-fixed-dim',
			iconClass: 'text-on-tertiary-fixed',
			items: ['Badges', 'Linear progress', 'Circular progress', 'Loading indicator', 'Snackbar', 'Tooltips', 'Skeleton']
		}
	];

	const [foundation, ...componentGroups] = groups;
	const componentCount = componentGroups.reduce((n, g) => n + g.items.length, 0);

	const shapeMotion = springTransition('default-spatial', 'rotate', 'scale');
	const arrowMotion = springTransition('fast-spatial', 'translate');
</script>

<svelte:head>
	<title>Components · M3 Expressive</title>
	<meta
		name="description"
		content="Every Material 3 Expressive component in Svelte 5: actions, selection, inputs, navigation, containment and communication, plus the styles foundation."
	/>
</svelte:head>

{#snippet tile(g: Group, featured = false)}
	<a
		href="/components/{g.slug}"
		aria-labelledby="tile-{g.slug}-title"
		aria-describedby="tile-{g.slug}-desc"
		class={cn(
			'group/tile flex gap-5 rounded-m3-xl p-6 text-on-surface',
			featured
				? 'flex-col bg-surface-container-high sm:col-span-2 sm:flex-row sm:items-center sm:gap-8 sm:p-8 lg:col-span-3'
				: 'flex-col bg-surface-container'
		)}
		{@attach ripple()}
	>
		<div class={cn('flex items-start justify-between', featured && 'sm:contents')}>
			<span class={cn('relative grid shrink-0 place-items-center', featured ? 'size-20 sm:size-28' : 'size-16')}>
				<svg
					viewBox="0 0 100 100"
					aria-hidden="true"
					class={cn(
						'absolute inset-0 size-full fill-current group-hover/tile:scale-105 group-hover/tile:rotate-45 group-focus-visible/tile:rotate-45',
						g.shapeClass
					)}
					style:transition={shapeMotion}
				>
					<path d={shapePath(g.shape)} />
				</svg>
				<Icon name={g.icon} size={featured ? 40 : 28} fill class={cn('relative', g.iconClass)} />
			</span>
			{#if !featured}
				<span
					aria-hidden="true"
					class="grid size-10 place-items-center rounded-m3-full text-on-surface-variant group-hover/tile:translate-x-1 group-focus-visible/tile:translate-x-1"
					style:transition={arrowMotion}
				>
					<Icon name="arrow_forward" />
				</span>
			{/if}
		</div>

		<div class="flex min-w-0 flex-1 flex-col gap-4">
			<div class="flex flex-col gap-1">
				<h2
					id="tile-{g.slug}-title"
					class={cn('text-on-surface', featured ? 'type-headline-sm-emphasized' : 'type-title-lg')}
				>
					{g.title}
				</h2>
				<p id="tile-{g.slug}-desc" class="type-body-md text-on-surface-variant">{g.description}</p>
			</div>
			<ul class="flex flex-wrap gap-1.5" aria-label="{g.title} components">
				{#each g.items as item (item)}
					<li
						class={cn(
							'type-label-md rounded-m3-sm px-2 py-1 text-on-surface-variant',
							featured ? 'bg-surface-container-highest' : 'bg-surface-container-high'
						)}
					>
						{item}
					</li>
				{/each}
			</ul>
		</div>

		{#if featured}
			<span
				aria-hidden="true"
				class="hidden size-12 shrink-0 place-items-center rounded-m3-full bg-m3-primary text-on-primary group-hover/tile:translate-x-1 sm:grid"
				style:transition={arrowMotion}
			>
				<Icon name="arrow_forward" />
			</span>
		{/if}
	</a>
{/snippet}

<Page
	title="Components"
	description="Every Material 3 Expressive component, rebuilt in Svelte 5 with Tailwind 4 and shadcn-svelte. All demos are live and follow the theme you set in the Theme panel."
>
	<p class="type-label-lg -mt-8 text-on-surface-variant">
		{componentGroups.length} groups · {componentCount} components · built from the spec values
	</p>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{@render tile(foundation, true)}
		{#each componentGroups as g (g.slug)}
			{@render tile(g)}
		{/each}
	</div>
</Page>
