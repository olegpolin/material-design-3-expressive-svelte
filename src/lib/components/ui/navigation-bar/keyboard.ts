/**
 * Arrow-key navigation between the destinations of a navigation bar / rail. Every item stays in the
 * tab order (they are links); the arrows are a shortcut on top: Left/Right (bar, RTL-aware) or
 * Up/Down (rail) move focus to the previous / next enabled item, Home / End to the first / last.
 */
export function moveFocusBetweenItems(
	e: KeyboardEvent,
	container: HTMLElement | null,
	selector: string,
	orientation: 'horizontal' | 'vertical'
) {
	if (!container || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
	const items = [...container.querySelectorAll<HTMLElement>(selector)].filter(
		(el) => !el.matches(':disabled, [aria-disabled="true"]') && el.offsetParent !== null
	);
	const index = items.indexOf(document.activeElement as HTMLElement);
	if (index === -1) return;
	const rtl = getComputedStyle(container).direction === 'rtl';
	const [prevKey, nextKey] =
		orientation === 'horizontal' ? (rtl ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight']) : ['ArrowUp', 'ArrowDown'];
	let next: number;
	if (e.key === prevKey) next = (index - 1 + items.length) % items.length;
	else if (e.key === nextKey) next = (index + 1) % items.length;
	else if (e.key === 'Home') next = 0;
	else if (e.key === 'End') next = items.length - 1;
	else return;
	e.preventDefault();
	items[next].focus();
}
