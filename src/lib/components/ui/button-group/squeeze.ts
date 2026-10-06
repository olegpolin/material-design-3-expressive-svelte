import type { Attachment } from "svelte/attachments";
import { activeSpring, animateSpring } from "#lib/m3/motion.js";

/**
 * Standard button-group press "squeeze" (docs/research/buttons.md §5.3, Compose ButtonGroup).
 *
 * The pressed child grows by `ratio` (15%) of its width, taken from its neighbours (a middle item
 * takes half from each side), so the group's total width never changes. Each child has its own
 * progress spring (fast-spatial). On release the progress first has to pass 0.75 before it
 * animates back to 0, so even a quick tap shows most of the squeeze.
 *
 * Neighbours never shrink by more than their horizontal padding (their label never clips).
 * Under `prefers-reduced-motion` the width change is skipped (the shape change remains).
 */
export function squeeze(options: { ratio?: number; enabled?: boolean } = {}): Attachment<HTMLElement> {
	const ratio = options.ratio ?? 0.15;
	return (host) => {
		if (options.enabled === false) return;

		type ItemState = {
			progress: number;
			velocity: number;
			cancel?: () => void;
			held: boolean;
			releasePending: boolean;
		};
		const states = new Map<Element, ItemState>();
		const pointerTargets = new Map<number, Element>();
		let natural: number[] = [];
		let limits: number[] = [];
		let children: HTMLElement[] = [];

		const reduced = () =>
			typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

		const isDisabled = (el: Element) =>
			el.matches("[disabled], [aria-disabled='true'], [data-disabled]:not([data-disabled='false'])");

		function anyActive() {
			for (const s of states.values()) if (s.progress !== 0 || s.held) return true;
			return false;
		}

		function measure() {
			children = [...host.children].filter((c): c is HTMLElement => c instanceof HTMLElement);
			for (const c of children) {
				c.style.width = "";
				c.style.flex = "";
			}
			natural = children.map((c) => c.getBoundingClientRect().width);
			limits = children.map((c) => {
				const cs = getComputedStyle(c);
				const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
				return pad > 0 ? pad : Number.POSITIVE_INFINITY;
			});
		}

		function layout() {
			if (!anyActive()) {
				for (const c of children) {
					c.style.width = "";
					c.style.flex = "";
				}
				return;
			}
			const w = natural.slice();
			children.forEach((child, i) => {
				const p = states.get(child)?.progress ?? 0;
				if (p === 0) return;
				const n = children.length;
				if (n < 2) return;
				if (i > 0 && i < n - 1) {
					const growth = p * Math.min((ratio * natural[i]) / 2, limits[i - 1], limits[i + 1]);
					w[i - 1] -= growth;
					w[i + 1] -= growth;
					w[i] += 2 * growth;
				} else if (i === 0) {
					const g = p * Math.min(ratio * natural[i], limits[i + 1]);
					w[i + 1] -= g;
					w[i] += g;
				} else {
					const g = p * Math.min(ratio * natural[i], limits[i - 1]);
					w[i - 1] -= g;
					w[i] += g;
				}
			});
			children.forEach((c, i) => {
				c.style.flex = "none";
				c.style.width = `${w[i]}px`;
			});
		}

		function animate(el: Element, target: number) {
			const s = states.get(el);
			if (!s) return;
			s.cancel?.();
			s.cancel = animateSpring(
				s.progress,
				target,
				activeSpring("fast-spatial", host),
				(v, dv) => {
					s.progress = v;
					s.velocity = dv;
					layout();
					if (s.releasePending && v > 0.75) {
						s.releasePending = false;
						// retarget after animateSpring has scheduled its next frame, so cancel() hits it
						queueMicrotask(() => animate(el, 0));
					}
				},
				{
					velocity: s.velocity,
					reducedMotion: false,
					onComplete: () => {
						if (target === 0) states.delete(el);
						if (!anyActive()) layout();
					},
				}
			);
		}

		function press(el: Element) {
			if (reduced() || isDisabled(el)) return;
			if (!anyActive()) measure();
			let s = states.get(el);
			if (!s) {
				s = { progress: 0, velocity: 0, held: true, releasePending: false };
				states.set(el, s);
			}
			s.held = true;
			s.releasePending = false;
			animate(el, 1);
		}

		function release(el: Element) {
			const s = states.get(el);
			if (!s || !s.held) return;
			s.held = false;
			if (s.progress > 0.75) animate(el, 0);
			else s.releasePending = true;
		}

		function childOf(target: EventTarget | null) {
			if (!(target instanceof Node)) return null;
			for (const c of host.children) if (c.contains(target)) return c;
			return null;
		}

		function onPointerDown(e: PointerEvent) {
			if (e.pointerType === "mouse" && e.button !== 0) return;
			const el = childOf(e.target);
			if (!el) return;
			pointerTargets.set(e.pointerId, el);
			press(el);
		}

		function onPointerUp(e: PointerEvent) {
			const el = pointerTargets.get(e.pointerId);
			if (!el) return;
			pointerTargets.delete(e.pointerId);
			release(el);
		}

		const isKey = (e: KeyboardEvent) => e.key === " " || e.key === "Enter";
		function onKeyDown(e: KeyboardEvent) {
			if (!isKey(e) || e.repeat) return;
			const el = childOf(e.target);
			if (el) press(el);
		}
		function onKeyUp(e: KeyboardEvent) {
			if (!isKey(e)) return;
			const el = childOf(e.target);
			if (el) release(el);
		}

		host.addEventListener("pointerdown", onPointerDown);
		host.addEventListener("keydown", onKeyDown);
		host.addEventListener("keyup", onKeyUp);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("pointercancel", onPointerUp);

		return () => {
			host.removeEventListener("pointerdown", onPointerDown);
			host.removeEventListener("keydown", onKeyDown);
			host.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("pointerup", onPointerUp);
			window.removeEventListener("pointercancel", onPointerUp);
			for (const s of states.values()) s.cancel?.();
			for (const c of children) {
				c.style.width = "";
				c.style.flex = "";
			}
		};
	};
}
