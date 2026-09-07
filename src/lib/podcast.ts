import { getCollection, type CollectionEntry } from 'astro:content';
import { fallbackSlug, safeGetCollection } from './content';

type SeriesEntry = CollectionEntry<'series'>;
type MessageEntry = CollectionEntry<'messages'>;

function parseTimestamp(value: string | Date | undefined) {
	if (!value) return undefined;

	const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
	return Number.isFinite(timestamp) ? timestamp : undefined;
}

export function getSeriesSlug(entry: SeriesEntry) {
	return fallbackSlug(entry.data.slug, entry.id);
}

export function getMessageSlug(entry: MessageEntry) {
	return fallbackSlug(entry.data.slug, entry.id);
}

export function getMessageSeriesSlug(entry: MessageEntry) {
	return entry.data.series && typeof entry.data.series === 'object'
		? entry.data.series.id
		: undefined;
}

export function formatMessageDate(value: Date) {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(value);
}

function getSeriesRecencyTimestamp(entry: SeriesEntry, messages: MessageEntry[]) {
	const seriesSlug = getSeriesSlug(entry);
	const messageTimestamps = messages
		.filter((message) => getMessageSeriesSlug(message) === seriesSlug)
		.map((message) => parseTimestamp(message.data.date))
		.filter((timestamp): timestamp is number => typeof timestamp === 'number');

	const explicitTimestamp = parseTimestamp(entry.data.endDate) ?? parseTimestamp(entry.data.startDate);
	const latestMessageTimestamp = messageTimestamps.length > 0 ? Math.max(...messageTimestamps) : undefined;

	return latestMessageTimestamp ?? explicitTimestamp;
}

export function sortSeriesEntries(entries: SeriesEntry[], messages: MessageEntry[] = []) {
	return [...entries]
		.map((entry, index) => ({
			entry,
			index,
			timestamp: getSeriesRecencyTimestamp(entry, messages),
		}))
		.sort((a, b) => {
			const left = b.timestamp ?? Number.NEGATIVE_INFINITY;
			const right = a.timestamp ?? Number.NEGATIVE_INFINITY;
			if (left !== right) return left - right;

			const titleCompare = a.entry.data.title.localeCompare(b.entry.data.title);
			if (titleCompare !== 0) return titleCompare;

			return a.index - b.index;
		})
		.map(({ entry }) => entry);
}

export function sortMessages(messages: MessageEntry[]) {
	return [...messages]
		.map((message, index) => ({
			message,
			index,
			timestamp: parseTimestamp(message.data.date),
		}))
		.sort((a, b) => {
			const left = b.timestamp ?? Number.NEGATIVE_INFINITY;
			const right = a.timestamp ?? Number.NEGATIVE_INFINITY;
			if (left !== right) return left - right;

			return a.index - b.index;
		})
		.map(({ message }) => message);
}

export function getMessagesForSeries(messages: MessageEntry[], seriesSlug: string) {
	return sortMessages(messages.filter((message) => getMessageSeriesSlug(message) === seriesSlug));
}

export async function getSeriesEntries() {
	return safeGetCollection(() => getCollection('series', ({ data }) => !data.draft));
}

export async function getMessageEntries() {
	return safeGetCollection(() => getCollection('messages', ({ data }) => !data.draft));
}
