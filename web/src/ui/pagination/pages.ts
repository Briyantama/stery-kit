export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Page numbers to render, with ellipses for collapsed ranges. Always shows the first and last page,
 * the current page and `siblings` pages on each side. Output length is stable for a given count so
 * the control does not jump while paging.
 */
export function getPageItems(page: number, pageCount: number, siblings = 1): PageItem[] {
	const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
	const maxVisible = siblings * 2 + 5;
	if (pageCount <= maxVisible) return range(1, pageCount);

	const left = Math.max(page - siblings, 1);
	const right = Math.min(page + siblings, pageCount);
	const showStart = left > 2;
	const showEnd = right < pageCount - 1;
	const edgeCount = siblings * 2 + 3;

	if (!showStart) return [...range(1, edgeCount), 'ellipsis-end', pageCount];
	if (!showEnd) return [1, 'ellipsis-start', ...range(pageCount - edgeCount + 1, pageCount)];
	return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', pageCount];
}
