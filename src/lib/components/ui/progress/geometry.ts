/**
 * Geometry + timing helpers shared by LinearProgress and CircularProgress.
 * All numbers come from docs/research/navigation-containment.md §17 and motion.md §4
 * (Compose ProgressIndicator.kt / WavyProgressIndicator.kt, Linear/CircularProgressIndicatorTokens).
 */

/**
 * Spec tokens (dp == px).
 * Colors: active indicator + stop `primary`, track `secondary-container` (Compose + material-web
 * tokens). The MDC-Android docs still say `primary-container`; the tokens win (doc discrepancy #5).
 */
export const PROGRESS = {
	/** Track / active indicator thickness (default; "thick" sample = 8dp). */
	thickness: 4,
	thickThickness: 8,
	/** Gap between the active indicator and the track. */
	trackGap: 4,
	/** Stop indicator (linear determinate only). */
	stopSize: 4,
	linear: {
		amplitude: 3,
		wavelength: 40,
		indeterminateWavelength: 20,
		/** Determinate flat progress: spring(ζ 1, k 50 = StiffnessVeryLow). */
		spring: { dampingRatio: 1, stiffness: 50 },
		/** Indeterminate cycle and line keyframes (ms), all emphasized-accelerate. */
		cycleMs: 1750,
		lines: [
			{ headDelay: 0, headMs: 1000, tailDelay: 250, tailMs: 1000 },
			{ headDelay: 650, headMs: 850, tailDelay: 900, tailMs: 850 }
		]
	},
	circular: {
		size: 40,
		wavySize: 48,
		thickSize: 44,
		thickWavySize: 52,
		amplitude: 1.6,
		wavelength: 15,
		cycleMs: 6000,
		globalRotation: 1080,
		stepMs: 1500,
		stepDurationMs: 300,
		minArc: 0.1,
		maxArc: 0.87
	},
	/** Wavy determinate progress tween (DurationLong2, linear) and amplitude ramp (500ms). */
	wavyProgressMs: 500,
	amplitudeMs: 500,
	/** Amplitude is 0 at progress ≤ 10% or ≥ 95%. */
	amplitudeMin: 0.1,
	amplitudeMax: 0.95
} as const;

/** CSS cubic-bezier(x1, y1, x2, y2) as an easing function t → eased t. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sx = (s: number) => ((ax * s + bx) * s + cx) * s;
	const sy = (s: number) => ((ay * s + by) * s + cy) * s;
	const dsx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
	return (t: number) => {
		if (t <= 0) return 0;
		if (t >= 1) return 1;
		let s = t;
		for (let i = 0; i < 8; i++) {
			const err = sx(s) - t;
			if (Math.abs(err) < 1e-6) return sy(s);
			const d = dsx(s);
			if (Math.abs(d) < 1e-6) break;
			s -= err / d;
		}
		let lo = 0;
		let hi = 1;
		s = t;
		while (hi - lo > 1e-6) {
			if (sx(s) < t) lo = s;
			else hi = s;
			s = (lo + hi) / 2;
		}
		return sy(s);
	};
}

/** md.sys.motion.easing.* (motion.md §1.2) as functions. */
export const ease = {
	standard: cubicBezier(0.2, 0, 0, 1),
	emphasizedAccelerate: cubicBezier(0.3, 0, 0.8, 0.15),
	emphasizedDecelerate: cubicBezier(0.05, 0.7, 0.1, 1),
	linear: (t: number) => t
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Indeterminate linear: the two [tail, head] fractions at time `ms`. */
export function linearIndeterminateLines(ms: number): [number, number][] {
	const t = ms % PROGRESS.linear.cycleMs;
	return PROGRESS.linear.lines.map((l) => [
		ease.emphasizedAccelerate(clamp01((t - l.tailDelay) / l.tailMs)),
		ease.emphasizedAccelerate(clamp01((t - l.headDelay) / l.headMs))
	]);
}

/** Indeterminate circular: start angle (deg, 0 = 12 o'clock) and sweep fraction at time `ms`. */
export function circularIndeterminate(ms: number) {
	const c = PROGRESS.circular;
	const t = ms % c.cycleMs;
	const global = (c.globalRotation * t) / c.cycleMs;
	const step = Math.floor(t / c.stepMs);
	const additional = 90 * step + 90 * ease.emphasizedDecelerate(clamp01((t - step * c.stepMs) / c.stepDurationMs));
	const half = c.cycleMs / 2;
	const arc =
		t < half
			? c.minArc + (c.maxArc - c.minArc) * ease.standard(t / half)
			: c.maxArc - (c.maxArc - c.minArc) * ease.standard((t - half) / half);
	return { start: global + additional, sweep: arc };
}

/** Amplitude factor (0 or 1) for a determinate wavy indicator at progress p (0–1). */
export function targetAmplitude(p: number) {
	return p <= PROGRESS.amplitudeMin || p >= PROGRESS.amplitudeMax ? 0 : 1;
}

const f = (n: number) => Math.round(n * 100) / 100;

/**
 * Path for a round-capped stroke whose *visual* extent (caps included) is [a, b] on the x axis.
 * `amp` > 0 draws a sine wave (wavelength `wl`, phase offset `phase` px) around `mid`.
 */
export function linearSegmentPath(a: number, b: number, mid: number, cap: number, amp = 0, wl = 40, phase = 0) {
	if (!(b - a > 0) || !Number.isFinite(a + b + amp + phase)) return '';
	const x0 = a + cap;
	const x1 = Math.max(x0, b - cap);
	if (amp <= 0.001 || x1 - x0 < 0.5) return `M${f(x0)} ${f(mid)}H${f(x1)}`;
	const k = (2 * Math.PI) / wl;
	const step = 1;
	let d = '';
	for (let x = x0; ; x += step) {
		const xx = Math.min(x, x1);
		const y = mid + amp * Math.sin(k * (xx - phase));
		d += `${d ? 'L' : 'M'}${f(xx)} ${f(y)}`;
		if (xx >= x1) break;
	}
	return d;
}

/**
 * Arc path around (c, c) with radius `r` from `startDeg` sweeping `sweepDeg` clockwise
 * (0° = 12 o'clock). `amp` > 0 modulates the radius with `waves` sine periods per turn.
 */
export function arcPath(c: number, r: number, startDeg: number, sweepDeg: number, amp = 0, waves = 0, phase = 0) {
	if (!(sweepDeg > 0) || !Number.isFinite(startDeg + sweepDeg + r + amp + phase)) return '';
	const toRad = Math.PI / 180;
	if (amp <= 0.001) {
		if (sweepDeg >= 359.99) {
			return `M${f(c)} ${f(c - r)}A${f(r)} ${f(r)} 0 1 1 ${f(c)} ${f(c + r)}A${f(r)} ${f(r)} 0 1 1 ${f(c)} ${f(c - r)}`;
		}
		const a0 = (startDeg - 90) * toRad;
		const a1 = (startDeg + sweepDeg - 90) * toRad;
		const large = sweepDeg > 180 ? 1 : 0;
		return `M${f(c + r * Math.cos(a0))} ${f(c + r * Math.sin(a0))}A${f(r)} ${f(r)} 0 ${large} 1 ${f(c + r * Math.cos(a1))} ${f(c + r * Math.sin(a1))}`;
	}
	// ~1.5° steps keep the wave smooth at 48dp.
	const n = Math.max(2, Math.ceil(sweepDeg / 1.5));
	let d = '';
	for (let i = 0; i <= n; i++) {
		const deg = startDeg + (sweepDeg * i) / n;
		const a = (deg - 90) * toRad;
		const rr = r + amp * Math.sin(waves * (deg * toRad) - phase);
		d += `${i ? 'L' : 'M'}${f(c + rr * Math.cos(a))} ${f(c + rr * Math.sin(a))}`;
	}
	return d;
}

/** rAF tween `from → to` over `ms` with `easing`; returns cancel(). */
export function animateTween(
	from: number,
	to: number,
	ms: number,
	easing: (t: number) => number,
	onFrame: (value: number) => void,
	reducedMotion = false
): () => void {
	if (reducedMotion || from === to || typeof requestAnimationFrame === 'undefined') {
		onFrame(to);
		return () => {};
	}
	let raf = 0;
	let start: number | null = null;
	const tick = (now: number) => {
		start ??= now;
		const t = Math.min(1, (now - start) / ms);
		onFrame(from + (to - from) * easing(t));
		if (t < 1) raf = requestAnimationFrame(tick);
	};
	raf = requestAnimationFrame(tick);
	return () => cancelAnimationFrame(raf);
}
