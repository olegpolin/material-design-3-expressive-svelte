<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import {
		ICON_BUTTON_ICON_SIZE,
		IconButton,
		type IconButtonSize,
		type IconButtonVariant
	} from '#lib/components/ui/icon-button/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import { getTheme } from '#lib/m3/theme.svelte.js';
	import { springTransition } from '#lib/m3/motion.js';
	import { cn } from '#lib/utils.js';

	/**
	 * Icon button that toggles light / dark mode (mode-watcher). It shows the mode it switches to:
	 * a moon in light mode, a sun in dark mode. The two glyphs swap with a rotate + scale on the
	 * default-spatial spring and a fast-effects cross-fade, so the icon reads as one morphing symbol.
	 * Needs a `Tooltip.Provider` ancestor unless `tooltip={false}`.
	 */
	let {
		variant = 'standard',
		size = 'sm',
		tooltip = true,
		class: className
	}: {
		variant?: IconButtonVariant;
		size?: IconButtonSize;
		/** Show a plain tooltip with the action. */
		tooltip?: boolean;
		class?: string;
	} = $props();

	const theme = getTheme();
	let dark = $derived(theme.dark);
	let label = $derived(dark ? 'Switch to light theme' : 'Switch to dark theme');
	let iconSize = $derived(ICON_BUTTON_ICON_SIZE[size ?? 'sm']);

	const swap = `${springTransition('default-spatial', 'rotate', 'scale')}, ${springTransition('fast-effects', 'opacity')}`;
</script>

{#snippet glyph(name: string, visible: boolean, hiddenRotation: string)}
	<span
		class={cn(
			'absolute inset-0 grid place-items-center',
			visible ? 'scale-100 rotate-0 opacity-100' : ['scale-50 opacity-0', hiddenRotation]
		)}
		style:transition={swap}
	>
		<Icon {name} size={iconSize} fill />
	</span>
{/snippet}

{#snippet button(props: Record<string, unknown>)}
	<IconButton {...props} {variant} {size} aria-label={label} class={className}>
		<span class="relative grid" style:width="{iconSize}px" style:height="{iconSize}px" aria-hidden="true">
			{@render glyph('dark_mode', !dark, 'rotate-90')}
			{@render glyph('light_mode', dark, '-rotate-90')}
		</span>
	</IconButton>
{/snippet}

{#if tooltip}
	<Tooltip.Root>
		<Tooltip.Trigger onclick={() => toggleMode()}>
			{#snippet child({ props })}
				{@render button(props)}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>{label}</Tooltip.Content>
	</Tooltip.Root>
{:else}
	{@render button({ onclick: () => toggleMode() })}
{/if}
