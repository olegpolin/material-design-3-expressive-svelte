<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	/**
	 * M3 tabs container (navigation-containment.md §7): surface, level0, 48dp (primary with stacked
	 * icons: 64dp), 1dp outline-variant divider at the bottom (an inset shadow, so it stays put while a
	 * scrollable row scrolls). Scrollable rows start 52dp in and tabs are at least 90dp wide (Compose).
	 */
	export const tabsListVariants = tv({
		base: 'relative flex w-full shrink-0 items-stretch bg-surface shadow-[inset_0_-1px_0_var(--md-sys-color-outline-variant)]',
		variants: {
			variant: {
				primary: 'h-12 has-[[data-icon-position=top]]:h-16',
				secondary: 'h-12'
			},
			scrollable: {
				true: 'overflow-x-auto overflow-y-hidden ps-[52px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
				false: ''
			}
		},
		defaultVariants: { variant: 'primary', scrollable: false }
	});

	export type TabsListVariant = VariantProps<typeof tabsListVariants>['variant'];
</script>

<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { activeSpring, animateSpring } from '#lib/m3/motion.js';
	import { cn } from '#lib/utils.js';
	import { setTabsListContext } from './context.js';

	let {
		ref = $bindable(null),
		variant = 'primary',
		scrollable = false,
		class: className,
		children,
		...restProps
	}: TabsPrimitive.ListProps & {
		variant?: TabsListVariant;
		/** Horizontally scrollable row (tabs keep their intrinsic width, min 90dp). */
		scrollable?: boolean;
	} = $props();

	setTabsListContext({
		get variant() {
			return variant ?? 'primary';
		},
		get scrollable() {
			return scrollable;
		}
	});

	/**
	 * Measures the active trigger and moves the indicator with the defaultSpatial spring
	 * (§7 Motion: indicator offset + width). Primary: 3dp, rounded top, content width (min 24dp),
	 * centered on the content. Secondary: 2dp, full tab width. Scrollable rows auto-scroll the active
	 * tab toward the center with the same spring.
	 */
	function indicator(node: HTMLElement) {
		const bar = node.querySelector<HTMLElement>(':scope > [data-slot=tabs-indicator]');
		if (!bar) return;
		const primary = variant !== 'secondary';
		const isScrollable = scrollable;
		let ready = false;
		let lastActive: HTMLElement | null = null;
		let cancelScroll: (() => void) | undefined;
		const update = () => {
			const active = node.querySelector<HTMLElement>('[data-slot=tabs-trigger][data-state=active]');
			if (!active) {
				bar.style.opacity = '0';
				return;
			}
			let left = active.offsetLeft;
			let width = active.offsetWidth;
			if (primary) {
				const content = active.querySelector<HTMLElement>('[data-slot=tabs-trigger-content]');
				if (content) {
					const w = Math.max(24, content.offsetWidth);
					left = active.offsetLeft + content.offsetLeft + (content.offsetWidth - w) / 2;
					width = w;
				}
			}
			if (!ready) bar.style.transition = 'none';
			bar.style.opacity = '1';
			bar.style.width = `${width}px`;
			bar.style.translate = `${left}px 0`;
			if (!ready) {
				void bar.offsetWidth; // commit the first position without animating
				bar.style.transition = '';
				ready = true;
			}
			if (isScrollable && active !== lastActive) {
				// RTL scroll containers count scrollLeft from 0 (start) down to -max
				const max = node.scrollWidth - node.clientWidth;
				const center = active.offsetLeft + active.offsetWidth / 2 - node.clientWidth / 2;
				const target =
					getComputedStyle(node).direction === 'rtl'
						? Math.min(0, Math.max(-max, center))
						: Math.max(0, Math.min(max, center));
				cancelScroll?.();
				if (lastActive === null) {
					node.scrollLeft = target; // initial selection: bring it into view without animating
				} else {
					cancelScroll = animateSpring(node.scrollLeft, target, activeSpring('default-spatial', node), (v) => {
						node.scrollLeft = v;
					});
				}
			}
			lastActive = active;
		};

		const resize = new ResizeObserver(update);
		const observeAll = () => {
			resize.disconnect();
			resize.observe(node);
			for (const el of node.querySelectorAll('[data-slot=tabs-trigger], [data-slot=tabs-trigger-content]')) {
				resize.observe(el);
			}
		};
		const mutations = new MutationObserver((records) => {
			if (records.some((r) => r.type === 'childList')) observeAll();
			update();
		});
		mutations.observe(node, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-state'] });
		observeAll();
		update();

		return () => {
			cancelScroll?.();
			resize.disconnect();
			mutations.disconnect();
		};
	}
</script>

<TabsPrimitive.List
	bind:ref
	data-slot="tabs-list"
	data-variant={variant}
	class={cn(tabsListVariants({ variant, scrollable }), className)}
	{@attach indicator}
	{...restProps}
>
	{@render children?.()}
	<span
		data-slot="tabs-indicator"
		aria-hidden="true"
		class={cn(
			'pointer-events-none absolute bottom-0 left-0 bg-m3-primary opacity-0',
			'transition-[translate,width] duration-spring-default-spatial ease-spring-default-spatial',
			variant === 'secondary' ? 'h-0.5' : 'h-[3px] rounded-t-[3px]'
		)}
	></span>
</TabsPrimitive.List>
