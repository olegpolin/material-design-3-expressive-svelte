import { getContext, setContext } from "svelte";

export interface DialogLayoutProps {
	/** `true` = full-screen below 600dp, basic-dialog shape above; `"always"` = full-screen at every width. */
	fullscreen?: boolean | "always";
	/** A hero icon is shown: header content is center-aligned. */
	hasIcon?: boolean;
	closeIcon?: string;
	closeLabel?: string;
}

/**
 * Layout info `Dialog.Content` shares with its parts (header, title, body, footer).
 * Props are read through a getter so they stay reactive; `scrolled` is local state written by
 * `Dialog.Body` and read by the full-screen `Dialog.Header`.
 *
 * Plain get/setContext (not `createContext`) on purpose: parts may also be rendered outside
 * `Dialog.Content` (e.g. `command-dialog` puts a hidden header next to it), so a missing context
 * falls back to the basic layout instead of throwing.
 */
export class DialogLayout {
	#props: () => DialogLayoutProps;
	/** Full-screen body scrolled: the header gets surface-container + level2. */
	scrolled = $state(false);

	constructor(props: () => DialogLayoutProps) {
		this.#props = props;
	}

	get fullscreen() {
		return this.#props().fullscreen ?? false;
	}
	get hasIcon() {
		return this.#props().hasIcon ?? false;
	}
	get closeIcon() {
		return this.#props().closeIcon ?? "close";
	}
	get closeLabel() {
		return this.#props().closeLabel ?? "Close";
	}
}

const KEY = Symbol("m3-dialog-layout");
const FALLBACK = new DialogLayout(() => ({}));

export function setDialogLayout(layout: DialogLayout) {
	return setContext(KEY, layout);
}

export function getDialogLayout(): DialogLayout {
	return getContext<DialogLayout | undefined>(KEY) ?? FALLBACK;
}

/** 40dp icon button (48dp target) used for close / navigation icons in dialog headers. */
export const DIALOG_ICON_BUTTON =
	"relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-m3-full text-on-surface-variant select-none after:absolute after:-inset-1 after:content-['']";
