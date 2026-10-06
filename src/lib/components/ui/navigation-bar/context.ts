import { createContext } from 'svelte';

export type NavigationBarVariant = 'short' | 'tall';
export type NavigationBarLayout = 'vertical' | 'horizontal';

export interface NavigationBarContext {
	readonly variant: NavigationBarVariant;
	readonly layout: NavigationBarLayout;
}

export const [getNavigationBarContext, setNavigationBarContext] = createContext<NavigationBarContext>();
