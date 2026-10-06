<script lang="ts">
	import { Card } from '#lib/components/ui/card/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { shapePath, type ShapeName } from '#lib/m3/shapes.js';

	type Tile = {
		href: string;
		icon: string;
		title: string;
		body: string;
		shape: ShapeName;
		/** Container color pair + accent (badge shape / arrow button) pair. */
		container: string;
		badgeFill: string;
		badgeIcon: string;
		arrow: string;
	};

	const TILES: Tile[] = [
		{
			href: '/components',
			icon: 'widgets',
			title: 'Components',
			body: 'Every M3 Expressive component with all variants, sizes and states — buttons to carousels.',
			shape: 'cookie9Sided',
			container: 'bg-primary-container text-on-primary-container',
			badgeFill: 'fill-m3-primary',
			badgeIcon: 'text-on-primary',
			arrow: 'bg-m3-primary text-on-primary',
		},
		{
			href: '/dashboard',
			icon: 'space_dashboard',
			title: 'Dashboard',
			body: 'A desktop app: navigation rail, top app bar, stat cards, charts and a data table.',
			shape: 'clover4Leaf',
			container: 'bg-secondary-container text-on-secondary-container',
			badgeFill: 'fill-m3-secondary',
			badgeIcon: 'text-on-secondary',
			arrow: 'bg-m3-secondary text-on-secondary',
		},
		{
			href: '/mobile',
			icon: 'smartphone',
			title: 'Mobile app',
			body: 'A phone-sized app with a tall navigation bar, flexible app bar, FAB menu and sheets.',
			shape: 'sunny',
			container: 'bg-tertiary-container text-on-tertiary-container',
			badgeFill: 'fill-tertiary',
			badgeIcon: 'text-on-tertiary',
			arrow: 'bg-tertiary text-on-tertiary',
		},
	];
</script>

<section aria-labelledby="pages-title" class="flex flex-col gap-8">
	<div class="flex flex-col gap-3">
		<p class="type-label-lg text-m3-primary">Pages</p>
		<h2 id="pages-title" class="type-headline-lg-emphasized text-on-surface">See it in context</h2>
	</div>

	<div class="@container/tiles">
		<ul class="grid grid-cols-1 gap-4 @3xl/tiles:grid-cols-3">
			{#each TILES as tile (tile.href)}
				<li class="flex">
					<Card
						href={tile.href}
						variant="filled"
						shape="xxl"
						aria-labelledby="tile-{tile.icon}"
						class="tile group/tile min-h-72 flex-1 justify-between gap-10 p-7 {tile.container}"
					>
						<!-- decorative library shape, turns on hover -->
						<svg
							viewBox="0 0 100 100"
							aria-hidden="true"
							class="tile-deco pointer-events-none absolute -end-14 -top-14 size-56 fill-current opacity-[0.08]"
						>
							<path d={shapePath(tile.shape)} />
						</svg>

						<span class="relative grid size-16 place-items-center">
							<svg viewBox="0 0 100 100" aria-hidden="true" class="absolute inset-0 {tile.badgeFill}">
								<path d={shapePath(tile.shape)} />
							</svg>
							<Icon name={tile.icon} fill size={32} class="relative {tile.badgeIcon}" />
						</span>

						<div class="relative flex items-end justify-between gap-6">
							<div class="flex flex-col gap-2">
								<h3 id="tile-{tile.icon}" class="type-headline-sm-emphasized">{tile.title}</h3>
								<p class="type-body-md opacity-90">{tile.body}</p>
							</div>
							<!-- Looks like a filled icon button; the whole tile is the link, so it stays non-interactive. -->
							<span
								aria-hidden="true"
								class="tile-arrow grid size-14 shrink-0 place-items-center rounded-[28px] {tile.arrow}"
							>
								<Icon name="arrow_forward" />
							</span>
						</div>
					</Card>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.tile-deco {
		transition: rotate var(--md-sys-motion-spring-slow-spatial-duration) var(--md-sys-motion-spring-slow-spatial-easing);
	}
	.tile-arrow {
		transition:
			border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			translate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing);
	}
	:global(.tile:hover) .tile-deco,
	:global(.tile:focus-visible) .tile-deco {
		rotate: 45deg;
	}
	:global(.tile:hover) .tile-arrow,
	:global(.tile:focus-visible) .tile-arrow {
		border-radius: var(--radius-m3-lg);
		translate: 4px 0;
	}
	:global(.tile:active) .tile-arrow {
		border-radius: var(--radius-m3-md);
	}
</style>
