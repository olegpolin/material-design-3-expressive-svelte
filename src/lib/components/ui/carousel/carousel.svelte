<script lang="ts" module>
	export type CarouselLayout = "multi-browse" | "uncontained" | "hero" | "full-screen";
</script>

<script lang="ts">
	import emblaCarouselSvelte from "embla-carousel-svelte";
	import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { Attachment } from "svelte/attachments";
	import type { HTMLAttributes } from "svelte/elements";
	import {
		arrange,
		frames,
		EMBLA_SNAP_DURATION,
		type Arrangement,
	} from "./keylines.js";

	/**
	 * M3 carousel (navigation-containment.md §14) on embla-carousel.
	 *   multi-browse  large + medium + small items that resize (mask) as they scroll through the
	 *                 keylines; 16dp side padding, 8dp gaps; snaps item by item (flings may skip).
	 *   hero          one large item + one small item; snaps one item per swipe.
	 *   uncontained   fixed-width items, 16dp leading padding, no snapping (free scroll).
	 *   full-screen   one item per page, no padding, 16dp gap; `axis="y"` for the vertical variant.
	 * Items have 28dp corners. Snap motion ≈ spring(stiffness 400, damping 1); see keylines.ts.
	 * Embla itself only provides drag / snap physics: for keyline layouts every slide is one
	 * scroll step wide and the visible item is positioned + masked from the scroll offset.
	 */
	let {
		ref = $bindable(null),
		api = $bindable(),
		class: className,
		layout = "multi-browse",
		itemWidth = 186,
		height = 200,
		axis = "x",
		children,
		"aria-label": ariaLabel = "Carousel",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		api?: EmblaCarouselType;
		layout?: CarouselLayout;
		/** Preferred large-item width (multi-browse) / item width (uncontained), in dp. */
		itemWidth?: number;
		/** Carousel height in dp (items are 16dp shorter: 8dp top / bottom padding). */
		height?: number;
		/** Scroll axis; only used by `full-screen` (keyline layouts are horizontal). */
		axis?: "x" | "y";
	} = $props();

	let keylines = $derived(layout === "multi-browse" || layout === "hero");
	// Plain (non-reactive) caches: only the embla event handlers read them.
	let arrangement: Arrangement | null = null;
	let arrangedFor = -1;

	let options = $derived<EmblaOptionsType>(
		keylines
			? {
					align: "start",
					containScroll: "trimSnaps",
					duration: EMBLA_SNAP_DURATION,
					skipSnaps: layout === "multi-browse",
				}
			: layout === "uncontained"
				? { align: "start", containScroll: "trimSnaps", dragFree: true, duration: EMBLA_SNAP_DURATION }
				: {
						align: "start",
						containScroll: "trimSnaps",
						axis: layout === "full-screen" ? axis : "x",
						duration: EMBLA_SNAP_DURATION,
					}
	);

	/** Position + mask every slide for the current scroll offset (keyline layouts only). */
	function update(emblaApi: EmblaCarouselType) {
		const root = emblaApi.rootNode();
		const slides = emblaApi.slideNodes();
		if (!keylines) {
			for (const s of slides) {
				s.style.removeProperty("--carousel-x");
				s.style.removeProperty("--carousel-w");
			}
			return;
		}
		const viewport = root.clientWidth;
		let a = arrangement;
		if (!a || Math.abs(arrangedFor - viewport) > 0.5) {
			a = arrangement = arrange(layout as "multi-browse" | "hero", viewport, itemWidth);
			arrangedFor = viewport;
			// Content length so that embla can scroll exactly (count − slots) steps.
			const endGap = viewport - a.sizes.length * a.step;
			const container = emblaApi.containerNode();
			container.style.setProperty("--carousel-step", `${a.step}px`);
			container.style.setProperty("--carousel-end", `${endGap}px`);
			container.style.setProperty("--carousel-large", `${a.large}px`);
			emblaApi.reInit();
			return; // reInit fires "reInit" → update again with the new measurements
		}
		const scroll = -emblaApi.internalEngine().location.get();
		const fr = frames(a, viewport, slides.length, scroll);
		slides.forEach((slide, i) => {
			const { x, width, largeness, visible } = fr[i];
			// slide i sits at i·step − scroll inside the viewport; shift its item to the keyline
			const natural = i * a.step - scroll;
			slide.style.setProperty("--carousel-x", `${x - natural}px`);
			slide.style.setProperty("--carousel-w", `${width}px`);
			slide.style.setProperty("--carousel-largeness", `${largeness}`);
			slide.style.zIndex = `${Math.round(largeness * 10)}`;
			slide.style.visibility = visible ? "" : "hidden";
		});
	}

	const embla: Attachment<HTMLDivElement> = (node) => {
		const config = { options, plugins: [] };
		// re-read `layout` / `itemWidth` so the attachment re-runs when they change
		void layout;
		void itemWidth;
		arrangement = null;
		arrangedFor = -1;
		let instance: EmblaCarouselType | undefined;
		const run = () => instance && update(instance);
		const onInit = (e: Event) => {
			instance = (e as CustomEvent<EmblaCarouselType>).detail;
			api = instance;
			instance.on("scroll", run).on("reInit", run).on("resize", run).on("slidesChanged", run);
			run();
		};
		node.addEventListener("emblaInit", onInit);
		const action = emblaCarouselSvelte(node, config);
		return () => {
			node.removeEventListener("emblaInit", onInit);
			action.destroy?.();
			api = undefined;
		};
	};

	function onkeydown(e: KeyboardEvent) {
		if (!api) return;
		const prev = axis === "y" && layout === "full-screen" ? "ArrowUp" : "ArrowLeft";
		const next = axis === "y" && layout === "full-screen" ? "ArrowDown" : "ArrowRight";
		if (e.key === prev) {
			e.preventDefault();
			api.scrollPrev();
		} else if (e.key === next) {
			e.preventDefault();
			api.scrollNext();
		}
	}
</script>

<div
	bind:this={ref}
	data-slot="carousel"
	data-layout={layout}
	data-keylines={keylines || undefined}
	data-axis={layout === "full-screen" ? axis : "x"}
	role="region"
	aria-roledescription="carousel"
	aria-label={ariaLabel}
	class={cn("group/carousel relative w-full overflow-hidden", className)}
	style:height="{height}px"
	style:--carousel-item-width="{itemWidth}px"
	{onkeydown}
	{...restProps}
>
	<div
		data-slot="carousel-viewport"
		class={cn("h-full overflow-hidden", layout === "full-screen" ? "" : "py-2")}
		{@attach embla}
	>
		<div
			data-slot="carousel-container"
			class={cn(
				"flex h-full touch-pan-y",
				layout === "full-screen" && axis === "y" && "touch-pan-x flex-col",
				layout === "uncontained" && "ps-4"
			)}
		>
			{@render children?.()}
		</div>
	</div>
</div>
