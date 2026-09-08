/**
 * Format a set of dates as the span they cover — "Apr – Jul 2025", or
 * "Sep 2025" when they sit in one month, or "Nov 2025 – Jan 2026" across a
 * year boundary.
 *
 * Kept separate from podcast.ts so it can be unit tested: that module value-
 * imports astro:content, which does not resolve outside an Astro build.
 *
 * Everything is read in UTC. Message dates are authored as plain YYYY-MM-DD,
 * which parses to midnight UTC — reading them locally would put a 1 March
 * sermon in February for anyone west of Greenwich.
 */
export function formatDateRange(dates: Date[]): string | undefined {
	const valid = dates
		.filter((date) => date instanceof Date && Number.isFinite(date.getTime()))
		.sort((a, b) => a.getTime() - b.getTime());

	if (valid.length === 0) return undefined;

	const first = valid[0];
	const last = valid[valid.length - 1];
	const month = (value: Date) =>
		new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(value);

	if (first.getUTCFullYear() !== last.getUTCFullYear()) {
		return `${month(first)} ${first.getUTCFullYear()} – ${month(last)} ${last.getUTCFullYear()}`;
	}

	return month(first) === month(last)
		? `${month(first)} ${last.getUTCFullYear()}`
		: `${month(first)} – ${month(last)} ${last.getUTCFullYear()}`;
}
