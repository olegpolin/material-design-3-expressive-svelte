/**
 * One shared requestAnimationFrame loop for every animated indicator on the page (progress
 * indicators, loading indicators), plus a shared IntersectionObserver so off-screen
 * indicators stop drawing. Both are browser-only; on the server they are no-ops.
 */

type FrameCallback = (now: number) => void;

const subscribers = new Set<FrameCallback>();
let raf = 0;

function loop(now: number) {
	raf = 0;
	for (const cb of subscribers) cb(now);
	if (subscribers.size > 0) raf = requestAnimationFrame(loop);
}

/** Call `cb(now)` on every animation frame until the returned function is called. */
export function onFrame(cb: FrameCallback): () => void {
	if (typeof requestAnimationFrame === 'undefined') return () => {};
	subscribers.add(cb);
	if (!raf) raf = requestAnimationFrame(loop);
	return () => {
		subscribers.delete(cb);
		if (subscribers.size === 0 && raf) {
			cancelAnimationFrame(raf);
			raf = 0;
		}
	};
}

const visibilityCallbacks = new WeakMap<Element, (visible: boolean) => void>();
let observer: IntersectionObserver | null = null;

/**
 * Report whether `el` is on screen (with a 64px margin). Without IntersectionObserver the
 * element counts as always visible. Returns a cleanup function.
 */
export function observeVisibility(el: Element, cb: (visible: boolean) => void): () => void {
	if (typeof IntersectionObserver === 'undefined') {
		cb(true);
		return () => {};
	}
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) visibilityCallbacks.get(entry.target)?.(entry.isIntersecting);
		},
		{ rootMargin: '64px' }
	);
	visibilityCallbacks.set(el, cb);
	observer.observe(el);
	return () => {
		observer?.unobserve(el);
		visibilityCallbacks.delete(el);
	};
}

/**
 * Run `cb(now)` every frame while `el` is on screen. Returns a cleanup function.
 * Use it from an attachment: `{@attach (el) => whileVisible(el, draw)}`.
 */
export function whileVisible(el: Element, cb: FrameCallback): () => void {
	let stop: (() => void) | null = null;
	const unobserve = observeVisibility(el, (visible) => {
		if (visible && !stop) stop = onFrame(cb);
		else if (!visible && stop) {
			stop();
			stop = null;
		}
	});
	return () => {
		unobserve();
		stop?.();
	};
}
