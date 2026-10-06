import Root from './navigation-bar.svelte';
import Item from './navigation-bar-item.svelte';
import Badge, { hasBadge, type NavigationBadgeValue } from './navigation-badge.svelte';
import type { NavigationBarLayout, NavigationBarVariant } from './context.js';

export {
	Root,
	Item,
	Badge,
	hasBadge,
	type NavigationBadgeValue,
	type NavigationBarLayout,
	type NavigationBarVariant,
	//
	Root as NavigationBar,
	Item as NavigationBarItem,
	Badge as NavigationBadge
};
