import type { Attachment } from 'svelte/attachments';
import { springCss } from '#lib/m3/motion.js';
import { findScrollParent, getScrollTop, type ScrollTarget } from '#lib/components/ui/top-app-bar/scroll.js';

export interface HideOnScrollOptions {
	/** Scroll container; default = nearest scrolling ancestor, else window. */
	container?: ScrollTarget | null;
	/** Scroll distance (px) in one direction before the bar hides / shows. Spec: 40dp (`ScrollDistanceThreshold`). */
	threshold?: number;
	/** Which edge the element exits through. Default `bottom`. */
	direction?: 'bottom' | 'top' | 'start' | 'end';
	/** Called whenever the hidden state changes. */
	onchange?: (hidden: boolean) => void;
}

/**
 * "Exit always" scroll behavior for floating / docked toolbars and the bottom app bar
 * (navigation-containment.md §5 Motion, motion.md §4): after 40dp of downward scroll the element snaps
 * off-screen through its edge, after 40dp of upward scroll (or at the top) it snaps back.
 * The snap uses the defaultEffects spring (Compose `exitAlwaysScrollBehavior` snapAnimationSpec).
 * While hidden the element is `inert`.
 *
 *   <FloatingToolbar {@attach hideOnScroll()}>…</FloatingToolbar>
 */
export function hideOnScroll(options: HideOnScrollOptions = {}): Attachment<HTMLElement> {
	return (node) => {
		if (options.container === null) return;
		const target = options.container ?? findScrollParent(node);
		const threshold = options.threshold ?? 40;
		const direction = options.direction ?? 'bottom';
		let hidden = false;
		let last = getScrollTop(target);
		let travel = 0;

		// `transform` composes with any Tailwind `translate` utility already on the element.
		node.style.transition = `transform ${springCss('default-effects').transition}`;

		const bounds = () =>
			target instanceof Window
				? { top: 0, left: 0, bottom: innerHeight, right: innerWidth }
				: target.getBoundingClientRect();

		function setHidden(next: boolean) {
			if (next === hidden) return;
			hidden = next;
			if (hidden) {
				const r = node.getBoundingClientRect();
				const c = bounds(); // +16px clears the level3 shadow
				const rtl = getComputedStyle(node).direction === 'rtl';
				const toRight = (direction === 'end') !== rtl;
				node.style.transform =
					direction === 'bottom'
						? `translateY(${Math.ceil(c.bottom - r.top) + 16}px)`
						: direction === 'top'
							? `translateY(${-Math.ceil(r.bottom - c.top) - 16}px)`
							: toRight
								? `translateX(${Math.ceil(c.right - r.left) + 16}px)`
								: `translateX(${-Math.ceil(r.right - c.left) - 16}px)`;
			} else {
				node.style.transform = '';
			}
			node.inert = hidden;
			node.toggleAttribute('data-hidden', hidden);
			options.onchange?.(hidden);
		}

		function onScroll() {
			const y = getScrollTop(target);
			const dy = y - last;
			last = y;
			if (dy === 0) return;
			// accumulate travel in the current direction only
			travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
			if (y <= threshold) setHidden(false);
			else if (travel > threshold) setHidden(true);
			else if (travel < -threshold) setHidden(false);
		}

		target.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			target.removeEventListener('scroll', onScroll);
			node.style.transform = '';
			node.style.transition = '';
			node.inert = false;
			node.removeAttribute('data-hidden');
		};
	};
}
