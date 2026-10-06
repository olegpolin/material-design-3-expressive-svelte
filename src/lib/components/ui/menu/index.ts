/**
 * M3 menu (docs/research/inputs-selection.md §8): a thin alias of the M3-styled `dropdown-menu` parts.
 *
 *   <Menu.Root variant="expressive">          baseline (default) | expressive | vibrant
 *     <Menu.Trigger>…</Menu.Trigger>
 *     <Menu.Content>
 *       <Menu.Group>
 *         <Menu.Item><Icon name="content_copy" /> Copy <Menu.Shortcut>⌘C</Menu.Shortcut></Menu.Item>
 *       </Menu.Group>
 *     </Menu.Content>
 *   </Menu.Root>
 *
 * The variant set on `Menu.Root` reaches every part (including portalled sub-menus) through context.
 */
export {
	Root,
	Trigger,
	Content,
	Portal,
	Group,
	GroupHeading,
	Label,
	Item,
	CheckboxGroup,
	CheckboxItem,
	RadioGroup,
	RadioItem,
	Separator,
	Shortcut,
	Sub,
	SubContent,
	SubTrigger,
	//
	Root as Menu,
	Trigger as MenuTrigger,
	Content as MenuContent,
	Portal as MenuPortal,
	Group as MenuGroup,
	GroupHeading as MenuGroupHeading,
	Label as MenuLabel,
	Item as MenuItem,
	CheckboxGroup as MenuCheckboxGroup,
	CheckboxItem as MenuCheckboxItem,
	RadioGroup as MenuRadioGroup,
	RadioItem as MenuRadioItem,
	Separator as MenuSeparator,
	Shortcut as MenuShortcut,
	Sub as MenuSub,
	SubContent as MenuSubContent,
	SubTrigger as MenuSubTrigger,
	type MenuVariant,
} from "#lib/components/ui/dropdown-menu/index.js";
