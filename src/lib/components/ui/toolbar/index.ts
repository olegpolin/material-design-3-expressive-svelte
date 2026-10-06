import Floating, { floatingToolbarVariants } from './floating-toolbar.svelte';
import Docked, { dockedToolbarVariants } from './docked-toolbar.svelte';
import Button from './toolbar-button.svelte';
import Fab from './toolbar-fab.svelte';
import { hideOnScroll, type HideOnScrollOptions } from './hide-on-scroll.js';
import type { ToolbarColor } from './context.js';

export {
	Floating,
	Docked,
	Button,
	Fab,
	hideOnScroll,
	floatingToolbarVariants,
	dockedToolbarVariants,
	type HideOnScrollOptions,
	type ToolbarColor,
	//
	Floating as FloatingToolbar,
	Docked as DockedToolbar,
	Button as ToolbarButton,
	Fab as ToolbarFab
};
