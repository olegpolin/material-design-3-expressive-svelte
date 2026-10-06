import { getContext, setContext } from 'svelte';

/** What the showcase shell (`src/routes/(app)/+layout.svelte`) offers to the pages inside it. */
export interface AppShell {
	/** Whether the theme panel is open. */
	readonly themePanelOpen: boolean;
	openThemePanel(): void;
	closeThemePanel(): void;
}

const KEY = Symbol('app-shell');

export function setAppShell(shell: AppShell) {
	return setContext(KEY, shell);
}

/** The shell API, or `undefined` when the page is rendered outside the `(app)` layout. */
export function getAppShell(): AppShell | undefined {
	return getContext<AppShell | undefined>(KEY);
}
