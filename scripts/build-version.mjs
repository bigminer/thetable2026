const commit = process.env.RENDER_GIT_COMMIT;

if (!commit || !/^[a-f0-9]{7,40}$/i.test(commit)) {
	throw new Error('RENDER_GIT_COMMIT is required to label a production build');
}

const parts = new Intl.DateTimeFormat('en', {
	timeZone: 'UTC',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
}).formatToParts(new Date());
const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

process.stdout.write(`${date.year}.${date.month}.${date.day}.${commit.slice(0, 7)}`);
