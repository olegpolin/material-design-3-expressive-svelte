import { createContext } from 'svelte';

export interface NavigationRailContext {
	readonly expanded: boolean;
	readonly modal: boolean;
	/** Toggle expanded (menu button). */
	toggle(): void;
	/** Called by items after activation; closes a modal rail. */
	itemActivated(): void;
}

export const [getNavigationRailContext, setNavigationRailContext] = createContext<NavigationRailContext>();

/** Expanded-rail width limits (navigation-containment.md §2: 220dp min – 360dp max, hugging the widest item). */
export const RAIL_COLLAPSED_WIDTH = 96;
export const RAIL_EXPANDED_MIN = 220;
export const RAIL_EXPANDED_MAX = 360;
