import { createContext } from 'svelte';

export interface NavigationDrawerContext {
	readonly variant: 'standard' | 'modal';
	/** Called by items after activation; closes a modal drawer when `closeOnSelect`. */
	itemActivated(): void;
}

export const [getNavigationDrawerContext, setNavigationDrawerContext] = createContext<NavigationDrawerContext>();
