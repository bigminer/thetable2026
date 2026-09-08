import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDateRange } from './date-range.ts';

test('formatDateRange spans months within one year', () => {
	assert.equal(
		formatDateRange([new Date('2025-07-01'), new Date('2025-04-29'), new Date('2025-05-20')]),
		'Apr – Jul 2025',
	);
});

test('formatDateRange collapses a single month', () => {
	assert.equal(formatDateRange([new Date('2025-09-16'), new Date('2025-09-29')]), 'Sep 2025');
});

test('formatDateRange names both years when the span crosses one', () => {
	assert.equal(
		formatDateRange([new Date('2025-11-30'), new Date('2026-01-04')]),
		'Nov 2025 – Jan 2026',
	);
});

test('formatDateRange returns undefined for no dates', () => {
	assert.equal(formatDateRange([]), undefined);
});

test('formatDateRange ignores unparseable dates', () => {
	assert.equal(formatDateRange([new Date('nonsense')]), undefined);
	assert.equal(formatDateRange([new Date('nonsense'), new Date('2025-03-09')]), 'Mar 2025');
});

test('formatDateRange reads dates in UTC, not the runner timezone', () => {
	// Authored as 2025-03-01, which parses to midnight UTC. Read locally, that
	// is 28 February anywhere west of Greenwich — the series would show as Feb.
	assert.equal(formatDateRange([new Date('2025-03-01')]), 'Mar 2025');
});

test('formatDateRange does not care about input order', () => {
	const forwards = formatDateRange([new Date('2025-04-29'), new Date('2025-07-01')]);
	const backwards = formatDateRange([new Date('2025-07-01'), new Date('2025-04-29')]);
	assert.equal(forwards, backwards);
});
