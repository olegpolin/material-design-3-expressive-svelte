import { toast } from 'svelte-sonner';
import SnackbarToast from './snackbar-toast.svelte';

/** Auto-dismiss durations (navigation-containment.md §19, Compose SnackbarDuration). */
export const SNACKBAR_DURATION = {
	short: 4000,
	long: 10000,
	indefinite: Number.POSITIVE_INFINITY
} as const;

export type SnackbarDuration = keyof typeof SNACKBAR_DURATION | number;

export interface SnackbarOptions {
	/** Action label (inverse-primary text button). Clicking it calls `onAction` and dismisses. */
	action?: string;
	onAction?: () => void;
	/**
	 * `'short'` 4s, `'long'` 10s, `'indefinite'` or ms. Default: `'short'`, or `'long'` when there
	 * is an action (Compose defaults to indefinite there; the web guideline caps it at 4–10s).
	 */
	duration?: SnackbarDuration;
	/** Show a close (×) icon button. Forced on for `'indefinite'` snackbars without an action. */
	closable?: boolean;
	/** Put a long action label on its own line. */
	actionOnNewLine?: boolean;
	/** Called once the snackbar is gone (timeout, action, close, swipe or `dismissSnackbar`). */
	onDismiss?: () => void;
}

interface QueueItem {
	key: number;
	message: string;
	options: SnackbarOptions;
}

/** svelte-sonner unmounts 200ms after dismissal; the next snackbar waits for that exit. */
const EXIT_MS = 200;

const queue: QueueItem[] = [];
let current: { item: QueueItem; id: string | number } | null = null;
let nextKey = 0;

function resolveDuration(o: SnackbarOptions) {
	const d = o.duration ?? (o.action ? 'long' : 'short');
	return typeof d === 'number' ? d : SNACKBAR_DURATION[d];
}

function showNext() {
	const item = queue.shift();
	if (!item) return;
	const { message, options } = item;
	const duration = resolveDuration(options);
	let finished = false;
	const finish = () => {
		if (finished) return;
		finished = true;
		options.onDismiss?.();
		if (current?.item === item) current = null;
		setTimeout(() => {
			if (!current) showNext();
		}, EXIT_MS);
	};
	const id = toast.custom(SnackbarToast, {
		id: `m3-snackbar-${item.key}`,
		duration,
		componentProps: {
			message,
			action: options.action,
			onAction: options.onAction,
			closable: options.closable ?? (duration === Infinity && !options.action),
			actionOnNewLine: options.actionOnNewLine,
			onclose: finish
		},
		onAutoClose: finish,
		onDismiss: finish
	});
	current = { item, id };
}

/**
 * Show an M3 snackbar. Snackbars queue: one at a time, the next appears after the current one
 * has faded out. Requires `<Snackbar />` (or the restyled sonner `<Toaster />`) mounted once.
 * Returns a key usable with `dismissSnackbar`.
 *
 * @example snackbar('Photo archived', { action: 'Undo', onAction: restore })
 */
export function snackbar(message: string, options: SnackbarOptions = {}) {
	const item: QueueItem = { key: ++nextKey, message, options };
	queue.push(item);
	if (!current) showNext();
	return item.key;
}

/** Dismiss the visible snackbar (no key) or remove a queued / visible one by key. */
export function dismissSnackbar(key?: number) {
	if (key === undefined || current?.item.key === key) {
		if (current) toast.dismiss(current.id);
		return;
	}
	const i = queue.findIndex((q) => q.key === key);
	if (i >= 0) queue.splice(i, 1);
}
