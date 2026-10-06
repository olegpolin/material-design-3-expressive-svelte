import { createContext } from "svelte";
import { tv } from "tailwind-variants";

/**
 * M3 menu styles (docs/research/inputs-selection.md §8).
 * - "baseline": 112–280dp wide, 4dp corner, surface-container, level 2, 48dp items, 24dp icons.
 * - "expressive": vertical menu (standard colors), 16dp corner, surface-container-low, 44dp items, 20dp icons.
 * - "vibrant": expressive vertical menu on tertiary-container.
 */
export type MenuVariant = "baseline" | "expressive" | "vibrant";

type MenuContext = { readonly variant: MenuVariant };

const [getContext, setContext] = createContext<MenuContext>();

export { setContext as setMenuContext };

/** Reactive accessor for the closest menu's variant (falls back to "baseline" outside a menu root). */
export function useMenuVariant(): MenuContext {
	try {
		return getContext();
	} catch {
		return { variant: "baseline" };
	}
}

// NOTE: class strings are literal (no interpolation) so Tailwind's scanner picks them up.

/** Menu container (Content and SubContent). */
export const menuContentVariants = tv({
	base: [
		"m3-menu-surface z-50 min-w-28 max-w-70 outline-none",
		// The floating-layer vars are shared by Content (--bits-dropdown-menu-*) and SubContent (--bits-menu-*),
		// so sub-menus also scale from their trigger and respect the available height.
		"origin-(--bits-floating-transform-origin)",
	],
	variants: {
		variant: {
			baseline:
				"max-h-(--bits-floating-available-height) overflow-x-hidden overflow-y-auto rounded-m3-xs bg-surface-container py-2 text-on-surface shadow-m3-2",
			// A menu whose direct children are groups renders each group as its own surface with a 2dp gap.
			expressive: [
				"flex flex-col rounded-m3-lg bg-surface-container-low p-1 text-on-surface shadow-m3-2",
				"transition-[border-radius] duration-spring-fast-spatial ease-spring-fast-spatial",
				"has-[>[data-menu-group]]:gap-0.5 has-[>[data-menu-group]]:bg-transparent has-[>[data-menu-group]]:p-0 has-[>[data-menu-group]]:shadow-none",
				"not-has-[>[data-menu-group]]:has-[[data-slot=dropdown-menu-sub-trigger][data-state=open]]:rounded-[24px]",
			],
			vibrant: [
				"flex flex-col rounded-m3-lg bg-tertiary-container p-1 text-on-tertiary-container shadow-m3-2",
				"transition-[border-radius] duration-spring-fast-spatial ease-spring-fast-spatial",
				"has-[>[data-menu-group]]:gap-0.5 has-[>[data-menu-group]]:bg-transparent has-[>[data-menu-group]]:p-0 has-[>[data-menu-group]]:shadow-none",
				"not-has-[>[data-menu-group]]:has-[[data-slot=dropdown-menu-sub-trigger][data-state=open]]:rounded-[24px]",
			],
		},
	},
	defaultVariants: { variant: "baseline" },
});

/** Group: no chrome in baseline; a 4dp-padded surface with 16/8dp segment corners in the expressive menus. */
export const menuGroupVariants = tv({
	base: "",
	variants: {
		variant: {
			baseline: "",
			expressive: "",
			vibrant: "",
		},
	},
	compoundVariants: [
		{
			variant: ["expressive", "vibrant"],
			class: [
				"[[data-menu-surface]>&]:rounded-m3-sm [[data-menu-surface]>&]:p-1 [[data-menu-surface]>&]:shadow-m3-2",
				"[[data-menu-surface]>&:not([data-menu-group]~&)]:rounded-t-m3-lg",
				"[[data-menu-surface]>&:not(:has(~[data-menu-group]))]:rounded-b-m3-lg",
				"[[data-menu-surface]>&]:has-[[data-slot=dropdown-menu-sub-trigger][data-state=open]]:rounded-[24px]",
				"flex flex-col transition-[border-radius] duration-spring-fast-spatial ease-spring-fast-spatial",
			],
		},
		{ variant: "expressive", class: "[[data-menu-surface]>&]:bg-surface-container-low" },
		{ variant: "vibrant", class: "[[data-menu-surface]>&]:bg-tertiary-container" },
	],
	defaultVariants: { variant: "baseline" },
});

/** Shared item row: Item, CheckboxItem, RadioItem, SubTrigger. */
export const menuItemVariants = tv({
	base: [
		"group/menu-item relative flex shrink-0 cursor-default items-center gap-3 outline-none select-none",
		"focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-m3-secondary",
		"data-disabled:pointer-events-none data-disabled:opacity-(--md-sys-state-disabled-content-opacity)",
		"[&_[data-slot=icon]]:pointer-events-none",
		// selection: shape morphs on FastSpatial, color on FastEffects (inputs-selection.md §8.2)
		"[transition:border-radius_var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing),background-color_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing),color_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]",
	],
	variants: {
		variant: {
			baseline: [
				"type-label-lg h-12 px-3 text-on-surface data-inset:ps-12",
				"[&_[data-slot=icon]]:text-on-surface-variant",
				"data-checked:bg-secondary-container data-checked:text-on-secondary-container data-checked:[&_[data-slot=icon]]:text-on-secondary-container",
				"data-open:bg-on-surface/8",
			],
			expressive: [
				"type-body-lg h-11 rounded-m3-xs px-4 text-on-surface first:rounded-t-m3-md last:rounded-b-m3-md data-inset:ps-12",
				"[&_[data-slot=icon]]:[--m3-icon-size:20px]! [&_[data-slot=icon]]:[--m3-icon-opsz:20]! [&_[data-slot=icon]]:text-on-surface-variant",
				"data-checked:rounded-m3-md data-checked:bg-tertiary-container data-checked:text-on-tertiary-container data-checked:[&_[data-slot=icon]]:text-on-tertiary-container",
				"data-open:bg-on-surface/8",
			],
			vibrant: [
				"type-body-lg h-11 rounded-m3-xs px-4 text-on-tertiary-container first:rounded-t-m3-md last:rounded-b-m3-md data-inset:ps-12",
				"[&_[data-slot=icon]]:[--m3-icon-size:20px]! [&_[data-slot=icon]]:[--m3-icon-opsz:20]! [&_[data-slot=icon]]:text-on-tertiary-container",
				"data-checked:rounded-m3-md data-checked:bg-tertiary data-checked:text-on-tertiary data-checked:[&_[data-slot=icon]]:text-on-tertiary",
				"data-open:bg-on-tertiary-container/8",
			],
		},
		destructive: {
			true: "text-error [&_[data-slot=icon]]:text-error",
			false: "",
		},
	},
	defaultVariants: { variant: "baseline", destructive: false },
});

/** Group heading / label. */
export const menuLabelVariants = tv({
	base: "flex items-center select-none",
	variants: {
		variant: {
			baseline: "type-label-md h-8 px-3 text-on-surface-variant data-inset:ps-12",
			expressive: "type-label-md h-8 px-4 text-on-surface-variant data-inset:ps-12",
			vibrant: "type-label-md h-8 px-4 text-on-tertiary-container data-inset:ps-12",
		},
	},
	defaultVariants: { variant: "baseline" },
});

/** Divider: 1dp outline-variant with 8dp vertical padding. Between expressive groups it is replaced by the 2dp gap. */
export const menuSeparatorVariants = tv({
	base: "pointer-events-none h-px shrink-0 bg-outline-variant",
	variants: {
		variant: {
			baseline: "my-2",
			expressive: "my-1 mx-3 [[data-menu-surface]:has(>[data-menu-group])>&]:hidden",
			vibrant: "my-1 mx-3 bg-on-tertiary-container/20 [[data-menu-surface]:has(>[data-menu-group])>&]:hidden",
		},
	},
	defaultVariants: { variant: "baseline" },
});

/** Trailing keyboard shortcut / trailing text. */
export const menuShortcutVariants = tv({
	base: "ms-auto ps-3 whitespace-nowrap",
	variants: {
		variant: {
			baseline: "type-label-lg text-on-surface-variant",
			expressive: "type-label-sm text-on-surface-variant",
			vibrant: "type-label-sm text-on-tertiary-container",
		},
	},
	defaultVariants: { variant: "baseline" },
});
