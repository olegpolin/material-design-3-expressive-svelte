/**
 * Deterministic mock data for the "Orbit — team workspace" dashboard.
 *
 * Everything is generated from a seeded PRNG and a fixed "today", so the server render and the
 * client hydration produce identical markup (no `Date.now()` / `Math.random()` here). Date labels
 * are formatted in UTC for the same reason.
 */

// ------------------------------------------------------------------ basics

export const WORKSPACE = { name: 'Orbit', tagline: 'Team workspace' } as const;

/** Fixed "today" for the mock data (UTC midnight). */
export const TODAY = new Date(Date.UTC(2026, 9, 6));

const DAY = 86_400_000;

/** mulberry32: tiny seeded PRNG, returns [0, 1). */
function prng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts });
const fmtShortDate = fmt({ month: 'short', day: 'numeric' });
const fmtLongDate = fmt({ month: 'short', day: 'numeric', year: 'numeric' });
const fmtMonth = fmt({ month: 'short' });
const fmtMonthYear = fmt({ month: 'long', year: 'numeric' });
const fmtWeekday = fmt({ weekday: 'short', month: 'short', day: 'numeric' });
const fmtHour = fmt({ hour: 'numeric' });

export const formatDate = (d: Date) => fmtLongDate.format(d);
export const formatShortDate = (d: Date) => fmtShortDate.format(d);

// ------------------------------------------------------------------ ranges

export type RangeKey = 'day' | 'week' | 'month' | 'year';

export const RANGES: { value: RangeKey; label: string; long: string }[] = [
	{ value: 'day', label: 'Day', long: 'today' },
	{ value: 'week', label: 'Week', long: 'last 7 days' },
	{ value: 'month', label: 'Month', long: 'last 30 days' },
	{ value: 'year', label: 'Year', long: 'last 12 months' }
];

/** Points per range and the time step between them. */
const RANGE_SPEC: Record<RangeKey, { points: number; step: (end: Date, i: number, n: number) => Date }> = {
	day: { points: 24, step: (end, i, n) => new Date(end.getTime() - (n - 1 - i) * 3_600_000 + 23 * 3_600_000) },
	week: { points: 7, step: (end, i, n) => new Date(end.getTime() - (n - 1 - i) * DAY) },
	month: { points: 30, step: (end, i, n) => new Date(end.getTime() - (n - 1 - i) * DAY) },
	year: {
		points: 12,
		step: (end, i, n) => new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (n - 1 - i), 1))
	}
};

/** Human-readable span ending at `end`, e.g. "Sep 7 – Oct 6, 2026". */
export function rangeLabel(range: RangeKey, end: Date = TODAY): string {
	switch (range) {
		case 'day':
			return fmtWeekday.format(end) + ', ' + end.getUTCFullYear();
		case 'week':
			return `${fmtShortDate.format(new Date(end.getTime() - 6 * DAY))} – ${fmtLongDate.format(end)}`;
		case 'month':
			return `${fmtShortDate.format(new Date(end.getTime() - 29 * DAY))} – ${fmtLongDate.format(end)}`;
		case 'year': {
			const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1));
			return `${fmtMonthYear.format(start)} – ${fmtMonthYear.format(end)}`;
		}
	}
}

/** Axis tick / tooltip label for a point of the given range. */
export function tickLabel(range: RangeKey, d: Date, long = false): string {
	switch (range) {
		case 'day':
			return fmtHour.format(d);
		case 'week':
			return long ? fmtWeekday.format(d) : fmt({ weekday: 'short' }).format(d);
		case 'month':
			return long ? fmtLongDate.format(d) : fmtShortDate.format(d);
		case 'year':
			return long ? fmtMonthYear.format(d) : fmtMonth.format(d);
	}
}

const RANGE_SEED: Record<RangeKey, number> = { day: 11, week: 23, month: 37, year: 53 };
const RANGE_SCALE: Record<RangeKey, number> = { day: 1 / 26, week: 0.24, month: 1, year: 11.6 };

// ------------------------------------------------------------------ sessions (area chart)

export type SessionPoint = { date: Date; web: number; mobile: number };

export function getSessions(range: RangeKey, end: Date = TODAY): SessionPoint[] {
	const { points, step } = RANGE_SPEC[range];
	const rnd = prng(RANGE_SEED[range]);
	const base = range === 'day' ? 380 : range === 'year' ? 92_000 : 3_100;
	return Array.from({ length: points }, (_, i) => {
		const t = i / Math.max(1, points - 1);
		// gentle growth + a weekly / daily rhythm + noise
		const rhythm =
			range === 'day'
				? Math.sin(((i - 6) / 24) * Math.PI * 2) * 0.45
				: range === 'year'
					? Math.sin(t * Math.PI * 1.6) * 0.12
					: Math.sin((i / 7) * Math.PI * 2) * 0.14;
		const web = base * (1 + t * 0.35 + rhythm + (rnd() - 0.5) * 0.18);
		const mobile = base * 0.72 * (1 + t * 0.55 + rhythm * 0.8 + (rnd() - 0.5) * 0.22);
		return { date: step(end, i, points), web: Math.round(web), mobile: Math.round(mobile) };
	});
}

// ------------------------------------------------------------------ KPI tiles

export type Kpi = {
	id: 'revenue' | 'users' | 'tasks' | 'churn';
	label: string;
	icon: string;
	value: number;
	/** Display string for `value`. */
	display: string;
	/** Formats any value of this metric like `display` (used while the number tweens). */
	format: (n: number) => string;
	/** Relative change vs the previous period, in percent. */
	delta: number;
	/** Whether an increase is good news (churn: it isn't). */
	upIsGood: boolean;
	/** CSS color for the sparkline (an M3 role variable). */
	color: string;
	spark: number[];
};

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat('en-US');
export const formatCompact = (n: number) => compact.format(n);
export const formatInteger = (n: number) => integer.format(n);
export const formatCurrency = (n: number) => '$' + compact.format(n);

function spark(seed: number, n: number, trend: number): number[] {
	const rnd = prng(seed);
	let v = 50;
	return Array.from({ length: n }, () => (v = Math.max(5, v + trend + (rnd() - 0.45) * 12)));
}

export function getKpis(range: RangeKey): Kpi[] {
	const s = RANGE_SCALE[range];
	const seed = RANGE_SEED[range];
	const rnd = prng(seed * 7);
	const jitter = () => Math.round((rnd() - 0.5) * 40) / 10;
	const revenue = Math.round(128_400 * s);
	const users = Math.round(range === 'year' ? 48_210 : range === 'day' ? 1_942 : 8_942 * (range === 'week' ? 0.62 : 1));
	const tasks = Math.round(1_284 * s);
	const churn = 2.4 + (range === 'year' ? 0.7 : range === 'day' ? -0.3 : 0);
	return [
		{
			id: 'revenue',
			label: 'Revenue',
			icon: 'payments',
			value: revenue,
			display: formatCurrency(revenue),
			format: formatCurrency,
			delta: 12.4 + jitter(),
			upIsGood: true,
			color: 'var(--md-sys-color-primary)',
			spark: spark(seed + 1, 16, 2)
		},
		{
			id: 'users',
			label: 'Active users',
			icon: 'group',
			value: users,
			display: formatInteger(users),
			format: (n) => formatInteger(Math.round(n)),
			delta: 6.1 + jitter(),
			upIsGood: true,
			color: 'var(--md-sys-color-tertiary)',
			spark: spark(seed + 2, 16, 1.2)
		},
		{
			id: 'tasks',
			label: 'Tasks done',
			icon: 'task_alt',
			value: tasks,
			display: formatInteger(tasks),
			format: (n) => formatInteger(Math.round(n)),
			delta: -3.2 + jitter() / 2,
			upIsGood: true,
			color: 'var(--md-sys-color-secondary)',
			spark: spark(seed + 3, 16, -0.6)
		},
		{
			id: 'churn',
			label: 'Churn rate',
			icon: 'person_remove',
			value: churn,
			display: churn.toFixed(1) + '%',
			format: (n) => n.toFixed(1) + '%',
			delta: -8.5 + jitter(),
			upIsGood: false,
			color: 'var(--md-sys-color-primary)',
			spark: spark(seed + 4, 16, -1)
		}
	];
}

// ------------------------------------------------------------------ categories (bar chart)

export type CategoryPoint = { category: string; completed: number; open: number };

export function getCategories(range: RangeKey): CategoryPoint[] {
	const rnd = prng(RANGE_SEED[range] * 3);
	const s = RANGE_SCALE[range];
	return ['Design', 'Apps', 'Infra', 'Growth', 'Support'].map((category, i) => {
		const total = (120 + i * 18 + rnd() * 90) * Math.max(s, 0.08) * 3;
		const done = 0.45 + rnd() * 0.4;
		return { category, completed: Math.round(total * done), open: Math.round(total * (1 - done)) };
	});
}

// ------------------------------------------------------------------ traffic sources (donut)

export type SourcePoint = { source: 'direct' | 'organic' | 'referral' | 'social'; label: string; visitors: number };

export function getSources(range: RangeKey): SourcePoint[] {
	const rnd = prng(RANGE_SEED[range] * 5);
	const s = RANGE_SCALE[range] * 41_000;
	const shares = [0.36 + rnd() * 0.06, 0.28 + rnd() * 0.05, 0.18 + rnd() * 0.04, 0.12 + rnd() * 0.03];
	const sum = shares.reduce((a, b) => a + b, 0);
	const labels = [
		['direct', 'Direct'],
		['organic', 'Organic search'],
		['referral', 'Referral'],
		['social', 'Social']
	] as const;
	return labels.map(([source, label], i) => ({ source, label, visitors: Math.round((shares[i] / sum) * s) }));
}

// ------------------------------------------------------------------ people

export type Member = {
	id: string;
	name: string;
	initials: string;
	role: string;
	online: boolean;
	/** Avatar container role (M3 container color pairs). */
	tone: 'primary' | 'secondary' | 'tertiary';
};

export const TEAM: Member[] = [
	{ id: 'u1', name: 'Maya Okafor', initials: 'MO', role: 'Product lead', online: true, tone: 'primary' },
	{ id: 'u2', name: 'Theo Lindqvist', initials: 'TL', role: 'Design systems', online: true, tone: 'tertiary' },
	{ id: 'u3', name: 'Priya Raman', initials: 'PR', role: 'Frontend', online: false, tone: 'secondary' },
	{ id: 'u4', name: 'Diego Alvarez', initials: 'DA', role: 'Backend', online: true, tone: 'primary' },
	{ id: 'u5', name: 'Hana Sato', initials: 'HS', role: 'Growth', online: false, tone: 'tertiary' },
	{ id: 'u6', name: 'Sam Whitfield', initials: 'SW', role: 'Support', online: true, tone: 'secondary' },
	{ id: 'u7', name: 'Lena Novak', initials: 'LN', role: 'Data', online: false, tone: 'primary' },
	{ id: 'u8', name: 'Kofi Mensah', initials: 'KM', role: 'Infra', online: true, tone: 'tertiary' }
];

export const memberById = (id: string) => TEAM.find((m) => m.id === id) ?? TEAM[0];

/** The signed-in user. */
export const ME = TEAM[0];

// ------------------------------------------------------------------ activity

export type Activity = { id: string; memberId: string; action: string; time: string; icon: string };

export const ACTIVITY: Activity[] = [
	{ id: 'a1', memberId: 'u2', action: 'shipped “Expressive shapes” to Design system', time: '4 min', icon: 'rocket_launch' },
	{ id: 'a2', memberId: 'u4', action: 'merged ORB-1037 · Rate limiter for public API', time: '22 min', icon: 'merge' },
	{ id: 'a3', memberId: 'u3', action: 'commented on Onboarding v2 checklist', time: '1 h', icon: 'chat_bubble' },
	{ id: 'a4', memberId: 'u5', action: 'launched the October lifecycle campaign', time: '3 h', icon: 'campaign' },
	{ id: 'a5', memberId: 'u6', action: 'closed 14 support tickets', time: '5 h', icon: 'support_agent' }
];

// ------------------------------------------------------------------ projects

export type Project = {
	id: string;
	name: string;
	progress: number;
	status: 'in-progress' | 'done' | 'at-risk';
	due: string;
	icon: string;
};

export const PROJECTS: Project[] = [
	{ id: 'p1', name: 'Design system 3.0', progress: 72, status: 'in-progress', due: 'Oct 24', icon: 'palette' },
	{ id: 'p2', name: 'Onboarding v2', progress: 46, status: 'at-risk', due: 'Oct 15', icon: 'waving_hand' },
	{ id: 'p3', name: 'Public API', progress: 88, status: 'in-progress', due: 'Nov 2', icon: 'api' },
	{ id: 'p4', name: 'Billing migration', progress: 100, status: 'done', due: 'Sep 30', icon: 'credit_card' }
];

export const PROJECT_NAMES = PROJECTS.map((p) => p.name);

// ------------------------------------------------------------------ storage

export const STORAGE = {
	usedGb: 68.4,
	totalGb: 100,
	breakdown: [
		{ id: 'docs', label: 'Documents', gb: 31.2, icon: 'description' },
		{ id: 'media', label: 'Media', gb: 24.9, icon: 'perm_media' },
		{ id: 'backups', label: 'Backups', gb: 12.3, icon: 'backup' }
	]
} as const;

// ------------------------------------------------------------------ tasks (table)

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
	id: string;
	title: string;
	project: string;
	assigneeId: string;
	status: TaskStatus;
	priority: TaskPriority;
	/** Due date, ISO yyyy-mm-dd. */
	due: string;
	points: number;
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
	todo: 'To do',
	'in-progress': 'In progress',
	review: 'In review',
	done: 'Done',
	blocked: 'Blocked'
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = { low: 'Low', medium: 'Medium', high: 'High' };

const TASK_TITLES = [
	'Audit color roles in dark theme',
	'Rate limiter for public API',
	'Onboarding checklist copy',
	'Migrate invoices to new ledger',
	'Wavy progress in uploads',
	'Webhook retries with backoff',
	'Lifecycle email: week 2',
	'Search ranking experiment',
	'Avatar upload cropping',
	'SAML single sign-on',
	'Usage-based pricing page',
	'Refactor notification service',
	'Docs: theming guide',
	'Fix flaky e2e checkout test',
	'Keyboard shortcuts sheet',
	'Data export to CSV',
	'Accessibility pass on tables',
	'Mobile nav bar badges',
	'Quarterly roadmap review',
	'Billing alerts for admins',
	'Shape morph on FAB menu',
	'Reduce cold start latency',
	'Support macros cleanup',
	'Team invite flow polish'
];

const STATUSES: TaskStatus[] = ['in-progress', 'review', 'todo', 'done', 'blocked', 'in-progress', 'done', 'todo'];
const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low', 'medium', 'high', 'low'];

export function isoDate(d: Date) {
	return d.toISOString().slice(0, 10);
}

export const TASKS: Task[] = (() => {
	const rnd = prng(1042);
	return TASK_TITLES.map((title, i) => ({
		id: `ORB-${1042 - i}`,
		title,
		project: PROJECT_NAMES[Math.floor(rnd() * PROJECT_NAMES.length)],
		assigneeId: TEAM[Math.floor(rnd() * TEAM.length)].id,
		status: STATUSES[i % STATUSES.length],
		priority: PRIORITIES[Math.floor(rnd() * PRIORITIES.length)],
		due: isoDate(new Date(TODAY.getTime() + Math.round((rnd() - 0.3) * 24) * DAY)),
		points: [1, 2, 3, 5, 8, 13][Math.floor(rnd() * 6)]
	}));
})();

export function formatDue(iso: string) {
	return fmtShortDate.format(new Date(iso + 'T00:00:00Z'));
}

// ------------------------------------------------------------------ notifications

export const NOTIFICATIONS = [
	{ id: 'n1', icon: 'alternate_email', text: 'Theo mentioned you in Design system 3.0', time: '2 min' },
	{ id: 'n2', icon: 'warning', text: 'Onboarding v2 is at risk of missing Oct 15', time: '1 h' },
	{ id: 'n3', icon: 'task_alt', text: 'Billing migration was marked done', time: 'Yesterday' }
];
