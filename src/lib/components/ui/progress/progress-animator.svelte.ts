import { untrack } from 'svelte';
import { prefersReducedMotion } from 'svelte/motion';
import { animateSpring } from '#lib/m3/motion.js';
import { PROGRESS, animateTween, ease, targetAmplitude } from './geometry.js';

export interface ProgressInput {
	/** Target progress 0–1. */
	fraction: number;
	indeterminate: boolean;
	wavy: boolean;
}

/**
 * Animated state behind both progress indicators (create during component init):
 * - `shown`: displayed progress. Flat: spring(ζ 1, k 50). Wavy: 500ms linear tween.
 * - `amplitude`: 0–1 wave amplitude factor. 0 at ≤10% / ≥95% (determinate), ramps 500ms
 *   (standard up, emphasized-accelerate down). Always 0 under reduced motion (flat fallback).
 * - `now`: rAF clock (ms) while something moves (wave travel or indeterminate cycle).
 */
export class ProgressAnimator {
	shown = $state(0);
	amplitude = $state(0);
	now = $state(0);
	#input: () => ProgressInput;

	reduced = $derived(prefersReducedMotion.current);
	#ampTarget = $derived.by(() => {
		const { indeterminate, wavy } = this.#input();
		if (!wavy || this.reduced) return 0;
		return indeterminate ? 1 : targetAmplitude(this.shown);
	});
	/** The rAF clock only runs while the wave travels or the indeterminate cycle plays. */
	#ticking = $derived.by(() => {
		const { indeterminate, wavy } = this.#input();
		return indeterminate || (wavy && !this.reduced && this.amplitude > 0);
	});

	constructor(input: () => ProgressInput) {
		this.#input = input;
		const initial = untrack(input);
		this.shown = initial.fraction;
		this.amplitude = initial.wavy && !initial.indeterminate ? targetAmplitude(initial.fraction) : initial.wavy ? 1 : 0;

		let velocity = 0;
		$effect(() => {
			const { fraction, wavy, indeterminate } = this.#input();
			if (indeterminate) return;
			const from = untrack(() => this.shown);
			const reduced = this.reduced;
			const cancel = wavy
				? animateTween(from, fraction, PROGRESS.wavyProgressMs, ease.linear, (v) => (this.shown = v), reduced)
				: animateSpring(
						from,
						fraction,
						PROGRESS.linear.spring,
						(v, dv) => {
							this.shown = v;
							velocity = dv;
						},
						{ velocity, reducedMotion: reduced, threshold: 0.0005 }
					);
			return cancel;
		});

		$effect(() => {
			const target = this.#ampTarget;
			const from = untrack(() => this.amplitude);
			return animateTween(
				from,
				target,
				PROGRESS.amplitudeMs,
				target > from ? ease.standard : ease.emphasizedAccelerate,
				(v) => (this.amplitude = v),
				this.reduced
			);
		});

		$effect(() => {
			if (!this.#ticking) return;
			let raf = 0;
			const tick = (t: number) => {
				this.now = t;
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
			return () => cancelAnimationFrame(raf);
		});
	}
}
