import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';

// Data contract: published YouTube-backed messages and Ask must not give different
// publication dates for the same video. Drafts stay outside this public contract.
test('published message dates agree with transcript upload records by video ID', async () => {
	const transcriptDir = resolve('data/transcripts/content');
	const messageDir = resolve('src/content/messages');
	const field = (text: string, key: string) =>
		text.split('---')[1]?.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
	const uploads = new Map<string, string>();
	for (const filename of await readdir(transcriptDir)) {
		if (!filename.endsWith('.md')) continue;
		const text = await readFile(resolve(transcriptDir, filename), 'utf8');
		const id = field(text, 'youtube_id');
		const date = field(text, 'upload_date');
		if (!id || !date) continue;
		if (uploads.has(id)) assert.equal(uploads.get(id), date, `conflicting upload dates for ${id}`);
		uploads.set(id, date);
	}
	let matched = 0;
	for (const filename of await readdir(messageDir)) {
		if (!filename.endsWith('.md')) continue;
		const text = await readFile(resolve(messageDir, filename), 'utf8');
		if (field(text, 'draft') === 'true') continue;
		const source = field(text, 'sourceUrl');
		if (!source) continue;
		const url = new URL(source);
		const id = ['youtube.com', 'www.youtube.com'].includes(url.hostname)
			? url.searchParams.get('v')
			: url.hostname === 'youtu.be' ? url.pathname.slice(1) : null;
		if (!id || !uploads.has(id)) continue;
		assert.equal(field(text, 'date'), uploads.get(id), `${filename}: date must be the video publication date`);
		matched += 1;
	}
	assert.ok(matched > 0, 'expected published messages with recorded YouTube upload dates');
});
